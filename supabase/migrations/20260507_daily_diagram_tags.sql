-- ── Add diagram tags to daily_questions ──────────────────────────────────────
-- Maps daily challenge questions to diagram components via tags.
-- Pattern-matched by question text to avoid ID dependency.

-- ── HE ──

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod בשם api-server מציג סטטוס CrashLoopBackOff. %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'תהליך Rolling update של Deployment נתקע. Pod חדש נ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod קרס עם OOMKilled. מה המשמעות ומה הצעד הבא?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-HPA מוגדר ל-Deployment, אך לא מבצע scale למרות ע%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Init Container נכשל בכל ניסיון עם exit code 1. ה%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Deployment מנסה להריץ 5 replicas אך רק 3 עולים. %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מציג READY 0/1 אך STATUS Running. האפליקציה %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-StatefulSet database-0 קרס ולא עולה מחדש. `kubec%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-discovery"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl get endpoints my-svc` מציג ''<none>%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא מצליח לפנות לשירות אחר ב-Cluster. curl ht%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Ingress מוגדר, DNS מצביע נכון, אך כל הבקשות מחזי%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'כלל ה-NetworkPolicy הוחלה על namespace. עכשיו Pod %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Service מסוג LoadBalancer נשאר בסטטוס Pending (E%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא יכול לגשת לאינטרנט. curl google.com נכשל,%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Service ClusterIP נגיש מתוך ה-Pods, אך NodePort %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא מצליח לפנות ל-Secrets שיצרת. `kubectl des%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-ServiceAccount של Pod מנסה לבצע `kubectl get pod%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-ConfigMap עודכן עם ערכים חדשים, אך האפליקציה ב-P%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["imagepull-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מנסה לפנות ל-private Docker registry ומקבל ''%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'כאשר Pod מנסה לרוץ כ-root (uid 0), ההרצה נדחית.

מ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Secret מוגדר ב-Pod כ-env var: value = ''dXNlcjpwY%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-PVC בסטטוס Pending. `kubectl describe pvc` מציג %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שני Pods מנסים לחבר אותו PVC. ה-Pod השני נשאר Pend%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["helm-chart"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'פקודת Helm upgrade נכשל עם ''cannot patch because a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-PV נמחק בזמן ש-PVC עדיין קיים. PVC עכשיו בסטטוס %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'Pod מנסה לכתוב ל-mounted volume ומקבל:

Read-only %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Node עבר לסטטוס NotReady פתאום. מה הצעד הראשון ל%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod תקוע בסטטוס Terminating כבר 30 דקות. `kubect%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl exec` לא עובד על Pod. מקבל ''error:%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Cluster Autoscaler לא מוסיף Nodes למרות Pods ב-P%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Node מציג DiskPressure. Pods מתחילים להיות evict%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl top nodes` נכשלת: ''error: Metrics %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl drain node1` נחסם: ''cannot delete %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'בדיקת Liveness probe מוגדר על path /healthz ומכשיל%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'אחרי `kubectl rollout undo`, ה-Deployment חזר לגרס%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod חדש לא יכול להיות scheduled על אף Node. `kub%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-ha"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-etcd Pod ב-kube-system מציג בעיות. כמה etcd memb%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Namespace נמחק אבל תקוע בסטטוס Terminating. `kub%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod רץ על Node1. `kubectl drain node1` בוצע. אחר%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'מערכת RBAC מוגדרת עם ClusterRole אבל ב-namespace ס%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod ב-namespace prod מנסה לקבל ConfigMap מ-names%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שדה readinessGate מוגדר על Pod. Pod מציג READY 0/1%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'נתת `kubectl apply` על PodDisruptionBudget. drain %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ב-debug של אפליקציה, מריצים `kubectl exec pod -- e%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod A מנסה לגשת ל-Pod B ב-port 8080. מקבל connec%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["imagepull-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Deployment עם 3 replicas. כל ה-Pods מציגים Image%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["topology-spread"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'Cluster Kubernetes גדול. נרצה לוודא ש-Pods ייפרסו %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod ב-CrashLoop. הלוגים מציגים permission denied%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Namespace מוגדר עם ResourceQuota: requests.cpu=2%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-LimitRange מוגדר ב-namespace עם default cpu limi%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["daemonset-topology"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-DaemonSet מוגדר אך לא רץ על Node חדש שנוסף. מה ה%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'רוצים ש-Pods של service A לא ירוצו על אותו Node כמ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-HPA מוגדר min=2 max=10 targetCPU=50%. יש 2 Pods %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl rollout pause deployment/my-app:` %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod יצא עם exit code 137. מה המשמעות?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Multi-container Pod עם sidecar. שני ה-containers%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מוגדר עם hostPath volume ל-/var/run/docker.s%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'אחסון emptyDir עם medium: Memory מוגדר. מה שונה מ-%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'מנגנון PodSecurityAdmission ב-namespace עם enforce%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מוגדר עם terminationGracePeriodSeconds: 0. מ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Deployment עם strategy: Recreate. מה קורה ב-upgr%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl apply -f secret.yaml.` ה-Secret נו%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod צריך לדעת את שמו ואת ה-namespace שלו בזמן רי%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'אפליקציה בתוך Pod צריכה לאמת מול ה-Kubernetes API %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["kubelet-role"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl get pods` מחזיר ''The connection to%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["helm-chart"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'פקודת Helm install נכשל: ''release already exists''.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Service ExternalName מוגדר. מה הוא עושה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ברשימת initContainers: initContainer-2 ממתין ל-ini%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'כלל ה-NetworkPolicy: podSelector: {} (ריק). מה זה %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["external-secrets"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod צריך גישה ל-AWS S3 ללא credentials ב-Kuberne%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod ב-namespace prod מנסה לגשת ל-Service ב-names%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'מה ההבדל בין `kubectl cordon` לבין `kubectl drain`%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-VPA (Vertical Pod Autoscaler) במצב Auto. מה הוא %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["cronjob-hierarchy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-CronJob מוגדר עם concurrencyPolicy: Forbid. ה-Jo%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod צריך לרוץ על Node ספציפי לפי hostname. מה הד%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ביצעת `kubectl apply` על Deployment עם image חדש, %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod נמחק אך נשאר ב-Terminating. `kubectl get pod%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Init container נכשל שוב ושוב. מה הסטטוס של ה-Pod%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-StatefulSet עם 3 replicas. Pod-1 קרס. מה Kuberne%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-DaemonSet עודכן עם image חדש. updateStrategy מוג%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מסולק (Evicted). מה הסיבה הנפוצה ביותר?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Deployment עם maxUnavailable=0, maxSurge=1. מה ק%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod עם priorityClassName גבוה. לא נמצא מקום ב-cl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Namespace ללא ResourceQuota. משתמש יוצר Deployme%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-LimitRange מגדיר default memory request=256Mi. P%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod בסטטוס Unknown. מה הסיבה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-HPA הגדיל Deployment ל-8 replicas בשיא העומס. הע%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["clusterip-service"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מנסה לגשת ל-Service ב-ClusterIP ומקבל Connec%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Ingress מחזיר 404 לכל ה-paths. Pods עולים ו-Serv%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא מצליח לפתור DNS של שירות חיצוני. CoreDNS %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שירות NodePort Service חשוף על port 32000. איך ניג%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא מגיע ל-internet. DNS פנימי ו-ClusterIP עו%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Ingress עם TLS. דפדפן מציג שגיאת certificate. Se%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-discovery"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ל-Service יש endpoints, אבל לקוחות מקבלים timeouts%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שירות Headless Service (clusterIP: None). מה DNS l%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מגיע ל-Pod אחר דרך DNS אבל מקבל תוצאות ישנות%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'תוסף CNI plugin לא פועל על Node חדש. מה הסטטוס של %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שני Pods צריכים לתקשר ביניהם. מה הכתובת הנכונה בתו%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl get pods` מחזיר ''Error from server%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שדה imagePullSecret חסר ל-Pod שמשך image מ-private%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'מה ההבדל בין Role ל-ClusterRole ב-RBAC?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Secret מוגדר עם value ב-base64. מה ה-bug הנפוץ ב%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה kubectl פועל עם kubeconfig שה-certificate פ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-ServiceAccount של Pod מנסה לקרוא ConfigMaps אבל %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מוגדר עם securityContext.readOnlyRootFilesys%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'מערכת Kubernetes Secrets: מה האמת לגבי אבטחה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-PV עם Reclaim Policy=Retain. PVC נמחקת. מה קורה %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-StorageClass לא קיימת. PVC מפנה אליה. מה הסטטוס?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod מנסה לכתוב ל-volume ומקבל Permission denied.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-PVC עם accessMode=ReadWriteOnce. שני Pods מנסים %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dynamic-provisioning"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'כיצד מגדילים PVC קיימת?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'אחסון emptyDir מול hostPath: מה ההבדל העיקרי?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-StatefulSet עם volumeClaimTemplate. Pod-0 נמחק ו%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'תהליך Dynamic provisioning לא עובד. `kubectl descr%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dynamic-provisioning"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'תהליך Volume Snapshot דורש מה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-PV נוצר עם capacity=10Gi. PVC מבקשת 5Gi. יש bind%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Node מציג NotReady. `kubectl describe node` מציג%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod restartCount=47. מה זה מסמל?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שרת etcd ב-high disk I/O. cluster איטי. מה ההשפעה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-data"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'הפקודה `kubectl get pods:` ''the server is currentl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שכבת ה-Container runtime (containerd) לא מגיב על N%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שירות ה-kubelet certificate פג. מה קורה?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-CoreDNS Pods קרסו. מה הסימפטום?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-restore"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'שדרוג ה-Cluster נכשל ויש צורך לחזור לגרסה הקודמת. %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'אחרי הוספת Node חדש ל-Cluster, `kubectl get nodes`%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod לא רואה env vars מ-Secret שנוצר אחרי ה-Pod. %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'כיצד בודקים שכל רכיבי ה-control plane בריאים?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod יצא עם exit code 1. מה המשמעות?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod צריך לגשת ל-Kubernetes API מתוך ה-cluster. מ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-Pod בסיווג QoS BestEffort. מה קורה בזמן memory p%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ל-Pod יש CPU limit של 200m אבל האפליקציה צורכת 500%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ה-ConfigMap מחובר כ-volume ל-Pod. הערך עודכן. מתי %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'he'
  AND q LIKE 'ל-Pod יש preStop hook שנמשך 15 שניות. terminationG%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

-- ── EN ──

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod named api-server is in CrashLoopBackOff. Wha%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A rolling update is stuck - a new pod is created b%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod crashed with OOMKilled. What does this mean %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An HPA is configured for a Deployment but doesn''t %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An init container fails every attempt with exit co%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Deployment tries to run 5 replicas but only 3 st%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod shows READY 0/1 but STATUS Running. The appl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A StatefulSet database-0 crashed and won''t restart%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-discovery"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl get endpoints my-svc` shows ''<none>''. The%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod can''t reach another service inside the clust%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An Ingress is configured and DNS resolves correctl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A NetworkPolicy was applied to a namespace. Now Po%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A LoadBalancer Service stays in Pending (EXTERNAL-%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Pod A can''t reach the internet.

```shell
$ curl g%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ClusterIP Service is reachable from inside pods,%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod fails to access a Secret you created. `kubec%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ServiceAccount tries to run `kubectl get pods an%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ConfigMap was updated with new values, but the a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["imagepull-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod tries to pull from a private Docker registry%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod tries to run as root (uid 0) but is rejected%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Secret is mounted as an env var: value = ''dXNlcj%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PVC is Pending. `kubectl describe pvc` shows ''st%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Two pods try to mount the same PVC. The second pod%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["helm-chart"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A `helm upgrade` fails with ''cannot patch because %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PV was deleted while a PVC still existed. The PV%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Pod tries to write to a mounted volume and gets:%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A node suddenly changes to NotReady. What is the f%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has been stuck in Terminating for 30 minutes%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl exec` fails: ''error: unable to upgrade co%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'The cluster autoscaler is not adding nodes despite%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A node is showing DiskPressure. Pods start getting%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl top nodes` fails: ''error: Metrics API not%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl drain node1` is blocked: ''cannot delete P%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A liveness probe on path /healthz is failing every%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'After `kubectl rollout undo`, the Deployment rever%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A new pod can''t be scheduled on any node. `kubectl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-ha"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An etcd pod in kube-system is showing issues. How %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A namespace is stuck in Terminating for over an ho%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod is running on node1. `kubectl drain node1` i%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'RBAC is configured with a ClusterRole but you only%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod in namespace prod tries to access a ConfigMa%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A readinessGate is defined on a pod. The pod shows%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'You apply a PodDisruptionBudget. `kubectl drain` f%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'While debugging, you run `kubectl exec pod -- env`%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Pod A tries to reach Pod B on port 8080 and gets c%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["imagepull-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Deployment with 3 replicas has all pods in Image%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["topology-spread"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'You want pods to be spread across availability zon%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod is in CrashLoop. Logs show ''permission denie%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A namespace has a ResourceQuota of requests.cpu=2.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A LimitRange in a namespace sets a default cpu lim%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["daemonset-topology"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A DaemonSet is defined but not running on a newly %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'You want pods of service A to never run on the sam%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An HPA is set min=2 max=10 targetCPU=50%. 2 pods a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl rollout pause deployment/my-app` - what d%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod exited with code 137. What does this mean?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A multi-container pod needs both containers to sha%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod mounts a hostPath volume at /var/run/docker.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An emptyDir volume is configured with medium: Memo%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'PodSecurityAdmission is set to enforce=restricted %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has terminationGracePeriodSeconds: 0. What h%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Deployment uses strategy: Recreate. What happens%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl apply` is run twice on the same Secret YA%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An app inside a pod needs to authenticate to the K%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["kubelet-role"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl get pods` returns ''The connection to the %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["helm-chart"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`helm install` fails: ''release already exists''. Wh%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ConfigMap is used as env vars. The ConfigMap is %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A rolling update runs two versions simultaneously.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Service of type ExternalName is defined. What do%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'init containers are listed in sequence. initContai%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A NetworkPolicy has podSelector: {} (empty). What %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["external-secrets"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod needs access to AWS S3 without storing crede%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod in namespace prod needs to reach a service i%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'What is the difference between `kubectl cordon` an%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A VPA is in Auto mode. What does it do?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["cronjob-hierarchy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A CronJob has concurrencyPolicy: Forbid. The previ%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'You want a pod to run on a specific node by hostna%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["clusterip-service"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod needs to access the Kubernetes API from insi%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'After a `kubectl apply`, the Deployment doesn''t up%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod QoS class is BestEffort. What happens during%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["oom-killed"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has a CPU limit of 200m but the app needs 50%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["config-mount"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ConfigMap is mounted as a volume. Its value is u%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl rollout status deployment/my-app` is stuc%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["namespace-isolation"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod is deleted but remains in Terminating. `kube%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An init container is failing repeatedly. What pod %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A StatefulSet has 3 replicas. Pod-1 crashes. What %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A DaemonSet was updated with a new image. updateSt%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod is Evicted from a node. What is the most com%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Deployment has maxUnavailable=0, maxSurge=1. Wha%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["qos-eviction"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has a high priorityClassName. No resources a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A namespace has no ResourceQuota. A user creates a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["limitrange-vs-quota"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A LimitRange sets default memory request=256Mi. A %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["hpa-scaling"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'HPA scaled a Deployment to 8 replicas during peak %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-discovery"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod tries to reach a ClusterIP Service and gets %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An Ingress returns 404 for all paths. Pods are up %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A NetworkPolicy exists. Pod A can''t reach Pod B in%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod can''t resolve external DNS (example.com). Co%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["service-types"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'How do you reach a NodePort Service (port 32000) f%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod can''t reach the internet. Internal DNS and C%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["ingress-routing"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An Ingress has TLS configured. The browser shows a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Service has endpoints, but clients get intermitt%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Headless Service (clusterIP: None) - what does a%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Two pods need to communicate. Which address is mos%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl get pods` returns ''Error from server (For%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'An imagePullSecret is missing. The pod pulls from %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["network-policy-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A default-deny-all NetworkPolicy is applied to a n%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'What is the difference between Role and ClusterRol%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Secret value is base64-encoded. What is a common%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rbac-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A ServiceAccount''s pod tries to read ConfigMaps bu%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["psa-admission"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has securityContext.readOnlyRootFilesystem=t%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["configmap-vs-secret"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Are Kubernetes Secrets encrypted at rest by defaul%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PVC is Pending. The StorageClass exists. What do%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PV has Reclaim Policy=Retain. The PVC is deleted%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A StorageClass doesn''t exist. A PVC references it.%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod gets Permission denied writing to a volume. %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PVC has accessMode=ReadWriteOnce. Two pods try t%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dynamic-provisioning"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'How do you resize an existing PVC?%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A StatefulSet pod-0 is deleted and recreated. What%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'Dynamic provisioning is not working. `kubectl desc%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["storage-binding"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A PV has capacity=10Gi. A PVC requests 5Gi. Will t%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A node shows NotReady. `kubectl describe node` sho%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["crashloop-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has restartCount=47. What does this indicate%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'etcd has high disk I/O. The cluster is slow. What %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-data"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl get pods` returns ''the server is currentl%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'The container runtime (containerd) is unresponsive%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["dns-flow"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'CoreDNS pods have crashed. What is the symptom in %'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["etcd-restore"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A cluster upgrade fails midway. What is the safest%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["taints-tolerations"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'After adding a new node to the cluster, `kubectl g%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE '`kubectl apply` returns ''field is immutable''. What%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'How do you verify all control plane components are%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["rolling-update"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A Deployment rollout is paused (`kubectl rollout p%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["restart-policy"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod has a preStop hook that takes 15 seconds. te%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["statefulset-storage"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'You want to run a one-off task in Kubernetes. Whic%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["probe-comparison"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod''s liveness probe keeps failing. What does Ku%'
  AND (tags IS NULL OR tags = '[]'::jsonb);

UPDATE daily_questions SET tags = '["controlplane-components"]'::jsonb
WHERE lang = 'en'
  AND q LIKE 'A pod stays Pending. `kubectl get events` shows ''n%'
  AND (tags IS NULL OR tags = '[]'::jsonb);
