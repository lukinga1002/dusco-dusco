# Dusco — project instructions for Claude

Dusco is a Tanzanian consumer fintech (digital envelope savings). It processes
**sensitive personal data** under the Personal Data Protection Act, Cap. 44 (2023) —
the Act expressly classifies "financial transactions of the individual" as sensitive, so
balances, deposits, withdrawals and transactions are all sensitive data.

**Design everything in this repo for PDPA compliance by default.** Apply the standing
PDPA design instruction (also in `~/.claude/CLAUDE.md`):

- Lead with the 8 principles (s.5); minimize data; explicit recorded consent for sensitive
  data; security per s.27 (server-side secrets, RLS, MFA, rate-limiting, audit logging);
  retention + deletion (s.28); transborder caution (s.31–32); build data-subject rights
  (Part VI) from the start.
- Include a short **"PDPA notes"** block with any feature touching personal data.

See:
- `docs/PDPA_COMPLIANCE.md` — current risk assessment (R1–R12) and mitigations.
- `docs/CLAUDE_PDPA_INSTRUCTIONS.md` — the full operating instruction.

Known compliance gaps to keep front-of-mind (demo defaults that must change before launch):
**RLS disabled on all tables** (the largest one — design in `docs/RLS_DESIGN.md`, phase 1
prepared but not applied), hardcoded admin credential and JWT secret, mock OTP, data hosted
abroad (Supabase EU / Render Frankfurt), no PDPC registration, no DPO appointed. Prefer
fixes that close these.

Closed since: consent capture and withdrawal (append-only `consents` audit log), published
privacy notice, right of access/portability (`POST /api/account/export`), and erasure
(`DELETE /api/account`, implemented as anonymisation so the financial ledger survives).
See `docs/PDPA_COMPLIANCE.md` for what each still leaves open.

Correction to an earlier note: the anon key is **not** in the client bundle. Neither
`client/src` nor `client-v2/src` imports Supabase or depends on `@supabase/supabase-js`;
the browser only ever talks to the Express API. The key lives server-side
(`server/db/database.js`, Render env). The exposure is real but server-side, which is
exactly why the RLS design uses a service-role key plus deny-all rather than `auth.uid()`
policies — there is no Supabase Auth session to key policies off.
