-- 002_user_deleted_at.sql — applied to Supabase Postgres on 2026-09-24
--
-- Account erasure marker (PDPA Cap. 44, right to erasure).
--
-- Erasure ANONYMISES the user row rather than DELETEing it. The financial
-- ledger (transactions, group ledger entries) must be retained for
-- record-keeping, and a hard DELETE would cascade it away. Once the row is
-- anonymised the retained records no longer identify anyone.
--
-- See server/services/account.js for the blockers that must clear first:
-- an outstanding balance, a group shares claim, or sole admin of a live group.

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);

COMMENT ON COLUMN users.deleted_at IS
    'When the account was erased. Non-null means the row is anonymised: identifiers scrubbed, login disabled, financial history retained under the record-keeping period.';
