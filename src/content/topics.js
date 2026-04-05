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
              hint: "חשבו על איך קונטיינרים מאורגנים ורצים יחד.",
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
              hint: "חשבו על מי אחראי לשמור על מספר העותקים הרצוי.",
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
              hint: "חשבו על מה קורה כשקונטיינר מפסיק להגיב.",
              answer: 1,
              explanation:
                "Liveness probe הוא בדיקת בריאות תקופתית על הקונטיינר.\nכשלון חוזר גורם ל-Kubernetes להניח שהקונטיינר תקוע ולהפעיל אותו מחדש.\nסוגי בדיקות: HTTP GET, TCP socket, או פקודת shell (exit code 0).\n\nדוגמה להגדרת liveness probe בתוך Pod spec:\n```yaml\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 10\n```",
            },
            {
              q: "מה readiness probe עושה?",
              tags: ["readiness-traffic"],
              options: [
              "מאתחל מחדש את ה-Pod לאחר שינוי ב-ConfigMap",
              "מוחק Pods ישנים כשגרסה חדשה עוברת rolling update",
              "בודק שה-Pod מוכן לקבל traffic",
              "מגדיר את כמות הזיכרון המינימלית שהקונטיינר צריך להפעלה",
],
              hint: "חשבו על מה קובע אם Pod מוכן לקבל בקשות.",
              answer: 2,
              explanation:
                "Readiness probe בודק האם הקונטיינר מוכן לקבל תעבורה.\nאם הבדיקה נכשלת, ה-Pod מוסר מרשימת ה-endpoints של ה-Service ולא מקבל traffic.\nכאשר הבדיקה מצליחה שוב, ה-Pod נוסף חזרה לרשימה ומתחיל לקבל traffic.\nבניגוד ל-liveness probe, שמאתחל קונטיינר תקוע,\nreadiness probe רק קובע אם להפנות אליו traffic או לא.",
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
              hint: "חשבו על מה קורה כשקונטיינר רגיל (לא Job) מפסיק לפעול.",
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
              hint: "חשבו על ההבדל בין משימה חד-פעמית למשימה חוזרת.",
              answer: 0,
              explanation:
                "Job מריץ משימה חד-פעמית עד להשלמתה (run-to-completion).\nCronJob יוצר Jobs באופן אוטומטי לפי לוח זמנים (cron schedule).\nJob יוצר Pod אחד או יותר שמריצים משימה ומסתיימים כשהמשימה הושלמה.\n\u200FCronJob\u200F פועל כמו \u200Fscheduler\u200F שמפעיל \u200FJob\u200F חדש בכל זמן שהוגדר.\nבמקרה של כשל, Job יכול ליצור Pod חדש ולנסות שוב לפי backoffLimit.",
            },
            {
              q: "מה resource requests ב-Pod?",
              options: [
              "כמות ה-CPU וה-Memory שה-Pod מבקש כדי שה-Scheduler ימצא Node מתאים",
              "רשימת הפורטים שה-Pod חושף כדי שה-Service יוכל לנתב אליו",
              "מגבלת קצב הרשת שה-CNI plugin מקצה לכל Pod בזמן יצירה",
              "גודל ה-container image שה-kubelet מוריד מה-registry לפני הפעלה",
],
              hint: "חשבו על איך ה-Scheduler מחליט היכן למקם Pod.",
              answer: 0,
              explanation:
                "`requests` מגדיר את כמות ה-CPU/Memory המינימלית שה-Pod צריך כדי לרוץ.\nה-Scheduler בודק את הערכים האלה כדי לבחור Node עם מספיק משאבים פנויים.\nהקונטיינר יכול לצרוך יותר מה-`requests`, אבל לא מעבר ל-`limits`.\n\n```yaml\nresources:\n  requests:\n    cpu: 250m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\n```\n\nבדוגמת YAML הזו ה-Pod מבקש לפחות \u200F250m CPU\u200F ו-\u200F128Mi\u200F זיכרון, ומוגבל לכל היותר ל-\u200F500m CPU\u200F ו-\u200F256Mi\u200F זיכרון.",
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
              hint: "חשבו על איך מפרידים בין סביבות וצוותים.",
              answer: 3,
              explanation:
                "Namespace הוא מנגנון ב-Kubernetes שמאפשר חלוקה לוגית של משאבים בתוך אותו Cluster.\nהוא משמש להפרדה בין סביבות שונות (כמו dev, staging, prod), בין צוותים או בין אפליקציות.\nמשאבים כמו Pods, Services ו-ConfigMaps שייכים ל-Namespace מסוים.\nניתן גם להגדיר ResourceQuota ו-LimitRange כדי להגביל שימוש במשאבים בתוך Namespace.",
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
              hint: "Think about how containers are grouped and run together.",
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
              hint: "Think about what ensures the desired number of copies keeps running.",
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
              hint: "Think about what happens when a container becomes unresponsive.",
              answer: 1,
              explanation:
                "A liveness probe is a periodic health check Kubernetes runs on each container.\nRepeated failures → Kubernetes kills and restarts the stuck container.\nProbe types: HTTP GET, TCP socket, or shell command (exit code 0).\n\nExample liveness probe definition inside a Pod spec:\n```yaml\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 10\n```",
            },
            {
              q: "What does a readiness probe do?",
              tags: ["readiness-traffic"],
              options: [
              "Reinitialises the Pod after a ConfigMap change",
              "Sets the minimum memory the container needs before it can start",
              "Checks the Pod is ready to receive traffic",
              "Removes old Pods when a new version rolls out",
],
              hint: "Think about what happens after a container stops.",
              answer: 2,
              explanation:
                "Readiness probe checks whether the container is ready to receive traffic.\nIf the probe fails, the Pod is removed from the Service endpoints and stops receiving traffic.\nWhen the probe succeeds again, the Pod is added back and resumes receiving traffic.\nUnlike a liveness probe, which restarts a stuck container,\na readiness probe only controls whether traffic is routed to the Pod.",
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
              hint: "Think about what happens when a regular container (not a Job) stops.",
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
              hint: "Think about one-time tasks vs. recurring schedules.",
              answer: 1,
              explanation:
                "Job runs a one-time task until it completes (run-to-completion).\nCronJob automatically creates Jobs based on a schedule (cron schedule).\nA Job creates one or more Pods that run a task and exit when the task is completed.\nA CronJob acts as a scheduler that triggers a new Job at each scheduled time.\nIf a failure occurs, a Job can create a new Pod and retry the task according to the backoffLimit.",
            },
            {
              q: "What are resource requests in a Pod?",
              options: [
              "The amount of CPU and Memory the Pod requests so the Scheduler can find a suitable Node",
              "The list of ports the Pod exposes so the Service can route traffic to it",
              "The network rate limit the CNI plugin assigns to each Pod during creation",
              "The size of the container image the kubelet downloads from the registry before startup",
],
              hint: "Think about how the Scheduler decides where to place a Pod.",
              answer: 0,
              explanation:
                "`requests` defines how much CPU and Memory the Pod asks for.\nThe Scheduler uses these values to find a Node with enough resources.\n`requests` is a scheduling hint. Containers can burst above it, up to `limits`.\n\n```yaml\nresources:\n  requests:\n    cpu: 250m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\n```\n\nThe Pod requests at least 250m CPU and 128Mi memory, and is capped at 500m CPU and 256Mi.",
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
              hint: "Think about how environments and teams are separated.",
              answer: 3,
              explanation:
                "A Namespace in Kubernetes provides a logical separation of resources within the same cluster.\nIt is commonly used to separate environments (such as dev, staging, prod), teams, or applications.\nResources like Pods, Services, and ConfigMaps belong to a specific Namespace.\nYou can also define ResourceQuota and LimitRange to control resource usage within a Namespace.",
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
              "מגדיל את מספר ה-Pods שמחוברים ל-Service בזמן עדכון",
              "מאפשר חזרה לגרסה קודמת מבלי לשמור revision history",
              "מחליף Pods בהדרגה כדי לשמור על זמינות השירות",
              "מעדכן את כל ה-Pods לגרסה החדשה באותו רגע",
],
              hint: "חשבו על איך מעדכנים בלי להפיל את השירות.",
              answer: 2,
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
              hint: "חשבו על איך חוזרים לגרסה קודמת של Deployment.",
              answer: 1,
              explanation:
                "הפקודה:\nkubectl rollout undo deployment/my-app\n\nמחזירה את ה-Deployment ל-revision הקודם.\nקוברנטיס שומר היסטוריה של כל ReplicaSet, כך שהוא יודע לאיזו גרסה לחזור.\n\nלחזרה ל-revision ספציפי:\nkubectl rollout undo deployment/my-app --to-revision=3",
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
              hint: "חשבו על מה משתנה בין Pods רגילים לבין Pods שצריכים לשמור מידע.",
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
              hint: "חשבו על הגנה על זמינות בזמן תחזוקה.",
              answer: 0,
              explanation:
                "\u200FPodDisruptionBudget (PDB)\u200F מגדיר את מספר ה-Pods המינימלי שחייב להישאר זמין בזמן \u200Fdisruptions\u200F מתוכננות, כמו \u200F`kubectl drain`\u200F.\nדוגמה: עם \u2066replicas: 3\u2069 ו-\u2066minAvailable: 2\u2069, קוברנטיס יאשר פינוי רק אם לפחות 2 Pods נשארים זמינים.\nמגן על זמינות אפליקציות קריטיות בזמן \u200Fmaintenance\u200F.",
            },
            {
              q: "מה מגדירים resource limits ב-Kubernetes?",
              options: [
              "כמות משאבים מקסימלית שקונטיינר רשאי להשתמש בהם בזמן ריצה",
              "כמות משאבים מינימלית שה-Scheduler מבטיח לפני תזמון Pod",
              "מגבלת ports נכנסים שה-Service מאפשר ל-Pod",
              "גודל container image מקסימלי שמותר לשמור ב-Node",
],
              hint: "חשבו על מה קורה כשקונטיינר חורג ממגבלת המשאבים.",
              answer: 0,
              explanation:
                "\u200FResource limits\u200F מגדירים את כמות המשאבים המקסימלית שקונטיינר יכול להשתמש בה.\nחריגה מ-\u200Fmemory limit\u200F תגרום ל-\u200FOOMKill (exit code 137)\u200F, בעוד חריגה מ-\u200FCPU limit\u200F גורמת ל-\u200FCPU throttling\u200F בלבד.\n\u2066Requests vs Limits\u2069:\n• \u200Frequests\u200F \u2013 המשאבים המינימליים שה-\u200FScheduler\u200F משתמש בהם כדי לתזמן Pod על Node.\n• \u200Flimits\u200F \u2013 התקרה המקסימלית לשימוש במשאבים בזמן ריצה.\nדוגמה:\n```yaml\nresources:\n  requests:\n    cpu: \"200m\"\n    memory: \"256Mi\"\n  limits:\n    cpu: \"1\"\n    memory: \"512Mi\"\n```\nבמקרה זה ה-\u200FScheduler\u200F מתזמן את ה-Pod לפי \u200Frequests\u200F,\nאך הקונטיינר לא יוכל להשתמש ביותר מה-\u200Flimits\u200F בזמן ריצה.",
            },
            {
              q: "מה עושים taints ו-tolerations ב-Kubernetes?",
              tags: ["taints-tolerations"],
              options: [
              "מגדירים כללי RBAC שמגבילים גישה של ServiceAccounts ל-Nodes מסוימים",
              "קובעים סדר עדיפויות scheduling בין Pods שמתחרים על משאבים זהים",
              "שולטים אילו Pods יכולים לרוץ על Nodes מסוימים לפי taint ו-toleration",
              "מגבילים תעבורת רשת נכנסת ויוצאת בין Pods שונים בתוך ה-Cluster",
],
              hint: "חשבו על איך Node מסוים מונע מ-Pods לרוץ עליו.",
              answer: 2,
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
              hint: "חשבו על סדר העדיפויות כשמשאבים אוזלים.",
              answer: 0,
              explanation:
                "\u2066QoS (Quality of Service)\u2069 קובע את סדר ה-\u2066eviction\u2069 של Pods כאשר ה-Node חווה לחץ משאבים.\nה-\u2066QoS\u2069 נקבע לפי \u2066requests\u2069 ו-\u2066limits\u2069 של הקונטיינרים:\n• \u2066Guaranteed\u2069 \u2013 מוגדרים \u2066requests\u2069 ו-\u2066limits\u2069 ולכולם \u2066requests = limits\u2069\n• \u2066Burstable\u2069 \u2013 מוגדרים \u2066requests\u2069 או \u2066limits\u2069 אבל לא לכולם \u2066requests = limits\u2069\n• \u2066BestEffort\u2069 \u2013 לא מוגדרים \u2066requests\u2069 או \u2066limits\u2069\nסדר \u2066eviction\u2069 בזמן לחץ זיכרון:\n\u2066BestEffort → Burstable → Guaranteed\u2069\nכלומר \u2066BestEffort\u2069 יפונה ראשון ו-\u2066Guaranteed\u2069 אחרון.",
            },
            {
              q: "מה ephemeral container ב-Kubernetes?",
              options: [
              "Pod זמני שנוצר אוטומטית כש-Deployment מתזמן על Node חדש",
              "גרסה מוקטנת של Pod שמשמשת ל-batch jobs קצרים",
              "init container שמוגדר עם TTL קצוב לניקוי אוטומטי",
              "קונטיינר זמני שמוסיפים ל-Pod רץ לצורך debugging",
],
              hint: "חשבו על איך עושים debug ל-Pod שכבר רץ.",
              answer: 3,
              explanation:
                "\u200FEphemeral container\u200F הוא קונטיינר זמני שמוסיפים ל-Pod קיים לצורכי \u200Fdebugging\u200F או \u200Ftroubleshooting\u200F.\nבניגוד לקונטיינרים רגילים:\n• הוא לא מוגדר ב-\u200FPod spec\u200F המקורי\n• הוא מתווסף ל-Pod שכבר רץ\n• הוא מיועד ל-\u200Fdebugging\u200F בלבד, לא להרצת האפליקציה\n• הוא משתף את סביבת ה-Pod (כמו \u200Fnetwork\u200F ו-\u200Fnamespaces\u200F)\nכך ניתן לבדוק בעיות בתוך ה-Pod מבלי לשנות או להפעיל מחדש את הקונטיינרים הקיימים.",
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
              hint: "Think about updating without taking the service down.",
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
              hint: "Think about how to revert a Deployment to a previous version.",
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
              hint: "Think about what changes when Pods need to persist data across restarts.",
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
              hint: "Think about protecting availability during maintenance.",
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
              hint: "Think about what happens when a container exceeds its resource ceiling.",
              answer: 0,
              explanation:
                "Resource limits define the maximum amount of resources a container can use.\nExceeding the memory limit results in an OOMKill (exit code 137), while exceeding the CPU limit only causes CPU throttling.\n\nRequests vs Limits:\n• requests \u2013 the minimum resources the Scheduler uses to place a Pod on a Node.\n• limits \u2013 the maximum resources the container can use at runtime.\n\nExample:\n```yaml\nresources:\n  requests:\n    cpu: \"200m\"\n    memory: \"256Mi\"\n  limits:\n    cpu: \"1\"\n    memory: \"512Mi\"\n```\nIn this case, the Scheduler schedules the Pod based on the requests,\nbut the container cannot use more than the defined limits at runtime.",
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
              hint: "Think about how a specific Node prevents Pods from running on it.",
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
              hint: "Think about the priority order when resources run low.",
              answer: 1,
              explanation:
                "QoS (Quality of Service) determines the eviction order of Pods when a Node experiences resource pressure.\nThe QoS class is determined by the container requests and limits:\n• Guaranteed \u2013 requests and limits are set and requests = limits\n• Burstable \u2013 requests or limits are defined but not equal for all containers\n• BestEffort \u2013 no requests or limits defined\nEviction order during resource pressure:\nBestEffort \u2192 Burstable \u2192 Guaranteed\nMeaning BestEffort Pods are evicted first and Guaranteed last.",
            },
            {
              q: "What is an ephemeral container in Kubernetes?",
              options: [
              "A temporary Pod automatically created when a Deployment targets a new Node",
              "A stripped-down Pod variant used for short-lived batch jobs",
              "An init container configured with a TTL for automatic cleanup",
              "A temporary container added to a running Pod for debugging",
],
              hint: "Think about how to debug a running Pod without restarting it.",
              answer: 3,
              explanation:
                "An ephemeral container is a temporary container that is added to an existing Pod for debugging or troubleshooting purposes.\nUnlike regular containers:\n• It is not defined in the original Pod spec\n• It is added to an already running Pod\n• It is intended for debugging only, not for running the application\n• It shares the Pod environment (such as network and namespaces)\nThis allows you to test problems within the Pod without changing or restarting the existing containers.",
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
              "DaemonSet מבטיח ש-Pod אחד רץ על כל Node בקלסטר",
              "שה-Pod רץ רק על Node שמסומן עם label מתאים דרך nodeSelector",
              "שה-Pod מופעל מחדש לפי לוח זמנים קבוע. התנהגות של CronJob",
],
              hint: "חשבו על עומסים שצריכים לרוץ על כל Node בקלאסטר.",
              answer: 1,
              explanation:
                "DaemonSet מבטיח ש-Pod אחד רץ על כל Node בקלסטר.\nכש-Node חדש מצטרף, Pod נוסף אוטומטית. כש-Pod נכשל, הוא מופעל מחדש.\nשימושי ל-logging (Fluentd), monitoring (node-exporter), ו-CNI plugins.",
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
              hint: "חשבו על מה מודד את העומס ומחליט מתי להרחיב.",
              answer: 0,
              explanation:
                "HPA (Horizontal Pod Autoscaler) משנה מספר replicas אוטומטית לפי עומס.\nכשהעומס עולה, HPA מוסיף Pods. כשהעומס יורד, HPA מסיר Pods.\nההחלטה מתבססת על מטריקות כמו צריכת CPU, זיכרון, או מטריקות מותאמות אישית (custom metrics).\nדורש metrics-server מותקן ב-Cluster.",
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
              hint: "חשבו על מה קורה כשקונטיינר צורך יותר מדי זיכרון.",
              answer: 1,
              explanation:
                "\u200FOOMKilled (exit code 137)\u200F מתרחש כאשר קונטיינר צורך יותר זיכרון מהזמין לו.\nבדרך כלל זה קורה כאשר הוא חורג מ-\u200Flimits.memory\u200F, וה-\u200FLinux OOM Killer\u200F הורג את התהליך.",
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
              hint: "חשבו על פיזור עומסים למניעת נקודת כשל.",
              answer: 2,
              explanation:
                "\u200FtopologySpreadConstraints\u200F מבטיחים פיזור אחיד של Pods בין \u200Ffailure domains\u200F\nכמו Nodes או Zones, כדי לשפר זמינות ועמידות לתקלות.\nללא \u200Fconstraint\u200F כזה, ה-\u200Fscheduler\u200F עלול למקם Pods רבים באותו אזור.\nאם Node או Zone נופלים,\nפיזור נכון מבטיח שחלק מה-Pods עדיין זמינים.",
            },
            {
              q: "Pod נשאר במצב Pending.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\nFailedScheduling\n0/3 nodes available\nuntolerated taint: dedicated=gpu\n```\n\nמה הפתרון הנכון?",
              options: [
              "להעביר את ה-Pod ל-Namespace ייעודי לעבודות GPU",
              "להוסיף Node חדש ל-Cluster ללא taint",
              "להוסיף toleration מתאים ל-spec של ה-Pod שיתאים ל-taint",
              "להקטין את ה-CPU request כדי שה-Pod יתאים ל-Node קטן יותר",
],
              hint: "חשבו על מה מונע מה-Scheduler לשבץ את ה-Pod.",
              answer: 2,
              explanation:
                "השגיאה מראה שלכל ה-Nodes יש taint בשם \u200Fdedicated=gpu\u200F.\nל-Pod אין toleration שמתאים ל-taint הזה, ולכן ה-\u200Fscheduler\u200F לא יכול לתזמן אותו על אף Node.\nכדי לפתור את הבעיה צריך להוסיף ל-Pod toleration שמתאים ל-taint \u200Fdedicated=gpu\u200F, כך שה-Pod יורשה לרוץ על ה-Nodes האלה.",
            },
            {
              q: "StatefulSet עם 3 replicas רץ ב-Cluster.\nPod-0 לא במצב Ready, ו-Pod-1 נשאר במצב Pending.\n\nמה הסיבה הסבירה ביותר?",
              tags: ["statefulset-ordered"],
              options: [
              "Pod-0 לא Ready. לכן StatefulSet לא ממשיך ליצור את Pod-1",
              "ה-PVC של Pod-1 מלא ואין אפשרות להקצות לו אחסון חדש",
              "ה-imagePullSecret שגוי ומונע הורדת ה-Image עבור Pod-1",
              "ה-Namespace quota הגיע למגבלה ולא ניתן ליצור Pods חדשים",
],
              hint: "חשבו על מה מונע מה-Scheduler לשבץ את ה-Pod.",
              answer: 0,
              explanation:
                "\u200FStatefulSet\u200F יוצר Pods בסדר עוקב (\u200FOrderedReady\u200F).\nPod חדש נוצר רק לאחר שה-Pod הקודם הגיע למצב \u200FReady\u200F.\nבמקרה הזה \u200FPod-0\u200F לא \u200FReady\u200F, ולכן ה-\u200FStatefulSet\u200F לא ייצור את \u200FPod-1\u200F,\nמה שמסביר למה \u200FPod-1\u200F נשאר במצב \u200FPending\u200F.",
            },
            {
              q: "עדכון Rolling update נתקע.\n\nהרצת:\n\n```\nkubectl rollout status deployment/my-app\n```\n\nפלט:\n\n```\nWaiting for rollout to finish:\n3 out of 5 new replicas have been updated\n```\n\nבנוסף, מוגדר \u2066maxUnavailable: 0\u2069\n\nמה הסיבה?",
              options: [
              "Pods החדשים לא עוברים readiness probe, ו-\u2066maxUnavailable: 0\u2069 מונע הורדת ישנים",
              "ה-TLS certificate שגוי ב-admission webhook שבודק את ה-Pod spec לפני יצירה",
              "ה-image שגוי ו-kubelet לא מצליח להוריד אותו מה-registry של ה-Cluster",
              "ה-Namespace resource quota מלא ולא ניתן ליצור Pods נוספים בכלל",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 0,
              explanation:
                "\u2066maxUnavailable: 0\u2069 אומר שלא מותר אף Pod לא זמין בזמן ה-\u2066rolling update\u2069.\nאם ה-Pods החדשים לא עוברים \u2066readiness probe\u2069,\nהם נחשבים \u2066Not Ready\u2069, ולכן קוברנטיס לא יכול להוריד את ה-Pods הישנים.\nכתוצאה מכך ה-\u2066rollout\u2069 נתקע עד שה-Pods החדשים יהפכו ל-\u2066Ready\u2069.",
            },
            {
              q: "ה-Deployment לא מנהל Pods.\n\nהרצת:\n\n```\nkubectl get pods --show-labels\n```\n\nפלט:\n\n```\napp=backend-v2\n```\n\nהגדרת Deployment:\n\n```yaml\nselector:\n  matchLabels:\n    app: backend\n```\n\nמה הבעיה?",
              options: [
              "ה-Namespace של ה-Pods שונה מה-Namespace של ה-Deployment",
              "ה-Service חסר ולכן ה-Deployment לא מזהה את ה-Pods",
              "selector לא תואם labels של Pods. 'backend' ≠ 'backend-v2'",
              "ה-image שגוי וה-Pods לא יכולים לעלות",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 2,
              explanation:
                "הבעיה היא חוסר התאמה בין ה-labels של ה-Pods לבין ה-selector של ה-Deployment.\nה-Deployment מחפש Pods עם:\n```yaml\napp: backend\n```\nאבל ה-Pods מסומנים עם:\n```\napp=backend-v2\n```\nב-Kubernetes ה-Deployment מנהל Pods רק אם ה-labels שלהם תואמים בדיוק ל-selector.\nכאן אין התאמה, ולכן ה-Deployment לא מזהה את ה-Pods ולא מנהל אותם.",
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
              hint: "Think about workloads that need to run on every Node in the cluster.",
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
              hint: "Think about what measures load and decides when to scale.",
              answer: 2,
              explanation:
                "HPA (Horizontal Pod Autoscaler) auto-scales replicas based on CPU/Memory metrics.\nLoad increases → adds Pods. Load drops → removes Pods.\nScaling decisions are based on metrics such as CPU usage, memory usage, or custom metrics.\nRequires metrics-server installed in the cluster.",
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
              hint: "Think about what happens when a container exceeds its memory limit.",
              answer: 2,
              explanation:
                "OOMKilled (exit code 137) occurs when a container consumes more memory than is available to it.\nThis usually happens when it exceeds limits.memory, and the Linux OOM Killer kills the process.",
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
              hint: "Think about spreading workloads to avoid a single point of failure.",
              answer: 1,
              explanation:
                "topologySpreadConstraints ensure an even distribution of Pods across failure domains\nsuch as Nodes or Zones, improving availability and fault tolerance.\nWithout this constraint, the scheduler may place many Pods in the same area.\nIf a Node or Zone fails,\nproper distribution ensures that some Pods remain available.",
            },
            {
              q: "A Pod remains in Pending state.\n\nCommand:\n\n```\nkubectl describe pod\n```\n\nOutput:\n\n```\nFailedScheduling\n0/3 nodes available\nuntolerated taint: dedicated=gpu\n```\n\nWhat should you add to the Pod\nso it gets scheduled?",
              options: [
              "Add a new Node to the cluster without any taints",
              "Add a matching toleration to the Pod spec for the taint",
              "Move the Pod to a Namespace dedicated to GPU workloads",
              "Reduce the CPU request so the Pod fits on a smaller Node",
],
              hint: "Think about what prevents the Scheduler from placing the Pod.",
              answer: 1,
              explanation:
                "The error indicates that all Nodes have a taint dedicated=gpu.\nThe Pod does not have a matching toleration, so the scheduler cannot place it on any Node.\nTo fix the issue, add a toleration to the Pod that matches the dedicated=gpu taint, allowing the Pod to be scheduled on those Nodes.",
            },
            {
              q: "A StatefulSet with 3 replicas is running in the cluster.\nPod-0 is not Ready, and Pod-1 remains in Pending state.\n\nWhat is the most likely reason?",
              tags: ["statefulset-ordered"],
              options: [
              "The PVC for Pod-1 is full and no additional storage can be allocated",
              "The Namespace quota has been reached and no new Pods can be created",
              "The imagePullSecret is incorrect, preventing the image pull for Pod-1",
              "Pod-0 is not Ready. StatefulSet will not create Pod-1 until Pod-0 is Ready",
],
              hint: "Think about what prevents the Scheduler from placing the Pod.",
              answer: 3,
              explanation:
                "StatefulSet creates Pods sequentially using the OrderedReady policy.\nA new Pod is created only after the previous Pod becomes Ready.\nIn this case Pod-0 is not Ready, so the StatefulSet does not create Pod-1,\nwhich explains why Pod-1 remains Pending.",
            },
            {
              q: "A rolling update is stuck.\n\nCommand:\n\n```\nkubectl rollout status deployment/my-app\n```\n\nOutput:\n\n```\nWaiting for rollout to finish:\n3 out of 5 new replicas have been updated\n```\n\nConfig: maxUnavailable: 0\n\nWhat is the cause?",
              options: [
              "An admission webhook TLS certificate is invalid and rejecting new Pod specs",
              "New Pods are failing readiness probes, and maxUnavailable:0 prevents removing old ones",
              "The Namespace quota is full and new Pods cannot be created",
              "The container image is incorrect and kubelet cannot pull it from the registry",
],
              hint: "Think about what the command does behind the scenes.",
              answer: 1,
              explanation:
                "maxUnavailable: 0 means no Pods are allowed to be unavailable during the rolling update.\nIf the new Pods fail the readiness probe,\nthey remain Not Ready, so Kubernetes cannot terminate the old Pods.\nAs a result, the rollout becomes stuck until the new Pods become Ready.",
            },
            {
              q: "A Deployment does not manage its Pods.\n\nCommand:\n\n```\nkubectl get pods --show-labels\n```\n\nOutput:\n\n```\napp=backend-v2\n```\n\nDeployment spec:\n\n```yaml\nselector:\n  matchLabels:\n    app: backend\n```\n\nWhat is wrong?",
              options: [
              "The Service is missing so the Deployment cannot discover its Pods",
              "The Pods are in a different Namespace than the Deployment",
              "The container image is wrong and Pods cannot start successfully",
              "selector doesn't match Pod labels. 'backend' ≠ 'backend-v2'",
],
              hint: "Think about what the command does behind the scenes.",
              answer: 3,
              explanation:
                "The issue is a mismatch between the Pod labels and the Deployment selector.\nThe Deployment is looking for Pods with:\n```yaml\napp: backend\n```\nBut the Pods are labeled:\n```\napp=backend-v2\n```\nIn Kubernetes, a Deployment manages Pods only if their labels match the selector exactly.\nSince the labels do not match, the Deployment does not recognize or manage those Pods.",
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
        theory: "Services מספקים כתובת IP יציבה לגישה ל-Pods.\n🔹 ClusterIP:\u200E גישה פנימית בלבד (ברירת מחדל)\n🔹 NodePort:\u200E חשיפה על port בכל Node\n🔹 LoadBalancer:\u200E IP חיצוני ב-cloud\n🔹 Service מוצא Pods לפי labels ו-selector\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n    - port: 80\n      targetPort: 8080",
        theoryEn: "Services\n🔹 Service - provides a stable IP for accessing Pods, selected by label matching.\n🔹 ClusterIP - internal-only access within the cluster (default type).\n🔹 NodePort - exposes the Service on a static port on every Node.\n🔹 LoadBalancer - provisions an external IP through the cloud provider.\nCODE:\napiVersion: v1\nkind: Service\nspec:\n  selector:\n    app: my-app\n  ports:\n    - port: 80\n      targetPort: 8080",
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
              hint: "חשבו על איך שירותים נחשפים פנימית וחיצונית.",
              answer: 2,
              explanation:
                "IP של Pod משתנה בכל פעם שהוא נוצר מחדש.\nService מספק ClusterIP קבוע ו-kube-proxy מנתב traffic ל-Pods בריאים.\nService = כתובת יציבה שנשמרת גם כש-Pods מתחלפים.",
            },
            {
              q: "איזה Service מתאים לגישה חיצונית ב-cloud?",
              tags: ["service-types"],
              options: [
              "LoadBalancer:\u200E יוצר Load Balancer ב-cloud ומקצה IP חיצוני",
              "ExternalName:\u200E ממפה ל-DNS חיצוני ומאפשר גישה דרך CNAME",
              "ClusterIP:\u200E מספק IP פנימי שנגיש מכל Node ב-Cluster",
              "NodePort:\u200E חושף port על כל Node לגישה ממחשבים חיצוניים",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 0,
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
              hint: "חשבו על איך Pods מגלים ומתחברים אחד לשני.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 0,
              explanation:
                "Service מגדיר selector עם labels, ו-Endpoints controller מוצא Pods תואמים.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n    - port: 80\n      targetPort: 8080\n```\n\nכל Pod עם label של \u200Eapp: my-app ייכנס לרשימת ה-Endpoints.\nkube-proxy מנתב traffic לאחד מה-Endpoints.",
            },
            {
              q: "מה ההבדל בין port ל-targetPort ב-Service?",
              tags: ["port-mapping"],
              options: [
              "targetPort משמש ל-HTTP בלבד, port משמש לכל הפרוטוקולים",
              "port הוא הפורט של ה-Service, targetPort הוא הפורט של הקונטיינר",
              "port הוא לתנועה חיצונית, targetPort לתנועה פנימית בין Services",
              "אין הבדל, שניהם מגדירים את הפורט שה-Service מאזין עליו",
],
              hint: "חשבו על מי מתרגם שמות שירותים לכתובות.",
              answer: 1,
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
              hint: "חשבו על איך בקשות מבחוץ מגיעות לשירות הנכון.",
              answer: 3,
              explanation:
                "CoreDNS רץ כ-Pod ומספק DNS פנימי ל-Cluster.\nכל Service מקבל שם DNS אוטומטי (service.namespace.svc.cluster.local).\nמאפשר ל-Pods למצוא Services לפי שם במקום IP.",
            },
            {
              q: "מה מטרת Ingress ב-Kubernetes?",
              tags: ["ingress-routing"],
              options: [
              "סוג Pod מיוחד שאחראי על ניהול חיבורי HTTPS",
              "storage manager שמנהל PVCs מסוג network storage",
              "ניתוב HTTP/HTTPS לפי path/hostname ל-Services שונים דרך כניסה אחת",
              "Service פנימי שמספק load balancing בין Pods ב-Namespace",
],
              hint: "חשבו על כללי allow/deny ברמת הרשת.",
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
              hint: "חשבו על כללי allow/deny ברמת הרשת.",
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
              "To encrypt traffic between Pods running in different Namespaces across the cluster",
              "A Pod's IP changes on restart; a Service gives a stable IP that routes to healthy Pods",
              "To back up Pod configuration and metadata before the Pod is deleted",
              "To reduce cloud costs by sharing one IP address across multiple Pods in the cluster",
],
              hint: "Think about how services are exposed internally vs externally.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about how Pods discover and connect to each other.",
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
              hint: "Think carefully about what each option describes.",
              answer: 0,
              explanation:
                "A Service defines a label selector. The Endpoints controller finds matching Pods.\n\n```yaml\nspec:\n  selector:\n    app: my-app\n  ports:\n    - port: 80\n      targetPort: 8080\n```\n\nEvery Pod with the label app: my-app is added to the Endpoints list.\nkube-proxy routes traffic to one of the healthy endpoints.",
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
              hint: "Think about what translates service names into addresses.",
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
              hint: "Think about how external requests reach the right service.",
              answer: 0,
              explanation:
                "CoreDNS runs as a Pod and provides internal cluster DNS.\nEvery Service automatically gets a DNS name (service.namespace.svc.cluster.local).\nEnables Pods to find Services by name instead of IP.",
            },
            {
              q: "What is the purpose of an Ingress in Kubernetes?",
              tags: ["ingress-routing"],
              options: [
              "Routes HTTP/HTTPS by path or hostname to different Services through one entry point",
              "A special Pod type responsible for managing HTTPS connections to the API server",
              "A storage manager that provisions network-attached storage for Pods",
              "An internal Service that provides load balancing between Pods within the same Namespace",
],
              hint: "Think about network-level allow/deny rules.",
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
              hint: "Think about network-level allow/deny rules.",
              answer: 3,
              explanation:
                "NetworkPolicy is a Pod-level firewall. By default, all Pods can talk to all Pods.\nControls ingress (who can reach a Pod) and egress (where a Pod can send).\nOnly works with a CNI that enforces it (Calico, Cilium). Not Flannel.",
            },
        ],
      },
      medium: {
        theory: "DNS, Ingress ו-Traffic\n🔹 \u2066Service DNS\u2069 - \u2066service.namespace.svc.cluster.local\u2069\n🔹 Ingress - ניתוב HTTP/HTTPS לפי path או hostname. דורש \u2066Ingress Controller\u2069\n🔹 TLS ב-Ingress - \u2066spec.tls\u2069 עם Secret שמכיל certificate\n🔹 \u2066Egress NetworkPolicy\u2069 - מגביל תעבורה יוצאת. חייב לפתוח port 53 ל-DNS\n🔹 \u2066externalTrafficPolicy\u2069 - Local שומר על \u2066client IP\u2069 (בלי SNAT), Cluster מפזר לכל ה-Nodes\n🔹 `Debug Service` - `kubectl get endpoints` אם ריק, ה-selector לא תואם\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  tls:\n    - hosts: [app.example.com]\n      secretName: tls-cert\n  rules:\n    - host: app.example.com",
        theoryEn: "DNS, Ingress, and Traffic Routing\n🔹 Service DNS - format: service.namespace.svc.cluster.local.\n🔹 Ingress - routes HTTP/HTTPS by path or hostname. Requires an Ingress Controller (nginx, traefik).\n🔹 TLS in Ingress - configured via spec.tls with a Secret containing the certificate.\n🔹 Egress NetworkPolicy - restricts outbound traffic. Must allow port 53 for DNS resolution.\n🔹 externalTrafficPolicy:\n  Local - preserves client IP (no SNAT)\n  Cluster - distributes to all Nodes\n🔹 Debugging Services - kubectl get endpoints. Empty = selector mismatch with Pod labels.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: Ingress\nspec:\n  tls:\n    - hosts: [app.example.com]\n      secretName: tls-cert\n  rules:\n    - host: app.example.com",
        questions: [
            {
              q: "מה ה-DNS name של service בשם api ב-namespace בשם prod?",
              options: [
              "prod.api.svc.cluster.local",
              "api.svc.prod.cluster.local",
              "api.prod.svc.cluster.local",
              "api.prod.pod.cluster.local",
],
              hint: "חשבו על תרגום שמות לכתובות בתוך ה-Cluster.",
              answer: 2,
              explanation:
                "ה-FQDN של Service ב-\u2066prod\u2069 namespace הוא:\n\u2066api.prod.svc.cluster.local\u2069.\nל-\u2066CoreDNS\u2069 יש רשומות אוטומטיות ל-\u2066ClusterIP\u2069 של כל Service, בתוך כל Namespace.\nה-\u2066DNS name\u2069 הוא הכתובת שיכולה להתעדכן בתוך כל namespace.",
            },
            {
              q: "מה היתרון של Ingress על פני LoadBalancer?",
              tags: ["ingress-vs-lb"],
              options: [
              "מהיר יותר כי הוא מבצע פחות hop routing בין Pods",
              "זול יותר כי הוא מחליף SSL certificates אוטומטית",
              "כניסה אחת לכל ה-services עם ניתוב לפי path או hostname",
              "יותר מאובטח כי הוא מצפין תנועה ב-mTLS בין Services",
],
              hint: "חשבו על ניתוב בקשות מבחוץ לשירותים פנימיים.",
              answer: 2,
              explanation:
                "\u2066Ingress\u2069 מספק נקודת כניסה אחת ליישומים עם \u2066load balancing\u2069 בין Services.\nהוא מחבר \u2066host/path\u2069 ל-Service שמפנה ל-Pod.\nבמקום שכל Service ידרוש \u2066Load Balancer\u2069 נפרד, \u2066Ingress\u2069 מפחית את הצורך ב-LBs נפרדים.\nהוא גם תומך ב-\u2066TLS termination\u2069 וב-routing לפי \u2066host/path\u2069 למספר Services.",
            },
            {
              q: "כיצד מגדירים TLS ב-Ingress?",
              options: [
              "דרך Service מסוג ClusterIP שמגדיר TLS termination פנימי",
              "דרך NodePort שמגדיר TLS certificate ל-port ספציפי",
              "דרך ConfigMap שמכיל את ה-certificate ומוסיפים אותו ל-Ingress annotations",
              "דרך Secret מסוג TLS וציון שמות hosts ב-Ingress",
],
              hint: "חשבו על איך בקשות מבחוץ מגיעות לשירות הנכון.",
              answer: 3,
              explanation:
                "מגדירים Secret מסוג kubernetes.io/tls עם tls.crt ו-tls.key.\nמפנים ל-Secret ב-spec.tls של ה-Ingress עם שמות ה-hosts.\nה-Ingress Controller מבצע TLS termination אוטומטית.\n\nדוגמה:\n```yaml\nspec:\n  tls:\n    - hosts:\n        - app.example.com\n      secretName: app-tls-secret\n```",
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
              hint: "חשבו על ניתוב בקשות מבחוץ לשירותים פנימיים.",
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
              hint: "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster.",
              answer: 3,
              explanation:
                "Egress NetworkPolicy מגדיר לאילו יעדים Pod מורשה לשלוח תנועה.\nכשמגדירים `policyTypes: [Egress]`, כל תנועה יוצאת חסומה אלא אם הותרה במפורש.\nחובה לאפשר `port 53 (DNS)`, אחרת name resolution נכשל.",
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
              hint: "חשבו על ניתוב בקשות מבחוץ לשירותים פנימיים.",
              answer: 3,
              explanation:
                "Ingress מנתב בקשות לפי הערך של השדה host בתוך rules.\nכאשר מגיעה בקשה עם hostname מסוים (למשל \u2066api.example.com\u2069), ה-Ingress Controller משווה אותו ל-host המוגדר בכל rule ומנתב את הבקשה ל-Service המתאים.\nכך ניתן להשתמש ב-Ingress אחד כדי לנתב מספר hostnames שונים.",
            },
            {
              q: "נניח שיש לך Service ב-Kubernetes עם ההגדרה הבאה:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nמה ההבדל בין `externalTrafficPolicy: Local` לבין `externalTrafficPolicy: Cluster`",
              tags: ["traffic-policy"],
              options: [
              "Cluster מפזר עומס שווה בין כל ה-Pods; Local שולח תנועה רק ל-Pod הקרוב ביותר",
              "Local דורש externalIPs מוגדרים; Cluster עובד עם כל סוגי Service כולל ClusterIP",
              "Local מעביר תנועה רק ל-Pods על אותו Node ושומר client IP; Cluster מעביר לכל Pod ומבצע SNAT",
              "Local שומר על session affinity אוטומטי; Cluster דורש הגדרת `sessionAffinity: ClientIP`",
],
              hint: "חשבו על חשיפה חיצונית עם כתובת IP ייעודית.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 0,
              explanation:
                "`kubectl get endpoints` מציג Pod IPs שה-Service מנתב אליהם.\nרשימה ריקה = בעיית selector/labels.\nבדוק `kubectl get pods --show-labels` והשווה ל-selector של ה-Service.",
            },
        ],
        questionsEn: [
            {
              q: "What is the DNS name of service 'api' in namespace 'prod'?",
              options: [
              "prod.api.svc.cluster.local",
              "api.svc.prod.cluster.local",
              "api.prod.svc.cluster.local",
              "api.prod.pod.cluster.local",
],
              hint: "Think about name-to-address translation inside the Cluster.",
              answer: 2,
              explanation:
                "The FQDN of the Service in the prod namespace is:\napi.prod.svc.cluster.local.\nCoreDNS automatically creates records for the ClusterIP of each Service within each Namespace.\nThe DNS name resolves per Namespace, so the address can vary depending on the Namespace.",
            },
            {
              q: "What is the advantage of Ingress over LoadBalancer?",
              tags: ["ingress-vs-lb"],
              options: [
              "One entry point for all services with path or hostname routing",
              "Always cheaper because it auto-renews SSL certificates at no extra cost",
              "Faster because it performs fewer routing hops between backend Pods",
              "More secure because it enforces mTLS between all backend Services",
],
              hint: "Think about routing external requests to internal services.",
              answer: 0,
              explanation:
                "Ingress provides a single entry point with load balancing between Services.\nIt maps host/path to a Service that forwards traffic to a Pod.\nInstead of requiring a Load Balancer for each Service, Ingress reduces the need for separate LBs.\nIt also supports TLS termination and routing by host/path to multiple Services.",
            },
            {
              q: "How do you configure TLS in an Ingress?",
              options: [
              "Via a ClusterIP Service that performs TLS termination internally",
              "Via a NodePort that specifies a TLS certificate for a specific port",
              "Via a ConfigMap containing the certificate, referenced in Ingress annotations",
              "Via a TLS Secret and specifying hosts in the Ingress",
],
              hint: "Think about how external requests reach the right service.",
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
              hint: "Think about how URL structure determines which backend handles a request.",
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
              hint: "Think about network-level traffic rules inside the Cluster.",
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
              hint: "Think about routing external requests to internal services.",
              answer: 3,
              explanation:
                "Ingress routes requests based on the host field defined in its rules.\nWhen a request arrives with a specific hostname (for example api.example.com), the Ingress controller matches it against the host values in the rules and routes the request to the corresponding Service.\nThis allows a single Ingress resource to route traffic for multiple hostnames.",
            },
            {
              q: "Given a Kubernetes Service with the following spec:\n```yaml\nspec:\n  type: LoadBalancer\n  externalTrafficPolicy: Local\n```\nWhat is the difference between `externalTrafficPolicy: Local` and `externalTrafficPolicy: Cluster`?",
              tags: ["traffic-policy"],
              options: [
              "Local maintains automatic session affinity; Cluster requires explicit `sessionAffinity: ClientIP`",
              "Local routes traffic to Pods on the same Node preserving client IP; Cluster forwards to any Pod with SNAT",
              "Local requires configured externalIPs; Cluster works with all Service types including ClusterIP",
              "Cluster distributes load equally across all Pods; Local sends traffic only to the nearest Pod",
],
              hint: "Think about external exposure with a dedicated IP.",
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
              hint: "Think carefully about what each option describes.",
              answer: 2,
              explanation:
                "`kubectl get endpoints` shows Pod IPs the Service routes to.\nEmpty list = selector/label mismatch.\nCompare `kubectl get pods --show-labels` with the Service selector.",
            },
        ],
      },
      hard: {
        theory: "NetworkPolicy, kube-proxy ו-debug.\n🔹 ברירת מחדל: allow-all בין כל ה-Pods\n🔹 NetworkPolicy:\u200E דורש CNI תומך (Calico, Cilium). חוסם DNS? פתח port 53 ב-egress\n🔹 ipBlock:\u200E מגביל egress ל-CIDR ספציפי (לדוגמה 0.0.0.0/0 לאינטרנט)\n🔹 `IPVS` vs `iptables` - IPVS משתמש ב-hash tables עם O(1), iptables ב-chains עם O(n)\n🔹 Labels:\u200E case-sensitive. app: App ≠ app: app = endpoints ריקים\n🔹 Service FQDN:\u200E service.namespace.svc.cluster.local (חסר .svc = כשל DNS)\n🔹 `Ingress 503` - הודעת `endpoints not found` מסמנת שה-selector של ה-Service לא תואם Pods\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  egress:\n    - ports:\n        - port: 53\n          protocol: UDP",
        theoryEn: "NetworkPolicy, kube-proxy, and Debugging\n🔹 Default - all Pods can reach all Pods (allow-all) without NetworkPolicy.\n🔹 NetworkPolicy - requires a CNI plugin (Calico, Cilium). Blocking DNS? Open port 53 in egress.\n🔹 ipBlock - restricts egress to specific CIDRs (e.g. 0.0.0.0/0 for internet access).\n🔹 IPVS vs iptables - IPVS uses hash tables (O(1) lookup), iptables uses chains (O(n)).\n🔹 Labels are case-sensitive - app: App ≠ app: app, causing empty Endpoints.\n🔹 Service FQDN - service.namespace.svc.cluster.local (missing .svc = DNS failure).\n🔹 Ingress 503 - \"endpoints not found\" means the backend Service selector doesn't match any Pods.\nCODE:\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nspec:\n  egress:\n    - ports:\n        - port: 53\n          protocol: UDP",
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
              hint: "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster.",
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
              hint: "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster.",
              answer: 2,
              explanation:
                "\u2066NetworkPolicy\u2069 הוא מנגנון לניהול גישה בין Pods בקוברנטיס.\nכדי להפעיל אותו, יש להשתמש ב-\u2066CNI plugin\u2069 כמו \u2066Calico\u2069 או \u2066Cilium\u2069.\nה-\u2066CNI plugin\u2069 אחראי ליישם את החוקים של ה-\u2066NetworkPolicy\u2069 ולשלוט על הגישה בין Pods.\nאם אין \u2066CNI plugin\u2069 מותקן, לא ניתן להשתמש ב-\u2066NetworkPolicy\u2069.",
            },
            {
              q: "מה היתרון של IPVS על iptables ב-kube-proxy?",
              tags: ["ipvs-vs-iptables"],
              options: [
              "יותר מאובטח כי הוא מצפין את כל התנועה ברמת kernel",
              "זול יותר כי הוא דורש פחות משאבי CPU מ-Node",
              "ביצועים טובים יותר ב-Cluster גדול עם Hashing",
              "פשוט יותר להגדרה ולא דורש קונפיגורציה ב-kube-proxy",
],
              hint: "חשבו על ביצועים של load balancing ב-Cluster גדול.",
              answer: 2,
              explanation:
                "\u2066kube-proxy\u2069 מבצע \u2066load balancing\u2069 בין Pods באמצעות \u2066iptables\u2069 או \u2066IPVS\u2069.\n\u2066iptables\u2069 פשוט יותר, בעוד \u2066IPVS\u2069 מציע \u2066load balancing\u2069 מתקדם יותר עם ביצועים טובים יותר.\n\u2066Hashing\u2069 ב-\u2066IPVS\u2069 מאזן את העומס בין Pods ומפחית את העומס על כל Pod.",
            },
            {
              q: "נניח שיש Service בשם `app-svc`.\n\nהפקודה `kubectl get endpoints` מחזירה:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nקיים Pod עם label:\n\n```yaml\napp: App\n```\n\nוב-Service מוגדר selector:\n\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nמדוע ה-Service לא מנתב תעבורה ל-Pods?",
              options: [
              "ה-selector לא תואם. labels ב-Kubernetes הם case-sensitive",
              "ה-Pod וה-Service נמצאים ב-Namespaces שונים",
              "ה-Pod לא במצב Ready ולכן לא נכלל ב-Endpoints",
              "ה-Service port לא תואם את ה-targetPort של הקונטיינר",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 0,
              explanation:
                "Labels ב-Kubernetes הם case-sensitive.\nב-Pod מוגדר label:\n`app: App`\nאבל ה-Service מחפש Pods עם selector:\n`app: app`\nמאחר ש-App ו-app שונים, ה-Service לא מוצא Pods מתאימים ולכן לא נוצרים Endpoints.\nכדי לפתור את הבעיה צריך להתאים בין ה-labels של ה-Pod לבין ה-selector של ה-Service.",
            },
            {
              q: "NetworkPolicy חוסמת DNS.\nPods לא מצליחים לפתור שמות.\n\nהגדרה:\n\n```yaml\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n    - ports:\n        - port: 443\n```\n\nמה חסר?",
              options: [
              "ingress rule ל-port 80 (HTTP) מה-Pods",
              "TLS certificate ל-port 443 (HTTPS) מ-API server",
              "namespaceSelector ל-kube-system עבור monitoring",
              "egress rule ל-port 53 (DNS) ל-CoreDNS",
],
              hint: "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster.",
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
              hint: "חשבו על ניתוב בקשות מבחוץ לשירותים פנימיים.",
              answer: 0,
              explanation:
                "השגיאה אומרת שה-Service קיים, אבל אין לו Endpoints.\nEndpoints נוצרים כשיש Pods שה-labels שלהם תואמים ל-selector של ה-Service.\nאם אין Pods תואמים, לא נוצרים Endpoints, ולכן ה-Ingress לא יודע לאן להעביר את הבקשה ומחזיר 503 (Service Unavailable).\nבדרך כלל הסיבה היא חוסר התאמה בין ה-selector של ה-Service לבין ה-labels של ה-Pods.",
            },
            {
              q: "ה-Pod מנסה לגשת ל-Service ולא מצליח.\n\nכתובת שנוסתה:\n\n```\napi-svc.backend.cluster.local\n```\n\nמה ה-FQDN הנכון של Service בשם api-svc ב-Namespace backend?",
              options: [
              "api-svc.backend.svc.cluster.local",
              "api-svc.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.backend.pod.cluster.local",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 0,
              explanation:
                "ה-FQDN של ה-Service ב-namespace \u2066backend\u2069 הוא:\n\u2066api-svc.backend.svc.cluster.local\u2069\nהבעיה בשגיאה כאן היא שה-FQDN לא כולל את ה-\u2066svc\u2069 בתוך ה-namespace.\nה-FQDN המלא צריך לכלול את \u2066svc\u2069 בין שם ה-Service לבין ה-\u2066cluster.local\u2069.\nה-FQDN הנכון הוא:\n\u2066api-svc.backend.svc.cluster.local\u2069.",
            },
            {
              q: "ה-Pod לא מצליח להגיע לאינטרנט.\n\nהרצת:\n\n```\nkubectl exec -- curl https://google.com\n```\n\nתוצאה: timeout\n\nהגדרת NetworkPolicy:\n\n```yaml\nspec:\n  podSelector:\n    matchLabels:\n      app: worker\n  policyTypes: [Egress]\n  egress:\n    - to:\n        - podSelector: {}\n```\n\nמה חסר?",
              options: [
              "ingress rule עם `ipBlock: {cidr: 10.0.0.0/8}` לאפשר תגובות נכנסות",
              "Service מסוג LoadBalancer עם `externalTrafficPolicy: Cluster`",
              "הגדרת `hostNetwork: true` עם `dnsPolicy: ClusterFirstWithHostNet`",
              "egress rule עם `ipBlock: {cidr: 0.0.0.0/0}` לאפשר גישה ל-IPs חיצוניים",
],
              hint: "חשבו על כללי תעבורה ברמת הרשת בתוך Cluster.",
              answer: 3,
              explanation:
                "`podSelector: {}` מאפשר תנועה רק ל-Pods. IPs חיצוניים חסומים.\nלהוסיף egress rule עם `ipBlock: {cidr: 0.0.0.0/0}` + `port 53` ל-DNS.\npodSelector מכסה רק Pods בתוך ה-Cluster, לא IPs חיצוניים.",
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
              hint: "Think about network-level traffic rules inside the Cluster.",
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
              hint: "Think about network-level traffic rules inside the Cluster.",
              answer: 1,
              explanation:
                "NetworkPolicy is a mechanism for controlling access between Pods in Kubernetes.\nTo enable it, you need a CNI plugin like Calico or Cilium.\nThe CNI plugin is responsible for enforcing the NetworkPolicy rules and controlling access between Pods.\nWithout a CNI plugin, NetworkPolicy cannot be used.",
            },
            {
              q: "What is the advantage of IPVS over iptables in kube-proxy?",
              tags: ["ipvs-vs-iptables"],
              options: [
              "Cheaper because it requires less CPU from Nodes to maintain rules",
              "Simpler to configure and requires no extra kube-proxy configuration",
              "More secure because it encrypts all traffic at the kernel level",
              "Better performance in large clusters using hashing",
],
              hint: "Think about load balancing performance in large clusters.",
              answer: 3,
              explanation:
                "kube-proxy performs load balancing between Pods using iptables or IPVS.\niptables is simpler, while IPVS offers more advanced load balancing with better performance.\nHashing in IPVS balances traffic across Pods, reducing load on each Pod.",
            },
            {
              q: "Given a Service named `app-svc`.\n\nRunning `kubectl get endpoints` returns:\n\n```\nNAME      ENDPOINTS\napp-svc   <none>\n```\n\nThe Pod has this label:\n\n```yaml\napp: App\n```\n\nThe Service selector is:\n\n```yaml\nspec:\n  selector:\n    app: app\n```\n\nWhy is the Service not routing traffic to the Pods?",
              options: [
              "The selector does not match. Labels in Kubernetes are case-sensitive",
              "The Pod and Service are in different Namespaces",
              "The Pod is not Ready and therefore excluded from Endpoints",
              "The Service port does not match the container's targetPort",
],
              hint: "Think about what the command does behind the scenes.",
              answer: 0,
              explanation:
                "Kubernetes labels are case-sensitive.\nThe Pod has the label:\n`app: App`\nBut the Service selector looks for:\n`app: app`\nSince App and app are different values, the Service cannot match any Pods and therefore no Endpoints are created.\nTo fix the issue, the Pod labels and the Service selector must match exactly.",
            },
            {
              q: "A NetworkPolicy blocks DNS.\nPods cannot resolve names.\n\nPolicy:\n\n```yaml\nspec:\n  podSelector: {}\n  policyTypes: [Egress]\n  egress:\n    - ports:\n        - port: 443\n```\n\nWhat is missing?",
              options: [
              "A TLS certificate for port 443 (HTTPS) from API server",
              "A namespaceSelector for kube-system to allow monitoring",
              "An egress rule for port 53 (DNS) to CoreDNS",
              "An ingress rule for port 80 (HTTP) from other Pods",
],
              hint: "Think about network-level traffic rules inside the Cluster.",
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
              hint: "Think about routing external requests to internal services.",
              answer: 0,
              explanation:
                "The error means the Service exists, but it has no Endpoints.\nEndpoints are created when Pods have labels that match the Service selector.\nIf no Pods match, no Endpoints are created, so the Ingress has nowhere to route the request and returns 503 (Service Unavailable).\nThe most common cause is a mismatch between the Service selector and the Pod labels.",
            },
            {
              q: "A Pod tries to access a Service and fails.\n\nAddress tried:\n\n```\napi-svc.backend.cluster.local\n```\n\nWhat is the correct FQDN for Service api-svc in Namespace backend?",
              options: [
              "api-svc.backend.svc.cluster.local",
              "api-svc.svc.cluster.local",
              "api-svc.backend.cluster.local",
              "api-svc.backend.pod.cluster.local",
],
              hint: "Think carefully about what each option describes.",
              answer: 0,
              explanation:
                "The FQDN of the Service in the backend namespace is:\napi-svc.backend.svc.cluster.local\nThe issue here is that the FQDN is missing the svc between the Service name and the cluster.local.\nThe correct FQDN should be:\napi-svc.backend.svc.cluster.local.",
            },
            {
              q: "A Pod cannot reach the internet.\n\nCommand:\n\n```\nkubectl exec -- curl https://google.com\n```\n\nResult: timeout\n\nNetworkPolicy:\n\n```yaml\nspec:\n  podSelector:\n    matchLabels:\n      app: worker\n  policyTypes: [Egress]\n  egress:\n    - to:\n        - podSelector: {}\n```\n\nWhat is missing?",
              options: [
              "A LoadBalancer Service exposing port 443 in the Namespace",
              "An egress rule with `ipBlock: {cidr: 0.0.0.0/0}` to allow external IPs",
              "An ingress rule with ipBlock: {cidr: 0.0.0.0/0} to allow response traffic back",
              "Setting `hostNetwork: true` and `dnsPolicy: ClusterFirstWithHostNet` in the Pod spec",
],
              hint: "Think about network-level traffic rules inside the Cluster.",
              answer: 1,
              explanation:
                "`podSelector: {}` allows traffic only to Pods. External IPs are blocked.\nAdd egress rule with `ipBlock: {cidr: 0.0.0.0/0}` + `port 53` for DNS.\npodSelector covers only in-cluster Pods, not external IPs.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו על מאגר המידע של ה-Cluster.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "\u2066Static Pod\u2069 מנוהל ישירות על ידי ה-\u2066kubelet\u2069, ולא דרך ה-\u2066API Server\u2069 או ה-\u2066Scheduler\u2069.\nה-\u2066Static Pod\u2069 יוגדר בקובץ manifest שנמצא ב-Node.\nה-\u2066kubelet\u2069 קורא את הקובץ מתוך \u2066/etc/kubernetes/manifests\u2069 ומנהל את ה-Pod ישירות.",
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
              hint: "חשבו על מה גורם ל-Node להפסיק לקבל עומסים.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about the Cluster's data store.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think carefully about what each option describes.",
              answer: 3,
              explanation:
                "A Static Pod is managed directly by the kubelet, not via the API Server or Scheduler.\nThe Static Pod is defined in a manifest file on the Node.\nThe kubelet reads the file from /etc/kubernetes/manifests and manages the Pod directly.",
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
              hint: "Think about what causes a Node to stop accepting workloads.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו על מאגר המידע של ה-Cluster.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו על מי מנהל Static Pods ומה קורה כשה-manifest עדיין קיים.",
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
              hint: "חשבו על איך kubectl יודע לאיזה Cluster להתחבר.",
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
              hint: "חשבו על מאגר המידע של ה-Cluster.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "`kubeadm certs check-expiration` מציג את תוקף כל ה-certificates.\nכברירת מחדל, certificates של kubeadm תקפים לשנה.\nלחידוש: `kubeadm certs renew all`.",
            },
            {
              q: "מה הפקודה לשחזור etcd מ-snapshot?",
              options: [
              "kubeadm etcd restore --from /tmp/etcd-backup.db",
              "etcdctl snapshot restore /tmp/etcd-backup.db",
              "kubectl apply -f /tmp/etcd-backup.db",
              "etcdctl import --file /tmp/etcd-backup.db",
],
              hint: "חשבו על מאגר המידע של ה-Cluster.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about the Cluster's data store.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about what manages Static Pods and what happens while the manifest file exists.",
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
              hint: "Think about how kubectl knows which Cluster to connect to.",
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
              hint: "Think about the Cluster's data store.",
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
              hint: "Think carefully about what each option describes.",
              answer: 1,
              explanation:
                "`kubeadm certs check-expiration` shows the expiry of all certificates.\nBy default, kubeadm certificates are valid for one year.\nTo renew: `kubeadm certs renew all`.",
            },
            {
              q: "What is the command to restore etcd from a snapshot?",
              options: [
              "kubeadm etcd restore --from /tmp/etcd-backup.db",
              "kubectl apply -f /tmp/etcd-backup.db",
              "etcdctl snapshot restore /tmp/etcd-backup.db",
              "etcdctl import --file /tmp/etcd-backup.db",
],
              hint: "Think about the Cluster's data store.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "שדרוג Worker Node:\n1. **kubectl drain <node> --ignore-daemonsets** - פינוי Pods\n2. שדרוג kubeadm package\n3. **kubeadm upgrade node** - עדכון node config\n4. שדרוג חבילות kubelet ו-kubectl\n5. **systemctl restart kubelet**\n6. **kubectl uncordon <node>** - החזרת ה-Node לשירות",
            },
            {
              q: "הפקודה kubectl get nodes מציגה Node בסטטוס NotReady.\n\nSSH ל-Node הצליח.\n\nמה שתי הפעולות הראשונות לבדיקה?",
              tags: ["kubelet-troubleshooting"],
              options: [
              "לבדוק את סטטוס ה-kubelet ואת הלוגים שלו על ה-Node",
              "להריץ reboot ל-Node ואז kubectl uncordon להחזרתו לשירות",
              "להריץ docker ps לבדיקת containers ו-kubectl describe node לבדיקת conditions",
              "לבדוק את ה-ConfigMap של kubelet ב-kube-system ולהחיל מחדש",
],
              hint: "חשבו על מה גורם ל-Node להפסיק לקבל עומסים.",
              answer: 0,
              explanation:
                "אם ה-Node במצב \u2066NotReady\u2069, בצע את הצעדים הבאים:\nבדוק את הסטטוס של ה-\u2066kubelet\u2069:\n\u2066systemctl status kubelet\u2069\nבדוק את הלוגים של ה-\u2066kubelet\u2069:\n\u2066journalctl -u kubelet\u2069\nאם יש בעיית \u2066disk space\u2069 או \u2066container runtime\u2069, ודא שה-disk לא מלא ושה-runtime פועל כראוי.\nאם הבעיה ב-\u2066certificate expired\u2069, תקן אותה.",
            },
            {
              q: "ה-kube-scheduler לא רץ בקלסטר.\nPods חדשים נשארים במצב Pending ואין scheduling events.\n\nמה הדבר הראשון שצריך לבדוק?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "לבדוק את קובץ ה-manifest של kube-scheduler בתיקיית /etc/kubernetes/manifests/",
              "לבדוק את ה-Deployment של kube-scheduler ב-kube-system ולהריץ rollout restart",
              "לבדוק את הלוגים של kubelet עם journalctl -u kubelet לחיפוש שגיאות",
              "לבדוק את ה-ConfigMap של kube-scheduler ב-kube-system ולהחיל מחדש",
],
              hint: "חשבו על איך kube-scheduler רץ בקלסטר שהותקן עם kubeadm.",
              answer: 0,
              explanation:
                "בקלסטר שהותקן עם \u2066kubeadm\u2069, ה-\u2066kube-scheduler\u2069 רץ כ-\u2066Static Pod\u2069.\nה-\u2066kubelet\u2069 קורא את קובץ ה-manifest מ-\u2066/etc/kubernetes/manifests/kube-scheduler.yaml\u2069 ומפעיל אותו.\nאם הקובץ חסר, פגום, או מכיל שגיאת תחביר, ה-\u2066kubelet\u2069 לא יצליח להפעיל את ה-\u2066scheduler\u2069.\nלכן הצעד הראשון הוא לבדוק שהקובץ קיים ותקין.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 3,
              explanation:
                "`kubeadm token create --print-join-command` יוצר token חדש ומדפיס את פקודת ה-join המלאה.\nTokens תקפים 24 שעות כברירת מחדל.\nלרשימת tokens קיימים: `kubeadm token list`.",
            },
            {
              q: "CSR (Certificate Signing Request) חדש מופיע עם `kubectl get csr`.\n\nפלט:\n\n```\nNAME        AGE  SIGNERNAME                     REQUESTOR       CONDITION\ncsr-abc12   2m   kubernetes.io/kubelet-serving  system:node:w3  Pending\n```\n\nמה עושים?",
              tags: ["certificate-csr"],
              options: [
              "CSR מאושר אוטומטית, אין צורך בפעולה",
              "`kubeadm certs sign csr-abc12`",
              "`kubectl certificate approve csr-abc12`",
              "`kubectl delete csr csr-abc12` ויצירה מחדש",
],
              hint: "חשבו על איך kubelet מבקש אישור certificate חדש.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו על מאגר המידע של ה-Cluster.",
              answer: 1,
              explanation:
                "ההבדל בין \u2066Stacked\u2069 ל-\u2066External etcd\u2069 בקוברנטיס:\nב-\u2066Stacked etcd\u2069, ה-etcd רץ יחד עם ה-\u2066Control Plane\u2069 (Node).\nב-\u2066External etcd\u2069, ה-etcd רץ בנפרד מ-\u2066Control Plane\u2069.\n\u2066External etcd\u2069 מציע שרידות גבוהה יותר כי etcd מופרד מ-\u2066Control Plane\u2069.\nב-\u2066Stacked etcd\u2069, אם ה-Node נופל, גם ה-\u2066Control Plane\u2069 יפגע.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "Think carefully about what each option describes.",
              answer: 3,
              explanation:
                "Worker Node upgrade:\n1. **kubectl drain <node> --ignore-daemonsets** - evict Pods\n2. upgrade kubeadm package\n3. **kubeadm upgrade node** - update node config\n4. upgrade kubelet and kubectl packages\n5. **systemctl restart kubelet**\n6. **kubectl uncordon <node>** - return Node to service",
            },
            {
              q: "kubectl get nodes shows a Node in NotReady status.\n\nSSH to the Node succeeded.\n\nWhat are the first two things to check?",
              tags: ["kubelet-troubleshooting"],
              options: [
              "Check the kubelet status and its logs on the Node",
              "Reboot the Node and then run kubectl uncordon to return it to service",
              "Run docker ps to check containers and kubectl describe node to check conditions",
              "Check the kubelet ConfigMap in kube-system and reapply it",
],
              hint: "Think about what causes a Node to stop accepting workloads.",
              answer: 0,
              explanation:
                "If the Node is in NotReady, follow these steps:\nCheck the kubelet status:\nsystemctl status kubelet\nCheck the kubelet logs:\njournalctl -u kubelet\nIf there is an issue with disk space or container runtime, ensure the disk is not full and the runtime is working.\nIf the issue is an expired certificate, fix it.",
            },
            {
              q: "The kube-scheduler is not running in the cluster.\nNew Pods remain Pending with no scheduling events.\n\nWhat is the first thing to check?",
              tags: ["controlplane-troubleshooting"],
              options: [
              "Check the kube-scheduler manifest file in /etc/kubernetes/manifests/",
              "Check the Deployment of kube-scheduler in kube-system and run rollout restart",
              "Check kubelet logs with journalctl -u kubelet for scheduler errors",
              "Check the ConfigMap for kube-scheduler in kube-system and reapply",
],
              hint: "Think about how kube-scheduler runs in a kubeadm cluster.",
              answer: 0,
              explanation:
                "In a kubeadm cluster, kube-scheduler runs as a Static Pod.\nThe kubelet reads the manifest file from /etc/kubernetes/manifests/kube-scheduler.yaml and starts it.\nIf the file is missing, corrupted, or contains a syntax error, the kubelet cannot start the scheduler.\nThe first step is to verify that the file exists and is valid.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about how kubelet requests a new certificate approval.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about the Cluster's data store.",
              answer: 1,
              explanation:
                "Difference between Stacked and External etcd in Kubernetes:\nIn Stacked etcd, etcd runs on the Control Plane Node.\nIn External etcd, etcd runs separately from the Control Plane.\nExternal etcd offers higher fault tolerance as etcd is separate from the Control Plane.\nIn Stacked etcd, if the Node fails, the entire Control Plane is impacted.",
            },
            {
              q: "Command:\n\n```\nkubeadm certs check-expiration\n```\n\nOutput:\n\n```\nCERTIFICATE                EXPIRES                  RESIDUAL TIME\napiserver                  Jan 15, 2025 10:00 UTC   <invalid>\napiserver-kubelet-client   Jan 15, 2025 10:00 UTC   <invalid>\nfront-proxy-client         Jan 15, 2025 10:00 UTC   <invalid>\n```\n\nWhat is the fix?",
              tags: ["certificate-management"],
              options: [
              "Manually delete old certificates from /etc/kubernetes/pki/ directory",
              "`kubectl delete secret` for each certificate in the kube-system NS",
              "`kubeadm reset` followed by a fresh `kubeadm init` from scratch",
              "Renew certificates with `kubeadm certs renew all` and restart the Control Plane",
],
              hint: "Think carefully about what each option describes.",
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
        theory: "Config, Secrets, הרשאות ומגבלות.\n🔹 ConfigMap:\u200E הגדרות רגילות (DB_URL, timeout), env או volume\n🔹 Secret:\u200E נתונים רגישים (passwords, tokens), מקודד base64 (לא מוצפן!)\n🔹 ServiceAccount:\u200E זהות Pod בקלאסטר. default נוצר אוטומטית בכל Namespace\n🔹 RBAC:\u200E Role-Based Access Control. Role מגדיר הרשאות, RoleBinding מקשר ל-Subject\n🔹 LimitRange:\u200E מגדיר ברירות מחדל ומקסימום CPU/Memory לכל Container ב-Namespace\n🔹 securityContext:\u200E הגדרת runAsNonRoot מונעת הרצת Container כ-root\n🔹 Requests vs Limits:\u200E requests = מינימום מובטח (Scheduler), limits = תקרה (OOMKill)\nCODE:\napiVersion: v1\nkind: ConfigMap\ndata:\n  DB_URL: postgres://db:5432\n  MAX_CONN: \"100\"",
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
              hint: "חשבו על ההבדל בין מידע רגיל למידע רגיש.",
              answer: 2,
              explanation:
                "Secret – מידע רגיש (tokens, passwords, TLS keys)\nConfigMap – קונפיגורציה רגילה\nשניהם יכולים להיכנס ל-Pod דרך env vars או volumes.\nSecrets מקודדים ב-base64 אך אינם מוצפנים כברירת מחדל.",
            },
            {
              q: "האם Secrets מוצפנים לחלוטין?",
              options: [
              "תלוי בגרסת Kubernetes. מגרסה 1.25 מוצפנים אוטומטית",
              "כן, Kubernetes מצפין את כל ה-Secrets תמיד ב-AES-256 כברירת מחדל",
              "לא, רק מקודדים ב-base64 כברירת מחדל",
              "כן, עם AES-256 שמוגדר אוטומטית בעת התקנת ה-Cluster",
],
              hint: "חשבו על איך הגדרות מגיעות לתוך הקונטיינר.",
              answer: 2,
              explanation:
                "Secrets ב-Kubernetes אינם מוצפנים כברירת מחדל.\nהערכים שלהם נשמרים רק מקודדים ב-base64 בתוך ה-API וה-etcd.\nbase64 הוא encoding בלבד, לא encryption (הצפנה).\nכל מי שיש לו גישה ל-Secret יכול לבצע decode ולראות את הערך המקורי.\nלכן בפרודקשן מומלץ להוסיף שכבת אבטחה נוספת, למשל:\n• Encryption at Rest - הצפנה של ה-Secrets בתוך etcd\n• External Secret Manager - כמו AWS Secrets Manager / HashiCorp Vault / 1Password\n• Sealed Secrets - הצפנה לפני שמכניסים את ה-Secret ל-Git",
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
              hint: "חשבו על איך הגדרות מגיעות לתוך הקונטיינר.",
              answer: 3,
              explanation:
                "ConfigMap ניתן להזרקה ל-Pod בשתי דרכים:\n\u200F• Environment Variables (env / envFrom)\n\u200F• Mounted Volume Files (volumeMounts)\nאם משתמשים ב-volume, הקבצים יכולים להתעדכן כאשר ה-ConfigMap משתנה.\nלעומת זאת, כאשר משתמשים ב-environment variables, יש צורך לבצע Pod restart כדי לטעון את הערכים החדשים.",
            },
            {
              q: "נניח שנוצר Namespace חדש ב-Kubernetes.\nאיזה ServiceAccount קיים בו כברירת מחדל?",
              options: [
              "kube-proxy",
              "system:node",
              "admin",
              "default",
],
              hint: "חשבו על איך Pod מוכיח מי הוא כשהוא פונה לשירותים.",
              answer: 3,
              explanation:
                "Kubernetes יוצר אוטומטית ServiceAccount בשם default בכל Namespace.\nPods שלא מציינים serviceAccountName משתמשים בו כברירת מחדל.\nבפרודקשן נהוג ליצור ServiceAccount ייעודי עם RBAC מתאים.",
            },
            {
              q: "מה ראשי התיבות RBAC?",
              options: [
              "Resource Based Auth Configuration:\u200E מנגנון הרשאות מבוסס ענן",
              "Recursive Binding Access Control:\u200E ניהול bindings היררכיים",
              "Runtime Binary Access Control:\u200E אבטחת binaries בזמן ריצה",
              "Role Based Access Control",
],
              hint: "חשבו על חיבור בין הרשאות, תפקידים וזהויות.",
              answer: 3,
              explanation:
                "RBAC (Role Based Access Control) הוא מנגנון ההרשאות של Kubernetes.\nהוא קובע מי יכול לבצע אילו פעולות על אילו משאבים.\nRBAC מורכב משלושה חלקים:\n• Roles / ClusterRoles - מגדירים הרשאות\n• Subjects - המשתמשים או ServiceAccounts\n• Bindings - מחברים בין המשתמשים להרשאות",
            },
            {
              q: "מה LimitRange עושה ב-Namespace?",
              options: [
              "מגביל את מספר ה-Nodes ש-Pods ב-Namespace יכולים לרוץ עליהם בכלל",
              "מגביל את כמות ה-DNS queries מ-Pods ב-Namespace לשנייה",
              "מגדיר ברירות מחדל ומגבלות ל-CPU/Memory ל-Pods ו-containers ב-Namespace",
              "מנטר logs ושולח alerts כשצריכת CPU עולה על threshold שהוגדר",
],
              hint: "חשבו על מה קורה כש-Pod נוצר ללא הגדרות משאבים.",
              answer: 2,
              explanation:
                "LimitRange הוא אובייקט ב-Kubernetes שמגדיר מגבלות על משאבי CPU ו-Memory בתוך Namespace.\nהוא יכול להגדיר:\n\u200F• ערכי minimum ו-maximum למשאבים של containers או Pods\n\u200F• ערכי default requests ו-limits אם הם לא הוגדרו\nכאשר Pod נוצר, Kubernetes בודק שהוא עומד במגבלות של ה-LimitRange. אם לא, ה-Pod לא ייווצר.",
            },
            {
              q: "מה עושה ההגדרה `runAsNonRoot: true` ב-securityContext\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```",
              options: [
              "מצפינה את מערכת הקבצים של הקונטיינר",
              "מונעת מהקונטיינר לרוץ כמשתמש root (`UID 0`)",
              "מגבילה את צריכת ה-CPU של הקונטיינר לפי limits",
              "מגבילה את גישת הרשת של הקונטיינר",
],
              hint: "חשבו על הגדרות אבטחה ברמת הקונטיינר.",
              answer: 1,
              explanation:
                "ההגדרה `runAsNonRoot: true` מבטיחה שהקונטיינר לא ירוץ כמשתמש root (UID 0).\nכאשר Kubernetes יוצר את ה-container, הוא בודק את המשתמש שהקונטיינר אמור לרוץ איתו.\nאם ה-container מוגדר לרוץ כ-root, ה-Pod לא יתחיל וייכשל ביצירה.\nזהו מנגנון אבטחה שמטרתו למנוע מהרצת קונטיינרים עם הרשאות גבוהות מדי.",
            },
            {
              q: "מה ההבדל בין resource requests ל-limits?",
              tags: ["requests-vs-limits"],
              options: [
              "requests: המינימום שה-Scheduler מבטיח; limits: המקסימום שהקונטיינר יכול לצרוך",
              "requests ו-limits מגדירים את אותם ערכים ותמיד חייבים להיות שווים",
              "limits קובעים עדיפות Scheduling בין Pods; requests קובעים QoS class בלבד",
              "requests מגדירים כמות CPU ו-memory שמוקצית אוטומטית בעת יצירת ה-Node",
],
              hint: "חשבו על איך ה-Scheduler מחליט היכן למקם Pod.",
              answer: 0,
              explanation:
                "requests = המשאבים המינימליים שה-Scheduler משתמש בהם לצורך תזמון ה-Pod על Node.\nlimits = הכמות המקסימלית של CPU או Memory שה-container יכול להשתמש בה בזמן ריצה.\nNode ייבחר רק אם יש מספיק משאבים פנויים עבור ה-requests.\nחריגה מ-memory limit יכולה לגרום ל-OOMKill,\nוחריגה מ-CPU limit תגרום ל-CPU throttling.",
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
              hint: "Think about the difference between regular and sensitive data.",
              answer: 2,
              explanation:
                "Secret is for sensitive data (passwords, tokens, TLS keys), stored as base64 in etcd.\nConfigMap for regular config. Secret for sensitive data.\nBoth can be injected as env variables or volume files.",
            },
            {
              q: "Are Secrets fully encrypted by default?",
              options: [
              "No, only base64 encoded by default",
              "Yes, Kubernetes always encrypts Secrets at rest with AES-256 by default",
              "Depends on the Kubernetes version. Encrypted automatically from v1.25 onwards",
              "Yes, with AES-256 configured automatically during cluster installation",
],
              hint: "Think about how configuration gets into the container.",
              answer: 0,
              explanation:
                "Secrets in Kubernetes are not encrypted by default.\nTheir values are only encoded using Base64 when stored in the API and in etcd.\nBase64 is encoding, not encryption.\nAnyone who has access to the Secret can easily decode it and see the original value.\nFor this reason, in production environments it is recommended to add an additional security layer, for example:\n• Encryption at Rest - encrypts Secrets inside etcd\n• External Secret Manager - such as AWS Secrets Manager, HashiCorp Vault, or 1Password\n• Sealed Secrets - encrypts Secrets before committing them to Git",
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
              hint: "Think about how configuration gets into the container.",
              answer: 3,
              explanation:
                "A ConfigMap can be injected into a Pod in two main ways:\n• Environment Variables (env / envFrom)\n• Mounted Volume Files (volumeMounts)\nIf a volume is used, the files can be updated automatically when the ConfigMap changes.\nIn contrast, when using environment variables, the values are set when the Pod starts, so a Pod restart is required to load the updated values.",
            },
            {
              q: "A new Namespace is created in Kubernetes.\nWhich ServiceAccount exists in it by default?",
              options: [
              "kube-proxy",
              "system:node",
              "admin",
              "default",
],
              hint: "Think about how a Pod proves who it is when making requests.",
              answer: 3,
              explanation:
                "Kubernetes automatically creates a ServiceAccount named default in every Namespace.\nPods that do not specify serviceAccountName use it by default.\nIn production, it is recommended to create a dedicated ServiceAccount with appropriate RBAC permissions.",
            },
            {
              q: "What does RBAC stand for?",
              options: [
              "Resource Based Auth Configuration: a cloud-level permission mechanism",
              "Role Based Access Control",
              "Runtime Binary Access Control: runtime security for binaries",
              "Recursive Binding Access Control: hierarchical binding management",
],
              hint: "Think about linking permissions, roles, and identities.",
              answer: 1,
              explanation:
                "RBAC (Role Based Access Control) is Kubernetes' authorization mechanism.\nIt defines who can perform which actions on which resources in the Kubernetes API.\nRBAC consists of three main components:\n• Roles / ClusterRoles - define permissions (e.g., get, list, create on Pods)\n• Subjects - users, groups, or service accounts\n• RoleBindings / ClusterRoleBindings - connect subjects to roles\nThis enables fine-grained access control following the principle of least privilege.",
            },
            {
              q: "What does LimitRange do in a Namespace?",
              options: [
              "Limits DNS queries from Pods within the Namespace",
              "Monitors logs and sends alerts when CPU exceeds a threshold",
              "Sets default and maximum CPU/Memory for Pods and containers in a Namespace",
              "Limits the number of Nodes that Pods in the Namespace can run on",
],
              hint: "Think about defaults and constraints for new Pods.",
              answer: 2,
              explanation:
                "LimitRange is a Kubernetes object that defines limits on CPU and Memory resources within a Namespace.\nIt can define:\n• minimum and maximum resource values for containers or Pods\n• default requests and limits if they are not specified\nWhen a Pod is created, Kubernetes checks whether it complies with the LimitRange constraints. If it does not, the Pod will not be created.",
            },
            {
              q: "What does the `runAsNonRoot: true` setting do in securityContext\n\n```yaml\nspec:\n  containers:\n    - name: app\n      securityContext:\n        runAsNonRoot: true\n```",
              options: [
              "Encrypts the container's filesystem using AES-256 at rest",
              "Prevents the container from running as root user (UID 0)",
              "Limits the container's CPU usage to the defined resource limits",
              "Restricts the container's outbound network traffic to allowed CIDRs",
],
              hint: "Think about security settings at the container level.",
              answer: 1,
              explanation:
                "Setting runAsNonRoot: true ensures that the container does not run as the root user (UID 0).\nWhen Kubernetes creates the container, it checks which user the container is configured to run as.\nIf the container is set to run as root, the Pod will fail to start.\nThis is a security mechanism designed to prevent containers from running with excessively high privileges.",
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
              hint: "Think about how the Scheduler decides where to place a Pod.",
              answer: 3,
              explanation:
                "requests = the minimum amount of CPU or Memory used by the Scheduler to decide where a Pod can run.\nlimits = the maximum amount of CPU or Memory a container is allowed to use at runtime.\nA Node will be selected only if it has enough available resources to satisfy the requests.\nExceeding the memory limit can cause an OOMKill,\nwhile exceeding the CPU limit results in CPU throttling.",
            },
        ],
      },
      medium: {
        theory: "RBAC, אבטחה ומגבלות Namespace.\n🔹 Role:\u200E הרשאות ב-Namespace אחד. ClusterRole = כלל הקלאסטר\n🔹 RoleBinding:\u200E קושר Role ל-Subject (User/ServiceAccount)\n🔹 ServiceAccount:\u200E זהות Pod בקלאסטר\n🔹 PSA:\u200E Pod Security Admission. label על Namespace אוכף restricted/baseline/privileged\n🔹 Admission Webhook:\u200E validating/mutating, רץ לפני שמירה ל-etcd\n🔹 LimitRange vs ResourceQuota:\u200E LimitRange = לכל Container, ResourceQuota = סך ה-Namespace\n🔹 seccomp:\u200E מגביל syscalls לצמצום שטח התקיפה\n🔹 External Secrets Operator:\u200E מסנכרן secrets מ-AWS/GCP/Azure דרך SecretStore\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n  - apiGroups: [\"\"]\n    resources: [\"pods\"]\n    verbs: [\"get\",\"list\",\"watch\"]",
        theoryEn: "RBAC, Security, and Namespace Limits\n🔹 Role - permissions scoped to one Namespace. ClusterRole = cluster-wide.\n🔹 RoleBinding - binds a Role to a Subject (User or ServiceAccount).\n🔹 ServiceAccount - identity for a Pod within the cluster.\n🔹 PSA - Pod Security Admission. Namespace label enforces restricted/baseline/privileged standards.\n🔹 Admission webhooks - validating/mutating hooks that run before saving to etcd.\n🔹 LimitRange vs ResourceQuota - LimitRange = per-container defaults, ResourceQuota = Namespace aggregate.\n🔹 seccomp - restricts syscalls to reduce attack surface.\n🔹 External Secrets Operator - syncs secrets from AWS/GCP/Azure via SecretStore + ExternalSecret.\nCODE:\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nrules:\n  - apiGroups: [\"\"]\n    resources: [\"pods\"]\n    verbs: [\"get\",\"list\",\"watch\"]",
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
              hint: "חשבו על ההבדל בין הרשאות ב-Namespace ספציפי לבין הרשאות ברמת כל ה-Cluster.",
              answer: 0,
              explanation:
                "Role - מגדיר הרשאות בתוך Namespace ספציפי.\nClusterRole - מגדיר הרשאות ברמת כל ה-Cluster או עבור משאבים שאינם שייכים ל-Namespace (כמו Nodes).\nניתן להעניק הרשאות ל-Users, Groups או ServiceAccounts באמצעות RoleBinding או ClusterRoleBinding.\nהבדל מרכזי:\nRole = Namespace scope\nClusterRole = Cluster scope",
            },
            {
              q: "מה תפקיד RoleBinding?",
              tags: ["rbac-binding"],
              options: [
              "שכפול הרשאות של Role אחד ל-Namespace אחר",
              "חיבור בין Role למשתמש או ServiceAccount",
              "הסלמת הרשאות של Role קיים לרמת ClusterRole",
              "הגדרת כללי RBAC חדשים בתוך ה-Namespace",
],
              hint: "חשבו על חיבור בין הרשאות לזהויות.",
              answer: 1,
              explanation:
                "RoleBinding מחבר Role ל־subject (User, Group או ServiceAccount) בתוך Namespace.\nכך המשתמש או ה-ServiceAccount מקבלים את ההרשאות שמוגדרות ב-Role.\nבלי RoleBinding, ההרשאות שמוגדרות ב-Role אינן נאכפות על אף משתמש.\nכדי לתת הרשאות ברמת ה-cluster משתמשים ב-ClusterRoleBinding.",
            },
            {
              q: "מה תפקיד ServiceAccount ב-Kubernetes?",
              options: [
              "זהות ל-Pod או תהליך בתוך ה-Cluster לאימות מול API server",
              "שם DNS פנימי שה-Service מקבל בתוך ה-Namespace",
              "token חד-פעמי שנוצר בעת Deployment חדש",
              "זהות למשתמש אנושי שמתחבר דרך kubectl",
],
              hint: "חשבו על איך Pod מוכיח מי הוא כשהוא פונה לשירותים.",
              answer: 0,
              explanation:
                "ServiceAccount הוא זהות עבור Pods שרצים ב-Kubernetes.\nהוא מאפשר ל-Pod להזדהות מול Kubernetes API server ולבצע פעולות בהתאם להרשאות שהוגדרו לו ב-RBAC.\nכאשר Pod נוצר, Kubernetes מצרף אליו token של ServiceAccount, שמאפשר ל-Pod לגשת ל-API של Kubernetes.\nלכל Namespace קיים ServiceAccount בשם default, שמשמש Pods אם לא מוגדר ServiceAccount אחר.",
            },
            {
              q: "Namespace מוגדר עם ה-label:\n`pod-security.kubernetes.io/enforce=restricted`\nמה המשמעות עבור Pods חדשים",
              options: [
              "Admission webhook שמאמת image signatures לפני deploy של Pod",
              "מנגנון מובנה שאוכף Pod Security Standards לפי labels ב-Namespace",
              "Controller שאוכף NetworkPolicy על תעבורה בין Pods בתוך Cluster",
              "Plugin שמנהל TLS certificates עבור Pods שרצים ב-Service Mesh",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 1,
              explanation:
                "Pod Security Admission אוכף Pod Security Standards על Pods חדשים.\nה-label\npod-security.kubernetes.io/enforce=restricted\nגורם ל-Kubernetes לדחות Pods שלא עומדים במדיניות restricted.\nPSA החליף את PodSecurityPolicy שהוסר ב-v1.25.",
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
              hint: "חשבו על הגבלות ברמת ה-namespace.",
              answer: 0,
              explanation:
                "Admission webhook הוא HTTP callback שה-API Server מפעיל\nכאשר resource נוצר או מתעדכן.\nMutating webhook – משנה את ה-resource.\nValidating webhook – מאשר או דוחה אותו.\nהקריאה מתבצעת לפני שה-resource נשמר ב-etcd.",
            },
            {
              q: "מה ההבדל בין LimitRange ל-ResourceQuota?",
              tags: ["limitrange-vs-quota"],
              options: [
              "LimitRange: CPU quota ל-Node. ResourceQuota: memory quota ל-Cluster",
              "LimitRange:\u200E מגבלות per-container. ResourceQuota:\u200E מגבלות כוללות ל-Namespace",
              "LimitRange:\u200E מגביל מספר Pods. ResourceQuota:\u200E מגביל מספר Nodes",
              "LimitRange:\u200E חל רק על Pods חדשים. ResourceQuota:\u200E חל רק על קיימים",
],
              hint: "חשבו על הגבלות ברמת ה-namespace.",
              answer: 1,
              explanation:
                "LimitRange מגדיר מגבלות ברמת Pod או container, כמו מינימום, מקסימום או ערכי default ל-CPU ו-Memory.\nResourceQuota מגדיר מגבלות כוללות עבור Namespace, למשל:\n\u200F• סך ה-CPU\n\u200F• סך ה-Memory\n\u200F• מספר Pods או PVCs\nכך ניתן לשלוט גם על משאבים של container בודד וגם על הצריכה הכוללת של Namespace.",
            },
            {
              q: "ב-Kubernetes ניתן להגדיר seccomp profile ב-securityContext של Pod.\n\nמה התפקיד של seccomp profile?",
              options: [
              "מגביל את כמות ה-CPU שקונטיינר יכול לצרוך בכל Node",
              "מצפין את התעבורה בין קונטיינרים באותו Pod דרך localhost",
              "מגביל את ה-syscalls שקונטיינר יכול לבצע. מצמצם attack surface",
              "מגביל את ה-DNS queries שקונטיינר יכול לשלוח ל-CoreDNS",
],
              hint: "חשבו על הגדרות אבטחה ברמת הקונטיינר.",
              answer: 2,
              explanation:
                "seccomp (Secure Computing) מגביל אילו system calls קונטיינר יכול לבצע.\n\nלמה זה חשוב?\nב-Linux יש 300+ syscalls, אבל קונטיינר ממוצע צריך רק חלק קטן מהם. חסימת השאר מצמצמת את ה-attack surface.\n\nאיך מגדירים:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault מפעיל פרופיל בסיסי שחוסם syscalls מסוכנים כמו reboot או mount.",
            },
            {
              q: "איך מושכים Secrets מ-AWS Secrets Manager לתוך Kubernetes?",
              tags: ["external-secrets"],
              options: [
              "SOPS operator - מפענח קבצי YAML מוצפנים ויוצר קוברנטיס Secrets",
              "External Secrets Operator - מסנכרן secrets מ-provider חיצוני",
              "Sealed Secrets - מצפין Secrets ושומר אותם ב-Git בצורה בטוחה",
              "Vault Agent Injector - sidecar שמזריק secrets ישירות לתוך ה-Pod",
],
              hint: "חשבו על אחסון והזרקה של מידע רגיש.",
              answer: 1,
              explanation:
                "External Secrets Operator (ESO) מאפשר למשוך secrets מ-external provider כמו AWS Secrets Manager, Vault או GCP Secret Manager.\nה-operator מסנכרן את הסוד מה-provider החיצוני אל Kubernetes Secret בתוך ה-cluster.\nכך ניתן לשמור את הסודות במערכת חיצונית, ולא ב-Git או בקובצי YAML.\nהרכיבים המרכזיים:\n\u200F• SecretStore – מגדיר את ה-provider החיצוני\n\u200F• ExternalSecret – מגדיר איזה secret למשוך\n\u200F• Kubernetes Secret – נוצר אוטומטית ב-cluster\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n    - secretKey: password\n      remoteRef:\n        key: prod/db/password\n```",
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
              hint: "Think about namespace-scoped vs cluster-wide permissions.",
              answer: 2,
              explanation:
                "Role - defines permissions within a specific Namespace.\nClusterRole - defines permissions at the cluster level or for resources that are not namespace-scoped (such as Nodes).\nPermissions are granted to Users, Groups, or ServiceAccounts using RoleBinding or ClusterRoleBinding.\nKey difference:\nRole = Namespace scope\nClusterRole = Cluster scope",
            },
            {
              q: "What is a RoleBinding?",
              tags: ["rbac-binding"],
              options: [
              "Binding a Role to a user or ServiceAccount within a Namespace",
              "Escalating a Role's permissions to ClusterRole level automatically",
              "Replicating one Role's permission set to resources in another Namespace",
              "Defining new RBAC rules and applying them cluster-wide to all Namespaces",
],
              hint: "Think about connecting permissions to identities.",
              answer: 0,
              explanation:
                "RoleBinding connects a Role to a subject (User, Group, or ServiceAccount) within a Namespace.\nThis allows the user or ServiceAccount to receive the permissions defined in the Role.\nWithout a RoleBinding, the permissions defined in the Role are not applied to any user.\nTo grant permissions at the cluster level, ClusterRoleBinding is used.",
            },
            {
              q: "What is a ServiceAccount?",
              options: [
              "A one-time token generated during a new Deployment rollout process",
              "An internal DNS name assigned to a Service within a specific Namespace",
              "An identity for a human user connecting to the cluster via kubectl",
              "An identity for a Pod/process within the Cluster to authenticate with the API server",
],
              hint: "Think about how a Pod proves who it is when making requests.",
              answer: 3,
              explanation:
                "A ServiceAccount provides an identity for Pods running in Kubernetes.\nIt allows a Pod to authenticate to the Kubernetes API server and perform actions according to the permissions granted through RBAC.\nWhen a Pod is created, Kubernetes can attach a ServiceAccount token to the Pod, which allows it to access the Kubernetes API.\nEach Namespace has a ServiceAccount named default, which is used by Pods if no other ServiceAccount is specified.",
            },
            {
              q: "Given a Namespace with the following label:\n`pod-security.kubernetes.io/enforce=restricted`\nWhat does Pod Security Admission do?",
              options: [
              "An admission webhook that validates image signatures before running Pods",
              "A built-in mechanism that enforces Pod Security Standards via Namespace labels",
              "A controller that enforces NetworkPolicy on traffic between Pods",
              "A plugin that manages TLS certificates for Pods in a Service Mesh",
],
              hint: "Think carefully about what each option describes.",
              answer: 1,
              explanation:
                "Pod Security Admission enforces Pod Security Standards on new Pods.\nThe label\npod-security.kubernetes.io/enforce=restricted\ncauses Kubernetes to reject Pods that do not comply with the restricted policy.\nPSA replaced PodSecurityPolicy, which was removed in Kubernetes v1.25.",
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
              hint: "Think about namespace-level resource restrictions.",
              answer: 2,
              explanation:
                "Admission webhook is an HTTP callback that the API Server invokes when a resource is created or updated.\nMutating webhook – modifies the resource.\nValidating webhook – approves or rejects it.\nThe call happens before the resource is stored in etcd.",
            },
            {
              q: "What is the difference between LimitRange and ResourceQuota?",
              tags: ["limitrange-vs-quota"],
              options: [
              "LimitRange sets CPU quotas per Node; ResourceQuota sets memory quotas per Cluster",
              "LimitRange sets per-container limits; ResourceQuota sets overall Namespace limits",
              "LimitRange limits the number of Pods; ResourceQuota limits the number of Nodes",
              "LimitRange applies only to new Pods; ResourceQuota applies only to existing Pods",
],
              hint: "Think about namespace-level resource restrictions.",
              answer: 1,
              explanation:
                "LimitRange defines limits at the Pod or container level, such as minimum, maximum, or default values for CPU and Memory.\nResourceQuota defines overall limits for a Namespace, for example:\n• Total CPU\n• Total Memory\n• Number of Pods or PVCs\nThis allows you to control both the resources of an individual container and the overall Namespace consumption.",
            },
            {
              q: "In Kubernetes you can set a seccomp profile in a Pod's securityContext.\n\nWhat does a seccomp profile do?",
              options: [
              "Limits the amount of CPU a container can consume on each Node",
              "Encrypts traffic between containers in the same Pod via localhost",
              "Restricts the syscalls a container can make. Reduces the attack surface",
              "Limits the DNS queries a container can send to CoreDNS",
],
              hint: "Think about security settings at the container level.",
              answer: 2,
              explanation:
                "seccomp (Secure Computing) restricts which system calls a container can make.\n\nWhy does it matter?\nLinux has 300+ syscalls, but an average container only needs a small subset. Blocking the rest reduces the attack surface.\n\nHow to configure:\n\n```yaml\nsecurityContext:\n  seccompProfile:\n    type: RuntimeDefault\n```\n\nRuntimeDefault applies a baseline profile that blocks dangerous syscalls like reboot or mount.",
            },
            {
              q: "How do you sync a Secret from AWS Secrets Manager?",
              tags: ["external-secrets"],
              options: [
              "SOPS operator: decrypts encrypted YAML files and creates K8s Secrets",
              "External Secrets Operator: syncs secrets from an external provider",
              "Sealed Secrets controller: encrypts Secrets and stores them in Git",
              "Vault Agent Injector: a sidecar that injects secrets directly into Pods",
],
              hint: "Think about storing and injecting sensitive data.",
              answer: 1,
              explanation:
                "External Secrets Operator (ESO) allows you to pull secrets from an external provider such as AWS Secrets Manager, Vault, or GCP Secret Manager.\nThe operator synchronizes the secret from the external provider to a Kubernetes Secret within the cluster.\nThis allows you to store the secrets in an external system, rather than in Git or YAML files.\nKey components:\n• SecretStore – defines the external provider\n• ExternalSecret – defines which secret to pull\n• Kubernetes Secret – automatically created in the cluster\n\n```yaml\napiVersion: external-secrets.io/v1beta1\nkind: ExternalSecret\nmetadata:\n  name: db-secret\nspec:\n  refreshInterval: 1h\n  secretStoreRef:\n    name: aws-secretstore\n    kind: SecretStore\n  target:\n    name: db-secret\n  data:\n    - secretKey: password\n      remoteRef:\n        key: prod/db/password\n```",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "כל ישות מקבלת רק את ההרשאות שהיא צריכה. לא יותר.\nלא לתת cluster-admin כשמספיק Role ב-Namespace אחד.\nאם ישות נפרצת, הרשאות מינימליות מגבילות את הנזק.",
            },
            {
              q: "מה המשמעות של Encryption at Rest בקוברנטיס",
              options: [
              "הצפנת תעבורת רשת בין Pods דרך mTLS אוטומטי",
              "הצפנת נתוני etcd ששומר secrets ו-resources על הדיסק",
              "הצפנת קבצי log שנשמרים ב-Persistent Volumes",
              "הצפנת container images ב-Registry לפני deployment",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 1,
              explanation:
                "Encryption at Rest מצפין נתונים שנשמרים ב-etcd.\nכך מידע רגיש כמו Secrets מוגן גם אם יש גישה לקבצי ה-database.\nBase64 הוא רק קידוד, לא הצפנה.\nEncryption at Rest מוסיף הצפנה אמיתית לפני השמירה.",
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
              hint: "חשבו על אחסון והזרקה של מידע רגיש.",
              answer: 3,
              explanation:
                "Sealed Secrets מאפשר לשמור Secrets מוצפנים ב-Git.\nה-Secret מוצפן לקובץ SealedSecret באמצעות המפתח הציבורי של ה-cluster.\nבתוך ה-cluster, ה-controller מפענח את ה-SealedSecret\nויוצר ממנו Kubernetes Secret רגיל.\nכך ניתן לשמור סודות ב-Git בצורה בטוחה.",
            },
            {
              q: "מה שלוש רמות Pod Security Standards?",
              options: [
              "low/medium/high",
              "none/basic/full-lockdown",
              "privileged/baseline/restricted",
              "open/limited/strict-closed",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "Pod Security Standards מגדירים שלוש רמות אבטחה ל-Pods:\nprivileged – ללא כמעט מגבלות. מאפשר יכולות מסוכנות כמו privileged containers או host access.\nbaseline – חוסם הגדרות מסוכנות מסוימות (למשל privileged containers או hostPID).\nrestricted – הרמה המחמירה ביותר עם דרישות אבטחה נוספות\nכמו runAsNonRoot, הסרת capabilities והגבלות seccomp.\nבדרך כלל restricted היא ה־best practice בסביבות production.",
            },
            {
              q: "מה תפקיד OPA/Gatekeeper ב-Kubernetes?",
              options: [
              "controller שמנהל Pod autoscaling לפי custom metrics",
              "operator שמנהל certificate lifecycle עבור Ingress resources",
              "admission controller מובנה שמאמת resource quotas לפני יצירה",
              "Open Policy Agent:\u200E מנגנון policy-as-code לאכיפת כללים בקוברנטיס",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו על איך Pod מוכיח מי הוא כשהוא פונה לשירותים.",
              answer: 2,
              explanation:
                "ל־my-sa אין הרשאה לבצע list על משאב pods ב־namespace prod, ולכן מתקבלת שגיאת RBAC.\nהפתרון הנכון הוא ליצור Role שמעניק הרשאת list על pods בתוך prod, ואז לקשור אותו ל־ServiceAccount בשם my-sa באמצעות RoleBinding.",
            },
            {
              q: "הפקודה `kubectl apply` נכשלה עם השגיאה הבאה:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nמה המשמעות של השגיאה",
              options: [
              "ה-Namespace שצוין ב-Deployment לא קיים ב-Cluster",
              "Admission webhook חסם את ה-image כי הוא לא מ-registry מאושר",
              "הרשאות RBAC חוסמות יצירת Deployment ב-Namespace",
              "ה-Kubernetes API server קרס ולא מגיב לבקשות",
],
              hint: "חשבו על מי מאשר או דוחה Pods לפני יצירה.",
              answer: 1,
              explanation:
                "השגיאה מגיעה מ-Kyverno admission webhook.\nKyverno אוכף policies על resources בזמן יצירה או עדכון.\nבמקרה הזה קיימת policy שמאפשרת להשתמש רק ב-images מ-gcr.io.\nכאשר ה-Deployment משתמש ב-image מ-registry אחר, ה-webhook דוחה את הבקשה וה-API Server מחזיר שגיאה.",
            },
            {
              q: "ה-Deployment נדחה על ידי PSA עם policy מסוג restricted.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity \"restricted:latest\":\n  allowPrivilegeEscalation != false\n```\n\nאיזה securityContext צריך להגדיר ל-container כדי לעמוד במדיניות?",
              tags: ["psa-admission"],
              options: [
              "```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```",
              "```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```",
              "```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n  runAsGroup: 1000\n```",
              "```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```",
],
              hint: "חשבו על מי מאשר או דוחה Pods לפני יצירה.",
              answer: 1,
              explanation:
                "PSA (Pod Security Admission) הוא מנגנון built-in ב-Kubernetes שאוכף מדיניות אבטחה על Pods ברמת ה-Namespace.\n\nרמת restricted דורשת שלוש הגדרות חובה:\n\u200F• allowPrivilegeEscalation: false - חוסם הסלמת הרשאות דרך setuid/setgid\n\u200F• runAsNonRoot: true - מונע הרצה כ-root (UID 0)\n\u200F• seccompProfile: RuntimeDefault - אוכף סינון syscall בסיסי",
            },
        ],
        questionsEn: [
            {
              q: "What is the Least Privilege principle?",
              options: [
              "Grant only the minimum necessary permissions for each role",
              "Use Pod Security Standards at the restricted level only",
              "Grant ClusterRole permissions to every ServiceAccount by default",
              "Block all network traffic between Namespaces by default",
],
              hint: "Think carefully about what each option describes.",
              answer: 0,
              explanation:
                "Every entity gets only the exact permissions it needs. Nothing more.\nPrefer a scoped Role in one Namespace over cluster-admin.\nIf compromised, minimal permissions limit the blast radius.",
            },
            {
              q: "What is Encryption at Rest?",
              options: [
              "Encrypting log files stored on Persistent Volumes",
              "Encrypting container images in the Registry before deployment",
              "Encrypting etcd data that stores secrets and resources on disk",
              "Encrypting network traffic between Pods via automatic mTLS",
],
              hint: "Think carefully about what each option describes.",
              answer: 2,
              explanation:
                "Encryption at Rest encrypts data stored in etcd.\nThis protects sensitive data such as Secrets even if someone gains access to the database files.\nBase64 is only encoding, not encryption.\nEncryption at Rest adds real encryption before data is written to etcd.",
            },
            {
              q: "What does Sealed Secrets allow?",
              tags: ["sealed-secrets"],
              options: [
              "Sharing encrypted Secrets between different Clusters using a shared key",
              "Encrypting network traffic between Pods using keys stored in etcd",
              "Auto-creating Kubernetes Secrets from environment variables at deploy time",
              "Storing encrypted secrets in git safely as SealedSecret resources",
],
              hint: "Think about storing and injecting sensitive data.",
              answer: 3,
              explanation:
                "Sealed Secrets allows you to store encrypted Secrets in Git.\nThe Secret is encrypted into a SealedSecret file using the cluster's public key.\nInside the cluster, the controller decrypts the SealedSecret\nand creates a regular Kubernetes Secret from it.\nThis allows you to store secrets in Git securely.",
            },
            {
              q: "What are the three Pod Security Standard levels?",
              options: [
              "low/medium/high",
              "none/basic/full-lockdown",
              "privileged/baseline/restricted",
              "open/limited/strict-closed",
],
              hint: "Think carefully about what each option describes.",
              answer: 2,
              explanation:
                "Pod Security Standards define three levels of security for Pods:\nprivileged – almost no restrictions. Allows dangerous capabilities such as privileged containers or host access.\nbaseline – blocks certain dangerous settings (such as privileged containers or hostPID).\nrestricted – the most stringent level with additional security requirements\nsuch as runAsNonRoot, removing capabilities, and seccomp restrictions.\nrestricted is generally the best practice in production environments.",
            },
            {
              q: "What is OPA/Gatekeeper?",
              options: [
              "An operator that manages certificate lifecycle for Ingress resources",
              "Open Policy Agent: policy-as-code enforcement for Kubernetes",
              "A controller that manages Pod autoscaling based on custom metrics",
              "A built-in admission controller that validates resource quotas before creation",
],
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about how a Pod proves who it is when making requests.",
              answer: 1,
              explanation:
                "my-sa lacks list pods permission in namespace prod. RBAC blocks the request.\nCreate a Role with list pods permission and a RoleBinding to my-sa.\n• Deleting SA doesn't fix missing permissions • cluster-admin is a security risk • default SA also has no permissions.\nIn RBAC, every API access requires explicit Role + RoleBinding.",
            },
            {
              q: "`kubectl apply` failed with the following error:\n\n```\nError from server: admission webhook 'validate.kyverno.svc'\ndenied the request:\nContainer image must come from 'gcr.io/'\n```\n\nWhat does this error mean",
              options: [
              "The Kubernetes API server has crashed and is not responding",
              "The Namespace specified in the Deployment does not exist in the Cluster",
              "RBAC permissions prevent creating a Deployment in this Namespace",
              "An Admission webhook blocked the image because it is not from an approved registry",
],
              hint: "Think about what approves or rejects Pods before creation.",
              answer: 3,
              explanation:
                "The error comes from the Kyverno admission webhook.\nKyverno enforces policies on resources during creation or update.\nIn this case, there is a policy that allows only images from gcr.io to be used.\nWhen the Deployment uses an image from another registry, the webhook rejects the request and the API Server returns an error.",
            },
            {
              q: "A Deployment is rejected by PSA with a restricted policy.\n\n```\nError from server (Forbidden):\nPod violates PodSecurity \"restricted:latest\":\n  allowPrivilegeEscalation != false\n```\n\nWhich securityContext must you set on the container to comply?",
              tags: ["psa-admission"],
              options: [
              "```yaml\nsecurityContext:\n  privileged: true\n  runAsUser: 0\n  capabilities:\n    add:\n      - NET_ADMIN\n```",
              "```yaml\nsecurityContext:\n  allowPrivilegeEscalation: false\n  runAsNonRoot: true\n  seccompProfile:\n    type: RuntimeDefault\n```",
              "```yaml\nsecurityContext:\n  readOnlyRootFilesystem: true\n  runAsUser: 1000\n  runAsGroup: 1000\n```",
              "```yaml\nsecurityContext:\n  capabilities:\n    drop:\n      - ALL\n  runAsGroup: 1000\n  privileged: false\n```",
],
              hint: "Think about what approves or rejects Pods before creation.",
              answer: 1,
              explanation:
                "PSA (Pod Security Admission) is a built-in Kubernetes mechanism that enforces security policies on Pods at the Namespace level.\n\nThe restricted level requires all three:\n• allowPrivilegeEscalation: false - blocks privilege escalation via setuid/setgid\n• runAsNonRoot: true - prevents running as root (UID 0)\n• seccompProfile: RuntimeDefault - enforces basic syscall filtering",
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
        theory: "Persistent Volumes ו-Helm\n🔹 \u200FPersistentVolume (PV)\u200F - משאב אחסון ברמת ה-cluster שמספק נפח אחסון בפועל.\n🔹 \u200FPersistentVolumeClaim (PVC)\u200F - בקשה לאחסון מתוך Pod או workload.\n🔹 \u200FKubernetes\u200F מחבר אוטומטית PVC ל-PV מתאים לפי storage class, access modes וגודל האחסון.\n\n🔹 \u200FHelm Chart\u200F - חבילה של manifests של Kubernetes עם templates.\nכאשר מריצים:\nCODE:\nhelm install my-app chart-name\n\n\u200FHelm יוצר Release ומיישם את כל המשאבים שמוגדרים ב-Chart.\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: app-storage\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 10Gi\n\n\u200FPVC מבקש אחסון, ו-Kubernetes מחבר אותו ל-PV מתאים.",
        theoryEn: "Persistent Volumes and Helm\n🔹 PersistentVolume (PV) - a cluster-level storage resource that provides actual storage volume.\n🔹 PersistentVolumeClaim (PVC) - a request for storage from a Pod or workload.\n🔹 Kubernetes automatically associates a PVC with an appropriate PV based on storage class, access modes, and storage size.\n\n🔹 Helm Chart - a package of Kubernetes manifests with templates.\nWhen running:\nCODE:\nhelm install my-app chart-name\n\nHelm creates a Release and applies all resources defined in the Chart.\nCODE:\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: app-storage\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 10Gi\n\nA PVC requests storage, and Kubernetes binds it to an appropriate PV.",
        questions: [
            {
              q: "מה ההבדל בין PV ל-PVC?",
              hint: "חשבו על מי מספק את האחסון ומי מבקש אותו.",
              options: [
              "PV מוגדר בתוך Pod spec; PVC מוגדר ברמת Namespace",
              "PV נוצר אוטומטית ע״י kubelet; PVC נוצר ע״י ה-Scheduler",
              "PV הוא משאב אחסון ב-Cluster; PVC הוא בקשה לאחסון מ-Pod",
              "PV הוא volume זמני שנמחק כשה-Pod נגמר; PVC הוא volume קבוע",
],
              answer: 2,
              explanation:
                "PersistentVolume (PV) הוא משאב אחסון ברמת ה-cluster שמספק נפח אחסון בפועל.\nPersistentVolumeClaim (PVC) הוא בקשה לאחסון מתוך Pod או workload.\nKubernetes מחבר אוטומטית PVC ל-PV מתאים לפי\nstorageClass, access modes וגודל האחסון.",
            },
            {
              q: "PVC מוגדר עם accessMode: ReadWriteOnce. מה המשמעות",
              hint: "חשבו כמה Nodes יכולים לגשת ל-Volume ובאיזה אופן.",
              options: [
              "קריאה וכתיבה מכל ה-Nodes במקביל",
              "קריאה וכתיבה מ-Node אחד בלבד",
              "קריאה בלבד מ-Node אחד בלבד",
              "כתיבה מ-Node אחד, קריאה מכולם",
],
              answer: 1,
              explanation:
                "ReadWriteOnce (RWO) מאפשר mount לקריאה וכתיבה מ-Node אחד בלבד.\nמספר Pods על אותו Node יכולים להשתמש ב-Volume.\nלהשוואה:\nReadWriteMany (RWX) - קריאה וכתיבה ממספר Nodes (דורש NFS/EFS).\nReadOnlyMany (ROX) - קריאה בלבד ממספר Nodes.",
            },
            {
              q: "מה תפקיד Helm Chart\u200F?",
              tags: ["helm-chart"],
              hint: "חשבו על package manager כמו apt או npm, אבל עבור Kubernetes.",
              options: [
              "שכבת רשת וירטואלית שמחברת Pods ב-Cluster דרך CNI plugin",
              "Docker image מותאם שכולל Kubernetes manifests בתוך ה-layers שלו",
              "CLI wrapper מעל kubectl שמוסיף ניהול גרסאות ל-YAML files",
              "חבילה של Kubernetes manifests עם templates וערכי ברירת מחדל",
],
              answer: 3,
              explanation:
                "Helm הוא package manager ל-Kubernetes, בדומה ל-apt או npm.\nChart הוא חבילה שמכילה templates של Kubernetes resources וקובץ values.yaml עם ערכי ברירת מחדל.\nבזמן התקנה, Helm מרנדר את ה-templates לפי ה-values ומייצר manifests סופיים שנשלחים לקלאסטר.\nבמקום לנהל עשרות קבצי YAML ידנית, מתקינים Chart אחד ומגדירים רק את מה שצריך לשנות.",
            },
            {
              q: "מה הפקודה להתקנת Helm Chart\u200F?",
              hint: "חשבו על הפעולה הבסיסית שמפעילה Chart בפעם הראשונה.",
              options: [
              "helm install",
              "helm template",
              "helm upgrade",
              "helm create",
],
              answer: 0,
              explanation:
                "`helm install` מתקין Helm Chart ויוצר Release ב-cluster.\nהפקודה מרנדרת את ה-templates ומיישמת את ה-Kubernetes manifests.\nפקודות קשורות:\n\u200F• `helm upgrade` – מעדכן Release\n\u200F• `helm template` – מייצר YAML בלבד\n\u200F• `helm create` – יוצר Chart חדש",
            },
            {
              q: "מה Volume מסוג emptyDir?",
              hint: "חשבו מה קורה לנתונים כשה-Pod נעלם מה-Node.",
              options: [
              "Volume קבוע שנשמר גם אחרי מחיקת ה-Pod ונגיש מכל Node",
              "Volume שמותאם ל-databases ומספק replication בין Pods",
              "Volume ריק שנוצר עם ה-Pod ונמחק לחלוטין כשה-Pod נמחק",
              "Volume שמאחסן logs בלבד ומתנקה אוטומטית לפי retention policy",
],
              answer: 2,
              explanation:
                "emptyDir הוא Volume זמני שנוצר כאשר ה-Pod מתחיל לפעול.\nה-volume קיים כל עוד ה-Pod רץ, ונמחק כאשר ה-Pod נמחק.\nכל הקונטיינרים בתוך אותו Pod יכולים לשתף את ה-emptyDir.\nניתן להגדיר medium: Memory כדי שהנתונים יישמרו ב-RAM (tmpfs) במקום בדיסק.",
            },
            {
              q: "מה תפקיד StorageClass ב-Kubernetes?",
              hint: "חשבו מה מחליט איזה סוג דיסק ייווצר כשמבקשים אחסון.",
              options: [
              "סוג Service שמנתב traffic לפי storage labels על Pods",
              "סוג Pod מיוחד שמותאם לעומסי עבודה שדורשים אחסון מתמיד",
              "מנגנון שמקטגר logs לפי רמת חומרה ב-Namespace",
              "הגדרת provisioner שיוצר דיסקים דינמיים כשנוצר PVC",
],
              answer: 3,
              explanation:
                "StorageClass מגדיר כיצד Kubernetes יוצר volumes באופן דינמי.\nהוא כולל את סוג ה-provisioner (למשל aws-ebs, gce-pd) ואת פרמטרי האחסון.\nכאשר PVC מציין storageClassName, קוברנטיס יוצר אוטומטית PersistentVolume מתאים.",
            },
            {
              q: "מה קורה לנתונים ב-emptyDir כש-Pod נמחק?",
              hint: "חשבו על הקשר בין מחזור החיים של ה-Volume לבין ה-Pod.",
              options: [
              "נמחקים לחלוטין כשה-Pod נמחק או מועבר ל-Node אחר",
              "נשמרים לתמיד על ה-Node גם אחרי מחיקת ה-Pod",
              "מועברים אוטומטית ל-PersistentVolume לפני מחיקת ה-Pod",
              "מגובים אוטומטית ל-object storage לפני שה-Pod נמחק",
],
              answer: 0,
              explanation:
                "emptyDir הוא Volume זמני שנוצר כאשר ה-Pod מוקצה ל-Node.\nהנתונים נשמרים כל עוד ה-Pod רץ על אותו Node, וגם אם containers בתוך ה-Pod עושים restart.\nכאשר ה-Pod נמחק או מתוזמן מחדש ל-Node אחר, ה-emptyDir נמחק וכל הנתונים בו אובדים.",
            },
            {
              q: "מה תפקיד values.yaml ב-Helm Chart\u200F?",
              hint: "חשבו מהיכן ה-templates מקבלים את הערכים שלהם.",
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
              hint: "Think about who provides storage and who requests it.",
              options: [
              "PV is defined inside the Pod spec; PVC is defined at the Namespace level",
              "PV is a storage resource in the Cluster; PVC is a request for storage from a Pod",
              "PV is auto-created by the kubelet; PVC is created by the Scheduler",
              "PV is a temporary volume deleted when the Pod ends; PVC is a permanent volume",
],
              answer: 1,
              explanation:
                "A PersistentVolume (PV) is a cluster-level storage resource that provides actual storage volume.\nA PersistentVolumeClaim (PVC) is a request for storage from a Pod or workload.\nKubernetes automatically associates a PVC with an appropriate PV based on\nstorageClass, access modes, and storage size.",
            },
            {
              q: "A PVC is configured with accessMode: ReadWriteOnce. What does this mean",
              hint: "Think about how many Nodes can access the Volume and in what way.",
              options: [
              "Read and write from all Nodes simultaneously",
              "Read-only access from a single Node only",
              "Read and write from a single Node only",
              "Write from one Node, read from all Nodes",
],
              answer: 2,
              explanation:
                "ReadWriteOnce (RWO) allows read/write mount from a single Node at a time.\nMultiple Pods on the same Node can use the volume.\nFor comparison:\nReadWriteMany (RWX) - read/write from multiple Nodes (requires NFS/EFS).\nReadOnlyMany (ROX) - read-only from multiple Nodes.",
            },
            {
              q: "What is a Helm Chart?",
              tags: ["helm-chart"],
              hint: "Think of a package manager like apt or npm, but for Kubernetes.",
              options: [
              "A Docker image that bundles Kubernetes manifests inside its layers",
              "A package of Kubernetes manifests with templates and configurable defaults",
              "A virtual network layer that connects Pods in a Cluster via a CNI plugin",
              "A CLI wrapper around kubectl that adds version management for YAML files",
],
              answer: 1,
              explanation:
                "Helm is a package manager for Kubernetes, similar to apt or npm.\nA Chart is a package containing Kubernetes resource templates and a values.yaml file with configurable defaults.\nDuring installation, Helm renders the templates using the values and produces final manifests that are applied to the cluster.\nInstead of managing dozens of YAML files manually, you install one Chart and override only what you need.",
            },
            {
              q: "What command installs a Helm Chart?",
              hint: "Think about the basic action that deploys a Chart for the first time.",
              options: [
              "helm upgrade",
              "helm template",
              "helm install",
              "helm create",
],
              answer: 2,
              explanation:
                "`helm install` installs a Helm Chart and creates a Release in the cluster.\nThe command renders the templates and applies the Kubernetes manifests.\nRelated commands:\n• `helm upgrade` – updates an existing Release\n• `helm template` – generates YAML only\n• `helm create` – creates a new Chart",
            },
            {
              q: "What is emptyDir?",
              hint: "Think about what happens to the data when the Pod disappears.",
              options: [
              "A temporary Volume created empty with the Pod and deleted when the Pod is removed",
              "A persistent Volume that survives Pod deletion and is accessible from any Node",
              "A Volume designed for log files that auto-cleans based on a retention policy",
              "A Volume optimised for databases that provides replication between Pods",
],
              answer: 0,
              explanation:
                "emptyDir is a temporary volume created when the Pod starts running.\nThe volume exists as long as the Pod is running, and is deleted when the Pod is deleted.\nAll containers within the same Pod can share the emptyDir.\nYou can set medium: Memory to store data in RAM (tmpfs) instead of on disk.",
            },
            {
              q: "What is a StorageClass?",
              hint: "Think about what decides which type of disk gets created on demand.",
              options: [
              "Defines a provisioner that creates disks dynamically when a PVC is submitted",
              "A special Pod type optimised for workloads that require persistent storage",
              "A Service type that routes traffic based on storage labels on Pods",
              "A mechanism that categorises logs by severity level within a Namespace",
],
              answer: 0,
              explanation:
                "StorageClass defines how Kubernetes creates volumes dynamically.\nIt includes the provisioner type (e.g., aws-ebs, gce-pd) and storage parameters.\nWhen a PVC specifies a storageClassName, Kubernetes automatically creates an appropriate PersistentVolume.",
            },
            {
              q: "What happens to emptyDir data when a Pod is deleted?",
              hint: "Think about the Volume's lifecycle relative to the Pod.",
              options: [
              "Deleted permanently when the Pod is removed from the Node",
              "Automatically backed up to the default object storage bucket",
              "Persisted forever on the Node's local disk for reuse",
              "Moved to an available PersistentVolume for later reuse",
],
              answer: 0,
              explanation:
                "emptyDir is a temporary volume that is created when a Pod is scheduled to a node.\nThe data persists as long as the Pod is running on that node, even if containers inside the Pod restart.\nWhen the Pod is deleted or rescheduled to another node, the emptyDir is removed and all data stored in it is lost.",
            },
            {
              q: "What is helm values.yaml?",
              hint: "Think about where templates get the data they render.",
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
              hint: "חשבו מה קורה ברגע שמישהו מגדיר בקשת אחסון חדשה.",
              options: [
              "PV ודיסק פיזי נוצרים אוטומטית כשנוצר PVC עם StorageClass",
              "שינוי גודל אוטומטי של PVC קיים לפי צריכת הדיסק בפועל",
              "הקצאת CPU דינמית ל-Pods לפי עומס שמדווח מ-metrics-server",
              "העברת Pod אוטומטית ל-Node אחר כשה-Node הנוכחי מתמלא",
],
              answer: 0,
              explanation:
                "כש-PVC נוצר עם StorageClass, ה-provisioner יוצר PV ודיסק אמיתי אוטומטית.\nשינוי גודל דיסק קיים נעשה דרך Volume Expansion, לא דרך Dynamic Provisioning.\nזו הגישה הסטנדרטית בכל Cluster ענן, והיא חוסכת יצירת PV ידנית.",
            },
            {
              q: "מה Reclaim Policy Delete?",
              hint: "חשבו מה קורה למשאבי האחסון כשהבקשה לאחסון מוסרת.",
              options: [
              "שומר את ה-PV והנתונים גם אחרי מחיקת ה-PVC לשימוש עתידי",
              "מעביר את הנתונים ל-backup אוטומטי לפני מחיקת ה-PV",
              "מוחק את ה-PVC בלבד ומשאיר את ה-PV והדיסק הפיזי קיימים",
              "מוחק את ה-PV ואת הדיסק הפיזי כשה-PVC נמחק",
],
              answer: 3,
              explanation:
                "ReclaimPolicy: Delete אומר שכאשר ה-PVC נמחק, גם ה-PersistentVolume נמחק.\nבמערכות עם dynamic provisioning (כמו AWS EBS או GCP PD), גם הדיסק בפועל נמחק אוטומטית.\nלעומת זאת, Retain משאיר את ה-PV ואת הנתונים גם אחרי מחיקת ה-PVC.",
            },
            {
              q: "איך עוקפים ערך מ-values.yaml בזמן התקנת Helm Chart\u200F?",
              hint: "חשבו על דגל CLI שמאפשר לשנות ערכים בודדים.",
              options: [
              "helm template --set key=value",
              "helm install --set key=value",
              "helm rollback --set key=value",
              "helm show values --set key=value",
],
              answer: 1,
              explanation:
                "\u200F`--set` עוקף ערכים מ־values.yaml בזמן install או upgrade.\nמשמש לשינוי ערכים מהיר מה־CLI.\nלשינויים גדולים משתמשים בקובץ values נוסף (`-f`).",
            },
            {
              q: "כיצד מגדילים את נפח האחסון של PVC קיים ב-Kubernetes",
              hint: "חשבו איזה שדה ב-PVC קובע את גודל האחסון המבוקש.",
              options: [
              "מעדכנים את שדה `capacity.storage` ישירות ב-PV המחובר ל-PVC",
              "מוחקים את ה-PVC ויוצרים חדש עם גודל גדול יותר באותו StorageClass",
              "מגדילים את `spec.resources.requests.storage` ב-PVC כש-StorageClass תומך בהרחבה",
              "יוצרים PVC נוסף ומאחדים את שני הנפחים באמצעות `kubectl merge-pvc`",
],
              answer: 2,
              explanation:
                "כדי להרחיב PVC, ה-StorageClass חייב להגדיר `allowVolumeExpansion: true`.\nאחרי שזה מוגדר, מגדילים את הערך של `spec.resources.requests.storage` ב-PVC:\n```yaml\nspec:\n  resources:\n    requests:\n      storage: 20Gi\n```\nה-provisioner מרחיב את הדיסק אוטומטית. הקטנה לא נתמכת, ובחלק מה-backends נדרש Pod restart.",
            },
            {
              q: "מה הפקודה\n\n```\nhelm template\n```\n\nעושה?",
              hint: "חשבו מה קורה כשרוצים לראות את התוצאה בלי לפרוס בפועל.",
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
              hint: "חשבו מה עושים כש-upgrade כשל וצריכים לחזור למצב קודם.",
              options: [
              "מוחק את ה-Release לחלוטין ומסיר את כל המשאבים שנוצרו",
              "helm upgrade\nמעדכן את ה-Chart לגרסה חדשה ומפעיל אוטומטית",
              "מאפס את כל ה-values לברירות מחדל של ה-Chart",
              "מחזיר Release ל-revision קודמת מתוך ההיסטוריה",
],
              answer: 3,
              explanation:
                "`helm rollback` מחזיר את ה-Release למצב של revision קודם.\nHelm משתמש ב-manifests מה-revision שנבחר ומבצע למעשה upgrade חדש עם ההגדרות הישנות.\nהתוצאה היא:\nהמשאבים ב-cluster חוזרים למצב של אותו revision\nנוצר revision חדש בהיסטוריה\nאפשר לראות את כל ה-revisions עם:\n`helm history <release>`",
            },
            {
              q: "מה אומר PVC בסטטוס Pending?",
              hint: "חשבו למה Kubernetes לא מצליח לספק את בקשת האחסון.",
              options: [
              "ה-StorageClass מבצע replication ל-Zone משני לפני binding, ולכן ה-PVC ממתין",
              "ה-PVC ממתין לסיום backup של Volume קיים לפני שניתן לבצע mount חדש",
              "PV תואם לא נמצא, בגלל AccessMode שגוי, storage לא מספיק, או StorageClass שגוי",
              "ה-PVC נמצא בתהליך הצפנה ואימות תעודות לפני שהוא זמין ל-Pod",
],
              answer: 2,
              explanation:
                "PVC Pending = לא נמצא PV מתאים.\nהרצת `kubectl describe pvc` תראה מה חסר.\nסיבות נפוצות: StorageClass לא קיים, AccessMode לא תואם, או capacity לא מספיק.",
            },
            {
              q: "כיצד PV ו-PVC מתחברים?",
              tags: ["storage-binding"],
              hint: "חשבו לפי אילו קריטריונים Kubernetes מחפש התאמה.",
              options: [
              "לפי שם PVC בלבד, שחייב להיות זהה לשם ה-PV",
              "לפי ה-Node שה-Pod מתוזמן עליו, כך שה-PV נוצר באותו Node",
              "לפי ה-Namespace של ה-Pod, כך שכל PV שייך ל-Namespace ספציפי",
              "לפי accessMode, storage capacity, ו-storageClassName תואמים",
],
              answer: 3,
              explanation:
                "Kubernetes מחבר בין PVC ל-PV כאשר המאפיינים שלהם תואמים.\nההתאמה מתבצעת לפי:\n\u200F• `storageClassName`\n\u200F• `accessModes`\n\u200F• `storage capacity`\nבנוסף, גודל ה-PV חייב להיות גדול או שווה לבקשה של ה-PVC.\nכאשר נמצא PV מתאים, Kubernetes יוצר binding בין ה-PVC ל-PV.\nלאחר ה-binding הם נשארים מקושרים עד שאחד מהם נמחק.",
            },
        ],
        questionsEn: [
            {
              q: "What is Dynamic Provisioning?",
              tags: ["dynamic-provisioning"],
              hint: "Think about what happens the moment a new storage request is created.",
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
              hint: "Think about what happens to the storage resources when the claim is removed.",
              options: [
              "Moves data to an automatic backup before deleting the PV",
              "Retains the PV and its data even after the PVC is deleted for future reuse",
              "Deletes only the PVC and leaves the PV and physical disk intact",
              "Deletes the PV and the physical disk when the PVC is deleted",
],
              answer: 3,
              explanation:
                "ReclaimPolicy: Delete means that when a PVC is deleted, the corresponding PersistentVolume is also deleted.\nWith dynamic provisioning (for example AWS EBS or GCP PD), the underlying disk is deleted as well.\nIn contrast, Retain keeps the PV and its data even after the PVC is removed.",
            },
            {
              q: "How do you change a Helm value from the CLI?",
              hint: "Think about which CLI flag lets you override individual values.",
              options: [
              "helm template --set key=value",
              "helm rollback --set key=value",
              "helm install --set key=value",
              "helm show values --set key=value",
],
              answer: 2,
              explanation:
                "The `--set` flag overrides values from values.yaml during `helm install` or `helm upgrade`.\nIt allows you to modify chart variables directly from the CLI.\nFor larger changes, a separate values file can be provided using `-f`.",
            },
            {
              q: "How do you increase the storage size of an existing PVC in Kubernetes",
              hint: "Think about which PVC field controls the requested storage size.",
              options: [
              "Update the `capacity.storage` field directly on the PV bound to the PVC",
              "Delete the PVC and recreate it with a larger size in the same StorageClass",
              "Increase `spec.resources.requests.storage` in the PVC if StorageClass allows expansion",
              "Create an additional PVC and merge both volumes using `kubectl merge-pvc`",
],
              answer: 2,
              explanation:
                "To expand a PVC, the StorageClass must have `allowVolumeExpansion: true`.\nOnce that is set, increase the value of `spec.resources.requests.storage` in the PVC:\n```yaml\nspec:\n  resources:\n    requests:\n      storage: 20Gi\n```\nThe provisioner resizes the disk automatically. Shrinking is not supported, and some backends require a Pod restart.",
            },
            {
              q: "What does the command\n\n```\nhelm template\n```\n\ndo?",
              hint: "Think about what happens when you want to see the output without deploying.",
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
              hint: "Think about what you do when an upgrade failed and you need a previous state.",
              options: [
              "helm upgrade\nUpdates the Chart to a new version and runs automatically",
              "Resets all values to the Chart's default values.yaml configuration",
              "Deletes the Release completely and removes all created resources",
              "Reverts a Release to a previous revision from its history",
],
              answer: 3,
              explanation:
                "`helm rollback` returns the Release to the state of a previous revision.\nHelm uses the manifests from the selected revision and effectively performs a new upgrade using the older configuration.\nThe result is:\nThe resources in the cluster return to the state of that revision\nA new revision is created in the release history\nYou can view all revisions with:\n`helm history <release>`",
            },
            {
              q: "What does a PVC in Pending status mean?",
              hint: "Think about why Kubernetes cannot fulfill the storage request.",
              options: [
              "The PVC is undergoing encryption and certificate validation before it becomes available to a Pod",
              "The PVC is waiting for an existing Volume backup to complete before a new mount is allowed",
              "The StorageClass is replicating data to a secondary Zone before binding, so the PVC waits",
              "No matching PV found, due to wrong AccessMode, insufficient storage, or wrong StorageClass",
],
              answer: 3,
              explanation:
                "PVC Pending means no matching PV was found.\nRun `kubectl describe pvc` to see what's missing.\nCommon causes: StorageClass doesn't exist, AccessMode mismatch, or insufficient capacity.",
            },
            {
              q: "How do a PV and PVC bind?",
              tags: ["storage-binding"],
              hint: "Think about which criteria Kubernetes uses to find a match.",
              options: [
              "By the Node the Pod is scheduled on, so the PV is created on the same Node",
              "By matching accessMode, storage capacity, and storageClassName",
              "By the Namespace of the Pod, so each PV belongs to a specific Namespace",
              "By name only, where the PVC name must match the PV name exactly",
],
              answer: 1,
              explanation:
                "Kubernetes binds a PVC to a PV when their properties match.\nThe match is based on:\n• `storageClassName`\n• `accessModes`\n• requested storage capacity\nThe PV must have equal or greater capacity than the PVC request.\nOnce matched, Kubernetes creates a binding between them and they remain bound until one of them is deleted.",
            },
        ],
      },
      hard: {
        theory: "אחסון מתקדם, Helm ו-debug.\n🔹 CSI:\u200E Container Storage Interface, סטנדרט לדריברים\n🔹 VolumeSnapshot:\u200E גיבוי נקודתי של PV\n🔹 Helm Hooks:\u200E פעולות בשלבים: pre-install, post-upgrade\n🔹 StatefulSet Storage:\u200E volumeClaimTemplates יוצר PVC ייחודי לכל Pod\n🔹 WaitForFirstConsumer:\u200E ממתין לתזמון Pod לפני binding, מבטיח אותו AZ\n🔹 helm rollback:\u200E מחזיר Release לגרסה קודמת אחרי upgrade כושל\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        theoryEn: "Advanced Storage, Helm, and Debugging\n🔹 CSI - Container Storage Interface, a standard API for storage drivers.\n🔹 VolumeSnapshot - creates a point-in-time backup of a PersistentVolume.\n🔹 Helm Hooks - run Jobs at lifecycle stages (pre-install, post-upgrade).\n🔹 StatefulSet storage - volumeClaimTemplates creates a unique PVC per Pod.\n🔹 WaitForFirstConsumer - delays PV binding until Pod is scheduled, ensuring same AZ.\n🔹 helm rollback - reverts a Release to a previous revision after a failed upgrade.\nCODE:\napiVersion: snapshot.storage.k8s.io/v1\nkind: VolumeSnapshot\nspec:\n  source:\n    persistentVolumeClaimName: my-pvc",
        questions: [
            {
              q: "מה תפקיד CSI ב-Kubernetes?",
              tags: ["storage-interface"],
              hint: "חשבו איך ספקי אחסון חיצוניים מתממשקים עם Kubernetes.",
              options: [
              "Cluster Sync Interface:\u200E סטנדרט לסנכרון נתונים בין Clusters",
              "Container Storage Interface:\u200E סטנדרט פתוח שמאפשר ל-vendors לכתוב storage drivers לקוברנטיס",
              "Cloud Storage Integration:\u200E שכבת חיבור ל-cloud object storage כמו S3",
              "Container Security Interface:\u200E סטנדרט לסריקת images ואכיפת מדיניות אבטחה",
],
              answer: 1,
              explanation:
                "CSI (Container Storage Interface) הוא סטנדרט שמאפשר לחבר מערכות אחסון חיצוניות ל-Kubernetes בצורה אחידה.\nבמקום ש-Kubernetes יטמיע תמיכה מובנית בכל סוג אחסון, ספקים (vendors) יכולים לכתוב CSI drivers שמטפלים ביצירה, חיבור וניהול של volumes.\nהדרייברים האלו (למשל AWS EBS, Azure Disk, Ceph) רצים בתוך הקלאסטר ומבצעים את פעולות האחסון בפועל.\nכך ניתן להוסיף או להחליף פתרונות אחסון בלי לשנות את Kubernetes עצמו.",
            },
            {
              q: "מה התפקיד של Helm Hook?",
              hint: "חשבו על פעולות שצריכות לרוץ לפני או אחרי שלב מסוים ב-deploy.",
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
              hint: "חשבו על אתגרי אחסון כש-Pods זזים בין Nodes.",
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
              hint: "חשבו על איך כל Pod ב-StatefulSet מקבל אחסון משלו.",
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
              hint: "חשבו על הגדרת סוג ואיכות האחסון.",
              answer: 3,
              explanation:
                "Immediate יוצר PV מיד, אך הוא עלול להיווצר ב-Zone שונה מה-Pod.\nWaitForFirstConsumer מעכב יצירת PV עד שה-Pod מתזמן ל-Node, ויוצר PV באותה Zone.\nקריטי בסביבות multi-AZ כמו AWS EKS.",
            },
            {
              q: "ה-PVC נשאר במצב Pending.\n\n```\nkubectl describe pvc\n\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io\n  'fast-ssd' not found\n```\n\nמה הבעיה",
              options: [
              "ה-StorageClass בשם fast-ssd לא קיים ב-Cluster",
              "ה-PVC וה-Pod נמצאים ב-Namespaces שונים",
              "ה-PVC מבקש נפח אחסון גדול מדי עבור ה-Cluster",
              "ה-Node שה-Pod רץ עליו מלא ואין בו מקום לדיסק",
],
              hint: "חשבו על מה מונע מה-Scheduler לשבץ את ה-Pod.",
              answer: 0,
              explanation:
                "ה\u2011PVC מבקש StorageClass בשם fast\u2011ssd, אבל StorageClass כזה לא קיים ב\u2011cluster.\nלכן ה\u2011provisioner לא יכול ליצור PersistentVolume עבור ה\u2011PVC, והוא נשאר במצב Pending.\nאפשר לאמת זאת עם:\nkubectl get storageclass",
            },
            {
              q: "הרצת:\n\n```\nhelm upgrade\n```\n\nה-upgrade כשל באמצע.\nRelease ב-\u200Estatus failed.\nה-ConfigMap עודכן חלקית.\n\nמה הצעד הבא?",
              options: [
              "להריץ `helm upgrade` שוב עם אותם פרמטרים",
              "להריץ `helm rollback` לגרסה האחרונה התקינה",
              "למחוק את ה-Release ולהתקין מחדש",
              "למחוק את ה-ConfigMap ולהריץ שוב",
],
              hint: "חשבו מה קורה כשחלק מהמשאבים עודכנו וחלק לא.",
              answer: 1,
              explanation:
                "כאשר `helm upgrade` נכשל, חלק מהמשאבים עלולים להישאר במצב לא עקבי.\n`helm rollback` מחזיר את ה-Release לגרסה קודמת שעבדה.\nניתן לראות את רשימת הגרסאות עם `helm history` ולבחור לאיזו גרסה לחזור.",
            },
            {
              q: "Pod עם PVC ב-AWS EKS עובר ל-Node שנמצא ב-Availability Zone אחרת.\nה-PVC נמצא במצב Bound, אבל ה-Pod לא מצליח לעלות.\n\nמה הסיבה הסבירה ביותר",
              tags: ["storage-zone"],
              options: [
              "ה-PV נמחק אוטומטית כשה-Pod עבר Node ונוצר PV חדש ריק",
              "ה-EBS Volume הוא single-AZ ולא ניתן לחבר אותו ל-Node ב-AZ אחר",
              "ה-kubelet ב-Node החדש לא מצליח לאמת את ה-PVC מול ה-API Server",
              "ה-CSI driver לא הותקן על ה-Node החדש ולכן ה-mount נכשל",
],
              hint: "חשבו על מגבלות פיזיות של דיסקים בענן.",
              answer: 1,
              explanation:
                "EBS Volumes הם single-AZ ולא ניתן לחבר אותם ל-Node ב-AZ אחר.\nה-PVC מראה Bound כי ה-PV קיים, אבל ה-attach נכשל בגלל מגבלת ה-AZ.\nהפתרון: להגדיר StorageClass עם volumeBindingMode: WaitForFirstConsumer כדי שה-PV ייווצר באותו AZ כמו ה-Pod.",
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
              hint: "Think carefully about what each option describes.",
              answer: 0,
              explanation:
                "CSI (Container Storage Interface) is a standard that allows external storage systems to integrate with Kubernetes in a consistent way.\nInstead of Kubernetes having built-in support for every storage type, vendors can write CSI drivers that handle creating, attaching, and managing volumes.\nThese drivers (for example AWS EBS, Azure Disk, Ceph) run inside the cluster and perform the actual storage operations.\nThis allows adding or replacing storage solutions without modifying Kubernetes itself.",
            },
            {
              q: "What is the role of a Helm Hook?",
              options: [
              "A tool for debugging and validating Chart templates before deployment",
              "Running a resource (usually a Job) at a specific point in the Release lifecycle",
              "A mechanism for rolling back to a previous Release version automatically",
              "A Chart type that contains only shared dependencies without any templates",
],
              hint: "Think about a package manager for Kubernetes resources.",
              answer: 1,
              explanation:
                "Helm Hooks allow running Kubernetes resources at defined points in the Release lifecycle, such as before or after install, upgrade, or delete operations.\n\nTypically this is a Job performing a one-time action, for example:\nRunning database migrations before deploy (pre-install, pre-upgrade)\nTests or notifications after deploy (post-install, post-upgrade)\n\nThe Hook is defined via an annotation in YAML, and Helm triggers it automatically at the right stage.\n\nHow does it look technically?\nDefine in YAML:\n\n```yaml\nannotations:\n  \"helm.sh/hook\": pre-install\n```\n\nThen Helm knows to run this resource at the appropriate time.",
            },
            {
              q: "What is a VolumeSnapshot?",
              options: [
              "A backup of ConfigMaps and Secrets in a Namespace for future restore",
              "A full backup of the Cluster including etcd, Pods, and ConfigMaps",
              "A point-in-time backup of a PersistentVolume from which a new PVC can be restored",
              "A snapshot of a Pod's container filesystem and memory state",
],
              hint: "Think about storage challenges when Pods move between Nodes.",
              answer: 2,
              explanation:
                "VolumeSnapshot creates a point-in-time copy of a PersistentVolume's data.\nYou can restore a new PVC from it. Useful before risky DB migrations.\nRequires a snapshot-controller and a CSI driver with snapshot support.",
            },
            {
              q: "How does a StatefulSet manage storage?",
              tags: ["statefulset-storage"],
              options: [
              "Each Pod gets its own unique PVC via volumeClaimTemplates",
              "All Pods in the StatefulSet share a single PVC for storing data",
              "StatefulSet only uses emptyDir volumes that are deleted with the Pod",
              "StatefulSet does not support storage and relies on ConfigMaps for state",
],
              hint: "Think about how each Pod in a StatefulSet gets its own storage.",
              answer: 0,
              explanation:
                "volumeClaimTemplates creates a unique PVC per Pod. Pod-0 gets data-myapp-0 and so on.\nEach PVC stays bound to its Pod across restarts. How databases keep persistent data.\nScaling down doesn't delete PVCs; scaling up reconnects the existing ones.",
            },
            {
              q: "What does volume binding mode WaitForFirstConsumer do?\n\n```yaml\napiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast-ssd\nvolumeBindingMode: WaitForFirstConsumer\n```",
              tags: ["wait-for-consumer"],
              options: [
              "Waits for Admin RBAC approval before creating a new PV for the claim",
              "Waits for a Pod to be scheduled before creating the PV in the same Zone",
              "Waits for cross-Zone replication to complete before binding the PVC to a PV",
              "Waits for the StorageClass to finish a health check before allocating a Volume",
],
              hint: "Think about defining the type and quality of storage.",
              answer: 1,
              explanation:
                "Immediate creates a PV right away, but it might end up in a different Zone than the Pod.\nWaitForFirstConsumer delays PV creation until the Pod is scheduled, then creates it in the same Zone.\nCritical in multi-AZ environments like AWS EKS.",
            },
            {
              q: "A PVC stays in Pending state.\n\n```\nkubectl describe pvc\n\nEvents:\n  Warning  ProvisioningFailed\n  storageclass.storage.k8s.io\n  'fast-ssd' not found\n```\n\nWhat is wrong",
              options: [
              "The PVC requests more storage than the Cluster can provide",
              "The StorageClass named fast-ssd does not exist in the Cluster",
              "The PVC and Pod are in different Namespaces",
              "The Node the Pod runs on is full and has no room for a disk",
],
              hint: "Think about what prevents the Scheduler from placing the Pod.",
              answer: 1,
              explanation:
                "The PVC references a StorageClass named fast-ssd that doesn't exist in the Cluster.\nWithout a valid StorageClass, the provisioner can't create a PV.\nRun kubectl get storageclass to see what exists.\nPVC too large = capacity error\nNode full = unrelated to provisioning\nDifferent Namespace = different error",
            },
            {
              q: "Command:\n\n```\nhelm upgrade\n```\n\nThe upgrade failed midway.\nRelease status: failed.\nA ConfigMap is half-updated.\n\nWhat is the next step?",
              options: [
              "Run `helm upgrade` again with the same parameters",
              "Delete the Release and reinstall from scratch",
              "Delete the ConfigMap and try again",
              "Run `helm rollback` to the last working revision",
],
              hint: "Think about what happens when some resources updated and some did not.",
              answer: 3,
              explanation:
                "When `helm upgrade` fails, some resources may remain in an inconsistent state.\n`helm rollback` restores the Release to a previous working revision.\nYou can view the list of revisions with `helm history` and choose which one to roll back to.",
            },
            {
              q: "A Pod with a PVC on AWS EKS is scheduled to a Node in a different Availability Zone.\nThe PVC is Bound, but the Pod stays Pending.\n\nWhat is the most likely cause",
              tags: ["storage-zone"],
              options: [
              "The PV was automatically deleted when the Pod moved and a new empty PV was created",
              "The EBS volume is single-AZ and cannot be attached to a Node in another AZ",
              "The kubelet on the new Node cannot validate the PVC against the API Server",
              "The CSI driver is not installed on the new Node so the mount fails",
],
              hint: "Think about physical limitations of cloud disks.",
              answer: 1,
              explanation:
                "EBS volumes are single-AZ and cannot be attached to a Node in a different AZ.\nThe PVC shows Bound because the PV exists, but the attach fails due to the AZ constraint.\nThe fix is to configure the StorageClass with volumeBindingMode: WaitForFirstConsumer so the PV is created in the same AZ as the Pod.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 2,
              explanation:
                "`kubectl logs` מציג את ה-stdout/stderr של הקונטיינר.\nהמקום הראשון לחפש שגיאות אפליקציה כשה-Pod רץ.\nהוסף --follow לעקוב בזמן אמת.",
            },
            {
              q: "מה מציגה הפקודה\n\n```\n$ kubectl get events\n```",
              options: [
              "רק Pod logs מכל ה-Pods שרצים כרגע ב-Namespace הנוכחי",
              "אירועים מה-Namespace הנוכחי: scheduling, image pull, probe failures",
              "רק שגיאות קריטיות שדורשות התערבות מיידית של המפעיל",
              "רק Node events כמו disk pressure, memory pressure, PID pressure",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 1,
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 3,
              explanation:
                "כאשר קונטיינר קורס ומופעל מחדש, kubectl logs מציג את הלוגים של הקונטיינר הנוכחי בלבד.\nכדי לראות את הלוגים של הקונטיינר לפני הקריסה צריך להשתמש ב-\u200E--previous.\nהפקודה kubectl logs pod-name --previous מחזירה את הלוגים של ה-container instance הקודם, כלומר זה שקרס.\nזה שימושי במיוחד כאשר Pod נכנס למצב CrashLoopBackOff ורוצים להבין מה גרם לקריסה.",
            },
            {
              q: "מה מציגה הפקודה `kubectl top nodes`",
              options: [
              "רשימת כל ה-Nodes ב-Cluster כולל Status ו-Roles",
              "לוגים של kubelet מכל Node ב-Cluster",
              "שימוש ב-CPU/Memory של כל Node בזמן אמת (דורש metrics-server)",
              "רשימת Nodes עם Conditions חריגות כמו DiskPressure או MemoryPressure",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 2,
              explanation:
                "מציג צריכת CPU ו-Memory בזמן אמת של כל Node, כולל אחוז ניצול.\nדורש metrics-server מותקן ב-Cluster.\n`kubectl top pods` מציג את אותו מידע ברמת Pod.",
            },
            {
              q: "כיצד בודקים את ה-health של ה-API server\u200F?",
              options: [
              "kubectl get --raw='/healthz'\nמחזיר ok אם בריא",
              "kubectl check apiserver --all-components",
              "kubectl status cluster --full-report",
              "kubectl describe apiserver --verbose",
],
              hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
              answer: 0,
              explanation:
                "kubectl get --raw=/healthz שולחת בקשה ישירה ל-Kubernetes API Server ובודקת אם הוא בריא.\nאם ה-API Server תקין, התגובה תהיה ok.\nנקודות כמו /healthz, /readyz, /livez הן health endpoints. זה אומר כתובות HTTP מיוחדות שמאפשרות לבדוק את מצב הרכיב.\nב-Kubernetes 1.26 הפקודה kubectl get componentstatuses הוסרה ולכן משתמשים ב-health endpoints במקום.",
            },
            {
              q: "מה תפקיד הפקודה `kubectl config get-contexts`?",
              options: [
              "מציג את כל ה-Docker contexts שמוגדרים ב-daemon המקומי",
              "מציג את כל ה-Namespaces ב-Cluster הנוכחי",
              "מציג את ה-context של כל Node כולל ה-kubelet configuration",
              "מציג את כל ה-kubeconfig contexts: cluster, user, ו-namespace מוגדרים",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 3,
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think carefully about what each option describes.",
              answer: 2,
              explanation:
                "`kubectl logs` shows the container's stdout/stderr.\nFirst place to look for application errors while the Pod is running.\nUse --follow to stream logs in real time.",
            },
            {
              q: "What does this command show?\n\n```\n$ kubectl get events\n```",
              options: [
              "Only Pod logs from all running Pods in the current Namespace",
              "Only Node events like disk pressure, memory pressure, PID pressure",
              "Namespace events: Pod scheduling, image pulls, probe failures",
              "Only critical errors that require immediate operator intervention",
],
              hint: "Think about what the command does behind the scenes.",
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
              hint: "Think carefully about what each option describes.",
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
              hint: "Think carefully about what each option describes.",
              answer: 3,
              explanation:
                "When a container crashes and restarts, kubectl logs only shows logs from the current container instance.\nTo see the logs from the container before it crashed, you must use the --previous flag.\nThe command kubectl logs pod-name --previous returns logs from the previous container instance, meaning the one that crashed.\nThis is especially useful when a Pod is in a CrashLoopBackOff state and you want to understand what caused the crash.",
            },
            {
              q: "What does `kubectl top nodes` show?",
              options: [
              "Kubelet logs from every Node in the Cluster",
              "A list of all Nodes in the Cluster with their Status and Roles",
              "Nodes with abnormal Conditions such as DiskPressure or MemoryPressure",
              "Real-time CPU/Memory usage for each Node (requires metrics-server)",
],
              hint: "Think about what the command does behind the scenes.",
              answer: 3,
              explanation:
                "Shows real-time CPU and Memory consumption for every Node, including utilization percentage.\nRequires metrics-server installed in the cluster.\n`kubectl top pods` shows the same at Pod level.",
            },
            {
              q: "How do you check the health of the API server?",
              options: [
              "kubectl status cluster --all-components",
              "kubectl describe apiserver --show-details",
              "kubectl check apiserver --full-report",
              "kubectl get --raw='/healthz'\nreturns ok when healthy",
],
              hint: "Think carefully about what each option describes.",
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
              hint: "Think about what the command does behind the scenes.",
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
              hint: "חשבו על מה צריך כדי למשוך image ממקור מוגן.",
              answer: 0,
              explanation:
                "הקונטיינר עולה, קורס מיד, ו-Kubernetes מנסה שוב עם המתנה גוברת.\nהריצו `kubectl logs --previous` לראות את ה-logs מה-crash האחרון.",
            },
            {
              q: "ה-Pod נמצא ב-ImagePullBackOff. מה שתי הסיבות הנפוצות ביותר?",
              tags: ["imagepull-flow"],
              options: [
              "Node חסר disk space, או port שגוי בהגדרת ה-container",
              "הרשאות RBAC חסרות, או ConfigMap לא נמצא ב-Namespace",
              "שם image שגוי או tag שגוי, או imagePullSecret חסר",
              "resource limits שגויים, או ה-Namespace לא קיים בכלל",
],
              hint: "חשבו על מה צריך כדי למשוך image ממקור מוגן.",
              answer: 2,
              explanation:
                "Kubernetes לא מצליח להוריד את ה-image ומחכה יותר ויותר בין ניסיונות.\nשתי הסיבות הנפוצות: שגיאה בשם ה-image/tag, או חוסר imagePullSecrets ל-registry פרטי.",
            },
            {
              q: "ה-Pod רץ שעות, ואז מסתיים לפתע.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\nReason: OOMKilled\n```\n\nמה קרה ומה הפתרון?",
              options: [
              "ה-Pod פונה בגלל disk מלא על ה-Node; הוסף storage או נקה נפח",
              "ה-liveness probe נכשל שוב ושוב; תקן את ה-path או ה-port",
              "ה-Pod פונה ע\"י Pod עם PriorityClass גבוה יותר שדרש משאבים",
              "הקונטיינר חרג ממגבלת הזיכרון שלו; הגדל את limits.memory",
],
              hint: "חשבו על מה קורה כשתהליך חורג ממגבלת הזיכרון.",
              answer: 3,
              explanation:
                "הקונטיינר חרג מ-limits.memory וה-Linux kernel ממית אותו עם exit code 137.\nהגדילו limits.memory, או בדקו memory leak עם `kubectl top pod`.",
            },
            {
              q: "ה-Pod נשאר ב-Pending.\n\nהרצת:\n\n```\nkubectl describe pod\n```\n\nפלט:\n\n```\n0/3 nodes are available:\n3 Insufficient cpu\n```\n\nמה הגורם השורשי?",
              options: [
              "ה-image של הקונטיינר גדול מדי ולא ניתן להוריד אותו",
              "NetworkPolicy חוסמת את ה-Pod ומונעת ממנו scheduling",
              "ה-Pod מבקש יותר CPU ממה שקיים ב-Nodes הפנויים",
              "ה-Namespace של ה-Pod לא קיים ולכן ה-Scheduler מתעלם",
],
              hint: "חשבו על סוגי בדיקות בריאות ומה כל אחת גורמת.",
              answer: 2,
              explanation:
                "הודעת Insufficient cpu אומרת של-Kubernetes אין Node עם מספיק CPU פנוי כדי להריץ את ה-Pod.\nה-scheduler של Kubernetes (הרכיב שמחליט על איזה Node להריץ Pod) משווה את ה-cpu requests שהוגדרו ב-Pod מול ה-capacity הזמין בכל Node.\nבמקרה הזה הבקשה ל-CPU גדולה ממה שזמין ב-Nodes, ולכן ה-Pod נשאר במצב Pending.\nכדי לפתור את הבעיה ניתן להקטין את ה-cpu requests, לפנות משאבים ב-Nodes קיימים, או להוסיף Nodes חדשים לקלאסטר.",
            },
            {
              q: "מה קורה כש-liveness probe נכשל",
              tags: ["probe-comparison"],
              options: [
              "Pod מוגדר NotReady ומוסר מה-Service",
              "Pod נמחק לצמיתות ו-Controller יוצר חדש",
              "Event נרשם בלבד ואין השפעה על ה-Pod",
              "קוברנטיס ממית ומפעיל מחדש את הקונטיינר",
],
              hint: "חשבו על סוגי בדיקות בריאות ומה כל אחת גורמת.",
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
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
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
              hint: "חשבו על מה מעכב את סיום מחיקת המשאב.",
              answer: 2,
              explanation:
                "Pod יכול להישאר במצב Terminating אם מוגדר עליו finalizer.\nfinalizers הם מנגנון שמונע מחיקה של משאב עד שתהליך מסוים מסיים פעולת ניקוי.\nכאשר מוחקים Pod, Kubernetes מסמן אותו למחיקה אך לא מסיר אותו עד שה-controller שאחראי על ה-finalizer מסיר אותו מהרשימה.\nאם ה-controller לא רץ או לא מסיר את ה-finalizer, ה-Pod יישאר במצב Terminating גם אם משתמשים ב---force.\nבמקרה כזה ניתן להסיר את ה-finalizer ידנית:\n`kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'`",
            },
            {
              q: "ה-Node ב-DiskPressure.\n\nהרצת:\n\n```\nkubectl describe node\n```\n\nפלט:\n\n```\nConditions:\n  DiskPressure True\n```\n\nמה הסיבות הנפוצות?",
              options: [
              "RAM של ה-Node מלא וה-kubelet מגדיר MemoryPressure condition",
              "עומס רשת גבוה שגורם ל-kubelet לדווח על בעיית connectivity",
              "logs שהצטברו, images ישנים, או disk של ה-Node מגיע לסף מלאות",
              "שימוש גבוה ב-CPU שגורם ל-kubelet לא להגיב ל-heartbeats",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
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
              hint: "Think about what is needed to pull an image from a private source.",
              answer: 0,
              explanation:
                "The container starts, crashes immediately, and Kubernetes retries with increasing back-off delay.\nRun `kubectl logs --previous` to see the logs from the last crash.",
            },
            {
              q: "A pod is stuck in ImagePullBackOff. What are the two most common causes?",
              tags: ["imagepull-flow"],
              options: [
              "Wrong image name/tag, or missing imagePullSecret for private registry",
              "RBAC permissions missing, or ConfigMap not found in Namespace",
              "Wrong resource limits configured, or target Namespace does not exist",
              "Node out of disk space, or container port misconfigured in spec",
],
              hint: "Think about what is needed to pull an image from a private source.",
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
              hint: "Think about what happens when a process exceeds its memory limit.",
              answer: 1,
              explanation:
                "The container exceeded limits.memory and the Linux kernel killed it with exit code 137.\nIncrease limits.memory, or use `kubectl top pod` to identify a memory leak.",
            },
            {
              q: "A Pod stays Pending.\n\nCommand:\n\n```\nkubectl describe pod\n```\n\nOutput:\n\n```\n0/3 nodes are available:\n3 Insufficient cpu\n```\n\nWhat is the root cause?",
              options: [
              "The container image is too large to pull on any available node",
              "The pod requests more CPU than any available node can provide",
              "The pod namespace does not exist so the Scheduler ignores it",
              "A NetworkPolicy is blocking the pod from being scheduled",
],
              hint: "Think about the types of health checks and what each triggers.",
              answer: 1,
              explanation:
                "The Insufficient cpu message means Kubernetes cannot find a Node with enough available CPU to run the Pod.\nThe Kubernetes scheduler (the component responsible for deciding which Node runs a Pod) compares the Pod's cpu requests with the available capacity on each Node.\nIn this case the requested CPU is larger than what is available on the Nodes, so the Pod remains in the Pending state.\nTo resolve the issue you can reduce the cpu requests, free resources on existing Nodes, or add more Nodes to the cluster.",
            },
            {
              q: "What happens when a liveness probe fails?",
              tags: ["probe-comparison"],
              options: [
              "Pod is permanently deleted by the controller",
              "Only an event is recorded in the Namespace",
              "Pod is set to NotReady and removed from Service",
              "K8s kills and restarts the container automatically",
],
              hint: "Think about the types of health checks and what each triggers.",
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
              hint: "Think about what the command does behind the scenes.",
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
              hint: "Think about what blocks resource deletion from completing.",
              answer: 2,
              explanation:
                "A Pod can remain in the Terminating state if it has a finalizer.\nFinalizers prevent a resource from being deleted until a specific cleanup process completes.\nWhen a Pod is deleted, Kubernetes marks it for deletion but keeps it until the controller responsible for the finalizer removes it.\nIf that controller is not running or never removes the finalizer, the Pod may stay Terminating even when using --force.\nIn such cases, the finalizer can be removed manually:\n`kubectl patch pod my-pod -p '{\"metadata\":{\"finalizers\":null}}'`",
            },
            {
              q: "A Node shows DiskPressure.\n\nCommand:\n\n```\nkubectl describe node\n```\n\nOutput:\n\n```\nConditions:\n  DiskPressure True\n```\n\nWhat are the common causes?",
              options: [
              "Accumulated logs, stale images, or Node disk approaching the fullness threshold",
              "High CPU usage causing kubelet to stop responding to heartbeats",
              "High network load causing kubelet to report a connectivity problem",
              "Full RAM on the Node causing kubelet to set MemoryPressure condition",
],
              hint: "Think about what the command does behind the scenes.",
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
              "Scale down ל-0 replicas ו-redeploy מחדש עם אותו manifest",
              "מחק את כל ה-Pods הקורסים ותן ל-Kubernetes ליצור אותם מחדש אוטומטית",
              "kubectl logs <new-pod> --previous\nו-kubectl describe pod <new-pod>",
              "kubectl rollout undo deployment/<name>\nמיד לגרסה הקודמת ללא בדיקה",
],
              hint: "חשבו על איך לחקור Pod שקורס שוב ושוב.",
              answer: 2,
              explanation:
                "לפני rollback חשוב להבין מה השתנה.\nlogs --previous מציג output מה-crash, ו-describe pod מציג Events.\nרק אחרי שמבינים את הסיבה, מחליטים לתקן code או לעשות rollout undo.",
            },
            {
              q: "Node במצב NotReady ו-Pods מתחילים להתפנות ממנו. מה הפעולות הראשונות לבדיקה",
              options: [
              "להריץ `kubectl drain` ולהעביר Pods ל-Nodes אחרים",
              "למחוק את ה-Node מה-Cluster ולצרף אותו מחדש",
              "לבדוק עם `kubectl describe node` ו-`systemctl status kubelet`",
              "להריץ `kubectl cordon` ולהמתין לשחזור אוטומטי",
],
              hint: "חשבו על מה גורם ל-Node להפסיק לקבל עומסים.",
              answer: 2,
              explanation:
                "כאשר Node עובר למצב NotReady, הצעד הראשון הוא לאסוף מידע.\n`kubectl describe node` מציג את ה-Conditions וה-Events של ה-Node, ומסייע לזהות את הסיבה (למשל disk pressure, memory pressure, או בעיית תקשורת).\nלאחר מכן, SSH ל-Node והרצת `systemctl status kubelet` מאפשרת לבדוק אם ה-kubelet רץ ואם יש שגיאות בהפעלה שלו.\nסיבות נפוצות למצב NotReady: kubelet לא רץ, certificate שפג תוקף, או לחץ על דיסק או זיכרון.",
            },
            {
              q: "מה תפקיד הפקודה `kubectl drain` ומתי משתמשים בה?",
              options: [
              "מפנה Pods מ-Node בצורה graceful ומסמן אותו כ-unschedulable לפני maintenance",
              "מנתק את ה-Node מהרשת כך ש-Pods לא מקבלים traffic נכנס מבחוץ",
              "מקטין את מספר ה-replicas של כל Deployment שרץ על ה-Node הזה",
              "מוחק את ה-Node מה-Cluster לצמיתות ומפנה את כל ה-Pods לאשפה",
],
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
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
              hint: "חשבו על תרגום שמות לכתובות בתוך ה-Cluster.",
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
              hint: "חשבו על מאגר המידע של ה-Cluster.",
              answer: 1,
              explanation:
                "`etcdctl snapshot save` יוצר snapshot מלא של מסד הנתונים של etcd.\nה-snapshot מכיל את כל מצב ה-cluster בזמן הצילום (כל ה-keys והנתונים).\nבדרך כלל צריך לציין גם:\n`--endpoints`, `--cacert`, `--cert`, `--key` כדי להתחבר ל-etcd בצורה מאובטחת.\nקובץ ה-snapshot משמש בעיקר ל-Disaster Recovery כדי לשחזר את מצב ה-cluster במקרה של תקלה.",
            },
            {
              q: "ה-Pod רץ, אבל ה-liveness probe נכשל שוב ושוב.\n\nהפלט של `kubectl describe pod` מציג:\n\n```\nError: Liveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nמה בודקים?",
              options: [
              "ה-container image שגוי ולא מכיל את האפליקציה",
              "בעיית DNS שמונעת מה-probe להגיע ל-Pod",
              "הרשאות RBAC מונעות מ-kubelet לבצע את ה-probe",
              "ה-probe path שגוי. האפליקציה לא חושפת את ה-endpoint הזה",
],
              hint: "חשבו על מה קורה כשקונטיינר מפסיק להגיב.",
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
              hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
              answer: 2,
              explanation:
                "השגיאה אומרת שה-container לא רץ כרגע, ולכן Kubernetes לא יכול לשלוף ממנו logs.\nהריצו `kubectl get pod my-pod` כדי לראות את הסטטוס הנוכחי של ה-Pod.\nאחר כך הריצו `kubectl describe pod my-pod` כדי לראות את ה-Events ולהבין למה ה-container לא רץ.\nאם הסטטוס הוא CrashLoopBackOff, הקונטיינר קרס והופעל מחדש.\nהריצו `kubectl logs my-pod --previous` כדי לקרוא logs מההרצה שלפני הקריסה.\nאם הסטטוס הוא Init:Error, ה-init container נכשל לפני שה-container הראשי עלה.\nהריצו `kubectl logs my-pod -c <init-name>` כדי לראות את הלוגים שלו.",
            },
            {
              q: "Cluster חדש הותקן זה עתה.\n\nהרצת:\n\n```\nkubectl get nodes\n```\n\nפלט:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nמה הצעד הראשון?",
              options: [
              "ה-etcd database כשל ויש לשחזר אותו מגיבוי קיים",
              "למחוק את ה-Node לגמרי ולהתקין אותו מחדש",
              "ה-API server לא רץ ויש להפעיל אותו ידנית מ-CLI",
              "CNI plugin לא מותקן. יש לבדוק ולהתקין Calico או Flannel",
],
              hint: "חשבו על מה גורם ל-Node להפסיק לקבל עומסים.",
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
              "Delete all pods and wait for the controller to recreate them",
              "kubectl rollout undo immediately to restore the previous version",
              "Scale down the Deployment to 0 replicas and then redeploy",
],
              hint: "Think about how to investigate a Pod that keeps crashing.",
              answer: 0,
              explanation:
                "Before rollback, understand what changed.\nlogs --previous shows the crash output, describe pod shows the Events timeline.\nOnly after understanding the cause. Decide to fix code or run rollout undo.",
            },
            {
              q: "A Node is in NotReady state and Pods are being evicted from it. What are the first troubleshooting steps",
              options: [
              "Run `kubectl drain` and move Pods to other Nodes",
              "Delete the Node from the Cluster and rejoin it",
              "Check with `kubectl describe node` and `systemctl status kubelet`",
              "Run `kubectl cordon` and wait for automatic recovery",
],
              hint: "Think about what causes a Node to stop accepting workloads.",
              answer: 2,
              explanation:
                "When a Node enters NotReady, the first step is to gather information.\n`kubectl describe node` shows the Conditions and Events of the Node, helping identify the cause (e.g. disk pressure, memory pressure, or a connectivity issue).\nThen, SSH into the Node and run `systemctl status kubelet` to check whether kubelet is running and if there are any startup errors.\nCommon causes for NotReady: kubelet not running, expired certificate, or disk/memory pressure.",
            },
            {
              q: "What is the purpose of `kubectl drain` and when is it used?",
              options: [
              "Removes the Node from the Cluster entirely and sends all its Pods to garbage collection",
              "Disconnects the Node from the network so Pods stop receiving inbound traffic",
              "Gracefully evicts Pods from a Node and marks it unschedulable before maintenance",
              "Reduces the replica count of every Deployment running on the Node",
],
              hint: "Think about what the command does behind the scenes.",
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
              hint: "Think about name-to-address translation inside the Cluster.",
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
              hint: "Think about the Cluster's data store.",
              answer: 1,
              explanation:
                "`etcdctl snapshot save` creates a full snapshot of the etcd database.\nThe snapshot contains the entire cluster state at the moment it was taken (all keys and data).\nIn most environments you also need to specify\n`--endpoints`, `--cacert`, `--cert`, and `--key` in order to connect to etcd securely.\nThe snapshot file is mainly used for disaster recovery, allowing the cluster state to be restored if etcd fails.",
            },
            {
              q: "A Pod is running, but the liveness probe keeps failing.\n\nThe output of `kubectl describe pod` shows:\n\n```\nError: Liveness probe failed:\nHTTP probe failed with statuscode: 404\n```\n\nWhat do you check?",
              options: [
              "The container image is wrong and does not contain the application",
              "A DNS issue preventing the probe from reaching the Pod",
              "RBAC permissions prevent kubelet from performing the probe",
              "The probe path is wrong. The app does not expose this endpoint",
],
              hint: "Think about what happens when a container becomes unresponsive.",
              answer: 3,
              explanation:
                "A 404 error in a liveness probe means the request reached the application, but the endpoint defined in the probe does not exist.\nThe Pod itself is running and the server is responding, but the path configured in livenessProbe.httpGet does not match a real endpoint exposed by the application.\nAs a result Kubernetes receives a 404 response and treats the probe as failed, which causes the kubelet to restart the container.\nThe fix is to check which health endpoint the application actually exposes (for example /health, /livez, /ping) and update the livenessProbe configuration accordingly.",
            },
            {
              q: "Command:\n\n```\nkubectl logs my-pod\n```\n\nOutput:\n\n```\nError from server (BadRequest):\ncontainer 'my-container' in pod\n'my-pod' is not running\n```\n\nWhat do you do?",
              options: [
              "The Pod is not Running.\nkubectl get pod to check status, then kubectl describe pod to check Events",
              "Delete the Pod and let the Deployment controller create a new one whose logs you can read",
              "Add a sidecar container that continuously collects and forwards logs from the main container",
              "The Pod is definitely Running. The issue is an RBAC policy blocking access to read its logs",
],
              hint: "Think about what the command does behind the scenes.",
              answer: 0,
              explanation:
                "The error means the container is not currently running, so Kubernetes cannot stream its logs.\nRun `kubectl get pod my-pod` to see the current Pod status.\nThen run `kubectl describe pod my-pod` to see Events and understand why the container isn't running.\nIf the status is CrashLoopBackOff, the container crashed and was restarted.\nRun `kubectl logs my-pod --previous` to read logs from the run before the crash.\nIf the status is Init:Error, an init container failed before the main container started.\nRun `kubectl logs my-pod -c <init-name>` to see its logs.",
            },
            {
              q: "A new cluster was just initialized.\n\nCommand:\n\n```\nkubectl get nodes\n```\n\nOutput:\n\n```\nNAME    STATUS     ROLES           AGE\nmaster  NotReady   control-plane   5m\n```\n\nWhat is the first step?",
              options: [
              "CNI plugin is not installed. Check and install Calico or Flannel",
              "Delete the Node and reinstall it from scratch",
              "The etcd database has failed and must be restored from backup",
              "The API server is not running and must be started manually",
],
              hint: "Think about what causes a Node to stop accepting workloads.",
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
              "vmstat 1 | tail -n 5",
              "cat /proc/meminfo | head",
              "ps aux --sort=-%mem | head",
              "free -m | grep Mem"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 2,
            explanation: "כשיש חשד ל-memory leak או צריכת RAM חריגה, קודם מזהים את התהליך שצורך הכי הרבה זיכרון.\n\u200Eps aux --sort=-%mem ממיין תהליכים לפי שימוש בזיכרון.\nhead מציג את התהליכים המובילים בצריכה.\nאחרי שמזהים את ה-PID אפשר להמשיך בדיבוג עם כלים כמו pmap, top, או smem.",
          },
          {
            q: "הרצת:\n\n```\ndf -h\n```\n\nפלט:\n\n```\nFilesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   48G  2.0G  96% /\n```\n\nמה הבעיה ומה הצעד הראשון?",
            options: [
              "\u200Edu -sh /*\nהדיסק כמעט מלא - לזיהוי קבצים גדולים",
              "הדיסק כמעט מלא - יש להריץ \u2066fsck\u2069 לתיקון שגיאות מערכת קבצים",
              "הדיסק כמעט מלא - יש למחוק את כל \u2066/var/log\u2069 ולהפעיל מחדש",
              "השימוש בדיסק תקין - ערך של 96% סביר לשרת ייצור",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "הפלט מראה שהדיסק ב-96% תפוסה, נשארו רק `2GB` מתוך `50GB`.\nב-100% שירותים יפסיקו לכתוב לוגים, databases עלולים לקרוס, ואפילו SSH עלול להפסיק לעבוד.\nהצעד הראשון הוא לזהות מה תופס מקום באמצעות הפקודה du -sh /* שמציגה את הגודל של כל תיקייה ברמה העליונה.\nבדרך כלל הצרכנים הגדולים הם /var/log או /tmp.\nfsck מתקן שגיאות במערכת קבצים ולא משחרר מקום, ומחיקה גורפת של /var/log עלולה להרוס לוגים קריטיים.",
          },
          {
            q: "שירות לא עולה אחרי הפעלה מחדש של השרת.\n\nאיזו פקודה תראה את הלוגים של השירות?",
            options: [
              "systemctl restart service-name",
              "cat /etc/systemd/system/service-name.service",
              "dmesg | tail",
              "journalctl -u service-name --no-pager -n 50"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 3,
            explanation: "כדי להבין למה השירות לא עולה, צריך לבדוק את הלוגים שלו.\nהפקודה \u200Ejournalctl -u service-name --no-pager -n 50 מציגה את הלוגים של השירות מ-systemd (מערכת הניהול של שירותים בלינוקס) ומאפשרת לראות את שגיאת ההפעלה.\nהאופציה \u200E-n 50 מגבילה את הפלט ל-50 השורות האחרונות, שהן בדרך כלל הרלוונטיות לכשל האחרון.\nכך ניתן לזהות בעיות כמו פורט תפוס, שגיאת קונפיגורציה או קריסה של התהליך.\nפקודות כמו systemctl restart לא עוזרות לדיבוג, ו-dmesg (פקודה שמציגה הודעות מהקרנל של מערכת ההפעלה) מציגה לוגים של הקרנל ולא של השירות עצמו.",
          },
          {
            q: "צריך לבדוק אם שירות nginx פעיל.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "cat /var/log/nginx/error.log",
              "systemctl status nginx",
              "top -u nginx",
              "netstat -tlnp"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "systemctl status מציג את מצב השירות: האם הוא active, inactive או failed.\nבנוסף מוצגים ה-PID, זמן הפעילות, ושורות לוג אחרונות.\nזה נותן תמונה מלאה בפקודה אחת.\n\u200Ecat /var/log/nginx/error.log מציג שגיאות היסטוריות אבל לא אומר אם השירות רץ כרגע.\ntop (כלי לצפייה בתהליכים בזמן אמת) ו-netstat (כלי להצגת חיבורי רשת ופורטים פתוחים) נותנים מידע חלקי ולא מזהים בוודאות את מצב השירות.",
          },
          {
            q: "אתה רוצה לעקוב אחרי קובץ לוג בזמן אמת.\n\nאיזו פקודה הכי מתאימה?",
            options: [
              "cat /var/log/syslog",
              "grep error /var/log/syslog",
              "tail -f /var/log/syslog",
              "head -100 /var/log/syslog",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 2,
            explanation: "\u200Etail -f משאיר את הקובץ פתוח ומציג שורות חדשות ברגע שנכתבות.\nזה הכלי הסטנדרטי למעקב אחרי לוגים בזמן deploy או בזמן דיבוג.\nאפשר לשלב עם סינון: \u200Etail -f /var/log/syslog | grep ERROR\n\u200Ecat מדפיס את כל התוכן ויוצא, בלי להמשיך לעקוב.\n\u200Egrep מחפש ויוצא, ו-\u200Ehead מציג שורות מתחילת הקובץ (הישנות ביותר).",
          },
          {
            q: "הרצת:\n\n```\n$ ps aux | grep myapp\n```\n\n```\nroot  4521  0.0  1.2  D  Jan05  0:00  /usr/bin/myapp\n```\n\nהתהליך תקוע במצב D (uninterruptible sleep).\n\nמה הסיבה הסבירה?",
            tags: ["process-d-state"],
            options: [
              "התהליך הושהה ידנית באמצעות שליחת סיגנל SIGSTOP",
              "התהליך תקוע בלולאה אינסופית שצורכת CPU מקסימלי",
              "התהליך הוא zombie שממתין לאיסוף ע\"י תהליך האב",
              "התהליך ממתין לפעולת I/O שלא מסתיימת, כמו דיסק או NFS"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 3,
            explanation: "מצב D (\u200EUninterruptible Sleep) בלינוקס מציין שתהליך ממתין לפעולת I/O ברמת הקרנל (\u200EKernel I/O wait).\nבמצב זה הקרנל לא מאפשר לשלוח לתהליך signals רגילים כדי לעצור אותו, אפילו לא \u200ESIGKILL.\nהמצב מופיע בדרך כלל כאשר תהליך מחכה למשאב מערכת כמו: גישה לדיסק, מערכת קבצים מרוחקת כמו \u200ENFS, בעיה בדרייבר storage, או \u200Eblock device איטי או תקוע.\nבגלל שהקרנל לא יכול להפסיק את פעולת ה-I/O באמצע, גם \u2066kill -9\u2069 לא יהרוג את התהליך עד שהפעולה תסתיים או שהמשאב יחזור לעבוד.",
          },
          {
            q: "שירות API לא מגיב. הרצת מהשרת המקומי:\n\n```\n$ curl -v http://remote-server:8080\n```\n\n```\nError: connect to remote-server port 8080 failed: Connection refused\n```\n\nמה אפשר להסיק מהשגיאה הזו?",
            tags: ["connection-refused"],
            options: [
              "השרת לא נגיש ברשת וה-packets לא מגיעים אליו",
              "אין תהליך שמאזין על פורט 8080 או ש-firewall דוחה בפועל",
              "יש בעיית DNS ושם השרת לא מצליח להתפענח",
              "תעודת TLS לא תקינה והחיבור נדחה בשלב ה-handshake",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "\u200EConnection refused אומר שהשרת היה נגיש ברשת, אבל דחה את החיבור באופן אקטיבי.\nברמת TCP, הלקוח שלח \u200ESYN והשרת הגיב ב-\u200ERST (Reset) במקום \u200ESYN-ACK.\nזה קורה כשאין תהליך שמאזין על הפורט, השירות למטה, או ש-firewall דוחה עם RST.\nהשוואה לשגיאות אחרות:\n\u200EConnection timed out = packets לא חוזרים, בעיית רשת או firewall שעושה drop.\n\u200ECould not resolve host = בעיית DNS.\n\u200ESSL/TLS errors = קורים רק אחרי שחיבור TCP הצליח.\nצעד ראשון לדיבוג: \u200Ess -tlnp | grep 8080 כדי לבדוק אם יש תהליך שמאזין על הפורט.",
          },
          {
            q: "מחקת קבצי לוג גדולים מ-/var/log אבל df -h עדיין מראה שהדיסק מלא.\n\nהרצת:\n\n```\n$ lsof +D /var/log/ | head -20\n```\n\nמה הפקודה הזו עוזרת לך לזהות?",
            tags: ["lsof-deleted-files"],
            options: [
              "קבצים שנמחקו אבל עדיין תופסים מקום בדיסק",
              "תהליכים שמחזיקים קבצים פתוחים בתיקייה",
              "קבצים שגדלו מעבר למגבלת ה-quota של המחיצה",
              "תהליכים שצורכים הכי הרבה I/O לדיסק"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "\u200Elsof (List Open Files) מציג קבצים פתוחים במערכת.\nהאופציה \u200E+D מחפשת קבצים פתוחים בתוך תיקייה ספציפית.\nבלינוקס, כשמוחקים קובץ שתהליך עדיין כותב אליו, הקובץ נעלם מ-ls אבל ה-inode נשאר תפוס.\nהדיסק לא מתפנה כל עוד התהליך מחזיק את ה-file descriptor.\n\u200Elsof +D /var/log עוזר לזהות איזה תהליך מחזיק את הקובץ כדי לסגור את ה-handle.",
          },
        ],
        questionsEn: [
          {
            q: "You need to find the process consuming the most memory.\n\nWhich command is most appropriate?",
            options: [
              "vmstat 1 | tail -n 5",
              "cat /proc/meminfo | head",
              "ps aux --sort=-%mem | head",
              "free -m | grep Mem"],
            hint: "Think carefully about what each option describes.",
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
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "The output shows 96% disk usage on root, only 2GB left out of 50GB.\nAt 100%, services stop writing logs, databases may crash, and SSH can go down.\nThe first step is to identify what is consuming space using the command du -sh /*, which shows the size of each top-level directory.\nCommon culprits are /var/log or /tmp.\nfsck repairs filesystem errors and does not free space, and deleting all of /var/log risks destroying critical logs.",
          },
          {
            q: "A service won't start after a server reboot.\n\nWhich command will show the service logs?",
            options: [
              "systemctl restart service-name",
              "cat /etc/systemd/system/service-name.service",
              "dmesg | tail",
              "journalctl -u service-name --no-pager -n 50"],
            hint: "Think carefully about what each option describes.",
            answer: 3,
            explanation: "To understand why the service is not starting, you need to check its logs.\nThe command journalctl -u service-name --no-pager -n 50 shows the service logs from systemd (the Linux service manager) and helps identify the startup error.\nThe -n 50 option limits the output to the last 50 lines, which are usually the most relevant to the recent failure.\nThis allows you to identify issues such as port conflicts, configuration errors, or process crashes.\nCommands like systemctl restart do not help with debugging, and dmesg (a command that shows messages from the operating system kernel) displays kernel logs, not service-specific logs.",
          },
          {
            q: "You need to check if the nginx service is running.\n\nWhich command is most appropriate?",
            options: [
              "cat /var/log/nginx/error.log",
              "systemctl status nginx",
              "top -u nginx",
              "netstat -tlnp"],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "systemctl status shows the service state: active, inactive, or failed.\nIt also displays the PID, uptime, and recent log lines.\nThis gives a complete picture in a single command.\ncat /var/log/nginx/error.log shows historical errors but does not indicate if the service is currently running.\ntop (a tool for viewing running processes in real time) and netstat (a tool for displaying network connections and open ports) provide partial information and cannot reliably confirm service state.",
          },
          {
            q: "You want to follow a log file in real time.\n\nWhich command is most appropriate?",
            options: [
              "cat /var/log/syslog",
              "grep error /var/log/syslog",
              "tail -f /var/log/syslog",
              "head -100 /var/log/syslog",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 2,
            explanation: "tail -f keeps the file open and displays new lines as they are written.\nThis is the standard tool for watching logs in real time during deploys or debugging.\nCan be combined with filtering: tail -f /var/log/syslog | grep ERROR\ncat prints all content and exits without following new lines.\ngrep searches and exits, and head shows lines from the start of the file (oldest).",
          },
          {
            q: "You ran:\n\n```\n$ ps aux | grep myapp\n```\n\n```\nroot  4521  0.0  1.2  D  Jan05  0:00  /usr/bin/myapp\n```\n\nThe process is stuck in D state (uninterruptible sleep).\n\nWhat is the likely cause?",
            tags: ["process-d-state"],
            options: [
              "The process was manually suspended by sending it SIGSTOP",
              "The process is stuck in an infinite loop consuming excessive CPU",
              "The process is a zombie waiting to be reaped by its parent",
              "The process is waiting for a stalled I/O operation like disk or NFS"],
            hint: "Think carefully about what each option describes.",
            answer: 3,
            explanation: "D state (Uninterruptible Sleep) in Linux means the process is waiting for a kernel-level I/O operation (Kernel I/O wait).\nIn this state the kernel does not allow sending regular signals to stop the process, not even SIGKILL.\nThis typically happens when a process is waiting for a system resource such as: disk access, a remote filesystem like NFS, a storage driver issue, or a slow or stuck block device.\nBecause the kernel cannot interrupt the I/O operation in progress, even kill -9 will not terminate the process until the operation completes or the resource becomes available again.",
          },
          {
            q: "An API service is not responding. You ran from the local server:\n\n```\n$ curl -v http://remote-server:8080\n```\n\n```\nError: connect to remote-server port 8080 failed: Connection refused\n```\n\nWhat can you conclude from this error?",
            tags: ["connection-refused"],
            options: [
              "The server is unreachable and packets are not arriving",
              "No process is listening on port 8080 or a firewall is actively rejecting",
              "There is a DNS issue and the hostname cannot be resolved",
              "The TLS certificate is invalid and the connection was rejected during handshake",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "Connection refused means the server was reachable on the network, but actively rejected the connection.\nAt the TCP level, the client sent a SYN and the server responded with RST (Reset) instead of SYN-ACK.\nThis happens when no process is listening on the port, the service is down, or a firewall is rejecting with RST.\nComparison to other errors:\nConnection timed out = packets are not coming back, network issue or firewall doing drop.\nCould not resolve host = DNS issue.\nSSL/TLS errors = only happen after a TCP connection succeeds.\nFirst debugging step: ss -tlnp | grep 8080 to check if a process is listening on the port.",
          },
          {
            q: "You deleted large log files from /var/log but df -h still shows the disk is full.\n\nYou ran:\n\n```\n$ lsof +D /var/log/ | head -20\n```\n\nWhat does this command help you identify?",
            tags: ["lsof-deleted-files"],
            options: [
              "Files that were deleted but still consume disk space",
              "Processes that are holding open files in the directory",
              "Files that exceeded the partition quota limit",
              "Processes that are consuming the most disk I/O"],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "lsof (List Open Files) shows files that are currently open on the system.\nThe +D option searches for open files under a specific directory.\nIn Linux, when you delete a file that a process is still writing to, the file disappears from ls but the inode remains occupied.\nThe disk space is not freed as long as the process holds the file descriptor.\nlsof +D /var/log helps identify which process is holding the file so you can close the handle.",
          },
        ],
      },
      medium: {
        theory: "CPU, זיכרון ותהליכים\n🔹 `top` \u200E\u2013 תצוגה בזמן אמת (P למיון CPU, M לזיכרון)\n🔹 `%us` משתמש, `%sy` קרנל, `%wa` I/O wait, `%id` פנוי\n🔹 `free -h` \u200E\u2013 העמודה החשובה: `available`\n🔹 `uptime` \u200E\u2013 load average מעל מספר הליבות = עומס\n🔹 מצבי תהליכים: R=Running, S=Sleeping, D=I/O wait, Z=Zombie, T=Stopped\nCODE:\nps aux --sort=-%mem | head\n\nדיסק, רשת ולוגים\n🔹 `iostat -x` \u200E\u2013 ביצועי דיסק (`%util`, `await`, `r/s`, `w/s`)\n🔹 `ss -tlnp` \u200E\u2013 פורטים פתוחים ותהליכים שמאזינים\n🔹 `dmesg` \u200E\u2013 לוגים של הקרנל (OOM, שגיאות חומרה)\nCODE:\niostat -x 1 3\nss -tlnp | grep 8080",
        theoryEn: "CPU, Memory & Processes\n🔹 `top` \u2013 real-time view (P for CPU sort, M for memory)\n🔹 `%us` user, `%sy` kernel, `%wa` I/O wait, `%id` idle\n🔹 `free -h` \u2013 the key column: `available`\n🔹 `uptime` \u2013 load average above core count = overloaded\n🔹 Process states: R=Running, S=Sleeping, D=I/O wait, Z=Zombie, T=Stopped\nCODE:\nps aux --sort=-%mem | head\n\nDisk, Network & Logs\n🔹 `iostat -x` \u2013 disk performance (`%util`, `await`, `r/s`, `w/s`)\n🔹 `ss -tlnp` \u2013 listening ports and associated processes\n🔹 `dmesg` \u2013 kernel logs (OOM, hardware errors)\nCODE:\niostat -x 1 3\nss -tlnp | grep 8080",
        questions: [
          {
            q: "שרת מגיב לאט. מריצים top ורואים:\n\n```\ntop\n```\n\n```\n%Cpu(s): 72.5 us, 18.0 sy, 0.3 ni, 5.0 id, 4.0 wa, 0.0 hi, 0.2 si\n```\n\nמה מעיד על עומס גבוה על ה-CPU?",
            options: [
              "ערך %wa גבוה (4.0%) - המעבד ממתין לדיסק",
              "ערך %id נמוך (5.0%) - המעבד כמעט לא פנוי",
              "ערך %ni גבוה (0.3%) - תהליכים עם עדיפות שונה",
              "ערך %si גבוה (0.2%) - פסיקות תוכנה תכופות"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "הפלט של `top` מציג כיצד זמן ה-CPU מתחלק בין סוגי פעילות שונים.\nבשורה זו:\nus + sy = 90.5% זמן CPU משמש לעבודה אמיתית (תהליכים + kernel).\nid = 5.0% בלבד, כלומר רק 5% מהזמן ה-CPU פנוי.\nלכן ניתן להסיק שהשרת תחת עומס CPU גבוה.\nus - זמן CPU עבור תהליכים במרחב משתמש (user space)\nsy - זמן CPU עבור kernel\nid - זמן CPU פנוי\nwa - זמן המתנה ל-I/O (דיסק/רשת)",
          },
          {
            q: "שרת production מגיב לאט. בודקים את מצב הזיכרון:\n\n```\nfree -h\n```\n\nפלט:\n\n```\n               total        used        free      shared  buff/cache   available\nMem:            16G         15G        200M       100M        800M        500M\n```\n\nמה הפרשנות הנכונה למצב הזיכרון",
            tags: ["memory-available"],
            options: [
              "הזיכרון כמעט אזל - `available` רק `500M` מתוך `16G`",
              "אין בעיה - `free` נמוך כי Linux משתמש ב-RAM ל-cache, וזה צפוי",
              "צריך restart כדי לשחרר את ה-`800M` שתפוסים ב-buff/cache",
              "המצב תקין - `used` כולל cache שישוחרר אוטומטית בעת הצורך",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "בפלט `free`, העמודה הקריטית היא `available`, לא `free`.\n`available` (`500M` מתוך `16G`, כ-3%) מציג כמה זיכרון באמת פנוי לתהליכים חדשים, כולל cache שניתן לשחרר.\nזה מצב מסוכן - המערכת עלולה להתחיל להשתמש ב-swap או להפעיל OOM Killer.\n`free` (`200M`) מטעה כי Linux מנצל RAM פנוי ל-cache, ולכן `free` נמוך זה נורמלי.\nאבל כאן גם `available` נמוך, מה שאומר שגם אחרי שחרור cache אין מספיק זיכרון.\nfree - זיכרון RAM שלא בשימוש כלל\nbuff/cache - cache של ה-kernel, ניתן לשחרור כשצריך\navailable - הזיכרון שבאמת פנוי לאפליקציות (המדד החשוב)",
          },
          {
            q: "הרצת:\n\n```\nuptime\n```\n\nפלט:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nהשרת הוא `4-core`.\nמה אומר ה-load average על מצב השרת",
            options: [
              "השרת תקין - load average סביר ביחס למספר הליבות",
              "העומס נגרם מ-2 משתמשים מחוברים במקביל",
              "load average לא קשור למספר ליבות המעבד",
              "עומס חמור - יש ביקוש פי 3 מקיבולת ה-CPU"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 3,
            explanation: "load average מודד כמה תהליכים רצים או ממתינים ל-CPU בכל רגע.\nשלושת המספרים מייצגים ממוצע של דקה, 5 דקות ו-15 דקות.\nהכלל: load average השווה למספר הליבות = ניצולת מלאה.\nבשרת `4-core`, load של `4.0` = 100% ניצולת.\nload של `12.5` = כ-312%, עומס חמור, תהליכים ממתינים בתור.\nהמגמה עולה (`8.2` \u2190 `11.8` \u2190 `12.5`), המצב מחמיר.\nמספר המשתמשים המחוברים (2) לא קשור ל-load.\n\nLoad Average - כלל אצבע:\nload = מספר תהליכים שרצים או מחכים ל-CPU.\n`1.0` על 1 ליבה \u2190 ניצולת מלאה.\n`4.0` על 4 ליבות \u2190 ניצולת מלאה.\n`12.5` על 4 ליבות \u2190 ביקוש פי 3 מהקיבולת.",
          },
          {
            q: "הרצת:\n\n```\nss -tlnp\n```\n\nפלט:\n\n```\nState   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process\nLISTEN  0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN  0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nמה אנחנו רואים?",
            options: [
              "nginx מאזין על פורטים 80 ו-443 על כל ממשקי הרשת",
              "nginx לא פועל כי אין חיבורים פעילים שמופיעים בפלט",
              "יש בעיית firewall שחוסמת גישה לפורטים 80 ו-443",
              "nginx מאזין רק על localhost ולא נגיש מבחוץ",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "הפלט מראה ש-nginx מאזין על פורטים 80 ו-443.\nהכתובת 0.0.0.0 אומרת שהשירות מאזין על כל ממשקי הרשת, כלומר נגיש מבחוץ.\nLISTEN מוכיח שהשירות פועל ומחכה לחיבורים נכנסים.\nאם הכתובת הייתה 127.0.0.1 זה היה רק localhost, לא נגיש מבחוץ.\nss לא מציג חוקי firewall, לכן נגישות מבחוץ צריכה בדיקה נפרדת.",
          },
          {
            q: "שרת production רושם לוגים לקובץ בגודל 2GB.\nפורמט כל שורה:\n\n```\n2025-03-28 14:23:01 ERROR Connection refused to database\n```\n\nצריך למצוא את כל שורות ה-ERROR מהשעה האחרונה.\n\nאיזו פקודה הכי מתאימה",
            options: [
              "`cat log.txt | grep ERROR | sort -t' ' -k1,2`",
              "`grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"`",
              "`head -1000 log.txt | grep ERROR | tail -50`",
              "`tail -f log.txt | grep ERROR --line-buffered`"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "בקובץ לוג של `2GB`, סינון כפול חוסך עיבוד מיותר.\ngrep ERROR מסנן רק שורות שגיאה, ו-grep עם `date` מצמצם לשעה האחרונה לפי פורמט ה-timestamp.\ngrep ישירות על הקובץ (בלי `cat`) יעיל יותר כי לא יוצר pipe מיותר.\n`cat | grep` קורא את כל `2GB` בלי סינון זמן.\n`tail -f` עוקב אחרי שורות חדשות בזמן אמת ולא מחפש בהיסטוריה.\n`head -1000` מציג רק את תחילת הקובץ (השורות הישנות ביותר).",
          },
          {
            q: "הרצת:\n\n```\nps aux\n```\n\nאתה רואה תהליך במצב Z (zombie).\n\nמה הדרך הנכונה לטפל בו?",
            tags: ["process-zombie"],
            options: [
              "לזהות את תהליך האב ולהפעיל אותו מחדש כדי שיקרא `wait()`",
              "לשלוח `kill -9` ישירות לתהליך ה-zombie עצמו",
              "להפעיל מחדש את השרת כדי לנקות את טבלת התהליכים",
              "להתעלם מהתהליך כי zombies נעלמים מעצמם תמיד"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "תהליך zombie (Z) כבר סיים לרוץ, אבל הרשומה שלו נשארת בטבלת התהליכים.\nהסיבה: תהליך האב לא קרא `wait()` (פונקציית מערכת שמחכה לסיום תהליך בן ואוספת את קוד היציאה שלו) כדי לאסוף את ה-\u2066exit status\u2069.\nהפתרון הוא לזהות את תהליך האב ולהפעיל אותו מחדש כדי שיטפל ב-zombies.\n`kill -9` על zombie לא עובד כי התהליך כבר מת, אין מה להרוג.\nzombies לא נעלמים מעצמם ודורשים טיפול של תהליך האב.",
          },
          {
            q: "הרצת:\n\n```\niostat -x 1 3\n```\n\nפלט:\n\n```\nDevice    r/s      w/s    rkB/s     wkB/s   await   %util\nsda      5.00   450.00    20.00  51200.00  250.00   99.80\n```\n\nמה המסקנה",
            options: [
              "הבעיה היא רק בכמות הכתיבות הגבוהה לדיסק",
              "כמות הקריאות נמוכה (\u20665/s\u2069) ומעידה על בעיית ביצועים",
              "הדיסק תקין - ערכי \u2066%util\u2069 גבוהים זה רגיל בשרת עמוס",
              "הדיסק רווי \u2066(%util = 99.8%)\u2069 עם \u2066await\u2069 גבוה של \u2066250ms\u2069"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 3,
            explanation: "\u2066%util = 99.8%\u2069 אומר שהדיסק עסוק כמעט כל הזמן, כלומר הוא רווי.\n\u2066await = 250ms\u2069 אומר שכל פעולת \u2066I/O\u2069 לוקחת רבע שנייה. ל-SSD תקין הערך הוא מתחת ל-\u20661ms\u2069.\nהשילוב של \u2066%util\u2069 גבוה ו-\u2066await\u2069 גבוה מצביע על דיסק שלא מספיק לעמוס.\nהכתיבות \u2066(450/s, ~50MB/s)\u2069 הן הגורם העיקרי, לא הקריאות \u2066(5/s)\u2069.\nכל תהליך שניגש לדיסק יואט עד שהעומס יפחת.",
          },
          {
            q: "קונטיינר נהרג באופן בלתי צפוי.\n\nהרצת:\n\n```\ndmesg | tail -20\n```\n\nפלט:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nמה קרה ומה הפתרון?",
            tags: ["linux-oom-killer"],
            options: [
              "התהליך נהרג כי חרג ממגבלת ה-cgroup CPU shares",
              "התהליך קרס בגלל segfault עקב גישה לזיכרון לא חוקי",
              "OOM Killer הרג את התהליך כי חרג ממגבלת הזיכרון",
              "התהליך נהרג כי ה-swap נגמר והמערכת ביצעה graceful shutdown"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "top output shows how CPU time is distributed across different types of activity.\nIn this line:\nus + sy = 90.5% of CPU time is used for actual work (processes + kernel).\nid = 5.0%, meaning only 5% of the CPU time is idle.\nTherefore the system is under high CPU load.\nus - CPU time spent running user processes\nsy - CPU time spent in the kernel\nid - idle CPU time\nwa - time waiting for I/O (disk/network)",
          },
          {
            q: "A production server is responding slowly. You check memory usage:\n\n```\nfree -h\n```\n\nOutput:\n\n```\n               total        used        free      shared  buff/cache   available\nMem:            16G         15G        200M       100M        800M        500M\n```\n\nWhat is the correct interpretation of the memory state",
            tags: ["memory-available"],
            options: [
              "Memory is nearly exhausted - only 500M available out of 16G",
              "No issue - free is low because Linux uses RAM for cache, which is expected",
              "A restart is needed to release the 800M held in buff/cache",
              "The state is healthy - used includes cache that will be freed automatically when needed",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "In free output, the critical column is available, not free.\navailable (500M out of 16G, about 3%) shows how much memory is actually usable for new processes, including reclaimable cache.\nThis is a dangerous state - the system may start swapping or trigger OOM Killer.\nfree (200M) is misleading because Linux uses spare RAM for cache, so low free is normal.\nBut here available is also low, meaning even after reclaiming cache there is not enough memory.\nfree - RAM not used at all\nbuff/cache - reclaimable kernel cache\navailable - memory actually available for applications (the key metric)",
          },
          {
            q: "You ran:\n\n```\nuptime\n```\n\nOutput:\n\n```\n 14:23:01 up 3 days,  2:15,  2 users,  load average: 12.50, 11.80, 8.20\n```\n\nThe server has 4 cores.\nWhat does the load average tell you about the server state",
            options: [
              "The server is healthy - load average is reasonable for this core count",
              "The load is caused by 2 users connected simultaneously",
              "Load average is unrelated to the number of CPU cores",
              "Severe overload - demand is 3x the CPU capacity"],
            hint: "Think carefully about what each option describes.",
            answer: 3,
            explanation: "Load average measures how many processes are running or waiting for CPU at any given time.\nThe three numbers represent averages over 1, 5, and 15 minutes.\nThe rule: load average equal to core count = full utilization.\nOn a 4-core server, load 4.0 = 100% utilization.\nLoad 12.5 = about 312%, severe overload with processes queuing.\nThe trend is rising (8.2 \u2192 11.8 \u2192 12.5), indicating the situation is worsening.\nThe number of connected users (2) is unrelated to load.\n\nLoad Average - Rule of Thumb:\nload = number of processes running or waiting for CPU.\n1.0 on 1 core \u2192 fully utilized.\n4.0 on 4 cores \u2192 fully utilized.\n12.5 on 4 cores \u2192 3x more demand than capacity.",
          },
          {
            q: "You ran:\n\n```\nss -tlnp\n```\n\nOutput:\n\n```\nState   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process\nLISTEN  0       128     0.0.0.0:80           0.0.0.0:*          users:((\"nginx\",pid=1234,fd=6))\nLISTEN  0       128     0.0.0.0:443          0.0.0.0:*          users:((\"nginx\",pid=1234,fd=7))\n```\n\nWhat do we see?",
            options: [
              "nginx is listening on ports 80 and 443 on all network interfaces",
              "nginx is not running because no active connections appear in output",
              "There is a firewall issue blocking access to ports 80 and 443",
              "nginx is listening only on localhost and is not externally accessible",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "The output shows nginx listening on ports 80 and 443.\nThe address 0.0.0.0 means the service is listening on all network interfaces, so it is externally accessible.\nLISTEN state proves the service is running and waiting for incoming connections.\nIf the address were 127.0.0.1, it would be localhost only, not externally accessible.\nss does not show firewall rules, so external access requires separate verification.",
          },
          {
            q: "A production server writes logs to a 2GB file.\nEach line format:\n\n```\n2025-03-28 14:23:01 ERROR Connection refused to database\n```\n\nYou need to find all ERROR lines from the last hour.\n\nWhich command is most appropriate",
            options: [
              "`cat log.txt | grep ERROR | sort -t' ' -k1,2`",
              "`grep ERROR log.txt | grep \"$(date -d '1 hour ago' '+%Y-%m-%d %H')\"`",
              "`head -1000 log.txt | grep ERROR | tail -50`",
              "`tail -f log.txt | grep ERROR --line-buffered`"],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "For a 2GB log file, double filtering avoids unnecessary processing.\ngrep ERROR filters only error lines, and grep with date narrows to the last hour based on the timestamp format.\ngrep directly on the file (without cat) is more efficient as it avoids an unnecessary pipe.\ncat | grep reads all 2GB without time filtering.\ntail -f follows new lines in real time and does not search history.\nhead -1000 shows only the start of the file (the oldest lines).",
          },
          {
            q: "You ran:\n\n```\nps aux\n```\n\nYou see a process in Z state (zombie).\n\nWhat is the correct way to handle it?",
            tags: ["process-zombie"],
            options: [
              "Identify the parent process and restart it so it calls wait()",
              "Send kill -9 directly to the zombie process itself",
              "Restart the server to clear the entire process table",
              "Ignore the process because zombies always disappear on their own"],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "A zombie (Z) process has already finished running, but its entry remains in the process table.\nThe reason: the parent process did not call wait() (a system call that waits for a child process to finish and collects its exit code) to collect the exit status.\nThe fix is to identify the parent process and restart it so it handles the zombies.\nkill -9 on a zombie does not work because the process is already dead.\nZombies do not disappear on their own and require the parent process to handle them.",
          },
          {
            q: "You ran:\n\n```\niostat -x 1 3\n```\n\nOutput:\n\n```\nDevice    r/s      w/s    rkB/s     wkB/s   await   %util\nsda      5.00   450.00    20.00  51200.00  250.00   99.80\n```\n\nWhat is the conclusion?",
            options: [
              "The problem is only the high number of writes to disk",
              "The low read count (5/s) indicates a disk performance problem",
              "The disk is fine - high %util values are normal under load",
              "Disk is saturated (%util 99.8%) with high await of 250ms"],
            hint: "Think carefully about what each option describes.",
            answer: 3,
            explanation: "%util of 99.8% means the disk is busy nearly all the time, indicating saturation.\nawait of 250ms means each I/O operation takes a quarter second. Normal SSD is under 1ms.\nThe combination of high %util and high await indicates the disk cannot keep up with the load.\nWrites (450/s, about 50MB/s) are the main contributor, not reads (5/s).\nEvery process accessing the disk will slow down until the load decreases.",
          },
          {
            q: "A container was unexpectedly killed.\n\nYou ran:\n\n```\ndmesg | tail -20\n```\n\nOutput:\n\n```\n[  512.123] Out of memory: Killed process 4521 (java)\n            total-vm:4048576kB, anon-rss:3145728kB\n```\n\nWhat happened and what is the solution?",
            tags: ["linux-oom-killer"],
            options: [
              "The process was killed for exceeding its cgroup CPU shares limit",
              "The process crashed due to a segfault from invalid memory access",
              "OOM Killer terminated the process for exceeding its memory limit",
              "The process was killed because swap ran out and the system shut it down"],
            hint: "Think carefully about what each option describes.",
            answer: 2,
            explanation: "The message Out of memory: Killed process in dmesg indicates that the kernel OOM Killer terminated the process due to memory exhaustion.\nWhen the system runs out of available RAM, the kernel selects a memory-hungry process and kills it to free resources.\nIn the output we see that the java process was terminated, and the anon-rss value shows how much RAM the process was actually using.\nThis situation can happen when a process consumes too much memory or when its memory limit is set too low, such as inside a container.",
          },
        ],
      },
      hard: {
        theory: "אבחון מערכת מתקדם וניתוח ביצועים ברמת kernel.\n🔹 `strace -c -p PID`\nסיכום system calls לפי זמן, מזהה צווארי בקבוק (`futex` = lock contention)\n🔹 `perf top`\nprofiling בזמן אמת, מציג פונקציות שצורכות הכי הרבה CPU\n🔹 `/proc/net/sockstat`\nמצב TCP stack - orphans, TIME_WAIT, צריכת זיכרון\n🔹 `/proc/buddyinfo`\nmemory fragmentation - בלוקים פנויים ב-buddy allocator\n🔹 `/proc/PID/fd`\nfile descriptors פתוחים - זיהוי FD leaks\n🔹 `sar -n DEV`\nסטטיסטיקות רשת - bandwidth, drops, packets per second\n🔹 `errno.h`\nקודי שגיאה ב-kernel - `ENOMEM`=`-12`, `EACCES`=`-13`, `EINVAL`=`-22`\nCODE:\nstrace -c -p 1234\nperf top\nperf record -g -a sleep 10 && perf report\ncat /proc/net/sockstat\nls /proc/1234/fd | wc -l\nsar -n DEV 1 5",
        theoryEn: "Advanced system diagnostics and kernel-level performance analysis.\n🔹 `strace -c -p PID`\nSummarize system calls by time, identifies bottlenecks (futex = lock contention)\n🔹 `perf top`\nReal-time profiling, shows functions consuming the most CPU\n🔹 `/proc/net/sockstat`\nTCP stack state - orphans, TIME_WAIT, memory usage\n🔹 `/proc/buddyinfo`\nMemory fragmentation - free blocks in the buddy allocator\n🔹 `/proc/PID/fd`\nOpen file descriptors - detecting FD leaks\n🔹 `sar -n DEV`\nNetwork statistics - bandwidth, drops, packets per second\n🔹 `errno.h`\nKernel error codes - ENOMEM=-12, EACCES=-13, EINVAL=-22\nCODE:\nstrace -c -p 1234\nperf top\nperf record -g -a sleep 10 && perf report\ncat /proc/net/sockstat\nls /proc/1234/fd | wc -l\nsar -n DEV 1 5",
        questions: [
          {
            q: "תהליך מסוים רץ לאט.\nהפקודה `strace -c` מסכמת כמה זמן התהליך מבלה בכל system call.\n\nהרצת:\n\n```\nstrace -c -p 1234\n```\n\nפלט:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nמה הממצא העיקרי",
            options: [
              "התהליך מבזבז זמן על קריאות read בגלל חוסר caching",
              "התהליך ממתין ל-locks רוב הזמן בגלל תחרות בין threads",
              "התהליך כותב יותר מדי נתונים בגלל buffer קטן",
              "התהליך פועל כרגיל ואין כאן בעיית ביצועים"],
            hint: "שימו לב לאיזה system call התהליך מבלה את רוב הזמן.",
            answer: 1,
            explanation: "הפקודה `strace -c` מסכמת את ה-system calls של תהליך לפי זמן.\nfutex הוא ה-system call שמשמש לנעילות (locks) בין threads.\nכאשר תהליך מבלה 85% מהזמן על futex, המשמעות היא שהוא ממתין לנעילות במקום לעשות עבודה אמיתית.\nזה מצביע על lock contention - מצב שבו threads חוסמים אחד את השני.",
          },
          {
            q: "שרת מדווח על latency גבוה לבקשות רשת.\n\nהרצת:\n\n```\ncat /proc/net/sockstat\n```\n\nפלט:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nמה הבעיה?",
            tags: ["tcp-socket-leak"],
            options: [
              "כל המספרים בטווח הנורמלי עבור שרת תחת עומס",
              "מספר ה-TCP connections (28542) נמוך מדי עבור שרת פעיל",
              "צריכת הזיכרון של ה-TCP stack (95000 pages) היא תקינה",
              "orphan (12500) ו-TIME_WAIT (65000) מצביעים על חיבורים שלא נסגרים"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 3,
            explanation: "/proc/net/sockstat מציג סטטיסטיקות על מצב חיבורי ה-TCP במערכת.\nהערכים tw 65000 ו-orphan 12500 גבוהים מאוד ומעידים על מספר גדול של חיבורים שלא נסגרו בצורה תקינה.\nTIME_WAIT (tw) הוא מצב שבו חיבור TCP נשאר פתוח לזמן קצר אחרי סגירה כדי למנוע בעיות בפרוטוקול. מספר גדול מאוד של חיבורים במצב זה בדרך כלל מעיד על קצב גבוה של חיבורים קצרים.\norphan sockets הם חיבורים שאין להם תהליך שמנהל אותם יותר. מצב כזה יכול להיווצר כאשר תהליך נסגר לפני שהחיבור נסגר בצורה תקינה.\nכאשר יש הרבה TIME_WAIT ו-orphan sockets, זה יכול לגרום לעומס על ה-TCP stack ולפגוע בביצועי הרשת, ולכן זו כנראה הסיבה ל-latency הגבוה.",
          },
          {
            q: "שרת Linux נכשל בהקצאות זיכרון גדולות. בודקים את מצב ה-buddy allocator:\n\n```\ncat /proc/buddyinfo\n```\n\nפלט:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nמה ניתן להסיק מהפלט",
            options: [
              "יש memory fragmentation חמור ואין בלוקים רציפים גדולים",
              "המספרים תקינים ומייצגים שימוש רגיל ב-buddy allocator",
              "הזיכרון הפיזי ריק לגמרי ויש צורך להוסיף RAM",
              "יש בעיית swap שגורמת לפיצול דפים בזיכרון",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "ב-Linux, ה-buddy allocator מנהל זיכרון פיזי בבלוקים בגדלים עולים: order 0 = `4KB`, עד order 10 = `4MB`.\n`/proc/buddyinfo` מציג כמה בלוקים פנויים יש בכל order.\nבפלט הזה יש רק בלוק אחד של `4KB` פנוי, כל שאר ה-orders באפס.\nזה fragmentation קיצוני: הזיכרון לא ריק, אבל כל הבלוקים הגדולים מפוצלים לחתיכות קטנות.\nהקצאות שדורשות דפים רציפים (huge pages, DMA buffers) ייכשלו.\nבמצב בריא רואים מספרים חיוביים בכל ה-orders.",
          },
          {
            q: "אתה חושד שתהליך מדליף file descriptors.\n\nהרצת:\n\n```\n$ ls /proc/1234/fd | wc -l\n45892\n\n$ cat /proc/1234/limits | grep 'Max open files'\nMax open files    65536    65536    files\n```\n\nמה המצב ומה עלול לקרות?",
            tags: ["fd-leak"],
            options: [
              "המגבלה של 65,536 נמוכה מדי ויש להגדיל אותה בהתאם",
              "מספר כזה של FDs פתוחים הוא תקין לשרת תחת עומס",
              "התהליך מתקרב למגבלה (45,892 מתוך 65,536) ויכשל עם EMFILE",
              "הפער בין soft limit ל-hard limit הוא שגורם לבעיה"],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 2,
            explanation: "לתהליך יש 45,892 FDs פתוחים מתוך מגבלה של 65,536 (כ-70%).\nשרת בריא מחזיק בדרך כלל מאות עד אלפים בודדים, 45,892 מעיד על דליפה.\nכשהתהליך יגיע למגבלה, כל `open()`, `socket()` או `accept()` ייכשל עם שגיאת EMFILE.\nהגדלת ה-limit לא פותרת, רק דוחה את הקריסה.\nצריך לזהות ולתקן את מקור הדליפה.",
          },
          {
            q: "הרצת:\n\n```\nsar -n DEV 1 5\n```\n\nפלט (ממוצע):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nכרטיס הרשת הוא 1Gbps. מה הבעיה?",
            options: [
              "ה-throughput קרוב למגבלת ה-NIC של 1Gbps - כרטיס הרשת רווי ומאבד מנות",
              "הפרוטוקול הוא TCP - מעבר ל-UDP יפחית את ה-overhead ויפתור את הבעיה",
              "הבעיה היא ב-packet drops בצד ה-tx - צריך לבדוק את ה-txdrop counter",
              "הערכים תקינים לשרת בעומס גבוה - אין כאן חריגה מהנורמה",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
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
            hint: "חשבו על הקצאת אחסון שנשמר מעבר לחיי Pod.",
            answer: 1,
            explanation: "טווח הפורטים הזמין הוא 32768-60999, כלומר 28,232 פורטים בסך הכל.\nss -s מראה 28,231 חיבורים פעילים, נשאר פורט אחד בלבד.\nחיבור חדש ייכשל עם EADDRNOTAVAIL כי אין פורטים פנויים.\nהפתרון המיידי הוא להרחיב את הטווח או להפעיל tcp_tw_reuse.\nלטווח ארוך, connection pooling מונע מצב שבו כל בקשה פותחת חיבור חדש.",
          },
          {
            q: "אתה בודק שגיאות בלוגים של הקרנל ומריץ:\n\n```\ndmesg | grep -i error\n```\n\nפלט:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nבלוגים של הקרנל, מספרים שליליים מייצגים קודי שגיאה מוגדרים (\u2066errno\u2069).\n\nמה `error -12` מציין ככל הנראה",
            options: [
              "\u2066ENOMEM\u2069 - הקרנל לא הצליח להקצות זיכרון עבור ה-\u2066driver\u2069",
              "\u2066EACCES\u2069 - ה-\u2066driver\u2069 דורש הרשאות \u2066root\u2069 כדי להיטען",
              "\u2066EIO\u2069 - שגיאת חומרה פיזית בכרטיס הגרפי",
              "\u2066ENOENT\u2069 - קובץ ה-\u2066driver\u2069 לא נמצא במערכת",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "בקרנל, \u2066drivers\u2069 מחזירים ערכי \u2066errno\u2069 שליליים כקודי שגיאה. הערך \u2066-12\u2069 מתאים ל-\u2066ENOMEM\u2069, כלומר הקרנל לא הצליח להקצות זיכרון.\nזה קורה כשה-\u2066driver\u2069 מנסה לאתחל חומרה ולא מצליח להקצות את הזיכרון הדרוש.\n\nקודי \u2066errno\u2069 נפוצים:\n```\n-1   EPERM    (operation not permitted)\n-2   ENOENT   (no such file)\n-5   EIO      (I/O error)\n-12  ENOMEM   (out of memory)\n-13  EACCES   (permission denied)\n```",
          },
        ],
        questionsEn: [
          {
            q: "A process is running slowly.\nThe command `strace -c` summarizes how much time a process spends in each system call.\n\nYou ran:\n\n```\nstrace -c -p 1234\n```\n\nOutput:\n\n```\n% time    seconds  calls  syscall\n------ ---------- ------ --------\n 85.20   4.260000   1200  futex\n  8.30   0.415000    500  read\n  3.10   0.155000    200  write\n```\n\nWhat is the main finding",
            options: [
              "The process wastes time on read calls due to poor caching",
              "The process spends most of its time waiting for locks between threads",
              "The process writes too much data because of a small buffer",
              "The process is running normally with no performance issue"],
            hint: "Notice which system call the process spends most of its time on.",
            answer: 1,
            explanation: "The command `strace -c` summarizes a process's system calls by time.\nfutex is the system call used for locking (locks) between threads.\nWhen a process spends 85% of its time on futex, it means it is waiting for locks instead of doing real work.\nThis indicates lock contention - a situation where threads are blocking each other.",
          },
          {
            q: "A server reports high latency for network requests.\n\nYou ran:\n\n```\ncat /proc/net/sockstat\n```\n\nOutput:\n\n```\nTCP: inuse 28542 orphan 12500 tw 65000 alloc 29000 mem 95000\n```\n\nWhat is the problem?",
            tags: ["tcp-socket-leak"],
            options: [
              "All numbers are within normal range for a server under load",
              "TCP connection count (28542) is too low for an active server",
              "TCP stack memory usage (95000 pages) is within normal range",
              "Orphan (12500) and TIME_WAIT (65000) indicate connections not closing properly"],
            hint: "Think carefully about what each option describes.",
            answer: 3,
            explanation: "/proc/net/sockstat shows statistics about the TCP connection state on the system.\nThe values tw 65000 and orphan 12500 are very high and indicate a large number of connections that were not closed cleanly.\nTIME_WAIT (tw) is a TCP state where a connection remains temporarily after closing to ensure protocol correctness. A very large number of connections in this state usually indicates a high rate of short-lived connections.\norphan sockets are connections that no longer have an owning process. This can happen when a process exits before the connection is properly closed.\nWhen many sockets are in TIME_WAIT or orphan state, it can put pressure on the TCP stack and degrade network performance, which likely explains the high latency.",
          },
          {
            q: "A Linux server is failing large memory allocations. You check the buddy allocator state:\n\n```\ncat /proc/buddyinfo\n```\n\nOutput:\n\n```\nNode 0, zone   Normal   1  0  0  0  0  0  0  0  0  0  0\n```\n\nWhat can be inferred from this output",
            options: [
              "Severe memory fragmentation with no large contiguous blocks available",
              "The numbers are normal and represent typical buddy allocator usage",
              "Physical memory is completely empty and more RAM needs to be added",
              "There is a swap issue causing page fragmentation in memory",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "The Linux buddy allocator manages physical memory by splitting it into blocks of increasing size: order 0 = 4KB up to order 10 = 4MB.\n/proc/buddyinfo shows how many free blocks exist at each order.\nThis output shows only one 4KB block free, with all other orders at zero.\nThis is extreme fragmentation: memory is not empty, but all large blocks have been split into small pieces.\nAllocations requiring contiguous pages (huge pages, DMA buffers) will fail.\nA healthy system shows positive numbers across all orders.",
          },
          {
            q: "You suspect a process is leaking file descriptors.\n\nYou ran:\n\n```\n$ ls /proc/1234/fd | wc -l\n45892\n\n$ cat /proc/1234/limits | grep 'Max open files'\nMax open files    65536    65536    files\n```\n\nWhat is the situation and what might happen?",
            tags: ["fd-leak"],
            options: [
              "The limit of 65,536 is too low and should be increased accordingly",
              "This number of open FDs is normal for a server under heavy load",
              "The process is approaching its limit (45,892/65,536) and may fail with EMFILE",
              "The gap between soft limit and hard limit is what causes the problem"],
            hint: "Think carefully about what each option describes.",
            answer: 2,
            explanation: "The process has 45,892 open FDs out of a 65,536 limit (about 70%).\nA healthy server typically holds hundreds to low thousands, so 45,892 indicates a leak.\nWhen the limit is reached, every open(), socket(), or accept() call will fail with EMFILE.\nRaising the limit does not fix the problem, it only delays the crash.\nThe root cause (the leak) must be identified and fixed.",
          },
          {
            q: "You ran:\n\n```\nsar -n DEV 1 5\n```\n\nOutput (average):\n\n```\nIFACE   rxpck/s  txpck/s   rxkB/s   txkB/s  rxdrop/s  txdrop/s\neth0    95000    92000    115000    110000     850       0\n```\n\nThe network card is 1Gbps. What is the problem?",
            options: [
              "rxkB/s (115MB/s) approaches 1Gbps capacity with 850 drops/s",
              "The packet count (95,000/s) is too high and overloading the NIC",
              "The issue is with txdrop because the sending side cannot transmit",
              "Switching to UDP would reduce overhead and prevent packet drops",
            ],
            hint: "Think carefully about what each option describes.",
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
            hint: "Think carefully about what each option describes.",
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
            hint: "Think about storage that persists beyond a Pod's lifetime.",
            answer: 1,
            explanation: "The available port range is 32768-60999, which is 28,232 ports total.\nss -s shows 28,231 active connections, leaving only one port available.\nNew connections will fail with EADDRNOTAVAIL because there are no free ports.\nThe immediate fix is to expand the range or enable tcp_tw_reuse.\nLong term, connection pooling prevents the situation where every request opens a new connection.",
          },
          {
            q: "You are investigating kernel errors on a Linux system and run:\n\n```\ndmesg | grep -i error\n```\n\nOutput:\n\n```\n[    2.145] ACPI Error: AE_NOT_FOUND, Evaluating _STA (20230331/nseval-\n[    2.301] nouveau: probe of 0000:01:00.0 failed with error -12\n```\n\nIn Linux kernel logs, negative numbers often correspond to errno error codes.\n\nWhat does error -12 most likely indicate?",
            options: [
              "ENOMEM - the kernel failed to allocate memory for the driver",
              "EACCES - the driver requires root permissions to load",
              "EIO - a physical hardware error on the graphics card",
              "ENOENT - the driver file was not found on the system",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "In the kernel, drivers return negative errno values as error codes. The value -12 maps to ENOMEM, meaning the kernel failed to allocate memory.\nThis happens when a driver tries to initialize hardware and cannot allocate the required memory.\n\nCommon errno values:\n```\n-1   EPERM    (operation not permitted)\n-2   ENOENT   (no such file)\n-5   EIO      (I/O error)\n-12  ENOMEM   (out of memory)\n-13  EACCES   (permission denied)\n```",
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
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
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
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "ה-source of truth של GitOps הוא Git.\nכל שינוי בקלאסטר מתועד ב-Git.\nGit מנהל את הקונפיגורציה ומפקח על הכלים כמו ArgoCD ו־Helm.\nהשינויים תמיד נשמרים ב-Git, מה שמבטיח שקיפות ושחזור קל.",
          },
          {
            q: "מהנדס עשה `kubectl edit deployment` ישירות על הקלאסטר.\nאחרי כמה דקות ArgoCD מציג את האפליקציה כ-OutOfSync.\n\nלמה?",
            options: [
              "ArgoCD זיהה שהמצב בקלאסטר כבר לא תואם את Git",
              "kubectl edit גרם ל-ArgoCD לעשות restart",
              "ה-deployment נכשל כי ArgoCD חוסם שינויים ישירים",
              "ArgoCD מוחק אוטומטית שינויים שלא עברו דרך Git",
            ],
            hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
            answer: 0,
            explanation: "ArgoCD משווה באופן קבוע את המצב בקלאסטר ל-Git.\nשינוי ישיר בקלאסטר יוצר drift - המצב כבר לא תואם את Git.\nArgoCD לא חוסם שינויים ישירים ולא מוחק אותם אוטומטית (אלא אם מוגדר self-heal).\nהוא רק מדווח שיש פער.",
          },
          {
            q: "מה ההבדל בין Synced ל-Healthy ב-ArgoCD?",
            tags: ["gitops-sync"],
            options: [
              "Synced אומר שהמצב תואם Git, Healthy אומר שהמשאבים עובדים תקין",
              "Synced ו-Healthy שניהם מתארים את הקשר בין Git לקלאסטר",
              "Healthy אומר שהמצב תואם Git, Synced אומר שה-Pods עובדים תקין",
              "Synced מתייחס לחיבור בין ArgoCD ל-repo, Healthy למצב ה-controller",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
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
            hint: "חשבו על ניהול גרסאות והחזרה לאחור.",
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
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 0,
            explanation: "repoURL - כתובת ה-Git repository.\ntargetRevision: main - ה-branch שממנו לקרוא.\npath: deploy/production - התיקייה הספציפית שמכילה את ה-manifests.\nArgoCD יקרא רק manifests מתוך הנתיב הזה ב-branch main.",
          },
          {
            q: "מהנדס רואה שאפליקציה ב-ArgoCD מסומנת Synced אבל Degraded.\n\nמה הסיבה הסבירה?",
            options: [
              "ה-manifests ב-Git מכילים שגיאות syntax שלא עברו validation",
              "ה-manifests הוחלו בהצלחה אבל ה-Pods נכשלים ב-runtime",
              "ArgoCD לא מצליח להתחבר ל-Git repo ולכן לא יכול לסנכרן",
              "ה-namespace שמוגדר ב-destination לא קיים בקלאסטר עדיין",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 1,
            explanation: "Synced = ה-manifests הוחלו בהצלחה, הקלאסטר תואם את Git.\nDegraded = יש בעיה ב-runtime, למשל Pod ב-CrashLoopBackOff או ImagePullBackOff.\nהבעיה היא לא ב-manifests עצמם אלא באפליקציה או ב-image.\nאם Git לא נגיש, ה-sync status היה Unknown, לא Synced.",
          },
          {
            q: "מפתח דוחף שינוי ל-Git.\nArgoCD מוגדר עם auto-sync ו-self-heal.\n\nמהנדס אחר עושה `kubectl edit` ומשנה משהו ידנית בקלאסטר.\n\nמה יקרה?",
            tags: ["gitops-sync"],
            options: [
              "השינוי הידני יישאר כי ArgoCD לא עוקב אחרי שינויים בקלאסטר",
              "ArgoCD יזהה את ה-drift ויחזיר את המצב למה שמוגדר ב-Git",
              "ArgoCD יציג התראה ב-UI וימתין לאישור ידני לפני תיקון",
              "ArgoCD ימזג את השינוי הידני לתוך ה-Git repo אוטומטית",
            ],
            hint: "חשבו על הפקודה ומה היא עושה מאחורי הקלעים.",
            answer: 1,
            explanation: "self-heal אומר ש-ArgoCD לא רק מסנכרן כשיש שינוי ב-Git, אלא גם מתקן drift בקלאסטר.\nאם מישהו שינה משהו ידנית, ArgoCD יזהה את ההבדל ויחזיר את המצב למה שמוגדר ב-Git.\nזה מבטיח שה-Git repo נשאר ה-source of truth האמיתי.",
          },
        ],
        questionsEn: [
          {
            q: "An application payments-service shows as OutOfSync in ArgoCD after a deploy.\n\nWhat is the most appropriate first step",
            options: [
              "kubectl delete pod\non all Pods in the namespace",
              "kubectl apply\nmanually from the repo",
              "Check the diff between Git and the cluster state",
              "Delete the namespace and recreate it",
            ],
            hint: "Think about what OutOfSync means and how to investigate the gap.",
            answer: 2,
            explanation: "OutOfSync means the cluster state differs from Git.\nThe first step is always to check the diff to understand exactly what changed.\nDeleting Pods or the namespace is destructive and does not solve the problem.\n`kubectl apply` manually bypasses the GitOps process.",
          },
          {
            q: "In GitOps, what is the source of truth for the desired state of the cluster",
            options: [
              "The current cluster state as reported by kubectl",
              "A Git repository containing the manifests",
              "The ArgoCD dashboard showing the health status",
              "Helm release history stored in the cluster",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "The source of truth in GitOps is Git.\nEvery change in the cluster is documented in Git.\nGit manages the configuration and oversees tools like ArgoCD and Helm.\nChanges are always stored in Git, ensuring transparency and easy recovery.",
          },
          {
            q: "An engineer ran `kubectl edit deployment` directly on the cluster.\nAfter a few minutes ArgoCD shows the application as OutOfSync.\n\nWhy",
            options: [
              "ArgoCD detected that the cluster state no longer matches Git",
              "kubectl edit caused ArgoCD to restart",
              "The deployment failed because ArgoCD blocks direct changes",
              "ArgoCD automatically deletes changes that did not go through Git",
            ],
            hint: "Think about what the command does behind the scenes.",
            answer: 0,
            explanation: "ArgoCD continuously compares the cluster state to Git.\nA direct change in the cluster creates drift - the state no longer matches Git.\nArgoCD does not block direct changes and does not delete them automatically (unless self-heal is enabled).\nIt only reports that there is a gap.",
          },
          {
            q: "What is the difference between Synced and Healthy in ArgoCD",
            tags: ["gitops-sync"],
            options: [
              "Synced means the state matches Git, Healthy means the resources are running correctly",
              "Synced and Healthy both describe the relationship between Git and the cluster",
              "Healthy means the state matches Git, Synced means the Pods are running correctly",
              "Synced refers to the connection between ArgoCD and the repo, Healthy to the controller state",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 0,
            explanation: "These are two separate indicators:\nSync Status - whether the cluster state matches Git (Synced / OutOfSync).\nHealth Status - whether the resources themselves are healthy (Healthy / Degraded / Progressing).\nYou can be Synced but Degraded, for example when the manifests were applied but the Pod is in CrashLoopBackOff.",
          },
          {
            q: "A team wants to roll back to a previous version of an application.\nThey are using GitOps with ArgoCD.\n\nWhat is the correct approach",
            options: [
              "Click Rollback in the ArgoCD UI",
              "kubectl rollout undo",
              "Run git revert on the last commit and let ArgoCD sync",
              "Delete the Application in ArgoCD and recreate it with the old version",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 2,
            explanation: "In GitOps, every change should go through Git.\ngit revert creates a new commit that undoes the change, and ArgoCD will sync automatically.\n`kubectl rollout undo` and ArgoCD Rollback work, but they create drift from Git.\nThe goal is to keep Git as the source of truth.",
          },
          {
            q: "An ArgoCD Application is configured with:\n\n```\nsource:\n  repoURL: https://github.com/org/app\n  targetRevision: main\n  path: deploy/production\n```\n\nWhere will ArgoCD read the manifests from",
            options: [
              "From the deploy/production directory on the main branch of the repo",
              "From the root of the repo on the production branch",
              "From all directories in the repo on the main branch",
              "From deploy/production at the latest tag of the repo",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 0,
            explanation: "repoURL - the Git repository address.\ntargetRevision: main - the branch to read from.\npath: deploy/production - the specific directory containing the manifests.\nArgoCD will only read manifests from this path on the main branch.",
          },
          {
            q: "An engineer sees that an application in ArgoCD is marked Synced but Degraded.\n\nWhat is the likely cause",
            options: [
              "The manifests in Git contain syntax errors that failed validation",
              "The manifests were applied successfully but the Pods are failing at runtime",
              "ArgoCD cannot connect to the Git repo and therefore cannot sync",
              "The namespace defined in the destination does not exist in the cluster yet",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 1,
            explanation: "Synced = the manifests were applied successfully, the cluster matches Git.\nDegraded = there is a runtime issue, such as a Pod in CrashLoopBackOff or ImagePullBackOff.\nThe problem is not with the manifests themselves but with the application or the image.\nIf Git were unreachable, the sync status would be Unknown, not Synced.",
          },
          {
            q: "A developer pushes a change to Git.\nArgoCD is configured with auto-sync and self-heal.\n\nAnother engineer runs `kubectl edit` and makes a manual change in the cluster.\n\nWhat will happen",
            tags: ["gitops-sync"],
            options: [
              "The manual change will persist because ArgoCD does not track cluster changes",
              "ArgoCD will detect the drift and revert the state to what is defined in Git",
              "ArgoCD will display a warning in the UI and wait for manual approval before fixing",
              "ArgoCD will merge the manual change into the Git repo automatically",
            ],
            hint: "Think about what the command does behind the scenes.",
            answer: 1,
            explanation: "Self-heal means ArgoCD not only syncs when there is a change in Git, but also corrects drift in the cluster.\nIf someone made a manual change, ArgoCD will detect the difference and revert the state to what is defined in Git.\nThis ensures that the Git repo remains the true source of truth.",
          },
        ],
      },
      medium: {
        theory: "ArgoCD - הגדרות מתקדמות, Helm ו-sync strategies.\n🔹 Sync Waves:\u200E שליטה בסדר שבו ArgoCD מחיל משאבים (annotations עם sync wave number)\n🔹 Sync Hooks:\u200E Pre/Post sync jobs שרצים לפני או אחרי sync (migrations, tests)\n🔹 Helm עם ArgoCD:\u200E ArgoCD יכול לרנדר Helm charts ישירות ולנהל את ה-values מ-Git\n🔹 Prune:\u200E מחיקת משאבים מהקלאסטר שכבר לא קיימים ב-Git\n🔹 Retry:\u200E הגדרת מספר ניסיונות חוזרים כש-sync נכשל\n🔹 Ignore Differences:\u200E התעלמות מ-fields ספציפיים בהשוואה (למשל replicas שמנוהלים ע\"י HPA)\n🔹 Finalizers:\u200E cascading delete כשמוחקים Application\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n    retry:\n      limit: 5\n      backoff:\n        duration: 5s\n        factor: 2\n        maxDuration: 3m\n  ignoreDifferences:\n    - group: apps\n      kind: Deployment\n      jsonPointers:\n        - /spec/replicas",
        theoryEn: "ArgoCD advanced configuration, Helm, and sync strategies.\n🔹 Sync Waves - control the order in which ArgoCD applies resources (annotations with sync wave number)\n🔹 Sync Hooks - Pre/Post sync jobs that run before or after sync (migrations, tests)\n🔹 Helm with ArgoCD - ArgoCD can render Helm charts directly and manage values from Git\n🔹 Prune - delete resources from the cluster that no longer exist in Git\n🔹 Retry - configure retry attempts when sync fails\n🔹 Ignore Differences - ignore specific fields in comparison (e.g. replicas managed by HPA)\n🔹 Finalizers - cascading delete when removing an Application\nCODE:\napiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true\n    retry:\n      limit: 5\n      backoff:\n        duration: 5s\n        factor: 2\n        maxDuration: 3m\n  ignoreDifferences:\n    - group: apps\n      kind: Deployment\n      jsonPointers:\n        - /spec/replicas",
        questions: [
          {
            q: "אפליקציה ב-\u2066ArgoCD\u2069 מוגדרת עם \u2066auto-sync\u2069 ו-\u2066prune: true\u2069.\nמפתח מחק קובץ \u2066manifest\u2069 של \u2066ConfigMap\u2069 מה-\u2066Git repo\u2069.\n\nמה יקרה ל-\u2066ConfigMap\u2069 בקלאסטר?",
            options: [
              "\u2066ArgoCD\u2069 ימחק את ה-\u2066ConfigMap\u2069 מהקלאסטר כי הוא כבר לא קיים ב-\u2066Git\u2069",
              "\u2066ArgoCD\u2069 יתעלם מהשינוי כי ה-\u2066ConfigMap\u2069 כבר רץ בקלאסטר",
              "\u2066ArgoCD\u2069 יציג אזהרה ב-\u2066UI\u2069 וימתין לאישור ידני לפני מחיקה",
              "\u2066ArgoCD\u2069 ייכשל ב-\u2066sync\u2069 כי הוא מצפה שכל הקבצים קיימים ב-\u2066Git\u2069",
            ],
            hint: "חשבו על מה קורה כשמשאב נמחק מ-Git אבל עדיין קיים בקלאסטר.",
            answer: 0,
            explanation: "כש-\u2066prune: true\u2069 מוגדר, \u2066ArgoCD\u2069 משווה את מה שקיים בקלאסטר למה שמוגדר ב-\u2066Git\u2069.\nאם משאב קיים בקלאסטר אבל כבר לא קיים ב-\u2066Git\u2069, \u2066ArgoCD\u2069 ימחק אותו אוטומטית.\nבלי \u2066prune\u2069, \u2066ArgoCD\u2069 היה משאיר את המשאב בקלאסטר גם אחרי שנמחק מ-\u2066Git\u2069.\nחשוב להבין ש-\u2066prune\u2069 מוחק משאבים ללא אישור ידני, ולכן צריך להשתמש בו בזהירות.",
          },
          {
            q: "ArgoCD Application מוגדר עם Helm source:\n\n```yaml\nsource:\n  repoURL: https://charts.example.com\n  chart: my-app\n  targetRevision: 2.1.0\n  helm:\n    values: |\n      replicas: 3\n      image:\n        tag: v1.5\n```\n\nהמפתח רוצה לשנות את ה-image tag ל-v1.6.\n\nמה הדרך הנכונה ב-GitOps?",
            options: [
              "לשנות ב-ArgoCD UI את ה-parameter ישירות",
              "helm upgrade --set image.tag=v1.6",
              "לעדכן את ה-values ב-Git ולעשות commit",
              "kubectl set image\nעל ה-deployment",
            ],
            hint: "חשבו על כלי לניהול חבילות של משאבי Kubernetes.",
            answer: 2,
            explanation: "ב-GitOps, כל שינוי צריך לעבור דרך Git.\nהדרך הנכונה היא לעדכן את ה-values בקובץ שנמצא ב-Git ולעשות commit.\nArgoCD ירנדר מחדש את ה-Helm chart עם ה-values החדשים ויסנכרן.\nשינוי דרך UI, `helm upgrade`, או `kubectl` עוקף את ה-GitOps flow.",
          },
          {
            q: "צוות משתמש ב-HPA שמשנה את מספר ה-replicas אוטומטית.\nArgoCD כל הזמן מציג OutOfSync כי replicas בקלאסטר שונה מ-Git.\n\nמה הפתרון?",
            options: [
              "לכבות את ה-HPA ולנהל את מספר ה-replicas רק דרך Git",
              "להגדיר ignoreDifferences על /spec/replicas ב-Application",
              "להפעיל selfHeal כדי שה-replicas תמיד יחזרו לערך ב-Git",
              "להסיר את שדה replicas מה-manifests ולהגדיר minReplicas ב-HPA",
            ],
            hint: "חשבו על התאמת כמות העותקים לפי עומס.",
            answer: 1,
            explanation: "כאשר משתמשים ב-HPA, הוא משנה את מספר ה-replicas של ה-Deployment באופן דינמי לפי עומס.\nמכיוון שמספר ה-replicas שמוגדר ב-Git נשאר קבוע, ArgoCD מזהה את השינוי כ-drift ומציג את ה-Application במצב OutOfSync.\nכדי למנוע זאת, ניתן להגדיר ל-ArgoCD להתעלם מהשדה `spec.replicas` באמצעות `ignoreDifferences`.\nכך ArgoCD לא ישווה את השדה הזה מול הערך שמוגדר ב-Git.",
          },
          {
            q: "ב-ArgoCD, מה Sync Waves מאפשר לך לעשות?",
            options: [
              "לשלוח notifications אחרי כל sync",
              "לשלוט בסדר שבו משאבים נוצרים במהלך sync",
              "להגביל כמה syncs יכולים לרוץ במקביל",
              "לתזמן syncs לשעות ספציפיות ביום",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
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
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 0,
            explanation: "PreSync Hook מריץ Job לפני שה-sync מתחיל להחיל שינויים.\nמתאים בדיוק ל-database migrations.\nמוגדר ע\"י annotation:\n\nargocd.argoproj.io/hook: PreSync\n\nInit Container רץ בכל Pod restart, לא רק ב-deploy.\nSync Wave שולט בסדר אבל לא ב-pre/post.",
          },
          {
            q: "ArgoCD Application נמחק מהקלאסטר.\nהמשאבים שהוא ניהל (Deployment, Service) עדיין רצים.\n\nלמה?",
            options: [
              "המשאבים הוגדרו כ-immutable",
              "ArgoCD לא יכול למחוק משאבים שיש להם traffic פעיל",
              "צריך למחוק את ה-Application דרך CLI ולא דרך UI",
              "ה-Application הוגדר בלי finalizer של cascading delete",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 3,
            explanation: "ברירת המחדל ב-ArgoCD - מחיקת Application לא מוחקת את המשאבים בקלאסטר.\nכדי לאפשר cascading delete, צריך להוסיף finalizer:\n\n```yaml\nmetadata:\n  finalizers:\n    - resources-finalizer.argocd.argoproj.io\n```\n\nבלי זה, המשאבים נשארים גם אחרי מחיקת ה-Application.",
          },
          {
            q: "מה ההבדל בין prune לבין selfHeal במנגנון auto-sync של ArgoCD",
            tags: ["gitops-reconcile"],
            options: [
              "prune מוחק משאבים שנמחקו מ-Git, selfHeal מתקן drift בקלאסטר",
              "prune מתקן drift שנוצר ידנית, selfHeal מוחק משאבים שנמחקו מ-Git",
              "prune עובד רק עם Helm charts, selfHeal עובד רק עם plain manifests",
              "prune מטפל ב-resources ברמת cluster, selfHeal ב-resources ברמת namespace",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 0,
            explanation: "`prune: true` - כשמשאב נמחק מ-Git, ArgoCD ימחק אותו גם מהקלאסטר.\n`selfHeal: true` - כשמישהו משנה משהו ידנית בקלאסטר, ArgoCD יחזיר את המצב ל-Git.\nשניהם פועלים בזמן אמת כחלק מ-auto-sync.\nשניהם עובדים עם כל סוגי manifests.",
          },
          {
            q: "sync נכשל עם השגיאה:\n\n```\none or more objects failed to apply:\nnamespace \"payments\" not found\n```\n\nמה הפתרון?",
            options: [
              "ליצור את ה-namespace ידנית בקלאסטר ולהריץ sync שוב מה-UI",
              "להוסיף Namespace manifest ב-Git עם sync wave נמוך, או להפעיל CreateNamespace",
              "למחוק את ה-Application ב-ArgoCD וליצור אותה מחדש עם destination חדש",
              "להעביר את כל ה-manifests ב-Git ל-namespace default כדי לעקוף את הבעיה",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 1,
            explanation: "הפתרון הנכון ב-GitOps הוא אחד משניים:\n1. להוסיף Namespace manifest ב-Git עם sync wave 0- כדי שייווצר ראשון.\n2. להפעיל CreateNamespace=true ב-syncPolicy:\n\nsyncPolicy:\n  syncOptions:\n    - CreateNamespace=true\n\nיצירה ידנית עובדת אבל עוקפת GitOps.",
          },
        ],
        questionsEn: [
          {
            q: "An ArgoCD Application is configured with auto-sync and prune: true.\nA developer deletes a ConfigMap manifest file from the Git repo.\n\nWhat will happen to the ConfigMap in the cluster?",
            options: [
              "ArgoCD will delete the ConfigMap from the cluster because it no longer exists in Git",
              "ArgoCD will ignore the change because the ConfigMap is already running in the cluster",
              "ArgoCD will show a warning in the UI and wait for manual approval before deleting",
              "ArgoCD will fail the sync because it expects all files to exist in Git",
            ],
            hint: "Think about what happens when a resource is removed from Git but still exists in the cluster.",
            answer: 0,
            explanation: "When prune: true is configured, ArgoCD compares what exists in the cluster to what is defined in Git.\nIf a resource exists in the cluster but is no longer in Git, ArgoCD will automatically delete it.\nWithout prune, ArgoCD would leave the resource in the cluster even after it was removed from Git.\nIt is important to understand that prune deletes resources without manual approval, so it should be used carefully.",
          },
          {
            q: "An ArgoCD Application is configured with a Helm source:\n\n```yaml\nsource:\n  repoURL: https://charts.example.com\n  chart: my-app\n  targetRevision: 2.1.0\n  helm:\n    values: |\n      replicas: 3\n      image:\n        tag: v1.5\n```\n\nThe developer wants to change the image tag to v1.6.\n\nWhat is the correct GitOps approach",
            options: [
              "Change the parameter directly in the ArgoCD UI",
              "helm upgrade --set image.tag=v1.6",
              "Update the values in Git and commit",
              "kubectl set image\non the deployment",
            ],
            hint: "Think about a package manager for Kubernetes resources.",
            answer: 2,
            explanation: "In GitOps, every change must go through Git.\nThe correct approach is to update the values in the Git-stored file and commit.\nArgoCD will re-render the Helm chart with the new values and sync.\nChanging via the UI, `helm upgrade`, or `kubectl` bypasses the GitOps flow.",
          },
          {
            q: "A team uses HPA that automatically adjusts the number of replicas.\nArgoCD constantly shows OutOfSync because replicas in the cluster differs from Git.\n\nWhat is the solution",
            options: [
              "Disable HPA and manage replica count only through Git",
              "Configure ignoreDifferences on /spec/replicas in the Application",
              "Enable selfHeal so replicas always revert to the Git value",
              "Remove the replicas field from manifests and set minReplicas in HPA",
            ],
            hint: "Think about adjusting replica count based on load.",
            answer: 1,
            explanation: "When using an HPA, it dynamically adjusts the replicas field of a Deployment based on load.\nSince the value in Git remains fixed, ArgoCD detects the change as drift and marks the Application as OutOfSync.\nTo prevent this, you can configure ArgoCD to ignore the `spec.replicas` field using `ignoreDifferences`.\nThis prevents ArgoCD from comparing that field against the value stored in Git.",
          },
          {
            q: "In ArgoCD, what do Sync Waves allow you to do",
            options: [
              "Send notifications to external channels after each sync",
              "Control the order in which resources are created during a sync",
              "Limit how many syncs can run in parallel per project",
              "Schedule syncs at specific times of the day automatically",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 1,
            explanation: "Sync Waves let you control the order in which resources are created.\nFor example, Namespace in wave 0, ConfigMap in wave 1, Deployment in wave 2.\nConfigured via annotation:\n\nargocd.argoproj.io/sync-wave: \"2\"\n\nResources with a lower wave number are created first.",
          },
          {
            q: "A team wants to run a database migration before every deploy.\n\nWhich ArgoCD mechanism is appropriate",
            options: [
              "Sync Hook of type PreSync",
              "Init Container in the application Pod",
              "Sync Wave with a high number",
              "Post-deploy Health Check",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 0,
            explanation: "A PreSync Hook runs a Job before the sync begins applying changes.\nThis is exactly suited for database migrations.\nConfigured via annotation:\n\nargocd.argoproj.io/hook: PreSync\n\nAn Init Container runs on every Pod restart, not just on deploy.\nSync Wave controls order but not pre/post execution.",
          },
          {
            q: "An ArgoCD Application was deleted from the cluster.\nThe resources it managed (Deployment, Service) are still running.\n\nWhy",
            options: [
              "The resources were configured as immutable",
              "ArgoCD cannot delete resources that have active traffic",
              "The Application must be deleted via CLI, not via UI",
              "The Application was configured without a cascading delete finalizer",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 3,
            explanation: "By default in ArgoCD, deleting an Application does not delete the managed resources in the cluster.\nTo enable cascading delete, you need to add a finalizer:\n\n```yaml\nmetadata:\n  finalizers:\n    - resources-finalizer.argocd.argoproj.io\n```\n\nWithout it, the resources remain even after the Application is deleted.",
          },
          {
            q: "What is the difference between prune and selfHeal in ArgoCD auto-sync",
            tags: ["gitops-reconcile"],
            options: [
              "prune deletes resources removed from Git, selfHeal corrects drift in the cluster",
              "prune corrects manually created drift, selfHeal deletes resources removed from Git",
              "prune works only with Helm charts, selfHeal works only with plain manifests",
              "prune handles cluster-scoped resources, selfHeal handles namespace-scoped resources",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 0,
            explanation: "`prune: true` - when a resource is removed from Git, ArgoCD will also delete it from the cluster.\n`selfHeal: true` - when someone manually changes something in the cluster, ArgoCD will revert it to match Git.\nBoth operate in real time as part of auto-sync.\nBoth work with all types of manifests.",
          },
          {
            q: "A sync failed with the error:\n\n```\none or more objects failed to apply:\nnamespace \"payments\" not found\n```\n\nWhat is the solution",
            options: [
              "Manually create the namespace in the cluster and re-run sync from the UI",
              "Add a Namespace manifest in Git with a low sync wave, or enable CreateNamespace",
              "Delete the ArgoCD Application and recreate it with a new destination",
              "Move all manifests in Git to the default namespace to work around the issue",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 1,
            explanation: "The correct GitOps solution is one of two options:\n1. Add a Namespace manifest in Git with sync wave -0 so it is created first.\n2. Enable CreateNamespace=true in syncPolicy:\n\nsyncPolicy:\n  syncOptions:\n    - CreateNamespace=true\n\nManually creating it works but bypasses GitOps.",
          },
        ],
      },
      hard: {
        theory: "ArgoCD - ארכיטקטורה מתקדמת, אבטחה ותפעול.\n🔹 App of Apps:\u200E דפוס שבו Application root מנהל Applications אחרים, מאפשר ניהול מרכזי\n🔹 ApplicationSet Generators:\u200E Git, Clusters, Matrix, Merge - יצירת Applications דינמית\n🔹 RBAC ב-ArgoCD:\u200E policy.csv עם roles שמגדירים הרשאות per-project\n🔹 SSO Integration:\u200E חיבור ל-OIDC providers (Dex, Okta, Azure AD)\n🔹 Resource Hooks:\u200E fine-grained control על lifecycle של משאבים\n🔹 Multi-tenancy:\u200E הפרדה בין צוותים עם AppProject, RBAC, ו-namespace isolation\n🔹 Notification Engine:\u200E triggers ו-templates לשליחת alerts על sync events\n🔹 Diffing Customization:\u200E managedFieldsManagers, server-side diff\nCODE:\n# App of Apps pattern\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: root-app\nspec:\n  source:\n    path: apps/     # directory with Application manifests\n  destination:\n    namespace: argocd\n---\n# ApplicationSet with Matrix generator\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n    - matrix:\n        generators:\n          - clusters:\n              selector:\n                matchLabels:\n                  env: production\n          - git:\n              repoURL: https://github.com/org/repo\n              directories:\n                - path: apps/*",
        theoryEn: "ArgoCD advanced architecture, security, and operations.\n🔹 App of Apps - a pattern where a root Application manages other Applications for centralized control\n🔹 ApplicationSet Generators - Git, Clusters, Matrix, Merge for dynamic Application creation\n🔹 ArgoCD RBAC - policy.csv with roles defining per-project permissions\n🔹 SSO Integration - connecting to OIDC providers (Dex, Okta, Azure AD)\n🔹 Resource Hooks - fine-grained control over resource lifecycle\n🔹 Multi-tenancy - team isolation with AppProject, RBAC, and namespace isolation\n🔹 Notification Engine - triggers and templates for alerts on sync events\n🔹 Diffing Customization - managedFieldsManagers, server-side diff\nCODE:\n# App of Apps pattern\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: root-app\nspec:\n  source:\n    path: apps/     # directory with Application manifests\n  destination:\n    namespace: argocd\n---\n# ApplicationSet with Matrix generator\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n    - matrix:\n        generators:\n          - clusters:\n              selector:\n                matchLabels:\n                  env: production\n          - git:\n              repoURL: https://github.com/org/repo\n              directories:\n                - path: apps/*",
        questions: [
          {
            q: "ארגון מנהל 50 microservices ב-3 environments.\nכל שירות צריך Application נפרד ב-ArgoCD.\n\nמה הגישה הטובה ביותר?",
            options: [
              "ליצור 150 Application manifests ידנית ב-Git עם Kustomize overlays per env",
              "להשתמש ב-ApplicationSet עם Matrix generator שמשלב clusters ו-Git directories",
              "ליצור CI script שמריץ argocd app create בלולאה עבור כל service ו-env",
              "להשתמש ב-Helm umbrella chart עם subchart נפרד לכל microservice",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 1,
            explanation: "ApplicationSet עם Matrix generator משלב שני generators:\n- clusters: כל ה-environments (dev, staging, prod)\n- git directories: כל ה-microservices\n\nMatrix יוצר קומבינציה: 50 services x 3 environments = 150 Applications אוטומטית.\nהוספת service או environment חדש מייצרת Applications אוטומטית.",
          },
          {
            q: "צוות Platform רוצה שכל צוות יוכל לנהל רק את ה-Applications שלו.\n\nאיך מממשים multi-tenancy ב-ArgoCD?",
            tags: ["gitops-multitenancy"],
            options: [
              "ArgoCD instance נפרד לכל צוות עם Ingress ו-SSO משלו",
              "AppProject per team עם הגבלות על repos, namespaces ו-RBAC roles",
              "Namespace per team בתוך argocd namespace עם ResourceQuotas",
              "Git branch per team עם branch protection ו-webhook per branch",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
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
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 2,
            explanation: "cascading delete עם finalizer מוחק את כל ה-hierarchy:\n1. Root Application נמחק\n2. Child Application manifests נמחקים מהקלאסטר\n3. כל child Application שגם לו יש finalizer מוחק את המשאבים שלו\n\nזה יכול להיות הרסני.\nלכן חשוב להגן על root Applications עם RBAC ולהבין את ה-cascade behavior.",
          },
          {
            q: "Application ב-ArgoCD מופיע כ-OutOfSync למרות שלא בוצע שינוי ב-Git.\nב-diff מופיע שינוי רק בשדה: metadata.managedFields\n\nמה הדרך הנכונה למנוע מ-ArgoCD להתייחס לשדה הזה כ-diff",
            options: [
              "למחוק את ה-Application ולבצע sync מחדש",
              "להגדיר ignoreDifferences עבור השדה",
              "להפעיל autoSync ב-Application",
              "להגדיר revisionHistoryLimit",
            ],
            hint: "חשבו על GitOps וסנכרון Git עם ה-Cluster.",
            answer: 1,
            explanation: "metadata.managedFields הוא metadata שמתווסף אוטומטית על ידי Kubernetes כדי לעקוב אחרי איזה controller מנהל כל שדה במשאב.\nהשדה הזה לא קיים ב-Git ולכן ArgoCD מזהה אותו כ-diff.\nכדי למנוע false drift ניתן להגדיר ignoreDifferences כך ש-ArgoCD יתעלם מהשדה הזה בזמן ההשוואה.\n\n```yaml\nignoreDifferences:\n  managedFieldsManagers:\n    - kube-controller-manager\n```",
          },
          {
            q: "sync של אפליקציה גדולה נכשל עם:\n\n```\nrpc error: code = ResourceExhausted\nmessage size larger than max (4194304 vs 4194304)\n```\n\nמה הבעיה ומה הפתרון?",
            options: [
              "ה-Application manifests חורגים מ-gRPC message size limit של ArgoCD",
              "הקלאסטר חורג מ-memory limits ו-OOMKill מונע את ה-sync",
              "ה-Git repo חורג מגודל clone מקסימלי של argocd-repo-server",
              "ה-argocd-server חורג ממגבלת CPU ולא מסוגל לרנדר manifests",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "ArgoCD משתמש ב-gRPC לתקשורת פנימית.\nברירת המחדל של gRPC message size הוא 4MB.\nאפליקציות גדולות (הרבה manifests, CRDs כבדים) חורגות מהמגבלה.\n\nפתרון - להגדיל את ה-limit ב-argocd-server ו-argocd-repo-server:\n\n--max-recv-msg-size=8388608\n\nאו לפצל את האפליקציה ל-Applications קטנים יותר.",
          },
          {
            q: "צוות מגלה שאפליקציה עברה sync מוצלח, אבל ה-deployment לא השתנה בפועל.\nה-image tag לא עודכן.\n\nמה הסיבה הסבירה?",
            options: [
              "ה-tag בשני הצדדים הוא latest וה-image content השתנה",
              "ArgoCD cache לא התרענן ולכן הוא עובד עם manifest ישן",
              "ה-deployment הוגדר כ-immutable ולכן ArgoCD לא יכול לעדכן",
              "ה-namespace חוסם image updates דרך admission policy",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 0,
            explanation: "אם ה-image tag ב-Git הוא latest וגם בקלאסטר הוא latest, ArgoCD רואה אותם כזהים.\nהוא לא בודק את ה-image digest, רק את ה-manifest.\nPod לא יעשה pull מחדש אם imagePullPolicy הוא IfNotPresent.\n\nפתרון: להשתמש ב-immutable tags כמו v1.2.3 או commit SHA במקום latest.\nאו להגדיר \u200EimagePullPolicy: Always.",
          },
          {
            q: "ארגון רוצה לאפשר rollback מהיר ב-production בלי לחכות ל-CI pipeline.\n\nמה הדרך הנכונה ב-GitOps?",
            options: [
              "לאפשר ל-ArgoCD לעשות sync ל-Git commit ספציפי קודם דרך UI",
              "לעשות git revert ולדחוף ישירות ל-main בלי CI",
              "להכין branch מוכן עם version קודם ולעשות merge מהיר",
              "להשתמש ב-ArgoCD Rollback שמחזיר את הקלאסטר ל-state קודם",
            ],
            hint: "חשבו על ניהול גרסאות והחזרה לאחור.",
            answer: 3,
            explanation: "ArgoCD Rollback מחזיר את הקלאסטר ל-sync state קודם מתוך ההיסטוריה.\nזה מהיר כי הוא לא דורש שינוי ב-Git.\nאבל חשוב להבין: אחרי rollback, האפליקציה תהיה OutOfSync עד שה-Git יתעדכן.\n\ngit revert הוא הפתרון ה-GitOps טהור, אבל דורש pipeline.\nב-production emergency, rollback ב-ArgoCD ואז git revert הוא הגישה המעשית.",
          },
          {
            q: "ApplicationSet עם Matrix generator:\n\n```yaml\ngenerators:\n  - matrix:\n      generators:\n        - clusters:\n            selector:\n              matchLabels:\n                env: production\n        - list:\n            elements:\n              - app: payments\n                team: billing\n              - app: orders\n                team: commerce\n```\n\nכמה Applications ייווצרו אם יש 3 production clusters?",
            tags: ["gitops-appset-matrix"],
            options: [
              "3 - Application אחד לכל cluster שתואם את ה-selector",
              "2 - Application אחד לכל app שמוגדר ברשימת elements",
              "6 - cartesian product של 3 clusters כפול 2 apps",
              "5 - סכום של 3 clusters ועוד 2 apps מה-list generator",
            ],
            hint: "חשבו בזהירות על מה כל אפשרות מתארת.",
            answer: 2,
            explanation: "ה-Matrix generator ב-ApplicationSet יוצר Cartesian product (כל הצירופים האפשריים) בין הרשימות שמוגדרות ב-generators.\nבמקרה הזה יש 3 clusters שנבחרו לפי env: production, ויש 2 אפליקציות ברשימת elements (payments ו-orders).\nApplicationSet יוצר Application עבור כל שילוב של cluster ואפליקציה.\nלכן מספר ה-Applications שייווצרו הוא:\n3 clusters × 2 apps = 6 Applications.",
          },
        ],
        questionsEn: [
          {
            q: "An organization manages 50 microservices across 3 environments.\nEach service needs a separate ArgoCD Application.\n\nWhat is the best approach",
            options: [
              "Manually create 150 Application manifests in Git with Kustomize overlays per env",
              "Use an ApplicationSet with a Matrix generator combining clusters and Git directories",
              "Create a CI script that runs argocd app create in a loop for each service and env",
              "Use a Helm umbrella chart with a separate subchart for each microservice",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 1,
            explanation: "ApplicationSet with a Matrix generator combines two generators:\n- clusters: all environments (dev, staging, prod)\n- git directories: all microservices\n\nMatrix produces a combination: 50 services x 3 environments = 150 Applications automatically.\nAdding a new service or environment generates Applications automatically.",
          },
          {
            q: "A Platform team wants each team to manage only its own Applications.\n\nHow do you implement multi-tenancy in ArgoCD",
            tags: ["gitops-multitenancy"],
            options: [
              "A separate ArgoCD instance per team with its own Ingress and SSO",
              "An AppProject per team with restrictions on repos, namespaces, and RBAC roles",
              "A namespace per team inside the argocd namespace with ResourceQuotas",
              "A Git branch per team with branch protection and a webhook per branch",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 1,
            explanation: "AppProject enables granular permission definitions:\n- sourceRepos: which repos each team can use\n- destinations: which namespaces/clusters are allowed\n- clusterResourceWhitelist: which cluster-level resources are allowed\n\nCombined with RBAC in ArgoCD:\np, role:team-a, applications, *, team-a-project/*, allow\n\nA separate instance per team is unnecessary overhead.",
          },
          {
            q: "In the App of Apps pattern, the root Application manages other Applications.\nWhat happens if you delete the root Application with cascading delete",
            tags: ["gitops-app-of-apps"],
            options: [
              "Only the root Application is deleted, child Applications remain",
              "The root and all child Applications are deleted, but their resources remain in the cluster",
              "The root, all child Applications, and all their resources are deleted",
              "ArgoCD blocks the deletion because of dependencies",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 2,
            explanation: "Cascading delete with a finalizer removes the entire hierarchy:\n1. Root Application is deleted\n2. Child Application manifests are removed from the cluster\n3. Each child Application that also has a finalizer deletes its own resources\n\nThis can be destructive.\nIt is important to protect root Applications with RBAC and understand the cascade behavior.",
          },
          {
            q: "An ArgoCD Application appears OutOfSync even though nothing changed in Git.\nThe diff shows a change only in the field: metadata.managedFields\n\nWhat is the correct way to prevent ArgoCD from treating this field as a diff",
            options: [
              "Delete the Application and resync it",
              "Configure ignoreDifferences for the field",
              "Enable autoSync on the Application",
              "Set revisionHistoryLimit",
            ],
            hint: "Think about GitOps and syncing Git state with the Cluster.",
            answer: 1,
            explanation: "metadata.managedFields is metadata automatically added by Kubernetes to track which controller manages each field of a resource.\nThis field does not exist in Git, so ArgoCD detects it as a diff.\nTo avoid false drift detection, configure ignoreDifferences so ArgoCD ignores this field during comparison.\n\n```yaml\nignoreDifferences:\n  managedFieldsManagers:\n    - kube-controller-manager\n```",
          },
          {
            q: "A sync of a large application fails with:\n\n```\nrpc error: code = ResourceExhausted\nmessage size larger than max (4194304 vs 4194304)\n```\n\nWhat is the problem and the solution",
            options: [
              "The Application manifests exceed the ArgoCD gRPC message size limit",
              "The cluster exceeds memory limits and OOMKill prevents the sync",
              "The Git repo exceeds the maximum clone size for argocd-repo-server",
              "The argocd-server exceeds CPU limits and cannot render manifests",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "ArgoCD uses gRPC for internal communication.\nThe default gRPC message size is 4MB.\nLarge applications (many manifests, heavy CRDs) exceed this limit.\n\nSolution - increase the limit on argocd-server and argocd-repo-server:\n\n--max-recv-msg-size=8388608\n\nOr split the application into smaller Applications.",
          },
          {
            q: "A team discovers that an application completed a successful sync, but the deployment did not actually change.\nThe image tag was not updated.\n\nWhat is the likely cause",
            options: [
              "The tag on both sides is latest and only the image content changed",
              "The ArgoCD cache was not refreshed so it works with a stale manifest",
              "The deployment is configured as immutable so ArgoCD cannot update it",
              "The namespace blocks image updates via an admission policy",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 0,
            explanation: "If the image tag in Git is latest and in the cluster it is also latest, ArgoCD sees them as identical.\nIt does not check the image digest, only the manifest.\nThe Pod will not pull again if imagePullPolicy is IfNotPresent.\n\nSolution: use immutable tags like v1.2.3 or a commit SHA instead of latest.\nOr set imagePullPolicy: Always.",
          },
          {
            q: "An organization wants to enable fast rollback in production without waiting for the CI pipeline.\n\nWhat is the correct approach in GitOps",
            options: [
              "Allow ArgoCD to sync to a specific previous Git commit via the UI",
              "Run git revert and push directly to main without CI",
              "Prepare a branch with the previous version and merge it quickly",
              "Use ArgoCD Rollback to restore the cluster to a previous state",
            ],
            hint: "Think about managing versions and reverting changes.",
            answer: 3,
            explanation: "ArgoCD Rollback restores the cluster to a previous sync state from its history.\nThis is fast because it does not require a change in Git.\nHowever, after rollback the application will be OutOfSync until Git is updated.\n\ngit revert is the pure GitOps solution, but it requires a pipeline.\nIn a production emergency, ArgoCD rollback followed by git revert is the practical approach.",
          },
          {
            q: "ApplicationSet with a Matrix generator:\n\n```yaml\ngenerators:\n  - matrix:\n      generators:\n        - clusters:\n            selector:\n              matchLabels:\n                env: production\n        - list:\n            elements:\n              - app: payments\n                team: billing\n              - app: orders\n                team: commerce\n```\n\nHow many Applications will be created if there are 3 production clusters",
            tags: ["gitops-appset-matrix"],
            options: [
              "3 - one Application per cluster matching the selector",
              "2 - one Application per app defined in the elements list",
              "6 - cartesian product of 3 clusters times 2 apps",
              "5 - sum of 3 clusters plus 2 apps from the list generator",
            ],
            hint: "Think carefully about what each option describes.",
            answer: 2,
            explanation: "The Matrix generator in ApplicationSet creates a Cartesian product (all possible combinations) between the lists defined in the generators.\nIn this case there are 3 clusters selected by env: production, and 2 apps in the elements list (payments and orders).\nApplicationSet creates an Application for each combination of cluster and app.\nThe number of Applications created is:\n3 clusters x 2 apps = 6 Applications.",
          },
        ],
      },
    },
  },
];
