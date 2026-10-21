/* Future state for a first meeting: protection-only, two tracks, products attached to moves. */

const SAMPLE = `Client is 28, lives with his girlfriend, planning to live together and buy a house in about 10 years.
Parents have a long-term illness he helps care for. He is afraid of getting a serious illness himself.
Has a younger sister. No existing insurance that he knows of. Also asked about hospital cover. Budget not yet discussed.`;

const PLAIN = {
  term_life:
    "If he dies, it pays a lump sum to the people who depend on him — so the house plan and the family don't have to change.",
  medical:
    "It pays the hospital bill itself, up to a limit — treatment stops coming out of his savings.",
  ci:
    "If he is diagnosed with a covered serious illness, it pays a lump sum he can spend on treatment, recovery, or replacing income while he cannot work.",
  accident:
    "It pays accident-related bills and income while he recovers.",
};

const STEP_ORDER = ["term_life", "medical", "ci"];
const NEED_TO_LANE = {
  family_protection: "term_life",
  income_or_lifestyle_support: "term_life",
  legacy_and_estate: "term_life",
  hospital_cost_protection: "medical",
  room_ward_level: "medical",
  high_annual_or_lifetime_limit: "medical",
  outpatient_and_followup: "medical",
  international_coverage: "medical",
  critical_illness_readiness: "ci",
  pre_existing_or_chronic_support: "ci",
};

const STEP_TITLE = {
  term_life: "Protect the income",
  medical: "Stop hospital bills eating savings",
  ci: "Put a lump sum behind a diagnosis",
};

let CATALOG = null;
let BUSY = false;

function niceName(n) {
  const parts = String(n || "").split(" / ");
  if (parts.length < 2) return String(n || "");
  const [a, b] = parts;
  return b.toLowerCase().startsWith(a.toLowerCase()) ? b : a;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function keys() {
  try {
    return { ds: localStorage.getItem("wiz_ds_key") || "", or: localStorage.getItem("wiz_or_key") || "" };
  } catch {
    return { ds: "", or: "" };
  }
}

function cleanBrief(b, tag, ms) {
  const L = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.LANES) || [];
  const N = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.NEEDS) || [];
  b.lanes = (b.lanes || []).filter((x) => L.includes(x));
  b.needs = (b.needs || []).filter((x) => N.includes(x));
  b.searchTerms = (b.searchTerms || []).filter((t) => typeof t === "string" && t.trim()).slice(0, 15);
  b.model = tag;
  b.ms = ms;
  return b;
}

async function ensureKey() {
  let k = keys();
  if (k.ds || k.or) return k;
  try {
    const d = await (await fetch("/api/local-key", { cache: "no-store" })).json();
    if (d.ok && d.key) {
      localStorage.setItem(d.provider === "openrouter" ? "wiz_or_key" : "wiz_ds_key", d.key);
      k = keys();
    }
  } catch { /* keyless */ }
  return k;
}

async function brief(notes) {
  const k = await ensureKey();
  const sys = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.system()) || "";
  const conf = k.ds
    ? { url: "https://api.deepseek.com/chat/completions", key: k.ds, model: "deepseek-chat", tag: "deepseek" }
    : k.or
      ? { url: "https://openrouter.ai/api/v1/chat/completions", key: k.or, model: "deepseek/deepseek-chat-v3.1", tag: "openrouter" }
      : null;
  if (conf) {
    const t0 = Date.now();
    const r = await fetch(conf.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: ["Bearer", conf.key].join(" ") },
      body: JSON.stringify({
        model: conf.model,
        temperature: 0,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: "NOTES:\n" + notes + "\n\nKNOWN FIELDS:\n{}" },
        ],
      }),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(conf.tag + " " + r.status + ": " + text.slice(0, 160));
    let raw = (JSON.parse(text).choices || [])[0]?.message?.content || "";
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const i = raw.indexOf("{"), j = raw.lastIndexOf("}");
    if (i < 0 || j <= i) throw new Error("model did not return JSON");
    return cleanBrief(JSON.parse(raw.slice(i, j + 1)), conf.tag, Date.now() - t0);
  }
  const r = await fetch("/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes, fields: {} }),
  });
  const d = await r.json();
  if (!d.ok) throw new Error(d.error || "intake failed");
  return d.brief;
}

function factsOf(b, notes) {
  const p = b.profile || {};
  const known = [];
  if (p.ageBand && p.ageBand !== "unknown") known.push({ k: "Age", v: p.ageBand });
  if (/girlfriend|partner|married|wife|husband/i.test(notes)) known.push({ k: "Household", v: "Partner, planning to live together" });
  if (/parents?\b/i.test(notes) && /illness|sick|care/i.test(notes)) known.push({ k: "Dependants", v: "Parents need care support" });
  if (/house|flat|property|home/i.test(notes)) known.push({ k: "Goal", v: "Buy a home in ~10 years" });
  if (/sister|brother|sibling/i.test(notes)) known.push({ k: "Family", v: "Has a sister" });
  if (p.ownerType === "company") known.push({ k: "Policy type", v: "Company-owned (keyman)" });
  const unknown = [];
  if (!p.ageBand || p.ageBand === "unknown") unknown.push("age");
  if (!p.smoker || p.smoker === "unknown") unknown.push("smoker status");
  if (!p.existingCover || p.existingCover === "unknown") unknown.push("existing cover");
  if (!p.budget || p.budget === "unknown") unknown.push("premium budget");
  return { known, unknown };
}

let MOVES = [];
const PICKS = {};

function firstSentence(t) {
  const txt = String(t || "").replace(/\s+/g, " ").trim();
  const m = txt.match(/^.{0,170}?[.!?](\s|$)/);
  return (m ? m[0] : txt).trim();
}

function bestTrend(p) {
  const all = p.matchedTrends || [];
  return all.find((t) => !/tax|deduct/i.test((t.trendName || "") + " " + (t.whatProductOffers || ""))) || all[0] || null;
}

function reasonFor(p) {
  const t = bestTrend(p);
  return t ? firstSentence(t.whatProductOffers) : p.bestFor || "";
}

function fitFor(p) {
  const t = bestTrend(p);
  return t ? t.trendName : "";
}

function tradeoffFor(p) {
  return (p.notSuitedWhen || [])[0] || (p.gaps || [])[0] || "Confirm underwriting, premium and exclusions.";
}

function buildMoves(b, notes) {
  const lanesNeeded = [];
  for (const n of b.needs || []) {
    const lane = NEED_TO_LANE[n];
    if (lane && lanesNeeded.indexOf(lane) < 0) lanesNeeded.push(lane);
  }
  const ordered = STEP_ORDER.filter((l) => lanesNeeded.indexOf(l) >= 0).slice(0, 3);
  const text = notes + " " + (b.searchTerms || []).join(" ");
  const res = window.AIAMatch.matchCatalog(CATALOG, text, b.profile || {}, ordered);
  const moves = [];
  for (const lane of ordered) {
    const pool = (res.products || []).filter((p) => p.lane === lane);
    if (!pool.length) continue;
    const ranked = pool.slice().sort((x, y) => y.score - x.score);
    const top = ranked.filter((p) => !p.hasWeakOnly && p.score > 0.2).slice(0, 3);
    const picked = top.length ? top : ranked.filter((p) => !p.hasWeakOnly).slice(0, 3);
    moves.push({
      lane,
      title: STEP_TITLE[lane] || lane,
      plain: PLAIN[lane] || "",
      top: picked,
      all: ranked,
      def: (picked[0] || ranked[0]).productId,
    });
  }
  return moves;
}

function chosenFor(m) {
  const id = PICKS[m.lane] || m.def;
  return m.all.find((p) => p.productId === id) || m.top[0] || m.all[0];
}

function horizonLines(ctx) {
  const care = ctx.parents;
  const house = ctx.house;
  const fam = ctx.partner;
  return {
    a: [
      "Nothing is in force. The first serious illness is funded by savings, family, or a loan.",
      care
        ? "Care costs keep drawing down the deposit — the goal moves further out."
        : "Savings absorb whatever the first event costs.",
      house
        ? "Deposit arrives later or smaller. The risk never went away."
        : "The same exposure, just older and more expensive to insure.",
    ],
    b: [
      "Cover is in force. A diagnosis or a death hits the policy, not the savings.",
      care
        ? "Parents' care comes from income, not the deposit. Cover is still in force."
        : "The deposit is protected from the first event.",
      house
        ? "Deposit on schedule, with protection still running alongside it."
        : "Protection still running, at the age he locked in.",
    ],
  };
}

function candRow(m, p, chosenId) {
  const on = p.productId === chosenId;
  const t = bestTrend(p);
  const ev = t ? t.evidenceStrength : "medium";
  return `<label class="cand${on ? " on" : ""}">
    <input type="radio" name="pick-${esc(m.lane)}" data-lane="${esc(m.lane)}" data-pick="${esc(p.productId)}"${on ? " checked" : ""}>
    <span class="cand-b">
      <span class="cand-n">${esc(niceName(p.productName))} <span class="badge ${esc(ev)}">${esc(ev)}</span>${p.hasWeakOnly ? ' <span class="badge weak">verify first</span>' : ""}</span>
      ${fitFor(p) ? `<span class="cand-r"><b>Fit:</b> ${esc(fitFor(p))}</span>` : ""}
      <span class="cand-r">${esc(reasonFor(p))}</span>
      <span class="cand-t">Trade-off: ${esc(tradeoffFor(p))}</span>
    </span>
  </label>`;
}

function renderMoves() {
  if (!MOVES.length) return '<p class="warn">No product matched. Add more detail to the notes.</p>';
  return MOVES.map((m, i) => {
    const c = chosenFor(m);
    const t = bestTrend(c);
    const ev = t ? t.evidenceStrength : "medium";
    return `<article class="move">
      <div class="move-h"><span class="stepno">${i + 1}</span>
        <div><div class="move-t">${esc(m.title)}</div>
          <div class="move-p">${esc(niceName(c.productName))} <span class="badge ${esc(ev)}">${esc(ev)}</span></div>
        </div>
      </div>
      <p class="move-what">${esc(m.plain)}</p>
      <div class="sub">What this product actually does</div>
      <p class="move-offer">${esc(reasonFor(c))}</p>
      ${tradeoffFor(c) ? `<div class="note"><b>Check:</b> ${esc(tradeoffFor(c))}</div>` : ""}
      <div class="sub" style="margin-top:14px">Agent picks — ${m.top.length} suggested${m.all.length > m.top.length ? `, ${m.all.length} in this category` : ""}</div>
      <div class="cands">${m.top.map((p) => candRow(m, p, c.productId)).join("")}</div>
      ${m.all.length > m.top.length ? `<details class="allbox"><summary>Show all ${m.all.length} products in this category</summary><div class="cands">${m.all.map((p) => candRow(m, p, c.productId)).join("")}</div></details>` : ""}
    </article>`;
  }).join("");
}

function bindMoves() {
  document.querySelectorAll("input[data-pick]").forEach((el) => {
    el.addEventListener("change", () => {
      PICKS[el.dataset.lane] = el.dataset.pick;
      const box = document.getElementById("movesWrap");
      if (box) {
        box.innerHTML = renderMoves();
        bindMoves();
      }
    });
  });
}

function render(b, notes) {
  const f = factsOf(b, notes);
  MOVES = buildMoves(b, notes);
  for (const m of MOVES) if (!PICKS[m.lane]) PICKS[m.lane] = m.def;
  const ctx = {
    parents: /parents?/i.test(notes) && /illness|sick|care/i.test(notes),
    house: /house|flat|property|home/i.test(notes),
    partner: /girlfriend|partner|married|wife|husband/i.test(notes),
  };
  const H = horizonLines(ctx);
  const periods = ["12 months", "5 years", "10 years"];

  const factRows = f.known.map((x) => `<li><b>${esc(x.k)}</b> — ${esc(x.v)}</li>`).join("") || "<li>Nothing confirmed yet</li>";
  const unknownChips = f.unknown.map((x) => `<span class="chip neg">${esc(x)} — to confirm</span>`).join("");

  const stepCards = renderMoves();

  document.getElementById("out").innerHTML = `
    <section class="card">
      <h2>Where he is now</h2>
      <div class="grid2">
        <div><div class="sub">Confirmed</div><ul class="list">${factRows}</ul></div>
        <div><div class="sub">Not known yet</div><div class="chips">${unknownChips || '<span class="chip">none</span>'}</div>
          <p class="hint" style="margin-top:10px">${esc(b.summary || "")}</p></div>
      </div>
    </section>

    <section class="card">
      <h2>Two tracks</h2>
      <div class="tracks">
        <div class="track-head"></div>
        <div class="track-head bad">If nothing changes</div>
        <div class="track-head good">If we act in this meeting</div>
        ${periods
          .map(
            (p, i) => `<div class="track-when">${p}</div>
              <div class="track-cell bad">${esc(H.a[i])}</div>
              <div class="track-cell good">${esc(H.b[i])}</div>`
          )
          .join("")}
      </div>
      <p class="hint" style="margin-top:12px">Protection only. No savings projections, no illustrated returns.</p>
    </section>

    <section>
      <h2 style="margin:0 0 10px">The three moves</h2>
      <div class="moves" id="movesWrap">${stepCards}</div>
    </section>

    <div class="wiz-nav">
      <button class="btn" type="button" id="printBtn">Print / save PDF</button>
      <button class="btn ghost" type="button" id="againBtn">New notes</button>
    </div>
    <p class="fine">Built from the notes and the AIA product catalogue. Assumptions are marked; confirm before quoting. Not advice, no tax or eligibility claims.</p>
  `;
  bindMoves();
  document.getElementById("printBtn").onclick = () => window.print();
  document.getElementById("againBtn").onclick = () => {
    document.getElementById("out").innerHTML = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  document.getElementById("out").scrollIntoView({ behavior: "smooth" });
}

async function run() {
  if (BUSY) return;
  const notes = document.getElementById("notes").value.trim();
  const status = document.getElementById("status");
  const err = document.getElementById("err");
  if (notes.length < 20) {
    err.innerHTML = '<div class="warn">Paste a bit more of the note first.</div>';
    return;
  }
  BUSY = true;
  status.textContent = "Reading the notes…";
  err.innerHTML = "";
  try {
    if (!CATALOG) CATALOG = await (await fetch("data/catalog.json", { cache: "no-store" })).json();
    const b = await brief(notes);
    status.textContent = b.model + " · " + b.ms + " ms";
    render(b, notes);
  } catch (e) {
    err.innerHTML = '<div class="warn">' + esc(String(e.message || e)) + "</div>";
    status.textContent = "";
  } finally {
    BUSY = false;
  }
}

document.getElementById("sampleBtn").onclick = () => {
  document.getElementById("notes").value = SAMPLE;
};
document.getElementById("go").onclick = run;
