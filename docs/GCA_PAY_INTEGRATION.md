# GCA Pay integration — how to go live

The payment layer is built to flip from **mock → live with only environment variables**.
No code change is required to switch; you only adjust field/endpoint names if GCA Pay's
sandbox docs differ from the sensible defaults.

## Files
- `server/services/gcapay.js` — the adapter. Real HTTP when keys are set, mock otherwise.
  Also holds `verifyWebhookSignature()`.
- `server/services/deposits.js` — `applyIncomingCollection()`: the single split routine used
  by both the in-app deposit and the webhook.
- `server/routes/webhooks.js` — `POST /api/webhooks/gcapay` (signature-verified, idempotent).
- `server/services/payment.js` — unchanged interface (`collectPayment`, `disburseFunds`,
  `bulkPayout`, `getTransactionStatus`); routes call this, it calls the adapter.

## Switch to live — set these env vars on Render
```
GCAPAY_BASE_URL=https://sandbox.gca-pay.com/api/v1   # from GCA Pay
GCAPAY_API_KEY=<sandbox key>
GCAPAY_SECRET=<request-signing secret, if they use one>
GCAPAY_WEBHOOK_SECRET=<secret they sign webhooks with>
# GCAPAY_MOCK=false   (default; set true to force mock)
# Path overrides only if their endpoints differ:
# GCAPAY_PATH_COLLECT=/collections
# GCAPAY_PATH_DISBURSE=/disbursements
# GCAPAY_PATH_BULK=/bulk-payouts
# GCAPAY_PATH_STATUS=/transactions
```
`GET /api/health` reports `"gcapay":"live"` once keys are present.

## The webhook URL to give GCA Pay
```
https://dusco-dusco.onrender.com/api/webhooks/gcapay
```
- Verifies `HMAC-SHA256(rawBody, GCAPAY_WEBHOOK_SECRET)` against the signature header
  (`X-GCAPay-Signature` / `X-Signature` — it accepts either; confirm theirs).
- Rejects bad signatures with **401**; accepts and processes valid ones with **200**.
- Idempotent: each `event_id` is stored once (`webhook_events` table); duplicates are ack'd.
- On a successful **collection**, it resolves the Dusco number (`account_reference`) → user →
  splits the money into their bahashas (same logic as in-app deposits).
- On a **disbursement** event, it marks the matching withdrawal `completed`/`failed`.

## What to confirm with GCA Pay (then tweak in one place)
1. **Auth scheme** — Bearer key? request HMAC header name? → `gcapay.js` `call()`.
2. **Collection model** — do they post the Dusco number back as `account_reference`? If they
   use a different field, update `normalize()` in `routes/webhooks.js`.
3. **Event names/shape** — the router matches on substrings (`collect`, `disburse`, `success`,
   `fail`); lock these to their exact values.
4. **Signature algorithm & header** — adjust `verifyWebhookSignature()` if not HMAC-SHA256 hex.

## Tested locally (mock)
- `GET /api/webhooks/gcapay` → `{ ok: true }`
- Valid HMAC collection webhook → **200**, money split into bahashas.
- Bad signature → **401**.
- Duplicate `event_id` → **200 `{ duplicate: true }`** (no double credit).

## Still to add before production (out of scope for sandbox)
- Idempotency keys on outbound collect/disburse calls (retry-safe).
- A reconciliation job that polls `getTransactionStatus()` for events missed by webhook.
- Move `JWT_SECRET`/admin creds to strong secrets; re-enable Supabase RLS (see PDPA_COMPLIANCE.md).
