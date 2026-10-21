const STEPS = [
  { id: "intake", label: "Intake" },
  { id: "lane", label: "Lane" },
  { id: "needs", label: "Confirm needs" },
  { id: "future", label: "Future state" },
  { id: "narrow", label: "Narrow" },
  { id: "compare", label: "Compare" },
];

const AGE_BANDS = ["", "0–17", "18–30", "31–40", "41–50", "51–60", "61+"];
const SAMPLES = {
  keyman: `Company owner, 42, non-smoker. Wants keyman insurance on himself so the company is protected if he dies. Budget-conscious, no interest in cash value or savings. Company will own and pay the policy. Needs a large death benefit for the next 15–20 working years.`,
  ci: `Client already has a CI plan but feels underinsured, especially cancer. Family history of heart disease. Budget tight, doesn't want to pay for covers he won't use. Asked if he can choose the covers. Wants to bridge a specific gap rather than buy a full new all-in-one plan.`,
  vhis: `Couple in their 30s, currently on ward-level hospital cover. Want semi-private, worried about hospital bills and annual limits. Asked about VHIS tax deduction and deductible options. No existing CI mentioned.`,
  messy: `met Mr Chan, 45, married 2 kids, wife not working. worried abt if something happens to him. has an old policy from previous agent, dont know what it covers. asks if enough. maybe few thousand a month. also asked abt hospital cover.`,
};


const PLAIN = {
  term_life: "If he dies, it pays a lump sum to the people who depend on him — so the house plan and the family don't have to change.",
  medical: "It pays the hospital bill itself, up to a limit — treatment stops coming out of his savings.",
  ci: "If he is diagnosed with a covered serious illness, it pays a lump sum he can spend on treatment, recovery, or replacing income while he cannot work.",
  accident: "It pays accident-related bills and income while he recovers.",
  savings: "It builds a sum for a goal with a date — here, the deposit. The guaranteed and non-guaranteed parts are kept separate, and no projected return is shown.",
};
const STEP_ORDER = ["term_life", "medical", "ci", "savings"];
const NEED_TO_LANE = {
  family_protection: "term_life", income_or_lifestyle_support: "term_life", legacy_and_estate: "term_life",
  hospital_cost_protection: "medical", room_ward_level: "medical", high_annual_or_lifetime_limit: "medical",
  outpatient_and_followup: "medical", international_coverage: "medical",
  critical_illness_readiness: "ci", pre_existing_or_chronic_support: "ci",
  savings_and_wealth_growth: "savings",
};
const STEP_TITLE = {
  term_life: "Protect the income",
  medical: "Stop hospital bills eating savings",
  ci: "Put a lump sum behind a diagnosis",
  savings: "Fund the goal on a date",
};

let CATALOG = null;
let state = blankState();
let aiBusy = false;

function blankState() {
  return {
    step: 0,
    notes: "",
    fields: {
      ageBand: "",
      smoker: "",
      budget: "",
      existingCover: "unknown",
      existingCoverType: "",
      ownerType: "personal",
      hasCurrentPlan: false,
    },
    currentPlan: {
      name: "",
      sumAssured: "",
      room: "",
      deductible: "",
      remainingTerm: "",
      premium: "",
    },
    selectedLanes: [],
    confirmedNeeds: [],
    picked: [],
    answers: {},
    result: null,
    aiBrief: null,
    aiError: "",
    moves: [],
    picks: {},
    planResult: null,
    checks: [],
    reasons: {},
    finished: false,
    finalText: "",
    agent: null,
    savedClientId: "",
    saveError: "",
    saveBusy: false,
    replanOf: "",
    loadedRev: 0,
  };
}

const T = (s) => (window.I18N ? window.I18N.t(s) : s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function renderSteps() {
  document.getElementById("steps").innerHTML = STEPS.map((s, i) => {
    const cls = i === state.step ? "on" : i < state.step ? "done" : "";
    return `<li class="${cls}"><button type="button" data-i="${i}" ${i > state.step ? "disabled" : ""}>${i + 1}. ${esc(T(s.label))}</button></li>`;
  }).join("");
  document.querySelectorAll("#steps button").forEach((b) =>
    b.addEventListener("click", () => {
      const i = Number(b.dataset.i);
      if (i <= state.step) {
        state.step = i;
        draw();
      }
    })
  );
}

function runMatch() {
  if (!window.AIAMatch || !CATALOG) return;
  const ai = state.aiBrief;
  const text = ai && ai.searchTerms && ai.searchTerms.length
    ? state.notes + " " + ai.searchTerms.join(" ")
    : state.notes;
  const lanes = state.selectedLanes && state.selectedLanes.length
    ? state.selectedLanes
    : (ai && ai.lanes ? ai.lanes : []);
  state.result = AIAMatch.matchCatalog(CATALOG, text, state.fields, lanes);
  if (AIAMatch.detectNeeds) {
    const aiNeeds = (ai && ai.needs) || null;
    state.result = { ...state.result, needs: AIAMatch.detectNeeds(state.notes, state.fields, aiNeeds) };
  } else if (ai && ai.needs && ai.needs.length) {
    state.result = mergeAiNeeds(state.result, ai);
  }
  if (state.step >= 4 && Object.keys(state.answers).some((k) => state.answers[k])) {
    state.result = AIAMatch.applyNarrow(state.result, state.answers);
  }
}

function mergeAiNeeds(result, ai) {
  const have = new Set((result.needs || []).map((n) => n.id));
  const extra = (ai.needs || [])
    .filter((id) => !have.has(id))
    .map((id) => ({
      id,
      label: (window.AIAMatch.CATEGORIES[id] && window.AIAMatch.CATEGORIES[id].label) || id,
      score: 0,
      snippets: [ai.summary || ""],
      posHits: ["AI read"],
      negHits: [],
      products: [],
      fromAi: true,
    }));
  return { ...result, needs: [...extra, ...(result.needs || [])] };
}

function browserKeys() {
  try {
    return {
      ds: localStorage.getItem("wiz_ds_key") || "",
      or: localStorage.getItem("wiz_or_key") || "",
    };
  } catch {
    return { ds: "", or: "" };
  }
}

function cleanBrief(brief, tag, ms) {
  const L = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.LANES) || [];
  const N = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.NEEDS) || [];
  brief.lanes = (brief.lanes || []).filter((x) => L.includes(x));
  brief.needs = (brief.needs || []).filter((x) => N.includes(x));
  brief.searchTerms = (brief.searchTerms || []).filter((t) => typeof t === "string" && t.trim()).slice(0, 15);
  brief.ms = ms;
  brief.model = tag;
  return brief;
}

/* Direct browser call: no proxy, no expiring credential, fresh request every time. */
async function ensureBrowserKey() {
  let k = browserKeys();
  if (k.ds || k.or) return k;
  try {
    const r = await fetch("/api/local-key", { cache: "no-store" });
    const d = await r.json();
    if (d.ok && d.key) {
      localStorage.setItem(d.provider === "openrouter" ? "wiz_or_key" : "wiz_ds_key", d.key);
      k = browserKeys();
    }
  } catch { /* stay keyless */ }
  return k;
}

async function callBrowserModel(notes, fields) {
  const { ds, or } = await ensureBrowserKey();
  if (!ds && !or) return null;
  const conf = ds
    ? { url: "https://api.deepseek.com/chat/completions", key: ds, model: "deepseek-chat", tag: "deepseek:deepseek-chat" }
    : { url: "https://openrouter.ai/api/v1/chat/completions", key: or, model: "deepseek/deepseek-chat-v3.1", tag: "openrouter:deepseek-chat-v3.1" };
  const sys = (window.INTAKE_PROMPT && window.INTAKE_PROMPT.system(window.I18N && I18N.isZh() ? "zh" : "en")) || "";
  const t0 = Date.now();
  const r = await fetch(conf.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + conf.key },
    body: JSON.stringify({
      model: conf.model,
      temperature: 0,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `NOTES:\n${notes}\n\nKNOWN FIELDS:\n${JSON.stringify(fields || {})}` },
      ],
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${conf.tag} ${r.status}: ${text.slice(0, 180)}`);
  let raw = (JSON.parse(text).choices && JSON.parse(text).choices[0].message.content) || "";
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const i = raw.indexOf("{"), j = raw.lastIndexOf("}");
  if (i < 0 || j <= i) throw new Error("model did not return JSON");
  return cleanBrief(JSON.parse(raw.slice(i, j + 1)), conf.tag, Date.now() - t0);
}

async function analyseWithAi() {
  if (aiBusy) return;
  const notes = document.getElementById("notes")?.value || state.notes;
  if (!notes || notes.trim().length < 20) {
    state.aiError = T("Paste a bit more of the note first.");
    draw();
    return;
  }
  aiBusy = true;
  state.aiError = "";
  draw();
  try {
    let brief = null, browserErr = "";
    try {
      brief = await callBrowserModel(notes, state.fields);
    } catch (e) {
      browserErr = String(e.message || e);
    }
    if (!brief) {
      const r = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, fields: state.fields, language: window.I18N && I18N.isZh() ? "zh" : "en" }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error([browserErr, d.error || "intake failed"].filter(Boolean).join(" | "));
      brief = d.brief;
    }
    state.aiBrief = brief;
    if (brief.profile) {
      const p = brief.profile;
      if (p.ownerType === "company" || p.ownerType === "personal") state.fields.ownerType = p.ownerType;
      if (p.existingCover === "yes" || p.existingCover === "no") state.fields.existingCover = p.existingCover;
      if (p.existingCoverType) state.fields.existingCoverType = p.existingCoverType;
      if (p.ageBand) state.fields.ageBand = p.ageBand;
      if (p.smoker) state.fields.smoker = p.smoker;
      if (p.budget) state.fields.budget = p.budget;
    }
    state.selectedLanes = (brief.lanes || []).slice();
  } catch (e) {
    state.aiError = String(e.message || e);
  } finally {
    aiBusy = false;
    runMatch();
    draw();
  }
}

function next() {
  if (state.step === 0) {
    if (!state.notes.trim()) return alert("Paste meeting notes first.");
    runMatch();
    const aiLanes = (state.aiBrief && state.aiBrief.lanes) || [];
    const implied = (state.result.needs || []).map((n) => NEED_TO_LANE[n.id]).filter(Boolean);
    state.selectedLanes = [...new Set([...aiLanes, ...(state.result.autoLanes || []), ...implied])].slice(0, 6);
  }
  if (state.step === 1) {
    runMatch();
    const auto = (state.result.needs || []).map((n) => n.id);
    const aiNeeds = (state.aiBrief && state.aiBrief.needs) || [];
    state.confirmedNeeds = [...new Set([...aiNeeds, ...auto])].slice(0, 8);
  }
  if (state.step === 2) {
    buildPlan();
  }
  if (state.step === 3) {
    runMatch();
  }
  if (state.step === 4) {
    runMatch();
  }
  if (state.step === STEPS.length - 1) {
    finalize();
    return;
  }
  state.step = Math.min(state.step + 1, STEPS.length - 1);
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function finalize() {
  const plan = planSummary();
  state.finished = true;
  state.finalText = meetingText(plan);
  try {
    const w = navigator.clipboard && navigator.clipboard.writeText(state.finalText);
    if (w && w.catch) w.catch(() => {});
  } catch {
    /* clipboard may be blocked */
  }
  draw();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function back() {
  state.step = Math.max(0, state.step - 1);
  draw();
}

function laneToggle(id) {
  if (state.selectedLanes.includes(id)) state.selectedLanes = state.selectedLanes.filter((x) => x !== id);
  else state.selectedLanes.push(id);
  runMatch();
  draw();
}

function needToggle(id) {
  if (state.confirmedNeeds.includes(id)) state.confirmedNeeds = state.confirmedNeeds.filter((x) => x !== id);
  else state.confirmedNeeds.push(id);
  draw();
}

function pickToggle(id) {
  if (state.picked.includes(id)) state.picked = state.picked.filter((x) => x !== id);
  else if (state.picked.length < 4) state.picked.push(id);
  draw();
}

function nav(extra = "") {
  return `<div class="wiz-nav">${extra}<button class="btn ghost" type="button" id="back" ${state.step === 0 ? "disabled" : ""}>${T("Back")}</button><button class="btn" type="button" id="next">${state.step === STEPS.length - 1 ? T("Finish") : T("Continue")}</button></div>`;
}

function bindNav() {
  const n = document.getElementById("next");
  const b = document.getElementById("back");
  if (b) b.onclick = back;
  if (n) n.onclick = next;
}

function intakeView() {
  const f = state.fields;
  return `
    <section class="card">
      <h2>${T("1. Intake")}</h2>
      <p class="hint">${T("Paste the agent’s notes. Add the five fields so mixed-language notes still rank. The matcher is phrase overlap — it does not invent facts.")}</p>
      <label class="lab">${T("Meeting notes")}</label>
      <textarea id="notes" rows="8" placeholder="${T("Paste English / 中文 / mixed notes…")}">${esc(state.notes)}</textarea>
      <div class="sample-row">
        <span class="muted">${T("Load sample:")}</span>
        <button class="btn ghost sm" type="button" data-sample="keyman">${T("Keyman")}</button>
        <button class="btn ghost sm" type="button" data-sample="ci">${T("CI top-up")}</button>
        <button class="btn ghost sm" type="button" data-sample="vhis">${T("VHIS upgrade")}</button>
        <button class="btn ghost sm" type="button" data-sample="messy">${T("Messy note")}</button>
      </div>
      <div class="ai-row">
        <button class="btn" type="button" id="aiBtn" ${aiBusy ? "disabled" : ""}>${aiBusy ? T("Reading the note…") : T("Analyse with AI")}</button>
        <span class="muted">${state.aiBrief ? `AI read · ${esc(state.aiBrief.model || "model")} · ${state.aiBrief.ms || 0} ms` : T("Optional. Extracts lanes, needs and brochure terms from messy notes.")}</span>
      </div>
      ${state.aiError ? `<div class="warn" style="margin-top:10px">${T("AI intake failed:")} ${esc(state.aiError)} — ${T("the rule matcher still runs.")}</div>` : ""}
      ${
        state.aiBrief
          ? `<div class="ai-card">
              <div class="sub">${T("AI read of the notes")}</div>
              <p class="ai-sum">${esc(state.aiBrief.summary || "")}</p>
              <div class="chips">${(state.aiBrief.lanes || []).map((l) => `<span class="chip pos">${esc(window.I18N ? I18N.laneLabel(l) : l)}</span>`).join("")}${(state.aiBrief.needs || []).map((n) => `<span class="chip blue">${esc(window.I18N ? I18N.needLabel(n) : n)}</span>`).join("")}</div>
              ${(state.aiBrief.searchTerms || []).length ? `<div class="sub" style="margin-top:10px">${T("Brochure terms used for matching")}</div><div class="chips">${state.aiBrief.searchTerms.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>` : ""}
              ${(state.aiBrief.missing || []).length ? `<div class="sub" style="margin-top:10px">${T("Still to ask")}</div><ul class="checks">${state.aiBrief.missing.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}
            </div>`
          : ""
      }
      <div class="field-grid">
        <label>${T("Age band")}
          <select id="ageBand">${AGE_BANDS.map((a) => `<option ${f.ageBand === a ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>
        </label>
        <label>${T("Smoker")}
          <select id="smoker">
            <option value="" ${!f.smoker ? "selected" : ""}>—</option>
            <option value="no" ${f.smoker === "no" ? "selected" : ""}>${T("No")}</option>
            <option value="yes" ${f.smoker === "yes" ? "selected" : ""}>${T("Yes")}</option>
            <option value="unknown" ${f.smoker === "unknown" ? "selected" : ""}>${T("Unknown")}</option>
          </select>
        </label>
        <label>${T("Budget / premium comfort")}
          <input id="budget" value="${esc(f.budget)}" placeholder="${T("e.g. under $2,000/mo")}">
        </label>
        <label>${T("Existing cover")}
          <select id="existingCover">
            <option value="unknown" ${f.existingCover === "unknown" ? "selected" : ""}>${T("Unknown")}</option>
            <option value="yes" ${f.existingCover === "yes" ? "selected" : ""}>${T("Yes")}</option>
            <option value="no" ${f.existingCover === "no" ? "selected" : ""}>${T("No")}</option>
          </select>
        </label>
        <label>${T("Existing type")}
          <input id="existingCoverType" value="${esc(f.existingCoverType)}" placeholder="${T("CI / VHIS / term / none")}">
        </label>
        <label>${T("Policy owner")}
          <select id="ownerType">
            <option value="personal" ${f.ownerType === "personal" ? "selected" : ""}>${T("Personal")}</option>
            <option value="company" ${f.ownerType === "company" ? "selected" : ""}>${T("Company (keyman)")}</option>
          </select>
        </label>
      </div>
      <label class="check"><input type="checkbox" id="hasCurrent" ${f.hasCurrentPlan ? "checked" : ""}> ${T("Client has a current plan to compare")}</label>
      ${
        f.hasCurrentPlan
          ? `<div class="field-grid">
              <label>${T("Current product")} <input id="cpName" value="${esc(state.currentPlan.name)}" placeholder="${T("Name if known")}"></label>
              <label>${T("Sum assured")} <input id="cpSA" value="${esc(state.currentPlan.sumAssured)}"></label>
              <label>${T("Room / ward")} <input id="cpRoom" value="${esc(state.currentPlan.room)}"></label>
              <label>${T("Deductible")} <input id="cpDed" value="${esc(state.currentPlan.deductible)}"></label>
              <label>${T("Remaining term")} <input id="cpTerm" value="${esc(state.currentPlan.remainingTerm)}"></label>
              <label>${T("Premium")} <input id="cpPrem" value="${esc(state.currentPlan.premium)}"></label>
            </div>`
          : ""
      }
    </section>
    ${nav()}`;
}

function bindIntake() {
  const grab = () => {
    state.notes = document.getElementById("notes").value;
    state.fields.ageBand = document.getElementById("ageBand").value;
    state.fields.smoker = document.getElementById("smoker").value;
    state.fields.budget = document.getElementById("budget").value;
    state.fields.existingCover = document.getElementById("existingCover").value;
    state.fields.existingCoverType = document.getElementById("existingCoverType").value;
    state.fields.ownerType = document.getElementById("ownerType").value;
    state.fields.hasCurrentPlan = document.getElementById("hasCurrent").checked;
    if (state.fields.hasCurrentPlan) {
      state.currentPlan.name = (document.getElementById("cpName") || {}).value || "";
      state.currentPlan.sumAssured = (document.getElementById("cpSA") || {}).value || "";
      state.currentPlan.room = (document.getElementById("cpRoom") || {}).value || "";
      state.currentPlan.deductible = (document.getElementById("cpDed") || {}).value || "";
      state.currentPlan.remainingTerm = (document.getElementById("cpTerm") || {}).value || "";
      state.currentPlan.premium = (document.getElementById("cpPrem") || {}).value || "";
    }
  };
  ["notes", "ageBand", "smoker", "budget", "existingCover", "existingCoverType", "ownerType"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", grab);
    if (el) el.addEventListener("input", grab);
  });
  const hc = document.getElementById("hasCurrent");
  const aiBtn = document.getElementById("aiBtn");
  if (aiBtn)
    aiBtn.onclick = () => {
      state.notes = document.getElementById("notes").value;
      analyseWithAi();
    };
  if (hc)
    hc.addEventListener("change", () => {
      grab();
      draw();
    });
  document.querySelectorAll("[data-sample]").forEach((b) =>
    b.addEventListener("click", () => {
      const k = b.dataset.sample;
      state.notes = SAMPLES[k] || "";
      if (k === "keyman") {
        state.fields.ownerType = "company";
        state.fields.ageBand = "41–50";
        state.fields.smoker = "no";
        state.fields.existingCover = "unknown";
      }
      if (k === "ci") {
        state.fields.ownerType = "personal";
        state.fields.existingCover = "yes";
        state.fields.existingCoverType = "CI";
      }
      if (k === "vhis") {
        state.fields.ownerType = "personal";
        state.fields.ageBand = "31–40";
        state.fields.existingCover = "yes";
        state.fields.existingCoverType = "hospital / ward";
        state.fields.hasCurrentPlan = true;
        state.currentPlan.room = "ward";
      }
      draw();
    })
  );
  bindNav();
  document.getElementById("next").onclick = () => {
    grab();
    next();
  };
}

function laneView() {
  const r = state.result || { lanes: [] };
  return `
    <section class="card">
      <h2>${T("2. Lane")}</h2>
      <p class="hint">${T("Lock the product family before ranking. Multi-need notes can keep more than one lane. Override the auto pick.")}</p>
      <div class="lane-grid">
        ${(r.lanes || [])
          .map((l) => {
            const on = state.selectedLanes.includes(l.id);
            const auto = (r.autoLanes || []).includes(l.id);
            return `<button type="button" class="lane ${on ? "on" : ""}" data-lane="${esc(l.id)}">
              <div class="lane-t">${esc(l.label)}</div>
              <div class="lane-z">${esc(l.zh)}</div>
              <div class="lane-s">score ${l.score.toFixed(1)}${auto ? " · auto" : ""}</div>
              ${l.hits.length ? `<div class="lane-h">${l.hits.slice(0, 4).map(esc).join(" · ")}</div>` : ""}
            </button>`;
          })
          .join("")}
      </div>
      ${!state.selectedLanes.length ? `<p class="warn">No lane selected — ranking will mix families. Pick at least one.</p>` : ""}
    </section>
    ${nav()}`;
}

function bindLane() {
  document.querySelectorAll("[data-lane]").forEach((b) => b.addEventListener("click", () => laneToggle(b.dataset.lane)));
  bindNav();
}

function needsView() {
  const r = state.result || { needs: [] };
  const needs = r.needs || [];
  return `
    <section class="card">
      <h2>${T("3. Confirm needs")}</h2>
      <p class="hint">${T("These are need categories, not products. Uncheck anything the notes do not support. Don’t-push chips are shown so you do not confirm a contradiction.")}</p>
      ${state.aiBrief && state.aiBrief.summary ? `<div class="ai-card" style="margin-bottom:14px"><div class="sub">${T("AI read")}</div><p class="ai-sum">${esc(state.aiBrief.summary)}</p>${(state.aiBrief.missing || []).length ? `<div class="sub" style="margin-top:10px">${T("Still to ask")}</div><ul class="checks">${state.aiBrief.missing.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}</div>` : ""}
      ${
        needs.length
          ? needs
              .map((n) => {
                const on = state.confirmedNeeds.includes(n.id);
                return `<article class="need ${on ? "on" : ""}">
                  <label class="need-h"><input type="checkbox" data-need="${esc(n.id)}" ${on ? "checked" : ""}>
                    <span><b>${esc(window.I18N ? I18N.needLabel(n.id) : n.label)}</b> <span class="muted">${n.fromAi ? T("from AI read") : T("score") + " " + n.score.toFixed(1)}</span></span>
                  </label>
                  ${n.snippets.length && n.snippets[0] ? `<div class="snip">${T("From notes:")} “${esc(n.snippets[0])}”</div>` : ""}
                  <div class="chips">${(n.posHits || []).slice(0, 6).map((x) => `<span class="chip pos">${esc(x)}</span>`).join("")}</div>
                  ${n.negHits.length ? `<div class="chips" style="margin-top:8px">${n.negHits.map((x) => `<span class="chip neg">${esc(x)}</span>`).join("")}</div>` : ""}
                </article>`;
              })
              .join("")
          : `<p class="warn">${T("No category fired. Go back and use Analyse with AI, or continue and pick products by lane only.")}</p>`
      }
    </section>
    ${nav()}`;
}

function bindNeeds() {
  document.querySelectorAll("[data-need]").forEach((c) =>
    c.addEventListener("change", () => needToggle(c.dataset.need))
  );
  bindNav();
}

function productCard(p, opts = {}) {
  const on = state.picked.includes(p.productId);
  const leadOk = !p.hasWeakOnly && p.hasStrong;
  const trends = (p.matchedTrends || []).slice(0, 3);
  return `<article class="pcard ${on ? "on" : ""} ${p.hasWeakOnly ? "weak" : ""}">
    <div class="pcard-h">
      <div>
        <div class="pname">${esc(p.productName)}</div>
        <div class="pmeta">${esc(p.lane)} · ${esc(p.productType)} · score ${p.score.toFixed(1)}</div>
      </div>
      <div class="badges">
        ${leadOk ? `<span class="badge strong">can lead</span>` : `<span class="badge weak">verify first</span>`}
        ${p.hasWeakOnly ? `<span class="badge weak">weak evidence only</span>` : ""}
        ${p.coreHits ? `<span class="badge core">${p.coreHits} core</span>` : ""}
      </div>
    </div>
    <p class="best">${esc(p.bestFor)}</p>
    ${
      trends
        .map(
          (t) => `<div class="thit">
            <div class="thit-n">${esc(t.trendName)} <span class="badge ${t.evidenceStrength}">${esc(t.evidenceStrength)}</span></div>
            <div class="offers">${esc(t.whatProductOffers)}</div>
            ${t.snippet ? `<div class="snip">Matched: “${esc(t.snippet)}”</div>` : ""}
            <div class="quote"><span class="lab">Talking point</span>${esc(t.talkingPoint)}</div>
          </div>`
        )
        .join("")
    }
    ${p.negativeHits.length ? `<div class="chips">${p.negativeHits.map((x) => `<span class="chip neg">${esc(x)}</span>`).join("")}</div>` : ""}
    ${(p.notSuitedWhen || []).length ? `<ul class="list">${p.notSuitedWhen.slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${(p.gaps || []).length ? `<div class="note"><b>Source gaps:</b> ${esc(p.gaps.slice(0, 3).join(" · "))}</div>` : ""}
    ${
      opts.pick
        ? `<button class="btn ${on ? "" : "ghost"}" type="button" data-pick="${esc(p.productId)}">${on ? "Selected" : "Select for meeting"}</button>
           <a class="btn ghost" href="index.html#${esc(p.productId)}" target="_blank" rel="noopener">Open in library</a>`
        : `<a class="btn ghost" href="index.html#${esc(p.productId)}" target="_blank" rel="noopener">Open in library</a>`
    }
  </article>`;
}

function shortlistView() {
  const r = state.result || { shortlist: [] };
  const list = r.shortlist || [];
  const browse = r.browse || [];
  const others = (r.products || []).filter((p) => !list.some((x) => x.productId === p.productId) && p.score > 0.2).slice(0, 4);
  return `
    <section>
      <h2>4. Shortlist</h2>
      <p class="hint">Primary + challenger. Weak-evidence products cannot lead. Tick 2–3. The agent picks; the system does not lock.</p>
      ${state.aiBrief && state.aiBrief.summary ? `<div class="ai-card" style="margin-bottom:14px"><div class="sub">What the AI read</div><p class="ai-sum">${esc(state.aiBrief.summary)}</p></div>` : ""}
      ${
        list.length
          ? `<div class="pcards">${list.map((p) => productCard(p, { pick: true })).join("")}</div>`
          : browse.length
            ? `<div class="warn" style="margin-bottom:14px">The notes did not match a product signal. Showing the strongest products in <b>${esc((state.selectedLanes || []).join(", ") || "this lane")}</b> — browse and pick manually, or go back and use <b>Analyse with AI</b>.</div>
               <div class="pcards">${browse.map((p) => productCard(p, { pick: true })).join("")}</div>`
            : `<p class="warn">No lane selected. Go back and pick a lane.</p>`
      }
      ${others.length ? `<h3 class="sub" style="margin-top:22px">Outside the lane / lower score</h3><div class="pcards dim">${others.map((p) => productCard(p, { pick: true })).join("")}</div>` : ""}
    </section>
    ${nav(`<span class="muted">${state.picked.length} selected</span>`)}`;
}

function bindShortlist() {
  document.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => pickToggle(b.dataset.pick)));
  bindNav();
}


function snapProd(p) {
  if (!p) return null;
  const t = bestTrend(p);
  return {
    productId: p.productId || "",
    productName: niceName(p.productName),
    offer: reasonFor(p),
    evidenceStrength: t ? t.evidenceStrength : "",
    tradeoff: tradeoffFor(p),
  };
}

function snapshotFromState() {
  const plan = planSummary();
  const n = state.notes || "";
  const zh = /[\u4e00-\u9fff]/.test(n);
  const en = /[A-Za-z]{3,}/.test(n);
  return {
    catalogVersion: String((CATALOG && CATALOG.productCount) || 57),
    notes: state.notes,
    fields: state.fields,
    aiBrief: state.aiBrief,
    confirmedNeeds: state.confirmedNeeds,
    selectedLanes: state.selectedLanes,
    answers: state.answers,
    checks: state.checks,
    reasons: state.reasons,
    deferred: plan.deferred,
    language: zh && en ? "mixed" : zh ? "zh" : "en",
    moves: plan.moves.map((m) => ({
      lane: m.lane,
      title: m.title,
      plain: m.plain,
      chosen: snapProd(m.chosen),
      systemPick: snapProd((m.top || [])[0]),
      reason: (state.reasons || {})[m.lane] || "",
    })),
    finalText: state.finalText || meetingText(plan),
  };
}

function savePanel() {
  if (!state.finished) return "";
  if (state.replanOf) {
    return `<section class="card">
      <div class="line-diff"><b>Re-planning rev ${esc(String(state.loadedRev || 1))}.</b> Editing creates a new revision; the old one stays in the record.</div>
      ${state.saveError ? `<div class="warn">${esc(state.saveError)}</div>` : ""}
      <button class="btn" type="button" id="saveRevision" ${state.saveBusy ? "disabled" : ""}>${state.saveBusy ? "Saving…" : T("Save new revision")}</button>
      <a class="mini" href="clients.html#${esc(state.replanOf)}">Cancel</a>
    </section>`;
  }
  if (state.savedClientId) {
    return `<section class="card">
      <div class="line-ok"><b>${T("Saved and locked.")}</b> Follow-up is on the clients page.
        <a class="mini" href="clients.html#${esc(state.savedClientId)}">Open follow-up</a>
      </div>
      <p class="hint">This plan is frozen. New meeting = new client. Re-plan from the follow-up page if the brief changes.</p>
    </section>`;
  }
  const agent = state.agent;
  return `<section class="card">
    <h2>${T("Save for follow-up")}</h2>
    <p class="hint">Finish already copied the plan. Saving stores a frozen snapshot (encrypted on this Mac). The system never sends a message.</p>
    ${state.saveError ? `<div class="warn">${esc(state.saveError)}</div>` : ""}
    ${
      agent
        ? `<p class="cond">Signed in as ${esc(agent.name)} · ${esc(agent.email)} <button class="mini" type="button" id="wizLogout">Sign out</button></p>
           <label class="lab">Client display name (your label)
             <input id="saveName" placeholder="e.g. Mr Chan — house 10y" required>
           </label>
           <div class="grid2">
             <label class="lab">Phone label (optional) <input id="savePhone" placeholder="not a CRM record"></label>
             <label class="lab">Email label (optional) <input id="saveEmail" placeholder="not a CRM record"></label>
           </div>
           <label class="lab" style="display:flex;gap:8px;align-items:flex-start;margin-top:10px">
             <input type="checkbox" id="saveConsent" style="margin-top:4px">
             <span>I have the client's consent to store these meeting notes on this Mac for follow-up (365-day retention, delete any time). Health and money details are personal data.</span>
           </label>
           <button class="btn" type="button" id="saveClient" ${state.saveBusy ? "disabled" : ""}>${state.saveBusy ? "Saving…" : T("Save client")}</button>`
        : `<p class="hint">Guest can run the wizard. Saving needs an account on this Mac.</p>
           <div class="grid2">
             <form id="wizLogin">
               <div class="sub">Sign in</div>
               <label class="lab">Email <input name="email" type="email" required></label>
               <label class="lab">Password <input name="password" type="password" required></label>
               <button class="btn" type="submit">Sign in</button>
             </form>
             <form id="wizReg">
               <div class="sub">Register</div>
               <label class="lab">Name <input name="name" required minlength="2"></label>
               <label class="lab">Email <input name="email" type="email" required></label>
               <label class="lab">Password (8+) <input name="password" type="password" required minlength="8"></label>
               <button class="btn ghost" type="submit">Register</button>
             </form>
           </div>`
    }
  </section>`;
}

function pickedProducts() {
  const r = state.result || { products: [] };
  const byId = Object.fromEntries((r.products || []).map((p) => [p.productId, p]));
  return state.picked.map((id) => byId[id]).filter(Boolean);
}

function planSummary() {
  const moves = (state.moves || []).map((m) => {
    const chosen = m.chosen || m.top[0] || m.all[0];
    const t = bestTrend(chosen) || {};
    return {
      lane: m.lane,
      title: m.title,
      chosen,
      title: m.title,
      plain: m.plain || "",
      top: m.top || [],
      all: m.all || [],
      def: m.def,
      alternates: (m.top || []).filter((p) => p.productId !== chosen.productId),
      why: reasonFor(chosen),
      check: tradeoffFor(chosen),
      verify: ((window.I18N ? window.I18N.cTrend(chosen, t).prompts : t.verificationPrompts) || []).slice(0, 2),
      rows: t.comparisonRows || [],
      gaps: chosen.gaps || [],
    };
  });
  const covered = new Set();
  for (const m of moves) for (const n of state.confirmedNeeds || []) if (NEED_TO_LANE[n] === m.lane) covered.add(n);
  const deferred = (state.confirmedNeeds || []).filter((n) => !covered.has(n));
  return { moves, deferred, facts: planFacts() };
}

const FACT_Q = {
  age: "How old is he?",
  "smoker status": "Smoker or non-smoker?",
  "existing cover": "Which existing policies does he hold, and what do they cover?",
  "premium budget": "What monthly premium is comfortable?",
};

function narrowView() {
  const plan = planSummary();
  const groups = [];
  const factQs = plan.facts.unknown.map((u, i) => ({ id: "fact-" + i, q: T(FACT_Q[u] || u) }));
  if (factQs.length) groups.push({ title: T("Client facts"), qs: factQs });
  for (const m of plan.moves) {
    const qs = (m.verify || []).map((q, i) => ({ id: m.lane + "-v" + i, q }));
    if (qs.length) groups.push({ title: T(m.title) + " — " + pName(m.chosen), qs });
  }
  return `
    <section class="card">
      <h2>${T("5. Narrow")}</h2>
      <p class="hint">${T("Questions come from the picks you just made, not from a generic list. Answer what he already told you and leave the rest blank.")}</p>
      ${
        groups.length
          ? groups
              .map(
                (g) => `<div class="qgroup"><div class="sub">${esc(g.title)}</div>
                  ${g.qs
                    .map(
                      (x) => `<label class="lab">${esc(x.q)}
                        <input data-ans="${esc(x.id)}" value="${esc(state.answers[x.id] || "")}" placeholder="${T("Leave blank to skip")}"></label>`
                    )
                    .join("")}</div>`
              )
              .join("")
          : `<p class="muted">${T("Nothing left to ask — the notes covered every gate.")}</p>`
      }
    </section>
    ${nav()}`;
}
function bindNarrow() {
  document.querySelectorAll("[data-ans]").forEach((el) =>
    el.addEventListener("input", () => {
      state.answers[el.dataset.ans] = el.value;
    })
  );
  bindNav();
  document.getElementById("next").onclick = () => {
    document.querySelectorAll("[data-ans]").forEach((el) => {
      state.answers[el.dataset.ans] = el.value;
    });
    next();
  };
}

function compareView() {
  const plan = planSummary();
  if (!plan.moves.length) return `<section class="card"><h2>${T("6. Compare")}</h2><p class="warn">No moves yet — go back to Future state.</p></section>${nav()}`;
  const cur = state.currentPlan || {};
  const trendsOf = (p) => {
    const full = (CATALOG.products || []).find((x) => x.productId === p.productId);
    return (full && full.trends) || p.matchedTrends || [];
  };
  const rows = (p) => {
    const set = [];
    for (const t of trendsOf(p)) for (const r of t.comparisonRows || []) if (set.indexOf(r) < 0) set.push(r);
    return set;
  };
  const ROW_PAT = {
    premium: [/premium/i, /cost/i, /price/i],
    lifetime_limit: [/lifetime/i, /whole life/i, /benefit term/i],
    annual_limit: [/annual/i, /per year/i, /yearly/i, /limit/i],
    room_level: [/room/i, /ward/i, /hospital/i],
    ci_coverage: [/illness/i, /critical/i, /cover/i],
    waiting_period: [/waiting/i],
    renewability: [/renew/i],
    outpatient: [/outpatient/i, /follow/i],
    network_access: [/network/i, /cashless/i],
    add_ons: [/rider/i, /add-on/i],
  };
  const offerFor = (p, row) => {
    for (const t of trendsOf(p)) {
      if (/tax|deduct/i.test((t.trendName || "") + " " + (t.whatProductOffers || ""))) continue;
      if ((t.comparisonRows || []).indexOf(row) >= 0) {
        const z = window.I18N ? window.I18N.cTrend(p, t) : null;
        const txt = firstSentence((z && z.offers) || t.whatProductOffers || "");
        if (txt) return { text: txt, ev: t.evidenceStrength || "" };
      }
    }
    return null;
  };
  const cell = (p, row) => {
    const o = offerFor(p, row);
    if (!o) return `<span class="muted">${T("not in extract")}</span>`;
    const txt = o.text.length > 110 ? o.text.slice(0, 107) + "…" : o.text;
    return `${esc(txt)}<div><span class="badge ${esc(o.ev)}">${esc(T(o.ev))}</span></div>`;
  };
  const blocks = plan.moves
    .map((m) => {
      const alt = m.alternates.slice(0, 2);
      const all = [m.chosen].concat(alt);
      const outsideTop = !(m.top || []).some((p) => p.productId === m.chosen.productId);
      const rws = [...new Set(all.flatMap(rows))]
        .filter((row) => all.some((p) => offerFor(p, row)))
        .slice(0, 6);
      if (!rws.length) return "";
      return `<div class="qgroup">
        <div class="sub">${esc(T(m.title))}</div>
        ${outsideTop ? `<p class="hint">${window.I18N && I18N.isZh() ? "你從完整清單選擇了 " : "You picked "}<b>${esc(pName(m.chosen))}</b>${window.I18N && I18N.isZh() ? "。後面欄位是系統原本的建議，僅供比較。" : " from the full list. The columns after it are the system's original suggestions, shown only for comparison."}</p>` : ""}
        <div class="table-wrap"><table class="cmp">
          <thead><tr><th>${T("Dimension")}</th><th>${T("Your pick —")} ${esc(pName(m.chosen))}</th>${alt.map((p, k) => `<th>${T("Alt")} ${k + 1} — ${esc(pName(p))}${state.savedClientId ? "" : `<div><button class="mini" type="button" data-swap="${esc(m.lane)}:${esc(p.productId)}">${T("Use this instead")}</button></div>`}</th>`).join("")}</tr></thead>
          <tbody>
            ${rws
              .map((row) => {
                const curCell =
                  row === "premium" ? cur.premium : row === "room_level" ? cur.room : row === "annual_limit" ? cur.sumAssured : "";
                return `<tr><td>${esc(window.I18N ? I18N.rowLabel(row) : row.replace(/_/g, " "))}</td><td>${curCell ? `<div class="cond">${T("current plan:")} ${esc(curCell)}</div>` : ""}${cell(m.chosen, row)}</td>${alt.map((p) => `<td>${cell(p, row)}</td>`).join("")}</tr>`;
              })
              .join("")}
          </tbody>
        </table></div>
        <p class="hint"><b>${T("Why this one:")}</b> ${esc(m.why)}${m.check ? ` · <b>${T("Trade-off:")}</b> ${esc(m.check)}` : ""}</p>
        <div class="sub" style="margin-top:8px">${T("Flag what to verify")}</div>
        <div class="chips">${rws.map((row) => {
          const key = m.lane + ":" + row;
          const on = (state.checks || []).indexOf(key) >= 0;
          return `<button class="chip toggle ${on ? "pos" : ""}" type="button" data-check="${esc(key)}">${on ? "✓ " : ""}${esc(window.I18N ? I18N.rowLabel(row) : row.replace(/_/g, " "))}</button>`;
        }).join("")}</div>
        <label class="lab">${T("Why this pick — prints on the card")}
          <textarea data-reason="${esc(m.lane)}" rows="2" placeholder="${T("e.g. client wants the lowest premium that still covers cancer")}">${esc((state.reasons || {})[m.lane] || "")}</textarea>
        </label>
      </div>`;
    })
    .join("");
  const recRows = plan.moves
    .map((m) => {
      const sys = m.top[0];
      const changed = sys && sys.productId !== m.chosen.productId;
      return `<tr>
        <td>${esc(T(m.title))}</td>
        <td>${sys ? esc(pName(sys)) : "—"}</td>
        <td class="${changed ? "td-diff" : ""}">${esc(pName(m.chosen))}${changed ? ` <span class="badge weak">${T("changed")}</span>` : ` <span class="badge strong">${T("same")}</span>`}</td>
        <td>${sys ? esc(tradeoffFor(sys)) : ""}</td>
      </tr>`;
    })
    .join("");
  return `
    <section class="card">
      ${state.finished ? `<div class="line-ok" style="margin-bottom:12px"><b>Plan finished.</b> The summary was copied to the clipboard. <button class="mini" type="button" id="copyAgain">Copy again</button> <button class="mini" type="button" id="dlAgain">Download .txt</button> <button class="mini" type="button" id="newMeeting">New meeting</button></div>` : ""}
      <h2>${T("6. Compare")}</h2>
      <div class="sub">${T("System recommendation vs your pick")}</div>
      <div class="table-wrap"><table class="cmp rec">
        <thead><tr><th>${T("Move")}</th><th>${T("System suggested")}</th><th>${T("You picked")}</th><th>${T("Why the system suggested it")}</th></tr></thead>
        <tbody>${recRows}</tbody>
      </table></div>
      <p class="hint">${T("Where they differ, the system's suggestion stays visible so you can explain the change to the client.")}</p>

      <p class="hint">${T("Chosen vs the alternatives you did not pick, per move. Empty cells mean the brochure extract does not state it — they stay on the checklist.")}</p>
      ${blocks || '<p class="muted">No comparable dimensions in the extract for these picks.</p>'}
    </section>
    ${savePanel()}
    ${nav()}`;
}
function bindCompare() {
  document.querySelectorAll("[data-swap]").forEach((b) =>
    b.addEventListener("click", () => {
      if (state.savedClientId && !state.replanOf) return;
      const [lane, id] = b.dataset.swap.split(":");
      state.picks[lane] = id;
      syncPicked();
      draw();
    })
  );
  document.querySelectorAll("[data-check]").forEach((b) =>
    b.addEventListener("click", () => {
      const key = b.dataset.check;
      const at = (state.checks || []).indexOf(key);
      if (at >= 0) state.checks.splice(at, 1);
      else state.checks.push(key);
      draw();
    })
  );
  const nm = document.getElementById("newMeeting");
  if (nm)
    nm.onclick = () => {
      const agent = state.agent;
      state = blankState();
      state.agent = agent;
      draw();
    };
  const ca = document.getElementById("copyAgain");
  if (ca)
    ca.onclick = () => {
      try {
        const w = navigator.clipboard && navigator.clipboard.writeText(state.finalText || "");
        if (w && w.catch) w.catch(() => {});
      } catch {
        /* ignore */
      }
    };
  const da = document.getElementById("dlAgain");
  if (da)
    da.onclick = () => {
      const blob = new Blob([state.finalText || ""], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "meeting-plan.txt";
      a.click();
    };
  document.querySelectorAll("[data-reason]").forEach((el) =>
    el.addEventListener("input", () => {
      state.reasons[el.dataset.reason] = el.value;
    })
  );
  bindSave();
  bindNav();
}

async function apiJson(method, url, body) {
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

function bindSave() {
  const login = document.getElementById("wizLogin");
  if (login)
    login.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(login);
      const out = await apiJson("POST", "/api/login", { email: fd.get("email"), password: fd.get("password") });
      if (!out.ok) { state.saveError = out.error; draw(); return; }
      state.agent = out.agent;
      state.saveError = "";
      draw();
    };
  const reg = document.getElementById("wizReg");
  if (reg)
    reg.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(reg);
      const out = await apiJson("POST", "/api/register", { name: fd.get("name"), email: fd.get("email"), password: fd.get("password") });
      if (!out.ok) { state.saveError = out.error; draw(); return; }
      state.agent = out.agent;
      state.saveError = "";
      draw();
    };
  const lo = document.getElementById("wizLogout");
  if (lo)
    lo.onclick = async () => {
      await apiJson("POST", "/api/logout");
      state.agent = null;
      draw();
    };
  const rev = document.getElementById("saveRevision");
  if (rev)
    rev.onclick = async () => {
      state.saveBusy = true;
      state.saveError = "";
      draw();
      const out = await apiJson("POST", "/api/clients/" + state.replanOf + "/replan", { snapshot: snapshotFromState() });
      state.saveBusy = false;
      if (!out.ok) { state.saveError = out.error || "Save failed"; draw(); return; }
      state.savedClientId = out.client.id;
      state.loadedRev = out.client.planRev;
      state.replanOf = "";
      draw();
    };
  const btn = document.getElementById("saveClient");
  if (btn)
    btn.onclick = async () => {
      const displayName = (document.getElementById("saveName") || {}).value || "";
      const phoneLabel = (document.getElementById("savePhone") || {}).value || "";
      const emailLabel = (document.getElementById("saveEmail") || {}).value || "";
      const consent = !!(document.getElementById("saveConsent") || {}).checked;
      if (!consent) { state.saveError = "Consent is required to store meeting notes."; draw(); return; }
      state.saveBusy = true;
      state.saveError = "";
      draw();
      const out = await apiJson("POST", "/api/clients", {
        displayName,
        phoneLabel,
        emailLabel,
        consent: true,
        snapshot: snapshotFromState(),
      });
      state.saveBusy = false;
      if (!out.ok) { state.saveError = out.error || "Save failed"; draw(); return; }
      state.savedClientId = out.client.id;
      state.saveError = "";
      draw();
    };
}
function nextActions(plan) {
  const a = [];
  if ((plan.facts.unknown || []).indexOf("existing cover") >= 0) a.push("Retrieve his existing policy schedule before quoting anything.");
  for (const m of plan.moves) {
    const n = niceName(m.chosen.productName);
    if (m.lane === "term_life") a.push("Apply for " + n + " — underwriting and medical first.");
    else if (m.lane === "medical") a.push("Apply for " + n + " — confirm ward level and deductible.");
    else if (m.lane === "ci") a.push("Apply for " + n + " — confirm the illness list and waiting periods.");
  }
  if (plan.deferred.length) a.push("Deferred: " + plan.deferred.map((d) => d.replace(/_/g, " ")).join(", ") + " — raise at the next review.");
  a.push("Book the review in 12 months, or sooner if cover, dependants or income change.");
  return a;
}

function cardView() {
  const plan = planSummary();
  const acts = nextActions(plan);
  const verify = [];
  for (const m of plan.moves) {
    for (const v of m.verify || []) verify.push(niceName(m.chosen.productName) + ": " + v);
    for (const g of (m.gaps || []).slice(0, 1)) verify.push("Gap — " + niceName(m.chosen.productName) + ": " + g);
  }
  return `
    <section class="card meet">
      <h2>7. Meeting card</h2>
      <p class="hint">The plan you agreed, in order. No "best plan", no savings projections.</p>
      <div class="meet-body">
        <h3>Future state</h3>
        <p>Acting today, the first serious event is paid by a policy, not by his savings — and the house plan stays where it is.</p>

        <h3>The plan</h3>
        ${plan.moves
          .map(
            (m, i) => `<div class="planstep">
              <div class="planstep-h"><span class="stepno">${i + 1}</span><b>${esc(T(m.title))}</b></div>
              <p><b>${esc(pName(m.chosen))}</b> — ${esc(m.why)}</p>
              ${(state.reasons || {})[m.lane] ? `<p class="cond">Why we chose it: ${esc(state.reasons[m.lane])}</p>` : ""}
              ${m.check ? `<p class="cond">Check: ${esc(m.check)}</p>` : ""}
            </div>`
          )
          .join("") || '<p class="warn">No moves selected.</p>'}

        ${plan.deferred.length ? `<h3>Deferred</h3><ul class="checks">${plan.deferred.map((d) => `<li>${esc(d.replace(/_/g, " "))} — not covered today</li>`).join("")}</ul>` : ""}

        <h3>Next actions</h3>
        <ul class="checks">${acts.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>

        <h3>Verify before claiming</h3>
        <ul class="checks">${(state.checks || []).map((c) => `<li>Flagged: ${esc(c.split(":").slice(1).join(":").replace(/_/g, " "))} (${esc(c.split(":")[0])})</li>`).join("")}${verify.slice(0, 8).map((x) => `<li>${esc(x)}</li>`).join("") || ((state.checks || []).length ? "" : "<li>None listed</li>")}</ul>
      </div>
      <div class="wiz-nav">
        <button class="btn" type="button" id="copyCard">Copy meeting card</button>
        <button class="btn ghost" type="button" id="dlCard">Download .txt</button>
      </div>
    </section>
    ${nav()}`;
}
function meetingText(plan) {
  const L = [];
  L.push("AIA meeting card — plan (local matcher, not advice)");
  L.push("");
  L.push("Future state: acting today, the first serious event is paid by a policy, not the savings.");
  L.push("");
  L.push("THE PLAN");
  plan.moves.forEach((m, i) => {
    L.push(i + 1 + ". " + m.title + " — " + niceName(m.chosen.productName));
    L.push("   " + m.why);
    if (m.check) L.push("   Check: " + m.check);
    const rs = (state.reasons || {})[m.lane];
    if (rs) L.push("   Why we chose it: " + rs);
  });
  if (plan.deferred.length) {
    L.push("");
    L.push("DEFERRED: " + plan.deferred.map((d) => d.replace(/_/g, " ")).join(", "));
  }
  L.push("");
  if ((state.checks || []).length) {
    L.push("TO VERIFY");
    (state.checks || []).forEach((c) => L.push("- " + c.split(":").slice(1).join(":").replace(/_/g, " ") + " (" + c.split(":")[0] + ")"));
    L.push("");
  }
  L.push("NEXT ACTIONS");
  nextActions(plan).forEach((a) => L.push("- " + a));
  L.push("");
  L.push("Do not claim tax deductibility or eligibility unless confirmed outside this catalogue.");
  return L.join("\n");
}
function bindCard() {
  const plan = planSummary();
  const text = meetingText(plan);
  const copy = document.getElementById("copyCard");
  if (copy)
    copy.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = "Copied";
        setTimeout(() => (copy.textContent = "Copy meeting card"), 1500);
      } catch {
        copy.textContent = "Copy failed";
      }
    };
  const dl = document.getElementById("dlCard");
  if (dl)
    dl.onclick = () => {
      const blob = new Blob([text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "meeting-card.txt";
      a.click();
    };
  bindNav();
}
function pName(p) {
  if (!p) return "";
  const z = window.I18N && window.I18N.productName(p.productId, "");
  return z || niceName(p.productName);
}

function niceName(n) {
  const parts = String(n || "").split(" / ");
  if (parts.length < 2) return String(n || "");
  const [a, b] = parts;
  return b.toLowerCase().startsWith(a.toLowerCase()) ? b : a;
}

function firstSentence(t) {
  const txt = String(t || "").replace(/\s+/g, " ").trim();
  const m = txt.match(/^.{0,170}?[.!?](\s|$)/);
  return (m ? m[0] : txt).trim();
}

function bestTrend(p) {
  const clean = (t) => !/tax|deduct/i.test((t.trendName || "") + " " + (t.whatProductOffers || ""));
  const all = p.matchedTrends || [];
  const hit = all.find(clean) || all[0];
  if (hit) return hit;
  // No trend matched the note: use the product's own strongest non-tax trend
  // so the card still explains what the product does (and can be translated).
  const full = (CATALOG && CATALOG.products || []).find((x) => x.productId === p.productId);
  if (!full) return null;
  const rank = { strong: 3, medium: 2, weak: 1 };
  const strength = { core: 3, secondary: 2, minor: 1 };
  return (full.trends || [])
    .filter(clean)
    .slice()
    .sort((a, b) => (rank[b.evidenceStrength] || 0) - (rank[a.evidenceStrength] || 0) || (strength[b.trendStrength] || 0) - (strength[a.trendStrength] || 0))[0] || null;
}

function reasonFor(p) {
  const t = bestTrend(p);
  if (!t) return p.bestFor || "";
  const z = window.I18N ? window.I18N.cTrend(p, t) : null;
  return firstSentence((z && z.offers) || t.whatProductOffers);
}

function tradeoffFor(p) {
  const z = window.I18N ? window.I18N.zhProduct(p.productId) : null;
  const no = (z && z.summary && z.summary.notSuitedWhen) || p.notSuitedWhen || [];
  const gaps = (z && z.summary && z.summary.gapsInSourceMaterial) || p.gaps || [];
  return no[0] || gaps[0] || T("Confirm underwriting, premium and exclusions.");
}

function syncPicked() {
  const ids = [];
  for (const m of state.moves || []) {
    const id = state.picks[m.lane] || m.def;
    const p = (m.all || []).find((x) => x.productId === id) || (m.top || [])[0];
    if (p) {
      m.chosen = p;
      ids.push(p.productId);
    }
  }
  state.picked = ids;
}

function buildPlan() {
  runMatch();
  const b = state.aiBrief || {};
  const fromRules = ((state.result && state.result.needs) || []).map((n) => n.id);
  const needs = [...new Set([
    ...(state.confirmedNeeds || []),
    ...fromRules,
    ...((state.aiBrief && state.aiBrief.needs) || []),
  ])].slice();
  const goalText = state.notes + " " + ((b.searchTerms || []).join(" "));
  const hasGoal = /(house|flat|property|home|education|school fee|retire|retirement|deposit)/i.test(goalText);
  const hasHorizon = /(\b\d{1,2}\s*(?:year|years|yr|yrs)\b|10\s*年|十年|five years|ten years)/i.test(goalText);
  if (hasGoal && hasHorizon && needs.indexOf("savings_and_wealth_growth") < 0) needs.push("savings_and_wealth_growth");
  const text = state.notes + " " + ((b.searchTerms || []).join(" "));
  const lanesNeeded = [];
  for (const n of needs) {
    const lane = NEED_TO_LANE[n];
    if (lane && lanesNeeded.indexOf(lane) < 0) lanesNeeded.push(lane);
  }
  // A lane the agent chose is a floor: never silently drop it.
  for (const l of state.selectedLanes || []) if (lanesNeeded.indexOf(l) < 0) lanesNeeded.push(l);
  const ordered = STEP_ORDER.filter((l) => lanesNeeded.indexOf(l) >= 0).slice(0, 4);
  const res = window.AIAMatch.matchCatalog(CATALOG, text, state.fields, ordered.length ? ordered : undefined);
  const moves = [];
  for (const lane of ordered) {
    let pool = (res.products || []).filter((p) => p.lane === lane);
    if (!pool.length) continue;
    // A dated goal (house deposit, education) is not a retirement annuity.
    if (lane === "savings" && /house|flat|property|deposit|down ?payment|education|school fee|首期|買樓|教育/i.test(state.notes)) {
      const shortTerm = pool.filter((p) => !/annuity|retire|pension|deferred|whole life|legacy|estate/i.test((p.productName || "") + " " + (p.bestFor || "")));
      if (shortTerm.length) pool = shortTerm;
    }
    const bonus = (p) => (lane === "savings" && /savings/i.test(p.productName || "") ? 0.2 : 0);
    const ranked = pool.slice().sort((a, c) => c.score + bonus(c) - (a.score + bonus(a)));
    const top = ranked.filter((p) => !p.hasWeakOnly && p.score > 0.2).slice(0, 3);
    const picks = top.length ? top : ranked.filter((p) => !p.hasWeakOnly).slice(0, 3);
    moves.push({
      lane,
      title: STEP_TITLE[lane] || lane,
      plain: PLAIN[lane] || "",
      top: picks,
      all: ranked,
      def: (picks[0] || ranked[0]).productId,
    });
  }
  state.moves = moves;
  state.planResult = res;
  state.result = res;
  const keep = {};
  for (const m of moves) {
    const prev = state.picks[m.lane];
    keep[m.lane] = prev && m.all.some((p) => p.productId === prev) ? prev : m.def;
  }
  state.picks = keep;
  syncPicked();
}

function planFacts() {
  const p = (state.aiBrief && state.aiBrief.profile) || {};
  const n = state.notes || "";
  const known = [];
  if (p.ageBand && p.ageBand !== "unknown") known.push({ k: "Age", v: p.ageBand });
  if (/girlfriend|partner|married|wife|husband/i.test(n)) known.push({ k: "Household", v: "Partner, planning to live together" });
  if (/parents?\b/i.test(n) && /illness|sick|care/i.test(n)) known.push({ k: "Dependants", v: "Parents need care support" });
  if (/house|flat|property|home/i.test(n)) known.push({ k: "Goal", v: "Buy a home in ~10 years" });
  if (p.ownerType === "company") known.push({ k: "Policy", v: "Company-owned (keyman)" });
  const unknown = [];
  if (!p.ageBand || p.ageBand === "unknown") unknown.push("age");
  if (!p.smoker || p.smoker === "unknown") unknown.push("smoker status");
  if (!p.existingCover || p.existingCover === "unknown") unknown.push("existing cover");
  if (!p.budget || p.budget === "unknown") unknown.push("premium budget");
  return { known, unknown };
}

function candRow(m, p) {
  const on = (state.picks[m.lane] || m.def) === p.productId;
  const t = bestTrend(p);
  const ev = t ? t.evidenceStrength : "medium";
  return `<label class="cand${on ? " on" : ""}">
    <input type="radio" name="pick-${esc(m.lane)}" data-lane="${esc(m.lane)}" data-pick="${esc(p.productId)}"${on ? " checked" : ""}>
    <span class="cand-b">
      <span class="cand-n">${esc(pName(p))}${p.productId === m.def ? ' <span class="badge core">' + T("system pick") + '</span>' : ""}${on ? ' <span class="badge strong">' + T("your pick") + '</span>' : ""} <span class="badge ${esc(ev)}">${esc(ev)}</span>${p.hasWeakOnly ? ' <span class="badge weak">' + T("verify first") + '</span>' : ""}</span>
      ${t ? `<span class="cand-r"><b>${T("Fit:")}</b> ${esc((window.I18N ? window.I18N.cTrend(p,t).name : "" ) || t.trendName)}</span>` : ""}
      <span class="cand-r">${esc(reasonFor(p))}</span>
      <span class="cand-t">${T("Trade-off:")} ${esc(tradeoffFor(p))}</span>
    </span>
  </label>`;
}

function moveCard(m, i) {
  const c = m.chosen || m.top[0] || m.all[0];
  const t = bestTrend(c);
  const ev = t ? t.evidenceStrength : "medium";
  return `<article class="move">
    <div class="move-h"><span class="stepno">${i + 1}</span>
      <div><div class="move-t">${esc(T(m.title))}</div>
        <div class="move-p">${esc(pName(c))} <span class="badge ${esc(ev)}">${esc(ev)}</span></div>
      </div>
    </div>
    <p class="move-what">${esc(T(m.plain))}</p>
    <div class="sub">What this product actually does</div>
    <p class="move-offer">${esc(reasonFor(c))}</p>
    ${tradeoffFor(c) ? `<div class="note"><b>${T("Check:")}</b> ${esc(tradeoffFor(c))}</div>` : ""}
    ${(() => {
      const sys = m.top[0];
      if (!sys || sys.productId === c.productId) return `<div class="line-ok">${T("System pick and your pick agree.")}</div>`;
      return `<div class="line-diff"><b>${T("System suggested")}:</b> ${esc(pName(sys))} — ${esc(tradeoffFor(sys))}<br><b>${T("You picked")}:</b> ${esc(pName(c))} — ${esc(tradeoffFor(c))}</div>`;
    })()}
    <div class="sub" style="margin-top:14px">${T("Agent picks")} — ${m.top.length} ${T("suggested")}${m.all.length > m.top.length ? `, ${m.all.length} in this category` : ""}</div>
    <div class="cands">${m.top.map((p) => candRow(m, p)).join("")}</div>
    ${m.all.length > m.top.length ? `<details class="allbox"><summary>${T("Show all")} ${m.all.length} ${T("in this category")}</summary><div class="cands">${m.all.map((p) => candRow(m, p)).join("")}</div></details>` : ""}
  </article>`;
}

function futureView() {
  const plan = planSummary();
  const f = plan.facts;
  const n = state.notes || "";
  const care = /parents?\b/i.test(n) && /illness|sick|care/i.test(n);
  const house = /house|flat|property|home|deposit/i.test(n);
  const by = (lane) => plan.moves.find((m) => m.lane === lane);
  const nm = (lane) => {
    const m = by(lane);
    return m ? pName(m.chosen) : "";
  };

  const inForce = [
    by("term_life") ? (window.I18N && I18N.isZh() ? "收入保障" : "income cover") + " (" + nm("term_life") + ")" : "",
    by("ci") ? (window.I18N && I18N.isZh() ? "危疾一筆過賠償" : "a CI lump sum") + " (" + nm("ci") + ")" : "",
    by("medical") ? (window.I18N && I18N.isZh() ? "住院費用賠償" : "hospital reimbursement") + " (" + nm("medical") + ")" : "",
  ].filter(Boolean);

  const A = [
    T("Nothing is in force. The first serious illness is funded by savings, family, or a loan."),
    care ? T("Care costs keep drawing down the deposit — the goal moves further out.") : T("Savings absorb whatever the first event costs."),
    house ? T("The deposit arrives later or smaller. The risk never went away.") : T("The same exposure, just older and more expensive to insure."),
  ];
  const B = [
    inForce.length ? inForce.join(window.I18N && I18N.isZh() ? "、" : ", ") + (window.I18N && I18N.isZh() ? " — 有事時由保險賠付，而非動用儲蓄。" : " — an event pays out instead of the savings.") : T("No protection move selected yet."),
    care ? T("Parents' care comes from income, not the deposit.") : T("The first event no longer comes out of savings."),
    house && by("savings")
      ? (window.I18N && I18N.isZh() ? "首期按計劃由 " + nm("savings") + " 供款，保障同時生效。" : "Deposit funded on schedule by " + nm("savings") + ", with protection still running.")
      : house
        ? T("Deposit still on schedule, but nothing is funding it yet.")
        : T("Protection still running, at the age he locked in."),
  ];

  const periods = ["12 months", "5 years", "10 years"];
  const knownRows = f.known.map((x) => `<li><b>${esc(x.k)}</b> — ${esc(x.v)}</li>`).join("") || "<li>Nothing confirmed yet</li>";
  return `
    <section class="card">
      <h2>${T("4. Future state")}</h2>
      <p class="hint">${T("What he can be — protection only. Pick one product per move; the tracks and the card above update with your pick.")}</p>
      <div class="grid2">
        <div><div class="sub">${T("Confirmed")}</div><ul class="list">${knownRows}</ul></div>
        <div><div class="sub">${T("Not known yet")}</div><div class="chips">${f.unknown.map((x) => `<span class="chip neg">${esc(x)} — ${T("to confirm")}</span>`).join("") || `<span class="chip">${T("none")}</span>`}</div></div>
      </div>
    </section>
    <section class="card">
      <h2>${T("Two tracks")}</h2>
      <div class="tracks">
        <div class="track-head"></div>
        <div class="track-head bad">${T("If nothing changes")}</div>
        <div class="track-head good">${T("If we act in this meeting")}</div>
        ${periods.map((p, i) => `<div class="track-when">${T(p)}</div><div class="track-cell bad">${esc(A[i])}</div><div class="track-cell good">${esc(B[i])}</div>`).join("")}
      </div>
      <p class="hint" style="margin-top:12px">${T("Protection only. No savings projections — the savings move is described by what it does, not by a projected value.")}</p>
    </section>
    <section>
      <h2 style="margin:0 0 10px">${T("The moves")}</h2>
      <div class="moves">${plan.moves.map((m, i) => moveCard(m, i)).join("") || `<p class="warn">${T("No product matched. Go back and check the needs.")}</p>`}</div>
    </section>
    ${nav()}`;
}

function bindFuture() {
  document.querySelectorAll("input[data-pick]").forEach((el) => {
    el.addEventListener("change", () => {
      state.picks[el.dataset.lane] = el.dataset.pick;
      syncPicked();
      draw();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  bindNav();
}

function draw() {
  renderSteps();
  const panel = document.getElementById("panel");
  const views = [intakeView, laneView, needsView, futureView, narrowView, compareView];
  const binds = [bindIntake, bindLane, bindNeeds, bindFuture, bindNarrow, bindCompare];
  panel.innerHTML = views[state.step]();
  binds[state.step]();
}

async function boot() {
  try {
    CATALOG = await fetch("data/catalog.json", { cache: "no-store" }).then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  } catch (e) {
    document.getElementById("panel").innerHTML = `<div class="card"><b>Could not load catalog.json</b><div class="cond">${esc(e.message)}</div></div>`;
    return;
  }
  try {
    const me = await fetch("/api/me", { credentials: "same-origin" }).then((r) => r.json());
    if (me && me.ok) state.agent = me.agent;
  } catch { /* offline */ }
  await hydrateFromUrl();
  draw();
}

async function hydrateFromUrl() {
  const qs = new URLSearchParams(location.search);
  const cid = qs.get("client");
  if (!cid) return;
  let out;
  try {
    out = await fetch("/api/clients/" + encodeURIComponent(cid), { credentials: "same-origin" }).then((r) => r.json());
  } catch {
    return;
  }
  if (!out || !out.ok) return;
  const snap = out.snapshot || {};
  state.notes = snap.notes || "";
  state.fields = { ...state.fields, ...(snap.fields || {}) };
  state.aiBrief = snap.aiBrief || null;
  state.confirmedNeeds = snap.confirmedNeeds || [];
  state.selectedLanes = snap.selectedLanes || [];
  state.answers = snap.answers || {};
  state.checks = snap.checks || [];
  state.reasons = snap.reasons || {};
  runMatch();
  buildPlan();
  const picks = {};
  for (const m of snap.moves || []) if (m.chosen && m.chosen.productId) picks[m.lane] = m.chosen.productId;
  state.picks = { ...state.picks, ...picks };
  for (const m of state.moves) {
    const id = state.picks[m.lane];
    const p = (m.all || []).find((x) => x.productId === id);
    if (p) m.chosen = p;
  }
  syncPicked();
  state.finished = true;
  state.finalText = snap.finalText || meetingText(planSummary());
  state.loadedRev = out.client.planRev;
  const replan = qs.get("replan") === "1";
  if (replan) {
    state.replanOf = cid;
    state.step = 3;
  } else {
    state.savedClientId = cid;
    state.step = 5;
  }
}

window.addEventListener("langchange", () => { if (CATALOG && typeof draw === "function") draw(); });

boot();
