-- ── Update quiz questions ───────────────────────────────────────────────────
-- 1. "Connection refused" - shorten explanation, balance answer lengths
-- 2. "top CPU" - add realistic output, restructure as troubleshooting card
-- 3. "Helm Hook" - rewrite question, answers, and explanation
--
-- Run against Supabase:
--   psql "$DATABASE_URL" -f scripts/update-connection-refused-top.sql

-- ─── Connection refused (Hebrew) ────────────────────────────────────────────
UPDATE quiz_questions
SET
  options = '["שם השרת לא מצליח להתפענח ב-DNS","אין שירות שמאזין על הפורט או ש-firewall חוסם","פורט המקור בצד הלקוח תפוס ולא זמין","תעודת SSL לא תקינה וה-handshake נכשל"]'::jsonb,
  answer = 1,
  explanation = E'Connection refused = חבילת TCP SYN הגיעה לשרת, אבל הוא ענה ב-RST.\n\nDNS ו-routing עובדים. הבעיה: אין מי שמאזין על הפורט, או firewall דוחה.\n\nבעיית DNS הייתה מציגה Could not resolve host.\nSSL רלוונטי רק אחרי שה-TCP connection הצליח.'
WHERE topic_id = 'linux'
  AND level = 'easy'
  AND lang = 'he'
  AND q LIKE '%connect to remote-server port 8080%';

-- ─── Connection refused (English) ───────────────────────────────────────────
UPDATE quiz_questions
SET
  options = '["DNS failed to resolve the server hostname","No service is listening on the port, or a firewall is blocking","The source port on the client side is unavailable","The SSL certificate is invalid and the handshake failed"]'::jsonb,
  answer = 1,
  explanation = E'Connection refused = the TCP SYN reached the server, but it replied with RST.\n\nDNS and routing work. The problem: nothing is listening on that port, or a firewall is rejecting it.\n\nA DNS issue would show Could not resolve host.\nSSL is only relevant after the TCP connection succeeds.'
WHERE topic_id = 'linux'
  AND level = 'easy'
  AND lang = 'en'
  AND q LIKE '%connect to remote-server port 8080%';

-- ─── top CPU (Hebrew) ───────────────────────────────────────────────────────
UPDATE quiz_questions
SET
  q = E'שרת מגיב לאט. מריצים top ורואים:\n\n```\n$ top\n%Cpu(s): 72.5 us, 18.0 sy, 0.3 ni, 5.0 id, 4.0 wa, 0.0 hi, 0.2 si\n```\n\nמה מעיד על עומס גבוה על ה-CPU?',
  options = '["ערך %id נמוך (5.0%) - המעבד כמעט לא פנוי","ערך %wa גבוה (4.0%) - המעבד ממתין לדיסק","ערך %ni גבוה (0.3%) - תהליכים עם עדיפות שונה","ערך %si גבוה (0.2%) - פסיקות תוכנה תכופות"]'::jsonb,
  answer = 0,
  explanation = E'בשורת %Cpu(s) של top, השדה %id (idle) מציין כמה מהמעבד פנוי.\n\nכאן הערך הוא 5.0% בלבד, כלומר ה-CPU תפוס ב-95% מהזמן (%us + %sy = 90.5%).\n\n%wa מתייחס להמתנה לדיסק ולא לעומס מעבד ישיר.\n%ni ו-%si נמוכים מאוד ואינם מעידים על בעיה.'
WHERE topic_id = 'linux'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%top%'
  AND q LIKE '%CPU%';

-- ─── top CPU (English) ──────────────────────────────────────────────────────
UPDATE quiz_questions
SET
  q = E'A server is responding slowly. You run top and see:\n\n```\n$ top\n%Cpu(s): 72.5 us, 18.0 sy, 0.3 ni, 5.0 id, 4.0 wa, 0.0 hi, 0.2 si\n```\n\nWhat indicates high CPU load?',
  options = '["Low %id (5.0%) - the CPU is barely idle","High %wa (4.0%) - the CPU is waiting for disk","High %ni (0.3%) - processes with altered priority","High %si (0.2%) - frequent software interrupts"]'::jsonb,
  answer = 0,
  explanation = E'In top''s %Cpu(s) line, %id (idle) shows how much CPU is free.\n\nHere it''s only 5.0%, meaning the CPU is 95% busy (%us + %sy = 90.5%).\n\n%wa refers to disk wait, not direct CPU load.\n%ni and %si are very low and don''t indicate a problem.'
WHERE topic_id = 'linux'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%top%'
  AND q LIKE '%CPU%';

-- ─── Helm Hook (Hebrew) ────────────────────────────────────────────────────
UPDATE quiz_questions
SET
  q = E'מה התפקיד של Helm Hook?',
  options = '["כלי לניפוי שגיאות (debug) של templates לפני פריסה","הרצת משאב (לרוב Job) בנקודה מסוימת במחזור החיים של Release","מנגנון לביצוע rollback לגרסה קודמת של Release","סוג Chart שמכיל רק dependencies ללא templates"]'::jsonb,
  answer = 1,
  explanation = E'Helm Hooks מאפשרים להריץ משאבים של Kubernetes בנקודות מוגדרות במחזור החיים של Release, כמו לפני או אחרי פעולות install, upgrade או delete.\n\nברוב המקרים מדובר ב-Job שמבצע פעולה חד-פעמית, למשל:\nהרצת database migrations לפני deploy (pre-install, pre-upgrade)\nבדיקות או התראות לאחר deploy (post-install, post-upgrade)\n\nה-Hook מוגדר באמצעות annotation ב-YAML, ו-Helm מפעיל אותו אוטומטית בשלב המתאים.\n\nאיך זה נראה טכנית?\nמגדירים ב-YAML:\n\n```yaml\nannotations:\n  "helm.sh/hook": pre-install\n```\n\nואז Helm יודע להריץ את המשאב הזה בזמן המתאים.'
WHERE topic_id = 'storage'
  AND level = 'hard'
  AND lang = 'he'
  AND q LIKE '%Helm Hook%';

-- ─── Helm Hook (English) ───────────────────────────────────────────────────
UPDATE quiz_questions
SET
  q = E'What is the role of a Helm Hook?',
  options = '["A tool for debugging templates before deployment","Running a resource (usually a Job) at a specific point in the Release lifecycle","A mechanism for rolling back to a previous Release version","A Chart type that contains only dependencies without templates"]'::jsonb,
  answer = 1,
  explanation = E'Helm Hooks allow running Kubernetes resources at defined points in the Release lifecycle, such as before or after install, upgrade, or delete operations.\n\nTypically this is a Job performing a one-time action, for example:\nRunning database migrations before deploy (pre-install, pre-upgrade)\nTests or notifications after deploy (post-install, post-upgrade)\n\nThe Hook is defined via an annotation in YAML, and Helm triggers it automatically at the right stage.\n\nHow does it look technically?\nDefine in YAML:\n\n```yaml\nannotations:\n  "helm.sh/hook": pre-install\n```\n\nThen Helm knows to run this resource at the appropriate time.'
WHERE topic_id = 'storage'
  AND level = 'hard'
  AND lang = 'en'
  AND q LIKE '%Helm Hook%';

-- ─── web-server describe (Hebrew) ──────────────────────────────────────────
UPDATE quiz_questions
SET
  q = E'ה-Pod ''web-server'' לא מגיב. איזו פקודה תציג מידע מפורט ו-events לצורך אבחון?'
WHERE topic_id = 'troubleshooting'
  AND level = 'easy'
  AND lang = 'he'
  AND q LIKE '%web-server%'
  AND q LIKE '%events%';

-- ─── helm template explanation - remove comma after "helm install" (Hebrew) ─
UPDATE quiz_questions
SET
  explanation = REPLACE(explanation, 'בניגוד ל-helm install, הפקודה', 'בניגוד ל-helm install הפקודה')
WHERE topic_id = 'storage'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%helm template%';

-- ─── journalctl explanation - add terminal + output example (Hebrew) ────────
UPDATE quiz_questions
SET
  explanation = E'שירות לא עולה? קודם כל קוראים את הלוגים:\n\n```\n$ journalctl -u service-name --no-pager -n 50\nMar 19 08:12:02 srv1 service-name[1423]: Error: failed to bind port 8080: address already in use\nMar 19 08:12:02 srv1 systemd[1]: service-name.service: Main process exited, code=exited, status=1/FAILURE\n```\n\nn 50- מגביל ל-50 שורות אחרונות - מספיק לזהות את שגיאת ההפעלה.\n\nsystemctl restart בלי לבדוק לוגים קודם זה טעות - הבעיה תחזור.\ndmesg מציג הודעות kernel, לא לוגים של שירותים.'
WHERE topic_id = 'linux'
  AND level = 'easy'
  AND lang = 'he'
  AND q LIKE '%שירות לא עולה%'
  AND q LIKE '%לוגים%';

-- ─── journalctl explanation - add terminal + output example (English) ───────
UPDATE quiz_questions
SET
  explanation = E'Service won''t start? Read the logs first:\n\n```\n$ journalctl -u service-name --no-pager -n 50\nMar 19 08:12:02 srv1 service-name[1423]: Error: failed to bind port 8080: address already in use\nMar 19 08:12:02 srv1 systemd[1]: service-name.service: Main process exited, code=exited, status=1/FAILURE\n```\n\n-n 50 limits to the last 50 lines - enough to spot the startup error.\n\nsystemctl restart without checking logs first is a mistake - the problem will return.\ndmesg shows kernel messages, not service logs.'
WHERE topic_id = 'linux'
  AND level = 'easy'
  AND lang = 'en'
  AND q LIKE '%service won''t start%'
  AND q LIKE '%logs%';

-- ─── WaitForFirstConsumer - add YAML example to question (Hebrew) ───────────
UPDATE quiz_questions
SET
  q = E'מה volume binding mode WaitForFirstConsumer?\n\n```yaml\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nvolumeBindingMode: WaitForFirstConsumer\n```'
WHERE topic_id = 'storage'
  AND level = 'hard'
  AND lang = 'he'
  AND q LIKE '%WaitForFirstConsumer%'
  AND q NOT LIKE '%```%';

-- ─── WaitForFirstConsumer - add YAML example to question (English) ──────────
UPDATE quiz_questions
SET
  q = E'What does volume binding mode WaitForFirstConsumer do?\n\n```yaml\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nvolumeBindingMode: WaitForFirstConsumer\n```'
WHERE topic_id = 'storage'
  AND level = 'hard'
  AND lang = 'en'
  AND q LIKE '%WaitForFirstConsumer%'
  AND q NOT LIKE '%```%';

-- ─── ContainerCreating - add kubectl get pods output (Hebrew) ───────────────
UPDATE quiz_questions
SET
  q = E'ה-Pod נמצא ב-ContainerCreating זמן רב.\n\n```\n$ kubectl get pods\nNAME          READY   STATUS              RESTARTS   AGE\nweb-app       0/1     ContainerCreating   0          8m\n```\n\nמה הסיבות האפשריות?'
WHERE topic_id = 'troubleshooting'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%ContainerCreating%'
  AND q NOT LIKE '%```%';

-- ─── ContainerCreating - add kubectl get pods output (English) ──────────────
UPDATE quiz_questions
SET
  q = E'A Pod is stuck in ContainerCreating for a long time.\n\n```\n$ kubectl get pods\nNAME          READY   STATUS              RESTARTS   AGE\nweb-app       0/1     ContainerCreating   0          8m\n```\n\nWhat are the likely causes?'
WHERE topic_id = 'troubleshooting'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%ContainerCreating%'
  AND q NOT LIKE '%```%';

-- ─── PodDisruptionBudget - add YAML example to explanation (Hebrew) ─────────
UPDATE quiz_questions
SET
  explanation = E'PodDisruptionBudget (PDB) מגדיר את מספר ה-Pods המינימלי שחייב להישאר זמין בזמן disruptions מתוכננות, כמו `kubectl drain`\n\n```yaml\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web-pdb\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web\n```\n\nעם replicas: 3 ו-minAvailable: 2, Kubernetes יאשר פינוי רק אם לפחות 2 Pods נשארים זמינים.\nמגן על זמינות אפליקציות קריטיות בזמן maintenance.'
WHERE topic_id = 'workloads'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%PodDisruptionBudget%';

-- ─── PodDisruptionBudget - add YAML example to explanation (English) ────────
UPDATE quiz_questions
SET
  explanation = E'PodDisruptionBudget (PDB) defines the minimum number of Pods that must remain available during voluntary disruptions such as `kubectl drain`\n\n```yaml\napiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web-pdb\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web\n```\n\nWith replicas: 3 and minAvailable: 2, Kubernetes will only allow eviction if at least 2 Pods remain available.\nProtects critical application availability during Node maintenance.'
WHERE topic_id = 'workloads'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%PodDisruptionBudget%';

-- ─── runAsNonRoot - rewrite question with YAML example (Hebrew) ─────────────
UPDATE quiz_questions
SET
  q = E'מה עושה ההגדרה runAsNonRoot: true ב-securityContext?\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```',
  options = '["מצפינה את מערכת הקבצים של הקונטיינר","מונעת מהקונטיינר לרוץ כמשתמש root (UID 0)","מגבילה את צריכת ה-CPU של הקונטיינר לפי limits","מגבילה את גישת הרשת של הקונטיינר"]'::jsonb,
  answer = 1,
  explanation = E'ההגדרה runAsNonRoot: true מבטיחה שהתהליך בתוך הקונטיינר לא ירוץ כמשתמש root (UID 0).\n\nאם הקונטיינר מוגדר לרוץ כ-root, Kubernetes ימנע את ההרצה.\n\nזהו מנגנון אבטחה שמקטין את הסיכון להרצת קוד עם הרשאות גבוהות בתוך הקונטיינר.'
WHERE topic_id = 'security'
  AND level = 'easy'
  AND lang = 'he'
  AND q LIKE '%runAsNonRoot%';

-- ─── runAsNonRoot - rewrite question with YAML example (English) ────────────
UPDATE quiz_questions
SET
  q = E'What does the runAsNonRoot: true setting do in securityContext?\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```',
  options = '["Encrypts the container''s filesystem","Prevents the container from running as root user (UID 0)","Limits the container''s CPU usage according to limits","Restricts the container''s network access"]'::jsonb,
  answer = 1,
  explanation = E'The runAsNonRoot: true setting ensures the process inside the container does not run as root (UID 0).\n\nIf the container is configured to run as root, Kubernetes will prevent it from starting.\n\nThis is a security mechanism that reduces the risk of running code with elevated privileges inside the container.'
WHERE topic_id = 'security'
  AND level = 'easy'
  AND lang = 'en'
  AND q LIKE '%runAsNonRoot%';

-- ─── helm rollback - rewrite question with terminal example (Hebrew) ────────
UPDATE quiz_questions
SET
  q = E'מה עושה הפקודה\n\n```\n$ helm rollback\n```'
WHERE topic_id = 'storage'
  AND level = 'medium'
  AND lang = 'he'
  AND q LIKE '%תפקיד%helm rollback%';

-- ─── helm rollback - rewrite question with terminal example (English) ───────
UPDATE quiz_questions
SET
  q = E'What does this command do?\n\n```\n$ helm rollback\n```'
WHERE topic_id = 'storage'
  AND level = 'medium'
  AND lang = 'en'
  AND q LIKE '%purpose%helm rollback%';
