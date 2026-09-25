# Parked work

Deliberately deferred, with the reason and what it would take to pick up. Kept so that
decisions are not silently lost and do not have to be re-derived later.

---

## Savings reminders — parked 2026-09-25

**Why parked:** it is a retention feature, and retention only matters once the payment loop
is real. Revisit after the payment partner is chosen and the pilot has run.

**Where it came from:** designed in Base44 (`Add savings reminders and update dashboard UI`).
The landing redesign from the same batch was ported; this was not.

**Why it could not simply be ported:** it runs on Base44's own backend, which this stack does
not have —

- `base44/entities/BahashaReminder.jsonc` — a Base44 database entity
- `base44/functions/reminderSettings/entry.ts` — a Base44 serverless function
- `base44/functions/sendSavingsReminders/entry.ts` — the sender
- `base44/workflows/SavingsReminders.jsonc` — a Base44 scheduled workflow
- `src/components/dusco/reminders/useReminders.js` — calls `base44.functions.invoke(...)`

Dropped into Express/Supabase/Render as-is, it would render a settings card whose every save
fails silently. The Settings copy promising email reminders was left out for the same reason:
it would be a promise the product cannot keep.

**What it needs to be built here:**

| Piece | Status |
|---|---|
| `bahasha_reminders` table in Supabase | straightforward |
| Endpoints on the Express API | straightforward |
| A scheduler to send on time | **missing** — Render's free tier has no cron |
| An email or SMS provider | **missing** — nothing wired up; SMS costs per message in Tanzania |

The two missing pieces are the real decisions: they cost money and add an external dependency,
so they are worth making once, deliberately, rather than in passing.

**The UI already exists** in the Base44 repo (`lukinga1002/dusco`) and can be lifted once the
backend is real — only `useReminders.js` would need rewriting against the Dusco API.

---

## Phase 2 RLS — per-user isolation

See `docs/RLS_DESIGN.md` §6. Parked until after the pilot: it means replacing PostgREST with a
pooled `pg` client and rewriting every query, and Phase 1 already removes the actual exposure.
