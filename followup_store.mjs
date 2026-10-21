import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const SESSION_DAYS = 14;
const RETAIN_DAYS = 365;
const REENGAGE_MS = 3 * 24 * 60 * 60 * 1000;
const REENGAGE_CAP = 2;
const FOOTER = "Not advice. AIA product information only. Not a quote. Not an approval.";
const DENY = /\b(tax|deduct(?:ible|ion)?|guaranteed|approved|illustrated return|return of \d|hkd\s*\d{3,})\b/i;

let db;
let encKey;
let rootDir;

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return prefix + "_" + crypto.randomBytes(12).toString("hex");
}

function loadOrCreateKey(envFile) {
  let lines = [];
  try {
    lines = fs.readFileSync(envFile, "utf8").split("\n");
  } catch {
    lines = [];
  }
  const hit = lines.find((l) => l.startsWith("FOLLOWUP_KEY="));
  if (hit) {
    const raw = hit.slice("FOLLOWUP_KEY=".length).trim();
    const buf = Buffer.from(raw, "hex");
    if (buf.length === 32) return buf;
  }
  const key = crypto.randomBytes(32);
  const rest = lines.filter((l) => l && !l.startsWith("FOLLOWUP_KEY="));
  rest.push("FOLLOWUP_KEY=" + key.toString("hex"));
  fs.writeFileSync(envFile, rest.join("\n") + "\n", { mode: 0o600 });
  try {
    fs.chmodSync(envFile, 0o600);
  } catch {
    /* ignore */
  }
  return key;
}

function encryptJson(obj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encKey, iv);
  const pt = Buffer.from(JSON.stringify(obj), "utf8");
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("base64"), data: Buffer.concat([ct, tag]).toString("base64") };
}

function decryptJson(ivB64, dataB64) {
  const iv = Buffer.from(ivB64, "base64");
  const buf = Buffer.from(dataB64, "base64");
  const tag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(0, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", encKey, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(pt.toString("utf8"));
}

function hashPassword(password, salt = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
  return salt.toString("hex") + ":" + hash.toString("hex");
}

function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored || "").split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
  const a = Buffer.from(hashHex, "hex");
  if (a.length !== hash.length) return false;
  return crypto.timingSafeEqual(a, hash);
}

export function init(root, envFile) {
  rootDir = root;
  encKey = loadOrCreateKey(envFile);
  const dataDir = path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "followup.sqlite");
  db = new DatabaseSync(dbPath);
  try {
    fs.chmodSync(dbPath, 0o600);
  } catch {
    /* ignore */
  }
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      phone_label TEXT DEFAULT '',
      email_label TEXT DEFAULT '',
      consent INTEGER NOT NULL DEFAULT 0,
      locked INTEGER NOT NULL DEFAULT 1,
      plan_rev INTEGER NOT NULL DEFAULT 1,
      snapshot_iv TEXT NOT NULL,
      snapshot_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      retain_until TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS steps (
      client_id TEXT NOT NULL,
      plan_rev INTEGER NOT NULL,
      step_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      due_at TEXT,
      root_id TEXT NOT NULL,
      n INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (client_id, plan_rev, step_id)
    );
    CREATE TABLE IF NOT EXISTS access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      client_id TEXT,
      action TEXT NOT NULL,
      detail TEXT DEFAULT '',
      at TEXT NOT NULL
    );
  `);
}

export function log(agentId, clientId, action, detail = "") {
  db.prepare("INSERT INTO access_log (agent_id, client_id, action, detail, at) VALUES (?,?,?,?,?)").run(
    agentId,
    clientId || null,
    action,
    String(detail || "").slice(0, 400),
    nowIso()
  );
}

export function parseCookie(header) {
  const out = {};
  String(header || "")
    .split(";")
    .forEach((part) => {
      const i = part.indexOf("=");
      if (i < 0) return;
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
  return out;
}

export function sessionCookie(sid, clear = false) {
  if (clear) return "wiz_sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
  return `wiz_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}

export function agentFromRequest(req) {
  const sid = parseCookie(req.headers.cookie).wiz_sid;
  if (!sid) return null;
  const row = db.prepare("SELECT s.agent_id, s.expires_at, a.email, a.name FROM sessions s JOIN agents a ON a.id = s.agent_id WHERE s.id = ?").get(sid);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
    return null;
  }
  return { id: row.agent_id, email: row.email, name: row.name, sid };
}

function createSession(agentId) {
  const sid = id("ses");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (id, agent_id, expires_at) VALUES (?,?,?)").run(sid, agentId, expires);
  return sid;
}

export function register(email, password, name) {
  email = String(email || "").trim().toLowerCase();
  name = String(name || "").trim();
  password = String(password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Need a real email." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (name.length < 2) return { ok: false, error: "Name is required." };
  const exists = db.prepare("SELECT id FROM agents WHERE email = ?").get(email);
  if (exists) return { ok: false, error: "That email is already registered." };
  const agentId = id("ag");
  db.prepare("INSERT INTO agents (id, email, name, password, created_at) VALUES (?,?,?,?,?)").run(
    agentId,
    email,
    name,
    hashPassword(password),
    nowIso()
  );
  const sid = createSession(agentId);
  return { ok: true, agent: { id: agentId, email, name }, sid };
}

export function login(email, password) {
  email = String(email || "").trim().toLowerCase();
  const row = db.prepare("SELECT * FROM agents WHERE email = ?").get(email);
  if (!row || !verifyPassword(password, row.password)) return { ok: false, error: "Email or password is wrong." };
  const sid = createSession(row.id);
  return { ok: true, agent: { id: row.id, email: row.email, name: row.name }, sid };
}

export function logout(sid) {
  if (sid) db.prepare("DELETE FROM sessions WHERE id = ?").run(sid);
}

function detectLanguage(notes) {
  const n = String(notes || "");
  const zh = /[\u4e00-\u9fff]/.test(n);
  const en = /[A-Za-z]{3,}/.test(n);
  if (zh && en) return "mixed";
  if (zh) return "zh";
  return "en";
}

function snapProduct(p) {
  if (!p) return null;
  return {
    productId: p.productId || "",
    productName: p.productName || "",
    offer: p.offer || "",
    evidenceStrength: p.evidenceStrength || "",
    tradeoff: p.tradeoff || "",
  };
}

export function sanitizeSnapshot(raw) {
  const s = raw || {};
  const moves = Array.isArray(s.moves) ? s.moves : [];
  return {
    catalogVersion: String(s.catalogVersion || "57"),
    planRev: Number(s.planRev || 1),
    savedAt: nowIso(),
    notes: String(s.notes || "").slice(0, 20000),
    fields: s.fields && typeof s.fields === "object" ? s.fields : {},
    aiBrief: s.aiBrief && typeof s.aiBrief === "object" ? s.aiBrief : {},
    confirmedNeeds: Array.isArray(s.confirmedNeeds) ? s.confirmedNeeds.slice(0, 20) : [],
    selectedLanes: Array.isArray(s.selectedLanes) ? s.selectedLanes.slice(0, 12) : [],
    answers: s.answers && typeof s.answers === "object" ? s.answers : {},
    checks: Array.isArray(s.checks) ? s.checks.slice(0, 40) : [],
    reasons: s.reasons && typeof s.reasons === "object" ? s.reasons : {},
    deferred: Array.isArray(s.deferred) ? s.deferred.slice(0, 20) : [],
    language: s.language || detectLanguage(s.notes),
    moves: moves.slice(0, 8).map((m) => ({
      lane: String(m.lane || ""),
      title: String(m.title || ""),
      plain: String(m.plain || ""),
      chosen: snapProduct(m.chosen),
      systemPick: snapProduct(m.systemPick),
      reason: String(m.reason || ""),
    })),
    finalText: String(s.finalText || "").slice(0, 20000),
  };
}

function stripDenied(text) {
  let t = String(text || "");
  t = t.replace(DENY, "[removed]");
  return t;
}

function draftFor(step, snap) {
  const lang = snap.language || "en";
  const name = "you";
  const zh = lang === "zh";
  const lines = [];
  if (step.type === "ask" && step.step_id === "g:facts.age") {
    lines.push(zh ? "方便确认一下您的年龄段吗？这会影响核保，不是报价。" : "Could you confirm your age band? This is for underwriting, not a quote.");
  } else if (step.type === "ask" && step.step_id === "g:facts.smoker") {
    lines.push(zh ? "请问您是否吸烟？核保需要，不是报价。" : "Are you a smoker or non-smoker? Needed for underwriting, not a quote.");
  } else if (step.type === "request_doc") {
    lines.push(zh ? "方便把现有保单的保障一览或周年通知发给我吗？确认现有保障后才谈新产品。" : "Could you send the existing policy schedule (or annual statement)? We confirm current cover before talking about anything new.");
  } else if (step.step_id === "g:budget.comfort") {
    lines.push(
      zh
        ? "保障范围谈完后，想了解每月保费对您来说是偏紧、可以、还是有弹性。数字只作参考，不是报价。"
        : "Once the cover is clear: is a monthly premium too tight, ok, or flexible for you? Any number is a comfort boundary, not a quote."
    );
  } else if (step.type === "verify") {
    const bit = step.title.replace(/^Verify:\s*/i, "");
    lines.push(
      zh
        ? `开会时记下要向保险公司确认：${bit}。产品册没有写清楚的，我不会当它存在。`
        : `From the meeting: please confirm ${bit} with the insurer. If it is not in the brochure extract, we do not claim it.`
    );
  } else if (step.type === "ask" && String(step.step_id).startsWith("g:deferred.")) {
    lines.push(
      zh
        ? `这次先不处理「${step.title.replace(/^Deferred:\s*/i, "")}」。下次复查再谈。`
        : `We parked “${step.title.replace(/^Deferred:\s*/i, "")}” for the next review — not this meeting.`
    );
  } else if (step.type === "reengage") {
    lines.push(
      zh
        ? "跟进上次开会未完成的一项。方便回覆，或告诉我暂时不处理。"
        : "Following up on one open item from our meeting. A short reply is enough — or tell me to park it."
    );
  } else {
    lines.push(zh ? "跟进开会时记下的一项。" : "Following up on one item from our meeting.");
  }
  const body = stripDenied(lines.join(" "));
  return body + "\n\n" + FOOTER;
}

export function generateSteps(snapshot) {
  const snap = snapshot;
  const profile = (snap.aiBrief && snap.aiBrief.profile) || {};
  const fields = snap.fields || {};
  const out = [];
  const push = (step_id, type, title, body) => {
    out.push({
      step_id,
      type,
      title,
      body,
      status: "not_started",
      due_at: null,
      root_id: step_id,
      n: 0,
    });
  };
  const age = profile.ageBand || fields.ageBand || "";
  if (!age || age === "unknown") push("g:facts.age", "ask", "Confirm age band", "");
  const smoker = profile.smoker || fields.smoker || "";
  if (!smoker || smoker === "unknown") push("g:facts.smoker", "ask", "Confirm smoker status", "");
  const cover = profile.existingCover || fields.existingCover || "";
  if (!cover || cover === "unknown") push("g:facts.cover", "request_doc", "Request existing policy schedule", "");
  push("g:budget.comfort", "ask", "Comfort boundary (not a quote)", "");
  for (const c of snap.checks || []) {
    const [lane, ...rest] = String(c).split(":");
    const row = rest.join(":") || "item";
    push("g:verify." + lane + "." + row, "verify", "Verify: " + row.replace(/_/g, " ") + " (" + lane + ")", "");
  }
  for (const d of snap.deferred || []) {
    push("g:deferred." + d, "ask", "Deferred: " + String(d).replace(/_/g, " "), "");
  }
  for (const m of snap.moves || []) {
    if (!m.lane || !m.chosen) continue;
    push("g:apply." + m.lane, "apply", "Apply: " + (m.chosen.productName || m.lane), "Internal. Mark Done when submitted, Blocked if declined.");
  }
  return out.map((st) => {
    if (!st.body) st.body = draftFor(st, snap);
    else st.body = stripDenied(st.body) + (st.body.includes(FOOTER) ? "" : "\n\n" + FOOTER);
    return st;
  });
}

function insertMissingSteps(clientId, planRev, snapshot) {
  const existing = db.prepare("SELECT step_id FROM steps WHERE client_id = ? AND plan_rev = ?").all(clientId, planRev).map((r) => r.step_id);
  const have = new Set(existing);
  const gen = generateSteps(snapshot);
  const ins = db.prepare(
    "INSERT INTO steps (client_id, plan_rev, step_id, type, title, body, status, due_at, root_id, n, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  );
  for (const st of gen) {
    if (have.has(st.step_id)) continue;
    ins.run(clientId, planRev, st.step_id, st.type, st.title, st.body, st.status, st.due_at, st.root_id, st.n, nowIso());
  }
}

function clientRow(agentId, clientId) {
  return db.prepare("SELECT * FROM clients WHERE id = ? AND agent_id = ?").get(clientId, agentId);
}

function readSnapshot(row) {
  return decryptJson(row.snapshot_iv, row.snapshot_data);
}

function publicClient(row, snapshot, steps) {
  const open = (steps || []).filter((s) => s.status !== "done" && s.status !== "blocked").length;
  const due = (steps || []).filter((s) => s.type === "reengage" && s.status !== "done" && s.status !== "blocked" && s.due_at && new Date(s.due_at) <= new Date()).length;
  return {
    id: row.id,
    displayName: row.display_name,
    phoneLabel: row.phone_label,
    emailLabel: row.email_label,
    consent: !!row.consent,
    locked: !!row.locked,
    planRev: row.plan_rev,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    retainUntil: row.retain_until,
    language: snapshot.language,
    summary: (snapshot.aiBrief && snapshot.aiBrief.summary) || "",
    moves: (snapshot.moves || []).map((m) => ({
      lane: m.lane,
      title: m.title,
      chosen: m.chosen,
      systemPick: m.systemPick,
      reason: m.reason,
    })),
    deferred: snapshot.deferred || [],
    openSteps: open,
    dueReengage: due,
  };
}

function listSteps(clientId, planRev) {
  return db.prepare("SELECT * FROM steps WHERE client_id = ? AND plan_rev = ? ORDER BY step_id").all(clientId, planRev);
}

export function listClients(agentId) {
  const rows = db.prepare("SELECT * FROM clients WHERE agent_id = ? ORDER BY updated_at DESC").all(agentId);
  return rows.map((row) => {
    const snap = readSnapshot(row);
    const steps = listSteps(row.id, row.plan_rev);
    return publicClient(row, snap, steps);
  });
}

export function getClient(agentId, clientId) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  const snap = readSnapshot(row);
  const steps = listSteps(row.id, row.plan_rev);
  log(agentId, clientId, "view");
  return { ok: true, client: publicClient(row, snap, steps), snapshot: snap, steps };
}

export function saveClient(agentId, payload) {
  const displayName = String(payload.displayName || "").trim();
  if (displayName.length < 2) return { ok: false, error: "Client display name is required (your label, not a CRM record)." };
  if (!payload.consent) return { ok: false, error: "Consent is required to store meeting notes." };
  const snapshot = sanitizeSnapshot(payload.snapshot || {});
  snapshot.planRev = 1;
  const enc = encryptJson(snapshot);
  const clientId = id("cl");
  const t = nowIso();
  const retain = new Date(Date.now() + RETAIN_DAYS * 86400 * 1000).toISOString();
  db.prepare(
    `INSERT INTO clients (id, agent_id, display_name, phone_label, email_label, consent, locked, plan_rev, snapshot_iv, snapshot_data, created_at, updated_at, retain_until)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    clientId,
    agentId,
    displayName,
    String(payload.phoneLabel || "").slice(0, 40),
    String(payload.emailLabel || "").slice(0, 80),
    1,
    1,
    1,
    enc.iv,
    enc.data,
    t,
    t,
    retain
  );
  insertMissingSteps(clientId, 1, snapshot);
  log(agentId, clientId, "save", displayName);
  return getClient(agentId, clientId);
}

export function replan(agentId, clientId, snapshotRaw) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  const snapshot = sanitizeSnapshot(snapshotRaw || {});
  const planRev = row.plan_rev + 1;
  snapshot.planRev = planRev;
  const enc = encryptJson(snapshot);
  db.prepare("UPDATE clients SET snapshot_iv=?, snapshot_data=?, plan_rev=?, locked=1, updated_at=? WHERE id=? AND agent_id=?").run(
    enc.iv,
    enc.data,
    planRev,
    nowIso(),
    clientId,
    agentId
  );
  insertMissingSteps(clientId, planRev, snapshot);
  log(agentId, clientId, "replan", "rev " + planRev);
  return getClient(agentId, clientId);
}

export function deleteClient(agentId, clientId) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  db.prepare("DELETE FROM steps WHERE client_id = ?").run(clientId);
  db.prepare("DELETE FROM clients WHERE id = ? AND agent_id = ?").run(clientId, agentId);
  log(agentId, clientId, "delete");
  return { ok: true };
}

function rootIdOf(stepId) {
  return String(stepId).replace(/:re:\d+$/, "");
}

function pendingReengage(clientId, planRev, rootId) {
  return db.prepare(
    "SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND root_id=? AND type='reengage' AND status NOT IN ('done','blocked')"
  ).get(clientId, planRev, rootId);
}

function reengageCount(clientId, planRev, rootId) {
  const row = db.prepare(
    "SELECT COUNT(*) AS n FROM steps WHERE client_id=? AND plan_rev=? AND root_id=? AND type='reengage'"
  ).get(clientId, planRev, rootId);
  return row ? Number(row.n) : 0;
}

function cancelReengage(clientId, planRev, rootId) {
  db.prepare(
    "UPDATE steps SET status='blocked', updated_at=? WHERE client_id=? AND plan_rev=? AND root_id=? AND type='reengage' AND status NOT IN ('done','blocked')"
  ).run(nowIso(), clientId, planRev, rootId);
}

function maybeReengage(clientId, planRev, step, snapshot) {
  if (!["ask", "request_doc", "verify", "reengage"].includes(step.type)) return;
  if (step.status !== "sent") return;
  const root = rootIdOf(step.step_id);
  if (pendingReengage(clientId, planRev, root)) return;
  const n = reengageCount(clientId, planRev, root);
  if (n >= REENGAGE_CAP) return;
  const nextN = n + 1;
  const stepId = root + ":re:" + nextN;
  const exists = db.prepare("SELECT step_id FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, planRev, stepId);
  if (exists) return;
  const title = "Reengage (" + nextN + "/" + REENGAGE_CAP + "): " + step.title.replace(/^Reengage \(\d+\/\d+\):\s*/, "");
  const body = draftFor({ type: "reengage", step_id: stepId, title }, snapshot);
  const due = new Date(Date.now() + REENGAGE_MS).toISOString();
  db.prepare(
    "INSERT INTO steps (client_id, plan_rev, step_id, type, title, body, status, due_at, root_id, n, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  ).run(clientId, planRev, stepId, "reengage", title, body, "not_started", due, root, nextN, nowIso());
}

const ALLOWED = {
  not_started: ["draft_ready", "sent", "done", "blocked"],
  draft_ready: ["sent", "done", "blocked"],
  sent: ["done", "blocked"],
  done: [],
  blocked: [],
};

export function setStepStatus(agentId, clientId, stepId, nextStatus, extra = {}) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  const step = db.prepare("SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, row.plan_rev, stepId);
  if (!step) return { ok: false, error: "Step not found." };
  if (step.type === "apply" && nextStatus === "sent") return { ok: false, error: "Apply steps are internal — Done or Blocked only." };
  const allow = ALLOWED[step.status] || [];
  if (!allow.includes(nextStatus)) return { ok: false, error: "Cannot go from " + step.status + " to " + nextStatus + "." };

  if (step.step_id === "g:budget.comfort" && nextStatus === "done") {
    const comfort = extra.budgetComfort;
    if (!["too_tight", "ok", "flexible"].includes(comfort)) {
      return { ok: false, error: "Gate D opens only with a comfort answer (too tight / ok / flexible) plus Done. Sent never opens this gate." };
    }
    const snap = readSnapshot(row);
    snap.answers = snap.answers || {};
    snap.answers.budgetComfort = comfort;
    snap.answers.budgetNote = String(extra.budgetNote || "").slice(0, 200);
    const enc = encryptJson(snap);
    db.prepare("UPDATE clients SET snapshot_iv=?, snapshot_data=?, updated_at=? WHERE id=?").run(enc.iv, enc.data, nowIso(), clientId);
  }

  db.prepare("UPDATE steps SET status=?, updated_at=? WHERE client_id=? AND plan_rev=? AND step_id=?").run(
    nextStatus,
    nowIso(),
    clientId,
    row.plan_rev,
    stepId
  );
  db.prepare("UPDATE clients SET updated_at=? WHERE id=?").run(nowIso(), clientId);
  log(agentId, clientId, "status", stepId + " → " + nextStatus);

  const updated = db.prepare("SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, row.plan_rev, stepId);
  const snap = readSnapshot(clientRow(agentId, clientId));
  if (nextStatus === "done" || nextStatus === "blocked") cancelReengage(clientId, row.plan_rev, rootIdOf(stepId));
  if (nextStatus === "sent") maybeReengage(clientId, row.plan_rev, updated, snap);
  return getClient(agentId, clientId);
}

export function markCopied(agentId, clientId, stepId) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  const step = db.prepare("SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, row.plan_rev, stepId);
  if (!step) return { ok: false, error: "Step not found." };
  if (step.type === "apply") return { ok: false, error: "Apply steps have no client draft." };
  if (step.status === "not_started") {
    db.prepare("UPDATE steps SET status='draft_ready', updated_at=? WHERE client_id=? AND plan_rev=? AND step_id=?").run(
      nowIso(),
      clientId,
      row.plan_rev,
      stepId
    );
  }
  log(agentId, clientId, "copy", stepId);
  return getClient(agentId, clientId);
}

export function setStepBody(agentId, clientId, body) {
  throw new Error("unused");
}

export function rewriteStepBody(agentId, clientId, stepId, rawBody) {
  const row = clientRow(agentId, clientId);
  if (!row) return { ok: false, error: "Client not found." };
  const step = db.prepare("SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, row.plan_rev, stepId);
  if (!step) return { ok: false, error: "Step not found." };
  if (step.type === "apply") return { ok: false, error: "Apply steps have no client draft." };
  if (step.status === "done" || step.status === "blocked") return { ok: false, error: "That step is closed." };
  let body = String(rawBody || "").replace(/\r/g, "").trim().slice(0, 1200);
  if (body.length < 20) return { ok: false, error: "Wording too short." };
  if (DENY.test(body)) return { ok: false, error: "Wording contains a claim we cannot make (tax, guarantee, approval, or an amount)." };
  if (!body.includes(FOOTER)) body = body + "\n\n" + FOOTER;
  db.prepare("UPDATE steps SET body=?, updated_at=? WHERE client_id=? AND plan_rev=? AND step_id=?").run(
    body, nowIso(), clientId, row.plan_rev, stepId
  );
  log(agentId, clientId, "rewrite", stepId);
  return getClient(agentId, clientId);
}

export function stepFor(agentId, clientId, stepId) {
  const row = clientRow(agentId, clientId);
  if (!row) return null;
  const step = db.prepare("SELECT * FROM steps WHERE client_id=? AND plan_rev=? AND step_id=?").get(clientId, row.plan_rev, stepId);
  if (!step) return null;
  return { step, snapshot: readSnapshot(row) };
}

export function footerText() {
  return FOOTER;
}

export function logsFor(agentId, clientId) {
  return db.prepare("SELECT action, detail, at FROM access_log WHERE agent_id=? AND client_id=? ORDER BY id DESC LIMIT 50").all(agentId, clientId);
}
