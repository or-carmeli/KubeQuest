-- ── Pin search_path on every SECURITY DEFINER function ──────────────────────
--
-- Without an explicit search_path, a SECURITY DEFINER function resolves
-- unqualified table names using the CALLER's search_path.  A malicious user
-- who can create objects in a schema that appears earlier in the path could
-- shadow public tables and execute code with the definer's privileges.
--
-- Fix: SET search_path = '' on every function, then schema-qualify every
-- table/view reference (public.*, pg_catalog.*, auth.*).
--
-- This migration replaces ALL live SECURITY DEFINER functions in one shot.
-- Safe to re-run (CREATE OR REPLACE).

-- ══════════════════════════════════════════════════════════════════════════════
-- 0. Drop stale function overloads (old signatures without arguments)
-- ══════════════════════════════════════════════════════════════════════════════

-- The old zero-argument overload may have a dependent view; CASCADE drops it.
-- The pinned get_leaderboard(p_limit INT DEFAULT 10) below replaces it.
DROP FUNCTION IF EXISTS get_leaderboard() CASCADE;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. check_quiz_answer
-- ══════════════════════════════════════════════════════════════════════════════

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

    INSERT INTO public.score_events (user_id, question_id, quiz_run_id, source, points, mode)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'quiz', pts, p_mode)
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

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

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. check_daily_answer
-- ══════════════════════════════════════════════════════════════════════════════

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
    INSERT INTO public.score_events (user_id, question_id, quiz_run_id, source, points, mode)
    VALUES (caller_id, p_question_id, p_quiz_run_id, 'daily', 15::SMALLINT, COALESCE(p_mode, 'daily'))
    ON CONFLICT (user_id, question_id, quiz_run_id) DO NOTHING;

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

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. check_incident_answer
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_incident_answer(p_step_id INT, p_selected SMALLINT)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSON;
  check_count INT;
  caller_id UUID;
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

  SELECT json_build_object(
    'correct', (answer = p_selected),
    'correct_answer', answer,
    'explanation', explanation,
    'explanation_he', explanation_he
  ) INTO result
  FROM public.incident_steps
  WHERE id = p_step_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Step not found';
  END IF;

  RETURN result;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. get_leaderboard
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 10)
RETURNS TABLE(username TEXT, total_score BIGINT, max_streak INT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COALESCE(us.username, '') AS username,
    COALESCE(us.total_score, 0)::BIGINT AS total_score,
    COALESCE(us.max_streak, 0)::INT AS max_streak
  FROM public.user_stats us
  WHERE us.total_score > 0
  ORDER BY us.total_score DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. save_user_progress
-- ══════════════════════════════════════════════════════════════════════════════

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
SET search_path = ''
AS $$
DECLARE
  caller_id UUID;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_stats (
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
    best_score       = GREATEST(public.user_stats.best_score, EXCLUDED.best_score),
    total_answered   = GREATEST(public.user_stats.total_answered, EXCLUDED.total_answered),
    total_correct    = GREATEST(public.user_stats.total_correct,  EXCLUDED.total_correct),
    max_streak       = GREATEST(public.user_stats.max_streak,     EXCLUDED.max_streak),
    current_streak   = EXCLUDED.current_streak,
    completed_topics = EXCLUDED.completed_topics,
    achievements     = EXCLUDED.achievements,
    topic_stats      = EXCLUDED.topic_stats,
    updated_at       = now();
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. get_user_rank
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Forbidden: cannot query another user''s rank';
  END IF;

  RETURN (
    WITH counts AS (
      SELECT COUNT(*) AS total_players FROM public.user_stats WHERE total_score > 0
    ),
    user_row AS (
      SELECT COALESCE(total_score, 0) AS score
      FROM public.user_stats WHERE user_id = p_user_id
    ),
    user_rank AS (
      SELECT COUNT(*) + 1 AS rank
      FROM public.user_stats
      WHERE total_score > (SELECT score FROM user_row)
    ),
    next_score AS (
      SELECT MIN(total_score) AS score_above
      FROM public.user_stats
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
-- 7. get_quiz_questions
-- ══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_quiz_questions(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_quiz_questions(p_topic TEXT, p_level TEXT, p_lang TEXT)
RETURNS TABLE(id INT, q TEXT, options JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, q, options, tags
  FROM public.quiz_questions
  WHERE topic_id = p_topic AND level = p_level AND lang = p_lang;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. get_mixed_questions
-- ══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_mixed_questions(TEXT, INT);

CREATE OR REPLACE FUNCTION get_mixed_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, level TEXT, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, q, options, level, tags
  FROM public.quiz_questions
  WHERE lang = p_lang
  ORDER BY random()
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. get_daily_questions
-- ══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_daily_questions(TEXT, INT);

CREATE OR REPLACE FUNCTION get_daily_questions(p_lang TEXT, p_limit INT DEFAULT 10)
RETURNS TABLE(id INT, q TEXT, options JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, q, options, tags
  FROM public.daily_questions
  WHERE lang = p_lang
  ORDER BY id
  LIMIT p_limit;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. get_incident_steps
-- ══════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS get_incident_steps(TEXT);

CREATE OR REPLACE FUNCTION get_incident_steps(p_incident_id TEXT)
RETURNS TABLE(id INT, step_order SMALLINT, prompt TEXT, prompt_he TEXT, options JSONB, options_he JSONB, tags JSONB)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, step_order, prompt, prompt_he, options, options_he, tags
  FROM public.incident_steps
  WHERE incident_id = p_incident_id
  ORDER BY step_order;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 11. get_question_hint
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_question_hint(p_question_id INT, p_source TEXT DEFAULT 'quiz')
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  hint_text TEXT;
BEGIN
  IF p_source = 'daily' THEN
    SELECT COALESCE(hint, split_part(explanation, '. ', 1))
    INTO hint_text
    FROM public.daily_questions WHERE id = p_question_id;
  ELSE
    SELECT COALESCE(hint, split_part(explanation, '. ', 1))
    INTO hint_text
    FROM public.quiz_questions WHERE id = p_question_id;
  END IF;

  IF hint_text IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  RETURN json_build_object('hint', hint_text);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 12. get_eliminate_option
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_eliminate_option(p_question_id INT, p_source TEXT DEFAULT 'quiz', p_exclude SMALLINT DEFAULT -1)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
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
    FROM public.daily_questions WHERE id = p_question_id;
  ELSE
    SELECT answer, jsonb_array_length(options)
    INTO correct_idx, num_options
    FROM public.quiz_questions WHERE id = p_question_id;
  END IF;

  IF correct_idx IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  SELECT array_agg(i) INTO wrong_indices
  FROM generate_series(0, num_options - 1) AS i
  WHERE i != correct_idx AND i != p_exclude;

  IF wrong_indices IS NULL OR array_length(wrong_indices, 1) = 0 THEN
    RETURN json_build_object('eliminate', -1);
  END IF;

  picked := wrong_indices[1 + floor(random() * array_length(wrong_indices, 1))::int];

  RETURN json_build_object('eliminate', picked);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 13. get_system_status
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_system_status()
RETURNS SETOF public.system_status_current
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.system_status_current ORDER BY service_name;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 14. get_uptime_history
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_uptime_history(p_days INT DEFAULT 30)
RETURNS TABLE(service_name TEXT, day DATE, total_checks BIGINT, ok_checks BIGINT, uptime_pct NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    h.service_name,
    DATE(h.checked_at) AS day,
    COUNT(*) AS total_checks,
    COUNT(*) FILTER (WHERE h.status = 'operational') AS ok_checks,
    ROUND(COUNT(*) FILTER (WHERE h.status = 'operational') * 100.0 / NULLIF(COUNT(*), 0), 2) AS uptime_pct
  FROM public.system_status_history h
  WHERE h.checked_at > now() - (p_days || ' days')::INTERVAL
  GROUP BY h.service_name, DATE(h.checked_at)
  ORDER BY h.service_name, day;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 15. get_incidents
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_incidents(p_limit INT DEFAULT 20)
RETURNS SETOF public.system_incidents
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.system_incidents
  ORDER BY
    CASE WHEN status != 'resolved' THEN 0 ELSE 1 END,
    started_at DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 16. upsert_service_status
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION upsert_service_status(
  p_service_name TEXT,
  p_status TEXT,
  p_latency_ms INT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_prev_status TEXT;
  v_last_history TIMESTAMPTZ;
BEGIN
  SELECT status INTO v_prev_status
  FROM public.system_status_current
  WHERE service_name = p_service_name;

  INSERT INTO public.system_status_current (service_name, status, latency_ms, last_checked, details)
  VALUES (p_service_name, p_status, p_latency_ms, now(), p_details)
  ON CONFLICT (service_name)
  DO UPDATE SET
    status = EXCLUDED.status,
    latency_ms = EXCLUDED.latency_ms,
    last_checked = EXCLUDED.last_checked,
    details = EXCLUDED.details;

  SELECT MAX(checked_at) INTO v_last_history
  FROM public.system_status_history
  WHERE service_name = p_service_name;

  IF p_status != 'operational'
     OR v_prev_status IS DISTINCT FROM p_status
     OR v_last_history IS NULL
     OR now() - v_last_history >= INTERVAL '30 minutes'
  THEN
    INSERT INTO public.system_status_history (service_name, status, latency_ms, checked_at)
    VALUES (p_service_name, p_status, p_latency_ms, now());
  END IF;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 17. manage_incident
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION manage_incident(
  p_title TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_status TEXT DEFAULT 'investigating',
  p_affected_services TEXT[] DEFAULT '{}',
  p_impact TEXT DEFAULT NULL,
  p_root_cause TEXT DEFAULT NULL,
  p_resolution TEXT DEFAULT NULL,
  p_prevention TEXT DEFAULT NULL,
  p_incident_id INT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result_id INT;
BEGIN
  IF p_incident_id IS NOT NULL THEN
    UPDATE public.system_incidents SET
      title = p_title,
      severity = p_severity,
      status = p_status,
      affected_services = p_affected_services,
      impact = COALESCE(p_impact, impact),
      root_cause = COALESCE(p_root_cause, root_cause),
      resolution = COALESCE(p_resolution, resolution),
      prevention = COALESCE(p_prevention, prevention),
      resolved_at = CASE WHEN p_status = 'resolved' AND resolved_at IS NULL THEN now() ELSE resolved_at END
    WHERE id = p_incident_id
    RETURNING id INTO result_id;
  ELSE
    INSERT INTO public.system_incidents (title, severity, status, affected_services, impact, root_cause, resolution, prevention)
    VALUES (p_title, p_severity, p_status, p_affected_services, p_impact, p_root_cause, p_resolution, p_prevention)
    RETURNING id INTO result_id;
  END IF;
  RETURN result_id;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 18. purge_old_status_history
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_status_history(p_days INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted INT;
BEGIN
  DELETE FROM public.system_status_history
  WHERE checked_at < now() - (p_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 19. get_active_maintenance
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_active_maintenance()
RETURNS SETOF public.maintenance_windows
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.maintenance_windows
  WHERE ends_at > now()
    AND starts_at < now() + INTERVAL '30 days'
  ORDER BY starts_at ASC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 20. is_maintenance_active
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_maintenance_active()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.maintenance_windows
    WHERE starts_at <= now() AND ends_at > now()
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 21. compute_status_rollups
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION compute_status_rollups()
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  hourly_count INT := 0;
  daily_count  INT := 0;
BEGIN
  INSERT INTO public.status_rollup_hourly
    (service_name, bucket_hour, total_checks, ok_checks, down_checks, degraded_checks,
     avg_latency_ms, min_latency_ms, max_latency_ms, p95_latency_ms)
  SELECT
    service_name,
    date_trunc('hour', checked_at) AS bucket_hour,
    COUNT(*) AS total_checks,
    COUNT(*) FILTER (WHERE status = 'operational') AS ok_checks,
    COUNT(*) FILTER (WHERE status = 'down') AS down_checks,
    COUNT(*) FILTER (WHERE status = 'degraded') AS degraded_checks,
    ROUND(AVG(latency_ms))::INT AS avg_latency_ms,
    MIN(latency_ms) AS min_latency_ms,
    MAX(latency_ms) AS max_latency_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::INT AS p95_latency_ms
  FROM public.system_status_history
  WHERE checked_at >= now() - INTERVAL '48 hours'
  GROUP BY service_name, date_trunc('hour', checked_at)
  ON CONFLICT (service_name, bucket_hour) DO UPDATE SET
    total_checks   = EXCLUDED.total_checks,
    ok_checks      = EXCLUDED.ok_checks,
    down_checks    = EXCLUDED.down_checks,
    degraded_checks = EXCLUDED.degraded_checks,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms;

  GET DIAGNOSTICS hourly_count = ROW_COUNT;

  INSERT INTO public.status_rollup_daily
    (service_name, bucket_day, total_checks, ok_checks, down_checks, degraded_checks,
     avg_latency_ms, min_latency_ms, max_latency_ms, p95_latency_ms)
  SELECT
    service_name,
    date_trunc('day', bucket_hour)::DATE AS bucket_day,
    SUM(total_checks) AS total_checks,
    SUM(ok_checks) AS ok_checks,
    SUM(down_checks) AS down_checks,
    SUM(degraded_checks) AS degraded_checks,
    ROUND(AVG(avg_latency_ms))::INT AS avg_latency_ms,
    MIN(min_latency_ms) AS min_latency_ms,
    MAX(max_latency_ms) AS max_latency_ms,
    ROUND(AVG(p95_latency_ms))::INT AS p95_latency_ms
  FROM public.status_rollup_hourly
  WHERE bucket_hour >= now() - INTERVAL '3 days'
  GROUP BY service_name, date_trunc('day', bucket_hour)::DATE
  ON CONFLICT (service_name, bucket_day) DO UPDATE SET
    total_checks   = EXCLUDED.total_checks,
    ok_checks      = EXCLUDED.ok_checks,
    down_checks    = EXCLUDED.down_checks,
    degraded_checks = EXCLUDED.degraded_checks,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    min_latency_ms = EXCLUDED.min_latency_ms,
    max_latency_ms = EXCLUDED.max_latency_ms,
    p95_latency_ms = EXCLUDED.p95_latency_ms;

  GET DIAGNOSTICS daily_count = ROW_COUNT;

  RETURN json_build_object('hourly_rows', hourly_count, 'daily_rows', daily_count);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 22. get_status_rollup_hourly
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_status_rollup_hourly(p_hours INT DEFAULT 168)
RETURNS TABLE (
  service_name TEXT,
  bucket_hour TIMESTAMPTZ,
  total_checks INT,
  ok_checks INT,
  down_checks INT,
  degraded_checks INT,
  avg_latency_ms INT,
  p95_latency_ms INT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT service_name, bucket_hour, total_checks, ok_checks, down_checks,
         degraded_checks, avg_latency_ms, p95_latency_ms
  FROM public.status_rollup_hourly
  WHERE bucket_hour >= now() - (p_hours || ' hours')::INTERVAL
  ORDER BY bucket_hour ASC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 23. get_status_rollup_daily
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_status_rollup_daily(p_days INT DEFAULT 90)
RETURNS TABLE (
  service_name TEXT,
  bucket_day DATE,
  total_checks INT,
  ok_checks INT,
  down_checks INT,
  degraded_checks INT,
  avg_latency_ms INT,
  p95_latency_ms INT
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT service_name, bucket_day, total_checks, ok_checks, down_checks,
         degraded_checks, avg_latency_ms, p95_latency_ms
  FROM public.status_rollup_daily
  WHERE bucket_day >= (CURRENT_DATE - p_days)
  ORDER BY bucket_day ASC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 24. purge_old_status_data
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_status_data()
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  raw_deleted INT;
  hourly_deleted INT;
  daily_deleted INT;
BEGIN
  DELETE FROM public.system_status_history WHERE checked_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS raw_deleted = ROW_COUNT;

  DELETE FROM public.status_rollup_hourly WHERE bucket_hour < now() - INTERVAL '6 months';
  GET DIAGNOSTICS hourly_deleted = ROW_COUNT;

  DELETE FROM public.status_rollup_daily WHERE bucket_day < (CURRENT_DATE - 730);
  GET DIAGNOSTICS daily_deleted = ROW_COUNT;

  RETURN json_build_object(
    'raw_deleted', raw_deleted,
    'hourly_deleted', hourly_deleted,
    'daily_deleted', daily_deleted
  );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 25. get_all_incidents
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_all_incidents()
RETURNS SETOF public.system_incidents
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.system_incidents
  ORDER BY
    CASE WHEN status != 'resolved' THEN 0 ELSE 1 END,
    started_at DESC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 26. register_war_room_interest
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION register_war_room_interest(user_email TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  IF v_uid IS NOT NULL THEN
    INSERT INTO public.war_room_interest (user_id)
    VALUES (v_uid)
    ON CONFLICT (user_id) WHERE user_id IS NOT NULL DO NOTHING;
  ELSIF user_email IS NOT NULL AND user_email <> '' THEN
    INSERT INTO public.war_room_interest (email)
    VALUES (lower(trim(user_email)))
    ON CONFLICT (email) WHERE email IS NOT NULL DO NOTHING;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 27. get_war_room_interest_count
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_war_room_interest_count()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.war_room_interest;
  RETURN json_build_object('count', v_count);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 28. check_war_room_interest
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_war_room_interest()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid UUID;
  v_exists BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('registered', false);
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM public.war_room_interest WHERE user_id = v_uid
  ) INTO v_exists;
  RETURN json_build_object('registered', v_exists);
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 29. get_infra_metrics
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_infra_metrics(p_minutes INT DEFAULT 60)
RETURNS SETOF public.infra_metrics
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT *
  FROM public.infra_metrics
  WHERE collected_at >= now() - (p_minutes || ' minutes')::INTERVAL
  ORDER BY collected_at ASC;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 30. get_infra_metrics_latest
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_infra_metrics_latest()
RETURNS SETOF public.infra_metrics
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.infra_metrics ORDER BY collected_at DESC LIMIT 1;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 31. purge_old_infra_metrics
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_infra_metrics()
RETURNS INT
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted INT;
BEGIN
  DELETE FROM public.infra_metrics WHERE collected_at < now() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN deleted;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 32. get_db_connection_stats
--     pg_catalog views are always accessible regardless of search_path.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_connection_stats()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'active', (SELECT count(*) FROM pg_catalog.pg_stat_activity WHERE state = 'active'),
    'idle',   (SELECT count(*) FROM pg_catalog.pg_stat_activity WHERE state = 'idle'),
    'total',  (SELECT count(*) FROM pg_catalog.pg_stat_activity)
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 33. get_db_max_connections
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_max_connections()
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT setting::INT FROM pg_catalog.pg_settings WHERE name = 'max_connections';
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 34. get_db_stats
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'xact_commit',   xact_commit,
    'xact_rollback', xact_rollback,
    'blks_hit',      blks_hit,
    'blks_read',     blks_read,
    'deadlocks',     deadlocks,
    'db_size_bytes', pg_catalog.pg_database_size(datname)
  )
  FROM pg_catalog.pg_stat_database
  WHERE datname = pg_catalog.current_database();
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 35. get_slow_queries
--     Uses EXECUTE for dynamic pg_stat_statements access (extension may not
--     exist). pg_stat_statements lives in the public or pg_catalog schema
--     depending on the Supabase setup; the EXECUTE block handles both.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSON;
  v_has_extension BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_catalog.pg_extension WHERE extname = 'pg_stat_statements'
  ) INTO v_has_extension;

  IF NOT v_has_extension THEN
    RETURN json_build_object(
      'slow_count', NULL,
      'top_query', NULL,
      'top_query_ms', NULL,
      'available', false
    );
  END IF;

  EXECUTE $q$
    SELECT json_build_object(
      'slow_count', (SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 1000),
      'top_query', (
        SELECT left(query, 200)
        FROM pg_stat_statements
        WHERE calls > 0
        ORDER BY mean_exec_time DESC
        LIMIT 1
      ),
      'top_query_ms', (
        SELECT round(mean_exec_time::numeric, 2)
        FROM pg_stat_statements
        WHERE calls > 0
        ORDER BY mean_exec_time DESC
        LIMIT 1
      ),
      'available', true
    )
  $q$ INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'slow_count', NULL,
      'top_query', NULL,
      'top_query_ms', NULL,
      'available', false,
      'error', SQLERRM
    );
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 36. get_api_activity_5m
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_api_activity_5m()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'requests', (SELECT count(*) FROM public.analytics_events WHERE created_at >= now() - INTERVAL '5 minutes'),
    'sessions', (SELECT count(DISTINCT session_id) FROM public.analytics_events WHERE created_at >= now() - INTERVAL '5 minutes')
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 37. get_health_summary
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_health_summary()
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT json_build_object(
    'ok', (SELECT count(*) FROM public.system_status_current WHERE status = 'operational'),
    'total', (SELECT count(*) FROM public.system_status_current),
    'errors', (SELECT count(*) FROM public.system_status_current WHERE status IN ('down', 'degraded'))
  );
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 38. purge_old_analytics_events
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_analytics_events()
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.analytics_events
  WHERE created_at < now() - interval '12 months';
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 39. purge_old_observability_events
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION purge_old_observability_events()
RETURNS void
LANGUAGE sql VOLATILE SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.observability_events
  WHERE created_at < now() - interval '30 days';
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Also pin the trigger function (not SECURITY DEFINER, but good hygiene)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION clean_old_answer_checks() RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.answer_check_log WHERE checked_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Re-grant EXECUTE on hint/eliminate RPCs (search_path change resets grants
-- only if the function is DROPped and re-created; CREATE OR REPLACE preserves
-- existing grants, so this is just a safety net).
-- ══════════════════════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION get_question_hint(INT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_eliminate_option(INT, TEXT, SMALLINT) TO anon, authenticated;
