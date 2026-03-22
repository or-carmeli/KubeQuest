-- ─── Service selector explanation: wrap YAML in fenced code block ──

-- Hebrew
UPDATE quiz_questions
SET explanation = E'Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n```\n\nכל Pod עם label של app: my-app ייכנס לרשימת ה-Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.'
WHERE topic_id = 'services'
  AND level = 'easy'
  AND lang = 'he'
  AND explanation LIKE '%selector%app: my-app%targetPort%';

-- English
UPDATE quiz_questions
SET explanation = E'A Service defines a label selector. The Endpoints controller finds matching Pods.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n```\n\nEvery Pod with the label app: my-app is added to the Endpoints list.\nkube-proxy routes traffic to one of the healthy endpoints.'
WHERE topic_id = 'services'
  AND level = 'easy'
  AND lang = 'en'
  AND explanation LIKE '%selector%app: my-app%targetPort%';
