-- Fix awkward Hebrew wording in quiz question options.
-- Question 1713: all 4 options start with unnatural "שה-Pod" / "ש-DaemonSet"
-- prefix and use appended "התנהגות של X" pattern.
-- Rewrite to natural Hebrew sentence structure while preserving meaning
-- and correct answer index (answer = 1).

UPDATE quiz_questions
SET options = '[
  "Pod שרץ פעם אחת עד להשלמה ואינו מופעל מחדש (התנהגות של Job)",
  "DaemonSet מבטיח שירוץ Pod אחד על כל Node ב-Cluster",
  "Pod שרץ רק על Node מסומן עם label מתאים דרך nodeSelector",
  "Pod שמופעל מחדש לפי לוח זמנים קבוע (התנהגות של CronJob)"
]'::jsonb
WHERE id = 1713;
