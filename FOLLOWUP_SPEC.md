# Follow-up v1 — locked spec

_21 Oct 2026. This file wins over earlier pastes._

Local-only (127.0.0.1). Not internet-facing. v1 = one agent, no sharing.
The system **never sends** WhatsApp, SMS, email, or any DM. “Sent” is an agent attestation.

## Sequence

1. Persist wizard snapshot (login, client, lock, reopen, delete).
2. Deterministic checklist from gates. Copy-only drafts.
3. Reengage last, capped.

No LLM writes runbook steps. No homemade internet auth provider — local scrypt login is enough because the server binds loopback.

## Wizard handoff

Finish still copies the plan. **Save client** is a separate action on Compare.

Guest may run the whole wizard. Save requires login + consent. Mid-wizard save is out of v1 (do not show “wizard in progress”).

On save the wizard **locks**. Re-plan = new `planRev`, cancels open steps, generates a new runbook. Done/blocked history is kept.

### Snapshot (frozen)

```json
{
  "catalogVersion": "57",
  "planRev": 1,
  "savedAt": "ISO",
  "notes": "",
  "fields": {},
  "aiBrief": { "summary": "", "lanes": [], "needs": [], "searchTerms": [], "profile": {}, "missing": [], "model": "" },
  "confirmedNeeds": [],
  "selectedLanes": [],
  "answers": {},
  "checks": ["medical:annual_limit"],
  "reasons": { "term_life": "" },
  "deferred": ["legacy_and_estate"],
  "language": "en|zh|mixed",
  "moves": [{
    "lane": "term_life",
    "title": "Protect the income",
    "plain": "",
    "chosen": { "productId": "", "productName": "", "offer": "", "evidenceStrength": "", "tradeoff": "" },
    "systemPick": { "productId": "", "productName": "", "tradeoff": "" },
    "reason": ""
  }],
  "finalText": ""
}
```

Do not re-query the live catalogue as source of truth after save.

## Status machine

Exactly five statuses. No “Draft ready” as optional fluff — it is required.

| From | To |
|---|---|
| not_started | draft_ready, sent, done, blocked |
| draft_ready | sent, done, blocked |
| sent | done, blocked |
| done | _(terminal)_ |
| blocked | _(terminal)_ |

- **Copy draft** → at least `draft_ready`. Never sends.
- **Sent** = agent attests they sent it themselves.
- **Done** = this gate is satisfied. Cancels pending reengage for that gate.
- **Blocked** = cannot proceed. Cancels pending reengage. No reengage created.

Client-facing types (`ask`, `request_doc`, `verify`, `reengage`) may be Sent.
Internal type (`apply`) is Done/Blocked only.

## Gate D (budget)

Opens **only** when a structured comfort answer is stored **and** the budget step is **Done**.

Structured values: `too_tight | ok | flexible`.
Optional free text is labelled **not a quote**. Never treat a number as a premium.

**Sent never opens a gate.**

## Runbook generator

Deterministic. Stable `stepId`. Idempotent: saving twice must not duplicate.

| stepId | When | Type |
|---|---|---|
| `g:facts.age` | age band unknown | ask |
| `g:facts.smoker` | smoker unknown | ask |
| `g:facts.cover` | existing cover unknown | request_doc |
| `g:budget.comfort` | always | ask |
| `g:verify.{lane}.{row}` | each flagged check | verify |
| `g:deferred.{needId}` | each deferred need | ask |
| `g:apply.{lane}` | each chosen move | apply |
| `g:{root}:re:{n}` | created on Sent | reengage |

Regenerate = insert missing ids for this `planRev`. Never mint new ids for the same gate.

## Reengage

```
Sent + gate still open     → schedule exactly one reengage, due in 3 days
Done / Blocked on that gate → cancel pending reengage
Reengage Sent              → another reengage only after cooldown, cap at 2
Already a pending reengage → do not create another
```

Default wait **3 days**. Max **2** reengages per root gate. Never auto-send. Quiet hours are the agent’s problem because the system does not send.

## Drafts

Template-only, filled from the snapshot. Append:

`Not advice. AIA product information only. Not a quote. Not an approval.`

Denylist (strip / refuse): tax, deduct, guaranteed, approved, illustrated return, invented HKD amounts.

## PDPO minimum (local v1)

- Consent chip required on save.
- Snapshot encrypted at rest (AES-256-GCM, key in `.secrets.env`).
- DB file mode 0600.
- Retention 365 days, shown on the client.
- Delete client (hard) + access log.
- Access log: view, save, copy, status, delete.
- v1 no sharing.

## Launch DoD for this slice

- Register / login / logout on loopback.
- Save from Compare with consent; wizard locks.
- Reopen client, see frozen products (system vs pick preserved).
- Status transitions obey the table.
- Copy draft; Sent does not message anyone.
- Reengage scheduled on Sent, cancelled on Done, cap 2.
- Delete client.
- Footer on every draft.
