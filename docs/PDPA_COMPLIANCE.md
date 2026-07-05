# Dusco — Tanzania Personal Data Protection Act (Cap. 44, 2023) Risk Assessment

> Scope: the Dusco Dusco app (React client + Express/Supabase backend, hosted on
> Netlify + Render + Supabase). This maps what Dusco collects against the Act and
> lists the risks **present today** with concrete mitigations. It is an engineering
> gap analysis, not legal advice — confirm specifics with a Tanzanian data-protection
> lawyer and the Personal Data Protection Commission (PDPC).

## What Dusco processes (data inventory)

| Category | Fields | Act classification |
|---|---|---|
| Identity | name, **phone number** (login identifier), password (bcrypt hash) | Personal data |
| Account | Dusco number (DUS-XXXXXX), verification status | Personal data |
| **Financial transactions** | deposits, withdrawals/sends, fees, dividends, amounts, **balances per bahasha**, source/destination **phone numbers**, networks, references, timestamps | **SENSITIVE personal data** — s.3 expressly lists "financial transactions of the individual" |
| Savings profile | bahasha names, percentages, goals/targets, lock dates | Personal data (can reveal aspirations/intent) |
| Group (Chama) | membership, role, shares ledger (per-member contributions) | Personal data of multiple subjects |
| Notifications | in-app messages containing amounts/destinations | Sensitive (derived from financial data) |
| Hosting location | Supabase `eu-west-1` (Ireland), Render Frankfurt (EU), Netlify global CDN | Triggers **transborder** rules (Part V) |

Because financial-transaction data is **sensitive**, the strictest obligations in the
Act apply across almost the whole app.

---

## Risks present today & mitigations

### CRITICAL

**R1 — Processing sensitive data without consent (s.30, principle 5(a))**
The Act prohibits processing sensitive personal data "without obtaining prior written
consent of" the data subject. Dusco processes financial-transaction data but captures
**no consent** at sign-up.
- **Mitigation:** Add an explicit, unbundled **consent step in registration** ("I consent
  to Dusco processing my financial-transaction data to operate my savings envelopes")
  with a linked Privacy Notice; store consent (version, timestamp, IP) per user; block
  onboarding until given; allow withdrawal of consent. Treat consent as a first-class
  record in the DB (`consents` table).

**R2 — Operating without registration as a data controller/processor (s.14–16, s.19)**
Controllers/processors must register with the PDPC (5-year registration); operating
unregistered is an **offence**. Dusco is not registered.
- **Mitigation:** Register Dusco as a data controller (and GCA Pay/Supabase/Render as
  processors) with the PDPC **before public launch**; keep the certificate and renew
  within 3 months of expiry. Pre-launch blocker, not code.

**R3 — Secrets & access controls weak for sensitive data (s.5(g), s.27)**
Current state: JWT secret defaults to a hardcoded string; Supabase **RLS is disabled**
and the anon key + project URL ship in the client bundle; admin login is hardcoded
(`admin`/`dusco2024`); OTP is mocked (any 4 digits); no rate limiting. For *sensitive*
data the Act demands "appropriate technical or organisational measures."
- **Mitigation:** Move all secrets to server-side env with strong rotated values; never
  expose service keys client-side; **re-enable RLS** and enforce per-user row access at
  the database (defence in depth behind the API); replace hardcoded admin with hashed
  credentials + 2FA; integrate a real OTP/SMS provider; add rate limiting and lockout on
  auth + money endpoints; enforce HTTPS/HSTS; encrypt at rest (Supabase default) and in
  transit (already TLS).

### HIGH

**R4 — Transborder transfer without an adequacy basis (s.31–32, principle 5(h))**
All data is stored/processed **abroad** (EU/global). Transfer is only lawful to a state
with an adequate level of protection, or under the specific conditions in s.32 (incl.
data-subject consent or contractual safeguards).
- **Mitigation:** Document a transborder-transfer basis: assess adequacy of the hosting
  region, sign **Data Processing Agreements** with Supabase/Render/Netlify, and capture
  the user's informed consent to cross-border processing in the Privacy Notice. Prefer a
  Tanzania/Africa region or on-shore hosting where feasible.

**R5 — No breach-notification capability (s.27(5))**
The controller "shall notify the Commission, without any undue delay, of any security
breach." Dusco has no detection, logging, or notification process.
- **Mitigation:** Add structured audit logging of access to sensitive data, alerting on
  anomalies, an incident-response runbook, and a documented breach-notification path to
  the PDPC (and affected users).

### MEDIUM

**R6 — No Data Protection Officer (s.27(3))** — appoint a DPO responsible for control/security
measures; record their contact in the Privacy Notice.

**R7 — Retention & disposal undefined (s.28, principle 5(e))** — data is kept indefinitely
and there is no account deletion. Define a retention schedule per data category, implement
secure disposal jobs, and add **"Delete my account & data"** (with legal-hold exceptions).

**R8 — Data-subject rights not implemented (Part VI, s.33–38)** — no data **access/export**,
limited rectification (name only), no **erasure**, no object-to-processing, no
direct-marketing opt-out, no transparency around any automated decisions (e.g. dividend
allocation). Build a **"Privacy & My Data"** area: download my data (JSON/PDF), correct
details, object/restrict, delete, and a rights-request inbox with statutory timelines.

**R9 — Purpose limitation & minimization (5(b),(c))** — Dusco stores **third parties' phone
numbers** (sender on deposit, recipient on send) and the admin panel can view every user's
full profile/transactions. Minimize: mask/limit stored counterparties, restrict admin views
to what's necessary, add admin access logging and role scoping.

**R10 — Transparency / privacy notice (5(a), s.22–23)** — the landing page has only a
placeholder "Privacy" link. Publish a real Privacy Notice at collection (what, why, legal
basis, retention, transborder, rights, DPO contact) and link it from sign-up and the footer.

### LOW / WATCH

**R11 — Notice to third parties whose data is collected (s.23)** — sender/recipient numbers
belong to people who never signed up; note this basis or avoid storing identifiable
counterparty data.

**R12 — Children's data is sensitive (s.3)** — add age affirmation at sign-up; if under-18
flows are ever needed, apply heightened protection/guardian consent.

---

## Priority order for launch

1. R1 consent + R10 privacy notice (cheap, unblocks lawful basis)
2. R3 secrets/RLS/admin/OTP/rate-limit hardening (engineering)
3. R2 PDPC registration + R4 transborder DPAs/consent (legal/ops)
4. R5 breach logging/notification, R7 retention + deletion, R8 DSAR tooling
5. R6 DPO, R9 minimization, R11–R12 edge cases

> Note: items R2, R4 (registration, DPA signing, region choice) and R6 (DPO) are
> organisational/legal and sit with the business, not in code.
