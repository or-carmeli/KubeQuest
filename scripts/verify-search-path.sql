-- ══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION: search_path pinning on all SECURITY DEFINER functions
-- Run this in the Supabase SQL Editor after applying migrations 20260430 + 20260501
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. List every SECURITY DEFINER function and its search_path setting.
--    Expected: every row should show search_path = '' (empty string).
--    If any row shows NULL or a non-empty path, it was missed.

SELECT
  p.proname                          AS function_name,
  pg_get_function_arguments(p.oid)   AS arguments,
  'SECURITY DEFINER'                 AS security,
  (SELECT cfg FROM unnest(p.proconfig) AS cfg WHERE cfg LIKE 'search_path=%' LIMIT 1)
                                     AS search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- 2. Flag any SECURITY DEFINER function that does NOT have search_path pinned.
--    Expected: zero rows.

SELECT
  p.proname AS unpinned_function,
  pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (p.proconfig IS NULL OR NOT EXISTS (
    SELECT 1 FROM unnest(p.proconfig) AS cfg
    WHERE cfg LIKE 'search_path=%'
  ))
ORDER BY p.proname;

-- 3. Smoke-test: call read-only RPCs to confirm they resolve tables correctly.
--    Each should return data or an empty set (not an error).

SELECT 'get_system_status' AS rpc, count(*) FROM get_system_status();
SELECT 'get_leaderboard' AS rpc, count(*) FROM get_leaderboard(5);
SELECT 'get_active_maintenance' AS rpc, count(*) FROM get_active_maintenance();
SELECT 'get_all_incidents' AS rpc, count(*) FROM get_all_incidents();
SELECT 'get_infra_metrics_latest' AS rpc, count(*) FROM get_infra_metrics_latest();
SELECT 'is_maintenance_active' AS rpc, is_maintenance_active();
SELECT 'get_health_summary' AS rpc, get_health_summary();
SELECT 'get_db_connection_stats' AS rpc, get_db_connection_stats();
SELECT 'get_db_max_connections' AS rpc, get_db_max_connections();
SELECT 'get_db_stats' AS rpc, get_db_stats();
SELECT 'get_slow_queries' AS rpc, get_slow_queries();
SELECT 'get_war_room_interest_count' AS rpc, get_war_room_interest_count();
SELECT 'get_api_activity_5m' AS rpc, get_api_activity_5m();

-- 4. Verify auth guards: these should FAIL with "Not authenticated"
--    when called without a session (from SQL Editor = no auth context).
--    Uncomment one at a time to test:

-- SELECT check_quiz_answer(1, 0);
-- SELECT check_daily_answer(1, 0);
-- SELECT check_incident_answer(1, 0);
-- SELECT save_user_progress('test', 0, 0, 0, 0, 0, '{}'::jsonb, '[]'::jsonb, '{}'::jsonb);
-- SELECT get_user_rank('00000000-0000-0000-0000-000000000000'::uuid);
