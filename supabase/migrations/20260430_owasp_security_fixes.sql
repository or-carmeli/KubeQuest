-- ── OWASP Security Fixes ─────────────────────────────────────────────────────
--
-- 1. Require authentication on answer-check RPCs (prevent anon bypass of rate limit)
-- 2. Clamp get_leaderboard limit to prevent full-table dumps
-- 3. Prevent best_score regression/inflation in save_user_progress
-- 4. Fix IDOR in get_user_rank (enforce auth.uid() = p_user_id)
-- 5. Add column-length constraints on analytics_events to limit write-flood abuse

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. check_quiz_answer — add auth guard
-- ══════════════════════════════════════════════════════════════════════════════

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

  -- ▸ AUTH GUARD: reject unauthenticated callers
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
  IF is_correct AND p_quiz_run_id IS NOT NULL THEN
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

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. check_daily_answer — add auth guard
-- ══════════════════════════════════════════════════════════════════════════════

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

  -- ▸ AUTH GUARD: reject unauthenticated callers
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
  IF is_correct AND p_quiz_run_id IS NOT NULL THEN
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

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. check_incident_answer — add auth guard
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_incident_answer(p_step_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  check_count INT;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();

  -- ▸ AUTH GUARD: reject unauthenticated callers
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO check_count
  FROM answer_check_log
  WHERE user_id = caller_id AND checked_at > now() - interval '1 minute';

  IF check_count > 120 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please slow down.';
  END IF;

  INSERT INTO answer_check_log (user_id) VALUES (caller_id);

  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation,
    'explanation_he', explanation_he
  ) INTO result
  FROM incident_steps
  WHERE id = p_step_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Step not found';
  END IF;

  RETURN result;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. get_leaderboard — clamp p_limit to [1, 100]
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 10)
RETURNS TABLE(username TEXT, total_score BIGINT, max_streak INT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    COALESCE(us.username, '') AS username,
    COALESCE(us.total_score, 0)::BIGINT AS total_score,
    COALESCE(us.max_streak, 0)::INT AS max_streak
  FROM user_stats us
  WHERE us.total_score > 0
  ORDER BY us.total_score DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. save_user_progress — prevent best_score regression
-- ══════════════════════════════════════════════════════════════════════════════
-- Must DROP old signature first to avoid overload ambiguity.

DROP FUNCTION IF EXISTS save_user_progress(TEXT, BIGINT, INT, INT, INT, INT, JSONB, JSONB, JSONB);

CREATE OR REPLACE FUNCTION save_user_progress(
  p_username         TEXT,
  p_best_score       BIGINT,
  p_total_answered   INT,
  p_total_correct    INT,
  p_max_streak       INT,
  p_current_streak   INT,
  p_completed_topics JSONB,
  p_achievements     JSONB,
  p_topic_stats      JSONB
)
RETURNS VOID
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO user_stats (
    user_id, username, best_score,
    total_answered, total_correct,
    max_streak, current_streak,
    completed_topics, achievements, topic_stats,
    updated_at
  ) VALUES (
    caller_id, p_username, p_best_score,
    p_total_answered, p_total_correct,
    p_max_streak, p_current_streak,
    p_completed_topics, p_achievements, p_topic_stats,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    username         = EXCLUDED.username,
    best_score       = GREATEST(user_stats.best_score, EXCLUDED.best_score),
    total_answered   = GREATEST(user_stats.total_answered, EXCLUDED.total_answered),
    total_correct    = GREATEST(user_stats.total_correct,  EXCLUDED.total_correct),
    max_streak       = GREATEST(user_stats.max_streak,     EXCLUDED.max_streak),
    current_streak   = EXCLUDED.current_streak,
    completed_topics = EXCLUDED.completed_topics,
    achievements     = EXCLUDED.achievements,
    topic_stats      = EXCLUDED.topic_stats,
    updated_at       = now();
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. get_user_rank — fix IDOR (enforce auth.uid() = p_user_id)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
BEGIN
  -- ▸ AUTH GUARD: users may only query their own rank
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden: cannot query another user''s rank';
  END IF;

  RETURN (
    WITH counts AS (
      SELECT COUNT(*) AS total_players FROM user_stats WHERE total_score > 0
    ),
    user_row AS (
      SELECT COALESCE(total_score, 0) AS score
      FROM user_stats WHERE user_id = p_user_id
    ),
    user_rank AS (
      SELECT COUNT(*) + 1 AS rank
      FROM user_stats
      WHERE total_score > (SELECT score FROM user_row)
    ),
    next_score AS (
      SELECT MIN(total_score) AS score_above
      FROM user_stats
      WHERE total_score > (SELECT score FROM user_row)
    )
    SELECT json_build_object(
      'rank',       COALESCE((SELECT rank FROM user_rank), 1),
      'score',      COALESCE((SELECT score FROM user_row), 0),
      'percentile', CASE
                      WHEN (SELECT total_players FROM counts) <= 1 THEN 50
                      ELSE ROUND(
                        ((SELECT total_players FROM counts) - (SELECT rank FROM user_rank))::NUMERIC
                        / ((SELECT total_players FROM counts) - 1)::NUMERIC
                        * 100
                      )
                    END,
      'xp_to_next', CASE
                      WHEN (SELECT rank FROM user_rank) <= 1 THEN 0
                      ELSE COALESCE((SELECT score_above FROM next_score), 0)
                           - COALESCE((SELECT score FROM user_row), 0)
                    END
    )
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. analytics_events — add column-length constraints to limit abuse
-- ══════════════════════════════════════════════════════════════════════════════
-- Cannot require auth (analytics tracks anonymous visitors).
-- Instead, constrain TEXT field lengths to prevent storage-flood attacks.

DO $$
BEGIN
  ALTER TABLE analytics_events ADD CONSTRAINT chk_ae_session_id_len
    CHECK (length(session_id) <= 128);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE analytics_events ADD CONSTRAINT chk_ae_path_len
    CHECK (length(path) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE analytics_events ADD CONSTRAINT chk_ae_referrer_len
    CHECK (length(referrer) <= 2048);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE analytics_events ADD CONSTRAINT chk_ae_utm_len
    CHECK (
      length(utm_source)   <= 256
      AND length(utm_medium)   <= 256
      AND length(utm_campaign) <= 256
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE analytics_events ADD CONSTRAINT chk_ae_short_fields_len
    CHECK (
      length(device_type) <= 32
      AND length(browser) <= 64
      AND length(os)      <= 64
      AND length(country) <= 128
      AND length(source)  <= 32
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
