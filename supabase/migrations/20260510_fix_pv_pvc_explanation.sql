-- Fix PV-PVC binding explanation to be clearer and more detailed.

UPDATE quiz_questions
SET explanation = E'Kubernetes מחבר בין PVC ל-PV לפי התאמה של כמה פרמטרים:\n`storageClassName`\n`accessModes`\nגודל האחסון (ה-PV חייב להיות גדול או שווה לבקשה של ה-PVC)\nכאשר נמצא PV מתאים, Kubernetes יוצר binding בין ה-PVC ל-PV.\nPV הוא משאב ברמת ה-cluster, ולכן הוא לא שייך ל-Namespace מסוים.\nלאחר ה-binding, ה-PVC וה-PV נשארים מקושרים עד שאחד מהם נמחק.'
WHERE topic_id = 'storage'
  AND lang = 'he'
  AND q LIKE '%PV ו-PVC מתחברים%';

UPDATE quiz_questions
SET explanation = E'Kubernetes binds a PVC to a PV based on matching parameters:\n`storageClassName`\n`accessModes`\nstorage capacity (the PV must be greater than or equal to the PVC request)\nWhen a suitable PV is found, Kubernetes creates a binding between the PVC and the PV.\nNote that a PV is a cluster-level resource, so it does not belong to a specific Namespace.\nAfter binding, the PVC and PV remain linked until one of them is deleted.'
WHERE topic_id = 'storage'
  AND lang = 'en'
  AND q LIKE '%PV and PVC bind%';
