-- 006_money_integers_and_idempotency.sql — applied to Supabase Postgres on 2026-11-04
--
-- UNIT DECISION: whole Tanzanian shillings.
-- TZS is transacted in whole shillings — senti are not used in practice, every
-- fee rule in the product is a whole shilling (min 500, cap 5,000, min deposit
-- 1,000), and the code already rounds to whole shillings throughout. So TZS is
-- treated as a zero-decimal currency, the way JPY and KRW are. The point of the
-- invariant is exact integer arithmetic, which this achieves without inventing
-- a sub-unit nobody transacts in.
--
-- `real` is single precision: ~7 significant digits, and it stops representing
-- integers exactly above 16,777,216 — well inside ordinary TZS balances.
-- Audited before converting: every value was already whole and none exceeded
-- that limit, so the conversion was lossless. Totals verified identical after.

ALTER TABLE bahashas     ALTER COLUMN balance TYPE BIGINT USING ROUND(balance::numeric);
ALTER TABLE transactions ALTER COLUMN amount  TYPE BIGINT USING ROUND(amount::numeric);
ALTER TABLE transactions ALTER COLUMN fee     TYPE BIGINT USING ROUND(fee::numeric);
ALTER TABLE dividends    ALTER COLUMN amount  TYPE BIGINT USING ROUND(amount::numeric);

ALTER TABLE bahashas DROP CONSTRAINT IF EXISTS bahashas_balance_non_negative;
ALTER TABLE bahashas ADD CONSTRAINT bahashas_balance_non_negative CHECK (balance >= 0);
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_fee_non_negative;
ALTER TABLE transactions ADD CONSTRAINT transactions_fee_non_negative CHECK (fee >= 0);

ALTER TABLE bahashas     ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'TZS';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'TZS';

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    response_status INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT idempotency_keys_unique UNIQUE (user_id, endpoint, key)
);
CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys(created_at);
