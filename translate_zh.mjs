#!/usr/bin/env node
/* Translate catalogue descriptive fields to Traditional Chinese (HK).
   Translates text only. Never adds a claim, never changes a number.
   Resumable: existing product entries in data/zh.json are skipped. */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(ROOT, ".secrets.env");
const SHARD = Number(process.env.SHARD || 0);
const SHARD_TOTAL = Number(process.env.SHARD_TOTAL || 1);
const MAIN_OUT = path.join(ROOT, "data", "zh.json");
const OUT = SHARD_TOTAL > 1 ? path.join(ROOT, "data", `zh.part${SHARD}.json`) : MAIN_OUT;
const LOG = "/tmp/translate_zh.log";

function log(...a) {
  const line = new Date().toISOString() + " " + a.join(" ");
  console.log(line);
  fs.appendFileSync(LOG, line + "\n");
}

function key() {
  const t = fs.readFileSync(ENV, "utf8");
  const m = t.match(/^DEEPSEEK_API_KEY=(.+)$/m);
  return m ? m[1].trim().replace(/^['"]|['"]$/g, "") : "";
}

const cleanEnv = (() => {
  const e = { ...process.env };
  for (const k of ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy", "NODE_USE_ENV_PROXY"]) delete e[k];
  e.NO_PROXY = "*";
  e.no_proxy = "*";
  return e;
})();

function curlJson(url, body, timeout = 120) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zh-"));
  const cfg = path.join(dir, "cfg");
  const bf = path.join(dir, "body");
  fs.writeFileSync(bf, JSON.stringify(body), { mode: 0o600 });
  fs.writeFileSync(
    cfg,
    [
      `url = "${url}"`,
      'header = "Authorization: Bearer ' + key() + '"',
      'header = "Content-Type: application/json"',
      "silent",
      "show-error",
      `max-time = ${timeout}`,
      'write-out = "\\n%{http_code}"',
      `data-binary = "@${bf}"`,
    ].join("\n") + "\n",
    { mode: 0o600 }
  );
  return new Promise((resolve) => {
    execFile("curl", ["-K", cfg], { env: cleanEnv, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      fs.rmSync(dir, { recursive: true, force: true });
      const out = String(stdout || "");
      const m = out.match(/\n(\d{3})$/);
      resolve({ code: m ? Number(m[1]) : 0, text: m ? out.slice(0, m.index) : out, err: String(stderr || "") });
    });
  });
}

const GLOSSARY = `Glossary (use consistently):
premium 保費 · coverage 保障 · sum assured 保額 · policy 保單 · claim 索償 · benefit 保障利益
critical illness 危疾 · hospital 住院 · ward 病房 · deductible 自付額 · waiting period 等候期
cash value 現金價值 · dividend 紅利 · surrender 退保 · underwriting 核保 · exclusion 不保事項
term life 定期壽險 · whole life 終身壽險 · annuity 年金 · rider 附加保障 · participating 分紅`;

function promptFor(p) {
  return `You translate AIA Hong Kong insurance product material from English into Traditional Chinese (Hong Kong, professional but plain).

Translate faithfully. Do NOT add, omit, soften, strengthen or reinterpret any claim.
Keep every Arabic number, percentage, year, currency amount, product name and code exactly as written.
Product names stay in English. Keep the JSON structure and all keys identical.
${GLOSSARY}

Return ONLY JSON.

Input:
${JSON.stringify(p)}`;
}

function payloadFor(p) {
  return {
    productId: p.productId,
    summary: {
      bestForOneLiner: p.productLevelSummary?.bestForOneLiner || "",
      notSuitedWhen: p.productLevelSummary?.notSuitedWhen || [],
      gapsInSourceMaterial: p.productLevelSummary?.gapsInSourceMaterial || [],
    },
    trends: (p.trends || []).map((t) => ({
      trendId: t.trendId,
      trendName: t.trendName || "",
      whatProductOffers: t.whatProductOffers || "",
      keyFigures: (t.keyFigures || []).map((k) => ({ label: k.label || "", value: k.value || "", condition: k.condition || "" })),
      exclusionsOrConditions: t.exclusionsOrConditions || [],
      clientProfileFit: t.clientProfileFit || [],
      priorityAlignment: t.priorityAlignment || [],
      talkingPointTemplate: t.talkingPointTemplate || "",
      verificationPrompts: t.verificationPrompts || [],
    })),
  };
}

function cnToArabic(str) {
  const D = "零一二兩三四五六七八九";
  return String(str).replace(/[零一二兩三四五六七八九十百千]+/g, (m) => {
    let section = 0, num = 0;
    for (const ch of m) {
      if (ch === "百") { section += (num || 1) * 100; num = 0; }
      else if (ch === "千") { section += (num || 1) * 1000; num = 0; }
      else if (ch === "十") { section += (num || 1) * 10; num = 0; }
      else num = D.indexOf(ch);
    }
    const total = section + num;
    return total ? String(total) : m;
  });
}

const digits = (o) => (cnToArabic(JSON.stringify(o)).match(/\d/g) || []).sort().join("");

function validate(src, out) {
  if (!out || !out.summary || !Array.isArray(out.trends)) return "shape";
  const ids = (src.trends || []).map((t) => t.trendId).sort().join("|");
  const got = out.trends.map((t) => t.trendId).sort().join("|");
  if (ids !== got) return "trend ids mismatch";
  if ((src.trends || []).length !== out.trends.length) return "trend count";
  for (const t of out.trends) {
    if (!t.trendName || !t.whatProductOffers) return "empty text " + t.trendId;
    if ((t.keyFigures || []).length !== ((src.trends.find((x) => x.trendId === t.trendId) || {}).keyFigures || []).length) return "figure count " + t.trendId;
  }
  // Guard the figures that carry commercial meaning: currency amounts and percentages.
  const money = (o) => (cnToArabic(JSON.stringify(o)).match(/(?:HKD|USD|HK\$|US\$|\$)\s*([\d,]+(?:\.\d+)?)/gi) || [])
    .map((x) => x.replace(/[^\d.,]/g, "").replace(/,/g, "")).sort().join("|");
  const pct = (o) => (cnToArabic(JSON.stringify(o)).match(/(\d+(?:\.\d+)?)\s*%/g) || [])
    .map((x) => x.replace(/[^\d.]/g, "")).sort().join("|");
  if (money(src) !== money(out)) log("  WARN currency tokens differ", src.productId || "?");
  if (pct(src) !== pct(out)) log("  WARN percent tokens differ", src.productId || "?");
  return "";
}

async function translateTrends(p) {
  const out = { summary: null, trends: [] };
  for (const tr of p.trends || []) {
    const one = { ...p, trends: [tr] };
    const src = payloadFor(one);
    const body = {
      model: "deepseek-chat",
      temperature: 0,
      max_tokens: 2600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: promptFor(src) },
        { role: "user", content: "Translate to Traditional Chinese now." },
      ],
    };
    const r = await curlJson("https://api.deepseek.com/chat/completions", body);
    if (!(r.code >= 200 && r.code < 300)) return null;
    let env; try { env = JSON.parse(r.text); } catch { return null; }
    let raw = String(env?.choices?.[0]?.message?.content || "").replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let o; try { o = JSON.parse(raw); } catch { return null; }
    if (!o.trends || !o.trends.length) return null;
    out.summary = out.summary || o.summary || null;
    out.trends.push(o.trends[0]);
  }
  return out;
}

async function translateOne(p) {
  if ((p.trends || []).length > 3) {
    log("  per-trend (large)", p.productId);
    const merged = await translateTrends(p);
    if (merged && merged.summary) {
      const bad = validate(payloadFor(p), merged);
      if (!bad) return merged;
      log("  large rejected:", bad);
    }
    return null;
  }
  const src = payloadFor(p);
  const body = {
    model: "deepseek-chat",
    temperature: 0,
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: promptFor(src) },
      { role: "user", content: "Translate to Traditional Chinese now." },
    ],
  };
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = await curlJson("https://api.deepseek.com/chat/completions", body);
    if (!(r.code >= 200 && r.code < 300)) {
      log("  http", r.code, r.err.slice(0, 100));
      await new Promise((x) => setTimeout(x, 1500));
      continue;
    }
    let env;
    try { env = JSON.parse(r.text); } catch { log("  bad envelope"); continue; }
    let raw = String(env?.choices?.[0]?.message?.content || "").replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let out;
    try { out = JSON.parse(raw); } catch {
      const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
      if (a < 0 || b <= a) { log("  no json"); continue; }
      try { out = JSON.parse(raw.slice(a, b + 1)); } catch { log("  bad json"); continue; }
    }
    const bad = validate(src, out);
    if (bad) { log("  rejected:", bad); continue; }
    return out;
  }
  log("  per-trend fallback", p.productId);
  const merged = await translateTrends(p);
  if (merged && merged.summary) {
    const bad = validate(src, merged);
    if (!bad) return merged;
    log("  fallback rejected:", bad);
  }
  return null;
}

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog.json"), "utf8"));
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { generatedAt: "", provider: "deepseek:deepseek-chat", products: {} };
store.products = store.products || {};
if (OUT !== MAIN_OUT && fs.existsSync(MAIN_OUT)) {
  try {
    const main = JSON.parse(fs.readFileSync(MAIN_OUT, "utf8"));
    for (const [k, v] of Object.entries(main.products || {})) if (!store.products[k]) store.products[k] = v;
  } catch { /* ignore */ }
}

const only = process.env.ONLY_FILE && fs.existsSync(process.env.ONLY_FILE)
  ? new Set(fs.readFileSync(process.env.ONLY_FILE, "utf8").split("\n").map((x) => x.trim()).filter(Boolean))
  : null;
const mine = catalog.products.filter((p, i) => (SHARD_TOTAL === 1 || i % SHARD_TOTAL === SHARD) && (!only || only.has(p.productId)));
const todo = mine.filter((p) => !store.products[p.productId]);
log(`start: ${todo.length} of ${catalog.products.length} products to translate`);

let ok = 0, fail = 0;
for (const p of todo) {
  log("→", p.productId);
  const out = await translateOne(p);
  if (!out) { fail++; log("  FAILED", p.productId); continue; }
  store.products[p.productId] = out.summary ? { summary: out.summary, trends: out.trends } : out;
  store.generatedAt = new Date().toISOString();
  fs.writeFileSync(OUT, JSON.stringify(store, null, 1), { mode: 0o644 });
  ok++;
  log("  ok", (out.trends || []).length, "trends");
  await new Promise((r) => setTimeout(r, 250));
}
log(`done: ok=${ok} failed=${fail} total=${Object.keys(store.products).length}/${catalog.products.length}`);
