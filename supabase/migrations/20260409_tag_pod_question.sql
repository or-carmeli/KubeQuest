-- Tag the Pod question that was missed in 20260408
UPDATE quiz_questions SET tags = '["pod-architecture"]'::jsonb
WHERE q LIKE '%What is a Pod in Kubernetes%' OR q LIKE '%מה הוא Pod ב-Kubernetes%';
