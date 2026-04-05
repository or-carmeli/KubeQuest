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
    steps: [
      {
        prompt:
          "#staging-alerts | PagerDuty\npayment-service v2.4.1 deployed to staging-west 10 min ago.\nAll 3 replicas now in CrashLoopBackOff. Deploy pipeline was green.\nNamespace: staging\n\nYou are on-call. Where do you start?",
        promptHe:
          "#staging-alerts | PagerDuty\npayment-service v2.4.1 הוצב ל-staging-west לפני 10 דקות.\nכל 3 הרפליקות כעת ב-CrashLoopBackOff. ה-pipeline עבר בהצלחה.\nNamespace: staging\n\nאת/ה בתורנות. מאיפה מתחילים?",
        options: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (roll back immediately)",
          "kubectl delete namespace staging  (clean slate)",
          "Re-apply the deployment YAML without changes",
        ],
        optionsHe: [
          "kubectl get pods -n staging",
          "kubectl rollout undo deployment/payment-service -n staging  (rollback מיידי)",
          "kubectl delete namespace staging  (ניקוי מלא)",
          "להחיל מחדש את ה-YAML של ה-Deployment ללא שינויים",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl get pods` assesses the situation before taking action.\n✗ Rollback without understanding root cause is premature. Same bug may exist on previous version. Deleting namespace = total data loss. Re-applying same YAML won't fix config issues.",
        explanationHe:
          "✓ `kubectl get pods` מעריך את המצב לפני פעולה.\n✗ Rollback ללא הבנת סיבה שורשית הוא מוקדם מדי. אותו באג עלול להיות בגרסה הקודמת. מחיקת namespace = אובדן נתונים מוחלט. החלה מחדש של אותו YAML לא תתקן בעיית config.",
      },
      {
        prompt:
          "Pod Stuck in Crash Loop\n\nkubectl get pods -n staging\nNAME                            READY  STATUS            RESTARTS       AGE\ngateway-5f8b9c7d4-k2m1x         1/1    Running           0              4d\nnotification-svc-6c9d8e-r4t2q   1/1    Running           0              4d\npayment-service-7d4b9-abc12      0/1    CrashLoopBackOff  9 (42s ago)    12m\npayment-service-7d4b9-def34      0/1    CrashLoopBackOff  9 (38s ago)    12m\npayment-service-7d4b9-ghi56      0/1    CrashLoopBackOff  8 (51s ago)    12m\n\nAll 3 payment-service replicas are crashing. Other pods are healthy.\n\nWhat command reveals the application error?",
        promptHe:
          "Pod תקוע בלולאת קריסה\n\nkubectl get pods -n staging\nNAME                            READY  STATUS            RESTARTS       AGE\ngateway-5f8b9c7d4-k2m1x         1/1    Running           0              4d\nnotification-svc-6c9d8e-r4t2q   1/1    Running           0              4d\npayment-service-7d4b9-abc12      0/1    CrashLoopBackOff  9 (42s ago)    12m\npayment-service-7d4b9-def34      0/1    CrashLoopBackOff  9 (38s ago)    12m\npayment-service-7d4b9-ghi56      0/1    CrashLoopBackOff  8 (51s ago)    12m\n\nכל 3 רפליקות payment-service קורסות. Pods אחרים תקינים.\n\nאיזו פקודה חושפת את שגיאת האפליקציה?",
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
        explanation:
          "✓ `kubectl logs --previous` shows stdout/stderr from the last crashed container instance. When a container exits, Kubernetes keeps its logs until the next restart overwrites them. The `--previous` flag reads that buffer.\n→ This is the only way to see what the app printed before crashing.\n✗ `exec` fails on CrashLoopBackOff because the container exits before the shell can attach. `describe` shows scheduling events, not app-level output. Events help but won't reveal the app's error message.",
        explanationHe:
          "✓ `kubectl logs --previous` מציג stdout/stderr מהמופע האחרון של הקונטיינר שקרס. כש-container יוצא, Kubernetes שומר את הלוגים שלו עד שהאתחול הבא דורס אותם. הדגל `--previous` קורא את הבאפר הזה.\nזו הדרך היחידה לראות מה האפליקציה הדפיסה לפני הקריסה.\n✗ `exec` נכשל על CrashLoopBackOff כי הקונטיינר יוצא לפני שה-shell מספיק להתחבר. `describe` מציג אירועי תזמון, לא פלט אפליקטיבי. Events עוזרים אך לא יחשפו את הודעת השגיאה של האפליקציה.",
      },
      {
        prompt:
          "Missing Config File on Startup\n\n• Logs show: `FATAL config file '/etc/app/config.yaml' not found`\n• App expects a mounted config file at `/etc/app/config.yaml`\n\nWhat is your next step?",
        tags: ["config-mount"],
        promptHe:
          "קובץ Config חסר בהפעלה\n\n• לוגים מציגים: `FATAL config file '/etc/app/config.yaml' not found`\n• האפליקציה מצפה לקובץ config ב-`/etc/app/config.yaml`\n\nמה הצעד הבא?",
        options: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (check volume mounts and ConfigMap references)",
          "kubectl get configmap -n staging  (list available ConfigMaps in the namespace)",
          "kubectl get secret -n staging  (list Secrets that might contain the config data)",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- ls /etc/app/  (check if mount path exists)",
        ],
        optionsHe: [
          "kubectl describe pod payment-service-7d4b9-abc12 -n staging  (בדוק volume mounts והפניות ConfigMap)",
          "kubectl get configmap -n staging  (רשימת ConfigMaps זמינים ב-namespace)",
          "kubectl get secret -n staging  (רשימת Secrets שעשויים להכיל את הנתונים)",
          "kubectl exec -it payment-service-7d4b9-abc12 -n staging -- ls /etc/app/  (בדוק אם נתיב ה-mount קיים)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl describe pod` shows the Volumes and Mounts sections, revealing which ConfigMap the pod spec references and where it expects to mount. This is the critical first piece: you need the expected ConfigMap name before you can check if it exists.\n→ The Volumes section will show something like `configMap: name: payment-config`, telling you exactly what to look for.\n✗ Listing ConfigMaps is useful as a follow-up, but without knowing the expected name first, you're guessing. Secrets are unlikely for a config file. `exec` fails on CrashLoopBackOff pods.",
        explanationHe:
          "✓ `kubectl describe pod` מציג את חלקי Volumes ו-Mounts, וחושף איזה ConfigMap ה-pod spec מפנה אליו והיכן הוא מצפה לעגן אותו. זהו הנתון הקריטי הראשון: צריך את שם ה-ConfigMap המצופה לפני שבודקים אם הוא קיים.\n→ חלק ה-Volumes יציג משהו כמו `configMap: name: payment-config`, שמגלה בדיוק מה לחפש.\n✗ רשימת ConfigMaps שימושית כצעד המשך, אך בלי לדעת את השם המצופה קודם, זה ניחוש. Secrets לא סביר עבור קובץ config. `exec` נכשל על Pods ב-CrashLoopBackOff.",
      },
      {
        prompt:
          "ConfigMap Not Found in Namespace\n\n• Pod spec references volume: `configMap: name: payment-config`\n• You run: `kubectl get configmap -n staging`\n\nkubectl get configmap -n staging\nNAME               DATA   AGE\napp-settings       3      12d\nkube-root-ca.crt   1      45d\n\nNo `payment-config` in the list. What is the fastest way to confirm whether it exists elsewhere?",
        promptHe:
          "ConfigMap לא נמצא ב-Namespace\n\n• ה-pod spec מפנה ל-volume: \u200F`configMap: name: payment-config`\n• מריצים: \u200F`kubectl get configmap -n staging`\n\nkubectl get configmap -n staging\nNAME               DATA   AGE\napp-settings       3      12d\nkube-root-ca.crt   1      45d\n\nאין `payment-config` ברשימה. מה הדרך המהירה ביותר לוודא אם הוא קיים במקום אחר?",
        options: [
          "kubectl get configmap payment-config --all-namespaces",
          "kubectl get configmap payment-config -n production",
          "kubectl describe namespace staging  (check if the ConfigMap was recently deleted)",
          "kubectl get events -n staging --field-selector reason=FailedMount",
        ],
        optionsHe: [
          "kubectl get configmap payment-config --all-namespaces",
          "kubectl get configmap payment-config -n production",
          "kubectl describe namespace staging  (בדוק אם ה-ConfigMap נמחק לאחרונה)",
          "kubectl get events -n staging --field-selector reason=FailedMount",
        ],
        answer: 0,
        explanation:
          "✓ `--all-namespaces` searches every namespace at once. If `payment-config` exists in production but not staging, you'll see it immediately and know the ConfigMap was never created for this namespace.\n→ ConfigMaps are namespace-scoped: a ConfigMap in `production` is invisible to pods in `staging`.\n✗ Guessing `production` works only if you guess right. `describe namespace` doesn't show deleted resources. Events show the mount failure you already know about.",
        explanationHe:
          "✓ `--all-namespaces` מחפש בכל namespace בבת אחת. אם `payment-config` קיים ב-production אך לא ב-staging, תראה את זה מיידית ותדע שה-ConfigMap מעולם לא נוצר עבור ה-namespace הזה.\n→ ConfigMaps מוגדרים לפי namespace: ConfigMap ב-`production` בלתי נראה ל-Pods ב-`staging`.\n✗ לנחש `production` עובד רק אם מנחשים נכון. `describe namespace` לא מציג משאבים שנמחקו. Events מראים את כשל ה-mount שכבר ידוע.",
      },
      {
        prompt:
          "Restoring the Missing ConfigMap\n\n• ConfigMap `payment-config` missing in staging\n• Same ConfigMap exists in production\n• Pod needs it to start\n\nWhat is the safest approach?",
        promptHe:
          "שחזור ה-ConfigMap החסר\n\n• ConfigMap `payment-config` חסר ב-staging\n• אותו ConfigMap קיים ב-production\n• ה-Pod צריך אותו כדי לעלות\n\nמה הגישה הבטוחה ביותר?",
        options: [
          "kubectl get configmap payment-config -n production -o yaml | grep -v 'resourceVersion\\|uid\\|creationTimestamp' | kubectl apply -n staging -f -",
          "kubectl cp payment-config -n production staging/ && kubectl rollout restart deployment/payment-service -n staging  (cp copies container files)",
          "kubectl edit deployment payment-service -n staging --set spec.volumes[0].configMap.namespace=production  (cross-namespace ConfigMap ref)",
          "kubectl delete pod -l app=payment-service -n staging && kubectl wait --for=condition=ready pod -l app=payment-service -n staging  (restart)",
        ],
        optionsHe: [
          "kubectl get configmap payment-config -n production -o yaml | grep -v 'resourceVersion\\|uid\\|creationTimestamp' | kubectl apply -n staging -f -",
          "kubectl cp payment-config -n production staging/ && kubectl rollout restart deployment/payment-service -n staging  (cp מעתיק קבצי קונטיינרים)",
          "kubectl edit deployment payment-service -n staging --set spec.volumes[0].configMap.namespace=production  (הפניה בין namespaces)",
          "kubectl delete pod -l app=payment-service -n staging && kubectl wait --for=condition=ready pod -l app=payment-service -n staging  (אתחול)",
        ],
        answer: 0,
        explanation:
          "✓ Export the ConfigMap YAML, strip cluster-specific metadata (resourceVersion, uid, creationTimestamp), then apply with `-n staging` which overrides the namespace. This creates a clean copy in staging without touching production.\n→ The `-n` flag on `kubectl apply` sets the target namespace, so you don't need fragile `sed` replacements on the YAML.\n✗ `kubectl cp` copies files inside running containers, not Kubernetes objects. Pods can't reference ConfigMaps across namespaces. Restarting won't create the missing ConfigMap.",
        explanationHe:
          "✓ ייצא את ה-YAML של ה-ConfigMap, הסר metadata ספציפי לקלאסטר (resourceVersion, uid, creationTimestamp), והחל עם `-n staging` שדורס את ה-namespace. זה יוצר עותק נקי ב-staging בלי לגעת ב-production.\n→ הדגל `-n` ב-`kubectl apply` מגדיר את ה-namespace היעד, כך שלא צריך החלפות `sed` שבריריות על ה-YAML.\n✗ `kubectl cp` מעתיק קבצים בתוך קונטיינרים רצים, לא אובייקטי Kubernetes. Pods לא יכולים להפנות ל-ConfigMaps בין namespaces. אתחול לא ייצור את ה-ConfigMap החסר.",
      },
    ],
    rootCause: "The payment service failed to start because a ConfigMap was missing in the staging namespace. The Deployment referenced a config file that didn't exist, causing the container to crash on startup.",
    rootCauseHe: "שירות התשלומים לא עלה בגלל ConfigMap שהיה חסר ב-namespace של staging. ה-Deployment הפנה לקובץ config שלא היה קיים, מה שגרם לקונטיינר לקרוס בהפעלה.",
    correctApproach: "Check the pod logs with --previous flag to see the startup error, then compare the expected volume mounts against the existing ConfigMaps in the namespace.",
    correctApproachHe: "לבדוק את הלוגים של ה-Pod עם --previous כדי לראות את שגיאת ההפעלה, ואז להשוות את ה-volume mounts המצופים מול ה-ConfigMaps הקיימים ב-namespace.",
    command: "kubectl logs payment-service-7d4b9-abc12 -n staging --previous",
    hint: "Start with what the container saw last.",
    hintHe: "התחל ממה שהקונטיינר ראה אחרון.",
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
    steps: [
      {
        prompt:
          "#deploy-notifications | Slack\nmyapp first deploy to staging-east just went out.\nAll 2 replicas stuck in ImagePullBackOff for 6 minutes.\nOther services on the same cluster are healthy.\nNamespace: default\n\nWhat is your first diagnostic step?",
        promptHe:
          "#deploy-notifications | Slack\nmyapp דיפלוי ראשון ל-staging-east יצא הרגע.\n2 רפליקות תקועות ב-ImagePullBackOff כבר 6 דקות.\nשירותים אחרים באותו cluster תקינים.\nNamespace: default\n\nמה הצעד האבחוני הראשון?",
        options: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (tear it down and redeploy)",
          "kubectl get nodes  (check if a node is down)",
          "kubectl logs <pod-name> -n default  (check startup errors)",
        ],
        optionsHe: [
          "kubectl describe pod <pod-name> -n default",
          "kubectl delete deployment myapp  (פירוק ופריסה מחדש)",
          "kubectl get nodes  (בדוק אם Node כלשהו ירד)",
          "kubectl logs <pod-name> -n default  (בדוק שגיאות הפעלה)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl describe pod` shows the Events section with the exact pull failure reason. The kubelet on the node emits an event each time it tries and fails to pull the image, including the registry's HTTP response.\n→ The event tells you exactly which of the three common failures it is: `not found` (wrong tag), `unauthorized` (auth required), or `connection timeout` (unreachable registry).\n✗ Only one deployment affected, so nodes are fine. `kubectl logs` shows nothing because ImagePullBackOff happens in the image pull phase, before the container process ever starts. There are no logs to collect.",
        explanationHe:
          "✓ `kubectl describe pod` מציג את חלק ה-Events עם סיבת כשל המשיכה המדויקת. ה-kubelet על ה-Node פולט event בכל פעם שהוא מנסה ונכשל למשוך image, כולל תגובת ה-HTTP מה-registry.\n→ ה-event מגלה בדיוק איזה משלושת הכשלים הנפוצים: `not found` (tag שגוי), `unauthorized` (נדרש אימות), או `connection timeout` (registry לא נגיש).\n✗ רק Deployment אחד מושפע, Nodes תקינים. `kubectl logs` לא מציג דבר כי ImagePullBackOff קורה בשלב משיכת ה-image, לפני שתהליך הקונטיינר מתחיל. אין לוגים לאסוף.",
      },
      {
        prompt:
          "Unauthorized Error from Registry\n\n• Image: `registry.company.com/myapp:v2.1`\n• Error: `unauthorized: authentication required`\n• Pod cannot pull the image\n\nWhat does this error indicate?",
        promptHe:
          "שגיאת Unauthorized מה-Registry\n\n• Image: \u200F`registry.company.com/myapp:v2.1`\n• שגיאה: \u200F`unauthorized: authentication required`\n• ה-Pod לא מצליח למשוך את ה-image\n\nמה מציינת שגיאה זו?",
        options: [
          "The image tag `v2.1` does not exist in the registry at all",
          "The registry requires credentials but the pod has none configured",
          "The registry server is currently down or completely unreachable",
          "The node has no internet access to any external host",
        ],
        optionsHe: [
          "ה-tag `v2.1` לא קיים ב-registry כלל, לכן הוא מחזיר שגיאה",
          "ה-registry דורש אישורים אך ל-Pod אין אישורים מוגדרים",
          "שרת ה-registry ירד לחלוטין או שאינו נגיש מה-cluster",
          "ל-Node אין גישה לאינטרנט כלל, לכן לא ניתן למשוך images",
        ],
        answer: 1,
        explanation:
          "✓ `unauthorized: authentication required` = registry is reachable but needs credentials.\n→ The registry responded - it's up and the tag exists.\n✗ Wrong tag → 'not found'. Unreachable → 'connection timeout'. No internet → 'no route to host'.",
        explanationHe:
          "✓ `unauthorized: authentication required` = ה-registry נגיש אך דורש אישורים.\nה-registry הגיב, הוא פעיל וה-tag קיים.\n✗ tag שגוי מחזיר 'not found'. לא נגיש מחזיר 'connection timeout'. אין אינטרנט מחזיר 'no route to host'.",
      },
      {
        prompt:
          "Private Registry Requires Authentication\n\n• Registry: `registry.company.com`\n• Needs username/password to pull images\n• No credentials configured on the cluster\n\nWhat Kubernetes resource holds registry credentials?",
        promptHe:
          "Registry פרטי דורש אימות\n\n• כתובת ה-Registry: \u200F`registry.company.com`\n• דורש username/password למשיכת images\n• אין אישורים מוגדרים על הקלאסטר\n\nאיזה משאב Kubernetes מיועד לאישורי registry?",
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
        explanation:
          "✓ Registry credentials go in a `kubernetes.io/dockerconfigjson` Secret. This type stores a JSON blob in the same format as `~/.docker/config.json` (the file Docker CLI creates when you run `docker login`). The kubelet reads this Secret and passes the credentials to the container runtime when pulling images.\n→ This is the only Secret type the kubelet knows how to use for image pulls.\n✗ ConfigMaps are not encrypted at rest and aren't designed for sensitive data. SA tokens authenticate to the K8s API server, not container registries. RBAC controls who can do what inside the cluster, not registry access.",
        explanationHe:
          "✓ אישורי registry שמורים ב-Secret מסוג `kubernetes.io/dockerconfigjson`. סוג זה מאחסן JSON באותו פורמט כמו `~/.docker/config.json` (הקובץ ש-Docker CLI יוצר כשמריצים `docker login`). ה-kubelet קורא Secret זה ומעביר את האישורים ל-container runtime בזמן משיכת images.\n→ זהו סוג ה-Secret היחיד שה-kubelet יודע להשתמש בו למשיכת images.\n✗ ConfigMaps לא מוצפנים ב-rest ולא מיועדים לנתונים רגישים. SA tokens מאמתים מול שרת ה-API של K8s, לא מול container registries. RBAC שולט במי יכול לעשות מה בתוך הקלאסטר, לא בגישה ל-registry.",
      },
      {
        prompt:
          "No Registry Secret in Namespace\n\n• `kubectl get secret -n default` shows no registry-related Secret\n• Need credentials for `registry.company.com`\n\nHow do you create one correctly?",
        promptHe:
          "אין Secret של Registry ב-Namespace\n\n• `kubectl get secret -n default` לא מציג Secret קשור ל-registry\n• צריך אישורים ל-`registry.company.com`\n\nכיצד יוצרים אחד נכון?",
        options: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-file=credentials.json=/tmp/registry-credentials.json --namespace=default",
          "kubectl patch deployment api-server -n default --type=json -p='[{\"op\":\"add\",\"path\":\"/spec/template/spec/env\",\"value\":\"pass\"}]'",
          "kubectl get secret regcred -n kube-system -o yaml | sed 's/namespace: kube-system/namespace: default/' | kubectl apply -f -",
        ],
        optionsHe: [
          "kubectl create secret docker-registry regcred --docker-server=registry.company.com --docker-username=user --docker-password=pass -n default",
          "kubectl create configmap registry-auth --from-file=credentials.json=/tmp/registry-credentials.json --namespace=default",
          "kubectl patch deployment api-server -n default --type=json -p='[{\"op\":\"add\",\"path\":\"/spec/template/spec/env\",\"value\":\"pass\"}]'",
          "kubectl get secret regcred -n kube-system -o yaml | sed 's/namespace: kube-system/namespace: default/' | kubectl apply -f -",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl create secret docker-registry` creates a Secret with the correct type and `.dockerconfigjson` format.\n→ This is the official command for registry auth secrets.\n✗ Never store credentials in ConfigMaps or env vars. Secrets are namespace-scoped - can't reference kube-system from default.",
        explanationHe:
          "✓ `kubectl create secret docker-registry` יוצר Secret עם הסוג הנכון ופורמט `.dockerconfigjson`.\nזו הפקודה הרשמית ליצירת secret אימות registry.\n✗ לעולם אל תאחסנו אישורים ב-ConfigMaps או env vars. Secrets מוגדרים לפי namespace, לא ניתן להפנות ל-kube-system מ-default.",
      },
      {
        prompt:
          "Secret Created but Pull Still Fails\n\n• Secret `regcred` created in namespace\n• Deployment still shows ImagePullBackOff\n• Secret exists but isn't being used\n\nWhat critical step did you miss?",
        tags: ["image-pull"],
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
        explanation:
          "✓ K8s does NOT auto-discover pull Secrets. You must explicitly add `imagePullSecrets: [{name: regcred}]` to the Pod spec (or to the ServiceAccount used by the pod). The kubelet only reads credentials from Secrets listed in this field.\n→ Pro tip: you can also patch the `default` ServiceAccount with `imagePullSecrets` so all pods in the namespace inherit it automatically.\n✗ `create secret docker-registry` already handles base64 encoding internally. Secrets are namespace-scoped, not node-scoped. Deleting/recreating the Deployment is unnecessary since a rolling update picks up spec changes.",
        explanationHe:
          "✓ K8s לא מגלה אוטומטית pull Secrets. חובה להוסיף מפורשות `imagePullSecrets: [{name: regcred}]` ל-spec של ה-Pod (או ל-ServiceAccount שה-Pod משתמש בו). ה-kubelet קורא אישורים רק מ-Secrets שרשומים בשדה הזה.\n→ טיפ: ניתן גם לעדכן את ה-ServiceAccount `default` עם `imagePullSecrets` כך שכל ה-Pods ב-namespace יורשים אותו אוטומטית.\n✗ `create secret docker-registry` כבר מטפל בקידוד base64 פנימית. Secrets מוגדרים לפי namespace, לא per-node. מחיקה/יצירה מחדש של Deployment מיותרת כי rolling update קולט שינויי spec.",
      },
    ],
    rootCause: "The pods couldn't start because the container image was hosted in a private registry, but no ImagePullSecret was configured in the namespace. Kubernetes couldn't authenticate to pull the image.",
    rootCauseHe: "הפודים לא הצליחו לעלות כי ה-image היה ב-registry פרטי, אבל לא הוגדר ImagePullSecret ב-namespace. Kubernetes לא הצליח להזדהות כדי למשוך את ה-image.",
    correctApproach: "Use kubectl describe pod to see the ImagePullBackOff event, then create a docker-registry Secret and reference it in the Deployment's imagePullSecrets field.",
    correctApproachHe: "להשתמש ב-kubectl describe pod כדי לראות את אירוע ה-ImagePullBackOff, ליצור Secret מסוג docker-registry ולהפנות אליו ב-imagePullSecrets של ה-Deployment.",
    command: "kubectl describe pod myapp-deployment-abc12 -n default",
    hint: "Think about what happens before running.",
    hintHe: "חשוב מה קורה לפני שהקונטיינר רץ.",
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
    steps: [
      {
        prompt:
          "#prod-alerts | PagerDuty SEV-2\napi-gateway error rate spiked to 38%. Users reporting intermittent 503s.\nGrafana shows pod restarts every ~2 minutes.\nCluster: prod-central | Namespace: production\n\nYou're the on-call SRE. What is your first action?",
        promptHe:
          "#prod-alerts | PagerDuty SEV-2\nשיעור שגיאות api-gateway זינק ל-38%. משתמשים מדווחים על 503 לסירוגין.\nGrafana מציג אתחולי Pod כל ~2 דקות.\nCluster: prod-central | Namespace: production\n\nאת/ה ה-SRE בתורנות. מה הצעד הראשון שלך?",
        options: [
          "kubectl describe pod -l app=api-gateway -n production  (check termination reason and events)",
          "kubectl delete pod api-server -n production  (delete and let it recreate from scratch)",
          "kubectl scale deployment api-server --replicas=0 -n production  (scale down all instances immediately)",
          "kubectl logs api-server -n production --tail=50  (check recent application error output)",
        ],
        optionsHe: [
          "kubectl describe pod -l app=api-gateway -n production  (בדוק סיבת סיום ואירועים)",
          "kubectl delete pod api-server -n production",
          "kubectl scale deployment api-server --replicas=0 -n production",
          "kubectl logs api-server -n production --tail=50  (בדוק שגיאות אחרונות)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl describe pod` shows the termination reason, exit code, resource limits, and events in one view. When you already know a pod is restarting, `describe` gives you the full picture faster than `get pods` followed by another command.\n→ The Last State section will show why the container was terminated.\n✗ Deleting the pod or scaling to 0 worsens an active outage. Logs are useful but won't show why the process was killed externally (OOMKill happens outside the app).",
        explanationHe:
          "✓ `kubectl describe pod` מציג את סיבת הסיום, קוד יציאה, מגבלות משאבים ואירועים בתצוגה אחת. כשכבר ידוע שה-Pod מתאתחל, `describe` נותן את התמונה המלאה מהר יותר מ-`get pods` ואחריו פקודה נוספת.\n→ חלק Last State יראה למה הקונטיינר הופסק.\n✗ מחיקת Pod או הקטנה ל-0 מחמירה את הנפילה. לוגים שימושיים אך לא יראו למה התהליך נהרג חיצונית (OOMKill קורה מחוץ לאפליקציה).",
      },
      {
        prompt:
          "OOMKilled Status Detected\n\nThe describe output shows:\n  Last State:  Terminated\n    Reason:    OOMKilled\n    Exit Code: 137\n  Limits:\n    memory: 256Mi\n  Restart Count: 14\n\nWhat does OOMKilled mean, and what is the next diagnostic step?",
        promptHe:
          "זוהה סטטוס OOMKilled\n\nפלט ה-describe מציג:\n  Last State:  Terminated\n    Reason:    OOMKilled\n    Exit Code: 137\n  Limits:\n    memory: 256Mi\n  Restart Count: 14\n\nמה המשמעות של OOMKilled, ומה הצעד האבחוני הבא?",
        options: [
          "OOMKilled is a liveness probe failure - check probe config with kubectl edit deployment in the namespace",
          "OOMKilled means the container exceeded its memory limit - run kubectl describe pod api-server-xyz -n production",
          "OOMKilled means a network timeout occurred - check NetworkPolicy rules applied to the pod",
          "OOMKilled is caused by a bad Docker image layer - re-pull the image from the registry",
        ],
        optionsHe: [
          "OOMKilled = כשל liveness probe, בדוק הגדרות probe עם kubectl edit deployment ב-namespace",
          "OOMKilled = קונטיינר עבר מגבלת זיכרון, kubectl describe pod api-server-xyz -n production",
          "OOMKilled = timeout ברשת, בדוק כללי NetworkPolicy שהוחלו על ה-Pod בפועל",
          "OOMKilled = שכבת image פגומה ב-Docker, משוך מחדש את ה-image מה-registry",
        ],
        answer: 1,
        explanation:
          "✓ OOMKilled = Out Of Memory Killed. Kubernetes sets a memory cgroup limit for each container. When the process exceeds it, the Linux kernel's OOM killer sends SIGKILL (exit code 137 = 128+9). The app gets no warning and no chance to clean up.\n→ Next step: check how much memory the pod actually uses vs the 256Mi limit to determine the right new value.\n✗ Not a probe failure (probes return specific exit codes, not 137). Not a network issue or bad image.",
        explanationHe:
          "✓ OOMKilled = Out Of Memory Killed. Kubernetes מגדיר מגבלת cgroup זיכרון לכל קונטיינר. כשהתהליך חורג, OOM killer של ליבת Linux שולח SIGKILL (קוד יציאה 137 = 128+9). האפליקציה לא מקבלת אזהרה ואין לה הזדמנות לנקות.\n→ הצעד הבא: לבדוק כמה זיכרון ה-Pod צורך בפועל מול מגבלת `256Mi` כדי לקבוע את הערך הנכון החדש.\n✗ לא כשל probe (probes מחזירים קודי יציאה ספציפיים, לא 137). לא בעיית רשת או image פגום.",
      },
      {
        prompt:
          "Memory Limit Too Low\n\n• Container memory limit: 256Mi\n• Exit code: 137 (OOMKilled)\n• Pod keeps crashing under load\n\nHow do you determine the right memory limit?",
        promptHe:
          "מגבלת זיכרון נמוכה מדי\n\n• מגבלת זיכרון קונטיינר: \u200F`256Mi`\n• קוד יציאה: 137 (OOMKilled)\n• ה-Pod ממשיך לקרוס תחת עומס\n\nכיצד קובעים את מגבלת הזיכרון הנכונה?",
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
        explanation:
          "✓ `kubectl top pod` shows current memory consumption from the Metrics Server. Run it shortly after a restart to watch memory climb toward the limit. Note: `top` shows a point-in-time snapshot, not peak usage. For historical peak data, use Prometheus metrics like `container_memory_working_set_bytes`.\n→ Compare the climbing value against the 256Mi limit to determine how much headroom the pod needs.\n✗ Logs help diagnose memory leaks, not measure current usage. Node memory is not per-pod usage. HPA controls replica count, not per-pod memory limits.",
        explanationHe:
          "✓ `kubectl top pod` מציג צריכת זיכרון נוכחית מ-Metrics Server. הרץ אותו זמן קצר אחרי אתחול כדי לצפות בזיכרון מטפס לעבר המגבלה. שים לב: `top` מציג תמונת מצב נקודתית, לא שיא שימוש. לנתוני שיא היסטוריים, השתמש במטריקות Prometheus כמו `container_memory_working_set_bytes`.\n→ השווה את הערך העולה מול מגבלת `256Mi` כדי לקבוע כמה מרווח ה-Pod צריך.\n✗ לוגים עוזרים לאבחן דליפות זיכרון, לא למדוד שימוש נוכחי. זיכרון Node אינו שימוש per-pod. HPA שולט ברפליקות, לא במגבלות זיכרון per-pod.",
      },
      {
        prompt:
          "Choosing the Right Memory Limit\n\n• Idle memory usage: ~240Mi\n• Under load: spikes to 320Mi\n• Current limit: 256Mi. Too low for spikes\n\nWhat is the correct fix?",
        promptHe:
          "בחירת מגבלת הזיכרון הנכונה\n\n• שימוש זיכרון במנוחה: \u200F`~240Mi`\n• תחת עומס: עולה ל-\u200F`320Mi`\n• מגבלה נוכחית: \u200F`256Mi`. נמוכה מדי לקפיצות\n\nמה התיקון הנכון?",
        options: [
          "Add an HPA with memory-based autoscaling to handle the spikes automatically",
          "Increase the memory limit to 512Mi and set request to 256Mi in the Deployment spec",
          "Add a NetworkPolicy to throttle incoming requests",
          "Set memory request and limit both to 320Mi to match peak usage exactly",
        ],
        optionsHe: [
          "להוסיף HPA עם autoscaling מבוסס זיכרון לטיפול אוטומטי בקפיצות עומס על ה-Pod",
          "להגדיל את מגבלת הזיכרון ל-\u200F`512Mi` ולהגדיר request ל-\u200F`256Mi` ב-spec של ה-Deployment",
          "להוסיף NetworkPolicy לצמצום בקשות נכנסות שמגיעות ל-Pod מבחוץ",
          "להגדיר request ו-limit ל-\u200F`320Mi` בדיוק כמו שיא השימוש ללא מרווח ביטחון",
        ],
        answer: 1,
        explanation:
          "✓ Set limit=512Mi (~1.5x peak), request=256Mi (steady-state baseline). The `request` is what the scheduler guarantees on the node; the `limit` is the hard ceiling enforced by the cgroup. This gives the Burstable QoS class: the pod can burst above its request during spikes but is killed if it exceeds the limit.\n→ Rule of thumb: set limit to 1.5-2x observed peak. For critical APIs, some teams prefer Guaranteed QoS (request=limit) to avoid noisy-neighbor eviction.\n✗ HPA scales replicas, not per-pod memory. Setting limit=320Mi (exactly peak) leaves zero headroom. NetworkPolicy controls network traffic, not memory.",
        explanationHe:
          "✓ הגדר limit=\u200F`512Mi` (~1.5 מהשיא), request=\u200F`256Mi` (בסיס שימוש רגיל). ה-`request` הוא מה שה-scheduler מבטיח על ה-Node; ה-`limit` הוא התקרה הקשיחה שנאכפת על ידי ה-cgroup. זה נותן QoS class Burstable: ה-Pod יכול לחרוג מעל ה-request בזמן קפיצות אך נהרג אם חורג מה-limit.\n→ כלל אצבע: הגדר limit ל-1.5-2x מהשיא הנצפה. ל-APIs קריטיים, חלק מהצוותים מעדיפים Guaranteed QoS (request=limit) כדי להימנע מפינוי בגלל שכנים רועשים.\n✗ HPA משנה רפליקות, לא זיכרון per-pod. הגדרת limit=\u200F`320Mi` (בדיוק שיא) לא משאירה מרווח. NetworkPolicy שולטת בתעבורת רשת, לא בזיכרון.",
      },
      {
        prompt:
          "Verifying the Rolling Update\n\n• Deployment patched with new memory limits\n• New limit: 512Mi, request: 256Mi\n• Rolling update in progress\n\nHow do you verify the update succeeded and the fix holds?",
        promptHe:
          "אימות ה-Rolling Update\n\n• ה-Deployment עודכן עם מגבלות זיכרון חדשות\n• מגבלה חדשה: \u200F`512Mi`, request: \u200F`256Mi`\n• Rolling update בתהליך\n\nכיצד מוודאים שהעדכון הצליח והתיקון מחזיק?",
        options: [
          "kubectl rollout status deployment/api-server -n production && kubectl get events -n production --field-selector reason=OOMKilling",
          "kubectl get pods -n production -w --output-watch-events && kubectl describe pod -l app=api-gateway -n production",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp && kubectl logs -l app=api-gateway -n production --tail=50",
          "kubectl rollout status deployment/api-server -n production && kubectl top pod -l app=api-gateway -n production",
        ],
        optionsHe: [
          "kubectl rollout status deployment/api-server -n production && kubectl get events -n production --field-selector reason=OOMKilling",
          "kubectl get pods -n production -w --output-watch-events && kubectl describe pod -l app=api-gateway -n production",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp && kubectl logs -l app=api-gateway -n production --tail=50",
          "kubectl rollout status deployment/api-server -n production && kubectl top pod -l app=api-gateway -n production",
        ],
        answer: 3,
        explanation:
          "✓ First `rollout status` blocks until the rollout completes (or fails). Then `kubectl top` shows the new pod's memory consumption under the updated limits, confirming it's no longer hitting the ceiling.\n→ This two-step check answers both 'did the rollout succeed?' and 'is the fix actually working?'\n✗ `rollout status` alone confirms deployment but not whether OOMKills stopped. Watching pods is passive. Events lack memory usage data.",
        explanationHe:
          "✓ קודם `rollout status` חוסם עד שה-rollout מסתיים (או נכשל). אז `kubectl top` מציג את צריכת הזיכרון של ה-Pod החדש תחת המגבלות המעודכנות, ומאשר שהוא לא מגיע יותר לתקרה.\n→ בדיקה דו-שלבית זו עונה גם על 'האם ה-rollout הצליח?' וגם על 'האם התיקון באמת עובד?'\n✗ `rollout status` לבדו מאשר deployment אך לא האם OOMKills הפסיקו. מעקב Pods הוא פסיבי. Events חסרים נתוני שימוש זיכרון.",
      },
      {
        prompt:
          "Post-Incident: Preventing Recurrence\n\n• Fix applied: memory limit increased to 512Mi\n• Pod stable for 15 minutes, no more OOMKills\n• Incident resolved\n\nWhat should you do before closing the incident?",
        promptHe:
          "לאחר האירוע: מניעת הישנות\n\n• תיקון הוחל: מגבלת זיכרון הוגדלה ל-\u200F`512Mi`\n• Pod יציב 15 דקות, אין עוד OOMKills\n• האירוע נפתר\n\nמה עליך לעשות לפני סגירת האירוע?",
        options: [
          "Increase all node sizes immediately and add a buffer of 50% more capacity to each",
          "Add a Prometheus alert on memory usage > 80% of limit, and audit resource limits",
          "Set memory limits to unlimited on all Deployments so OOMKill never happens again",
          "No further action needed since the incident is resolved and limits were already fixed",
        ],
        optionsHe: [
          "להגדיל את גודל כל ה-Nodes מיידית ולהוסיף חוצץ של 50% קיבולת לכל אחד",
          "להוסיף התראת Prometheus על שימוש בזיכרון > 80% מהמגבלה ולבדוק limits",
          "להגדיר מגבלת זיכרון ללא הגבלה בכל ה-Deployments כדי למנוע OOMKill לצמיתות",
          "אין צורך בפעולה נוספת כי האירוע נפתר ומגבלות הזיכרון כבר תוקנו",
        ],
        answer: 1,
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
    hint: "Focus on how the process was terminated.",
    hintHe: "שים לב לאופן שבו התהליך הופסק.",
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
    steps: [
      {
        prompt:
          "#prod-backend | Slack\nFrontend team reports: all API calls to backend-api returning 'connection refused'.\nStarted ~5 min after backend v3.2 deployment.\nAll pods show Running/Ready. No errors in backend logs.\nCluster: prod-central | Namespace: production\n\nWhere do you start?",
        promptHe:
          "#prod-backend | Slack\nצוות פרונטאנד מדווח: כל קריאות ה-API ל-backend-api מחזירות 'connection refused'.\nהתחיל ~5 דקות אחרי דיפלוי backend v3.2.\nכל ה-Pods מציגים Running/Ready. אין שגיאות בלוגים של הבאקאנד.\nCluster: prod-central | Namespace: production\n\nמאיפה מתחילים?",
        options: [
          "kubectl get svc backend-svc -n production  (inspect the Service)",
          "kubectl rollout restart deployment/backend -n production",
          "kubectl delete svc backend-svc -n production  (recreate it)",
          "kubectl get nodes  (check node health)",
        ],
        optionsHe: [
          "kubectl get svc backend-svc -n production  (בדוק את ה-Service)",
          "kubectl rollout restart deployment/backend -n production",
          "kubectl delete svc backend-svc -n production  (צור מחדש)",
          "kubectl get nodes  (בדוק תקינות Node)",
        ],
        answer: 0,
        explanation:
          "✓ Pods healthy + Service unreachable → issue is in Service config (selector, port, targetPort).\n→ Inspect the Service first, before any destructive action.\n✗ Rolling restart won't fix a misconfigured Service. Deleting/recreating risks downtime. Nodes are irrelevant if pods are Running.",
        explanationHe:
          "✓ Pods תקינים + Service לא נגיש: הבעיה בהגדרת Service (selector, port, targetPort).\nבדוק את ה-Service קודם, לפני כל פעולה הרסנית.\n✗ rolling restart לא יתקן Service שגוי. מחיקה/יצירה מסכנת בהשבתה. Nodes לא רלוונטיים אם Pods רצים.",
      },
      {
        prompt:
          "Service Exists but Traffic Fails\n\nkubectl get svc backend-svc -n production\nNAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE\nbackend-svc   ClusterIP   10.96.42.180   <none>        80/TCP    30d\n\nService exists with a ClusterIP. Pods are Running. What is the single most diagnostic command?",
        promptHe:
          "Service קיים אך התעבורה נכשלת\n\nkubectl get svc backend-svc -n production\nNAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE\nbackend-svc   ClusterIP   10.96.42.180   <none>        80/TCP    30d\n\nService קיים עם ClusterIP. Pods רצים. מהי הפקודה האבחונית ביותר?",
        options: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production  (check ingress rules)",
          "kubectl describe node  (check node-level conditions)",
          "kubectl get pvc -n production  (check storage claims)",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production",
          "kubectl get ingress -n production  (בדוק כללי ingress)",
          "kubectl describe node  (בדוק מצב ה-node עצמו)",
          "kubectl get pvc -n production  (בדוק תביעות אחסון)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl get endpoints` shows the pod IPs that the Service is routing to. A Service with a ClusterIP but zero endpoints means kube-proxy has nowhere to send traffic, resulting in 'connection refused'. This is the #1 cause when pods are healthy but the Service doesn't work.\n→ The Endpoints controller watches for pods matching the Service's selector and populates this list automatically.\n✗ Ingress, nodes, and PVCs are unrelated to in-cluster Service-to-Pod routing.",
        explanationHe:
          "✓ `kubectl get endpoints` מציג את כתובות ה-IP של ה-Pods שה-Service מנתב אליהם. Service עם ClusterIP אך אפס endpoints אומר ש-kube-proxy אין לאן לשלוח תעבורה, מה שגורם ל-'connection refused'. זו הסיבה #1 כשה-Pods תקינים אך ה-Service לא עובד.\n→ ה-Endpoints controller עוקב אחר Pods שמתאימים ל-selector של ה-Service ומאכלס רשימה זו אוטומטית.\n✗ Ingress, Nodes ו-PVCs לא קשורים לניתוב Service-to-Pod פנים-קלאסטרי.",
      },
      {
        prompt:
          "Endpoints Are Empty\n\nkubectl get endpoints backend-svc -n production\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      30d\n\nService exists, pods exist, but zero endpoints. What do you do next?",
        tags: ["service-discovery"],
        promptHe:
          "Endpoints ריקים\n\nkubectl get endpoints backend-svc -n production\nNAME          ENDPOINTS   AGE\nbackend-svc   <none>      30d\n\nService קיים, Pods קיימים, אך אפס endpoints. מה הצעד הבא?",
        options: [
          "kubectl describe svc backend-svc -n production  (see the selector the Service uses)",
          "kubectl get pods -n production --show-labels  (see actual pod labels)",
          "kubectl get pods -n production  (check pod count)",
          "kubectl delete endpoints backend-svc -n production  (force re-creation)",
        ],
        optionsHe: [
          "kubectl describe svc backend-svc -n production  (ראה את ה-selector שה-Service משתמש בו)",
          "kubectl get pods -n production --show-labels  (ראה labels בפועל על ה-Pods)",
          "kubectl get pods -n production  (בדוק מספר Pods)",
          "kubectl delete endpoints backend-svc -n production  (כפה יצירה מחדש)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl describe svc` shows the Selector field -- this tells you exactly which labels the Service is looking for. Once you know the expected labels, you can compare them to the actual pod labels with `--show-labels` as a follow-up.\n→ Starting with the Service selector is more efficient: it gives you the 'expected' side first, so you know what to look for on the pods.\n✗ `--show-labels` alone shows pod labels but you don't know what the Service expects. Pod count doesn't explain empty endpoints. Deleting endpoints won't help -- the Endpoints controller recreates them from the same (mismatched) selector.",
        explanationHe:
          "✓ `kubectl describe svc` מציג את שדה ה-Selector -- זה מגלה בדיוק אילו labels ה-Service מחפש. ברגע שיודעים את ה-labels המצופים, ניתן להשוות אותם ל-labels בפועל של ה-Pods עם `--show-labels` כצעד המשך.\n→ להתחיל מה-selector של ה-Service יעיל יותר: זה נותן את הצד 'המצופה' קודם, כך שיודעים מה לחפש על ה-Pods.\n✗ `--show-labels` לבדו מציג labels של Pods אך לא יודעים מה ה-Service מצפה. מספר Pods לא מסביר endpoints ריקים. מחיקת endpoints לא תעזור -- ה-Endpoints controller יוצר אותם מחדש מאותו selector (לא תואם).",
      },
      {
        prompt:
          "Selector Mismatch Found\n\n• Service selector: `app=backend`\n• Actual pod labels: `app=backend-v2`\n• Label was changed in last deployment, Service not updated\n\nWhat is the fix?",
        tags: ["service-discovery"],
        promptHe:
          "נמצאה אי-התאמת Selector\n\n• Selector של Service: \u200F`app=backend`\n• Labels בפועל על Pods: \u200F`app=backend-v2`\n• ה-label שונה בדיפלוימנט האחרון, ה-Service לא עודכן\n\nמה התיקון?",
        options: [
          "Manually add label `app=backend` to every running pod with kubectl label (fragile, new pods lose it)",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "Delete the Service and recreate it with the correct selector (causes brief downtime)",
          "Add an annotation to the Service to bypass label matching (not a real feature)",
        ],
        optionsHe: [
          "להוסיף ידנית label `app=backend` לכל Pod פעיל עם kubectl label (שביר, Pods חדשים מאבדים אותו)",
          "kubectl patch svc backend-svc -n production -p '{\"spec\":{\"selector\":{\"app\":\"backend-v2\"}}}'",
          "למחוק את ה-Service וליצור אותו מחדש עם ה-selector הנכון (גורם להשבתה קצרה)",
          "להוסיף annotation ל-Service כדי לעקוף התאמת labels (לא פיצ'ר אמיתי ב-K8s)",
        ],
        answer: 1,
        explanation:
          "✓ `kubectl patch svc` atomically updates the selector - zero downtime.\n→ Immediately connects the Service to the correct pods.\n✗ Manual pod labels are fragile (new pods won't have them). Delete+recreate causes downtime. Annotations don't affect routing.",
        explanationHe:
          "✓ `kubectl patch svc` מעדכן אטומית את ה-selector, ללא השבתה.\nמחבר מיידית את ה-Service ל-Pods הנכונים.\n✗ Labels ידניים שבריריים (Pods חדשים לא יכילו אותם). מחיקה+יצירה גורמת להשבתה. Annotations לא משפיעים על ניתוב.",
      },
      {
        prompt:
          "Verifying the Selector Patch\n\n• Selector updated to `app=backend-v2`\n• Need to confirm traffic flows end-to-end before closing the incident\n\nWhat is the strongest way to verify?",
        promptHe:
          "אימות עדכון ה-Selector\n\n• Selector עודכן ל-`app=backend-v2`\n• צריך לאשר שהתעבורה זורמת מקצה לקצה לפני סגירת האירוע\n\nמהי הדרך החזקה ביותר לאמת?",
        options: [
          "kubectl get endpoints backend-svc -n production  (verify pod IPs appear in endpoint list after patch)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (check pod status is Running, but does not prove traffic flows)",
          "kubectl describe svc backend-svc -n production  (read the updated selector, but no live traffic test)",
        ],
        optionsHe: [
          "kubectl get endpoints backend-svc -n production  (אמת שכתובות IP של Pods מופיעות ברשימת ה-endpoints אחרי התיקון)",
          "kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n production -- curl backend-svc/health",
          "kubectl get pods -n production  (בדוק שסטטוס Pods הוא Running, אך לא מוכיח שתעבורה זורמת)",
          "kubectl describe svc backend-svc -n production  (קרא את ה-selector המעודכן, אך ללא בדיקת תעבורה חיה)",
        ],
        answer: 1,
        explanation:
          "✓ A temporary curl pod sends real traffic along the exact broken path. This is a true end-to-end test: DNS resolution, Service routing, endpoint selection, and backend response all have to work for it to succeed.\n→ Endpoints can be populated but a NetworkPolicy or targetPort mismatch could still block traffic. Only a live request proves the full path.\n✗ Pod status and Service description are read-only checks that don't prove traffic actually flows. Endpoints show routing intent, not actual connectivity.",
        explanationHe:
          "✓ Pod curl זמני שולח תעבורה אמיתית לאורך הנתיב שהיה שבור. זוהי בדיקת end-to-end אמיתית: פענוח DNS, ניתוב Service, בחירת endpoint ותגובת backend -- כולם חייבים לעבוד כדי שתצליח.\n→ Endpoints יכולים להיות מאוכלסים אך NetworkPolicy או אי-התאמת targetPort עלולים עדיין לחסום תעבורה. רק בקשה חיה מוכיחה את הנתיב המלא.\n✗ סטטוס Pod ותיאור Service הם בדיקות קריאה בלבד שלא מוכיחות שתעבורה באמת זורמת. Endpoints מראים כוונת ניתוב, לא קישוריות בפועל.",
      },
      {
        prompt:
          "Post-Incident: Preventing Selector Drift\n\n• Traffic restored, incident resolved\n• Root cause: selector mismatch (label changed, Service not updated)\n\nWhat prevents this from reaching production again?",
        promptHe:
          "לאחר האירוע: מניעת סטיית Selector\n\n• תעבורה שוחזרה, אירוע נפתר\n• סיבה שורשית: אי-התאמת selector (label שונה, Service לא עודכן)\n\nמה ימנע את זה מלהגיע ל-production שוב?",
        options: [
          "Manually double-check Service selectors after every deployment and document changes",
          "Use Helm/Kustomize to derive selectors and labels from a shared value, alert on endpoints == 0",
          "Switch all Services from ClusterIP to NodePort to bypass selector-based routing entirely",
          "Add a comment in the YAML reminding engineers to update the selector on every change",
        ],
        optionsHe: [
          "לבדוק ידנית selectors של Service אחרי כל דיפלוימנט ולתעד שינויים",
          "Helm/Kustomize: גזור selectors ו-labels מאותו משתנה, התרע על endpoints == 0",
          "לעבור עם כל ה-Services מ-ClusterIP ל-NodePort כדי לעקוף ניתוב לפי selector",
          "להוסיף הערה ב-YAML שמזכירה למהנדסים לעדכן את ה-selector בכל שינוי",
        ],
        answer: 1,
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
    hint: "Check what the Service actually sees.",
    hintHe: "בדוק מה ה-Service באמת רואה.",
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
    steps: [
      {
        prompt:
          "#sev1-outage | PagerDuty SEV-1 triggered 3 min ago\nMultiple teams reporting failures across prod-central (80 nodes):\n• cart-service: 'dial tcp: lookup inventory-svc on 10.96.0.10:53: no such host'\n• auth-service: 'getaddrinfo ENOTFOUND user-db-svc'\n• payment-service: 'Name resolution failed for order-svc.production.svc.cluster.local'\n\nAll namespaces affected. Pod-to-pod traffic by IP still works.\n\nHow do you confirm this is a DNS infrastructure failure?",
        promptHe:
          "#sev1-outage | PagerDuty SEV-1 הופעל לפני 3 דקות\nצוותים מרובים מדווחים על כשלים ב-prod-central (80 Nodes):\n• cart-service: 'dial tcp: lookup inventory-svc on 10.96.0.10:53: no such host'\n• auth-service: 'getaddrinfo ENOTFOUND user-db-svc'\n• payment-service: 'Name resolution failed for order-svc.production.svc.cluster.local'\n\nכל ה-namespaces מושפעים. תעבורת Pod-to-pod לפי IP עדיין עובדת.\n\nכיצד מאשרים שזהו כשל תשתית DNS?",
        options: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "kubectl delete pods --all -A --force --grace-period=0  (restart all pods across all namespaces)",
          "Check AWS Route53 or cloud DNS settings for the cluster's external domain resolution",
          "kubectl get nodes -o wide  (check if nodes are down or NotReady and which IPs are assigned)",
        ],
        optionsHe: [
          "kubectl run dns-test --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default",
          "kubectl delete pods --all -A --force --grace-period=0  (אתחל את כל ה-Pods בכל ה-namespaces)",
          "בדוק AWS Route53 או הגדרות DNS של ה-Cloud עבור פתרון שמות חיצוני של הקלאסטר",
          "kubectl get nodes -o wide  (בדוק אם Nodes ירדו או ב-NotReady ואילו IPs מוקצים)",
        ],
        answer: 0,
        explanation:
          "✓ `nslookup kubernetes.default` tests the most fundamental in-cluster DNS entry. Every pod's `/etc/resolv.conf` points to the `kube-dns` ClusterIP (10.96.0.10 in the error above). If this lookup fails, in-cluster DNS is confirmed broken for everyone.\n→ The key clue in the alert: pod-to-pod by IP works, only hostname resolution fails. This rules out CNI/network issues and points directly to DNS.\n✗ Cloud DNS (Route53) handles external domains, not `*.svc.cluster.local` names. Restarting all pods = massive downtime during an active SEV-1.",
        explanationHe:
          "✓ `nslookup kubernetes.default` בודק את רשומת ה-DNS הפנימית הבסיסית ביותר. ה-`/etc/resolv.conf` של כל Pod מצביע על ClusterIP של `kube-dns` (10.96.0.10 בשגיאה למעלה). אם lookup זה נכשל, DNS פנים-קלאסטרי מאושר כשבור לכולם.\n→ הרמז המרכזי בהתראה: תעבורת pod-to-pod לפי IP עובדת, רק פתרון שמות נכשל. זה שולל בעיות CNI/רשת ומצביע ישירות על DNS.\n✗ Cloud DNS (Route53) מטפל בדומיינים חיצוניים, לא בשמות `*.svc.cluster.local`. אתחול כל ה-Pods = השבתה מסיבית במהלך SEV-1 פעיל.",
      },
      {
        prompt:
          "DNS Confirmed Broken - Ruling Out Network\n\n• `nslookup kubernetes.default` returns NXDOMAIN\n• A teammate on the call says: 'This looks like a CNI issue, maybe Calico crashed'\n\nBut you noticed earlier that pod-to-pod traffic by IP still works. What does that tell you?",
        tags: ["dns-resolution"],
        promptHe:
          "DNS מאושר כשבור - שלילת בעיית רשת\n\n• `nslookup kubernetes.default` מחזיר NXDOMAIN\n• עמית בשיחה אומר: 'זה נראה כמו בעיית CNI, אולי Calico קרס'\n\nאבל שמת לב קודם שתעבורת pod-to-pod לפי IP עדיין עובדת. מה זה אומר?",
        options: [
          "CNI is likely the root cause since IP routing itself may be broken. Check Calico/Flannel pods first",
          "The CNI is healthy (IP routing works). The failure is isolated to DNS. Check CoreDNS in kube-system",
          "Both CNI and DNS are failing simultaneously. Restart all kube-system pods to recover both layers",
          "The issue is in the application code, not the infrastructure. Check application DNS resolver config",
        ],
        optionsHe: [
          "CNI כנראה הסיבה השורשית כי ניתוב IP עצמו עשוי להיות שבור. בדוק Calico/Flannel Pods קודם",
          "ה-CNI תקין (ניתוב IP עובד). הכשל מבודד לפתרון DNS. בדוק CoreDNS ב-kube-system",
          "גם CNI וגם DNS כושלים במקביל. אתחל את כל ה-Pods ב-kube-system לשחזור שתי השכבות",
          "הבעיה בקוד האפליקציה ולא בתשתית. בדוק הגדרות DNS resolver באפליקציה",
        ],
        answer: 1,
        explanation:
          "✓ If pod-to-pod communication by IP works, the CNI overlay network (Calico/Flannel/Cilium) is functioning. The failure is specifically in DNS name resolution. In Kubernetes, CoreDNS pods in `kube-system` handle all `*.svc.cluster.local` lookups.\n→ This is a critical debugging skill: narrow the blast radius by testing what works vs what doesn't. IP works + hostnames don't = DNS problem, not network problem.\n✗ CNI handles IP routing, not DNS. Restarting all kube-system pods is destructive and unnecessary. App code across many services didn't all break simultaneously.",
        explanationHe:
          "✓ אם תקשורת pod-to-pod לפי IP עובדת, רשת ה-overlay של ה-CNI (Calico/Flannel/Cilium) תקינה. הכשל הוא ספציפית בפתרון שמות DNS. ב-Kubernetes, Pods של CoreDNS ב-`kube-system` מטפלים בכל lookups של `*.svc.cluster.local`.\n→ זו מיומנות דיבאג קריטית: צמצם את רדיוס הפגיעה על ידי בדיקה מה עובד מול מה לא. IP עובד + שמות לא = בעיית DNS, לא בעיית רשת.\n✗ CNI מטפל בניתוב IP, לא ב-DNS. אתחול כל Pods ב-kube-system הרסני ומיותר. קוד אפליקציה במספר שירותים לא נשבר בו-זמנית.",
      },
      {
        prompt:
          "CoreDNS Pods Crashing - OOMKilled\n\nkubectl get pods -n kube-system -l k8s-app=kube-dns\nNAME                       READY   STATUS      RESTARTS       AGE\ncoredns-5d78c9869d-abc12   0/1     OOMKilled   7 (22s ago)    14d\ncoredns-5d78c9869d-def34   0/1     OOMKilled   7 (18s ago)    14d\n\nBoth CoreDNS replicas are OOMKilled. What should you do before changing anything?",
        promptHe:
          "Pods של CoreDNS קורסים: OOMKilled\n\nkubectl get pods -n kube-system -l k8s-app=kube-dns\nNAME                       READY   STATUS      RESTARTS       AGE\ncoredns-5d78c9869d-abc12   0/1     OOMKilled   7 (22s ago)    14d\ncoredns-5d78c9869d-def34   0/1     OOMKilled   7 (18s ago)    14d\n\nשתי רפליקות CoreDNS ב-OOMKilled. מה יש לעשות לפני שמשנים דבר?",
        options: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (force restart without investigating root cause first)",
          "kubectl describe pod coredns-5d78c9869d-abc12 -n kube-system  (check the configured memory limit and exit code)",
          "kubectl top pod -n kube-system  (check actual live memory usage across all system pods)",
          "kubectl logs coredns-5d78c9869d-abc12 -n kube-system --previous  (read CoreDNS error logs)",
        ],
        optionsHe: [
          "kubectl delete pods -n kube-system -l k8s-app=kube-dns  (כפה אתחול מחדש ללא חקירת שורש הבעיה)",
          "kubectl describe pod coredns-5d78c9869d-abc12 -n kube-system  (בדוק מגבלת זיכרון מוגדרת וקוד יציאה)",
          "kubectl top pod -n kube-system  (בדוק שימוש זיכרון חי בפועל בכל Pods המערכת)",
          "kubectl logs coredns-5d78c9869d-abc12 -n kube-system --previous  (קרא לוגי שגיאה של CoreDNS)",
        ],
        answer: 1,
        explanation:
          "✓ `kubectl describe pod` shows the configured memory limit, exit code (137 = OOMKilled), and the Last State section. This tells you: (1) what the limit is, and (2) confirms OOM vs other termination reasons. You need the current limit before you can decide how to change it.\n→ Follow up with `kubectl top` to see actual usage, but first establish the baseline limit.\n✗ Deleting pods restarts them into the same OOMKill cycle immediately. `kubectl top` shows current usage but not the configured limit. Logs may help but OOMKill is a kernel-level event, not an app error.",
        explanationHe:
          "✓ `kubectl describe pod` מציג את מגבלת הזיכרון המוגדרת, קוד יציאה (137 = OOMKilled), וחלק Last State. זה מגלה: (1) מהי המגבלה, ו-(2) מאשר OOM מול סיבות סיום אחרות. צריך את המגבלה הנוכחית לפני שמחליטים איך לשנות.\n→ המשך עם `kubectl top` לראות שימוש בפועל, אך קודם יש לבסס את המגבלה הנוכחית.\n✗ מחיקת Pods מאתחלת אותם למחזור OOMKill זהה מיידית. `kubectl top` מציג שימוש נוכחי אך לא את המגבלה המוגדרת. לוגים עשויים לעזור אך OOMKill הוא אירוע ברמת kernel, לא שגיאת אפליקציה.",
      },
      {
        prompt:
          "CoreDNS Memory at 99% of Limit\n\n• Memory limit: 170Mi\n• Current usage: 168Mi (99% of limit)\n• Cluster recently scaled from 20 to 80 nodes\n\nWhat is the likely root cause?",
        promptHe:
          "זיכרון CoreDNS ב-99% מהמגבלה\n\n• מגבלת זיכרון: \u200F`170Mi`\n• שימוש נוכחי: \u200F`168Mi` (99% מהמגבלה)\n• הקלאסטר גדל לאחרונה מ-20 ל-80 Nodes\n\nמה הסיבה השורשית הסבירה?",
        options: [
          "A memory leak in the CoreDNS binary itself that requires an immediate version upgrade to patch",
          "The cluster grew significantly and CoreDNS needs more memory to cache the additional DNS records",
          "The CoreDNS ConfigMap is corrupt or misconfigured and must be restored from a known-good backup",
          "The underlying node is overloaded and swapping memory which causes CoreDNS to appear OOMKilled",
        ],
        optionsHe: [
          "דליפת זיכרון בבינארי של CoreDNS עצמו שדורשת שדרוג גרסה מיידי כדי לתקן",
          "הקלאסטר גדל משמעותית ו-CoreDNS צריך יותר זיכרון לשמירת רשומות DNS הנוספות",
          "ה-ConfigMap של CoreDNS פגום או מוגדר שגוי ויש לשחזר אותו מגיבוי תקין",
          "ה-Node הבסיסי עמוס ומחליף זיכרון מה שגורם ל-CoreDNS להיראות כ-OOMKilled",
        ],
        answer: 1,
        explanation:
          "✓ CoreDNS memory scales with cluster size - more Services/Pods = larger DNS cache.\n→ At 4× cluster size, 170Mi is no longer enough.\n✗ Corrupt config → errors, not gradual memory growth. Node swap affects all pods equally, not just CoreDNS.",
        explanationHe:
          "✓ זיכרון CoreDNS גדל עם גודל הקלאסטר, יותר Services/Pods = cache DNS גדול יותר.\nבגודל קלאסטר פי 4, `170Mi` כבר לא מספיק.\n✗ קונפיגורציה פגומה גורמת לשגיאות, לא גדילת זיכרון הדרגתית. swap ב-Node משפיע על כל ה-Pods בשווה.",
      },
      {
        prompt:
          "Increasing CoreDNS Memory Safely\n\nYou pull the CoreDNS logs to confirm before acting:\n\nkubectl logs coredns-5d78c9869d-abc12 -n kube-system --previous --tail=15\n[INFO] plugin/reload: Running configuration SHA512\n[INFO] 10.244.3.12:41892 - 30  'AAAA IN cart-svc.production.svc.cluster.local. udp 58 false 512' NOERROR 131 0.000284s\n[INFO] 10.244.7.5:55123 - 42   'A IN auth-svc.production.svc.cluster.local. udp 54 false 512' NOERROR 106 0.000191s\n[WARNING] plugin/kubernetes: Kubernetes API connection reset\n[INFO] 10.244.1.8:39201 - 15  'A IN postgres.database.svc.cluster.local. udp 52 false 512' NOERROR 98 0.000312s\n[ERROR] plugin/errors: 2 dns.test. A: read udp 10.96.0.10:53->10.244.0.1:39211: i/o timeout\n[INFO] 10.244.5.3:48922 - 28  'A IN inventory-svc.production.svc.cluster.local. udp 62 false 512' SERVFAIL 62 5.001203s\n[INFO] plugin/health: Health check OK\nOOMKilled\n\nRoot cause confirmed: memory exhaustion. How do you increase CoreDNS memory without causing a DNS blackout?",
        promptHe:
          "הגדלת זיכרון CoreDNS בבטחה\n\nמושכים לוגים של CoreDNS לאישור לפני פעולה:\n\nkubectl logs coredns-5d78c9869d-abc12 -n kube-system --previous --tail=15\n[INFO] plugin/reload: Running configuration SHA512\n[INFO] 10.244.3.12:41892 - 30  'AAAA IN cart-svc.production.svc.cluster.local. udp 58 false 512' NOERROR 131 0.000284s\n[INFO] 10.244.7.5:55123 - 42   'A IN auth-svc.production.svc.cluster.local. udp 54 false 512' NOERROR 106 0.000191s\n[WARNING] plugin/kubernetes: Kubernetes API connection reset\n[INFO] 10.244.1.8:39201 - 15  'A IN postgres.database.svc.cluster.local. udp 52 false 512' NOERROR 98 0.000312s\n[ERROR] plugin/errors: 2 dns.test. A: read udp 10.96.0.10:53->10.244.0.1:39211: i/o timeout\n[INFO] 10.244.5.3:48922 - 28  'A IN inventory-svc.production.svc.cluster.local. udp 62 false 512' SERVFAIL 62 5.001203s\n[INFO] plugin/health: Health check OK\nOOMKilled\n\nסיבה שורשית מאושרת: מיצוי זיכרון. כיצד מגדילים זיכרון CoreDNS ללא השבתת DNS?",
        options: [
          "kubectl edit deployment coredns -n kube-system  (increase memory limit, triggers rolling update)",
          "kubectl delete deployment coredns -n kube-system  (delete and let it recreate from scratch)",
          "Restart all control-plane components including etcd, scheduler, and controller-manager",
          "Add more nodes to the cluster to distribute DNS query load across more CoreDNS replicas",
        ],
        optionsHe: [
          "kubectl edit deployment coredns -n kube-system  (הגדל מגבלת זיכרון, מפעיל rolling update)",
          "kubectl delete deployment coredns -n kube-system  (מחק ותן לו להיווצר מחדש מאפס)",
          "לאתחל את כל רכיבי ה-control plane כולל etcd, scheduler ו-controller-manager",
          "להוסיף עוד Nodes לקלאסטר כדי לפזר עומס DNS על יותר replicas של CoreDNS",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl edit deployment` triggers a rolling update: one CoreDNS pod is updated while the other continues serving DNS. The Deployment's default `RollingUpdate` strategy ensures at least one replica stays available throughout.\n→ Note: in managed clusters (EKS/GKE/AKS), CoreDNS may be managed by the platform addon system. Manual edits may be reverted on cluster upgrades. Document the change and update the addon config too.\n✗ Deleting the deployment = total DNS outage (both replicas gone). Restarting control-plane doesn't affect CoreDNS. More nodes doesn't fix per-pod memory limits.",
        explanationHe:
          "✓ `kubectl edit deployment` מפעיל rolling update: Pod CoreDNS אחד מתעדכן בזמן שהשני ממשיך לשרת DNS. אסטרטגיית `RollingUpdate` של ה-Deployment מבטיחה שלפחות רפליקה אחת נשארת זמינה לאורך כל התהליך.\n→ הערה: בקלאסטרים מנוהלים (EKS/GKE/AKS), CoreDNS עשוי להיות מנוהל על ידי מערכת addon של הפלטפורמה. עריכות ידניות עלולות להידרס בשדרוגי קלאסטר. תעד את השינוי ועדכן גם את הגדרת ה-addon.\n✗ מחיקת Deployment = השבתת DNS מוחלטת (שתי הרפליקות נעלמות). אתחול control-plane לא משפיע על CoreDNS. יותר Nodes לא מתקן מגבלות זיכרון per-pod.",
      },
      {
        prompt:
          "Verifying DNS Restoration\n\n• CoreDNS memory limit increased to 512Mi\n• Pods show Running status\n• Need to confirm DNS is fully functional\n\nWhat is the strongest verification?",
        promptHe:
          "אימות שחזור DNS\n\n• מגבלת זיכרון CoreDNS הוגדלה ל-\u200F`512Mi`\n• Pods מציגים סטטוס Running\n• צריך לאשר ש-DNS פעיל לחלוטין\n\nמהי הבדיקה החזקה ביותר?",
        options: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide  (confirm Running status and node placement)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (check for resolution errors or timeouts)",
          "kubectl top pod -n kube-system -l k8s-app=kube-dns  (check that memory usage isn't climbing again)",
        ],
        optionsHe: [
          "kubectl run dns-verify --image=busybox:1.28 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local",
          "kubectl get pods -n kube-system -l k8s-app=kube-dns -o wide  (אשר סטטוס Running ומיקום Node)",
          "kubectl logs -n kube-system -l k8s-app=kube-dns --tail=30  (בדוק שגיאות פתרון שמות או timeouts)",
          "kubectl top pod -n kube-system -l k8s-app=kube-dns  (בדוק שצריכת הזיכרון לא מטפסת שוב)",
        ],
        answer: 0,
        explanation:
          "✓ Running an actual `nslookup` from a test pod proves DNS works end-to-end: the pod's `/etc/resolv.conf` points to the kube-dns Service, which routes to CoreDNS, which resolves the name. A successful result means the full chain is working.\n→ A pod can be Running but still serving errors. Only a live resolution test proves DNS is functional.\n✗ Checking pod status only proves the container started. Logs show CoreDNS internals but not whether clients can resolve. Memory monitoring is a good follow-up but doesn't verify DNS functionality.",
        explanationHe:
          "✓ הרצת `nslookup` בפועל מ-Pod בדיקה מוכיחה ש-DNS עובד מקצה לקצה: ה-`/etc/resolv.conf` של ה-Pod מצביע על Service של kube-dns, שמנתב ל-CoreDNS, שפותר את השם. תוצאה מוצלחת אומרת שכל השרשרת עובדת.\n→ Pod יכול להיות Running אך עדיין לשרת שגיאות. רק בדיקת פתרון חיה מוכיחה ש-DNS תקין.\n✗ בדיקת סטטוס Pod רק מוכיחה שהקונטיינר עלה. לוגים מראים פנימיות CoreDNS אך לא האם לקוחות יכולים לפתור. ניטור זיכרון הוא מעקב טוב אך לא מאמת פונקציונליות DNS.",
      },
      {
        prompt:
          "Post-Incident: DNS Monitoring Strategy\n\n• DNS restored and stable\n• Root cause: cluster growth outgrew CoreDNS memory limit\n• Memory climbed silently for days before pods started crashing\n\nWhich single alert would have caught this earliest?",
        promptHe:
          "לאחר האירוע: אסטרטגיית ניטור DNS\n\n• DNS שוחזר ויציב\n• סיבה שורשית: גדילת קלאסטר חרגה ממגבלת זיכרון CoreDNS\n• הזיכרון טיפס בשקט ימים לפני שה-Pods התחילו לקרוס\n\nאיזו התראה בודדת הייתה תופסת את זה הכי מוקדם?",
        options: [
          "Alert when CoreDNS pod memory usage exceeds 80% of its limit",
          "Alert on CoreDNS pod restart count > 0 in 5 minutes",
          "Alert on CoreDNS P99 DNS query latency > 100ms",
          "Alert on kube_pod_container_status_terminated_reason{reason='OOMKilled'}",
        ],
        optionsHe: [
          "להתריע כאשר שימוש הזיכרון של Pod CoreDNS עולה על 80% ממגבלתו",
          "להתריע על ספירת אתחולי Pod CoreDNS > 0 תוך 5 דקות",
          "להתריע על זמן אחזור DNS P99 של CoreDNS > 100ms",
          "להתריע על kube_pod_container_status_terminated_reason{reason='OOMKilled'}",
        ],
        answer: 0,
        explanation:
          "✓ Memory usage >80% of limit fires before the OOMKill happens. In this incident, memory climbed gradually over days as the cluster scaled. An 80% threshold would have alerted while DNS was still functional, giving time to increase limits proactively.\n→ Restart alerts and latency alerts fire after the damage is done. The OOMKilled metric fires after the crash. Memory pressure is the leading indicator.\n✗ Restart count and latency alerts are useful but they're lagging indicators. The OOMKilled metric only fires after a crash. The goal is to catch the problem before users are impacted.",
        explanationHe:
          "✓ שימוש זיכרון >80% מהמגבלה מופעל לפני ש-OOMKill קורה. באירוע זה, הזיכרון טיפס בהדרגה על פני ימים ככל שהקלאסטר גדל. סף של 80% היה מתריע בזמן ש-DNS עדיין תקין, ונותן זמן להגדיל מגבלות באופן יזום.\n→ התראות אתחולים ועיכוב מופעלות אחרי שהנזק נעשה. מטריקת OOMKilled מופעלת אחרי קריסה. לחץ זיכרון הוא האינדיקטור המוביל.\n✗ ספירת אתחולים ועיכוב הם אינדיקטורים מפגרים. מטריקת OOMKilled מופעלת רק אחרי קריסה. המטרה היא לתפוס את הבעיה לפני שמשתמשים מושפעים.",
      },
    ],
    rootCause: "CoreDNS pods in kube-system were OOMKilled due to insufficient memory limits. Without functioning DNS, services couldn't resolve each other's names, causing cascading failures across the cluster.",
    rootCauseHe: "פודי CoreDNS ב-kube-system עברו OOMKill בגלל מגבלות זיכרון לא מספיקות. בלי DNS תקין, שירותים לא הצליחו לפענח שמות של שירותים אחרים, מה שגרם לכשלים מדורגים בכל ה-cluster.",
    correctApproach: "Test DNS resolution from inside a pod with nslookup, check CoreDNS pod status in kube-system, identify the OOMKilled state, and raise CoreDNS memory limits.",
    correctApproachHe: "לבדוק פענוח DNS מתוך Pod עם nslookup, לבדוק את סטטוס פודי CoreDNS ב-kube-system, לזהות את מצב ה-OOMKilled, ולהעלות את מגבלות הזיכרון של CoreDNS.",
    command: "kubectl logs -n kube-system -l k8s-app=kube-dns --previous",
    hint: "If everyone is affected, look at the shared layer.",
    hintHe: "אם כולם מושפעים, חפש בשכבה המשותפת.",
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
    steps: [
      {
        prompt:
          "#checkout-alerts | PagerDuty SEV-1\ncheckout-service timeout rate: 100%. All frontend-to-backend calls hang.\nTimeline: security team applied new NetworkPolicies 12 min ago.\nPods: all Running/Ready. Endpoints: populated. Logs: no errors.\nCluster: prod-central | Namespace: production\n\nWhat do you check first?",
        promptHe:
          "#checkout-alerts | PagerDuty SEV-1\nשיעור timeout של checkout-service: 100%. כל קריאות frontend-to-backend תלויות.\nציר זמן: צוות אבטחה החיל NetworkPolicies חדשות לפני 12 דקות.\nPods: הכל Running/Ready. Endpoints: מאוכלסים. לוגים: אין שגיאות.\nCluster: prod-central | Namespace: production\n\nמה בודקים קודם?",
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
        explanation:
          "✓ The timeline is your biggest clue: everything broke 12 minutes after a NetworkPolicy change. Always start with what changed. NetworkPolicies operate at the network layer (L3/L4) and are invisible to the application, which is why pods show no errors and endpoints look healthy.\n→ Timeouts (not 'connection refused') are the signature of a NetworkPolicy drop: packets are silently dropped, so the client waits until timeout.\n✗ Rolling back backend won't fix a network-layer block. Endpoints show Service routing, not policy enforcement. Pods are healthy -- the block is between them.",
        explanationHe:
          "✓ ציר הזמן הוא הרמז הגדול: הכל נשבר 12 דקות אחרי שינוי NetworkPolicy. תמיד תתחיל ממה שהשתנה. NetworkPolicies פועלות בשכבת הרשת (L3/L4) ובלתי נראות לאפליקציה, ולכן ה-Pods לא מציגים שגיאות וה-endpoints נראים תקינים.\n→ Timeouts (לא 'connection refused') הם החתימה של חסימת NetworkPolicy: חבילות נזרקות בשקט, כך שהלקוח ממתין עד timeout.\n✗ Rollback לבאקאנד לא יתקן חסימה ברמת רשת. Endpoints מראים ניתוב Service, לא אכיפת policy. הפודים תקינים -- החסימה היא ביניהם.",
      },
      {
        prompt:
          "Inspecting NetworkPolicy Rules\n\n• Policies found: `deny-all-ingress`, `allow-frontend`\n• Need to understand what each policy permits\n\nHow do you inspect the rules?",
        promptHe:
          "בדיקת כללי NetworkPolicy\n\n• Policies שנמצאו: \u200F`deny-all-ingress`, `allow-frontend`\n• צריך להבין מה כל policy מתירה\n\nכיצד בודקים את הכללים?",
        options: [
          "kubectl describe networkpolicy -n production  (shows selectors and rules for all policies)",
          "kubectl logs networkpolicy-controller -n kube-system  (check controller logs for policy errors)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp  (look for policy events)",
          "kubectl exec into a pod and inspect iptables rules  (check if kernel-level rules are applied)",
        ],
        optionsHe: [
          "kubectl describe networkpolicy -n production  (מציג selectors וכללים לכל המדיניות)",
          "kubectl logs networkpolicy-controller -n kube-system  (בדוק לוגי controller לשגיאות policy)",
          "kubectl get events -n production --sort-by=.metadata.creationTimestamp  (חפש אירועי policy)",
          "kubectl exec לתוך Pod ובדוק כללי iptables  (בדוק אם כללים ברמת kernel הוחלו)",
        ],
        answer: 0,
        explanation:
          "✓ `kubectl describe networkpolicy` shows three critical sections per policy: (1) PodSelector -- which pods this policy applies to, (2) Allowing ingress from -- the source pods/namespaces/IPs allowed, (3) Allowing egress to -- the destinations allowed. This readable format is much faster than parsing raw YAML.\n→ Key to read: the `deny-all-ingress` policy blocks everything; `allow-frontend` is supposed to create an exception. The question is whether the exception's selector matches reality.\n✗ There's no standalone 'networkpolicy-controller' with user-visible logs. Events don't contain policy rule details. iptables inspection requires root access and CNI-specific knowledge.",
        explanationHe:
          "✓ `kubectl describe networkpolicy` מציג שלושה חלקים קריטיים לכל policy: (1) PodSelector -- אילו Pods ה-policy חלה עליהם, (2) Allowing ingress from -- Pods/namespaces/IPs מקוריים מותרים, (3) Allowing egress to -- יעדים מותרים. פורמט קריא זה מהיר בהרבה מפענוח YAML גולמי.\n→ מפתח לקריאה: policy `deny-all-ingress` חוסמת הכל; `allow-frontend` אמורה ליצור חריגה. השאלה היא האם ה-selector של החריגה תואם למציאות.\n✗ אין 'networkpolicy-controller' עצמאי עם לוגים למשתמש. Events לא מכילים פרטי כללי policy. בדיקת iptables דורשת root וידע ספציפי ל-CNI.",
      },
      {
        prompt:
          "Suspect Label Mismatch in Policy\n\n• `allow-frontend` targets backend pods, allows ingress from `role=frontend`\n• `deny-all-ingress` blocks all other traffic\n\nWhat must you check?",
        promptHe:
          "חשד לאי-התאמת Labels ב-Policy\n\n• `allow-frontend` מטרגטת Pods של backend, מתירה ingress מ-`role=frontend`\n• `deny-all-ingress` חוסמת כל תעבורה אחרת\n\nמה חייבים לבדוק?",
        options: [
          "kubectl get pods -n production --show-labels  (check actual labels on frontend pods)",
          "kubectl delete networkpolicy deny-all-ingress -n production  (remove deny-all without analysis)",
          "kubectl get svc -n production  (list services, but doesn't reveal label mismatches)",
          "kubectl describe deployment frontend -n production  (shows template but not live pod labels)",
        ],
        optionsHe: [
          "kubectl get pods -n production --show-labels  (בדוק labels בפועל על Pods של פרונטאנד)",
          "kubectl delete networkpolicy deny-all-ingress -n production  (הסרת deny-all ללא ניתוח מקדים)",
          "kubectl get svc -n production  (הצגת services, אך לא חושפת אי-התאמת labels)",
          "kubectl describe deployment frontend -n production  (מציג template אך לא labels חיים)",
        ],
        answer: 0,
        explanation:
          "✓ NetworkPolicies match pods by labels. If frontend pods lack `role=frontend`, the allow rule won't match them.\n→ Verify actual pod labels before modifying any policy.\n✗ Deleting deny-all weakens security. Services and deployment details won't reveal the label mismatch.",
        explanationHe:
          "✓ NetworkPolicies מתאימים Pods לפי labels. אם Pods של frontend חסרים `role=frontend`, כלל ה-allow לא יתאים.\nאמת labels בפועל לפני שינוי מדיניות.\n✗ מחיקת deny-all מחלישה אבטחה. Services ופרטי Deployment לא יחשפו אי-התאמת labels.",
      },
      {
        prompt:
          "Label Mismatch Confirmed\n\n• Policy `allow-frontend` expects from: `role=frontend`\n• Actual frontend pod labels: `app=frontend`\n• Frontend traffic blocked by deny-all (no exception matches)\n• Checkout is fully down. Users cannot complete orders.\n\nWhat is the fastest way to restore traffic right now?",
        promptHe:
          "אי-התאמת Labels אושרה\n\n• Policy `allow-frontend` מצפה ל-from: \u200F`role=frontend`\n• Labels בפועל של Pods frontend: \u200F`app=frontend`\n• תעבורת frontend חסומה (אין חריגה מתאימה)\n• Checkout מושבת לחלוטין. משתמשים לא יכולים להשלים הזמנות.\n\nמה הדרך המהירה ביותר לשחזר תעבורה עכשיו?",
        options: [
          "kubectl label pod <each-frontend-pod> role=frontend  (relabel individual pods one by one, fragile and lost on restart)",
          "kubectl patch networkpolicy allow-frontend -n production -p '{\"spec\":{\"ingress\":[{\"from\":[{\"podSelector\":{\"matchLabels\":{\"app\":\"frontend\"}}}]}]}}'",
          "kubectl delete networkpolicy deny-all-ingress  (remove the default-deny entirely, exposes all pods to any traffic)",
          "Add `role=frontend` to the frontend Deployment pod template labels and wait for a full rollout to complete across replicas",
        ],
        optionsHe: [
          "kubectl label pod <כל-pod-פרונטאנד> role=frontend  (תייג מחדש Pods בודדים אחד אחד, שביר ונמחק באתחול)",
          "kubectl patch networkpolicy allow-frontend -n production -p '{\"spec\":{\"ingress\":[{\"from\":[{\"podSelector\":{\"matchLabels\":{\"app\":\"frontend\"}}}]}]}}'",
          "kubectl delete networkpolicy deny-all-ingress  (הסר את ה-default-deny לחלוטין, חושף את כל ה-Pods לכל תעבורה)",
          "הוסף `role=frontend` ל-pod template של frontend Deployment והמתן ל-rollout מלא שיסתיים על כל הרפליקות",
        ],
        answer: 1,
        explanation:
          "✓ `kubectl patch networkpolicy` updates the from-selector to match actual labels (`app=frontend`). Takes effect immediately, no pod restart or rollout needed. Traffic restores within seconds.\n→ After restoring traffic, coordinate with the security team on the permanent fix: either update the policy to use `app=frontend` going forward, or add `role=frontend` to the Deployment template so both labels exist. The right permanent fix depends on the team's labeling convention.\n✗ Manual pod labels are lost on pod restart. Deleting deny-all removes your security baseline. Adding Deployment labels is the right permanent fix but requires a rollout -- too slow during an active outage.",
        explanationHe:
          "✓ `kubectl patch networkpolicy` מעדכן את ה-from-selector להתאים ל-labels בפועל (`app=frontend`). נכנס לתוקף מיידית, ללא אתחול Pods או rollout. תעבורה משוחזרת תוך שניות.\n→ אחרי שחזור תעבורה, תאמו עם צוות האבטחה על התיקון הקבוע: או לעדכן את ה-policy להשתמש ב-`app=frontend` מעכשיו, או להוסיף `role=frontend` ל-template של ה-Deployment כך ששני ה-labels יהיו קיימים. התיקון הקבוע הנכון תלוי במוסכמות ה-labeling של הצוות.\n✗ Labels ידניים אובדים באתחול Pod. מחיקת deny-all מסירה את בסיס האבטחה. הוספת labels ל-Deployment היא התיקון הקבוע הנכון אך דורשת rollout -- איטי מדי במהלך השבתה פעילה.",
      },
      {
        prompt:
          "Verifying the Policy Patch\n\n• from-selector updated to `app=frontend`\n• Need to confirm traffic flows before declaring resolved\n\nHow do you verify?",
        promptHe:
          "אימות עדכון ה-Policy\n\n• from-selector עודכן ל-`app=frontend`\n• צריך לאשר שהתעבורה זורמת לפני הכרזת פתרון\n\nכיצד מאמתים?",
        options: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "Wait for real user traffic to flow through and monitor error rates in the dashboard over the next few minutes",
          "kubectl get endpoints backend-svc -n production  (shows endpoint list but not whether traffic is allowed)",
          "kubectl describe networkpolicy allow-frontend -n production  (read the updated policy YAML, but no live traffic test)",
        ],
        optionsHe: [
          "kubectl run curl-test --image=curlimages/curl -n production --rm -it --restart=Never -- curl backend-svc:8080/health",
          "להמתין לתעבורת משתמשים אמיתית שתזרום ולנטר שיעורי שגיאות בדשבורד במשך הדקות הקרובות",
          "kubectl get endpoints backend-svc -n production  (מציג רשימת endpoints אך לא אם תעבורה מותרת)",
          "kubectl describe networkpolicy allow-frontend -n production  (קרא את ה-YAML המעודכן, אך ללא בדיקת תעבורה חיה)",
        ],
        answer: 0,
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
          "Ask engineers to manually verify NetworkPolicy selectors after every deployment and document results",
          "Store NetworkPolicies in Git (GitOps), run a policy linter in CI, and validate in staging first",
          "Disable NetworkPolicy enforcement on the cluster entirely to avoid future connectivity issues",
          "Only apply NetworkPolicies during scheduled maintenance windows and roll back if tests fail",
        ],
        optionsHe: [
          "לבקש ממהנדסים לאמת ידנית selectors של NetworkPolicy אחרי כל דיפלוימנט ולתעד תוצאות",
          "GitOps לניהול NetworkPolicies, linter ב-CI, ואימות ב-staging לפני production",
          "להשבית אכיפת NetworkPolicy על הקלאסטר לחלוטין כדי למנוע בעיות קישוריות עתידיות",
          "להחיל NetworkPolicies רק במהלך חלונות תחזוקה מתוכננים ולעשות rollback אם בדיקות נכשלות",
        ],
        answer: 1,
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
          "Apply the new policy directly in production and monitor dashboards closely; roll back if issues appear within the window",
          "Read the YAML carefully, review every selector and port definition, and trust the policy is correct once reviewed",
          "In staging: apply deny-all baseline, add each allow rule incrementally, and verify only intended traffic passes after each rule",
          "Use kubectl dry-run to preview the rendered changes locally before applying them to any cluster environment",
        ],
        optionsHe: [
          "להחיל את המדיניות ישירות ב-production ולנטר דשבורדים; לבצע rollback אם מופיעות בעיות",
          "לקרוא את ה-YAML בקפידה, לבדוק כל selector ו-port, ולבטוח שהמדיניות נכונה לאחר הסקירה",
          "ב-staging: התחל עם deny-all, הוסף כל כלל allow, ואמת שרק התעבורה המיועדת עוברת",
          "להשתמש ב-kubectl dry-run לתצוגה מקדימה של השינויים לפני החלה על כל cluster",
        ],
        answer: 2,
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
    hint: "Look carefully at names and labels.",
    hintHe: "הסתכל היטב על שמות ותוויות.",
  },
];
