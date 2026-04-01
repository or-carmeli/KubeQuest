-- L13: Replace public read policy on analytics_events with authenticated-only
DROP POLICY IF EXISTS "public_read_analytics" ON analytics_events;
CREATE POLICY "authenticated_read_analytics" ON analytics_events
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
