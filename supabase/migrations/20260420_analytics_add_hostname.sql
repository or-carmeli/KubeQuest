-- Add hostname column to analytics_events for multi-domain tracking
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS hostname TEXT;
