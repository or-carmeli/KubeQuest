-- ── Observability Rollups ────────────────────────────────────────────────────
--
-- Supports long-term historical views (up to 24 months) in System Observability.
--
-- Strategy:
--   - Raw history (system_status_history) kept for 90 days (existing policy)
--   - Hourly rollups for 7d-30d views
--   - Daily rollups for 3mo+ views
--   - Weekly rollups computed on-the-fly from daily rollups
--
-- The rollup tables are populated by a single RPC that can be called from
-- the health-check edge function or a scheduled cron.

-- ── 1. Hourly rollup table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS status_rollup_hourly (
  id            SERIAL PRIMARY KEY,
  service_name  TEXT NOT NULL,
  bucket_hour   TIMESTAMPTZ NOT NULL,
  total_checks  INT NOT NULL DEFAULT 0,
  ok_checks     INT NOT NULL DEFAULT 0,
  down_checks   INT NOT NULL DEFAULT 0,
  degraded_checks INT NOT NULL DEFAULT 0,
  avg_latency_ms INT,
  min_latency_ms INT,
  max_latency_ms INT,
  p95_latency_ms INT,
  UNIQUE (service_name, bucket_hour)
);

CREATE INDEX IF NOT EXISTS idx_srh_time ON status_rollup_hourly (bucket_hour DESC);
CREATE INDEX IF NOT EXISTS idx_srh_svc_time ON status_rollup_hourly (service_name, bucket_hour DESC);

-- ── 2. Daily rollup table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS status_rollup_daily (
  id            SERIAL PRIMARY KEY,
  service_name  TEXT NOT NULL,
  bucket_day    DATE NOT NULL,
  total_checks  INT NOT NULL DEFAULT 0,
  ok_checks     INT NOT NULL DEFAULT 0,
  down_checks   INT NOT NULL DEFAULT 0,
  degraded_checks INT NOT NULL DEFAULT 0,
  avg_latency_ms INT,
  min_latency_ms INT,
  max_latency_ms INT,
  p95_latency_ms INT,
  UNIQUE (service_name, bucket_day)
);

CREATE INDEX IF NOT EXISTS idx_srd_time ON status_rollup_daily (bucket_day DESC);
CREATE INDEX IF NOT EXISTS idx_srd_svc_time ON status_rollup_daily (service_name, bucket_day DESC);

-- ── 3. Rollup computation RPC ───────────────────────────────────────────────
-- Computes hourly and daily rollups from raw history.
-- Safe to call repeatedly (upserts via ON CONFLICT).

CREATE OR REPLACE FUNCTION compute_status_rollups()
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  hourly_count INT := 0;
  daily_count  INT := 0;
BEGIN
  -- Hourly rollups from raw history (last 48 hours to catch late writes)
  INSERT INTO status_rollup_hourly
    (service_name, bucket_hour, total_checks, ok_checks, down_checks, degraded_checks,
     avg_latency_ms, min_latency_ms, max_latency_ms, p95_latency_ms)
  SELECT
    service_name,
    date_trunc('hour', checked_at) AS bucket_hour,
    COUNT(*) AS total_checks,
    COUNT(*) FILTER (WHERE status = 'operational') AS ok_checks,
    COUNT(*) FILTER (WHERE status = 'down') AS down_checks,
    COUNT(*) FILTER (WHERE status = 'degraded') AS degraded_checks,
    ROUND(AVG(latency_ms))::INT AS avg_latency_ms,
    MIN(latency_ms) AS min_latency_ms,
    MAX(latency_ms) AS max_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::INT AS p95_latency_ms
  FROM system_status_history
  WHERE checked_at >= now() - INTERVAL '48 hours'
  GROUP BY service_name, date_trunc('hour', checked_at)
  ON CONFLICT (service_name, bucket_hour) DO UPDATE SET
    total_checks   = EXCLUDED.total_checks,
    ok_checks      = EXCLUDED.ok_checks,
    down_checks    = EXCLUDED.down_checks,
    degraded_checks = EXCLUDED.degraded_checks,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms;

  GET DIAGNOSTICS hourly_count = ROW_COUNT;

  -- Daily rollups from hourly rollups
  INSERT INTO status_rollup_daily
    (service_name, bucket_day, total_checks, ok_checks, down_checks, degraded_checks,
     avg_latency_ms, min_latency_ms, max_latency_ms, p95_latency_ms)
  SELECT
    service_name,
    date_trunc('day', bucket_hour)::DATE AS bucket_day,
    SUM(total_checks) AS total_checks,
    SUM(ok_checks) AS ok_checks,
    SUM(down_checks) AS down_checks,
    SUM(degraded_checks) AS degraded_checks,
    ROUND(AVG(avg_latency_ms))::INT AS avg_latency_ms,
    MIN(min_latency_ms) AS min_latency_ms,
    MAX(max_latency_ms) AS max_latency_ms,
    ROUND(AVG(p95_latency_ms))::INT AS p95_latency_ms
  FROM status_rollup_hourly
  WHERE bucket_hour >= now() - INTERVAL '3 days'
  GROUP BY service_name, date_trunc('day', bucket_hour)::DATE
  ON CONFLICT (service_name, bucket_day) DO UPDATE SET
    total_checks   = EXCLUDED.total_checks,
    ok_checks      = EXCLUDED.ok_checks,
    down_checks    = EXCLUDED.down_checks,
    degraded_checks = EXCLUDED.degraded_checks,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms;

  GET DIAGNOSTICS daily_count = ROW_COUNT;

  RETURN json_build_object('hourly_rows', hourly_count, 'daily_rows', daily_count);
END;
$$;

-- ── 4. Query RPCs for the frontend ──────────────────────────────────────────

-- Hourly rollups for 7d-30d views
CREATE OR REPLACE FUNCTION get_status_rollup_hourly(p_hours INT DEFAULT 168)
RETURNS TABLE (
  service_name TEXT,
  bucket_hour TIMESTAMPTZ,
  total_checks INT,
  ok_checks INT,
  down_checks INT,
  degraded_checks INT,
  avg_latency_ms INT,
  p95_latency_ms INT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT service_name, bucket_hour, total_checks, ok_checks, down_checks,
         degraded_checks, avg_latency_ms, p95_latency_ms
  FROM status_rollup_hourly
  WHERE bucket_hour >= now() - (p_hours || ' hours')::INTERVAL
  ORDER BY bucket_hour ASC;
$$;

-- Daily rollups for 3mo-24mo views
CREATE OR REPLACE FUNCTION get_status_rollup_daily(p_days INT DEFAULT 90)
RETURNS TABLE (
  service_name TEXT,
  bucket_day DATE,
  total_checks INT,
  ok_checks INT,
  down_checks INT,
  degraded_checks INT,
  avg_latency_ms INT,
  p95_latency_ms INT
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT service_name, bucket_day, total_checks, ok_checks, down_checks,
         degraded_checks, avg_latency_ms, p95_latency_ms
  FROM status_rollup_daily
  WHERE bucket_day >= (CURRENT_DATE - p_days)
  ORDER BY bucket_day ASC;
$$;

-- ── 5. Retention: extend raw to 90 days, rollups to 24 months ───────────────

CREATE OR REPLACE FUNCTION purge_old_status_data()
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  raw_deleted INT;
  hourly_deleted INT;
  daily_deleted INT;
BEGIN
  -- Raw history: keep 90 days
  DELETE FROM system_status_history WHERE checked_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS raw_deleted = ROW_COUNT;

  -- Hourly rollups: keep 6 months
  DELETE FROM status_rollup_hourly WHERE bucket_hour < now() - INTERVAL '6 months';
  GET DIAGNOSTICS hourly_deleted = ROW_COUNT;

  -- Daily rollups: keep 24 months
  DELETE FROM status_rollup_daily WHERE bucket_day < (CURRENT_DATE - 730);
  GET DIAGNOSTICS daily_deleted = ROW_COUNT;

  RETURN json_build_object(
    'raw_deleted', raw_deleted,
    'hourly_deleted', hourly_deleted,
    'daily_deleted', daily_deleted
  );
END;
$$;

-- ── 6. RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE status_rollup_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_rollup_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_rollup_hourly" ON status_rollup_hourly FOR SELECT USING (true);
CREATE POLICY "public_read_rollup_daily" ON status_rollup_daily FOR SELECT USING (true);
