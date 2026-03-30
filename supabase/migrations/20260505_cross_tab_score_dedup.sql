-- ══════════════════════════════════════════════════════════════════════════════
-- Cross-tab score deduplication
-- ══════════════════════════════════════════════════════════════════════════════
-- Problem: each browser tab generates a unique quizRunId. The existing
-- UNIQUE(user_id, question_id, quiz_run_id) constraint cannot detect when
-- the same user answers the same question concurrently in two tabs, because
-- the run IDs differ.
--
-- For mixed/daily modes a question should only ever score ONCE per user.
-- For topic mode, replays are intentionally re-scorable (different run = new
-- attempt), so per-run dedup is correct.
--
-- Fix:
--   1. Add a partial unique index on (user_id, question_id) WHERE mode IN
--      ('mixed', 'daily'). This enforces one-score-per-question at the DB
--      level, regardless of quizRunId.
--   2. Update check_quiz_answer and check_daily_answer to use mode-aware
--      ON CONFLICT clauses.
--
-- Safety:
--   - Topic mode retains the existing per-run constraint (no behavior change)
--   - Legacy rows with mode = NULL are unaffected by the partial index
--   - The RPCs still return the correct answer/explanation regardless of
--     whether scoring succeeded
--   - Running this migration twice is safe (IF NOT EXISTS / CREATE OR REPLACE)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Partial unique index for mixed/daily one-score-per-question ───────────
-- Before creating the unique index, clean up any existing duplicates so the
-- index creation does not fail.

DELETE FROM public.score_events
WHERE mode IN ('mixed', 'daily')
  AND id NOT IN (
    SELECT MIN(id)
    FROM public.score_events
    WHERE mode IN ('mixed', 'daily')
    GROUP BY user_id, question_id
  );

-- Recalculate total_score after dedup cleanup
UPDATE public.user_stats us
SET total_score = COALESCE(se_sum.actual_total, 0),
    updated_at  = now()
FROM (
  SELECT user_id, SUM(points) AS actual_total
  FROM public.score_events
  GROUP BY user_id
) se_sum
WHERE se_sum.user_id = us.user_id
  AND us.total_score != se_sum.actual_total;

CREATE UNIQUE INDEX IF NOT EXISTS idx_se_user_question_free_dedup
  ON public.score_events (user_id, question_id)
  WHERE mode IN ('mixed', 'daily');

-- ── 2. Replace check_quiz_answer with mode-aware dedup ──────────────────────

CREATE OR REPLACE FUNCTION check_quiz_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL,
  p_mode        TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result      JSON;
  check_count INT;
  caller_id   UUID;
  q_answer    SMALLINT;
  q_level     TEXT;
  q_explanation TEXT;
  is_correct  BOOLEAN;
  pts         SMALLINT;
  affected    INT := 0;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO check_count
  FROM public.answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO public.answer_check_log (user_id) VALUES (caller_id);

  SELECT answer, level, explanation
  INTO q_answer, q_level, q_explanation
  FROM public.quiz_questions
  WHERE id = p_question_id;

  IF q_answer IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  is_correct := (q_answer = p_selected);

  result := json_build_object(
    'correct', is_correct,
    'correct_answer', q_answer,
    'explanation', q_explanation
  );

  IF is_correct AND p_quiz_run_id IS NOT NULL THEN
    pts := CASE q_level
      WHEN 'easy'   THEN 10
      WHEN 'medium' THEN 20
      WHEN 'hard'   THEN 30
      ELSE 0
    END::SMALLINT;

    IF p_mode IN ('mixed', 'daily') THEN
      -- Mixed/daily: one score per user per question (cross-tab safe)
      INSERT INTO public.score_events (user_id, question_id, quiz_run_id, source, points, mode)
      VALUES (caller_id, p_question_id, p_quiz_run_id, 'quiz', pts, p_mode)
      ON CONFLICT (user_id, question_id) WHERE mode IN ('mixed', 'daily') DO NOTHING;
    ELSE
      -- Topic mode: per-run dedup (replays earn points)
      INSERT INTO public.score_events (user_id, question_id, quiz_run_id, source, points, mode)
      VALUES (caller_id, p_question_id, p_quiz_run_id, 'quiz', pts, p_mode)
      ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;
    END IF;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected > 0 THEN
      UPDATE public.user_stats
      SET total_score = total_score + pts,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- ── 3. Replace check_daily_answer with per-question dedup ───────────────────

CREATE OR REPLACE FUNCTION check_daily_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL,
  p_mode        TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result      JSON;
  check_count INT;
  caller_id   UUID;
  q_answer    SMALLINT;
  q_explanation TEXT;
  is_correct  BOOLEAN;
  affected    INT := 0;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO check_count
  FROM public.answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO public.answer_check_log (user_id) VALUES (caller_id);

  SELECT answer, explanation
  INTO q_answer, q_explanation
  FROM public.daily_questions
  WHERE id = p_question_id;

  IF q_answer IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  is_correct := (q_answer = p_selected);

  result := json_build_object(
    'correct', is_correct,
    'correct_answer', q_answer,
    'explanation', q_explanation
  );

  IF is_correct AND p_quiz_run_id IS NOT NULL THEN
    -- Daily: one score per user per question (cross-tab safe)
    INSERT INTO public.score_events (user_id, question_id, quiz_run_id, source, points, mode)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'daily', 15::SMALLINT, COALESCE(p_mode, 'daily'))
    ON CONFLICT (user_id, question_id) WHERE mode IN ('mixed', 'daily') DO NOTHING;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected > 0 THEN
      UPDATE public.user_stats
      SET total_score = total_score + 15,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;
