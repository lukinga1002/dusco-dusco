# Dusco — Partnership Pack & Commercial Case

**Prepared for:** [Partner]
**Prepared by:** Larson Consulting (Dusco)
**Date:** July 2026
**Status:** Confidential — for partnership discussion

---

> **Before sending:** replace every `[Partner]` with the recipient's name. This pack is
> written to be provider-agnostic — Dusco has not committed to any one payment partner, and
> the commercial terms in Section 11 are open. Nothing here names or favours a particular
> provider, so the same document can go to any of them.

## A note on how to read this document

This is a partnership pack for a payments partner, not an equity fundraise. We are asking to
integrate, not to raise money. Its purpose is narrow and practical: to secure sandbox
credentials, confirm that Dusco's account-reference model is technically supported on your
rails, agree commercial terms, and move to a controlled live pilot.

We have written it to be checked, not admired. Every projection rests on an assumption, and
every assumption is stated in one place (Section 9) so you can challenge it or replace it with
your own figures. Where we do not yet have a verified number — your per-transaction rate, our
final unit costs — we say so rather than present a guess as a fact. Market figures (Section 8)
are drawn from Bank of Tanzania, TCRA, and FinScope Tanzania sources as reported and should be
re-confirmed against the primary publications before wider external circulation.

Two things are important to state at the outset, because they frame everything below:

1. **Dusco does not intend to hold customer funds.** The operating model is designed so that
   customer money is held by a licensed bank or an appropriately regulated financial
   institution. Dusco provides the technology, rules engine, and customer experience — not
   deposit-taking. Section 2 sets out the structure in full.
2. **Dusco has not yet been used by real customers.** There are ten individual pilot users and
   one *kikoba* (savings group) in the onboarding pipeline. Nothing in this document should be
   read as claiming live traction. Where we describe a feature as built, Section 6 and the
   accompanying technical validation checklist state precisely what has been verified in the
   codebase and what has not.

---

## 1. Executive summary

Tanzanians already save in envelopes — money divided by purpose: school fees, farm inputs,
emergencies, a wedding or a funeral. The habit is real and durable. What is missing is a
digital version that respects it instead of collapsing it into a single balance.

Dusco is that digital version, built and operated by **Larson Consulting**, a fully
registered company. A user is issued one **Dusco number**. Money sent to that number is
intended to split automatically across savings envelopes (*bahasha*) the user has defined. The
same model extends to savings groups (*kikoba* / *chama* / VICOBA), which already move large
sums informally on paper ledgers and cash boxes.

For [Partner], Dusco is a source of payment volume: many small collections in, regular
disbursements out, and — as groups adopt it — scheduled bulk flows. Dusco handles the savings
logic, the customer relationship, the rules engine, and the ledger visibility. [Partner]
provides collections, disbursements, routing, and reconciliation support. A licensed bank or
regulated financial institution holds the funds.

**The commercial reality we put on the table honestly:** at a placeholder processing rate of
0.6%, transaction fees alone do not carry the business (Section 11 shows the arithmetic).
That is a statement about the *rate*, not the idea — which is exactly why we are asking for a
partnership rate rather than a standard price card. We ask [Partner] to help make Dusco's
transaction line at least neutral at low volume and stronger with scale. Float yield is treated
as upside, conditional on licensing and a compliant bank structure — never as the foundation
of the model.

What we are asking for is set out in full in Section 13.

---

## 2. Operating and regulatory structure

Dusco will operate as the product, technology, and customer-experience layer under Larson
Consulting, a fully registered company. **Dusco does not intend to operate as an unlicensed
deposit-taking institution.** The operating model is designed so that customer funds are held
by a licensed bank or appropriately regulated financial institution, while Dusco provides the
digital envelope infrastructure, customer interface, rules engine, transaction logic, ledger
visibility, and group-management tools.

We set out the three roles explicitly so that regulatory responsibility is unambiguous:

**Larson Consulting / Dusco — the technology and experience layer.**
- Product, user experience, and mobile/web application.
- Savings-envelope logic, user-defined split percentages, goals, and locks.
- Group ledgering: member contributions, group envelopes, and a member contribution/share
  ledger for internal group accounting.
- Rules engine and fee display; the reconciliation interface and transaction ledger visible
  to users and to Dusco operations.
- Customer onboarding, support, consent capture, privacy notice, and data-subject rights.
- Dusco records positions and instructions; it does not, in this design, take custody of funds.

**[Partner] — the payment and settlement-support layer.**
- Collections from, and disbursements to, mobile-money networks and banks.
- Payment routing, references or virtual-account logic that let each Dusco user and group be
  addressed uniquely on the way in.
- Settlement support and reconciliation reporting.
- Failed-transaction, reversal, and limit handling on the payment rails.

**Licensed bank / regulated financial institution — the funds-holding layer.**
- Custody of pooled customer funds in an appropriately structured account (for example, a
  trust, custody, or settlement account) held for the benefit of users.
- The regulated relationship through which any float or yield arrangement — if pursued — would
  be structured and approved.

**Regulatory posture.** We take the following as design constraints, not afterthoughts:

- **Bank of Tanzania licensing and funds custody.** Customer funds are to be held by a licensed
  institution under an appropriate account structure. Any float or yield arrangement is
  conditional on the correct licensing and bank structure and is not booked as base revenue.
- **KYC / AML.** Customer identity verification and transaction monitoring are to be performed
  in line with the requirements of the licensed funds-holding partner and applicable
  Bank of Tanzania and FIU guidance. Dusco will align its onboarding to those requirements; we
  ask [Partner] to confirm which KYC obligations sit with the payment layer.
- **Data protection (PDPA, Cap. 44).** Financial-transaction data should be treated as
  high-risk personal data. Dusco will design for lawful basis, recorded consent, data
  minimisation, security, retention limits, and data-subject rights, and will agree a Data
  Processing Agreement with [Partner] before live processing. A gap assessment exists
  (`docs/PDPA_COMPLIANCE.md`); the open items are listed honestly in Section 6.
  Final classification under the Act is subject to Tanzanian data-protection counsel.
- **Settlement and reconciliation.** Settlement timing, settlement-account structure, and
  reconciliation reporting are to be defined jointly with [Partner] and the bank partner.

We would value the partner's guidance in defining the compliant funds-holding structure — this is
a place where your experience with licensed institutions materially de-risks our path.

---

## 3. The problem we are solving

Three things are true at once in Tanzania, and together they make the opportunity:

1. **People save by purpose, not by pool.** The envelope habit is cultural and durable.
   Wallets and banking apps give one balance; they do not match how people think about money.
2. **Money is fragmented across networks.** M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, and
   the banks do not interoperate cleanly, and moving between them costs the user time and fees.
3. **Group saving is large but informal.** Very large numbers of *kikoba* / VICOBA groups run
   on paper ledgers, cash boxes, and trust. When that breaks, it breaks badly.

Dusco does not ask people to change their behaviour. It digitises the behaviour they already
have — and it needs a payments partner who can reach every network and bank to do it.

---

## 4. What Dusco does

- **One Dusco number, automatic splitting.** Money arriving at a user's Dusco number is
  intended to split across their envelopes by percentages they set — e.g. 100,000 TZS in lands
  as 40k savings / 30k school fees / 20k travel / 10k personal.
- **Receive from any network or bank.** This is the headline capability and it depends on [Partner]
  Pay: a user is paid to their Dusco number from any wallet or bank via the account-reference
  model. In the current build this inbound flow is *simulated* pending your confirmation and
  sandbox access (see Section 6).
- **Goals and locks.** Users can set a target on an envelope and track progress, or lock an
  envelope until a date.
- **Groups (*kikoba* / VICOBA).** A group gets its own Dusco number; member contributions
  split into group envelopes, with a member contribution/share ledger for internal group
  accounting tracked separately — the digital version of the cash box, minus the risk. These
  records are for group accounting and contribution tracking only; they do not represent
  securities or investment products unless reviewed and approved under the applicable legal
  structure.
- **Privacy by default.** Balances are hidden until the user chooses to reveal them.

Section 6 states precisely which of these are built and verified, which are partial, and which
depend on [Partner].

---

## 5. Pilot-first go-to-market

We are deliberately starting narrow and controlled. The purpose of the first phase is not
growth — it is to validate user behaviour, payment reliability, fee acceptance, reconciliation
accuracy, and group adoption before spending on scale. Broad launch language has no place until
the payment loop is proven on real rails.

**Phase 1 — Controlled pilot (validate the loop).**
Ten individual pilot users and one *kikoba* group, all already in the onboarding pipeline. The
objective is to prove, on live rails, that money reaches the right Dusco number, splits
correctly, reconciles cleanly, that fees are understood and accepted, that withdrawals behave
as designed, and that a group can run its contributions through Dusco. Onboarding is direct and
low-cost (founder-led), not paid acquisition.

**Phase 2 — Dense community launch (after the loop is proven).**
Only once Phase 1 KPIs are met, launch densely in one urban area (Dar es Salaam first),
acquiring through referral — the product is inherently shareable because a user shares their
Dusco number to receive money.

**Phase 3 — Group-led scale.**
Grow through organised groups: *kikoba* / VICOBA / *chama*, SACCOS, religious groups, alumni
groups, workplace welfare groups, and community organisers. Each group brings many members at
once and a higher, scheduled deposit frequency; the group treasurer does the selling.

**Phase 4 — Embed at the source.**
Employer, cooperative, and payroll / source-of-income integration, so saving happens before
spending. This is the highest-quality volume — regular, large, and sticky.

**Pilot KPIs (the gate to Phase 2).** We will measure and report:

- activated users (completed onboarding and first login);
- first-deposit conversion rate;
- repeat-deposit rate within 30 days;
- average monthly deposit per active user;
- number of successful deposits;
- number of failed transactions;
- settlement / reconciliation accuracy;
- fee acceptance (deposits and withdrawals completed after the fee is shown);
- withdrawal behaviour (timing, size, and use of the 90-day waiver);
- group contribution compliance (members contributing on schedule);
- customer-support issues (volume and type);
- user trust and referral behaviour (referrals generated per active user).

**Pilot pass criteria.** Dusco will not move to Phase 2 unless the pilot meets minimum
operational gates: all settled transactions reconcile to the Dusco ledger; no unresolved
customer-money incident remains open; at least one full *kikoba* contribution cycle is
completed; at least 70% of individual pilot users complete a first deposit; at least 50% of
depositing users make a repeat deposit within 30 days; users proceed with deposits after fee
disclosure; and [Partner] confirms that account references, settlement reports, failure states,
and reversal processes are operationally workable.

---

## 6. What is actually built today

We are strict about this because a payments partner will and should check. The full
feature-by-feature technical validation is provided as a companion checklist; the summary:

**Built and verified in the codebase (application layer, tested against a mock payment harness):**
- One Dusco number per user, and one per group.
- Automatic splitting of an incoming amount across envelopes by user-defined percentages.
- Envelope goals and progress; envelope locking until a date; group envelopes; group member
  contribution tracking and a member contribution/share ledger for internal group accounting.
- Fee display before a transaction is confirmed.
- Cross-network deposit-fee logic (1%, minimum TZS 500; free on the settlement network).
- Withdrawal-fee logic (1%, floor TZS 500, cap TZS 5,000) **and the 90-day fee waiver** —
  confirmed present in the code (`server/routes/transactions.js`), based on the age of the
  earliest funds held in the envelope.
- Privacy-by-default balance hiding.
- the PSP adapter and a signature-verified, idempotent webhook endpoint — built and tested
  **against a mock harness only**; they have not processed a live transaction.
- Group role controls (admin / treasurer / member) enforced for group withdrawals.

**Simulated pending [Partner] (built as logic, not yet live):**
- Receiving money from any network or bank to a Dusco number. The split logic is built and the
  webhook is ready; live inbound depends on [Partner] confirming the account-reference model and
  issuing sandbox access.
- Real disbursements to mobile money / banks (logic built; live payout depends on [Partner]).

**Partially built:**
- Deposit reconciliation (transaction ledger, payment references, and webhook idempotency
  exist; a formal reconciliation report/interface does not yet).
- Failed-transaction and settlement-status handling (status fields and webhook-driven status
  updates exist; user-facing retry and a reconciliation view do not yet).
- Admin dashboard (an operational dashboard exists; it is not yet a full reconciliation tool,
  and admin access is a single credential rather than proper role-based access control).

**Business-rule / concept only (not built):**
- User consent capture flow and a published privacy notice (a placeholder link only).
- Transaction reversal handling (a status value exists in the schema; no reversal logic).

**Pre-pilot security hardening:**
Pre-pilot security hardening items have been identified and are scheduled before any live
customer funds are processed. These include production-grade access control, secrets
management, OTP replacement, database security configuration, rate-limiting, and audit logging.
The detailed technical readiness checklist can be shared with the partner's technical team during
sandbox review.

Nothing in this document is described as "live", "in production", or "processing real money".
The product is a working build deployed for demonstration and a pilot, integrated against a
mock payment harness, awaiting your sandbox.

---

## 7. Why this is a good partnership for [Partner]

- **We generate the transactions you monetise.** Dusco's core loop *is* payments — collect,
  split, disburse. Our growth is your volume growth.
- **We spread across all your rails.** Because Dusco is designed to receive from any network, we
  bring cross-network traffic rather than concentrating on one channel.
- **We bring recurring, predictable flow.** Savings and group contributions follow salary
  cycles and meeting schedules — a steadier profile than one-off commerce.
- **We are low-rebuild-risk.** The adapter and webhook are already built against a mock harness,
  which reduces the engineering work required to reach sandbox testing. Final integration risk
  will be assessed after [Partner] confirms account-reference handling, field names, failure
  states, reversal logic, settlement timing, and reconciliation reports.

---

## 8. Market context

The opportunity rests on three well-documented facts about Tanzania: mobile money at national
scale, a highly connected population, and a strong (if shifting) savings culture. The figures
below are drawn from the most recent authoritative sources available and should be
re-confirmed against the primary publications before wider external circulation.

- **Mobile money is already at national scale.** In 2025, Tanzania recorded approximately
  **7.96 billion mobile payment transactions (7,959.40 million) worth about TZS 255.13 trillion
  (TZS 255,133.96 billion)**, with **75.78 million active mobile money subscriptions** and
  approximately **1.98 million agents**. This confirms that Dusco is not trying to create a new
  payment habit; it is building a purpose-based savings layer on top of payment behaviour that
  already exists at scale.
  *(Source: Bank of Tanzania, National Payment Systems Annual Report 2025.)*
- **Digital savings are already growing fast.** Bank of Tanzania reported **97.53 million
  digital-savings transactions in 2025 (up 110%), worth approximately TZS 3.18 trillion
  (TZS 3,181.24 billion — up 263%)**, showing that mobile-based saving is no longer theoretical.
  Dusco's opportunity is to make digital saving more structured, purpose-based, and
  group-compatible.
  *(Source: Bank of Tanzania, National Payment Systems Annual Report 2025.)*
- **Connectivity is broad, but subscription counts are not the same as unique users.**
  Tanzania's telecom subscription base is large, and smartphone penetration is now material,
  with BoT/TCRA reporting **28.50 million smartphones and smartphone penetration of 41.82% in
  2025**. This supports a smartphone-led rollout, especially in urban and peri-urban markets,
  while keeping the first pilot narrow and controlled.
  *(Source: TCRA Communications Statistics Report / BoT, 2025.)*
- **Financial inclusion is high and mobile-led, but purpose-based and group saving is
  under-served.** Formal financial inclusion reached **76% of adults in 2023**, with
  mobile-money uptake at **72%**; participation in community microfinance / VICOBA-type groups
  was about **12% of adults** (down from 16% in 2017) — a large but strained informal base that
  a reliable digital tool can serve.
  *(Source: FinScope Tanzania 2023, FSDT / NBS.)*

The structure of the opportunity is the point: the payment rails, the connected users, and the
savings behaviour all exist at scale, yet no product connects purpose-based and group saving to
interoperable payment rails the way Dusco is designed to. Our near-term serviceable market is
urban and peri-urban smartphone users who already save by purpose, plus the organised *kikoba*
networks around them.

---

## 9. Assumptions (all editable)

These drive every number in Section 10. Change any of them and the model moves. **A2 is held
deliberately conservative** and the scale scenarios are gated on the pilot (A10). The
assumption we most want your input on is marked ★.

| # | Assumption | Value used |
|---|---|---|
| A1 | Active depositors as a share of registered users | 60% |
| A2 | Net amount saved per active depositor per month | TZS 50,000 (conservative base) |
| A3 | Deposit transactions per active depositor per month | 2 |
| A4 | Withdrawal volume as a share of deposit volume | 45% |
| A5 | Share of deposits that are cross-network (Dusco fee-earning) | 50% |
| A6 | Dusco blended transaction take (from A5 + capped withdrawal fees) | ≈ 0.77% of deposit inflow |
| A7 ★ | **[Partner] blended processing take on total volume (in + out)** | **0.6% — placeholder, to confirm with you** |
| A8 | Flow calculated on *average* active users across the year | (start + end) ÷ 2 × 60% |
| A9 | Float yield, if/when licensed | 8% p.a., split 70% Dusco / 30% users — upside only |
| A10 | **Pilot validation gate** | **The first 10 individual users and one *kikoba* group will validate onboarding, deposit frequency, average deposit size, fee acceptance, group contribution behaviour, withdrawal patterns, reconciliation accuracy, and settlement reliability before the model is scaled.** |

**On A2:** early conversations suggest a realistic average monthly deposit above TZS 100,000
is plausible. We deliberately do **not** adopt that into the model. TZS 50,000 stays as the
base assumption until pilot data proves otherwise; any figure above it is treated as
**pilot-validation upside**, not a planning number.

**Registered users at year-end — scale scenarios, contingent on passing A10:**

| Scenario | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Worst | 1,500 | 6,000 | 18,000 |
| Base | 5,000 | 25,000 | 75,000 |
| Best | 12,000 | 60,000 | 200,000 |

These describe the post-pilot scale phase. They are not forecasts of the pilot, and they
assume the pilot validates the loop.

---

## 10. Three-scenario projections (TZS, 3 years — post-pilot scale)

All figures are annual and describe the scale phase *after* a successful pilot. **"Volume
through [Partner]"** is total money processed — collections in plus disbursements out — the
number that sizes your side of the partnership.

### Base case — steady, referral-and-group-led growth

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 5,000 | 25,000 | 75,000 |
| Avg active depositors | 1,500 | 9,000 | 30,000 |
| Deposit volume in | TZS 0.90 B | TZS 5.40 B | TZS 18.0 B |
| Disbursement volume out | TZS 0.41 B | TZS 2.43 B | TZS 8.10 B |
| **Volume through [Partner]** | **TZS 1.31 B** | **TZS 7.83 B** | **TZS 26.1 B** |
| [Partner] processing revenue @0.6% | TZS 7.8 M | TZS 47.0 M | TZS 156.6 M |
| Dusco transaction revenue | TZS 6.9 M | TZS 41.6 M | TZS 138.6 M |
| Float upside if licensed (Dusco share) | — | ~TZS 111 M | ~TZS 470 M |

### Best case — groups scale fast, employer payroll lands early

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 12,000 | 60,000 | 200,000 |
| Avg active depositors | 3,600 | 21,600 | 78,000 |
| Deposit volume in | TZS 2.16 B | TZS 12.96 B | TZS 46.8 B |
| Disbursement volume out | TZS 0.97 B | TZS 5.83 B | TZS 21.06 B |
| **Volume through [Partner]** | **TZS 3.13 B** | **TZS 18.79 B** | **TZS 67.9 B** |
| [Partner] processing revenue @0.6% | TZS 18.8 M | TZS 112.8 M | TZS 407.2 M |
| Dusco transaction revenue | TZS 16.6 M | TZS 99.8 M | TZS 360.4 M |

### Worst case — slow adoption, groups don't convert

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 1,500 | 6,000 | 18,000 |
| Avg active depositors | 450 | 2,250 | 7,200 |
| Deposit volume in | TZS 0.27 B | TZS 1.35 B | TZS 4.32 B |
| Disbursement volume out | TZS 0.12 B | TZS 0.61 B | TZS 1.94 B |
| **Volume through [Partner]** | **TZS 0.39 B** | **TZS 1.96 B** | **TZS 6.26 B** |
| [Partner] processing revenue @0.6% | TZS 2.35 M | TZS 11.7 M | TZS 37.6 M |
| Dusco transaction revenue | TZS 2.1 M | TZS 10.4 M | TZS 33.3 M |

**The honest read:** the gap between worst and best is driven almost entirely by one thing —
whether groups and employers adopt — which is where we point our effort. All three scenarios
assume the pilot first proves the loop.

---

## 11. Revised unit economics

A partner is right to test whether the business underneath the volume is sound. We do not hide
the difficulty; we frame it precisely.

**The processing rate is the crux.** At the placeholder rate of 0.6% (A7), transaction
economics do not stand up on their own: what Dusco pays to move money is roughly **0.87% of
deposit inflow** (because total volume — in plus out — is about 1.45× inflow), while Dusco
earns roughly **0.77% of inflow** from users on transactions. On fees alone, the transaction
line is slightly negative before any fixed cost. This is a statement about the *rate*, not the
model.

**What we are asking, and what we are not.**
- **0.6% is a placeholder, not an accepted price.** We are asking [Partner] for a **partnership
  rate**, agreed under a partnership structure — not a generic API price card.
- **The commercial target** is that Dusco's transaction line is **at least neutral at early
  volume and improves with scale**, as fixed costs spread and volume grows.
- **Float yield is upside, not the foundation.** Dusco is not designed to depend on float to
  survive. Any float / yield arrangement is conditional on the correct licensing and a
  compliant bank structure (Section 2), and is excluded from base transaction economics.

**The transaction-neutral rate — a commercial reference point.** Under the current assumptions,
the indicative transaction-neutral processing rate is **approximately 0.53% of total processed
volume before fixed operating costs**. (Total processed volume ≈ 1.45× deposit inflow, since
withdrawals are ~45% of inflow; Dusco earns ~0.77% of inflow, so 0.77% ÷ 1.45 ≈ 0.53%.) This is
not presented as a demand, because the final rate may depend on channel mix, fixed fees,
settlement timing, reversals, and volume tiers. It gives both parties a commercial reference
point: at rates above this level, Dusco's transaction line is negative before fixed costs; at or
below this level, the model becomes more viable without relying on float.

| [Partner] rate on total processed volume | Effect on Dusco transaction line |
|---|---|
| 0.60% | Negative before fixed costs |
| 0.53% | Approximately transaction-neutral |
| 0.50% | Slightly positive before fixed costs |
| 0.40% | More viable for early adoption |

The single most powerful lever on the whole model is A7. A partnership rate that keeps the
transaction line neutral pulls break-even forward in every scenario and grows the volume you
process — the interests genuinely point the same way.

---

## 12. Cost model — lean pilot now, scaled model only after validation

There are two cost models, and they must not be confused.

**The scaled operating model is not the pilot budget, and it is not currently funded.** The
figures below (roughly TZS 73.3M in the first scale year, rising with volume) describe a
*scaled* operation with a team, infrastructure, and community marketing. They are an indicative
planning model for the post-pilot phase, contingent on validation and appropriate funding. We
do **not** present Dusco as operationally comfortable at that cost level today.

*Indicative scaled operating model (post-pilot, not yet funded):*

| Cost line | Basis | Scale Yr 1 | Scale Yr 2 | Scale Yr 3 |
|---|---|---|---|---|
| [Partner] processing | 0.6% of total volume (A7) | TZS 7.8 M | TZS 47.0 M | TZS 156.6 M |
| Team (blended) | ~2 → ~6 people | TZS 36.0 M | TZS 72.0 M | TZS 120.0 M |
| Infrastructure / hosting | scales with users | TZS 3.0 M | TZS 8.0 M | TZS 18.0 M |
| SMS / OTP / comms | ~TZS 100 / active user / month | TZS 1.8 M | TZS 10.8 M | TZS 36.0 M |
| Marketing (community-led) | referral + group organisers | TZS 10.0 M | TZS 30.0 M | TZS 60.0 M |
| Compliance / legal / licensing | PDPC reg, DPO, counsel | TZS 8.0 M | TZS 12.0 M | TZS 20.0 M |
| Contingency | 10% | TZS 6.7 M | TZS 18.0 M | TZS 41.1 M |
| **Total operating cost** | | **TZS 73.3 M** | **TZS 197.8 M** | **TZS 451.7 M** |

**The pilot cost model is different in kind: lean, founder-led, and small.** The pilot is run
without large payroll, without mass paid advertising, and without a scaled team. Cash outlay is
kept to the essentials needed to run 10 users and one group safely on real rails. Figures are
planning placeholders for the pilot period, to be firmed up with real quotes.

*Lean pilot cost model (founder-led):*

| Pilot cost line | What it covers | Indicative pilot outlay |
|---|---|---|
| Technical integration | the partner sandbox integration and testing (founder time; minimal tooling) | Low; founder-led, final quote pending |
| Compliance / legal documentation | Privacy notice, consent copy, DPA review, PDPC registration prep | Modest; counsel/registration cost to be confirmed |
| Security hardening | Close identified pre-pilot hardening items before live pilot | Founder-led, with minimal tooling cost before pilot |
| Pilot onboarding | Direct, low-cost onboarding of 10 users + 1 group (no paid acquisition) | Near-zero cash |
| Manual support | Founder-led customer support through the pilot | Founder time |
| Reconciliation testing | Verifying deposits, splits, and settlement against [Partner] reports | Founder time |
| Hosting (pilot tier) | A paid always-on tier so the service does not sleep | Low; founder-led, final quote pending |

The principle is explicit: **compliance and payment-integration essentials first; a scaled cost
model only after the pilot validates the loop.** We are not seeking to run the scaled model
before there is evidence to justify it.

**Break-even (scaled model, real model with float once licensed) — indicative:**

| Scenario | Turns cash-positive | Peak cumulative cash needed |
|---|---|---|
| Best | Scale Year 2 | ~TZS 55 M |
| Base | Scale Year 3 | ~TZS 98 M |
| Worst | Beyond Scale Year 3 | requires tighter cost control or a better processing rate |

Break-even depends materially on A7 and on float being licensed; neither is assumed in the
pilot.

---

## 13. What we are asking of [Partner]

Since this is not a fundraise, the ask is concrete:

1. **Sandbox credentials** to complete and certify the integration.
2. **Account-reference confirmation.** Formal confirmation that each Dusco **user** and each
   **group** can be assigned a unique account reference, virtual account, payment reference, or
   equivalent identifier, so inbound money can be routed to the correct Dusco number. (This was
   indicated as possible or worth validating in our meeting; we ask [Partner] to confirm it
   formally.)
3. **Channel coverage.** Confirmation of collections and disbursements across mobile-money
   networks and banks.
4. **Operational parameters.** Supported channels, transaction limits, failed-transaction
   handling, reversal handling, settlement timing, and reconciliation reports.
5. **Commercial terms.** A proposed partnership processing rate and settlement terms.
6. **Funds-holding structure.** Support in defining a compliant funds-holding structure with a
   licensed bank or regulated financial institution.
7. **Compliance and security.** A Data Processing Agreement and your technical-security
   requirements for integrating partners.
8. **Division of responsibilities.** A clear, written division of responsibilities between
   Larson Consulting / Dusco, [Partner], and the bank / custody partner — including where KYC/AML
   obligations sit.

---

## 14. Risks and how we are handling them

| Risk | Our response |
|---|---|
| **Funds custody / deposit-taking** | Dusco does not hold customer funds; funds sit with a licensed institution. Structure to be defined with [Partner] and a bank partner (Section 2). |
| **Regulatory — savings & float** | Float treated as conditional upside, not booked. Engage Bank of Tanzania and operate money movement under licensed partners. |
| **No live traction yet** | Controlled pilot (10 users + 1 group) with explicit KPI gates before any scale spend (Sections 5, 9). |
| **Data protection (PDPA, Cap. 44)** | Financial-transaction data treated as high-risk personal data (final classification subject to counsel). Gap assessment done; design for consent, minimisation, security; DPA with [Partner] before live processing. |
| **Pre-pilot security hardening** | Access-control, secrets-management, OTP, database-security, rate-limiting, and audit-logging items identified and scheduled before any live customer funds; not claimed as done. |
| **Dependence on one payments partner** | Payment layer sits behind a clean interface; our clear preference is to grow with [Partner]. |
| **Trust with savings** | Privacy-by-default, fees shown before every transaction, group ledgers that remove cash-box risk. |

---

## 15. Roadmap

- **Now:** working build deployed for demonstration; the PSP adapter and webhook built and
  tested against a mock harness; no live transactions; 10 individual users and one *kikoba*
  group in the onboarding pipeline.
- **Pre-pilot (0–3 months):** sandbox integration; confirm account-reference model and terms;
  close pre-pilot compliance and security items (consent, privacy notice, access control,
  secrets management, OTP); define funds-holding structure with a bank partner.
- **Pilot:** run 10 individual users and one group on real rails; measure the Section 5 KPIs;
  validate reconciliation and settlement.
- **Post-pilot, if KPIs pass:** dense community launch (Dar es Salaam); then group-led scale;
  then employer / cooperative / payroll integration.

---

## 16. Closing

Dusco is not asking Tanzanians to save differently. It gives a deeply rooted habit a digital
form, under a registered company, with a clear separation between the technology layer
(Dusco / Larson Consulting), the payment layer ([Partner]), and a licensed funds-holding partner.
The application is built and integrated against a mock harness; what remains is to prove the
loop on your rails with a small, controlled pilot, on commercial terms that work for both sides.

We would welcome your sandbox credentials, your confirmation on the account-reference model, and
a conversation about a partnership rate as the next step.

---

*Figures in this document are planning estimates built on the stated assumptions and are for
partnership discussion. Scale scenarios are contingent on a successful pilot (A10). Market
statistics are drawn from Bank of Tanzania, TCRA, and FinScope Tanzania sources as reported and
should be re-confirmed against the primary publications before wider external circulation. Float-based
revenue is contingent on appropriate licensing and a compliant bank structure. Technical
claims are limited to what is verified in the codebase; see the accompanying technical
validation checklist.*
