-- Fix seccomp question: add background context and improve explanation
-- Fix df -h disk question: fix command display and improve explanation

-- ── seccomp (Hebrew) ────────────────────────────────────────────────────────
UPDATE quiz_questions
SET q = E'ב-Kubernetes ניתן להגדיר seccomp profile ב-securityContext של Pod.\n\nמה התפקיד של seccomp profile?',
    explanation = E'seccomp (Secure Computing) מגביל אילו system calls קונטיינר יכול לבצע.\n\nלמה זה חשוב?\nב-Linux יש 300+ syscalls, אבל קונטיינר ממוצע צריך רק חלק קטן מהם. חסימת השאר מצמצמת את ה-attack surface.\n\nאיך מגדירים:\n\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n\nRuntimeDefault מפעיל פרופיל בסיסי שחוסם syscalls מסוכנים כמו reboot או mount.'
WHERE q = E'מה seccomp profile עושה?'
  AND lang = 'he';

-- ── seccomp (English) ───────────────────────────────────────────────────────
UPDATE quiz_questions
SET q = E'In Kubernetes you can set a seccomp profile in a Pod''s securityContext.\n\nWhat does a seccomp profile do?',
    explanation = E'seccomp (Secure Computing) restricts which system calls a container can make.\n\nWhy does it matter?\nLinux has 300+ syscalls, but an average container only needs a small subset. Blocking the rest reduces the attack surface.\n\nHow to configure:\n\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n\nRuntimeDefault applies a baseline profile that blocks dangerous syscalls like reboot or mount.'
WHERE q = E'What does a seccomp profile do?'
  AND lang = 'en';

-- ── df -h disk question (Hebrew) ───────────────────────────────────────────
UPDATE quiz_questions
SET options = '["הדיסק כמעט מלא - יש להריץ `du -sh /*` לזיהוי קבצים גדולים","הדיסק כמעט מלא - יש להריץ fsck לתיקון שגיאות מערכת קבצים","הדיסק כמעט מלא - יש למחוק את כל /var/log ולהפעיל מחדש","השימוש בדיסק תקין - ערך של 96% סביר לשרת ייצור"]'::jsonb,
    explanation = E'הדיסק ב-96%, נשארו רק 2GB. ב-100% שירותים יפסיקו לעבוד.\n\nהצעד הראשון - למצוא מה תופס מקום:\n\ndu -sh /*\n\nלרוב האשם הוא /var/log או /tmp.\n\nלמה לא התשובות האחרות?\nfsck מתקן שגיאות במערכת קבצים, לא משחרר מקום.\nמחיקת כל /var/log מסוכנת - עלולה למחוק לוגים קריטיים.\n96% זה לא תקין לשרת ייצור - הכלל הוא לטפל מתחת ל-85%.'
WHERE q LIKE E'%df -h%' AND q LIKE E'%96%%'
  AND lang = 'he';

-- ── df -h disk question (English) ──────────────────────────────────────────
UPDATE quiz_questions
SET explanation = E'96% disk usage, only 2GB left. At 100% services will stop working.\n\nFirst step - find what''s using space:\n\ndu -sh /*\n\nUsually it''s /var/log or /tmp.\n\nWhy not the other answers?\nfsck repairs filesystem errors, it doesn''t free space.\nDeleting all of /var/log is dangerous - may destroy critical logs.\n96% is not normal for production - act before reaching 85%.'
WHERE q LIKE E'%df -h%' AND q LIKE E'%96%%'
  AND lang = 'en';

-- ── Service selector question (Hebrew) ──────────────────────────────────────
UPDATE quiz_questions
SET explanation = E'Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\n\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n\nכל Pod עם label של app: my-app ייכנס לרשימת ה-Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.'
WHERE q = E'כיצד Service מוצא את ה-Pods שלו?'
  AND lang = 'he';

-- ── Service selector question (English) ─────────────────────────────────────
UPDATE quiz_questions
SET explanation = E'A Service defines a label selector. The Endpoints controller finds matching Pods.\n\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n\nEvery Pod with the label app: my-app is added to the Endpoints list.\nkube-proxy routes traffic to one of the healthy endpoints.'
WHERE q = E'How does a Service find its Pods?'
  AND lang = 'en';

-- ── Crashed container logs question (Hebrew) ────────────────────────────────
UPDATE quiz_questions
SET explanation = E'כשקונטיינר קורס, הוא עולה מחדש עם לוגים ריקים.\n\nהפלאג previous-- שולף את הלוגים מההרצה הקודמת שנכשלה, בדיוק מה שצריך לאבחון.\n\nkubectl logs pod-name --previous'
WHERE q = E'כיצד רואים לוגים של קונטיינר שקרס?'
  AND lang = 'he';

-- ── Crashed container logs question (English) ───────────────────────────────
UPDATE quiz_questions
SET explanation = E'When a container crashes, it restarts with empty logs.\n\nThe --previous flag fetches logs from the previous failed run, exactly what you need to diagnose the cause.\n\nkubectl logs pod-name --previous'
WHERE q = E'How do you view logs from a crashed container?'
  AND lang = 'en';

-- ── helm template question (Hebrew) ─────────────────────────────────────────
UPDATE quiz_questions
SET q = E'מה הפקודה\n\n```\nhelm template\n```\n\nעושה?',
    options = '["יוצרת Helm Chart חדש מתוך תבנית ברירת מחדל","שומרת גרסה של ה-Chart לצורך rollback עתידי","ממירה את ה-Chart לקבצי YAML מבלי להחיל אותם על הקלאסטר","מעדכנת את קובץ values.yaml מתוך מאגר מרוחק"]'::jsonb,
    answer = 2,
    explanation = E'הפקודה helm template מבצעת rendering, כלומר ממירה את ה-Chart לקבצי Kubernetes YAML כפי שהם ייראו בפריסה בפועל, אך מבלי לשלוח אותם לקלאסטר.\n\nהפקודה שימושית לצורכי בדיקה, debug, תהליכי CI/CD ול-GitOps, כאשר יש צורך להפיק את ה-YAML המלא ולשמור אותו ב-git.'
WHERE q LIKE E'%helm template%'
  AND q NOT LIKE E'%התקנת%'
  AND q NOT LIKE E'%install%'
  AND lang = 'he';

-- ── helm template question (English) ────────────────────────────────────────
UPDATE quiz_questions
SET q = E'What does the command\n\n```\nhelm template\n```\n\ndo?',
    options = '["Creates a new Helm Chart from a default template","Saves a version of the Chart for future rollback","Converts the Chart to YAML files without applying them to the cluster","Updates the values.yaml file from a remote repository"]'::jsonb,
    answer = 2,
    explanation = E'The helm template command performs rendering, converting the Chart to Kubernetes YAML files as they would appear in an actual deployment, without sending them to the cluster.\n\nUseful for testing, debugging, CI/CD pipelines, and GitOps workflows that need the full YAML stored in git.'
WHERE q LIKE E'%helm template%'
  AND q NOT LIKE E'%install%'
  AND lang = 'en';
