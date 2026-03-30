-- Rewrite HPA/ignoreDifferences explanation to be clearer.

UPDATE quiz_questions
SET explanation = E'כאשר משתמשים ב-HPA, הוא משנה את מספר ה-replicas של ה-Deployment באופן דינמי לפי עומס.\nמכיוון שמספר ה-replicas שמוגדר ב-Git נשאר קבוע, ArgoCD מזהה את השינוי כ-drift ומציג את ה-Application במצב OutOfSync.\nכדי למנוע זאת, ניתן להגדיר ל-ArgoCD להתעלם מהשדה `spec.replicas` באמצעות `ignoreDifferences`.\nכך ArgoCD לא ישווה את השדה הזה מול הערך שמוגדר ב-Git.'
WHERE topic_id = 'argo'
  AND lang = 'he'
  AND q LIKE '%HPA%replicas%OutOfSync%';

UPDATE quiz_questions
SET explanation = E'When using an HPA, it dynamically adjusts the replicas field of a Deployment based on load.\nSince the value in Git remains fixed, ArgoCD detects the change as drift and marks the Application as OutOfSync.\nTo prevent this, you can configure ArgoCD to ignore the `spec.replicas` field using `ignoreDifferences`.\nThis prevents ArgoCD from comparing that field against the value stored in Git.'
WHERE topic_id = 'argo'
  AND lang = 'en'
  AND q LIKE '%HPA%replicas%OutOfSync%';
