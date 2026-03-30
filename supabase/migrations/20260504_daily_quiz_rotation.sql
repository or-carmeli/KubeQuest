-- ══════════════════════════════════════════════════════════════════════════════
-- Daily quiz rotation
-- ══════════════════════════════════════════════════════════════════════════════
-- Previously get_daily_questions returned the first N rows by ID, meaning
-- authenticated users always saw the same questions.  Guest mode already
-- rotated daily via a client-side seeded PRNG.
--
-- This migration adds day-of-year based rotation so that authenticated users
-- also get a different window of questions each day, consistent for all users
-- on the same calendar day.
-- ══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_daily_questions(TEXT, INT);

CREATE OR REPLACE FUNCTION get_daily_questions(p_lang TEXT, p_limit INT DEFAULT 5)
RETURNS TABLE(id INT, q TEXT, options JSONB, tags JSONB)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total   INT;
  v_windows INT;
  v_day     INT;
  v_offset  INT;
BEGIN
  SELECT count(*) INTO v_total
  FROM public.daily_questions
  WHERE lang = p_lang;

  IF v_total = 0 THEN RETURN; END IF;

  v_windows := GREATEST(v_total / p_limit, 1);
  v_day     := EXTRACT(DOY FROM now())::INT;
  v_offset  := (v_day % v_windows) * p_limit;

  RETURN QUERY
  SELECT dq.id, dq.q, dq.options, dq.tags
  FROM public.daily_questions dq
  WHERE dq.lang = p_lang
  ORDER BY dq.id
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;
