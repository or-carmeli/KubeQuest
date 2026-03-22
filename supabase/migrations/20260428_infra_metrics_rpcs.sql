-- ── Infrastructure Metrics Collection RPCs ───────────────────────────────────
-- Called by the collect-metrics edge function with SERVICE_KEY.
-- These read from PostgreSQL system views that are not accessible via PostgREST.
-- All SECURITY DEFINER to execute with elevated privileges.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. Connection stats from pg_stat_activity
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_connection_stats()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'active', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'idle',   (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle'),
    'total',  (SELECT count(*) FROM pg_stat_activity)
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Max connections from pg_settings
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_max_connections()
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT setting::INT FROM pg_settings WHERE name = 'max_connections';
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Database stats from pg_stat_database
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'xact_commit',   xact_commit,
    'xact_rollback', xact_rollback,
    'blks_hit',      blks_hit,
    'blks_read',     blks_read,
    'deadlocks',     deadlocks,
    'db_size_bytes', pg_database_size(datname)
  )
  FROM pg_stat_database
  WHERE datname = current_database();
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Slow queries from pg_stat_statements (if extension is available)
--    Returns null-safe results even if the extension is not installed.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_has_extension BOOLEAN;
BEGIN
  -- Check if pg_stat_statements extension exists
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
  ) INTO v_has_extension;

  IF NOT v_has_extension THEN
    RETURN json_build_object(
      'slow_count', NULL,
      'top_query', NULL,
      'top_query_ms', NULL,
      'available', false
    );
  END IF;

  -- Count queries with mean execution time > 1 second
  EXECUTE $q$
    SELECT json_build_object(
      'slow_count', (SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 1000),
      'top_query', (
        SELECT left(query, 200)
        FROM pg_stat_statements
        WHERE calls > 0
        ORDER BY mean_exec_time DESC
        LIMIT 1
      ),
      'top_query_ms', (
        SELECT round(mean_exec_time::numeric, 2)
        FROM pg_stat_statements
        WHERE calls > 0
        ORDER BY mean_exec_time DESC
        LIMIT 1
      ),
      'available', true
    )
  $q$ INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'slow_count', NULL,
      'top_query', NULL,
      'top_query_ms', NULL,
      'available', false,
      'error', SQLERRM
    );
END;
$$;
