-- Fix get_user_rank: add percentile and xp_to_next fields.
-- Previously only returned rank + score, so percentile was always 0 (Bronze).

CREATE OR REPLACE FUNCTION get_user_rank(p_user_id UUID)
RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
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
    -- Score of the player directly above (lower rank number = higher score)
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
  );
$$;
