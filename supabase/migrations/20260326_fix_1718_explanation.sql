-- Rewrite explanation for question 1718 (StatefulSet ordering).
-- Improves Hebrew readability with shorter sentences and clearer structure.
-- Does NOT change the question, options, or answer.

UPDATE quiz_questions
SET explanation = 'StatefulSet יוצר Pods לפי סדר (OrderedReady).
Pod-0 חייב להיות Ready לפני ש-Pod-1 נוצר.
כיוון ש-Pod-0 אינו Ready, StatefulSet לא יוצר את Pod-1.
לכן Pod-1 נשאר במצב Pending.
לתיקון: יש לטפל ב-Pod-0 כדי שיגיע למצב Ready, או להגדיר podManagementPolicy: Parallel.
שאר האפשרויות אינן הסיבה:
PVC: Pod-1 לא נוצר בכלל.
Quota: גם Pod-0 לא היה עולה.
ImagePullSecret: היה גורם ל-ImagePullBackOff.
בברירת מחדל, StatefulSet יוצר Pods בסדר עוקב ותקיעה ב-Pod מוקדם חוסמת את כל השאר.'
WHERE id = 1718;
