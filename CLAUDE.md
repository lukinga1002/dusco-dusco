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
RLS disabled, hardcoded admin/JWT secret, anon key in client bundle, mock OTP, no consent
capture, no privacy notice, no retention/deletion, data hosted abroad (Supabase EU / Render
Frankfurt), no PDPC registration. Prefer fixes that close these.
