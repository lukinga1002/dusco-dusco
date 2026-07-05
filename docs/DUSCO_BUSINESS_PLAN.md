# Dusco — Business Plan & Partnership Case

**Prepared for:** GCA Pay
**Prepared by:** The Dusco team
**Date:** July 2026
**Status:** Confidential — for partnership discussion

---

## A note on how to read this document

This is written for a payments partner, not an equity investor, so it leads with the thing
that matters to you: **the volume Dusco will move across your rails, and how fast**. We are
not raising money in this document. We are asking to build.

Every number in the projections rests on an assumption, and every assumption is stated
plainly in one place (Section 8) so you can challenge it or replace it with your own. Where
we don't yet have a real figure — your per-transaction rate, our final unit costs — we've
said so rather than dress a guess up as a fact. Two figures in particular we'd like to set
*with* you: the processing rate you'd charge Dusco, and the settlement timing. Those change
the model materially and they're yours to give.

---

## 1. The short version

Tanzanians already save in envelopes. Walk into most households and you'll find money
divided by purpose — school fees here, the farm there, a little for emergencies, some kept
back for a wedding or a funeral. The tool is a physical envelope, a *bahasha*, and the
discipline is real. What's missing is a digital version that respects that habit instead of
flattening it into a single balance.

Dusco is that digital version. A user gets one **Dusco number**. Money sent to it — from any
network or bank — splits automatically across savings envelopes the user defined. No logging
in, no manual transfers, no thinking about it. The same idea extends to savings groups
(*chama* / VICOBA), which already move enormous sums informally.

For GCA Pay, Dusco is a **demand engine for payment volume**: many small collections coming
in, regular disbursements going out, and — as groups adopt it — bulk flows on a schedule.
Every one of those transactions is a collection or a payout you process. Dusco handles the
savings logic and the customer; you move the money.

**The product is already built and deployed.** The integration layer against your API is
written and tested — we are at the point of plugging in sandbox keys, not designing on a
whiteboard.

---

## 2. The problem we're solving

Three things are true at once in Tanzania, and together they make the opportunity:

1. **People save by purpose, not by pool.** The envelope habit is cultural and durable.
   Banking apps and mobile-money wallets give you one balance; they don't match how people
   actually think about their money.
2. **Money is fragmented across networks.** M-Pesa, Mixx by Yas, Airtel Money, HaloPesa and
   the banks don't talk to each other cleanly, and moving between them costs the user time
   and fees. A saver receiving money from three different senders on three networks has three
   headaches.
3. **Group saving is huge but informal.** Hundreds of thousands of chamas and VICOBA groups
   run on paper ledgers, cash boxes, and trust. When that breaks, it breaks badly.

Dusco doesn't ask people to change their behaviour. It digitises the behaviour they already
have — and it needs a payments partner who can reach every network and bank to do it. That's
the whole reason this conversation exists.

---

## 3. What Dusco does (briefly)

- **One Dusco number, automatic splitting.** Money arriving at a user's Dusco number is split
  across their envelopes by percentages they set. 100,000 TZS in, and it lands as (say) 40k
  savings / 30k school fees / 20k travel / 10k personal — instantly.
- **Receive from anywhere.** The headline feature depends on you: a user can be paid to their
  Dusco number from any bank or wallet, and it just works.
- **Goals and locks.** Users can set a target on an envelope and watch progress, or lock an
  envelope until a date to protect it from themselves.
- **Groups (chama / VICOBA).** A group gets its own Dusco number. Member contributions split
  into group envelopes (events, emergencies, opportunities), with a shares ledger tracked
  separately — the digital version of the cash box, minus the risk.
- **Privacy by default.** Balances are hidden until the user chooses to reveal them — a small
  thing that matters a lot in shared spaces.

The experience is live and demonstrable today.

---

## 4. Why this is a good partnership for GCA Pay

This is not a vendor relationship where you sell us an API and walk away. The incentives line
up:

- **We generate the transactions you monetise.** Dusco's core loop *is* payments — collect,
  split, disburse. Our growth is your volume growth, one-to-one.
- **We spread across all your rails.** Because Dusco receives from any network, we don't
  concentrate on one channel. We bring you cross-network traffic, which is exactly the traffic
  a single wallet can't.
- **We bring recurring, predictable flow.** Savings and group contributions are periodic by
  nature — salary cycles, weekly chama meetings. That's a steadier volume profile than
  one-off commerce.
- **We're low-integration-risk.** The adapter is built and the webhook is live and tested.
  Going from sandbox to production is a matter of credentials and confirming field names — not
  a rebuild.

What we need from you is the collections and disbursements infrastructure across networks and
banks, sandbox access to finish testing, and a processing rate that lets the unit economics
work for both sides.

---

## 5. Go-to-market strategy

We're deliberately starting narrow and dense rather than wide and thin. The plan runs in
three phases.

**Phase 1 — Prove the loop (Months 0–6).**
Launch in one or two urban centres (Dar es Salaam first). Win the individual saver with the
one feature nobody else has: money to your number, split automatically. Acquisition is
referral-led — the product is inherently shareable because you literally share your Dusco
number to receive money. Target: a few thousand engaged users who deposit repeatedly, and a
clean, reliable collect-and-split flow through GCA Pay.

**Phase 2 — Lead with groups (Months 6–18).**
Chamas are the growth unlock. Each group brings 10–30 members at once, and the group admin
does the selling for us. We'll partner with existing VICOBA networks, SACCOS, and community
organisers, and give group treasurers a tool that makes their unpaid, stressful job easy.
Groups also raise volume per user, because contributions are scheduled.

**Phase 3 — Embed at the source (Months 18–36).**
Move upstream to where money originates: employers and cooperatives paying salaries and
proceeds directly to Dusco numbers, so saving happens before spending. This is the highest-
quality volume — regular, large, and sticky — and it's where the partnership with GCA Pay
compounds.

**Channels throughout:** referral loops (built into the product), chama and community
organisers, radio and vernacular social content, and agent/field partnerships in later
phases. We're not planning to buy growth with expensive paid ads early — the product's
share-to-receive mechanic and the group multiplier are the engine.

---

## 6. Market opportunity

Tanzania has a large, young, mobile-money-native population and a deep informal savings
culture. Registered mobile-money accounts number in the tens of millions, and informal
savings groups are counted in the hundreds of thousands. We are intentionally *not* quoting
precise statistics here, because they deserve to be cited from a current source
(FinScope Tanzania, the Bank of Tanzania, and TCRA) rather than half-remembered — and we'd
rather hand you a number we can stand behind. The shape of the opportunity, though, is not in
doubt: the behaviour exists at scale, the rails exist, and nothing joins them the way Dusco
does.

Our near-term serviceable market is urban and peri-urban smartphone users who already save by
purpose, plus the organised chama networks around them. That is more than enough to build a
meaningful business on before we ever discuss national scale.

---

## 7. How Dusco makes money

Three revenue lines, in order of certainty:

1. **Cross-network deposit fee — 1%** (minimum 500 TZS), free when the sender is on the
   settlement network. This rewards keeping money in the ecosystem and only charges the
   genuine cost of crossing networks.
2. **Withdrawal fee — 1%**, floored at 500 and capped at 5,000 TZS, and **waived entirely
   after 90 days**. The waiver is deliberate: it pays people to save longer, which is good for
   the user, good for our float, and good for your steady volume.
3. **Float yield — planned, and conditional.** Aggregated balances can earn a return
   (modelled at 8% p.a.), shared 70/30 between Dusco and users as an annual dividend. We flag
   this honestly as **subject to the appropriate Bank of Tanzania licensing and/or a
   compliant partnership structure**. It is upside in this plan, not booked base revenue, and
   we will not build on it until it is cleared.

For you, the revenue is the processing margin on every collection and disbursement Dusco
drives — which is why the volume tables below matter more to this conversation than our own
fee lines.

---

## 8. Assumptions (all editable)

These drive every number in Section 9. Change any of them and the model moves. The two we'd
most like your input on are marked ★.

| # | Assumption | Value used |
|---|---|---|
| A1 | Active depositors as a share of registered users | 60% |
| A2 | Net amount saved per active depositor per month | TZS 50,000 |
| A3 | Deposit transactions per active depositor per month | 2 |
| A4 | Withdrawal volume as a share of deposit volume | 45% |
| A5 | Share of deposits that are cross-network (Dusco fee-earning) | 50% |
| A6 | Dusco blended transaction take (from A5 + capped withdrawal fees) | ≈ 0.77% of deposit inflow |
| A7 ★ | **GCA Pay blended processing take on total volume (in + out)** | **0.6% — placeholder, to confirm with you** |
| A8 | Flow calculated on *average* active users across the year, not year-end | (start + end) ÷ 2 × 60% |
| A9 | Float yield, if/when licensed | 8% p.a., split 70% Dusco / 30% users |

**Registered users at year-end (the one lever that separates the scenarios):**

| Scenario | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Worst | 1,500 | 6,000 | 18,000 |
| Base | 5,000 | 25,000 | 75,000 |
| Best | 12,000 | 60,000 | 200,000 |

Everything else follows from these and the assumptions above.

---

## 9. Three-scenario projections (TZS, 3 years)

All figures are annual. **"Volume through GCA Pay"** is total money processed — collections in
plus disbursements out — and is the number that sizes your side of the partnership.

### Base case — steady, referral-and-chama-led growth

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 5,000 | 25,000 | 75,000 |
| Avg active depositors | 1,500 | 9,000 | 30,000 |
| Deposit volume in | TZS 0.90 B | TZS 5.40 B | TZS 18.0 B |
| Disbursement volume out | TZS 0.41 B | TZS 2.43 B | TZS 8.10 B |
| **Volume through GCA Pay** | **TZS 1.31 B** | **TZS 7.83 B** | **TZS 26.1 B** |
| GCA Pay processing revenue @0.6% | TZS 7.8 M | TZS 47.0 M | TZS 156.6 M |
| Dusco transaction revenue | TZS 6.9 M | TZS 41.6 M | TZS 138.6 M |
| Float upside if licensed (Dusco share) | — | ~TZS 111 M | ~TZS 470 M |

### Best case — groups scale fast, employer payroll lands early

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 12,000 | 60,000 | 200,000 |
| Avg active depositors | 3,600 | 21,600 | 78,000 |
| Deposit volume in | TZS 2.16 B | TZS 12.96 B | TZS 46.8 B |
| Disbursement volume out | TZS 0.97 B | TZS 5.83 B | TZS 21.06 B |
| **Volume through GCA Pay** | **TZS 3.13 B** | **TZS 18.79 B** | **TZS 67.9 B** |
| GCA Pay processing revenue @0.6% | TZS 18.8 M | TZS 112.8 M | TZS 407.2 M |
| Dusco transaction revenue | TZS 16.6 M | TZS 99.8 M | TZS 360.4 M |

### Worst case — slow adoption, groups don't convert

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Registered users (end) | 1,500 | 6,000 | 18,000 |
| Avg active depositors | 450 | 2,250 | 7,200 |
| Deposit volume in | TZS 0.27 B | TZS 1.35 B | TZS 4.32 B |
| Disbursement volume out | TZS 0.12 B | TZS 0.61 B | TZS 1.94 B |
| **Volume through GCA Pay** | **TZS 0.39 B** | **TZS 1.96 B** | **TZS 6.26 B** |
| GCA Pay processing revenue @0.6% | TZS 2.35 M | TZS 11.7 M | TZS 37.6 M |
| Dusco transaction revenue | TZS 2.1 M | TZS 10.4 M | TZS 33.3 M |

**The honest read:** even the worst case is a real, growing stream of transactions, not a
flat line. The gap between worst and best is driven almost entirely by one thing — whether
groups and employers adopt — which is exactly where we're pointing our effort.

---

## 10. Cost model and path to break-even

A partner is right to ask whether the business underneath the volume is sound. Here is the
honest version. Costs below are **planning placeholders** — replace them with your view of
our real numbers. Everything is base case, TZS.

**Annual cost assumptions (editable):**

| Cost line | Basis | Year 1 | Year 2 | Year 3 |
|---|---|---|---|---|
| GCA Pay processing | 0.6% of total volume (A7) | TZS 7.8 M | TZS 47.0 M | TZS 156.6 M |
| Team (blended, incl. founders' modest draw) | ~2 → ~6 people | TZS 36.0 M | TZS 72.0 M | TZS 120.0 M |
| Infrastructure / hosting | scales with users | TZS 3.0 M | TZS 8.0 M | TZS 18.0 M |
| SMS / OTP / comms | ~TZS 100 / active user / month | TZS 1.8 M | TZS 10.8 M | TZS 36.0 M |
| Marketing (community-led, lean) | referral + chama organisers | TZS 10.0 M | TZS 30.0 M | TZS 60.0 M |
| Compliance / legal / licensing | PDPC reg, DPO, counsel | TZS 8.0 M | TZS 12.0 M | TZS 20.0 M |
| Contingency | 10% | TZS 6.7 M | TZS 18.0 M | TZS 41.1 M |
| **Total operating cost** | | **TZS 73.3 M** | **TZS 197.8 M** | **TZS 451.7 M** |

**Base-case profit & loss — two honest views:**

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| *Conservative (transaction fees only)* | | | |
| Revenue | TZS 6.9 M | TZS 41.6 M | TZS 138.6 M |
| Operating cost | (TZS 73.3 M) | (TZS 197.8 M) | (TZS 451.7 M) |
| **Net** | **(TZS 66.4 M)** | **(TZS 156.2 M)** | **(TZS 313.1 M)** |
| *Real model (with float, once licensed)* | | | |
| Revenue (fees + Dusco float share) | TZS 20.9 M | TZS 152.6 M | TZS 608.6 M |
| Operating cost | (TZS 73.3 M) | (TZS 197.8 M) | (TZS 451.7 M) |
| **Net** | **(TZS 52.4 M)** | **(TZS 45.2 M)** | **+TZS 156.9 M** |

**What this says, plainly:**

- **On transaction fees alone, at a 0.6% processing rate, Dusco does not stand up.** The reason
  is direct and it's the crux of our conversation: at that rate, what we pay you to move money
  (~0.87% of deposit inflow, because total volume is ~1.45× inflow) is *more* than the ~0.77%
  we earn from users on transactions. Fixed costs then do the rest of the damage. This isn't a
  flaw in the idea — it's a statement about the **processing rate**, which is exactly why we
  want to set it with you rather than accept a default.
- **The real model works through two things: float and operating leverage.** Once savings
  balances are put to work (subject to licensing) and the fixed cost base is spread over more
  users, the base case **turns cash-positive in Year 3**, having absorbed a cumulative
  ~TZS 98 million along the way — roughly USD 40,000. That is a **capital-light** path, which
  is part of why we aren't raising a large round.

**Break-even by scenario (real model, with float):**

| Scenario | Turns cash-positive | Peak cumulative cash needed |
|---|---|---|
| Best | Year 2 | ~TZS 55 M |
| Base | Year 3 | ~TZS 98 M |
| Worst | Beyond Year 3 | requires tighter cost control or a lower processing rate |

The single most powerful lever on all of this is your rate (A7). A partnership rate that
keeps Dusco's transaction line at least neutral pulls break-even forward in every scenario and
grows the volume you process — the interests genuinely point the same way.

---

## 11. What moves the numbers (sensitivities)

If you only stress-test three things, make them these:

- **Group adoption.** Each converted chama is 10–30 users acquired in a single stroke and a
  higher deposit frequency. This is the single biggest swing between scenarios.
- **Average balance retained (the 90-day waiver at work).** The longer money stays, the more
  float builds and the steadier your disbursement profile. Small changes here compound.
- **Your processing rate (A7).** It sets both your revenue and our viable pricing. We'd rather
  agree a rate that keeps both sides healthy at low volume than a high rate that stalls
  adoption and starves the pipe.

---

## 12. Risks and how we're handling them

| Risk | Our response |
|---|---|
| **Adoption is slower than hoped** | Start narrow and dense; lead with groups where one sale brings many users; don't burn cash on paid growth early. |
| **Regulatory — savings & float** | Treat float yield as conditional, not booked. Engage the Bank of Tanzania early and, where sensible, operate money movement under a licensed partner's umbrella. |
| **Data protection (PDPA, Cap. 44)** | Financial-transaction data is *sensitive* under the Act. We've done a gap assessment, design for consent, minimisation and security, and will sign a Data Processing Agreement with GCA Pay as our processor. |
| **Dependence on one payments partner** | The architecture keeps the payment layer behind a clean interface, so we're a strong partner rather than a captive one — but our clear preference is to grow this with GCA Pay. |
| **Trust with people's savings** | Privacy-by-default, transparent fees shown at every step, group ledgers that remove the cash-box risk, and no hidden charges. |

---

## 13. Roadmap

- **Now:** product built and deployed; GCA Pay adapter and webhook written and tested against
  mock; demo live.
- **Next (0–3 months):** sandbox integration with GCA Pay; agree processing rate and settlement;
  close the pre-launch compliance items (consent, privacy notice, security hardening).
- **3–6 months:** production launch in Dar es Salaam; first thousands of users; the loop
  running on real rails.
- **6–18 months:** chama-led scale; SACCOS and community partnerships.
- **18–36 months:** employer and cooperative payroll integrations; broaden geographically.

---

## 14. What we're asking of GCA Pay

Since this isn't a fundraise, the "ask" is simple and concrete:

1. **Sandbox access** to complete and certify the integration.
2. **A processing rate and settlement terms** we can build on — set together, so both sides win
   at low volume and scale.
3. **Confirmation of the collections model** — specifically, whether each user can be addressed
   by a unique account reference (their Dusco number) on the way in.
4. **A Data Processing Agreement**, so we're compliant with the Personal Data Protection Act
   from day one.

Give us those four, and we move from a working demo to real money moving across your rails —
quickly, because the hard engineering is already done.

---

## 15. Closing

Dusco isn't asking Tanzanians to save differently. It's giving a deeply-rooted habit a
digital form, and it needs a payments partner who can reach every shilling wherever it lives.
The product works, the integration is built, and the behaviour we're digitising is already
happening at scale. What's left is to turn it on together.

We'd welcome your rate and your sandbox keys as the next step.

---

*Figures in this document are planning estimates built on the stated assumptions and are for
partnership discussion. Market statistics should be validated against current FinScope
Tanzania, Bank of Tanzania, and TCRA data before external publication. Float-based revenue is
contingent on appropriate licensing.*
