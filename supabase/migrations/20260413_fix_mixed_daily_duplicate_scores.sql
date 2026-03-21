-- ── Fix duplicate scoring from mixed/daily mode replays ──────────────────────
--
-- Bug: The client-side duplicate guard (scoredFreeKeys_v1) ran AFTER the
-- server-side scoring RPC. Each new mixed/daily quiz generates a fresh
-- quizRunId, so the server's UNIQUE(user_id, question_id, quiz_run_id)
-- constraint allowed the same question to be scored multiple times across
-- different runs. The client correctly prevented local UI inflation, but
-- the server total_score was inflated.
--
-- The client-side fix (checking scoredFreeKeys BEFORE the RPC) prevents
-- future duplicates. This migration repairs historical inflation.
--
-- Approach:
--   score_events.source = 'daily' can be fully deduplicated because daily
--   questions should only ever score once per user per question.
--
--   score_events.source = 'quiz' CANNOT be safely deduplicated because the
--   source field does not distinguish mixed-mode runs from legitimate topic
--   replays (which are designed to accumulate points). We recalculate
--   total_score from score_events so it is at least consistent with what
--   the server recorded, and we report potential quiz-source inflation for
--   manual review.
--
-- Safety:
--   - Wrapped in a transaction (implicit in Supabase migrations)
--   - Dry-run diagnostic queries provided as comments
--   - Only daily duplicates are deleted; quiz-source rows are untouched
--   - total_score is recalculated from remaining score_events (idempotent)
--   - Running this migration twice produces the same result

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: DRY-RUN DIAGNOSTICS (run these SELECTs first before applying)
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1a. Daily duplicates: same user answered the same daily question in multiple runs
--
-- SELECT
--   se.user_id,
--   us.username,
--   se.question_id,
--   COUNT(*) AS duplicate_count,
--   SUM(se.points) AS total_points_awarded,
--   MIN(se.points) AS points_per_answer,
--   SUM(se.points) - MIN(se.points) AS excess_points,
--   array_agg(se.quiz_run_id ORDER BY se.created_at) AS run_ids
-- FROM score_events se
-- JOIN user_stats us ON us.user_id = se.user_id
-- WHERE se.source = 'daily'
-- GROUP BY se.user_id, us.username, se.question_id
-- HAVING COUNT(*) > 1
-- ORDER BY us.username, se.question_id;

-- 1b. Per-user daily inflation summary
--
-- SELECT
--   us.user_id,
--   us.username,
--   us.total_score AS current_total_score,
--   COUNT(*) FILTER (WHERE dup.duplicate_count > 1) AS questions_with_dupes,
--   COALESCE(SUM(dup.excess_points), 0) AS daily_excess_points
-- FROM user_stats us
-- LEFT JOIN (
--   SELECT
--     user_id,
--     question_id,
--     COUNT(*) AS duplicate_count,
--     SUM(points) - MIN(points) AS excess_points
--   FROM score_events
--   WHERE source = 'daily'
--   GROUP BY user_id, question_id
--   HAVING COUNT(*) > 1
-- ) dup ON dup.user_id = us.user_id
-- GROUP BY us.user_id, us.username, us.total_score
-- HAVING COALESCE(SUM(dup.excess_points), 0) > 0
-- ORDER BY daily_excess_points DESC;

-- 1c. Quiz-source potential inflation (for manual review only - NOT auto-repaired)
--     These could be legitimate topic replays OR mixed-mode duplicates.
--
-- SELECT
--   us.user_id,
--   us.username,
--   se.question_id,
--   COUNT(*) AS run_count,
--   SUM(se.points) AS total_points_awarded,
--   array_agg(se.quiz_run_id ORDER BY se.created_at) AS run_ids,
--   array_agg(se.created_at ORDER BY se.created_at) AS timestamps
-- FROM score_events se
-- JOIN user_stats us ON us.user_id = se.user_id
-- WHERE se.source = 'quiz'
-- GROUP BY us.user_id, us.username, se.question_id
-- HAVING COUNT(*) > 1
-- ORDER BY COUNT(*) DESC
-- LIMIT 50;

-- 1d. Consistency check: current total_score vs SUM(score_events)
--
-- SELECT
--   us.user_id,
--   us.username,
--   us.total_score AS stored_total,
--   COALESCE(se_sum.actual_total, 0) AS events_total,
--   us.total_score - COALESCE(se_sum.actual_total, 0) AS drift
-- FROM user_stats us
-- LEFT JOIN (
--   SELECT user_id, SUM(points) AS actual_total
--   FROM score_events
--   GROUP BY user_id
-- ) se_sum ON se_sum.user_id = us.user_id
-- WHERE us.total_score != COALESCE(se_sum.actual_total, 0)
-- ORDER BY ABS(us.total_score - COALESCE(se_sum.actual_total, 0)) DESC;


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: DELETE daily-source duplicate score_events
-- ═══════════════════════════════════════════════════════════════════════════════
-- Keep the earliest event per (user_id, question_id) for daily source.
-- Delete all later duplicates.

DELETE FROM score_events
WHERE source = 'daily'
  AND id NOT IN (
    SELECT MIN(id)
    FROM score_events
    WHERE source = 'daily'
    GROUP BY user_id, question_id
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: RECALCULATE total_score from score_events
-- ═══════════════════════════════════════════════════════════════════════════════
-- This makes total_score consistent with the actual score_events, handling
-- both the daily dedup above and any historical drift from failed UPDATEs.
-- Idempotent: running twice gives the same result.

UPDATE user_stats us
SET total_score = COALESCE(se_sum.actual_total, 0),
    updated_at  = now()
FROM (
  SELECT user_id, SUM(points) AS actual_total
  FROM score_events
  GROUP BY user_id
) se_sum
WHERE se_sum.user_id = us.user_id
  AND us.total_score != se_sum.actual_total;
