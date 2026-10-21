# Review — the two halves are now connected

_21 Oct 2026_

## Sign in

- **Email:** `demo@local.test`
- **Password:** `demo12345`
- Saved plan: **Mr Chan — house 10y** (4 moves, rev 1, 8 follow-up steps)

## The loop you can actually review

```
wizard ──Save client──▶ follow-up
   ▲                        │
   │                    Open plan ──▶ wizard, read-only, frozen picks
   └──── Re-plan ───────────┘         edit → Save new revision (rev 2)
```

- **Wizard** http://127.0.0.1:8899/wizard.html
- **Follow-up** http://127.0.0.1:8899/clients.html

Hard reload (**Cmd+Shift+R**).

## Click path

1. Follow-up → **Mr Chan — house 10y**.
2. **Open plan** → wizard opens on Compare with the saved products, locked.
3. Back → **Re-plan** → wizard opens on Future state, editable.
4. Change a pick → Continue → Compare → **Save new revision** → rev 2.
5. Follow-up now shows rev 2; the plan text is under **Plan as delivered**.

## What the seeded plan contains

```
term_life : EasyGuard Term Life Plan
medical   : AIA VHIS Flexi Scheme
ci        : AIA Assemble Critical Illness
savings   : Fortune Promise Savings Plan 2
```

Built from: *"Mr Chan 32, wants a house in 10 years with his girlfriend, worried
about hospital bills and cancer, parents are getting older, no insurance yet."*

## Follow-up behaviour

- **Copy draft** → clipboard, `draft_ready`
- **I sent this** → one reengage in 3 days (cap 2)
- **Done / Blocked** → cancels the pending reengage
- **Polish wording** → model rewrite → Use / Keep template
- Budget: Sent does not open Gate D; Done needs too tight / ok / flexible

## Proven in the browser

Open plan → step 5, frozen picks, 773→1,909-char plan · Re-plan → step 3, editable ·
Save new revision → rev 2, locked · no JS errors.

## Limits (deliberate)

Never sends. No sharing between agents. No mid-wizard save. Loopback login only.
No premium quotes. Polish falls back to the template if the model is down.
