-- Fix explanations: replace 'Option N' references with descriptive text
-- Mirrors commit 2d99b61 changes from topics.js into the Supabase DB

UPDATE quiz_questions SET explanation = E'Job מריץ משימה חד-פעמית עד הצלחה; CronJob מתזמן Jobs לפי cron schedule.\nJob = run-to-completion. CronJob = תזמון חוזר (גיבוי, ניקוי, דוחות).\nשניהם יוצרים Pods שרצים עד להשלמה, לא Pods שרצים לצמיתות.\nבכישלון, Job יוצר Pod חדש ומנסה שוב (עד backoffLimit).' WHERE explanation LIKE '%Option 3 מהפך את התפקידים%';

UPDATE quiz_questions SET explanation = E'Job runs a task once to completion; CronJob schedules Jobs on a recurring cron schedule.\nJob = run-to-completion. CronJob = recurring (backups, cleanup, reports).\nBoth create Pods that run to completion, not long-running Pods.\nOn failure, Job retries by creating new Pods (up to backoffLimit).' WHERE explanation LIKE '%Option 0 reverses the roles%';

UPDATE quiz_questions SET explanation = E'Role מוגבל ל-Namespace ספציפי. ClusterRole חל על כל ה-Cluster.\nRole ב-prod לא מעניק גישה ב-staging. ClusterRole כולל Nodes, PVs ועוד.\nשניהם חלים על Users, Groups, ו-ServiceAccounts. ההבדל המרכזי הוא ב-scope בלבד.\nניתן לקשור ClusterRole ל-Namespace בודד עם RoleBinding.' WHERE explanation LIKE '%Option 1 שגוי: ClusterRole חל על כל המשאבים%';

UPDATE quiz_questions SET explanation = E'Role is Namespace-scoped. ClusterRole applies cluster-wide.\nRole in prod grants no access in staging. ClusterRole covers Nodes, PVs, etc.\nBoth apply to Users, Groups, and ServiceAccounts. The key difference is scope, not verbs.\nClusterRole can be bound to a single Namespace via RoleBinding.' WHERE explanation LIKE '%Option 0 is wrong: ClusterRole covers all resources%';

UPDATE quiz_questions SET explanation = E'Sealed Secrets מצפין Secret ל-SealedSecret עם המפתח הציבורי של ה-Cluster.\nה-SealedSecret המוצפן בטוח לשמירה ב-git. רק ה-controller עם המפתח הפרטי מפענח.\nכל Cluster מחזיק מפתח פרטי ייחודי, כך ש-SealedSecret מ-Cluster אחד לא ניתן לפענוח ב-Cluster אחר.\nההצפנה חלה רק על Secrets בתוך git, לא על תעבורת רשת או יצירת secrets מ-env vars.' WHERE explanation LIKE '%Option 1 שגוי: SealedSecret מ-Cluster A%';

UPDATE quiz_questions SET explanation = E'Sealed Secrets encrypts a Secret into a SealedSecret using the cluster''s public key.\nThe SealedSecret is safe to commit to git. Only the cluster''s controller can decrypt it.\nEach cluster holds a unique private key, so a SealedSecret from one cluster cannot be decrypted by another.\nThe encryption applies only to Secrets stored in git, not to network traffic or auto-creation from env vars.' WHERE explanation LIKE '%Option 0 is wrong: a SealedSecret from Cluster A%';

UPDATE quiz_questions SET explanation = E'כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית.\nשינוי גודל דיסק קיים נעשה דרך Volume Expansion, לא דרך Dynamic Provisioning.\nזו הגישה הסטנדרטית בכל Cluster ענן, והיא חוסכת יצירת PV ידנית.' WHERE explanation LIKE '%Option 1 שגוי: Dynamic Provisioning הוא יצירה%';

UPDATE quiz_questions SET explanation = E'כשה-PVC נמחק, גם ה-PV והדיסק הפיזי (EBS, GCP PD) נמחקים אוטומטית.\nRetain לעומת זאת משמר את ה-PV והנתונים גם אחרי מחיקת ה-PVC.\nאין backup אוטומטי לפני מחיקה, לכן חשוב לגבות מראש בסביבות production.' WHERE explanation LIKE '%Option 0 מתאר את Retain policy%';

UPDATE quiz_questions SET explanation = E'`helm rollback` מחזיר Release ל-revision ספציפי מתוך ההיסטוריה.\nהריצו `helm history` כדי לראות את כל ה-revisions עם תאריכים וסטטוסים, ואז בחרו את ה-revision הרצוי.\nמאחורי הקלעים, rollback הוא למעשה upgrade חדש עם manifests ישנים - ולכן נוצר revision חדש.' WHERE explanation LIKE '%Option 0 מתאר helm uninstall. Option 1 מתאר helm upgrade%';

UPDATE quiz_questions SET explanation = E'K8s מחבר PVC ל-PV לפי storageClassName, accessModes, ו-capacity (PV >= PVC).\nהשם לא חייב להתאים. PV הוא cluster-level resource ולא משויך ל-Namespace.\nלאחר binding הם קשורים עד שאחד נמחק.' WHERE explanation LIKE '%Option 0 שגוי: שם לא חייב להתאים. Option 1 שגוי: PV הוא cluster-level%';

UPDATE quiz_questions SET explanation = E'When a PVC references a StorageClass, the provisioner creates a PV and real disk automatically.\nResizing an existing disk is done via Volume Expansion, not Dynamic Provisioning.\nThis is the standard approach in all cloud-hosted Kubernetes clusters, eliminating the need for manual PV creation.' WHERE explanation LIKE '%Option 3 is wrong: Dynamic Provisioning is creation%';

UPDATE quiz_questions SET explanation = E'When the PVC is deleted, both the PV and the physical disk (EBS, GCP PD) are deleted automatically.\nRetain policy, by contrast, preserves the PV and data even after PVC deletion.\nThere is no automatic backup before deletion, so always back up production data beforehand.' WHERE explanation LIKE '%Option 1 describes Retain policy, not Delete%';

UPDATE quiz_questions SET explanation = E'`helm rollback` reverts a Release to a specific revision from its history.\nRun `helm history` to see all revisions with timestamps and statuses, then pick the revision you want.\nUnder the hood, a rollback is technically a new upgrade using old manifests - so it creates a new revision number.' WHERE explanation LIKE '%Option 2 describes helm uninstall. Option 0 describes helm upgrade%';

UPDATE quiz_questions SET explanation = E'K8s binds a PVC to a PV by matching storageClassName, accessModes, and capacity (PV >= PVC).\nPV names do not need to match PVC names. PVs are cluster-level resources and are not namespaced.\nAfter binding they are locked together until one is deleted.' WHERE explanation LIKE E'%Option 3 is wrong: names don''t need to match%';

UPDATE quiz_questions SET explanation = E'Hooks הם Jobs שרצים בשלבי מחזור חיים של Release: pre-install, post-upgrade, pre-delete ועוד.\nדיבאג של templates נעשה עם `helm template`, ו-rollback נעשה עם `helm rollback`.\nשימושים נפוצים: DB migrations לפני upgrade, או התראת Slack אחרי deploy.' WHERE explanation LIKE '%Option 0 שגוי: debug נעשה עם helm template%';

UPDATE quiz_questions SET explanation = E'Hooks are Jobs that run at specific Release lifecycle points: pre-install, post-upgrade, pre-delete, etc.\nTemplate debugging is done with `helm template`, and rollback is done with `helm rollback`.\nCommon uses: DB migrations before upgrade, or Slack notifications after deploy.' WHERE explanation LIKE '%Option 0 is wrong: rollback is done with helm rollback. Option 2 is wrong%';
