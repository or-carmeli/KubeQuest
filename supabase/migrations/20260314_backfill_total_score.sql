-- ── Backfill: repair total_score for legacy rows ────────────────────────────
--
-- Some user_stats rows have total_score = 0 despite having completed_topics
-- data and non-zero total_correct. This happened because:
--   1) Older app versions tracked total_correct/total_answered but did not
--      compute or persist a points-based total_score.
--   2) Guest-to-auth migration could INSERT total_score = 0 when guest
--      completedTopics was empty or corrupted.
--
-- This migration recomputes total_score from completed_topics for all
-- affected rows. Point values: easy=10, medium=20, hard=30.
-- Free-mode keys (mixed_*, daily_*, bookmarks_*) are excluded.
--
-- Safe to re-run: only updates rows where total_score = 0.

UPDATE user_stats
SET
  total_score = sub.computed_score,
  updated_at  = NOW()
FROM (
  SELECT
    user_id,
    COALESCE(SUM(
      GREATEST((entry.value ->> 'correct')::INT, 0) *
      CASE
        WHEN entry.key LIKE '%\_easy'   THEN 10
        WHEN entry.key LIKE '%\_medium' THEN 20
        WHEN entry.key LIKE '%\_hard'   THEN 30
        ELSE 0
      END
    ), 0) AS computed_score
  FROM user_stats,
       LATERAL jsonb_each(completed_topics) AS entry
  WHERE total_score = 0
    AND completed_topics IS NOT NULL
    AND completed_topics != '{}'::JSONB
    AND entry.key NOT LIKE 'mixed\_%'
    AND entry.key NOT LIKE 'daily\_%'
    AND entry.key NOT LIKE 'bookmarks\_%'
    AND (entry.value ->> 'correct') IS NOT NULL
  GROUP BY user_id
  HAVING SUM(
    GREATEST((entry.value ->> 'correct')::INT, 0) *
    CASE
      WHEN entry.key LIKE '%\_easy'   THEN 10
      WHEN entry.key LIKE '%\_medium' THEN 20
      WHEN entry.key LIKE '%\_hard'   THEN 30
      ELSE 0
    END
  ) > 0
) sub
WHERE user_stats.user_id = sub.user_id
  AND user_stats.total_score = 0;
