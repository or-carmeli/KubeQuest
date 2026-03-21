-- ─── Fix BiDi rendering of -f flag in helm explanations ──

-- helm install question
UPDATE quiz_questions
SET explanation = E'`helm install` מתקין Chart ויוצר Release שנשמר כ-Secret ב-Cluster.\n`helm upgrade` משנה Release קיים. `helm template` מרנדר YAML בלי להתקין. `helm create` יוצר scaffold של Chart חדש.\nאפשר לעקוף ערכים עם `--set key=value` או `\u200E-f myvalues.yaml`.'
WHERE topic_id = 'helm'
  AND lang = 'he'
  AND q LIKE '%helm install%'
  AND explanation LIKE '%--set key=value%או -f myvalues%';

-- values.yaml question
UPDATE quiz_questions
SET explanation = E'values.yaml מכיל ברירות מחדל לכל ה-template variables של Chart.\nאפשר לעקוף ערכים עם `--set key=value` או להחליף קובץ עם `\u200E-f my-values.yaml`.\nכך Chart אחד משרת סביבות שונות (dev, staging, production).'
WHERE topic_id = 'helm'
  AND lang = 'he'
  AND q LIKE '%values.yaml%'
  AND explanation LIKE '%--set key=value%או להחליף%';
