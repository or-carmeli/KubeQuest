-- ── Infrastructure Metrics ────────────────────────────────────────────────────
-- Stores periodic infrastructure snapshots collected by the collect-metrics
-- edge function. Designed for the Infrastructure Insights dashboard.
--
-- Collected every ~5 minutes by the edge function using SERVICE_KEY.
-- Retention: 90 days (raw), aggregated via existing rollup mechanism.

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. TABLE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS infra_metrics (
  id            BIGSERIAL PRIMARY KEY,
  collected_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Database metrics (from pg_stat_activity + pg_stat_database)
  db_connections_active   INT,          -- current active connections
  db_connections_idle     INT,          -- idle connections
  db_connections_total    INT,          -- total connections (active + idle + other)
  db_max_connections      INT,          -- server max_connections setting
  db_xact_commit          BIGINT,       -- cumulative committed transactions
  db_xact_rollback        BIGINT,       -- cumulative rolled back transactions
  db_blks_hit             BIGINT,       -- buffer cache hits
  db_blks_read            BIGINT,       -- disk reads (lower is better)
  db_deadlocks            BIGINT,       -- cumulative deadlock count
  db_size_bytes           BIGINT,       -- database size in bytes

  -- Slow query snapshot (from pg_stat_statements if available)
  slow_query_count        INT,          -- queries with mean_exec_time > 1000ms
  top_slow_query          TEXT,         -- text of slowest query (truncated)
  top_slow_query_ms       FLOAT,        -- mean execution time of slowest query

  -- Supabase-specific (from health check details)
  db_latency_ms           INT,          -- latest DB health check latency
  auth_latency_ms         INT,          -- latest Auth health check latency
  api_latency_ms          INT,          -- latest Content API health check latency

  -- Metadata
  collector_version       TEXT DEFAULT '1'
);

CREATE INDEX IF NOT EXISTS idx_infra_metrics_time
  ON infra_metrics (collected_at DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ROW-LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE infra_metrics ENABLE ROW LEVEL SECURITY;

-- Public read (DEV dashboards read via anon key)
CREATE POLICY "public_read_infra_metrics" ON infra_metrics FOR SELECT USING (true);

-- No direct write via PostgREST. Writes go through the edge function with SERVICE_KEY.

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. READ RPCs
-- ══════════════════════════════════════════════════════════════════════════════

-- Get recent infra metrics snapshots (for time-series charts)
CREATE OR REPLACE FUNCTION get_infra_metrics(p_minutes INT DEFAULT 60)
RETURNS SETOF infra_metrics
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT *
  FROM infra_metrics
  WHERE collected_at >= now() - (p_minutes || ' minutes')::INTERVAL
  ORDER BY collected_at ASC;
$$;

-- Get the latest single snapshot (for summary cards)
CREATE OR REPLACE FUNCTION get_infra_metrics_latest()
RETURNS SETOF infra_metrics
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM infra_metrics ORDER BY collected_at DESC LIMIT 1;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. RETENTION
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_infra_metrics()
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  deleted INT;
BEGIN
  DELETE FROM infra_metrics WHERE collected_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;
