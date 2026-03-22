// ── Scenario 3: Misconfigured Load Balancer ────────────────────────────────

export default {
  id: "lb-misconfigured",
  title: "The Mysterious 502 Errors",
  titleHe: "שגיאות 502 המסתוריות",
  description: "Users report intermittent 502 errors. Your monitoring shows everything green. Find the misconfiguration before the CEO's demo in 2 hours.",
  descriptionHe: "משתמשים מדווחים על שגיאות 502 לסירוגין. הניטור שלך מראה הכל ירוק. מצא את התצורה השגויה לפני הדמו של ה-CEO בעוד שעתיים.",
  difficulty: "easy",
  order: 1,
  estimatedTime: "4-6 min",
  tags: ["Kubernetes", "Ingress", "Load Balancer", "Debugging"],
  icon: "🔍",
  initialMetrics: { performance: 50, cost: 50, reliability: 50 },
  initialSystemState: {
    latency: 180,
    errorRate: 15,
    cpuPercent: 28,
    connections: "45/200",
    maxConnections: 200,
    costPerMonth: 1200,
    stability: "degraded",
    timeRemaining: "2h 00m"
  },
  steps: {
    start: {
      id: "start",
      context: "Your application runs on EKS with an ALB Ingress Controller. Users report ~15% of requests return 502 Bad Gateway. CloudWatch ALB metrics show intermittent 5xx errors. But all pods are Running, health checks pass, and application logs show no errors. The CEO has a live demo for investors in 2 hours.",
      contextHe: "האפליקציה שלך רצה על EKS עם ALB Ingress Controller. משתמשים מדווחים ש-15% מהבקשות מחזירות 502 Bad Gateway. CloudWatch ALB metrics מראים שגיאות 5xx לסירוגין. אבל כל ה-pods במצב Running, בדיקות תקינות עוברות, ולוגי האפליקציה לא מראים שגיאות. ל-CEO יש דמו חי למשקיעים בעוד שעתיים.",
      question: "Where do you start investigating?",
      questionHe: "מאיפה מתחילים לחקור?",
      alerts: [
        { type: "warning", source: "CloudWatch", text: "ALB 5xx error rate: 15% - SLA target: <1%", textHe: "שיעור שגיאות 5xx של ALB: 15% - יעד SLA: פחות מ-1%" },
        { type: "info", source: "Kubernetes", text: "Node i-0b7f kernel upgrade available - non-critical", textHe: "שדרוג kernel זמין ל-node i-0b7f - לא קריטי", noise: true },
        { type: "info", source: "CEO", text: "Investor demo in 2 hours - system must be stable", textHe: "דמו למשקיעים בעוד שעתיים - המערכת חייבת להיות יציבה" },
      ],
      logs: [
        { level: "info", timestamp: "10:15:20", text: "kubelet: certificate rotation completed on node i-0b7f2a", noise: true },
        { level: "error", timestamp: "10:15:23", text: "ALB: 502 Bad Gateway - target 10.0.3.47:8080 response: 0 bytes, 0ms" },
        { level: "info", timestamp: "10:15:23", text: "ALB: 200 OK - target 10.0.3.52:8080 response: 2.4KB, 45ms" },
        { level: "error", timestamp: "10:15:22", text: "ALB: 502 Bad Gateway - target 10.0.3.47:8080 response: 0 bytes, 0ms" },
      ],
      options: [
        {
          text: "Check ALB target group health and registration status",
          textHe: "בדוק את תקינות target group של ALB ומצב הרישום",
          nextStep: "target_group",
          impact: { performance: 5, cost: 0, reliability: 5 },
          tag: "Infrastructure-layer investigation",
          tagHe: "חקירה ברמת תשתית",
          explanation: "Problem: The ALB is sending traffic to pods that no longer exist. What happened: A rolling update replaced pods, but 3 of 8 ALB targets are still in draining state, pointing to old IPs. Why this works: The target group shows exactly which targets are stale, confirming the issue is between the ALB and pods, not in the application itself.",
          explanationHe: "ה-502 קורה כשה-ALB מנתב בקשה ל-target שלא יכול להגיב. מכיוון שה-pods רצים ולוגי האפליקציה נקיים, הבעיה היא בין ה-ALB ל-pods - לא בתוך ה-pods. ה-target group הוא איפה שה-ALB עוקב אחרי אילו backends זמינים. בדיקה חושפת: 3 מתוך 8 targets במצב 'draining' - אלה pods שהוחלפו בעדכון מתגלגל אחרון, אבל ה-ALB לא סיים להסיר אותם מהרוטציה.",
          stateEffect: {}
        },
        {
          text: "Restart all pods to clear any bad state",
          textHe: "הפעל מחדש את כל ה-pods כדי לנקות מצב תקול",
          nextStep: "restart_chaos",
          impact: { performance: -8, cost: 0, reliability: -10 },
          tag: "Amplifies the root cause",
          tagHe: "מגביר את שורש הבעיה",
          explanation: "Problem: Restarting all pods triggers a new rolling update, which is exactly what causes 502s in the first place. What happened: Error rate spiked to 40% because all pods entered the draining/registration cycle at the same time. Why this failed: Fewer healthy targets were available during the restart window, making the root cause worse instead of better.",
          explanationHe: "הפעלה מחדש של כל ה-pods מפעילה עדכון מתגלגל חדש, שיוצר עוד targets במצב 'draining' - בדיוק המנגנון שגורם ל-502. במהלך חלון ה-restart: (1) pods ישנים נכנסים למצב draining ב-ALB (עדיין מקבלים תעבורה), (2) pods חדשים עולים אבל עדיין לא רשומים ב-target group (רישום לוקח 10-30 שניות), (3) לחלון קצר, פחות targets בריאים קיימים. שיעור השגיאות יקפוץ ל-30-40%.",
          stateEffect: {
            errorRate: 40, stability: "critical", timeRemaining: "1h 45m",
            pendingConsequences: [{ triggerAt: "*", effect: { errorRate: 15, stability: "degraded" } }]
          }
        },
        {
          text: "Check application logs for errors",
          textHe: "בדוק את לוגי האפליקציה לשגיאות",
          nextStep: "logs_misleading",
          impact: { performance: 0, cost: 0, reliability: 0 },
          tag: "Reasonable but misdirected",
          tagHe: "סביר אבל לא ממוקד",
          explanation: "Problem: The ALB generates the 502 before the request ever reaches the application. What happened: You checked app logs but found nothing because failing requests never hit the app layer. Why this failed: The 0-byte, 0ms ALB responses confirm targets are unreachable at the TCP level, which is an infrastructure routing issue, not an application bug.",
          explanationHe: "לוגי האפליקציה נקיים כי ה-502 נוצר ע\"י ה-ALB, לא האפליקציה. ה-pods שכן מקבלים תעבורה מגיבים נכון - הבעיה היא ש-15% מהתעבורה מנותבת ל-pods שכבר לא קיימים או נסגרים. בקשות אלה מעולם לא מגיעות לשכבת האפליקציה, כך שלא נוצר רישום לוג. גודל תגובה 0-byte בלוגי הגישה של ALB מאשר - ה-ALB לא קיבל גוף תגובה מה-target.",
          stateEffect: {}
        },
        {
          text: "Scale up to more pods to handle the load",
          textHe: "הגדל את מספר ה-pods כדי לטפל בעומס",
          nextStep: "scale_wrong",
          impact: { performance: 0, cost: -5, reliability: -3 },
          tag: "Misidentified constraint",
          tagHe: "אילוץ שזוהה בטעות",
          explanation: "Problem: The 502 errors come from ALB routing to terminated pods, not from lack of capacity. What happened: Scaling from 8 to 12 pods added cost but the error rate stayed at 15% because existing pods were only at 30% CPU. Why this failed: More pods do not fix the timing mismatch between ALB deregistration and pod termination, so every future deployment still produces 502s.",
          explanationHe: "שגיאות 502 לא נגרמות מחוסר קיבולת - pods קיימים ב-פחות מ-30% CPU. הגדלה יוצרת pods חדשים, שמפעילים רישום target ב-ALB (10-30 שניות חימום). ברגע שנרשמו, ה-pods החדשים עובדים. אבל שורש הבעיה (ALB מנתב ל-pods ב-draining/terminated) נמשך בכל פריסה עתידית. אתה מוסיף קיבולת לבעיה שאינה קשורה לקיבולת.",
          stateEffect: { costPerMonth: 1800, timeRemaining: "1h 50m" }
        }
      ]
    },
    target_group: {
      id: "target_group",
      timeDelta: "10 minutes into investigation. 1h 50m until demo.",
      timeDeltaHe: "10 דקות לתוך החקירה. שעה ו-50 דקות עד הדמו.",
      context: "Target group inspection reveals the mismatch: ALB deregistration delay is set to 300s (5 minutes) - the AWS default. But your pod terminationGracePeriodSeconds is only 30s. When a rolling update replaces a pod: Kubernetes terminates the old pod after 30s, but the ALB continues routing traffic to its IP for another 270s. During that 4.5-minute gap, every request routed to the terminated pod's IP gets no response → 502.",
      contextHe: "בדיקת target group חושפת את חוסר ההתאמה: עיכוב הסרת הרישום של ALB מוגדר ל-300 שניות (5 דקות) - ברירת מחדל של AWS. אבל ה-terminationGracePeriodSeconds של ה-pod הוא רק 30 שניות. כשעדכון מתגלגל מחליף pod: Kubernetes סוגר את ה-pod הישן אחרי 30 שניות, אבל ה-ALB ממשיך לנתב תעבורה ל-IP שלו עוד 270 שניות. בפער של 4.5 דקות, כל בקשה ל-IP של ה-pod שנסגר לא מקבלת תגובה ← 502.",
      question: "You identified a 4.5-minute gap where the ALB routes to terminated pods. What's the proper fix?",
      questionHe: "זיהית פער של 4.5 דקות שבו ה-ALB מנתב ל-pods שנסגרו. מה התיקון הנכון?",
      alerts: [
        { type: "critical", source: "ALB", text: "3/8 targets in DRAINING state - deregistration delay: 300s, pod termination: 30s", textHe: "3/8 targets במצב DRAINING - עיכוב הסרת רישום: 300s, סגירת pod: 30s" },
        { type: "info", source: "WAF", text: "AWS WAF: 12 blocked requests in last hour (bot traffic, normal)", textHe: "AWS WAF: 12 בקשות חסומות בשעה האחרונה (תעבורת בוטים, נורמלי)", noise: true },
        { type: "info", source: "Investigation", text: "Root cause: 4.5 minute gap where ALB routes to terminated pods", textHe: "שורש הבעיה: פער של 4.5 דקות שבו ALB מנתב ל-pods שנסגרו" },
      ],
      options: [
        {
          text: "Add a preStop hook with sleep + align deregistration delay with pod lifecycle",
          textHe: "הוסף preStop hook עם sleep + התאם עיכוב הסרת רישום עם מחזור חיי pod",
          nextStep: "end_proper_fix",
          impact: { performance: 12, cost: 0, reliability: 22 },
          tag: "Production-grade lifecycle alignment",
          tagHe: "התאמת מחזור חיים ברמת ייצור",
          explanation: "Problem: There is a 4.5-minute gap where the ALB sends traffic to pods Kubernetes already killed. What happened: The ALB deregistration delay was 300s but pods terminated after 30s. Why this works: The preStop hook keeps the pod alive for 15 extra seconds while ALB drains, and reducing deregistration delay to 30s closes the timing gap completely. Zero 502s during rolling updates.",
          explanationHe: "התיקון בשני חלקים: (1) הוסף preStop lifecycle hook עם sleep 15 - זה שומר את תהליך ה-pod חי 15 שניות אחרי ש-Kubernetes שולח SIGTERM, מאפשר לבקשות בטיסה להסתיים ול-ALB להפסיק לנתב בקשות חדשות. (2) הגדר עיכוב הסרת רישום ALB ל-30 שניות (תואם ל-terminationGracePeriodSeconds) - כך ה-ALB מפסיק לנתב באותו חלון שה-pod עדיין חי. אין פער, אין 502. זו התבנית המומלצת ע\"י AWS לשירותי EKS מאחורי ALB.",
          stateEffect: { errorRate: 0, stability: "healthy", latency: 150 }
        },
        {
          text: "Just reduce ALB deregistration delay to 0",
          textHe: "פשוט הפחת את עיכוב הסרת הרישום של ALB ל-0",
          nextStep: "end_quick_fix",
          impact: { performance: 5, cost: 0, reliability: 5 },
          tag: "Trades one issue for another",
          tagHe: "מחליף בעיה אחת באחרת",
          explanation: "Problem: Setting deregistration delay to 0 stops 502s but kills all in-flight connections instantly. What happened: Users mid-request during deployments got connection resets, and one user lost their cart during checkout. Why this failed: With no drain window, the ALB drops active requests instead of finishing them, trading 502s for a worse class of error.",
          explanationHe: "הגדרת deregistration ל-0 מסירה מיידית targets מרוטציית ALB כשסגירת pod מתחילה - מבטלת את פער 4.5 הדקות ועוצרת את ה-502. אבל, deregistration delay = 0 אומר שחיבורים פעילים באמצע טיסה נקטעים ללא המתנה. אם משתמש באמצע checkout כשפריסה קורה, בקשת POST שלו נקטעת. תראה שגיאות connection reset במקום 502 - פחות תכופות (רק בזמן פריסות), אבל משפיעות יותר (פוטנציאל אובדן נתונים).",
          stateEffect: { errorRate: 0, stability: "degraded", latency: 170 }
        },
        {
          text: "Increase terminationGracePeriodSeconds to 300s to match ALB",
          textHe: "הגדל terminationGracePeriodSeconds ל-300 שניות כדי להתאים ל-ALB",
          nextStep: "end_slow_deployments",
          impact: { performance: 5, cost: -3, reliability: 8 },
          tag: "Correct direction, wrong magnitude",
          tagHe: "כיוון נכון, סדר גודל שגוי",
          explanation: "Problem: Setting terminationGracePeriodSeconds to 300s fixes 502s but makes every pod take 5 minutes to shut down. What happened: Rolling updates of 8 pods now take 42 minutes, and rollbacks are just as slow. Why this failed: You should reduce the ALB delay to match the pod lifecycle, not inflate the pod lifecycle to match the ALB default. Both values should be small and aligned with a preStop hook.",
          explanationHe: "הגדלת terminationGracePeriodSeconds ל-300 שניות שומרת את ה-pod חי לכל חלון הסרת הרישום של ALB - מתקנת את ה-502. אבל עכשיו כל pod לוקח 5 דקות להיסגר בעדכונים מתגלגלים. פריסה של 8 pods עם maxUnavailable=1 לוקחת 40+ דקות. CI/CD מואט. Rollbacks בתקריות לוקחים 40 דקות במקום 4. הגישה הנכונה היא להפחית את עיכוב ALB ל-30 שניות ולהוסיף preStop hook.",
          stateEffect: { errorRate: 0, stability: "healthy", latency: 160 }
        }
      ]
    },
    restart_chaos: {
      id: "restart_chaos",
      timeDelta: "15 minutes later. Restart completed, errors settling.",
      timeDeltaHe: "15 דקות מאוחר יותר. Restart הושלם, שגיאות מתייצבות.",
      newIssues: [
        { text: "Error rate spiked to 40% during restart - active user sessions disrupted", textHe: "שיעור שגיאות קפץ ל-40% בזמן restart - סשנים פעילים של משתמשים הופרעו" },
      ],
      context: "502 rate spiked to 40% for 3 minutes during the restart as all pods simultaneously entered the draining/registration cycle. Now it's back to the original 15%. The restart confirmed the problem is related to pod lifecycle transitions, but didn't fix it. You've lost 15 minutes and caused a brief incident spike. 1 hour 45 minutes until the demo.",
      contextHe: "שיעור 502 קפץ ל-40% ל-3 דקות במהלך ההפעלה מחדש כשכל ה-pods עברו בו-זמנית את מחזור draining/registration. עכשיו חזרנו ל-15% שגיאות. ההפעלה מחדש אישרה שהבעיה קשורה למעברי מחזור חיי pod, אבל לא תיקנה. איבדת 15 דקות וגרמת לקפיצת שגיאות קצרה. שעה ו-45 דקות עד הדמו.",
      question: "The restart spike confirmed the issue is related to pod lifecycle. What's your next step?",
      questionHe: "קפיצת ה-restart אישרה שהבעיה קשורה למחזור חיי pod. מה הצעד הבא?",
      alerts: [
        { type: "critical", source: "CloudWatch", text: "5xx error rate spiked to 40% during pod restart", textHe: "שיעור שגיאות 5xx קפץ ל-40% בזמן restart של pods" },
        { type: "info", source: "CoreDNS", text: "NOERROR api.internal.svc.cluster.local - DNS resolution healthy", textHe: "NOERROR api.internal.svc.cluster.local - רזולוציית DNS תקינה", noise: true },
        { type: "warning", source: "Slack", text: "#incidents: 'Restart made things worse - error rate higher now'", textHe: "#incidents: 'ה-restart החמיר את המצב - שיעור שגיאות גבוה יותר'" },
      ],
      logs: [
        { level: "error", timestamp: "10:32:15", text: "kubectl: pod/api-6f8d4-x7k2p terminated (rolling update)" },
        { level: "warn", timestamp: "10:32:16", text: "ALB: target 10.0.3.47 entering DRAINING state" },
        { level: "warn", timestamp: "10:32:16", text: "ALB: target 10.0.3.51 entering DRAINING state" },
      ],
      options: [
        {
          text: "Investigate ALB target group and pod lifecycle timing",
          textHe: "חקור את target group של ALB ותזמון מחזור חיי pod",
          nextStep: "target_group",
          impact: { performance: 0, cost: 0, reliability: 3 },
          tag: "Signal-driven investigation",
          tagHe: "חקירה מונעת-סיגנלים",
          explanation: "Problem: The 502 spike during restart lined up exactly with pod lifecycle transitions. What happened: You lost 15 minutes but gained a clear signal that the issue is in ALB target management. Why this works: The target group will show the exact timing mismatch between when Kubernetes kills pods and when the ALB stops sending them traffic.",
          explanationHe: "הרמז מההפעלה מחדש חשוב: קפיצת ה-502 מתואמת בדיוק עם מעברי מחזור חיי pod (pods ישנים נסגרים, חדשים עולים). זה מצביע ישירות על מנגנון רישום/הסרת target ב-ALB. ה-target group יראה את חוסר ההתאמה בתזמון.",
          stateEffect: {}
        },
        {
          text: "Set up a canary deployment to avoid full restarts",
          textHe: "הגדר canary deployment כדי להימנע מהפעלות מחדש מלאות",
          nextStep: "end_canary_bandaid",
          impact: { performance: 3, cost: -3, reliability: 3 },
          tag: "Reduces blast radius, not root cause",
          tagHe: "מפחית רדיוס פגיעה, לא שורש בעיה",
          explanation: "Problem: Canary deployment updates 1 pod at a time instead of all 8, but the ALB-to-pod lifecycle mismatch remains. What happened: Error rate dropped from 15% to about 2% per deployment, but 502s still occur on every deploy, scale event, and node rotation. Why this failed: It is a workaround that shrinks the symptom without eliminating the root cause.",
          explanationHe: "Canary deployment אומר שרק pod 1 מתעדכן בכל פעם במקום כל 8 - מפחית את שיעור שגיאות 502 מ-15% ל-2% בערך לכל פריסה (1/8 מה-targets ב-draining). זו אסטרטגיית פריסה טובה יותר באופן כללי, אבל זה מעקף, לא תיקון. כל פריסה, כל אירוע סקיילינג, כל רוטציית node עדיין יפיקו 502 פרופורציונלי למספר ה-pods במעבר.",
          stateEffect: { errorRate: 2, stability: "degraded", timeRemaining: "1h 30m" }
        }
      ]
    },
    logs_misleading: {
      id: "logs_misleading",
      timeDelta: "20 minutes in. App logs reviewed, no errors found.",
      timeDeltaHe: "20 דקות פנימה. לוגי אפליקציה נבדקו, לא נמצאו שגיאות.",
      context: "Application logs are clean - no errors, no timeouts, no crashes. All pods respond normally to health checks. The 502s are invisible from the application's perspective. Checking CloudWatch ALB access logs more carefully, you notice: all 502 responses have 0-byte response body and 0ms backend processing time - the ALB never got a response at all from those targets.",
      contextHe: "לוגי האפליקציה נקיים - אין שגיאות, אין timeouts, אין קריסות. כל ה-pods מגיבים נורמלית לבדיקות תקינות. ה-502 בלתי נראים מנקודת המבט של האפליקציה. בבדיקה מדוקדקת יותר של CloudWatch ALB access logs: כל תגובות 502 עם 0-byte response body ו-0ms backend processing time - ה-ALB מעולם לא קיבל תגובה מה-targets האלה.",
      question: "Application logs are clean, but ALB logs show 0-byte responses from some targets. Where do you look next?",
      questionHe: "לוגי האפליקציה נקיים, אבל לוגי ALB מראים תגובות 0-byte מחלק מה-targets. לאן מסתכלים?",
      alerts: [
        { type: "info", source: "App logs", text: "Application logs: 0 errors - all pods responding normally", textHe: "לוגי אפליקציה: 0 שגיאות - כל ה-pods מגיבים נורמלית" },
      ],
      logs: [
        { level: "warn", timestamp: "10:44:55", text: "kube-scheduler: pod/monitoring-agent-7x2k preempted for higher priority pod", noise: true },
        { level: "info", timestamp: "10:45:00", text: "ALB access log: 502 responses show 0 byte body, 0ms processing time" },
        { level: "info", timestamp: "10:45:00", text: "Implication: target IP unreachable - connection refused at TCP level" },
      ],
      options: [
        {
          text: "Check ALB target group - the issue is between ALB and pods",
          textHe: "בדוק את target group של ALB - הבעיה היא בין ALB ל-pods",
          nextStep: "target_group",
          impact: { performance: 0, cost: 0, reliability: 3 },
          tag: "Deduction from evidence",
          tagHe: "הסקה מראיות",
          explanation: "Problem: The ALB thinks certain target IPs are valid, but no pod is running behind them anymore. What happened: 15% of requests get connection refused at TCP level, producing 0-byte, 0ms responses. Why this works: The target group shows exactly which IPs are stale, directly exposing the deregistration timing mismatch as root cause.",
          explanationHe: "תגובה 0-byte עם 0ms זמן עיבוד אומרת שה-ALB שלח בקשה אבל ה-target מעולם לא אישר - החיבור סורב או עשה timeout ברמת TCP. מכיוון שpods שכן מקבלים תעבורה מגיבים בסדר, הבעיה היא עם כתובות IP ספציפיות שה-ALB חושב שתקפות אבל אינן. ה-target group הוא הרישום שממפה ניתוב ALB לכתובות IP של pods.",
          stateEffect: {}
        },
        {
          text: "Check pod resource limits - maybe pods are OOMKilled",
          textHe: "בדוק resource limits של pods - אולי pods נהרגים ע\"י OOM",
          nextStep: "end_wrong_diagnosis",
          impact: { performance: 0, cost: 0, reliability: -3 },
          tag: "Contradicts available evidence",
          tagHe: "סותר ראיות זמינות",
          explanation: "Problem: OOMKill is not happening here. All pods show 0 restarts, Running status, and memory well within limits. What happened: You spent 20 minutes investigating a dead end with no diagnostic value. Why this failed: OOMKill causes pod restarts, not disappearance. The 0-byte/0ms ALB pattern means target IPs no longer exist at all, which points to a routing issue, not a resource issue.",
          explanationHe: "OOMKill היה מופיע במספר מקומות: kubectl describe pod מראה 'OOMKilled' בסיבת סיום אחרונה, ספירת restarts של pod תהיה גדולה מ-0, ו-Kubernetes events ירשמו את ההריגה. כל ה-pods מראים 0 restarts ומצב Running. חשוב יותר, OOMKill גורם ל-pod להפעלה מחדש (לא להיעלם) - pod שמופעל מחדש היה נרשם שוב ב-ALB. דפוס 0-byte/0ms של ALB מעיד ספציפית שכתובת IP של target כבר לא קיימת.",
          stateEffect: { timeRemaining: "1h 25m" }
        }
      ]
    },
    scale_wrong: {
      id: "scale_wrong",
      timeDelta: "10 minutes later. Scaling event completed.",
      timeDeltaHe: "10 דקות מאוחר יותר. אירוע סקיילינג הושלם.",
      context: "You scaled from 8 to 12 pods. During the scaling event, the 4 new pods registered with the ALB (took 15 seconds each). Meanwhile, error rate stayed at 15% - the root cause isn't capacity. You also noticed that whenever a deployment happens, the 502 rate spikes briefly as old pods drain and new ones register.",
      contextHe: "הגדלת מ-8 ל-12 pods. בזמן אירוע הסקיילינג, 4 ה-pods החדשים נרשמו ב-ALB (לקח 15 שניות כל אחד). בינתיים, שיעור השגיאות נשאר 15% - שורש הבעיה הוא לא קיבולת. גם שמת לב שבכל פעם שפריסה קורה, שיעור ה-502 קופץ בקצרה כש-pods ישנים נכנסים ל-draining וחדשים נרשמים.",
      question: "Scaling didn't help and you noticed 502 spikes correlate with pod lifecycle events. What does that tell you?",
      questionHe: "סקיילינג לא עזר ושמת לב שקפיצות 502 מתואמות עם אירועי מחזור חיי pod. מה זה אומר לך?",
      alerts: [
        { type: "warning", source: "CloudWatch", text: "502 rate unchanged at 15% after scaling 8->12 pods", textHe: "שיעור 502 ללא שינוי ב-15% אחרי סקיילינג מ-8 ל-12 pods" },
        { type: "info", source: "HPA", text: "HPA target CPU 70% - current average 28% - no scaling action needed", textHe: "HPA target CPU 70% - ממוצע נוכחי 28% - לא נדרשת פעולת סקיילינג", noise: true },
        { type: "info", source: "Observation", text: "502 spikes correlate with pod lifecycle events, not traffic", textHe: "קפיצות 502 מתואמות עם אירועי מחזור חיי pod, לא תעבורה" },
      ],
      options: [
        {
          text: "The issue is with pod lifecycle and ALB target management - check target group",
          textHe: "הבעיה היא עם מחזור חיי pod וניהול targets של ALB - בדוק target group",
          nextStep: "target_group",
          impact: { performance: 0, cost: 0, reliability: 3 },
          tag: "Pattern recognition",
          tagHe: "זיהוי דפוס",
          explanation: "Problem: 502 errors correlate with pod lifecycle events like deployments and scaling, not with traffic volume. What happened: Scaling to 12 pods did not reduce errors, proving this is not a capacity issue. Why this works: The target group will reveal the specific timing mismatch between ALB deregistration and pod termination that creates the window where requests fail.",
          explanationHe: "זיהית את הסיגנל המפתח: 502 מתואמים עם שינויי מחזור חיי pod (פריסות, סקיילינג), לא עם נפח תעבורה או שגיאות אפליקציה. דפוס זה - שגיאות במהלך מעברים אבל לא במצב יציב - אופייני לתצורה שגויה ברמת תשתית בין load balancer ל-container orchestrator.",
          stateEffect: {}
        },
        {
          text: "Something is wrong with the HPA configuration",
          textHe: "משהו לא בסדר עם תצורת ה-HPA",
          nextStep: "end_hpa_rabbit_hole",
          impact: { performance: 0, cost: 0, reliability: -3 },
          tag: "Wrong subsystem",
          tagHe: "תת-מערכת שגויה",
          explanation: "Problem: HPA controls how many pods to run, not how traffic is routed to them. What happened: You spent 30+ minutes tuning the wrong subsystem while the demo clock ticked down. Why this failed: HPA scaled correctly from 8 to 12 pods. The issue is in the ALB target group, which handles routing and is where the timing mismatch lives.",
          explanationHe: "HPA (Horizontal Pod Autoscaler) שולט מתי וכמה pods ליצור בהתבסס על metrics - הוא עובד נכון (הגדיל מ-8 ל-12 כצפוי). הבעיה היא לא עם החלטות סקיילינג, אלא עם מה שקורה לתעבורת רשת במהלך מעברי מחזור חיי pod. תצורת HPA משפיעה מתי pods עושים סקיילינג, לא איך תעבורה מנותבת אליהם.",
          stateEffect: { timeRemaining: "1h 00m" }
        }
      ]
    },
    // ── Terminal steps ──
    end_proper_fix: {
      id: "end_proper_fix",
      context: "preStop hook deployed. Deregistration delay aligned to 30s. Triggered a rolling update to verify: zero 502 errors during the 8-pod rollout. ALB access logs confirm clean transitions - every request got a response. The CEO's demo went flawlessly. Engineering team documented the fix as a platform-wide standard. Added it to the EKS service template so all future services get correct lifecycle configuration by default.",
      contextHe: "preStop hook נפרס. עיכוב הסרת רישום הותאם ל-30 שניות. הופעל rolling update לאימות: אפס שגיאות 502 במהלך פריסת 8 pods. לוגי הגישה של ALB מאשרים מעברים נקיים. הדמו של ה-CEO עבר בצורה חלקה. צוות ההנדסה תיעד את התיקון כסטנדרט פלטפורמי. הוסיפו אותו לתבנית שירות EKS כך שכל השירותים העתידיים יקבלו תצורת מחזור חיים נכונה כברירת מחדל.",
      question: null, options: []
    },
    end_quick_fix: {
      id: "end_quick_fix",
      context: "502 errors stopped. CEO's demo succeeded. But the next deployment triggered user-facing connection reset errors: active HTTP requests were dropped mid-stream because deregistration_delay=0 provides no graceful drain window. A user filing a support ticket lost their cart contents during a checkout POST that was interrupted. The fix solved the 502s but introduced a different reliability issue that surfaces during every deployment.",
      contextHe: "שגיאות 502 נעצרו. הדמו של ה-CEO הצליח. אבל הפריסה הבאה הפעילה שגיאות connection reset למשתמשים: בקשות HTTP פעילות נקטעו באמצע כי deregistration_delay=0 לא מספק חלון draining חינני. משתמש שפתח קריאת תמיכה איבד את תוכן העגלה במהלך POST של checkout שנקטע.",
      question: null, options: []
    },
    end_slow_deployments: {
      id: "end_slow_deployments",
      context: "502 errors fixed - the CEO's demo went smoothly. But the next deployment revealed the cost: a rolling update of 8 pods took 42 minutes (each pod waits 300s termination grace period). CI/CD pipeline alerts triggered for slow deployment. When a bug was discovered post-deploy, the rollback also took 42 minutes. Developer velocity dropped significantly. The team will eventually need to reduce the grace period and add a preStop hook instead - doing the proper fix anyway, after burning a week of slow deployments.",
      contextHe: "שגיאות 502 תוקנו - הדמו של ה-CEO עבר חלק. אבל הפריסה הבאה חשפה את המחיר: rolling update של 8 pods לקח 42 דקות (כל pod מחכה 300 שניות תקופת termination grace). התראות CI/CD הופעלו על פריסה איטית. כשבאג התגלה אחרי פריסה, גם ה-rollback לקח 42 דקות. מהירות פיתוח ירדה משמעותית.",
      question: null, options: []
    },
    end_canary_bandaid: {
      id: "end_canary_bandaid",
      context: "Canary deployment implemented. Error rate during deployments dropped from 15% to ~2% (1 pod draining at a time). The CEO's demo had a 2% chance of hitting a 502 - it passed, likely by luck. The root cause (ALB/pod lifecycle mismatch) remains. Every deployment, every HPA scale event, and every node rotation still produces brief 502 windows. Over time, the accumulated impact: ~0.1% daily error rate that appears random in monitoring dashboards but consistently correlates with infrastructure events.",
      contextHe: "Canary deployment מיושם. שיעור שגיאות בזמן פריסות ירד מ-15% ל-2% בערך (pod 1 ב-draining בכל פעם). לדמו של ה-CEO היה סיכוי של 2% לפגוע ב-502 - עבר, כנראה במזל. שורש הבעיה (חוסר התאמה ALB/pod lifecycle) נשאר. כל פריסה, כל אירוע HPA scale, וכל רוטציית node עדיין מפיקים חלונות 502 קצרים.",
      question: null, options: []
    },
    end_wrong_diagnosis: {
      id: "end_wrong_diagnosis",
      context: "45 minutes spent investigating OOM, resource limits, and pod resource requests - everything is nominal. Memory usage is at 60% of limits, CPU at 30%. No OOMKill events in Kubernetes events log. No pod restarts. The investigation confirmed the application layer is healthy but consumed nearly half the remaining time. 75 minutes until the CEO's demo. The 502 errors continue at 15%. The root cause (ALB-to-pod lifecycle timing mismatch) remains undiscovered.",
      contextHe: "45 דקות בוזבזו בחקירת OOM, resource limits ו-resource requests של pods - הכל תקין. שימוש בזיכרון 60% מהמגבלות, CPU ב-30%. אין אירועי OOMKill בלוג Kubernetes events. אין restarts. החקירה אישרה ששכבת האפליקציה בריאה אבל צרכה כמעט חצי מהזמן שנותר. 75 דקות עד הדמו. שגיאות 502 ממשיכות ב-15%.",
      question: null, options: []
    },
    end_hpa_rabbit_hole: {
      id: "end_hpa_rabbit_hole",
      context: "60 minutes spent tuning HPA parameters: adjusted target CPU utilization, stabilization windows, scaling policies. None of it helped because HPA controls pod count, not traffic routing. The 502s occur between the ALB and pod IPs, a layer HPA doesn't touch. 60 minutes until the CEO's demo. Root cause (ALB deregistration delay vs pod terminationGracePeriodSeconds mismatch) is still unknown. A colleague suggests checking the ALB target group - the answer was one AWS console click away the entire time.",
      contextHe: "60 דקות בוזבזו בכוונון פרמטרי HPA: כוונון target CPU utilization, חלונות ייצוב, מדיניות סקיילינג. שום דבר לא עזר כי HPA שולט במספר pods, לא בניתוב תעבורה. ה-502 קורים בין ה-ALB לכתובות IP של pods, שכבה ש-HPA לא נוגע בה. 60 דקות עד הדמו. שורש הבעיה עדיין לא ידוע. קולגה מציע לבדוק את target group של ALB - התשובה הייתה בלחיצת קונסול AWS אחת כל הזמן.",
      question: null, options: []
    }
  }
};
