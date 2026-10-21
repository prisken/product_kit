#!/usr/bin/env node
/* Ground trend fields in the official Chinese brochure text.
   Extractive only: every returned passage must appear in the PDF text.
   Output: data/zh_brochure.json */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(ROOT, ".secrets.env");
const OUT = path.join(ROOT, "data", "zh_brochure.json");

function key() {
  const t = fs.readFileSync(ENV, "utf8");
  const m = t.match(new RegExp("^DEEPSEEK_API_KEY" + "=(.*)$", "m"));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, "") : "";
}
const env = { ...process.env };
for (const k of ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy", "NODE_USE_ENV_PROXY"]) delete env[k];
env.NO_PROXY = "*"; env.no_proxy = "*";

function curl(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gr-"));
  const cfg = path.join(dir, "cfg"), bf = path.join(dir, "body");
  fs.writeFileSync(bf, JSON.stringify(body));
  fs.writeFileSync(cfg, [
    'url = "https://api.deepseek.com/chat/completions"',
    'header = "Authorization: Bearer ' + key() + '"',
    'header = "Content-Type: application/json"',
    "silent", "show-error", "max-time = 120", 'write-out = "\\n%{http_code}"',
    `data-binary = "@${bf}"`,
  ].join("\n") + "\n");
  return new Promise((res) => {
    execFile("curl", ["-K", cfg], { env, maxBuffer: 8 * 1024 * 1024 }, (e, out) => {
      fs.rmSync(dir, { recursive: true, force: true });
      const s = String(out || "");
      const m = s.match(/\n(\d{3})$/);
      res({ code: m ? Number(m[1]) : 0, text: m ? s.slice(0, m.index) : s });
    });
  });
}

const norm = (s) => String(s || "").replace(/\s+/g, "").replace(/[，。、「」（）()：:；;！!？?．.·\-—…“”"']/g, "");
function contained(passage, text) {
  const p = norm(passage), t = norm(text);
  if (p.length < 12) return false;
  if (t.includes(p)) return true;
  // allow a long prefix (model may trim mid-sentence punctuation)
  for (let n = p.length; n >= Math.max(20, Math.floor(p.length * 0.8)); n -= 2) {
    if (t.includes(p.slice(0, n))) return true;
  }
  return false;
}

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog.json"), "utf8"));
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { products: {} };

const only = process.env.ONLY ? new Set(process.env.ONLY.split("|")) : null;
for (const p of catalog.products) {
  if (only && !only.has(p.productId)) continue;
  if (store.products[p.productId]) continue;
  const tf = path.join(ROOT, "data", "pdfs", p.productId + ".txt");
  if (!fs.existsSync(tf)) { console.log("no text", p.productId); continue; }
  const text = fs.readFileSync(tf, "utf8");
  if ((text.match(/[\u4e00-\u9fff]/g) || []).length < 800) { console.log("skip low-cjk", p.productId); continue; }

  const trends = (p.trends || []).map((t) => ({
    trendId: t.trendId,
    topic: t.trendName,
    english: (t.whatProductOffers || "").slice(0, 320),
  }));
  const body = {
    model: "deepseek-chat",
    temperature: 0,
    max_tokens: 3200,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are given the official Traditional Chinese brochure text of one AIA Hong Kong insurance product, and a list of topics.
For each topic, find the passage in the TEXT that covers the same content and return it VERBATIM.
Rules:
- Copy characters exactly from TEXT. Do not paraphrase, summarise, translate or add anything.
- Each passage must be 20-160 Chinese characters, one contiguous span.
- If the TEXT has no matching passage, return "" for that topic.
- "label": a short Chinese benefit heading (2-10 chars) only if TEXT contains one; otherwise "".
Return ONLY JSON: {"trends":[{"trendId":"...","offer":"...","label":"...","exclusions":["..."]}]}
Exclusions must also be verbatim passages, max 2.`,
      },
      {
        role: "user",
        content: `TOPICS:\n${JSON.stringify(trends)}\n\nTEXT:\n${text.slice(0, 26000)}`,
      },
    ],
  };
  const r = await curl(body);
  if (!(r.code >= 200 && r.code < 300)) { console.log("http", r.code, p.productId); continue; }
  let raw;
  try { raw = JSON.parse(r.text).choices[0].message.content; } catch { console.log("bad envelope", p.productId); continue; }
  raw = String(raw).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let out;
  try { out = JSON.parse(raw); } catch { console.log("bad json", p.productId); continue; }

  const kept = [];
  for (const t of out.trends || []) {
    const rawOffer = String(t.offer || "").trim();
    const cjk = (rawOffer.match(/[\u4e00-\u9fff]/g) || []).length;
    const digits = (rawOffer.match(/[0-9]/g) || []).length;
    const goodShape = cjk >= 10 && digits / Math.max(1, rawOffer.length) < 0.35;
    const offer = contained(rawOffer, text) && goodShape ? rawOffer : "";
    const label = t.label && norm(t.label).length >= 2 && norm(t.label).length <= 12 && contained(t.label, text) ? String(t.label).trim() : "";
    const ex = (t.exclusions || []).filter((x) => contained(x, text)).slice(0, 2);
    if (offer || label) kept.push({ trendId: t.trendId, offer, label, exclusions: ex });
  }
  store.products[p.productId] = { source: "aia_tc_pdf", trends: kept };
  fs.writeFileSync(OUT, JSON.stringify(store, null, 1));
  console.log("ok", p.productId, kept.length, "/", trends.length);
}
console.log("done");
