-- 003_enable_rls.sql — NOT YET APPLIED
--
-- Deny-all row level security. See docs/RLS_DESIGN.md for why this, and not
-- auth.uid() policies: Dusco does not use Supabase Auth, so auth.uid() is NULL
-- on every request and policies built on it would fail closed and take the
-- service down while securing nothing.
--
-- No policies are created. service_role bypasses RLS, so the Express server
-- (the only consumer of this database) is unaffected, while the anon and
-- authenticated roles are left with access to nothing and the anon key becomes
-- an inert credential.
--
-- PRECONDITION — do not run this until BOTH are true:
--   1. SUPABASE_SERVICE_ROLE_KEY is set in the Render environment, and
--   2. the deployed server logs "Supabase: service-role key" at startup.
-- Running it while the server is still on the anon key denies every query and
-- takes the application down.
--
-- ROLLBACK: swap ENABLE for DISABLE below. The application works either way,
-- because service_role ignores RLS in both states.

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bahashas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_bahashas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_shares       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events     ENABLE ROW LEVEL SECURITY;
