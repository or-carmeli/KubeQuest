-- ── Add hint column to question tables ──────────────────────────────────────
-- Dedicated hint text that gives direction without revealing the answer.
-- Falls back to first sentence of explanation when NULL.

ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS hint TEXT;
ALTER TABLE daily_questions ADD COLUMN IF NOT EXISTS hint TEXT;

-- Update the RPC to prefer the dedicated hint column
CREATE OR REPLACE FUNCTION get_question_hint(p_question_id INT, p_source TEXT DEFAULT 'quiz')
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  hint_text TEXT;
BEGIN
  IF p_source = 'daily' THEN
    SELECT COALESCE(hint, split_part(explanation, '. ', 1))
    INTO hint_text
    FROM daily_questions WHERE id = p_question_id;
  ELSE
    SELECT COALESCE(hint, split_part(explanation, '. ', 1))
    INTO hint_text
    FROM quiz_questions WHERE id = p_question_id;
  END IF;

  IF hint_text IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN json_build_object('hint', hint_text);
END;
$$;
