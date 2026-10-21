#!/usr/bin/env node
/* Local wizard server: static files + POST /api/intake (OpenRouter LLM). */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";
import { execFile } from "node:child_process";
import * as store from "./followup_store.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8899);
const ENV_FILE = path.join(ROOT, ".secrets.env");
const BOOT_PROXY = (() => { try { return new URL(process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "").port || ""; } catch { return ""; } })();

let DS_KEY = process.env.DEEPSEEK_API_KEY || "";
let OR_KEY = process.env.OPENROUTER_API_KEY || "";

function loadSecrets() {
  try {
    for (const line of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      const v = m[2].replace(/^['"]|['"]$/g, "");
      if (m[1] === "DEEPSEEK_API_KEY") DS_KEY = v;
      if (m[1] === "OPENROUTER_API_KEY") OR_KEY = v;
    }
  } catch { /* no file yet */ }
}
loadSecrets();
store.init(ROOT, ENV_FILE);

function json(res, code, obj, extraHeaders) {
  const headers = { "Content-Type": MIME[".json"], "Cache-Control": "no-store", ...(extraHeaders || {}) };
  res.writeHead(code, headers);
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 400000) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > limit) {
        req.destroy();
        reject(new Error("too large"));
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function requireAgent(req, res) {
  const agent = store.agentFromRequest(req);
  if (!agent) {
    json(res, 401, { ok: false, error: "Sign in first." });
    return null;
  }
  return agent;
}

function providerInfo() {
  if (DS_KEY) return { provider: "deepseek", model: process.env.DS_MODEL || "deepseek-chat", url: "https://api.deepseek.com/chat/completions" };
  if (OR_KEY) return { provider: "openrouter", model: process.env.INTAKE_MODEL || "deepseek/deepseek-chat-v3.1", url: "https://openrouter.ai/api/v1/chat/completions" };
  return null;
}

function authHeader(provider) {
  return { Authorization: ["Bearer", provider === "openrouter" ? OR_KEY : DS_KEY].join(" ") };
}

/* curl per call: undici keep-alive sockets go stale through the egress proxy. */
function curlJson(url, key, bodyStr, provider, timeout = 60) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "wiz-"));
  const cfg = path.join(dir, "cfg");
  const bf = path.join(dir, "body");
  const lines = [
    `url = "${url}"`,
    `header = "Authorization: Bearer ${key}"`,
    `header = "Content-Type: application/json"`,
    `silent`,
    `show-error`,
    `max-time = ${timeout}`,
    `write-out = "\\n%{http_code}"`,
  ];
  if (provider === "openrouter") {
    lines.push('header = "HTTP-Referer: http://localhost:8899"');
    lines.push('header = "X-Title: AIA meeting wizard"');
  }
  if (bodyStr) {
    fs.writeFileSync(bf, bodyStr, { mode: 0o600 });
    lines.push(`data-binary = "@${bf}"`);
  }
  fs.writeFileSync(cfg, lines.join("\n") + "\n", { mode: 0o600 });
  return new Promise((resolve) => {
    execFile("curl", ["-K", cfg], { maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      fs.rmSync(dir, { recursive: true, force: true });
      const out = String(stdout || "");
      const m = out.match(/\n(\d{3})$/);
      const code = m ? Number(m[1]) : 0;
      const text = m ? out.slice(0, m.index) : out;
      resolve({ err, code, text, stderr: String(stderr || "") });
    });
  });
}

async function validateKey(key) {
  const isOr = /^sk-or-/.test(key);
  const url = isOr ? "https://openrouter.ai/api/v1/auth/key" : "https://api.deepseek.com/models";
  const provider = isOr ? "OpenRouter" : "DeepSeek";
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await curlJson(url, key, null, isOr ? "openrouter" : "deepseek", 20);
    if (r.code === 401 || r.code === 403) return { ok: false, error: "key rejected by " + provider + " (401) - check it was copied whole and is still active" };
    if (r.code >= 200 && r.code < 300) return { ok: true, provider: isOr ? "openrouter" : "deepseek" };
    lastErr = r.err ? String(r.err.message || r.err).slice(0, 120) : "HTTP " + r.code + " " + String(r.stderr || "").slice(0, 120);
    await new Promise((res) => setTimeout(res, 400 * attempt));
  }
  console.log("validateKey network error:", lastErr);
  return { ok: false, error: "network error reaching " + provider + " (" + lastErr + ") - not a key problem, try again" };
}

function saveKey(key, provider) {
  const name = provider === "openrouter" ? "OPENROUTER_API_KEY" : "DEEPSEEK_API_KEY";
  let lines = [];
  try { lines = fs.readFileSync(ENV_FILE, "utf8").split("\n").filter((l) => l && !l.startsWith(name + "=")); } catch { /* new */ }
  lines.push(name + "=" + key);
  fs.writeFileSync(ENV_FILE, lines.join("\n") + "\n", { mode: 0o600 });
  fs.chmodSync(ENV_FILE, 0o600);
  if (provider === "openrouter") OR_KEY = key; else DS_KEY = key;
}

const LANES = ["ci", "medical", "accident", "term_life", "whole_life", "savings", "ilas"];
const NEEDS = [
  "hospital_cost_protection", "room_ward_level", "high_annual_or_lifetime_limit",
  "critical_illness_readiness", "outpatient_and_followup", "family_protection",
  "income_or_lifestyle_support", "budget_friendly_entry", "premium_stability",
  "flexibility_and_customisation", "fast_access_and_convenience", "savings_and_wealth_growth",
  "legacy_and_estate", "pre_existing_or_chronic_support", "international_coverage",
];

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8",
};

function systemPrompt(lang) {
  return `You parse messy insurance meeting notes (English, Cantonese, mixed) for a Hong Kong AIA agent tool.
Return ONLY a JSON object, no prose, no code fences.

Schema:
{
 "summary": "1-2 neutral sentences on what the client wants",
 "lanes": [subset of ${JSON.stringify(LANES)}],
 "needs": [subset of ${JSON.stringify(NEEDS)}],
 "searchTerms": ["8-15 short English phrases copied from brochure vocabulary"],
 "profile": {"ageBand":"","smoker":"","ownerType":"personal|company|unknown","existingCover":"yes|no|unknown","existingCoverType":"","budget":""},
 "missing": ["2-5 questions the agent still must ask"]
}

Rules:
- lanes: product families that fit. Keyman / business partner / company-owned death cover = "term_life" (add "whole_life" only if cash value or estate is wanted). Hospital/ward/VHIS = "medical". Cancer/CI = "ci".
- needs: only needs actually stated or strongly implied. Never invent.
- searchTerms: English phrases that appear in insurance brochures (e.g. "death benefit", "keyman", "semi-private", "annual limit", "critical illness", "cash value", "renewable term"). Translate Cantonese intent into these terms.
- Vague worry ("what if something happens") -> family_protection + term_life, not a specific illness.
- A family member's illness is NOT the client's pre-existing condition. Map the care burden to family_protection or income_or_lifestyle_support. Use pre_existing_or_chronic_support only for the client's own conditions.
- A stated goal with a 5+ year horizon (house, education, retirement) -> savings_and_wealth_growth, even if the client only mentions it in passing.
- Personal details (pets, hobbies, relationship status) are context, not needs. Do not map them to a category.
- If notes are too thin, return few lanes/needs and put the gap in "missing".
- No tax, legal or eligibility claims.${lang === "zh" ? "\n- Write \"summary\" and every string in \"missing\" in Traditional Chinese (Hong Kong), natural and concise. Keep lanes and needs as the English ids exactly as listed. Keep searchTerms in English. Do not translate product names." : ""}`;
}

async function intake(notes, fields, lang) {
  const p = providerInfo();
  if (!p) return { ok: false, error: "No API key configured - open /setup.html and paste one." };
  const body = {
    model: p.model,
    temperature: 0,
    max_tokens: 700,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(lang) },
      { role: "user", content: `NOTES:\n${notes}\n\nKNOWN FIELDS:\n${JSON.stringify(fields || {})}` },
    ],
  };
  const t0 = Date.now();
  const headers = { "Content-Type": "application/json", ...authHeader(p.provider) };
  if (p.provider === "openrouter") {
    headers["HTTP-Referer"] = "http://localhost:8899";
    headers["X-Title"] = "AIA meeting wizard";
  }
  const key = p.provider === "openrouter" ? OR_KEY : DS_KEY;
  let text = "", code = 0, lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await curlJson(p.url, key, JSON.stringify(body), p.provider, 60);
    text = r.text; code = r.code;
    if (code >= 200 && code < 300) break;
    lastErr = r.err ? String(r.err.message || r.err).slice(0, 160) : "HTTP " + code + " " + String(r.stderr || "").slice(0, 160);
    console.log("intake attempt " + attempt + " failed: " + lastErr);
    await new Promise((res) => setTimeout(res, 500 * attempt));
  }
  if (!(code >= 200 && code < 300)) return { ok: false, error: "network error reaching " + p.provider + " (" + lastErr + ") — try again" };
  let payload;
  try { payload = JSON.parse(text); } catch { return { ok: false, error: "bad provider envelope" }; }
  let raw = payload?.choices?.[0]?.message?.content || "";
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let brief;
  try { brief = JSON.parse(raw); } catch {
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    if (s < 0 || e <= s) return { ok: false, error: "model did not return JSON" };
    try { brief = JSON.parse(raw.slice(s, e + 1)); } catch { return { ok: false, error: "model JSON invalid" }; }
  }
  brief.lanes = (brief.lanes || []).filter((l) => LANES.includes(l));
  brief.needs = (brief.needs || []).filter((n) => NEEDS.includes(n));
  brief.searchTerms = (brief.searchTerms || []).filter((t) => typeof t === "string" && t.trim()).slice(0, 15);
  brief.ms = Date.now() - t0;
  brief.model = p.provider + ":" + p.model;
  return { ok: true, brief };
}

const POLISH_DENY = /\b(tax|deduct(?:ible|ion)?|guarantee(?:d)?|approv(?:ed|al)|illustrated|return of|assured you|pre-existing|pre existing)\b/i;

function polishPrompt(step, snap) {
  const lang = snap.language === "zh" ? "Traditional Chinese (Hong Kong, conversational)" : snap.language === "mixed" ? "the same mix of English and Traditional Chinese as the notes" : "plain English (Hong Kong)";
  return `You rewrite ONE short follow-up message that a Hong Kong AIA insurance agent will send to a client. You are NOT a planner. You may only rephrase.

Return ONLY JSON: {"body":"..."}

Hard rules — violating any one makes the output unusable:
- Keep the SAME single request as the original. Do not add a second ask.
- Add NO facts. No product names, no coverage claims, no eligibility, no approval, no timing promises.
- No numbers, amounts, currencies, premiums, percentages, or dates that are not already in the original.
- Never mention tax, deduction, guaranteed, approved, illustrated returns, or pre-existing conditions.
- 25-70 words. No greeting line, no sign-off. The agent adds those.
- Write in ${lang}.
- Do not include a disclaimer; it is appended automatically.

Context (do not quote back at the client): ${String(snap.aiBrief && snap.aiBrief.summary || "").slice(0, 200)}
Step type: ${step.type}
Original message: ${String(step.body || "").split("\n\n")[0]}`;
}

function polishCheck(body, original) {
  const clean = String(body || "").replace(/\r/g, "").trim();
  if (clean.length < 25) return { ok: false, error: "too short" };
  if (clean.length > 900) return { ok: false, error: "too long" };
  if (POLISH_DENY.test(clean)) return { ok: false, error: "claim word" };
  const origHasNum = /\d/.test(original);
  if (!origHasNum && /\d/.test(clean)) return { ok: false, error: "invented number" };
  const paras = clean.split(/\n{2,}/);
  if (paras.length > 1 && /Not advice/i.test(paras[paras.length - 1])) paras.pop();
  return { ok: true, body: paras.join("\n\n").trim() };
}

async function polishDraft(step, snap) {
  const p = providerInfo();
  if (!p) return { ok: false, error: "No API key configured — open /setup.html." };
  const body = {
    model: p.model,
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: polishPrompt(step, snap) },
      { role: "user", content: "Rewrite it." },
    ],
  };
  const key = p.provider === "openrouter" ? OR_KEY : DS_KEY;
  const r = await curlJson(p.url, key, JSON.stringify(body), p.provider, 45);
  if (!(r.code >= 200 && r.code < 300)) {
    return { ok: false, error: "model unreachable (" + (r.code || "network") + ") — template kept" };
  }
  let payload;
  try { payload = JSON.parse(r.text); } catch { return { ok: false, error: "bad envelope" }; }
  let raw = String(payload?.choices?.[0]?.message?.content || "");
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let out;
  try { out = JSON.parse(raw); } catch {
    const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
    if (a < 0 || b <= a) return { ok: false, error: "model did not return JSON" };
    try { out = JSON.parse(raw.slice(a, b + 1)); } catch { return { ok: false, error: "model JSON invalid" }; }
  }
  const chk = polishCheck(out.body, step.body || "");
  if (!chk.ok) return { ok: false, error: "rejected (" + chk.error + ") — template kept" };
  return { ok: true, body: chk.body + "\n\n" + store.footerText() };
}

const server = http.createServer(async (req, res) => {
  if (req.url.split("?")[0] === "/api/health") {
    const pi = providerInfo();
    res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ ok: !!pi, provider: pi ? pi.provider : null, model: pi ? pi.model : null, up: Math.round(process.uptime()), pid: process.pid, proxyPort: BOOT_PROXY }));
  }

  if (req.method === "GET" && req.url.split("?")[0] === "/api/local-key") {
    const ip = req.socket.remoteAddress || "";
    const loop = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
    const k = DS_KEY || OR_KEY || "";
    const ok = loop && !!k;
    res.writeHead(ok ? 200 : 403, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
    return res.end(JSON.stringify(ok ? { ok: true, key: k, provider: DS_KEY ? "deepseek" : "openrouter" } : { ok: false }));
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/key") {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 8192) req.destroy(); });
    req.on("end", async () => {
      let key = "";
      try { key = String(JSON.parse(raw || "{}").key || "").trim(); } catch { /* ignore */ }
      if (key.length < 20 || /\s/.test(key)) {
        res.writeHead(400, { "Content-Type": MIME[".json"] });
        return res.end(JSON.stringify({ ok: false, error: "that does not look like an API key" }));
      }
      const t0 = Date.now();
      try {
        const v = await validateKey(key);
        if (!v.ok) {
          if (/^network error/.test(v.error || "")) {
            const prov = /^sk-or-/.test(key) ? "openrouter" : "deepseek";
            saveKey(key, prov);
            const pi0 = providerInfo();
            res.writeHead(200, { "Content-Type": MIME[".json"] });
            return res.end(JSON.stringify({ ok: true, unverified: true, warning: v.error, provider: prov, model: pi0.model, ms: Date.now() - t0 }));
          }
          res.writeHead(400, { "Content-Type": MIME[".json"] });
          return res.end(JSON.stringify(v));
        }
        saveKey(key, v.provider);
        const pi = providerInfo();
        res.writeHead(200, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ ok: true, provider: v.provider, model: pi.model, ms: Date.now() - t0 }));
      } catch (e) {
        res.writeHead(502, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/api/intake") {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 200000) req.destroy(); });
    req.on("end", async () => {
      let body = {};
      try { body = JSON.parse(raw || "{}"); } catch { /* ignore */ }
      if (!body.notes || String(body.notes).trim().length < 10) {
        res.writeHead(400, { "Content-Type": MIME[".json"] });
        return res.end(JSON.stringify({ ok: false, error: "notes too short" }));
      }
      try {
        const out = await intake(String(body.notes), body.fields || {}, body.language || "en");
        res.writeHead(out.ok ? 200 : 502, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify(out));
      } catch (e) {
        res.writeHead(502, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
      }
    });
    return;
  }

  const pth = req.url.split("?")[0];
  try {
    if (req.method === "GET" && pth === "/api/me") {
      const agent = store.agentFromRequest(req);
      return json(res, 200, agent ? { ok: true, agent: { id: agent.id, email: agent.email, name: agent.name } } : { ok: false });
    }
    if (req.method === "POST" && pth === "/api/register") {
      const body = JSON.parse((await readBody(req, 8192)) || "{}");
      const out = store.register(body.email, body.password, body.name);
      if (!out.ok) return json(res, 400, out);
      return json(res, 200, { ok: true, agent: out.agent }, { "Set-Cookie": store.sessionCookie(out.sid) });
    }
    if (req.method === "POST" && pth === "/api/login") {
      const body = JSON.parse((await readBody(req, 8192)) || "{}");
      const out = store.login(body.email, body.password);
      if (!out.ok) return json(res, 401, out);
      return json(res, 200, { ok: true, agent: out.agent }, { "Set-Cookie": store.sessionCookie(out.sid) });
    }
    if (req.method === "POST" && pth === "/api/logout") {
      const agent = store.agentFromRequest(req);
      if (agent) store.logout(agent.sid);
      return json(res, 200, { ok: true }, { "Set-Cookie": store.sessionCookie("", true) });
    }
    if (req.method === "GET" && pth === "/api/clients") {
      const agent = requireAgent(req, res);
      if (!agent) return;
      return json(res, 200, { ok: true, clients: store.listClients(agent.id) });
    }
    if (req.method === "POST" && pth === "/api/clients") {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const body = JSON.parse((await readBody(req)) || "{}");
      const out = store.saveClient(agent.id, body);
      return json(res, out.ok ? 200 : 400, out);
    }
    const clientGet = pth.match(/^\/api\/clients\/([^/]+)$/);
    if (req.method === "GET" && clientGet) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const out = store.getClient(agent.id, clientGet[1]);
      return json(res, out.ok ? 200 : 404, out);
    }
    if (req.method === "DELETE" && clientGet) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const out = store.deleteClient(agent.id, clientGet[1]);
      return json(res, out.ok ? 200 : 404, out);
    }
    const clientReplan = pth.match(/^\/api\/clients\/([^/]+)\/replan$/);
    if (req.method === "POST" && clientReplan) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const body = JSON.parse((await readBody(req)) || "{}");
      const out = store.replan(agent.id, clientReplan[1], body.snapshot || body);
      return json(res, out.ok ? 200 : 400, out);
    }
    const stepPath = pth.match(/^\/api\/clients\/([^/]+)\/steps\/([^/]+)$/);
    if (req.method === "POST" && stepPath) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const body = JSON.parse((await readBody(req, 16384)) || "{}");
      const out = store.setStepStatus(agent.id, stepPath[1], decodeURIComponent(stepPath[2]), body.status, body);
      return json(res, out.ok ? 200 : 400, out);
    }
    const copyPath = pth.match(/^\/api\/clients\/([^/]+)\/steps\/([^/]+)\/copy$/);
    if (req.method === "POST" && copyPath) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const out = store.markCopied(agent.id, copyPath[1], decodeURIComponent(copyPath[2]));
      return json(res, out.ok ? 200 : 400, out);
    }
    const bodyPath = pth.match(/^\/api\/clients\/([^/]+)\/steps\/([^/]+)\/body$/);
    if (req.method === "POST" && bodyPath) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const body = JSON.parse((await readBody(req, 16384)) || "{}");
      const out = store.rewriteStepBody(agent.id, bodyPath[1], decodeURIComponent(bodyPath[2]), body.body);
      return json(res, out.ok ? 200 : 400, out);
    }
    if (req.method === "POST" && pth === "/api/polish") {
      const agent = requireAgent(req, res);
      if (!agent) return;
      const body = JSON.parse((await readBody(req, 16384)) || "{}");
      const found = store.stepFor(agent.id, body.clientId, body.stepId);
      if (!found) return json(res, 404, { ok: false, error: "Step not found." });
      if (found.step.type === "apply") return json(res, 400, { ok: false, error: "Apply steps have no client draft." });
      const out = await polishDraft(found.step, found.snapshot);
      return json(res, out.ok ? 200 : 502, { ...out, original: found.step.body });
    }
    const logsPath = pth.match(/^\/api\/clients\/([^/]+)\/log$/);
    if (req.method === "GET" && logsPath) {
      const agent = requireAgent(req, res);
      if (!agent) return;
      if (!store.getClient(agent.id, logsPath[1]).ok) return json(res, 404, { ok: false, error: "Client not found." });
      return json(res, 200, { ok: true, log: store.logsFor(agent.id, logsPath[1]) });
    }
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e.message || e) });
  }

  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
});

// A dead env key must not shadow a working one.
if (DS_KEY) {
  try {
    const v = await validateKey(DS_KEY);
    if (!v.ok) { console.log("env DEEPSEEK_API_KEY rejected - ignoring it"); DS_KEY = ""; }
  } catch { console.log("could not verify env DEEPSEEK_API_KEY - keeping it"); }
}

server.listen(PORT, "127.0.0.1", () => {
  const pi = providerInfo();
  console.log(`wizard server on http://127.0.0.1:${PORT} provider=${pi ? pi.provider : "NONE"} model=${pi ? pi.model : "-"}`);
});
