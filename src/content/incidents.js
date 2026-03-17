// ── Kubernetes Incident Mode Scenarios ───────────────────────────────────────
// Each incident simulates a real production troubleshooting workflow.
// Steps are linear (v1). Each step has:
//   prompt - structured: Title / • Facts / Question (English)
//   promptHe - Hebrew version of prompt
//   options[4] - possible actions (English)
//   optionsHe - Hebrew version of options
//   answer - index of the correct option (0-3)
//   explanation- structured: ✓ correct / → verifies / ✗ others (English)
//   explanationHe - Hebrew explanation

export const INCIDENTS = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. CrashLoopBackOff - missing ConfigMap / env var
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "crashloop-config",
    incidentCode: "INC-2041",
    icon: "🔄",
    title: "New Release: Payment Service Refuses to Start",
    titleShort: "Payment Service Crash",
    titleShortHe: "קריסת שירות תשלומים",
    titleHe: "גרסה חדשה: שירות התשלומים סירב לעלות",
    description: "A payment service crashes immediately after a new deployment shipped",
    descriptionHe: "שירות תשלומים קורס מיידית אחרי דיפלוימנט חדש",
    cluster: "staging-west",
    namespace: "staging",
    service: "payment-service",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    objective: "Identify why the payment service refuses to start and find the root cause without modifying any resources.",
    objectiveHe: "לזהות למה שירות התשלומים לא מצליח לעלות ולמצוא את שורש הבעיה מבלי לשנות משאבים.",
    constraints: [
      "Read-only investigation - do not modify or delete resources",
      "No rollbacks until root cause is confirmed",
      "Staging environment - other teams share this cluster",
    ],
    constraintsHe: [
      "חקירה לקריאה בלבד - אין לשנות או למחוק משאבים",
      "אין rollback עד שהסיבה השורשית מאושרת",
      "סביבת staging - צוותים אחרים חולקים את הקלאסטר",
    ],
    signals: [
      "PagerDuty: payment-service health check failing for 10 min",
      "Grafana: 0 successful transactions since 14:32 UTC",
      "Slack #incidents: \"payments down after deploy\" - @oncall",
    ],
    signalsHe: [
      "PagerDuty: בדיקת תקינות payment-service נכשלת 10 דקות",
      "Grafana: 0 טרנזקציות מוצלחות מאז 14:32 UTC",
      "Slack #incidents: \"payments down after deploy\" - @oncall",
    ],
    steps: [
      {
        prompt:
          "CrashLoopBackOff After New Release\n\n• `payment-service` in namespace `staging` entered CrashLoopBackOff\n• Started 10 minutes after a new release was deployed\n• PagerDuty alert: health check failing\n\nWhere do you start?",
        promptHe:
          "CrashLoopBackOff אחרי גרסה חדשה\n\n• `payment-service` ב-namespace `staging` נכנס ל-CrashLoopBackOff\n• התחיל 10 דקות אחרי שגרסה חדשה הוצבה\n• התראת PagerDuty: בדיקת תקינות נכשלת\n\nמאיפה מתחילים?",
        options: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (roll back immediately)",
          "kubectl delete namespace staging  (clean slate)  [destructive]",
          "Re-apply the deployment YAML without changes",
        ],
        optionsHe: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (rollback מיידי)",
          "kubectl delete namespace staging  (ניקוי מלא)  [destructive]",
          "להחיל מחדש את ה-YAML של ה-Deployment ללא שינויים",
        ],
        answer: 0,
        hint: "In a real incident, your first instinct should be to understand the situation, not to fix it.",
        hintHe: "באירוע אמיתי, האינסטינקט הראשון צריך להיות להבין את המצב, לא לתקן אותו.",
        explanation:
          "✓ `kubectl get pods` assesses the situation before taking action.\n✗ Rollback without understanding root cause is premature. Same bug may exist on previous version. Deleting namespace = total data loss. Re-applying same YAML won't fix config issues.",
        explanationHe:
          "✓ `kubectl get pods` מעריך את המצב לפני פעולה.\n✗ Rollback ללא הבנת סיבה שורשית הוא מוקדם מדי. אותו באג עלול להיות בגרסה הקודמת. מחיקת namespace = אובדן נתונים מוחלט. החלה מחדש של אותו YAML לא תתקן בעיית config.",
      },
      {
        prompt:
          "Pod Stuck in Crash Loop\n\n• Status: CrashLoopBackOff\n• Restart count: 9\n• Back-off delay is now 5 minutes between restarts\n\n$ kubectl get pods -n staging\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nWhat command reveals the application error?",
        promptHe:
          "Pod תקוע בלולאת קריסה\n\n• סטטוס: CrashLoopBackOff\n• מספר אתחולים: 9\n• השהיית back-off עכשיו 5 דקות בין אתחולים\n\n$ kubectl get pods -n staging\nNAME                         STATUS             RESTARTS\npayment-service-7d4b9-abc12  CrashLoopBackOff   9\n\nאיזו פקודה חושפת את שגיאת האפליקציה?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging",
          "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- /bin/sh",
          "kubectl get events -n staging --sort-by=.metadata.creationTimestamp",
        ],
        optionsHe: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging",
          "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- /bin/sh",
          "kubectl get events -n staging --sort-by=.metadata.creationTimestamp",
        ],
        answer: 1,
        hint: "The container already crashed. You need to see what it printed before it exited.",
        hintHe: "הקונטיינר כבר קרס. צריך לראות מה הוא הדפיס לפני שיצא.",
        explanation:
          "✓ `kubectl logs --previous` shows logs from the last crashed container - the startup error.\n→ This is the only way to see what the app printed before crashing.\n✗ `exec` fails on CrashLoopBackOff (exits too fast). `describe` shows events, not app logs. Events are useful but secondary.",
        explanationHe:
          "✓ `kubectl logs --previous` מציג לוגים מהקונטיינר שקרס, את שגיאת ההפעלה.\nזו הדרך היחידה לראות מה האפליקציה הדפיסה לפני הקריסה.\n✗ `exec` נכשל על CrashLoopBackOff (יוצא מהר). `describe` מציג Events, לא לוגים. Events שימושיים אך משניים.",
      },
      {
        prompt:
          "Missing Config File on Startup\n\n• Logs show: `FATAL config file '/etc/app/config.yaml' not found`\n• App expects a mounted config file that doesn't exist\n\nWhat do you check?",
        promptHe:
          "קובץ Config חסר בהפעלה\n\n• לוגים מציגים: `FATAL config file '/etc/app/config.yaml' not found`\n• האפליקציה מצפה לקובץ config שלא קיים\n\nמה בודקים?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (check volumes and mounts)",
          "kubectl get configmap -n staging  (list available ConfigMaps)",
          "kubectl get secret -n staging  (list Secrets)",
          "Both A and B: inspect the pod spec for the expected mount AND list existing ConfigMaps",
        ],
        optionsHe: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (בדוק volumes ו-mounts)",
          "kubectl get configmap -n staging  (רשימת ConfigMaps זמינים)",
          "kubectl get secret -n staging  (רשימת Secrets)",
          "גם A וגם B: בדוק ה-pod spec עבור ה-mount המצופה וגם רשימת ConfigMaps קיימים",
        ],
        answer: 3,
        hint: "The error mentions a specific file path. Where is that file supposed to come from?",
        hintHe: "השגיאה מציינת נתיב קובץ מסוים. מאיפה אמור הקובץ הזה להגיע?",
        explanation:
          "✓ You need two pieces of info: what the pod spec expects (`describe pod`) and what exists (`get configmap`).\n→ Comparing both reveals the mismatch.\n✗ Either alone is insufficient - you need the expected name AND the actual list.",
        explanationHe:
          "✓ נדרשים שני מקורות: מה ה-pod spec מצפה (`describe pod`) ומה קיים (`get configmap`).\nהשוואת שניהם חושפת את אי-ההתאמה.\n✗ כל אחד לבדו אינו מספיק, צריך את השם המצופה וגם את הרשימה בפועל.",
      },
      {
        prompt:
          "ConfigMap Not Found in Namespace\n\n• Pod spec expects ConfigMap `payment-config`\n• Only ConfigMap in namespace: `app-settings`\n• `payment-config` does not exist here\n\nWhat most likely happened?",
        promptHe:
          "ConfigMap לא נמצא ב-Namespace\n\n• Pod spec מצפה ל-ConfigMap `payment-config`\n• ConfigMap יחיד ב-namespace: `app-settings`\n• `payment-config` לא קיים כאן\n\nמה כנראה קרה?",
        options: [
          "The ConfigMap was created in a different namespace (e.g., production) but not in staging",
          "The ConfigMap was accidentally deleted from staging",
          "A new environment was added to the deployment but the ConfigMap was never created for it",
          "Any of the above - the ConfigMap is simply absent from this namespace",
        ],
        optionsHe: [
          "ה-ConfigMap נוצר ב-namespace אחר (למשל production) אך לא ב-staging",
          "ה-ConfigMap נמחק בטעות מ-staging",
          "סביבה חדשה נוספה ל-Deployment אך ה-ConfigMap מעולם לא נוצר עבורה",
          "כל האמור לעיל: ה-ConfigMap פשוט אינו קיים ב-namespace הזה",
        ],
        answer: 3,
        hint: "ConfigMaps are namespace-scoped. Think about what happens when a resource is expected but doesn't exist.",
        hintHe: "ConfigMaps מוגדרים לפי namespace. חשוב מה קורה כשמשאב צפוי לא קיים.",
        explanation:
          "✓ ConfigMaps are namespace-scoped. All three causes are equally valid.\n→ The fix is the same regardless: create `payment-config` in staging.\n✗ You can't determine the exact cause from this info alone, but you can fix it.",
        explanationHe:
          "✓ ConfigMaps מוגדרים לפי namespace. שלוש הסיבות תקפות באותה מידה.\nהתיקון זהה בכל מקרה: צור `payment-config` ב-staging.\n✗ לא ניתן לקבוע את הסיבה המדויקת מהמידע הזה בלבד, אך ניתן לתקן.",
      },
      {
        prompt:
          "Restoring the Missing ConfigMap\n\n• ConfigMap `payment-config` missing in staging\n• Same ConfigMap exists in production\n• Pod needs it to start\n\nWhat is the safest approach?",
        promptHe:
          "שחזור ה-ConfigMap החסר\n\n• ConfigMap `payment-config` חסר ב-staging\n• אותו ConfigMap קיים ב-production\n• ה-Pod צריך אותו כדי לעלות\n\nמה הגישה הבטוחה ביותר?",
        options: [
          "kubectl get configmap payment-config -n production -o yaml | sed 's/namespace: production/namespace: staging/' | kubectl apply -f -",
          "kubectl cp payment-config -n production staging/",
          "Edit the Deployment to point to the production namespace ConfigMap directly",
          "kubectl delete pod payment-service-7d4b9-abc12 -n staging  (restart and hope)  [destructive]",
        ],
        optionsHe: [
          "kubectl get configmap payment-config -n production -o yaml | sed 's/namespace: production/namespace: staging/' | kubectl apply -f -",
          "kubectl cp payment-config -n production staging/",
          "לערוך את ה-Deployment כדי שיפנה ל-ConfigMap ב-namespace של production ישירות",
          "kubectl delete pod payment-service-7d4b9-abc12 -n staging  (אתחל וקווה)  [destructive]",
        ],
        answer: 0,
        hint: "You need to get the ConfigMap from somewhere it exists. Think about how K8s objects can be exported and re-applied.",
        hintHe: "צריך להשיג את ה-ConfigMap ממקום שהוא קיים. חשוב איך אפשר לייצא ולהחיל מחדש אובייקטי K8s.",
        explanation:
          "✓ Export from production → replace namespace → apply to staging. Clean and safe.\n→ Gives staging its own copy without affecting production.\n✗ `kubectl cp` is for files inside pods, not K8s objects. Pods can't reference ConfigMaps from other namespaces. Deleting the pod just restarts it into the same crash.",
        explanationHe:
          "✓ ייצוא מ-production, החלפת namespace, והחלה ב-staging. נקי ובטוח.\nנותן ל-staging עותק משלו בלי להשפיע על production.\n✗ `kubectl cp` לקבצים בתוך Pods, לא לאובייקטי K8s. Pods לא יכולים להפנות ל-ConfigMaps מ-namespace אחר. מחיקת ה-Pod רק מאתחלת אותו לאותה קריסה.",
      },
    ],
    rootCause: "The payment service failed to start because a ConfigMap was missing in the staging namespace. The Deployment referenced a config file that didn't exist, causing the container to crash on startup.",
    rootCauseHe: "שירות התשלומים לא עלה בגלל ConfigMap שהיה חסר ב-namespace של staging. ה-Deployment הפנה לקובץ config שלא היה קיים, מה שגרם לקונטיינר לקרוס בהפעלה.",
    correctApproach: "Check the pod logs with --previous flag to see the startup error, then compare the expected volume mounts against the existing ConfigMaps in the namespace.",
    correctApproachHe: "לבדוק את הלוגים של ה-Pod עם --previous כדי לראות את שגיאת ההפעלה, ואז להשוות את ה-volume mounts המצופים מול ה-ConfigMaps הקיימים ב-namespace.",
    command: "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
    hint: "Check the pod logs first - they reveal what the app printed right before crashing.",
    hintHe: "בדוק קודם את הלוגים של ה-Pod - הם חושפים מה האפליקציה הדפיסה לפני הקריסה.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ImagePullBackOff - private registry auth
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "imagepull-auth",
    incidentCode: "INC-2042",
    icon: "🖼️",
    title: "New Microservice: All Pods Stuck at Startup",
    titleShort: "Pods Stuck at Startup",
    titleShortHe: "פודים תקועים בהפעלה",
    titleHe: "מיקרו-שירות חדש: כל הפודים תקועים בהפעלה",
    description: "A new Deployment is stuck - pods can't pull the container image",
    descriptionHe: "דיפלוימנט חדש תקוע: פודים לא מצליחים למשוך את הקונטיינר",
    cluster: "staging-east",
    namespace: "default",
    service: "myapp",
    difficulty: "easy",
    estimatedTime: "4-5 min",
    objective: "Determine why pods cannot pull their container image and restore the deployment.",
    objectiveHe: "לקבוע למה Pods לא מצליחים למשוך את ה-image ולשחזר את ה-Deployment.",
    constraints: [
      "You have namespace-level access only (not cluster-admin)",
      "Do not delete the deployment - it was just created by another team",
      "Registry credentials must be obtained from the DevOps lead",
    ],
    constraintsHe: [
      "יש לך גישה ברמת namespace בלבד (לא cluster-admin)",
      "אין למחוק את ה-Deployment - הוא נוצר על ידי צוות אחר",
      "אישורי registry חייבים להתקבל מראש צוות DevOps",
    ],
    signals: [
      "Slack #deploys: \"myapp v2.1 deployed to default ns\" - @devteam",
      "kubectl events: Back-off pulling image \"registry.company.com/myapp:v2.1\"",
      "Monitoring: 0/3 replicas ready for myapp deployment",
    ],
    signalsHe: [
      "Slack #deploys: \"myapp v2.1 deployed to default ns\" - @devteam",
      "kubectl events: Back-off pulling image \"registry.company.com/myapp:v2.1\"",
      "Monitoring: 0/3 replicas ready עבור myapp deployment",
    ],
    steps: [
      {
        prompt:
          "All Pods Stuck in ImagePullBackOff\n\n• A newly deployed microservice has all pods in `ImagePullBackOff`\n• Other services on the same cluster are healthy\n• Event: Back-off pulling image \"registry.company.com/myapp:v2.1\"\n\nWhat is your first diagnostic step?",
        promptHe:
          "כל ה-Pods תקועים ב-ImagePullBackOff\n\n• מיקרו-שירות חדש, כל ה-Pods במצב `ImagePullBackOff`\n• שירותים אחרים באותו cluster תקינים\n• Event: Back-off pulling image \"registry.company.com/myapp:v2.1\"\n\nמה הצעד האבחוני הראשון?",
        options: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (tear it down and redeploy)  [destructive]",
          "kubectl get nodes  (check if a node is down)",
          "kubectl logs <pod-name> -n default  (check startup errors)",
        ],
        optionsHe: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (פירוק ופריסה מחדש)  [destructive]",
          "kubectl get nodes  (בדוק אם Node כלשהו ירד)",
          "kubectl logs <pod-name> -n default  (בדוק שגיאות הפעלה)",
        ],
        answer: 0,
        hint: "The pod never started running. Think about what happens before a container starts.",
        hintHe: "ה-Pod מעולם לא התחיל לרוץ. חשוב מה קורה לפני שקונטיינר מתחיל.",
        explanation:
          "✓ `kubectl describe pod` shows the Events section with the exact pull failure message.\n→ Tells you if it's a missing tag, auth failure, or unreachable registry.\n✗ Only one deployment affected, so nodes are fine. Logs won't show anything - the container never started (ImagePullBackOff happens before the container runs).",
        explanationHe:
          "✓ `kubectl describe pod` מציג את חלק ה-Events עם הודעת כשל המשיכה המדויקת.\nמראה אם זה tag חסר, כשל אימות, או registry לא נגיש.\n✗ רק Deployment אחד מושפע, Nodes תקינים. לוגים לא יציגו דבר - הקונטיינר מעולם לא עלה (ImagePullBackOff קורה לפני שהקונטיינר רץ).",
      },
      {
        prompt:
          "Unauthorized Error from Registry\n\n• Image: `registry.company.com/myapp:v2.1`\n• Error: `unauthorized: authentication required`\n• Pod cannot pull the image\n\nWhat does this error indicate?",
        promptHe:
          "שגיאת Unauthorized מה-Registry\n\n• Image: `registry.company.com/myapp:v2.1`\n• שגיאה: `unauthorized: authentication required`\n• ה-Pod לא מצליח למשוך את ה-image\n\nמה מציינת שגיאה זו?",
        options: [
          "The image tag `v2.1` does not exist in the registry",
          "The registry requires credentials but the pod has none configured",
          "The registry server is down or unreachable",
          "The node has no internet access",
        ],
        optionsHe: [
          "ה-tag `v2.1` לא קיים ב-registry",
          "ה-registry דורש אישורים אך ל-Pod אין אישורים מוגדרים",
          "שרת ה-registry ירד או לא נגיש",
          "ל-Node אין גישה לאינטרנט",
        ],
        answer: 1,
        hint: "Focus on the exact error message. Each type of registry failure returns a different error.",
        hintHe: "התמקד בהודעת השגיאה המדויקת. כל סוג כשל registry מחזיר שגיאה שונה.",
        explanation:
          "✓ `unauthorized: authentication required` = registry is reachable but needs credentials.\n→ The registry responded - it's up and the tag exists.\n✗ Wrong tag → 'not found'. Unreachable → 'connection timeout'. No internet → 'no route to host'.",
        explanationHe:
          "✓ `unauthorized: authentication required` = ה-registry נגיש אך דורש אישורים.\nה-registry הגיב, הוא פעיל וה-tag קיים.\n✗ tag שגוי מחזיר 'not found'. לא נגיש מחזיר 'connection timeout'. אין אינטרנט מחזיר 'no route to host'.",
      },
      {
        prompt:
          "Private Registry Requires Authentication\n\n• Registry: `registry.company.com`\n• Needs username/password to pull images\n• No credentials configured on the cluster\n\nWhat Kubernetes resource holds registry credentials?",
        promptHe:
          "Registry פרטי דורש אימות\n\n• Registry: `registry.company.com`\n• דורש username/password למשיכת images\n• אין אישורים מוגדרים על הקלאסטר\n\nאיזה משאב Kubernetes מיועד לאישורי registry?",
        options: [
          "A ConfigMap with base64-encoded credentials",
          "A Secret of type `kubernetes.io/dockerconfigjson`",
          "A ServiceAccount token",
          "An RBAC ClusterRoleBinding",
        ],
        optionsHe: [
          "ConfigMap עם אישורים מקודדים ב-base64",
          "Secret מסוג `kubernetes.io/dockerconfigjson`",
          "Token של ServiceAccount",
          "RBAC ClusterRoleBinding",
        ],
        answer: 1,
        hint: "Kubernetes has a dedicated resource type for storing container registry authentication.",
        hintHe: "ל-Kubernetes יש סוג משאב ייעודי לאחסון אימות מול registry של קונטיינרים.",
        explanation:
          "✓ Registry credentials go in a `kubernetes.io/dockerconfigjson` Secret.\n→ This is the dedicated K8s resource type for container registry auth.\n✗ ConfigMaps aren't for sensitive data. SA tokens authenticate to the K8s API, not registries. RBAC controls K8s permissions.",
        explanationHe:
          "✓ אישורי registry שמורים ב-Secret מסוג `kubernetes.io/dockerconfigjson`.\nזה משאב K8s ייעודי לאימות מול registry.\n✗ ConfigMaps לא לנתונים רגישים. SA tokens מאמתים מול K8s API, לא registries. RBAC שולט בהרשאות K8s.",
      },
      {
        prompt:
          "No Registry Secret in Namespace\n\n• `kubectl get secret -n default` shows no registry-related Secret\n• Need credentials for `registry.company.com`\n\nHow do you create one correctly?",
        promptHe:
          "אין Secret של Registry ב-Namespace\n\n• `kubectl get secret -n default` לא מציג Secret קשור ל-registry\n• צריך אישורים ל-`registry.company.com`\n\nכיצד יוצרים אחד נכון?",
        options: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-literal=password=mypassword",
          "Add the password as an environment variable in the Deployment spec",
          "Copy the Secret from the kube-system namespace",
        ],
        optionsHe: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-literal=password=mypassword",
          "להוסיף את הסיסמה כמשתנה סביבה ב-spec של ה-Deployment",
          "להעתיק את ה-Secret מ-namespace של kube-system",
        ],
        answer: 0,
        hint: "There is a dedicated kubectl subcommand for creating registry auth secrets.",
        hintHe: "יש פקודת kubectl ייעודית ליצירת secret אימות registry.",
        explanation:
          "✓ `kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format.\n→ This is the official command for registry auth secrets.\n✗ Never store credentials in ConfigMaps or env vars. Secrets are namespace-scoped - can't reference kube-system from default.",
        explanationHe:
          "✓ `kubectl create secret docker-registry` יוצר Secret עם הסוג הנכון ופורמט `.dockerconfigjson`.\nזו הפקודה הרשמית ליצירת secret אימות registry.\n✗ לעולם אל תאחסנו אישורים ב-ConfigMaps או env vars. Secrets מוגדרים לפי namespace, לא ניתן להפנות ל-kube-system מ-default.",
      },
      {
        prompt:
          "Secret Created but Pull Still Fails\n\n• Secret `regcred` created in namespace\n• Deployment still shows ImagePullBackOff\n• Secret exists but isn't being used\n\nWhat critical step did you miss?",
        promptHe:
          "Secret נוצר אך המשיכה עדיין נכשלת\n\n• Secret `regcred` נוצר ב-namespace\n• ה-Deployment עדיין מציג ImagePullBackOff\n• ה-Secret קיים אך לא בשימוש\n\nאיזה צעד קריטי החמצת?",
        options: [
          "The Secret value needs to be base64-encoded again manually",
          "The Deployment spec must reference the Secret under `imagePullSecrets`",
          "The Secret must be attached to the node, not the namespace",
          "You need to delete and recreate the Deployment for it to pick up the Secret",
        ],
        optionsHe: [
          "ערך ה-Secret צריך להיות מקודד ב-base64 שוב ידנית",
          "ה-Deployment spec חייב להפנות ל-Secret תחת `imagePullSecrets`",
          "ה-Secret חייב להיות מצורף ל-Node, לא ל-namespace",
          "צריך למחוק ולהפעיל מחדש את ה-Deployment כדי שיזהה את ה-Secret",
        ],
        answer: 1,
        hint: "Creating a Secret doesn't mean pods automatically use it. Something needs to connect them.",
        hintHe: "יצירת Secret לא אומרת ש-Pods משתמשים בו אוטומטית. משהו צריך לחבר ביניהם.",
        explanation:
          "✓ K8s does NOT auto-use pull Secrets. You must add `imagePullSecrets: [{name: regcred}]` to the Pod spec.\n→ Without this reference, the pod ignores the Secret entirely.\n✗ `create secret docker-registry` already handles base64. Secrets are namespace-scoped, not node-scoped.",
        explanationHe:
          "✓ K8s לא משתמש אוטומטית ב-pull Secrets. חובה להוסיף `imagePullSecrets: [{name: regcred}]` ל-spec של ה-Pod.\nבלי הפניה זו, ה-Pod מתעלם מה-Secret לחלוטין.\n✗ `create secret docker-registry` כבר מטפל ב-base64. Secrets מוגדרים לפי namespace, לא per-node.",
      },
    ],
    rootCause: "The pods couldn't start because the container image was hosted in a private registry, but no ImagePullSecret was configured in the namespace. Kubernetes couldn't authenticate to pull the image.",
    rootCauseHe: "הפודים לא הצליחו לעלות כי ה-image היה ב-registry פרטי, אבל לא הוגדר ImagePullSecret ב-namespace. Kubernetes לא הצליח להזדהות כדי למשוך את ה-image.",
    correctApproach: "Use kubectl describe pod to see the ImagePullBackOff event, then create a docker-registry Secret and reference it in the Deployment's imagePullSecrets field.",
    correctApproachHe: "להשתמש ב-kubectl describe pod כדי לראות את אירוע ה-ImagePullBackOff, ליצור Secret מסוג docker-registry ולהפנות אליו ב-imagePullSecrets של ה-Deployment.",
    command: "kubectl describe pod myapp-deployment-abc12 -n default",
    hint: "Look at the pod events - they tell you exactly why the image pull failed.",
    hintHe: "בדוק את ה-Events של ה-Pod - הם מספרים בדיוק למה משיכת ה-image נכשלה.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. OOMKilled - memory limits too low
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "oom-killed",
    incidentCode: "INC-3015",
    icon: "💥",
    title: "Production API: Endless Restarts Under Load",
    titleShort: "API Restarts Under Load",
    titleShortHe: "API קורס תחת עומס",
    titleHe: "API בפרודקשן: ריסטארטים אינסופיים תחת עומס",
    description: "A critical API pod keeps restarting every 2 minutes under load",
    descriptionHe: "Pod של API קריטי מתאפס כל 2 דקות תחת עומס",
    cluster: "prod-central",
    namespace: "production",
    service: "api-gateway",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    objective: "Find why the API pod keeps restarting and stabilize it without causing additional downtime.",
    objectiveHe: "למצוא למה ה-Pod של ה-API ממשיך להתאתחל ולייצב אותו מבלי לגרום להשבתה נוספת.",
    constraints: [
      "Production environment - every action is visible to users",
      "Do not scale down - this is the only replica serving traffic",
      "Changes must go through the deployment, not direct pod edits",
    ],
    constraintsHe: [
      "סביבת production - כל פעולה גלויה למשתמשים",
      "אין להקטין - זו הרפליקה היחידה שמשרתת תעבורה",
      "שינויים חייבים לעבור דרך ה-Deployment, לא עריכת Pod ישירה",
    ],
    signals: [
      "Grafana: api-gateway error rate spiked to 40% at 09:15 UTC",
      "PagerDuty: SEV-2 alert - api-gateway 503 error rate > 10%",
      "kubectl events: Back-off restarting failed container api-server",
    ],
    signalsHe: [
      "Grafana: שיעור שגיאות api-gateway קפץ ל-40% ב-09:15 UTC",
      "PagerDuty: התראת SEV-2 - שיעור שגיאות 503 של api-gateway > 10%",
      "kubectl events: Back-off restarting failed container api-server",
    ],
    steps: [
      {
        prompt:
          "Restarting Pod: 503 Errors in Production\n\n• `api-server` pod in namespace `production` restarts every 2 minutes\n• Users are reporting intermittent 503 errors\n\nWhat is your first action?",
        promptHe:
          "Pod מתאפס: שגיאות 503 בפרודקשן\n\n• ה-Pod `api-server` ב-namespace `production` מתאפס כל 2 דקות\n• משתמשים מדווחים על שגיאות 503\n\nמה הצעד הראשון שלך?",
        options: [
          "kubectl get pods -n production",
          "kubectl delete pod api-server -n production  [destructive]",
          "kubectl scale deployment api-server --replicas=0 -n production  [destructive]",
          "kubectl logs api-server -n production --tail=50  (check recent errors)",
        ],
        optionsHe: [
          "kubectl get pods -n production",
          "kubectl delete pod api-server -n production  [destructive]",
          "kubectl scale deployment api-server --replicas=0 -n production  [destructive]",
          "kubectl logs api-server -n production --tail=50  (בדוק שגיאות אחרונות)",
        ],
        answer: 0,
        hint: "This is production and users are affected. What is the safest first step that gives you information without risk?",
        hintHe: "זה production ומשתמשים מושפעים. מה הצעד הראשון הבטוח ביותר שנותן מידע ללא סיכון?",
        explanation:
          "✓ `kubectl get pods` shows current state (status, restarts, age) without causing disruption.\n✗ Deleting the pod or scaling to 0 worsens the outage. Logs are useful but first confirm the pod state to choose the right next command.",
        explanationHe:
          "✓ `kubectl get pods` מציג את המצב הנוכחי (סטטוס, אתחולים, גיל) מבלי לגרום להפרעה.\n✗ מחיקת Pod או הקטנה ל-0 מחמירה את הנפילה. לוגים שימושיים אך קודם יש לאשר את מצב ה-Pod כדי לבחור את הפקודה הבאה.",
      },
      {
        prompt:
          "OOMKilled Status Detected\n\n• Pod `api-server-xyz` shows status `OOMKilled`\n• Restart count: 14\n• Pod age: 2 hours\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nWhat does OOMKilled mean, and which command gives the most detail?",
        promptHe:
          "זוהה סטטוס OOMKilled\n\n• Pod `api-server-xyz` מציג סטטוס `OOMKilled`\n• מספר אתחולים: 14\n• גיל Pod: שעתיים\n\nNAME            READY   STATUS      RESTARTS   AGE\napi-server-xyz  0/1     OOMKilled   14         2h\n\nמה המשמעות של OOMKilled, ואיזו פקודה תיתן את המידע המפורט ביותר?",
        options: [
          "OOMKilled is a liveness probe failure - check probe config with kubectl edit deployment",
          "OOMKilled means the container exceeded its memory limit - run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout - check NetworkPolicy rules",
          "OOMKilled is caused by a bad Docker image - re-pull the image",
        ],
        optionsHe: [
          "OOMKilled = כשל liveness probe, בדוק probe עם kubectl edit deployment",
          "OOMKilled = קונטיינר עבר מגבלת זיכרון, kubectl describe pod api-server-xyz -n production",
          "OOMKilled = timeout ברשת, בדוק NetworkPolicy",
          "OOMKilled = image פגום, משוך מחדש",
        ],
        answer: 1,
        hint: "The status name itself tells you the termination reason. Read it literally.",
        hintHe: "שם הסטטוס עצמו מספר את סיבת הסיום. קרא אותו כפשוטו.",
        explanation:
          "✓ OOMKilled = Out Of Memory Killed. The Linux kernel terminates the container for exceeding its memory limit.\n→ `kubectl describe pod` shows the exact memory limit, termination reason, and recent events.\n✗ Not a probe failure, network issue, or bad image.",
        explanationHe:
          "✓ OOMKilled = Out Of Memory Killed. ליבת לינוקס ממיתה את הקונטיינר על חריגת מגבלת זיכרון.\n`kubectl describe pod` מציג מגבלת זיכרון, סיבת סיום ואירועים אחרונים.\n✗ לא כשל probe, לא בעיית רשת, לא image פגום.",
      },
      {
        prompt:
          "Memory Limit Too Low\n\n• Container memory limit: 256Mi\n• Exit code: 137 (OOMKilled)\n• Pod keeps crashing under load\n\nHow do you determine the right memory limit?",
        promptHe:
          "מגבלת זיכרון נמוכה מדי\n\n• מגבלת זיכרון קונטיינר: 256Mi\n• קוד יציאה: 137 (OOMKilled)\n• ה-Pod ממשיך לקרוס תחת עומס\n\nכיצד קובעים את מגבלת הזיכרון הנכונה?",
        options: [
          "kubectl top pod api-server-xyz -n production  (see actual memory usage)",
          "kubectl logs api-server-xyz -n production --previous  (scan logs for errors)",
          "kubectl get node  (check node total memory)",
          "kubectl get hpa -n production  (check autoscaler settings)",
        ],
        optionsHe: [
          "kubectl top pod api-server-xyz -n production  (צפה בשימוש זיכרון בפועל)",
          "kubectl logs api-server-xyz -n production --previous  (סרוק לוגים לשגיאות)",
          "kubectl get node  (בדוק כמות זיכרון כוללת ב-Node)",
          "kubectl get hpa -n production  (בדוק הגדרות auto-scaler)",
        ],
        answer: 0,
        hint: "You know the limit is 256Mi. Now you need to know actual consumption to compare.",
        hintHe: "אתה יודע שהמגבלה היא 256Mi. עכשיו צריך לדעת את הצריכה בפועל כדי להשוות.",
        explanation:
          "✓ `kubectl top pod` shows real-time memory consumption. Compare actual usage vs the 256Mi limit.\n→ This tells you exactly how much headroom the pod needs.\n✗ Logs help find leaks, not current usage. Node memory ≠ per-pod usage. HPA controls replica count, not memory.",
        explanationHe:
          "✓ `kubectl top pod` מציג צריכת זיכרון בזמן אמת. השווה שימוש בפועל מול מגבלת 256Mi.\nזה מראה בדיוק כמה מרווח ה-Pod צריך.\n✗ לוגים עוזרים לזהות דליפות, לא שימוש נוכחי. זיכרון Node ≠ שימוש per-pod. HPA שולט ברפליקות, לא בזיכרון.",
      },
      {
        prompt:
          "Choosing the Right Memory Limit\n\n• Idle memory usage: ~240Mi\n• Under load: spikes to 320Mi\n• Current limit: 256Mi. Too low for spikes\n\nWhat is the correct fix?",
        promptHe:
          "בחירת מגבלת הזיכרון הנכונה\n\n• שימוש זיכרון במנוחה: ~240Mi\n• תחת עומס: עולה ל-320Mi\n• מגבלה נוכחית: 256Mi. נמוכה מדי לקפיצות\n\nמה התיקון הנכון?",
        options: [
          "Add an HPA with memory-based autoscaling to handle the spikes automatically",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Set memory request and limit both to 320Mi to match peak usage exactly",
        ],
        optionsHe: [
          "להוסיף HPA עם autoscaling מבוסס זיכרון לטיפול אוטומטי בקפיצות",
          "להגדיל את מגבלת הזיכרון ל-512Mi ולהגדיר request ל-256Mi ב-spec של ה-Deployment",
          "להוסיף NetworkPolicy לצמצום בקשות נכנסות",
          "להגדיר request ו-limit ל-320Mi בדיוק כמו שיא השימוש",
        ],
        answer: 1,
        hint: "The limit should allow headroom above peak usage. Setting it exactly at peak leaves zero margin.",
        hintHe: "המגבלה צריכה להשאיר מרווח מעל שיא השימוש. הגדרה בדיוק בשיא לא משאירה מרווח.",
        explanation:
          "✓ Set limit=512Mi (ceiling), request=256Mi (guaranteed). Gives headroom for traffic spikes.\n→ Follows K8s best practice: limit ≥ request, Burstable QoS class.\n✗ HPA scales replicas, not per-pod memory. Setting limit=320Mi leaves zero headroom - any spike above peak OOMKills again. NetworkPolicy controls traffic, not memory.",
        explanationHe:
          "✓ הגדר limit=512Mi (תקרה), request=256Mi (מובטח). מאפשר מרווח לקפיצות.\nעומד בנוהלי K8s: limit ≥ request, QoS class Burstable.\n✗ HPA משנה רפליקות, לא זיכרון per-pod. הגדרת limit=320Mi לא משאירה מרווח - כל קפיצה מעבר לשיא תגרום ל-OOMKill. NetworkPolicy שולטת בתעבורה, לא בזיכרון.",
      },
      {
        prompt:
          "Verifying the Rolling Update\n\n• Deployment patched with new memory limits\n• New limit: 512Mi, request: 256Mi\n• Rolling update in progress\n\nHow do you verify the update succeeded?",
        promptHe:
          "אימות ה-Rolling Update\n\n• ה-Deployment עודכן עם מגבלות זיכרון חדשות\n• מגבלה חדשה: 512Mi, request: 256Mi\n• Rolling update בתהליך\n\nכיצד מוודאים שהעדכון הצליח?",
        options: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (watch pod restarts)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "All of the above - rollout status + watching pods + events together",
        ],
        optionsHe: [
          "kubectl rollout status deployment/api-server -n production",
          "kubectl get pods -n production -w  (עקוב אחר אתחולי Pod)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp",
          "כל האמור לעיל: סטטוס rollout + מעקב Pods + Events יחד",
        ],
        answer: 3,
        hint: "A rolling update can fail in several ways. No single command catches all of them.",
        hintHe: "rolling update יכול להיכשל במספר דרכים. אף פקודה בודדת לא תופסת את כולן.",
        explanation:
          "✓ All three together give full confidence:\n→ `rollout status` confirms completion. Watch pods confirms Ready. Events reveals scheduling issues.\n✗ Any single command alone misses potential failure modes.",
        explanationHe:
          "✓ כל שלושתם יחד נותנים ביטחון מלא:\n`rollout status` מאשר סיום. מעקב Pods מאשר Ready. Events חושף בעיות תזמון.\n✗ כל פקודה בודדת לבדה מפספסת אופני כשל אפשריים.",
      },
      {
        prompt:
          "Post-Incident: Preventing Recurrence\n\n• Fix applied: memory limit increased to 512Mi\n• Pod stable for 15 minutes, no more OOMKills\n• Incident resolved\n\nWhat should you do before closing the incident?",
        promptHe:
          "לאחר האירוע: מניעת הישנות\n\n• תיקון הוחל: מגבלת זיכרון הוגדלה ל-512Mi\n• Pod יציב 15 דקות, אין עוד OOMKills\n• האירוע נפתר\n\nמה עליך לעשות לפני סגירת האירוע?",
        options: [
          "Increase all node sizes immediately as a precaution",
          "Add a Prometheus alert on memory usage > 80% of limit, and audit resource limits on all other Deployments",
          "Set memory limit to unlimited so it never OOMKills again",
          "No action needed - the incident is resolved",
        ],
        optionsHe: [
          "להגדיל את גודל כל ה-Nodes מיידית כאמצעי זהירות",
          "להוסיף התראת Prometheus על שימוש בזיכרון > 80% מהמגבלה, ולבדוק מגבלות משאבים בכל ה-Deployments האחרים",
          "להגדיר מגבלת זיכרון ללא הגבלה כדי שלא יהיה יותר OOMKill",
          "אין צורך בפעולה: האירוע נפתר",
        ],
        answer: 1,
        hint: "Fixing the immediate issue is not the same as preventing it from happening again.",
        hintHe: "תיקון הבעיה המיידית זה לא אותו דבר כמו למנוע אותה מלקרות שוב.",
        explanation:
          "✓ Add memory-usage alert (>80%) + audit all workloads → catches future OOM pressure before outage.\n✗ Unlimited limits removes safety, risks starving other pods. Closing without action guarantees recurrence.",
        explanationHe:
          "✓ הוסף התראת זיכרון (>80%) + בדוק כל עומסי העבודה. כך מאתרים לחץ OOM עתידי לפני השבתה.\n✗ מגבלות ללא הגבלה מסירות רשת ביטחון, מסכנות Pods אחרים. סגירה ללא פעולה מבטיחה הישנות.",
      },
    ],
    rootCause: "The API pods kept restarting because their memory limits were set too low for peak traffic. Under load, the process exceeded the limit and the kernel OOMKilled the container.",
    rootCauseHe: "פודי ה-API המשיכו להתאתחל כי מגבלות הזיכרון שלהם היו נמוכות מדי לתנועת שיא. תחת עומס, התהליך חרג מהמגבלה והקרנל ביצע OOMKill לקונטיינר.",
    correctApproach: "Check kubectl describe pod for the OOMKilled termination reason, review current memory limits versus actual usage with kubectl top, then raise the memory limit to match real-world consumption.",
    correctApproachHe: "לבדוק ב-kubectl describe pod את סיבת הסיום OOMKilled, לבדוק את מגבלות הזיכרון מול הצריכה בפועל עם kubectl top, ולהעלות את מגבלת הזיכרון בהתאם.",
    command: "kubectl top pods -n production --sort-by=memory",
    hint: "Look at the pod's termination reason - it tells you the kernel killed the process for exceeding memory.",
    hintHe: "בדוק את סיבת הסיום של ה-Pod - היא מספרת שהקרנל הרג את התהליך בגלל חריגה מהזיכרון.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Service unreachable - wrong selector / port mismatch
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "service-no-endpoints",
    incidentCode: "INC-3016",
    icon: "🔌",
    title: "Frontend to Backend: Connection Refused",
    titleShort: "Connection Refused",
    titleShortHe: "חיבור נדחה",
    titleHe: "פרונטאנד לבאקאנד: חיבור נדחה",
    description: "Frontend gets 'connection refused' calling the backend - pods look healthy",
    descriptionHe: "הפרונטאנד מקבל 'connection refused' מהבאקאנד, פודים נראים תקינים",
    cluster: "prod-central",
    namespace: "production",
    service: "backend-api",
    difficulty: "medium",
    estimatedTime: "5-7 min",
    objective: "Find why the frontend can't reach the backend API and restore service-to-service connectivity.",
    objectiveHe: "למצוא למה הפרונטאנד לא מצליח להגיע ל-API של הבאקאנד ולשחזר קישוריות בין שירותים.",
    constraints: [
      "Both frontend and backend teams are in a live call - communicate findings clearly",
      "Do not restart pods - they are healthy and serving other traffic",
      "The Service must not be deleted - it has annotations from the load balancer",
    ],
    constraintsHe: [
      "שני צוותי frontend ו-backend בשיחה חיה - תקשר ממצאים בבירור",
      "אין לאתחל Pods - הם תקינים ומשרתים תעבורה אחרת",
      "אין למחוק את ה-Service - יש לו annotations מה-load balancer",
    ],
    signals: [
      "Frontend logs: connect ECONNREFUSED 10.96.42.15:80",
      "Grafana: backend-api request latency graph shows no data points",
      "Last deploy: backend v2 shipped 20 min ago, changed pod template labels",
    ],
    signalsHe: [
      "לוגי Frontend: connect ECONNREFUSED 10.96.42.15:80",
      "Grafana: גרף latency של backend-api מציג אפס נקודות נתונים",
      "דיפלוי אחרון: backend v2 יצא לפני 20 דקות, שינה labels בתבנית ה-pod",
    ],
    steps: [
      {
        prompt:
          "Connection Refused - Backend Unreachable\n\n• Frontend cannot reach backend API - 'connection refused'\n• Both frontend and backend pods: Running/Ready\n• Error started after a recent deployment\n\nWhere do you start?",
        promptHe:
          "חיבור נדחה: Backend לא נגיש\n\n• הפרונטאנד לא מצליח להגיע ל-API הבאקאנד: 'connection refused'\n• Pods של frontend ו-backend: Running/Ready\n• השגיאה התחילה אחרי דיפלוימנט אחרון\n\nמאיפה מתחילים?",
        options: [
          "kubectl get svc backend-svc -n production  (inspect the Service)",
          "kubectl rollout restart deployment/backend -n production",
          "kubectl delete svc backend-svc -n production  (recreate it)  [destructive]",
          "kubectl get nodes  (check node health)",
        ],
        optionsHe: [
          "kubectl get svc backend-svc -n production  (בדוק את ה-Service)",
          "kubectl rollout restart deployment/backend -n production",
          "kubectl delete svc backend-svc -n production  (צור מחדש)  [destructive]",
          "kubectl get nodes  (בדוק תקינות Node)",
        ],
        answer: 0,
        hint: "Pods are Running. The issue is between the Service and the pods, not the pods themselves.",
        hintHe: "Pods רצים. הבעיה היא בין ה-Service לפודים, לא בפודים עצמם.",
        explanation:
          "✓ Pods healthy + Service unreachable → issue is in Service config (selector, port, targetPort).\n→ Inspect the Service first, before any destructive action.\n✗ Rolling restart won't fix a misconfigured Service. Deleting/recreating risks downtime. Nodes are irrelevant if pods are Running.",
        explanationHe:
          "✓ Pods תקינים + Service לא נגיש: הבעיה בהגדרת Service (selector, port, targetPort).\nבדוק את ה-Service קודם, לפני כל פעולה הרסנית.\n✗ rolling restart לא יתקן Service שגוי. מחיקה/יצירה מסכנת בהשבתה. Nodes לא רלוונטיים אם Pods רצים.",
      },
      {
        prompt:
          "Service Exists but Traffic Fails\n\n• Service exists with ClusterIP\n• Port 80 exposed\n• Pods are Running\n\nWhat is the single most diagnostic command?",
        promptHe:
          "Service קיים אך התעבורה נכשלת\n\n• Service קיים עם ClusterIP\n• פורט 80 חשוף\n• Pods רצים\n\nמהי הפקודה האבחונית ביותר?",
        options: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production",
          "kubectl describe node",
          "kubectl get pvc -n production",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production",
          "kubectl describe node",
          "kubectl get pvc -n production",
        ],
        answer: 0,
        hint: "A Service routes traffic to pods through a mechanism you can directly inspect.",
        hintHe: "Service מנתב תעבורה ל-Pods דרך מנגנון שאפשר לבדוק ישירות.",
        explanation:
          "✓ `kubectl get endpoints` shows if the Service matched any pods.\n→ Empty endpoints (`<none>`) = selector mismatch - the #1 cause of 'connection refused' when pods are healthy.\n✗ Ingress, nodes, and PVCs are unrelated to Service→Pod routing.",
        explanationHe:
          "✓ `kubectl get endpoints` מראה אם ה-Service התאים ל-Pods כלשהם.\nEndpoints ריקים (`<none>`) = אי-התאמת selector, הסיבה #1 ל-'connection refused' כשה-Pods תקינים.\n✗ Ingress, Nodes ו-PVCs לא קשורים לניתוב בין Service ל-Pod.",
      },
      {
        prompt:
          "Endpoints Are Empty\n\n• Endpoints: `<none>`\n• Service exists, pods exist, but they're not connected\n\nWhat do you do next?",
        promptHe:
          "Endpoints ריקים\n\n• Endpoints: `<none>`\n• Service קיים, Pods קיימים, אך לא מחוברים\n\nמה הצעד הבא?",
        options: [
          "kubectl get pods -n production --show-labels  (see actual pod labels)",
          "kubectl describe svc backend-svc -n production  (see the selector the Service uses)",
          "kubectl get pods -n production  (check pod count)",
          "Both A and B: compare pod labels to Service selector simultaneously",
        ],
        optionsHe: [
          "kubectl get pods -n production --show-labels  (ראה labels בפועל על ה-Pods)",
          "kubectl describe svc backend-svc -n production  (ראה את ה-selector שה-Service משתמש בו)",
          "kubectl get pods -n production  (בדוק מספר Pods)",
          "גם A וגם B: השווה labels של Pods ל-selector של Service בו-זמנית",
        ],
        answer: 3,
        hint: "Empty endpoints means nothing matches. You need to see both what the Service expects and what the pods actually have.",
        hintHe: "Endpoints ריקים אומר שלא נמצאה התאמה. צריך לראות גם מה ה-Service מצפה וגם מה באמת יש על ה-Pods.",
        explanation:
          "✓ Compare what the Service expects (`describe svc` → Selector) with actual pod labels (`--show-labels`).\n→ Side-by-side comparison reveals the mismatch instantly.\n✗ Neither alone is sufficient - you need both the expected and actual values.",
        explanationHe:
          "✓ השווה מה ה-Service מצפה (`describe svc`: Selector) ל-labels בפועל (`--show-labels`).\nהשוואה זה לצד זה חושפת את אי-ההתאמה מיידית.\n✗ אף אחד לבדו אינו מספיק, צריך גם את הערך המצופה וגם את הערך בפועל.",
      },
      {
        prompt:
          "Selector Mismatch Found\n\n• Service selector: `app=backend`\n• Actual pod labels: `app=backend-v2`\n• Label was changed in last deployment, Service not updated\n\nWhat is the fix?",
        promptHe:
          "נמצאה אי-התאמת Selector\n\n• Selector של Service: `app=backend`\n• Labels בפועל על Pods: `app=backend-v2`\n• ה-label שונה בדיפלוימנט האחרון, ה-Service לא עודכן\n\nמה התיקון?",
        options: [
          "Manually add label `app=backend` to every running pod with kubectl label",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "kubectl delete svc backend-svc && kubectl create -f svc.yaml  (recreate with correct selector)  [destructive]",
          "Add an annotation to the Service to bypass label matching",
        ],
        optionsHe: [
          "להוסיף ידנית label `app=backend` לכל Pod פעיל עם kubectl label",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "kubectl delete svc backend-svc && kubectl create -f svc.yaml  (צור מחדש עם selector נכון)  [destructive]",
          "להוסיף annotation ל-Service כדי לעקוף התאמת labels",
        ],
        answer: 1,
        hint: "You need to update the Service selector without downtime. Think about atomic updates.",
        hintHe: "צריך לעדכן את ה-selector של ה-Service ללא השבתה. חשוב על עדכונים אטומיים.",
        explanation:
          "✓ `kubectl patch svc` atomically updates the selector - zero downtime.\n→ Immediately connects the Service to the correct pods.\n✗ Manual pod labels are fragile (new pods won't have them). Delete+recreate causes downtime. Annotations don't affect routing.",
        explanationHe:
          "✓ `kubectl patch svc` מעדכן אטומית את ה-selector, ללא השבתה.\nמחבר מיידית את ה-Service ל-Pods הנכונים.\n✗ Labels ידניים שבריריים (Pods חדשים לא יכילו אותם). מחיקה+יצירה גורמת להשבתה. Annotations לא משפיעים על ניתוב.",
      },
      {
        prompt:
          "Verifying the Selector Patch\n\n• Selector updated to `app=backend-v2`\n• Need to confirm traffic flows end-to-end\n\nHow do you verify?",
        promptHe:
          "אימות עדכון ה-Selector\n\n• Selector עודכן ל-`app=backend-v2`\n• צריך לאשר שהתעבורה זורמת מקצה לקצה\n\nכיצד מאשרים?",
        options: [
          "kubectl get endpoints backend-svc -n production  (verify pod IPs appear)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (check pod status)",
          "Both A and B: verify endpoints are populated AND do a live connectivity test",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production  (אמת שכתובות IP של Pods מופיעות)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (בדוק סטטוס Pods)",
          "גם A וגם B: אמת שה-endpoints מאוכלסים וגם בצע בדיקת קישוריות חיה",
        ],
        answer: 3,
        hint: "Verifying endpoints exist is necessary but not sufficient. You also need to prove traffic actually flows.",
        hintHe: "אימות ש-endpoints קיימים הכרחי אך לא מספיק. צריך גם להוכיח שתעבורה באמת זורמת.",
        explanation:
          "✓ Endpoints populated proves selector matches. Live `curl` proves traffic actually reaches the backend.\n→ Both together confirm the full fix - endpoints can exist but a NetworkPolicy could still block.\n✗ Pod status alone doesn't prove connectivity.",
        explanationHe:
          "✓ Endpoints מאוכלסים מוכיח ש-selector תואם. `curl` חי מוכיח שתעבורה מגיעה לבאקאנד.\nשניהם יחד מאשרים תיקון מלא, endpoints יכולים להיות מאוכלסים אך NetworkPolicy עלולה לחסום.\n✗ סטטוס Pod לבדו לא מוכיח קישוריות.",
      },
      {
        prompt:
          "Post-Incident: Preventing Selector Drift\n\n• Traffic restored, incident resolved\n• Root cause: selector mismatch (label changed, Service not updated)\n\nWhat prevents this from reaching production again?",
        promptHe:
          "לאחר האירוע: מניעת סטיית Selector\n\n• תעבורה שוחזרה, אירוע נפתר\n• סיבה שורשית: אי-התאמת selector (label שונה, Service לא עודכן)\n\nמה ימנע את זה מלהגיע ל-production שוב?",
        options: [
          "Manually double-check Service selectors after every deployment",
          "Use Helm/Kustomize to derive both the Service selector and Deployment pod labels from a single shared value, and alert on kube_endpoint_ready == 0",
          "Switch all Services from ClusterIP to NodePort",
          "Add a comment in the YAML reminding engineers to update the selector",
        ],
        optionsHe: [
          "לבדוק ידנית selectors של Service אחרי כל דיפלוימנט",
          "Helm/Kustomize: גזור labels ו-selector מאותו משתנה, והתרע על kube_endpoint_ready == 0",
          "לעבור עם כל ה-Services מ-ClusterIP ל-NodePort",
          "להוסיף הערה ב-YAML שמזכירה למהנדסים לעדכן את ה-selector",
        ],
        answer: 1,
        hint: "Manual processes fail. Think about automation that keeps labels and selectors in sync.",
        hintHe: "תהליכים ידניים נכשלים. חשוב על אוטומציה ששומרת labels ו-selectors מסונכרנים.",
        explanation:
          "✓ Helm/Kustomize keeps labels and selectors in sync (single source of truth). Endpoint-ready alert catches issues instantly.\n✗ Manual checks and comments are error-prone. NodePort doesn't address selector matching.",
        explanationHe:
          "✓ Helm/Kustomize שומר labels ו-selectors מסונכרנים (מקור אמת אחד). התראת endpoint-ready מאתרת בעיות מיידית.\n✗ בדיקות ידניות והערות נוטות לשגיאה. NodePort לא פותר התאמת selector.",
      },
    ],
    rootCause: "The frontend couldn't reach the backend because the Service selector labels didn't match the pod labels. The Service had zero endpoints, so all requests got 'Connection Refused'.",
    rootCauseHe: "הפרונטאנד לא הצליח להגיע לבאקאנד כי ה-labels של ה-Service selector לא תאמו את ה-labels של הפודים. ל-Service היו אפס endpoints, ולכן כל הבקשות קיבלו 'Connection Refused'.",
    correctApproach: "Compare the Service selector with the actual pod labels using kubectl get endpoints and kubectl describe service to find the mismatch, then fix the selector or pod labels.",
    correctApproachHe: "להשוות את ה-selector של ה-Service מול ה-labels בפועל של הפודים באמצעות kubectl get endpoints ו-kubectl describe service כדי לזהות את אי-ההתאמה, ולתקן את ה-selector או את ה-labels.",
    command: "kubectl get endpoints backend-api-svc -n production",
    hint: "Check the Service endpoints - if the list is empty, the selector doesn't match any pods.",
    hintHe: "בדוק את ה-endpoints של ה-Service - אם הרשימה ריקה, ה-selector לא תואם אף Pod.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. DNS resolution failures - CoreDNS OOMKilled
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "dns-coredns",
    incidentCode: "INC-4007",
    icon: "🌐",
    title: "Cascading Failures: Services Can't Find Each Other",
    titleShort: "DNS Resolution Failure",
    titleShortHe: "כשל ב-DNS",
    titleHe: "כשלים מדורגים: שירותים לא מוצאים אחד את השני",
    description: "Multiple services can't resolve each other by hostname - widespread outage",
    descriptionHe: "שירותים מרובים לא מצליחים לפתור שמות, השבתה נרחבת",
    cluster: "prod-central",
    namespace: "kube-system",
    service: "coredns",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    objective: "Restore DNS resolution across the cluster and identify why CoreDNS stopped functioning.",
    objectiveHe: "לשחזר פתרון DNS ברחבי הקלאסטר ולזהות למה CoreDNS הפסיק לתפקד.",
    constraints: [
      "SEV-1: every service in the cluster is affected",
      "kube-system namespace requires cluster-admin approval for changes",
      "Do not restart all pods - this will cause a cascading outage",
    ],
    constraintsHe: [
      "SEV-1: כל שירות בקלאסטר מושפע",
      "namespace של kube-system דורש אישור cluster-admin לשינויים",
      "אין לאתחל את כל ה-Pods - זה יגרום להשבתה מדורגת",
    ],
    signals: [
      "Multiple teams in #incidents: \"our service can't resolve any hostnames\"",
      "Prometheus: coredns_dns_requests_total dropped to 0",
      "kubectl events (kube-system): Back-off restarting failed container coredns",
    ],
    signalsHe: [
      "צוותים מרובים ב-#incidents: \"השירות שלנו לא מצליח לפענח שמות\"",
      "Prometheus: coredns_dns_requests_total ירד ל-0",
      "kubectl events (kube-system): Back-off restarting failed container coredns",
    ],
    steps: [
      {
        prompt:
          "Cluster-Wide DNS Failure\n\n• Multiple apps log 'no such host' errors\n• DNS appears broken across the entire cluster\n\nHow do you confirm the DNS issue?",
        promptHe:
          "כשל DNS ברחבי הקלאסטר\n\n• אפליקציות מרובות מתעדות 'no such host'\n• ה-DNS נראה שבור בכל הקלאסטר\n\nכיצד מאשרים את בעיית ה-DNS?",
        options: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "Restart all pods in all namespaces  [destructive]",
          "Check AWS Route53 or your cloud DNS settings",
          "kubectl get nodes  (check if nodes are down)",
        ],
        optionsHe: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "לאתחל את כל ה-Pods בכל ה-namespaces  [destructive]",
          "לבדוק AWS Route53 או הגדרות DNS של ה-Cloud שלך",
          "kubectl get nodes  (בדוק אם Nodes ירדו)",
        ],
        answer: 0,
        hint: "Before investigating, confirm the problem. What's the most basic DNS record in a Kubernetes cluster?",
        hintHe: "לפני חקירה, אשר את הבעיה. מה רשומת ה-DNS הבסיסית ביותר בקלאסטר Kubernetes?",
        explanation:
          "✓ `nslookup kubernetes.default` tests the most fundamental in-cluster DNS entry.\n→ Confirms the problem is cluster DNS, not individual app configs.\n✗ Cloud DNS (Route53) handles external names, not K8s service discovery. Restarting all pods = massive downtime.",
        explanationHe:
          "✓ `nslookup kubernetes.default` בודק את רשומת ה-DNS הפנימית הבסיסית ביותר.\nמאשר שהבעיה היא DNS קלאסטרי, לא הגדרות אפליקציה.\n✗ Cloud DNS (Route53) לשמות חיצוניים, לא לגילוי שירותים. אתחול כל ה-Pods = השבתה מסיבית.",
      },
      {
        prompt:
          "DNS Resolution Returns NXDOMAIN\n\n• `nslookup kubernetes.default` returns NXDOMAIN\n• Cluster DNS confirmed non-functional\n\nWhere does Kubernetes cluster DNS run?",
        promptHe:
          "פתרון DNS מחזיר NXDOMAIN\n\n• `nslookup kubernetes.default` מחזיר NXDOMAIN\n• DNS קלאסטרי אושר כלא-פעיל\n\nהיכן רץ ה-DNS של cluster Kubernetes?",
        options: [
          "On every node as a system daemon (systemd-resolved)",
          "As CoreDNS pods in the kube-system namespace",
          "Inside etcd as part of the control plane",
          "In every application namespace as a sidecar",
        ],
        optionsHe: [
          "על כל Node כ-daemon של המערכת (systemd-resolved)",
          "כ-Pods של CoreDNS ב-namespace של kube-system",
          "בתוך etcd כחלק מה-control plane",
          "בכל namespace של אפליקציה כ-sidecar",
        ],
        answer: 1,
        hint: "Kubernetes DNS is provided by a component that runs as pods, not as a system daemon.",
        hintHe: "DNS של Kubernetes מסופק על ידי רכיב שרץ כ-Pods, לא כ-daemon מערכת.",
        explanation:
          "✓ CoreDNS pods in `kube-system` handle all in-cluster service discovery.\n→ If they're unhealthy, all DNS resolution fails cluster-wide.\n✗ It's not a node daemon, not in etcd, and not a sidecar.",
        explanationHe:
          "✓ Pods של CoreDNS ב-`kube-system` מטפלים בכל גילוי השירותים הפנימי.\nאם הם לא תקינים, כל פתרון ה-DNS נכשל בכל הקלאסטר.\n✗ זה לא daemon של Node, לא ב-etcd, ולא sidecar.",
      },
      {
        prompt:
          "CoreDNS Pods Crashing - OOMKilled\n\n• Both CoreDNS pods show status OOMKilled\n• Each has restarted 7 times\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nWhat should you do before changing anything?",
        promptHe:
          "Pods של CoreDNS קורסים: OOMKilled\n\n• שני Pods של CoreDNS מציגים סטטוס OOMKilled\n• כל אחד אותחל 7 פעמים\n\nNAME              STATUS      RESTARTS\ncoredns-abc12     OOMKilled   7\ncoredns-def34     OOMKilled   7\n\nמה יש לעשות לפני שמשנים דבר?",
        options: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (force restart)  [destructive]",
          "kubectl describe pod coredns-abc12 -n kube-system  (check memory limit)",
          "kubectl top pod -n kube-system  (check actual memory usage)",
          "Both B and C: check the configured limit AND actual consumption before acting",
        ],
        optionsHe: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (כפה אתחול מחדש)  [destructive]",
          "kubectl describe pod coredns-abc12 -n kube-system  (בדוק מגבלת זיכרון)",
          "kubectl top pod -n kube-system  (בדוק שימוש זיכרון בפועל)",
          "גם B וגם C: בדוק את המגבלה המוגדרת וגם את הצריכה בפועל לפני פעולה",
        ],
        answer: 3,
        hint: "OOMKilled means a memory limit was exceeded. Before changing anything, understand both the limit and the actual usage.",
        hintHe: "OOMKilled אומר שמגבלת זיכרון נחרגה. לפני שמשנים משהו, צריך להבין גם את המגבלה וגם את השימוש בפועל.",
        explanation:
          "✓ Check both the limit (`describe`) and actual usage (`top`) to decide the new limit.\n→ Data-driven decisions prevent setting incorrect limits.\n✗ Deleting pods restarts them into the same OOMKill cycle immediately.",
        explanationHe:
          "✓ בדוק גם את המגבלה (`describe`) וגם את השימוש בפועל (`top`) כדי להחליט על מגבלה חדשה.\nהחלטות מבוססות-נתונים מונעות הגדרת מגבלות שגויות.\n✗ מחיקת Pods מאתחלת אותם למחזור OOMKill זהה מיידית.",
      },
      {
        prompt:
          "CoreDNS Memory at 99% of Limit\n\n• Memory limit: 170Mi\n• Current usage: 168Mi (99% of limit)\n• Cluster recently scaled from 20 to 80 nodes\n\nWhat is the likely root cause?",
        promptHe:
          "זיכרון CoreDNS ב-99% מהמגבלה\n\n• מגבלת זיכרון: 170Mi\n• שימוש נוכחי: 168Mi (99% מהמגבלה)\n• הקלאסטר גדל לאחרונה מ-20 ל-80 Nodes\n\nמה הסיבה השורשית הסבירה?",
        options: [
          "A memory leak in the CoreDNS binary - upgrade CoreDNS immediately",
          "The cluster grew significantly; CoreDNS caches DNS records for many more Services and Pods now, requiring more memory",
          "The CoreDNS ConfigMap is corrupt - restore it from backup",
          "The underlying node is overloaded and swapping memory",
        ],
        optionsHe: [
          "דליפת זיכרון בבינארי של CoreDNS, שדרג CoreDNS מיידית",
          "הקלאסטר גדל פי 4, CoreDNS צריך יותר זיכרון לשמירת רשומות עבור Services ו-Pods הנוספים",
          "ה-ConfigMap של CoreDNS פגום, שחזר מגיבוי",
          "ה-Node הבסיסי עמוס ומחליף זיכרון (swapping)",
        ],
        answer: 1,
        hint: "The cluster grew 4x recently. Think about what scales with cluster size.",
        hintHe: "הקלאסטר גדל פי 4 לאחרונה. חשוב מה גדל ביחד עם גודל הקלאסטר.",
        explanation:
          "✓ CoreDNS memory scales with cluster size - more Services/Pods = larger DNS cache.\n→ At 4× cluster size, 170Mi is no longer enough.\n✗ Corrupt config → errors, not gradual memory growth. Node swap affects all pods equally, not just CoreDNS.",
        explanationHe:
          "✓ זיכרון CoreDNS גדל עם גודל הקלאסטר, יותר Services/Pods = cache DNS גדול יותר.\nבגודל קלאסטר פי 4, 170Mi כבר לא מספיק.\n✗ קונפיגורציה פגומה גורמת לשגיאות, לא גדילת זיכרון הדרגתית. swap ב-Node משפיע על כל ה-Pods בשווה.",
      },
      {
        prompt:
          "Increasing CoreDNS Memory Safely\n\n• Root cause: cluster growth outgrew memory limit\n• Need to increase limit without DNS blackout\n• CoreDNS is a critical system component\n\nHow do you do this safely?",
        promptHe:
          "הגדלת זיכרון CoreDNS בבטחה\n\n• סיבה שורשית: הקלאסטר גדל מעבר למגבלת הזיכרון\n• צריך להגדיל מגבלה ללא השבתת DNS\n• CoreDNS הוא רכיב מערכת קריטי\n\nכיצד עושים זאת בבטחה?",
        options: [
          "kubectl edit deployment coredns -n kube-system  (increase memory limit, triggers rolling update)",
          "kubectl delete deployment coredns -n kube-system  (delete and recreate)  [destructive]",
          "Restart all control-plane components  [destructive]",
          "Add more nodes to the cluster",
        ],
        optionsHe: [
          "kubectl edit deployment coredns -n kube-system  (הגדל מגבלת זיכרון, מפעיל rolling update)",
          "kubectl delete deployment coredns -n kube-system  (מחק וצור מחדש)  [destructive]",
          "לאתחל את כל רכיבי ה-control plane  [destructive]",
          "להוסיף עוד Nodes לקלאסטר",
        ],
        answer: 0,
        hint: "CoreDNS is critical. You need a zero-downtime approach to update its resources.",
        hintHe: "CoreDNS קריטי. צריך גישה ללא השבתה לעדכון המשאבים שלו.",
        explanation:
          "✓ `kubectl edit deployment` triggers a rolling update - one pod restarts at a time, DNS stays available.\n→ Safe, zero-downtime approach for system-critical pods.\n✗ Deleting the deployment = total DNS outage. More nodes doesn't fix per-pod memory limits.",
        explanationHe:
          "✓ `kubectl edit deployment` מפעיל rolling update, Pod אחד בכל פעם, DNS נשאר זמין.\nגישה בטוחה ללא השבתה עבור Pods קריטיים למערכת.\n✗ מחיקת Deployment = השבתת DNS מוחלטת. יותר Nodes לא מתקן מגבלת זיכרון per-pod.",
      },
      {
        prompt:
          "Verifying DNS Restoration\n\n• CoreDNS memory limit increased to 512Mi\n• Pods show Running status\n• Need to confirm DNS is fully functional\n\nHow do you verify DNS is fully restored?",
        promptHe:
          "אימות שחזור DNS\n\n• מגבלת זיכרון CoreDNS הוגדלה ל-512Mi\n• Pods מציגים סטטוס Running\n• צריך לאשר ש-DNS פעיל לחלוטין\n\nכיצד מאמתים ש-DNS שוחזר לחלוטין?",
        options: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (confirm Running status)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (check for errors)",
          "All of the above - pods healthy + no log errors + successful DNS resolution test",
        ],
        optionsHe: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system  (אשר סטטוס Running)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (בדוק שגיאות)",
          "כל האמור לעיל: Pods תקינים + אין שגיאות בלוג + בדיקת פתרון DNS הצליחה",
        ],
        answer: 3,
        hint: "A pod being Running doesn't mean the service it provides is healthy. You need functional verification.",
        hintHe: "Pod שרץ לא אומר שהשירות שהוא מספק תקין. צריך אימות תפקודי.",
        explanation:
          "✓ Full DNS health check: Running pods + clean logs + successful resolution test.\n→ A pod can be Running but serve degraded results if cache is corrupted.\n✗ Any single check alone can miss failure modes.",
        explanationHe:
          "✓ בדיקת DNS מלאה: Pods רצים + לוגים נקיים + בדיקת פתרון מוצלחת.\nPod יכול להיות Running אך לשרת תוצאות מדורדרות אם ה-cache פגום.\n✗ כל בדיקה בודדת יכולה לפספס אופני כשל.",
      },
      {
        prompt:
          "Post-Incident: DNS Monitoring Strategy\n\n• DNS restored and stable\n• Root cause: cluster growth outgrew CoreDNS memory limit\n\nWhat monitoring prevents this from happening silently again?",
        promptHe:
          "לאחר האירוע: אסטרטגיית ניטור DNS\n\n• DNS שוחזר ויציב\n• סיבה שורשית: גדילת קלאסטר חרגה ממגבלת זיכרון CoreDNS\n\nאיזה ניטור ימנע את זה מלהיכשל שוב בשקט?",
        options: [
          "Alert when CoreDNS pod memory usage exceeds 80% of its limit",
          "Alert on CoreDNS pod restart count > 0 in 5 minutes",
          "Alert on CoreDNS P99 DNS query latency > 100ms",
          "All three - memory pressure, restarts, and latency all indicate DNS health degrading",
        ],
        optionsHe: [
          "להתריע כאשר שימוש הזיכרון של Pod CoreDNS עולה על 80% ממגבלתו",
          "להתריע על ספירת אתחולי Pod CoreDNS > 0 תוך 5 דקות",
          "להתריע על זמן אחזור DNS P99 של CoreDNS > 100ms",
          "כל שלושתם: לחץ זיכרון, אתחולים ועיכוב כולם מעידים על ירידה בבריאות DNS",
        ],
        answer: 3,
        hint: "This incident was caused by memory pressure but manifested as DNS failures. Multiple signals catch different failure modes.",
        hintHe: "האירוע הזה נגרם מלחץ זיכרון אך התבטא ככשל DNS. אותות מרובים תופסים אופני כשל שונים.",
        explanation:
          "✓ All three signals together: memory approaching limit, pod restarts, and query latency.\n→ Monitoring only one leaves you blind to other failure modes.\n✗ This incident showed that memory can degrade silently without restarts initially.",
        explanationHe:
          "✓ כל שלושת האותות יחד: זיכרון מתקרב למגבלה, אתחולי Pod ועיכוב שאילתא.\nניטור אות אחד בלבד משאיר עיוור לאופני כשל אחרים.\n✗ אירוע זה הדגים שזיכרון יכול להתדרדר בשקט בלי אתחולים בהתחלה.",
      },
    ],
    rootCause: "CoreDNS pods in kube-system were OOMKilled due to insufficient memory limits. Without functioning DNS, services couldn't resolve each other's names, causing cascading failures across the cluster.",
    rootCauseHe: "פודי CoreDNS ב-kube-system עברו OOMKill בגלל מגבלות זיכרון לא מספיקות. בלי DNS תקין, שירותים לא הצליחו לפענח שמות של שירותים אחרים, מה שגרם לכשלים מדורגים בכל ה-cluster.",
    correctApproach: "Test DNS resolution from inside a pod with nslookup, check CoreDNS pod status in kube-system, identify the OOMKilled state, and raise CoreDNS memory limits.",
    correctApproachHe: "לבדוק פענוח DNS מתוך Pod עם nslookup, לבדוק את סטטוס פודי CoreDNS ב-kube-system, לזהות את מצב ה-OOMKilled, ולהעלות את מגבלות הזיכרון של CoreDNS.",
    command: "kubectl logs -n kube-system -l k8s-app=kube-dns --previous",
    hint: "When nothing can resolve DNS - check the DNS provider itself. CoreDNS runs as pods in kube-system.",
    hintHe: "כשאף שירות לא מצליח לפענח DNS - בדוק את ספק ה-DNS עצמו. CoreDNS רץ כפודים ב-kube-system.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. NetworkPolicy blocks traffic after security update
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "networkpolicy-block",
    incidentCode: "INC-4008",
    icon: "🚧",
    title: "Post-Security-Update: Silent Request Timeouts",
    titleShort: "Silent Request Timeouts",
    titleShortHe: "Timeout שקט על בקשות",
    titleHe: "אחרי עדכון אבטחה: Timeout שקט על כל הבקשות",
    description: "Service calls time out after the security team applied new NetworkPolicies",
    descriptionHe: "קריאות לשירות מסתיימות ב-timeout אחרי עדכון מדיניות אבטחה",
    cluster: "prod-central",
    namespace: "production",
    service: "checkout-service",
    difficulty: "hard",
    estimatedTime: "7-9 min",
    objective: "Identify which NetworkPolicy is blocking traffic and restore connectivity without weakening security.",
    objectiveHe: "לזהות איזו NetworkPolicy חוסמת תעבורה ולשחזר קישוריות מבלי להחליש את האבטחה.",
    constraints: [
      "Security team owns NetworkPolicy changes - coordinate before modifying",
      "Do not delete deny-all policies - they are required by compliance",
      "Changes must be auditable and reversible",
    ],
    constraintsHe: [
      "צוות אבטחה אחראי על NetworkPolicy - תאם לפני שינוי",
      "אין למחוק deny-all policies - הם נדרשים לציות",
      "שינויים חייבים להיות ברי-ביקורת והפיכים",
    ],
    signals: [
      "Datadog: checkout-service p99 latency spiked to 30s (timeout)",
      "Slack #security: \"Applied new NetworkPolicies to production\" - @secteam 15 min ago",
      "Frontend error logs: upstream connect error or disconnect/reset before headers",
    ],
    signalsHe: [
      "Datadog: latency p99 של checkout-service קפצה ל-30s (timeout)",
      "Slack #security: \"Applied new NetworkPolicies to production\" - @secteam לפני 15 דקות",
      "לוגי שגיאות Frontend: upstream connect error or disconnect/reset before headers",
    ],
    steps: [
      {
        prompt:
          "Silent Timeouts After Security Update\n\n• Frontend-to-backend calls silently time out\n• Security team just applied new NetworkPolicies\n• Both frontend and backend pods: Running/Ready\n\nWhat do you check first?",
        promptHe:
          "Timeout שקט אחרי עדכון אבטחה\n\n• קריאות מ-frontend ל-backend מסתיימות ב-timeout בשקט\n• צוות אבטחה החיל NetworkPolicies חדשות\n• Pods של frontend ו-backend: Running/Ready\n\nמה בודקים קודם?",
        options: [
          "kubectl get networkpolicy -n production  (list all policies in the namespace)",
          "kubectl rollout undo deployment/backend -n production  (roll back backend)",
          "kubectl get endpoints backend-svc -n production  (check if Service routes traffic)",
          "kubectl get pods -n production  (verify pod health again)",
        ],
        optionsHe: [
          "kubectl get networkpolicy -n production  (רשום את כל המדיניות ב-namespace)",
          "kubectl rollout undo deployment/backend -n production  (rollback לבאקאנד)",
          "kubectl get endpoints backend-svc -n production  (בדוק אם ה-Service מנתב תעבורה)",
          "kubectl get pods -n production  (אמת שוב תקינות Pods)",
        ],
        answer: 0,
        hint: "The issue started right after a specific change. Start by looking at what changed.",
        hintHe: "הבעיה התחילה מיד אחרי שינוי ספציפי. התחל בלבדוק מה השתנה.",
        explanation:
          "✓ Incident correlates with a NetworkPolicy change - inspect the policies first.\n✗ Rolling back backend won't fix a network-layer issue. Endpoints show Service-to-Pod routing, not policy enforcement. Pod health already confirmed.",
        explanationHe:
          "✓ האירוע מתואם לשינוי NetworkPolicy, בדוק את המדיניות קודם.\n✗ Rollback לבאקאנד לא יתקן בעיית שכבת רשת. Endpoints מראים ניתוב Service-to-Pod, לא אכיפת policy. תקינות Pods כבר אושרה.",
      },
      {
        prompt:
          "Inspecting NetworkPolicy Rules\n\n• Policies found: `deny-all-ingress`, `allow-frontend`\n• Need to understand what each policy permits\n\nHow do you inspect the rules?",
        promptHe:
          "בדיקת כללי NetworkPolicy\n\n• Policies שנמצאו: `deny-all-ingress`, `allow-frontend`\n• צריך להבין מה כל policy מתירה\n\nכיצד בודקים את הכללים?",
        options: [
          "kubectl describe networkpolicy -n production  (shows selectors and rules for all policies)",
          "kubectl logs networkpolicy-controller -n kube-system",
          "kubectl get events -n production",
          "kubectl exec into a pod and inspect iptables rules",
        ],
        optionsHe: [
          "kubectl describe networkpolicy -n production  (מציג selectors וכללים לכל המדיניות)",
          "kubectl logs networkpolicy-controller -n kube-system",
          "kubectl get events -n production",
          "kubectl exec לתוך Pod ובדוק כללי iptables",
        ],
        answer: 0,
        hint: "You need to see the actual rules - selectors, ports, and allowed sources - in a human-readable format.",
        hintHe: "צריך לראות את הכללים בפועל - selectors, ports ומקורות מורשים - בפורמט קריא.",
        explanation:
          "✓ `kubectl describe networkpolicy` shows podSelector and ingress/egress rules in readable format.\n→ This is the fastest way to read what each policy permits.\n✗ NetworkPolicy controllers don't expose user logs. Events lack rule details. iptables requires root and is hard to interpret.",
        explanationHe:
          "✓ `kubectl describe networkpolicy` מציג podSelector וכללי ingress/egress בפורמט קריא.\nזו הדרך המהירה ביותר לקרוא מה כל policy מתירה.\n✗ בקרי NetworkPolicy לא חושפים לוגים. Events חסרי פרטי כללים. iptables דורש root ומורכב לפרשנות.",
      },
      {
        prompt:
          "Suspect Label Mismatch in Policy\n\n• `allow-frontend` targets backend pods, allows ingress from `role=frontend`\n• `deny-all-ingress` blocks all other traffic\n\nWhat must you check?",
        promptHe:
          "חשד לאי-התאמת Labels ב-Policy\n\n• `allow-frontend` מטרגטת Pods של backend, מתירה ingress מ-`role=frontend`\n• `deny-all-ingress` חוסמת כל תעבורה אחרת\n\nמה חייבים לבדוק?",
        options: [
          "kubectl get pods -n production --show-labels  (check actual labels on frontend pods)",
          "kubectl delete networkpolicy deny-all-ingress -n production  [destructive]",
          "kubectl get svc -n production",
          "kubectl describe deployment frontend -n production",
        ],
        optionsHe: [
          "kubectl get pods -n production --show-labels  (בדוק labels בפועל על Pods של פרונטאנד)",
          "kubectl delete networkpolicy deny-all-ingress -n production  [destructive]",
          "kubectl get svc -n production",
          "kubectl describe deployment frontend -n production",
        ],
        answer: 0,
        hint: "The allow rule uses a label selector. If the pods don't have that label, the rule has no effect.",
        hintHe: "כלל ה-allow משתמש ב-label selector. אם ל-Pods אין את ה-label הזה, לכלל אין השפעה.",
        explanation:
          "✓ NetworkPolicies match pods by labels. If frontend pods lack `role=frontend`, the allow rule won't match them.\n→ Verify actual pod labels before modifying any policy.\n✗ Deleting deny-all weakens security. Services and deployment details won't reveal the label mismatch.",
        explanationHe:
          "✓ NetworkPolicies מתאימים Pods לפי labels. אם Pods של frontend חסרים `role=frontend`, כלל ה-allow לא יתאים.\nאמת labels בפועל לפני שינוי מדיניות.\n✗ מחיקת deny-all מחלישה אבטחה. Services ופרטי Deployment לא יחשפו אי-התאמת labels.",
      },
      {
        prompt:
          "Label Mismatch Confirmed\n\n• Policy expects: `role=frontend`\n• Actual pod labels: `app=frontend`\n• Frontend traffic blocked by deny-all\n\nWhat is the correct fix?",
        promptHe:
          "אי-התאמת Labels אושרה\n\n• Policy מצפה ל: `role=frontend`\n• Labels בפועל: `app=frontend`\n• תעבורת frontend חסומה על ידי deny-all\n\nמה התיקון הנכון?",
        options: [
          "kubectl label pod <each-frontend-pod> role=frontend  (relabel individual pods)",
          "kubectl patch networkpolicy allow-frontend -n production  (change from-selector to match `app=frontend`)",
          "kubectl delete networkpolicy deny-all-ingress  (remove the default-deny)  [destructive]",
          "Add `role=frontend` to the frontend Deployment's pod template labels",
        ],
        optionsHe: [
          "kubectl label pod <כל-pod-פרונטאנד> role=frontend  (תייג מחדש Pods בודדים)",
          "kubectl patch networkpolicy allow-frontend -n production  (עדכן from-selector ל-`app=frontend`)",
          "kubectl delete networkpolicy deny-all-ingress  (הסר את ה-default-deny)  [destructive]",
          "הוסף `role=frontend` ל-labels של pod template של Deployment הפרונטאנד",
        ],
        answer: 1,
        hint: "The fix should match the policy to reality, not remove security controls.",
        hintHe: "התיקון צריך להתאים את ה-policy למציאות, לא להסיר בקרות אבטחה.",
        explanation:
          "✓ `kubectl patch networkpolicy` updates the from-selector to match actual labels (`app=frontend`).\n→ Immediate fix, no rollout needed.\n✗ Manual pod labels are fragile. Deleting deny-all weakens security. Adding Deployment labels requires a rollout.",
        explanationHe:
          "✓ `kubectl patch networkpolicy` מעדכן את ה-from-selector להתאים ל-labels בפועל (`app=frontend`).\nתיקון מיידי, ללא צורך ב-rollout.\n✗ Labels ידניים שבריריים. מחיקת deny-all מחלישה אבטחה. הוספת labels ל-Deployment דורשת rollout.",
      },
      {
        prompt:
          "Verifying the Policy Patch\n\n• from-selector updated to `app=frontend`\n• Need to confirm traffic flows before declaring resolved\n\nHow do you verify?",
        promptHe:
          "אימות עדכון ה-Policy\n\n• from-selector עודכן ל-`app=frontend`\n• צריך לאשר שהתעבורה זורמת לפני הכרזת פתרון\n\nכיצד מאמתים?",
        options: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "Wait for real user traffic and monitor error rates",
          "kubectl get endpoints backend-svc -n production",
          "kubectl describe networkpolicy allow-frontend -n production  (read the updated policy)",
        ],
        optionsHe: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "להמתין לתעבורת משתמשים אמיתית ולנטר שיעורי שגיאות",
          "kubectl get endpoints backend-svc -n production",
          "kubectl describe networkpolicy allow-frontend -n production  (קרא את המדיניות המעודכנת)",
        ],
        answer: 0,
        hint: "Reading the policy tells you what should happen. You need to prove it actually works.",
        hintHe: "קריאת ה-policy אומרת מה אמור לקרות. צריך להוכיח שזה באמת עובד.",
        explanation:
          "✓ A temporary curl pod sends real traffic along the exact broken path - true end-to-end test.\n→ This is the only test that proves traffic actually flows through the policy.\n✗ Waiting risks continued impact. Endpoints and describe are read-only - can't prove traffic flows.",
        explanationHe:
          "✓ Pod curl זמני שולח תעבורה בפועל לאורך הנתיב שהיה שבור, בדיקת end-to-end אמיתית.\nזו הבדיקה היחידה שמוכיחה שתעבורה עוברת דרך ה-policy.\n✗ המתנה מסכנת המשך השפעה. Endpoints ו-describe לקריאה בלבד, לא מוכיחים תעבורה.",
      },
      {
        prompt:
          "Post-Incident: Preventing Policy Drift\n\n• Traffic restored\n• Root cause: label mismatch in NetworkPolicy\n\nHow do you ensure this cannot silently reach production again?",
        promptHe:
          "לאחר האירוע: מניעת סטיית Policy\n\n• תעבורה שוחזרה\n• סיבה שורשית: אי-התאמת labels ב-NetworkPolicy\n\nכיצד מבטיחים שזה לא יגיע ל-production שוב בשקט?",
        options: [
          "Ask engineers to manually verify NetworkPolicy selectors after every deployment",
          "Store NetworkPolicies in Git (GitOps), run a policy linter (e.g., Kube-linter) in CI, and validate in staging before production",
          "Disable NetworkPolicy on the cluster  [destructive]",
          "Only apply NetworkPolicies during maintenance windows",
        ],
        optionsHe: [
          "לבקש ממהנדסים לאמת ידנית selectors של NetworkPolicy אחרי כל דיפלוימנט",
          "GitOps לניהול NetworkPolicies, linter (Kube-linter) ב-CI, ואימות ב-staging לפני production",
          "להשבית NetworkPolicy על הקלאסטר  [destructive]",
          "להחיל NetworkPolicies רק במהלך חלונות תחזוקה",
        ],
        answer: 1,
        hint: "The root cause was human error in policy configuration. Think about automated validation.",
        hintHe: "הסיבה השורשית הייתה טעות אנוש בהגדרת policy. חשוב על אימות אוטומטי.",
        explanation:
          "✓ GitOps = version-controlled + auditable. CI linter catches mismatches before merge. Staging validates runtime.\n→ Automated checks eliminate human error.\n✗ Manual checks and comments are error-prone. Disabling NetworkPolicy removes security entirely.",
        explanationHe:
          "✓ GitOps = ניהול גרסאות + בר-ביקורת. Linter ב-CI מאתר אי-התאמות לפני מיזוג. Staging מאמת runtime.\nבדיקות אוטומטיות מבטלות טעויות אנוש.\n✗ בדיקות ידניות נוטות לשגיאה. השבתת NetworkPolicy מסירה אבטחה לחלוטין.",
      },
      {
        prompt:
          "Security Team Question: Validating Policies Safely\n\n• A new NetworkPolicy needs to be deployed\n• Must enforce exactly what's intended\n• Cannot cause outages\n\nHow do you validate a new NetworkPolicy without causing outages?",
        promptHe:
          "שאלת צוות אבטחה: אימות Policies בבטחה\n\n• NetworkPolicy חדשה צריכה להיות מוצבת\n• חייבת לאכוף בדיוק את המיועד\n• לא יכולה לגרום להשבתות\n\nכיצד מאמתים ש-NetworkPolicy חדשה אוכפת בדיוק את המיועד, ללא השבתות?",
        options: [
          "Apply in production and monitor; roll back if issues appear",
          "Read the YAML carefully and trust it is correct",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview changes",
        ],
        optionsHe: [
          "להחיל ב-production ולנטר; לבצע rollback אם מופיעות בעיות",
          "לקרוא את ה-YAML בקפידה ולבטוח שהוא נכון",
          "ב-staging: התחל עם deny-all, הוסף כל כלל allow, ואמת שרק התעבורה המיועדת עוברת",
          "להשתמש ב-kubectl dry-run לתצוגה מקדימה של שינויים",
        ],
        answer: 2,
        hint: "Validation means proving the policy enforces what you expect, not just that the syntax is valid.",
        hintHe: "אימות אומר להוכיח שה-policy אוכפת את מה שמצופה, לא רק שהתחביר תקין.",
        explanation:
          "✓ Zero-trust testing in staging: deny-all → add each allow → test that only expected traffic passes.\n→ Proves enforcement, not just syntax.\n✗ `dry-run` only checks API validity. Production-first risks user impact. Reading YAML doesn't prove enforcement.",
        explanationHe:
          "✓ בדיקת zero-trust ב-staging: התחל עם deny-all, הוסף כל allow, ובדוק שרק התעבורה המצופה עוברת.\nמוכיח אכיפה, לא רק תחביר.\n✗ `dry-run` בודק תקפות API בלבד. Production-first מסכן משתמשים. קריאת YAML לא מוכיחה אכיפה.",
      },
    ],
    rootCause: "A security-team NetworkPolicy update used incorrect pod selector labels. The policy blocked all ingress traffic to the API pods because the label in the 'allow' rule didn't match the actual pod labels.",
    rootCauseHe: "עדכון NetworkPolicy של צוות האבטחה השתמש ב-labels שגויים ב-pod selector. המדיניות חסמה את כל תעבורת ה-ingress לפודי ה-API כי ה-label בכלל ה-allow לא תאם את ה-labels בפועל של הפודים.",
    correctApproach: "Compare the NetworkPolicy's ingress allow rules against the actual pod labels, identify the label mismatch, and fix the policy selector to match the correct pod labels.",
    correctApproachHe: "להשוות את כללי ה-ingress allow של ה-NetworkPolicy מול ה-labels בפועל של הפודים, לזהות את אי-ההתאמה ב-labels, ולתקן את ה-selector של המדיניות כך שיתאים ל-labels הנכונים.",
    command: "kubectl describe networkpolicy api-netpol -n production",
    hint: "Compare the NetworkPolicy selector labels with the actual pod labels - look for the mismatch.",
    hintHe: "השווה את ה-labels של ה-NetworkPolicy selector מול ה-labels בפועל של הפודים - חפש את אי-ההתאמה.",
  },
];
