-- ── Add mode column to score_events ──────────────────────────────────────────
--
-- Problem: score_events.source is either 'quiz' or 'daily', but 'quiz'
-- covers both topic-mode runs (replays are legitimate) and mixed-mode runs
-- (duplicates are a bug). Without a mode marker we cannot audit or repair
-- mixed-mode inflation from the DB alone.
--
-- Fix: add a nullable TEXT column `mode` to score_events, and accept an
-- optional p_mode parameter in check_quiz_answer / check_daily_answer.
--
-- Backward compatible:
--   - Column is nullable, so old rows keep mode = NULL
--   - RPC params use DEFAULT NULL, so old clients continue to work
--   - Running this migration twice is safe (IF NOT EXISTS / CREATE OR REPLACE)

-- ── 1. Add column ────────────────────────────────────────────────────────────

ALTER TABLE score_events ADD COLUMN IF NOT EXISTS mode TEXT;

COMMENT ON COLUMN score_events.mode IS
  'Quiz mode that generated this event: topic, mixed, daily, or NULL (legacy rows)';

-- ── 2. Replace check_quiz_answer (add p_mode param) ─────────────────────────

CREATE OR REPLACE FUNCTION check_quiz_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL,
  p_mode        TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
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

  -- Rate limit: max 120 checks per minute per user
  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  -- Look up the question
  SELECT answer, level, explanation
  INTO q_answer, q_level, q_explanation
  FROM quiz_questions
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

  -- Server-side scoring: only when quiz_run_id provided and answer correct
  IF is_correct AND p_quiz_run_id IS NOT NULL AND caller_id IS NOT NULL THEN
    -- Points derived entirely from the question's DB level (server-authoritative)
    pts := CASE q_level
      WHEN 'easy'   THEN 10
      WHEN 'medium' THEN 20
      WHEN 'hard'   THEN 30
      ELSE 0
    END::SMALLINT;

    -- Idempotent insert - ON CONFLICT DO NOTHING prevents double scoring
    INSERT INTO score_events (user_id, question_id, quiz_run_id, source, points, mode)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'quiz', pts, p_mode)
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected > 0 THEN
      UPDATE user_stats
      SET total_score = total_score + pts,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- ── 3. Replace check_daily_answer (add p_mode param) ────────────────────────

CREATE OR REPLACE FUNCTION check_daily_answer(
  p_question_id INT,
  p_selected    SMALLINT,
  p_quiz_run_id TEXT DEFAULT NULL,
  p_mode        TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
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

  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT answer, explanation
  INTO q_answer, q_explanation
  FROM daily_questions
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

  -- Server-side scoring: daily = 15 points always
  IF is_correct AND p_quiz_run_id IS NOT NULL AND caller_id IS NOT NULL THEN
    INSERT INTO score_events (user_id, question_id, quiz_run_id, source, points, mode)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'daily', 15::SMALLINT, COALESCE(p_mode, 'daily'))
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

    GET DIAGNOSTICS affected = ROW_COUNT;

    IF affected > 0 THEN
      UPDATE user_stats
      SET total_score = total_score + 15,
          updated_at  = now()
      WHERE user_id = caller_id;
    END IF;
  END IF;

  RETURN result;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- POST-DEPLOY VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run these after both the migration AND the client deploy are live.
-- They confirm that the mode column is being populated correctly.

-- V1. Mode distribution for recent events (expect: topic, mixed, daily only).
--     NULL rows = old cached clients still in the wild.
--     Run at 1h, 24h, and 72h after deploy. NULL count should trend to zero.
--
-- SELECT
--   mode,
--   source,
--   COUNT(*) AS event_count,
--   MIN(created_at) AS earliest,
--   MAX(created_at) AS latest
-- FROM score_events
-- WHERE created_at > now() - interval '24 hours'
-- GROUP BY mode, source
-- ORDER BY mode NULLS LAST, source;

-- V2. Detect unexpected NULL mode on new events (after client is fully rolled out).
--     If this returns rows after 72h, a scoring path is missing the mode param.
--
-- SELECT
--   id, user_id, question_id, quiz_run_id, source, points, created_at
-- FROM score_events
-- WHERE mode IS NULL
--   AND created_at > now() - interval '24 hours'
-- ORDER BY created_at DESC
-- LIMIT 20;

-- V3. Validate mode values are from the expected set.
--     Should return zero rows. If not, a client is sending invalid mode strings.
--
-- SELECT DISTINCT mode
-- FROM score_events
-- WHERE mode IS NOT NULL
--   AND mode NOT IN ('topic', 'mixed', 'daily');

-- V4. Spot-check: mixed-mode events should span multiple topics.
--     If all mixed-mode questions belong to one topic, scoreMode logic is wrong.
--
-- SELECT
--   se.mode,
--   COUNT(DISTINCT qq.topic_id) AS distinct_topics,
--   COUNT(*) AS event_count
-- FROM score_events se
-- JOIN quiz_questions qq ON qq.id = se.question_id
-- WHERE se.mode = 'mixed'
--   AND se.created_at > now() - interval '24 hours'
-- GROUP BY se.mode;

-- V5. Graduation check: once NULL count hits zero for 72h, the transition is
--     complete. At that point, mixed-mode duplicates can be audited precisely:
--
-- SELECT user_id, question_id, COUNT(*), array_agg(quiz_run_id)
-- FROM score_events
-- WHERE mode = 'mixed'
-- GROUP BY user_id, question_id
-- HAVING COUNT(*) > 1;
