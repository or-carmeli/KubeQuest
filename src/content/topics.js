export const ACHIEVEMENTS = [
  {
    id: "streak3",
    icon: "🔥",
    name: "3 ברצף",
    nameEn: "3 in a row",
    condition: (s) => s.max_streak >= 3,
  },
  {
    id: "streak5",
    icon: "🔥",
    name: "5 ברצף",
    nameEn: "5 in a row",
    condition: (s) => s.max_streak >= 5,
  },
  {
    id: "streak10",
    icon: "🔥",
    name: "10 ברצף",
    nameEn: "10 in a row",
    condition: (s) => s.max_streak >= 10,
  },
  {
    id: "score100",
    icon: "💯",
    name: "100 נקודות",
    nameEn: "100 points",
    condition: (s) => s.total_score >= 100,
  },
  {
    id: "allEasy",
    icon: "⭐",
    name: "כל הנושאים ברמה קלה",
    nameEn: "All topics on easy",
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
    icon: "workloads",
    name: "Workloads & Scheduling",
    color: "#00D4FF",
    description: "Pods · Deployments · Jobs · Scheduling",
    descriptionEn: "Pods · Deployments · Jobs · Scheduling",
    levels: {
      easy: {
        theory: "Pods, Deployments ויסודות.\n🔹 Pod:\u200E יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר\n🔹 Deployment:\u200E מנהל Pods זהים, מבטיח replicas רצויים\n🔹 Liveness Probe:\u200E בודק בריאות. כשל = restart לקונטיינר\n🔹 Readiness Probe:\u200E כשל = Pod מוסר מ-Service endpoints (לא מקבל traffic)\n🔹 restartPolicy:\u200E ברירת מחדל Always. Job משתמש ב-OnFailure/Never\n🔹 Job:\u200E משימה חד-פעמית. CronJob = Job מתוזמן\n🔹 Resource Requests:\u200E CPU/Memory מינימלי, Scheduler משתמש לשיבוץ\n🔹 Namespace:\u200E בידוד לוגי, ResourceQuota ו-LimitRange\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3",
        theoryEn: "Pods, Deployments, and Fundamentals\n🔹 Pod - the smallest runnable unit in Kubernetes, containing one or more containers.\n🔹 Deployment - manages identical Pods and ensures the desired replica count is always running.\n🔹 Liveness probe - checks container health. Failure triggers a restart.\n🔹 Readiness probe - failure removes the Pod from Service endpoints (no traffic).\n🔹 restartPolicy - defaults to Always. Jobs use OnFailure or Never.\n🔹 Job vs CronJob - Job runs once to completion. CronJob runs on a schedule.\n🔹 Resource requests - minimum CPU/Memory guaranteed. Scheduler uses this for placement.\n🔹 Namespace - logical isolation boundary. Supports ResourceQuota and LimitRange.\nCODE:\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3",
        questions: [
            {
              q: "מה הוא Pod ב-Kubernetes?",
              tags: ["pod-architecture"],
              options: [
              "אובייקט שמנהל גישה לרשת בין Nodes",
              "קונטרולר שאחראי על rolling updates של Deployments",
              "ממשק שמנהל volumes ו-PersistentClaims בין Pods",
              "יחידת הריצה הקטנה ביותר, מכיל קונטיינר אחד או יותר",
],
              answer: 3,
              explanation:
                "Pod הוא יחידת הריצה הקטנה ביותר ב-Kubernetes.\nהוא מכיל קונטיינר אחד או יותר שרצים יחד על אותו Node.\n\nקונטיינרים באותו Pod חולקים משאבים משותפים:\nכתובת IP אחת, network namespace משותף, ו-volumes משותפים.\nהם מתקשרים ביניהם דרך localhost.",
            },
            {
              q: "מה Deployment עושה?",
              tags: ["controller-hierarchy"],
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
                "Liveness probe הוא בדיקת בריאות תקופתית על הקונטיינר.\nכשלון חוזר גורם ל-Kubernetes להניח שהקונטיינר תקוע ולהפעיל אותו מחדש.\nסוגי בדיקות: HTTP GET, TCP socket, או פקודת shell (exit code 0).\n\n```yaml\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 10\n```",
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
              tags: ["restart-policy"],
              options: [
              "OnFailure: Kubernetes מפעיל מחדש רק אם exit code שגוי",
              "Never: Kubernetes לא מפעיל מחדש קונטיינר שנפסק",
              "Always: Kubernetes תמיד מפעיל מחדש קונטיינר שנפסק",
              "OnSuccess: Kubernetes מפעיל מחדש רק כשהקונטיינר יוצא תקין עם exit code 0",
],
              answer: 2,
              explanation:
                "restartPolicy קובע מתי Kubernetes מפעיל מחדש קונטיינר שנפסק.\n\nAlways (ברירת מחדל): מפעיל מחדש תמיד, בכל סיום.\nOnFailure: מפעיל מחדש רק אם exit code שונה מ-0.\nNever: לא מפעיל מחדש לעולם.\n\nרוב האפליקציות ארוכות הריצה (Deployments) משתמשות ב-Always.",
            },
            {
              q: "מה ההבדל בין Job ל-CronJob?",
              tags: ["cronjob-hierarchy"],
              options: [
              "Job רץ פעם אחת עד להשלמה, CronJob מתזמן Jobs לפי לוח זמנים",
              "Job מריץ משימות במקביל על כל Node, CronJob מריץ משימות רק על Node אחד",
              "Job ו-CronJob שניהם יוצרים Pods שרצים לצמיתות, אבל CronJob תומך גם ב-scheduling",
              "Job מתזמן Pods לפי cron schedule, CronJob מריץ משימה חד-פעמית עד להשלמה",
],
              answer: 0,
              explanation:
                "Job מריץ משימה חד-פעמית עד הצלחה; CronJob מתזמן Jobs לפי cron schedule.\nJob = run-to-completion. CronJob = תזמון חוזר (גיבוי, ניקוי, דוחות).\nשניהם יוצרים Pods שרצים עד להשלמה, לא Pods שרצים לצמיתות.\nבכישלון, Job יוצר Pod חדש ומנסה שוב (עד backoffLimit).",
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
                "`requests` מגדיר את כמות ה-CPU/Memory המינימלית שה-Pod צריך כדי לרוץ.\nה-Scheduler בודק את הערכים האלה כדי לבחור Node עם מספיק משאבים פנויים.\nהקונטיינר יכול לצרוך יותר מה-`requests`, אבל לא מעבר ל-`limits`.\n\n```yaml\nresources:\n  requests:\n    cpu: 250m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\n```",
            },
            {
              q: "מה מטרת Namespace ב-Kubernetes?",
              tags: ["namespace-isolation"],
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
              tags: ["pod-architecture"],
              options: [
              "An object that manages network routing between Nodes in the cluster",
              "The smallest unit of execution, containing one or more containers",
              "A controller responsible for managing rolling updates of Deployments",
              "An interface that manages volumes and PersistentClaims between Pods",
],
              answer: 1,
              explanation:
                "A Pod is Kubernetes' smallest deployable unit.\nIt groups one or more containers that run together on the same Node.\n\nContainers in the same Pod share key resources:\nA single IP address, the same network namespace, and attached storage volumes.\nThey communicate with each other via localhost.",
            },
            {
              q: "What does a Deployment do?",
              tags: ["controller-hierarchy"],
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
                "A liveness probe is a periodic health check Kubernetes runs on each container.\nRepeated failures → Kubernetes kills and restarts the stuck container.\nProbe types: HTTP GET, TCP socket, or shell command (exit code 0).\n\n```yaml\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 10\n```",
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
              tags: ["restart-policy"],
              options: [
              "Never: Kubernetes never restarts a stopped container",
              "OnSuccess: Kubernetes restarts the container only when it exits cleanly with code 0",
              "Always: Kubernetes always restarts a stopped container",
              "OnFailure: Kubernetes restarts only if the exit code is non-zero",
],
              answer: 2,
              explanation:
                "restartPolicy controls when Kubernetes restarts a stopped container.\n\nAlways (default): restart every time the container stops.\nOnFailure: restart only if the container exits with a non-zero code.\nNever: do not restart the container.\n\nMost long-running applications (Deployments) use Always.",
            },
            {
              q: "What is the difference between a Job and a CronJob?",
              tags: ["cronjob-hierarchy"],
              options: [
              "A Job schedules tasks on a cron schedule; a CronJob runs a single task to completion",
              "A Job runs once until completion; a CronJob schedules Jobs on a recurring basis",
              "Both create long-running Pods, but a CronJob adds scheduling support on top",
              "A Job runs tasks in parallel across all Nodes; a CronJob runs tasks on a single Node",
],
              answer: 1,
              explanation:
                "Job runs a task once to completion; CronJob schedules Jobs on a recurring cron schedule.\nJob = run-to-completion. CronJob = recurring (backups, cleanup, reports).\nBoth create Pods that run to completion, not long-running Pods.\nOn failure, Job retries by creating new Pods (up to backoffLimit).",
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
                "`requests` defines how much CPU and Memory the Pod asks for.\nThe Scheduler uses these values to find a Node with enough resources.\n`requests` is a scheduling hint. Containers can burst above it, up to `limits`.\n\n```yaml\nresources:\n  requests:\n    cpu: 250m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\n```",
            },
            {
              q: "What is the purpose of a Namespace in Kubernetes?",
              tags: ["namespace-isolation"],
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
        theory: "עדכונים, StatefulSet ותזמון מתקדם.\n🔹 Rolling Update:\u200E מחליף Pods בהדרגה ללא downtime\n🔹 Rollback:\u200E מחזיר לגרסה קודמת באמצעות kubectl rollout undo\n🔹 StatefulSet:\u200E שם קבוע (pod-0, pod-1) ואחסון עצמאי לכל Pod\n🔹 PodDisruptionBudget:\u200E minAvailable מגביל כמה Pods יכולים לרדת בו-זמנית\n🔹 Resource Limits:\u200E תקרת CPU/Memory. חריגה = OOMKill או throttling\n🔹 Taints/Tolerations:\u200E Node דוחה Pods ללא toleration תואם\n🔹 QoS:\u200E Guaranteed > Burstable > BestEffort. BestEffort נפלט ראשון\n🔹 Ephemeral Container:\u200E קונטיינר debug זמני באמצעות kubectl debug\nCODE:\nkubectl rollout undo deployment/my-app",
        theoryEn: "Updates, StatefulSets, and Advanced Scheduling\n🔹 Rolling Update - gradually replaces Pods with zero downtime.\n🔹 Rollback - reverts to a previous revision using kubectl rollout undo\n🔹 StatefulSet - stable names (pod-0, pod-1) and dedicated storage per Pod.\n🔹 PodDisruptionBudget - minAvailable limits how many Pods can be down simultaneously.\n🔹 Resource limits - hard ceiling for CPU/Memory. Exceeding memory = OOMKill.\n🔹 Taints & Tolerations - a tainted Node rejects Pods without a matching toleration.\n🔹 QoS classes - Guaranteed > Burstable > BestEffort. BestEffort is evicted first under pressure.\n🔹 Ephemeral container - temporary debug container injected using kubectl debug\nCODE:\nkubectl rollout undo deployment/my-app",
        questions: [
            {
              q: "מה היתרון של Rolling Update?",
              tags: ["rolling-update"],
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
              q: "גרסה חדשה של Deployment גרמה לבאג.\nאיך חוזרים לגרסה הקודמת?",
              options: [
              "kubectl scale deployment my-app --replicas=0\nואז להגדיל מחדש",
              "kubectl rollout undo deployment/my-app",
              "kubectl delete deployment my-app\nואז kubectl apply מחדש עם YAML קודם",
              "kubectl patch deployment my-app --type=json -p '[{\"op\":\"replace\"}]'",
],
              answer: 1,
              explanation:
                "הפקודה:\nkubectl rollout undo deployment/my-app\n\nמחזירה את ה-Deployment ל-revision הקודם.\nK8s שומר היסטוריה של כל ReplicaSet, כך שהוא יודע לאיזו גרסה לחזור.\n\nלחזרה ל-revision ספציפי:\nkubectl rollout undo deployment/my-app --to-revision=3",
            },
            {
              q: "מה ההבדל בין StatefulSet ל-Deployment?",
              tags: ["statefulset-vs-deployment"],
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
              tags: ["pod-disruption"],
              options: [
              "מגדיר מינימום Pods זמינים בזמן disruptions מתוכננות",
              "מגביל את כמות ה-CPU ש-Deployment יכול לצרוך בזמן rolling update",
              "מגביל תנועת רשת נכנסת ל-Pods בזמן maintenance",
              "מנהל את ה-scaling האוטומטי לפי מדדי CPU ו-Memory",
],
              answer: 0,
              explanation:
                "PodDisruptionBudget (PDB) מגדיר את מספר ה-Pods המינימלי שחייב להישאר זמין בזמן disruptions מתוכננות, כמו `kubectl drain`\nדוגמה: עם replicas: 3 ו-minAvailable: 2, Kubernetes יאשר פינוי רק אם לפחות 2 Pods נשארים זמינים.\nמגן על זמינות אפליקציות קריטיות בזמן maintenance.",
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
                "limits מגדיר את כמות המשאבים המקסימלית שקונטיינר יכול להשתמש בהם.\nחריגת memory גורמת להריגת הקונטיינר (OOMKill, exit code 137).\nחריגת CPU גורמת ל-throttling בלבד, ללא הריגה.\nההבדל בין requests ל-limits:\n• requests = משאבים מינימליים שה-Scheduler משתמש בהם כדי לתזמן Pod ל-Node.\n• limits = תקרת השימוש במשאבים בזמן ריצה.\nדוגמה:\n```yaml\nresources:\n  requests:\n    cpu: \"200m\"\n    memory: \"256Mi\"\n  limits:\n    cpu: \"1\"\n    memory: \"512Mi\"\n```\nה-Scheduler מתזמן את ה-Pod לפי requests, אבל הקונטיינר לא יכול לחרוג מה-limits בזמן\u00A0ריצה.",
            },
            {
              q: "מה עושים taints ו-tolerations ב-Kubernetes?",
              tags: ["taints-tolerations"],
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
              q: "Node חווה לחץ זיכרון. שלושה Pods רצים עליו: אחד Guaranteed, אחד Burstable ואחד BestEffort. איזה Pod יפונה ראשון?",
              tags: ["qos-eviction"],
              options: [
              "ה-Pod עם QoS class BestEffort יפונה ראשון",
              "ה-Pod עם QoS class Guaranteed יפונה ראשון",
              "ה-Pod עם הכי הרבה replicas יפונה ראשון",
              "Kubernetes יפנה את כל ה-Pods בו-זמנית",
],
              answer: 0,
              explanation:
                "QoS class נקבעת לפי ההגדרות של requests ו-limits לכל קונטיינר ב-Pod.\n\nGuaranteed: כאשר לכל הקונטיינרים מוגדרים requests ו-limits, ובכל אחד מהם requests=limits.\n\nBurstable: כאשר מוגדרים requests או limits, אבל אין התאמה מלאה של requests=limits לכל הקונטיינרים.\n\nBestEffort: כאשר לא מוגדרים כלל requests או limits.\n\nמבחינת eviction: BestEffort יפונה ראשון, אחריו Burstable, ו-Guaranteed הוא המוגן ביותר.",
            },
            {
              q: "מה ephemeral container ב-Kubernetes?",
              options: [
              "קונטיינר זמני שמוסיפים ל-Pod רץ לצורך debugging",
              "Pod זמני שנוצר אוטומטית כש-Deployment מתזמן על Node חדש",
              "גרסה מוקטנת של Pod שמשמשת ל-batch jobs קצרים",
              "init container שמוגדר עם TTL קצוב לניקוי אוטומטי",
],
              answer: 0,
              explanation:
                "ephemeral container הוא קונטיינר זמני שניתן להוסיף ל-Pod רץ לצורך debugging או troubleshooting.\nבדרך כלל מוזרק באמצעות kubectl debug\nהוא לא חלק מה-spec המקורי של ה-Pod.\nהוא מתווסף באופן דינמי לצורך חקירה.\nהוא לא מאותחל מחדש עם ה-Pod.",
            },
        ],
        questionsEn: [
            {
              q: "What is the advantage of a Rolling Update?",
              tags: ["rolling-update"],
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
              q: "A new Deployment version introduced a bug.\nHow do you roll back to the previous revision?",
              options: [
              "kubectl scale deployment my-app --replicas=0\nthen scale back up",
              "kubectl rollout undo deployment/my-app",
              "kubectl delete deployment my-app\nand re-apply the previous YAML manifest",
              "kubectl patch deployment my-app\nto restore the previous image tag",
],
              answer: 1,
              explanation:
                "Command:\nkubectl rollout undo deployment/my-app\n\nRolls the Deployment back to the previous revision.\nK8s stores history via ReplicaSets, so it knows which version to restore.\n\nTo roll back to a specific revision:\nkubectl rollout undo deployment/my-app --to-revision=3",
            },
            {
              q: "What is the main difference between StatefulSet and Deployment?",
              tags: ["statefulset-vs-deployment"],
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
              tags: ["pod-disruption"],
              options: [
              "Restricts inbound network traffic to Pods during maintenance windows",
              "Limits the total CPU a Deployment can consume during a rolling update",
              "Defines minimum available Pods during a planned disruption",
              "Manages automatic scaling based on CPU and memory metrics",
],
              answer: 2,
              explanation:
                "PodDisruptionBudget (PDB) defines the minimum number of Pods that must remain available during voluntary disruptions such as `kubectl drain`\nExample: with replicas: 3 and minAvailable: 2, Kubernetes will only allow eviction if at least 2 Pods remain available.\nProtects critical application availability during Node maintenance.",
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
              tags: ["taints-tolerations"],
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
              q: "A Node is experiencing memory pressure. Three Pods are running on it: one Guaranteed, one Burstable, and one BestEffort. Which Pod is evicted first?",
              tags: ["qos-eviction"],
              options: [
              "The Pod with QoS class Guaranteed is evicted first",
              "The Pod with QoS class BestEffort is evicted first",
              "The Pod with the most replicas is evicted first",
              "Kubernetes evicts all Pods at the same time",
],
              answer: 1,
              explanation:
                "QoS (Quality of Service) determines the priority of Pods when a Node experiences resource pressure, especially memory pressure.\nKubernetes determines the QoS class automatically based on the requests and limits defined for containers.\n\nGuaranteed: requests and limits are defined and equal for all containers. Highest protection from eviction.\nBurstable: requests are defined but limits are higher. Partial protection.\nBestEffort: no requests and no limits defined. These Pods are the first to be evicted when the Node experiences memory pressure.",
            },
            {
              q: "What is an ephemeral container in Kubernetes?",
              options: [
              "A temporary Pod automatically created when a Deployment targets a new Node",
              "A temporary container added to a running Pod for debugging",
              "A stripped-down Pod variant used for short-lived batch jobs",
              "An init container configured with a TTL for automatic cleanup",
],
              answer: 1,
              explanation:
                "An ephemeral container is a temporary container that can be added to a running Pod for debugging or troubleshooting.\nIt is usually injected using kubectl debug\nIt is not part of the original Pod spec.\nIt is added dynamically for troubleshooting.\nIt is not restarted with the Pod.",
            },
        ],
      },
      hard: {
        theory: "תזמון מתקדם, Scaling וכשלים.\n🔹 DaemonSet:\u200E Pod אחד על כל Node (logging, monitoring, CNI)\n🔹 HPA:\u200E Horizontal Pod Autoscaler, מגדיל ומקטין replicas לפי CPU/Memory\n🔹 topologySpreadConstraints:\u200E פיזור Pods אחיד בין zones או nodes\n🔹 Taints/Tolerations:\u200E Node עם taint דוחה Pods שלא מגדירים toleration תואם\n🔹 StatefulSet:\u200E Pods עולים בסדר (pod-0 חייב להיות Ready לפני pod-1)\n🔹 Rolling Update:\u200E maxUnavailable: 0 חוסם עדכון אם Pods חדשים לא Ready\n🔹 Selector:\u200E matchLabels חייב להתאים ל-labels של ה-Pods\n🔹 OOMKilled:\u200E חריגה ממגבלת זיכרון (exit code 137)\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10",
        theoryEn: "Advanced Scheduling, Scaling, and Failures\n🔹 DaemonSet - ensures one Pod per Node (logging, monitoring, CNI).\n🔹 HPA - scales replica count based on CPU or memory usage.\n🔹 topologySpreadConstraints - distributes Pods evenly across zones or nodes.\n🔹 Taints & Tolerations - a tainted Node rejects Pods without a matching toleration (FailedScheduling).\n🔹 StatefulSet ordering - Pods start in order; pod-0 must be Ready before pod-1 launches.\n🔹 Rolling Update - maxUnavailable: 0 blocks rollout if new Pods fail readiness.\n🔹 Selector matching - Deployment matchLabels must exactly match Pod labels.\n🔹 OOMKilled - container exceeded memory limit (exit code 137).\nCODE:\nkubectl autoscale deployment my-app --cpu-percent=50 --min=2 --max=10",
        questions: [
            {
              q: "מה DaemonSet מבטיח?",
              tags: ["daemonset-topology"],
              options: [
              "שה-Pod רץ פעם אחת עד להשלמה ולא מופעל מחדש. התנהגות של Job",
              "DaemonSet מבטיח Pod אחד רץ על כל Node ב-Cluster",
              "שה-Pod רץ רק על Node שמסומן עם label מתאים דרך nodeSelector",
              "שה-Pod מופעל מחדש לפי לוח זמנים קבוע. התנהגות של CronJob",
],
              answer: 1,
              explanation:
                "DaemonSet מבטיח Pod אחד על כל Node ב-Cluster.\nכש-Node חדש מצטרף, Pod נוסף אוטומטית. כש-Pod נכשל, הוא מופעל מחדש.\nשימושי ל-logging (Fluentd), monitoring (node-exporter), ו-CNI plugins.",
            },
            {
              q: "מה תפקיד ה-HPA ב-Kubernetes?",
              tags: ["hpa-scaling"],
              options: [
              "Horizontal Pod Autoscaler -\u200E מגדיל ומקטין Pods לפי עומס",
              "High Performance App -\u200E תצורת Pod מותאמת לביצועים גבוהים",
              "Helm Package Archive -\u200E פורמט שמירה של Helm charts",
              "Host Port Assignment -\u200E מקצה ports ב-Node ל-Pods",
],
              answer: 0,
              explanation:
                "HPA (Horizontal Pod Autoscaler) משנה מספר replicas אוטומטית לפי עומס.\nכשהעומס עולה, HPA מוסיף Pods. כשהעומס יורד, HPA מסיר Pods.\nדורש metrics-server מותקן ב-Cluster.",
            },
            {
              q: "מה המשמעות של OOMKilled ב-Kubernetes?",
              tags: ["oom-killed"],
              options: [
              "הדיסק של ה-Node מלא ו-kubelet לא יכול ליצור קבצים",
              "הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-limits.memory",
              "שגיאת הרשאות שמונעת מהקונטיינר לגשת ל-volume",
              "שגיאת רשת שנגרמת כשה-Pod מנסה לגשת לכתובת IP חסומה",
],
              answer: 1,
              explanation:
                "OOMKilled (exit code 137): הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-resources.limits.memory.\nה-Linux kernel אוכף מגבלות זיכרון דרך cgroups. כשהקונטיינר מנסה להקצות יותר מהמותר, ה-OOM Killer הורג את התהליך כדי להגן על ה-Node.\n\nאיתור:\nkubectl describe pod <pod>\nReason: OOMKilled | Exit Code: 137\nה-Pod עלול להיכנס ל-CrashLoopBackOff.\n\nפתרון: הגדל limits.memory, או חפש memory leak בקוד.",
            },
            {
              q: "מה התפקיד של topologySpreadConstraints בתזמון Pods ב-Kubernetes?",
              tags: ["topology-spread"],
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
                "maxUnavailable:0 מונע הורדת Pod ישן עד שהחדש עובר readiness.\nאם Pods חדשים נכשלים ב-readiness, ה-rollout נתקע.\n\nיש לבדוק:\n\n`kubectl logs`\n\nmaxUnavailable:0 = בטיחות מלאה, אבל readiness כושל = rollout תקוע.",
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
              tags: ["daemonset-topology"],
              options: [
              "The Pod runs on a fixed schedule",
              "The Pod runs only on Nodes matching a specific label",
              "One Pod runs on every Node in the cluster",
              "The Pod runs once to completion and is never restarted",
],
              answer: 2,
              explanation:
                "DaemonSet ensures one Pod runs on every Node in the cluster.\nNew Nodes automatically get a Pod. If a Pod fails, it is restarted.\nCommon use cases: logging (Fluentd), monitoring (node-exporter), and CNI plugins.",
            },
            {
              q: "What is HPA?",
              tags: ["hpa-scaling"],
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
              tags: ["oom-killed"],
              options: [
              "A permissions error preventing the container from mounting the required volume",
              "The Node's disk became full and kubelet could not create container files",
              "Container exceeded its memory limit defined in limits.memory",
              "A network error triggered when the Pod attempts to reach a blocked IP address",
],
              answer: 2,
              explanation:
                "OOMKilled (exit code 137): container exceeded the memory limit defined in resources.limits.memory.\nThe Linux kernel enforces memory limits via cgroups. When a container tries to allocate beyond the allowed limit, the OOM Killer terminates the process to protect the Node.\n\nDetection:\nkubectl describe pod <pod>\nReason: OOMKilled | Exit Code: 137\nPod may restart and enter CrashLoopBackOff.\n\nFix: increase limits.memory, or investigate a memory leak in the app.",
            },
            {
              q: "What is the role of topologySpreadConstraints in Kubernetes scheduling?",
              tags: ["topology-spread"],
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
                "maxUnavailable:0 prevents removing old Pods until new ones pass readiness.\nNew Pods fail readiness → rollout stalls. Check `kubectl logs` on new Pods.\nmaxUnavailable:0 = safe but readiness failure = permanent stall.",
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
    icon: "networking",
    name: "Networking & Services",
    color: "#A855F7",
    description: "Services · Ingress · DNS · NetworkPolicy",
    descriptionEn: "Services · Ingress · DNS · NetworkPolicy",
    levels: {
      easy: {
        theory: "Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP:\u200E גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort:\u200E חשיפה על port בכל Node\n🔹 LoadBalancer:\u200E IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n - port: 80\n    targetPort: 8080",
        theoryEn: "Services\n🔹 Service - provides a stable IP for accessing Pods, selected by label matching.\n🔹 ClusterIP - internal-only access within the cluster (default type).\n🔹 NodePort - exposes the Service on a static port on every Node.\n🔹 LoadBalancer - provisions an external IP through the cloud provider.\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n - port: 80\n    targetPort: 8080",
        questions: [
            {
              q: "למה צריך Service?",
              tags: ["service-stable-ip"],
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
              tags: ["service-types"],
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
              tags: ["clusterip-service"],
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
              tags: ["service-discovery"],
              options: [
              "לפי labels ו-selector שמוגדרים ב-spec של ה-Service",
              "לפי port שה-Pod מאזין עליו ו-Service מתאים",
              "לפי כתובת IP שמוגדרת ידנית ב-Endpoints object",
              "לפי שם ה-Pod שמוגדר ב-spec של ה-Service",
],
              answer: 0,
              explanation:
                "Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n```\n\nכל Pod עם label של \u200Eapp: my-app ייכנס לרשימת ה-Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.",
            },
            {
              q: "מה ההבדל בין port ל-targetPort ב-Service?",
              tags: ["port-mapping"],
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
              tags: ["dns-flow"],
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
              tags: ["network-policy-flow"],
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
              tags: ["service-stable-ip"],
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
              tags: ["service-types"],
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
              tags: ["clusterip-service"],
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
              tags: ["service-discovery"],
              options: [
              "By labels and selector",
              "By the port the Pod listens on, matched against the Service's targetPort",
              "By a manually configured IP address in the Endpoints object",
              "By the Pod name defined in the Service spec's targetRef field",
],
              answer: 0,
              explanation:
                "A Service defines a label selector. The Endpoints controller finds matching Pods.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n  - port: 80\n    targetPort: 8080\n```\n\nEvery Pod with the label app: my-app is added to the Endpoints list.\nkube-proxy routes traffic to one of the healthy endpoints.",
            },
            {
              q: "What is the difference between port and targetPort in a Service?",
              tags: ["port-mapping"],
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
              tags: ["dns-flow"],
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
              tags: ["network-policy-flow"],
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
        theory: "DNS, Ingress ו-Traffic\n🔹 \u2066Service DNS\u2069 - \u2066service.namespace.svc.cluster.local\u2069\n🔹 Ingress - ניתוב HTTP/HTTPS לפי path או hostname. דורש \u2066Ingress Controller\u2069\n🔹 TLS ב-Ingress - \u2066spec.tls\u2069 עם Secret שמכיל certificate\n🔹 \u2066Egress NetworkPolicy\u2069 - מגביל תעבורה יוצאת. חייב לפתוח port 53 ל-DNS\n🔹 \u2066externalTrafficPolicy\u2069 - Local שומר על \u2066client IP\u2069 (בלי SNAT), Cluster מפזר לכל ה-Nodes\n🔹 \u2066Debug Service\u2069 - `kubectl get endpoints` אם ריק, ה-selector לא תואם\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  tls:\n  - hosts: [app.example.com]\n    secretName: tls-cert\n  rules:\n  - host: app.example.com",
        theoryEn: "DNS, Ingress, and Traffic Routing\n🔹 Service DNS - format: service.namespace.svc.cluster.local.\n🔹 Ingress - routes HTTP/HTTPS by path or hostname. Requires an Ingress Controller (nginx, traefik).\n🔹 TLS in Ingress - configured via spec.tls with a Secret containing the certificate.\n🔹 Egress NetworkPolicy - restricts outbound traffic. Must allow port 53 for DNS resolution.\n🔹 externalTrafficPolicy - Local preserves client IP (no SNAT), Cluster distributes to all Nodes.\n🔹 Debugging Services - kubectl get endpoints. Empty = selector mismatch with Pod labels.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  tls:\n  - hosts: [app.example.com]\n    secretName: tls-cert\n  rules:\n  - host: app.example.com",
        questions: [
            {
              q: "מה ה-DNS name של service בשם api ב-namespace בשם prod?",
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
              tags: ["ingress-vs-lb"],
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
                "מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key.\nמפנים ל-Secret ב-spec.tls של ה-Ingress עם שמות ה-hosts.\nה-Ingress Controller מבצע TLS termination אוטומטית.\n\nדוגמה:\n```yaml\nspec:\n  tls:\n  - hosts:\n    - app.example.com\n    secretName: app-tls-secret\n```",
            },
            {
              q: "מה path-based routing ב-Ingress?",
              tags: ["ingress-routing"],
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
              q: "מה \u2066egress NetworkPolicy\u2069?",
              tags: ["egress-policy"],
              options: [
              "מגביל תנועה נכנסת ל-Pod לפי labels של Pod המקור",
              "מגביל bandwidth של Pod לפי annotations",
              "מנהל \u2066DNS resolution\u2069 עבור Pods ב-Namespace",
              "מגביל תנועה יוצאת מ-Pods",
],
              answer: 3,
              explanation:
                "\u2066Egress NetworkPolicy\u2069 מגדיר לאילו יעדים Pod מורשה לשלוח תנועה.\nכשמגדירים \u2066policyTypes: [Egress]\u2069, כל תנועה יוצאת חסומה אלא אם הותרה במפורש.\nחובה לאפשר port 53 (DNS), אחרת \u2066name resolution\u2069 נכשל.",
            },
            {
              q: "כיצד Ingress מנתב לפי hostname?",
              tags: ["ingress-hostname"],
              options: [
              "לפי port שעליו מגיעה הבקשה, ממופה בשדה ports בהגדרת ה-Ingress",
              "דרך ConfigMap שמגדיר מיפוי של hostnames ל-Services",
              "שדה host בשורש ה-Ingress מגדיר hostname בודד לכל ה-rules",
              "בשדה host בתוך כל rule מגדירים hostname ספציפי שמנתב ל-Service מתאים",
],
              answer: 3,
              explanation:
                "כל rule ב-Ingress מכיל שדה host שמגדיר hostname ספציפי.\n\u2066api.example.com\u2069 מופנה ל-Service אחד, \u2066web.example.com\u2069 ל-Service אחר.\nIngress אחד יכול לשרת מספר דומיינים.\n\n```yaml\nrules:\n- host: api.example.com\n  http:\n    paths:\n    - path: /\n      backend:\n        service:\n          name: api-svc\n- host: web.example.com\n  http:\n    paths:\n    - path: /\n      backend:\n        service:\n          name: web-svc\n```",
            },
            {
              q: "נניח שיש לך Service ב-Kubernetes עם ההגדרה הבאה:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nמה ההבדל בין `externalTrafficPolicy: Local` לבין `externalTrafficPolicy: Cluster`?",
              tags: ["traffic-policy"],
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
              "kubectl get endpoints <service>\nאם ריק, selector לא תואם labels",
              "kubectl describe service/<name> --show-pods\nמציג Pods מחוברים",
              "kubectl logs service/<name>\nכדי לראות את logs של ה-Service",
              "kubectl exec -it service/<name> -- netstat\nמציג חיבורים פעילים",
],
              answer: 0,
              explanation:
                "`kubectl get endpoints` מציג Pod IPs שה-Service מנתב אליהם.\nרשימה ריקה = בעיית selector/labels.\nבדוק `kubectl get pods --show-labels` והשווה ל-selector של ה-Service.",
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
              tags: ["ingress-vs-lb"],
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
              tags: ["ingress-routing"],
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
              tags: ["egress-policy"],
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
              tags: ["ingress-hostname"],
              options: [
              "By the port on which the request arrives, mapped in the ports field of the Ingress",
              "A single host field at the root of the Ingress spec applies one hostname to all rules",
              "Via a ConfigMap that maps hostname entries to backend Service names",
              "Each rule defines a host field with a specific hostname that routes to the matching Service",
],
              answer: 3,
              explanation:
                "Each Ingress rule has a host field for hostname-based routing.\napi.example.com routes to one Service, web.example.com to another.\nA single Ingress can serve multiple domains.\n\n```yaml\nrules:\n- host: api.example.com\n  http:\n    paths:\n    - path: /\n      backend:\n        service:\n          name: api-svc\n- host: web.example.com\n  http:\n    paths:\n    - path: /\n      backend:\n        service:\n          name: web-svc\n```",
            },
            {
              q: "Given a Kubernetes Service with the following spec:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nWhat is the difference between `externalTrafficPolicy: Local` and `externalTrafficPolicy: Cluster`?",
              tags: ["traffic-policy"],
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
              "kubectl logs service/<name>\nto view connection logs from the Service",
              "kubectl exec -it service/<name> -- netstat\nto view active connections",
              "kubectl get endpoints <service>\nIf empty, selector doesn't match labels",
              "kubectl describe service/<name> --show-pods\nto list all attached Pods",
],
              answer: 2,
              explanation:
                "`kubectl get endpoints` shows Pod IPs the Service routes to.\nEmpty list = selector/label mismatch.\nCompare `kubectl get pods --show-labels` with the Service selector.",
            },
        ],
      },
      hard: {
        theory: "NetworkPolicy, kube-proxy ו-debug.\n🔹 ברירת מחדל: allow-all בין כל ה-Pods\n🔹 NetworkPolicy:\u200E דורש CNI תומך (Calico, Cilium). חוסם DNS? פתח port 53 ב-egress\n🔹 ipBlock:\u200E מגביל egress ל-CIDR ספציפי (לדוגמה 0.0.0.0/0 לאינטרנט)\n🔹 IPVS vs iptables:\u200E IPVS משתמש ב-hash tables (O(1)), iptables ב-chains (O(n))\n🔹 Labels:\u200E case-sensitive. app: App ≠ app: app = endpoints ריקים\n🔹 Service FQDN:\u200E service.namespace.svc.cluster.local (חסר .svc = כשל DNS)\n🔹 Ingress 503:\u200E endpoints not found = selector לא תואם\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  egress:\n  - ports:\n    - port: 53\n      protocol: UDP",
        theoryEn: "NetworkPolicy, kube-proxy, and Debugging\n🔹 Default - all Pods can reach all Pods (allow-all) without NetworkPolicy.\n🔹 NetworkPolicy - requires a CNI plugin (Calico, Cilium). Blocking DNS? Open port 53 in egress.\n🔹 ipBlock - restricts egress to specific CIDRs (e.g. 0.0.0.0/0 for internet access).\n🔹 IPVS vs iptables - IPVS uses hash tables (O(1) lookup), iptables uses chains (O(n)).\n🔹 Labels are case-sensitive - app: App ≠ app: app, causing empty Endpoints.\n🔹 Service FQDN - service.namespace.svc.cluster.local (missing .svc = DNS failure).\n🔹 Ingress 503 - \"endpoints not found\" means the backend Service selector doesn't match any Pods.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  egress:\n  - ports:\n    - port: 53\n      protocol: UDP",
        questions: [
            {
              q: "מה קורה ללא \u2066NetworkPolicy\u2069?",
              tags: ["networkpolicy-default"],
              options: [
              "רק תנועת HTTPS מותרת ותנועת HTTP נחסמת",
              "כל תנועה חסומה ו-Pods לא מצליחים לתקשר עד שמגדירים \u2066allow rules\u2069",
              "כל Pod יכול לדבר עם כל Pod",
              "רק Pods באותו Namespace מדברים אחד עם השני",
],
              answer: 2,
              explanation:
                "ללא \u2066NetworkPolicy\u2069, ברירת המחדל היא \u2066allow-all\u2069 - כל Pod מדבר עם כל Pod.\nברגע שמוסיפים \u2066NetworkPolicy\u2069 ל-Pod, כל traffic שלא מורשה במפורש חסום.\n\u2066NetworkPolicy\u2069 עובד כ-whitelist - רק מה שמוגדר מותר.",
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
                "\u2066NetworkPolicy\u2069 הוא משאב שמגדיר חוקים לתעבורה בין Pods.\nאבל Kubernetes עצמו רק מספק את ה-API וה-spec להגדרה של החוקים.\nהאכיפה בפועל מתבצעת על ידי \u2066CNI plugin\u2069 (\u2066Container Network Interface\u2069, רכיב רשת שמחבר את ה-Pods לרשת).\nPlugins כמו Calico, Cilium או \u2066Weave Net\u2069 יודעים ליישם את חוקי ה-\u2066NetworkPolicy\u2069 ברמת הרשת.\nלעומת זאת, plugins כמו Flannel או kubenet לא תומכים באכיפה של \u2066NetworkPolicy\u2069.\nבמקרים כאלה אפשר להגדיר \u2066NetworkPolicy\u2069, אבל בפועל היא לא תשפיע על התעבורה בין ה-Pods.\nלכן כדי ש-\u2066NetworkPolicy\u2069 יעבוד בפועל, חייבים להשתמש ב-\u2066CNI plugin\u2069 שתומך בכך.",
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
                "kube-proxy מנתב תעבורה ל-Services בתוך הקלסטר באמצעות מנגנוני הרשת של לינוקס.\nב-iptables כל Service מיושם כשרשרת חוקים, ולכן החיפוש אחרי יעד נעשה בצורה סדרתית ככל שמספר החוקים גדל.\nלעומת זאת IPVS (\u2066IP Virtual Server\u2069, מנגנון \u2066load balancing\u2069 בתוך הקרנל של לינוקס) משתמש ב-\u2066hash tables\u2069 כדי למצוא את היעד במהירות.\nלכן בקלסטרים גדולים IPVS בדרך כלל מספק ביצועים וסקיילביליות טובים יותר.",
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
                "Labels הם \u2066case-sensitive\u2069.\n\u2066app: App ≠ app: app\u2069. כתוצאה מכך Endpoints ריקים.\nלתקן selector ל-\u2066app: App\u2069 כדי שיתאים ל-label.\n• port שגוי: שגיאת חיבור, לא Endpoints ריקים.\n• Pod לא Ready: לא הבעיה כאן.\n• Namespace: לא רלוונטי.\nבדוק `kubectl get endpoints` ו-`kubectl get pods --show-labels`.",
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
                "\u2066Egress policy\u2069 זו מאפשרת תעבורה רק ל-\u2066port 443\u2069, ולכן תעבורת DNS נחסמת.\nDNS משתמש ב-\u2066port 53\u2069 (בדרך כלל UDP ולעיתים גם TCP), ולכן Pods לא מצליחים לבצע \u2066name resolution\u2069.\nכדי לאפשר DNS, צריך להוסיף כלל Egress שמאפשר תעבורה ל-\u2066port 53\u2069 (TCP ו-UDP), בדרך כלל לכיוון CoreDNS.",
            },
            {
              q: "ה-Ingress מחזיר שגיאת 503.\n\nהרצת:\n\n```\n$ kubectl describe ingress my-ingress\n```\n\n```\nRules:\n  Host         Path  Backend\n  ----         ----  -------\n  api.example  /     api-svc:80 (<error: endpoints \"api-svc\" not found>)\n```\n\nמה הבעיה?",
              options: [
              "ה-Service קיים אבל ה-selector לא מתאים לאף Pod",
              "תעודת ה-TLS שגויה וחוסמת חיבורים נכנסים",
              "ה-Ingress וה-Service נמצאים ב-Namespaces שונים",
              "ה-Ingress Controller לא מותקן ב-Cluster",
],
              answer: 0,
              explanation:
                "מה אומרת השגיאה:\nendpoints not found אומר שה-Service קיים, אבל אין לו Endpoints.\n\nאיך Endpoints נוצרים:\nכש-Service מוגדר עם selector, Kubernetes מחפש Pods עם labels תואמים.\nאם יש Pods תואמים, הם נרשמים כ-Endpoints של ה-Service.\nאם אין Pods תואמים, רשימת ה-Endpoints ריקה.\n\nלמה זה גורם ל-503:\nה-Ingress מנתב traffic ל-Service, אבל ה-Service לא יודע לאן להעביר אותו כי אין Endpoints.\nלכן ה-Ingress Controller מחזיר 503 (Service Unavailable).\n\nאיך מתקנים:\nבודקים את ה-selector של ה-Service ואת ה-labels של ה-Pods ומוודאים שהם תואמים.",
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
              tags: ["networkpolicy-default"],
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
                "NetworkPolicy is a Kubernetes resource that defines traffic rules between Pods.\nHowever, Kubernetes itself only provides the API and specification for defining these rules.\nThe actual enforcement is performed by the CNI plugin (Container Network Interface, the networking component that connects Pods to the cluster network).\nPlugins such as Calico, Cilium, or Weave Net implement and enforce NetworkPolicy rules at the network level.\nIn contrast, plugins like Flannel or kubenet do not enforce NetworkPolicy.\nIn those cases, a NetworkPolicy object can exist in the cluster but it will have no effect on Pod traffic.\nTherefore, for NetworkPolicy to actually work, the cluster must use a CNI plugin that supports NetworkPolicy enforcement.",
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
                "kube-proxy routes traffic to Services inside the cluster using Linux networking mechanisms.\nWith iptables, each Service becomes a chain of rules, so packets are matched sequentially as the rule set grows.\nIn contrast, IPVS (IP Virtual Server, a load balancing subsystem in the Linux kernel) uses hash tables to quickly locate the correct backend.\nBecause of this, IPVS usually provides better performance and scalability in large clusters.",
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
                "Labels are case-sensitive. app: App ≠ app: app → empty Endpoints.\nChange selector to app: App to match the Pod label.\n• Wrong port: connection error, not empty Endpoints. • Not Ready: different issue. • Namespace: not relevant here.\nAlways verify with `kubectl get endpoints` and `kubectl get pods --show-labels`.",
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
                "This egress policy allows traffic only to port 443, so DNS traffic is blocked.\nDNS uses port 53 (usually UDP and sometimes TCP), so Pods cannot perform name resolution.\nTo fix this, an egress rule must allow traffic to port 53 (both TCP and UDP), typically toward CoreDNS.",
            },
            {
              q: "An Ingress returns a 503 error.\n\nYou ran:\n\n```\n$ kubectl describe ingress my-ingress\n```\n\n```\nRules:\n  Host         Path  Backend\n  ----         ----  -------\n  api.example  /     api-svc:80 (<error: endpoints \"api-svc\" not found>)\n```\n\nWhat is the problem?",
              options: [
              "The Service exists but its selector does not match any Pods",
              "The Ingress Controller is not installed in the cluster",
              "The Ingress and Service are in different Namespaces",
              "The TLS certificate is invalid and blocking incoming connections",
],
              answer: 0,
              explanation:
                "What the error means:\nendpoints not found means the Service exists, but it has no Endpoints.\n\nHow Endpoints are created:\nWhen a Service has a selector, Kubernetes looks for Pods with matching labels.\nIf matching Pods exist, they are registered as Endpoints for that Service.\nIf no Pods match, the Endpoints list is empty.\n\nWhy this causes a 503:\nThe Ingress routes traffic to the Service, but the Service has nowhere to send it because there are no Endpoints.\nSo the Ingress Controller returns 503 (Service Unavailable).\n\nHow to fix:\nCheck the Service selector and the Pod labels and make sure they match.",
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
    id: "cluster-ops",
    icon: "cluster-ops",
    name: "Cluster Operations",
    color: "#3B82F6",
    description: "kubeadm · Control Plane · Static Pods · Certificates",
    descriptionEn: "kubeadm · Control Plane · Static Pods · Certificates",
    levels: {
      easy: {
        theory: "יסודות קלסטר ו-Control Plane\n🔹 Control Plane:\u200E מורכב מ-\u2066API Server, etcd, Scheduler\u2069 ו-\u2066Controller Manager\u2069\n🔹 API Server:\u200E נקודת הכניסה המרכזית לקלסטר. כל פקודות kubectl וכל הרכיבים מתקשרים דרכו\n🔹 etcd:\u200E מאגר מבוזר שמחזיק את כל מצב הקלסטר. מקור האמת היחיד של המערכת\n🔹 Scheduler:\u200E מחליט על איזה Node יורץ כל Pod חדש לפי משאבים זמינים ואילוצים\n🔹 Controller Manager:\u200E מפעיל control loops שמתאימות באופן רציף את המצב בפועל (actual state) עם המצב הרצוי (desired state)\n🔹 kubelet:\u200E סוכן שרץ על כל Node, מקבל הגדרות Pods ומוודא שהם רצים ובריאים\n🔹 kubeadm:\u200E כלי רשמי להקמה ושדרוג של קלסטרים\n🔹 Static Pod:\u200E Pod שמנוהל ישירות על ידי kubelet מקובץ manifest, ולא דרך \u2066API Server\u2069\nCODE:\nkubeadm init --pod-network-cidr=10.244.0.0/16",
        theoryEn: "Cluster Fundamentals & Control Plane\n🔹 Control Plane - the brain of the cluster: API Server, etcd, Scheduler, and Controller Manager.\n🔹 API Server - central entry point to the Kubernetes API. All requests from kubectl and cluster components go through it.\n🔹 etcd - distributed key-value store that is the single source of truth for all cluster state.\n🔹 Scheduler - assigns new Pods to Nodes based on resource requests, taints, and affinity rules.\n🔹 Controller Manager - runs control loops that continuously reconcile actual state with desired state.\n🔹 kubelet - node agent that receives PodSpecs and ensures containers are running and healthy.\n🔹 kubeadm - official CLI for bootstrapping, upgrading, and managing cluster lifecycle.\n🔹 Static Pod - a Pod managed directly by the kubelet from a manifest file, not through the API Server.\nCODE:\nkubeadm init --pod-network-cidr=10.244.0.0/16",
        questions: [
            {
              q: "מהם ארבעת הרכיבים של Control Plane?",
              tags: ["controlplane-components"],
              options: [
              "kubelet, kube-proxy, CoreDNS, CNI plugin",
              "Docker, containerd, CRI-O, runc",
              "API Server, etcd, Scheduler, Controller Manager",
              "Ingress Controller, Service Mesh, API Gateway, Load Balancer",
],
              answer: 2,
              explanation:
                "ה-\u2066Control Plane\u2069 מנהל את הקלסטר ומורכב מהרכיבים:\n• \u2066API Server\u2069 - נקודת הכניסה לכל הבקשות לקלסטר\n• etcd - מסד הנתונים שבו נשמר מצב הקלסטר\n• Scheduler - מחליט על איזה Node ירוץ כל Pod\n• \u2066Controller Manager\u2069 - מריץ \u2066control loops\u2069 שמוודאים שהמצב בפועל תואם למצב הרצוי",
            },
            {
              q: "מה תפקיד kubelet?",
              tags: ["kubelet-role"],
              options: [
              "Agent שרץ על כל Node, מנהל Pods ומדווח סטטוס ל-\u2066API Server\u2069",
              "ניתוב תעבורת רשת בין Services באמצעות iptables או IPVS rules",
              "ניהול DNS פנימי בתוך הקלסטר ורישום שמות Services",
              "ניהול אחסון מתמיד עבור PersistentVolumes ו-StorageClasses",
],
              answer: 0,
              explanation:
                "kubelet הוא Agent (תהליך מערכת שרץ על כל Node) בקלסטר.\nהוא מתקשר עם ה-\u2066API Server\u2069 (הרכיב המרכזי שמנהל את מצב הקלסטר) ומקבל ממנו את ה-PodSpec (ההגדרה הרצויה של ה-Pods).\nלאחר מכן הוא:\n• מפעיל את ה-containers דרך ה-\u2066container runtime\u2069\n• מוודא שה-containers תואמים ל-PodSpec\n• מדווח סטטוס חזרה ל-\u2066API Server\u2069\nאם kubelet מפסיק לדווח, ה-Node מסומן כ-NotReady בקלסטר.",
            },
            {
              q: "מה תפקיד etcd ב-Kubernetes?",
              tags: ["etcd-data"],
              options: [
              "שרת DNS פנימי שמפתח שמות Services לכתובות IP",
              "מנוע scheduling שמחליט איפה להריץ Pods",
              "שכבת רשת שמנהלת תקשורת בין Nodes",
              "מאגר key-value מבוזר ששומר את כל מצב הקלסטר",
],
              answer: 3,
              explanation:
                "etcd הוא מאגר key-value מבוזר שמחזיק את כל מצב הקלסטר:\nPods, Services, ConfigMaps, Secrets, ועוד.\nכל שינוי שנשמר דרך API Server מגיע ל-etcd.",
            },
            {
              q: "מה הפקודה להקמת קלסטר חדש עם kubeadm?",
              tags: ["kubeadm-init"],
              options: [
              "kubeadm create cluster --name my-cluster",
              "kubeadm init",
              "kubeadm setup --control-plane",
              "kubeadm bootstrap --master",
],
              answer: 1,
              explanation:
                "kubeadm הוא כלי שמאפשר להקים קלסטר של קוברנטיס.\nהפקודה `kubeadm init` מאתחלת קלסטר חדש, יוצרת את ה-\u2066Control Plane\u2069 ומדפיסה פקודת `kubeadm join` לצירוף \u2066Worker Nodes\u2069.\nלאחר מכן יש להתקין \u2066CNI plugin\u2069 כדי לאפשר תקשורת בין Pods.",
            },
            {
              q: "כיצד מצרפים Worker Node ל-קלסטר קיים?",
              tags: ["kubeadm-join"],
              options: [
              "kubeadm add-node --master <IP> --token <token> --discovery-token-ca-cert-hash <hash>",
              "kubectl attach node --cluster <name> --token <token> --ca-cert-hash <hash>",
              "kubeadm register --node-role worker --api <IP> --token <token> --cert-hash <hash>",
              "kubeadm join <API-server>:<port> --token <token> --discovery-token-ca-cert-hash <hash>",
],
              answer: 3,
              explanation:
                "הפקודה `kubeadm join` מצרפת Node חדש לקלסטר.\nה-Node מתחבר ל-\u2066API Server\u2069 של ה-\u2066Control Plane\u2069 באמצעות token ו-\u2066CA certificate hash\u2069 כדי לאמת את זהות הקלסטר.\nה-token נוצר בזמן `kubeadm init` והוא תקף כברירת מחדל ל-24 שעות.",
            },
            {
              q: "מה Static Pod ב-Kubernetes?",
              tags: ["static-pod"],
              options: [
              "Pod שלא ניתן למחוק אותו עם kubectl delete בשום מצב",
              "Pod עם IP קבוע שלא משתנה גם אחרי restart של ה-Node",
              "Pod שמנוהל ישירות ע\"י kubelet דרך manifest file על ה-Node",
              "Pod שמשויך ל-StatefulSet עם אחסון קבוע ו-ordinal index",
],
              answer: 2,
              explanation:
                "Static Pod הוא Pod שמנוהל ישירות ע\"י kubelet, ולא נוצר דרך ה-\u2066API Server\u2069 או ה-Scheduler.\nה-manifest של ה-Pod נשמר כקובץ על ה-Node (בדרך כלל בתיקייה /etc/kubernetes/manifests/), וה-kubelet טוען אותו ומריץ את ה-Pod באופן אוטומטי.\nלאחר שה-Pod נוצר, kubelet עדיין מדווח עליו ל-\u2066API Server\u2069, ולכן ניתן לראות אותו עם `kubectl get pods`.\nרכיבי \u2066Control Plane\u2069 רבים בקלסטר שהוקם עם kubeadm (כמו etcd, \u2066API Server\u2069 ו-Scheduler) רצים כ-\u2066Static Pods\u2069.",
            },
            {
              q: "קלסטר חדש הותקן עם kubeadm.\n\nהרצת:\n\n```\nkubectl get nodes\n```\n\nפלט:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nמה הסיבה הסבירה ביותר?",
              tags: ["cni-notready"],
              options: [
              "CNI plugin לא הותקן ולכן ה-Node לא מוכן",
              "kubelet לא פועל על ה-Node",
              "etcd לא רץ ולכן הקלסטר לא יכול לשמור מצב",
              "kube-proxy לא מותקן ולכן אין ניתוב רשת",
],
              answer: 0,
              explanation:
                "אחרי `kubeadm init`, ה-\u2066Control Plane\u2069 רץ אבל ה-Node מסומן NotReady.\nהסיבה: חסר \u2066CNI plugin\u2069 (רכיב הרשת שמאפשר ל-Pods לתקשר).\nללא רשת Pods, Kubernetes לא יכול לתזמן עומסי עבודה על ה-Node.\nהתקנת CNI (כמו Calico, Flannel או Cilium) מגדירה את הרשת וה-Node עובר ל-Ready.",
            },
            {
              q: "מה תפקיד kube-proxy?",
              tags: ["kube-proxy-role"],
              options: [
              "מנהל DNS פנימי עבור Services בקלסטר",
              "מנהל כללי רשת על כל Node כדי לנתב traffic ל-Services",
              "מנהל certificates ו-TLS בין רכיבי Control Plane",
              "מנהל אימות ואישור בקשות ל-API Server",
],
              answer: 1,
              explanation:
                "kube-proxy הוא רכיב שרץ על כל Node בקלסטר.\nהוא מנהל כללי רשת (iptables או IPVS) שמנתבים תעבורה מ-Service (כתובת IP וירטואלית) אל ה-Pods שמאחוריו.\nכש-Service חדש נוצר, kube-proxy מעדכן את כללי הניתוב בכל ה-Nodes.\nללא kube-proxy, תעבורה לא תגיע ל-Pods דרך Services.",
            },
        ],
        questionsEn: [
            {
              q: "What are the four Control Plane components?",
              tags: ["controlplane-components"],
              options: [
              "API Server, etcd, Scheduler, Controller Manager",
              "Docker, containerd, CRI-O, runc",
              "kubelet, kube-proxy, CoreDNS, CNI plugin",
              "Ingress Controller, Service Mesh, API Gateway, Load Balancer",
],
              answer: 0,
              explanation:
                "The Control Plane consists of:\n• API Server: entry point for all requests\n• etcd: cluster state store\n• Scheduler: picks Nodes for Pods\n• Controller Manager: runs control loops",
            },
            {
              q: "What is the role of the kubelet?",
              tags: ["kubelet-role"],
              options: [
              "Managing internal DNS resolution within the cluster",
              "Routing network traffic between Services and Pods",
              "Managing persistent storage for PersistentVolumes",
              "An agent on every Node that manages Pods and reports status",
],
              answer: 3,
              explanation:
                "The kubelet is an agent that runs on every Node in the cluster.\nIt receives PodSpecs from the API Server and ensures the containers are running and healthy.\nIf the kubelet stops, the Node transitions to NotReady.",
            },
            {
              q: "What is the role of etcd in Kubernetes?",
              tags: ["etcd-data"],
              options: [
              "An internal DNS server that resolves Service names to IPs",
              "A distributed key-value store that holds all cluster state",
              "A scheduling engine that decides where to run Pods",
              "A network layer that manages communication between Nodes",
],
              answer: 1,
              explanation:
                "etcd is a distributed key-value store that holds all cluster state:\nPods, Services, ConfigMaps, Secrets, and more.\nEvery change saved through the API Server ends up in etcd.",
            },
            {
              q: "What is the command to bootstrap a new cluster with kubeadm?",
              tags: ["kubeadm-init"],
              options: [
              "kubeadm create cluster --name my-cluster",
              "kubeadm setup --control-plane",
              "kubeadm init",
              "kubeadm bootstrap --master",
],
              answer: 2,
              explanation:
                "kubeadm is a Kubernetes tool used to bootstrap and configure a cluster.\nThe command `kubeadm init` initializes a new cluster by setting up the Control Plane, generating the required certificates, and printing a `kubeadm join` command that can be used to add worker nodes.\nAfter initialization, a CNI plugin (Container Network Interface - the networking layer that allows Pods to communicate with each other) must be installed so Pods can communicate across the cluster.",
            },
            {
              q: "How do you join a worker Node to an existing cluster?",
              tags: ["kubeadm-join"],
              options: [
              "kubeadm join <API-server>:<port> --token <token> --discovery-token-ca-cert-hash <hash>",
              "kubectl attach node --cluster <name> --token <token> --discovery-token-ca-cert-hash <hash>",
              "kubeadm register --node-role worker --api <IP> --token <token> --ca-cert-hash <hash>",
              "kubeadm add-node --master <IP> --token <token> --discovery-token-ca-cert-hash <hash>",
],
              answer: 0,
              explanation:
                "The command `kubeadm join` adds a new node to an existing cluster.\nThe node connects to the API Server (the main control component that manages the cluster) of the Control Plane (the part of Kubernetes responsible for managing cluster state and scheduling) using a token and a CA certificate hash to verify the identity of the cluster.\nThe token is generated during `kubeadm init` and is valid for 24 hours by default.\n\n```\nkubeadm join <API-server>:<port> --token <token> --discovery-token-ca-cert-hash sha256:<hash>\n```",
            },
            {
              q: "What is a Static Pod in Kubernetes?",
              tags: ["static-pod"],
              options: [
              "A Pod that cannot be deleted using kubectl commands",
              "A Pod with a fixed IP address that persists after restart",
              "A Pod tied to a StatefulSet with dedicated persistent storage",
              "A Pod managed directly by the kubelet via a manifest file",
],
              answer: 3,
              explanation:
                "A Static Pod is managed directly by the kubelet, not through the API Server.\nIts manifest lives on the Node (usually /etc/kubernetes/manifests/).\nControl Plane components (API Server, etcd, Scheduler) are Static Pods in a kubeadm קלסטר.",
            },
            {
              q: "A new cluster was just bootstrapped with kubeadm.\n\nCommand:\n\n```\nkubectl get nodes\n```\n\nOutput:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nWhat is the most likely cause?",
              tags: ["cni-notready"],
              options: [
              "kubelet is not running on the Node",
              "A CNI plugin has not been installed so the Node is not ready",
              "etcd is down so the cluster cannot persist state",
              "kube-proxy is not installed so there is no network routing",
],
              answer: 1,
              explanation:
                "After `kubeadm init`, the Control Plane is running but the Node shows NotReady.\nThe reason: a CNI plugin (the network layer that allows Pods to communicate) is missing.\nWithout a Pod network, Kubernetes cannot schedule workloads on the Node.\nInstalling a CNI such as Calico, Flannel, or Cilium configures the network and the Node becomes Ready.",
            },
            {
              q: "What is the role of kube-proxy?",
              tags: ["kube-proxy-role"],
              options: [
              "Manages internal DNS for Services in the cluster",
              "Manages certificates and TLS between Control Plane components",
              "Manages network rules on each Node to route traffic to Services",
              "Handles authentication and authorisation of API Server requests",
],
              answer: 2,
              explanation:
                "kube-proxy is a component that runs on every Node in the cluster.\nIt manages network rules (iptables or IPVS) that route traffic from a Service (a virtual IP) to the Pods behind it.\nWhen a new Service is created, kube-proxy updates routing rules on all Nodes.\nWithout kube-proxy, traffic would not reach Pods through Services.",
            },
        ],
      },
      medium: {
        theory: "kubeadm, שדרוגים ו-etcd\n🔹 שדרוג עם kubeadm: שדרוג רכיבי ה-Control Plane וה-Nodes מתבצע בשלבים: `kubeadm upgrade plan`, `kubeadm upgrade apply`, `kubectl drain`, ולבסוף שדרוג kubelet\n🔹 גיבוי etcd: הפקודה `etcdctl snapshot save` שומרת את כל מצב הקלסטר לקובץ\n🔹 שחזור etcd: הפקודה `etcdctl snapshot restore` משחזרת את הקלסטר ממצב שנשמר\n🔹 הנתיב של Static Pods: kubelet עוקב אחרי שינויים בתיקייה /etc/kubernetes/manifests/ ומפעיל Pods אוטומטית\n🔹 קובץ kubeconfig: הקובץ ~/.kube/config מגדיר קלסטרים, users ו-contexts לחיבור לקלסטר\n🔹 חידוש certificates: הפקודה `kubeadm certs renew` מחדשת certificates שפג תוקפם\n🔹 ניהול Nodes: הפקודות `kubectl cordon`, `kubectl drain` ו-`kubectl uncordon` משמשות לתחזוקת Nodes\n🔹 זמינות גבוהה של etcd: נדרש מספר אי-זוגי של members (3 או 5) כדי לשמור על quorum\nCODE:\netcdctl snapshot save /tmp/etcd-backup.db",
        theoryEn: "kubeadm, Upgrades, and etcd\n🔹 kubeadm upgrade - upgrade Control Plane and Nodes step by step: upgrade plan, upgrade apply, drain, upgrade kubelet.\n🔹 etcd backup - `etcdctl snapshot save` captures the full cluster state.\n🔹 etcd restore - `etcdctl snapshot restore` recovers from a saved snapshot.\n🔹 Static Pod path - /etc/kubernetes/manifests/ - kubelet watches this directory for changes.\n🔹 kubeconfig - ~/.kube/config defines clusters, users, and contexts.\n🔹 Certificate rotation - `kubeadm certs renew` renews expired certificates.\n🔹 Node lifecycle - cordon, drain, uncordon for Node maintenance.\n🔹 HA etcd - odd number of members (3 or 5) to maintain quorum.\nCODE:\netcdctl snapshot save /tmp/etcd-backup.db",
        questions: [
            {
              q: "מה הצעד הראשון בשדרוג קלסטר עם kubeadm?",
              tags: ["kubeadm-upgrade"],
              options: [
              "drain של כל ה-Worker Nodes לפני שדרוג",
              "שדרוג kubelet על כל ה-Nodes במקביל",
              "גיבוי etcd ומחיקת הקלסטר לפני שדרוג",
              "הרצת kubeadm upgrade plan לבדיקת גרסאות",
],
              answer: 3,
              explanation:
                "סדר שדרוג kubeadm:\n1. `kubeadm upgrade plan` - בודק גרסאות זמינות\n2. `kubeadm upgrade apply v1.XX.Y` - משדרג Control Plane\n3. drain כל Worker Node\n4. שדרוג kubeadm, kubelet, kubectl על כל Node\n5. uncordon כל Node",
            },
            {
              q: "מה הפקודה לגיבוי etcd?",
              tags: ["etcd-backup"],
              options: [
              "kubectl backup etcd --output /tmp/backup.db",
              "kubeadm etcd backup --path /tmp/backup",
              "etcdctl snapshot save /tmp/etcd-backup.db",
              "etcdctl export --format=json > /tmp/backup.json",
],
              answer: 2,
              explanation:
                "כדי ליצור גיבוי ל-etcd משתמשים בפקודה:\n```\netcdctl snapshot save /tmp/etcd-backup.db\n```\nיש להגדיר את המשתנה:\n```\nETCDCTL_API=3\n```\nולספק את פרטי החיבור המאובטח ל-etcd באמצעות:\n```\n--endpoints\n--cacert\n--cert\n--key\n```\nקבצי ה-certificates נמצאים בדרך כלל בתיקייה:\n```\n/etc/kubernetes/pki/etcd/\n```",
            },
            {
              q: "איפה נמצאים ה-manifest files של Static Pods בקלסטר kubeadm?",
              options: [
              "/var/lib/kubelet/pods/",
              "/etc/kubernetes/manifests/",
              "/opt/kubernetes/static/",
              "/usr/local/k8s/manifests/",
],
              answer: 1,
              explanation:
                "kubelet עוקב אחרי התיקייה \u2066/etc/kubernetes/manifests/\u2069.\nכל קובץ YAML בתיקייה הופך ל-\u2066Static Pod\u2069.\nבקלסטר kubeadm, רכיבי \u2066Control Plane\u2069 (\u2066kube-apiserver\u2069, etcd, \u2066kube-scheduler\u2069, \u2066kube-controller-manager\u2069) מנוהלים כ-\u2066Static Pods\u2069 בתיקייה זו.",
            },
            {
              q: "מחקת Static Pod עם `kubectl delete pod`. ה-Pod חוזר מיד.\n\nלמה?",
              options: [
              "kubelet מנהל Static Pods ויוצר אותם מחדש כל עוד ה-manifest קיים בתיקייה",
              "ה-Deployment controller יוצר Pod חדש כדי לשמור על ה-replica count שהוגדר",
              "etcd שומר את הגדרות ה-Pod ומשחזר אותו אוטומטית לאחר מחיקה",
              "kube-proxy משחזר את ה-Pod כי הוא חלק מ-Service ונדרש לניתוב",
],
              answer: 0,
              explanation:
                "Static Pods מנוהלים ע\"י kubelet, לא ע\"י \u2066API Server\u2069.\n`kubectl delete` מוחק את ה-\u2066mirror Pod\u2069 מ-\u2066API Server\u2069, אבל kubelet רואה שה-manifest עדיין קיים ויוצר את ה-Pod מחדש.\nכדי למחוק \u2066Static Pod\u2069: מוחקים את ה-\u2066manifest file\u2069 מהתיקייה.",
            },
            {
              q: "כיצד מחליפים context ב-kubeconfig?",
              tags: ["kubeconfig-context"],
              options: [
              "kubectl config set-context --current --cluster <name>",
              "kubectl context switch <context-name>",
              "kubectl cluster use <context-name>",
              "kubectl config use-context <context-name>",
],
              answer: 3,
              explanation:
                "`kubectl config use-context <name>` מחליף את ה-context הפעיל.\nContext מגדיר שילוב של קלסטר + user + namespace.\n`kubectl config get-contexts` מציג את כל ה-contexts הזמינים.",
            },
            {
              q: "כמה etcd members צריך ב-production קלסטר כדי לשמור על quorum?",
              tags: ["etcd-ha"],
              options: [
              "3 או 5 members, תמיד מספר אי-זוגי",
              "4 members, מספר זוגי לאיזון",
              "2 members, אחד primary ואחד backup",
              "1 member מספיק עם גיבויים תקופתיים",
],
              answer: 0,
              explanation:
                "etcd דורש quorum כדי לפעול.\nquorum הוא הרוב המינימלי של ה-members שחייבים להיות זמינים כדי שה-etcd יוכל לקבל כתיבות ולשמור על עקביות הנתונים.\n3 members מאפשרים כשל של 1.\n5 מאפשרים כשל של 2.\nמספר אי-זוגי מונע \u2066split-brain\u2069.\n2 members גרוע מ-1: כשל של אחד = אובדן quorum.",
            },
            {
              q: "איך בודקים את תוקף ה-certificates בקלסטר kubeadm?",
              tags: ["certificate-management"],
              options: [
              "kubectl get certificates --all-namespaces",
              "openssl verify /etc/kubernetes/pki/*",
              "kubeadm certs check-expiration",
              "kubectl describe node | grep certificate",
],
              answer: 2,
              explanation:
                "`kubeadm certs check-expiration` מציג את תוקף כל ה-certificates.\nכברירת מחדל, certificates של kubeadm תקפים לשנה.\nלחידוש: `kubeadm certs renew all`.",
            },
            {
              q: "מה הפקודה לשחזור etcd מ-snapshot?",
              tags: ["etcd-restore"],
              options: [
              "kubeadm etcd restore --from /tmp/etcd-backup.db",
              "etcdctl snapshot restore /tmp/etcd-backup.db",
              "kubectl apply -f /tmp/etcd-backup.db",
              "etcdctl import --file /tmp/etcd-backup.db",
],
              answer: 1,
              explanation:
                "כדי לשחזר snapshot של etcd משתמשים בפקודה:\n```\netcdctl snapshot restore /tmp/etcd-backup.db --data-dir=/var/lib/etcd-restored\n```\nהפקודה משחזרת את הנתונים ל-\u2066data directory\u2069 חדש.\nלאחר מכן יש לעדכן את ה-\u2066Static Pod manifest\u2069 של etcd כך שישתמש ב-\u2066data directory\u2069 החדש ולהפעיל מחדש את kubelet.",
            },
        ],
        questionsEn: [
            {
              q: "What is the first step when upgrading a cluster with kubeadm?",
              tags: ["kubeadm-upgrade"],
              options: [
              "Run `kubeadm upgrade plan` to check versions",
              "Drain all Worker Nodes before any changes",
              "Back up etcd and then delete the cluster",
              "Upgrade kubelet on all Nodes immediately",
],
              answer: 0,
              explanation:
                "kubeadm upgrade order:\n1. `kubeadm upgrade plan` - check available versions\n2. `kubeadm upgrade apply v1.XX.Y` - upgrade Control Plane\n3. drain each Worker Node\n4. upgrade kubeadm, kubelet, kubectl on each Node\n5. uncordon each Node",
            },
            {
              q: "What is the command to back up etcd?",
              tags: ["etcd-backup"],
              options: [
              "kubectl backup etcd --output /tmp/backup.db",
              "etcdctl snapshot save /tmp/etcd-backup.db",
              "kubeadm etcd backup --path /tmp/backup",
              "etcdctl export --format=json > /tmp/backup.json",
],
              answer: 1,
              explanation:
                "To back up etcd, use the command:\n```\netcdctl snapshot save /tmp/etcd-backup.db\n```\nSet the environment variable:\n```\nETCDCTL_API=3\n```\nAnd provide the secure connection details to etcd:\n```\n--endpoints\n--cacert\n--cert\n--key\n```\nCertificate files are usually located at:\n```\n/etc/kubernetes/pki/etcd/\n```",
            },
            {
              q: "Where are Static Pod manifest files stored in a kubeadm cluster?",
              options: [
              "/var/lib/kubelet/pods/",
              "/opt/kubernetes/static/",
              "/usr/local/k8s/manifests/",
              "/etc/kubernetes/manifests/",
],
              answer: 3,
              explanation:
                "The kubelet watches /etc/kubernetes/manifests/.\nEvery YAML file in that directory becomes a Static Pod.\nIn a kubeadm קלסטר, Control Plane components (kube-apiserver, etcd, kube-scheduler, kube-controller-manager) are managed as Static Pods in this directory.",
            },
            {
              q: "You deleted a Static Pod with `kubectl delete pod`. It comes back immediately.\n\nWhy?",
              options: [
              "The Deployment controller creates a new Pod to maintain the desired replica count",
              "etcd persists the Pod definition and automatically restores it after deletion",
              "The kubelet manages Static Pods and recreates them while the manifest file exists",
              "kube-proxy restores the Pod because it is registered as part of a Service",
],
              answer: 2,
              explanation:
                "Static Pods are managed by the kubelet, not the API Server.\n`kubectl delete` removes the mirror Pod from the API Server, but the kubelet sees the manifest still exists and recreates the Pod.\nTo truly remove a Static Pod: delete the manifest file from the directory.",
            },
            {
              q: "How do you switch context in kubeconfig?",
              tags: ["kubeconfig-context"],
              options: [
              "kubectl config use-context <context-name>",
              "kubectl context switch <context-name>",
              "kubectl config set-context --current --cluster <name>",
              "kubectl cluster use <context-name>",
],
              answer: 0,
              explanation:
                "`kubectl config use-context <name>` switches the active context.\nA context defines a combination of cluster + user + namespace.\n`kubectl config get-contexts` lists all available contexts.",
            },
            {
              q: "How many etcd members are needed in a production קלסטר to maintain quorum?",
              tags: ["etcd-ha"],
              options: [
              "2 members, one primary and one backup",
              "1 member is enough with periodic backups",
              "4 members, an even number for balance",
              "3 or 5 members, always an odd number",
],
              answer: 3,
              explanation:
                "etcd requires a quorum to function.\nA quorum is the minimum majority of members that must be available for etcd to accept writes and maintain data consistency.\n3 members tolerate 1 failure.\n5 tolerate 2.\nAn odd number prevents split-brain.\n2 members is worse than 1: losing one means losing quorum.",
            },
            {
              q: "How do you check certificate expiration in a kubeadm cluster?",
              tags: ["certificate-management"],
              options: [
              "kubectl get certificates --all-namespaces",
              "kubeadm certs check-expiration",
              "openssl verify /etc/kubernetes/pki/*",
              "kubectl describe node | grep certificate",
],
              answer: 1,
              explanation:
                "`kubeadm certs check-expiration` shows the expiry of all certificates.\nBy default, kubeadm certificates are valid for one year.\nTo renew: `kubeadm certs renew all`.",
            },
            {
              q: "What is the command to restore etcd from a snapshot?",
              tags: ["etcd-restore"],
              options: [
              "kubeadm etcd restore --from /tmp/etcd-backup.db",
              "kubectl apply -f /tmp/etcd-backup.db",
              "etcdctl snapshot restore /tmp/etcd-backup.db",
              "etcdctl import --file /tmp/etcd-backup.db",
],
              answer: 2,
              explanation:
                "To restore an etcd snapshot, use the command:\n```\netcdctl snapshot restore /tmp/etcd-backup.db --data-dir=/var/lib/etcd-restored\n```\nThe command restores the data to a new data directory.\nAfter that, update the etcd Static Pod manifest to use the new data directory and restart kubelet.",
            },
        ],
      },
      hard: {
        theory: "שדרוג קלסטר\n🔹 שדרוג מתבצע בשלבים: קודם ה-\u2066Control Plane\u2069, אחר כך ה-Workers\nCODE:\nkubeadm upgrade apply v1.30.0\n\nTokens\n🔹 תקפים 24 שעות. ליצירת token חדש:\nCODE:\nkubeadm token create\n\nCSR (\u2066Certificate Signing Request\u2069)\n🔹 kubelet מבקש אישור certificate לתקשורת מאובטחת\n\n\u2066etcd Topology\u2069\n🔹 \u2066Stacked\u2069 - etcd רץ על אותם Nodes כמו ה-\u2066Control Plane\u2069\n🔹 \u2066External\u2069 - etcd רץ על Nodes נפרדים, אמין יותר\n\nTroubleshooting\n🔹 בדיקת kubelet:\nCODE:\nsystemctl status kubelet\njournalctl -u kubelet",
        theoryEn: "Cluster Upgrade\n🔹 Upgrade is done in stages: Control Plane first, then Workers\nCODE:\nkubeadm upgrade apply v1.30.0\n\nTokens\n🔹 Valid for 24 hours. To create a new token:\nCODE:\nkubeadm token create\n\nCSR (Certificate Signing Request)\n🔹 kubelet requests a certificate for secure communication\n\netcd Topology\n🔹 Stacked - etcd runs on the same Nodes as the Control Plane\n🔹 External - etcd runs on separate Nodes for higher resilience\n\nTroubleshooting\n🔹 Investigating kubelet:\nCODE:\nsystemctl status kubelet\njournalctl -u kubelet",
        questions: [
            {
              q: "שדרוג Control Plane עם kubeadm הושלם.\nWorker Nodes עדיין על הגרסה הישנה.\n\nמה הצעדים לשדרוג Worker Node?",
              tags: ["kubeadm-upgrade"],
              options: [
              "רק `kubeadm upgrade apply` על ה-Worker ואז `kubectl uncordon`",
              "מחיקת ה-Node מהקלסטר עם `kubectl delete node` ו-join מחדש עם הגרסה החדשה",
              "drain ה-Node, שדרוג kubeadm ו-kubelet, הפעלה מחדש של kubelet, uncordon",
              "הרצת `kubectl upgrade node` על כל Worker בנפרד ו-restart",
],
              answer: 2,
              explanation:
                "שדרוג Worker Node:\n1. `kubectl drain <node> --ignore-daemonsets` - פינוי Pods\n2. שדרוג kubeadm package\n3. `kubeadm upgrade node` - עדכון node config\n4. שדרוג חבילות kubelet ו-kubectl\n5. `systemctl restart kubelet`\n6. `kubectl uncordon <node>` - החזרת ה-Node לשירות",
            },
            {
              q: "הפקודה `kubectl get nodes` מציגה Node בסטטוס NotReady.\n\nSSH ל-Node הצליח.\n\nמה שתי הפעולות הראשונות?",
              tags: ["kubelet-troubleshooting"],
              options: [
              "`docker ps` לבדיקת containers ו-`kubectl describe node` לבדיקת conditions",
              "`systemctl status kubelet` ו-`journalctl -u kubelet`",
              "`kubectl logs kubelet` ו-`kubectl get events` ב-namespace kube-system",
              "`reboot` של ה-Node ואז `kubectl uncordon` להחזרה לשירות",
],
              answer: 1,
              explanation:
                "בדיקת Node NotReady:\n1. `systemctl status kubelet` - האם kubelet רץ?\n2. `journalctl -u kubelet` - בדיקת לוגים לשגיאות\nסיבות נפוצות: certificate expired, container runtime לא פעיל, חוסר disk space.",
            },
            {
              q: "`kubectl get pods -n kube-system` מציג ש-kube-scheduler לא רץ.\n\nPods חדשים נשארים ב-Pending ללא events.\n\nמה בודקים?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "בודקים את ה-manifest file של kube-scheduler ב-/etc/kubernetes/manifests/",
              "בודקים את ה-Deployment של kube-scheduler ב-namespace kube-system ומריצים rollout",
              "בודקים לוגים של kubelet עם `journalctl -u kubelet` לחיפוש שגיאות scheduler",
              "בודקים את ה-ConfigMap של kube-scheduler ב-kube-system ומחילים מחדש",
],
              answer: 0,
              explanation:
                "kube-scheduler הוא \u2066Static Pod\u2069 בקלסטר kubeadm.\nה-manifest נמצא ב-\u2066/etc/kubernetes/manifests/kube-scheduler.yaml\u2069.\nאם הקובץ פגום או חסר, kubelet לא יפעיל את ה-scheduler.\nלאבחון, בודקים את תוכן ה-manifest ואת סטטוס ה-containers עם `crictl ps`.",
            },
            {
              q: "ה-join token פג תוקף.\n\nWorker Node חדש צריך להצטרף לקלסטר.\n\nמה הפקודה ליצירת token חדש?",
              tags: ["kubeadm-join"],
              options: [
              "kubeadm init --token-only --ttl 24h",
              "kubectl create token --type=join --duration=24h",
              "kubeadm reset && kubeadm init מחדש על ה-\u2066Control Plane\u2069",
              "kubeadm token create --print-join-command",
],
              answer: 3,
              explanation:
                "`kubeadm token create --print-join-command` יוצר token חדש ומדפיס את פקודת ה-join המלאה.\nTokens תקפים 24 שעות כברירת מחדל.\nלרשימת tokens קיימים: `kubeadm token list`.",
            },
            {
              q: "CSR חדש מופיע עם `kubectl get csr`.\n\nפלט:\n\n```\nNAME        AGE  SIGNERNAME                     REQUESTOR       CONDITION\ncsr-abc12   2m   kubernetes.io/kubelet-serving  system:node:w3  Pending\n```\n\nמה עושים?",
              tags: ["certificate-csr"],
              options: [
              "CSR מאושר אוטומטית, אין צורך בפעולה",
              "`kubeadm certs sign csr-abc12`",
              "`kubectl certificate approve csr-abc12`",
              "`kubectl delete csr csr-abc12` ויצירה מחדש",
],
              answer: 2,
              explanation:
                "CSR (\u2066Certificate Signing Request\u2069) הוא בקשה לאישור תעודה דיגיטלית (certificate) בתוך הקלסטר.\nכאשר kubelet צריך certificate חדש (למשל לתקשורת מאובטחת עם \u2066API Server\u2069), הוא יוצר CSR ושולח אותו לאישור.\n`kubectl certificate approve <csr-name>` מאשר את הבקשה ומנפיק את ה-certificate.\nב-production, ניתן להגדיר \u2066auto-approval\u2069 עבור \u2066kubelet CSRs\u2069.",
            },
            {
              q: "API Server לא עולה אחרי שינוי ב-manifest.\n\nהרצת:\n\n```\ncrictl ps | grep apiserver\n```\n\nאין תוצאות.\n\nמה הצעד הבא?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "`kubectl describe pod kube-apiserver -n kube-system` לבדיקת events ו-status",
              "`kubeadm reset` ו-`kubeadm init` מחדש לאיפוס מלא של הקלסטר",
              "`systemctl restart kube-apiserver` להפעלה מחדש של ה-process",
              "`crictl logs` על ה-container ID של apiserver מ-`crictl ps -a`",
],
              answer: 3,
              explanation:
                "כש-\u2066API Server\u2069 לא רץ, kubectl לא יעבוד.\ncrictl הוא כלי CLI לתקשורת ישירה עם ה-\u2066container runtime\u2069 (כמו containerd) ללא תלות ב-\u2066API Server\u2069.\nלכן משתמשים בו לאבחון כשה-\u2066API Server\u2069 לא זמין:\n1. `crictl ps -a` - למצוא container שנכשל\n2. `crictl logs <container-id>` - לראות שגיאות\nסיבות נפוצות: manifest YAML לא תקין, \u2066certificate path\u2069 שגוי, port תפוס.",
            },
            {
              q: "מה ההבדל בין \u2066Stacked etcd\u2069 ל-\u2066External etcd\u2069 בקלסטר Kubernetes?",
              tags: ["etcd-topology"],
              options: [
              "\u2066Stacked etcd\u2069 תומך רק ב-3 Nodes, \u2066External etcd\u2069 תומך ב-5 ומעלה",
              "\u2066Stacked etcd\u2069 רץ על אותם Nodes כמו ה-\u2066Control Plane\u2069, \u2066External etcd\u2069 רץ על Nodes נפרדים",
              "\u2066Stacked etcd\u2069 משתף certificates עם ה-\u2066Control Plane\u2069, \u2066External etcd\u2069 משתמש ב-CA נפרד",
              "אין הבדל מעשי ביניהם, שניהם שמות שונים לאותה ארכיטקטורה",
],
              answer: 1,
              explanation:
                "\u2066Stacked etcd\u2069 - etcd רץ על אותם Nodes כמו ה-\u2066Control Plane\u2069. פשוט להקמה, אבל כשל של Node פוגע גם ב-etcd.\n\u2066External etcd\u2069 - etcd רץ על Nodes ייעודיים ונפרדים מה-\u2066Control Plane\u2069. עמיד יותר כי כשל של \u2066Control Plane Node\u2069 לא משפיע על etcd.\n\u2066Stacked\u2069 = הקמה פשוטה | \u2066External\u2069 = עמידות גבוהה",
            },
            {
              q: "הרצת:\n\n```\nkubeadm certs check-expiration\n```\n\nפלט:\n\n```\nCERTIFICATE                EXPIRES                  RESIDUAL TIME\napiserver                  Jan 15, 2025 10:00 UTC   <invalid>\napiserver-kubelet-client   Jan 15, 2025 10:00 UTC   <invalid>\nfront-proxy-client         Jan 15, 2025 10:00 UTC   <invalid>\n```\n\nמה הפתרון?",
              tags: ["certificate-management"],
              options: [
              "חידוש certificates והפעלה מחדש של רכיבי \u2066Control Plane\u2069",
              "מחיקת ה-certificates הישנים ידנית מ-/etc/kubernetes/pki/",
              "`kubectl delete secret` של ה-certificates ב-kube-system",
              "`kubeadm reset` ו-`kubeadm init` מחדש",
],
              answer: 0,
              explanation:
                "הפקודה `kubeadm certs renew all` מחדשת את כל ה-certificates של ה-\u2066Control Plane\u2069.\nרכיבי ה-\u2066Control Plane\u2069 (\u2066kube-apiserver\u2069, \u2066kube-controller-manager\u2069, \u2066kube-scheduler\u2069) טוענים certificates רק בעת הפעלה.\nרכיבים אלו רצים כ-\u2066Static Pods\u2069 שמנוהלים על ידי kubelet.\nkubelet עוקב אחרי התיקייה \u2066/etc/kubernetes/manifests/\u2069 - כשה-manifest משתנה, kubelet יוצר מחדש את ה-Pod וה-certificate החדש נטען.",
            },
        ],
        questionsEn: [
            {
              q: "The Control Plane upgrade with kubeadm is complete.\nWorker Nodes are still on the old version.\n\nWhat are the steps to upgrade a Worker Node?",
              tags: ["kubeadm-upgrade"],
              options: [
              "Run `kubeadm upgrade apply` on the Worker, restart kubelet, uncordon",
              "Delete the Node with `kubectl delete node`, rejoin with the new version",
              "Run `kubectl upgrade node` on each Worker, then restart kubelet",
              "Drain the Node, upgrade kubeadm and kubelet, restart kubelet, uncordon",
],
              answer: 3,
              explanation:
                "Worker Node upgrade:\n1. `kubectl drain <node> --ignore-daemonsets` - evict Pods\n2. upgrade kubeadm package\n3. `kubeadm upgrade node` - update node config\n4. upgrade kubelet and kubectl packages\n5. `systemctl restart kubelet`\n6. `kubectl uncordon <node>` - return Node to service",
            },
            {
              q: "`kubectl get nodes` shows a Node in NotReady status.\n\nSSH to the Node succeeded.\n\nWhat are your first two actions?",
              tags: ["kubelet-troubleshooting"],
              options: [
              "`systemctl status kubelet` and `journalctl -u kubelet`",
              "`kubectl logs kubelet` and `kubectl get events --all`",
              "`docker ps` and `kubectl describe node <node-name>`",
              "`reboot` the Node and then `kubectl uncordon <node>`",
],
              answer: 0,
              explanation:
                "Investigating a NotReady Node:\n1. `systemctl status kubelet` - is the kubelet running?\n2. `journalctl -u kubelet` - check logs for errors\nCommon causes: expired certificates, container runtime not running, disk pressure.",
            },
            {
              q: "`kubectl get pods -n kube-system` shows kube-scheduler is not running.\n\nNew Pods remain Pending with no scheduling events.\n\nWhat do you check?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "Check the Deployment of kube-scheduler in kube-system",
              "Check kubelet logs with `journalctl -u kubelet` for scheduler errors",
              "Check the manifest file at /etc/kubernetes/manifests/",
              "Check the ConfigMap for kube-scheduler in kube-system",
],
              answer: 2,
              explanation:
                "kube-scheduler is a Static Pod in a kubeadm קלסטר.\nIts manifest lives at /etc/kubernetes/manifests/kube-scheduler.yaml.\nIf the file is corrupted or missing, the kubelet will not start the scheduler.\nCheck: `cat /etc/kubernetes/manifests/kube-scheduler.yaml` and `crictl ps`.",
            },
            {
              q: "The join token has expired.\n\nA new Worker Node needs to join the cluster.\n\nWhat command creates a new token?",
              tags: ["kubeadm-join"],
              options: [
              "kubeadm init --token-only --ttl 24h",
              "kubeadm token create --print-join-command",
              "kubectl create token --type=join --ttl 24h",
              "kubeadm reset && kubeadm init --new-token",
],
              answer: 1,
              explanation:
                "`kubeadm token create --print-join-command` creates a new token and prints the full join command.\nTokens are valid for 24 hours by default.\nTo list existing tokens: `kubeadm token list`.",
            },
            {
              q: "A new CSR appears in `kubectl get csr`.\n\nOutput:\n\n```\nNAME        AGE  SIGNERNAME                     REQUESTOR       CONDITION\ncsr-abc12   2m   kubernetes.io/kubelet-serving  system:node:w3  Pending\n```\n\nWhat do you do?",
              tags: ["certificate-csr"],
              options: [
              "`kubectl certificate approve csr-abc12`",
              "`kubeadm certs sign csr-abc12`",
              "CSR is auto-approved, no action needed",
              "`kubectl delete csr csr-abc12` and recreate",
],
              answer: 0,
              explanation:
                "A CSR (Certificate Signing Request) is a request to approve a digital certificate inside the cluster.\nWhen the kubelet needs a new certificate (e.g. for secure communication with the API Server), it creates a CSR and submits it for approval.\n`kubectl certificate approve <csr-name>` approves the request and issues the certificate.\nIn production, auto-approval can be configured for kubelet CSRs.",
            },
            {
              q: "The API Server is not starting after a manifest change.\n\nCommand:\n\n```\ncrictl ps | grep apiserver\n```\n\nNo results.\n\nWhat is the next step?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "`kubectl describe pod kube-apiserver -n kube-system`",
              "`crictl logs` on the failed container from `crictl ps -a`",
              "`systemctl restart kube-apiserver` on the control-plane node",
              "`kubeadm reset` and `kubeadm init` to rebuild the cluster",
],
              answer: 1,
              explanation:
                "When the API Server is down, kubectl will not work.\ncrictl is a CLI tool that communicates directly with the container runtime (e.g. containerd) without depending on the API Server.\nThis makes it the right tool for debugging when the API Server is unavailable:\n1. `crictl ps -a` - find the failed container\n2. `crictl logs <container-id>` - see errors\nCommon causes: invalid manifest YAML, wrong certificate path, port conflict.",
            },
            {
              q: "What is the difference between Stacked etcd and External etcd in a Kubernetes cluster?",
              tags: ["etcd-topology"],
              options: [
              "Stacked etcd supports only 3 nodes; External etcd supports 5+",
              "Stacked etcd runs on the same Nodes as the Control Plane; External etcd runs on separate Nodes",
              "No difference, they are different names for the same architecture",
              "Stacked etcd shares certificates with the Control Plane; External etcd uses a separate CA",
],
              answer: 1,
              explanation:
                "Stacked etcd - etcd runs on the same Nodes as the Control Plane. Simpler to set up, but a Node failure takes down both Control Plane and etcd.\nExternal etcd - etcd runs on separate, dedicated Nodes. More resilient because a Control Plane failure does not affect etcd.\nStacked = simpler setup | External = higher resilience",
            },
            {
              q: "Command:\n\n```\nkubeadm certs check-expiration\n```\n\nOutput:\n\n```\nCERTIFICATE                EXPIRES                  RESIDUAL TIME\napiserver                  Jan 15, 2025 10:00 UTC   <invalid>\napiserver-kubelet-client   Jan 15, 2025 10:00 UTC   <invalid>\nfront-proxy-client         Jan 15, 2025 10:00 UTC   <invalid>\n```\n\nWhat is the fix?",
              tags: ["certificate-management"],
              options: [
              "Manually delete old certificates from /etc/kubernetes/pki/",
              "`kubectl delete secret` for the certificates in kube-system",
              "`kubeadm reset` and `kubeadm init` again",
              "Renew certificates with `kubeadm certs renew all` and restart the Control Plane",
],
              answer: 3,
              explanation:
                "`kubeadm certs renew all` renews all Control Plane certificates.\nControl Plane components (kube-apiserver, kube-controller-manager, kube-scheduler) load certificates only at startup.\nThese components run as Static Pods managed by kubelet.\nkubelet watches `/etc/kubernetes/manifests/` - when a manifest changes, kubelet recreates the Pod and the new certificate is loaded.",
            },
        ],
      },
    },
  },
  {
    id: "config",
    icon: "config",
    name: "Config & Secrets",
    color: "#F59E0B",
    description: "ConfigMaps · Secrets · RBAC · SA",
    descriptionEn: "ConfigMaps · Secrets · RBAC · SA",
    levels: {
      easy: {
        theory: "Config, Secrets, הרשאות ומגבלות.\n🔹 ConfigMap:\u200E הגדרות רגילות (DB_URL, timeout), env או volume\n🔹 Secret:\u200E נתונים רגישים (passwords, tokens), מקודד base64 (לא מוצפן!)\n🔹 ServiceAccount:\u200E זהות Pod בקלאסטר. default נוצר אוטומטית בכל Namespace\n🔹 RBAC:\u200E Role-Based Access Control. Role מגדיר הרשאות, RoleBinding מקשר ל-Subject\n🔹 LimitRange:\u200E מגדיר ברירות מחדל ומקסימום CPU/Memory לכל Container ב-Namespace\n🔹 securityContext:\u200E runAsNonRoot: true מונע הרצת Container כ-root\n🔹 Requests vs Limits:\u200E requests = מינימום מובטח (Scheduler), limits = תקרה (OOMKill)\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        theoryEn: "Config, Secrets, Access Control, and Resource Limits\n🔹 ConfigMap - stores non-sensitive config (DB URLs, timeouts), injected as env vars or volumes.\n🔹 Secret - stores sensitive data (passwords, tokens), base64-encoded but not encrypted by default.\n🔹 ServiceAccount - Pod identity in the cluster. A default SA is auto-created in every Namespace.\n🔹 RBAC - Role-Based Access Control. Role defines permissions, RoleBinding binds a Role to a Subject.\n🔹 LimitRange - sets default and max CPU/Memory per container in a Namespace.\n🔹 securityContext - runAsNonRoot: true prevents containers from running as root.\n🔹 Requests vs Limits - requests = guaranteed minimum (used by Scheduler), limits = hard ceiling (OOMKill).\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
        questions: [
            {
              q: "מה ההבדל בין ConfigMap ל-Secret?",
              tags: ["configmap-vs-secret"],
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
              tags: ["config-mount"],
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
              q: "מה עושה ההגדרה runAsNonRoot: true ב-securityContext?\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```",
              options: [
              "מצפינה את מערכת הקבצים של הקונטיינר",
              "מונעת מהקונטיינר לרוץ כמשתמש root (UID 0)",
              "מגבילה את צריכת ה-CPU של הקונטיינר לפי limits",
              "מגבילה את גישת הרשת של הקונטיינר",
],
              answer: 1,
              explanation:
                "ההגדרה runAsNonRoot: true מבטיחה שהתהליך בתוך הקונטיינר לא ירוץ כמשתמש root (UID 0).\n\nאם הקונטיינר מוגדר לרוץ כ-root, Kubernetes ימנע את ההרצה.\n\nזהו מנגנון אבטחה שמקטין את הסיכון להרצת קוד עם הרשאות גבוהות בתוך הקונטיינר.",
            },
            {
              q: "מה ההבדל בין resource requests ל-limits?",
              tags: ["requests-vs-limits"],
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
              tags: ["configmap-vs-secret"],
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
              tags: ["config-mount"],
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
              q: "What does the runAsNonRoot: true setting do in securityContext?\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```",
              options: [
              "Encrypts the container's filesystem",
              "Prevents the container from running as root user (UID 0)",
              "Limits the container's CPU usage according to limits",
              "Restricts the container's network access",
],
              answer: 1,
              explanation:
                "The runAsNonRoot: true setting ensures the process inside the container does not run as root (UID 0).\n\nIf the container is configured to run as root, Kubernetes will prevent it from starting.\n\nThis is a security mechanism that reduces the risk of running code with elevated privileges inside the container.",
            },
            {
              q: "What is the difference between resource requests and limits?",
              tags: ["requests-vs-limits"],
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
        theory: "RBAC, אבטחה ומגבלות Namespace.\n🔹 Role:\u200E הרשאות ב-Namespace אחד. ClusterRole = כלל הקלאסטר\n🔹 RoleBinding:\u200E קושר Role ל-Subject (User/ServiceAccount)\n🔹 ServiceAccount:\u200E זהות Pod בקלאסטר\n🔹 PSA:\u200E Pod Security Admission. label על Namespace אוכף restricted/baseline/privileged\n🔹 Admission Webhook:\u200E validating/mutating, רץ לפני שמירה ל-etcd\n🔹 LimitRange vs ResourceQuota:\u200E LimitRange = לכל Container, ResourceQuota = סך ה-Namespace\n🔹 seccomp:\u200E מגביל syscalls לצמצום שטח התקיפה\n🔹 External Secrets Operator:\u200E מסנכרן secrets מ-AWS/GCP/Azure דרך SecretStore\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        theoryEn: "RBAC, Security, and Namespace Limits\n🔹 Role - permissions scoped to one Namespace. ClusterRole = cluster-wide.\n🔹 RoleBinding - binds a Role to a Subject (User or ServiceAccount).\n🔹 ServiceAccount - identity for a Pod within the cluster.\n🔹 PSA - Pod Security Admission. Namespace label enforces restricted/baseline/privileged standards.\n🔹 Admission webhooks - validating/mutating hooks that run before saving to etcd.\n🔹 LimitRange vs ResourceQuota - LimitRange = per-container defaults, ResourceQuota = Namespace aggregate.\n🔹 seccomp - restricts syscalls to reduce attack surface.\n🔹 External Secrets Operator - syncs secrets from AWS/GCP/Azure via SecretStore + ExternalSecret.\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n- apiGroups: [\"\"]\n  resources: [\"pods\"]\n  verbs: [\"get\",\"list\",\"watch\"]",
        questions: [
            {
              q: "מה ההבדל בין Role ל-ClusterRole?",
              tags: ["role-scope"],
              options: [
              "Role מוגבל ל-Namespace, ClusterRole חל על כל ה-Cluster",
              "ClusterRole חל רק על Nodes, Role חל על כל שאר המשאבים ב-Cluster",
              "Role מעניק הרשאות רק ל-Users, ClusterRole מעניק הרשאות רק ל-ServiceAccounts",
              "Role ו-ClusterRole זהים בהיקף, אבל ClusterRole תומך ב-verbs נוספים כמו escalate",
],
              answer: 0,
              explanation:
                "Role מוגבל ל-Namespace ספציפי. ClusterRole חל על כל ה-Cluster.\nRole ב-prod לא מעניק גישה ב-staging. ClusterRole כולל Nodes, PVs ועוד.\nשניהם חלים על Users, Groups, ו-ServiceAccounts. ההבדל המרכזי הוא ב-scope בלבד.\nניתן לקשור ClusterRole ל-Namespace בודד עם RoleBinding.",
            },
            {
              q: "מה תפקיד RoleBinding?",
              tags: ["rbac-binding"],
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
              tags: ["admission-control"],
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
              tags: ["limitrange-vs-quota"],
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
              q: "ב-Kubernetes ניתן להגדיר seccomp profile ב-securityContext של Pod.\n\nמה התפקיד של seccomp profile?",
              options: [
              "מגביל את כמות ה-CPU שקונטיינר יכול לצרוך בכל Node",
              "מצפין את התעבורה בין קונטיינרים באותו Pod דרך localhost",
              "מגביל את ה-syscalls שקונטיינר יכול לבצע. מצמצם attack surface",
              "מגביל את ה-DNS queries שקונטיינר יכול לשלוח ל-CoreDNS",
],
              answer: 2,
              explanation:
                "seccomp (Secure Computing) מגביל אילו system calls קונטיינר יכול לבצע.\n\nלמה זה חשוב?\nב-Linux יש 300+ syscalls, אבל קונטיינר ממוצע צריך רק חלק קטן מהם. חסימת השאר מצמצמת את ה-attack surface.\n\nאיך מגדירים:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault מפעיל פרופיל בסיסי שחוסם syscalls מסוכנים כמו reboot או mount.",
            },
            {
              q: "איך מושכים Secrets מ-AWS Secrets Manager לתוך Kubernetes?",
              tags: ["external-secrets"],
              options: [
              "External Secrets Operator - מגדיר SecretStore ומשאב ExternalSecret",
              "Vault Agent Injector - sidecar שמזריק secrets ישירות לתוך ה-Pod",
              "SOPS operator - מפענח קבצי YAML מוצפנים ויוצר K8s Secrets",
              "Sealed Secrets - מצפין Secrets ושומר אותם ב-Git בצורה בטוחה",
],
              answer: 0,
              explanation:
                "External Secrets Operator (ESO) מסנכרן secrets מ-provider חיצוני (כמו AWS Secrets Manager) לתוך Kubernetes Secrets באופן אוטומטי.\nהערכים עצמם נשארים ב-provider - רק ההגדרות נשמרות ב-Git.\n\nשלושת המשאבים המרכזיים:\n• SecretStore - מגדיר את החיבור ל-provider החיצוני (AWS, GCP, Vault וכו׳)\n• ExternalSecret - מגדיר איזה secret למשוך ואיך למפות אותו\n• Kubernetes Secret - נוצר אוטומטית בתוך ה-Cluster על ידי ESO\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password\n```",
            },
        ],
        questionsEn: [
            {
              q: "What is the difference between Role and ClusterRole?",
              tags: ["role-scope"],
              options: [
              "ClusterRole applies only to Nodes; Role applies to all other resources in the cluster",
              "Role grants permissions only to Users; ClusterRole grants permissions only to ServiceAccounts",
              "Role is Namespace-scoped, ClusterRole is cluster-wide",
              "Role and ClusterRole have the same scope but ClusterRole supports additional verbs like escalate",
],
              answer: 2,
              explanation:
                "Role is Namespace-scoped. ClusterRole applies cluster-wide.\nRole in prod grants no access in staging. ClusterRole covers Nodes, PVs, etc.\nBoth apply to Users, Groups, and ServiceAccounts. The key difference is scope, not verbs.\nClusterRole can be bound to a single Namespace via RoleBinding.",
            },
            {
              q: "What is a RoleBinding?",
              tags: ["rbac-binding"],
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
              tags: ["admission-control"],
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
              tags: ["limitrange-vs-quota"],
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
              q: "In Kubernetes you can set a seccomp profile in a Pod's securityContext.\n\nWhat does a seccomp profile do?",
              options: [
              "Limits the amount of CPU a container can consume on each Node",
              "Encrypts traffic between containers in the same Pod via localhost",
              "Restricts the syscalls a container can make. Reduces the attack surface",
              "Limits the DNS queries a container can send to CoreDNS",
],
              answer: 2,
              explanation:
                "seccomp (Secure Computing) restricts which system calls a container can make.\n\nWhy does it matter?\nLinux has 300+ syscalls, but an average container only needs a small subset. Blocking the rest reduces the attack surface.\n\nHow to configure:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault applies a baseline profile that blocks dangerous syscalls like reboot or mount.",
            },
            {
              q: "How do you sync a Secret from AWS Secrets Manager?",
              tags: ["external-secrets"],
              options: [
              "Sealed Secrets controller: encrypts Secrets and stores them in Git",
              "External Secrets Operator: SecretStore + ExternalSecret resources",
              "Vault Agent Injector: a sidecar that injects secrets directly into Pods",
              "SOPS operator: decrypts encrypted YAML files and creates K8s Secrets",
],
              answer: 1,
              explanation:
                "External Secrets Operator (ESO) syncs secrets from an external provider (like AWS Secrets Manager) into Kubernetes Secrets automatically.\nThe actual secret values stay in the provider - only the configuration resources are stored in Git.\n\nThree key resources:\n• SecretStore - defines the connection to the external provider (AWS, GCP, Vault, etc.)\n• ExternalSecret - defines which secret to pull and how to map it\n• Kubernetes Secret - created automatically inside the cluster by ESO\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n  - secretKey: password\n    remoteRef:\n      key: prod/db/password\n```",
            },
        ],
      },
      hard: {
        theory: "אבטחה מתקדמת ואכיפת מדיניות.\n🔹 Least Privilege:\u200E רק ההרשאות המינימליות\n🔹 Sealed Secrets:\u200E הצפנת secrets לאחסון בטוח ב-git\n🔹 Encryption at Rest:\u200E הצפנת etcd (AES-GCM)\n🔹 Pod Security Standards:\u200E privileged / baseline / restricted\n🔹 OPA/Gatekeeper:\u200E admission webhook + Rego policies לאכיפת מדיניות\n🔹 Kyverno:\u200E admission webhook שחוסם images לא מאושרים\n🔹 RBAC Debug:\u200E forbidden error = חסר Role + RoleBinding ל-ServiceAccount\n🔹 PSA restricted:\u200E דורש allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
        theoryEn: "Advanced Security and Policy Enforcement\n🔹 Least privilege - grant only the minimum permissions required.\n🔹 Sealed Secrets - encrypts secrets for safe storage in git.\n🔹 Encryption at rest - encrypts etcd data on disk (AES-GCM).\n🔹 Pod Security Standards - three levels: privileged, baseline, restricted.\n🔹 OPA/Gatekeeper - admission webhook with Rego policies for policy-as-code enforcement.\n🔹 Kyverno - admission webhook that can block unapproved container registries.\n🔹 RBAC debugging - \"forbidden\" error = missing Role + RoleBinding for the ServiceAccount.\n🔹 PSA restricted - requires allowPrivilegeEscalation: false, runAsNonRoot: true, seccompProfile.\nCODE:\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nspec:\n  secretStoreRef:\n    name: aws-secretsmanager\n  target:\n    name: my-k8s-secret",
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
              tags: ["sealed-secrets"],
              options: [
              "יצירת Kubernetes Secrets אוטומטית מ-environment variables בזמן deploy",
              "שיתוף Secrets מוצפנים בין Clusters שונים באמצעות מפתח משותף",
              "הצפנת תעבורת רשת בין Pods באמצעות מפתחות שנשמרים ב-etcd",
              "שמירת Secrets מוצפנים ב-git בבטחה כמשאבים מסוג SealedSecret",
],
              answer: 3,
              explanation:
                "Sealed Secrets הוא controller שמגדיר Custom Resource בשם SealedSecret.\nהוא מצפין Secret רגיל ל-SealedSecret באמצעות המפתח הציבורי של ה-Cluster.\nה-SealedSecret המוצפן בטוח לשמירה ב-git. רק ה-controller עם המפתח הפרטי מפענח ויוצר Secret רגיל בתוך ה-Cluster.\nכל Cluster מחזיק מפתח פרטי ייחודי, כך ש-SealedSecret מ-Cluster אחד לא ניתן לפענוח ב-Cluster אחר.\nההצפנה חלה רק על Secrets בתוך git, לא על תעבורת רשת או יצירת secrets מ-env vars.",
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
              q: "ה-Deployment נדחה על ידי PSA עם policy מסוג restricted.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity \"restricted:latest\":\n  allowPrivilegeEscalation != false\n```\n\nאיזה securityContext צריך להגדיר ל-container כדי לעמוד במדיניות?",
              tags: ["psa-admission"],
              options: [
              "```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```",
              "```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```",
              "```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n```",
              "```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```",
],
              answer: 1,
              explanation:
                "PSA (Pod Security Admission) הוא מנגנון built-in ב-Kubernetes שאוכף מדיניות אבטחה על Pods ברמת ה-Namespace.\n\nרמת restricted דורשת שלוש הגדרות חובה:\n• allowPrivilegeEscalation: false - חוסם הסלמת הרשאות דרך setuid/setgid\n• runAsNonRoot: true - מונע הרצה כ-root (UID 0)\n• seccompProfile: RuntimeDefault - אוכף סינון syscall בסיסי\n\n```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nאפשרות א מגדירה \u200Eprivileged: true - ההפך מ-restricted.\nאפשרות ג חסרה allowPrivilegeEscalation ו-seccompProfile.\nאפשרות ד חסרה runAsNonRoot ו-seccompProfile.",
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
              tags: ["sealed-secrets"],
              options: [
              "Sharing encrypted Secrets between different Clusters using a shared key",
              "Storing encrypted secrets in git safely as SealedSecret resources",
              "Auto-creating Kubernetes Secrets from environment variables at deploy time",
              "Encrypting network traffic between Pods using keys stored in etcd",
],
              answer: 1,
              explanation:
                "Sealed Secrets is a controller that defines a Custom Resource called SealedSecret.\nIt encrypts a regular Secret into a SealedSecret using the cluster's public key.\nThe SealedSecret is safe to commit to git. Only the controller with the private key can decrypt it and create a regular Secret inside the cluster.\nEach cluster holds a unique private key, so a SealedSecret from one cluster cannot be decrypted by another.\nThe encryption applies only to Secrets stored in git, not to network traffic or auto-creation from env vars.",
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
              q: "A Deployment is rejected by PSA with a restricted policy.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity \"restricted:latest\":\n  allowPrivilegeEscalation != false\n```\n\nWhich securityContext must you set on the container to comply?",
              tags: ["psa-admission"],
              options: [
              "```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```",
              "```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```",
              "```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n```",
              "```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```",
],
              answer: 1,
              explanation:
                "PSA (Pod Security Admission) is a built-in Kubernetes mechanism that enforces security policies on Pods at the Namespace level.\n\nThe restricted level requires all three:\n• allowPrivilegeEscalation: false - blocks privilege escalation via setuid/setgid\n• runAsNonRoot: true - prevents running as root (UID 0)\n• seccompProfile: RuntimeDefault - enforces basic syscall filtering\n\n```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nOption A sets privileged: true - the opposite of restricted.\nOption C is missing allowPrivilegeEscalation and seccompProfile.\nOption D is missing runAsNonRoot and seccompProfile.",
            },
        ],
      },
    },
  },
  {
    id: "storage",
    icon: "storage",
    name: "Storage & Helm",
    color: "#10B981",
    description: "PV · StorageClass · Helm · Operators",
    descriptionEn: "PV · StorageClass · Helm · Operators",
    levels: {
      easy: {
        theory: "PersistentVolumes ו-Helm בסיסי.\n🔹 \u200FPV\u200F: יחידת אחסון ב-Cluster (admin מגדיר)\n🔹 \u200FPVC\u200F: בקשה לאחסון מ-Pod\n🔹 \u200FHelm Chart\u200F: חבילה של Kubernetes manifests עם templates\n🔹 \u200Fhelm install\u200F: מתקין Chart ויוצר Release\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
        theoryEn: "PersistentVolumes and Helm Basics\n🔹 PersistentVolume (PV) - a storage resource in the cluster, provisioned by an administrator.\n🔹 PersistentVolumeClaim (PVC) - a request by a Pod for a specific amount of storage.\n🔹 Helm Chart - a package of Kubernetes manifests with configurable templates.\n🔹 `helm install` - deploys a Chart to the cluster and creates a named Release.\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nspec:\n  accessModes: [ReadWriteOnce]\n  resources:\n    requests:\n      storage: 10Gi",
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
              q: "מה תפקיד Helm Chart\u200F?",
              tags: ["helm-chart"],
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
              q: "מה הפקודה להתקנת Helm Chart\u200F?",
              options: [
              "helm upgrade",
              "helm template",
              "helm install",
              "helm create",
],
              answer: 2,
              explanation:
                "`helm install` מתקין Chart ויוצר Release שנשמר כ-Secret ב-Cluster.\n`helm upgrade` משנה Release קיים. `helm template` מרנדר YAML בלי להתקין. `helm create` יוצר scaffold של Chart חדש.\nאפשר לעקוף ערכים עם `--set key=value` או `\u200E-f myvalues.yaml`.",
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
              q: "מה תפקיד values.yaml ב-Helm Chart\u200F?",
              options: [
              "קובץ שמגדיר כללי RBAC עבור ה-Release שנוצר מ-Chart",
              "קובץ שמכיל secrets מוצפנים שה-Chart משתמש בהם בזמן deploy",
              "קובץ שמכיל ברירות מחדל לכל ה-template variables של Chart",
              "קובץ שמתעד את היסטוריית ה-deployments של Chart ב-Cluster",
],
              answer: 2,
              explanation:
                "values.yaml מכיל ברירות מחדל לכל ה-template variables של Chart.\nאפשר לעקוף ערכים עם `--set key=value` או להחליף קובץ עם `\u200E-f my-values.yaml`.\nכך Chart אחד משרת סביבות שונות (dev, staging, production).",
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
              tags: ["helm-chart"],
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
                "`helm install` creates a Release stored as a Secret in the cluster.\n`helm upgrade` modifies an existing Release. `helm template` renders YAML without installing. `helm create` scaffolds a new Chart.\nOverride values with --set key=value or -f myvalues.yaml.",
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
        theoryEn: "StorageClass and Helm Values\n🔹 StorageClass - defines the type of storage and the provisioner used to create it.\n🔹 Dynamic provisioning - a PersistentVolume is created automatically when a PVC is submitted.\n🔹 Reclaim policy - the Delete policy removes the PV automatically when its PVC is deleted.\n🔹 `helm upgrade` - updates a Release with new values using `--set` or a values file.\nCODE:\nhelm install my-app ./chart --set replicaCount=3\nhelm upgrade my-app ./chart -f prod-values.yaml\nhelm rollback my-app 1",
        questions: [
            {
              q: "מה משמעות Dynamic Provisioning ב-Kubernetes?",
              tags: ["dynamic-provisioning"],
              options: [
              "הקצאת CPU דינמית ל-Pods לפי עומס שמדווח מ-metrics-server",
              "שינוי גודל אוטומטי של PVC קיים לפי צריכת הדיסק בפועל",
              "PV ודיסק פיזי נוצרים אוטומטית כשנוצר PVC עם StorageClass",
              "העברת Pod אוטומטית ל-Node אחר כשה-Node הנוכחי מתמלא",
],
              answer: 2,
              explanation:
                "כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית.\nשינוי גודל דיסק קיים נעשה דרך Volume Expansion, לא דרך Dynamic Provisioning.\nזו הגישה הסטנדרטית בכל Cluster ענן, והיא חוסכת יצירת PV ידנית.",
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
                "כשה-PVC נמחק, גם ה-PV והדיסק הפיזי (EBS, GCP PD) נמחקים אוטומטית.\nRetain לעומת זאת משמר את ה-PV והנתונים גם אחרי מחיקת ה-PVC.\nאין backup אוטומטי לפני מחיקה, לכן חשוב לגבות מראש בסביבות production.",
            },
            {
              q: "איך עוקפים ערך מ-values.yaml בזמן התקנת Helm Chart\u200F?",
              options: [
              "helm template --set key=value",
              "helm rollback --set key=value",
              "helm install --set key=value",
              "helm show values --set key=value",
],
              answer: 2,
              explanation:
                "--set key=value עוקף ערכים מ-values.yaml בזמן install/upgrade.\n`helm template` רק מרנדר YAML בלי להתקין. `helm rollback` לא מקבל --set. `helm show values` מציג ערכים בלבד.\nלשינויים מרובים עדיף --values (-f) עם קובץ YAML מותאם.",
            },
            {
              q: "כיצד מרחיבים PVC?",
              options: [
              "מגדירים allowVolumeExpansion: true ב-StorageClass ומגדילים spec.resources.requests.storage",
              "kubectl merge-pvc\nיוצרים PVC שני ומשתמשים לאיחוד הנפחים",
              "מוחקים את ה-PVC ויוצרים חדש עם גודל גדול יותר באותו StorageClass",
              "משנים את ה-PV הקיים ישירות ומעדכנים את capacity.storage בו",
],
              answer: 0,
              explanation:
                "ה-StorageClass חייב להגדיר allowVolumeExpansion: true.\nאז מגדילים spec.resources.requests.storage ב-PVC וה-provisioner מרחיב את הדיסק.\nהקטנה לא נתמכת, ובחלק מה-backends נדרש Pod restart.",
            },
            {
              q: "מה הפקודה\n\n```\nhelm template\n```\n\nעושה?",
              options: [
              "יוצרת Helm Chart חדש מתוך תבנית ברירת מחדל",
              "שומרת גרסה של ה-Chart לצורך rollback עתידי",
              "ממירה את ה-Chart לקבצי YAML מבלי להחיל אותם על הקלאסטר",
              "מעדכנת את קובץ values.yaml מתוך מאגר מרוחק",
],
              answer: 2,
              explanation:
                "הפקודה helm template מבצעת rendering ל-Chart, כלומר מחליפה את המשתנים בתבניות בערכים מתוך values.yaml, ומפיקה קובצי Kubernetes YAML כפי שהם ייראו בפריסה בפועל.\n\nבניגוד ל-helm install הפקודה לא שולחת את ה-YAML ל-API server ולא יוצרת משאבים בקלאסטר.\n\nהפקודה שימושית לצורכי בדיקה, debug, ולתהליכי CI/CD או GitOps, כאשר רוצים לראות או לשמור את ה-YAML המלא לפני פריסה.",
            },
            {
              q: "מה עושה הפקודה\n\n```\n$ helm rollback\n```",
              options: [
              "מוחק את ה-Release לחלוטין ומסיר את כל המשאבים שנוצרו",
              "helm upgrade\nמעדכן את ה-Chart לגרסה חדשה ומפעיל אוטומטית",
              "מאפס את כל ה-values לברירות מחדל של ה-Chart",
              "מחזיר Release ל-revision קודמת מתוך ההיסטוריה",
],
              answer: 3,
              explanation:
                "`helm rollback` מחזיר Release ל-revision ספציפי מתוך ההיסטוריה.\nהריצו `helm history` כדי לראות את כל ה-revisions עם תאריכים וסטטוסים, ואז בחרו את ה-revision הרצוי.\nמאחורי הקלעים, rollback הוא למעשה upgrade חדש עם manifests ישנים - ולכן נוצר revision חדש.",
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
                "PVC Pending = לא נמצא PV מתאים.\nהרצת `kubectl describe pvc` תראה מה חסר.\nסיבות נפוצות: StorageClass לא קיים, AccessMode לא תואם, או capacity לא מספיק.",
            },
            {
              q: "כיצד PV ו-PVC מתחברים?",
              tags: ["storage-binding"],
              options: [
              "לפי שם PVC בלבד, שחייב להיות זהה לשם ה-PV",
              "לפי ה-Node שה-Pod מתוזמן עליו, כך שה-PV נוצר באותו Node",
              "לפי ה-Namespace של ה-Pod, כך שכל PV שייך ל-Namespace ספציפי",
              "לפי accessMode, storage capacity, ו-storageClassName תואמים",
],
              answer: 3,
              explanation:
                "K8s מחבר PVC ל-PV לפי storageClassName, accessModes, ו-capacity (PV >= PVC).\nהשם לא חייב להתאים. PV הוא cluster-level resource ולא משויך ל-Namespace.\nלאחר binding הם קשורים עד שאחד נמחק.",
            },
        ],
        questionsEn: [
            {
              q: "What is Dynamic Provisioning?",
              tags: ["dynamic-provisioning"],
              options: [
              "Automatic Pod migration to another Node when the current Node runs out of disk",
              "PV and physical disk created automatically when a PVC with StorageClass is submitted",
              "Dynamic CPU allocation to Pods based on real-time load reported by metrics-server",
              "Automatic resizing of an existing PVC based on actual disk consumption",
],
              answer: 1,
              explanation:
                "When a PVC references a StorageClass, the provisioner creates a PV and real disk automatically.\nResizing an existing disk is done via Volume Expansion, not Dynamic Provisioning.\nThis is the standard approach in all cloud-hosted Kubernetes clusters, eliminating the need for manual PV creation.",
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
                "When the PVC is deleted, both the PV and the physical disk (EBS, GCP PD) are deleted automatically.\nRetain policy, by contrast, preserves the PV and data even after PVC deletion.\nThere is no automatic backup before deletion, so always back up production data beforehand.",
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
                "--set key=value overrides values from values.yaml at install/upgrade time.\n`helm template` only renders YAML without installing. `helm rollback` does not accept --set. `helm show values` only displays values.\nFor multiple overrides, use --values (-f) with a custom YAML file.",
            },
            {
              q: "How do you expand a PVC?",
              options: [
              "Edit the existing PV directly and update its capacity.storage field",
              "kubectl merge-pvc\nCreate a second PVC and use to combine the volumes",
              "Set allowVolumeExpansion: true in the StorageClass then increase spec.resources.requests.storage",
              "Delete the PVC and recreate it with a larger size in the same StorageClass",
],
              answer: 2,
              explanation:
                "The StorageClass must have allowVolumeExpansion: true.\nThen increase spec.resources.requests.storage in the PVC and the provisioner resizes the disk.\nShrinking is not supported, and some backends require a Pod restart.",
            },
            {
              q: "What does the command\n\n```\nhelm template\n```\n\ndo?",
              options: [
              "Creates a new Helm Chart from a default template",
              "Saves a version of the Chart for future rollback",
              "Converts the Chart to YAML files without applying them to the cluster",
              "Updates the values.yaml file from a remote repository",
],
              answer: 2,
              explanation:
                "The helm template command performs rendering, converting the Chart to Kubernetes YAML files as they would appear in an actual deployment, without sending them to the cluster.\n\nUseful for testing, debugging, CI/CD pipelines, and GitOps workflows that need the full YAML stored in git.",
            },
            {
              q: "What does this command do?\n\n```\n$ helm rollback\n```",
              options: [
              "helm upgrade\nUpdates the Chart to a new version and runs automatically",
              "Resets all values to the Chart's default values.yaml configuration",
              "Deletes the Release completely and removes all created resources",
              "Reverts a Release to a previous revision from its history",
],
              answer: 3,
              explanation:
                "`helm rollback` reverts a Release to a specific revision from its history.\nRun `helm history` to see all revisions with timestamps and statuses, then pick the revision you want.\nUnder the hood, a rollback is technically a new upgrade using old manifests - so it creates a new revision number.",
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
                "PVC Pending means no matching PV was found.\nRun `kubectl describe pvc` to see what's missing.\nCommon causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
            },
            {
              q: "How do a PV and PVC bind?",
              tags: ["storage-binding"],
              options: [
              "By the Node the Pod is scheduled on, so the PV is created on the same Node",
              "By matching accessMode, storage capacity, and storageClassName",
              "By the Namespace of the Pod, so each PV belongs to a specific Namespace",
              "By name only, where the PVC name must match the PV name exactly",
],
              answer: 1,
              explanation:
                "K8s binds a PVC to a PV by matching storageClassName, accessModes, and capacity (PV >= PVC).\nPV names do not need to match PVC names. PVs are cluster-level resources and are not namespaced.\nAfter binding they are locked together until one is deleted.",
            },
        ],
      },
      hard: {
        theory: "אחסון מתקדם, Helm ו-debug.\n🔹 CSI:\u200E Container Storage Interface, סטנדרט לדריברים\n🔹 VolumeSnapshot:\u200E גיבוי נקודתי של PV\n🔹 Helm Hooks:\u200E פעולות בשלבים: pre-install, post-upgrade\n🔹 StatefulSet Storage:\u200E volumeClaimTemplates יוצר PVC ייחודי לכל Pod\n🔹 WaitForFirstConsumer:\u200E ממתין לתזמון Pod לפני binding, מבטיח אותו AZ\n🔹 PVC Pending:\u200E StorageClass לא קיים? PV לא תואם? בדוק describe pvc\n🔹 helm rollback:\u200E מחזיר Release לגרסה קודמת אחרי upgrade כושל\n🔹 EBS:\u200E single-AZ. Pod ב-AZ אחר לא יכול לעלות עם PV מ-AZ אחר\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        theoryEn: "Advanced Storage, Helm, and Debugging\n🔹 CSI - Container Storage Interface, a standard API for storage drivers.\n🔹 VolumeSnapshot - creates a point-in-time backup of a PersistentVolume.\n🔹 Helm Hooks - run Jobs at lifecycle stages (pre-install, post-upgrade).\n🔹 StatefulSet storage - volumeClaimTemplates creates a unique PVC per Pod.\n🔹 WaitForFirstConsumer - delays PV binding until Pod is scheduled, ensuring same AZ.\n🔹 PVC Pending - StorageClass not found? No matching PV? Check kubectl describe pvc.\n🔹 helm rollback - reverts a Release to a previous revision after a failed upgrade.\n🔹 EBS is single-AZ - a Pod on a Node in a different AZ cannot mount an EBS volume.\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        questions: [
            {
              q: "מה תפקיד CSI ב-Kubernetes?",
              tags: ["storage-interface"],
              options: [
              "Cluster Sync Interface:\u200E סטנדרט לסנכרון נתונים בין Clusters",
              "Container Storage Interface:\u200E סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers ל-K8s",
              "Cloud Storage Integration:\u200E שכבת חיבור ל-cloud object storage כמו S3",
              "Container Security Interface:\u200E סטנדרט לסריקת images ואכיפת מדיניות אבטחה",
],
              answer: 1,
              explanation:
                "CSI (Container Storage Interface) הוא סטנדרט שמאפשר לחבר מערכות אחסון חיצוניות ל-Kubernetes בצורה אחידה.\nבמקום ש-Kubernetes יטמיע תמיכה מובנית בכל סוג אחסון, ספקים (vendors) יכולים לכתוב CSI drivers שמטפלים ביצירה, חיבור וניהול של volumes.\nהדרייברים האלו (למשל AWS EBS, Azure Disk, Ceph) רצים בתוך הקלאסטר ומבצעים את פעולות האחסון בפועל.\nכך ניתן להוסיף או להחליף פתרונות אחסון בלי לשנות את Kubernetes עצמו.",
            },
            {
              q: "מה התפקיד של Helm Hook?",
              options: [
              "כלי לניפוי שגיאות (debug) של templates לפני פריסה",
              "הרצת משאב (לרוב Job) בנקודה מסוימת במחזור החיים של Release",
              "מנגנון לביצוע rollback לגרסה קודמת של Release",
              "סוג Chart שמכיל רק dependencies ללא templates",
],
              answer: 1,
              explanation:
                "Helm Hooks מאפשרים להריץ משאבים של Kubernetes בנקודות מוגדרות במחזור החיים של Release, כמו לפני או אחרי פעולות install, upgrade או delete.\n\nברוב המקרים מדובר ב-Job שמבצע פעולה חד-פעמית, למשל:\nהרצת database migrations לפני deploy (pre-install, pre-upgrade)\nבדיקות או התראות לאחר deploy (post-install, post-upgrade)\n\nה-Hook מוגדר באמצעות annotation ב-YAML, ו-Helm מפעיל אותו אוטומטית בשלב המתאים.\n\nאיך זה נראה טכנית?\nמגדירים ב-YAML:\n\n```yaml\nannotations:\n  \"helm.sh/hook\": pre-install\n```\n\nואז Helm יודע להריץ את המשאב הזה בזמן המתאים.",
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
              tags: ["statefulset-storage"],
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
              q: "מה volume binding mode WaitForFirstConsumer?\n\n```yaml\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nvolumeBindingMode: WaitForFirstConsumer\n```",
              tags: ["wait-for-consumer"],
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
                "ה\u2011PVC מפנה ל\u2011StorageClass בשם \u2066fast-ssd\u2069 שלא קיים ב\u2011Cluster\u200F.\nללא \u2066StorageClass\u2069\u200F, ה\u2011provisioner לא יודע ליצור \u2066PV\u2069\u200F.\nהריצו kubectl get storageclass לראות מה קיים.\n\u2066PVC\u2069 גדול מדי = שגיאה על \u2066capacity\u2069\n\u2066Node\u2069 מלא = לא קשור ל\u2011provisioning\n\u2066Namespace\u2069 שונה = שגיאה אחרת\u200F",
            },
            {
              q: "הרצת:\n\n```\nhelm upgrade\n```\n\nה-upgrade כשל באמצע.\nRelease ב-\u200Estatus failed.\nה-ConfigMap עודכן חלקית.\n\nמה הצעד הבא?",
              options: [
              "helm upgrade שוב",
              "helm rollback my-release [last-good-revision]\nלהחזיר למצב עקבי",
              "מחק ה-Release",
              "מחק ConfigMap",
],
              answer: 1,
              explanation:
                "כש-helm upgrade נכשל, חלק מה-resources עלולים להישאר במצב לא עקבי.\nהצעד הבטוח הוא לבצע helm rollback כדי להחזיר את ה-release לגרסה האחרונה שעבדה.\nhelm rollback my-release [last-good-revision] מחזיר את ה-release לגרסה תקינה ומבטל את השינויים החלקיים שנוצרו במהלך ה-upgrade.\nניתן להשתמש ב-helm history my-release כדי לראות את רשימת ה-revisions (גרסאות deployment שנשמרות על ידי Helm) ולבחור לאיזו גרסה לחזור.",
            },
            {
              q: "Pod עם PVC ב-AWS EKS.\nה-Pod עבר ל-Node ב-Availability Zone אחרת.\nה-PVC מראה סטטוס Bound, אבל ה-Pod לא מצליח לעלות.\n\nמה הסיבה?",
              tags: ["storage-zone"],
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
              tags: ["storage-interface"],
              options: [
              "Container Storage Interface: an open standard for writing storage drivers for Kubernetes",
              "Container Security Interface: a standard for scanning images and enforcing security policies",
              "Cluster Sync Interface: a standard for syncing data between Clusters",
              "Cloud Storage Integration: a layer for connecting to cloud object storage like S3",
],
              answer: 0,
              explanation:
                "CSI (Container Storage Interface) is a standard that allows external storage systems to integrate with Kubernetes in a consistent way.\nInstead of Kubernetes having built-in support for every storage type, vendors can write CSI drivers that handle creating, attaching, and managing volumes.\nThese drivers (for example AWS EBS, Azure Disk, Ceph) run inside the cluster and perform the actual storage operations.\nThis allows adding or replacing storage solutions without modifying Kubernetes itself.",
            },
            {
              q: "What is the role of a Helm Hook?",
              options: [
              "A tool for debugging templates before deployment",
              "Running a resource (usually a Job) at a specific point in the Release lifecycle",
              "A mechanism for rolling back to a previous Release version",
              "A Chart type that contains only dependencies without templates",
],
              answer: 1,
              explanation:
                "Helm Hooks allow running Kubernetes resources at defined points in the Release lifecycle, such as before or after install, upgrade, or delete operations.\n\nTypically this is a Job performing a one-time action, for example:\nRunning database migrations before deploy (pre-install, pre-upgrade)\nTests or notifications after deploy (post-install, post-upgrade)\n\nThe Hook is defined via an annotation in YAML, and Helm triggers it automatically at the right stage.\n\nHow does it look technically?\nDefine in YAML:\n\n```yaml\nannotations:\n  \"helm.sh/hook\": pre-install\n```\n\nThen Helm knows to run this resource at the appropriate time.",
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
              tags: ["statefulset-storage"],
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
              q: "What does volume binding mode WaitForFirstConsumer do?\n\n```yaml\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nvolumeBindingMode: WaitForFirstConsumer\n```",
              tags: ["wait-for-consumer"],
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
                "The PVC references a StorageClass named fast-ssd that doesn't exist in the Cluster.\nWithout a valid StorageClass, the provisioner can't create a PV.\nRun kubectl get storageclass to see what exists.\nPVC too large = capacity error\nNode full = unrelated to provisioning\nDifferent Namespace = different error",
            },
            {
              q: "Command:\n\n```\nhelm upgrade\n```\n\nThe upgrade failed midway.\nRelease status: failed.\nA ConfigMap is half-updated.\n\nWhat is the next step?",
              options: [
              "Delete the ConfigMap",
              "helm upgrade again",
              "Delete the Release",
              "helm rollback my-release [last-good-revision]\nto return to a consistent state",
],
              answer: 3,
              explanation:
                "When a helm upgrade fails, some resources may remain in an inconsistent state.\nThe safe step is to run helm rollback to restore the release to the last working revision.\nhelm rollback my-release [last-good-revision] restores the release to a healthy version and cancels the partial changes created during the upgrade.\nYou can use helm history my-release to see the list of revisions (deployment versions stored by Helm) and choose which one to roll back to.",
            },
            {
              q: "A Pod with a PVC on AWS EKS.\nThe Pod moved to a Node in a different Availability Zone.\nThe PVC shows Bound status, but the Pod fails to start.\n\nWhat is the cause?",
              tags: ["storage-zone"],
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
    icon: "troubleshooting",
    name: "Troubleshooting & Debugging",
    color: "#F97316",
    description: "Logs · Events · Probes · Observability",
    descriptionEn: "Logs · Events · Probes · Observability",
    levels: {
      easy: {
        theory: "פקודות Debug בסיסיות\n\nCMD:kubectl describe pod <pod-name>\nDESC:מידע מפורט על Pod כולל Events\n\nCMD:kubectl logs <pod-name>\nDESC:צפייה בלוגים של הקונטיינר\n\nCMD:kubectl exec -it <pod-name> -- bash\nDESC:הרצת פקודה או פתיחת shell בתוך הקונטיינר\n\nCMD:kubectl get pods -A\nDESC:רשימת כל ה-Pods בכל ה-Namespaces\n\nCMD:kubectl get events -A\nDESC:רשימת אירועים מכל ה-Namespaces\n\nFLOW_TITLE:זרימת עבודה לדיבוג\nFLOW:kubectl get pods -A\nFLOW:kubectl describe pod my-pod\nFLOW:kubectl logs my-pod\nFLOW:kubectl exec -it my-pod -- bash",
        theoryEn: "Basic Debug Commands\n\nCMD:kubectl describe pod <pod-name>\nDESC:Shows detailed Pod information including events and status.\n\nCMD:kubectl logs <pod-name>\nDESC:Displays container logs for debugging application issues.\n\nCMD:kubectl exec -it <pod-name> -- bash\nDESC:Opens an interactive shell inside the container.\n\nCMD:kubectl get pods -A\nDESC:Lists all Pods across all Namespaces.\n\nCMD:kubectl get events -A\nDESC:Lists cluster events from all Namespaces.\n\nFLOW_TITLE:Debugging Workflow\nFLOW:kubectl get pods -A\nFLOW:kubectl describe pod my-pod\nFLOW:kubectl logs my-pod\nFLOW:kubectl exec -it my-pod -- bash",
        questions: [
            {
              q: "ה-Pod 'web-server' לא מגיב. איזו פקודה תציג מידע מפורט ו-events לצורך אבחון?",
              options: [
              "kubectl describe pod web-server",
              "kubectl status pod web-server",
              "kubectl get pod web-server",
              "kubectl inspect pod web-server",
],
              answer: 0,
              explanation:
                "`kubectl describe pod` מציג events, conditions, ומידע מפורט.\nה-Events בתחתית הפלט הם לרוב הסיבה הישירה לבעיה.",
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
                "`kubectl logs` מציג את ה-stdout/stderr של הקונטיינר.\nהמקום הראשון לחפש שגיאות אפליקציה כשה-Pod רץ.\nהוסף --follow לעקוב בזמן אמת.",
            },
            {
              q: "מה מציגה הפקודה\n\n```\n$ kubectl get events\n```",
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
              tags: ["pod-status-phases"],
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
                "כשקונטיינר קורס, הוא עולה מחדש עם לוגים ריקים.\n\nkubectl logs pod-name --previous",
            },
            {
              q: "מה מציגה הפקודה `kubectl top nodes`",
              options: [
              "שימוש ב-CPU/Memory של כל Node בזמן אמת (דורש metrics-server)",
              "רשימת כל ה-Nodes ב-Cluster כולל Status ו-Roles",
              "לוגים של kubelet מכל Node ב-Cluster",
              "רשימת Nodes עם Conditions חריגות כמו DiskPressure או MemoryPressure",
],
              answer: 0,
              explanation:
                "מציג צריכת CPU ו-Memory בזמן אמת של כל Node, כולל אחוז ניצול.\nדורש metrics-server מותקן ב-Cluster.\n`kubectl top pods` מציג את אותו מידע ברמת Pod.",
            },
            {
              q: "כיצד בודקים את ה-health של ה-API server\u200F?",
              options: [
              "kubectl get --raw='/healthz'\nמחזיר ok אם בריא",
              "kubectl check apiserver",
              "kubectl status cluster",
              "kubectl describe apiserver",
],
              answer: 0,
              explanation:
                "kubectl get --raw=/healthz שולחת בקשה ישירה ל-Kubernetes API Server ובודקת אם הוא בריא.\nאם ה-API Server תקין, התגובה תהיה ok.\nנקודות כמו /healthz, /readyz, /livez הן health endpoints. זה אומר כתובות HTTP מיוחדות שמאפשרות לבדוק את מצב הרכיב.\nב-Kubernetes 1.26 הפקודה kubectl get componentstatuses הוסרה ולכן משתמשים ב-health endpoints במקום.",
            },
            {
              q: "מה תפקיד הפקודה `kubectl config get-contexts`?",
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
                "`kubectl describe pod` shows events, conditions, and detailed info.\nThe Events section at the bottom usually reveals the direct cause of the problem.",
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
                "`kubectl logs` shows the container's stdout/stderr.\nFirst place to look for application errors while the Pod is running.\nUse --follow to stream logs in real time.",
            },
            {
              q: "What does this command show?\n\n```\n$ kubectl get events\n```",
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
              tags: ["pod-status-phases"],
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
                "When a container crashes, it restarts with empty logs.\n\nThe --previous flag fetches logs from the previous failed run, exactly what you need to diagnose the cause.\n\nkubectl logs pod-name --previous",
            },
            {
              q: "What does `kubectl top nodes` show?",
              options: [
              "Kubelet logs from every Node in the Cluster",
              "A list of all Nodes in the Cluster with their Status and Roles",
              "Nodes with abnormal Conditions such as DiskPressure or MemoryPressure",
              "Real-time CPU/Memory usage for each Node (requires metrics-server)",
],
              answer: 3,
              explanation:
                "Shows real-time CPU and Memory consumption for every Node, including utilization percentage.\nRequires metrics-server installed in the cluster.\n`kubectl top pods` shows the same at Pod level.",
            },
            {
              q: "How do you check the health of the API server?",
              options: [
              "kubectl status cluster",
              "kubectl describe apiserver",
              "kubectl check apiserver",
              "kubectl get --raw='/healthz'\nreturns ok when healthy",
],
              answer: 3,
              explanation:
                "kubectl get --raw=/healthz sends a direct request to the Kubernetes API Server to check if it is healthy.\nIf the API Server is functioning correctly, the response will be ok.\nEndpoints like /healthz, /readyz, and /livez are health endpoints, meaning special HTTP URLs used to check the status of a component.\nIn Kubernetes 1.26 the command kubectl get componentstatuses was removed, so health endpoints are used instead.",
            },
            {
              q: "What is the purpose of `kubectl config get-contexts`?",
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
              tags: ["crashloop-flow"],
              options: [
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              "Terminating",
],
              answer: 0,
              explanation:
                "הקונטיינר עולה, קורס מיד, ו-Kubernetes מנסה שוב עם המתנה גוברת.\nהריצו `kubectl logs --previous` לראות את ה-logs מה-crash האחרון.",
            },
            {
              q: "ה-Pod נמצא ב-ImagePullBackOff. מה שתי הסיבות הנפוצות ביותר?",
              tags: ["imagepull-flow"],
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
                "הקונטיינר חרג מ-limits.memory וה-Linux kernel ממית אותו עם exit code 137.\nהגדילו limits.memory, או בדקו memory leak עם `kubectl top pod`.",
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
                "הודעת Insufficient cpu אומרת של-Kubernetes אין Node עם מספיק CPU פנוי כדי להריץ את ה-Pod.\nה-scheduler של Kubernetes (הרכיב שמחליט על איזה Node להריץ Pod) משווה את ה-cpu requests שהוגדרו ב-Pod מול ה-capacity הזמין בכל Node.\nבמקרה הזה הבקשה ל-CPU גדולה ממה שזמין ב-Nodes, ולכן ה-Pod נשאר במצב Pending.\nכדי לפתור את הבעיה ניתן להקטין את ה-cpu requests, לפנות משאבים ב-Nodes קיימים, או להוסיף Nodes חדשים לקלאסטר.",
            },
            {
              q: "מה קורה כש-liveness probe נכשל?",
              tags: ["probe-comparison"],
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
              q: "ה-Pod נמצא ב-ContainerCreating זמן רב.\n\n```\nkubectl get pods\n```\n\n```\nNAME          READY   STATUS              RESTARTS   AGE\nweb-app       0/1     ContainerCreating   0          8m\n```\n\nמה הסיבות האפשריות?",
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
                "Finalizer מונע מחיקה עד ש-controller חיצוני מנקה אותו. אפילו --force לא עוזר.\nכשה-controller לא זמין, ה-Pod תקוע.\nפתרון: `kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'` מסיר finalizers ידנית.",
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
              tags: ["crashloop-flow"],
              options: [
              "CrashLoopBackOff",
              "OOMKilled",
              "ErrImagePull",
              "Terminating",
],
              answer: 0,
              explanation:
                "The container starts, crashes immediately, and Kubernetes retries with increasing back-off delay.\nRun `kubectl logs --previous` to see the logs from the last crash.",
            },
            {
              q: "A pod is stuck in ImagePullBackOff. What are the two most common causes?",
              tags: ["imagepull-flow"],
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
                "The container exceeded limits.memory and the Linux kernel killed it with exit code 137.\nIncrease limits.memory, or use `kubectl top pod` to identify a memory leak.",
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
                "The Insufficient cpu message means Kubernetes cannot find a Node with enough available CPU to run the Pod.\nThe Kubernetes scheduler (the component responsible for deciding which Node runs a Pod) compares the Pod's cpu requests with the available capacity on each Node.\nIn this case the requested CPU is larger than what is available on the Nodes, so the Pod remains in the Pending state.\nTo resolve the issue you can reduce the cpu requests, free resources on existing Nodes, or add more Nodes to the cluster.",
            },
            {
              q: "What happens when a liveness probe fails?",
              tags: ["probe-comparison"],
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
              q: "A Pod is stuck in ContainerCreating for a long time.\n\n```\nkubectl get pods\n```\n\n```\nNAME          READY   STATUS              RESTARTS   AGE\nweb-app       0/1     ContainerCreating   0          8m\n```\n\nWhat are the likely causes?",
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
                "A finalizer blocks deletion until an external controller clears it. Even --force can't bypass it.\nIf the controller is unavailable, the Pod stays stuck.\nFix: `kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'` removes finalizers manually.",
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
        theory: "Debug מתקדם, תחזוקת Nodes וגיבוי.\n🔹 CrashLoopBackOff:\u200E logs --previous + describe pod כצעד ראשון\n🔹 Node NotReady:\u200E describe node, SSH ל-Node, systemctl status kubelet\n🔹 kubectl drain:\u200E פינוי בטוח של Node לפני תחזוקה (cordon + evict)\n🔹 DNS Debug:\u200E nslookup מתוך Pod, בדיקת CoreDNS logs\n🔹 etcd Backup:\u200E etcdctl snapshot save לגיבוי הקלאסטר\n🔹 Liveness Probe:\u200E 404 = הנתיב לא תואם. בדוק path ו-port\n🔹 logs --previous:\u200E מציג לוגים מקונטיינר שקרס\n🔹 CNI:\u200E Node ב-NotReady אחרי init = חסר CNI plugin\nCODE:\nkubectl logs my-pod --previous\nkubectl drain node01 --ignore-daemonsets\netcdctl snapshot save /backup/etcd.db",
        theoryEn: "Advanced Debugging, Node Ops, and Cluster Maintenance\n🔹 CrashLoopBackOff - first steps: logs --previous to see crash output, then describe pod for events.\n🔹 Node NotReady - run describe node, SSH to the node, check systemctl status kubelet.\n🔹 kubectl drain - safely evicts Pods before node maintenance (marks node unschedulable).\n🔹 DNS debugging - run nslookup from inside a Pod, check CoreDNS pod logs.\n🔹 etcd backup - etcdctl snapshot save creates a point-in-time cluster backup.\n🔹 Liveness probe 404 - probe path does not match the app endpoint. Verify path and port.\n🔹 logs --previous - shows logs from a crashed container (not the current one).\n🔹 CNI missing - a fresh node showing NotReady usually needs a CNI plugin installed.\nCODE:\nkubectl logs my-pod --previous\nkubectl drain node01 --ignore-daemonsets\netcdctl snapshot save /backup/etcd.db",
        questions: [
            {
              q: "לאחר Deployment, ה-Pods החדשים ב-CrashLoopBackOff.\nהגרסה הקודמת עבדה מצוין.\n\nמה שתי פעולות ה-debug הראשונות שלך?",
              options: [
              "Scale down ל-0 ו-redeploy מחדש",
              "מחק את כל ה-Pods ותן ל-Kubernetes ליצור אותם מחדש",
              "kubectl logs <new-pod> --previous\nו-kubectl describe pod <new-pod>",
              "kubectl rollout undo\nמיד לגרסה הקודמת",
],
              answer: 2,
              explanation:
                "לפני rollback חשוב להבין מה השתנה.\nlogs --previous מציג output מה-crash, ו-describe pod מציג Events.\nרק אחרי שמבינים את הסיבה, מחליטים לתקן code או לעשות rollout undo.",
            },
            {
              q: "ה-Node מראה NotReady.\nPods מפונים ממנו.\n\nהרצת:\n\n```\nkubectl get nodes\n```\n\nמה שתי הפעולות הראשונות שלך?",
              options: [
              "kubectl drain <name> --force\nלהעביר Pods ואז למחוק ולהצטרף מחדש",
              "kubectl describe node <name>\nלבדוק Conditions ו-Events, ואז SSH ל-Node ולהריץ systemctl status kubelet",
              "kubectl cordon <name>\nואז לבדוק kubelet status דרך systemctl על ה-Node",
              "kubectl delete node <name>\nולתת ל-cluster autoscaler להפעיל Node חדש",
],
              answer: 1,
              explanation:
                "describe node מציג Conditions ו-Events. המקום הראשון לחפש.\nSSH ל-Node ו-systemctl status kubelet לוודא שרץ.\nסיבות נפוצות: kubelet נפל, TLS cert פג, או disk/memory pressure.",
            },
            {
              q: "מה תפקיד הפקודה `kubectl drain` ומתי משתמשים בה?",
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
              q: "מה הצעד הראשון לאבחון בעיות DNS ב-Kubernetes?",
              options: [
              "kubectl get endpoints -n kube-system kube-dns\nבודק האם ל-Service של DNS יש Endpoints תקינים",
              "kubectl logs -n kube-system <coredns-pod>\nמציג את הלוגים של CoreDNS לזיהוי שגיאות",
              "kubectl describe svc kube-dns -n kube-system\nבודק את הגדרות ה-Service וה-Selector",
              "kubectl exec <pod> -- nslookup kubernetes.default\nבודק האם DNS resolution עובד מתוך ה-Pod",
],
              answer: 3,
              explanation:
                "התשובה הנכונה: הרצת `nslookup` מתוך Pod מוודאת ש-CoreDNS מגיב לבקשות.\n\nאם הבדיקה נכשלת:\n1. ודאו שה-CoreDNS Pods רצים: `kubectl get pods -n kube-system -l k8s-app=kube-dns`\n2. בדקו לוגים: `kubectl logs <coredns-pod> -n kube-system`\n3. ודאו שה-Service קיים: `kubectl get svc kube-dns -n kube-system`",
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
                "`etcdctl snapshot save` יוצר snapshot מלא של etcd:\u200E כל מצב ה-Cluster.\nחובה לציין --endpoints, --cacert, --cert, ו--key לאימות.\nזהו הכלי הראשי ל-Disaster Recovery.",
            },
            {
              q: "ה-Pod רץ, אבל ה-liveness probe נכשל שוב ושוב.\n\nהפלט של `kubectl describe pod` מציג:\n\n```\nError: Liveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nמה בודקים?",
              options: [
              "ה-container image שגוי ולא מכיל את האפליקציה",
              "בעיית DNS שמונעת מה-probe להגיע ל-Pod",
              "הרשאות RBAC מונעות מ-kubelet לבצע את ה-probe",
              "ה-probe path שגוי. האפליקציה לא חושפת את ה-endpoint הזה",
],
              answer: 3,
              explanation:
                "שגיאת 404 ב-liveness probe אומרת שהבקשה כן הגיעה לאפליקציה, אבל ה-endpoint שהוגדר ב-probe לא קיים.\nה-Pod עצמו רץ והשרת מגיב, אבל הנתיב (path) שהוגדר ב-livenessProbe.httpGet לא תואם ל-endpoint אמיתי באפליקציה.\nלכן Kubernetes מקבל תגובת 404 וחושב שהבדיקה נכשלה, מה שגורם ל-kubelet להפעיל מחדש את ה-container.\nהפתרון הוא לבדוק איזה endpoint של health האפליקציה באמת חושפת (למשל /health, /livez, /ping) ולעדכן את ה-livenessProbe בהתאם.",
            },
            {
              q: "הרצת:\n\n```\nkubectl logs my-pod\n```\n\nפלט:\n\n```\nError from server (BadRequest):\ncontainer 'my-container' in pod\n'my-pod' is not running\n```\n\nמה עושים?",
              options: [
              "הוסף sidecar container שיאסוף את ה-logs מה-container הראשי",
              "ה-Pod רץ בוודאות. הבעיה היא ב-RBAC שחוסם גישה ל-logs",
              "ה-Pod לא רץ.\nkubectl get pod לבדוק סטטוס ואז kubectl describe pod לבדוק Events",
              "מחק את ה-Pod ותן ל-Deployment ליצור אחד חדש שאפשר לקרוא לו logs",
],
              answer: 2,
              explanation:
                "Kubernetes לא יכול לקרוא logs מ-container שלא רץ.\nבדקו סטטוס עם `kubectl get pod`. אם CrashLoopBackOff השתמשו ב---previous.\nאם Init:Error. בדקו logs של ה-init container עם -c <init-name>.",
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
              "kubectl logs <new-pod> --previous\nand kubectl describe pod <new-pod>",
              "Delete all pods and wait for recreation",
              "kubectl rollout undo\nimmediately",
              "Scale down to 0 and redeploy",
],
              answer: 0,
              explanation:
                "Before rollback, understand what changed.\nlogs --previous shows the crash output, describe pod shows the Events timeline.\nOnly after understanding the cause. Decide to fix code or run rollout undo.",
            },
            {
              q: "A Node shows NotReady.\nPods on it are being evicted.\n\nCommand:\n\n```\nkubectl get nodes\n```\n\nWhat are your first two steps?",
              options: [
              "kubectl delete node <name>\nand let the cluster autoscaler provision a new Node",
              "kubectl drain <name> --force\nto move Pods then delete and rejoin the Node",
              "kubectl cordon <name>\nthen check kubelet status via systemctl on the Node",
              "kubectl describe node <name>\nto check Conditions and Events, then SSH in and run systemctl status kubelet",
],
              answer: 3,
              explanation:
                "describe node shows Conditions and Events. The first place to look.\nSSH in and run systemctl status kubelet to check if it's running.\nCommon causes: kubelet crashed, TLS cert expired, or disk/memory pressure.",
            },
            {
              q: "What is the purpose of `kubectl drain` and when is it used?",
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
              q: "What is the first step to diagnose DNS issues in Kubernetes?",
              options: [
              "kubectl exec <pod> -- nslookup kubernetes.default\nChecks whether DNS resolution works from inside the Pod",
              "kubectl logs -n kube-system <coredns-pod>\nShows CoreDNS logs to identify errors",
              "kubectl get endpoints -n kube-system kube-dns\nChecks whether the DNS Service has valid Endpoints",
              "kubectl describe svc kube-dns -n kube-system\nInspects the Service configuration and Selector",
],
              answer: 0,
              explanation:
                "Correct: Running `nslookup` from inside a Pod verifies that CoreDNS is responding to queries.\n\nIf it fails:\n1. Verify CoreDNS Pods are running: `kubectl get pods -n kube-system -l k8s-app=kube-dns`\n2. Check logs: `kubectl logs <coredns-pod> -n kube-system`\n3. Verify the Service exists: `kubectl get svc kube-dns -n kube-system`",
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
                "`etcdctl snapshot save` creates a full snapshot of etcd: the entire cluster state.\nMust provide --endpoints, --cacert, --cert, and --key for authentication.\nThis is the standard backup method for disaster recovery.",
            },
            {
              q: "A Pod is running, but the liveness probe keeps failing.\n\nThe output of `kubectl describe pod` shows:\n\n```\nError: Liveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nWhat do you check?",
              options: [
              "The container image is wrong and does not contain the application",
              "A DNS issue preventing the probe from reaching the Pod",
              "RBAC permissions prevent kubelet from performing the probe",
              "The probe path is wrong. The app does not expose this endpoint",
],
              answer: 3,
              explanation:
                "A 404 error in a liveness probe means the request reached the application, but the endpoint defined in the probe does not exist.\nThe Pod itself is running and the server is responding, but the path configured in livenessProbe.httpGet does not match a real endpoint exposed by the application.\nAs a result Kubernetes receives a 404 response and treats the probe as failed, which causes the kubelet to restart the container.\nThe fix is to check which health endpoint the application actually exposes (for example /health, /livez, /ping) and update the livenessProbe configuration accordingly.",
            },
            {
              q: "Command:\n\n```\nkubectl logs my-pod\n```\n\nOutput:\n\n```\nError from server (BadRequest):\ncontainer 'my-container' in pod\n'my-pod' is not running\n```\n\nWhat do you do?",
              options: [
              "The Pod is not Running.\nkubectl get pod to check status, then kubectl describe pod to check Events",
              "Delete the Pod and let the Deployment create a new one whose logs you can read",
              "Add a sidecar container that collects logs from the main container",
              "The Pod is definitely Running. The issue is RBAC blocking access to read logs",
],
              answer: 0,
              explanation:
                "Kubernetes can't stream logs from a container that isn't running.\nCheck status with `kubectl get pod`. If CrashLoopBackOff, use --previous.\nIf Init:Error, check init container logs with -c <init-name>.",
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
    icon: "linux",
    name: "OS & Linux Deep Dive",
    color: "#6366F1",
    description: "Processes · Memory · CPU · Networking",
    descriptionEn: "Processes · Memory · CPU · Networking",
    isNew: true,
    levels: {
      easy: {
        theory: "פקודות בסיסיות לניטור תהליכים ומשאבי מערכת ב-Linux.\n🔹 top:\u200E תצוגה בזמן אמת של תהליכים, CPU, זיכרון ו-load average\n🔹 ps aux:\u200E תמונת מצב של כל התהליכים הרצים במערכת\n🔹 free -h:\u200E סיכום שימוש בזיכרון (total, used, available, buff/cache)\n🔹 df -h:\u200E שימוש בדיסק לפי מחיצות ונקודות mount\n🔹 systemctl status:\u200E בדיקת מצב שירות (active/failed/inactive)\n🔹 journalctl -u:\u200E צפייה בלוגים של שירות ספציפי\n🔹 tail -f:\u200E מעקב אחרי קובץ לוג בזמן אמת\nCODE:\nps aux --sort=-%mem | head\ndf -h\nfree -h\nsystemctl status nginx\njournalctl -u nginx --no-pager -n 50\ntail -f /var/log/syslog",
        theoryEn: "Essential Linux commands for monitoring processes and system resources.\n🔹 top - real-time view of processes, CPU, memory, and load average\n🔹 ps aux - snapshot of all running processes\n🔹 free -h - memory usage summary (total, used, available, buff/cache)\n🔹 df -h - disk usage by partition and mount point\n🔹 systemctl status - check service state (active/failed/inactive)\n🔹 journalctl -u - view logs for a specific service\n🔹 tail -f - follow a log file in real time\nCODE:\nps aux --sort=-%mem | head\ndf -h\nfree -h\nsystemctl status nginx\njournalctl -u nginx --no-pager -n 50\ntail -f /var/log/syslog",
        questions: [
          {
            q: "צריך למצוא תהליך שצורך הכי הרבה זיכרון.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "vmstat 1",
              "cat /proc/meminfo",
              "ps aux --sort=-%mem | head",
              "free -m"],
            answer: 2,
            explanation: "כשיש חשד ל-memory leak או צריכת RAM חריגה, קודם מזהים את התהליך שצורך הכי הרבה זיכרון.\nps aux --sort=-%mem ממיין תהליכים לפי שימוש בזיכרון.\nhead מציג את התהליכים המובילים בצריכה.\nאחרי שמזהים את ה-PID אפשר להמשיך בדיבוג עם כלים כמו pmap, top, או smem.",
          },
          {
            q: "הרצת:\n\n```\ndf -h\n```\n\nפלט:\n\n```\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   48G  2.0G  96% /\n```\n\nמה הבעיה ומה הצעד הראשון?",
            options: [
              "du -sh /*\nהדיסק כמעט מלא - לזיהוי קבצים גדולים",
              "הדיסק כמעט מלא - יש להריץ \u2066fsck\u2069 לתיקון שגיאות מערכת קבצים",
              "הדיסק כמעט מלא - יש למחוק את כל \u2066/var/log\u2069 ולהפעיל מחדש",
              "השימוש בדיסק תקין - ערך של 96% סביר לשרת ייצור",
            ],
            answer: 0,
            explanation: "הפלט מראה שהדיסק ב-96% תפוסה, נשארו רק 2GB מתוך 50GB.\nב-100% שירותים יפסיקו לכתוב לוגים, databases עלולים לקרוס, ואפילו SSH עלול להפסיק לעבוד.\nהצעד הראשון הוא לזהות מה תופס מקום באמצעות du -sh /*.\nבדרך כלל הצרכנים הגדולים הם /var/log או /tmp.\nfsck מתקן שגיאות במערכת קבצים ולא משחרר מקום, ומחיקה גורפת של /var/log עלולה להרוס לוגים קריטיים.",
          },
          {
            q: "שירות לא עולה אחרי הפעלה מחדש של השרת.\n\nאיזו פקודה תראה את הלוגים של השירות?",
            options: [
              "systemctl restart service-name",
              "cat /etc/systemd/system/service-name.service",
              "dmesg | tail",
              "journalctl -u service-name --no-pager -n 50"],
            answer: 3,
            explanation: "כדי להבין למה השירות לא עולה, צריך לבדוק את הלוגים שלו.\nהפקודה journalctl -u service-name --no-pager -n 50 מציגה את הלוגים של השירות מ-systemd (מערכת הניהול של שירותים בלינוקס) ומאפשרת לראות את שגיאת ההפעלה.\nהאופציה -n 50 מציגה את 50 השורות האחרונות, שהן בדרך כלל הרלוונטיות לכשל האחרון.\nכך ניתן לזהות בעיות כמו פורט תפוס, שגיאת קונפיגורציה או קריסה של התהליך.\nפקודות כמו systemctl restart לא עוזרות לדיבוג, ו-dmesg מציג לוגים של הקרנל ולא של השירות עצמו.",
          },
          {
            q: "צריך לבדוק אם שירות nginx פעיל.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "cat /var/log/nginx/error.log",
              "systemctl status nginx",
              "top -u nginx",
              "netstat -tlnp"],
            answer: 1,
            explanation: "systemctl status מציג את מצב השירות: האם הוא active, inactive או failed.\nבנוסף מוצגים ה-PID, זמן הפעילות, ושורות לוג אחרונות.\nזה נותן תמונה מלאה בפקודה אחת.\ncat /var/log/nginx/error.log מציג שגיאות היסטוריות אבל לא אומר אם השירות רץ כרגע.\ntop ו-netstat נותנים מידע חלקי ולא מזהים בוודאות את מצב השירות.",
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
            explanation: "tail -f משאיר את הקובץ פתוח ומציג שורות חדשות ברגע שנכתבות.\nזה הכלי הסטנדרטי למעקב אחרי לוגים בזמן deploy או בזמן דיבוג.\nאפשר לשלב עם סינון: tail -f /var/log/syslog | grep ERROR.\ncat מדפיס את כל התוכן ויוצא, בלי להמשיך לעקוב.\ngrep מחפש ויוצא, ו-head מציג שורות מתחילת הקובץ (הישנות ביותר).",
          },
          {
            q: "אתה רואה שתהליך תקוע במצב D (uninterruptible sleep) בפלט של ps.\n\nמה הסיבה הסבירה?",
            options: [
              "התהליך הושהה ידנית באמצעות שליחת סיגנל SIGSTOP",
              "התהליך תקוע בלולאה אינסופית שצורכת CPU מקסימלי",
              "התהליך הוא zombie שממתין לאיסוף ע\"י תהליך האב",
              "התהליך ממתין לפעולת I/O שלא מסתיימת, כמו דיסק או NFS"],
            answer: 3,
            explanation: "מצב D (uninterruptible sleep) אומר שהתהליך ממתין לפעולת I/O שהקרנל לא מאפשר לבטל.\nהסיבות הנפוצות: NFS mount תקוע, דיסק כושל, או בעיית storage driver.\nתהליך ב-D לא ניתן להריגה עם kill -9 כי הקרנל חוסם signals במצב זה.\nהפתרון הוא לטפל בבעיית ה-I/O עצמה.\nלולאה אינסופית מופיעה כ-R, zombie כ-Z, ו-SIGSTOP כ-T.",
          },
          {
            q: "אתה מנסה להתחבר לשרת מרוחק בפורט 8080 אבל החיבור נכשל.\n\nהרצת:\n\n```\ncurl -v http://remote-server:8080\n```\n\nפלט:\n\n```\n* connect to remote-server port 8080 failed: Connection refused\n```\n\nמה המשמעות?",
            options: [
              "שם השרת לא מצליח להתפענח ב-DNS",
              "אין שירות שמאזין על הפורט או ש-firewall חוסם",
              "פורט המקור בצד הלקוח תפוס ולא זמין",
              "תעודת SSL לא תקינה וה-handshake נכשל",
            ],
            answer: 1,
            explanation: "Connection refused אומר שחבילת TCP SYN הגיעה לשרת, אבל הוא ענה ב-RST (דחייה).\nזה מוכיח ש-DNS ו-routing עובדים, אחרת הבקשה לא הייתה מגיעה.\nהבעיה היא שאין שירות שמאזין על פורט 8080, או ש-firewall דוחה את החיבור.\nבעיית DNS הייתה מציגה Could not resolve host.\nSSL רלוונטי רק אחרי שהחיבור TCP הצליח.",
          },
          {
            q: "הרצת:\n\n```\nlsof +D /var/log/ | head -20\n```\n\nלמה הפקודה הזו שימושית?",
            options: [
              "היא דוחסת קבצי לוג ומסובבת אותם לפי גודל",
              "היא מוחקת קבצי לוג ישנים שלא נגישו לאחרונה",
              "היא מציגה תהליכים שמחזיקים קבצים פתוחים בתיקייה",
              "היא מציגה את גודל כל קובץ לוג בסדר יורד"],
            answer: 2,
            explanation: "lsof +D מציג תהליכים שמחזיקים file handles פתוחים בתיקייה.\nזה חשוב במיוחד לפני מחיקת קבצי לוג.\nאם תהליך עדיין כותב לקובץ שנמחק, ה-inode לא משתחרר והדיסק לא מתפנה.\nלכן צריך לדעת מי מחזיק את הקובץ לפני שמוחקים.\nlsof לא מוחק, לא דוחס, ולא מציג גודל קבצים.",
          },
        ],
        questionsEn: [
          {
            q: "You need to find the process consuming the most memory.\n\nWhich command is most appropriate?",
            options: [
              "vmstat 1",
              "cat /proc/meminfo",
              "ps aux --sort=-%mem | head",
              "free -m"],
            answer: 2,
            explanation: "When investigating a possible memory leak or unusually high RAM usage, the first step is identifying the process using the most memory.\nps aux --sort=-%mem sorts processes by memory usage.\nhead shows the top consumers.\nAfter identifying the PID, further debugging can be done using tools such as pmap, top, or smem.",
          },
          {
            q: "You ran:\n\n```\ndf -h\n```\n\nOutput:\n\n```\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   48G  2.0G  96% /\n```\n\nWhat is the issue and what is the first step?",
            options: [
              "Disk is almost full - run du -sh /* to identify large files",
              "Disk is almost full - run fsck to fix filesystem errors",
              "Disk is almost full - delete all of /var/log and restart",
              "Disk usage is healthy - 96% is normal for a production server",
            ],
            answer: 0,
            explanation: "The output shows 96% disk usage on root, only 2GB left out of 50GB.\nAt 100%, services stop writing logs, databases may crash, and SSH can go down.\nThe first step is to identify what is consuming space using du -sh /*.\nCommon culprits are /var/log or /tmp.\nfsck repairs filesystem errors and does not free space, and deleting all of /var/log risks destroying critical logs.",
          },
          {
            q: "A service won't start after a server reboot.\n\nWhich command will show the service logs?",
            options: [
              "systemctl restart service-name",
              "cat /etc/systemd/system/service-name.service",
              "dmesg | tail",
              "journalctl -u service-name --no-pager -n 50"],
            answer: 3,
            explanation: "To understand why the service is not starting, you need to check its logs.\nThe command journalctl -u service-name --no-pager -n 50 shows the service logs from systemd (the Linux service manager) and helps identify the startup error.\nThe -n 50 option displays the last 50 lines, which are usually the most relevant to the recent failure.\nThis allows you to identify issues such as port conflicts, configuration errors, or process crashes.\nCommands like systemctl restart do not help with debugging, and dmesg shows kernel logs, not service-specific logs.",
          },
          {
            q: "You need to check if the nginx service is running.\n\nWhich command is most appropriate?",
            options: [
              "cat /var/log/nginx/error.log",
              "systemctl status nginx",
              "top -u nginx",
              "netstat -tlnp"],
            answer: 1,
            explanation: "systemctl status shows the service state: active, inactive, or failed.\nIt also displays the PID, uptime, and recent log lines.\nThis gives a complete picture in a single command.\ncat /var/log/nginx/error.log shows historical errors but does not indicate if the service is currently running.\ntop and netstat provide partial information and cannot reliably confirm service state.",
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
            explanation: "tail -f keeps the file open and displays new lines as they are written.\nThis is the standard tool for watching logs in real time during deploys or debugging.\nCan be combined with filtering: tail -f /var/log/syslog | grep ERROR.\ncat prints all content and exits without following new lines.\ngrep searches and exits, and head shows lines from the start of the file (oldest).",
          },
          {
            q: "You see a process stuck in D state (uninterruptible sleep) in ps output.\n\nWhat is the likely cause?",
            options: [
              "The process was manually suspended by sending it SIGSTOP",
              "The process is stuck in an infinite loop consuming excessive CPU",
              "The process is a zombie waiting to be reaped by its parent",
              "The process is waiting for a stalled I/O operation like disk or NFS"],
            answer: 3,
            explanation: "D state (uninterruptible sleep) means the process is waiting for an I/O operation the kernel cannot cancel.\nCommon causes: stuck NFS mount, failing disk, or storage driver issue.\nA D-state process cannot be killed with kill -9 because the kernel blocks signals in this state.\nThe fix is to resolve the underlying I/O problem.\nAn infinite loop shows as R, zombie as Z, and SIGSTOP as T.",
          },
          {
            q: "You are trying to connect to a remote server on port 8080 but the connection fails.\n\nYou ran:\n\n```\ncurl -v http://remote-server:8080\n```\n\nOutput:\n\n```\n* connect to remote-server port 8080 failed: Connection refused\n```\n\nWhat does this mean?",
            options: [
              "DNS failed to resolve the server hostname",
              "No service is listening on the port, or a firewall is blocking",
              "The source port on the client side is unavailable",
              "The SSL certificate is invalid and the handshake failed",
            ],
            answer: 1,
            explanation: "Connection refused means the TCP SYN packet reached the server, but it replied with RST (reject).\nThis proves DNS and routing are working, otherwise the request would not have arrived.\nThe issue is that no service is listening on port 8080, or a firewall is rejecting the connection.\nA DNS issue would show Could not resolve host.\nSSL is only relevant after the TCP connection succeeds.",
          },
          {
            q: "You ran:\n\n```\nlsof +D /var/log/ | head -20\n```\n\nWhy is this command useful?",
            options: [
              "It compresses log files and rotates them based on size",
              "It deletes old log files that haven't been accessed recently",
              "It shows processes holding open file handles in the directory",
              "It displays the size of each log file in descending order"],
            answer: 2,
            explanation: "lsof +D shows processes holding open file handles in a directory.\nThis is especially important before deleting log files.\nIf a process is still writing to a deleted file, the inode is not released and disk space is not freed.\nKnowing which process holds the file is essential before taking action.\nlsof does not delete, compress, or show file sizes.",
          },
        ],
      },
      medium: {
        theory: "אבחון מתקדם וניתוח ביצועים ברמת המערכת.\n🔹 top - %us/%sy/%wa/%idle:\u200E פירוש שורת CPU. wa גבוה = בעיית דיסק, idle נמוך = עומס CPU\n🔹 free - available:\u200E העמודה החשובה, כמה זיכרון באמת פנוי לתהליכים חדשים\n🔹 uptime - load average:\u200E ממוצע תהליכים בתור. מעל מספר הליבות = עומס\n🔹 ss -tlnp:\u200E פורטים פתוחים ותהליכים שמאזינים עליהם\n🔹 iostat -x:\u200E ניתוח I/O של דיסקים (%util, await, r/s, w/s)\n🔹 מצבי תהליכים:\u200E R=running, S=sleeping, D=I/O wait, Z=zombie, T=stopped\n🔹 OOM Killer:\u200E kernel הורג תהליכים שחורגים ממגבלת זיכרון (dmesg)\nCODE:\ntop (לחץ P למיון לפי CPU, M למיון לפי Memory)\niostat -x 1 3\nss -tlnp | grep 8080\ngrep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
        theoryEn: "Advanced troubleshooting and system-level performance analysis.\n🔹 top - %us/%sy/%wa/%idle - CPU line breakdown. High wa = disk issue, low idle = CPU load\n🔹 free - available - the key column, how much memory is actually free for new processes\n🔹 uptime - load average - avg processes in queue. Above core count = overloaded\n🔹 ss -tlnp - open ports and which processes are listening\n🔹 iostat -x - disk I/O analysis (%util, await, r/s, w/s)\n🔹 Process states - R=running, S=sleeping, D=I/O wait, Z=zombie, T=stopped\n🔹 OOM Killer - kernel kills processes exceeding memory limits (check dmesg)\nCODE:\ntop (press P to sort by CPU, M to sort by Memory)\niostat -x 1 3\nss -tlnp | grep 8080\ngrep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
        questions: [
          {
            q: "שרת מגיב לאט. מריצים top ורואים:\n\n```\ntop\n```\n\n```\n%Cpu(s): 72.5 us, 18.0 sy, 0.3 ni, 5.0 id, 4.0 wa, 0.0 hi, 0.2 si\n```\n\nמה מעיד על עומס גבוה על ה-CPU?",
            options: [
              "ערך %wa גבוה (4.0%) - המעבד ממתין לדיסק",
              "ערך %id נמוך (5.0%) - המעבד כמעט לא פנוי",
              "ערך %ni גבוה (0.3%) - תהליכים עם עדיפות שונה",
              "ערך %si גבוה (0.2%) - פסיקות תוכנה תכופות"],
            answer: 1,
            explanation: "%Cpu(s) מציג איך זמן ה-CPU מתחלק.\nus ו-sy הם זמן עבודה בפועל (אפליקציות + קרנל).\nid הוא זמן שהמעבד לא פעיל.\nwa הוא זמן המתנה ל-I/O (דיסק/רשת).\nni ו-si הם זמני עדיפות ופסיקות.\nכאן id נמוך (5%), כלומר רוב ה-CPU בשימוש ויש עומס גבוה.",
          },
          {
            q: "הרצת:\n\n```\nfree -h\n```\n\nפלט:\n\n```\n       total  used  free  shared  buff/cache  available\nMem:    16G   15G  200M   100M       800M        500M\n```\n\nמה המצב?",
            options: [
              "הכל תקין - רוב הזיכרון ב-cache וניתן לשחרור אוטומטי",
              "הזיכרון כמעט אזל - available רק 500M מתוך 16G",
              "אין בעיה - free מראה 200M שפנויים לשימוש מיידי",
              "צריך restart כדי לשחרר זיכרון שנתפס ע\"י cache",
            ],
            answer: 1,
            explanation: "בפלט free, העמודה הקריטית היא available, לא free.\navailable (500M) מציג כמה זיכרון באמת פנוי לתהליכים חדשים.\n500M מתוך 16G זה כ-3%, מצב מסוכן.\nהמערכת עלולה להתחיל להשתמש ב-swap או להפעיל OOM Killer.\nfree (200M) מטעה כי Linux משתמש בזיכרון פנוי ל-cache, ולכן available הוא המדד האמיתי.",
          },
          {
            q: "הרצת:\n\n```\nuptime\n```\n\nפלט:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nהשרת הוא 4-core. מה המצב?",
            options: [
              "השרת במצב תקין - load average תואם את מספר הליבות",
              "העומס נובע מכך שיש 2 משתמשים מחוברים במקביל",
              "load average אינו תלוי במספר ליבות של המעבד",
              "ה-load average (12.5) גבוה פי 3 ממספר הליבות (4)"],
            answer: 3,
            explanation: "load average 12.5 על שרת 4-core אומר שהעומס גבוה פי 3 מהקיבולת.\nload 4.0 על 4 cores זה 100% ניצולת. load 12.5 = כ-312%, עומס חמור.\nהמגמה עולה (8.2 → 11.8 → 12.5), מה שמצביע על מצב שמחמיר.\nload average מודד תהליכים שממתינים לריצה, וקשור ישירות למספר הליבות.\nמספר המשתמשים המחוברים (2) לא קשור ל-load.",
          },
          {
            q: "הרצת:\n\n```\nss -tlnp\n```\n\nפלט:\n\n```\nState    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN   0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nמה אנחנו רואים?",
            options: [
              "nginx מאזין על פורטים 80 ו-443 על כל ממשקי הרשת",
              "nginx לא פועל כי אין חיבורים פעילים שמופיעים בפלט",
              "יש בעיית firewall שחוסמת גישה לפורטים 80 ו-443",
              "nginx מאזין רק על localhost ולא נגיש מבחוץ",
            ],
            answer: 0,
            explanation: "הפלט מראה ש-nginx מאזין על פורטים 80 ו-443.\nהכתובת 0.0.0.0 אומרת שהשירות מאזין על כל ממשקי הרשת, כלומר נגיש מבחוץ.\nLISTEN מוכיח שהשירות פועל ומחכה לחיבורים נכנסים.\nאם הכתובת הייתה 127.0.0.1 זה היה רק localhost, לא נגיש מבחוץ.\nss לא מציג חוקי firewall, לכן נגישות מבחוץ צריכה בדיקה נפרדת.",
          },
          {
            q: "יש לך קובץ לוג בגודל 2GB ואתה צריך למצוא את כל השורות שמכילות \"ERROR\" מהשעה האחרונה.\n\nאיזו גישה הכי יעילה?",
            options: [
              "cat log.txt | grep ERROR",
              "tail -f log.txt",
              "grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
              "head -1000 log.txt | grep ERROR"],
            answer: 2,
            explanation: "בקובץ לוג של 2GB, סינון כפול חוסך עיבוד מיותר.\ngrep ERROR מסנן רק שורות שגיאה, ו-grep עם date מצמצם לשעה האחרונה.\ngrep ישירות על הקובץ (בלי cat) יעיל יותר כי לא יוצר pipe מיותר.\ncat | grep קורא את כל 2GB בלי סינון זמן.\ntail -f עוקב בזמן אמת ולא מחפש בהיסטוריה, ו-head מציג שורות מתחילת הקובץ.",
          },
          {
            q: "הרצת:\n\n```\nps aux\n```\n\nאתה רואה תהליך במצב Z (zombie).\n\nמה הדרך הנכונה לטפל בו?",
            options: [
              "לזהות את תהליך האב ולהפעיל אותו מחדש כדי שיקרא wait()",
              "לשלוח kill -9 ישירות לתהליך ה-zombie עצמו",
              "להפעיל מחדש את השרת כדי לנקות את טבלת התהליכים",
              "להתעלם מהתהליך כי zombies נעלמים מעצמם תמיד"],
            answer: 0,
            explanation: "תהליך zombie (Z) כבר סיים לרוץ, אבל הרשומה שלו נשארת בטבלת התהליכים.\nהסיבה: תהליך האב לא קרא wait() כדי לאסוף את ה-exit status.\nהפתרון הוא לזהות את תהליך האב ולהפעיל אותו מחדש כדי שיטפל ב-zombies.\nkill -9 על zombie לא עובד כי התהליך כבר מת, אין מה להרוג.\nzombies לא נעלמים מעצמם ודורשים טיפול של תהליך האב.",
          },
          {
            q: "הרצת:\n\n```\niostat -x 1 3\n```\n\nפלט:\n\n```\nDevice   r/s    w/s   rkB/s   wkB/s  await  %util\nsda      5.00  450.00  20.00 51200.00 250.00  99.80\n```\n\nמה המסקנה?",
            options: [
              "הבעיה היא רק בכמות הכתיבות הגבוהה לדיסק",
              "כמות הקריאות נמוכה (5/s) ומעידה על בעיית ביצועים",
              "הדיסק תקין - ערכי %util גבוהים רגילים בשרת עמוס",
              "הדיסק רווי (%util 99.8%) עם await גבוה של 250ms"],
            answer: 3,
            explanation: "%util של 99.8% אומר שהדיסק עסוק כמעט כל הזמן, כלומר הוא רווי.\nawait של 250ms אומר שכל פעולת I/O לוקחת רבע שנייה. ל-SSD תקין הערך הוא מתחת ל-1ms.\nהשילוב של %util גבוה ו-await גבוה מצביע על דיסק שלא מספיק לעמוס.\nהכתיבות (450/s, כ-50MB/s) הן הגורם העיקרי, לא הקריאות (5/s).\nכל תהליך שניגש לדיסק יואט עד שהעומס יפחת.",
          },
          {
            q: "קונטיינר נהרג באופן בלתי צפוי.\n\nהרצת:\n\n```\ndmesg | tail -20\n```\n\nפלט:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nמה קרה ומה הפתרון?",
            options: [
              "התהליך נהרג כי חרג ממגבלת ה-cgroup CPU shares",
              "התהליך קרס בגלל segfault עקב גישה לזיכרון לא חוקי",
              "OOM Killer הרג את התהליך כי חרג ממגבלת הזיכרון",
              "התהליך נהרג כי ה-swap נגמר והמערכת ביצעה graceful shutdown"],
            answer: 2,
            explanation: "ההודעה Out of memory: Killed process ב-dmesg מציינת שה-OOM Killer (Out Of Memory Killer) של הקרנל הרג את התהליך בגלל מחסור בזיכרון.\nכאשר המערכת נגמרת מ-RAM ואין מספיק זיכרון פנוי, הקרנל בוחר תהליך שמנצל הרבה זיכרון ומסיים אותו כדי לפנות משאבים.\nבשורה המוצגת רואים שהתהליך java נהרג, והערך anon-rss מציין כמה זיכרון RAM בפועל התהליך השתמש.\nמצב כזה יכול להתרחש כאשר התהליך צורך יותר מדי זיכרון, או כאשר מוגדר לו memory limit נמוך מדי (למשל בקונטיינר).",
          },
        ],
        questionsEn: [
          {
            q: "A server is responding slowly. You run top and see:\n\n```\ntop\n```\n\n```\n%Cpu(s): 72.5 us, 18.0 sy, 0.3 ni, 5.0 id, 4.0 wa, 0.0 hi, 0.2 si\n```\n\nWhat indicates high CPU load?",
            options: [
              "High %wa (4.0%) - the CPU is waiting for disk",
              "Low %id (5.0%) - the CPU is barely idle",
              "High %ni (0.3%) - processes with altered priority",
              "High %si (0.2%) - frequent software interrupts"],
            answer: 1,
            explanation: "%Cpu(s) shows how CPU time is distributed.\nus and sy represent actual work (applications + kernel).\nid is idle time.\nwa is time waiting on I/O (disk/network).\nni and si are priority and interrupt times.\nHere id is low (5%), meaning most of the CPU is in use, indicating high load.",
          },
          {
            q: "You ran:\n\n```\nfree -h\n```\n\nOutput:\n\n```\n       total  used  free  shared  buff/cache  available\nMem:    16G   15G  200M   100M       800M        500M\n```\n\nWhat is the situation?",
            options: [
              "Everything is fine - most memory is in cache and can be freed",
              "Memory is nearly exhausted - only 500M available out of 16G",
              "No problem - free shows 200M of unused memory available",
              "Need to restart the server to release memory held by cache",
            ],
            answer: 1,
            explanation: "In free output, the critical column is available, not free.\navailable (500M) shows how much memory is actually usable for new processes.\n500M out of 16G is about 3%, a dangerous state.\nThe system may start swapping or trigger OOM Killer.\nfree (200M) is misleading because Linux uses free memory for cache, so available is the real metric.",
          },
          {
            q: "You ran:\n\n```\nuptime\n```\n\nOutput:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nThe server has 4 cores. What is the situation?",
            options: [
              "The server is in good shape - load average matches the core count",
              "The load is caused by having 2 users connected simultaneously",
              "Load average is not dependent on the number of CPU cores",
              "Load average (12.5) is 3x the core count (4) - severe load"],
            answer: 3,
            explanation: "Load average 12.5 on a 4-core server means the load is 3x the capacity.\nLoad 4.0 on 4 cores is 100% utilization. Load 12.5 equals about 312%, a severe state.\nThe trend is rising (8.2 → 11.8 → 12.5), indicating the situation is getting worse.\nLoad average measures processes waiting to run and is directly related to core count.\nThe number of connected users (2) has nothing to do with load.",
          },
          {
            q: "You ran:\n\n```\nss -tlnp\n```\n\nOutput:\n\n```\nState    Recv-Q  Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN   0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nWhat do we see?",
            options: [
              "nginx is listening on ports 80 and 443 on all network interfaces",
              "nginx is not running because no active connections appear in output",
              "There is a firewall issue blocking access to ports 80 and 443",
              "nginx is listening only on localhost and is not externally accessible",
            ],
            answer: 0,
            explanation: "The output shows nginx listening on ports 80 and 443.\nThe address 0.0.0.0 means the service is listening on all network interfaces, so it is externally accessible.\nLISTEN state proves the service is running and waiting for incoming connections.\nIf the address were 127.0.0.1, it would be localhost only, not externally accessible.\nss does not show firewall rules, so external access requires separate verification.",
          },
          {
            q: "You have a 2GB log file and need to find all lines containing \"ERROR\" from the last hour.\n\nWhich approach is most efficient?",
            options: [
              "cat log.txt | grep ERROR",
              "tail -f log.txt",
              "grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"",
              "head -1000 log.txt | grep ERROR"],
            answer: 2,
            explanation: "For a 2GB log file, double filtering avoids unnecessary processing.\ngrep ERROR filters only error lines, and grep with date narrows to the last hour.\ngrep directly on the file (without cat) is more efficient as it avoids an unnecessary pipe.\ncat | grep reads all 2GB without time filtering.\ntail -f follows in real time and does not search history, and head shows lines from the start of the file.",
          },
          {
            q: "You ran:\n\n```\nps aux\n```\n\nYou see a process in Z state (zombie).\n\nWhat is the correct way to handle it?",
            options: [
              "Identify the parent process and restart it so it calls wait()",
              "Send kill -9 directly to the zombie process itself",
              "Restart the server to clear the entire process table",
              "Ignore the process because zombies always disappear on their own"],
            answer: 0,
            explanation: "A zombie (Z) process has already finished running, but its entry remains in the process table.\nThe reason: the parent process did not call wait() to collect the exit status.\nThe fix is to identify the parent process and restart it so it handles the zombies.\nkill -9 on a zombie does not work because the process is already dead.\nZombies do not disappear on their own and require the parent process to handle them.",
          },
          {
            q: "You ran:\n\n```\niostat -x 1 3\n```\n\nOutput:\n\n```\nDevice   r/s    w/s   rkB/s   wkB/s  await  %util\nsda      5.00  450.00  20.00 51200.00 250.00  99.80\n```\n\nWhat is the conclusion?",
            options: [
              "The problem is only the high number of writes to disk",
              "The low read count (5/s) indicates a disk performance problem",
              "The disk is fine - high %util values are normal under load",
              "Disk is saturated (%util 99.8%) with high await of 250ms"],
            answer: 3,
            explanation: "%util of 99.8% means the disk is busy nearly all the time, indicating saturation.\nawait of 250ms means each I/O operation takes a quarter second. Normal SSD is under 1ms.\nThe combination of high %util and high await indicates the disk cannot keep up with the load.\nWrites (450/s, about 50MB/s) are the main contributor, not reads (5/s).\nEvery process accessing the disk will slow down until the load decreases.",
          },
          {
            q: "A container was unexpectedly killed.\n\nYou ran:\n\n```\ndmesg | tail -20\n```\n\nOutput:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nWhat happened and what is the solution?",
            options: [
              "The process was killed for exceeding its cgroup CPU shares limit",
              "The process crashed due to a segfault from invalid memory access",
              "OOM Killer terminated the process for exceeding its memory limit",
              "The process was killed because swap ran out and the system shut it down"],
            answer: 2,
            explanation: "The message Out of memory: Killed process in dmesg indicates that the kernel OOM Killer terminated the process due to memory exhaustion.\nWhen the system runs out of available RAM, the kernel selects a memory-hungry process and kills it to free resources.\nIn the output we see that the java process was terminated, and the anon-rss value shows how much RAM the process was actually using.\nThis situation can happen when a process consumes too much memory or when its memory limit is set too low, such as inside a container.",
          },
        ],
      },
      hard: {
        theory: "אבחון מערכת מתקדם וניתוח ביצועים ברמת kernel.\n🔹 strace -c -p PID:\u200E סיכום system calls לפי זמן - מזהה צווארי בקבוק (futex = lock contention)\n🔹 perf top:\u200E profiling בזמן אמת - מציג פונקציות שצורכות הכי הרבה CPU\n🔹 /proc/net/sockstat:\u200E מצב TCP stack - orphans, TIME_WAIT, צריכת זיכרון\n🔹 /proc/buddyinfo:\u200E memory fragmentation - בלוקים פנויים ב-buddy allocator\n🔹 /proc/PID/fd:\u200E file descriptors פתוחים - זיהוי FD leaks\n🔹 sar -n DEV:\u200E סטטיסטיקות רשת - bandwidth, drops, packets per second\n🔹 errno.h:\u200E קודי שגיאה בkernel: -12=ENOMEM, -13=EACCES, -22=EINVAL\nCODE:\nstrace -c -p 1234\nperf top\nperf record -g -a sleep 10 && perf report\ncat /proc/net/sockstat\nls /proc/1234/fd | wc -l\nsar -n DEV 1 5",
        theoryEn: "Advanced system diagnostics and kernel-level performance analysis.\n🔹 strace -c -p PID - summarize system calls by time - identifies bottlenecks (futex = lock contention)\n🔹 perf top - real-time profiling - shows functions consuming the most CPU\n🔹 /proc/net/sockstat - TCP stack state - orphans, TIME_WAIT, memory usage\n🔹 /proc/buddyinfo - memory fragmentation - free blocks in the buddy allocator\n🔹 /proc/PID/fd - open file descriptors - detecting FD leaks\n🔹 sar -n DEV - network statistics - bandwidth, drops, packets per second\n🔹 errno.h - kernel error codes: -12=ENOMEM, -13=EACCES, -22=EINVAL\nCODE:\nstrace -c -p 1234\nperf top\nperf record -g -a sleep 10 && perf report\ncat /proc/net/sockstat\nls /proc/1234/fd | wc -l\nsar -n DEV 1 5",
        questions: [
          {
            q: "אתה צריך לאבחן למה תהליך מסוים איטי.\n\nהרצת:\n\n```\nstrace -c -p 1234\n```\n\nפלט:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nמה המסקנה?",
            options: [
              "כמות קריאות read גבוהה מצביעה על חוסר ב-caching",
              "85% על futex מצביע על lock contention חמור בין threads",
              "כמות כתיבות write גבוהה מצביעה על buffer קטן מדי",
              "futex הוא חלק נורמלי מריצת תהליך ואין כאן בעיה"],
            answer: 1,
            explanation: "strace -c מסכם system calls לפי זמן שנצרך.\n85% מהזמן על futex הוא סימן אדום ל-lock contention חמור.\nfutex הוא ה-system call שעומד מאחורי mutexes ו-semaphores.\nכשתהליך מבלה 85% על futex, הוא ממתין ל-locks במקום לעשות עבודה אמיתית.\nfutex בכמויות קטנות הוא נורמלי, אבל 85% מצביע על בעיה ארכיטקטונית בקוד.",
          },
          {
            q: "שרת מדווח על latency גבוה לבקשות רשת.\n\nהרצת:\n\n```\ncat /proc/net/sockstat\n```\n\nפלט:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nמה הבעיה?",
            options: [
              "כל המספרים בטווח הנורמלי עבור שרת תחת עומס",
              "מספר ה-TCP connections (28542) נמוך מדי עבור שרת פעיל",
              "צריכת הזיכרון של ה-TCP stack (95000 pages) היא תקינה",
              "orphan (12500) ו-TIME_WAIT (65000) מצביעים על חיבורים שלא נסגרים"],
            answer: 3,
            explanation: "/proc/net/sockstat מציג סטטיסטיקות על מצב חיבורי ה-TCP במערכת.\nהערכים tw 65000 ו-orphan 12500 גבוהים מאוד ומעידים על מספר גדול של חיבורים שלא נסגרו בצורה תקינה.\nTIME_WAIT (tw) הוא מצב שבו חיבור TCP נשאר פתוח לזמן קצר אחרי סגירה כדי למנוע בעיות בפרוטוקול. מספר גדול מאוד של חיבורים במצב זה בדרך כלל מעיד על קצב גבוה של חיבורים קצרים.\norphan sockets הם חיבורים שאין להם תהליך שמנהל אותם יותר. מצב כזה יכול להיווצר כאשר תהליך נסגר לפני שהחיבור נסגר בצורה תקינה.\nכאשר יש הרבה TIME_WAIT ו-orphan sockets, זה יכול לגרום לעומס על ה-TCP stack ולפגוע בביצועי הרשת, ולכן זו כנראה הסיבה ל-latency הגבוה.",
          },
          {
            q: "הרצת:\n\n```\ncat /proc/buddyinfo\n```\n\nפלט:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nמה המצב?",
            options: [
              "יש memory fragmentation חמור ואין בלוקים רציפים גדולים",
              "הזיכרון הפיזי ריק לגמרי ויש צורך להוסיף RAM",
              "המספרים תקינים ומייצגים שימוש רגיל ב-buddy allocator",
              "יש בעיית swap שגורמת לפיצול דפים בזיכרון",
            ],
            answer: 0,
            explanation: "buddyinfo מציג בלוקים פנויים ב-buddy allocator של הקרנל, מ-order 0 (4KB) עד order 10 (4MB).\nהפלט מראה רק בלוק אחד של 4KB פנוי, כל שאר הגדלים באפס.\nזה fragmentation קיצוני: הזיכרון לא ריק, אבל כל הבלוקים הגדולים מפוצלים.\nהקצאות שדורשות דפים רציפים (huge pages, DMA buffers) ייכשלו.\nבמצב בריא רואים מספרים חיוביים בכל ה-orders, ו-swap לא פותר fragmentation.",
          },
          {
            q: "אתה חושד שתהליך מדליף file descriptors.\n\nהרצת:\n\n```\n$ ls /proc/1234/fd | wc -l\n45892\n\n$ cat /proc/1234/limits | grep 'Max open files'\nMax open files    65536    65536    files\n```\n\nמה המצב ומה עלול לקרות?",
            options: [
              "המגבלה של 65,536 נמוכה מדי ויש להגדיל אותה בהתאם",
              "מספר כזה של FDs פתוחים הוא תקין לשרת תחת עומס",
              "התהליך מתקרב למגבלה (45,892 מתוך 65,536) ויכשל עם EMFILE",
              "הפער בין soft limit ל-hard limit הוא שגורם לבעיה"],
            answer: 2,
            explanation: "מה רואים בפלט:\nלתהליך יש 45,892 file descriptors פתוחים.\nהמגבלה (limit) היא 65,536.\n\nמה זה אומר:\nהתהליך צורך כ-70% מהמגבלה המותרת.\nשרת בריא בדרך כלל מחזיק מאות עד אלפים בודדים של FDs.\n45,892 זה חריג ומעיד על דליפת file descriptors.\n\nמה יקרה אם מגיעים למגבלה:\nכל קריאה ל-open(), socket() או accept() תיכשל עם שגיאת EMFILE.\nEMFILE אומר שהתהליך ניסה לפתוח קובץ או socket אבל הגיע למגבלת ה-FD.\n\nלמה הגדלת המגבלה לא פותרת:\nהגדלת ה-limit רק דוחה את הקריסה.\nצריך לזהות ולתקן את מקור הדליפה.",
          },
          {
            q: "הרצת:\n\n```\nsar -n DEV 1 5\n```\n\nפלט (ממוצע):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nכרטיס הרשת הוא 1Gbps. מה הבעיה?",
            options: [
              "ה-throughput קרוב למגבלת ה-NIC של 1Gbps - כרטיס הרשת רווי ומאבד מנות",
              "הפרוטוקול הוא TCP - מעבר ל-UDP יפחית את ה-overhead ויפתור את הבעיה",
              "הבעיה היא ב-packet drops בצד ה-tx - צריך לבדוק את ה-txdrop counter",
              "הערכים תקינים לשרת בעומס גבוה - אין כאן חריגה מהנורמה",
            ],
            answer: 0,
            explanation: "rxkB/s של 115MB/s מתקרב למגבלת 1Gbps (כ-125MB/s), כלומר הכרטיס ב-92% ניצולת.\nrxdrop/s של 850 מצביע על איבוד מנות בצד הקליטה בגלל ring buffer מלא.\ntxdrop/s של 0 אומר שהבעיה בקליטה, לא בשליחה.\nהשילוב של throughput קרוב למגבלה ואיבוד מנות מעיד על NIC saturation.\nזו בעיית bandwidth, לא פרוטוקול ולא כמות מנות.",
          },
          {
            q: "הרצת:\n\n```\nperf top\n```\n\nפלט:\n\n```\n  35.2%  [kernel]        [k] _raw_spin_lock\n  18.1%  [kernel]        [k] copy_user_generic_unrolled\n  12.4%  libc.so.6       [.] __memcpy_avx2\n   8.3%  myapp           [.] parse_request\n```\n\nמה המסקנה?",
            options: [
              "kernel functions תמיד מובילות ב-perf והמצב תקין",
              "12% על memcpy מצביע על העתקות זיכרון לא יעילות",
              "parse_request הוא צוואר הבקבוק כפונקציה היחידה מהאפליקציה",
              "35% על spinlock מצביע על contention חמור בין cores"],
            answer: 3,
            explanation: "perf top מראה איפה ה-CPU מבלה את רוב הזמן.\n35% על _raw_spin_lock מצביע על contention חמור בין cores.\nspinlock הוא busy-wait: cores מסתובבים בלולאה ושורפים CPU במקום לעבוד.\nלרוב זה קשור ל-networking stack, I/O scheduler, או מבנה נתונים משותף.\nבעומס רגיל kernel functions לא אמורות להוביל, וכאן spinlock גדול פי 4 מכל פונקציה אחרת.",
          },
          {
            q: "שרת לא מצליח ליצור חיבורי רשת חדשים.\n\nהרצת:\n\n```\nsysctl net.ipv4.ip_local_port_range\n```\n\nפלט:\n\n```\nnet.ipv4.ip_local_port_range = 32768    60999\n```\n\nוגם:\n\n```\nss -s\n```\n\nפלט:\n\n```\nTCP:   28231 (estab 25000, closed 0, orphaned 0, tw 3200)\n```\n\nמה הבעיה?",
            options: [
              "מספר ה-orphaned connections גבוה מדי וצורך משאבים",
              "טווח הפורטים (28,232) כמעט מלא עם 28,231 חיבורים פעילים",
              "25,000 established connections חורגים מיכולת השרת",
              "הגדרות ה-TCP stack תקינות והבעיה היא ב-DNS resolution"],
            answer: 1,
            explanation: "טווח הפורטים הזמין הוא 32768-60999, כלומר 28,232 פורטים בסך הכל.\nss -s מראה 28,231 חיבורים פעילים, נשאר פורט אחד בלבד.\nחיבור חדש ייכשל עם EADDRNOTAVAIL כי אין פורטים פנויים.\nהפתרון המיידי הוא להרחיב את הטווח או להפעיל tcp_tw_reuse.\nלטווח ארוך, connection pooling מונע מצב שבו כל בקשה פותחת חיבור חדש.",
          },
          {
            q: "אחרי שדרוג kernel, שרת מציג:\n\n```\ndmesg | grep -i error\n```\n\nפלט:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nמה error -12 מציין?",
            options: [
              "Error -12 הוא ENOMEM - ה-driver נכשל בהקצאת זיכרון באתחול",
              "Error -12 הוא EACCES - ה-driver דורש הרשאות root לטעינה",
              "Error -12 הוא שגיאת PCIe שמצביעה על כרטיס גרפי פגום",
              "Error -12 הוא שגיאת ACPI שנפרדת לחלוטין מה-driver",
            ],
            answer: 0,
            explanation: "בקרנל, ערכי שגיאה שליליים מוגדרים ב-errno.h, כאשר -12 הוא ENOMEM (אין זיכרון).\nה-driver nouveau ניסה להקצות זיכרון DMA בזמן אתחול ונכשל.\nזה שכיח אחרי שדרוג kernel כשה-driver לא תואם לגרסה החדשה.\nPermission error הוא -1 (EPERM) או -13 (EACCES), לא -12.\nפגם פיזי בחומרה היה מציג PCIe errors, לא ENOMEM.",
          },
        ],
        questionsEn: [
          {
            q: "You need to diagnose why a specific process is slow.\n\nYou ran:\n\n```\nstrace -c -p 1234\n```\n\nOutput:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nWhat is the conclusion?",
            options: [
              "High read call count indicates a need for better caching",
              "85% on futex indicates severe lock contention between threads",
              "High write call count indicates the buffer size is too small",
              "futex is a normal part of process execution and is not an issue"],
            answer: 1,
            explanation: "strace -c summarizes system calls by time consumed.\n85% of time on futex is a red flag for severe lock contention.\nfutex is the system call behind mutexes and semaphores.\nWhen a process spends 85% on futex, it is waiting for locks instead of doing real work.\nSome futex usage is normal, but 85% indicates an architectural problem in the code.",
          },
          {
            q: "A server reports high latency for network requests.\n\nYou ran:\n\n```\ncat /proc/net/sockstat\n```\n\nOutput:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nWhat is the problem?",
            options: [
              "All numbers are within normal range for a server under load",
              "TCP connection count (28542) is too low for an active server",
              "TCP stack memory usage (95000 pages) is within normal range",
              "Orphan (12500) and TIME_WAIT (65000) indicate connections not closing properly"],
            answer: 3,
            explanation: "/proc/net/sockstat shows statistics about the TCP connection state on the system.\nThe values tw 65000 and orphan 12500 are very high and indicate a large number of connections that were not closed cleanly.\nTIME_WAIT (tw) is a TCP state where a connection remains temporarily after closing to ensure protocol correctness. A very large number of connections in this state usually indicates a high rate of short-lived connections.\norphan sockets are connections that no longer have an owning process. This can happen when a process exits before the connection is properly closed.\nWhen many sockets are in TIME_WAIT or orphan state, it can put pressure on the TCP stack and degrade network performance, which likely explains the high latency.",
          },
          {
            q: "You ran:\n\n```\ncat /proc/buddyinfo\n```\n\nOutput:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nWhat is the situation?",
            options: [
              "Severe memory fragmentation with no large contiguous blocks available",
              "Physical memory is completely empty and more RAM needs to be added",
              "The numbers are normal and represent typical buddy allocator usage",
              "There is a swap issue causing page fragmentation in memory",
            ],
            answer: 0,
            explanation: "buddyinfo shows free blocks in the kernel buddy allocator, from order 0 (4KB) to order 10 (4MB).\nThe output shows only one 4KB block free, all other sizes are zero.\nThis is extreme fragmentation: memory is not empty, but all large blocks are split up.\nAllocations requiring contiguous pages (huge pages, DMA buffers) will fail.\nA healthy system shows positive numbers across all orders, and swap does not fix fragmentation.",
          },
          {
            q: "You suspect a process is leaking file descriptors.\n\nYou ran:\n\n```\n$ ls /proc/1234/fd | wc -l\n45892\n\n$ cat /proc/1234/limits | grep 'Max open files'\nMax open files    65536    65536    files\n```\n\nWhat is the situation and what might happen?",
            options: [
              "The limit of 65,536 is too low and should be increased accordingly",
              "This number of open FDs is normal for a server under heavy load",
              "The process is approaching its limit (45,892/65,536) and may fail with EMFILE",
              "The gap between soft limit and hard limit is what causes the problem"],
            answer: 2,
            explanation: "What the output shows:\nThe process has 45,892 open file descriptors.\nThe limit is 65,536.\n\nWhat this means:\nThe process is using about 70% of its allowed limit.\nA healthy server typically holds hundreds to low thousands of FDs.\n45,892 is abnormal and indicates a file descriptor leak.\n\nWhat happens when the limit is reached:\nEvery call to open(), socket(), or accept() will fail with EMFILE.\nEMFILE means the process tried to open a file or socket but hit the FD limit.\n\nWhy increasing the limit does not help:\nRaising the limit only delays the crash.\nThe root cause (the leak) must be identified and fixed.",
          },
          {
            q: "You ran:\n\n```\nsar -n DEV 1 5\n```\n\nOutput (average):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nThe network card is 1Gbps. What is the problem?",
            options: [
              "rxkB/s (115MB/s) approaches 1Gbps capacity with 850 drops/s",
              "The packet count (95,000/s) is too high and overloading the NIC",
              "The issue is with txdrop because the sending side cannot transmit",
              "Switching to UDP would reduce overhead and prevent packet drops",
            ],
            answer: 0,
            explanation: "rxkB/s of 115MB/s approaches the 1Gbps limit (about 125MB/s), meaning the card is at 92% utilization.\nrxdrop/s of 850 indicates packet loss on the receive side due to a full ring buffer.\ntxdrop/s of 0 means the problem is on the receive side, not the send side.\nThe combination of throughput near the limit and packet drops indicates NIC saturation.\nThis is a bandwidth issue, not a protocol or packet count issue.",
          },
          {
            q: "You ran:\n\n```\nperf top\n```\n\nOutput:\n\n```\n  35.2%  [kernel]        [k] _raw_spin_lock\n  18.1%  [kernel]        [k] copy_user_generic_unrolled\n  12.4%  libc.so.6       [.] __memcpy_avx2\n   8.3%  myapp           [.] parse_request\n```\n\nWhat is the conclusion?",
            options: [
              "Kernel functions always lead in perf and the situation is normal",
              "12% on memcpy indicates inefficient memory copy operations",
              "parse_request is the bottleneck as the only application function",
              "35% on spinlock indicates severe contention between cores"],
            answer: 3,
            explanation: "perf top shows where the CPU spends most of its time.\n35% on _raw_spin_lock indicates severe contention between cores.\nSpinlock is busy-wait: cores spin in a loop burning CPU instead of doing work.\nThis is usually related to the networking stack, I/O scheduler, or shared data structures.\nUnder normal load kernel functions should not lead, and here spinlock is 4x higher than any other function.",
          },
          {
            q: "A server cannot create new network connections.\n\nYou ran:\n\n```\nsysctl net.ipv4.ip_local_port_range\n```\n\nOutput:\n\n```\nnet.ipv4.ip_local_port_range = 32768    60999\n```\n\nAnd:\n\n```\nss -s\n```\n\nOutput:\n\n```\nTCP:   28231 (estab 25000, closed 0, orphaned 0, tw 3200)\n```\n\nWhat is the problem?",
            options: [
              "Too many orphaned connections are consuming server resources",
              "The port range (28,232) is almost exhausted with 28,231 active connections",
              "25,000 established connections exceeds the server's capacity",
              "TCP stack settings are fine and the issue is DNS resolution"],
            answer: 1,
            explanation: "The available port range is 32768-60999, which is 28,232 ports total.\nss -s shows 28,231 active connections, leaving only one port available.\nNew connections will fail with EADDRNOTAVAIL because there are no free ports.\nThe immediate fix is to expand the range or enable tcp_tw_reuse.\nLong term, connection pooling prevents the situation where every request opens a new connection.",
          },
          {
            q: "After a kernel upgrade, a server shows:\n\n```\ndmesg | grep -i error\n```\n\nOutput:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nWhat does error -12 indicate?",
            options: [
              "Error -12 is ENOMEM - the driver failed to allocate memory during init",
              "Error -12 is EACCES - the driver requires root permissions to load",
              "Error -12 is a PCIe error indicating a physically damaged graphics card",
              "Error -12 is an ACPI error that is completely separate from the driver",
            ],
            answer: 0,
            explanation: "In the kernel, negative error values are defined in errno.h, where -12 is ENOMEM (out of memory).\nThe nouveau driver tried to allocate DMA memory during initialization and failed.\nThis is common after kernel upgrades when the driver is not compatible with the new version.\nA permission error would be -1 (EPERM) or -13 (EACCES), not -12.\nA physical hardware defect would show PCIe errors, not ENOMEM.",
          },
        ],
      },
    },
  },
  {
    id: "argo",
    icon: "argo",
    name: "Argo & GitOps",
    color: "#EF7B45",
    description: "ArgoCD · Workflows · ApplicationSets · Rollouts",
    descriptionEn: "ArgoCD · Workflows · ApplicationSets · Rollouts",
    isComingSoon: true,
    levels: {
      easy: {
        theory: "GitOps ו-ArgoCD - עקרונות בסיסיים.\n🔹 GitOps:\u200E Git הוא ה-source of truth היחיד למצב הרצוי של הקלאסטר\n🔹 ArgoCD:\u200E כלי continuous delivery שמסנכרן בין Git repo למצב ב-Kubernetes\n🔹 Sync:\u200E התהליך שבו ArgoCD מיישם את השינויים מ-Git לקלאסטר\n🔹 OutOfSync:\u200E המצב בקלאסטר שונה ממה שמוגדר ב-Git\n🔹 Synced:\u200E המצב בקלאסטר תואם את Git\n🔹 Application:\u200E אובייקט ב-ArgoCD שמגדיר מאיפה לקחת manifests ולאן לפרוס\n🔹 Health Status:\u200E Healthy, Degraded, Progressing, Missing\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: my-app\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/org/repo\n    targetRevision: main\n    path: k8s/\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: production",
        theoryEn: "GitOps and ArgoCD fundamentals.\n🔹 GitOps - Git is the single source of truth for the desired cluster state\n🔹 ArgoCD - a continuous delivery tool that syncs a Git repo to the Kubernetes cluster\n🔹 Sync - the process of applying changes from Git to the cluster\n🔹 OutOfSync - the cluster state differs from what is defined in Git\n🔹 Synced - the cluster state matches Git\n🔹 Application - an ArgoCD object defining where to pull manifests from and where to deploy\n🔹 Health Status - Healthy, Degraded, Progressing, Missing\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: my-app\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: https://github.com/org/repo\n    targetRevision: main\n    path: k8s/\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: production",
        questions: [
          {
            q: "אפליקציה payments-service מוצגת כ-OutOfSync ב-ArgoCD אחרי deploy.\n\nמה הצעד הראשון המתאים ביותר?",
            options: [
              "kubectl delete pod\nעל כל ה-Pods ב-namespace",
              "kubectl apply\nידנית מתוך ה-repo",
              "לבדוק את ה-diff בין Git למצב בקלאסטר",
              "למחוק את ה-namespace וליצור מחדש",
            ],
            answer: 2,
            explanation: "OutOfSync אומר שהמצב בקלאסטר שונה מ-Git.\nהצעד הראשון תמיד הוא לבדוק את ה-diff כדי להבין מה בדיוק שונה.\nלמחוק Pods או namespace זה הרסני ולא פותר את הבעיה.\n`kubectl apply` ידנית עוקף את תהליך ה-GitOps.",
          },
          {
            q: "ב-GitOps, מה ה-source of truth למצב הרצוי של הקלאסטר?",
            options: [
              "ה-state הנוכחי של הקלאסטר כפי שמדווח על ידי kubectl",
              "Git repository שמכיל את ה-manifests",
              "ArgoCD dashboard שמציג את ה-health status",
              "Helm release history שנשמר ב-cluster",
            ],
            answer: 1,
            explanation: "העיקרון המרכזי של GitOps הוא ש-Git הוא ה-source of truth היחיד.\nכל שינוי עובר דרך Git, ו-ArgoCD מסנכרן את הקלאסטר בהתאם.\nהקלאסטר עצמו, ArgoCD UI, ו-Helm history הם רק השתקפות של המצב.",
          },
          {
            q: "מהנדס עשה `kubectl edit deployment` ישירות על הקלאסטר.\nאחרי כמה דקות ArgoCD מציג את האפליקציה כ-OutOfSync.\n\nלמה?",
            options: [
              "ArgoCD זיהה שהמצב בקלאסטר כבר לא תואם את Git",
              "kubectl edit גרם ל-ArgoCD לעשות restart",
              "ה-deployment נכשל כי ArgoCD חוסם שינויים ישירים",
              "ArgoCD מוחק אוטומטית שינויים שלא עברו דרך Git",
            ],
            answer: 0,
            explanation: "ArgoCD משווה באופן קבוע את המצב בקלאסטר ל-Git.\nשינוי ישיר בקלאסטר יוצר drift - המצב כבר לא תואם את Git.\nArgoCD לא חוסם שינויים ישירים ולא מוחק אותם אוטומטית (אלא אם מוגדר self-heal).\nהוא רק מדווח שיש פער.",
          },
          {
            q: "מה ההבדל בין Synced ל-Healthy ב-ArgoCD?",
            tags: ["gitops-sync"],
            options: [
              "Synced אומר שהמצב תואם Git, Healthy אומר שהמשאבים עובדים תקין",
              "Synced ו-Healthy זה אותו דבר, רק שמות שונים",
              "Healthy אומר שהמצב תואם Git, Synced אומר שה-Pods רצים",
              "Synced מתייחס ל-repo ו-Healthy מתייחס ל-ArgoCD עצמו",
            ],
            answer: 0,
            explanation: "אלה שני מדדים נפרדים:\nSync Status - האם המצב בקלאסטר תואם את Git (Synced / OutOfSync).\nHealth Status - האם המשאבים עצמם תקינים (Healthy / Degraded / Progressing).\nאפשר להיות Synced אבל Degraded, למשל כשה-manifests הוחלו אבל ה-Pod נופל ב-CrashLoopBackOff.",
          },
          {
            q: "צוות רוצה לעשות rollback ל-version קודם של אפליקציה.\nהם משתמשים ב-GitOps עם ArgoCD.\n\nמה הדרך הנכונה?",
            options: [
              "ללחוץ Rollback ב-ArgoCD UI",
              "kubectl rollout undo",
              "לעשות git revert ל-commit האחרון ולתת ל-ArgoCD לסנכרן",
              "למחוק את ה-Application ב-ArgoCD וליצור מחדש עם הגרסה הישנה",
            ],
            answer: 2,
            explanation: "ב-GitOps, כל שינוי צריך לעבור דרך Git.\ngit revert יוצר commit חדש שמבטל את השינוי, ו-ArgoCD יסנכרן אוטומטית.\n`kubectl rollout undo` ו-ArgoCD Rollback עובדים, אבל יוצרים drift מ-Git.\nהמטרה היא לשמור על Git כ-source of truth.",
          },
          {
            q: "ArgoCD Application מוגדר עם:\n\n```\nsource:\n  repoURL: https://github.com/org/app\n  targetRevision: main\n  path: deploy/production\n```\n\nמאיפה ArgoCD יקרא את ה-manifests?",
            options: [
              "מתוך תיקיית deploy/production ב-branch main של ה-repo",
              "מתוך root של ה-repo ב-branch production",
              "מתוך כל התיקיות ב-repo ב-branch main",
              "מתוך deploy/production ב-latest tag של ה-repo",
            ],
            answer: 0,
            explanation: "repoURL - כתובת ה-Git repository.\ntargetRevision: main - ה-branch שממנו לקרוא.\npath: deploy/production - התיקייה הספציפית שמכילה את ה-manifests.\nArgoCD יקרא רק manifests מתוך הנתיב הזה ב-branch main.",
          },
          {
            q: "מהנדס רואה שאפליקציה ב-ArgoCD מסומנת Synced אבל Degraded.\n\nמה הסיבה הסבירה?",
            options: [
              "ה-manifests ב-Git לא תקינים",
              "ה-manifests הוחלו בהצלחה אבל ה-Pods נכשלים ב-runtime",
              "ArgoCD לא מצליח להתחבר ל-Git",
              "ה-namespace לא קיים בקלאסטר",
            ],
            answer: 1,
            explanation: "Synced = ה-manifests הוחלו בהצלחה, הקלאסטר תואם את Git.\nDegraded = יש בעיה ב-runtime, למשל Pod ב-CrashLoopBackOff או ImagePullBackOff.\nהבעיה היא לא ב-manifests עצמם אלא באפליקציה או ב-image.\nאם Git לא נגיש, ה-sync status היה Unknown, לא Synced.",
          },
          {
            q: "מפתח דוחף שינוי ל-Git.\nArgoCD מוגדר עם auto-sync ו-self-heal.\n\nמהנדס אחר עושה `kubectl edit` ומשנה משהו ידנית בקלאסטר.\n\nמה יקרה?",
            tags: ["gitops-sync"],
            options: [
              "השינוי הידני יישאר כי הוא נעשה אחרון",
              "ArgoCD יזהה את ה-drift ויחזיר את המצב למה שמוגדר ב-Git",
              "ArgoCD יציג התראה אבל לא ישנה כלום",
              "ArgoCD ייכשל כי יש conflict בין Git לקלאסטר",
            ],
            answer: 1,
            explanation: "self-heal אומר ש-ArgoCD לא רק מסנכרן כשיש שינוי ב-Git, אלא גם מתקן drift בקלאסטר.\nאם מישהו שינה משהו ידנית, ArgoCD יזהה את ההבדל ויחזיר את המצב למה שמוגדר ב-Git.\nזה מבטיח שה-Git repo נשאר ה-source of truth האמיתי.",
          },
        ],
      },
      medium: {
        theory: "ArgoCD - הגדרות מתקדמות, Helm ו-sync strategies.\n🔹 Sync Waves:\u200E שליטה בסדר שבו ArgoCD מחיל משאבים (annotations עם sync wave number)\n🔹 Sync Hooks:\u200E Pre/Post sync jobs שרצים לפני או אחרי sync (migrations, tests)\n🔹 Helm עם ArgoCD:\u200E ArgoCD יכול לרנדר Helm charts ישירות ולנהל את ה-values מ-Git\n🔹 Prune:\u200E מחיקת משאבים מהקלאסטר שכבר לא קיימים ב-Git\n🔹 Retry:\u200E הגדרת מספר ניסיונות חוזרים כש-sync נכשל\n🔹 Ignore Differences:\u200E התעלמות מ-fields ספציפיים בהשוואה (למשל replicas שמנוהלים ע\"י HPA)\n🔹 Finalizers:\u200E cascading delete כשמוחקים Application\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n    retry:\n      limit: 5\n      backoff:\n        duration: 5s\n        factor: 2\n        maxDuration: 3m\n  ignoreDifferences:\n  - group: apps\n    kind: Deployment\n    jsonPointers:\n    - /spec/replicas",
        theoryEn: "ArgoCD advanced configuration, Helm, and sync strategies.\n🔹 Sync Waves - control the order in which ArgoCD applies resources (annotations with sync wave number)\n🔹 Sync Hooks - Pre/Post sync jobs that run before or after sync (migrations, tests)\n🔹 Helm with ArgoCD - ArgoCD can render Helm charts directly and manage values from Git\n🔹 Prune - delete resources from the cluster that no longer exist in Git\n🔹 Retry - configure retry attempts when sync fails\n🔹 Ignore Differences - ignore specific fields in comparison (e.g. replicas managed by HPA)\n🔹 Finalizers - cascading delete when removing an Application\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n    retry:\n      limit: 5\n      backoff:\n        duration: 5s\n        factor: 2\n        maxDuration: 3m\n  ignoreDifferences:\n  - group: apps\n    kind: Deployment\n    jsonPointers:\n    - /spec/replicas",
        questions: [
          {
            q: "אפליקציה ב-ArgoCD מוגדרת עם auto-sync ו-prune: true.\nמפתח מחק קובץ manifest של ConfigMap מה-repo.\n\nמה יקרה?",
            options: [
              "ArgoCD יתעלם מהשינוי כי ConfigMap כבר קיים בקלאסטר",
              "ArgoCD ימחק את ה-ConfigMap מהקלאסטר כי הוא כבר לא ב-Git",
              "ArgoCD יציג אזהרה אבל לא ימחק כלום",
              "ArgoCD ייכשל ב-sync כי חסר manifest",
            ],
            answer: 1,
            explanation: "prune: true אומר ל-ArgoCD למחוק מהקלאסטר משאבים שכבר לא קיימים ב-Git.\nבלי prune, ArgoCD היה מתעלם ממשאבים שנמחקו מ-Git.\nזה חשוב להבין כי prune יכול למחוק משאבים בלי אזהרה.",
          },
          {
            q: "ArgoCD Application מוגדר עם Helm source:\n\n```yaml\nsource:\n  repoURL: https://charts.example.com\n  chart: my-app\n  targetRevision: 2.1.0\n  helm:\n    values: |\n      replicas: 3\n      image:\n        tag: v1.5\n```\n\nהמפתח רוצה לשנות את ה-image tag ל-v1.6.\n\nמה הדרך הנכונה ב-GitOps?",
            options: [
              "לשנות ב-ArgoCD UI את ה-parameter ישירות",
              "helm upgrade --set image.tag=v1.6",
              "לעדכן את ה-values ב-Git ולעשות commit",
              "kubectl set image\nעל ה-deployment",
            ],
            answer: 2,
            explanation: "ב-GitOps, כל שינוי צריך לעבור דרך Git.\nהדרך הנכונה היא לעדכן את ה-values בקובץ שנמצא ב-Git ולעשות commit.\nArgoCD ירנדר מחדש את ה-Helm chart עם ה-values החדשים ויסנכרן.\nשינוי דרך UI, `helm upgrade`, או `kubectl` עוקף את ה-GitOps flow.",
          },
          {
            q: "צוות משתמש ב-HPA שמשנה את מספר ה-replicas אוטומטית.\nArgoCD כל הזמן מציג OutOfSync כי replicas בקלאסטר שונה מ-Git.\n\nמה הפתרון?",
            options: [
              "לכבות את ה-HPA ולנהל replicas רק דרך Git",
              "להגדיר ignoreDifferences על /spec/replicas ב-Application",
              "להגדיר auto-sync כדי שתמיד יחזור ל-Git",
              "להוסיף replicas: null ל-manifests ב-Git",
            ],
            answer: 1,
            explanation: "ignoreDifferences מאפשר ל-ArgoCD להתעלם מ-fields ספציפיים בהשוואה.\nכש-HPA מנהל את replicas, צריך לומר ל-ArgoCD להתעלם מהשדה הזה:\n\n```yaml\nignoreDifferences:\n- group: apps\n  kind: Deployment\n  jsonPointers:\n  - /spec/replicas\n```\n\nauto-sync עם self-heal דווקא היה מחזיר את replicas למספר שב-Git.",
          },
          {
            q: "ב-ArgoCD, מה Sync Waves מאפשר לך לעשות?",
            options: [
              "לשלוח notifications אחרי כל sync",
              "לשלוט בסדר שבו משאבים נוצרים במהלך sync",
              "להגביל כמה syncs יכולים לרוץ במקביל",
              "לתזמן syncs לשעות ספציפיות ביום",
            ],
            answer: 1,
            explanation: "Sync Waves מאפשר לשלוט בסדר יצירת המשאבים.\nלמשל, Namespace ב-wave 0, ConfigMap ב-wave 1, Deployment ב-wave 2.\nמוגדר ע\"י annotation:\n\nargocd.argoproj.io/sync-wave: \"2\"\n\nמשאבים עם wave נמוך יותר נוצרים קודם.",
          },
          {
            q: "צוות רוצה להריץ database migration לפני כל deploy.\n\nאיזה מנגנון ב-ArgoCD מתאים?",
            options: [
              "Sync Hook מסוג PreSync",
              "Init Container ב-Pod של האפליקציה",
              "Sync Wave עם מספר גבוה",
              "Post-deploy Health Check",
            ],
            answer: 0,
            explanation: "PreSync Hook מריץ Job לפני שה-sync מתחיל להחיל שינויים.\nמתאים בדיוק ל-database migrations.\nמוגדר ע\"י annotation:\n\nargocd.argoproj.io/hook: PreSync\n\nInit Container רץ בכל Pod restart, לא רק ב-deploy.\nSync Wave שולט בסדר אבל לא ב-pre/post.",
          },
          {
            q: "ArgoCD Application נמחק מהקלאסטר.\nהמשאבים שהוא ניהל (Deployment, Service) עדיין רצים.\n\nלמה?",
            options: [
              "ה-Application הוגדר בלי finalizer של cascading delete",
              "המשאבים הוגדרו כ-immutable",
              "ArgoCD לא יכול למחוק משאבים שיש להם traffic פעיל",
              "צריך למחוק את ה-Application דרך CLI ולא דרך UI",
            ],
            answer: 0,
            explanation: "ברירת המחדל ב-ArgoCD - מחיקת Application לא מוחקת את המשאבים בקלאסטר.\nכדי לאפשר cascading delete, צריך להוסיף finalizer:\n\n```yaml\nmetadata:\n  finalizers:\n  - resources-finalizer.argocd.argoproj.io\n```\n\nבלי זה, המשאבים נשארים גם אחרי מחיקת ה-Application.",
          },
          {
            q: "מה ההבדל בין prune: true ל-selfHeal: true?",
            tags: ["gitops-reconcile"],
            options: [
              "prune מוחק משאבים שנמחקו מ-Git, selfHeal מתקן drift בקלאסטר",
              "prune מתקן drift, selfHeal מוחק משאבים ישנים",
              "prune עובד רק עם Helm, selfHeal עובד עם כל סוגי manifests",
              "prune פועל פעם ביום, selfHeal פועל בזמן אמת",
            ],
            answer: 0,
            explanation: "prune: true - כשמשאב נמחק מ-Git, ArgoCD ימחק אותו גם מהקלאסטר.\nselfHeal: true - כשמישהו משנה משהו ידנית בקלאסטר, ArgoCD יחזיר את המצב ל-Git.\nשניהם פועלים בזמן אמת כחלק מ-auto-sync.\nשניהם עובדים עם כל סוגי manifests.",
          },
          {
            q: "sync נכשל עם השגיאה:\n\n```\none or more objects failed to apply:\nnamespace \"payments\" not found\n```\n\nמה הפתרון?",
            options: [
              "ליצור את ה-namespace ידנית ב-cluster",
              "להוסיף את ה-namespace כמשאב ב-Git עם sync wave נמוך, או להפעיל CreateNamespace",
              "למחוק את ה-Application ב-ArgoCD וליצור מחדש",
              "לשנות את ה-destination namespace ל-default",
            ],
            answer: 1,
            explanation: "הפתרון הנכון ב-GitOps הוא אחד משניים:\n1. להוסיף Namespace manifest ב-Git עם sync wave 0- כדי שייווצר ראשון.\n2. להפעיל CreateNamespace=true ב-syncPolicy:\n\nsyncPolicy:\n  syncOptions:\n  - CreateNamespace=true\n\nיצירה ידנית עובדת אבל עוקפת GitOps.",
          },
        ],
      },
      hard: {
        theory: "ArgoCD - ארכיטקטורה מתקדמת, אבטחה ותפעול.\n🔹 App of Apps:\u200E דפוס שבו Application root מנהל Applications אחרים, מאפשר ניהול מרכזי\n🔹 ApplicationSet Generators:\u200E Git, Clusters, Matrix, Merge - יצירת Applications דינמית\n🔹 RBAC ב-ArgoCD:\u200E policy.csv עם roles שמגדירים הרשאות per-project\n🔹 SSO Integration:\u200E חיבור ל-OIDC providers (Dex, Okta, Azure AD)\n🔹 Resource Hooks:\u200E fine-grained control על lifecycle של משאבים\n🔹 Multi-tenancy:\u200E הפרדה בין צוותים עם AppProject, RBAC, ו-namespace isolation\n🔹 Notification Engine:\u200E triggers ו-templates לשליחת alerts על sync events\n🔹 Diffing Customization:\u200E managedFieldsManagers, server-side diff\nCODE:\n# App of Apps pattern\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: root-app\nspec:\n  source:\n    path: apps/     # directory with Application manifests\n  destination:\n    namespace: argocd\n---\n# ApplicationSet with Matrix generator\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n  - matrix:\n      generators:\n      - clusters:\n          selector:\n            matchLabels:\n              env: production\n      - git:\n          repoURL: https://github.com/org/repo\n          directories:\n          - path: apps/*",
        theoryEn: "ArgoCD advanced architecture, security, and operations.\n🔹 App of Apps - a pattern where a root Application manages other Applications for centralized control\n🔹 ApplicationSet Generators - Git, Clusters, Matrix, Merge for dynamic Application creation\n🔹 ArgoCD RBAC - policy.csv with roles defining per-project permissions\n🔹 SSO Integration - connecting to OIDC providers (Dex, Okta, Azure AD)\n🔹 Resource Hooks - fine-grained control over resource lifecycle\n🔹 Multi-tenancy - team isolation with AppProject, RBAC, and namespace isolation\n🔹 Notification Engine - triggers and templates for alerts on sync events\n🔹 Diffing Customization - managedFieldsManagers, server-side diff\nCODE:\n# App of Apps pattern\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: root-app\nspec:\n  source:\n    path: apps/     # directory with Application manifests\n  destination:\n    namespace: argocd\n---\n# ApplicationSet with Matrix generator\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n  - matrix:\n      generators:\n      - clusters:\n          selector:\n            matchLabels:\n              env: production\n      - git:\n          repoURL: https://github.com/org/repo\n          directories:\n          - path: apps/*",
        questions: [
          {
            q: "ארגון מנהל 50 microservices ב-3 environments.\nכל שירות צריך Application נפרד ב-ArgoCD.\n\nמה הגישה הטובה ביותר?",
            options: [
              "ליצור 150 Application manifests ידנית ב-Git",
              "להשתמש ב-ApplicationSet עם Matrix generator שמשלב clusters ו-Git directories",
              "ליצור script שמריץ argocd app create בלולאה",
              "להשתמש ב-Helm umbrella chart שמכיל את כל ה-Applications",
            ],
            answer: 1,
            explanation: "ApplicationSet עם Matrix generator משלב שני generators:\n- clusters: כל ה-environments (dev, staging, prod)\n- git directories: כל ה-microservices\n\nMatrix יוצר קומבינציה: 50 services x 3 environments = 150 Applications אוטומטית.\nהוספת service או environment חדש מייצרת Applications אוטומטית.",
          },
          {
            q: "צוות Platform רוצה שכל צוות יוכל לנהל רק את ה-Applications שלו.\n\nאיך מממשים multi-tenancy ב-ArgoCD?",
            tags: ["gitops-multitenancy"],
            options: [
              "ArgoCD instance נפרד לכל צוות",
              "AppProject per team עם הגבלות על repos, namespaces ו-RBAC roles",
              "Namespace per team ב-ArgoCD namespace",
              "Git branch per team עם branch protection",
            ],
            answer: 1,
            explanation: "AppProject מאפשר הגדרת הרשאות granular:\n- sourceRepos: אילו repos כל צוות יכול להשתמש\n- destinations: אילו namespaces/clusters מותרים\n- clusterResourceWhitelist: אילו cluster-level resources מותרים\n\nבשילוב עם RBAC ב-ArgoCD:\np, role:team-a, applications, *, team-a-project/*, allow\n\ninstance נפרד זה overhead מיותר.",
          },
          {
            q: "ב-App of Apps pattern, ה-root Application מנהל Applications אחרים.\nמה קורה אם מוחקים את ה-root Application עם cascading delete?",
            tags: ["gitops-app-of-apps"],
            options: [
              "רק ה-root Application נמחק, ה-child Applications נשארים",
              "ה-root וכל ה-child Applications נמחקים, אבל המשאבים שלהם נשארים בקלאסטר",
              "ה-root, כל ה-child Applications, וכל המשאבים שלהם נמחקים",
              "ArgoCD חוסם את המחיקה כי יש dependencies",
            ],
            answer: 2,
            explanation: "cascading delete עם finalizer מוחק את כל ה-hierarchy:\n1. Root Application נמחק\n2. Child Application manifests נמחקים מהקלאסטר\n3. כל child Application שגם לו יש finalizer מוחק את המשאבים שלו\n\nזה יכול להיות הרסני.\nלכן חשוב להגן על root Applications עם RBAC ולהבין את ה-cascade behavior.",
          },
          {
            q: "ArgoCD מראה diff על שדה managedFields בכל sync, למרות שאף אחד לא שינה כלום.\n\nמה הפתרון?",
            options: [
              "להגדיר ignoreDifferences עם managedFieldsManagers",
              "למחוק את ה-Application וליצור מחדש",
              "לעדכן את ArgoCD לגרסה אחרונה",
              "להעביר ל-client-side apply במקום server-side",
            ],
            answer: 0,
            explanation: "managedFields הוא metadata ש-Kubernetes מוסיף לצורך server-side apply.\nArgoCD רואה אותו כ-diff כי הוא לא קיים ב-Git.\nהפתרון:\n\n```yaml\nignoreDifferences:\n- group: \"*\"\n  kind: \"*\"\n  managedFieldsManagers:\n  - \"kube-controller-manager\"\n```\n\nאו ברמה גלובלית ב-argocd-cm ConfigMap.",
          },
          {
            q: "sync של אפליקציה גדולה נכשל עם:\n\n```\nrpc error: code = ResourceExhausted\nmessage size larger than max (4194304 vs 4194304)\n```\n\nמה הבעיה ומה הפתרון?",
            options: [
              "ה-Application manifests חורגים מ-gRPC message size limit של ArgoCD",
              "הקלאסטר אזל לו הזיכרון",
              "ה-Git repo גדול מדי ל-clone",
              "ArgoCD server צריך יותר CPU",
            ],
            answer: 0,
            explanation: "ArgoCD משתמש ב-gRPC לתקשורת פנימית.\nברירת המחדל של gRPC message size הוא 4MB.\nאפליקציות גדולות (הרבה manifests, CRDs כבדים) חורגות מהמגבלה.\n\nפתרון - להגדיל את ה-limit ב-argocd-server ו-argocd-repo-server:\n\n--max-recv-msg-size=8388608\n\nאו לפצל את האפליקציה ל-Applications קטנים יותר.",
          },
          {
            q: "צוות מגלה שאפליקציה עברה sync מוצלח, אבל ה-deployment לא השתנה בפועל.\nה-image tag לא עודכן.\n\nמה הסיבה הסבירה?",
            options: [
              "ה-image tag ב-Git וגם בקלאסטר הוא latest, ורק ה-image content השתנה",
              "ArgoCD cache לא התרענן",
              "ה-deployment הוגדר כ-immutable",
              "ה-namespace חוסם image updates",
            ],
            answer: 0,
            explanation: "אם ה-image tag ב-Git הוא latest וגם בקלאסטר הוא latest, ArgoCD רואה אותם כזהים.\nהוא לא בודק את ה-image digest, רק את ה-manifest.\nPod לא יעשה pull מחדש אם imagePullPolicy הוא IfNotPresent.\n\nפתרון: להשתמש ב-immutable tags כמו v1.2.3 או git SHA במקום latest.\nאו להגדיר \u200EimagePullPolicy: Always.",
          },
          {
            q: "ארגון רוצה לאפשר rollback מהיר ב-production בלי לחכות ל-CI pipeline.\n\nמה הדרך הנכונה ב-GitOps?",
            options: [
              "לאפשר ל-ArgoCD לעשות sync ל-Git commit ספציפי קודם דרך UI",
              "לעשות git revert ולדחוף ישירות ל-main בלי CI",
              "להכין branch מוכן עם version קודם ולעשות merge מהיר",
              "להשתמש ב-ArgoCD Rollback שמחזיר את הקלאסטר ל-state קודם",
            ],
            answer: 3,
            explanation: "ArgoCD Rollback מחזיר את הקלאסטר ל-sync state קודם מתוך ההיסטוריה.\nזה מהיר כי הוא לא דורש שינוי ב-Git.\nאבל חשוב להבין: אחרי rollback, האפליקציה תהיה OutOfSync עד שה-Git יתעדכן.\n\ngit revert הוא הפתרון ה-GitOps טהור, אבל דורש pipeline.\nב-production emergency, rollback ב-ArgoCD ואז git revert הוא הגישה המעשית.",
          },
          {
            q: "ApplicationSet עם Matrix generator:\n\n```yaml\ngenerators:\n- matrix:\n    generators:\n    - clusters:\n        selector:\n          matchLabels:\n            env: production\n    - list:\n        elements:\n        - app: payments\n          team: billing\n        - app: orders\n          team: commerce\n```\n\nכמה Applications ייווצרו אם יש 3 production clusters?",
            tags: ["gitops-appset-matrix"],
            options: [
              "3 - אחד לכל cluster",
              "2 - אחד לכל app",
              "6 - cartesian product של clusters x apps",
              "5 - סכום של clusters ו-apps",
            ],
            answer: 2,
            explanation: "ה-Matrix generator ב-ApplicationSet יוצר Cartesian product (כל הצירופים האפשריים) בין הרשימות שמוגדרות ב-generators.\nבמקרה הזה יש 3 clusters שנבחרו לפי env: production, ויש 2 אפליקציות ברשימת elements (payments ו-orders).\nApplicationSet יוצר Application עבור כל שילוב של cluster ואפליקציה.\nלכן מספר ה-Applications שייווצרו הוא:\n3 clusters × 2 apps = 6 Applications.",
          },
        ],
      },
    },
  },
];
