-- ── Add production API signals to infra_metrics ──────────────────────────────
-- These columns are populated by the collect-metrics edge function from
-- production data sources (analytics_events + health check history).
-- Replaces dev-only observability_events as the API metrics source.

ALTER TABLE infra_metrics
  ADD COLUMN IF NOT EXISTS api_requests_5m     INT,          -- page views + events in last 5 minutes
  ADD COLUMN IF NOT EXISTS api_errors_5m       INT,          -- health checks with non-operational status in last 5 minutes
  ADD COLUMN IF NOT EXISTS active_sessions_5m  INT,          -- unique sessions in last 5 minutes
  ADD COLUMN IF NOT EXISTS health_checks_ok    INT,          -- services currently operational
  ADD COLUMN IF NOT EXISTS health_checks_total INT;          -- total services checked

-- RPC to count recent analytics events (production traffic signal)
CREATE OR REPLACE FUNCTION get_api_activity_5m()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'requests', (SELECT count(*) FROM analytics_events WHERE created_at >= now() - INTERVAL '5 minutes'),
    'sessions', (SELECT count(DISTINCT session_id) FROM analytics_events WHERE created_at >= now() - INTERVAL '5 minutes')
  );
$$;

-- RPC to count health check status (production error signal)
CREATE OR REPLACE FUNCTION get_health_summary()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'ok', (SELECT count(*) FROM system_status_current WHERE status = 'operational'),
    'total', (SELECT count(*) FROM system_status_current),
    'errors', (SELECT count(*) FROM system_status_current WHERE status IN ('down', 'degraded'))
  );
$$;
