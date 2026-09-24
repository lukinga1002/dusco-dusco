# Row Level Security — design

**Status:** proposed, not applied
**Date:** 2026-09-24
**Applies to:** Supabase project `wgttzppwrsqmhetyotxh` (14 tables, RLS currently disabled on all of them)

---

## 1. The finding that decides the design

Before writing a single policy, three facts had to be established. All three were verified
in the codebase, not assumed:

| Question | Answer | Evidence |
|---|---|---|
| Does the browser talk to Supabase directly? | **No.** | Neither `client/src` nor `client-v2/src` contains a single Supabase import, and neither `package.json` depends on `@supabase/supabase-js`. All data access goes through the Express API. |
| Does Dusco use Supabase Auth? | **No.** | Authentication is a self-issued JWT verified in `server/middleware/auth.js`. There is no Supabase session anywhere. |
| What else reaches the database? | **Nothing.** | The anon key is referenced in exactly one place, `server/db/database.js:6`. The project has no Edge Functions. |

So the architecture is: **one trusted server process, holding one key, is the sole consumer
of the database.**

That single fact determines everything below.

---

## 2. Why the textbook Supabase answer is the wrong answer here

The standard Supabase RLS pattern is:

```sql
CREATE POLICY "users read own rows" ON bahashas
  FOR SELECT USING (auth.uid() = user_id);
```

**This would break Dusco completely, and it would not secure anything.**

`auth.uid()` reads the user id out of a *Supabase Auth* JWT. Dusco issues its own JWT and
never gives Supabase a session, so every query arrives at Postgres as the anonymous role
with no identity attached. `auth.uid()` would evaluate to `NULL`, every policy would fail
closed, and the application would stop working the moment RLS was switched on — which is
exactly the failure mode the Supabase advisory warns about.

There is no way to express "this row belongs to this user" in RLS until Postgres is told
*which* user a request belongs to. Today it is never told. Closing that gap properly is
Phase 2 below, and it is a larger change than it first appears.

---

## 3. Recommended design (Phase 1): privileged server + deny-all RLS

Because exactly one trusted process talks to the database, and that process already enforces
per-user authorization in the API layer, the correct model is:

1. The Express server authenticates as **`service_role`**, which bypasses RLS by design.
2. RLS is **enabled on every table** with **no permissive policies at all**.
3. The `anon` and `authenticated` roles therefore have access to **nothing**.

The effect is that the anon key — currently a key to the entire database — becomes an inert
credential. Anyone who obtains it can read and write nothing.

This is Supabase's own recommended pattern for a trusted backend, and it is small: one
environment variable, one line of code, one migration. **No application logic changes.**

### 3.1 The migration

```sql
-- Deny-all RLS. No policies are created, so no role except service_role
-- (which bypasses RLS) can read or write any row.
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
```

`admin_settings` and `webhook_events` deserve particular note: neither should ever be
reachable by a client under any circumstances, and deny-all is exactly right for them.

### 3.2 The code change

`server/db/database.js`:

```js
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // was SUPABASE_ANON_KEY
);
```

### 3.3 Order of operations — this matters

Doing these in the wrong order takes the service down.

1. Add `SUPABASE_SERVICE_ROLE_KEY` to the Render environment. **Leave the anon key in place.**
2. Deploy the one-line code change. **Verify the app still works** (login, wallets, deposit).
3. *Only then* run the migration to enable RLS.
4. Verify the app still works — it should be unaffected, because `service_role` bypasses RLS.
5. Verify the anon key is now inert (§5).
6. **Rotate the old anon key.** It has been exposed in `render.yaml` and in working
   transcripts, and should not be left valid even though it no longer grants access.

**Rollback:** `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;`. The application keeps working
either way, because `service_role` ignores RLS in both states — so this is a low-risk change
with a clean escape hatch.

### 3.4 Handling the service_role key

`service_role` bypasses **all** database security. It is strictly more dangerous than the key
it replaces, so:

- It must **never** appear in a client bundle, a `VITE_*` variable, or a committed file.
- It should be set in the **Render dashboard**, not written into `render.yaml` — that file
  already carries the anon key inline, and the service key must not follow it into a place
  where a change to `.gitignore` could expose it.
- It must not be logged. The health endpoint must continue to report only `live`/`mock`.

---

## 4. What this does and does not buy

Being precise about this matters more than the change itself.

**It does:**
- Make a leaked anon key worthless, closing the current "anyone with the key owns the
  database" exposure.
- Put access control at the data layer, which is what PDPA s.27 and the Supabase security
  advisor are both asking for.
- Protect `webhook_events`, `admin_settings` and every user table from direct access.

**It does not:**
- Protect against a bug in the Express layer. Because `service_role` bypasses RLS, a route
  that forgets its `.eq('user_id', req.userId)` filter would still leak across users. **The
  API layer remains the only per-user access control.** RLS is a second lock on the front
  door, not a lock on each room.

That residual risk is real and should be stated plainly rather than papered over. It is
mitigated today by convention (every route filters by `req.userId`) and would be mitigated
structurally by Phase 2.

---

## 5. Verification

After applying, prove the anon key is inert — do not assume it:

```bash
# Expect an RLS denial or an empty result, never user rows.
curl -s "$SUPABASE_URL/rest/v1/users?select=id,name&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Expect the same for every sensitive table.
curl -s "$SUPABASE_URL/rest/v1/transactions?select=id&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"
curl -s "$SUPABASE_URL/rest/v1/webhook_events?select=id&limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

And prove the application is unaffected:

```bash
curl -s https://dusco-dusco.onrender.com/api/health
# login → wallets → simulated deposit → group detail → settings
```

Re-run the Supabase security advisor afterwards; the `rls_disabled` advisory should clear.

---

## 6. Phase 2 (optional, later): real per-user isolation

If you later want RLS to enforce per-user isolation as genuine defence-in-depth — so that an
API bug cannot leak another user's rows — Postgres has to learn who each request is for.

The pattern is a per-request setting inside a transaction:

```sql
-- per request, inside a transaction
SET LOCAL app.user_id = '42';

-- policy
CREATE POLICY "own rows" ON bahashas
  USING (user_id = current_setting('app.user_id', true)::int);
```

**The catch:** `supabase-js` talks to PostgREST, which gives you no transaction to run
`SET LOCAL` in. Adopting this means replacing PostgREST access with a pooled direct
Postgres client (`pg` via Supavisor) and rewriting every query in the server — a
significant piece of work, and a new connection-pooling concern on a free tier.

**Recommendation: do not do this before the pilot.** Phase 1 removes the actual exposure.
Phase 2 is an architectural upgrade to weigh once there is real money and real users, and it
is worth revisiting alongside the bank/custody integration, when the data model will be
under review anyway.

---

## 7. Recommendation

Apply **Phase 1** before the pilot. It is roughly thirty minutes of work with a one-statement
rollback, and it converts the single largest open security item from "total compromise if the
key leaks" to "the key does nothing".

Treat **Phase 2** as a post-pilot architectural decision, not a launch blocker.

---

*Related: `docs/PDPA_COMPLIANCE.md` (R-items and remaining gaps),
`server/db/migrations/` (applied schema changes).*
