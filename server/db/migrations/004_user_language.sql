-- 004_user_language.sql — applied to Supabase Postgres on 2026-09-25
--
-- Language preference, chosen at registration (English or Kiswahili).
--
-- Stored on the account rather than only in the browser so the choice follows
-- the person across devices and survives a cleared cache. Keeping it only in
-- localStorage would let the same user meet the app in English on one device
-- and Kiswahili on another, which is exactly the mixing this is meant to avoid.

ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_language_check;
ALTER TABLE users ADD CONSTRAINT users_language_check CHECK (language IN ('en', 'sw'));

COMMENT ON COLUMN users.language IS
    'UI language chosen at registration: en (English) or sw (Kiswahili).';
