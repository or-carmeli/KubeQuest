-- Allow deleting seeded analytics data (source = 'vercel_seed') via anon key.
-- This enables the seed script to clean up old data before re-seeding.

CREATE POLICY "public_delete_seed_analytics" ON analytics_events
  FOR DELETE USING (source = 'vercel_seed');
