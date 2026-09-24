-- 001_consents.sql — applied to Supabase Postgres on 2026-09-24
--
-- Append-only consent audit log (Personal Data Protection Act, Cap. 44, 2023).
-- Rows are NEVER updated or deleted: each grant or withdrawal inserts a new
-- row, so the full history of what a user agreed to — and when — stays
-- auditable. Current state for a purpose = the most recent row for that
-- (user_id, purpose).
--
-- Data minimisation: no IP address or user agent is stored. The record holds
-- only what is needed to demonstrate a decision was made.
--
-- NOTE: server/db/schema.sql is the legacy SQLite schema and is NOT the live
-- database. The live database is Postgres on Supabase; migrations live here.

CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    policy_version TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'registration',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consents_user_purpose_time
    ON consents(user_id, purpose, created_at DESC);

COMMENT ON TABLE consents IS
    'Append-only record of data-processing consent decisions. Never UPDATE or DELETE rows; insert a new row to change state.';
COMMENT ON COLUMN consents.purpose IS
    'What the user consented to, e.g. service_operation, marketing.';
COMMENT ON COLUMN consents.policy_version IS
    'Version of the privacy notice in force when the decision was recorded.';
COMMENT ON COLUMN consents.source IS
    'Where the decision was captured, e.g. registration, settings.';
