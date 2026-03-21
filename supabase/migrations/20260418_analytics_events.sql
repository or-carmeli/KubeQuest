-- ── Analytics Events ──────────────────────────────────────────────────────────
--
-- Lightweight web analytics collection (page views, sessions, custom events).
-- Designed for a Vercel-style analytics dashboard.
--
-- Completely isolated from existing telemetry / observability tables.
-- Written by the client on session start and route changes.

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN ('session_start', 'page_view', 'custom_event')),
  path        TEXT,
  referrer    TEXT,
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser     TEXT,
  os          TEXT,
  country     TEXT,
  source      TEXT DEFAULT 'live',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query patterns: time-range scans, per-path aggregation, per-session grouping
CREATE INDEX IF NOT EXISTS idx_ae_created   ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_type_time ON analytics_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_session   ON analytics_events (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_path      ON analytics_events (path, created_at DESC);

-- Auto-purge: keep 12 months of analytics data
CREATE OR REPLACE FUNCTION purge_old_analytics_events()
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER
AS $$
  DELETE FROM analytics_events
  WHERE created_at < now() - interval '12 months';
$$;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public insert (analytics writes from anon key)
CREATE POLICY "public_insert_analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Public read (dashboard reads)
CREATE POLICY "public_read_analytics" ON analytics_events
  FOR SELECT USING (true);

-- Allow deleting seeded data only (source = 'vercel_seed')
CREATE POLICY "public_delete_seed_analytics" ON analytics_events
  FOR DELETE USING (source = 'vercel_seed');
