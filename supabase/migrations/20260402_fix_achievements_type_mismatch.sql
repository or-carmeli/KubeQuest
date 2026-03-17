-- Fix: column "achievements" is of type jsonb but expression is of type text[]
--
-- The user_stats.achievements column is JSONB, but save_user_progress
-- declares p_achievements as TEXT[]. Postgres cannot implicitly cast
-- TEXT[] -> JSONB, causing a 400 error on every save.
--
-- Fix: change the parameter to JSONB so it matches the column type.
-- Must DROP the old TEXT[] signature first, otherwise Postgres creates
-- a second overload instead of replacing the function.

DROP FUNCTION IF EXISTS save_user_progress(TEXT, BIGINT, INT, INT, INT, INT, JSONB, TEXT[], JSONB);

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
    best_score       = EXCLUDED.best_score,
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
