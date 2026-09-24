# Dusco Partnership Pack — Analyst Notes

**Companion to:** `DUSCO_BUSINESS_PLAN.md`
**Prepared by:** Larson Consulting (Dusco) — analyst review
**Date:** July 2026
**Status:** Internal — not for circulation to GCA Pay

This file holds three internal outputs that support the revised partnership pack:
Output 2 (change log), Output 3 (technical implementation validation checklist, based on code
inspection), and Output 4 (open questions the founder must answer before sending). The revised
business plan itself is Output 1 (`DUSCO_BUSINESS_PLAN.md`).

---

## Output 2 — Change log (what changed and why)

| # | Change | Why |
|---|---|---|
| 1 | Title changed to "Partnership Pack & Commercial Case"; "Prepared by" now **Larson Consulting (Dusco)** | Positions Dusco correctly as a product under a registered company, not a loose startup. Sets an institutional tone. |
| 2 | New **Section 2 — Operating and regulatory structure** | Core fix. States explicitly that Dusco does **not** hold funds or take deposits; defines the three roles (Dusco/Larson = tech layer; GCA Pay = payments/settlement; licensed bank = custody). Adds BoT licensing, KYC/AML, PDPA, settlement/reconciliation posture. |
| 3 | Reframed regulatory/float language throughout | Removes any impression of unlicensed deposit-taking; float is repeatedly labelled conditional upside, not base revenue. |
| 4 | Removed overstated claims: "already built and deployed", "live and demonstrable", "webhook is live and tested" | These overstated readiness. Replaced with precise, code-verified language: built and tested **against a mock harness**, **no live transactions**, inbound **simulated pending GCA Pay**. |
| 5 | New **Section 6 — What is actually built today** | Honest four-tier status of features, mirroring the technical validation checklist. Prevents the plan from claiming anything the repo does not support. |
| 6 | Rewrote go-to-market (Section 5) into **pilot-first, 4 phases** with a full **pilot KPI list** | Replaces vague "first thousands of users" with 10 users + 1 kikoba, measurable gates, and Phases 2–4 (community → group-led scale → employer/payroll). |
| 7 | Added **A10 — pilot validation gate**; kept **A2 = TZS 50,000** conservative; added explicit note that TZS 100,000+ is pilot-validation upside only | Stops the model from front-running unproven deposit sizes; makes scale scenarios explicitly contingent on the pilot. |
| 8 | Relabelled projections (Section 10) as **post-pilot scale scenarios**, contingent on A10 | Prevents scale numbers from being read as forecasts of current/pilot state. |
| 9 | New **Section 11 — Revised unit economics** | Keeps the honest 0.6% finding but reframes it professionally: 0.6% is a placeholder; asking for a partnership rate; target is neutral-at-low-volume improving with scale; float is upside, not foundation. |
| 10 | Split **Section 12 — cost model** into **lean pilot model** vs **scaled model** | Removes the impression that the TZS 73.3M base is funded or comfortable. Adds pilot cost categories (integration, compliance docs, security hardening, onboarding, manual support, reconciliation testing, founder-led ops). Labels scaled model "not currently funded". |
| 11 | Expanded the ask (Section 13) from **4 points to 8** | Adds account-reference confirmation (per user and per group), channel coverage, operational parameters (limits/failures/reversals/settlement/reconciliation), commercial terms, funds-holding-structure support, DPA + security requirements, and a written division of responsibilities. |
| 12 | Strengthened **Section 8 — Market context** with `[Insert current verified statistic and source]` placeholders | No invented statistics; named sources (BoT, TCRA, FinScope) with explicit fill-in slots. |
| 13 | Updated risks (Section 14) and roadmap (Section 15) | Adds funds-custody and "no live traction yet" risks; roadmap now pilot-gated and states security items as pre-pilot work; "receive from any network" reframed as dependent on GCA Pay. |
| 14 | Added disclaimer lines on contingency of scale scenarios, statistic placeholders, and float licensing | Keeps the whole document defensible to a compliance reader. |

---

## Output 3 — Technical implementation validation checklist (code-inspected)

**Legend:** ✅ Built and verified · 🟡 Partially built · 🔵 Concept / business-rule only ·
🔗 Dependent on GCA Pay / bank partner

| # | Feature | Status | Evidence | File path | Open action |
|---|---|---|---|---|---|
| 1 | One Dusco number per user | ✅ Built and verified | Register issues a unique Dusco number per user | `server/routes/auth.js` | Test against sandbox after GCA access |
| 2 | One Dusco number per group / kikoba | ✅ Built and verified | Group create assigns `dusco_number` | `server/routes/groups.js` | Test against sandbox after GCA access |
| 3 | Auto-split incoming funds by user-defined % | ✅ Built and verified | `applyIncomingCollection` + deposit route; rounding-safe split | `server/services/deposits.js`, `server/routes/transactions.js` | Validate with real inbound payloads |
| 4 | Receive money from any network / bank | 🔵 Concept + 🔗 dependent | Split + webhook logic built; inbound is **simulated** ("Demo — simulate an incoming transfer") | `client/src/components/DepositModal.jsx` | Confirm account-reference model with GCA Pay; go live via sandbox |
| 5 | GCA Pay adapter | 🟡 Built against mock | Real+mock adapter; `isLive()` gates on env keys | `server/services/gcapay.js` | Live path untested — verify vs real sandbox; lock field/endpoint names |
| 6 | Webhook endpoint | 🟡 Built against mock | HMAC-SHA256 verify, 401 on bad sig, idempotent via `webhook_events` | `server/routes/webhooks.js` | Validate with real GCA payload; confirm signature scheme/header |
| 7 | Mock transaction testing | ✅ Built and verified | Mock harness; tested 200/401/duplicate | `server/services/payment.js`, `docs/GCA_PAY_INTEGRATION.md` | None for demo |
| 8 | Deposit reconciliation logic | 🟡 Partially built | Ledger + references + webhook idempotency; **no** formal reconciliation report | `server/routes/webhooks.js`, `server/routes/transactions.js` | Build reconciliation view/job (poll `getTransactionStatus`) |
| 9 | Disbursement / withdrawal logic | 🟡 Built against mock + 🔗 | Withdraw routes; fee-inclusive | `server/routes/transactions.js`, `server/routes/groups.js` | Live payout depends on GCA Pay |
| 10 | Fee display before confirmation | ✅ Built and verified | Fee/net shown before confirm; withdraw fee-preview endpoint | `client/src/components/DepositModal.jsx`, `SendModal.jsx`, `server/routes/transactions.js:154` | None |
| 11 | Cross-network deposit fee: 1%, min TZS 500 | ✅ Built and verified | `Math.max(500, round(amt*0.01))`; server mirrors | `client/src/components/DepositModal.jsx:23`, `server/services/deposits.js` | None |
| 12 | Withdrawal fee: 1%, floor 500, cap 5,000 | ✅ Built and verified | `Math.max(500, Math.min(round(amount*0.01), 5000))` | `server/routes/transactions.js:15` | None |
| 13 | 90-day withdrawal-fee waiver | ✅ Built and verified | `heldDays >= 90 → return 0`; wired via earliest `held_since` | `server/routes/transactions.js:10–16, 82–84` | Test against sandbox deposits after GCA access |
| 14 | Envelope locking until a date | ✅ Built and verified | Lock/unlock + early-unlock 2% penalty; lock icon | `server/routes/wallets.js`, `client/src/components/BahashaCard.jsx` | None |
| 15 | Savings goals + progress tracking | ✅ Built and verified | `goal_name`/`goal_amount` + progress UI | `server/db/schema.sql`, `client/src/pages/Manage.jsx`, `FlipBahashaCard.jsx` | None |
| 16 | Group envelopes | ✅ Built and verified | `group_bahashas` table + routes | `server/db/schema.sql`, `server/routes/groups.js` | None |
| 17 | Group member contribution tracking | ✅ Built and verified | Contribute endpoint + `group_transactions` | `server/routes/groups.js` | None |
| 18 | Member contribution / share ledger (group accounting) | ✅ Built and verified | `group_shares` table + summary | `server/routes/groups.js` | None (labelled "internal group accounting" in plan) |
| 19 | Privacy-by-default balance hiding | ✅ Built and verified | Per-card flip; blurred total default-hidden | `client/src/components/FlipBahashaCard.jsx`, `client/src/pages/Dashboard.jsx` | None |
| 20 | User consent flow | 🔵 Concept only | No consent capture in app; "consent" only in PDPA **docs** | *(not in app code)* | Build recorded consent (purpose, version, timestamp) before live pilot |
| 21 | Privacy notice availability | 🔵 Concept only | Placeholder "Privacy" link only; no actual notice | `client/src/pages/Landing.jsx` | Publish a real privacy notice at collection |
| 22 | Data-processing readiness for GCA Pay | 🔗 dependent + 🟡 | Adapter/webhook built; **no signed DPA**; hardening open | `server/services/gcapay.js`, `docs/PDPA_COMPLIANCE.md` | Sign DPA; close hardening; document data flows |
| 23 | Admin dashboard / reconciliation view | 🟡 Partially built | Dashboard + all-transactions log + user detail; not a true reconciliation tool | `server/routes/admin.js` | Add reconciliation view; replace single-credential admin |
| 24 | Failed-transaction handling | 🟡 Partially built | Webhook sets disbursement `failed`; status enum exists; no user-facing retry | `server/routes/webhooks.js:91`, `server/services/payment.types.js` | Add retry/failed UX + reconciliation of failures |
| 25 | Reversal handling | 🔵 Concept only | `'reversed'` in status enum only; **no reversal logic** | `server/services/payment.types.js:13` | Define reversal flow with GCA Pay; implement |
| 26 | Settlement-status tracking | 🟡 Partially built + 🔗 | `status` field + webhook status updates; no settlement report | `server/routes/webhooks.js`, `server/db/schema.sql` | Build settlement tracking against GCA Pay reports |
| 27 | Audit trail / logs | 🟡 Partially built | Transactions ledger + `webhook_events`; **no** admin-action audit log | `server/routes/webhooks.js`, `server/db/schema.sql` | Add admin/action audit logging |
| 28 | RBAC (admin / group treasurer) | 🟡 Partially built | Group roles enforced; **admin panel = single hardcoded credential** | `server/routes/groups.js:172,229`, `server/routes/admin.js:16` | Implement real admin RBAC; remove hardcoded creds |
| 29 | Security hardening (open items) | 🔵 Open | Database security config, hardcoded secrets, client-side key, mock OTP | `server/.env`, `server/routes/admin.js`, `client/src/pages/VerifyOtp.jsx` | Close all before live pilot — pre-pilot gate |
| 30 | Anything the plan calls "live/built/tested/demonstrable" | Corrected | Deployed build + mock-tested adapter/webhook are real; "receive from any network" is simulated | `docs/DUSCO_BUSINESS_PLAN.md` (Sec 4, 6, 15) | Wording fixed (done) |

**Wording changes made where claims were overstated (all applied to `DUSCO_BUSINESS_PLAN.md`):**
- "The product is already built and deployed / integration written and tested" → "working build
  deployed for demonstration; adapter and webhook tested **against a mock harness**; no live
  transactions."
- "Receive from anywhere — it just works" → "depends on GCA Pay; currently **simulated** pending
  sandbox and account-reference confirmation."
- "The experience is live and demonstrable today" → removed; replaced with the Section 6 status.
- "webhook is live and tested" → "built and tested against a mock harness."
- Roadmap "Now: demo live" → "working build deployed; **no live transactions**; 10 users + 1
  group in pipeline."

---

## Output 4 — Open questions the founder must answer before sending

**Regulatory / structure**
1. Is there already a candidate **bank or licensed institution** for funds custody, or is
   identifying one part of what we are asking GCA Pay to help with? (Section 2 currently implies
   the latter.)
2. Has Larson Consulting taken any **BoT / regulatory advice** on whether this structure needs
   a payment-system licence, an EMI-type arrangement, or only rides on partners' licences?
3. Who holds **KYC/AML responsibility** in your intended structure — Dusco, GCA Pay, or the
   bank? The plan asks GCA Pay to confirm, but do you have a preferred position?

**Commercial / assumptions**
4. Is the **0.6%** figure something GCA Pay quoted, or purely our placeholder? (Affects how
   Section 11 is phrased in the room.)
5. Are you comfortable disclosing the **thin-margin analysis** (Section 11) to GCA Pay, or do
   you want a partner-facing edition that keeps the volume/opportunity case but trims the full
   P&L? (Same question we flagged previously.)
6. Do you have **real pilot cost quotes** (hosting tier, any legal/PDPC fees, SMS/OTP pricing)
   to replace the "[confirm]" placeholders in the lean pilot cost table?

**Pilot facts (so we do not overstate)**
7. Are the **10 individual users and 1 kikoba** confirmed and ready, or "nearly ready"? The plan
   says "in the onboarding pipeline" — is that accurate?
8. Roughly what monthly deposit do you genuinely expect from these pilot users? (Stays out of
   the model per A2, but useful context for the meeting.)

**Technical / pre-pilot**
9. Confirm you accept that the **security items (RLS, hardcoded secrets, mock OTP, admin RBAC)**
   must be closed before any *live* pilot — this is stated as a pre-pilot gate in Sections 12/15.
10. Do you want the **consent flow and privacy notice** (currently concept-only, items 20–21)
    built before the pilot, given financial data is sensitive under PDPA?

**Document logistics**
11. Who is the **named GCA Pay recipient**, and should the pack carry Larson Consulting's
    letterhead/logo and a signatory name?
12. Should the **market statistic placeholders** (Section 8) be filled before sending, or sent
    with a note that verified figures follow? (Recommendation: fill them — a payments partner
    will notice empty brackets.)
