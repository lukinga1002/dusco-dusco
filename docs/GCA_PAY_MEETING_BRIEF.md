# GCA Pay × Dusco — Sandbox Meeting Brief

**Goal of the meeting:** walk out with **sandbox credentials** and clear answers on the
four integration points Dusco depends on, plus the one product question that makes or
breaks Dusco's core feature.

Dusco's payment layer is already abstracted behind four functions (`server/services/payment.js`),
so integrating GCA Pay is a "fill in the adapter" job — not a rewrite. Map each to their API:

| Dusco function | What it does | GCA Pay capability to confirm |
|---|---|---|
| `collectPayment()` | Pull money in → split into bahashas | **Collections / C2B** |
| `disburseFunds()` | Pay a bahasha out to phone/bank | **Disbursements / B2C** |
| `bulkPayout()` | Annual dividend to all users | **Bulk payouts** |
| `getTransactionStatus()` | Confirm a txn | **Status query + webhooks** |

---

## 🔑 The make-or-break question (ask this first)

Dusco's signature feature is: *"a user sends money to their Dusco number `DUS-XXXXXX`
from ANY bank/mobile-money app, and it auto-splits."* For that to be real, GCA Pay must let
us **address each user uniquely on the way in**. Ask:

> **"Can you give each of our users a unique collection identifier — a virtual account
> number, a per-user reference on a paybill/till, or a wallet MSISDN — so that when money
> arrives we know which Dusco user it belongs to? Or is collection a single account where
> we pass a reference we generate?"**

Their answer shapes the whole onboarding/UX:
- **Virtual account per user** → best; the "Dusco number" can map to a real payable account.
- **Single paybill + reference** → workable; the Dusco number becomes the reference the
  sender types.
- **STK-push/initiated collection only** (we trigger, user approves on their phone) → then
  "send from any app to your number" isn't truly passive; reframe the feature.

---

## What to ask for (sandbox checklist)

1. **Sandbox credentials**: API key/secret (or client_id/secret), base URL, and the auth
   scheme (Bearer token? HMAC-signed requests?).
2. **API docs / developer portal** URL + Postman collection if any.
3. **Test data**: sandbox test phone numbers per network, test bank accounts, and how to
   simulate success/failure/timeouts.
4. **Webhooks/callbacks**: how to register our callback URL, the payload schema, and how to
   **verify signatures** (so we don't trust spoofed callbacks).
5. **Idempotency**: do they support an idempotency key on collection/disbursement to make
   retries safe?
6. **Status query** endpoint for reconciliation when a webhook is missed.

## Questions that affect Dusco's economics & rules

7. **Their fees** per collection, per disbursement, per bulk payout — by network/bank. (Dusco
   charges 1% with floor/cap; we need their cost to sit under that.)
8. **Settlement**: where does collected float sit, settlement timing (instant/T+1?), and the
   reconciliation/statement format. (Float is the basis of Dusco's dividend model.)
9. **Limits**: min/max per transaction, daily/velocity limits per user, and per-network
   constraints.
10. **Coverage**: confirm M-Pesa, Tigo Pesa (Mixx), Airtel Money, Halotel (Halopesa), and
    banks (CRDB, NMB, NBC, Equity…) for both in and out.

## Go-live / commercial

11. **KYC & onboarding** to move from sandbox → production: what business documents
    (registration, TIN, licences), and the **typical timeline**.
12. **Pricing tiers / minimums / monthly fees.**
13. Whether Dusco needs any **BoT / payment licence** or operates under GCA Pay's licence as
    a technical integrator (important — clarify the regulatory umbrella).

## Compliance (Tanzania PDPA, Cap. 44) — raise it, it builds trust

14. Request a **Data Processing Agreement** — under the Act, GCA Pay is a *data processor*
    handling sensitive financial-transaction data on Dusco's behalf (s.27(4)).
15. **Data residency**: are transactions stored in Tanzania / which region? (Helps Dusco's
    own transborder position.)
16. Their **breach-notification** commitment and timeline to us.

---

## What to bring / show
- The live demo: **https://soft-hamster-f4045e.netlify.app** (mock flows already model
  collect → split → disburse, so they'll instantly see where their API plugs in).
- This one-line ask: *"We're ready to integrate; we just need sandbox keys and the
  collections model confirmed."*

## After the meeting — what Dusco's engineering does
- Drop the real calls into `server/services/gcapay.js` (the adapter already documents the
  intended endpoints). `payment.js` stays unchanged.
- Add a webhook route (`POST /api/webhooks/gcapay`) with signature verification → on a
  confirmed collection, run the existing split logic.
- Add idempotency keys + status-reconciliation job.
- Sign the DPA; record GCA Pay as a processor for PDPC registration.

---

### One-paragraph pitch (if they ask "what is Dusco?")
> Dusco is a Tanzanian digital-envelope savings app. Users get a Dusco number; money sent
> to it auto-splits across their savings "bahashas." We handle the savings logic and UX and
> need a payments partner for collections, payouts, and bulk dividend disbursement across
> all networks and banks. We're built and want to integrate your sandbox now.
