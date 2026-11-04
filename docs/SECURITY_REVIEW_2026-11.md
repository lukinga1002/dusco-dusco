# Dusco — payments security review

**Date:** 2026-11-04
**Scope:** `lukinga1002/dusco` @ `b856086` (Base44 build) and the live Dusco Express/Supabase API
**Method:** source review of Base44 entity schemas, Base44 functions, client flows, and the
Dusco server routes; plus an unauthenticated probe of `dusco-smart-save.base44.app`
**Status:** this is a review, not sign-off. It does not replace penetration testing, CI secret
scanning, or regulatory review.

---

## 0. What changed since the last look

The Base44 build has grown a long way past a prototype: tiered identity verification,
transaction PINs, withdrawal limits, group loans, guarantors, automatic late-payment fines,
referrals, a finance/spending module, SMS alerts, and a ClickPesa-branded deposit flow with a
Lipa Namba.

**The architecture is now split across two backends:**

| Lives in Dusco Express + Postgres | Lives in Base44 entities |
|---|---|
| Users, bahashas, personal transactions, deposits, withdrawals, fees | Groups, contributions, loans, guarantors, fines, KYC profiles, PINs, referrals |

There is **no shared ledger and no reconciliation between the two.** Group money and personal
money are separate systems that each believe they are authoritative.

---

## 1. Findings

### [CRITICAL] Withdrawal PIN, identity tier and limits are client-side only — complete bypass

**Location:** `base44/functions/authorizeWithdrawal/entry.ts`; `src/components/dusco/security/PinPrompt.jsx:25`;
`src/components/dusco/send/SendReview.jsx:25`; `src/components/dusco/send/useSendMoney.js:38`;
`dusco/server/routes/transactions.js` (withdraw route)

**Attack:** A user opens devtools (or any HTTP client) and calls
`POST /api/transactions/withdraw` directly with their own valid JWT. No PIN is required, the
identity tier is never checked, and the monthly limit is never consulted. Every control
advertised by the "Verification & limits" feature is skipped.

**Evidence:** `authorizeWithdrawal` returns `{ authorized: true }` *to the browser*. The browser
then separately calls `api.withdraw(review.body)`. The endpoint that actually moves the money
authenticates the JWT and checks ownership, balance and lock — nothing else. A grep for
`pin`, `tier`, `kyc` or `limit` across the entire Dusco server returns **no matches**.

**Fix:** Enforcement must live where the money moves. Either
(a) move tier/limit/PIN verification into the Express withdraw route, reading from a KYC table
in Postgres; or
(b) have `authorizeWithdrawal` mint a short-lived, single-use, server-signed authorization token
bound to `{userId, amount, bahashaId, nonce, exp}`, and have the withdraw route require and
burn it. Option (a) is simpler and keeps one source of truth.
**Test:** call the withdraw endpoint with a valid JWT and no PIN → must be rejected.

---

### [CRITICAL] Deposits credit from a client-supplied amount with no provider verification

**Location:** `dusco/server/routes/transactions.js` (`POST /deposit`);
`src/components/dusco/deposit/useDeposit.js:24`; `src/lib/depositMethods.js`

**Attack:** `POST /api/transactions/deposit {"amount": 10000000, "sourceNetwork": "M-Pesa"}`
credits the caller's bahashas with ten million shillings. The amount comes from the request
body. Nothing confirms that any payment occurred.

**Evidence:** The deposit route accepts `amount` from the body, calls the mock `collectPayment`,
and splits the proceeds into bahashas. There is no provider status query, no signed callback,
and no reference reconciliation. Meanwhile the UI now presents this as a real payment —
"Confirm on your phone", "Waiting for your PIN confirmation" — and ships a **real-looking
ClickPesa Lipa Namba (`BILLPAY_NUMBER = "4821"`)**.

**Compounding risk:** if that Lipa Namba is live, real money can arrive from a user's wallet
while the credit in Dusco is driven by client input. Real funds in, unreconciled, with no
record tying them to the credited balance.

**Fix:** never credit from a callback or client payload. Credit only after a server-to-server
status query to the provider confirms reference, final success state, amount and currency.
Deduplicate on the provider transaction id with a UNIQUE constraint. Until a real integration
exists, the deposit route must be restricted to non-production use.
**Test:** forged deposit with no matching provider transaction → no credit, alert raised.

---

### [HIGH] Balance read-then-write with no lock — concurrent withdrawals can overdraw

**Location:** `dusco/server/routes/transactions.js` (withdraw)

**Attack:** Two withdrawal requests for the full balance sent simultaneously. Both read
`bahasha.balance`, both pass the `amount > balance` check, both write
`balance = bahasha.balance - amount`. The account goes negative or one withdrawal is free.

**Evidence:** `select * from bahashas` → check → `update balance = bahasha.balance - amount`,
with no transaction, no `SELECT … FOR UPDATE`, and no conditional update.

**Fix:** perform the debit as a single atomic conditional statement
(`UPDATE bahashas SET balance = balance - $1 WHERE id = $2 AND balance >= $1 RETURNING *`) inside
a transaction, and add a CHECK constraint forbidding negative balances.
**Test:** two racing withdrawals against a balance covering one → exactly one succeeds.

---

### [HIGH] Funds are disbursed before the debit is recorded

**Location:** `dusco/server/routes/transactions.js` (withdraw)

**Failure:** `disburseFunds(...)` is called first; the balance update and ledger rows are written
afterwards. A crash, timeout or deploy between the two leaves money gone from the provider with
no debit and no transaction record. A provider timeout is "unknown", not "failed", so a naive
retry pays twice.

**Fix:** reserve/hold the funds and write a `pending` record first, call the provider with an
idempotency key, then settle or release based on the confirmed result.

---

### [HIGH] Money is stored as floating point on both backends

**Location:** Supabase `bahashas.balance`, `transactions.amount`, `transactions.fee` are `real`
(float4); Base44 `GroupContribution.amount`, `fines_deducted`, `rejesho_allocated`,
`social_allocated`, `loan_repayment_allocated`, `shares_purchased`, `partial_share_held` are
JSON Schema `"type": "number"`.

**Failure:** float arithmetic drifts. Repeated percentage splits, fee deductions and loan
interest will not sum back to the total, and `real` (single precision) loses exactness above
~16.7 million — well inside normal TZS balances.

**Fix:** integers in minor units everywhere. Migrate Postgres columns to `BIGINT` and the Base44
numeric fields to integers, with explicit, deterministic rounding and remainder assignment on
every split.

---

### [HIGH] No idempotency on any money-moving endpoint

**Location:** deposit, withdraw, group withdraw, group contribution

**Failure:** a retried or double-submitted request moves money twice. Mobile networks in
Tanzania make retries common.

**Fix:** client-supplied idempotency key, UNIQUE constraint, second attempt returns the first
result.

---

### [HIGH] `GroupContribution.payment_reference` is neither unique nor required

**Location:** `base44/entities/GroupContribution.jsonc`

**Failure:** the field is documented as "Provider transaction id or cash receipt number", but
`required` is only `[group_id, member_id, amount]` and no uniqueness is declared. The same
provider reference can be recorded repeatedly, each time crediting a member's contributions and
shares. In a kikoba this is member-against-member fraud, not just a platform problem.

**Fix:** make the reference required for non-cash methods and unique per group; reject duplicates
at the datastore, not in application code.

---

### [HIGH] Monthly withdrawal limit has a race, and is consumed at authorization rather than settlement

**Location:** `base44/functions/authorizeWithdrawal/entry.ts`

**Failure:** `currentUsage(profile)` → check → `KycProfile.update(...)` is a read-modify-write
with no locking, so concurrent authorizations each see the old total and all pass. Separately,
the limit is debited when *authorized*, not when the withdrawal actually settles — so a failed
withdrawal still consumes the user's monthly allowance, and authorizations that never result in
a withdrawal silently burn it.

**Fix:** atomic conditional increment, and reconcile consumed limit against settled withdrawals.

---

### [MEDIUM] No ledger, and no reconciliation between the two backends

Balances are mutable fields; `transactions` is an event log, not a double-entry journal. Nothing
proves debits equal credits, and nothing reconciles Base44 group money against Postgres personal
money. A drift would be invisible.

**Fix:** append-only double-entry journal with balances derived or reconciled from it, plus a
daily reconciliation job that alerts on any break.

---

### [MEDIUM] Row Level Security still disabled on every Supabase table

Pre-existing and previously documented in `docs/RLS_DESIGN.md`. Now more serious: the anon key
remains a key to the whole database, and the dataset has grown. Phase 1 (service-role key +
deny-all RLS) is prepared and waiting on the key being set in Render.

---

### [MEDIUM] Admin tools have no maker-checker, MFA or audit trail

`/admin` exists with a single shared credential and no second-person approval on anything that
touches funds, and no audit log of admin actions.

---

### [LOW] ClickPesa appears to be presentational

No ClickPesa API client, credentials, signature verification or callback handler exists anywhere
in the repository — only UI copy, a Lipa Namba constant, and payment-method labels. The commit
"Implement full ClickPesa deposit flow" delivers the *interface*, not the integration. Worth
knowing before telling a partner the integration is done.

---

## 2. What is genuinely well done

- **PIN handling is strong:** PBKDF2-SHA256 at 120,000 iterations, 16-byte random salt per
  profile, constant-time comparison, lockout after 3 attempts, and rejection of trivially
  guessable PINs. Better than most production implementations.
- `authorizeWithdrawal` validates `Number.isSafeInteger(amount)` — the one place integers are
  enforced.
- Base44 entity endpoints return `403` to unauthenticated callers; no open data access.
- No Dusco secrets in the client bundle; the only client-side tokens are Base44's own
  publishable Turnstile and Datadog values.
- The tier model itself (0/1/2 with per-transaction and monthly caps, group withdrawals
  requiring full verification) is sensible policy — it simply is not enforced where it matters.

---

## 3. What was checked, and what was not

**Checked:** Base44 entity schemas; all Base44 functions and shared modules; the client money
flows (deposit, send, group contribution, loans, fines); the Dusco Express routes for deposit,
withdraw, group withdraw and auth; the unauthenticated HTTP surface of the deployed app; the
client bundle and runtime config for secrets.

**Not checked:** the signed-in application (I did not create an account or sign in to a
production host); Base44's runtime guarantees — whether its datastore offers transactions, row
locking or unique indexes is not inspectable from the repository and must be confirmed with
Base44; ClickPesa's actual API contract, since no integration code exists yet; load and
concurrency behaviour under real traffic.

**Assumptions to confirm:** that this build currently holds **no real money and no real customer
personal data**; that the Lipa Namba `4821` is not a live collection account; and that Base44
provides no cross-tenant isolation guarantee beyond app-level privacy.

---

## 4. Recommended order

1. **Do not connect real money to this build.** Two critical findings allow self-credit and
   unauthorised withdrawal today.
2. Move PIN/tier/limit enforcement into the money-moving endpoints.
3. Make the deposit path verify with the provider before crediting; restrict the simulator to
   non-production.
4. Atomic conditional debits + CHECK constraint; integers in minor units; idempotency keys.
5. Complete RLS Phase 1 (already prepared — needs the service-role key in Render).
6. Then ledger and reconciliation.
