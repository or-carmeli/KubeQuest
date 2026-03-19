-- ── Generate hints for questions that don't have one yet ─────────────────────
-- Minimal hints: one short sentence, guides thinking without revealing answer.
-- Each hint is 4-10 words max. No definitions, no direct concept naming.

-- Quiz questions
UPDATE quiz_questions
SET hint = CASE
  WHEN explanation ~* 'readiness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: traffic או restart?'
    ELSE 'Think about traffic versus restart.' END
  WHEN explanation ~* 'liveness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: traffic או restart?'
    ELSE 'Think about traffic versus restart.' END
  WHEN explanation ~* 'OOM|Out Of Memory|memory limit' THEN
    CASE WHEN lang = 'he' THEN 'שימו לב למה שהרג את התהליך.'
    ELSE 'Notice what killed the process.' END
  WHEN explanation ~* 'NetworkPolicy' THEN
    CASE WHEN lang = 'he' THEN 'מי חוסם את מי?'
    ELSE 'Who is blocking whom?' END
  WHEN explanation ~* 'DNS|CoreDNS|kube-dns' THEN
    CASE WHEN lang = 'he' THEN 'איך שמות הופכים לכתובות?'
    ELSE 'How do names become addresses?' END
  WHEN explanation ~* 'RBAC|Role|ClusterRole|ServiceAccount' THEN
    CASE WHEN lang = 'he' THEN 'מי מורשה לעשות מה?'
    ELSE 'Who is allowed to do what?' END
  WHEN explanation ~* 'PVC|PersistentVolume|StorageClass|ReadWriteOnce' THEN
    CASE WHEN lang = 'he' THEN 'חשבו מה שורד restart.'
    ELSE 'Consider what survives a restart.' END
  WHEN explanation ~* 'ConfigMap' THEN
    CASE WHEN lang = 'he' THEN 'איפה ההגדרות נשמרות?'
    ELSE 'Where does configuration live?' END
  WHEN explanation ~* 'Secret' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מידע רגיש.'
    ELSE 'Think about sensitive data.' END
  WHEN explanation ~* 'Ingress' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: בחוץ מול בפנים.'
    ELSE 'Think outside versus inside.' END
  WHEN explanation ~* 'HPA|Horizontal Pod Autoscaler|metrics-server' THEN
    CASE WHEN lang = 'he' THEN 'מה מודד את העומס?'
    ELSE 'What measures the load?' END
  WHEN explanation ~* 'selector|labels|label' THEN
    CASE WHEN lang = 'he' THEN 'הסתכלו היטב על שמות ותוויות.'
    ELSE 'Look carefully at names and labels.' END
  WHEN explanation ~* 'namespace' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על scope ובידוד.'
    ELSE 'Focus on scope and isolation.' END
  WHEN explanation ~* 'init container' THEN
    CASE WHEN lang = 'he' THEN 'מה חייב לרוץ קודם?'
    ELSE 'What must run first?' END
  WHEN explanation ~* 'CrashLoopBackOff' THEN
    CASE WHEN lang = 'he' THEN 'מה הקונטיינר ראה אחרון?'
    ELSE 'What did the container see last?' END
  WHEN explanation ~* 'rolling update|rollout' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סדר ההחלפה.'
    ELSE 'Think about the replacement order.' END
  WHEN explanation ~* 'taint|toleration' THEN
    CASE WHEN lang = 'he' THEN 'זה על אילוצי שיבוץ.'
    ELSE 'This is about scheduling constraints.' END
  WHEN explanation ~* 'affinity|anti-affinity' THEN
    CASE WHEN lang = 'he' THEN 'איפה Pod רשאי לרוץ?'
    ELSE 'Where can the Pod land?' END
  WHEN explanation ~* 'Service|ClusterIP|NodePort|LoadBalancer' THEN
    CASE WHEN lang = 'he' THEN 'איך חושפים גישה?'
    ELSE 'How is access exposed?' END
  WHEN explanation ~* 'StatefulSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על זהות וסדר.'
    ELSE 'Think about identity and order.' END
  WHEN explanation ~* 'DaemonSet' THEN
    CASE WHEN lang = 'he' THEN 'אחד על כל אחד.'
    ELSE 'One on every one.' END
  WHEN explanation ~* 'Job|CronJob' THEN
    CASE WHEN lang = 'he' THEN 'רץ וגומר, או חוזר?'
    ELSE 'Runs and finishes, or recurs?' END
  WHEN explanation ~* 'ResourceQuota|LimitRange' THEN
    CASE WHEN lang = 'he' THEN 'מי מגביל את המשאבים?'
    ELSE 'What enforces the boundaries?' END
  WHEN explanation ~* 'etcd' THEN
    CASE WHEN lang = 'he' THEN 'איפה כל המצב נשמר?'
    ELSE 'Where is all state stored?' END
  WHEN explanation ~* 'kubelet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: control plane או node?'
    ELSE 'Think control plane or node.' END
  WHEN explanation ~* 'scheduler' THEN
    CASE WHEN lang = 'he' THEN 'מי מחליט איפה לרוץ?'
    ELSE 'Who decides where to run?' END
  WHEN explanation ~* 'kubectl' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הפעולה הנכונה.'
    ELSE 'Think about the right verb.' END
  ELSE
    CASE WHEN lang = 'he' THEN 'קראו שוב ושימו לב לפרטים.'
    ELSE 'Re-read and focus on the details.' END
END
WHERE hint IS NULL;

-- Daily questions (same logic)
UPDATE daily_questions
SET hint = CASE
  WHEN explanation ~* 'readiness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: traffic או restart?'
    ELSE 'Think about traffic versus restart.' END
  WHEN explanation ~* 'liveness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: traffic או restart?'
    ELSE 'Think about traffic versus restart.' END
  WHEN explanation ~* 'OOM|Out Of Memory|memory limit' THEN
    CASE WHEN lang = 'he' THEN 'שימו לב למה שהרג את התהליך.'
    ELSE 'Notice what killed the process.' END
  WHEN explanation ~* 'NetworkPolicy' THEN
    CASE WHEN lang = 'he' THEN 'מי חוסם את מי?'
    ELSE 'Who is blocking whom?' END
  WHEN explanation ~* 'DNS|CoreDNS|kube-dns' THEN
    CASE WHEN lang = 'he' THEN 'איך שמות הופכים לכתובות?'
    ELSE 'How do names become addresses?' END
  WHEN explanation ~* 'RBAC|Role|ClusterRole|ServiceAccount' THEN
    CASE WHEN lang = 'he' THEN 'מי מורשה לעשות מה?'
    ELSE 'Who is allowed to do what?' END
  WHEN explanation ~* 'PVC|PersistentVolume|StorageClass|ReadWriteOnce' THEN
    CASE WHEN lang = 'he' THEN 'חשבו מה שורד restart.'
    ELSE 'Consider what survives a restart.' END
  WHEN explanation ~* 'ConfigMap' THEN
    CASE WHEN lang = 'he' THEN 'איפה ההגדרות נשמרות?'
    ELSE 'Where does configuration live?' END
  WHEN explanation ~* 'Secret' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מידע רגיש.'
    ELSE 'Think about sensitive data.' END
  WHEN explanation ~* 'Ingress' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: בחוץ מול בפנים.'
    ELSE 'Think outside versus inside.' END
  WHEN explanation ~* 'HPA|Horizontal Pod Autoscaler|metrics-server' THEN
    CASE WHEN lang = 'he' THEN 'מה מודד את העומס?'
    ELSE 'What measures the load?' END
  WHEN explanation ~* 'selector|labels|label' THEN
    CASE WHEN lang = 'he' THEN 'הסתכלו היטב על שמות ותוויות.'
    ELSE 'Look carefully at names and labels.' END
  WHEN explanation ~* 'namespace' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על scope ובידוד.'
    ELSE 'Focus on scope and isolation.' END
  WHEN explanation ~* 'init container' THEN
    CASE WHEN lang = 'he' THEN 'מה חייב לרוץ קודם?'
    ELSE 'What must run first?' END
  WHEN explanation ~* 'CrashLoopBackOff' THEN
    CASE WHEN lang = 'he' THEN 'מה הקונטיינר ראה אחרון?'
    ELSE 'What did the container see last?' END
  WHEN explanation ~* 'rolling update|rollout' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סדר ההחלפה.'
    ELSE 'Think about the replacement order.' END
  WHEN explanation ~* 'taint|toleration' THEN
    CASE WHEN lang = 'he' THEN 'זה על אילוצי שיבוץ.'
    ELSE 'This is about scheduling constraints.' END
  WHEN explanation ~* 'affinity|anti-affinity' THEN
    CASE WHEN lang = 'he' THEN 'איפה Pod רשאי לרוץ?'
    ELSE 'Where can the Pod land?' END
  WHEN explanation ~* 'Service|ClusterIP|NodePort|LoadBalancer' THEN
    CASE WHEN lang = 'he' THEN 'איך חושפים גישה?'
    ELSE 'How is access exposed?' END
  WHEN explanation ~* 'StatefulSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על זהות וסדר.'
    ELSE 'Think about identity and order.' END
  WHEN explanation ~* 'DaemonSet' THEN
    CASE WHEN lang = 'he' THEN 'אחד על כל אחד.'
    ELSE 'One on every one.' END
  WHEN explanation ~* 'Job|CronJob' THEN
    CASE WHEN lang = 'he' THEN 'רץ וגומר, או חוזר?'
    ELSE 'Runs and finishes, or recurs?' END
  WHEN explanation ~* 'ResourceQuota|LimitRange' THEN
    CASE WHEN lang = 'he' THEN 'מי מגביל את המשאבים?'
    ELSE 'What enforces the boundaries?' END
  WHEN explanation ~* 'etcd' THEN
    CASE WHEN lang = 'he' THEN 'איפה כל המצב נשמר?'
    ELSE 'Where is all state stored?' END
  WHEN explanation ~* 'kubelet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו: control plane או node?'
    ELSE 'Think control plane or node.' END
  WHEN explanation ~* 'scheduler' THEN
    CASE WHEN lang = 'he' THEN 'מי מחליט איפה לרוץ?'
    ELSE 'Who decides where to run?' END
  WHEN explanation ~* 'kubectl' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הפעולה הנכונה.'
    ELSE 'Think about the right verb.' END
  ELSE
    CASE WHEN lang = 'he' THEN 'קראו שוב ושימו לב לפרטים.'
    ELSE 'Re-read and focus on the details.' END
END
WHERE hint IS NULL;
