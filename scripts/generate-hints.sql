-- ── Generate hints for questions that don't have one yet ─────────────────────
-- This script creates hints that point to the right concept area
-- without directly revealing the correct answer.
--
-- Strategy: Extract the key Kubernetes concept from the explanation,
-- wrap it in a guiding sentence. Falls back to a generic topic-based hint.

-- Quiz questions
UPDATE quiz_questions
SET hint = CASE
  -- If explanation mentions a specific k8s concept, hint at it
  WHEN explanation ~* 'readiness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על probes ועל מה קורה כש-Pod לא מוכן לקבל traffic'
    ELSE 'Think about probes and what happens when a Pod isn''t ready for traffic' END
  WHEN explanation ~* 'liveness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על probes ועל מה גורם ל-Kubernetes להפעיל מחדש קונטיינר'
    ELSE 'Think about probes and what causes Kubernetes to restart a container' END
  WHEN explanation ~* 'OOM|Out Of Memory|memory limit' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול זיכרון ומה קורה כשקונטיינר חורג מהמגבלות'
    ELSE 'Think about memory management and what happens when a container exceeds its limits' END
  WHEN explanation ~* 'NetworkPolicy' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על חוקי רשת וגישה בין Pods'
    ELSE 'Think about network rules and access between Pods' END
  WHEN explanation ~* 'DNS|CoreDNS|kube-dns' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על שירות ה-DNS הפנימי של Kubernetes'
    ELSE 'Think about the internal DNS service in Kubernetes' END
  WHEN explanation ~* 'RBAC|Role|ClusterRole|ServiceAccount' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הרשאות וגישה ב-Kubernetes'
    ELSE 'Think about permissions and access control in Kubernetes' END
  WHEN explanation ~* 'PVC|PersistentVolume|StorageClass|ReadWriteOnce' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על אחסון ואיך Volumes עובדים ב-Kubernetes'
    ELSE 'Think about storage and how Volumes work in Kubernetes' END
  WHEN explanation ~* 'ConfigMap' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול קונפיגורציה ב-Kubernetes'
    ELSE 'Think about configuration management in Kubernetes' END
  WHEN explanation ~* 'Secret' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול סודות ומידע רגיש ב-Kubernetes'
    ELSE 'Think about managing secrets and sensitive data in Kubernetes' END
  WHEN explanation ~* 'Ingress' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניתוב traffic חיצוני לתוך ה-Cluster'
    ELSE 'Think about routing external traffic into the cluster' END
  WHEN explanation ~* 'HPA|Horizontal Pod Autoscaler|metrics-server' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על scaling אוטומטי ומה נדרש כדי שזה יעבוד'
    ELSE 'Think about automatic scaling and what''s required for it to work' END
  WHEN explanation ~* 'selector|labels|label' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על labels ו-selectors ואיך Kubernetes מחבר בין משאבים'
    ELSE 'Think about labels and selectors and how Kubernetes connects resources' END
  WHEN explanation ~* 'namespace' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על namespaces והפרדה לוגית ב-Kubernetes'
    ELSE 'Think about namespaces and logical separation in Kubernetes' END
  WHEN explanation ~* 'init container' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סדר האתחול ותלויות בין קונטיינרים'
    ELSE 'Think about initialization order and dependencies between containers' END
  WHEN explanation ~* 'CrashLoopBackOff' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מה לבדוק כשקונטיינר קורס שוב ושוב'
    ELSE 'Think about what to check when a container keeps crashing' END
  WHEN explanation ~* 'rolling update|rollout' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על תהליך העדכון ההדרגתי ומה יכול לעכב אותו'
    ELSE 'Think about the rolling update process and what can stall it' END
  WHEN explanation ~* 'taint|toleration' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על taints ו-tolerations ואיך הם משפיעים על scheduling'
    ELSE 'Think about taints and tolerations and how they affect scheduling' END
  WHEN explanation ~* 'affinity|anti-affinity' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על כללי שיבוץ ואיפה Pods יכולים לרוץ'
    ELSE 'Think about scheduling rules and where Pods can run' END
  WHEN explanation ~* 'Service|ClusterIP|NodePort|LoadBalancer' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סוגי Services ואיך הם חושפים גישה'
    ELSE 'Think about Service types and how they expose access' END
  WHEN explanation ~* 'StatefulSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ההבדלים בין StatefulSet ל-Deployment'
    ELSE 'Think about the differences between StatefulSet and Deployment' END
  WHEN explanation ~* 'DaemonSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על DaemonSet ומתי צריך Pod על כל Node'
    ELSE 'Think about DaemonSet and when you need a Pod on every Node' END
  WHEN explanation ~* 'Job|CronJob' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על משימות חד-פעמיות ומתוזמנות ב-Kubernetes'
    ELSE 'Think about one-time and scheduled tasks in Kubernetes' END
  WHEN explanation ~* 'ResourceQuota|LimitRange' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מגבלות משאבים ברמת ה-Namespace'
    ELSE 'Think about resource limits at the Namespace level' END
  WHEN explanation ~* 'etcd' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מאגר הנתונים המרכזי של Kubernetes'
    ELSE 'Think about the central data store of Kubernetes' END
  WHEN explanation ~* 'kubelet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הרכיב שמנהל Pods על כל Node'
    ELSE 'Think about the component that manages Pods on each Node' END
  WHEN explanation ~* 'scheduler' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על תהליך השיבוץ של Pods על Nodes'
    ELSE 'Think about the Pod scheduling process on Nodes' END
  WHEN explanation ~* 'kubectl' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הפקודה הנכונה ב-kubectl לביצוע הפעולה'
    ELSE 'Think about the right kubectl command for the task' END
  -- Generic fallback based on topic
  ELSE
    CASE WHEN lang = 'he' THEN 'קראו שוב את השאלה ונסו לחשוב על ההתנהגות הצפויה של Kubernetes במצב הזה'
    ELSE 'Re-read the question and think about the expected Kubernetes behavior in this scenario' END
END
WHERE hint IS NULL;

-- Daily questions (same logic)
UPDATE daily_questions
SET hint = CASE
  WHEN explanation ~* 'readiness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על probes ועל מה קורה כש-Pod לא מוכן לקבל traffic'
    ELSE 'Think about probes and what happens when a Pod isn''t ready for traffic' END
  WHEN explanation ~* 'liveness probe' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על probes ועל מה גורם ל-Kubernetes להפעיל מחדש קונטיינר'
    ELSE 'Think about probes and what causes Kubernetes to restart a container' END
  WHEN explanation ~* 'OOM|Out Of Memory|memory limit' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול זיכרון ומה קורה כשקונטיינר חורג מהמגבלות'
    ELSE 'Think about memory management and what happens when a container exceeds its limits' END
  WHEN explanation ~* 'NetworkPolicy' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על חוקי רשת וגישה בין Pods'
    ELSE 'Think about network rules and access between Pods' END
  WHEN explanation ~* 'DNS|CoreDNS|kube-dns' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על שירות ה-DNS הפנימי של Kubernetes'
    ELSE 'Think about the internal DNS service in Kubernetes' END
  WHEN explanation ~* 'RBAC|Role|ClusterRole|ServiceAccount' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הרשאות וגישה ב-Kubernetes'
    ELSE 'Think about permissions and access control in Kubernetes' END
  WHEN explanation ~* 'PVC|PersistentVolume|StorageClass|ReadWriteOnce' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על אחסון ואיך Volumes עובדים ב-Kubernetes'
    ELSE 'Think about storage and how Volumes work in Kubernetes' END
  WHEN explanation ~* 'ConfigMap' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול קונפיגורציה ב-Kubernetes'
    ELSE 'Think about configuration management in Kubernetes' END
  WHEN explanation ~* 'Secret' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניהול סודות ומידע רגיש ב-Kubernetes'
    ELSE 'Think about managing secrets and sensitive data in Kubernetes' END
  WHEN explanation ~* 'Ingress' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ניתוב traffic חיצוני לתוך ה-Cluster'
    ELSE 'Think about routing external traffic into the cluster' END
  WHEN explanation ~* 'HPA|Horizontal Pod Autoscaler|metrics-server' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על scaling אוטומטי ומה נדרש כדי שזה יעבוד'
    ELSE 'Think about automatic scaling and what''s required for it to work' END
  WHEN explanation ~* 'selector|labels|label' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על labels ו-selectors ואיך Kubernetes מחבר בין משאבים'
    ELSE 'Think about labels and selectors and how Kubernetes connects resources' END
  WHEN explanation ~* 'namespace' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על namespaces והפרדה לוגית ב-Kubernetes'
    ELSE 'Think about namespaces and logical separation in Kubernetes' END
  WHEN explanation ~* 'init container' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סדר האתחול ותלויות בין קונטיינרים'
    ELSE 'Think about initialization order and dependencies between containers' END
  WHEN explanation ~* 'CrashLoopBackOff' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מה לבדוק כשקונטיינר קורס שוב ושוב'
    ELSE 'Think about what to check when a container keeps crashing' END
  WHEN explanation ~* 'rolling update|rollout' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על תהליך העדכון ההדרגתי ומה יכול לעכב אותו'
    ELSE 'Think about the rolling update process and what can stall it' END
  WHEN explanation ~* 'taint|toleration' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על taints ו-tolerations ואיך הם משפיעים על scheduling'
    ELSE 'Think about taints and tolerations and how they affect scheduling' END
  WHEN explanation ~* 'affinity|anti-affinity' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על כללי שיבוץ ואיפה Pods יכולים לרוץ'
    ELSE 'Think about scheduling rules and where Pods can run' END
  WHEN explanation ~* 'Service|ClusterIP|NodePort|LoadBalancer' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על סוגי Services ואיך הם חושפים גישה'
    ELSE 'Think about Service types and how they expose access' END
  WHEN explanation ~* 'StatefulSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על ההבדלים בין StatefulSet ל-Deployment'
    ELSE 'Think about the differences between StatefulSet and Deployment' END
  WHEN explanation ~* 'DaemonSet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על DaemonSet ומתי צריך Pod על כל Node'
    ELSE 'Think about DaemonSet and when you need a Pod on every Node' END
  WHEN explanation ~* 'Job|CronJob' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על משימות חד-פעמיות ומתוזמנות ב-Kubernetes'
    ELSE 'Think about one-time and scheduled tasks in Kubernetes' END
  WHEN explanation ~* 'ResourceQuota|LimitRange' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מגבלות משאבים ברמת ה-Namespace'
    ELSE 'Think about resource limits at the Namespace level' END
  WHEN explanation ~* 'etcd' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על מאגר הנתונים המרכזי של Kubernetes'
    ELSE 'Think about the central data store of Kubernetes' END
  WHEN explanation ~* 'kubelet' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הרכיב שמנהל Pods על כל Node'
    ELSE 'Think about the component that manages Pods on each Node' END
  WHEN explanation ~* 'scheduler' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על תהליך השיבוץ של Pods על Nodes'
    ELSE 'Think about the Pod scheduling process on Nodes' END
  WHEN explanation ~* 'kubectl' THEN
    CASE WHEN lang = 'he' THEN 'חשבו על הפקודה הנכונה ב-kubectl לביצוע הפעולה'
    ELSE 'Think about the right kubectl command for the task' END
  ELSE
    CASE WHEN lang = 'he' THEN 'קראו שוב את השאלה ונסו לחשוב על ההתנהגות הצפויה של Kubernetes במצב הזה'
    ELSE 'Re-read the question and think about the expected Kubernetes behavior in this scenario' END
END
WHERE hint IS NULL;
