-- Fix bidi rendering of runAsNonRoot: true in config topic explanations.
-- The previous fix (20260506) only targeted topic_id = 'security'.
-- This catches any remaining rows across all topics.

UPDATE quiz_questions
SET explanation = REPLACE(explanation, 'ההגדרה runAsNonRoot: true', 'ההגדרה `runAsNonRoot: true`')
WHERE explanation LIKE '%ההגדרה runAsNonRoot: true%'
  AND explanation NOT LIKE '%`runAsNonRoot: true`%';
