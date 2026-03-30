-- Fix bidi rendering of runAsNonRoot: true in Hebrew quiz content.
-- Without backticks, RTL reorders the text as "true : runAsNonRoot".
-- Wrapping in backticks triggers inline-code rendering with dir="ltr" isolation.

-- ── quiz_questions: security / easy / he ─────────────────────────────────────
UPDATE quiz_questions
SET
  q = REPLACE(q, 'ההגדרה runAsNonRoot: true', 'ההגדרה `runAsNonRoot: true`'),
  explanation = REPLACE(explanation, 'ההגדרה runAsNonRoot: true', 'ההגדרה `runAsNonRoot: true`')
WHERE topic_id = 'security'
  AND lang = 'he'
  AND q LIKE '%runAsNonRoot%'
  AND q NOT LIKE '%`runAsNonRoot%';

-- ── quiz_questions: security / easy / en ─────────────────────────────────────
UPDATE quiz_questions
SET
  q = REPLACE(q, 'the runAsNonRoot: true', 'the `runAsNonRoot: true`'),
  explanation = REPLACE(explanation, 'The runAsNonRoot: true', 'The `runAsNonRoot: true`')
WHERE topic_id = 'security'
  AND lang = 'en'
  AND q LIKE '%runAsNonRoot%'
  AND q NOT LIKE '%`runAsNonRoot%';

-- ── daily_questions: runAsNonRoot in option text (he) ────────────────────────
UPDATE daily_questions
SET
  options = REPLACE(options::text, 'מגדיר runAsNonRoot: true', 'מגדיר `runAsNonRoot: true`')::jsonb
WHERE lang = 'he'
  AND options::text LIKE '%runAsNonRoot: true%'
  AND options::text NOT LIKE '%`runAsNonRoot%';

-- ── daily_questions: runAsNonRoot in option text (en) ────────────────────────
UPDATE daily_questions
SET
  options = REPLACE(options::text, 'has runAsNonRoot: true', 'has `runAsNonRoot: true`')::jsonb
WHERE lang = 'en'
  AND options::text LIKE '%runAsNonRoot: true%'
  AND options::text NOT LIKE '%`runAsNonRoot%';

-- ── Catch-all: any remaining explanation without backticks ───────────────────
UPDATE quiz_questions
SET explanation = REPLACE(explanation, 'runAsNonRoot: true', '`runAsNonRoot: true`')
WHERE explanation LIKE '%runAsNonRoot: true%'
  AND explanation NOT LIKE '%`runAsNonRoot: true`%';

UPDATE daily_questions
SET explanation = REPLACE(explanation, 'runAsNonRoot: true', '`runAsNonRoot: true`')
WHERE explanation LIKE '%runAsNonRoot: true%'
  AND explanation NOT LIKE '%`runAsNonRoot: true`%';
