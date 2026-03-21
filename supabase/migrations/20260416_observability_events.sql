-- ── Observability Events ─────────────────────────────────────────────────────
--
-- Stores periodic telemetry snapshots from the dev Performance Insights
-- dashboard. Each row captures Web Vitals, network stats, error counts,
-- and a composite RES score for one point in time.
--
-- Written by the client every ~60 seconds (DEV mode only).
-- Read by the dashboard to display historical data across page reloads.

CREATE TABLE IF NOT EXISTS observability_events (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oe_ts ON observability_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_oe_session ON observability_events (session_id, ts DESC);

-- Auto-purge: keep only the last 30 days of snapshots
CREATE OR REPLACE FUNCTION purge_old_observability_events()
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER
AS $$
  DELETE FROM observability_events
  WHERE created_at < now() - interval '30 days';
$$;

ALTER TABLE observability_events ENABLE ROW LEVEL SECURITY;

-- Open read/insert for anon key (dev-only, non-sensitive perf metrics)
CREATE POLICY "public_read_observability" ON observability_events
  FOR SELECT USING (true);

CREATE POLICY "public_insert_observability" ON observability_events
  FOR INSERT WITH CHECK (true);
