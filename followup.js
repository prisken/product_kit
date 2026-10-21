const FOOTER = "Not advice. AIA product information only. Not a quote. Not an approval.";
const T = (s) => (window.I18N ? window.I18N.t(s) : s);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => {
    if (c === "&") return "&" + "amp;";
    if (c === "<") return "&" + "lt;";
    if (c === ">") return "&" + "gt;";
    if (c === '"') return "&" + "quot;";
    return "&#39;";
  });
}

let me = null;
let clients = [];
let current = null;
let err = "";
let notice = "";
let polish = { stepId: "", body: "", note: "", busy: false };

const POLISH_DENY = /\b(tax|deduct(?:ible|ion)?|guarantee(?:d)?|approv(?:ed|al)|illustrated|return of|pre-?existing)\b/i;

function polishPromptText(step, snap) {
  const lang =
    snap.language === "zh"
      ? "Traditional Chinese (Hong Kong, conversational)"
      : snap.language === "mixed"
        ? "the same mix of English and Traditional Chinese as the notes"
        : "plain English (Hong Kong)";
  return `You rewrite ONE short follow-up message that a Hong Kong AIA insurance agent will send to a client. You are NOT a planner. Rephrase only.

Return ONLY JSON: {"body":"..."}

Rules — violating any one makes it unusable:
- Keep the same single request. Do not add a second ask.
- Add no facts, no product names, no coverage claims, no eligibility, no approval, no timing promise.
- No numbers, amounts, currencies, or dates that are not already in the original.
- Never mention tax, deduction, guaranteed, approved, illustrated returns, pre-existing conditions.
- 25-70 words, no greeting, no sign-off, no disclaimer.
- Write in ${lang}.

Context (do not quote back): ${String((snap.aiBrief && snap.aiBrief.summary) || "").slice(0, 200)}
Step type: ${step.type}
Original: ${String(step.body || "").split("\n\n")[0]}`;
}

async function polishViaBrowser(step, snap) {
  try {
    const meta = await fetch("/api/local-key", { credentials: "same-origin" }).then((r) => r.json());
    if (!meta.ok || !meta.key) return null;
    const isOr = meta.provider === "openrouter";
    const url = isOr ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.deepseek.com/chat/completions";
    const model = isOr ? "deepseek/deepseek-chat-v3.1" : "deepseek-chat";
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + meta.key },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: polishPromptText(step, snap) },
          { role: "user", content: "Rewrite it." },
        ],
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    let raw = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let out;
    try { out = JSON.parse(raw); } catch {
      const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
      if (a < 0 || b <= a) return null;
      try { out = JSON.parse(raw.slice(a, b + 1)); } catch { return null; }
    }
    const body = String(out.body || "").trim();
    if (body.length < 25 || body.length > 900) return null;
    if (POLISH_DENY.test(body)) return null;
    if (!/\d/.test(step.body || "") && /\d/.test(body)) return null;
    return body + "\n\n" + FOOTER;
  } catch {
    return null;
  }
}

async function api(method, url, body) {
  const opt = { method, credentials: "same-origin", headers: {} };
  if (body !== undefined) {
    opt.headers["Content-Type"] = "application/json";
    opt.body = JSON.stringify(body);
  }
  const r = await fetch(url, opt);
  const j = await r.json().catch(() => ({ ok: false, error: "bad response" }));
  if (!r.ok && !j.error) j.error = "HTTP " + r.status;
  return j;
}

function setErr(e) {
  err = e || "";
  notice = "";
  draw();
}

function authView() {
  return `
    <section class="card">
      <h2>${T("Sign in")}</h2>
      <p class="hint">${T("Local loopback only. One agent, no sharing. Passwords never leave this Mac.")}</p>
      ${err ? `<div class="warn">${esc(err)}</div>` : ""}
      <div class="grid2">
        <form id="loginF">
          <div class="sub">${T("Existing agent")}</div>
          <label class="lab">${T("Email")} <input name="email" type="email" required></label>
          <label class="lab">${T("Password")} <input name="password" type="password" required></label>
          <button class="btn" type="submit">${T("Sign in")}</button>
        </form>
        <form id="regF">
          <div class="sub">${T("New agent")}</div>
          <label class="lab">${T("Name")} <input name="name" required minlength="2"></label>
          <label class="lab">Email <input name="email" type="email" required></label>
          <label class="lab">${T("Password (8+)")} <input name="password" type="password" required minlength="8"></label>
          <button class="btn ghost" type="submit">${T("Register")}</button>
        </form>
      </div>
    </section>`;
}

function listView() {
  return `
    <section class="card">
      <div class="nav-row" style="margin-bottom:8px">
        <div class="eyebrow">${esc(me.name)} · ${esc(me.email)}</div>
        <button class="btn ghost sm" type="button" id="logout">${T("Sign out")}</button>
      </div>
      <h2>${T("Clients")}</h2>
      <p class="hint">Frozen snapshots from the wizard. The system never sends a message — copy the draft, send it yourself, then mark Sent.</p>
      ${err ? `<div class="warn">${esc(err)}</div>` : ""}
      ${notice ? `<div class="line-ok">${esc(notice)}</div>` : ""}
      ${
        clients.length
          ? `<div class="clist">${clients
              .map(
                (c) => `<a class="cl-row" href="#${esc(c.id)}">
                  <div>
                    <b>${esc(c.displayName)}</b>
                    <div class="cond">${esc(c.summary || T("No summary"))} · rev ${c.planRev} · ${c.openSteps} ${T("open")}${c.dueReengage ? ` · ${c.dueReengage} ${T("reengage due")}` : ""}</div>
                  </div>
                  <div class="cond">${esc((c.updatedAt || "").slice(0, 10))}</div>
                </a>`
              )
              .join("")}</div>`
          : `<p class="muted">None yet. Finish a meeting in the wizard, then Save client.</p>`
      }
      <p class="fine">${T("Retention 365 days from save. Delete removes the record. Notes are encrypted at rest.")}</p>
    </section>`;
}

function statusBtns(st) {
  const s = st.status;
  const bits = [];
  if (st.type !== "apply" && (s === "not_started" || s === "draft_ready")) bits.push(`<button class="mini" data-act="copy" data-id="${esc(st.step_id)}">${T("Copy draft")}</button>`);
  if (st.type !== "apply" && (s === "not_started" || s === "draft_ready")) bits.push(`<button class="mini" data-act="sent" data-id="${esc(st.step_id)}">${T("I sent this")}</button>`);
  if (st.type !== "apply" && s !== "done" && s !== "blocked") bits.push(`<button class="mini" data-act="polish" data-id="${esc(st.step_id)}">${T("Polish wording")}</button>`);
  if (s !== "done" && s !== "blocked") bits.push(`<button class="mini" data-act="done" data-id="${esc(st.step_id)}">${T("Done")}</button>`);
  if (s !== "done" && s !== "blocked") bits.push(`<button class="mini" data-act="blocked" data-id="${esc(st.step_id)}">${T("Blocked")}</button>`);
  return bits.join(" ");
}

function clientView() {
  const c = current.client;
  const snap = current.snapshot;
  const steps = current.steps || [];
  const budget = steps.find((s) => s.step_id === "g:budget.comfort");
  return `
    <section class="card">
      <div class="nav-row">
        <a class="crumb" href="#">← ${T("All clients")}</a>
        <span>
          <a class="btn ghost sm" href="wizard.html?client=${esc(c.id)}">${T("Open plan")}</a>
          <a class="btn ghost sm" href="wizard.html?client=${esc(c.id)}&replan=1">${T("Re-plan")}</a>
          <button class="btn ghost sm" type="button" id="delC">${T("Delete")}</button>
        </span>
      </div>
      <h2>${esc(c.displayName)}</h2>
      <p class="hint">Locked plan rev ${c.planRev}. Retain until ${esc((c.retainUntil || "").slice(0, 10))}. Labels only — not a CRM of record.</p>
      ${err ? `<div class="warn">${esc(err)}</div>` : ""}
      ${notice ? `<div class="line-ok">${esc(notice)}</div>` : ""}
      <div class="sub">${T("Frozen picks")}</div>
      <div class="table-wrap"><table class="cmp rec">
        <thead><tr><th>Move</th><th>System suggested</th><th>You picked</th><th>Why we chose it</th></tr></thead>
        <tbody>${(snap.moves || [])
          .map((m) => {
            const sys = m.systemPick;
            const ch = m.chosen;
            const changed = sys && ch && sys.productId !== ch.productId;
            return `<tr>
              <td>${esc(m.title)}</td>
              <td>${sys ? esc(window.I18N ? window.I18N.productName(sys.productId, sys.productName) : sys.productName) : "—"}</td>
              <td class="${changed ? "td-diff" : ""}">${ch ? esc(window.I18N ? window.I18N.productName(ch.productId, ch.productName) : ch.productName) : "—"}${changed ? ' <span class="badge weak">changed</span>' : ""}</td>
              <td>${esc(m.reason || (ch && ch.offer) || "")}</td>
            </tr>`;
          })
          .join("")}</tbody>
      </table></div>
      ${(snap.deferred || []).length ? `<p class="cond">Deferred: ${esc(snap.deferred.map((d) => d.replace(/_/g, " ")).join(", "))}</p>` : ""}
      <details class="allbox" style="margin-top:12px">
        <summary>${T("Plan as delivered")} (rev ${c.planRev})</summary>
        <pre class="draft">${esc(snap.finalText || "No plan text stored.")}</pre>
        <button class="mini" type="button" data-act="copyplan">${T("Copy plan")}</button>
      </details>
    </section>
    <section class="card">
      <h2>${T("Follow-up")}</h2>
      <p class="hint">Deterministic checklist. Copy the draft — the system never sends. Sent schedules one reengage in 3 days (max 2). Done or Blocked cancels it. Sent never opens Gate D.</p>
      ${
        budget && budget.status !== "done" && budget.status !== "blocked"
          ? `<div class="ai-card" style="margin-bottom:14px">
              <div class="sub">${T("Comfort boundary")}</div>
              <p class="hint" style="margin:0 0 8px">Required to mark budget Done. Not a quote.</p>
              <label class="lab">${T("Comfort boundary")} <select id="comfort"><option value="">${T("Choose…")}</option><option value="too_tight">${T("Too tight")}</option><option value="ok">${T("Ok")}</option><option value="flexible">${T("Flexible")}</option></select></label>
              <label class="lab">${T("Note (optional, not a quote)")} <input id="comfortNote" placeholder="free text — not a premium"></label>
            </div>`
          : ""
      }
      ${(steps || [])
        .map((st) => {
          const due = st.due_at ? ` · due ${esc(st.due_at.slice(0, 10))}` : "";
          return `<article class="move" style="margin-bottom:10px">
            <div class="move-h">
              <div>
                <div class="move-t">${esc(st.title)} <span class="badge ${st.status === "done" ? "strong" : st.status === "blocked" ? "weak" : st.status === "sent" ? "core" : "medium"}">${esc(T(st.status.replace("_", " ")))}</span></div>
                <div class="move-p">${esc(st.type)}${due}</div>
              </div>
            </div>
            ${st.type === "apply" ? `<p class="cond">${esc(st.body)}</p>` : `<pre class="draft">${esc(st.body)}</pre>`}
            ${
              polish.stepId === st.step_id
                ? `<div class="ai-card">
                    <div class="sub">${T("Suggested wording")} ${polish.busy ? "· " + T("working…") : ""}</div>
                    ${polish.body ? `<pre class="draft">${esc(polish.body)}</pre>` : `<p class="hint">${esc(polish.note || "No suggestion.")}</p>`}
                    ${polish.body ? `<div class="row-acts"><button class="mini" data-act="accept" data-id="${esc(st.step_id)}">${T("Use this wording")}</button><button class="mini" data-act="discard" data-id="${esc(st.step_id)}">${T("Keep template")}</button></div>` : `<div class="row-acts"><button class="mini" data-act="discard" data-id="${esc(st.step_id)}">${T("Close")}</button></div>`}
                    <p class="fine">Wording only. The step, its gate and its status are unchanged. Nothing is sent.</p>
                  </div>`
                : ""
            }
            <div class="row-acts">${statusBtns(st)}</div>
          </article>`;
        })
        .join("")}
      <p class="fine">${esc(FOOTER)}</p>
    </section>`;
}

function bindAuth() {
  const login = document.getElementById("loginF");
  if (login)
    login.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(login);
      const out = await api("POST", "/api/login", { email: fd.get("email"), password: fd.get("password") });
      if (!out.ok) return setErr(out.error);
      me = out.agent;
      err = "";
      await loadList();
    };
  const reg = document.getElementById("regF");
  if (reg)
    reg.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(reg);
      const out = await api("POST", "/api/register", { name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
      if (!out.ok) return setErr(out.error);
      me = out.agent;
      err = "";
      await loadList();
    };
}

function bindList() {
  const lo = document.getElementById("logout");
  if (lo)
    lo.onclick = async () => {
      await api("POST", "/api/logout");
      me = null;
      current = null;
      clients = [];
      draw();
    };
}

function bindClient() {
  const back = document.querySelector('a.crumb[href="#"]');
  if (back)
    back.onclick = (e) => {
      e.preventDefault();
      location.hash = "";
      current = null;
      loadList();
    };
  const del = document.getElementById("delC");
  if (del)
    del.onclick = async () => {
      if (!confirm("Delete this client and all follow-up steps? This cannot be undone.")) return;
      const out = await api("DELETE", "/api/clients/" + current.client.id);
      if (!out.ok) return setErr(out.error);
      current = null;
      location.hash = "";
      notice = T("Deleted.");
      await loadList();
    };
  document.querySelectorAll("[data-act]").forEach((b) => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const act = b.dataset.act;
      if (act === "copyplan") {
        const txt = (current.snapshot && current.snapshot.finalText) || "";
        try {
          const w = navigator.clipboard && navigator.clipboard.writeText(txt);
          if (w && w.catch) w.catch(() => {});
        } catch { /* ignore */ }
        notice = T("Plan copied.");
        draw();
        return;
      }
      if (act === "copy") {
        const st = current.steps.find((s) => s.step_id === id);
        try {
          await navigator.clipboard.writeText((st && st.body) || "");
        } catch {
          /* ignore */
        }
        const out = await api("POST", "/api/clients/" + current.client.id + "/steps/" + encodeURIComponent(id) + "/copy");
        if (!out.ok) return setErr(out.error);
        current = out;
        notice = T("Draft copied. Send it yourself, then mark Sent.");
        err = "";
        draw();
        return;
      }
      if (act === "polish") {
        const st = current.steps.find((x) => x.step_id === id);
        polish = { stepId: id, body: "", note: "", busy: true };
        draw();
        let body = st ? await polishViaBrowser(st, current.snapshot) : null;
        let note = "";
        if (!body) {
          const out = await api("POST", "/api/polish", { clientId: current.client.id, stepId: id });
          if (out.ok) body = out.body;
          else note = "AI unavailable right now — the template above is unchanged.";
        }
        polish = { stepId: id, body: body || "", note, busy: false };
        draw();
        return;
      }
      if (act === "discard") {
        polish = { stepId: "", body: "", note: "", busy: false };
        draw();
        return;
      }
      if (act === "accept") {
        const out = await api("POST", "/api/clients/" + current.client.id + "/steps/" + encodeURIComponent(id) + "/body", { body: polish.body });
        if (!out.ok) return setErr(out.error);
        current = out;
        polish = { stepId: "", body: "", note: "", busy: false };
        notice = T("Wording updated. Still unsent.");
        err = "";
        draw();
        return;
      }
      const body = { status: act === "sent" ? "sent" : act };
      if (act === "done" && id === "g:budget.comfort") {
        const comfort = (document.getElementById("comfort") || {}).value;
        const note = (document.getElementById("comfortNote") || {}).value;
        if (!comfort) return setErr("Choose too tight / ok / flexible before Done. Sent never opens this gate.");
        body.budgetComfort = comfort;
        body.budgetNote = note;
      }
      const out = await api("POST", "/api/clients/" + current.client.id + "/steps/" + encodeURIComponent(id), body);
      if (!out.ok) return setErr(out.error);
      current = out;
      notice = act === "sent" ? T("Recorded as sent. A reengage is scheduled in 3 days if the gate is still open.") : T("Updated.");
      err = "";
      draw();
    };
  });
}

function draw() {
  const root = document.getElementById("panel");
  if (!me) {
    root.innerHTML = authView();
    bindAuth();
    return;
  }
  if (current) {
    root.innerHTML = clientView();
    bindClient();
    return;
  }
  root.innerHTML = listView();
  bindList();
}

async function loadList() {
  const out = await api("GET", "/api/clients");
  if (!out.ok) return setErr(out.error);
  clients = out.clients || [];
  draw();
}

async function loadClient(id) {
  const out = await api("GET", "/api/clients/" + id);
  if (!out.ok) {
    current = null;
    return setErr(out.error);
  }
  current = out;
  err = "";
  draw();
}

async function boot() {
  const who = await api("GET", "/api/me");
  me = who.ok ? who.agent : null;
  const hash = location.hash.replace(/^#/, "");
  if (me && hash) await loadClient(hash);
  else if (me) await loadList();
  else draw();
  window.addEventListener("hashchange", () => {
    const h = location.hash.replace(/^#/, "");
    if (h) loadClient(h);
    else {
      current = null;
      loadList();
    }
  });
}

window.addEventListener("langchange", () => { draw(); });

boot();
