-- Rate-limit anonymous inserts into analytics_events to prevent write-flood attacks.
-- Limits each session_id to 60 events per minute.

CREATE OR REPLACE FUNCTION check_analytics_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  recent_count INT;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.analytics_events
  WHERE session_id = NEW.session_id
    AND created_at > (now() - interval '1 minute');

  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded for analytics events';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_analytics_rate_limit ON analytics_events;
CREATE TRIGGER trg_analytics_rate_limit
  BEFORE INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION check_analytics_rate_limit();
