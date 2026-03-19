-- ── Hint & Eliminate RPCs ────────────────────────────────────────────────────
-- Enable hint and eliminate features for server-side questions.
-- Neither RPC reveals the correct answer index.

-- 1. get_question_hint: returns the first sentence of the explanation
--    Works for both quiz_questions and daily_questions.
CREATE OR REPLACE FUNCTION get_question_hint(p_question_id INT, p_source TEXT DEFAULT 'quiz')
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  hint_text TEXT;
BEGIN
  IF p_source = 'daily' THEN
    SELECT split_part(explanation, '. ', 1)
    INTO hint_text
    FROM daily_questions WHERE id = p_question_id;
  ELSE
    SELECT split_part(explanation, '. ', 1)
    INTO hint_text
    FROM quiz_questions WHERE id = p_question_id;
  END IF;

  IF hint_text IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN json_build_object('hint', hint_text);
END;
$$;

-- 2. get_eliminate_option: returns one random wrong option index
--    Does NOT reveal which answer is correct, only one that is wrong.
CREATE OR REPLACE FUNCTION get_eliminate_option(p_question_id INT, p_source TEXT DEFAULT 'quiz', p_exclude SMALLINT DEFAULT -1)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  correct_idx SMALLINT;
  num_options INT;
  wrong_indices SMALLINT[];
  picked SMALLINT;
BEGIN
  IF p_source = 'daily' THEN
    SELECT answer, jsonb_array_length(options)
    INTO correct_idx, num_options
    FROM daily_questions WHERE id = p_question_id;
  ELSE
    SELECT answer, jsonb_array_length(options)
    INTO correct_idx, num_options
    FROM quiz_questions WHERE id = p_question_id;
  END IF;

  IF correct_idx IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Build array of wrong indices, excluding the correct answer and p_exclude (user's current selection)
  SELECT array_agg(i) INTO wrong_indices
  FROM generate_series(0, num_options - 1) AS i
  WHERE i != correct_idx AND i != p_exclude;

  IF wrong_indices IS NULL OR array_length(wrong_indices, 1) = 0 THEN
    RETURN json_build_object('eliminate', -1);
  END IF;

  -- Pick a random wrong option
  picked := wrong_indices[1 + floor(random() * array_length(wrong_indices, 1))::int];

  RETURN json_build_object('eliminate', picked);
END;
$$;

-- Grant access to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_question_hint(INT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_eliminate_option(INT, TEXT, SMALLINT) TO anon, authenticated;
