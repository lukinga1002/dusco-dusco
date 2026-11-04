-- 005_kyc_profiles.sql — applied to Supabase Postgres on 2026-11-04
--
-- Identity tier, transaction PIN and withdrawal limits.
--
-- These controls previously lived only in a Base44 function that answered the
-- BROWSER with { authorized: true }. The endpoint that actually moves money
-- never consulted them, so calling it directly skipped the PIN, the tier and
-- the monthly cap entirely. Moving the data here lets the money path enforce
-- them. See docs/SECURITY_REVIEW_2026-11.md finding 1.
--
-- tier 0 = unverified (may save and receive, may NOT send out)
-- tier 1 = basic      (personal withdrawals)
-- tier 2 = full       (group withdrawals, highest limits)

CREATE TABLE IF NOT EXISTS kyc_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL DEFAULT 0 CHECK (tier IN (0, 1, 2)),
    pin_hash TEXT,
    pin_salt TEXT,
    pin_failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (pin_failed_attempts >= 0),
    pin_locked_until TIMESTAMPTZ,
    period TEXT,
    period_withdrawn_tzs BIGINT NOT NULL DEFAULT 0 CHECK (period_withdrawn_tzs >= 0),
    full_name TEXT,
    region TEXT,
    date_of_birth DATE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user ON kyc_profiles(user_id);

COMMENT ON TABLE kyc_profiles IS
    'Identity tier, transaction PIN and withdrawal limits. Enforced server-side in the withdrawal routes; never trust a client-side authorization result.';
COMMENT ON COLUMN kyc_profiles.tier IS
    'Set only by a verification flow or an administrator. A user must never be able to raise their own tier.';

-- Existing accounts keep working at Basic. New accounts start at 0 and must
-- verify before sending money out, which is the intended policy.
INSERT INTO kyc_profiles (user_id, tier)
SELECT id, 1 FROM users WHERE deleted_at IS NULL
ON CONFLICT (user_id) DO NOTHING;
