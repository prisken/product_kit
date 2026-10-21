#!/usr/bin/env node
/* Translate the two signal-phrase arrays per product into Traditional Chinese.
   These are displayed as "Client would say / Do not push when" chips.
   Resumable via data/zh.signals.partN.json. */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(ROOT, ".secrets.env");
const SHARD = Number(process.env.SHARD || 0);
const TOTAL = Number(process.env.SHARD_TOTAL || 1);
const RUN = process.env.RUN || "a";
const OUT = path.join(ROOT, "data", `zh.signals.${RUN}.part${SHARD}.json`);

function key() {
  const t = fs.readFileSync(ENV, "utf8");
  const m = t.match(/^DEEPSEEK_API_KEY=(.+)$/m);
  return m ? m[1].trim().replace(/^['"]|['"]$/g, "") : "";
}
const env = { ...process.env };
for (const k of ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy", "NODE_USE_ENV_PROXY"]) delete env[k];
env.NO_PROXY = "*"; env.no_proxy = "*";

function curl(body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sig-"));
  const cfg = path.join(dir, "cfg"), bf = path.join(dir, "body");
  fs.writeFileSync(bf, JSON.stringify(body), { mode: 0o600 });
  fs.writeFileSync(cfg, [
    'url = "https://api.deepseek.com/chat/completions"',
    'header = "Authorization: Bearer ' + key() + '"',
    'header = "Content-Type: application/json"',
    "silent", "show-error", "max-time = 90", 'write-out = "\\n%{http_code}"',
    `data-binary = "@${bf}"`,
  ].join("\n") + "\n", { mode: 0o600 });
  return new Promise((res) => {
    execFile("curl", ["-K", cfg], { env, maxBuffer: 8 * 1024 * 1024 }, (e, out) => {
      fs.rmSync(dir, { recursive: true, force: true });
      const s = String(out || "");
      const m = s.match(/\n(\d{3})$/);
      res({ code: m ? Number(m[1]) : 0, text: m ? s.slice(0, m.index) : s });
    });
  });
}

const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog.json"), "utf8"));
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { products: {} };

const only = process.env.ONLY_FILE && fs.existsSync(process.env.ONLY_FILE)
  ? new Set(fs.readFileSync(process.env.ONLY_FILE, "utf8").split("\n").map((x) => x.trim()).filter(Boolean))
  : null;
const todo = cat.products.filter((p, i) => (TOTAL === 1 || i % TOTAL === SHARD) && (!only || only.has(p.productId)) && !store.products[p.productId]);
console.log(`signals: ${todo.length} to do`);

for (const p of todo) {
  const signals = [];
  for (const t of p.trends || []) {
    signals.push({ trendId: t.trendId, pos: t.clientSignalPhrases || [], neg: t.negativeSignalPhrases || [] });
  }
  if (!signals.length) { store.products[p.productId] = { trends: [] }; continue; }
  const body = {
    model: "deepseek-chat",
    temperature: 0,
    max_tokens: 3000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Translate these short insurance-client phrases into Traditional Chinese (Hong Kong). They are things a client might say, so keep them colloquial and short.
Return ONLY JSON: {"trends":[{"trendId":"...","pos":["..."],"neg":["..."]}]}
Keep the same number of items in each array and the same trendId. Add nothing.
Input:\n${JSON.stringify(signals)}`,
      },
      { role: "user", content: "Translate now." },
    ],
  };
  let ok = false;
  for (let attempt = 0; attempt < 2 && !ok; attempt++) {
    const r = await curl(body);
    if (!(r.code >= 200 && r.code < 300)) continue;
    let j;
    try { j = JSON.parse(r.text); } catch { continue; }
    let raw = String(j?.choices?.[0]?.message?.content || "").replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let out;
    try { out = JSON.parse(raw); } catch { continue; }
    if (!out.trends || out.trends.length !== signals.length) continue;
    const good = out.trends.every((t, i) => t.trendId === signals[i].trendId && (t.pos || []).length === signals[i].pos.length && (t.neg || []).length === signals[i].neg.length);
    if (!good) continue;
    store.products[p.productId] = { trends: out.trends };
    fs.writeFileSync(OUT, JSON.stringify(store, null, 1));
    ok = true;
  }
  console.log(ok ? "ok" : "FAILED", p.productId);
}
console.log("done");
