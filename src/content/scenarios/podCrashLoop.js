// - Scenario: Pod CrashLoopBackOff -----------------------------------------------

export default {
  id: "pod-crash-loop",
  title: "Pod CrashLoopBackOff",
  titleHe: "Pod בלולאת CrashLoopBackOff",
  description: "A critical payment-service pod on EKS is stuck in CrashLoopBackOff during Black Friday traffic. Dependent services are failing and orders are dropping.",
  descriptionHe: "Pod קריטי של payment-service על EKS תקוע ב-CrashLoopBackOff במהלך תעבורת Black Friday. שירותים תלויים כושלים והזמנות נופלות.",
  difficulty: "hard",
  order: 4,
  estimatedTime: "6-8 min",
  tags: ["Kubernetes", "OOMKill", "Debugging", "Memory"],
  icon: "\ud83d\udd04",
  initialMetrics: { performance: 45, cost: 50, reliability: 40 },
  initialSystemState: {
    latency: 350,
    errorRate: 25,
    cpuPercent: 72,
    connections: "140/200",
    maxConnections: 200,
    costPerMonth: 2800,
    stability: "critical",
    throughput: 420,
    dbLoad: 65,
    queueDepth: 1200
  },
  steps: {
    start: {
      id: "start",
      context: "Black Friday morning. The payment-service pod on your EKS cluster is stuck in CrashLoopBackOff. 3 of 5 replicas are down with OOMKilled status. The order-service and notification-service depend on payment-service and are returning 5xx errors. Orders are failing at a 25% rate. The message queue is backing up with unprocessed payment events. The CEO is watching the metrics dashboard.",
      contextHe: "בוקר Black Friday. ה-pod של payment-service על ה-EKS cluster שלך תקוע ב-CrashLoopBackOff. 3 מתוך 5 replicas נפלו עם סטטוס OOMKilled. ה-order-service וה-notification-service תלויים ב-payment-service ומחזירים שגיאות 5xx. הזמנות נכשלות בקצב של 25%. תור ההודעות מצטבר עם אירועי תשלום שלא עובדו. ה-CEO צופה בלוח המדדים.",
      question: "payment-service is CrashLoopBackOff with OOMKilled. How do you respond?",
      questionHe: "payment-service ב-CrashLoopBackOff עם OOMKilled. איך אתה מגיב?",
      alerts: [
        { type: "critical", source: "Kubernetes", text: "Pod payment-svc-7f8d restarting: OOMKilled (exit code 137)", textHe: "Pod payment-svc-7f8d מאותחל מחדש: OOMKilled (exit code 137)" },
        { type: "warning", source: "order-service", text: "order-service: 25% 5xx responses to downstream clients", textHe: "order-service: 25% תגובות 5xx ללקוחות" },
        { type: "info", source: "HPA", text: "HPA: current replicas 5/10, 3 pods not ready", textHe: "HPA: replicas נוכחיים 5/10, 3 pods לא מוכנים" }
      ],
      logs: [
        { level: "error", timestamp: "10:15:01", text: "payment-svc OOMKilled exit code 137" },
        { level: "warn", timestamp: "10:15:03", text: "kubelet: Back-off restarting failed container payment-svc in pod payment-svc-7f8d" },
        { level: "warn", timestamp: "10:14:55", text: "payment-svc: heap usage 248Mi/256Mi limit" }
      ],
      options: [
        {
          text: "Check pod logs and kubectl describe output to understand root cause",
          textHe: "בדוק לוגים של pod ו-kubectl describe כדי להבין את שורש הבעיה",
          nextStep: "checked_logs",
          impact: { performance: 5, cost: 0, reliability: 5 },
          operationalComplexity: 8,
          tag: "Observability first",
          tagHe: "תצפיות קודם",
          explanation: "Problem: Pods are getting OOMKilled and you do not know why yet. What happened: The container hit its 256Mi memory limit and the kernel killed it. Why this matters: Checking logs and describe output takes 2-3 minutes and tells you exactly what to fix, instead of guessing.",
          explanationHe: "התחלה באבחון היא התגובה הנכונה ל-OOMKill. kubectl describe pod מציג את סיבת הסיום האחרונה, exit code, ומגבלות משאבים. kubectl logs --previous מציג את הפלט האחרון לפני שהקונטיינר נהרג. יחד, אלה חושפים את מגמת הזיכרון ודפוסי הקצאה חשודים. זה לוקח 2-3 דקות אבל חוסך יישום תיקון שגוי.",
          stateEffect: { latency: 380, errorRate: 25, cpuPercent: 72, stability: "critical", throughput: 400, queueDepth: 1400 }
        },
        {
          text: "Increase memory limits to 1Gi and redeploy all pods",
          textHe: "הגדל מגבלות זיכרון ל-1Gi ופרוס מחדש את כל ה-pods",
          nextStep: "increased_memory",
          impact: { performance: 10, cost: -10, reliability: 5 },
          operationalComplexity: 15,
          tag: "Resource scaling",
          tagHe: "הרחבת משאבים",
          explanation: "Problem: Pods crash at 256Mi so you bumped the limit to 1Gi. What happened: Pods stop crashing for now, but memory usage keeps climbing. Why this is risky: If there is a leak, the pod will eat 1Gi too and crash again, and you are now using 4x more resources without knowing the root cause.",
          explanationHe: "הגדלת מגבלות זיכרון מ-256Mi ל-1Gi עוצרת את ה-OOMKill המיידי וקונה זמן. Pods יאותחלו ויישארו פעילים יותר זמן, ושיעור השגיאות ירד. אבל זה מטפל בסימפטום, לא בגורם. אם יש דליפת זיכרון, ה-pod יצרוך 1Gi גם כן - רק ייקח יותר זמן להתרסק. גם הגדלת צריכת משאבי node פי 4 לכל pod, מה שעלול להפעיל cluster autoscaler להוספת nodes ולהעלות עלויות.",
          stateEffect: { latency: 200, errorRate: 5, cpuPercent: 68, costPerMonth: 3400, stability: "degraded", throughput: 680, queueDepth: 400 }
        },
        {
          text: "Rollback to previous deployment version",
          textHe: "חזור לגרסת פריסה קודמת",
          nextStep: "rolled_back",
          impact: { performance: 8, cost: 0, reliability: 10 },
          operationalComplexity: 10,
          tag: "Safe rollback",
          tagHe: "חזרה בטוחה",
          explanation: "Problem: A recent deploy likely introduced the crash. What happened: Rolling back restores the last known-good version in about 90 seconds. Why this works: Kubernetes handles the rollout safely with zero downtime, and you can investigate the root cause without the pressure of an active outage.",
          explanationHe: "kubectl rollout undo היא אחת מתגובות החירום הבטוחות ביותר. אם הבעיה נוצרה מפריסה אחרונה, חזרה לאחור משחזרת את המצב התקין תוך 60-90 שניות. בקר הפריסה של Kubernetes מנהל את ה-rollout עם אפס downtime כברירת מחדל. החיסרון: מאבדים פיצ'רים שהיו בפריסה החדשה, ואם לא חוקרים את שורש הבעיה, תיתקלו באותה בעיה שוב.",
          stateEffect: { latency: 150, errorRate: 1, cpuPercent: 45, stability: "healthy", throughput: 750, queueDepth: 50 }
        },
        {
          text: "Scale HPA to 15 replicas to handle the load",
          textHe: "הרחב HPA ל-15 replicas כדי לטפל בעומס",
          nextStep: "scaled_hpa",
          impact: { performance: -5, cost: -15, reliability: -10 },
          operationalComplexity: 35,
          tag: "Horizontal scaling",
          tagHe: "הרחבה אופקית",
          explanation: "Problem: Each pod hits 256Mi and gets killed no matter how many replicas you run. What happened: You now have 15 crash-looping pods instead of 3, plus 3 new nodes the autoscaler spun up. Why this failed: Horizontal scaling cannot fix a per-pod memory problem. You just tripled the failures and the cost.",
          explanationHe: "הרחבה מ-5 ל-15 replicas כש-3 מתוך 5 ב-OOMKilled אומר שעכשיו יש 15 pods שכולם פוגעים באותה מגבלת זיכרון. כל pod חדש יעבור את אותו מחזור חיים: הפעלה, הקצאת זיכרון, פגיעה ב-256Mi, הריגה על ידי OOM killer. הכפלת את מספר ה-pods שמתרסקים בלולאה מבלי לטפל בסיבה שהם מתרסקים. בנוסף, Cluster Autoscaler יקצה nodes חדשים, מה שיעלה עלויות.",
          stateEffect: { latency: 500, errorRate: 45, cpuPercent: 88, costPerMonth: 3600, stability: "critical", throughput: 280, queueDepth: 3500 }
        }
      ]
    },
    checked_logs: {
      id: "checked_logs",
      timeDelta: "5 minutes later. Log analysis complete.",
      timeDeltaHe: "5 דקות מאוחר יותר. ניתוח לוגים הושלם.",
      context: "kubectl logs --previous shows the heap growing unbounded from 120Mi to 248Mi in 3 minutes. The memory profiler snapshot shows connection pool objects are never released. git blame on package.json reveals the connection-pool library was upgraded from v2.2.0 to v2.3.1 two days ago. The v2.3.1 changelog mentions 'improved connection caching' - which appears to be caching without eviction, causing a memory leak under load.",
      contextHe: "kubectl logs --previous מראה שה-heap גדל ללא הגבלה מ-120Mi ל-248Mi ב-3 דקות. snapshot של memory profiler מראה שאובייקטי connection pool לעולם לא משוחררים. git blame על package.json חושף שספריית connection-pool שודרגה מ-v2.2.0 ל-v2.3.1 לפני יומיים. changelog של v2.3.1 מציין 'improved connection caching' - שככל הנראה מבצע caching ללא eviction, מה שגורם לדליפת זיכרון תחת עומס.",
      question: "You found the root cause: connection-pool v2.3.1 has a memory leak. What is your fix?",
      questionHe: "מצאת את שורש הבעיה: ל-connection-pool v2.3.1 יש דליפת זיכרון. מה התיקון שלך?",
      alerts: [
        { type: "warning", source: "Prometheus", text: "Memory usage climbing: 200Mi -> 248Mi in 3 minutes per pod", textHe: "צריכת זיכרון עולה: 200Mi -> 248Mi ב-3 דקות לכל pod" },
        { type: "info", source: "Git", text: "Recent deploy: 2 days ago - dependency upgrade connection-pool 2.2.0 -> 2.3.1", textHe: "פריסה אחרונה: לפני יומיים - שדרוג תלות connection-pool 2.2.0 -> 2.3.1" }
      ],
      options: [
        {
          text: "Pin connection-pool to v2.2.0, set maxPoolSize=20, increase limit to 512Mi",
          textHe: "נעל connection-pool לגרסה v2.2.0, הגדר maxPoolSize=20, העלה מגבלה ל-512Mi",
          nextStep: "end_optimal",
          impact: { performance: 20, cost: -5, reliability: 25 },
          operationalComplexity: 25,
          tag: "Root cause fix",
          tagHe: "תיקון שורש הבעיה",
          explanation: "Problem: The connection-pool v2.3.1 library caches connections without ever releasing them, so memory grows until OOM. Solution: Pin to v2.2.0 to remove the leak, set maxPoolSize=20 as a safety cap, and bump the limit to 512Mi for breathing room. Why this works: You fix the root cause, add a guard rail, and give yourself a 2x buffer over the 180Mi working set.",
          explanationHe: "זה מטפל בשלוש שכבות הבעיה: (1) נעילה ל-v2.2.0 מסלקת את הספרייה הדולפת, (2) maxPoolSize=20 מוסיף מגבלה בטיחותית שמונעת connection caching בלתי מוגבל, (3) מגבלת 512Mi מספקת מרווח בטיחות כפול מעל ה-180Mi העובדים של v2.2.0. הפריסה לוקחת 3-5 דקות. השילוב של החזרת תלות גרועה, הוספת תצורה הגנתית, ומתן מרווח משאבים הוא הגישה המודלית לפתרון OOMKill.",
          stateEffect: { latency: 120, errorRate: 0, cpuPercent: 38, costPerMonth: 3000, stability: "healthy", throughput: 780, dbLoad: 45, queueDepth: 0 }
        },
        {
          text: "Add memory-based HPA with 80% threshold to auto-restart leaking pods",
          textHe: "הוסף HPA מבוסס זיכרון עם סף 80% לאתחול אוטומטי של pods דולפים",
          nextStep: "end_hpa_bandaid",
          impact: { performance: 5, cost: -10, reliability: 5 },
          operationalComplexity: 30,
          tag: "Monitoring bandaid",
          tagHe: "פלסטר ניטור",
          explanation: "Problem: Memory-based HPA just recycles pods when they get close to the limit, but the leak is still there. What happened: Pods restart every 10 minutes and each restart drops connections for 30 seconds. Why this failed: You automated the crash loop instead of fixing it. That is 6 restarts per hour per pod with transaction drops on every one.",
          explanationHe: "HPA מבוסס זיכרון ירחיב כש-pods מתקרבים למגבלה, ולמעשה ממחזר pods חדשים כשישנים מתמלאים. אבל זה לא מתקן את הדליפה - זה מאטמט את האתחול. כל pod עדיין דולף, וכל אתחול גורם ל-30 שניות של connection drain. עם קצב הדליפה שנצפה, pods יאותחלו כל 10 דקות בערך. זה 6 אתחולים לשעה לכל pod. אתה בונה crash loop אוטומטי, לא תיקון.",
          stateEffect: { latency: 280, errorRate: 8, cpuPercent: 55, costPerMonth: 3800, stability: "degraded", throughput: 520, dbLoad: 70, queueDepth: 600 }
        },
        {
          text: "Set up a CronJob to restart pods every 5 minutes to prevent OOM",
          textHe: "הגדר CronJob שמאתחל pods כל 5 דקות כדי למנוע OOM",
          nextStep: "end_restart_loop",
          impact: { performance: -5, cost: -5, reliability: -15 },
          operationalComplexity: 40,
          tag: "Restart workaround",
          tagHe: "עקיפה באתחולים",
          explanation: "Problem: Restarting pods on a timer kills active connections and drops in-flight payments every 5 minutes. What happened: Multiple pods can restart at the same time, causing cascading failures. Why this failed: It hides the leak from monitoring, makes root cause harder to find, and loses unpersisted payment state on every restart.",
          explanationHe: "אתחולי pods מתוזמנים הם אחד מהאנטי-פטרנים הגרועים ביותר בתפעול Kubernetes. כל אתחול הורג חיבורים פעילים, מפיל טרנזקציות תשלום בתהליך. עם 5 replicas שמאותחלים כל 5 דקות, יש סיכוי לא זניח לאתחול בו-זמני של מספר pods, שגורם לכשלים מדורגים. מצב תשלום שעדיין לא נשמר אובד בכל אתחול.",
          stateEffect: { latency: 450, errorRate: 18, cpuPercent: 60, costPerMonth: 3200, stability: "critical", throughput: 350, dbLoad: 80, queueDepth: 2200 }
        }
      ]
    },
    increased_memory: {
      id: "increased_memory",
      timeDelta: "15 minutes later. Pods stable but memory climbing.",
      timeDeltaHe: "15 דקות מאוחר יותר. Pods יציבים אבל הזיכרון טופס.",
      context: "Pods now have 1Gi memory limits. They stayed up and the error rate dropped to 5%. But after 15 minutes, Prometheus shows memory usage at 900Mi and climbing at ~40Mi per minute. At this rate, pods will OOM again within 3 minutes. The queue backlog has cleared but new orders are flowing in at 3x normal Black Friday rate.",
      contextHe: "ל-Pods יש עכשיו מגבלות זיכרון של 1Gi. הם נשארו פעילים ושיעור השגיאות ירד ל-5%. אבל אחרי 15 דקות, Prometheus מראה צריכת זיכרון של 900Mi שעולה בקצב של 40Mi לדקה. בקצב הזה, pods יגיעו ל-OOM שוב תוך 3 דקות. עומס התור התפנה אבל הזמנות חדשות נכנסות בקצב של פי 3 מהרגיל.",
      question: "Memory is still growing toward the new 1Gi limit. What do you do now?",
      questionHe: "הזיכרון עדיין גדל לקראת מגבלת 1Gi החדשה. מה אתה עושה עכשיו?",
      alerts: [
        { type: "warning", source: "Prometheus", text: "payment-svc memory 900Mi/1Gi - approaching limit again", textHe: "payment-svc זיכרון 900Mi/1Gi - מתקרב למגבלה שוב" },
        { type: "info", source: "order-service", text: "order-service error rate dropped to 5%", textHe: "שיעור שגיאות order-service ירד ל-5%" }
      ],
      options: [
        {
          text: "Investigate the memory leak with heap profiling",
          textHe: "חקור את דליפת הזיכרון עם heap profiling",
          nextStep: "end_profiled",
          impact: { performance: 10, cost: -5, reliability: 10 },
          operationalComplexity: 10,
          tag: "Late diagnosis",
          tagHe: "אבחון מאוחר",
          explanation: "Problem: You still do not know why memory is leaking after 15 minutes of degraded service. What happened: Heap profiling takes another 5-10 minutes and pods may OOM again while you wait. Why this is late: Profiling will find the leaking connection-pool objects, but checking logs at the start would have shown you this 15 minutes ago.",
          explanationHe: "Heap profiling חושף דפוסי הקצאת אובייקטים ושמירתם. ב-Node.js, שימוש ב---inspect עם Chrome DevTools או clinic.js מראה אילו אובייקטים גדלים. ב-Java, jmap heap dump שמנותח עם Eclipse MAT חושף אובייקטים שמורים לפי class. זה יראה בבירור את אובייקטי connection-pool שמצטברים ללא שחרור. האבחון נכון אבל מאוחר - 15 דקות של שירות מופחת היו נמנעות אם בודקים לוגים קודם.",
          stateEffect: { latency: 250, errorRate: 8, cpuPercent: 65, costPerMonth: 3400, stability: "degraded", throughput: 550, dbLoad: 60, queueDepth: 800 }
        },
        {
          text: "Increase memory to 2Gi and add alerting for high memory usage",
          textHe: "העלה זיכרון ל-2Gi והוסף התראות לצריכת זיכרון גבוהה",
          nextStep: "end_expensive_fix",
          impact: { performance: 5, cost: -20, reliability: 5 },
          operationalComplexity: 20,
          tag: "Cost escalation",
          tagHe: "הסלמת עלויות",
          explanation: "Problem: Bumping to 2Gi delays the crash to 45 minutes but the leak is still there. What happened: You are now using 8x the original memory per pod and need bigger nodes, adding about $800/day. Why this failed: Alerts will tell you when pods approach 2Gi, but they cannot stop the leak from eating all of it too.",
          explanationHe: "הכפלת המגבלה שוב ל-2Gi רק מאריכה את הזמן עד להתרסקות הבאה. בקצב דליפה של 40Mi לדקה, pod עם 2Gi יגיע ל-OOM אחרי 45 דקות במקום 6. אתה משתמש עכשיו בפי 8 מהזיכרון המקורי (2Gi לעומת 256Mi) בלי להבין למה. כל pod עם 2Gi דורש instance types גדולים יותר. עם 5 pods, זה 10Gi של זיכרון שמור לשירות אחד. עלות נוספת של כ-$800 ליום בחישוב.",
          stateEffect: { latency: 180, errorRate: 3, cpuPercent: 55, costPerMonth: 5200, stability: "degraded", throughput: 650, dbLoad: 55, queueDepth: 300 }
        },
        {
          text: "Roll back the recent deployment to the previous version",
          textHe: "חזור לגרסה הקודמת של הפריסה",
          nextStep: "end_late_rollback",
          impact: { performance: 5, cost: 0, reliability: 10 },
          operationalComplexity: 10,
          tag: "Delayed rollback",
          tagHe: "חזרה מאוחרת",
          explanation: "Problem: The service was degraded for 15+ minutes while you tried increasing memory instead of rolling back. What happened: You spent time and money on bigger limits and bigger nodes before landing on the right fix. Why this works: Rolling back to v2.2.0 eliminates the leak, but doing it first would have saved those 15 minutes.",
          explanationHe: "חזרה לאחור עכשיו היא הקריאה הנכונה, אבל היא באה אחרי 15+ דקות של שירות מופחת והגדלות זיכרון מיותרות. החזרה עצמה תעבוד - לגרסה v2.2.0 של ספריית connection-pool אין דליפה. אבל כבר הוצאת זמן ועלויות על הגדלת מגבלות זיכרון ותזמון nodes גדולים יותר. הלקח הוא שחזרה לאחור הייתה צריכה להיות התגובה הראשונה.",
          stateEffect: { latency: 150, errorRate: 1, cpuPercent: 42, costPerMonth: 3400, stability: "healthy", throughput: 740, dbLoad: 45, queueDepth: 50 }
        }
      ]
    },
    rolled_back: {
      id: "rolled_back",
      timeDelta: "3 minutes later. Rollback complete.",
      timeDeltaHe: "3 דקות מאוחר יותר. חזרה לאחור הושלמה.",
      context: "Rollback successful. payment-service is stable on the previous version with connection-pool v2.2.0. Memory usage is steady at 150Mi per pod, well within the 256Mi limit. Zero restarts in the last 2 minutes. However, the new batch-payments feature that required v2.3.1 is now unavailable. The product team is asking when it will be back - it was promised to a key enterprise client for Black Friday.",
      contextHe: "חזרה לאחור הצליחה. payment-service יציב על הגרסה הקודמת עם connection-pool v2.2.0. צריכת זיכרון יציבה ב-150Mi לכל pod, בתוך מגבלת 256Mi. אפס אתחולים ב-2 הדקות האחרונות. אבל פיצ'ר batch-payments החדש שדרש v2.3.1 כרגע לא זמין. צוות המוצר שואל מתי הוא יחזור - הוא הובטח ללקוח ארגוני מרכזי ל-Black Friday.",
      question: "Service is stable but batch-payments feature is disabled. What is your next move?",
      questionHe: "השירות יציב אבל פיצ'ר batch-payments מושבת. מה הצעד הבא שלך?",
      alerts: [
        { type: "resolved", source: "Kubernetes", text: "payment-svc pods healthy, 0 restarts in last 5 minutes", textHe: "pods של payment-svc בריאים, 0 אתחולים ב-5 דקות אחרונות" },
        { type: "warning", source: "Product", text: "Feature flag: batch-payments disabled after rollback", textHe: "Feature flag: batch-payments מושבת אחרי חזרה לאחור" }
      ],
      options: [
        {
          text: "Investigate v2.3.1 memory leak, fix maxPoolSize config, re-deploy with fix",
          textHe: "חקור דליפת זיכרון ב-v2.3.1, תקן הגדרת maxPoolSize, פרוס מחדש עם תיקון",
          nextStep: "end_proper_rollback",
          impact: { performance: 15, cost: 0, reliability: 15 },
          operationalComplexity: 25,
          tag: "Root cause + re-deploy",
          tagHe: "שורש הבעיה + פריסה מחדש",
          explanation: "Problem: The v2.3.1 library has no maxPoolSize check so connections cache without limit. Solution: Set maxPoolSize=20 to cap it, verify stable 180Mi usage in staging, then re-deploy. Why this works: You follow the right pattern: stabilize first, diagnose offline, fix, and re-deploy within 1-2 hours.",
          explanationHe: "כשהשירות יציב, אפשר עכשיו לחקור בבטחה. קריאת קוד המקור של v2.3.1 חושפת ששכבת ה-caching החדשה חסרה בדיקת maxPoolSize. הגדרת maxPoolSize=20 בתצורת האפליקציה דורסת את ברירת המחדל של הספרייה ומגבילה connection caching. בדיקה ב-staging מאשרת שהזיכרון נשאר יציב ב-180Mi. פריסה מחדש עם התיקון משחזרת batch-payments תוך 1-2 שעות.",
          stateEffect: { latency: 130, errorRate: 0, cpuPercent: 40, costPerMonth: 2800, stability: "healthy", throughput: 780, dbLoad: 42, queueDepth: 0 }
        },
        {
          text: "Keep rolled back version, schedule fix for next sprint",
          textHe: "השאר גרסה מוחזרת, תזמן תיקון לספרינט הבא",
          nextStep: "end_deferred",
          impact: { performance: 0, cost: 0, reliability: 5 },
          operationalComplexity: 5,
          tag: "Deferred fix",
          tagHe: "תיקון נדחה",
          explanation: "Problem: The root cause is not fixed and batch-payments stays blocked for an enterprise client. What happened: You chose to defer the investigation to the next sprint. Why this is risky: Someone will eventually retry the upgrade without understanding why it failed, and the 2-week delay costs more in lost trust than a controlled fix would.",
          explanationHe: "השירות יציב ותעבורת Black Friday מטופלת. דחיית החקירה לספרינט הבא נמנעת מסיכון של פריסה נוספת במהלך תעבורת שיא. אבל פיצ'ר batch-payments חסום ללקוח הארגוני, והחוב הטכני של באג ספרייה לא פתור נשאר. צוות המוצר יעלה את זה. הבקלוג של הספרינט ידחה את זה בעדיפות. שבועיים מאוחר יותר, מישהו ינסה v2.3.2 בלי להבין למה v2.3.1 נכשל.",
          stateEffect: { latency: 150, errorRate: 0, cpuPercent: 42, costPerMonth: 2800, stability: "healthy", throughput: 750, dbLoad: 45, queueDepth: 0 }
        },
        {
          text: "Upgrade to v2.3.2 hoping the leak was fixed upstream",
          textHe: "שדרג ל-v2.3.2 בתקווה שהדליפה תוקנה ב-upstream",
          nextStep: "end_version_roulette",
          impact: { performance: -5, cost: 0, reliability: -10 },
          operationalComplexity: 40,
          tag: "Version roulette",
          tagHe: "רולטה של גרסאות",
          explanation: "Problem: You deployed an untested library version during Black Friday with no idea if the leak is fixed. What happened: If v2.3.2 has the same leak or a new bug, you are back in CrashLoopBackOff during peak hours. Why this failed: Production deploys should never rely on luck. Test in staging first and deploy during a maintenance window.",
          explanationHe: "פריסת גרסה לא נבדקת במהלך תעבורת Black Friday היא הימור בסיכון גבוה. v2.3.2 עשויה או לא עשויה לתקן את דליפת הזיכרון - בלי לקרוא changelog, לבדוק diff, או לבדוק ב-staging, אתה פורס בעיוורון. אם ל-v2.3.2 יש את אותה דליפה (או באג אחר), אתה חוזר ל-CrashLoopBackOff בשעות שיא. מערכות ייצור לעולם לא צריכות להסתמך על מזל.",
          stateEffect: { latency: 400, errorRate: 20, cpuPercent: 75, costPerMonth: 2800, stability: "critical", throughput: 380, dbLoad: 78, queueDepth: 1800 }
        }
      ]
    },
    scaled_hpa: {
      id: "scaled_hpa",
      timeDelta: "5 minutes later. HPA scaled to 15 replicas.",
      timeDeltaHe: "5 דקות מאוחר יותר. HPA הורחב ל-15 replicas.",
      context: "15 replicas are now running, but all are experiencing OOM kills. Instead of 3 crash-looping pods, you now have 11 crash-looping pods. The Cluster Autoscaler has provisioned 3 additional nodes to schedule the new pods, adding $800/day in compute cost. Each pod goes through the same cycle: start, grow to 248Mi, get killed. The additional pods are generating 3x more load on the database connection pool.",
      contextHe: "15 replicas עכשיו רצים, אבל כולם חווים OOM kills. במקום 3 pods שמתרסקים בלולאה, עכשיו יש 11 pods שמתרסקים בלולאה. Cluster Autoscaler הקצה 3 nodes נוספים לתזמון ה-pods החדשים, מה שמוסיף $800 ליום בעלויות חישוב. כל pod עובר את אותו מחזור: התחלה, גדילה ל-248Mi, הריגה. ה-pods הנוספים מייצרים פי 3 יותר עומס על connection pool של ה-DB.",
      question: "More pods made the situation worse. 11 of 15 pods are crash-looping and costs are spiking. What now?",
      questionHe: "יותר pods החמירו את המצב. 11 מתוך 15 pods מתרסקים בלולאה והעלויות זינקו. מה עכשיו?",
      alerts: [
        { type: "critical", source: "Kubernetes", text: "11 of 15 pods in CrashLoopBackOff", textHe: "11 מתוך 15 pods ב-CrashLoopBackOff" },
        { type: "critical", source: "Cluster Autoscaler", text: "3 new m5.large nodes provisioned to schedule pending pods", textHe: "3 nodes חדשים מסוג m5.large הוקצו לתזמון pods ממתינים" },
        { type: "warning", source: "FinOps", text: "Estimated cost spike: +$800/day from additional nodes", textHe: "עליית עלות משוערת: +$800 ליום מ-nodes נוספים" }
      ],
      options: [
        {
          text: "Stop scaling, check pod logs to find the OOM root cause",
          textHe: "הפסק להרחיב, בדוק לוגים של pods כדי למצוא שורש בעיית OOM",
          nextStep: "end_late_diagnosis",
          impact: { performance: 5, cost: -5, reliability: 5 },
          operationalComplexity: 10,
          tag: "Late recovery",
          tagHe: "התאוששות מאוחרת",
          explanation: "Problem: You spent 5 minutes scaling horizontally, which cost $800/day in nodes and flooded the database connection pool. What happened: OOM is a per-pod issue, so adding replicas just multiplied the failures. Why this works now: Checking logs finally reveals the connection-pool v2.3.1 leak. Always diagnose the crash reason before scaling.",
          explanationHe: "עדיף מאוחר מאשר אף פעם. הקטנת HPA ובדיקת לוגים יחשפו את אותה דליפת זיכרון של connection-pool v2.3.1. 5 הדקות שהוצאו על הרחבה אופקית עלו $800 ליום ב-nodes והחמירו את התקלה על ידי הצפת connection pool של ה-DB. הלקח: כש-pods נהרגים ב-OOM, הבעיה היא לכל pod, לא ברמת הקלאסטר.",
          stateEffect: { latency: 300, errorRate: 15, cpuPercent: 70, costPerMonth: 3600, stability: "degraded", throughput: 450, dbLoad: 75, queueDepth: 1500 }
        },
        {
          text: "Increase memory limits to 1Gi across all 15 pods",
          textHe: "העלה מגבלות זיכרון ל-1Gi על פני כל 15 ה-pods",
          nextStep: "end_expensive_scale",
          impact: { performance: 5, cost: -25, reliability: 0 },
          operationalComplexity: 45,
          tag: "Expensive scaling",
          tagHe: "הרחבה יקרה",
          explanation: "Problem: 15 pods at 1Gi each needs 15Gi of memory and bigger nodes, costing about $2,000/day. What happened: The leak is still there so all pods crash after 25 minutes anyway, creating a repeating cost spiral. Why this failed: Without fixing the library bug, the autoscaler just keeps adding nodes every time pods restart.",
          explanationHe: "15 pods ב-1Gi כל אחד דורש 15Gi של זיכרון - ככל הנראה דורש שדרוג nodes ל-m5.xlarge או גדול יותר. העלות מצטברת: 15 pods גדולים על nodes גדולים יותר, ודליפת הזיכרון גורמת לכולם להתרסק אחרי 25 דקות בערך בכל מקרה. אתה מוציא כ-$2,000 ליום על חישוב לבעיה שנגרמת מבאג בספרייה.",
          stateEffect: { latency: 220, errorRate: 10, cpuPercent: 82, costPerMonth: 5800, stability: "degraded", throughput: 500, dbLoad: 85, queueDepth: 900 }
        },
        {
          text: "Rollback the deployment immediately",
          textHe: "חזור לגרסה קודמת מיד",
          nextStep: "end_panic_rollback",
          impact: { performance: 5, cost: -5, reliability: 5 },
          operationalComplexity: 10,
          tag: "Panic rollback",
          tagHe: "חזרה בפאניקה",
          explanation: "Problem: The 5-minute detour into horizontal scaling added $800/day in nodes and hammered the database with 15 crash-looping pods. What happened: The outage got worse and the extra nodes will sit idle for 10+ minutes before the autoscaler removes them. Why this is late: Rolling back is the right call, but doing it first would have fixed everything in 90 seconds.",
          explanationHe: "חזרה לאחור אחרי הרחבה ל-15 pods והקצאת 3 nodes חדשים היא הקריאה הנכונה, אבל הנזק כבר נעשה. הסטייה של 5 דקות להרחבה אופקית הוסיפה $800 ליום בעלויות nodes, הגדילה עומס DB מסערות החיבורים של 15 pods מתרסקים, והאריכה את משך התקלה. החזרה עצמה תיקח 2-3 דקות ל-15 pods. ה-nodes הנוספים יישארו 10+ דקות לפני שה-autoscaler יקטין.",
          stateEffect: { latency: 200, errorRate: 5, cpuPercent: 50, costPerMonth: 3600, stability: "degraded", throughput: 600, dbLoad: 55, queueDepth: 500 }
        }
      ]
    },
    end_optimal: {
      id: "end_optimal",
      context: "Connection pool library pinned to v2.2.0, maxPoolSize set to 20, memory limit raised to 512Mi as safety buffer. Payment service stable at 180Mi usage. HPA scales cleanly under Black Friday traffic. Zero restarts in 24 hours. Batch-payments feature re-enabled after confirming maxPoolSize config caps the leak. Upstream bug report filed for v2.3.1.",
      contextHe: "ספריית connection pool ננעלה ל-v2.2.0, maxPoolSize הוגדר ל-20, מגבלת זיכרון הועלתה ל-512Mi כמרווח בטיחות. payment-service יציב בצריכת 180Mi. HPA מרחיב בצורה נקייה תחת תעבורת Black Friday. אפס אתחולים ב-24 שעות. פיצ'ר batch-payments הופעל מחדש אחרי אישור שהגדרת maxPoolSize מגבילה את הדליפה. דוח באג ל-upstream נפתח עבור v2.3.1.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_hpa_bandaid: {
      id: "end_hpa_bandaid",
      context: "Memory-based HPA triggers pod cycling when memory hits 80% (204Mi). Pods still leak memory and restart every 10 minutes. Service handles traffic but with periodic 30-second gaps during pod restarts. Payment transactions are occasionally dropped during restart windows. Black Friday revenue impacted by an estimated 5% due to intermittent failures.",
      contextHe: "HPA מבוסס זיכרון מפעיל מחזור pods כשהזיכרון מגיע ל-80% (204Mi). Pods עדיין דולפים זיכרון ומאותחלים כל 10 דקות. השירות מטפל בתעבורה אבל עם פערים תקופתיים של 30 שניות במהלך אתחולי pods. טרנזקציות תשלום נופלות לפעמים במהלך חלונות אתחול. הכנסות Black Friday נפגעו בכ-5% עקב כשלים מזדמנים.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_restart_loop: {
      id: "end_restart_loop",
      context: "CronJob restarts pods every 5 minutes. Memory never reaches OOM threshold but connection state is lost on each restart. Customers experience dropped transactions every 5 minutes. Payment confirmation emails are delayed or missing. Monitoring dashboards show a sawtooth memory pattern that masks the underlying leak. The on-call engineer next week will inherit this CronJob and have no context on why it exists.",
      contextHe: "CronJob מאתחל pods כל 5 דקות. הזיכרון לעולם לא מגיע לסף OOM אבל מצב החיבורים אובד בכל אתחול. לקוחות חווים טרנזקציות שנופלות כל 5 דקות. מיילי אישור תשלום מתעכבים או חסרים. לוחות ניטור מראים דפוס זיכרון שיניים שמסתיר את הדליפה הבסיסית. מהנדס התורנות בשבוע הבא יירש את ה-CronJob הזה ללא הקשר למה הוא קיים.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_profiled: {
      id: "end_profiled",
      context: "Memory profiling identified the connection-pool v2.3.1 leak after 10 minutes of analysis. Fixed with maxPoolSize=20 and pinned to v2.2.0. Good outcome but 30 minutes of degraded service elapsed while increasing memory limits and then profiling. Queue backlog of 2,400 payment events had to be reprocessed. No data loss, but customers experienced delays.",
      contextHe: "Memory profiling זיהה את דליפת connection-pool v2.3.1 אחרי 10 דקות ניתוח. תוקן עם maxPoolSize=20 ונעילה ל-v2.2.0. תוצאה טובה אבל 30 דקות של שירות מופחת עברו במהלך הגדלת מגבלות זיכרון ואז profiling. עומס תור של 2,400 אירועי תשלום נדרש לעיבוד מחדש. ללא אובדן נתונים, אבל לקוחות חוו עיכובים.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_expensive_fix: {
      id: "end_expensive_fix",
      context: "2Gi memory limit delays the OOM but pods crash after 45 minutes when memory reaches 2Gi. The cycle repeats throughout Black Friday. Cluster Autoscaler provisioned m5.xlarge nodes to fit the 2Gi pods, increasing monthly compute cost by $2,400. The root cause was never identified during the event. A post-mortem two weeks later found the connection-pool v2.3.1 leak. The $2,400/month cost increase ran for 3 weeks before anyone noticed and scaled back down.",
      contextHe: "מגבלת זיכרון 2Gi מעכבת את ה-OOM אבל pods מתרסקים אחרי 45 דקות כשהזיכרון מגיע ל-2Gi. המחזור חוזר לאורך כל Black Friday. Cluster Autoscaler הקצה nodes מסוג m5.xlarge כדי להכיל pods עם 2Gi, מה שהעלה עלות חישוב חודשית ב-$2,400. שורש הבעיה לא אובחן במהלך האירוע. Post-mortem שבועיים מאוחר יותר מצא את דליפת connection-pool v2.3.1. עליית העלות של $2,400 לחודש רצה 3 שבועות לפני שמישהו שם לב והקטין.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_proper_rollback: {
      id: "end_proper_rollback",
      context: "Rolled back first to stabilize, then diagnosed the connection-pool v2.3.1 memory leak offline. Re-deployed with v2.2.0 pinned, maxPoolSize=20 configured, and memory limit at 512Mi within 2 hours. Batch-payments feature restored by afternoon. Good incident response: stabilize, diagnose, fix, re-deploy. Total downtime: 5 minutes. Total degraded service: 0 after rollback.",
      contextHe: "חזרה לאחור קודם לייצוב, ואז אבחון דליפת הזיכרון של connection-pool v2.3.1 אופליין. פריסה מחדש עם v2.2.0 נעול, maxPoolSize=20 מוגדר, ומגבלת זיכרון ב-512Mi תוך שעתיים. פיצ'ר batch-payments שוחזר עד אחר הצהריים. תגובת אירוע טובה: ייצוב, אבחון, תיקון, פריסה מחדש. זמן השבתה כולל: 5 דקות. שירות מופחת: 0 אחרי חזרה לאחור.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_late_rollback: {
      id: "end_late_rollback",
      context: "Eventually rolled back after 20 minutes of degraded service and an unnecessary memory increase to 1Gi. Service is now stable on the previous version. However, 45+ minutes of total incident time elapsed. Approximately 1,800 orders experienced delays or failures. The $600 in extra node costs from the 1Gi memory increase will persist until someone remembers to revert the resource limits.",
      contextHe: "בסופו של דבר חזרה לאחור אחרי 20 דקות של שירות מופחת והגדלת זיכרון מיותרת ל-1Gi. השירות עכשיו יציב על הגרסה הקודמת. אבל 45+ דקות של זמן תקרית כולל חלפו. כ-1,800 הזמנות חוו עיכובים או כשלים. $600 בעלויות nodes נוספות מהגדלת הזיכרון ל-1Gi יימשכו עד שמישהו יזכור להחזיר את מגבלות המשאבים.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_deferred: {
      id: "end_deferred",
      context: "Service is stable on the old version throughout Black Friday. No further incidents. However, the batch-payments feature is blocked for 2 weeks until the next sprint picks up the investigation. The enterprise client was informed and is considering alternatives. A technical debt ticket was created but deprioritized twice before being addressed. When the team finally investigated, they found the fix (maxPoolSize=20) would have taken 15 minutes.",
      contextHe: "השירות יציב על הגרסה הישנה לאורך כל Black Friday. ללא תקריות נוספות. אבל פיצ'ר batch-payments חסום למשך שבועיים עד שהספרינט הבא ייקח את החקירה. הלקוח הארגוני עודכן ושוקל חלופות. כרטיס חוב טכני נוצר אבל נדחה פעמיים בעדיפות לפני שטופל. כשהצוות סוף סוף חקר, גילו שהתיקון (maxPoolSize=20) היה לוקח 15 דקות.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_version_roulette: {
      id: "end_version_roulette",
      context: "Deployed v2.3.2 during Black Friday traffic. The new version fixed the connection caching leak but introduced a connection timeout regression - connections now timeout after 5 seconds instead of 30. Under high load, payment processing calls that take 6-8 seconds to external payment gateways are being terminated. Error rate spiked to 35% before the team identified the new issue and rolled back to v2.2.0. Total incident time: 25 minutes of cascading failures across two bad deployments.",
      contextHe: "פרסו v2.3.2 במהלך תעבורת Black Friday. הגרסה החדשה תיקנה את דליפת connection caching אבל הציגה רגרסיה של connection timeout - חיבורים עכשיו עושים timeout אחרי 5 שניות במקום 30. תחת עומס גבוה, קריאות עיבוד תשלום שלוקחות 6-8 שניות לשערי תשלום חיצוניים מנותקות. שיעור שגיאות זינק ל-35% לפני שהצוות זיהה את הבעיה החדשה וחזר ל-v2.2.0. זמן תקרית כולל: 25 דקות של כשלים מדורגים על פני שתי פריסות גרועות.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_expensive_scale: {
      id: "end_expensive_scale",
      context: "15 pods running at 1Gi each on m5.xlarge nodes. Memory leak continues - all pods crash simultaneously after 25 minutes, causing a full service outage for 90 seconds while they restart. This cycle repeated 24 times during Black Friday. Each cycle caused ~50 failed payment transactions. Total: 1,200 failed transactions, $2,000/day in unnecessary compute costs, and a post-mortem that identified the connection-pool library as the root cause within 5 minutes of investigation.",
      contextHe: "15 pods רצים ב-1Gi כל אחד על nodes מסוג m5.xlarge. דליפת הזיכרון ממשיכה - כל ה-pods מתרסקים בו-זמנית אחרי 25 דקות, וגורמים להשבתה מלאה של 90 שניות בזמן שהם מאותחלים. מחזור זה חזר 24 פעמים במהלך Black Friday. כל מחזור גרם ל-50 טרנזקציות תשלום כושלות. סה\"כ: 1,200 טרנזקציות כושלות, $2,000 ליום בעלויות חישוב מיותרות, ו-post-mortem שזיהה את ספריית connection-pool כשורש הבעיה תוך 5 דקות חקירה.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_late_diagnosis: {
      id: "end_late_diagnosis",
      context: "After scaling to 15 pods and wasting 5 minutes (plus $800/day in node costs), logs revealed the connection-pool v2.3.1 memory leak. Rolled back to v2.2.0 and scaled HPA back to 5 replicas. Service stabilized 12 minutes after the initial alert. The extra nodes took 15 minutes to be reclaimed by the autoscaler. Total impact: 12 minutes of degraded service, $800 in unnecessary infrastructure costs, and 450 failed payment transactions during the extended outage.",
      contextHe: "אחרי הרחבה ל-15 pods ובזבוז 5 דקות (בתוספת $800 ליום בעלויות nodes), הלוגים חשפו את דליפת הזיכרון של connection-pool v2.3.1. חזרה ל-v2.2.0 והקטנת HPA בחזרה ל-5 replicas. השירות התייצב 12 דקות אחרי ההתראה הראשונית. ה-nodes הנוספים לקחו 15 דקות להשתחרר על ידי ה-autoscaler. השפעה כוללת: 12 דקות שירות מופחת, $800 בעלויות תשתית מיותרות, ו-450 טרנזקציות תשלום כושלות.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    },
    end_panic_rollback: {
      id: "end_panic_rollback",
      context: "Eventually rolled back after scaling to 15 pods, provisioning 3 extra nodes, and 10 minutes of worsening outage. Service stabilized on v2.2.0 after a total of 15 minutes of degraded-to-critical service. 11 crash-looping pods generated thousands of container restart events that flooded the monitoring system. $800 in unnecessary node costs. 600+ failed payment transactions. The post-mortem identified that a simple kubectl rollout undo at minute 1 would have resolved the incident in 90 seconds.",
      contextHe: "בסופו של דבר חזרה לאחור אחרי הרחבה ל-15 pods, הקצאת 3 nodes נוספים, ו-10 דקות של תקלה מחמירה. השירות התייצב על v2.2.0 אחרי סה\"כ 15 דקות של שירות מופחת-עד-קריטי. 11 pods מתרסקים יצרו אלפי אירועי אתחול container שהציפו את מערכת הניטור. $800 בעלויות nodes מיותרות. 600+ טרנזקציות תשלום כושלות. ה-post-mortem זיהה ש-kubectl rollout undo פשוט בדקה 1 היה פותר את התקרית ב-90 שניות.",
      question: null,
      options: [],
      rootCause: "The payment-service pod was OOM-killed due to a memory leak in the connection pool library (v2.3.1). The library introduced unbounded connection caching that caused heap to grow without limit. The pod's 256Mi memory limit was insufficient after the library upgrade.",
      rootCauseHe: "ה-pod של payment-service נהרג ב-OOM עקב דליפת זיכרון בספריית connection pool (v2.3.1). הספרייה הציגה connection caching בלתי מוגבל שגרם ל-heap לגדול ללא הגבלה. מגבלת הזיכרון של 256Mi של ה-pod לא הספיקה אחרי שדרוג הספרייה.",
      productionSolution: "Pin connection-pool library to v2.2.0, configure maxPoolSize=20 to prevent unbounded growth, increase memory limit to 512Mi as safety margin, add memory-based HPA at 80% threshold, and file upstream bug report for v2.3.1.",
      productionSolutionHe: "נעל ספריית connection-pool ל-v2.2.0, הגדר maxPoolSize=20 למניעת גדילה בלתי מוגבלת, העלה מגבלת זיכרון ל-512Mi כמרווח בטיחות, הוסף HPA מבוסס זיכרון בסף 80%, ופתח דוח באג ל-upstream עבור v2.3.1."
    }
  }
};
