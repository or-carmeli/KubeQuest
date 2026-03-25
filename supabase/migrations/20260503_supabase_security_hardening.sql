-- ── Supabase Security Hardening ──────────────────────────────────────────────
--
-- Resolves all ERROR and WARN findings from the Supabase database linter.
--
-- ERRORs fixed:
--   1. get_leaderboard view (SECURITY DEFINER) — drop orphan view
--   2. page_views — enable RLS (+ deny-all, table is unused)
--   3. answer_check_log — enable RLS (accessed only by SECURITY DEFINER RPCs)
--
-- WARNs fixed:
--   4. set_updated_at() — pin search_path
--   5. (removed — pg_net is Supabase-managed; relocate via dashboard if needed)
--   6. analytics_events INSERT policy — enforce event_type + timestamp guard
--   7. observability_events INSERT policy — add payload-size guard
--   8. war_room_interest INSERT policy — restrict to one row per caller
--   9. arch_scenarios_interest INSERT policy — restrict to one row per caller

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Drop orphan SECURITY DEFINER view `get_leaderboard`
-- ══════════════════════════════════════════════════════════════════════════════
-- A view named get_leaderboard existed alongside the RPC function of the same
-- name. The function (already pinned in 20260501) is the one actually called.
DROP VIEW IF EXISTS public.get_leaderboard;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. page_views — enable RLS (table is not referenced in application code)
-- ══════════════════════════════════════════════════════════════════════════════
ALTER TABLE IF EXISTS public.page_views ENABLE ROW LEVEL SECURITY;
-- No policies: default-deny. If the table is truly unused, consider dropping it.

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. answer_check_log — enable RLS
-- ══════════════════════════════════════════════════════════════════════════════
-- Only SECURITY DEFINER functions (check_quiz_answer, check_daily_answer,
-- check_incident_answer) access this table; they bypass RLS.
ALTER TABLE public.answer_check_log ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. set_updated_at() — pin search_path to prevent search-path hijack
-- ══════════════════════════════════════════════════════════════════════════════
-- This function exists in the DB (likely created via dashboard) but was never
-- in any migration file. Recreate it with SET search_path = ''.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. pg_net — SKIPPED
-- ══════════════════════════════════════════════════════════════════════════════
-- pg_net is a Supabase-managed extension and its functions (net.http_post etc.)
-- are used by the health-check cron job.  Relocating via migration risks
-- breaking the cron or conflicting with Supabase's managed setup.
-- Address via Supabase dashboard if needed.

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. analytics_events — tighten INSERT policy
-- ══════════════════════════════════════════════════════════════════════════════
-- Cannot require auth (anonymous visitor analytics), but we enforce valid
-- event_types and require recent timestamps for live traffic.
-- Seed data (source = 'vercel_seed') is exempt from the timestamp constraint
-- so that seedAnalyticsFromSnapshot() can backfill historical data.
DROP POLICY IF EXISTS "public_insert_analytics" ON public.analytics_events;
CREATE POLICY "public_insert_analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    event_type IN ('session_start', 'page_view', 'custom_event')
    AND (
      source = 'vercel_seed'
      OR (
        created_at >= now() - interval '5 minutes'
        AND created_at <= now() + interval '1 minute'
      )
    )
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. observability_events — tighten INSERT policy
-- ══════════════════════════════════════════════════════════════════════════════
-- Dev-mode telemetry; anonymous inserts required but constrain timestamp.
DROP POLICY IF EXISTS "public_insert_observability" ON public.observability_events;
CREATE POLICY "public_insert_observability"
  ON public.observability_events FOR INSERT
  WITH CHECK (
    ts >= now() - interval '5 minutes'
    AND ts <= now() + interval '1 minute'
    AND pg_column_size(payload) <= 8192
  );

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. war_room_interest — tighten INSERT policy (dedup guard)
-- ══════════════════════════════════════════════════════════════════════════════
-- Unique constraints already prevent duplicate rows, but the policy was fully
-- open.  Limit to authenticated users (anon pathway uses the RPC which is
-- SECURITY DEFINER and bypasses RLS).
DROP POLICY IF EXISTS "Anyone can insert interest" ON public.war_room_interest;
CREATE POLICY "authenticated_insert_war_room"
  ON public.war_room_interest FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. arch_scenarios_interest — tighten INSERT policy (dedup guard)
-- ══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Anyone can insert interest" ON public.arch_scenarios_interest;
CREATE POLICY "authenticated_insert_arch_scenarios"
  ON public.arch_scenarios_interest FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- INFOs (no action required):
-- ══════════════════════════════════════════════════════════════════════════════
-- daily_questions, incident_steps, quiz_questions, score_events:
--   RLS is enabled with no policies = default deny.  This is intentional;
--   all access goes through SECURITY DEFINER RPCs.
--
-- auth_leaked_password_protection:
--   Dashboard-level setting, not addressable via SQL migration.
--   Enable at: Authentication > Providers > Email > "Leaked password protection"
