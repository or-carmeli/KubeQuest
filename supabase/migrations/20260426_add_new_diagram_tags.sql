-- ─── Add diagram tags to questions for 6 new diagrams ──

-- 1. cronjob-hierarchy: Job vs CronJob questions
UPDATE quiz_questions
SET tags = COALESCE(tags, '[]'::jsonb) || '["cronjob-hierarchy"]'::jsonb
WHERE topic_id = 'workloads'
  AND level = 'easy'
  AND q LIKE '%Job%CronJob%'
  AND NOT (tags @> '["cronjob-hierarchy"]'::jsonb);

-- 2. config-mount: ConfigMap usage in Pod
UPDATE quiz_questions
SET tags = COALESCE(tags, '[]'::jsonb) || '["config-mount"]'::jsonb
WHERE topic_id = 'config'
  AND level = 'easy'
  AND q LIKE '%ConfigMap%Pod%'
  AND NOT (tags @> '["config-mount"]'::jsonb);

-- 3. external-secrets: ESO / AWS Secrets Manager
UPDATE quiz_questions
SET tags = COALESCE(tags, '[]'::jsonb) || '["external-secrets"]'::jsonb
WHERE topic_id = 'security'
  AND level = 'medium'
  AND q LIKE '%AWS Secrets Manager%'
  AND NOT (tags @> '["external-secrets"]'::jsonb);

-- 4. sealed-secrets: Sealed Secrets questions
UPDATE quiz_questions
SET tags = COALESCE(tags, '[]'::jsonb) || '["sealed-secrets"]'::jsonb
WHERE topic_id = 'security'
  AND level = 'hard'
  AND q LIKE '%Sealed Secrets%'
  AND NOT (tags @> '["sealed-secrets"]'::jsonb);

-- 5. helm-chart: Helm Chart purpose
UPDATE quiz_questions
SET tags = COALESCE(tags, '[]'::jsonb) || '["helm-chart"]'::jsonb
WHERE topic_id = 'storage'
  AND level = 'easy'
  AND q LIKE '%Helm Chart%'
  AND NOT (tags @> '["helm-chart"]'::jsonb);
