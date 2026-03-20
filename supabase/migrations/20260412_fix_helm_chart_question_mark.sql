-- Fix question mark placement in Hebrew Helm Chart questions.
-- Add RLM (U+200F) before '?' so it anchors to RTL context instead of
-- attaching to the preceding LTR "Chart" text.

UPDATE quiz_questions
SET q = REPLACE(q, 'Helm Chart?', E'Helm Chart\u200F?')
WHERE lang = 'he'
  AND q LIKE '%Helm Chart?%';
