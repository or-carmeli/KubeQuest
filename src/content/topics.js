export const ACHIEVEMENTS = [
  {
    id: "first",
    icon: "⚡",
    name: "ראשית הדרך",
    nameEn: "First Steps",
    condition: (s) => s.total_answered >= 1,
  },
  {
    id: "streak3",
    icon: "🔥",
    name: "שלושה ברצף",
    nameEn: "Three in a Row",
    condition: (s) => s.max_streak >= 3,
  },
  {
    id: "score100",
    icon: "💯",
    name: "100 נקודות",
    nameEn: "100 Points",
    condition: (s) => s.total_score >= 100,
  },
  {
    id: "allEasy",
    icon: "⭐",
    name: "כל הנושאים קל",
    nameEn: "All Topics Easy",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_easy")).length >= 6,
  },
  {
    id: "master",
    icon: "🏆",
    name: "מאסטר K8s",
    nameEn: "K8s Master",
    condition: (s, c) => Object.keys(c).filter((k) => k.endsWith("_hard")).length >= 6,
  },
];

export const TOPICS = [
  {
    id: "workloads",
    icon: "⚙️",
    name: "Workloads & Scheduling",
    color: "#00D4FF",
    description: "Pods · Deployments · StatefulSets · Scheduling · Resources",
    descriptionEn: "Pods · Deployments · StatefulSets · Scheduling · Resources",
    levels: {
      easy: {
        theory: "Pods ו-Deployments הם ליבת Kubernetes.\n🔹 Pod:\u200E יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Pods זמניים: Pod מנוהל (Deployment/ReplicaSet) שמת, נוצר חדש עם IP חדש. Pod עצמאי שמת. נשאר מת\n🔹 Deployment מנהל קבוצת Pods זהים ומבטיח שהמספר הרצוי תמיד רץ\n🔹 replicas:\u200E עותקים זהים של ה-Pod שרצים במקביל\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app",
        theoryEn: "Pods and Deployments\n🔹 Pod - the smallest runnable unit in Kubernetes, containing one or more containers.\n🔹 Ephemeral Pods - a managed Pod (Deployment/ReplicaSet) is automatically replaced when it dies. A standalone Pod is not.\n🔹 Deployment - manages a set of identical Pods and ensures the desired replica count is always running.\n🔹 Replicas - identical copies of a Pod running in parallel for availability and scaling.\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app",
        questions: [
            {
              q: "מה הוא Pod ב-Kubernetes?",
              options: [
              "אובייקט שמנהל גישה לרשת בין Nodes",
              "קונטרולר שאחראי על rolling updates של Deployments",
              "ממשק שמנהל volumes ו-PersistentClaims בין Pods",
              "יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר",
],
              answer: 3,
              explanation:
                "Pod הוא יחידת הריצה הבסיסית ב-Kubernetes.\nכל הקונטיינרים ב-Pod חולקים IP, network namespace ו-volumes.\nKubernetes מנהל Pods, לא קונטיינרים בנפרד.",
            },
            {
              q: "מה Deployment עושה?",
              options: [
              "מנהל IP addresses ומאפשר גישה חיצונית לאפליקציות מחוץ ל-Cluster",
              "מנהל הרשאות גישה ל-Secrets ו-ConfigMaps בין Namespaces",
              "מנהל קבוצת Pods זהים ושומר על מספרם",
              "מנהל אחסון מתמיד עבור StatefulSets ו-Databases",
],
              answer: 2,
              explanation:
                "Deployment מנהל Pods זהים דרך ReplicaSet ושומר על מספר ה-replicas הרצוי.\nמספק rolling updates, rollback, והחלפה אוטומטית של Pods שקרסו.\nאם Pod נמחק, ה-Deployment יוצר אחד חדש מיד.",
            },
            {
              q: "מה liveness probe עושה?",
              options: [
              "בודק שקבצי הקונפיגורציה נטענו בהצלחה בהפעלת ה-Pod",
              "בודק שהקונטיינר חי. אם נכשל, Kubernetes מפעיל אותו מחדש",
              "בודק שה-Pod מחובר ל-Service המתאים ומקבל traffic",
              "בודק שגישה ל-API server עדיין תקינה מתוך הקונטיינר",
],
              answer: 1,
              explanation:
                "Liveness probe הוא בדיקת בריאות תקופתית על הקונטיינר.\nכשלון חוזר גורם ל-Kubernetes להניח שהקונטיינר תקוע ולהפעיל אותו מחדש.\nסוגי בדיקות: HTTP GET, TCP socket, או פקודת shell (exit code 0).",
            },
            {
              q: "מה readiness probe עושה?",
              options: [
              "מאתחל מחדש את ה-Pod לאחר שינוי ב-ConfigMap",
              "מוחק Pods ישנים כשגרסה חדשה עוברת rolling update",
              "בודק שה-Pod מוכן לקבל traffic",
              "מגדיר את כמות הזיכרון המינימלית שהקונטיינר צריך להפעלה",
],
              answer: 2,
              explanation:
                "Readiness probe בודק שהקונטיינר מוכן לקבל בקשות.\nPod שנכשל ב-readiness מוסר מ-Service endpoints ולא מקבל traffic.\nבשונה מ-liveness (ממית את הקונטיינר), readiness רק מפסיק לנתב traffic.",
            },
            {
              q: "מה ברירת המחדל של restartPolicy ב-Pod?",
              options: [
              "OnFailure: Kubernetes מפעיל מחדש רק אם exit code שגוי",
              "Never: Kubernetes לא מפעיל מחדש קונטיינר שנפסק",
              "Always: Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק",
              "OnSuccess: Kubernetes מפעיל מחדש רק כשהקונטיינר יוצא תקין עם exit code 0",
],
              answer: 2,
              explanation:
                "restartPolicy קובע מתי Kubernetes מפעיל מחדש קונטיינר שנפסק.\nAlways (ברירת מחדל):\u200E תמיד. OnFailure:\u200E רק בקריסה. Never:\u200E לעולם לא.\nOnSuccess לא קיים ב-Kubernetes.",
            },
            {
              q: "מה ההבדל בין Job ל-CronJob?",
              options: [
              "Job רץ פעם אחת עד להשלמה, CronJob מתזמן Jobs לפי לוח זמנים",
              "Job מריץ משימות במקביל על כל Node, CronJob מריץ משימות רק על Node אחד",
              "Job ו-CronJob שניהם יוצרים Pods שרצים לצמיתות, אבל CronJob תומך גם ב-scheduling",
              "Job מתזמן Pods לפי cron schedule, CronJob מריץ משימה חד-פעמית עד להשלמה",
],
              answer: 0,
              explanation:
                "Job מריץ משימה חד-פעמית עד הצלחה; CronJob מתזמן Jobs לפי cron schedule.\nJob = run-to-completion. CronJob = תזמון חוזר (גיבוי, ניקוי, דוחות).\nOption 3 מהפך את התפקידים. Option 2 שגוי כי שניהם run-to-completion ולא רצים לצמיתות. Option 1 שגוי כי Job לא רץ על כל Node.\nבכישלון, Job יוצר Pod חדש ומנסה שוב (עד backoffLimit).",
            },
            {
              q: "מה resource requests ב-Pod?",
              options: [
              "כמות ה-CPU וה-Memory שה-Pod מבקש כדי שה-Scheduler יוכל לבחור Node מתאים",
              "רשימת הפורטים שה-Pod חושף לתעבורת רשת",
              "מגבלת קצב הרשת שה-Pod מקבל מה-CNI plugin",
              "גודל ה-container image שמוריד מה-registry לפני הפעלה",
],
              answer: 0,
              explanation:
                "requests מגדיר כמה CPU/Memory ה-Pod מבקש.\nה-Scheduler משתמש בערכים אלה כדי למצוא Node עם מספיק משאבים.\nrequests הוא רמז לתזמון. הקונטיינר יכול לצרוך יותר, עד limits.",
            },
            {
              q: "מה מטרת Namespace ב-Kubernetes?",
              options: [
              "שכבת רשת וירטואלית שמבדילה בין Pods ב-Nodes שונים",
              "מנגנון לאחסון logs ומטריקות של Pods לטווח ארוך",
              "סוג מיוחד של Service שמאפשר גישה בין Clusters",
              "בידוד לוגי של משאבים לסביבות, צוותים, ופרויקטים",
],
              answer: 3,
              explanation:
                "Namespace מספק הפרדה לוגית של משאבים בתוך Cluster.\nשימושי להפרדת סביבות (dev/staging/prod), צוותים, או לקוחות.\nניתן להגביל צריכת משאבים לכל Namespace עם ResourceQuota ו-LimitRange.",
            },
        ],
        questionsEn: [
            {
              q: "What is a Pod in Kubernetes?",
              options: [
              "An object that manages network routing between Nodes in the cluster",
              "The smallest unit of execution, containing one or more containers",
              "A controller responsible for managing rolling updates of Deployments",
              "An interface that manages volumes and PersistentClaims between Pods",
],
              answer: 1,
              explanation:
                "A Pod is Kubernetes' smallest deployable unit: one or more containers running together.\nAll containers in a Pod share the same IP, network namespace, and volumes.\nKubernetes manages Pods, not individual containers.",
            },
            {
              q: "What does a Deployment do?",
              options: [
              "Manages persistent storage volumes for StatefulSets and databases",
              "Manages access permissions to Secrets and ConfigMaps across Namespaces",
              "Manages IP addresses and enables external access to applications outside the cluster",
              "Manages a group of identical Pods and maintains their count",
],
              answer: 3,
              explanation:
                "A Deployment manages identical Pods via ReplicaSet and keeps the desired replica count running.\nProvides rolling updates, rollback, and automatic Pod replacement on failure.\nStandard way to run stateless apps in Kubernetes.",
            },
            {
              q: "What does a liveness probe do?",
              options: [
              "Verifies that API server connectivity is still valid from within the container",
              "Checks the container is alive. If it fails, Kubernetes restarts it",
              "Checks that configuration files loaded successfully at Pod startup",
              "Checks that the Pod is connected to the correct Service and receiving traffic",
],
              answer: 1,
              explanation:
                "A liveness probe is a periodic health check Kubernetes runs on each container.\nRepeated failures → Kubernetes kills and restarts the stuck container.\nProbe types: HTTP GET, TCP socket, or shell command (exit code 0).",
            },
            {
              q: "What does a readiness probe do?",
              options: [
              "Reinitialises the Pod after a ConfigMap change",
              "Sets the minimum memory the container needs before it can start",
              "Checks the Pod is ready to receive traffic",
              "Removes old Pods when a new version rolls out",
],
              answer: 2,
              explanation:
                "Readiness probe checks if the container is ready to serve requests.\nFailing Pods are removed from Service endpoints. No traffic routed to them.\nUnlike liveness (kills container), readiness only pauses traffic routing.",
            },
            {
              q: "What is the default restartPolicy for a Pod?",
              options: [
              "Never: Kubernetes never restarts a stopped container",
              "OnSuccess: Kubernetes restarts the container only when it exits cleanly with code 0",
              "Always: Kubernetes always restarts a stopped container",
              "OnFailure: Kubernetes restarts only if the exit code is non-zero",
],
              answer: 2,
              explanation:
                "restartPolicy controls when Kubernetes restarts a stopped container.\nAlways (default): always restarts. OnFailure: only on crash. Never: never.\nMost long-running apps use the default Always.",
            },
            {
              q: "What is the difference between a Job and a CronJob?",
              options: [
              "A Job schedules tasks on a cron schedule; a CronJob runs a single task to completion",
              "A Job runs once until completion; a CronJob schedules Jobs on a recurring basis",
              "Both create long-running Pods, but a CronJob adds scheduling support on top",
              "A Job runs tasks in parallel across all Nodes; a CronJob runs tasks on a single Node",
],
              answer: 1,
              explanation:
                "Job runs a task once to completion; CronJob schedules Jobs on a recurring cron schedule.\nJob = run-to-completion. CronJob = recurring (backups, cleanup, reports).\nOption 0 reverses the roles. Option 2 is wrong because neither creates long-running Pods. Option 3 is wrong because Jobs do not run on every Node.\nOn failure, Job retries by creating new Pods (up to backoffLimit).",
            },
            {
              q: "What are resource requests in a Pod?",
              options: [
              "The amount of CPU and Memory the Pod asks for so the Scheduler can find a suitable Node",
              "The list of ports the Pod exposes for network traffic",
              "Network rate limit assigned to the Pod by the CNI plugin",
              "Size of the container image downloaded from the registry before startup",
],
              answer: 0,
              explanation:
                "requests defines how much CPU and Memory the Pod asks for.\nThe Scheduler uses these values to find a Node with enough resources.\nrequests is a scheduling hint. Containers can burst above it, up to limits.",
            },
            {
              q: "What is the purpose of a Namespace in Kubernetes?",
              options: [
              "A special Service type that enables cross-cluster communication",
              "A virtual network layer separating Pods across different Nodes",
              "A mechanism for storing long-term logs and metrics from workloads",
              "Logical isolation of resources for environments, teams, and projects",
],
              answer: 3,
              explanation:
                "Namespaces provide logical isolation of resources within a cluster.\nCommonly used for separating environments (dev/staging/prod), teams, or tenants.\nEnforce resource limits per Namespace with ResourceQuota and LimitRange.",
            },
        ],
      },
      medium: {
        theory: "Rolling Updates, Rollback, ו-StatefulSets.\n🔹 Rolling Update מעדכן Pod אחד בכל פעם. Zero downtime\n🔹 kubectl rollout undo:\u200E חוזר לגרסה קודמת\n🔹 StatefulSet כמו Deployment אבל Pods מקבלים שמות קבועים ו-storage משלהם\n🔹 מתאים ל: databases, Kafka, ZooKeeper\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2",
        theoryEn: "Rolling Updates, Rollback, and StatefulSets\n🔹 Rolling Update - updates one Pod at a time with zero downtime.\n🔹 Rollback - kubectl rollout undo reverts a Deployment to its previous version.\n🔹 StatefulSet - like a Deployment, but each Pod gets a stable name and its own persistent storage.\n🔹 Use cases - ideal for stateful workloads such as databases, Kafka, and ZooKeeper.\nCODE:\nkubectl set image deployment/my-app web=my-app:v2\nkubectl rollout undo deployment/my-app\n# StatefulSet: pod-0, pod-1, pod-2",
        questions: [
            {
              q: "מה היתרון של Rolling Update?",
              options: [
              "מאפשר לחזור לגרסה קודמת ללא שמירת revisions",
              "מגביל את מספר ה-Pods המחוברים ל-Service בזמן עדכון",
              "מעדכן את כל ה-Pods בבת אחת לחיסכון בזמן הפריסה",
              "מחליף Pods בהדרגה כך שתמיד יש Pods זמינים, ללא downtime",
],
              answer: 3,
              explanation:
                "Rolling Update מחליף Pods בהדרגה: חדש עולה, רק אז ישן יורד.\nתמיד יש Pods זמינים, כך שאין downtime.\nבשונה מ-Recreate שמוחק הכל ויוצר downtime.",
            },
            {
              q: "כיצד מבצעים rollback?",
              options: [
              "kubectl scale deployment my-app --replicas=0 ואז להגדיל מחדש",
              "kubectl rollout undo deployment/my-app",
              "kubectl delete deployment my-app ואז kubectl apply מחדש עם YAML קודם",
              "kubectl patch deployment my-app --type=json -p '[{\"op\":\"replace\"}]'",
],
              answer: 1,
              explanation:
                "הפקודה:\nkubectl rollout undo deployment/my-app\n\nמחזירה את ה-Deployment ל-revision הקודם.\nK8s שומר היסטוריה של כל ReplicaSet, כך שהוא יודע לאיזו גרסה לחזור.\n\nלחזרה ל-revision ספציפי:\nkubectl rollout undo deployment/my-app --to-revision=3",
            },
            {
              q: "מה ההבדל בין StatefulSet ל-Deployment?",
              options: [
              "StatefulSet מתזמן Pods מהר יותר כי הוא שומר cache של ה-node selection",
              "Pods ב-StatefulSet מקבלים שמות קבועים ואחסון קבוע",
              "StatefulSet לא תומך ב-rolling updates ומצריך manual restart",
              "StatefulSet תומך רק ב-cloud providers ולא ב-on-premise clusters",
],
              answer: 1,
              explanation:
                "ב-StatefulSet לכל Pod שם קבוע (pod-0, pod-1) ו-PVC ייחודי משלו.\nPods עולים בסדר ולכל אחד זהות קבועה גם אחרי restart.\nבשונה מ-Deployment שבו Pods זהים ולא מובחנים.",
            },
            {
              q: "מה PodDisruptionBudget עושה?",
              options: [
              "מגדיר מינימום Pods זמינים בזמן disruptions מתוכננות",
              "מגביל את כמות ה-CPU ש-Deployment יכול לצרוך בזמן rolling update",
              "מגביל תנועת רשת נכנסת ל-Pods בזמן maintenance",
              "מנהל את ה-scaling האוטומטי לפי מדדי CPU ו-Memory",
],
              answer: 0,
              explanation:
                "PodDisruptionBudget (PDB) מגדיר את מספר ה-Pods המינימלי שחייב להישאר זמין בזמן disruptions מתוכננות, כמו `kubectl drain`.\nדוגמה: עם replicas: 3 ו-minAvailable: 2, Kubernetes יאשר פינוי רק אם לפחות 2 Pods נשארים זמינים.\nמגן על זמינות אפליקציות קריטיות בזמן maintenance.",
            },
            {
              q: "מה מגדירים resource limits ב-Kubernetes?",
              options: [
              "כמות משאבים מקסימלית שקונטיינר רשאי להשתמש בהם בזמן ריצה",
              "כמות משאבים מינימלית שה-Scheduler מבטיח לפני תזמון Pod",
              "מגבלת ports נכנסים שה-Service מאפשר ל-Pod",
              "גודל container image מקסימלי שמותר לשמור ב-Node",
],
              answer: 0,
              explanation:
                "limits מגדיר את כמות המשאבים המקסימלית שקונטיינר יכול להשתמש בהם.\nחריגת memory גורמת להריגת הקונטיינר (OOMKill, exit code 137).\nחריגת CPU גורמת ל-throttling בלבד, ללא הריגה.\nההבדל בין requests ל-limits:\n• requests = משאבים מינימליים שה-Scheduler משתמש בהם כדי לתזמן Pod ל-Node.\n• limits = תקרת השימוש במשאבים בזמן ריצה.\nדוגמה:\n```yaml\nresources:\n  requests:\n    cpu: \"200m\"\n    memory: \"256Mi\"\n  limits:\n    cpu: \"1\"\n    memory: \"512Mi\"\n```\nה-Scheduler מתזמן את ה-Pod לפי requests, אבל הקונטיינר לא יכול לחרוג מה-limits בזמן ריצה.",
            },
            {
              q: "מה עושים taints ו-tolerations ב-Kubernetes?",
              options: [
              "מאפשרים scheduling של Pods על Nodes מסוימים רק אם ל-Pod יש toleration תואם",
              "מגבילים תעבורת רשת נכנסת ויוצאת בין Pods ב-Cluster",
              "מגדירים כללי RBAC שמגבילים גישה של ServiceAccounts ל-Nodes",
              "קובעים סדר עדיפויות scheduling בין Pods שמתחרים על משאבים",
],
              answer: 0,
              explanation:
                "`taint` = הגבלה שמוצבת על Node. רק Pods עם toleration תואם יתוזמנו עליו.\n`toleration` = הרשאה שמוגדרת ב-spec של ה-Pod ומאפשרת לו לרוץ על Node עם אותו taint.\nPods ללא toleration תואם לא יתוזמנו על Node עם אותו taint.",
            },
            {
              q: "`Node` חווה לחץ זיכרון. שלושה `Pods` רצים עליו: אחד `Guaranteed`, אחד `Burstable` ואחד `BestEffort`. איזה `Pod` יפונה ראשון?",
              options: [
              "ה-`Pod` עם `QoS` class `BestEffort` יפונה ראשון",
              "ה-`Pod` עם `QoS` class `Guaranteed` יפונה ראשון",
              "ה-`Pod` עם הכי הרבה replicas יפונה ראשון",
              "Kubernetes יפנה את כל ה-`Pods` בו-זמנית",
],
              answer: 0,
              explanation:
                "`QoS` class נקבעת לפי ההגדרות של `requests` ו-`limits` לכל קונטיינר ב-Pod.\n\n`Guaranteed`: כאשר לכל הקונטיינרים מוגדרים `requests` ו-`limits`, ובכל אחד מהם requests=limits.\n\n`Burstable`: כאשר מוגדרים `requests` או `limits`, אבל אין התאמה מלאה של requests=limits לכל הקונטיינרים.\n\n`BestEffort`: כאשר לא מוגדרים כלל `requests` או `limits`.\n\nמבחינת eviction: `BestEffort` יפונה ראשון, אחריו `Burstable`, ו-`Guaranteed` הוא המוגן ביותר.",
            },
            {
              q: "מה `ephemeral container` ב-Kubernetes?",
              options: [
              "קונטיינר זמני שמוסיפים ל-`Pod` רץ לצורך debugging",
              "`Pod` זמני שנוצר אוטומטית כש-Deployment מתזמן על `Node` חדש",
              "גרסה מוקטנת של `Pod` שמשמשת ל-batch jobs קצרים",
              "init container שמוגדר עם TTL קצוב לניקוי אוטומטי",
],
              answer: 0,
              explanation:
                "`ephemeral container` הוא קונטיינר זמני שניתן להוסיף ל-`Pod` רץ לצורך debugging או troubleshooting.\nבדרך כלל מוזרק באמצעות `kubectl debug`.\n\nהוא לא חלק מה-spec המקורי של ה-`Pod`.\nהוא מתווסף באופן דינמי לצורך חקירה.\nהוא לא מאותחל מחדש עם ה-`Pod`.",
            },
        ],
        questionsEn: [
            {
              q: "What is the advantage of a Rolling Update?",
              options: [
              "Prevents the Service from routing to unhealthy Pods during upgrade",
              "Replaces Pods gradually so there are always running Pods serving traffic",
              "Guarantees data consistency by pausing until all Pods write their state to etcd",
              "Updates all Pods simultaneously to minimise total deployment time",
],
              answer: 1,
              explanation:
                "Rolling Update replaces Pods gradually. New Pod starts, then old Pod stops.\nThere are always running Pods serving traffic → zero downtime.\nUnlike Recreate strategy, which causes downtime by deleting all Pods first.",
            },
            {
              q: "How do you perform a rollback?",
              options: [
              "kubectl scale deployment my-app --replicas=0 then scale back up",
              "kubectl rollout undo deployment/my-app",
              "kubectl delete deployment my-app and re-apply the previous YAML manifest",
              "kubectl patch deployment my-app to restore the previous image tag",
],
              answer: 1,
              explanation:
                "Command:\nkubectl rollout undo deployment/my-app\n\nRolls the Deployment back to the previous revision.\nK8s stores history via ReplicaSets, so it knows which version to restore.\n\nTo roll back to a specific revision:\nkubectl rollout undo deployment/my-app --to-revision=3",
            },
            {
              q: "What is the main difference between StatefulSet and Deployment?",
              options: [
              "StatefulSet only works with cloud providers and not on-premise clusters",
              "Pods in StatefulSet get fixed names and their own storage",
              "StatefulSet schedules Pods faster by caching node selection decisions",
              "StatefulSet does not support rolling updates and requires manual restarts",
],
              answer: 1,
              explanation:
                "StatefulSet gives each Pod a stable name (pod-0, pod-1) and its own PVC.\nPods start in order and keep their identity across restarts.\nDeployment Pods are interchangeable; StatefulSet Pods are not.",
            },
            {
              q: "What does a PodDisruptionBudget do?",
              options: [
              "Restricts inbound network traffic to Pods during maintenance windows",
              "Limits the total CPU a Deployment can consume during a rolling update",
              "Defines minimum available Pods during a planned disruption",
              "Manages automatic scaling based on CPU and memory metrics",
],
              answer: 2,
              explanation:
                "PodDisruptionBudget (PDB) defines the minimum number of Pods that must remain available during voluntary disruptions such as `kubectl drain`.\nExample: with replicas: 3 and minAvailable: 2, Kubernetes will only allow eviction if at least 2 Pods remain available.\nProtects critical application availability during Node maintenance.",
            },
            {
              q: "What do resource limits define in Kubernetes?",
              options: [
              "The maximum resources a container is allowed to use at runtime",
              "The minimum resources the Scheduler guarantees before placing a Pod",
              "The maximum number of inbound ports a Service allows for a Pod",
              "The maximum container image size that can be cached on a Node",
],
              answer: 0,
              explanation:
                "limits define the maximum amount of resources a container can use.\nExceeding a memory limit causes the container to be killed (OOMKill, exit code 137).\nExceeding a CPU limit causes throttling, not termination.\nThe difference between requests and limits:\n• requests = minimum resources the Scheduler uses to place a Pod on a Node.\n• limits = the hard ceiling on resource usage at runtime.\nExample:\n```yaml\nresources:\n  requests:\n    cpu: \"200m\"\n    memory: \"256Mi\"\n  limits:\n    cpu: \"1\"\n    memory: \"512Mi\"\n```\nThe Scheduler schedules the Pod based on requests, but the container cannot exceed the limits during runtime.",
            },
            {
              q: "What do taints and tolerations do in Kubernetes?",
              options: [
              "Allow Pods to be scheduled on tainted Nodes only if the Pod has a matching toleration",
              "Restrict inbound and outbound network traffic between Pods in the Cluster",
              "Define RBAC rules that limit ServiceAccount access to specific Nodes",
              "Set scheduling priority order between Pods competing for resources",
],
              answer: 0,
              explanation:
                "`taint` = a restriction placed on a Node. Only Pods with a matching toleration can be scheduled on it.\n`toleration` = permission defined in the Pod spec that allows it to run on a Node with that taint.\nPods without a matching toleration will not be scheduled on a Node with that taint.",
            },
            {
              q: "A `Node` is experiencing memory pressure. Three `Pods` are running on it: one `Guaranteed`, one `Burstable`, and one `BestEffort`. Which `Pod` is evicted first?",
              options: [
              "The `Pod` with `QoS` class `Guaranteed` is evicted first",
              "The `Pod` with `QoS` class `BestEffort` is evicted first",
              "The `Pod` with the most replicas is evicted first",
              "Kubernetes evicts all `Pods` at the same time",
],
              answer: 1,
              explanation:
                "`QoS` (Quality of Service) determines the priority of `Pods` when a `Node` experiences resource pressure, especially memory pressure.\nKubernetes determines the `QoS` class automatically based on the `requests` and `limits` defined for containers.\n\n`Guaranteed`: `requests` and `limits` are defined and equal for all containers. Highest protection from eviction.\n`Burstable`: `requests` are defined but `limits` are higher. Partial protection.\n`BestEffort`: no `requests` and no `limits` defined. These `Pods` are the first to be evicted when the `Node` experiences memory pressure.",
            },
            {
              q: "What is an `ephemeral container` in Kubernetes?",
              options: [
              "A temporary `Pod` automatically created when a Deployment targets a new `Node`",
              "A temporary container added to a running `Pod` for debugging",
              "A stripped-down `Pod` variant used for short-lived batch jobs",
              "An init container configured with a TTL for automatic cleanup",
],
              answer: 1,
              explanation:
                "An `ephemeral container` is a temporary container that can be added to a running `Pod` for debugging or troubleshooting.\nIt is usually injected using `kubectl debug`.\n\nIt is not part of the original `Pod` spec.\nIt is added dynamically for troubleshooting.\nIt is not restarted with the `Pod`.",
            },
        ],
      },
      hard: {
        theory: "DaemonSets, HPA, ומצבי כשל.\n🔹 DaemonSet:\u200E Pod אחד על כל Node (logging, monitoring, CNI)\n🔹 HPA:\u200E Horizontal Pod Autoscaler, מגדיל ומקטין replicas לפי CPU ו-Memory\n🔹 CrashLoopBackOff:\u200E קונטיינר קורס שוב ושוב\n🔹 OOMKilled:\u200E חרגנו ממגבלת הזיכרון\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet",
        theoryEn: "DaemonSets, HPA, and Failure States\n🔹 DaemonSet - ensures exactly one Pod runs on every Node, commonly used for logging, monitoring, or CNI.\n🔹 HPA - Horizontal Pod Autoscaler scales the replica count based on CPU or memory usage.\n🔹 CrashLoopBackOff - indicates a container is crashing repeatedly and Kubernetes keeps restarting it.\n🔹 OOMKilled - indicates a container exceeded its memory limit and was terminated.\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10\napiVersion: apps/v1\nkind: DaemonSet",
        questions: [
            {
              q: "מה DaemonSet מבטיח?",
              options: [
              "שה-Pod רץ פעם אחת עד להשלמה ולא מופעל מחדש. התנהגות של Job",
              "ש-DaemonSet מבטיח ש-Pod אחד רץ על כל Node ב-Cluster",
              "שה-Pod רץ רק על Node שמסומן עם label מתאים דרך nodeSelector",
              "שה-Pod מופעל מחדש לפי לוח זמנים קבוע. התנהגות של CronJob",
],
              answer: 1,
              explanation:
                "DaemonSet מבטיח Pod אחד על כל Node ב-Cluster.\nכש-Node חדש מצטרף, Pod נוסף אוטומטית. כש-Pod נכשל, הוא מופעל מחדש.\nשימושי ל-logging (Fluentd), monitoring (node-exporter), ו-CNI plugins.",
            },
            {
              q: "מה תפקיד ה-HPA ב-Kubernetes?",
              options: [
              "Horizontal Pod Autoscaler:\u200E מגדיל ומקטין Pods לפי עומס",
              "High Performance App:\u200E תצורת Pod מותאמת לביצועים גבוהים",
              "Helm Package Archive:\u200E פורמט שמירה של Helm charts",
              "Host Port Assignment:\u200E מקצה ports ב-Node ל-Pods",
],
              answer: 0,
              explanation:
                "HPA (Horizontal Pod Autoscaler) משנה מספר replicas אוטומטית לפי עומס.\nכשהעומס עולה, HPA מוסיף Pods. כשהעומס יורד, HPA מסיר Pods.\nדורש metrics-server מותקן ב-Cluster.",
            },
            {
              q: "מה המשמעות של OOMKilled ב-Kubernetes?",
              options: [
              "הדיסק של ה-Node מלא ו-kubelet לא יכול ליצור קבצים",
              "הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-limits.memory",
              "שגיאת הרשאות שמונעת מהקונטיינר לגשת ל-volume",
              "שגיאת רשת שנגרמת כשה-Pod מנסה לגשת לכתובת IP חסומה",
],
              answer: 1,
              explanation:
                "OOMKilled (exit code 137): הקונטיינר חרג ממגבלת ה-memory שהוגדרה ב-limits.\nה-Linux kernel הורג תהליכים שחורגים ממגבלת הזיכרון.\nהפתרון: הגדל memory limit, או חפש memory leak בקוד.",
            },
            {
              q: "מה התפקיד של topologySpreadConstraints בתזמון Pods ב-Kubernetes?",
              options: [
              "קובע סדר עדיפויות לפינוי Pods כאשר Node נכנס למצב NotReady",
              "מגביל את מספר ה-Pods שה-scheduler יכול למקם בו-זמנית במהלך rolling update",
              "מפזר Pods באופן אחיד בין failure domains כמו Nodes או Zones כדי לשפר זמינות",
              "מגדיר כללי affinity שמחייבים Pods לרוץ על Node ספציפי לפי label",
],
              answer: 2,
              explanation:
                "topologySpreadConstraints מפזר Pods באופן אחיד בין failure domains (Nodes, Zones).\nללא פיזור, כל ה-Pods עלולים לרוץ על Node אחד. אם קורס, השירות נופל.\nפיזור מבטיח שחלק מה-Pods ממשיכים לרוץ גם בכשל של Node או Zone.",
            },
            {
              q: "Pod נשאר במצב Pending.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\nFailedScheduling\n0/3 nodes available\nuntolerated taint: dedicated=gpu\n```\n\nמה הפתרון הנכון?",
              options: [
              "להעביר את ה-Pod ל-Namespace ייעודי לעבודות GPU",
              "להוסיף Node חדש ל-Cluster ללא taint",
              "להוסיף toleration מתאים ל-spec של ה-Pod שיתאים ל-taint",
              "להקטין את ה-CPU request כדי שה-Pod יתאים ל-Node קטן יותר",
],
              answer: 2,
              explanation:
                "כל 3 ה-Nodes מסומנים עם taint (dedicated=gpu) וה-Pod חסר toleration תואם.\nלהוסיף toleration ל-spec של ה-Pod שמתאים ל-taint.\n• Node חדש:\u200E עוקף, לא פותר. • CPU request:\u200E לא רלוונטי. • Namespace:\u200E לא משפיע על taints.\nTaint = \"כניסה אסורה\". Toleration = אישור כניסה ב-spec של ה-Pod.",
            },
            {
              q: "StatefulSet עם 3 replicas רץ ב-Cluster.\nPod-0 לא במצב Ready, ו-Pod-1 נשאר במצב Pending.\n\nמה הסיבה הסבירה ביותר?",
              options: [
              "Pod-0 לא Ready. לכן StatefulSet לא ממשיך ליצור את Pod-1",
              "ה-PVC של Pod-1 מלא ואין אפשרות להקצות לו אחסון חדש",
              "ה-imagePullSecret שגוי ומונע הורדת ה-Image עבור Pod-1",
              "ה-Namespace quota הגיע למגבלה ולא ניתן ליצור Pods חדשים",
],
              answer: 0,
              explanation:
                "StatefulSet יוצר Pods בסדר (OrderedReady):\u200E Pod-0 חייב להיות Ready לפני ש-Pod-1 נוצר.\nלתקן את Pod-0 כדי שיגיע למצב Ready, או להגדיר podManagementPolicy: Parallel.\n• PVC: Pod-1 לא נוצר בכלל. • Quota:\u200E גם Pod-0 לא היה עולה. • imagePullSecret:\u200E היה גורם ל-ImagePullBackOff.\nבברירת מחדל, StatefulSet יוצר Pods בסדר עוקב ותקיעה ב-Pod מוקדם חוסמת את כל השאר.",
            },
            {
              q: "עדכון Rolling update נתקע.\n\nהרצת:\n\n```\nkubectl rollout status deployment/my-app\n```\n\nפלט:\n\n```\nWaiting for rollout to finish:\n3 out of 5 new replicas have been updated\n```\n\nבנוסף, מוגדר maxUnavailable: 0\n\nמה הסיבה?",
              options: [
              "Pods החדשים לא עוברים readiness probe, ו-maxUnavailable:0 מונע הורדת ישנים",
              "ה-TLS certificate שגוי ב-admission webhook שבודק את ה-Pod spec",
              "ה-image שגוי ו-kubelet לא מצליח להוריד אותו מה-registry",
              "ה-Namespace quota מלא ולא ניתן ליצור Pods נוספים",
],
              answer: 0,
              explanation:
                "maxUnavailable:0 מונע הורדת Pod ישן עד שהחדש עובר readiness.\nאם Pods חדשים נכשלים ב-readiness, ה-rollout נתקע. יש לבדוק kubectl logs.\nmaxUnavailable:0 = בטיחות מלאה, אבל readiness כושל = rollout תקוע.",
            },
            {
              q: "ה-Deployment לא מנהל Pods.\n\nהרצת:\n\n```\nkubectl get pods --show-labels\n```\n\nפלט:\n\n```\napp=backend-v2\n```\n\nהגדרת Deployment:\n\n```yaml\nselector:\n  matchLabels:\n    app: backend\n```\n\nמה הבעיה?",
              options: [
              "ה-Namespace של ה-Pods שונה מה-Namespace של ה-Deployment",
              "ה-Service חסר ולכן ה-Deployment לא מזהה את ה-Pods",
              "selector לא תואם labels של Pods. 'backend' ≠ 'backend-v2'",
              "ה-image שגוי וה-Pods לא יכולים לעלות",
],
              answer: 2,
              explanation:
                "selector (app: backend) לא תואם ל-labels של ה-Pods (app: backend-v2).\nלסנכרן בין selector.matchLabels ל-template.metadata.labels.\nDeployment מוצא את ה-Pods שלו אך ורק לפי selector. אי-התאמה = אפס שליטה.",
            },
        ],
        questionsEn: [
            {
              q: "What does a DaemonSet guarantee?",
              options: [
              "The Pod runs on a fixed schedule. This describes a CronJob, not a DaemonSet",
              "The Pod runs only on Nodes matching a specific label via nodeSelector",
              "DaemonSet ensures that one Pod runs on every Node in the cluster",
              "The Pod runs once to completion and is never restarted. This describes a Job",
],
              answer: 2,
              explanation:
                "DaemonSet ensures one Pod runs on every Node in the cluster.\nNew Nodes automatically get a Pod. If a Pod fails, it is restarted.\nCommon use cases: logging (Fluentd), monitoring (node-exporter), and CNI plugins.",
            },
            {
              q: "What is HPA?",
              options: [
              "Helm Package Archive: the storage format for packaged Helm charts",
              "Host Port Assignment: allocates host ports on Nodes for Pod services",
              "Horizontal Pod Autoscaler: scales Pods automatically based on CPU/Memory",
              "High Performance App: a Pod configuration optimised for compute-intensive tasks",
],
              answer: 2,
              explanation:
                "HPA (Horizontal Pod Autoscaler) auto-scales replicas based on CPU/Memory metrics.\nLoad increases → adds Pods. Load drops → removes Pods.\nRequires metrics-server installed in the cluster.",
            },
            {
              q: "What is OOMKilled?",
              options: [
              "A permissions error preventing the container from mounting the required volume",
              "The Node's disk became full and kubelet could not create container files",
              "Container exceeded its memory limit defined in limits.memory",
              "A network error triggered when the Pod attempts to reach a blocked IP address",
],
              answer: 2,
              explanation:
                "OOMKilled (exit code 137): container exceeded its memory limit.\nThe Linux kernel kills processes that exceed the memory limit set in limits.memory.\nFix by increasing memory limit, or investigate a memory leak in the app.",
            },
            {
              q: "What is the role of topologySpreadConstraints in Kubernetes scheduling?",
              options: [
              "Defines affinity rules that force Pods to run on a specific Node based on its labels",
              "Spreads Pods evenly across failure domains such as Nodes or Zones to improve availability",
              "Limits the number of Pods the scheduler can place concurrently during a rolling update",
              "Sets eviction priority for Pods when a Node enters NotReady state",
],
              answer: 1,
              explanation:
                "topologySpreadConstraints distributes Pods evenly across failure domains (Nodes, Zones).\nWithout spreading, all Pods may land on one Node. If it fails, the service is down.\nEven distribution ensures partial availability even when a Node or Zone fails.",
            },
            {
              q: "A Pod remains in Pending state.\n\nCommand:\n\n```\nkubectl describe pod\n```\n\nOutput:\n\n```\nFailedScheduling\n0/3 nodes available\nuntolerated taint: dedicated=gpu\n```\n\nWhat should you add to the Pod\nso it gets scheduled?",
              options: [
              "Add a new Node to the cluster without any taints",
              "Add a matching toleration to the Pod spec for the taint",
              "Move the Pod to a Namespace dedicated to GPU workloads",
              "Reduce the CPU request so the Pod fits on a smaller Node",
],
              answer: 1,
              explanation:
                "All 3 Nodes have taint dedicated=gpu and the Pod lacks a matching toleration.\nAdd a toleration to the Pod spec matching the taint.\n• New Node: workaround, not a fix. • CPU request: irrelevant. • Namespace: has no effect on taints.\nTaint = \"no entry\". Toleration = Pod's permission to run on that Node.",
            },
            {
              q: "A StatefulSet with 3 replicas is running in the cluster.\nPod-0 is not Ready, and Pod-1 remains in Pending state.\n\nWhat is the most likely reason?",
              options: [
              "The PVC for Pod-1 is full and no additional storage can be allocated",
              "The Namespace quota has been reached and no new Pods can be created",
              "The imagePullSecret is incorrect, preventing the image pull for Pod-1",
              "Pod-0 is not Ready. StatefulSet will not create Pod-1 until Pod-0 is Ready",
],
              answer: 3,
              explanation:
                "StatefulSet uses OrderedReady: Pod-0 must be Ready before Pod-1 is created.\nFix Pod-0 to become Ready, or set podManagementPolicy: Parallel.\n• PVC: Pod-1 was never created. • Quota: Pod-0 wouldn't exist either. • imagePullSecret: would cause ImagePullBackOff.\nDefault StatefulSet creates Pods sequentially. A stuck Pod blocks all subsequent ones.",
            },
            {
              q: "A rolling update is stuck.\n\nCommand:\n\n```\nkubectl rollout status deployment/my-app\n```\n\nOutput:\n\n```\nWaiting for rollout to finish:\n3 out of 5 new replicas have been updated\n```\n\nConfig: maxUnavailable: 0\n\nWhat is the cause?",
              options: [
              "An admission webhook TLS certificate is invalid and rejecting new Pod specs",
              "New Pods are failing readiness probes, and maxUnavailable:0 prevents removing old ones",
              "The Namespace quota is full and new Pods cannot be created",
              "The container image is incorrect and kubelet cannot pull it from the registry",
],
              answer: 1,
              explanation:
                "maxUnavailable:0 prevents removing old Pods until new ones pass readiness.\nNew Pods fail readiness → rollout stalls. Check kubectl logs on new Pods.\nmaxUnavailable:0 = safe but readiness failure = permanent stall.",
            },
            {
              q: "A Deployment does not manage its Pods.\n\nCommand:\n\n```\nkubectl get pods --show-labels\n```\n\nOutput:\n\n```\napp=backend-v2\n```\n\nDeployment spec:\n\n```yaml\nselector:\n  matchLabels:\n    app: backend\n```\n\nWhat is wrong?",
              options: [
              "The Service is missing so the Deployment cannot discover its Pods",
              "The Pods are in a different Namespace than the Deployment",
              "The container image is wrong and Pods cannot start successfully",
              "selector doesn't match Pod labels. 'backend' ≠ 'backend-v2'",
],
              answer: 3,
              explanation:
                "Selector (app: backend) doesn't match Pod labels (app: backend-v2).\nAlign selector.matchLabels with template.metadata.labels.\nA Deployment finds its Pods solely by selector. Mismatch = zero control.",
            },
        ],
      },
    },
  },
  {
    id: "networking",
    icon: "🌐",
    name: "Networking & Service Exposure",
    color: "#A855F7",
    description: "Services · Ingress · NetworkPolicy · DNS",
    descriptionEn: "Services · Ingress · NetworkPolicy · DNS",
    levels: {
      easy: {
        theory: "Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP:\u200E גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort:\u200E חשיפה על port בכל Node\n🔹 LoadBalancer:\u200E IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n - port: 80\n    targetPort: 8080",
        theoryEn: "Services\n🔹 Service - provides a stable IP for accessing Pods, selected by label matching.\n🔹 ClusterIP - internal-only access within the cluster (default type).\n🔹 NodePort - exposes the Service on a static port on every Node.\n🔹 LoadBalancer - provisions an external IP through the cloud provider.\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n - port: 80\n    targetPort: 8080",
        questions: [
            {
              q: "למה צריך Service?",
              options: [
              "כדי לגבות קונפיגורציה של Pod לפני מחיקה",
              "כדי לחסוך עלויות cloud על ידי שיתוף IP בין מספר Pods",
              "IP של Pod משתנה, Service נותן IP יציב שנשמר בין יצירת Pods",
              "כדי להצפין תנועה בין Pods שרצים ב-Namespaces שונים",
],
              answer: 2,
              explanation:
                "IP של Pod משתנה בכל פעם שהוא נוצר מחדש.\nService מספק ClusterIP קבוע ו-kube-proxy מנתב traffic ל-Pods בריאים.\nService = כתובת יציבה שנשמרת גם כש-Pods מתחלפים.",
            },
            {
              q: "איזה Service מתאים לגישה חיצונית ב-cloud?",
              options: [
              "ClusterIP:\u200E מספק IP פנימי שנגיש מכל Node ב-Cluster",
              "ExternalName:\u200E ממפה ל-DNS חיצוני ומאפשר גישה דרך CNAME",
              "LoadBalancer:\u200E יוצר Load Balancer ב-cloud ומקצה IP חיצוני",
              "NodePort:\u200E חושף port על כל Node לגישה ממחשבים חיצוניים",
],
              answer: 2,
              explanation:
                "LoadBalancer מבקש מה-cloud provider ליצור LB חיצוני עם IP ציבורי.\nמנתב traffic מהאינטרנט לכל ה-Nodes דרך NodePort.\nמתאים ל-production כשצריך גישה חיצונית ישירה.",
            },
            {
              q: "מה Service מסוג ClusterIP?",
              options: [
              "חשיפה חיצונית עם IP קבוע שמנתב תנועה ל-Nodes ב-cloud",
              "DNS חיצוני שמאפשר ל-Pods לגשת לשירותים מחוץ ל-Cluster",
              "גישה פנימית בלבד בתוך ה-Cluster. ברירת המחדל של Service",
              "VPN שמחבר Pods ב-Clusters שונים לתקשורת מאובטחת",
],
              answer: 2,
              explanation:
                "ClusterIP הוא ברירת המחדל: IP וירטואלי פנימי שנגיש רק מתוך ה-Cluster.\nPods ניגשים אליו לפי DNS (my-service.my-ns.svc.cluster.local).\nלא נגיש מבחוץ ללא Ingress או port-forward.",
            },
            {
              q: "כיצד Service מוצא את ה-Pods שלו?",
              options: [
              "לפי labels ו-selector שמוגדרים ב-spec של ה-Service",
              "לפי port שה-Pod מאזין עליו ו-Service מתאים",
              "לפי כתובת IP שמוגדרת ידנית ב-Endpoints object",
              "לפי שם ה-Pod שמוגדר ב-spec של ה-Service",
],
              answer: 0,
              explanation:
                "Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\nIPs של Pods תואמים נוספים לאובייקט Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.",
            },
            {
              q: "מה ההבדל בין port ל-targetPort ב-Service?",
              options: [
              "targetPort משמש ל-HTTP בלבד, port משמש לכל הפרוטוקולים",
              "port הוא לתנועה חיצונית, targetPort לתנועה פנימית בין Services",
              "port הוא הפורט של ה-Service, targetPort הוא הפורט של הקונטיינר",
              "אין הבדל, שניהם מגדירים את הפורט שה-Service מאזין עליו",
],
              answer: 2,
              explanation:
                "port = הפורט שה-Service חושף. targetPort = הפורט שהקונטיינר מאזין עליו.\nהם יכולים להיות שונים. Service על 80, קונטיינר על 8080.\nה-Service מתרגם בין port ל-targetPort אוטומטית.",
            },
            {
              q: "מה kube-dns/CoreDNS ב-Kubernetes?",
              options: [
              "Firewall שמסנן תנועה DNS ומונע גישה ל-domains זדוניים",
              "Load balancer שמנתב בקשות DNS בין Nodes",
              "Certificate manager שמנפיק TLS certs ל-Services",
              "שרת DNS פנימי שמתרגם שמות Services ל-IPs",
],
              answer: 3,
              explanation:
                "CoreDNS רץ כ-Pod ומספק DNS פנימי ל-Cluster.\nכל Service מקבל שם DNS אוטומטי (service.namespace.svc.cluster.local).\nמאפשר ל-Pods למצוא Services לפי שם במקום IP.",
            },
            {
              q: "מה מטרת Ingress ב-Kubernetes?",
              options: [
              "סוג Pod מיוחד שאחראי על ניהול חיבורי HTTPS",
              "storage manager שמנהל PVCs מסוג network storage",
              "ניתוב HTTP/HTTPS לפי path/hostname ל-Services שונים דרך כניסה אחת",
              "Service פנימי שמספק load balancing בין Pods ב-Namespace",
],
              answer: 2,
              explanation:
                "Ingress חושף Services HTTP/HTTPS לחוץ עם ניתוב לפי path או hostname.\nמנתב /api ל-Service אחד ו-/web לאחר דרך כניסה אחת.\nחוסך LoadBalancer נפרד לכל Service.",
            },
            {
              q: "מה NetworkPolicy ב-Kubernetes?",
              options: [
              "DNS server פנימי שמנהל name resolution בין Pods",
              "סוג Service שמגביל גישה לפי Namespace",
              "storage class שמגביל גישה ל-PVs לפי Pod labels",
              "חוק firewall ברמת Pod שמגדיר מי מורשה לתקשר עם מי",
],
              answer: 3,
              explanation:
                "NetworkPolicy מגדירה חוקי firewall ברמת Pod.\ningress = מי מורשה להגיע ל-Pod. egress = לאן Pod מורשה לשלוח.\nדורשת CNI plugin תומך (Calico, Cilium).",
            },
        ],
        questionsEn: [
            {
              q: "Why do we need a Service?",
              options: [
              "To encrypt traffic between Pods running in different Namespaces",
              "A Pod's IP address changes every time it restarts; a Service provides a stable IP that always routes to healthy Pods",
              "To back up Pod configuration before the Pod is deleted",
              "To reduce cloud costs by sharing one IP address across multiple Pods in the cluster",
],
              answer: 1,
              explanation:
                "A Pod's IP changes every time it restarts. You can't connect to it reliably.\nA Service provides a stable ClusterIP that routes traffic to healthy Pods.\nService = permanent address that survives Pod restarts.",
            },
            {
              q: "Which Service type is for cloud external access?",
              options: [
              "ClusterIP: provides an internal cluster IP reachable from every Node in the cluster",
              "LoadBalancer: creates a cloud Load Balancer and assigns an external IP address",
              "ExternalName: maps to an external DNS name allowing access via a CNAME record",
              "NodePort: exposes a port on every Node allowing access from external machines",
],
              answer: 1,
              explanation:
                "LoadBalancer asks the cloud provider to create an external LB with a public IP.\nInternet traffic hits the public IP and is forwarded into the cluster.\nStandard for production external access. Each LB Service incurs cloud cost.",
            },
            {
              q: "What is a ClusterIP Service?",
              options: [
              "A VPN tunnel connecting Pods in different Clusters for secure communication",
              "External exposure that assigns a fixed IP reachable from outside the cluster via cloud DNS",
              "An external DNS record that maps a hostname to Pod IPs for cross-cluster routing",
              "Internal-only access within the Cluster",
],
              answer: 3,
              explanation:
                "ClusterIP is the default. Assigns a virtual internal IP reachable only within the cluster.\nPods reach it by DNS name (my-service.my-ns.svc.cluster.local).\nNot accessible from outside without Ingress or port-forward.",
            },
            {
              q: "How does a Service find its Pods?",
              options: [
              "By labels and selector",
              "By the port the Pod listens on, matched against the Service's targetPort",
              "By a manually configured IP address in the Endpoints object",
              "By the Pod name defined in the Service spec's targetRef field",
],
              answer: 0,
              explanation:
                "A Service defines a label selector. The Endpoints controller finds matching Pods.\nMatching Pod IPs are added to the Endpoints object automatically.\nkube-proxy routes traffic to one of the healthy endpoints.",
            },
            {
              q: "What is the difference between port and targetPort in a Service?",
              options: [
              "There is no difference. Both define the same port the Service listens and forwards on",
              "port is the Service port; targetPort is the container port",
              "port governs external traffic routing while targetPort governs internal Service-to-Service traffic",
              "targetPort is used for HTTP traffic only while port handles all other protocols",
],
              answer: 1,
              explanation:
                "port = what the Service exposes (e.g., 80). targetPort = what the container listens on (e.g., 8080).\nThey can differ. Expose as port 80, container listens on 8080.\nThe Service translates between port and targetPort automatically.",
            },
            {
              q: "What is CoreDNS in Kubernetes?",
              options: [
              "An internal DNS server that resolves Service names to IPs",
              "A certificate manager Pod that issues TLS certificates for Services",
              "A load balancer Pod that routes DNS-based requests between Nodes in the cluster",
              "A firewall Pod that filters DNS queries and blocks access to malicious external domains",
],
              answer: 0,
              explanation:
                "CoreDNS runs as a Pod and provides internal cluster DNS.\nEvery Service automatically gets a DNS name (service.namespace.svc.cluster.local).\nEnables Pods to find Services by name instead of IP.",
            },
            {
              q: "What is the purpose of an Ingress in Kubernetes?",
              options: [
              "Routes HTTP/HTTPS by path or hostname to different Services through one entry point",
              "A special Pod type responsible for managing HTTPS connections to the API server",
              "A storage manager that provisions network-attached storage for Pods",
              "An internal Service that provides load balancing between Pods within the same Namespace",
],
              answer: 0,
              explanation:
                "Ingress is an HTTP/HTTPS router. Routes /api to one Service, /web to another.\nOne entry point for multiple Services instead of a LoadBalancer per Service.\nRequires an Ingress Controller (e.g., nginx) to enforce the routing rules.",
            },
            {
              q: "What is a NetworkPolicy in Kubernetes?",
              options: [
              "A StorageClass that restricts PV access based on Pod labels",
              "An internal DNS server that manages name resolution between Pods in a Namespace",
              "A Service subtype that restricts access to specific Namespaces only",
              "A Pod-level firewall rule defining who can communicate with whom",
],
              answer: 3,
              explanation:
                "NetworkPolicy is a Pod-level firewall. By default, all Pods can talk to all Pods.\nControls ingress (who can reach a Pod) and egress (where a Pod can send).\nOnly works with a CNI that enforces it (Calico, Cilium). Not Flannel.",
            },
        ],
      },
      medium: {
        theory: "DNS ו-Ingress.\n🔹 כל Service מקבל DNS אוטומטי: service.namespace.svc.cluster.local\n🔹 Ingress מנתב HTTP/HTTPS לפי path או hostname\n🔹 Ingress חוסך LoadBalancers. כניסה אחת לכל ה-services\n🔹 דורש Ingress Controller (nginx, traefik)\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n - host: app.example.com\n    http:\n      paths:\n - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80",
        theoryEn: "DNS and Ingress\n🔹 Service DNS - every Service gets an automatic DNS name: service.namespace.svc.cluster.local.\n🔹 Ingress - routes external HTTP/HTTPS traffic to Services based on path or hostname.\n🔹 Single entry point - Ingress consolidates routing, reducing the need for multiple LoadBalancers.\n🔹 Ingress Controller - requires a controller such as nginx or traefik to process Ingress rules.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  rules:\n - host: app.example.com\n    http:\n      paths:\n - path: /api\n        pathType: Prefix\n        backend:\n          service:\n            name: api-svc\n            port:\n              number: 80",
        questions: [
            {
              q: "מה ה-DNS name של service בשם 'api' ב-namespace 'prod'?",
              options: [
              "prod.api.local",
              "api.prod",
              "api.prod.svc.cluster.local",
              "api.prod.svc",
],
              answer: 2,
              explanation:
                "FQDN מלא: service.namespace.svc.cluster.local.\nCoreDNS מפנה שמות אלו ל-ClusterIP. באותו Namespace. שם קצר מספיק.\napi.prod עובד מ-Namespace אחר, אבל api.prod.svc.cluster.local הוא ה-FQDN.",
            },
            {
              q: "מה היתרון של Ingress על פני LoadBalancer?",
              options: [
              "מהיר יותר כי הוא מבצע פחות hop routing בין Pods",
              "זול יותר כי הוא מחליף SSL certificates אוטומטית",
              "כניסה אחת לכל ה-services",
              "יותר מאובטח כי הוא מצפין תנועה ב-mTLS בין Services",
],
              answer: 2,
              explanation:
                "Ingress מנהל ניתוב HTTP/S חכם (לפי host/path) דרך כניסה אחת.\nבמקום LoadBalancer נפרד לכל Service, Ingress מנתב מ-IP אחד.\nתומך ב-TLS termination במקום אחד. חוסך עלויות cloud.",
            },
            {
              q: "כיצד מגדירים TLS ב-Ingress?",
              options: [
              "דרך Service מסוג ClusterIP שמגדיר TLS termination פנימי",
              "דרך NodePort שמגדיר TLS certificate ל-port ספציפי",
              "דרך ConfigMap שמכיל את ה-certificate ומוסיפים אותו ל-Ingress annotations",
              "דרך Secret מסוג TLS וציון שמות hosts ב-Ingress",
],
              answer: 3,
              explanation:
                "מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key.\nמפנים ל-Secret ב-spec.tls של ה-Ingress עם שמות ה-hosts.\nה-Ingress Controller מבצע TLS termination אוטומטית.",
            },
            {
              q: "מה path-based routing ב-Ingress?",
              options: [
              "ניתוב לפי IP המקור של הבקשה ל-Service ספציפי",
              "ניתוב לפי Namespace שממנו הבקשה נשלחת",
              "ניתוב לפי HTTP header כמו X-User-Type ל-Service שונה",
              "ניתוב בקשות HTTP לפי URL path ל-Services שונים",
],
              answer: 3,
              explanation:
                "ניתוב לפי path: /api מופנה ל-service-api, /web מופנה ל-service-web באותו Ingress.\nכל URL path מופנה ל-Service אחר לפי כללי ניתוב.\nמספר Services חולקים דומיין אחד.",
            },
            {
              q: "מה egress NetworkPolicy?",
              options: [
              "מגביל תנועה נכנסת ל-Pod לפי labels של Pod המקור",
              "מגביל bandwidth של Pod לפי annotations",
              "מנהל DNS resolution עבור Pods ב-Namespace",
              "מגביל תנועה יוצאת מ-Pods",
],
              answer: 3,
              explanation:
                "Egress NetworkPolicy מגדיר לאילו יעדים Pod מורשה לשלוח תנועה.\nעם policyTypes: [Egress], כל יציאה שלא מורשת. חסומה.\nחובה לאפשר port 53 (DNS), אחרת name resolution נכשל.",
            },
            {
              q: "כיצד Ingress מנתב לפי hostname?",
              options: [
              "לפי port שעליו מגיעה הבקשה, ממופה בשדה ports בהגדרת ה-Ingress",
              "דרך ConfigMap שמגדיר מיפוי של hostnames ל-Services",
              "שדה host בשורש ה-Ingress מגדיר hostname בודד לכל ה-rules",
              "בשדה host בתוך כל rule מגדירים hostname ספציפי שמנתב ל-Service מתאים",
],
              answer: 3,
              explanation:
                "כל rule ב-Ingress מכיל שדה host שמגדיר hostname ספציפי.\napi.example.com מופנה ל-Service אחד, web.example.com ל-Service אחר.\nIngress אחד יכול לשרת מספר דומיינים.",
            },
            {
              q: "נניח שיש לך Service ב-Kubernetes עם ההגדרה הבאה:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nמה ההבדל בין `externalTrafficPolicy: Local` לבין `externalTrafficPolicy: Cluster`?",
              options: [
              "Cluster מפזר עומס שווה בין כל ה-Pods; Local שולח תנועה רק ל-Pod הקרוב ביותר",
              "Local דורש externalIPs מוגדרים; Cluster עובד עם כל סוגי Service כולל ClusterIP",
              "Local מעביר תנועה רק ל-Pods על אותו Node ושומר client IP; Cluster מעביר לכל Pod ומבצע SNAT",
              "Local שומר על session affinity אוטומטי; Cluster דורש הגדרת sessionAffinity: ClientIP",
],
              answer: 2,
              explanation:
                "Local שולח traffic רק ל-Pods על אותו Node ושומר על IP הלקוח. Cluster (ברירת מחדל) שולח לכל Pod ומבצע SNAT.\nSNAT (Source Network Address Translation) - שכתוב כתובת המקור של הבקשה. ב-Cluster, ה-Pod רואה את ה-IP של ה-Node במקום ה-IP האמיתי של הלקוח. ב-Local, אין SNAT וה-Pod רואה את ה-IP האמיתי.\nLocal = שומר client IP, אבל Nodes ללא Pods לא מקבלים traffic.\nבחר Local כשצריך לזהות IP אמיתי של לקוח (logging, rate limiting).",
            },
            {
              q: "איך בודקים למה Service לא מגיע ל-Pods?",
              options: [
              "בדוק kubectl get endpoints <service>. אם ריק, selector לא תואם labels",
              "kubectl describe service/<name> --show-pods מציג Pods מחוברים",
              "kubectl logs service/<name> כדי לראות את logs של ה-Service",
              "kubectl exec -it service/<name> -- netstat מציג חיבורים פעילים",
],
              answer: 0,
              explanation:
                "kubectl get endpoints מציג Pod IPs שה-Service מנתב אליהם.\nרשימה ריקה = בעיית selector/labels.\nבדוק kubectl get pods --show-labels והשווה ל-selector של ה-Service.",
            },
        ],
        questionsEn: [
            {
              q: "What is the DNS name of service 'api' in namespace 'prod'?",
              options: [
              "prod.api.local",
              "api.prod",
              "api.prod.svc.cluster.local",
              "api.prod.svc",
],
              answer: 2,
              explanation:
                "Full FQDN: service.namespace.svc.cluster.local.\nCoreDNS resolves this to ClusterIP. Same Namespace → short name works.\nCross-Namespace → use api.prod or full FQDN api.prod.svc.cluster.local.",
            },
            {
              q: "What is the advantage of Ingress over LoadBalancer?",
              options: [
              "One entry point for all services",
              "Always cheaper because it auto-renews SSL certificates at no extra cost",
              "Faster because it performs fewer routing hops between Pods",
              "More secure because it enforces mTLS between all backend Services",
],
              answer: 0,
              explanation:
                "Ingress provides one entry point for multiple Services instead of a LoadBalancer per Service.\nRoutes HTTP/S by path (/api) or hostname (api.example.com) from a single IP.\nSaves cloud LB costs and simplifies DNS management.",
            },
            {
              q: "How do you configure TLS in an Ingress?",
              options: [
              "Via a ClusterIP Service that performs TLS termination internally",
              "Via a NodePort that specifies a TLS certificate for a specific port",
              "Via a ConfigMap containing the certificate, referenced in Ingress annotations",
              "Via a TLS Secret and specifying hosts in the Ingress",
],
              answer: 3,
              explanation:
                "Create a kubernetes.io/tls Secret with tls.crt and tls.key.\nReference the Secret in Ingress spec.tls with the host names.\nThe Ingress Controller handles TLS termination automatically.",
            },
            {
              q: "What is path-based routing in Ingress?",
              options: [
              "Routing HTTP requests by URL path to different Services",
              "Routing by an HTTP header such as X-User-Type to reach a specific Service",
              "Routing by the source IP address of the request to a specific Service",
              "Routing based on the Namespace the request originates from",
],
              answer: 0,
              explanation:
                "Path-based routing: /api → service-api, /web → service-web in one Ingress.\nEach URL path maps to a different backend Service.\nMultiple Services share a single domain.",
            },
            {
              q: "What is an egress NetworkPolicy?",
              options: [
              "Limits the bandwidth a Pod can use based on annotations",
              "Restricts inbound traffic to Pods based on labels of the source Pod",
              "Manages DNS resolution for Pods within the Namespace",
              "Restricts outbound traffic from Pods",
],
              answer: 3,
              explanation:
                "Egress NetworkPolicy controls where a Pod can send traffic.\nWith policyTypes: [Egress], all outbound is blocked unless explicitly allowed.\nAlways allow port 53 (DNS). Without it, name resolution fails entirely.",
            },
            {
              q: "How does Ingress route by hostname?",
              options: [
              "By the port on which the request arrives, mapped in the ports field of the Ingress",
              "A single host field at the root of the Ingress spec applies one hostname to all rules",
              "Via a ConfigMap that maps hostname entries to backend Service names",
              "Each rule defines a host field with a specific hostname that routes to the matching Service",
],
              answer: 3,
              explanation:
                "Each Ingress rule has a host field for hostname-based routing.\napi.example.com → one Service, web.example.com → another.\nA single Ingress can serve multiple domains.",
            },
            {
              q: "Given a Kubernetes Service with the following spec:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nWhat is the difference between `externalTrafficPolicy: Local` and `externalTrafficPolicy: Cluster`?",
              options: [
              "Local maintains automatic session affinity; Cluster requires explicit sessionAffinity: ClientIP",
              "Local routes traffic only to Pods on the same Node and preserves client IP; Cluster forwards to any Pod and performs SNAT",
              "Local requires configured externalIPs; Cluster works with all Service types including ClusterIP",
              "Cluster distributes load equally across all Pods; Local sends traffic only to the nearest Pod",
],
              answer: 1,
              explanation:
                "Local routes traffic only to Pods on the same Node and preserves client IP. Cluster (default) routes to any Pod with SNAT.\nSNAT (Source Network Address Translation) rewrites the source IP of a request. With Cluster, the Pod sees the Node's IP instead of the real client IP. With Local, SNAT is skipped so the Pod sees the real client IP.\nLocal = real client IP visible. Cluster = Node IP visible (SNAT).\nChoose Local for real client IP (logging, rate limiting). Downside: possible load imbalance.",
            },
            {
              q: "How do you debug why a Service is not reaching its Pods?",
              options: [
              "kubectl logs service/<name> to view connection logs from the Service",
              "kubectl exec -it service/<name> -- netstat to view active connections",
              "Check kubectl get endpoints <service>. If empty, selector doesn't match labels",
              "kubectl describe service/<name> --show-pods to list all attached Pods",
],
              answer: 2,
              explanation:
                "kubectl get endpoints shows Pod IPs the Service routes to.\nEmpty list = selector/label mismatch.\nCompare kubectl get pods --show-labels with the Service selector.",
            },
        ],
      },
      hard: {
        theory: "Network Policies ו-Namespaces.\n🔹 ברירת מחדל: כל Pod יכול לדבר עם כל Pod (allow-all)\n🔹 NetworkPolicy מגביל תנועה בין Pods\n🔹 דורש CNI plugin תומך (Calico, Cilium)\n🔹 Namespaces:\u200E בידוד לוגי: dev/staging/production\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n - Ingress\n - Egress",
        theoryEn: "Network Policies and Namespaces\n🔹 Default networking - by default, every Pod can communicate with every other Pod (allow-all).\n🔹 NetworkPolicy - restricts ingress and egress traffic between Pods.\n🔹 CNI requirement - requires a CNI plugin such as Calico or Cilium to enforce policies.\n🔹 Namespaces - provide logical isolation between environments such as dev, staging, and production.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  podSelector: {}\n  policyTypes:\n - Ingress\n - Egress",
        questions: [
            {
              q: "מה קורה ללא NetworkPolicy?",
              options: [
              "רק תנועת HTTPS מותרת ותנועת HTTP נחסמת",
              "כל תנועה חסומה ו-Pods לא מצליחים לתקשר עד שמגדירים allow rules",
              "כל Pod יכול לדבר עם כל Pod",
              "רק Pods באותו Namespace מדברים אחד עם השני",
],
              answer: 2,
              explanation:
                "ללא NetworkPolicy, ברירת המחדל היא allow-all. כל Pod מדבר עם כל Pod.\nברגע שמוסיפים NetworkPolicy ל-Pod, כל traffic שלא מורשה. חסום.\nNetworkPolicy עובד כ-whitelist. רק מה שמוגדר מותר.",
            },
            {
              q: "מה נדרש כדי ש-NetworkPolicy יעבוד?",
              options: [
              "גרסת Kubernetes 1.28 ומעלה עם feature gate מוגדר",
              "הפעלת firewall ברמת OS על כל Node",
              "CNI plugin תומך כמו Calico או Cilium",
              "cloud provider מיוחד שתומך ב-Network Policy API",
],
              answer: 2,
              explanation:
                "NetworkPolicy היא רק spec. האכיפה תלויה ב-CNI plugin.\nCalico, Cilium ו-Weave אוכפים. Flannel ו-kubenet:\u200E לא.\nב-Flannel, NetworkPolicy נוצרת אבל לא נאכפת. אפס הגנה.",
            },
            {
              q: "מה היתרון של IPVS על iptables ב-kube-proxy?",
              options: [
              "יותר מאובטח כי הוא מצפין את כל התנועה ברמת kernel",
              "זול יותר כי הוא דורש פחות משאבי CPU מ-Node",
              "ביצועים טובים יותר ב-Cluster גדול עם Hashing",
              "פשוט יותר להגדרה ולא דורש קונפיגורציה ב-kube-proxy",
],
              answer: 2,
              explanation:
                "IPVS משתמש ב-hash tables במקום iptables chains.\nביצועים טובים יותר כשיש אלפי Services ב-Cluster.\niptables = O(n) linear. IPVS = O(1) hashing.",
            },
            {
              q: "נניח שיש Service בשם `app-svc`.\n\nהפקודה `kubectl get endpoints` מחזירה:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nקיים Pod עם label:\n\n```yaml\napp: App\n```\n\nוב-Service מוגדר selector:\n\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nמדוע ה-Service לא מנתב תעבורה ל-Pods?",
              options: [
              "ה-selector לא תואם. labels ב-Kubernetes הם case-sensitive",
              "ה-Pod וה-Service נמצאים ב-Namespaces שונים",
              "ה-Pod לא במצב Ready ולכן לא נכלל ב-Endpoints",
              "ה-Service port לא תואם את ה-targetPort של הקונטיינר",
],
              answer: 0,
              explanation:
                "Labels הם case-sensitive. app: App ≠ app: app. כתוצאה מכך Endpoints ריקים.\nלתקן selector ל-app: App כדי שיתאים ל-label.\n• port שגוי: שגיאת חיבור, לא Endpoints ריקים. • Pod לא Ready:\u200E לא הבעיה כאן. • Namespace:\u200E לא רלוונטי.\nבדוק kubectl get endpoints ו-kubectl get pods --show-labels.",
            },
            {
              q: "NetworkPolicy חוסמת DNS.\nPods לא מצליחים לפתור שמות.\n\nהגדרה:\n\n```yaml\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\n```\n\nמה חסר?",
              options: [
              "ingress rule",
              "TLS certificate",
              "namespaceSelector",
              "egress rule ל-port 53 (DNS) ל-CoreDNS",
],
              answer: 3,
              explanation:
                "Egress policy מאפשרת רק port 443. DNS (port 53) חסום.\nלהוסיף egress rule ל-port 53 (UDP+TCP) לאפשר DNS.\nכל egress policy חייבת לכלול port 53, אחרת name resolution נכשל.",
            },
            {
              q: "ה-Ingress מחזיר שגיאת 503.\n\nהרצת:\n\n```\nkubectl describe ingress\n```\n\nפלט:\n\n```\nBackend: api-svc:80\n(<error: endpoints not found>)\n```\n\nמה הבעיה?",
              options: [
              "ה-Service קיים אבל ה-selector לא מתאים לאף Pod",
              "תעודת ה-TLS שגויה וחוסמת חיבורים נכנסים",
              "ה-Ingress וה-Service נמצאים ב-Namespaces שונים",
              "ה-Ingress Controller לא מותקן ב-Cluster",
],
              answer: 0,
              explanation:
                "Service קיים אבל כש-selector לא תואם Pods, ה-Endpoints ריקים וזה גורם לשגיאת 503.\nלתקן selector או labels כך שה-Pods יתאימו ל-Service.\n• Ingress Controller חסר:\u200E לא היה מגיב בכלל. • TLS:\u200E שגיאת SSL, לא 503. • Namespace:\u200E השגיאה היא endpoints ריקים.\n503 + endpoints not found = בעיית selector/labels.",
            },
            {
              q: "ה-Pod מנסה לגשת ל-Service ולא מצליח.\n\nכתובת שנוסתה:\n\n```\napi-svc.backend.cluster.local\n```\n\nמה ה-FQDN הנכון של Service בשם api-svc ב-Namespace backend?",
              options: [
              "api-svc.backend.svc.cluster.local",
              "api-svc.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.backend הוא ה-FQDN המלא",
],
              answer: 0,
              explanation:
                "FQDN מלא: service.namespace.svc.cluster.local.\napi-svc.backend.cluster.local חסר .svc ולא יפעל.\napi-svc.backend עובד בזכות search domains אבל אינו FQDN.",
            },
            {
              q: "ה-Pod לא מצליח להגיע לאינטרנט.\n\nהרצת:\n\n```\nkubectl exec -- curl https://google.com\n```\n\nתוצאה: timeout\n\nהגדרת NetworkPolicy:\n\n```yaml\nspec:\n  podSelector:\n    matchLabels:\n      app: worker\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\n```\n\nמה חסר?",
              options: [
              "ingress rule לאפשר תגובות נכנסות",
              "Service מסוג LoadBalancer ב-Namespace",
              "הגדרת hostNetwork: true ב-spec של ה-Pod",
              "egress rule עם ipBlock: cidr: 0.0.0.0/0 לאפשר גישה ל-IPs חיצוניים",
],
              answer: 3,
              explanation:
                "podSelector:{} מאפשר תנועה רק ל-Pods. IPs חיצוניים חסומים.\nלהוסיף egress rule עם ipBlock: {cidr: '0.0.0.0/0'} + port 53 ל-DNS.\npodSelector מכסה רק Pods בתוך ה-Cluster, לא IPs חיצוניים.",
            },
        ],
        questionsEn: [
            {
              q: "What happens without a NetworkPolicy?",
              options: [
              "Only Pods within the same Namespace can communicate with each other",
              "All traffic is blocked and Pods cannot communicate until allow rules are defined",
              "Only HTTPS traffic is allowed while HTTP is blocked by default",
              "Every Pod can talk to every Pod",
],
              answer: 3,
              explanation:
                "Without NetworkPolicy, the default is allow-all. Every Pod talks to every Pod.\nOnce you apply a NetworkPolicy to a Pod, all non-allowed traffic is blocked.\nNetworkPolicy works as a whitelist. Only explicitly allowed traffic passes.",
            },
            {
              q: "What is required for NetworkPolicy to work?",
              options: [
              "A special cloud provider that supports the Network Policy API",
              "A supporting CNI plugin like Calico or Cilium",
              "Enabling an OS-level firewall on every Node in the cluster",
              "Kubernetes version 1.28 or newer with the feature gate enabled",
],
              answer: 1,
              explanation:
                "NetworkPolicy is just a spec. Enforcement depends on the CNI plugin.\nCalico, Cilium, Weave enforce it. Flannel, kubenet do not.\nOn Flannel, NetworkPolicy is created but completely ignored. Zero protection.",
            },
            {
              q: "What is the advantage of IPVS over iptables in kube-proxy?",
              options: [
              "Cheaper because it requires less CPU from Nodes to maintain rules",
              "Simpler to configure and requires no extra kube-proxy configuration",
              "More secure because it encrypts all traffic at the kernel level",
              "Better performance in large clusters using hashing",
],
              answer: 3,
              explanation:
                "IPVS uses hash tables instead of iptables linear chains.\nMuch better performance with thousands of Services.\niptables = O(n) linear scan. IPVS = O(1) hash lookup.",
            },
            {
              q: "Given a Service named `app-svc`.\n\nRunning `kubectl get endpoints` returns:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nThe Pod has this label:\n\n```yaml\napp: App\n```\n\nThe Service selector is:\n\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nWhy is the Service not routing traffic to the Pods?",
              options: [
              "The selector does not match. Labels in Kubernetes are case-sensitive",
              "The Pod and Service are in different Namespaces",
              "The Pod is not Ready and therefore excluded from Endpoints",
              "The Service port does not match the container's targetPort",
],
              answer: 0,
              explanation:
                "Labels are case-sensitive. app: App ≠ app: app → empty Endpoints.\nChange selector to app: App to match the Pod label.\n• Wrong port: connection error, not empty Endpoints. • Not Ready: different issue. • Namespace: not relevant here.\nAlways verify with kubectl get endpoints and kubectl get pods --show-labels.",
            },
            {
              q: "A NetworkPolicy blocks DNS.\nPods cannot resolve names.\n\nPolicy:\n\n```yaml\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n  - ports:\n    - port: 443\n```\n\nWhat is missing?",
              options: [
              "A TLS certificate",
              "A namespaceSelector",
              "An egress rule for port 53 (DNS) to CoreDNS",
              "An ingress rule",
],
              answer: 2,
              explanation:
                "Egress policy allows only port 443. DNS (port 53) is blocked.\nAdd egress rule for port 53 (UDP+TCP) to allow DNS resolution.\nEvery egress policy must include port 53, or name resolution fails.",
            },
            {
              q: "An Ingress returns a 503 error.\n\nCommand:\n\n```\nkubectl describe ingress\n```\n\nOutput:\n\n```\nBackend: api-svc:80\n(<error: endpoints not found>)\n```\n\nWhat is the problem?",
              options: [
              "The Service exists but its selector does not match any Pods",
              "The Ingress Controller is not installed in the cluster",
              "The Ingress and Service are in different Namespaces",
              "The TLS certificate is invalid and blocking incoming connections",
],
              answer: 0,
              explanation:
                "Service exists but selector doesn't match any Pods → empty Endpoints → 503.\nAlign Pod labels with the Service selector.\n• No Ingress Controller: no response at all. • TLS: SSL error, not 503. • Namespace: error says empty endpoints.\n503 + \"endpoints not found\" = selector/label mismatch.",
            },
            {
              q: "A Pod tries to access a Service and fails.\n\nAddress tried:\n\n```\napi-svc.backend.cluster.local\n```\n\nWhat is the correct FQDN for Service api-svc in Namespace backend?",
              options: [
              "api-svc.backend.svc.cluster.local",
              "api-svc.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.backend is the full FQDN",
],
              answer: 0,
              explanation:
                "Full FQDN: service.namespace.svc.cluster.local.\napi-svc.backend.cluster.local is missing .svc and won't resolve.\napi-svc.backend works via search domains but is not a FQDN.",
            },
            {
              q: "A Pod cannot reach the internet.\n\nCommand:\n\n```\nkubectl exec -- curl https://google.com\n```\n\nResult: timeout\n\nNetworkPolicy:\n\n```yaml\nspec:\n  podSelector:\n    matchLabels:\n      app: worker\n  policyTypes: [Egress]\n  egress:\n  - to:\n    - podSelector: {}\n```\n\nWhat is missing?",
              options: [
              "A LoadBalancer Service in the Namespace",
              "An egress rule with ipBlock: cidr: 0.0.0.0/0 to allow external IPs",
              "An ingress rule to allow response traffic",
              "Setting hostNetwork: true in the Pod spec",
],
              answer: 1,
              explanation:
                "podSelector:{} allows traffic only to Pods. External IPs are blocked.\nAdd egress rule with ipBlock: {cidr: '0.0.0.0/0'} + port 53 for DNS.\npodSelector covers only in-cluster Pods, not external IPs.",
            },
        ],
      },
    },
  },
  {
    id: "config",
    icon: "🔐",
    name: "Configuration & Security",
    color: "#F59E0B",
    description: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
    descriptionEn: "ConfigMaps · Secrets · RBAC · ServiceAccounts",
    levels: {
      easy: {
        theory: "ConfigMap ו-Secret מפרידים קוד מקונפיגורציה.\n🔹 ConfigMap:\u200E הגדרות רגילות (DB_URL, timeout)\n🔹 Secret:\u200E נתונים רגישים (passwords, tokens)\n🔹 Secrets מקודדים ב-base64 (לא מוצפנים לחלוטין!)\n🔹 שניהם: env variables או volume\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        theoryEn: "ConfigMap and Secret\n🔹 ConfigMap - stores non-sensitive configuration such as database URLs and timeouts.\n🔹 Secret - stores sensitive data such as passwords and tokens.\n🔹 Encoding - Secrets are base64-encoded but not encrypted by default.\n🔹 Consumption - both can be injected as environment variables or mounted as volumes.\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        questions: [
            {
              q: "מה ההבדל בין ConfigMap ל-Secret?",
              options: [
              "אין הבדל. שניהם מאחסנים key-value data בצורה זהה ב-etcd",
              "ConfigMap מהיר יותר לגישה כי הוא לא עובר base64 encoding",
              "Secret מיועד לנתונים רגישים כמו סיסמאות, tokens, ו-TLS keys",
              "Secret מיועד רק ל-passwords ולא לסוגי sensitive data אחרים",
],
              answer: 2,
              explanation:
                "Secret מיועד לנתונים רגישים (סיסמאות, tokens, TLS keys), מאוחסן כ-base64 ב-etcd.\nConfigMap לקונפיגורציה רגילה. Secret למידע רגיש.\nשניהם ניתנים להזרקה כ-env variables או volume.",
            },
            {
              q: "האם Secrets מוצפנים לחלוטין?",
              options: [
              "תלוי בגרסת Kubernetes. מגרסה 1.25 מוצפנים אוטומטית",
              "כן, Kubernetes מצפין את כל ה-Secrets תמיד ב-AES-256 כברירת מחדל",
              "לא, רק מקודדים ב-base64 כברירת מחדל",
              "כן, עם AES-256 שמוגדר אוטומטית בעת התקנת ה-Cluster",
],
              answer: 2,
              explanation:
                "Secrets מקודדים ב-base64 בלבד. לא מוצפנים!\nbase64 הוא encoding, לא הצפנה. כל אחד יכול לפענח.\nלאבטחה אמיתית: Encryption at Rest, Sealed Secrets, או external manager.",
            },
            {
              q: "כיצד משתמשים ב-ConfigMap ב-Pod?",
              options: [
              "רק כ-env variables ישירות ב-spec של ה-containers ולא בצורות אחרות",
              "רק כקובץ. מוסיפים דרך volume ואין דרך אחרת לגשת לנתונים",
              "לא ניתן. Pod ניגש ל-ConfigMap רק דרך Kubernetes API call",
              "כ-env variables או כ-volume files",
],
              answer: 3,
              explanation:
                "ConfigMap נצרך כ-env variables (envFrom) או כ-volume files (volumeMounts).\nשתי הדרכים מאפשרות ל-Pod לגשת לנתוני קונפיגורציה.\nשינוי ב-volume מתעדכן אוטומטית; שינוי ב-env מצריך restart.",
            },
            {
              q: "נניח שנוצר Namespace חדש ב-Kubernetes.\nאיזה ServiceAccount קיים בו כברירת מחדל?",
              options: [
              "kube-proxy",
              "system:node",
              "admin",
              "default",
],
              answer: 3,
              explanation:
                "ServiceAccount הוא זהות ל-Pod. כל Namespace מכיל default שמוקצה אוטומטית.\nPods שלא מציינים ServiceAccount מקבלים את default.\nbest practice:\u200E ליצור ServiceAccount ייעודי עם הרשאות מינימליות.",
            },
            {
              q: "מה ראשי התיבות RBAC?",
              options: [
              "Resource Based Auth Configuration:\u200E מנגנון הרשאות מבוסס ענן",
              "Recursive Binding Access Control:\u200E ניהול bindings היררכיים",
              "Runtime Binary Access Control:\u200E אבטחת binaries בזמן ריצה",
              "Role Based Access Control",
],
              answer: 3,
              explanation:
                "RBAC = Role Based Access Control:\u200E מנגנון הרשאות ב-Kubernetes.\nשלושה מרכיבים: Roles (מה מותר), Subjects (מי מורשה), Bindings (מחברים ביניהם).\nמאפשר שליטה מדויקת. למשל לצפות ב-Pods אך לא למחוק.",
            },
            {
              q: "מה LimitRange עושה ב-Namespace?",
              options: [
              "מגביל את מספר ה-Nodes ש-Pods ב-Namespace יכולים לרוץ עליהם",
              "מגביל DNS queries מ-Pods ב-Namespace",
              "מגדיר ברירות מחדל ומגבלות ל-CPU/Memory ל-Pods ו-containers ב-Namespace",
              "מנטר logs ושולח alerts כשצריכת CPU עולה על threshold",
],
              answer: 2,
              explanation:
                "LimitRange מגדיר ברירות מחדל ומגבלות CPU/Memory per-container ב-Namespace.\nמזריק default values ואוכף min/max אם container לא מציין requests/limits.\nללא LimitRange, Pod בודד יכול לצרוך את כל משאבי ה-Node.",
            },
            {
              q: "מה securityContext.runAsNonRoot: true עושה?",
              options: [
              "מגביל CPU usage של הקונטיינר לערך שנקבע ב-limits",
              "מונע הפעלת קונטיינר כ-user 0 (root)",
              "מצפין את כל ה-filesystem של הקונטיינר",
              "מגביל גישת רשת של הקונטיינר ל-addresses ספציפיות",
],
              answer: 1,
              explanation:
                "runAsNonRoot: true מונע הפעלת קונטיינר כ-root (UID 0).\nroot בקונטיינר + container escape = גישת root על ה-Node.\nמצמצם blast radius. Kubernetes ידחה קונטיינר שמוגדר לרוץ כ-root.",
            },
            {
              q: "מה ההבדל בין resource requests ל-limits?",
              options: [
              "requests:\u200E הכמות המינימלית שה-Scheduler מבטיח; limits:\u200E הכמות המקסימלית שהקונטיינר יכול להשתמש",
              "requests ו-limits מגדירים את אותם ערכים. הם תמיד שווים",
              "limits קובעים עדיפות Scheduling; requests קובעים QoS class בלבד",
              "requests מגדירים כמות CPU ו-memory שמוקצית בעת יצירת ה-Node",
],
              answer: 0,
              explanation:
                "requests = מינימום שה-Scheduler מבטיח. limits = מקסימום שהקונטיינר יכול לצרוך.\nNode נבחר רק אם יש מספיק resources פנויים עבור requests.\nחריגת memory limit = OOMKill. חריגת CPU limit = throttling.",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between ConfigMap and Secret?",
              options: [
              "ConfigMap is faster because it skips base64 encoding",
              "Secret is only for passwords and not for other sensitive data types",
              "Secret is intended for sensitive data such as passwords, tokens, and TLS keys",
              "No difference. Both store key-value data identically in etcd",
],
              answer: 2,
              explanation:
                "Secret is for sensitive data (passwords, tokens, TLS keys), stored as base64 in etcd.\nConfigMap for regular config. Secret for sensitive data.\nBoth can be injected as env variables or volume files.",
            },
            {
              q: "Are Secrets fully encrypted by default?",
              options: [
              "Yes, with AES-256 configured automatically during cluster installation",
              "Yes, Kubernetes always encrypts Secrets at rest with AES-256 by default",
              "Depends on the Kubernetes version. Encrypted automatically from v1.25 onwards",
              "No, only base64 encoded by default",
],
              answer: 3,
              explanation:
                "Secrets are only base64-encoded by default. Not encrypted!\nbase64 is encoding, not encryption. Anyone can decode it.\nFor real security: Encryption at Rest, Sealed Secrets, or external secrets manager.",
            },
            {
              q: "How can a ConfigMap be used in a Pod?",
              options: [
              "Only as env variables injected directly in the containers spec",
              "Not possible. A Pod accesses ConfigMap data only via Kubernetes API calls",
              "Only as a file mounted via a volume. No other access method is supported",
              "As env variables or volume files",
],
              answer: 3,
              explanation:
                "ConfigMap is consumed as env variables (envFrom) or volume files (volumeMounts).\nBoth methods let the Pod access configuration data.\nVolume changes auto-update (with delay); env changes need Pod restart.",
            },
            {
              q: "A new Namespace is created in Kubernetes.\nWhich ServiceAccount exists in it by default?",
              options: [
              "kube-proxy",
              "system:node",
              "admin",
              "default",
],
              answer: 3,
              explanation:
                "ServiceAccount is a Pod identity. Every Namespace has 'default' assigned automatically.\nPods that don't specify a ServiceAccount get the default one.\nBest practice: create dedicated ServiceAccounts with minimal permissions.",
            },
            {
              q: "What does RBAC stand for?",
              options: [
              "Resource Based Auth Configuration: a cloud-level permission mechanism",
              "Recursive Binding Access Control: hierarchical binding management",
              "Runtime Binary Access Control: runtime security for binaries",
              "Role Based Access Control",
],
              answer: 3,
              explanation:
                "RBAC = Role Based Access Control: Kubernetes' permission system.\nThree building blocks: Roles (what's allowed), Subjects (who), Bindings (connect them).\nEnables fine-grained control. For example, view Pods but not delete them.",
            },
            {
              q: "What does LimitRange do in a Namespace?",
              options: [
              "Limits DNS queries from Pods within the Namespace",
              "Monitors logs and sends alerts when CPU exceeds a threshold",
              "Limits the number of Nodes that Pods in the Namespace can run on",
              "Sets default and maximum CPU/Memory for Pods and containers in a Namespace",
],
              answer: 3,
              explanation:
                "LimitRange sets default and max CPU/Memory per container in a Namespace.\nAuto-injects defaults and enforces min/max if containers don't specify them.\nWithout LimitRange, a single Pod can consume all Node resources.",
            },
            {
              q: "What does securityContext.runAsNonRoot: true do?",
              options: [
              "Encrypts the entire container filesystem",
              "Prevents the container from running as user 0 (root)",
              "Limits the container's CPU usage to the value set in limits",
              "Limits the container's network access to specific IP addresses",
],
              answer: 1,
              explanation:
                "runAsNonRoot: true prevents the container from running as root (UID 0).\nRoot in container + container escape = root access on the Node.\nReduces blast radius. Kubernetes rejects containers configured to run as root.",
            },
            {
              q: "What is the difference between resource requests and limits?",
              options: [
              "limits determine Scheduling priority; requests determine QoS class only",
              "requests and limits define the same values. They are always set equally",
              "requests define CPU and memory allocated when the Node is provisioned",
              "requests: the minimum the Scheduler guarantees; limits: the maximum the container can use",
],
              answer: 3,
              explanation:
                "requests = minimum the Scheduler guarantees. limits = maximum the container can use.\nNode is chosen only if it has enough free resources for the requests.\nExceed memory limit = OOMKill. Exceed CPU limit = throttling only.",
            },
        ],
      },
      medium: {
        theory: "RBAC: Role-Based Access Control.\n🔹 Role:\u200E הרשאות ב-Namespace אחד\n🔹 ClusterRole:\u200E הרשאות לכל ה-Cluster\n🔹 RoleBinding:\u200E קושר Role למשתמש או ל-ServiceAccount\n🔹 ServiceAccount:\u200E זהות ל-Pod בתוך ה-Cluster\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        theoryEn: "RBAC - Role-Based Access Control\n🔹 Role - defines permissions scoped to a single Namespace.\n🔹 ClusterRole - defines permissions that apply across the entire cluster.\n🔹 RoleBinding - binds a Role or ClusterRole to a user or ServiceAccount.\n🔹 ServiceAccount - provides an identity for a Pod to authenticate within the cluster.\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        questions: [
            {
              q: "מה ההבדל בין Role ל-ClusterRole?",
              options: [
              "Role מוגבל ל-Namespace, ClusterRole חל על כל ה-Cluster",
              "ClusterRole חל רק על Nodes, Role חל על כל שאר המשאבים ב-Cluster",
              "Role מעניק הרשאות רק ל-Users, ClusterRole מעניק הרשאות רק ל-ServiceAccounts",
              "Role ו-ClusterRole זהים בהיקף, אבל ClusterRole תומך ב-verbs נוספים כמו escalate",
],
              answer: 0,
              explanation:
                "Role מוגבל ל-Namespace ספציפי. ClusterRole חל על כל ה-Cluster.\nRole ב-prod לא מעניק גישה ב-staging. ClusterRole כולל Nodes, PVs ועוד.\nOption 1 שגוי: ClusterRole חל על כל המשאבים. Option 2 שגוי: שניהם חלים על Users, Groups, ו-ServiceAccounts. Option 3 שגוי: ההבדל הוא ב-scope ולא ב-verbs.\nניתן לקשור ClusterRole ל-Namespace בודד עם RoleBinding.",
            },
            {
              q: "מה תפקיד RoleBinding?",
              options: [
              "שכפול הרשאות Role אחד ל-Namespace אחר",
              "הגדרת כללי RBAC חדשים בתוך Namespace",
              "הסלמת הרשאות Role קיים לרמת ClusterRole",
              "חיבור בין Role למשתמש או ServiceAccount בתוך Namespace",
],
              answer: 3,
              explanation:
                "RoleBinding קושר Role ל-subject (User, Group, או ServiceAccount) ב-Namespace.\nללא RoleBinding, ה-Role לא נאכף על אף ישות.\nלגישה ברמת Cluster: ClusterRoleBinding.",
            },
            {
              q: "מה תפקיד ServiceAccount ב-Kubernetes?",
              options: [
              "זהות ל-Pod או תהליך בתוך ה-Cluster לאימות מול API server",
              "שם DNS פנימי שה-Service מקבל בתוך ה-Namespace",
              "token חד-פעמי שנוצר בעת Deployment חדש",
              "זהות למשתמש אנושי שמתחבר דרך kubectl",
],
              answer: 0,
              explanation:
                "ServiceAccount הוא זהות מכונה עבור Pods. לא למשתמשים אנושיים.\nKubernetes מזריק token אוטומטית ל-Pod לאימות מול API server.\nלכל Namespace יש ServiceAccount בשם default.",
            },
            {
              q: "נניח שיש לך Namespace עם ה-label הבא:\n`pod-security.kubernetes.io/enforce=restricted`\nב-Kubernetes, מה עושה Pod Security Admission?",
              options: [
              "Admission webhook שמאמת image signatures לפני deploy של Pod",
              "מנגנון מובנה שאוכף Pod Security Standards לפי labels ב-Namespace",
              "Controller שאוכף NetworkPolicy על תעבורה בין Pods בתוך Cluster",
              "Plugin שמנהל TLS certificates עבור Pods שרצים ב-Service Mesh",
],
              answer: 1,
              explanation:
                "PSA הוא controller מובנה שאוכף Pod Security Standards לפני ש-Pods מורשים לרוץ.\nמפעילים ע\"י label על Namespace. Kubernetes דוחה Pods שלא עומדים ברמה.\nמחליף את PodSecurityPolicy שהוסר ב-v1.25.",
            },
            {
              q: "מה תפקיד admission webhook ב-Kubernetes?",
              options: [
              "HTTP callback שמופעל לפני שמירת resource ב-etcd, לאימות או לשינוי",
              "HTTP handler שמנהל certificate rotation עבור ה-API server",
              "HTTP service שמבצע health checks על Pods לפני שמירתם ב-etcd",
              "HTTP endpoint שמסנכרן resources בין Clusters שונים",
],
              answer: 0,
              explanation:
                "Admission webhook מיירט בקשות ל-API server לפני שמירה ב-etcd.\nValidating:\u200E דוחה resources לא תקינים. Mutating:\u200E משנה resources לפני שמירה.\nכלים כמו OPA Gatekeeper ו-Kyverno עובדים כ-admission webhooks.",
            },
            {
              q: "מה ההבדל בין LimitRange ל-ResourceQuota?",
              options: [
              "LimitRange: CPU quota ל-Node. ResourceQuota: memory quota ל-Cluster",
              "LimitRange:\u200E מגביל מספר Pods. ResourceQuota:\u200E מגביל מספר Nodes",
              "LimitRange:\u200E ברירות מחדל per-container. ResourceQuota:\u200E מגבלות לכל ה-Namespace",
              "LimitRange:\u200E חל רק על Pods חדשים. ResourceQuota:\u200E חל רק על קיימים",
],
              answer: 2,
              explanation:
                "LimitRange = per-container defaults ומגבלות. ResourceQuota = מגבלות aggregate ל-Namespace.\nLimitRange מגן מ-container בודד. ResourceQuota מגן מצריכה כוללת.\nLimitRange = מיקרו. ResourceQuota = מאקרו.",
            },
            {
              q: "מה seccomp profile עושה?",
              options: [
              "מגביל את כמות ה-CPU שקונטיינר יכול לצרוך בכל Node",
              "מצפין את התעבורה בין קונטיינרים באותו Pod דרך localhost",
              "מגביל את ה-syscalls שקונטיינר יכול לבצע. מצמצם attack surface",
              "מגביל את ה-DNS queries שקונטיינר יכול לשלוח ל-CoreDNS",
],
              answer: 2,
              explanation:
                "seccomp מגביל אילו system calls קונטיינר יכול לבצע.\nLinux מציע 300+ syscalls, אבל רוב הקונטיינרים צריכים רק חלק קטן.\nseccompProfile.type: RuntimeDefault מיישם baseline מומלץ. מצמצם attack surface.",
            },
            {
              q: "כיצד מסנכרנים Secret מ-AWS Secrets Manager?",
              options: [
              "External Secrets Operator: SecretStore + ExternalSecret CR",
              "Vault Agent Injector: sidecar שמזריק secrets ישירות ל-Pod",
              "SOPS operator:\u200E מפענח קבצי YAML מוצפנים ויוצר K8s Secrets",
              "Sealed Secrets controller:\u200E מצפין Secrets ושומר אותם ב-Git",
],
              answer: 0,
              explanation:
                "ESO מסנכרן secrets מ-AWS/GCP/Vault אל K8s Secrets אוטומטית.\nSecretStore = חיבור ל-provider. ExternalSecret = מה לסנכרן.\nSecrets לא מנוהלים ידנית ולא נשמרים ב-git.",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between Role and ClusterRole?",
              options: [
              "ClusterRole applies only to Nodes; Role applies to all other resources in the cluster",
              "Role grants permissions only to Users; ClusterRole grants permissions only to ServiceAccounts",
              "Role is Namespace-scoped, ClusterRole is cluster-wide",
              "Role and ClusterRole have the same scope but ClusterRole supports additional verbs like escalate",
],
              answer: 2,
              explanation:
                "Role is Namespace-scoped. ClusterRole applies cluster-wide.\nRole in prod grants no access in staging. ClusterRole covers Nodes, PVs, etc.\nOption 0 is wrong: ClusterRole covers all resources. Option 1 is wrong: both apply to Users, Groups, and ServiceAccounts. Option 3 is wrong: the difference is scope, not verbs.\nClusterRole can be bound to a single Namespace via RoleBinding.",
            },
            {
              q: "What is a RoleBinding?",
              options: [
              "Binding a Role to a user/ServiceAccount within a Namespace",
              "Escalating a Role's permissions to ClusterRole level",
              "Replicating one Role's permissions to another Namespace",
              "Defining new RBAC rules within a Namespace",
],
              answer: 0,
              explanation:
                "RoleBinding connects a Role to a subject (User, Group, or ServiceAccount) in a Namespace.\nWithout RoleBinding, a Role has no effect on any identity.\nFor cluster-wide access, use ClusterRoleBinding.",
            },
            {
              q: "What is a ServiceAccount?",
              options: [
              "A one-time token generated during a new Deployment rollout",
              "An internal DNS name assigned to a Service within a Namespace",
              "An identity for a human user connecting via kubectl",
              "An identity for a Pod/process within the Cluster to authenticate with the API server",
],
              answer: 3,
              explanation:
                "ServiceAccount is a machine identity for Pods. Not for human users.\nKubernetes auto-mounts a token for Pod-to-API authentication.\nRBAC controls what actions the ServiceAccount can perform.",
            },
            {
              q: "Given a Namespace with the following label:\n`pod-security.kubernetes.io/enforce=restricted`\nWhat does Pod Security Admission do?",
              options: [
              "An admission webhook that validates image signatures before running Pods",
              "A built-in mechanism that enforces Pod Security Standards via Namespace labels",
              "A controller that enforces NetworkPolicy on traffic between Pods",
              "A plugin that manages TLS certificates for Pods in a Service Mesh",
],
              answer: 1,
              explanation:
                "PSA is a built-in controller enforcing Pod Security Standards before Pods can run.\nActivated via Namespace label. Kubernetes rejects non-compliant Pods.\nReplaced PodSecurityPolicy (removed v1.25). Levels: privileged/baseline/restricted.",
            },
            {
              q: "What is an admission webhook?",
              options: [
              "An HTTP handler that manages certificate rotation for the API server",
              "An HTTP endpoint that syncs resources between different Clusters",
              "An HTTP callback triggered before a resource is persisted to etcd, for validation or mutation",
              "An HTTP service that performs health checks on Pods before persisting to etcd",
],
              answer: 2,
              explanation:
                "Admission webhook intercepts API requests before changes are saved to etcd.\nValidating: rejects invalid resources. Mutating: modifies resources before saving.\nTools like OPA Gatekeeper and Kyverno work as admission webhooks.",
            },
            {
              q: "What is the difference between LimitRange and ResourceQuota?",
              options: [
              "LimitRange applies only to new Pods; ResourceQuota applies only to existing Pods",
              "LimitRange sets per-container defaults and limits; ResourceQuota sets aggregate limits for the whole Namespace",
              "LimitRange sets CPU quotas per Node; ResourceQuota sets memory quotas per Cluster",
              "LimitRange limits the number of Pods in a Namespace; ResourceQuota limits the number of Nodes in a Cluster",
],
              answer: 1,
              explanation:
                "LimitRange = per-container defaults and limits. ResourceQuota = aggregate limits for the Namespace.\nLimitRange protects from one container. ResourceQuota protects from total consumption.\nLimitRange = micro level. ResourceQuota = macro level.",
            },
            {
              q: "What does a seccomp profile do?",
              options: [
              "Limits the amount of CPU a container can consume on each Node",
              "Encrypts traffic between containers in the same Pod via localhost",
              "Restricts the syscalls a container can make. Reduces the attack surface",
              "Limits the DNS queries a container can send to CoreDNS",
],
              answer: 2,
              explanation:
                "seccomp restricts which system calls a container can make.\nLinux has 300+ syscalls but most containers need only a small subset.\nseccompProfile.type: RuntimeDefault applies the recommended baseline. Reduces attack surface.",
            },
            {
              q: "How do you sync a Secret from AWS Secrets Manager?",
              options: [
              "Sealed Secrets controller: encrypts Secrets and stores them in Git",
              "External Secrets Operator: SecretStore + ExternalSecret CR",
              "Vault Agent Injector: a sidecar that injects secrets directly into Pods",
              "SOPS operator: decrypts encrypted YAML files and creates K8s Secrets",
],
              answer: 1,
              explanation:
                "ESO syncs secrets from AWS/GCP/Vault into K8s Secrets automatically.\nSecretStore = provider connection. ExternalSecret = what to sync.\nSecrets never managed manually or stored in git.",
            },
        ],
      },
      hard: {
        theory: "אבטחה מתקדמת.\n🔹 Least Privilege:\u200E רק ההרשאות הנחוצות\n🔹 External Secrets Operator:\u200E מסנכרן מ-AWS/GCP/Azure\n🔹 Sealed Secrets:\u200E מצפין secrets ב-git\n🔹 Encryption at Rest:\u200E הצפנת etcd\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
        theoryEn: "Advanced Security\n🔹 Least privilege - grant only the minimum permissions required for each workload.\n🔹 External Secrets Operator - syncs secrets from external providers such as AWS, GCP, or Azure.\n🔹 Sealed Secrets - encrypts secrets so they can be safely stored in git.\n🔹 Encryption at rest - encrypts data stored in etcd to protect sensitive values on disk.\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
        questions: [
            {
              q: "מה עיקרון Least Privilege?",
              options: [
              "להשתמש ב-Pod Security Standards ברמת restricted בלבד",
              "לחסום כל תעבורת רשת בין Namespaces כברירת מחדל",
              "לתת רק את ההרשאות המינימליות הנחוצות לכל role",
              "לתת הרשאות ClusterRole לכל ServiceAccount כברירת מחדל",
],
              answer: 2,
              explanation:
                "כל ישות מקבלת רק את ההרשאות שהיא צריכה. לא יותר.\nלא לתת cluster-admin כשמספיק Role ב-Namespace אחד.\nאם ישות נפרצת, הרשאות מינימליות מגבילות את הנזק.",
            },
            {
              q: "מה Encryption at Rest?",
              options: [
              "הצפנת נתוני etcd ששומר secrets ו-resources על הדיסק",
              "הצפנת תעבורת רשת בין Pods דרך mTLS אוטומטי",
              "הצפנת קבצי log שנשמרים ב-Persistent Volumes",
              "הצפנת container images ב-Registry לפני deployment",
],
              answer: 0,
              explanation:
                "Secrets מאוחסנים ב-etcd כ-base64. לא מוצפנים כברירת מחדל.\nEncryption at Rest מפעיל AES-GCM לפני שמירה ב-etcd.\nגם מי שגונב את מסד ה-etcd לא יוכל לקרוא את ה-Secrets.",
            },
            {
              q: "מה Sealed Secrets מאפשר?",
              options: [
              "יצירת Kubernetes Secrets אוטומטית מ-environment variables בזמן deploy",
              "שיתוף Secrets מוצפנים בין Clusters שונים באמצעות מפתח משותף",
              "הצפנת תעבורת רשת בין Pods באמצעות מפתחות שנשמרים ב-etcd",
              "שמירת Secrets מוצפנים ב-git בבטחה כ-SealedSecret resources",
],
              answer: 3,
              explanation:
                "Sealed Secrets מצפין Secret ל-SealedSecret עם המפתח הציבורי של ה-Cluster.\nה-SealedSecret המוצפן בטוח לשמירה ב-git. רק ה-controller עם המפתח הפרטי מפענח.\nOption 1 שגוי: SealedSecret מ-Cluster A לא ניתן לפענוח ב-Cluster B.\nOption 0 שגוי: Sealed Secrets לא יוצר secrets אוטומטית מ-env vars.\nOption 2 שגוי: Sealed Secrets לא מצפין תעבורת רשת.",
            },
            {
              q: "מה שלוש רמות Pod Security Standards?",
              options: [
              "low/medium/high",
              "none/basic/full",
              "privileged/baseline/restricted",
              "open/limited/closed",
],
              answer: 2,
              explanation:
                "privileged:\u200E ללא הגבלות. baseline:\u200E חוסם שימושים מסוכנים (hostPID, privileged). restricted:\u200E הכי מחמירה.\nשלוש הרמות מסודרות מהכי פתוחה לסגורה ביותר.\nrestricted דורשת runAsNonRoot, drop ALL capabilities, ו-seccomp. best practice ל-production.",
            },
            {
              q: "מה תפקיד OPA/Gatekeeper ב-Kubernetes?",
              options: [
              "controller שמנהל Pod autoscaling לפי custom metrics",
              "operator שמנהל certificate lifecycle עבור Ingress resources",
              "admission controller מובנה שמאמת resource quotas לפני יצירה",
              "Open Policy Agent:\u200E מנגנון policy-as-code לאכיפת כללים ב-K8s",
],
              answer: 3,
              explanation:
                "OPA Gatekeeper הוא admission webhook שאוכף policies מותאמות על כל resource ב-Cluster.\nPolicies נכתבות ב-Rego ומאפשרות כללים שרירותיים. בניגוד ל-PSA עם רמות קבועות.\nKyverno הוא אלטרנטיבה עם תחביר YAML במקום Rego.",
            },
            {
              q: "ה-Pod מקבל את השגיאה הבאה:\n\n```\nError: pods is forbidden:\nUser 'system:serviceaccount:default:my-sa'\ncannot list resource 'pods' in namespace 'prod'\n```\n\nמה הפתרון הנכון?",
              options: [
              "לעבור ל-default ServiceAccount במקום my-sa",
              "להוסיף ClusterRoleBinding עם הרשאת cluster-admin",
              "ליצור Role עם הרשאת list pods ולקשור אותו ל-my-sa",
              "למחוק את ה-ServiceAccount וליצור חדש במקומו",
],
              answer: 2,
              explanation:
                "ל-my-sa אין הרשאת list pods ב-namespace prod. RBAC חוסם.\nליצור Role עם הרשאת list pods ו-RoleBinding שמקשר ל-my-sa.\n• מחיקת SA לא פותרת חוסר הרשאות • cluster-admin סיכון אבטחי • default SA גם ללא הרשאות.\nב-RBAC כל גישה חייבת Role + RoleBinding מפורשים.",
            },
            {
              q: "ניסיון לפרוס Deployment נכשל עם השגיאה:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nמה קורה?",
              options: [
              "ה-Namespace שצוין ב-Deployment לא קיים ב-Cluster",
              "Admission webhook חסם את ה-image כי הוא לא מ-registry מאושר",
              "הרשאות RBAC חוסמות יצירת Deployment ב-Namespace",
              "ה-Kubernetes API server קרס ולא מגיב לבקשות",
],
              answer: 1,
              explanation:
                "Kyverno admission webhook חוסם images שלא מ-gcr.io/. policy-as-code.\nלשנות את ה-image למקור מ-gcr.io/ או לעדכן את ה-policy.\n• API crash = לא הייתה הודעת שגיאה • RBAC = \"forbidden\" לא \"webhook denied\" • Namespace missing = שגיאה אחרת.\nAdmission webhook רץ לפני שמירה ב-etcd ויכול לחסום כל create/update.",
            },
            {
              q: "ה-PSA מוגדר עם enforce=restricted. Deployment נדחה:\n\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\n\nמה מוסיפים ל-spec של ה-container?",
              options: [
              "securityContext: {privileged: true, runAsUser: 0, capabilities: {add: [NET_ADMIN]}}",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "securityContext: {capabilities: {drop: [ALL]}, runAsGroup: 0, privileged: false}",
              "securityContext: {readOnlyRootFilesystem: true, runAsUser: 1000, hostNetwork: true}",
],
              answer: 1,
              explanation:
                "restricted PSA דורשת הגדרות אבטחה מפורשות בכל container.\nחובה להוסיף allowPrivilegeEscalation: false, runAsNonRoot: true, ו-seccompProfile.\nprivileged: true הוא ההפך. יחמיר את הבעיה במקום לפתור.",
            },
        ],
        questionsEn: [
            {
              q: "What is the Least Privilege principle?",
              options: [
              "Use Pod Security Standards at the restricted level only",
              "Grant only the minimum necessary permissions for each role",
              "Grant ClusterRole permissions to every ServiceAccount by default",
              "Block all network traffic between Namespaces by default",
],
              answer: 1,
              explanation:
                "Every entity gets only the exact permissions it needs. Nothing more.\nPrefer a scoped Role in one Namespace over cluster-admin.\nIf compromised, minimal permissions limit the blast radius.",
            },
            {
              q: "What is Encryption at Rest?",
              options: [
              "Encrypting log files stored on Persistent Volumes",
              "Encrypting etcd data that stores secrets and resources on disk",
              "Encrypting container images in the Registry before deployment",
              "Encrypting network traffic between Pods via automatic mTLS",
],
              answer: 1,
              explanation:
                "Secrets are stored in etcd as base64. Not encrypted by default.\nEncryption at Rest adds AES-GCM encryption before writing to etcd disk.\nEven if an attacker exfiltrates etcd data, Secrets remain unreadable without the encryption key.",
            },
            {
              q: "What does Sealed Secrets allow?",
              options: [
              "Sharing encrypted Secrets between different Clusters using a shared key",
              "Storing encrypted secrets in git safely as SealedSecret resources",
              "Auto-creating Kubernetes Secrets from environment variables at deploy time",
              "Encrypting network traffic between Pods using keys stored in etcd",
],
              answer: 1,
              explanation:
                "Sealed Secrets encrypts a Secret into a SealedSecret using the cluster's public key.\nThe SealedSecret is safe to commit to git. Only the cluster's controller can decrypt it.\nOption 0 is wrong: a SealedSecret from Cluster A cannot be decrypted by Cluster B.\nOption 2 is wrong: Sealed Secrets does not auto-create secrets from env vars.\nOption 3 is wrong: Sealed Secrets does not encrypt network traffic.",
            },
            {
              q: "What are the three Pod Security Standard levels?",
              options: [
              "low/medium/high",
              "none/basic/full",
              "privileged/baseline/restricted",
              "open/limited/closed",
],
              answer: 2,
              explanation:
                "privileged: no restrictions. baseline: blocks dangerous practices (hostPID, privileged). restricted: strictest.\nThe three levels go from most permissive to most secure.\nrestricted requires runAsNonRoot, drop ALL capabilities, and seccomp. Production best practice.",
            },
            {
              q: "What is OPA/Gatekeeper?",
              options: [
              "An operator that manages certificate lifecycle for Ingress resources",
              "Open Policy Agent: policy-as-code enforcement for Kubernetes",
              "A controller that manages Pod autoscaling based on custom metrics",
              "A built-in admission controller that validates resource quotas before creation",
],
              answer: 1,
              explanation:
                "OPA Gatekeeper is an admission webhook that enforces custom policies on every resource.\nPolicies are written in Rego and allow arbitrary rules. Unlike PSA's fixed levels.\nKyverno is an alternative with YAML-based policy syntax instead of Rego.",
            },
            {
              q: "A Pod receives the following error:\n\n```\nError: pods is forbidden:\nUser 'system:serviceaccount:default:my-sa'\ncannot list resource 'pods' in namespace 'prod'\n```\n\nWhat is the correct fix?",
              options: [
              "Switch to the default ServiceAccount instead of my-sa",
              "Create a Role with list pods permission and bind it to my-sa",
              "Add a ClusterRoleBinding with cluster-admin permissions",
              "Delete the ServiceAccount and create a new one",
],
              answer: 1,
              explanation:
                "my-sa lacks list pods permission in namespace prod. RBAC blocks the request.\nCreate a Role with list pods permission and a RoleBinding to my-sa.\n• Deleting SA doesn't fix missing permissions • cluster-admin is a security risk • default SA also has no permissions.\nIn RBAC, every API access requires explicit Role + RoleBinding.",
            },
            {
              q: "A Deployment fails to deploy with the error:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nWhat is happening?",
              options: [
              "The Kubernetes API server has crashed and is not responding",
              "The Namespace specified in the Deployment does not exist in the Cluster",
              "RBAC permissions prevent creating a Deployment in this Namespace",
              "An Admission webhook blocked the image because it is not from an approved registry",
],
              answer: 3,
              explanation:
                "Kyverno admission webhook blocks images not from gcr.io/. Policy-as-code enforcement.\nChange the image to one from gcr.io/ or update the Kyverno policy.\n• API crash = no structured error message • RBAC = \"forbidden\" not \"webhook denied\" • Missing namespace = different error.\nAdmission webhooks run before etcd save and can block any create/update request.",
            },
            {
              q: "PSA is set to enforce=restricted. A Deployment is rejected:\n\nPod violates PodSecurity 'restricted:latest': allowPrivilegeEscalation != false\n\nWhat must you add to the container spec?",
              options: [
              "securityContext: {privileged: true, runAsUser: 0, capabilities: {add: [NET_ADMIN]}}",
              "securityContext: {allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile: {type: RuntimeDefault}}",
              "securityContext: {capabilities: {drop: [ALL]}, runAsGroup: 0, privileged: false}",
              "securityContext: {readOnlyRootFilesystem: true, runAsUser: 1000, hostNetwork: true}",
],
              answer: 1,
              explanation:
                "restricted PSA mandates explicit security hardening in every container.\nMust set allowPrivilegeEscalation: false, runAsNonRoot: true, and seccompProfile.\nprivileged: true is the opposite. It would further violate the policy.",
            },
        ],
      },
    },
  },
  {
    id: "storage",
    icon: "💾",
    name: "Storage & Package Management",
    color: "#10B981",
    description: "PersistentVolumes · StorageClass · Helm · Operators",
    descriptionEn: "PersistentVolumes · StorageClass · Helm · Operators",
    levels: {
      easy: {
        theory: "PersistentVolumes ו-Helm בסיסי.\n🔹 PV:\u200E יחידת אחסון ב-Cluster (admin מגדיר)\n🔹 PVC:\u200E בקשה לאחסון מ-Pod\n🔹 Helm Chart:\u200E חבילה של Kubernetes manifests עם templates\n🔹 helm install:\u200E מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
        theoryEn: "PersistentVolumes and Helm Basics\n🔹 PersistentVolume (PV) - a storage resource in the cluster, provisioned by an administrator.\n🔹 PersistentVolumeClaim (PVC) - a request by a Pod for a specific amount of storage.\n🔹 Helm Chart - a package of Kubernetes manifests with configurable templates.\n🔹 helm install - deploys a Chart to the cluster and creates a named Release.\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
        questions: [
            {
              q: "מה ההבדל בין PV ל-PVC?",
              options: [
              "PV מוגדר בתוך Pod spec; PVC מוגדר ברמת Namespace",
              "PV נוצר אוטומטית ע״י kubelet; PVC נוצר ע״י ה-Scheduler",
              "PV הוא משאב אחסון ב-Cluster; PVC הוא בקשה לאחסון מ-Pod",
              "PV הוא volume זמני שנמחק כשה-Pod נגמר; PVC הוא volume קבוע",
],
              answer: 2,
              explanation:
                "PV הוא יחידת אחסון שה-admin מגדיר: גודל, access modes, ו-storage backend.\nPVC היא הבקשה של ה-Pod לאחסון.\nKubernetes מחבר אוטומטית PVC ל-PV שמתאים לדרישות.",
            },
            {
              q: "מה AccessMode ReadWriteOnce?",
              options: [
              "כתיבה מ-Node אחד בלבד",
              "קריאה וכתיבה מ-node אחד בו-זמנית",
              "קריאה בלבד",
              "קריאה מכל ה-Nodes",
],
              answer: 1,
              explanation:
                "RWO מאפשר mount לקריאה וכתיבה מ-Node אחד בלבד. מתאים לרוב ה-databases.\nRWX מאפשר כמה Nodes במקביל (דורש NFS/EFS).\nROX:\u200E קריאה בלבד ממספר Nodes.",
            },
            {
              q: "מה תפקיד Helm Chart?",
              options: [
              "שכבת רשת וירטואלית שמחברת Pods ב-Cluster דרך CNI plugin",
              "Docker image מותאם שכולל Kubernetes manifests בתוך ה-layers שלו",
              "CLI wrapper מעל kubectl שמוסיף ניהול גרסאות ל-YAML files",
              "חבילה של Kubernetes manifests עם templates וערכי ברירת מחדל",
],
              answer: 3,
              explanation:
                "Helm הוא package manager ל-Kubernetes. כמו apt או npm.\nChart הוא חבילה של YAML templates עם ערכי ברירת מחדל ב-values.yaml.\nבמקום לנהל עשרות קבצי YAML, מתקינים Chart אחד ומגדירים עם values.",
            },
            {
              q: "מה הפקודה להתקנת Helm Chart?",
              options: [
              "helm upgrade",
              "helm template",
              "helm install",
              "helm create",
],
              answer: 2,
              explanation:
                "helm install מתקין Chart ויוצר Release שנשמר כ-Secret ב-Cluster.\nhelm upgrade משנה Release קיים. helm template מרנדר YAML בלי להתקין. helm create יוצר scaffold של Chart חדש.\nאפשר לעקוף ערכים עם --set key=value או -f myvalues.yaml.",
            },
            {
              q: "מה Volume מסוג emptyDir?",
              options: [
              "Volume קבוע שנשמר גם אחרי מחיקת ה-Pod ונגיש מכל Node",
              "Volume שמותאם ל-databases ומספק replication בין Pods",
              "Volume ריק שנוצר עם ה-Pod ונמחק לחלוטין כשה-Pod נמחק",
              "Volume שמאחסן logs בלבד ומתנקה אוטומטית לפי retention policy",
],
              answer: 2,
              explanation:
                "emptyDir נוצר ריק כש-Pod מתזמן ל-Node ונמחק לחלוטין עם ה-Pod.\nשימוש נפוץ: שיתוף קבצים זמניים בין קונטיינרים באותו Pod.\nאפשר להגדיר medium: Memory ליצירת tmpfs ב-RAM.",
            },
            {
              q: "מה תפקיד StorageClass ב-Kubernetes?",
              options: [
              "סוג Service שמנתב traffic לפי storage labels על Pods",
              "סוג Pod מיוחד שמותאם לעומסי עבודה שדורשים אחסון מתמיד",
              "מנגנון שמקטגר logs לפי רמת חומרה ב-Namespace",
              "הגדרת provisioner שיוצר דיסקים דינמיים כשנוצר PVC",
],
              answer: 3,
              explanation:
                "StorageClass מגדיר ל-Kubernetes כיצד ליצור דיסקים באופן דינמי.\nכולל provisioner (כמו aws-ebs), reclaim policy, וסוג דיסק.\nכש-PVC מציין storageClassName, נוצר PV ודיסק אמיתי אוטומטית.",
            },
            {
              q: "מה קורה לנתונים ב-emptyDir כש-Pod נמחק?",
              options: [
              "נמחקים לחלוטין כשה-Pod נמחק או מועבר ל-Node אחר",
              "נשמרים לתמיד על ה-Node גם אחרי מחיקת ה-Pod",
              "מועברים אוטומטית ל-PersistentVolume לפני מחיקת ה-Pod",
              "מגובים אוטומטית ל-object storage לפני שה-Pod נמחק",
],
              answer: 0,
              explanation:
                "emptyDir שורד restarts של קונטיינרים בתוך אותו Pod.\nברגע שה-Pod נמחק או מועבר ל-Node אחר, הנתונים נמחקים לחלוטין.",
            },
            {
              q: "מה תפקיד values.yaml ב-Helm Chart?",
              options: [
              "קובץ שמגדיר כללי RBAC עבור ה-Release שנוצר מ-Chart",
              "קובץ שמכיל secrets מוצפנים שה-Chart משתמש בהם בזמן deploy",
              "קובץ שמכיל ברירות מחדל לכל ה-template variables של Chart",
              "קובץ שמתעד את היסטוריית ה-deployments של Chart ב-Cluster",
],
              answer: 2,
              explanation:
                "values.yaml מכיל ברירות מחדל לכל ה-template variables של Chart.\nאפשר לעקוף ערכים עם --set key=value או להחליף קובץ עם -f my-values.yaml.\nכך Chart אחד משרת סביבות שונות (dev, staging, production).",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between PV and PVC?",
              options: [
              "PV is defined inside the Pod spec; PVC is defined at the Namespace level",
              "PV is a storage resource in the Cluster; PVC is a request for storage from a Pod",
              "PV is auto-created by the kubelet; PVC is created by the Scheduler",
              "PV is a temporary volume deleted when the Pod ends; PVC is a permanent volume",
],
              answer: 1,
              explanation:
                "PV is a piece of real storage provisioned in the cluster (EBS, NFS, local drive).\nPVC is a request from a Pod asking for storage with specific access requirements.\nKubernetes automatically matches a PVC to a suitable PV.",
            },
            {
              q: "What is AccessMode ReadWriteOnce?",
              options: [
              "Read and write from one node at a time",
              "Write from one Node only",
              "Read from all Nodes",
              "Read-only",
],
              answer: 0,
              explanation:
                "RWO allows read/write mount from a single Node at a time. Suitable for most databases.\nRWX allows multiple Nodes simultaneously (requires NFS or EFS).\nROX: read-only access from multiple Nodes.",
            },
            {
              q: "What is a Helm Chart?",
              options: [
              "A Docker image that bundles Kubernetes manifests inside its layers",
              "A package of Kubernetes manifests with templates and configurable defaults",
              "A virtual network layer that connects Pods in a Cluster via a CNI plugin",
              "A CLI wrapper around kubectl that adds version management for YAML files",
],
              answer: 1,
              explanation:
                "Helm is Kubernetes' package manager. Like apt or npm.\nA Chart bundles YAML templates with configurable defaults in values.yaml.\nInstead of managing dozens of YAML files, install one Chart and configure with values.",
            },
            {
              q: "What command installs a Helm Chart?",
              options: [
              "helm upgrade",
              "helm template",
              "helm install",
              "helm create",
],
              answer: 2,
              explanation:
                "helm install creates a Release stored as a Secret in the cluster.\nhelm upgrade modifies an existing Release. helm template renders YAML without installing. helm create scaffolds a new Chart.\nOverride values with --set key=value or -f myvalues.yaml.",
            },
            {
              q: "What is emptyDir?",
              options: [
              "A temporary Volume created empty with the Pod and deleted when the Pod is removed",
              "A persistent Volume that survives Pod deletion and is accessible from any Node",
              "A Volume designed for log files that auto-cleans based on a retention policy",
              "A Volume optimised for databases that provides replication between Pods",
],
              answer: 0,
              explanation:
                "emptyDir is created empty when a Pod is scheduled and deleted entirely with the Pod.\nCommon use: sharing temporary files between containers in the same Pod.\nSet medium: Memory to create a RAM-backed tmpfs for higher performance.",
            },
            {
              q: "What is a StorageClass?",
              options: [
              "Defines a provisioner that creates disks dynamically when a PVC is submitted",
              "A special Pod type optimised for workloads that require persistent storage",
              "A Service type that routes traffic based on storage labels on Pods",
              "A mechanism that categorises logs by severity level within a Namespace",
],
              answer: 0,
              explanation:
                "StorageClass tells Kubernetes how to create storage on demand.\nIt names a provisioner (e.g., AWS EBS, GCP PD) that creates real disks automatically.\nWhen a PVC references a StorageClass, a PV and disk are created without manual admin work.",
            },
            {
              q: "What happens to emptyDir data when a Pod is deleted?",
              options: [
              "Deleted permanently (but survives container restarts within the same Pod)",
              "Automatically backed up to object storage",
              "Persisted forever on the Node",
              "Moved to a PV for reuse",
],
              answer: 0,
              explanation:
                "emptyDir survives container restarts within the same Pod.\nOnce the Pod is deleted or rescheduled to another Node, the data is gone permanently.",
            },
            {
              q: "What is helm values.yaml?",
              options: [
              "A file that defines RBAC rules for the Release created by the Chart",
              "A file that records the deployment history of the Chart in the Cluster",
              "A file that stores encrypted secrets used by the Chart during deployment",
              "The default values file for all template variables in the Chart",
],
              answer: 3,
              explanation:
                "values.yaml contains default values for all Chart template variables.\nOverride with --set key=value or supply a different file with -f my-values.yaml.\nOne Chart can serve multiple environments (dev, staging, production) with different values.",
            },
        ],
      },
      medium: {
        theory: "StorageClass ו-Helm Values.\n🔹 StorageClass:\u200E מגדיר סוג אחסון ו-provisioner\n🔹 Dynamic Provisioning:\u200E PV נוצר אוטומטית עם PVC\n🔹 Reclaim Policy Delete:\u200E מוחק PV כש-PVC נמחק\n🔹 helm upgrade / --set:\u200E עדכון ושינוי values\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1",
        theoryEn: "StorageClass and Helm Values\n🔹 StorageClass - defines the type of storage and the provisioner used to create it.\n🔹 Dynamic provisioning - a PersistentVolume is created automatically when a PVC is submitted.\n🔹 Reclaim policy - the Delete policy removes the PV automatically when its PVC is deleted.\n🔹 helm upgrade - updates a Release with new values using --set or a values file.\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1",
        questions: [
            {
              q: "מה משמעות Dynamic Provisioning ב-Kubernetes?",
              options: [
              "הקצאת CPU דינמית ל-Pods לפי עומס שמדווח מ-metrics-server",
              "שינוי גודל אוטומטי של PVC קיים לפי צריכת הדיסק בפועל",
              "PV ודיסק פיזי נוצרים אוטומטית כשנוצר PVC עם StorageClass",
              "העברת Pod אוטומטית ל-Node אחר כשה-Node הנוכחי מתמלא",
],
              answer: 2,
              explanation:
                "כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית.\nOption 1 שגוי: Dynamic Provisioning הוא יצירה, לא שינוי גודל (זה Volume expansion). Option 0 שגוי: CPU allocation נעשית דרך requests/limits. Option 3 שגוי: Pod migration קשור ל-scheduling, לא ל-storage.\nזו הגישה הסטנדרטית בכל Cluster ענן.",
            },
            {
              q: "מה Reclaim Policy Delete?",
              options: [
              "שומר את ה-PV והנתונים גם אחרי מחיקת ה-PVC לשימוש עתידי",
              "מעביר את הנתונים ל-backup אוטומטי לפני מחיקת ה-PV",
              "מוחק את ה-PVC בלבד ומשאיר את ה-PV והדיסק הפיזי קיימים",
              "מוחק את ה-PV ואת הדיסק הפיזי כשה-PVC נמחק",
],
              answer: 3,
              explanation:
                "כשה-PVC נמחק, גם ה-PV והדיסק הפיזי (EBS, GCP PD) נמחקים אוטומטית.\nOption 0 מתאר את Retain policy, לא Delete. Option 1 שגוי: אין backup אוטומטי. Option 2 שגוי: Delete מוחק הכל.\nRetain לעומת זאת משמר את הנתונים גם אחרי מחיקת ה-PVC.",
            },
            {
              q: "איך משנים Helm value מה-command line?",
              options: [
              "helm template --set key=value",
              "helm rollback --set key=value",
              "helm install --set key=value",
              "helm show values --set key=value",
],
              answer: 2,
              explanation:
                "--set key=value עוקף ערכים מ-values.yaml בזמן install/upgrade.\nhelm template רק מרנדר YAML בלי להתקין. helm rollback לא מקבל --set. helm show values מציג ערכים בלבד.\nלשינויים מרובים עדיף --values (-f) עם קובץ YAML מותאם.",
            },
            {
              q: "כיצד מרחיבים PVC?",
              options: [
              "מגדירים allowVolumeExpansion: true ב-StorageClass ומגדילים spec.resources.requests.storage",
              "יוצרים PVC שני ומשתמשים ב-kubectl merge-pvc לאיחוד הנפחים",
              "מוחקים את ה-PVC ויוצרים חדש עם גודל גדול יותר באותו StorageClass",
              "משנים את ה-PV הקיים ישירות ומעדכנים את capacity.storage בו",
],
              answer: 0,
              explanation:
                "ה-StorageClass חייב להגדיר allowVolumeExpansion: true.\nאז מגדילים spec.resources.requests.storage ב-PVC וה-provisioner מרחיב את הדיסק.\nהקטנה לא נתמכת, ובחלק מה-backends נדרש Pod restart.",
            },
            {
              q: "מה helm template עושה?",
              options: [
              "יוצר Helm Chart חדש מתוך תבנית scaffold מובנית",
              "שומר snapshot של ה-Chart הנוכחי לצורך rollback עתידי",
              "מעדכן את ה-values.yaml של Chart קיים מ-remote repository",
              "מרנדר את ה-Chart ל-YAML בלי להתקין אותו. ל-pipelines ו-dry-run",
],
              answer: 3,
              explanation:
                "helm template מרנדר Chart ל-YAML גולמי בלי להתקין שום דבר ב-Cluster.\nשימושי ל-CI/CD pipelines, debug, ו-GitOps שדורש YAML מפורש ב-git.",
            },
            {
              q: "מה עושה helm rollback?",
              options: [
              "מוחק את ה-Release לחלוטין ומסיר את כל המשאבים שנוצרו",
              "מעדכן את ה-Chart לגרסה חדשה ומפעיל helm upgrade אוטומטית",
              "מאפס את כל ה-values לברירות מחדל של ה-Chart",
              "מחזיר Release ל-revision קודמת מתוך ההיסטוריה",
],
              answer: 3,
              explanation:
                "helm rollback מחזיר Release ל-revision ספציפי מתוך ההיסטוריה.\nOption 0 מתאר helm uninstall. Option 1 מתאר helm upgrade. Option 2 שגוי: rollback לא מאפס values, אלא מחזיר ל-revision ספציפי.\nהרצת helm history מציגה את כל ה-revisions עם תאריכים וסטטוסים.\nrollback הוא למעשה upgrade חדש עם manifests ישנים. נוצר revision חדש.",
            },
            {
              q: "מה אומר PVC בסטטוס Pending?",
              options: [
              "ה-StorageClass מבצע replication ל-Zone משני לפני binding",
              "ה-PVC ממתין לסיום backup של Volume קיים לפני mount",
              "PV תואם לא נמצא. בגלל AccessMode שגוי, storage לא מספיק, או StorageClass שגוי",
              "ה-PVC נמצא בתהליך הצפנה לפני שהוא זמין ל-Pod",
],
              answer: 2,
              explanation:
                "PVC Pending = לא נמצא PV מתאים.\nהרצת kubectl describe pvc תראה מה חסר.\nסיבות נפוצות: StorageClass לא קיים, AccessMode לא תואם, או capacity לא מספיק.",
            },
            {
              q: "כיצד PV ו-PVC מתחברים?",
              options: [
              "לפי שם PVC בלבד, שחייב להיות זהה לשם ה-PV",
              "לפי ה-Node שה-Pod מתוזמן עליו, כך שה-PV נוצר באותו Node",
              "לפי ה-Namespace של ה-Pod, כך שכל PV שייך ל-Namespace ספציפי",
              "לפי accessMode, storage capacity, ו-storageClassName תואמים",
],
              answer: 3,
              explanation:
                "K8s מחבר PVC ל-PV לפי storageClassName, accessModes, ו-capacity (PV >= PVC).\nOption 0 שגוי: שם לא חייב להתאים. Option 1 שגוי: PV הוא cluster-level resource. Option 2 שגוי: PV לא משויך ל-Namespace.\nלאחר binding הם קשורים עד שאחד נמחק.",
            },
        ],
        questionsEn: [
            {
              q: "What is Dynamic Provisioning?",
              options: [
              "Automatic Pod migration to another Node when the current Node runs out of disk",
              "PV and physical disk created automatically when a PVC with StorageClass is submitted",
              "Dynamic CPU allocation to Pods based on real-time load reported by metrics-server",
              "Automatic resizing of an existing PVC based on actual disk consumption",
],
              answer: 1,
              explanation:
                "When a PVC references a StorageClass, the provisioner creates a PV and real disk automatically.\nOption 3 is wrong: Dynamic Provisioning is creation, not resizing (that is Volume expansion). Option 2 is wrong: CPU allocation uses requests/limits. Option 0 is wrong: Pod migration is a scheduling concern.\nThis is the standard approach in all cloud-hosted Kubernetes clusters.",
            },
            {
              q: "What does Reclaim Policy Delete do?",
              options: [
              "Moves data to an automatic backup before deleting the PV",
              "Retains the PV and its data even after the PVC is deleted for future reuse",
              "Deletes only the PVC and leaves the PV and physical disk intact",
              "Deletes the PV and the physical disk when the PVC is deleted",
],
              answer: 3,
              explanation:
                "When the PVC is deleted, both the PV and the physical disk (EBS, GCP PD) are deleted automatically.\nOption 1 describes Retain policy, not Delete. Option 0 is wrong: there is no automatic backup. Option 2 is wrong: Delete removes everything.\nFor databases, use Retain instead to preserve data after PVC deletion.",
            },
            {
              q: "How do you change a Helm value from the CLI?",
              options: [
              "helm template --set key=value",
              "helm rollback --set key=value",
              "helm install --set key=value",
              "helm show values --set key=value",
],
              answer: 2,
              explanation:
                "--set key=value overrides values from values.yaml at install/upgrade time.\nhelm template only renders YAML without installing. helm rollback does not accept --set. helm show values only displays values.\nFor multiple overrides, use --values (-f) with a custom YAML file.",
            },
            {
              q: "How do you expand a PVC?",
              options: [
              "Edit the existing PV directly and update its capacity.storage field",
              "Create a second PVC and use kubectl merge-pvc to combine the volumes",
              "Set allowVolumeExpansion: true in the StorageClass then increase spec.resources.requests.storage",
              "Delete the PVC and recreate it with a larger size in the same StorageClass",
],
              answer: 2,
              explanation:
                "The StorageClass must have allowVolumeExpansion: true.\nThen increase spec.resources.requests.storage in the PVC and the provisioner resizes the disk.\nShrinking is not supported, and some backends require a Pod restart.",
            },
            {
              q: "What does helm template do?",
              options: [
              "Renders the Chart to YAML without installing. For pipelines and dry-runs",
              "Updates the values.yaml of an existing Chart from a remote repository",
              "Creates a new Helm Chart from a built-in scaffold template",
              "Saves a snapshot of the current Chart for future rollback",
],
              answer: 0,
              explanation:
                "helm template renders a Chart to raw YAML without installing anything to the cluster.\nUseful for CI/CD pipelines, debugging, and GitOps workflows that need explicit YAML in git.",
            },
            {
              q: "What does helm rollback do?",
              options: [
              "Updates the Chart to a new version and runs helm upgrade automatically",
              "Resets all values to the Chart's default values.yaml configuration",
              "Deletes the Release completely and removes all created resources",
              "Reverts a Release to a previous revision from its history",
],
              answer: 3,
              explanation:
                "helm rollback reverts a Release to a specific revision from its history.\nOption 2 describes helm uninstall. Option 0 describes helm upgrade. Option 1 is wrong: rollback does not reset values, it restores a specific revision.\nhelm history lists all revisions with timestamps and statuses.\nA rollback is technically a new upgrade using old manifests. It creates a new revision number.",
            },
            {
              q: "What does a PVC in Pending status mean?",
              options: [
              "The PVC is being encrypted before it becomes available to a Pod",
              "The PVC is waiting for an existing Volume backup to complete before mounting",
              "The StorageClass is replicating to a secondary Zone before binding",
              "No matching PV found. Due to wrong AccessMode, insufficient storage, or wrong StorageClass",
],
              answer: 3,
              explanation:
                "PVC Pending means no matching PV was found.\nRun kubectl describe pvc to see what's missing.\nCommon causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
            },
            {
              q: "How do a PV and PVC bind?",
              options: [
              "By the Node the Pod is scheduled on, so the PV is created on the same Node",
              "By matching accessMode, storage capacity, and storageClassName",
              "By the Namespace of the Pod, so each PV belongs to a specific Namespace",
              "By name only, where the PVC name must match the PV name exactly",
],
              answer: 1,
              explanation:
                "K8s binds a PVC to a PV by matching storageClassName, accessModes, and capacity (PV >= PVC).\nOption 3 is wrong: names don't need to match. Option 0 is wrong: PV is a cluster-level resource. Option 2 is wrong: PVs are not namespaced.\nAfter binding they are locked together until one is deleted.",
            },
        ],
      },
      hard: {
        theory: "אחסון ו-Helm מתקדם.\n🔹 ReadWriteMany (RWX):\u200E קריאה וכתיבה ממספר Nodes (NFS, EFS)\n🔹 CSI:\u200E Container Storage Interface, סטנדרט ל-drivers\n🔹 VolumeSnapshot:\u200E גיבוי נקודתי\n🔹 Helm Hooks:\u200E פעולות בשלבים: pre-install, post-upgrade\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        theoryEn: "Advanced Storage and Helm\n🔹 ReadWriteMany (RWX) - allows read/write access from multiple Nodes using shared storage such as NFS or EFS.\n🔹 CSI - Container Storage Interface, a standard API for integrating storage drivers.\n🔹 VolumeSnapshot - creates a point-in-time backup of a PersistentVolume.\n🔹 Helm Hooks - run actions at lifecycle stages such as pre-install or post-upgrade.\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        questions: [
            {
              q: "מה תפקיד CSI ב-Kubernetes?",
              options: [
              "Cluster Sync Interface:\u200E סטנדרט לסנכרון נתונים בין Clusters",
              "Container Storage Interface:\u200E סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers ל-K8s",
              "Cloud Storage Integration:\u200E שכבת חיבור ל-cloud object storage כמו S3",
              "Container Security Interface:\u200E סטנדרט לסריקת images ואכיפת מדיניות אבטחה",
],
              answer: 1,
              explanation:
                "CSI הוא סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers עבור Kubernetes.\nכל vendor שולח CSI driver משלו (AWS EBS, Azure Disk, Ceph) כ-DaemonSet ב-Cluster.\nזה מאפשר עדכונים ללא תלות בגרסת Kubernetes.",
            },
            {
              q: "מה תפקיד Helm Hook?",
              options: [
              "כלי debug שמאפשר לבדוק templates לפני התקנת Chart",
              "סוג מיוחד של Chart שמכיל רק dependencies ולא templates",
              "מנגנון חלופי ל-Rollback שמחזיר Release לגרסה קודמת",
              "פעולה (Job) שרצה בשלב מסוים במחזור חיי Release",
],
              answer: 3,
              explanation:
                "Hooks הם Jobs שרצים בשלבי מחזור חיים של Release: pre-install, post-upgrade, pre-delete ועוד.\nOption 0 שגוי: debug נעשה עם helm template. Option 1 שגוי: אין סוג Chart כזה. Option 2 שגוי: rollback נעשה עם helm rollback.\nשימושים נפוצים: DB migrations לפני upgrade, או התראת Slack אחרי deploy.",
            },
            {
              q: "מה תפקיד VolumeSnapshot?",
              options: [
              "גיבוי של כל ה-Cluster כולל etcd, Pods, ו-ConfigMaps",
              "צילום מצב של Pod כולל ה-container filesystem וה-memory",
              "גיבוי של ConfigMaps ו-Secrets ב-Namespace לשחזור עתידי",
              "גיבוי נקודתי של PersistentVolume שממנו ניתן לשחזר PVC חדש",
],
              answer: 3,
              explanation:
                "VolumeSnapshot יוצר גיבוי נקודתי של PersistentVolume.\nאפשר לשחזר ממנו PVC חדש. שימושי לפני upgrade של DB.\nדורש CSI driver עם תמיכת snapshot ו-snapshot-controller.",
            },
            {
              q: "כיצד StatefulSet מנהל storage?",
              options: [
              "כל Pod מקבל PVC ייחודי משלו דרך volumeClaimTemplates",
              "StatefulSet לא תומך ב-storage ומשתמש רק ב-ConfigMaps לשמירת state",
              "כל ה-Pods ב-StatefulSet חולקים PVC אחד משותף לשמירת נתונים",
              "StatefulSet משתמש רק ב-emptyDir שנמחק כשה-Pod נמחק",
],
              answer: 0,
              explanation:
                "volumeClaimTemplates יוצר PVC ייחודי לכל Pod. Pod-0 מקבל data-myapp-0 וכן הלאה.\nכל PVC נשאר קשור ל-Pod שלו גם אחרי restart. כך databases שומרים נתונים.\nscale down לא מוחק PVCs; scale up מקשר PVCs ישנים מחדש.",
            },
            {
              q: "מה volume binding mode WaitForFirstConsumer?",
              options: [
              "ממתין לאישור Admin ב-RBAC לפני יצירת PV חדש",
              "ממתין לסיום replication בין Zones לפני binding של ה-PVC",
              "ממתין שה-StorageClass יסיים health check לפני הקצאת Volume",
              "ממתין ש-Pod יתזמן לפני יצירת PV. כדי ליצור PV באותה Zone כמו ה-Pod",
],
              answer: 3,
              explanation:
                "Immediate יוצר PV מיד, אך הוא עלול להיווצר ב-Zone שונה מה-Pod.\nWaitForFirstConsumer מעכב יצירת PV עד שה-Pod מתזמן ל-Node, ויוצר PV באותה Zone.\nקריטי בסביבות multi-AZ כמו AWS EKS.",
            },
            {
              q: "ה-PVC נשאר במצב Pending.\n\nהרצת:\n\n```\nkubectl describe pvc\n```\n\nפלט:\n\n```\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io\n  'fast-ssd' not found\n```\n\nמה הבעיה?",
              options: [
              "ה-StorageClass בשם fast-ssd לא קיים ב-Cluster",
              "ה-PVC וה-Pod נמצאים ב-Namespaces שונים",
              "ה-PVC מבקש נפח אחסון גדול מדי עבור ה-Cluster",
              "ה-Node שה-Pod רץ עליו מלא ואין בו מקום לדיסק",
],
              answer: 0,
              explanation:
                "ה-PVC מפנה ל-StorageClass בשם fast-ssd שלא קיים ב-Cluster.\nללא StorageClass, ה-provisioner לא יודע ליצור PV. הריצו kubectl get storageclass לראות מה קיים.\n• PVC גדול מדי = שגיאה על capacity • Node מלא = לא קשור ל-provisioning • Namespace שונה = שגיאה אחרת.",
            },
            {
              q: "הרצת:\n\n```\nhelm upgrade\n```\n\nה-upgrade כשל באמצע.\nRelease ב-status failed.\nה-ConfigMap עודכן חלקית.\n\nמה הצעד הבא?",
              options: [
              "helm upgrade שוב",
              "helm rollback my-release [last-good-revision] להחזיר למצב עקבי",
              "מחק ה-Release",
              "מחק ConfigMap",
],
              answer: 1,
              explanation:
                "כש-helm upgrade נכשל, resources עלולים להיות במצב לא עקבי.\nhelm rollback מחזיר הכל ל-revision תקין. הריצו helm history קודם לראות מספרי revision.\nupgrade נוסף ללא rollback עלול להחמיר את המצב.",
            },
            {
              q: "Pod עם PVC ב-AWS EKS.\nה-Pod עבר ל-Node ב-Availability Zone אחרת.\nה-PVC מראה סטטוס Bound, אבל ה-Pod לא מצליח לעלות.\n\nמה הסיבה?",
              options: [
              "NetworkPolicy חוסמת גישה מה-Node החדש ל-storage",
              "ה-EBS Volume נמצא ב-AZ אחרת מה-Node. EBS הוא single-AZ",
              "ה-PVC נמחק ונוצר מחדש עם ID שונה",
              "ה-StorageClass שגוי ולא תומך ב-multi-AZ",
],
              answer: 1,
              explanation:
                "EBS Volumes הם single-AZ. אפשר לחבר רק ל-Node באותה Availability Zone.\nה-PVC מראה Bound כי ה-PV קיים, אבל ה-attach נכשל כי ה-Node ב-AZ אחרת.\nהפתרון: StorageClass עם volumeBindingMode: WaitForFirstConsumer שמבטיח PV באותה AZ כמו ה-Pod.",
            },
        ],
        questionsEn: [
            {
              q: "What is CSI?",
              options: [
              "Container Storage Interface: an open standard for writing storage drivers for Kubernetes",
              "Container Security Interface: a standard for scanning images and enforcing security policies",
              "Cluster Sync Interface: a standard for syncing data between Clusters",
              "Cloud Storage Integration: a layer for connecting to cloud object storage like S3",
],
              answer: 0,
              explanation:
                "CSI is an open standard for writing storage drivers for Kubernetes.\nEach vendor ships their own CSI driver (AWS EBS, Ceph, etc.) as a DaemonSet in the cluster.\nThis lets vendors update drivers independently of Kubernetes releases.",
            },
            {
              q: "What is a Helm Hook?",
              options: [
              "An alternative rollback mechanism that restores a Release to a previous version",
              "A Job that runs at a specific lifecycle point of a Release (pre-install, post-upgrade)",
              "A special Chart type that contains only dependencies and no templates",
              "A debugging tool that validates templates before installing a Chart",
],
              answer: 1,
              explanation:
                "Hooks are Jobs that run at specific Release lifecycle points: pre-install, post-upgrade, pre-delete, etc.\nOption 0 is wrong: rollback is done with helm rollback. Option 2 is wrong: there is no such Chart type. Option 3 is wrong: debugging is done with helm template.\nCommon uses: DB migrations before upgrade, or Slack notifications after deploy.",
            },
            {
              q: "What is a VolumeSnapshot?",
              options: [
              "A backup of ConfigMaps and Secrets in a Namespace for future restore",
              "A point-in-time backup of a PersistentVolume from which a new PVC can be restored",
              "A full backup of the Cluster including etcd, Pods, and ConfigMaps",
              "A snapshot of a Pod's container filesystem and memory state",
],
              answer: 1,
              explanation:
                "VolumeSnapshot creates a point-in-time copy of a PersistentVolume's data.\nYou can restore a new PVC from it. Useful before risky DB migrations.\nRequires a snapshot-controller and a CSI driver with snapshot support.",
            },
            {
              q: "How does a StatefulSet manage storage?",
              options: [
              "All Pods in the StatefulSet share a single PVC for storing data",
              "Each Pod gets its own unique PVC via volumeClaimTemplates",
              "StatefulSet only uses emptyDir volumes that are deleted with the Pod",
              "StatefulSet does not support storage and relies on ConfigMaps for state",
],
              answer: 1,
              explanation:
                "volumeClaimTemplates creates a unique PVC per Pod. Pod-0 gets data-myapp-0 and so on.\nEach PVC stays bound to its Pod across restarts. How databases keep persistent data.\nScaling down doesn't delete PVCs; scaling up reconnects the existing ones.",
            },
            {
              q: "What does volume binding mode WaitForFirstConsumer do?",
              options: [
              "Waits for Admin RBAC approval before creating a new PV",
              "Waits for a Pod to be scheduled before creating the PV. Ensures the PV is in the same Zone as the Pod",
              "Waits for cross-Zone replication to complete before binding the PVC",
              "Waits for the StorageClass to finish a health check before allocating a Volume",
],
              answer: 1,
              explanation:
                "Immediate creates a PV right away, but it might end up in a different Zone than the Pod.\nWaitForFirstConsumer delays PV creation until the Pod is scheduled, then creates it in the same Zone.\nCritical in multi-AZ environments like AWS EKS.",
            },
            {
              q: "A PVC stays in Pending state.\n\nCommand:\n\n```\nkubectl describe pvc\n```\n\nOutput:\n\n```\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io\n  'fast-ssd' not found\n```\n\nWhat is wrong?",
              options: [
              "The PVC requests more storage than the Cluster can provide",
              "The StorageClass named fast-ssd does not exist in the Cluster",
              "The PVC and Pod are in different Namespaces",
              "The Node the Pod runs on is full and has no room for a disk",
],
              answer: 1,
              explanation:
                "The PVC references a StorageClass named fast-ssd that doesn't exist in the Cluster.\nWithout a valid StorageClass, the provisioner can't create a PV. Run kubectl get storageclass to check.\n• Too large = capacity error • Node full = unrelated to provisioning • Different namespace = different error.",
            },
            {
              q: "Command:\n\n```\nhelm upgrade\n```\n\nThe upgrade failed midway.\nRelease status: failed.\nA ConfigMap is half-updated.\n\nWhat is the next step?",
              options: [
              "Delete the ConfigMap",
              "Run helm upgrade again",
              "Delete the Release",
              "helm rollback my-release [last-good-revision] to return to a consistent state",
],
              answer: 3,
              explanation:
                "When helm upgrade fails midway, resources may be in an inconsistent state.\nhelm rollback restores everything to a known good revision. Run helm history first.\nAnother upgrade without rollback risks making things worse.",
            },
            {
              q: "A Pod with a PVC on AWS EKS.\nThe Pod moved to a Node in a different Availability Zone.\nThe PVC shows Bound status, but the Pod fails to start.\n\nWhat is the cause?",
              options: [
              "The StorageClass is wrong and does not support multi-AZ",
              "The PVC was deleted and recreated with a different ID",
              "A NetworkPolicy is blocking access from the new Node to storage",
              "The EBS Volume is in a different AZ than the Node. EBS is single-AZ",
],
              answer: 3,
              explanation:
                "EBS Volumes are single-AZ. They can only attach to a Node in the same Availability Zone.\nThe PVC shows Bound because the PV exists, but the attach fails since the Node is in a different AZ.\nFix: Use a StorageClass with volumeBindingMode: WaitForFirstConsumer to ensure the PV is in the Pod's AZ.",
            },
        ],
      },
    },
  },
  {
    id: "troubleshooting",
    icon: "🔧",
    name: "Cluster Operations & Troubleshooting",
    color: "#F97316",
    description: "Debugging · Observability · אבחון · כלים",
    descriptionEn: "Debugging · Observability · Diagnosis · Tools",
    levels: {
      easy: {
        theory: "פקודות Debug בסיסיות\n\nCMD:kubectl describe pod <pod-name>\nDESC:מידע מפורט על Pod כולל Events\n\nCMD:kubectl logs <pod-name>\nDESC:צפייה בלוגים של הקונטיינר\n\nCMD:kubectl exec -it <pod-name> -- bash\nDESC:הרצת פקודה או פתיחת shell בתוך הקונטיינר\n\nCMD:kubectl get pods -A\nDESC:רשימת כל ה-Pods בכל ה-Namespaces\n\nCMD:kubectl get events -A\nDESC:רשימת אירועים מכל ה-Namespaces\n\nFLOW_TITLE:זרימת עבודה לדיבוג\nFLOW:kubectl get pods -A\nFLOW:kubectl describe pod my-pod\nFLOW:kubectl logs my-pod\nFLOW:kubectl exec -it my-pod -- bash",
        theoryEn: "Basic Debug Commands\n\nCMD:kubectl describe pod <pod-name>\nDESC:Shows detailed Pod information including events and status.\n\nCMD:kubectl logs <pod-name>\nDESC:Displays container logs for debugging application issues.\n\nCMD:kubectl exec -it <pod-name> -- bash\nDESC:Opens an interactive shell inside the container.\n\nCMD:kubectl get pods -A\nDESC:Lists all Pods across all Namespaces.\n\nCMD:kubectl get events -A\nDESC:Lists cluster events from all Namespaces.\n\nFLOW_TITLE:Debugging Workflow\nFLOW:kubectl get pods -A\nFLOW:kubectl describe pod my-pod\nFLOW:kubectl logs my-pod\nFLOW:kubectl exec -it my-pod -- bash",
        questions: [
            {
              q: "ה-Pod 'web-server' לא מגיב ואתה לא יודע למה. איזו פקודה תיתן לך events ומצב מפורט כדי להתחיל לאבחן?",
              options: [
              "kubectl describe pod web-server",
              "kubectl status pod web-server",
              "kubectl get pod web-server",
              "kubectl inspect pod web-server",
],
              answer: 0,
              explanation:
                "kubectl describe pod מציג events, conditions, ומידע מפורט.\nה-Events בתחתית הפלט הם לרוב הסיבה הישירה לבעיה.",
            },
            {
              q: "ה-Pod 'api-service' נמצא ב-Running אבל האפליקציה מחזירה שגיאות 500. מה הפקודה הראשונה שתריץ?",
              options: [
              "kubectl top pod api-service",
              "kubectl describe pod api-service",
              "kubectl logs api-service",
              "kubectl events api-service",
],
              answer: 2,
              explanation:
                "kubectl logs מציג את ה-stdout/stderr של הקונטיינר.\nהמקום הראשון לחפש שגיאות אפליקציה כשה-Pod רץ.\nהוסף --follow לעקוב בזמן אמת.",
            },
            {
              q: "מה kubectl get events מציג?",
              options: [
              "אירועים מה-Namespace הנוכחי: Pod scheduling, image pull, probe failures",
              "רק Pod logs",
              "רק שגיאות",
              "רק Node events",
],
              answer: 0,
              explanation:
                "מציג את כל האירועים ב-Namespace הנוכחי: scheduling, image pull, probe failures.\nEvents מגיעים מ-Kubernetes עצמו, בניגוד ל-logs שמגיעים מהאפליקציה.\nהוסף --sort-by=.metadata.creationTimestamp לסדר לפי זמן.",
            },
            {
              q: "מה ההבדל בין Running ל-Ready?",
              options: [
              "Running:\u200E הקונטיינר פועל. Ready:\u200E ה-Pod עבר readiness probe ומוכן לקבל traffic",
              "Running:\u200E ה-Pod ממתין ל-image pull. Ready:\u200E ה-image הורד והקונטיינר עלה",
              "Ready:\u200E ה-Pod מחובר ל-Service. Running:\u200E ה-Pod פועל אך לא מחובר ל-Service",
              "Running ו-Ready זהים. שניהם מציינים שה-Pod פועל ומקבל traffic",
],
              answer: 0,
              explanation:
                "Running = תהליך הקונטיינר עלה. Ready = עבר readiness probe ומוכן לקבל traffic.\nPod שהוא Running אבל נכשל ב-readiness probe יוצג כ-0/1 Ready ויוסר מה-Service.\nזה מונע שליחת traffic ל-Pod שטרם סיים לעלות.",
            },
            {
              q: "כיצד רואים לוגים של קונטיינר שקרס?",
              options: [
              "kubectl get logs --crashed",
              "kubectl logs pod-name",
              "kubectl describe pod-name --logs",
              "kubectl logs pod-name --previous",
],
              answer: 3,
              explanation:
                "כשקונטיינר קורס, Kubernetes מפעיל instance חדש שה-logs שלו כמעט ריקים.\n--previous שולף logs מה-instance שקרס. בדיוק מה שצריך לאבחון.",
            },
            {
              q: "מה kubectl top nodes מציג?",
              options: [
              "שימוש ב-CPU/Memory של כל Node בזמן אמת (דורש metrics-server)",
              "רשימת כל ה-Nodes ב-Cluster כולל Status ו-Roles",
              "לוגים של kubelet מכל Node ב-Cluster",
              "רשימת Nodes עם Conditions חריגות כמו DiskPressure או MemoryPressure",
],
              answer: 0,
              explanation:
                "מציג צריכת CPU ו-Memory בזמן אמת של כל Node, כולל אחוז ניצול.\nדורש metrics-server מותקן ב-Cluster.\nkubectl top pods מציג את אותו מידע ברמת Pod.",
            },
            {
              q: "כיצד בודקים health של ה-API server?",
              options: [
              "kubectl get --raw='/healthz' (מחזיר ok אם בריא)",
              "kubectl check apiserver",
              "kubectl status cluster",
              "kubectl describe apiserver",
],
              answer: 0,
              explanation:
                "kubectl get --raw='/healthz' מחזיר ok אם ה-API server בריא.\ncomponentstatuses הוסרה ב-K8s 1.26. השתמשו ב-/healthz, /readyz, /livez במקום.",
            },
            {
              q: "מה kubectl config get-contexts עושה?",
              options: [
              "מציג את כל ה-kubeconfig contexts: cluster, user, ו-namespace מוגדרים",
              "מציג את כל ה-Docker contexts שמוגדרים ב-daemon המקומי",
              "מציג את כל ה-Namespaces ב-Cluster הנוכחי",
              "מציג את ה-context של כל Node כולל ה-kubelet configuration",
],
              answer: 0,
              explanation:
                "מציג את כל ה-contexts ב-kubeconfig. כל context מכיל cluster, user, ו-namespace.\nהנוכחי מסומן בכוכבית (*). use-context מחליף context, set-context משנה namespace.",
            },
        ],
        questionsEn: [
            {
              q: "Pod 'web-server' is not responding and you don't know why. Which command gives you events and detailed state to start diagnosing?",
              options: [
              "kubectl describe pod web-server",
              "kubectl status pod web-server",
              "kubectl get pod web-server",
              "kubectl inspect pod web-server",
],
              answer: 0,
              explanation:
                "kubectl describe pod shows events, conditions, and detailed info.\nThe Events section at the bottom usually reveals the direct cause of the problem.",
            },
            {
              q: "Pod 'api-service' is Running but the app returns 500 errors. What is the first command you run?",
              options: [
              "kubectl top pod api-service",
              "kubectl describe pod api-service",
              "kubectl logs api-service",
              "kubectl events api-service",
],
              answer: 2,
              explanation:
                "kubectl logs shows the container's stdout/stderr.\nFirst place to look for application errors while the Pod is running.\nUse --follow to stream logs in real time.",
            },
            {
              q: "What does kubectl get events show?",
              options: [
              "Only Pod logs",
              "Only Node events",
              "Namespace events: Pod scheduling, image pulls, probe failures",
              "Only errors",
],
              answer: 2,
              explanation:
                "Lists all events in the current Namespace: scheduling, image pulls, probe failures.\nEvents come from Kubernetes itself, unlike logs which come from your app.\nAdd --sort-by=.metadata.creationTimestamp to see the most recent first.",
            },
            {
              q: "What is the difference between Running and Ready?",
              options: [
              "Ready: the Pod is connected to a Service. Running: the Pod is active but not connected to a Service",
              "Running: the Pod is waiting for image pull. Ready: the image was pulled and the container started",
              "Running: container is active. Ready: Pod passed readiness probe and can receive traffic",
              "Running and Ready are the same. Both indicate the Pod is active and receiving traffic",
],
              answer: 2,
              explanation:
                "Running = the container process started. Ready = passed readiness probe and can receive traffic.\nA Pod that's Running but failing readiness shows 0/1 Ready and is removed from the Service.\nThis prevents traffic hitting a Pod that hasn't finished starting up.",
            },
            {
              q: "How do you view logs from a crashed container?",
              options: [
              "kubectl get logs --crashed",
              "kubectl logs pod-name",
              "kubectl describe pod-name --logs",
              "kubectl logs pod-name --previous",
],
              answer: 3,
              explanation:
                "When a container crashes, Kubernetes starts a new instance whose logs may be nearly empty.\n--previous fetches logs from the crashed run. Exactly what you need to diagnose the cause.",
            },
            {
              q: "What does kubectl top nodes show?",
              options: [
              "Kubelet logs from every Node in the Cluster",
              "A list of all Nodes in the Cluster with their Status and Roles",
              "Nodes with abnormal Conditions such as DiskPressure or MemoryPressure",
              "Real-time CPU/Memory usage for each Node (requires metrics-server)",
],
              answer: 3,
              explanation:
                "Shows real-time CPU and Memory consumption for every Node, including utilization percentage.\nRequires metrics-server installed in the cluster.\nkubectl top pods shows the same at Pod level.",
            },
            {
              q: "How do you check the health of the API server?",
              options: [
              "kubectl status cluster",
              "kubectl describe apiserver",
              "kubectl check apiserver",
              "kubectl get --raw='/healthz' (returns ok when healthy)",
],
              answer: 3,
              explanation:
                "kubectl get --raw='/healthz' returns 'ok' if the API server is healthy.\ncomponentstatuses was removed in K8s 1.26. Use /healthz, /readyz, /livez instead.",
            },
            {
              q: "What does kubectl config get-contexts do?",
              options: [
              "Lists all Docker contexts configured on the local daemon",
              "Lists all Namespaces in the current Cluster",
              "Shows the context of each Node including kubelet configuration",
              "Lists all kubeconfig contexts: configured clusters, users, and namespaces",
],
              answer: 3,
              explanation:
                "Lists all contexts in kubeconfig. Each bundles a cluster, user, and default namespace.\nCurrent context is marked with *. use-context switches context, set-context changes namespace.",
            },
        ],
      },
      medium: {
        theory: "שגיאות נפוצות ב-Pods.\n🔹 CrashLoopBackOff:\u200E קונטיינר קורס שוב ושוב\n🔹 ImagePullBackOff:\u200E לא ניתן להוריד image (שם שגוי או credentials חסרים)\n🔹 OOMKilled:\u200E חרגנו ממגבלת הזיכרון\n🔹 Pending:\u200E אין Node פנוי (resources / nodeSelector)\nCODE:\nkubectl describe pod my-pod   # בדוק Events\nkubectl logs my-pod --previous  # לוגים לפני crash\nkubectl top pod                 # CPU/Memory",
        theoryEn: "Common Pod Errors\n🔹 CrashLoopBackOff - the container crashes repeatedly and Kubernetes keeps restarting it.\n🔹 ImagePullBackOff - the container image cannot be pulled due to a wrong name or missing credentials.\n🔹 OOMKilled - the container exceeded its memory limit and was terminated by the kernel.\n🔹 Pending - no Node is available to schedule the Pod, often due to insufficient resources or a mismatched nodeSelector.\nCODE:\nkubectl describe pod my-pod   # check Events\nkubectl logs my-pod --previous  # logs before crash\nkubectl top pod                 # CPU/Memory",
        questions: [
            {
              q: "פרסמת גרסה חדשה.\nה-Pod עולה, קורס מיד, ו-Kubernetes מפעיל אותו שוב ושוב.\n\nאיזה סטטוס תראה בפלט הפקודה?\n\n```\nkubectl get pods\n```",
              options: [
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              "Terminating",
],
              answer: 0,
              explanation:
                "הקונטיינר עולה, קורס מיד, ו-Kubernetes מנסה שוב עם המתנה גוברת.\nהריצו kubectl logs --previous לראות את ה-logs מה-crash האחרון.",
            },
            {
              q: "ה-Pod נמצא ב-ImagePullBackOff. מה שתי הסיבות הנפוצות ביותר?",
              options: [
              "Node חסר disk + Port שגוי",
              "הרשאות RBAC + ConfigMap חסר",
              "שם image שגוי או tag שגוי, או imagePullSecret חסר עבור registry פרטי",
              "resource limits שגויים + Namespace חסר",
],
              answer: 2,
              explanation:
                "Kubernetes לא מצליח להוריד את ה-image ומחכה יותר ויותר בין ניסיונות.\nשתי הסיבות הנפוצות: שגיאה בשם ה-image/tag, או חוסר imagePullSecrets ל-registry פרטי.",
            },
            {
              q: "ה-Pod רץ שעות, ואז מסתיים לפתע.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\nReason: OOMKilled\n```\n\nמה קרה ומה הפתרון?",
              options: [
              "ה-Pod פונה בגלל disk מלא; הוסף storage",
              "ה-liveness probe נכשל; תקן את ה-probe",
              "ה-Pod פונה ע\"י Pod עם עדיפות גבוהה יותר",
              "הקונטיינר חרג ממגבלת הזיכרון שלו; הגדל את limits.memory או אופטימיזציה לאפליקציה",
],
              answer: 3,
              explanation:
                "הקונטיינר חרג מ-limits.memory וה-Linux kernel ממית אותו עם exit code 137.\nהגדילו limits.memory, או בדקו memory leak עם kubectl top pod.",
            },
            {
              q: "ה-Pod נשאר ב-Pending.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\n0/3 nodes are available:\n3 Insufficient cpu\n```\n\nמה הגורם השורשי?",
              options: [
              "ה-image של הקונטיינר גדול מדי",
              "NetworkPolicy חוסמת את ה-Pod",
              "ה-Pod מבקש יותר CPU ממה שקיים ב-Nodes הפנויים",
              "ה-Namespace של ה-Pod לא קיים",
],
              answer: 2,
              explanation:
                "ה-CPU request של ה-Pod גדול מה-capacity הפנוי בכל Node.\nהקטינו requests.cpu לפי actual usage, או הוסיפו Nodes עם capacity פנוי.",
            },
            {
              q: "מה קורה כש-liveness probe נכשל?",
              options: [
              "Pod מוגדר NotReady",
              "Pod נמחק לצמיתות",
              "Event נרשם בלבד",
              "K8s ממית ומפעיל מחדש את הקונטיינר",
],
              answer: 3,
              explanation:
                "כשה-probe נכשל failureThreshold פעמים ברציפות, Kubernetes ממית ומפעיל מחדש את הקונטיינר.\nreadiness probe לעומת זאת רק מסיר מה-Service Endpoints. ללא restart.",
            },
            {
              q: "ה-Pod נמצא ב-ContainerCreating זמן רב. מה הסיבות האפשריות?",
              options: [
              "Image pull איטי בגלל registry עמוס, או חוסר bandwidth ב-Node",
              "PVC שלא נמצא, Secret חסר, image pull איטי, או בעיה ב-CNI",
              "Init container שנתקע בלופ ומעכב את הפעלת ה-container הראשי",
              "Node עם disk pressure שמונע mount של Volumes חדשים",
],
              answer: 1,
              explanation:
                "שלב נורמלי, אבל כשנמשך זמן רב מציין בעיה.\nסיבות נפוצות: PVC לא Bound, Secret/ConfigMap חסר, image גדול, או בעיה ב-CNI.",
            },
            {
              q: "ה-Pod במצב Terminating ולא נמחק.\n\nהרצת:\n\n```\nkubectl delete pod my-pod\n  --grace-period=0 --force\n```\n\nה-Pod עדיין לא נמחק.\n\nמה הסיבה?",
              options: [
              "ה-Node שה-Pod רץ עליו נפל ואין תקשורת עם ה-Control Plane",
              "הרשאות RBAC חוסמות את הפעולה ולא מאפשרות מחיקת ה-Pod",
              "ל-Pod יש finalizer שלא נוקה ע\"י controller חיצוני. יש להסיר ידנית",
              "ה-Namespace נמצא במצב Terminating ולא מאפשר שינויים בפנים",
],
              answer: 2,
              explanation:
                "Finalizer מונע מחיקה עד ש-controller חיצוני מנקה אותו. אפילו --force לא עוזר.\nכשה-controller לא זמין, ה-Pod תקוע.\nפתרון: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' מסיר finalizers ידנית.",
            },
            {
              q: "ה-Node ב-DiskPressure.\n\nהרצת:\n\n```\nkubectl describe node\n```\n\nפלט:\n\n```\nConditions:\n  DiskPressure True\n```\n\nמה הסיבות הנפוצות?",
              options: [
              "RAM של ה-Node מלא וה-kubelet מגדיר MemoryPressure condition",
              "עומס רשת גבוה שגורם ל-kubelet לדווח על בעיית connectivity",
              "logs שהצטברו, images ישנים, או disk של ה-Node מגיע לסף מלאות",
              "שימוש גבוה ב-CPU שגורם ל-kubelet לא להגיב ל-heartbeats",
],
              answer: 2,
              explanation:
                "kubelet מזהה שה-disk מגיע לסף מלאות.\nסיבות נפוצות: logs שהצטברו, images ישנים, ו-emptyDir volumes גדולים.\nנקו עם docker image prune ו-journalctl --vacuum-time=2d, או הרחיבו את ה-disk.",
            },
        ],
        questionsEn: [
            {
              q: "You deployed a new version.\nThe Pod starts, immediately crashes, and Kubernetes keeps restarting it.\n\nWhat status do you see?\n\n```\nkubectl get pods\n```",
              options: [
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              "Terminating",
],
              answer: 0,
              explanation:
                "The container starts, crashes immediately, and Kubernetes retries with increasing back-off delay.\nRun kubectl logs --previous to see the logs from the last crash.",
            },
            {
              q: "A pod is stuck in ImagePullBackOff. What are the two most common causes?",
              options: [
              "Wrong image name/tag, or missing imagePullSecret for a private registry",
              "RBAC permissions and missing ConfigMap",
              "Wrong resource limits and missing namespace",
              "Node out of disk space and wrong port",
],
              answer: 0,
              explanation:
                "Kubernetes failed to pull the image and waits with increasing delay before retrying.\nTwo most common causes: typo in image name/tag, or missing imagePullSecrets for a private registry.",
            },
            {
              q: "A Pod ran fine for hours, then suddenly terminated.\n\nCommand:\n\n```\nkubectl describe pod\n```\n\nOutput:\n\n```\nReason: OOMKilled\n```\n\nWhat happened and what is the fix?",
              options: [
              "Pod evicted due to low disk; add more storage",
              "Container exceeded its memory limit; increase limits.memory or optimize the app",
              "Pod preempted by higher-priority pod; adjust PriorityClass",
              "Liveness probe failed; fix the probe config",
],
              answer: 1,
              explanation:
                "The container exceeded limits.memory and the Linux kernel killed it with exit code 137.\nIncrease limits.memory, or use kubectl top pod to identify a memory leak.",
            },
            {
              q: "A Pod stays Pending.\n\nCommand:\n\n```\nkubectl describe pod\n```\n\nOutput:\n\n```\n0/3 nodes are available:\n3 Insufficient cpu\n```\n\nWhat is the root cause?",
              options: [
              "The container image is too large",
              "The pod requests more CPU than any available node can provide",
              "The pod namespace does not exist",
              "A NetworkPolicy is blocking the pod",
],
              answer: 1,
              explanation:
                "The Pod's CPU request is larger than available capacity on any Node.\nLower requests.cpu to actual usage (check with kubectl top pods), or add more Nodes.",
            },
            {
              q: "What happens when a liveness probe fails?",
              options: [
              "Pod is permanently deleted",
              "Only an event is recorded",
              "Pod is set to NotReady",
              "K8s kills and restarts the container",
],
              answer: 3,
              explanation:
                "When the probe fails failureThreshold times consecutively, Kubernetes kills and restarts the container.\nA readiness probe failure only removes the Pod from Service Endpoints. No restart.",
            },
            {
              q: "A Pod is in ContainerCreating for a long time. What are the likely causes?",
              options: [
              "Slow image pull due to overloaded registry or insufficient Node bandwidth",
              "Init container stuck in a loop delaying the main container startup",
              "Node with disk pressure preventing new Volume mounts",
              "Unbound PVC, missing Secret, slow image pull, or CNI issue",
],
              answer: 3,
              explanation:
                "Normal briefly, but when prolonged it indicates a blocker.\nCommon causes: PVC still Pending, missing Secret/ConfigMap, large image downloading, or CNI failure.",
            },
            {
              q: "A Pod is stuck in Terminating.\n\nCommand:\n\n```\nkubectl delete pod my-pod\n  --grace-period=0 --force\n```\n\nThe Pod is still not deleted.\n\nWhat is the cause?",
              options: [
              "The Node the Pod was running on is down and lost contact with the Control Plane",
              "The Namespace is in Terminating state and is blocking modifications to resources inside it",
              "The Pod has a finalizer that was not cleared by its controller. Must be removed manually",
              "RBAC permissions are blocking the delete operation on this Pod",
],
              answer: 2,
              explanation:
                "A finalizer blocks deletion until an external controller clears it. Even --force can't bypass it.\nIf the controller is unavailable, the Pod stays stuck.\nFix: kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}' removes finalizers manually.",
            },
            {
              q: "A Node shows DiskPressure.\n\nCommand:\n\n```\nkubectl describe node\n```\n\nOutput:\n\n```\nConditions:\n  DiskPressure True\n```\n\nWhat are the common causes?",
              options: [
              "Accumulated logs, stale images, or Node disk approaching the fullness threshold",
              "High CPU usage causing kubelet to stop responding to heartbeats",
              "High network load causing kubelet to report a connectivity problem",
              "Full RAM on the Node causing kubelet to set MemoryPressure condition",
],
              answer: 0,
              explanation:
                "kubelet sets DiskPressure when the Node disk crosses a usage threshold.\nCommon culprits: accumulated logs, stale images, and large emptyDir volumes.\nClean up with docker image prune and journalctl --vacuum-time=2d, or expand the disk.",
            },
        ],
      },
      hard: {
        theory: "Debug מתקדם.\n🔹 kubectl port-forward:\u200E מנתב port מ-Pod לlocal machine\n🔹 kubectl cp:\u200E מעתיק קבצים מ-Pod ואליו\n🔹 kubectl top:\u200E CPU/Memory usage בזמן אמת\n🔹 Pod ב-Terminating לא נמחק. בגלל finalizer\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'",
        theoryEn: "Advanced Debugging\n🔹 kubectl port-forward - forwards a port from a Pod to your local machine for direct access.\n🔹 kubectl cp - copies files between a Pod and your local filesystem.\n🔹 kubectl top - displays real-time CPU and memory usage for Pods or Nodes.\n🔹 Stuck in Terminating - a Pod may hang in Terminating state if blocked by a finalizer.\nCODE:\nkubectl port-forward pod/my-pod 8080:80\nkubectl cp my-pod:/app/log.txt ./log.txt\nkubectl top pod --sort-by=memory\nkubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'",
        questions: [
            {
              q: "לאחר Deployment, ה-Pods החדשים ב-CrashLoopBackOff.\nהגרסה הקודמת עבדה מצוין.\n\nמה שתי פעולות ה-debug הראשונות שלך?",
              options: [
              "Scale down ל-0 ו-redeploy מחדש",
              "מחק את כל ה-Pods ותן ל-Kubernetes ליצור אותם מחדש",
              "kubectl logs <new-pod> --previous ו-kubectl describe pod <new-pod>",
              "kubectl rollout undo מיד לגרסה הקודמת",
],
              answer: 2,
              explanation:
                "לפני rollback חשוב להבין מה השתנה.\nlogs --previous מציג output מה-crash, ו-describe pod מציג Events.\nרק אחרי שמבינים את הסיבה, מחליטים לתקן code או לעשות rollout undo.",
            },
            {
              q: "ה-Node מראה NotReady.\nPods מפונים ממנו.\n\nהרצת:\n\n```\nkubectl get nodes\n```\n\nמה שתי הפעולות הראשונות שלך?",
              options: [
              "kubectl drain <name> --force להעביר Pods ואז למחוק ולהצטרף מחדש",
              "kubectl describe node <name> לבדוק Conditions ו-Events, ואז SSH ל-Node ולהריץ systemctl status kubelet",
              "kubectl cordon <name> ואז לבדוק kubelet status דרך systemctl על ה-Node",
              "kubectl delete node <name> ולתת ל-cluster autoscaler להפעיל Node חדש",
],
              answer: 1,
              explanation:
                "describe node מציג Conditions ו-Events. המקום הראשון לחפש.\nSSH ל-Node ו-systemctl status kubelet לוודא שרץ.\nסיבות נפוצות: kubelet נפל, TLS cert פג, או disk/memory pressure.",
            },
            {
              q: "מה kubectl drain עושה ומתי משתמשים בו?",
              options: [
              "מפנה Pods מ-Node בצורה graceful ומסמן אותו כ-unschedulable לפני maintenance",
              "מנתק את ה-Node מהרשת כך ש-Pods לא מקבלים traffic נכנס",
              "מקטין את מספר ה-replicas של כל Deployment שרץ על ה-Node",
              "מוחק את ה-Node מה-Cluster ומפנה את כל ה-Pods לאשפה",
],
              answer: 0,
              explanation:
                "מפנה Pods מ-Node בצורה graceful ומסמן אותו כ-unschedulable.\nמכבד PodDisruptionBudgets ומחכה שה-Pods יעלו במקום אחר.\nמשתמשים לפני upgrade, reboot, או decommissioning.",
            },
            {
              q: "כיצד מאבחנים בעיות DNS ב-Kubernetes?",
              options: [
              "kubectl get endpoints -n kube-system kube-dns ולוודא שה-IP תקין",
              "kubectl logs -n kube-system coredns-xxx ולבדוק config של Corefile",
              "kubectl describe svc kube-dns -n kube-system ולחפש Selector mismatch",
              "kubectl exec pod -- nslookup kubernetes.default + בדיקת CoreDNS Pod logs",
],
              answer: 3,
              explanation:
                "nslookup kubernetes.default מתוך Pod מוודא ש-CoreDNS מגיב.\nאם נכשל. בדקו שה-CoreDNS Pods רצים ב-kube-system.\nkubectl logs <coredns-pod> -n kube-system יחשוף שגיאות.",
            },
            {
              q: "מה הפקודה לגיבוי etcd?",
              options: [
              "etcdctl backup create --name=backup.db --cacert=... --cert=...",
              "etcdctl snapshot save backup.db --endpoints=...",
              "etcdctl member backup --data-dir=/var/lib/etcd --output=backup.db",
              "etcdctl export --all-keys --snapshot-dir=/backup/etcd-data.db",
],
              answer: 1,
              explanation:
                "etcdctl snapshot save יוצר snapshot מלא של etcd:\u200E כל מצב ה-Cluster.\nחובה לציין --endpoints, --cacert, --cert, ו--key לאימות.\nזהו הכלי הראשי ל-Disaster Recovery.",
            },
            {
              q: "ה-Pod רץ, אבל ה-liveness probe נכשל שוב ושוב.\n\nהפלט של kubectl describe pod מציג:\n\n```\nLiveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nמה בודקים?",
              options: [
              "ה-container image שגוי ולא מכיל את האפליקציה",
              "בעיית DNS שמונעת מה-probe להגיע ל-Pod",
              "הרשאות RBAC מונעות מ-kubelet לבצע את ה-probe",
              "ה-probe path שגוי. האפליקציה לא חושפת את ה-endpoint הזה",
],
              answer: 3,
              explanation:
                "קוד 404 אומר שה-path ב-livenessProbe.httpGet.path לא קיים באפליקציה. ה-Pod רץ ומגיב.\nבדקו איזה endpoint health האפליקציה חושפת (/health, /ping, /livez) ועדכנו.\n• DNS לא קשור (probe רץ ישירות ל-Pod IP) • image נכון (404 = שרת עונה) • RBAC לא משפיע על probes.",
            },
            {
              q: "הרצת:\n\n```\nkubectl logs my-pod\n```\n\nפלט:\n\n```\nError from server (BadRequest):\ncontainer 'my-container' in pod\n'my-pod' is not running\n```\n\nמה עושים?",
              options: [
              "הוסף sidecar container שיאסוף את ה-logs מה-container הראשי",
              "ה-Pod רץ בוודאות. הבעיה היא ב-RBAC שחוסם גישה ל-logs",
              "ה-Pod לא רץ. בדוק סטטוס עם kubectl get pod ואז Events עם kubectl describe pod",
              "מחק את ה-Pod ותן ל-Deployment ליצור אחד חדש שאפשר לקרוא לו logs",
],
              answer: 2,
              explanation:
                "Kubernetes לא יכול לקרוא logs מ-container שלא רץ.\nבדקו סטטוס עם kubectl get pod. אם CrashLoopBackOff השתמשו ב---previous.\nאם Init:Error. בדקו logs של ה-init container עם -c <init-name>.",
            },
            {
              q: "Cluster חדש הותקן זה עתה.\n\nהרצת:\n\n```\nkubectl get nodes\n```\n\nפלט:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nמה הצעד הראשון?",
              options: [
              "ה-etcd database כשל ויש לשחזר מגיבוי",
              "למחוק את ה-Node ולהתקין אותו מחדש",
              "ה-API server לא רץ ויש להפעיל אותו ידנית",
              "CNI plugin לא מותקן. יש לבדוק ולהתקין Calico או Flannel",
],
              answer: 3,
              explanation:
                "ב-Cluster חדש, NotReady כמעט תמיד אומר ש-CNI plugin לא הותקן.\nKubernetes דורש CNI כדי להגדיר networking ל-Pods. בלעדיו Node לא יהיה Ready.\nהתקינו CNI (Calico/Flannel/Cilium) וה-Node יעבור ל-Ready.",
            },
        ],
        questionsEn: [
            {
              q: "After a Deployment, the new Pods are in CrashLoopBackOff.\nThe previous version worked fine.\n\nWhat are your first two debugging steps?",
              options: [
              "Run kubectl logs <new-pod> --previous and kubectl describe pod <new-pod>",
              "Delete all pods and wait for recreation",
              "Run kubectl rollout undo immediately",
              "Scale down to 0 and redeploy",
],
              answer: 0,
              explanation:
                "Before rollback, understand what changed.\nlogs --previous shows the crash output, describe pod shows the Events timeline.\nOnly after understanding the cause. Decide to fix code or run rollout undo.",
            },
            {
              q: "A Node shows NotReady.\nPods on it are being evicted.\n\nCommand:\n\n```\nkubectl get nodes\n```\n\nWhat are your first two steps?",
              options: [
              "kubectl delete node <name> and let the cluster autoscaler provision a new Node",
              "kubectl drain <name> --force to move Pods then delete and rejoin the Node",
              "kubectl cordon <name> then check kubelet status via systemctl on the Node",
              "kubectl describe node <name> to check Conditions and Events, then SSH in and run systemctl status kubelet",
],
              answer: 3,
              explanation:
                "describe node shows Conditions and Events. The first place to look.\nSSH in and run systemctl status kubelet to check if it's running.\nCommon causes: kubelet crashed, TLS cert expired, or disk/memory pressure.",
            },
            {
              q: "What does kubectl drain do and when is it used?",
              options: [
              "Removes the Node from the Cluster entirely and sends all its Pods to garbage collection",
              "Disconnects the Node from the network so Pods stop receiving inbound traffic",
              "Gracefully evicts Pods from a Node and marks it unschedulable before maintenance",
              "Reduces the replica count of every Deployment running on the Node",
],
              answer: 2,
              explanation:
                "Gracefully evicts all Pods from a Node and marks it as unschedulable.\nHonors PodDisruptionBudgets and waits for Pods to come up elsewhere.\nUsed before upgrades, reboots, or decommissioning.",
            },
            {
              q: "How do you diagnose DNS issues in Kubernetes?",
              options: [
              "kubectl exec pod -- nslookup kubernetes.default + check CoreDNS Pod logs",
              "kubectl logs -n kube-system coredns-xxx and check the Corefile config",
              "kubectl get endpoints -n kube-system kube-dns and verify the IP is correct",
              "kubectl describe svc kube-dns -n kube-system and look for Selector mismatch",
],
              answer: 0,
              explanation:
                "nslookup kubernetes.default from inside a Pod verifies CoreDNS is responding.\nIf it fails, check that CoreDNS Pods are Running in kube-system.\nkubectl logs <coredns-pod> -n kube-system will reveal errors.",
            },
            {
              q: "What is the command to back up etcd?",
              options: [
              "etcdctl backup create --name=backup.db --cacert=... --cert=...",
              "etcdctl snapshot save backup.db --endpoints=...",
              "etcdctl member backup --data-dir=/var/lib/etcd --output=backup.db",
              "etcdctl export --all-keys --snapshot-dir=/backup/etcd-data.db",
],
              answer: 1,
              explanation:
                "etcdctl snapshot save creates a full snapshot of etcd: the entire cluster state.\nMust provide --endpoints, --cacert, --cert, and --key for authentication.\nThis is the standard backup method for disaster recovery.",
            },
            {
              q: "A Pod is running, but the liveness probe keeps failing.\n\nThe output of kubectl describe pod shows:\n\n```\nLiveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nWhat do you check?",
              options: [
              "The container image is wrong and does not contain the application",
              "A DNS issue preventing the probe from reaching the Pod",
              "RBAC permissions prevent kubelet from performing the probe",
              "The probe path is wrong. The app does not expose this endpoint",
],
              answer: 3,
              explanation:
                "A 404 means the path in livenessProbe.httpGet.path doesn't exist in the app. The Pod is running and responding.\nCheck which health endpoint the app exposes (/health, /ping, /livez) and update the spec.\n• DNS unrelated (probe runs directly to Pod IP) • Image is correct (404 = server responds) • RBAC doesn't affect probes.",
            },
            {
              q: "Command:\n\n```\nkubectl logs my-pod\n```\n\nOutput:\n\n```\nError from server (BadRequest):\ncontainer 'my-container' in pod\n'my-pod' is not running\n```\n\nWhat do you do?",
              options: [
              "The Pod is not Running. Check status with kubectl get pod, then Events with kubectl describe pod",
              "Delete the Pod and let the Deployment create a new one whose logs you can read",
              "Add a sidecar container that collects logs from the main container",
              "The Pod is definitely Running. The issue is RBAC blocking access to read logs",
],
              answer: 0,
              explanation:
                "Kubernetes can't stream logs from a container that isn't running.\nCheck status with kubectl get pod. If CrashLoopBackOff, use --previous.\nIf Init:Error, check init container logs with -c <init-name>.",
            },
            {
              q: "A new cluster was just initialized.\n\nCommand:\n\n```\nkubectl get nodes\n```\n\nOutput:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nWhat is the first step?",
              options: [
              "CNI plugin is not installed. Check and install Calico or Flannel",
              "Delete the Node and reinstall it from scratch",
              "The etcd database has failed and must be restored from backup",
              "The API server is not running and must be started manually",
],
              answer: 0,
              explanation:
                "On a fresh cluster, NotReady almost always means the CNI plugin hasn't been installed.\nKubernetes requires CNI for Pod networking. Without it, the Node can't become Ready.\nInstall a CNI plugin (Calico/Flannel/Cilium) and the Node will transition to Ready.",
            },
        ],
      },
    },
  },
  {
    id: "linux",
    icon: "🖥️",
    name: "System & Linux Troubleshooting",
    color: "#6366F1",
    description: "תהליכים · לוגים · CPU · זיכרון · רשת",
    descriptionEn: "Processes · Logs · CPU · Memory · Networking",
    isNew: true,
    levels: {
      easy: {
        theory: "פקודות בסיסיות לניטור תהליכים ומשאבי מערכת ב-Linux כוללות top, ps, free ו-df. הכרת כלים אלו חיונית לאבחון בעיות בסביבות ייצור.",
        theoryEn: "Basic Linux commands for monitoring processes and system resources include top, ps, free, and df. Knowing these tools is essential for diagnosing issues in production environments.",
        questions: [
          {
            q: "צריך למצוא תהליך שצורך הכי הרבה זיכרון.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "ps aux --sort=-%mem | head",
              "cat /proc/meminfo",
              "vmstat 1",
              "df -h",
            ],
            answer: 0,
            explanation: "ps aux --sort=-%mem ממיין את כל התהליכים לפי אחוז צריכת זיכרון בסדר יורד, ו-head מציג את הצרכנים הגדולים ביותר. זהו הצעד הראשון הסטנדרטי כשיש חשד לדליפת זיכרון או תהליך שבורח.\n\nלמה האחרות לא מתאימות:\n- cat /proc/meminfo מציג סיכום זיכרון כללי של המערכת, אבל לא מפרט לפי תהליכים — אי אפשר לדעת מי צורך.\n- vmstat מציג סטטיסטיקות מערכת כלליות (CPU, memory, I/O) אבל לא מפרק לפי תהליך ספציפי.\n- df -h מציג שימוש בדיסק, לא בזיכרון — כלי שונה לגמרי.\n\nבפרקטיקה: אחרי שמזהים את התהליך הצרכן, בודקים אם מדובר בהתנהגות רגילה או בדליפה עם כלים כמו pmap או smem.",
          },
          {
            q: "הרצת:\n\n```\ndf -h\n```\n\nפלט:\n\n```\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   48G  2.0G  96% /\n```\n\nמה הבעיה ומה הצעד הראשון?",
            options: [
              "הדיסק כמעט מלא — יש לזהות קבצים גדולים עם du -sh /* ולמחוק/להעביר לפי הצורך",
              "הזיכרון RAM מלא — יש להוסיף swap",
              "ה-CPU עמוס — יש להפעיל מחדש את השרת",
              "אין בעיה, 96% שימוש זה תקין",
            ],
            answer: 0,
            explanation: "df -h מציג 96% שימוש בדיסק על partition /, עם רק 2GB פנויים מתוך 50GB. זהו מצב קריטי — כשהדיסק מתמלא ל-100%, שירותים יכשלו בכתיבת לוגים, בסיסי נתונים יקרסו, ואפילו SSH עלול להפסיק לעבוד.\n\nהצעד הנכון: du -sh /* מציג את הגודל של כל תיקיית root, ומאפשר לזהות מהר מה תופס מקום (לרוב /var/log או /tmp).\n\nלמה האחרות שגויות:\n- RAM ודיסק הם משאבים נפרדים — df מציג דיסק, לא זיכרון.\n- CPU לא קשור לשימוש בדיסק, ו-restart לא משחרר מקום.\n- 96% זה לא תקין — הכלל המקובל הוא לפעול כשמגיעים ל-80-85%.",
          },
          {
            q: "שירות לא עולה אחרי הפעלה מחדש של השרת.\n\nאיזו פקודה תראה את הלוגים של השירות?",
            options: [
              "systemctl restart service-name",
              "journalctl -u service-name --no-pager -n 50",
              "dmesg | tail",
              "ifconfig eth0",
            ],
            answer: 1,
            explanation: "journalctl -u service-name מציג את הלוגים הספציפיים של שירות systemd. הדגל -n 50 מגביל ל-50 שורות אחרונות (מספיק לראות את שגיאת ההפעלה), ו---no-pager מציג ישירות בטרמינל בלי less.\n\nזה הצעד הראשון הנכון: קודם לקרוא את הלוגים כדי להבין למה השירות נכשל, ורק אחר כך לתקן.\n\nלמה האחרות לא מתאימות:\n- systemctl restart מפעיל מחדש את השירות בלי לבדוק למה הוא נכשל — אם הבעיה מבנית, הוא פשוט ייכשל שוב.\n- dmesg מציג הודעות kernel (drivers, hardware) — לא לוגים של שירותי userspace.\n- ifconfig מציג הגדרות רשת — לא קשור לכשל של שירות ספציפי.",
          },
          {
            q: "צריך לבדוק אם שירות nginx פעיל.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "systemctl status nginx",
              "cat /var/log/nginx/error.log",
              "top -u nginx",
              "netstat -tlnp",
            ],
            answer: 0,
            explanation: "systemctl status nginx מספק תמונה מלאה בפקודה אחת: האם השירות active/inactive/failed, מה ה-PID, כמה זמן הוא רץ, ומספר שורות לוג אחרונות. זה תמיד הצעד הראשון.\n\nלמה האחרות פחות מתאימות:\n- cat /var/log/nginx/error.log מציג שגיאות ספציפיות, אבל לא אומר אם השירות רץ כרגע — וגם לא כל שירות כותב ללוג בנתיב צפוי.\n- top -u nginx מסנן תהליכים לפי user, אבל nginx לא תמיד רץ כ-user בשם nginx — ואם השירות כבוי, פשוט לא יופיע.\n- netstat -tlnp מציג פורטים פתוחים — יכול להראות שפורט 80 פתוח, אבל לא בהכרח ע\"י nginx.\n\nבפרקטיקה: systemctl status → journalctl -u → רק אז בדיקת לוגים ורשת.",
          },
          {
            q: "אתה רוצה לעקוב אחרי קובץ לוג בזמן אמת.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "cat /var/log/syslog",
              "grep error /var/log/syslog",
              "tail -f /var/log/syslog",
              "head -100 /var/log/syslog",
            ],
            answer: 2,
            explanation: "tail -f (follow) שומר את הקובץ פתוח ומציג שורות חדשות ברגע שהן נכתבות. זה הכלי הסטנדרטי לניטור לוגים חיים — למשל כשאתה עושה deploy ורוצה לראות אם יש שגיאות.\n\nלמה האחרות לא מתאימות:\n- cat מדפיס את כל הקובץ ויוצא — לא עוקב אחרי שינויים. על קובץ לוג גדול זה גם יציף את הטרמינל.\n- grep error מחפש שגיאות קיימות ויוצא — לא מראה שורות חדשות שנכתבות.\n- head -100 מציג את 100 השורות הראשונות (הישנות ביותר) ויוצא — בדיוק ההפך ממה שצריך.\n\nטיפ: tail -f ניתן לשלב עם grep בזמן אמת — למשל tail -f /var/log/syslog | grep ERROR.",
          },
          {
            q: "אתה רואה שתהליך תקוע במצב D (uninterruptible sleep) בפלט של ps.\n\nמה הסיבה הסבירה?",
            options: [
              "התהליך ממתין לפעולת I/O (דיסק או רשת) שלא מסתיימת",
              "התהליך צורך יותר מדי CPU",
              "התהליך הוא zombie ויש להרוג את תהליך האב",
              "התהליך נעצר עם SIGSTOP",
            ],
            answer: 0,
            explanation: "מצב D (uninterruptible sleep) פירושו שהתהליך ממתין לפעולת I/O שה-kernel לא מאפשר לבטל. לרוב הסיבה היא דיסק שלא מגיב (כמו NFS mount תקוע, דיסק פיזי כושל, או בעיית storage driver).\n\nלמה האחרות שגויות:\n- צריכת CPU גבוהה מציגה מצב R (running), לא D — תהליך שעובד קשה לא \"ישן\".\n- zombie (מצב Z) הוא מצב אחר לגמרי — תהליך שסיים לרוץ אך האב לא אסף את קוד היציאה שלו.\n- SIGSTOP מעביר תהליך למצב T (stopped), לא D — וניתן לשחרר אותו עם SIGCONT.\n\nבפרקטיקה: תהליכים ב-D לא ניתנים להריגה עם kill -9 (כי ה-kernel חוסם signals). צריך לפתור את בעיית ה-I/O עצמה.",
          },
          {
            q: "אתה מנסה להתחבר לשרת מרוחק בפורט 8080 אבל החיבור נכשל.\n\nהרצת:\n\n```\ncurl -v http://remote-server:8080\n```\n\nפלט:\n\n```\n* connect to remote-server port 8080 failed: Connection refused\n```\n\nמה המשמעות?",
            options: [
              "השרת פועל אבל יש בעיית DNS",
              "אין שירות שמאזין על פורט 8080 בשרת המרוחק, או firewall שולח RST",
              "הבעיה היא בפורט המקומי של הלקוח",
              "יש בעיית תעודת SSL",
            ],
            answer: 1,
            explanation: "\"Connection refused\" פירושו שחבילת TCP SYN הגיעה לשרת (כלומר DNS ו-routing עובדים), אבל השרת ענה ב-RST — כי אף תהליך לא מאזין על הפורט, או ש-firewall מוגדר לדחות את החיבור.\n\nלמה האחרות שגויות:\n- אם הייתה בעיית DNS, השגיאה הייתה \"Could not resolve host\", לא \"Connection refused\".\n- הפורט המקומי נבחר אוטומטית (ephemeral port) — כמעט אף פעם לא הבעיה.\n- בעיית SSL מופיעה רק אחרי ש-TCP connection הצליח — כאן החיבור עצמו נכשל.\n\nהצעד הבא: לבדוק בשרת המרוחק עם ss -tlnp | grep 8080 אם יש תהליך שמאזין, ולבדוק חוקי firewall עם iptables -L.",
          },
          {
            q: "הרצת:\n\n```\nlsof +D /var/log/ | head -20\n```\n\nלמה הפקודה הזו שימושית?",
            options: [
              "היא מציגה את כל התהליכים שמחזיקים קבצים פתוחים בתיקיית /var/log/",
              "היא מוחקת קבצי לוג ישנים",
              "היא דוחסת קבצי לוג כדי לחסוך מקום",
              "היא מציגה את גודל כל קבצי הלוג",
            ],
            answer: 0,
            explanation: "lsof +D מציג את כל התהליכים שמחזיקים file handles פתוחים לקבצים בתיקייה. זה קריטי במיוחד לפני מחיקת לוגים או ביצוע unmount.\n\nלמה זה חשוב בפרקטיקה: אם מוחקים קובץ לוג שתהליך עדיין כותב אליו, ה-inode לא משתחרר — הדיסק לא מתפנה למרות שהקובץ \"נמחק\". du יראה מקום פנוי, אבל df לא. הפתרון: לסגור את ה-file handle (restart השירות, או logrotate שעושה copytruncate).\n\nלמה האחרות שגויות:\n- lsof לא מוחק שום דבר — הוא רק מציג מידע על קבצים פתוחים.\n- lsof לא דוחס קבצים — לשם כך משתמשים ב-gzip או logrotate.\n- lsof מציג תהליכים ו-file descriptors, לא גודל קבצים — לגודל משתמשים ב-du -sh.",
          },
        ],
        questionsEn: [
          {
            q: "You need to find the process consuming the most memory.\n\nWhich command is most appropriate?",
            options: [
              "ps aux --sort=-%mem | head",
              "cat /proc/meminfo",
              "vmstat 1",
              "df -h",
            ],
            answer: 0,
            explanation: "ps aux --sort=-%mem sorts all processes by memory usage in descending order, and head shows the top consumers. This is the standard first step when you suspect a memory leak or a runaway process.\n\nWhy the others don't fit:\n- cat /proc/meminfo shows system-wide memory summary but doesn't break it down by process — you can't tell who's consuming.\n- vmstat shows system-wide statistics (CPU, memory, I/O) but doesn't break down by individual process.\n- df -h shows disk usage, not memory — a completely different resource.\n\nIn practice: after identifying the top consumer, use tools like pmap or smem to investigate whether it's a leak or normal behavior.",
          },
          {
            q: "You ran:\n\n```\ndf -h\n```\n\nOutput:\n\n```\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   48G  2.0G  96% /\n```\n\nWhat is the issue and what is the first step?",
            options: [
              "Disk is almost full — identify large files with du -sh /* and delete/move as needed",
              "RAM is full — add swap",
              "CPU is overloaded — restart the server",
              "No issue, 96% usage is normal",
            ],
            answer: 0,
            explanation: "df -h shows 96% disk usage on the root partition, with only 2GB free out of 50GB. This is critical — when disk reaches 100%, services fail to write logs, databases crash, and even SSH may stop working.\n\nThe right step: du -sh /* shows the size of each root directory, quickly revealing what's consuming space (usually /var/log or /tmp).\n\nWhy the others are wrong:\n- RAM and disk are separate resources — df shows disk, not memory.\n- CPU is unrelated to disk usage, and a restart doesn't free space.\n- 96% is not normal — the standard practice is to act at 80-85%.",
          },
          {
            q: "A service won't start after a server reboot.\n\nWhich command will show the service logs?",
            options: [
              "systemctl restart service-name",
              "journalctl -u service-name --no-pager -n 50",
              "dmesg | tail",
              "ifconfig eth0",
            ],
            answer: 1,
            explanation: "journalctl -u service-name shows logs specific to a systemd service. The -n 50 flag limits output to the last 50 lines (enough to see the startup failure), and --no-pager displays directly in the terminal without less.\n\nThis is the correct first step: read the logs to understand why the service failed, then fix the issue.\n\nWhy the others don't fit:\n- systemctl restart retries without investigating the root cause — if the problem is structural, it will just fail again.\n- dmesg shows kernel messages (drivers, hardware) — not userspace service logs.\n- ifconfig shows network configuration — unrelated to a specific service failure.",
          },
          {
            q: "You need to check if the nginx service is running.\n\nWhich command is most appropriate?",
            options: [
              "systemctl status nginx",
              "cat /var/log/nginx/error.log",
              "top -u nginx",
              "netstat -tlnp",
            ],
            answer: 0,
            explanation: "systemctl status nginx provides a complete picture in one command: whether the service is active/inactive/failed, its PID, how long it's been running, and the last few log lines. This is always the first step.\n\nWhy the others are less appropriate:\n- cat /var/log/nginx/error.log shows specific errors but doesn't tell you if the service is currently running — and not every service writes to a predictable log path.\n- top -u nginx filters processes by user, but nginx doesn't always run as a user named 'nginx' — and if the service is down, it simply won't appear.\n- netstat -tlnp shows open ports — it can reveal that port 80 is open, but not necessarily by nginx.\n\nIn practice: systemctl status → journalctl -u → then check logs and network.",
          },
          {
            q: "You want to follow a log file in real time.\n\nWhich command is most appropriate?",
            options: [
              "cat /var/log/syslog",
              "grep error /var/log/syslog",
              "tail -f /var/log/syslog",
              "head -100 /var/log/syslog",
            ],
            answer: 2,
            explanation: "tail -f (follow) keeps the file open and displays new lines as they are written. This is the standard tool for live log monitoring — for example, watching for errors during a deployment.\n\nWhy the others don't fit:\n- cat prints the entire file and exits — it doesn't follow changes. On a large log file, it also floods the terminal.\n- grep error searches for existing errors and exits — it doesn't show new lines being written.\n- head -100 shows the first 100 lines (the oldest) and exits — the exact opposite of what you need.\n\nTip: tail -f can be combined with grep in real time — e.g., tail -f /var/log/syslog | grep ERROR.",
          },
          {
            q: "You see a process stuck in D state (uninterruptible sleep) in ps output.\n\nWhat is the likely cause?",
            options: [
              "The process is waiting for an I/O operation (disk or network) that won't complete",
              "The process is consuming too much CPU",
              "The process is a zombie and the parent process should be killed",
              "The process was stopped with SIGSTOP",
            ],
            answer: 0,
            explanation: "D state (uninterruptible sleep) means the process is waiting for an I/O operation that the kernel does not allow to be cancelled. Usually caused by an unresponsive disk (stuck NFS mount, failing physical disk, or a storage driver issue).\n\nWhy the others are wrong:\n- High CPU usage shows as R (running) state, not D — a busy process is not 'sleeping'.\n- A zombie (Z state) is completely different — a process that finished running but whose parent didn't collect its exit status.\n- SIGSTOP puts a process in T (stopped) state, not D — and it can be resumed with SIGCONT.\n\nIn practice: processes in D state cannot be killed with kill -9 (the kernel blocks signals). You must resolve the underlying I/O issue itself.",
          },
          {
            q: "You are trying to connect to a remote server on port 8080 but the connection fails.\n\nYou ran:\n\n```\ncurl -v http://remote-server:8080\n```\n\nOutput:\n\n```\n* connect to remote-server port 8080 failed: Connection refused\n```\n\nWhat does this mean?",
            options: [
              "The server is running but there is a DNS issue",
              "No service is listening on port 8080 on the remote server, or a firewall is sending RST",
              "The issue is with the local port on the client side",
              "There is an SSL certificate issue",
            ],
            answer: 1,
            explanation: "\"Connection refused\" means the TCP SYN packet reached the server (so DNS and routing work), but the server replied with RST — because no process is listening on the port, or a firewall is configured to reject the connection.\n\nWhy the others are wrong:\n- A DNS issue would show \"Could not resolve host\", not \"Connection refused\".\n- The local port is automatically chosen (ephemeral port) — almost never the problem.\n- SSL issues only appear after a TCP connection succeeds — here the connection itself failed.\n\nNext step: check on the remote server with ss -tlnp | grep 8080 to see if a process is listening, and review firewall rules with iptables -L.",
          },
          {
            q: "You ran:\n\n```\nlsof +D /var/log/ | head -20\n```\n\nWhy is this command useful?",
            options: [
              "It shows all processes holding open files in /var/log/",
              "It deletes old log files",
              "It compresses log files to save space",
              "It shows the size of all log files",
            ],
            answer: 0,
            explanation: "lsof +D shows all processes holding open file handles to files in a directory. This is especially critical before deleting logs or performing an unmount.\n\nWhy this matters in practice: if you delete a log file that a process is still writing to, the inode is not released — the disk space is not freed even though the file appears 'deleted'. du will show free space, but df won't. The fix: close the file handle (restart the service, or use logrotate with copytruncate).\n\nWhy the others are wrong:\n- lsof doesn't delete anything — it only displays information about open files.\n- lsof doesn't compress files — use gzip or logrotate for that.\n- lsof shows processes and file descriptors, not file sizes — use du -sh for sizes.",
          },
        ],
      },
      medium: {
        theory: "אבחון מתקדם כולל פרשנות פלטי ניטור, הבנת מצבי תהליכים, ניתוח לוגים מתקדם, ואבחון בעיות I/O ורשת ברמת המערכת.",
        theoryEn: "Advanced troubleshooting involves interpreting monitoring output, understanding process states, advanced log analysis, and diagnosing I/O and network issues at the system level.",
        questions: [
          {
            q: "שרת מגיב לאט.\n\nהרצת:\n\n```\ntop\n```\n\nאיזה ערך מציין עומס גבוה על ה-CPU?",
            options: [
              "ערך %idle גבוה (מעל 90%)",
              "ערך %wa גבוה (מעל 50%)",
              "ערך %us + %sy גבוה (מעל 90%) ו-%idle נמוך",
              "ערך load average נמוך מ-1",
            ],
            answer: 2,
            explanation: "top מציג כמה מדדי CPU בשורת %Cpu(s). הסימן לעומס CPU הוא %us (user) + %sy (system) גבוהים, עם %idle נמוך — כלומר ה-CPU כמעט לא \"בטל\". צריך להבין את ההבדל בין המדדים כדי לאבחן נכון.\n\nלמה האחרות שגויות:\n- %idle גבוה (מעל 90%) פירושו שה-CPU דווקא פנוי — ההפך מעומס.\n- %wa (I/O wait) גבוה מציין שה-CPU מחכה לדיסק, לא שהוא עצמו עמוס — הבעיה היא ב-I/O, לא ב-CPU. זו טעות נפוצה באבחון.\n- load average נמוך מ-1 מציין עומס קל — לא עומס גבוה.\n\nבפרקטיקה: אחרי שמזהים CPU עמוס ב-top, לוחצים P למיון לפי CPU ומזהים את התהליך הצרכן. אם %wa גבוה, הבעיה היא בדיסק ולא ב-CPU ויש לבדוק עם iostat.",
          },
          {
            q: "הרצת:\n\n```\nfree -h\n```\n\nפלט:\n\n```\n              total   used   free   shared  buff/cache  available\nMem:           16G    15G   200M     100M        800M       500M\n```\n\nמה המצב?",
            options: [
              "הכל תקין — רוב הזיכרון ב-cache ואפשר לשחרר אותו",
              "הזיכרון כמעט מלא — available רק 500M מתוך 16G, יש לבדוק אילו תהליכים צורכים הכי הרבה",
              "אין בעיה כי free מראה 200M פנויים",
              "צריך להפעיל מחדש את השרת כדי לשחרר זיכרון",
            ],
            answer: 1,
            explanation: "המפתח לקריאת free הוא עמודת available (לא free). available (500M) מייצג כמה זיכרון באמת זמין לתהליכים חדשים — הוא כולל free + cache שניתן לשחרור. כאן 500M מתוך 16G (3%) זה נמוך בצורה מסוכנת.\n\nלמה האחרות שגויות:\n- \"רוב הזיכרון ב-cache\" היה נכון אם available היה גבוה (למשל 12G). כאן buff/cache רק 800M ו-available רק 500M — כלומר רוב ה-used הוא שימוש אמיתי של תהליכים, לא cache.\n- free של 200M הוא מטעה — Linux משתמש בזיכרון פנוי ל-cache, אז free נמוך זה נורמלי. available הוא המדד האמיתי.\n- restart משחרר זיכרון אבל לא פותר את הבעיה — התהליכים יצרכו את אותו זיכרון שוב.\n\nהצעד הבא: ps aux --sort=-%mem | head לזהות את הצרכנים הגדולים, ולבדוק אם יש דליפת זיכרון.",
          },
          {
            q: "הרצת:\n\n```\nuptime\n```\n\nפלט:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nהשרת הוא 4-core. מה המצב?",
            options: [
              "השרת במצב תקין — load average נמוך",
              "ה-load average (12.5) גבוה פי 3 ממספר הליבות (4) — יש עומס חמור על המערכת",
              "load average לא קשור למספר ליבות",
              "הבעיה היא שיש 2 משתמשים מחוברים",
            ],
            answer: 1,
            explanation: "load average מייצג את מספר התהליכים הממוצע שממתינים לריצה (CPU queue + I/O wait). הערך 12.5 על שרת עם 4 ליבות אומר שבממוצע 8.5 תהליכים מחכים בתור — עומס חמור.\n\nשלושת המספרים מייצגים ממוצע ל-1, 5, ו-15 דקות: 12.5, 11.8, 8.2. המגמה עולה (8.2 → 12.5) — המצב מחמיר, לא משתפר.\n\nלמה האחרות שגויות:\n- 12.5 הוא פי 3 ממספר הליבות — זה ממש לא נמוך.\n- load average קשור ישירות למספר ליבות: load 4.0 על 4 cores = 100% ניצול. load 12.5 = 312% — תור ארוך.\n- מספר המשתמשים המחוברים (2) לא קשור ל-load — משתמש יכול להיות idle לגמרי.\n\nהצעד הבא: top כדי לזהות אם הבעיה היא CPU (%us/%sy) או I/O (%wa), ואז iotop או pidstat.",
          },
          {
            q: "הרצת:\n\n```\nss -tlnp\n```\n\nפלט:\n\n```\nState    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN   0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nמה אנחנו רואים?",
            options: [
              "nginx מאזין על פורטים 80 ו-443 על כל ממשקי הרשת",
              "nginx לא פועל כי אין חיבורים פעילים",
              "יש בעיית firewall שחוסמת את הפורטים",
              "nginx מאזין רק על localhost",
            ],
            answer: 0,
            explanation: "הפלט מראה שני listening sockets של nginx. הכתובת 0.0.0.0 פירושה \"כל ממשקי הרשת\" — השירות נגיש מבחוץ ולא רק מ-localhost.\n\nצריך לקרוא את כל השדות כדי לפרש נכון:\n- State=LISTEN: הפורט פתוח ומחכה לחיבורים (זה לא אומר שאין חיבורים — ss -t בלי -l יציג חיבורים פעילים).\n- 0.0.0.0:80 ו-443: HTTP ו-HTTPS סטנדרטיים.\n- users: nginx עם PID 1234.\n\nלמה האחרות שגויות:\n- \"nginx לא פועל\" — ההפך, LISTEN מוכיח שהוא רץ ומאזין. חיבורים פעילים לא מופיעים ב-ss -l.\n- \"בעיית firewall\" — ss מציג מה מאזין ברמת ה-OS. firewall לא נראה כאן — צריך iptables -L לבדוק.\n- \"רק localhost\" — אם היה מאזין רק על localhost, הכתובת הייתה 127.0.0.1:80, לא 0.0.0.0:80.",
          },
          {
            q: "יש לך קובץ לוג בגודל 2GB ואתה צריך למצוא את כל השורות שמכילות \"ERROR\" מהשעה האחרונה.\n\nאיזו גישה הכי יעילה?",
            options: [
              "cat log.txt | grep ERROR",
              "grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
              "tail -f log.txt",
              "head -1000 log.txt | grep ERROR",
            ],
            answer: 1,
            explanation: "הגישה הנכונה משלבת שני סינונים: grep ERROR מסנן רק שורות שגיאה, ואז grep נוסף עם timestamp של השעה האחרונה מצמצם לחלון הזמן הרלוונטי. grep ישירות על הקובץ (בלי cat) יעיל יותר כי נחסכת pipe מיותרת.\n\nלמה האחרות פחות טובות:\n- cat log.txt | grep ERROR — זה UUOC (Useless Use of Cat): cat קורא את כל 2GB לזיכרון ומעביר דרך pipe, בעוד grep יכול לקרוא ישירות. וגם — מחזיר את כל השגיאות מכל הזמנים, לא רק מהשעה האחרונה.\n- tail -f עוקב בזמן אמת אבל לא מחפש בהיסטוריה — מתאים לניטור, לא לחקירה.\n- head -1000 מציג 1000 שורות מתחילת הקובץ (הישנות ביותר) — בדיוק ההפך מהשעה האחרונה.\n\nבפרקטיקה: על קובץ 2GB, היעילות חשובה. אפשרות מתקדמת יותר: awk '/timestamp/,0' log.txt | grep ERROR.",
          },
          {
            q: "הרצת:\n\n```\nps aux\n```\n\nאתה רואה תהליך במצב Z (zombie).\n\nמה הדרך הנכונה לטפל בו?",
            options: [
              "kill -9 על התהליך ה-zombie עצמו",
              "לזהות ולהרוג או להפעיל מחדש את תהליך האב (parent process) כדי שיקרא wait()",
              "להפעיל מחדש את השרת",
              "להתעלם — zombies תמיד נעלמים מעצמם",
            ],
            answer: 1,
            explanation: "תהליך zombie (Z) הוא תהליך שסיים לרוץ, אבל הרשומה שלו עדיין בטבלת התהליכים כי תהליך האב לא קרא wait() לאסוף את exit status שלו. הפתרון: לגרום לאב לטפל — שליחת SIGCHLD, או בהכרח restart של האב.\n\nלמה האחרות שגויות:\n- kill -9 על zombie לא עובד — התהליך כבר מת, אין לו קוד שרץ. ה-kernel שומר רק את ה-PID ואת exit status בטבלה.\n- restart שרת הוא פטיש גדול מדי — zombie לא צורך משאבים (רק שורה בטבלת תהליכים). restart פוגע בכל השירותים.\n- zombies לא נעלמים מעצמם — הם נשארים עד שהאב קורא wait() או עד שהאב עצמו מת (ואז init/systemd מאמץ אותם ומנקה).\n\nבפרקטיקה: zombie בודד הוא לא בעיה. אלפי zombies מצביעים על bug בתהליך האב שלא מנהל ילדים נכון.",
          },
          {
            q: "הרצת:\n\n```\niostat -x 1 3\n```\n\nפלט:\n\n```\nDevice   r/s    w/s   rkB/s   wkB/s  await  %util\nsda      5.00  450.00  20.00 51200.00 250.00  99.80\n```\n\nמה המסקנה?",
            options: [
              "הדיסק sda רווי (%util 99.8%) עם זמן המתנה גבוה (await 250ms) — יש צוואר בקבוק I/O",
              "כמות הקריאות (5/s) נמוכה מדי",
              "הדיסק תקין — %util גבוה זה רגיל בשרת עמוס",
              "הבעיה היא רק בכמות הכתיבות",
            ],
            answer: 0,
            explanation: "צריך לקרוא כמה מדדים ביחד כדי לאבחן I/O:\n- %util 99.8% — הדיסק עסוק כמעט 100% מהזמן, אין לו רגע מנוחה.\n- await 250ms — כל פעולת I/O לוקחת רבע שנייה בממוצע. ל-SSD ערך תקין הוא פחות מ-1ms, ל-HDD פחות מ-10ms. 250ms הוא קטסטרופלי.\n- wkB/s 51,200 — כ-50MB/s כתיבה, שזה עומס כבד.\n\nלמה האחרות שגויות:\n- קריאות נמוכות (5/s) לא מצביעות על בעיה — הן פשוט לא הגורם לעומס. הכתיבות הן הבעיה.\n- %util 99.8% זה לא \"רגיל\" — שרת בריא אמור להראות %util נמוך עם await נמוך. ערכים כאלה גורמים לכל תהליך שכותב לדיסק להאט.\n- הבעיה היא לא רק בכמות הכתיבות — await הגבוה פוגע גם בקריאות. %util מראה שהדיסק עצמו מוצף.\n\nהצעד הבא: iotop לזהות איזה תהליך כותב 50MB/s.",
          },
          {
            q: "קונטיינר נהרג באופן בלתי צפוי.\n\nהרצת:\n\n```\ndmesg | tail -20\n```\n\nפלט:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nמה קרה ומה הפתרון?",
            options: [
              "OOM Killer הרג את התהליך כי הוא חרג ממגבלת הזיכרון — יש להגדיל את memory limit או לייעל את צריכת הזיכרון",
              "התהליך קרס בגלל bug בקוד — יש לעדכן את הגרסה",
              "הדיסק התמלא — יש לפנות מקום",
              "ה-CPU הגיע ל-100% — יש להוסיף cores",
            ],
            answer: 0,
            explanation: "ההודעה \"Out of memory: Killed process\" מ-dmesg היא הסימן המובהק של Linux OOM Killer — מנגנון kernel שהורג תהליכים כשנגמר הזיכרון כדי להציל את המערכת מקריסה מלאה.\n\nהפלט מספק רמזים: anon-rss (3GB) מראה כמה זיכרון פיזי התהליך השתמש. total-vm (4GB) מראה את כל הזיכרון הווירטואלי שביקש.\n\nלמה האחרות שגויות:\n- bug בקוד יגרום ל-segfault או exception — לא להודעת OOM מה-kernel. ה-kernel הרג את התהליך, לא הקוד עצמו.\n- דיסק מלא גורם לשגיאות כתיבה (ENOSPC), לא להריגת תהליכים. OOM הוא על זיכרון RAM.\n- CPU ב-100% גורם לאיטיות, לא להריגת תהליכים. ה-kernel לא הורג תהליכים בגלל CPU.\n\nהפתרון: הגדלת memory limits ב-cgroup/container spec, או אופטימיזציה של צריכת הזיכרון (heap size ב-Java, memory leaks). ב-Kubernetes: להגדיל resources.limits.memory.",
          },
        ],
        questionsEn: [
          {
            q: "A server is responding slowly.\n\nYou ran:\n\n```\ntop\n```\n\nWhich value indicates high CPU load?",
            options: [
              "High %idle (above 90%)",
              "High %wa (above 50%)",
              "High %us + %sy (above 90%) and low %idle",
              "Load average below 1",
            ],
            answer: 2,
            explanation: "top displays several CPU metrics in the %Cpu(s) line. The signal for CPU load is high %us (user) + %sy (system) with low %idle — meaning the CPU barely has any idle time. You need to understand the differences between metrics to diagnose correctly.\n\nWhy the others are wrong:\n- High %idle (above 90%) means the CPU is mostly free — the opposite of load.\n- High %wa (I/O wait) means the CPU is waiting for disk, not that the CPU itself is busy — the problem is I/O, not CPU. This is a common misdiagnosis.\n- Load average below 1 indicates light load — not high load.\n\nIn practice: after spotting high CPU in top, press P to sort by CPU usage and identify the consuming process. If %wa is high, the problem is disk, not CPU — investigate with iostat.",
          },
          {
            q: "You ran:\n\n```\nfree -h\n```\n\nOutput:\n\n```\n              total   used   free   shared  buff/cache  available\nMem:           16G    15G   200M     100M        800M       500M\n```\n\nWhat is the situation?",
            options: [
              "Everything is fine — most memory is in cache and can be freed",
              "Memory is nearly exhausted — only 500M available out of 16G, investigate which processes are consuming the most",
              "No problem since free shows 200M available",
              "Need to restart the server to free memory",
            ],
            answer: 1,
            explanation: "The key to reading free is the available column (not free). available (500M) represents how much memory is actually usable for new processes — it includes free + reclaimable cache. Here, 500M out of 16G (3%) is dangerously low.\n\nWhy the others are wrong:\n- \"Most memory in cache\" would be true if available were high (e.g., 12G). Here buff/cache is only 800M and available is only 500M — most of used is actual process consumption, not cache.\n- free of 200M is misleading — Linux uses spare memory for cache, so low free is normal. available is the true metric.\n- Restart frees memory but doesn't solve the problem — the processes will consume the same memory again.\n\nNext step: ps aux --sort=-%mem | head to identify top consumers and check for memory leaks.",
          },
          {
            q: "You ran:\n\n```\nuptime\n```\n\nOutput:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nThe server has 4 cores. What is the situation?",
            options: [
              "The server is in good shape — load average is low",
              "Load average (12.5) is 3x the core count (4) — the system is under severe load",
              "Load average is not related to the number of cores",
              "The issue is that there are 2 users connected",
            ],
            answer: 1,
            explanation: "Load average represents the average number of processes waiting to run (CPU queue + I/O wait). 12.5 on a 4-core server means on average 8.5 processes are waiting in queue — severe load.\n\nThe three numbers represent 1, 5, and 15-minute averages: 12.5, 11.8, 8.2. The rising trend (8.2 → 12.5) shows the situation is getting worse, not better.\n\nWhy the others are wrong:\n- 12.5 is 3x the core count — definitely not low.\n- Load average is directly related to core count: load 4.0 on 4 cores = 100% utilization. Load 12.5 = 312% — a long queue.\n- The number of connected users (2) is unrelated to load — a user can be completely idle.\n\nNext step: top to identify whether the problem is CPU (%us/%sy) or I/O (%wa), then iotop or pidstat.",
          },
          {
            q: "You ran:\n\n```\nss -tlnp\n```\n\nOutput:\n\n```\nState    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN   0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nWhat do we see?",
            options: [
              "nginx is listening on ports 80 and 443 on all network interfaces",
              "nginx is not running because there are no active connections",
              "There is a firewall issue blocking the ports",
              "nginx is listening only on localhost",
            ],
            answer: 0,
            explanation: "The output shows two listening sockets for nginx. The address 0.0.0.0 means 'all network interfaces' — the service is accessible externally, not just from localhost.\n\nYou need to read all fields to interpret correctly:\n- State=LISTEN: the port is open and waiting for connections (this doesn't mean no connections exist — ss -t without -l shows active connections).\n- 0.0.0.0:80 and 443: standard HTTP and HTTPS.\n- users: nginx with PID 1234.\n\nWhy the others are wrong:\n- 'nginx is not running' — the opposite; LISTEN proves it's running and listening. Active connections don't appear in ss -l.\n- 'firewall issue' — ss shows what's listening at the OS level. Firewall isn't visible here — use iptables -L to check.\n- 'only on localhost' — if it were localhost-only, the address would be 127.0.0.1:80, not 0.0.0.0:80.",
          },
          {
            q: "You have a 2GB log file and need to find all lines containing \"ERROR\" from the last hour.\n\nWhich approach is most efficient?",
            options: [
              "cat log.txt | grep ERROR",
              "grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
              "tail -f log.txt",
              "head -1000 log.txt | grep ERROR",
            ],
            answer: 1,
            explanation: "The correct approach combines two filters: grep ERROR filters only error lines, then a second grep with the last hour's timestamp narrows to the relevant time window. Using grep directly on the file (without cat) is more efficient — no unnecessary pipe.\n\nWhy the others are less effective:\n- cat log.txt | grep ERROR — this is UUOC (Useless Use of Cat): cat reads all 2GB into memory and pipes it, while grep can read the file directly. Also, it returns all errors from all time, not just the last hour.\n- tail -f follows in real time but doesn't search history — suitable for monitoring, not investigation.\n- head -1000 shows the first 1000 lines (the oldest) and exits — the exact opposite of the last hour.\n\nIn practice: on a 2GB file, efficiency matters. A more advanced option: awk '/timestamp/,0' log.txt | grep ERROR.",
          },
          {
            q: "You ran:\n\n```\nps aux\n```\n\nYou see a process in Z state (zombie).\n\nWhat is the correct way to handle it?",
            options: [
              "kill -9 the zombie process itself",
              "Identify and kill or restart the parent process so it calls wait()",
              "Restart the server",
              "Ignore it — zombies always disappear on their own",
            ],
            answer: 1,
            explanation: "A zombie (Z) process has finished running, but its entry remains in the process table because the parent didn't call wait() to collect its exit status. The fix: get the parent to handle it — send SIGCHLD, or restart the parent if necessary.\n\nWhy the others are wrong:\n- kill -9 on a zombie doesn't work — the process is already dead, there's no code running. The kernel only keeps the PID and exit status in the table.\n- Server restart is overkill — a zombie consumes no resources (just one entry in the process table). A restart disrupts all services.\n- Zombies don't disappear on their own — they persist until the parent calls wait() or until the parent itself dies (then init/systemd adopts and cleans them).\n\nIn practice: a single zombie is harmless. Thousands of zombies indicate a bug in the parent process that isn't managing child processes properly.",
          },
          {
            q: "You ran:\n\n```\niostat -x 1 3\n```\n\nOutput:\n\n```\nDevice   r/s    w/s   rkB/s   wkB/s  await  %util\nsda      5.00  450.00  20.00 51200.00 250.00  99.80\n```\n\nWhat is the conclusion?",
            options: [
              "Disk sda is saturated (%util 99.8%) with high wait time (await 250ms) — there is an I/O bottleneck",
              "The number of reads (5/s) is too low",
              "The disk is fine — high %util is normal for a busy server",
              "The problem is only the number of writes",
            ],
            answer: 0,
            explanation: "You need to read multiple metrics together to diagnose I/O:\n- %util 99.8% — the disk is busy nearly 100% of the time, with no breathing room.\n- await 250ms — each I/O operation takes a quarter second on average. For SSD, normal is under 1ms; for HDD, under 10ms. 250ms is catastrophic.\n- wkB/s 51,200 — about 50MB/s writes, which is a heavy workload.\n\nWhy the others are wrong:\n- Low reads (5/s) don't indicate a problem — they're just not the source of the load. The writes are the issue.\n- 99.8% %util is not 'normal' — a healthy server should show low %util with low await. Values like these cause every process that writes to disk to slow down.\n- The problem isn't just write count — the high await affects reads too. %util shows the disk itself is overwhelmed.\n\nNext step: iotop to identify which process is writing 50MB/s.",
          },
          {
            q: "A container was unexpectedly killed.\n\nYou ran:\n\n```\ndmesg | tail -20\n```\n\nOutput:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nWhat happened and what is the solution?",
            options: [
              "OOM Killer terminated the process because it exceeded its memory limit — increase the memory limit or optimize memory usage",
              "The process crashed due to a code bug — update the version",
              "The disk was full — free up space",
              "CPU reached 100% — add more cores",
            ],
            answer: 0,
            explanation: "The message 'Out of memory: Killed process' from dmesg is the unmistakable sign of the Linux OOM Killer — a kernel mechanism that kills processes when memory runs out to save the system from a complete crash.\n\nThe output provides clues: anon-rss (3GB) shows how much physical memory the process used. total-vm (4GB) shows all virtual memory it requested.\n\nWhy the others are wrong:\n- A code bug would cause a segfault or exception — not an OOM message from the kernel. The kernel killed the process, not the code itself.\n- Full disk causes write errors (ENOSPC), not process killing. OOM is about RAM, not disk.\n- 100% CPU causes slowness, not process killing. The kernel doesn't kill processes for CPU usage.\n\nSolution: increase memory limits in cgroup/container spec, or optimize memory consumption (Java heap size, fix memory leaks). In Kubernetes: increase resources.limits.memory.",
          },
        ],
      },
      hard: {
        theory: "אבחון מערכת מתקדם כולל ניתוח ביצועים עם perf ו-strace, אבחון בעיות kernel עם dmesg ו-/proc, ניהול cgroups, ואבחון בעיות רשת ברמת ה-TCP stack.",
        theoryEn: "Advanced system diagnostics includes performance analysis with perf and strace, kernel issue diagnosis with dmesg and /proc, cgroup management, and TCP stack-level network troubleshooting.",
        questions: [
          {
            q: "אתה צריך לאבחן למה תהליך מסוים איטי.\n\nהרצת:\n\n```\nstrace -c -p 1234\n```\n\nפלט:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nמה המסקנה?",
            options: [
              "התהליך מבזבז 85% מהזמן על futex (lock contention) — יש בעיית concurrency שדורשת בדיקה",
              "התהליך עושה יותר מדי קריאות read — צריך caching",
              "התהליך כותב יותר מדי לדיסק — צריך buffer גדול יותר",
              "אין בעיה, futex הוא חלק נורמלי מריצת תהליך",
            ],
            answer: 0,
            explanation: "strace -c מסכם את כל ה-system calls לפי זמן. 85% על futex (Fast Userspace muTEX) זה סימן אדום — futex הוא ה-syscall שמאחורי mutexes, condition variables, ו-semaphores. כשתהליך מבלה את רוב זמנו ב-futex, הוא ממתין ל-locks במקום לעבוד.\n\nלמה האחרות שגויות:\n- read תופס רק 8.3% — 500 קריאות ב-0.4 שניות זה סביר לגמרי. Caching יעזור ל-I/O, אבל זו לא הבעיה כאן.\n- write תופס רק 3.1% — 200 כתיבות ב-0.15 שניות. Buffer גדול יותר לא ישנה כלום כשה-bottleneck הוא locks.\n- futex בכמויות קטנות הוא נורמלי. אבל 85% מהזמן זה פתולוגי — סימן ל-deadlock חלקי, lock contention בין threads, או מבנה נתונים עם mutex אחד שכולם מתחרים עליו.\n\nהצעד הבא: strace -e futex -p 1234 לראות על איזה futex address ממתינים, ואז perf record -g לזהות את ה-call stack שמוביל ל-lock.",
          },
          {
            q: "שרת מדווח על latency גבוה לבקשות רשת.\n\nהרצת:\n\n```\ncat /proc/net/sockstat\n```\n\nפלט:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nמה הבעיה?",
            options: [
              "מספר גבוה של orphan sockets (12500) ו-TIME_WAIT (65000) מצביע על connections שלא נסגרים כראוי",
              "מספר ה-TCP connections (28542) נמוך מדי לשרת פעיל",
              "צריכת הזיכרון של ה-TCP stack (95000 pages) תקינה",
              "אין בעיה — המספרים נורמליים לשרת עמוס",
            ],
            answer: 0,
            explanation: "/proc/net/sockstat חושף את המצב הפנימי של ה-TCP stack. צריך להבין מה כל מספר אומר:\n\n- orphan 12500: חיבורים שאף process לא מחזיק בהם — לרוב connections שנסגרו ברמת האפליקציה אבל ה-kernel עדיין שומר state. 12,500 orphans מצביעים על אפליקציה שסוגרת sockets בלי לחכות ל-graceful shutdown.\n- tw 65000: חיבורים ב-TIME_WAIT — מצב TCP נורמלי שנמשך 2*MSL (בדרך כלל 60 שניות). 65,000 מצביע על קצב גבוה מאוד של חיבורים קצרי-חיים.\n- mem 95000: TCP memory pages — ייתכן שמתקרב למגבלה.\n\nלמה האחרות שגויות:\n- 28542 connections inuse אינם נמוכים מדי — הם בסדר, הבעיה היא ב-orphans ו-TIME_WAIT.\n- 95000 pages של TCP memory הוא גבוה — לא תקין.\n- המספרים לא נורמליים — בשרת בריא orphan צריך להיות קרוב ל-0 ו-tw צריך להיות נמוך יחסית.\n\nהפתרון: בדיקת tcp_tw_reuse, tcp_fin_timeout, tcp_max_orphans, ובעיקר — לוודא שהאפליקציה משתמשת ב-connection pooling ב-keepalive במקום לפתוח ולסגור חיבורים.",
          },
          {
            q: "הרצת:\n\n```\ncat /proc/buddyinfo\n```\n\nפלט:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nמה המצב?",
            options: [
              "המערכת סובלת מ-memory fragmentation חמור — אין בלוקים רציפים גדולים זמינים",
              "הזיכרון ריק לגמרי ויש להוסיף RAM",
              "הכל תקין — המספרים מייצגים שימוש נורמלי",
              "יש בעיית swap שצריך לטפל בה",
            ],
            answer: 0,
            explanation: "buddyinfo הוא חלון אל ה-buddy allocator של ה-kernel — מנגנון הקצאת הזיכרון הפיזי. כל מספר מייצג בלוקים פנויים מ-order 0 (4KB) עד order 10 (4MB).\n\nהפלט \"1 0 0 0 0 0 0 0 0 0 0\" אומר: יש רק בלוק אחד קטן (4KB) ואפס בלוקים בכל גודל אחר. זהו fragmentation קיצוני.\n\nלמה זה בעיה בפרקטיקה:\n- הקצאות שדורשות דפים רציפים (כמו huge pages של 2MB = order 9) ייכשלו.\n- Network drivers שצריכים compound pages לא יוכלו לקבל buffer.\n- RDMA, GPU drivers, וכל דבר שצריך DMA buffer גדול ייכשל.\n\nלמה האחרות שגויות:\n- \"זיכרון ריק\" — ההפך: הזיכרון מלא כמעט לגמרי, ומה שנשאר מפוצל.\n- \"תקין\" — בתצורה בריאה היו מספרים חיוביים בכל ה-orders, למשל \"500 300 150 80 40 20 10 5 2 1 0\".\n- swap לא פותר fragmentation — הוא מעביר דפים לדיסק, לא מסדר אותם ברצף.\n\nפתרון: echo 1 > /proc/sys/vm/compact_memory מבקש מה-kernel לדחוס זיכרון. אם לא עוזר — restart.",
          },
          {
            q: "אתה חושד שתהליך מדליף file descriptors.\n\nהרצת:\n\n```\nls /proc/1234/fd | wc -l\n```\n\nפלט:\n\n```\n45892\n```\n\nוגם:\n\n```\ncat /proc/1234/limits | grep 'Max open files'\n```\n\nפלט:\n\n```\nMax open files    65536    65536    files\n```\n\nמה המצב ומה עלול לקרות?",
            options: [
              "התהליך מחזיק 45,892 FDs מתוך מגבלה של 65,536 — הוא מתקרב למגבלה ועלול להיכשל עם EMFILE",
              "45,892 file descriptors זה מספר תקין לשרת עמוס",
              "המגבלה של 65,536 נמוכה מדי — יש להגדיל אותה",
              "הבעיה היא ב-soft limit ולא ב-hard limit",
            ],
            answer: 0,
            explanation: "/proc/<pid>/fd מציג את כל ה-file descriptors הפתוחים של תהליך, ו-/proc/<pid>/limits מציג את מגבלות ה-kernel. 45,892 מתוך 65,536 (70%) עם מגמת עלייה מצביע חד-משמעית על FD leak.\n\nתהליך תקין פותח וסוגר FDs — הוא לא צובר אותם. 45,892 FDs זה לא נורמלי אפילו לשרת עמוס מאוד (nginx עם 10,000 connections פתוחים מחזיק כ-20,000 FDs, לא 45,000).\n\nלמה האחרות שגויות:\n- 45,892 FDs לא תקין — שרת בריא מחזיק מאות עד אלפים בודדים.\n- הגדלת המגבלה רק דוחה את הקריסה — הדליפה תמשיך עד שגם המגבלה החדשה תיגמר, ובדרך תצרוך יותר kernel memory.\n- soft limit ו-hard limit שניהם 65536 — אין הבדל ביניהם כאן.\n\nכשיגיע ל-65,536, כל open(), socket(), accept() ייכשלו עם EMFILE. האפליקציה תפסיק לקבל חיבורים חדשים.\n\nאבחון: lsof -p 1234 | awk '{print $5}' | sort | uniq -c | sort -rn לזהות איזה סוג FDs דולף (sockets? files? pipes?).",
          },
          {
            q: "הרצת:\n\n```\nsar -n DEV 1 5\n```\n\nפלט (ממוצע):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nכרטיס הרשת הוא 1Gbps. מה הבעיה?",
            options: [
              "rxkB/s (115MB/s) מתקרב לקיבולת 1Gbps (~125MB/s) ויש 850 drops/s — כרטיס הרשת רווי ומאבד מנות",
              "מספר המנות (95,000/s) תקין לשרת בעומס",
              "הבעיה היא ב-txdrop — rxdrop לא רלוונטי",
              "יש לעבור ל-UDP במקום TCP",
            ],
            answer: 0,
            explanation: "צריך לשלב שלושה סימנים כדי לאבחן NIC saturation:\n\n1. rxkB/s = 115,000 KB/s = 115 MB/s. קיבולת 1Gbps = 125 MB/s תיאורטית (בפרקטיקה ~117MB/s עם overhead). 115MB/s = 92% ניצול — הכרטיס כמעט מלא.\n2. rxdrop/s = 850. הכרטיס מפיל 850 מנות בשנייה כי ה-ring buffer מלא — זה traffic loss אמיתי שגורם ל-retransmissions ו-latency.\n3. txdrop/s = 0 — הבעיה היא בקליטה, לא בשליחה.\n\nלמה האחרות שגויות:\n- 95,000 pps (packets per second) הוא גבוה מאוד, אבל הבעיה האמיתית היא bandwidth בבתים, לא מספר מנות.\n- txdrop = 0 זה סימן טוב — הבעיה היא ב-rxdrop, לא txdrop. הטענה הפוכה.\n- UDP לא פותר NIC saturation — הבעיה היא בקיבולת הפיזית של כרטיס הרשת, לא בפרוטוקול.\n\nפתרון: שדרוג ל-10Gbps, הפעלת RSS (Receive Side Scaling) לפזר עיבוד בין cores, הגדלת ring buffer (ethtool -G), או חלוקת traffic בין ממשקים עם bonding.",
          },
          {
            q: "הרצת:\n\n```\nperf top\n```\n\nפלט:\n\n```\n  35.2%  [kernel]        [k] _raw_spin_lock\n  18.1%  [kernel]        [k] copy_user_generic_unrolled\n  12.4%  libc.so.6       [.] __memcpy_avx2\n   8.3%  myapp           [.] parse_request\n```\n\nמה המסקנה?",
            options: [
              "35% מזמן ה-CPU מתבזבז על kernel spinlock — יש contention חמור בין cores על משאב משותף",
              "הבעיה העיקרית היא ב-memcpy — צריך לייעל העתקות זיכרון",
              "parse_request הוא צוואר הבקבוק כי הוא הפונקציה היחידה מהאפליקציה",
              "הכל תקין — kernel functions תמיד בראש הרשימה ב-perf",
            ],
            answer: 0,
            explanation: "perf top מדגם את ה-CPU ומראה איפה הוא מבלה את רוב הזמן. 35% על _raw_spin_lock הוא סימן אדום חמור — spinlock הוא busy-wait loop שבו cores מסתובבים בלולאה ומחכים לנעילה, ושורפים CPU תוך כדי.\n\nצריך לקרוא את הנתונים ביחד:\n- _raw_spin_lock (35%) — contention ב-kernel space. לרוב קשור ל-networking stack, I/O scheduler, או מבנה נתונים משותף.\n- copy_user_generic_unrolled (18%) — העתקת נתונים בין kernel space ל-user space (read/write syscalls). תומך באבחנה שיש I/O כבד.\n- __memcpy_avx2 (12%) — העתקות זיכרון ב-user space. הגיוני אם יש עיבוד נתונים.\n- parse_request (8.3%) — הפונקציה מהאפליקציה שצורכת הכי הרבה CPU.\n\nלמה האחרות שגויות:\n- memcpy תופס 12% — בעייתי, אבל לא הבעיה העיקרית כש-spinlock תופס 35%.\n- parse_request ב-8.3% הוא לא bottleneck — 35% של spinlock הוא 4 פעמים יותר.\n- kernel functions לא תמיד בראש. בעומס רגיל, אמורים לראות user-space functions בראש.\n\nהצעד הבא: perf record -g -a sleep 10 ואז perf report לראות את ה-call stack המלא — לזהות מאיפה מגיע ה-spinlock.",
          },
          {
            q: "שרת לא מצליח ליצור חיבורי רשת חדשים.\n\nהרצת:\n\n```\nsysctl net.ipv4.ip_local_port_range\n```\n\nפלט:\n\n```\nnet.ipv4.ip_local_port_range = 32768    60999\n```\n\nוגם:\n\n```\nss -s\n```\n\nפלט:\n\n```\nTCP:   28231 (estab 25000, closed 0, orphaned 0, tw 3200)\n```\n\nמה הבעיה?",
            options: [
              "טווח הפורטים הזמינים (28,232 פורטים) כמעט מלא עם 28,231 חיבורים — אזילת ephemeral ports",
              "יותר מדי orphaned connections צורכים משאבים",
              "25,000 established connections זה מעבר ליכולת השרת",
              "הגדרות ה-TCP stack תקינות, הבעיה ב-DNS resolution",
            ],
            answer: 0,
            explanation: "זו בעיה שדורשת חישוב: ip_local_port_range = 32768–60999 נותן 60999 - 32768 + 1 = 28,232 פורטים ephemeral. ss -s מראה 28,231 TCP connections. נשאר פורט אחד בלבד — כל ניסיון ליצור חיבור חדש ייכשל עם EADDRNOTAVAIL.\n\nחלוקת ה-28,231: 25,000 established (חיבורים פעילים) + 3,200 TIME_WAIT (חיבורים שנסגרו אבל ממתינים 60 שניות). שני הסוגים צורכים פורט.\n\nלמה האחרות שגויות:\n- orphaned = 0 — אין orphans בכלל, אז זו לא הבעיה.\n- 25,000 established connections אינם מעבר ליכולת — Linux יכול להחזיק מיליוני connections. הבעיה היא בפורטים, לא בחיבורים.\n- DNS לא קשור — הבעיה היא שאין פורטים locales לפתוח sockets.\n\nפתרון מדורג:\n1. הרחבת טווח: sysctl -w net.ipv4.ip_local_port_range=\"1024 65535\" (מ-28K ל-64K פורטים).\n2. מיחזור: sysctl -w net.ipv4.tcp_tw_reuse=1 (שימוש חוזר ב-TIME_WAIT ports).\n3. ארכיטקטורה: שימוש ב-connection pooling במקום חיבורים קצרי-חיים.",
          },
          {
            q: "אחרי שדרוג kernel, שרת מציג:\n\n```\ndmesg | grep -i error\n```\n\nפלט:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nמה error -12 מציין?",
            options: [
              "Error -12 הוא ENOMEM (Out of Memory) — ה-driver nouveau נכשל בהקצאת זיכרון בזמן אתחול",
              "Error -12 הוא שגיאת permission — צריך להריץ כ-root",
              "Error -12 מציין שהכרטיס הגרפי פגום פיזית",
              "Error -12 הוא שגיאת ACPI בלבד ולא קשור ל-driver",
            ],
            answer: 0,
            explanation: "בקוד ה-kernel של Linux, ערכי שגיאה שליליים מוגדרים ב-include/uapi/asm-generic/errno-base.h. צריך לדעת לפענח אותם כדי לקרוא dmesg:\n- -1 = EPERM (Permission denied)\n- -2 = ENOENT (No such file)\n- -12 = ENOMEM (Cannot allocate memory)\n- -13 = EACCES (Permission denied)\n- -22 = EINVAL (Invalid argument)\n\nבמקרה הזה, nouveau (ה-driver הפתוח של NVIDIA) ניסה להקצות זיכרון DMA בזמן probe (אתחול) ונכשל. זה שכיח אחרי שדרוג kernel כי משתנים memory management internals.\n\nלמה האחרות שגויות:\n- Permission error הוא -1 (EPERM) או -13 (EACCES), לא -12. וגם — drivers שרצים ב-kernel space הם כבר root.\n- פגם פיזי בכרטיס יציג שגיאות שונות (PCIe errors, timeout) — ENOMEM הוא בעיית software/memory.\n- שגיאת ה-ACPI בשורה הראשונה היא נפרדת — ה-error -12 בשורה השנייה הוא ספציפית של nouveau.\n\nפתרון: nouveau.modeset=0 ב-kernel command line (משבית את ה-driver), או התקנת ה-proprietary NVIDIA driver, או בדיקת תאימות kernel-driver.",
          },
        ],
        questionsEn: [
          {
            q: "You need to diagnose why a specific process is slow.\n\nYou ran:\n\n```\nstrace -c -p 1234\n```\n\nOutput:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nWhat is the conclusion?",
            options: [
              "The process spends 85% of time on futex (lock contention) — there is a concurrency issue that needs investigation",
              "The process makes too many read calls — needs caching",
              "The process writes too much to disk — needs a larger buffer",
              "No issue, futex is a normal part of process execution",
            ],
            answer: 0,
            explanation: "strace -c summarizes all system calls by time. 85% on futex (Fast Userspace muTEX) is a red flag — futex is the syscall behind mutexes, condition variables, and semaphores. When a process spends most of its time on futex, it's waiting for locks instead of doing work.\n\nWhy the others are wrong:\n- read accounts for only 8.3% — 500 calls in 0.4 seconds is perfectly reasonable. Caching helps I/O, but that's not the bottleneck here.\n- write accounts for only 3.1% — 200 writes in 0.15 seconds. A larger buffer won't help when the bottleneck is locks.\n- futex in small amounts is normal. But 85% of time is pathological — a sign of partial deadlock, lock contention between threads, or a data structure with a single mutex that everyone competes for.\n\nNext step: strace -e futex -p 1234 to see which futex address they're waiting on, then perf record -g to identify the call stack leading to the lock.",
          },
          {
            q: "A server reports high latency for network requests.\n\nYou ran:\n\n```\ncat /proc/net/sockstat\n```\n\nOutput:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nWhat is the problem?",
            options: [
              "High number of orphan sockets (12500) and TIME_WAIT (65000) indicate connections not closing properly",
              "TCP connection count (28542) is too low for an active server",
              "TCP stack memory usage (95000 pages) is normal",
              "No problem — the numbers are normal for a busy server",
            ],
            answer: 0,
            explanation: "/proc/net/sockstat exposes the internal state of the TCP stack. You need to understand what each number means:\n\n- orphan 12500: connections not owned by any process — usually sockets closed at the application level while the kernel still holds state. 12,500 orphans indicate an application closing sockets without waiting for graceful shutdown.\n- tw 65000: connections in TIME_WAIT — a normal TCP state lasting 2*MSL (usually 60 seconds). 65,000 indicates an extremely high rate of short-lived connections.\n- mem 95000: TCP memory pages — possibly approaching the limit.\n\nWhy the others are wrong:\n- 28542 inuse connections aren't too low — they're fine. The problem is orphans and TIME_WAIT.\n- 95000 pages of TCP memory is high — not normal.\n- These numbers aren't normal — in a healthy server, orphan should be near 0 and tw should be relatively low.\n\nFix: check tcp_tw_reuse, tcp_fin_timeout, tcp_max_orphans, and ensure the application uses connection pooling with keepalive instead of opening and closing connections.",
          },
          {
            q: "You ran:\n\n```\ncat /proc/buddyinfo\n```\n\nOutput:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nWhat is the situation?",
            options: [
              "The system suffers from severe memory fragmentation — no large contiguous blocks are available",
              "Memory is completely empty and RAM needs to be added",
              "Everything is fine — the numbers represent normal usage",
              "There is a swap issue that needs to be addressed",
            ],
            answer: 0,
            explanation: "buddyinfo is a window into the kernel's buddy allocator — the physical memory allocation mechanism. Each number represents free blocks from order 0 (4KB) to order 10 (4MB).\n\nThe output '1 0 0 0 0 0 0 0 0 0 0' means: there's only one small block (4KB) and zero blocks of every other size. This is extreme fragmentation.\n\nWhy this matters in practice:\n- Allocations requiring contiguous pages (like 2MB huge pages = order 9) will fail.\n- Network drivers that need compound pages for buffers can't allocate.\n- RDMA, GPU drivers, and anything requiring large DMA buffers will fail.\n\nWhy the others are wrong:\n- 'Memory is empty' — the opposite: memory is almost entirely full, and what's left is fragmented.\n- 'Normal' — a healthy system would show positive numbers across all orders, e.g., '500 300 150 80 40 20 10 5 2 1 0'.\n- Swap doesn't solve fragmentation — it moves pages to disk, it doesn't arrange them contiguously.\n\nFix: echo 1 > /proc/sys/vm/compact_memory asks the kernel to compact memory. If that doesn't help — restart.",
          },
          {
            q: "You suspect a process is leaking file descriptors.\n\nYou ran:\n\n```\nls /proc/1234/fd | wc -l\n```\n\nOutput:\n\n```\n45892\n```\n\nAnd:\n\n```\ncat /proc/1234/limits | grep 'Max open files'\n```\n\nOutput:\n\n```\nMax open files    65536    65536    files\n```\n\nWhat is the situation and what might happen?",
            options: [
              "The process holds 45,892 FDs out of a 65,536 limit — it is approaching the limit and may fail with EMFILE",
              "45,892 file descriptors is a normal number for a busy server",
              "The limit of 65,536 is too low — it should be increased",
              "The issue is the soft limit, not the hard limit",
            ],
            answer: 0,
            explanation: "/proc/<pid>/fd shows all open file descriptors for a process, and /proc/<pid>/limits shows kernel limits. 45,892 out of 65,536 (70%) with a rising trend clearly indicates an FD leak.\n\nA healthy process opens and closes FDs — it doesn't accumulate them. 45,892 FDs is abnormal even for a very busy server (nginx handling 10,000 concurrent connections holds about 20,000 FDs, not 45,000).\n\nWhy the others are wrong:\n- 45,892 FDs is not normal — a healthy server holds hundreds to low thousands.\n- Increasing the limit only delays the crash — the leak will continue until the new limit is exhausted too, consuming more kernel memory along the way.\n- Both soft and hard limits are 65536 here — there's no difference between them.\n\nWhen it hits 65,536, every open(), socket(), and accept() call will fail with EMFILE. The application will stop accepting new connections.\n\nDiagnosis: lsof -p 1234 | awk '{print $5}' | sort | uniq -c | sort -rn to identify which type of FDs are leaking (sockets? files? pipes?).",
          },
          {
            q: "You ran:\n\n```\nsar -n DEV 1 5\n```\n\nOutput (average):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nThe network card is 1Gbps. What is the problem?",
            options: [
              "rxkB/s (115MB/s) approaches 1Gbps capacity (~125MB/s) and there are 850 drops/s — the NIC is saturated and dropping packets",
              "The packet count (95,000/s) is normal for a busy server",
              "The issue is with txdrop — rxdrop is not relevant",
              "Switch to UDP instead of TCP",
            ],
            answer: 0,
            explanation: "You need to combine three signals to diagnose NIC saturation:\n\n1. rxkB/s = 115,000 KB/s = 115 MB/s. 1Gbps capacity = 125 MB/s theoretical (practically ~117MB/s with overhead). 115MB/s = 92% utilization — the card is nearly full.\n2. rxdrop/s = 850. The card is dropping 850 packets per second because the ring buffer is full — this is real traffic loss causing retransmissions and latency.\n3. txdrop/s = 0 — the problem is in receiving, not sending.\n\nWhy the others are wrong:\n- 95,000 pps (packets per second) is very high, but the real issue is bandwidth in bytes, not packet count.\n- txdrop = 0 is a good sign — the problem is rxdrop, not txdrop. The claim is backwards.\n- UDP doesn't solve NIC saturation — the problem is the physical capacity of the network card, not the protocol.\n\nFix: upgrade to 10Gbps, enable RSS (Receive Side Scaling) to distribute processing across cores, increase ring buffer (ethtool -G), or distribute traffic across interfaces with bonding.",
          },
          {
            q: "You ran:\n\n```\nperf top\n```\n\nOutput:\n\n```\n  35.2%  [kernel]        [k] _raw_spin_lock\n  18.1%  [kernel]        [k] copy_user_generic_unrolled\n  12.4%  libc.so.6       [.] __memcpy_avx2\n   8.3%  myapp           [.] parse_request\n```\n\nWhat is the conclusion?",
            options: [
              "35% of CPU time is spent on kernel spinlock — there is severe contention between cores over a shared resource",
              "The main issue is memcpy — memory copies need optimization",
              "parse_request is the bottleneck since it is the only application function",
              "Everything is fine — kernel functions are always at the top of the list in perf",
            ],
            answer: 0,
            explanation: "perf top samples the CPU and shows where it spends most of its time. 35% on _raw_spin_lock is a severe red flag — a spinlock is a busy-wait loop where cores spin and wait for a lock, burning CPU in the process.\n\nYou need to read the data together:\n- _raw_spin_lock (35%) — contention in kernel space. Usually related to the networking stack, I/O scheduler, or a shared data structure.\n- copy_user_generic_unrolled (18%) — copying data between kernel and user space (read/write syscalls). Supports the diagnosis of heavy I/O.\n- __memcpy_avx2 (12%) — user-space memory copies. Makes sense if there's data processing.\n- parse_request (8.3%) — the application function consuming the most CPU.\n\nWhy the others are wrong:\n- memcpy takes 12% — concerning, but not the main issue when spinlock takes 35%.\n- parse_request at 8.3% is not the bottleneck — 35% spinlock is 4x higher.\n- Kernel functions are not always on top. Under normal load, user-space functions should lead.\n\nNext step: perf record -g -a sleep 10 then perf report to see the full call stack — identify where the spinlock originates.",
          },
          {
            q: "A server cannot create new network connections.\n\nYou ran:\n\n```\nsysctl net.ipv4.ip_local_port_range\n```\n\nOutput:\n\n```\nnet.ipv4.ip_local_port_range = 32768    60999\n```\n\nAnd:\n\n```\nss -s\n```\n\nOutput:\n\n```\nTCP:   28231 (estab 25000, closed 0, orphaned 0, tw 3200)\n```\n\nWhat is the problem?",
            options: [
              "The available port range (28,232 ports) is almost exhausted with 28,231 connections — ephemeral port exhaustion",
              "Too many orphaned connections consuming resources",
              "25,000 established connections is beyond the server's capacity",
              "TCP stack settings are fine, the issue is DNS resolution",
            ],
            answer: 0,
            explanation: "This problem requires arithmetic: ip_local_port_range = 32768–60999 gives 60999 - 32768 + 1 = 28,232 ephemeral ports. ss -s shows 28,231 TCP connections. Only one port remains — any attempt to create a new connection will fail with EADDRNOTAVAIL.\n\nBreaking down the 28,231: 25,000 established (active connections) + 3,200 TIME_WAIT (closed connections waiting 60 seconds). Both types consume a port.\n\nWhy the others are wrong:\n- orphaned = 0 — there are no orphans at all, so that's not the problem.\n- 25,000 established connections isn't beyond capacity — Linux can handle millions of connections. The issue is ports, not connections.\n- DNS is unrelated — the problem is there are no local ports to open sockets on.\n\nGraduated fix:\n1. Expand range: sysctl -w net.ipv4.ip_local_port_range=\"1024 65535\" (from 28K to 64K ports).\n2. Recycle: sysctl -w net.ipv4.tcp_tw_reuse=1 (reuse TIME_WAIT ports).\n3. Architecture: use connection pooling instead of short-lived connections.",
          },
          {
            q: "After a kernel upgrade, a server shows:\n\n```\ndmesg | grep -i error\n```\n\nOutput:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nWhat does error -12 indicate?",
            options: [
              "Error -12 is ENOMEM (Out of Memory) — the nouveau driver failed to allocate memory during initialization",
              "Error -12 is a permission error — run as root",
              "Error -12 indicates the graphics card is physically damaged",
              "Error -12 is an ACPI error only, unrelated to the driver",
            ],
            answer: 0,
            explanation: "In the Linux kernel, negative error values are defined in include/uapi/asm-generic/errno-base.h. You need to know how to decode them to read dmesg:\n- -1 = EPERM (Permission denied)\n- -2 = ENOENT (No such file)\n- -12 = ENOMEM (Cannot allocate memory)\n- -13 = EACCES (Permission denied)\n- -22 = EINVAL (Invalid argument)\n\nIn this case, nouveau (the open-source NVIDIA driver) tried to allocate DMA memory during probe (initialization) and failed. This is common after kernel upgrades because memory management internals change.\n\nWhy the others are wrong:\n- Permission error is -1 (EPERM) or -13 (EACCES), not -12. Also — drivers running in kernel space are already root.\n- A physical card defect would show different errors (PCIe errors, timeouts) — ENOMEM is a software/memory issue.\n- The ACPI error on the first line is separate — the error -12 on the second line is specifically from nouveau.\n\nFix: nouveau.modeset=0 in the kernel command line (disables the driver), or install the proprietary NVIDIA driver, or check kernel-driver compatibility.",
          },
        ],
      },
    },
  },
];
