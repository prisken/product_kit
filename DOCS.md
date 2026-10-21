# AIA Meeting Wizard — system notes

_Last updated: 21 Oct 2026 · local build at `sales-kits/trends-review/`_

## 1. What this site is

A **first-meeting tool** for an AIA agent. It turns messy meeting notes into:

1. a read of what the client actually needs (not what he said he wants),
2. a **future state** — the same life events with and without cover,
3. a **sequenced plan** with a named product per move and the reasoning for it,
4. the open questions and the things to verify before anything is promised.

Design stance: **show the client what he can be, not what he is.** Protection only — no savings
projections, no illustrated returns, no tax claims.

Not in scope (deliberately, for now): follow-up cadence, premium quotes, policy servicing,
multi-meeting history.

## 2. How it runs

| Piece | Detail |
|---|---|
| Server | `serve_wizard.mjs`, node, `127.0.0.1:8899`, no dependencies |
| Portal | Control UI portal `p8899` → `http://127.0.0.1:59080` |
| Model call | **from the browser** to `api.deepseek.com` (CORS-allowed for this origin) |
| Key | `GET /api/local-key` (loopback only) hands the key to the page once → `localStorage` |
| Fallback | `POST /api/intake` on the server (often 407s — egress proxy credentials expire) |
| Watchdog | `watchdog.sh` + 15-min automation; restarts the server when the proxy rotates |
| Data | `data/catalog.json` — 57 AIA HK products, compiled from `data/*.json` |

Why the browser makes the call: the local egress proxy issues **short-lived credentials**.
A long-running daemon cannot keep one valid, so every server-side call eventually fails
with `CONNECT tunnel failed, 407`. The browser has no such proxy, so the call is stable.

## 3. The flow — six steps

### Step 1 — Intake
Input: free-text notes (English, Cantonese, mixed) + optional fields
(owner type, existing cover, age band, smoker, budget).

Output: an **AI brief**
```json
{
  "summary": "one or two neutral sentences",
  "lanes": ["term_life", "medical", "ci", "savings"],
  "needs": ["family_protection", "hospital_cost_protection", "critical_illness_readiness", "savings_and_wealth_growth"],
  "searchTerms": ["death benefit", "hospital cover", "critical illness", "savings plan"],
  "profile": { "ageBand": "", "smoker": "", "ownerType": "", "existingCover": "", "budget": "" },
  "missing": ["questions the agent still must ask"]
}
```
Model: `deepseek-chat`, temperature 0, JSON mode. The brief is a **translation layer** —
it converts the client's words into brochure vocabulary. It never picks a product.

### Step 2 — Lane
Which product families are in play: `term_life`, `medical`, `ci`, `savings` (also
`whole_life`, `accident`, `ilas`). Pre-selected from the brief, editable.

### Step 3 — Confirm needs
Need categories, not products. Each card shows the score, the phrase that matched, and
**don't-push** chips (contradictions). The agent unchecks what the notes don't support.
Everything downstream filters on this confirmed list.

### Step 4 — Future state  ← the core screen
**Confirmed / Not known yet** — facts vs gaps. Unknowns are chips, never assumptions.

**Two tracks** — `12 months · 5 years · 10 years`:
- *If nothing changes*: what the absence of cover does to savings and the house plan.
- *If we act*: names the actual products in force at each horizon, including the savings
  move at year 10 ("Deposit funded on schedule by <plan>, with protection still running").

**The moves** — one per lane, in order: income → hospital → CI → savings.
Each move shows:
- the chosen product, its **what this actually does** sentence,
- a **Check:** line (who it is wrong for / what is missing from the extract),
- `system pick` vs `your pick`, with a trade-off for each when they differ,
- 2–3 suggested candidates with **Fit** and **Trade-off**,
- **Show all N products in this category** for a manual choice.

Output: `state.moves[]` + `state.picks{}` — the spine for the rest.

### Step 5 — Narrow
Questions grouped by move, generated from **the chosen product's** verification points plus
the plan's unknowns (age, smoker, existing cover, budget). Answers are optional and stored
per question.

### Step 6 — Compare  ← last step
1. **System recommendation vs your pick** — table: Move · System suggested · You picked ·
   Why the system suggested it (with a `changed` badge).
2. **Per move** — chosen vs the alternatives you did not pick, dimension by dimension, with
   the product's actual offer text and an evidence badge. Rows nobody can answer are dropped.
3. **Actions** — `Use this instead` (swaps the pick and propagates), `Flag what to verify`
   (chips → card), `Why this pick` (free text → card).

**Finish** (the Continue button on this step) generates the plan summary, copies it to the
clipboard, and shows a Copy again / Download .txt banner. There is no step 7.

## 4. What it outputs

The finished plan text:
```
AIA meeting card — plan (local matcher, not advice)

Future state: acting today, the first serious event is paid by a policy, not the savings.

THE PLAN
1. Protect the income — EasyGuard Term Life Plan
   <what it does>
   Check: <trade-off>
   Why we chose it: <agent's reason>
2. Stop hospital bills eating savings — VHIS Privilege Ultra
3. Put a lump sum behind a diagnosis — Smart Elite Ultra CI
4. Fund the goal on a date — <savings plan>

DEFERRED: <confirmed needs with no product>

TO VERIFY
- annual limit (medical)
- waiting period (ci)

NEXT ACTIONS
- Retrieve his existing policy schedule before quoting anything.
- Apply for ... — underwriting and medical first.
- Book the review in 12 months ...
```

Also produced: the on-screen plan (printable) and the evidence trail behind every claim.

## 5. Data model

```js
state = {
  notes, fields,                 // raw input
  aiBrief,                       // step 1 output
  selectedLanes, confirmedNeeds, // steps 2–3
  moves: [{ lane, title, plain, top[], all[], def, chosen }],  // step 4
  picks: { [lane]: productId },  // agent's choices
  answers: {},                   // step 5
  checks: ["ci:waiting_period"], // step 6 flags
  reasons: { [lane]: "..." },    // step 6 notes
  finished, finalText
}
```

Product object (from the catalogue): `productId, productName, lane, productType,
bestFor, notSuitedWhen[], gaps[], trends[]` where each trend has `trendName,
whatProductOffers, keyFigures[], comparisonRows[], verificationPrompts[],
evidenceStrength, sourceEvidence[]`.

## 6. Rules the system enforces

- **Evidence gate** — a product whose evidence is weak (`hasWeakOnly`) can never be the
  default pick; it is labelled `verify first`.
- **No invented numbers** — amounts come from the notes or the brochure. Unknowns stay
  unknown and become questions.
- **No tax claims** — tax/deduction trends are filtered out of every client-facing string.
- **No savings projections** — the savings move is described by what it does, not by an
  illustrated value.
- **Deferred is visible** — a confirmed need with no product is listed, not dropped.
- **Weak or missing data degrades honestly** — "not in extract", never a guess.

## 7. Files

| File | Role |
|---|---|
| `wizard.html` | the six-step UI |
| `wizard.js` | state, steps, plan building, rendering |
| `matcher.js` | phrase matcher, lanes, needs, ranking, evidence gating |
| `prompt.js` | shared intake prompt + canonical lane/need lists |
| `serve_wizard.mjs` | static server, intake, local-key, health, follow-up APIs |
| `followup_store.mjs` | scrypt login, AES-GCM snapshots, sqlite, runbook, reengage |
| `clients.html` / `followup.js` | follow-up dashboard (copy-only drafts) |
| `FOLLOWUP_SPEC.md` | locked v1 spec |
| `restart_wizard.sh` / `watchdog.sh` | keep the server alive across proxy rotation |
| `data/catalog.json` | 57 products, compiled |
| `data/followup.sqlite` | encrypted client store (gitignored) |
| `index.html` | catalogue library (browse every product) |
| `compile_catalog.py` | rebuilds the catalogue from `data/*.json` |

## 8. Known limits

1. **No premium.** Budget is a comfort boundary (`too_tight / ok / flexible`), never a quote.
2. **Compare uses offer text**, not a normalised benefit table.
3. **Savings lane is thin** — ranks on goal language, not horizon maths.
4. **v1 is loopback-only.** Homemade login is acceptable because the server binds 127.0.0.1.
   Internet deploy needs a hosted auth provider.
5. **The system never sends.** “Sent” is an agent attestation.

## 9. Persistence + follow-up (shipped)

Finish copies the plan. **Save client** on Compare stores a frozen snapshot (consent required).
Wizard locks. Follow-up is a deterministic checklist: copy draft → you send it → mark Sent.
Sent schedules one reengage in 3 days (max 2). Done/Blocked cancels it. Gate D opens only with
a comfort answer **plus Done**. See `FOLLOWUP_SPEC.md`.
