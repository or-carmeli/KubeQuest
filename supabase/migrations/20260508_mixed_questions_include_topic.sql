-- ── Return topic_id in mixed questions ────────────────────────────────────────
-- The client needs topic_id so the mixed-quiz UI can show a badge indicating
-- which topic each question belongs to. This is metadata only - no scoring
-- logic changes.

DROP FUNCTION IF EXISTS get_mixed_questions(TEXT, INT);

CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, level TEXT, topic_id TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, q, options, level, topic_id
  FROM public.quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;
