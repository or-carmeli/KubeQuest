// ── Scenario 2: Black Friday Traffic Spike ─────────────────────────────────

export default {
  id: "traffic-spike",
  title: "Black Friday Traffic Spike",
  titleHe: "גל תעבורה של Black Friday",
  description: "Your e-commerce platform is about to face 20x normal traffic. Design a scaling strategy that doesn't break the bank or the system.",
  descriptionHe: "פלטפורמת ה-e-commerce שלך עומדת בפני תעבורה פי 20 מהרגיל. תכנן אסטרטגיית סקיילינג שלא תשבור את הבנק או את המערכת.",
  difficulty: "hard",
  order: 6,
  estimatedTime: "6-8 min",
  tags: ["Kubernetes", "HPA", "Scaling", "CDN"],
  icon: "📈",
  initialMetrics: { performance: 50, cost: 50, reliability: 50 },
  initialSystemState: {
    latency: 120,
    errorRate: 0,
    cpuPercent: 35,
    connections: "60/200",
    maxConnections: 200,
    costPerMonth: 3000,
    stability: "healthy"
  },
  steps: {
    start: {
      id: "start",
      context: "November 20th. Black Friday is in 5 days. Your e-commerce platform runs on a 3-node EKS cluster with HPA configured (min: 2, max: 10 pods per service). Current baseline: 500 req/s. Expected peak: 10,000 req/s. Backend services: API Gateway, Product Catalog, Cart Service, Payment Service. Database: RDS PostgreSQL (db.r5.xlarge). CDN: None currently.",
      contextHe: "20 בנובמבר. Black Friday בעוד 5 ימים. פלטפורמת ה-e-commerce שלך רצה על EKS cluster עם 3 nodes ו-HPA מוגדר (min: 2, max: 10 pods לשירות). בסיס נוכחי: 500 req/s. שיא צפוי: 10,000 req/s. שירותי Backend: API Gateway, Product Catalog, Cart Service, Payment Service. מסד: RDS PostgreSQL (db.r5.xlarge). CDN: אין כרגע.",
      question: "You need a 20x scaling plan. Where do you start?",
      questionHe: "אתה צריך תוכנית סקיילינג של פי 20. מאיפה מתחילים?",
      alerts: [
        { type: "warning", source: "PM", text: "Black Friday in 5 days - expected 10,000 req/s peak (current: 500)", textHe: "Black Friday בעוד 5 ימים - צפוי 10,000 req/s בשיא (נוכחי: 500)" },
        { type: "info", source: "AWS Health", text: "Scheduled maintenance: us-east-1a EBS volumes, Nov 28 02:00 UTC", textHe: "תחזוקה מתוכננת: volumes של EBS ב-us-east-1a, 28 בנובמבר 02:00 UTC", noise: true },
        { type: "info", source: "Capacity", text: "Current HPA max: 10 pods/service - insufficient for 20x load", textHe: "HPA max נוכחי: 10 pods לשירות - לא מספיק לעומס פי 20" },
      ],
      options: [
        {
          text: "Set HPA max to 200 pods and add more EKS nodes",
          textHe: "הגדר HPA max ל-200 pods והוסף עוד EKS nodes",
          nextStep: "brute_scale",
          impact: { performance: 8, cost: -18, reliability: 3 },
          tag: "Compute-only scaling",
          tagHe: "סקיילינג חישוב בלבד",
          explanation: "Problem: 70% of your traffic is static assets that do not need backend compute at all. What happened: 200 pods each grabbed DB connections and blew past the RDS 200-connection limit. Why this failed: You threw compute at a problem that CDN would have solved, and created a database bottleneck in the process.",
          explanationHe: "סקיילינג חישוב ללא ניתוח הרכב תעבורה אינו יעיל. ב-10K req/s, כ-70% הם בקשות assets סטטיים ודפי קטלוג שלא צריכים עיבוד backend. הגדרת HPA max ל-200 יוצרת בעיה מדורגת: 200 pods עם מאגר חיבורי DB ימצו את max_connections של RDS. גם לשרת API של מישור הבקרה של EKS יש הגבלות קצב שיכולות לגרום לעיכובי תזמון בסקיילינג של 200+ pods בו-זמנית.",
          stateEffect: {
            cpuPercent: 45, costPerMonth: 8000,
            pendingConsequences: [{ triggerAt: "*", effect: { connections: "350/200", errorRate: 15, stability: "critical" } }]
          }
        },
        {
          text: "Add a CDN and implement caching layers first",
          textHe: "הוסף CDN ויישם שכבות caching קודם",
          nextStep: "cdn_first",
          impact: { performance: 22, cost: 8, reliability: 12 },
          tag: "Reduce before you scale",
          tagHe: "הפחת לפני שתרחיב",
          explanation: "Problem: 70% of requests are static images and catalog pages hitting your backend for no reason. What happened: Adding a CDN dropped effective backend load from 10K to 3K req/s, turning a 20x problem into a 6x one. Why this worked: CDN only needs DNS changes and cache headers, so you get the biggest scaling win with zero code risk.",
          explanationHe: "תמונות מוצרים, assets סטטיים ודפי קטלוג מהווים 70% מסך הבקשות. CDN של CloudFront סופג אותם בקצה עם פחות מ-50ms השהיה, בעלות של $0.01/10K בקשות בערך - סדרי גודל זול יותר מחישוב backend. זה מפחית עומס backend אפקטיבי מ-10K ל-3K req/s בערך, כך שאתגר הסקיילינג הנותר הוא פי 6 במקום פי 20. פריסת CDN דורשת רק שינויי DNS ו-cache-control headers - אפשרי ביום אחד ללא שינויי קוד.",
          stateEffect: { latency: 90, costPerMonth: 3200, stability: "healthy" }
        },
        {
          text: "Rewrite critical services in Go for better performance",
          textHe: "כתוב מחדש שירותים קריטיים ב-Go לביצועים טובים יותר",
          nextStep: "rewrite_mistake",
          impact: { performance: 0, cost: 0, reliability: -15 },
          tag: "High-risk rewrite under time pressure",
          tagHe: "שכתוב בסיכון גבוה תחת לחץ זמן",
          explanation: "Problem: Rewriting services 5 days before peak traffic means deploying untested code in payment and cart paths. What happened: The team loses its most critical week on a rewrite instead of proven infrastructure fixes. Why this failed: CDN and HPA tuning deliver better scaling gains with zero code risk, while a rewrite needs weeks of testing you do not have.",
          explanationHe: "שכתוב שפה 5 ימים לפני שיא תעבורה מפר את העיקרון הבסיסי של ניהול שינויים בתקופות קריטיות. גם אם Go מספק שיפור תפוקה של פי 2-3 לכל pod, הסיכונים חמורים: (1) קוד חדש = באגים לא מגולים בנתיבי תשלום/עגלה קריטיים, (2) אפס זמן burn-in בייצור - תגלה בעיות תחת עומס מקסימלי, (3) תקורת context-switching של הצוות בשבוע הלחוץ ביותר.",
          stateEffect: { stability: "degraded" }
        }
      ]
    },
    cdn_first: {
      id: "cdn_first",
      timeDelta: "1 day later. CDN deployment complete.",
      timeDeltaHe: "יום אחד מאוחר יותר. פריסת CDN הושלמה.",
      context: "CloudFront CDN is deployed. Static assets and product catalog pages are cached at edge (TTL: 5min for catalog, 24h for images). Backend effective load dropped to ~3,000 req/s at peak. But you still need to handle 6x your current compute capacity for dynamic requests (cart operations, checkout, payment processing, inventory checks).",
      contextHe: "CloudFront CDN פרוס. Assets סטטיים ודפי קטלוג מאוחסנים בקצה (TTL: 5 דקות לקטלוג, 24 שעות לתמונות). העומס האפקטיבי על Backend ירד ל-3,000 req/s בשיא. אבל עדיין צריך לטפל בפי 6 מקיבולת החישוב הנוכחית לבקשות דינמיות (פעולות עגלה, checkout, עיבוד תשלום, בדיקת מלאי).",
      question: "How do you scale the dynamic backend services?",
      questionHe: "איך תרחיב את שירותי ה-Backend הדינמיים?",
      alerts: [
        { type: "resolved", source: "CloudFront", text: "CDN deployed - 70% of traffic offloaded to edge", textHe: "CDN נפרס - 70% מהתעבורה הועבר ל-edge" },
        { type: "info", source: "Route53", text: "DNS propagation for cdn.example.com complete - TTL 300s", textHe: "הפצת DNS ל-cdn.example.com הושלמה - TTL 300s", noise: true },
        { type: "warning", source: "Capacity", text: "Remaining backend load: ~3,000 req/s (6x current capacity needed)", textHe: "עומס backend נותר: כ-3,000 req/s (נדרשת קיבולת פי 6)" },
      ],
      options: [
        {
          text: "Pre-scale pods with buffer + configure HPA with custom metrics",
          textHe: "הגדר pods מראש עם מרווח + הגדר HPA עם metrics מותאמים",
          nextStep: "smart_scaling",
          impact: { performance: 12, cost: -5, reliability: 18 },
          tag: "Proactive capacity planning",
          tagHe: "תכנון קיבולת יזום",
          explanation: "Problem: Default CPU-based HPA takes 2-3 minutes to react, and new nodes need another 3-5 minutes, leaving a dangerous gap during traffic spikes. What happened: Pre-scaling to 6x baseline one hour before the event removed the cold-start risk entirely. Why this worked: Custom metrics like p99 latency let HPA respond to real user impact, and per-service tuning means Cart scales aggressively while Product Catalog stays lean behind the CDN.",
          explanationHe: "סקיילינג מוקדם לפי 6 מהבסיס שעה לפני האירוע מבטל סיכון cold-start - nodes חדשים לוקחים 3-5 דקות להיות מוכנים, ול-HPA יש חלון ייצוב של 60 שניות כברירת מחדל. שימוש ב-metrics מותאמים (p99 request latency, queue depth) במקום רק CPU הופך את HPA לרגיש לחוויית משתמש אמיתית, לא למדדי משאבים מפגרים. כוונון לפי שירות הוא קריטי: Cart Service צריך סקיילינג אגרסיבי יותר (הוא stateful לכל session) בזמן ש-Product Catalog יכול להיות שמרני יותר.",
          stateEffect: { cpuPercent: 55, costPerMonth: 4500, latency: 85, stability: "healthy" }
        },
        {
          text: "Move to serverless (Lambda) for auto-scaling",
          textHe: "עבור ל-serverless (Lambda) לסקיילינג אוטומטי",
          nextStep: "serverless_risk",
          impact: { performance: 3, cost: -8, reliability: -12 },
          tag: "Platform migration under pressure",
          tagHe: "מיגרציית פלטפורמה תחת לחץ",
          explanation: "Problem: Migrating to Lambda in 5 days means cold starts of 1-3 seconds on checkout and a 1,000 concurrency account limit. What happened: Payment Service lost persistent DB connections and Cart Service lost session state, both breaking critical user flows. Why this failed: The existing EKS platform can scale with simpler infrastructure changes that do not require a full platform migration.",
          explanationHe: "Lambda מספק סקיילינג אוטומטי ל-10K+ הרצות מקבילות, אבל מיגרציה של שירותי EKS קיימים ל-Lambda ב-5 ימים מכניסה סיכונים מרובים: (1) cold starts מוסיפים 1-3 שניות השהיה לשירותי Java/.NET - לא מקובל ל-checkout, (2) מגבלת concurrency ברירת מחדל של Lambda היא 1,000 לחשבון, (3) שירות התשלום דורש חיבורי DB מתמשכים שלא עובדים עם מודל Lambda, (4) Cart Service מסתמך על session affinity בזיכרון שלא עובד במודל stateless של Lambda.",
          stateEffect: { latency: 2500, stability: "degraded", costPerMonth: 5000 }
        },
        {
          text: "Set all HPA minimums to 20 pods now",
          textHe: "הגדר את כל ה-HPA minimums ל-20 pods עכשיו",
          nextStep: "over_provision",
          impact: { performance: 8, cost: -15, reliability: 8 },
          tag: "Over-provisioning without differentiation",
          tagHe: "הקצאת יתר ללא הבחנה",
          explanation: "Problem: Running 20 pods per service for 5 days burns $2.4K/day on idle compute sitting at 5% CPU. What happened: Payment Service has external rate limits making 20 pods pointless, while Cart Service actually needs more for stateful sessions. Why this failed: A blanket number for every service both over-spends and under-protects, and pre-scaling should happen hours before the event, not days.",
          explanationHe: "הרצת 20 pods לשירות במשך 5 ימים שורפת עלות חישוב על משאבים בטלים - כ-$2.4K ליום על pods שיושבים ב-5% ניצולת. חשוב יותר, זו גישת one-size-fits-all שמתעלמת מצרכי סקיילינג ספציפיים לשירות: Cart Service מטפל ב-sessions stateful וצריך יותר מופעים מ-Product Catalog (בעיקר cached ע\"י CDN). Payment Service יש לו הגבלות קצב עם Stripe/PayPal שהופכות 20 pods למיותרים.",
          stateEffect: { cpuPercent: 5, costPerMonth: 15200, connections: "360/200", stability: "warning" }
        }
      ]
    },
    smart_scaling: {
      id: "smart_scaling",
      timeDelta: "2 days later. HPA tuning complete, load test scheduled.",
      timeDeltaHe: "יומיים מאוחר יותר. כוונון HPA הושלם, load test מתוכנן.",
      context: "HPA is configured with custom metrics (p99 latency, queue depth). Pre-scale plan is ready for T-1 hour. Cluster Autoscaler will provision new nodes on demand. But your DBA flags a critical concern: RDS max_connections is 200. With 60+ pods running (10 per service × 6 services), each holding a connection pool of 5, you'll need 300 connections - exceeding the limit.",
      contextHe: "HPA מוגדר עם metrics מותאמים (p99 latency, queue depth). תוכנית סקיילינג מוקדם מוכנה לשעה לפני. Cluster Autoscaler יקצה nodes חדשים לפי דרישה. אבל ה-DBA מעלה חשש קריטי: max_connections של RDS הוא 200. עם 60+ pods (10 לשירות × 6 שירותים), כל אחד מחזיק מאגר חיבורים של 5, תצטרך 300 חיבורים - מעבר למגבלה.",
      question: "How do you handle the database connection bottleneck?",
      questionHe: "איך תטפל בצוואר הבקבוק של חיבורי ה-DB?",
      alerts: [
        { type: "info", source: "HPA", text: "Custom metrics configured: p99 latency + queue depth", textHe: "Metrics מותאמים מוגדרים: p99 latency + queue depth" },
        { type: "info", source: "Kubernetes", text: "Node pool autoscaler: 3/20 nodes utilized - scaling headroom available", textHe: "autoscaler של node pool: 3/20 nodes בשימוש - יש מרווח סקיילינג", noise: true },
        { type: "critical", source: "DBA", text: "RDS max_connections is 200 - 60+ pods will exhaust pool", textHe: "max_connections של RDS הוא 200 - 60+ pods ימצו את המאגר" },
      ],
      options: [
        {
          text: "Deploy PgBouncer as a sidecar + add a read replica for catalog queries",
          textHe: "פרוס PgBouncer כ-sidecar + הוסף read replica לשאילתות קטלוג",
          nextStep: "end_well_prepared",
          impact: { performance: 12, cost: -5, reliability: 15 },
          tag: "Layered scaling strategy",
          tagHe: "אסטרטגיית סקיילינג שכבתית",
          explanation: "Problem: 60+ pods each holding persistent DB connections will blow past the 200 connection limit. What happened: PgBouncer multiplexes connections at 40:1, so even 200 pods stay within limits. Why this worked: A read replica offloads 60% of queries to handle catalog reads, reserving write capacity on the primary for cart and payment transactions.",
          explanationHe: "PgBouncer במצב transaction pooling מנהל חיבורים - 60 pods יכולים לשתף מאגר של 80 חיבורי DB בפועל, כי כל pod מחזיק חיבור רק בזמן הרצת שאילתה פעילה (5ms בערך), לא כל מחזור חיי הבקשה (200ms בערך). יחס multiplexing של 40:1 אומר שגם 200 pods יכולים לעבוד בתוך מגבלת 200 חיבורים. ה-read replica מפנה גלישה בקטלוג וחיפוש מה-primary, שומר קיבולת כתיבה למוטציות עגלה וטרנזקציות הזמנה.",
          stateEffect: { connections: "85/200", latency: 80, costPerMonth: 5050, errorRate: 0, stability: "healthy" }
        },
        {
          text: "Scale RDS to db.r5.4xlarge with 1000 max_connections",
          textHe: "שדרג RDS ל-db.r5.4xlarge עם 1000 max_connections",
          nextStep: "end_expensive_scale",
          impact: { performance: 8, cost: -15, reliability: 3 },
          tag: "Vertical scaling with hidden costs",
          tagHe: "שדרוג אנכי עם עלויות נסתרות",
          explanation: "Problem: Upgrading RDS to 4xlarge costs 4x more per hour and creates a single point of failure with no read scaling. What happened: After the event, nobody remembered to scale back down, adding $2,800/month to the bill indefinitely. Why this failed: PgBouncer solves the same connection problem at ~$5/month without the ongoing cost risk or single-database bottleneck.",
          explanationHe: "השדרוג ל-4xlarge מספק 64GB RAM (לעומת 16GB), תומך ב-1000 חיבורים עם shared_buffers מספיקים. אבל זה עולה פי 4 לשעה (כ-$2,800 לחודש) ויוצר נקודת כשל בודדת לכל השירותים. אין סקיילינג קריאה - כל 60+ pods עדיין פוגעים במסד אחד. אחרי האירוע, מישהו צריך לזכור להקטין. גישת r5.4xlarge עובדת אבל מחליפה פשטות תפעולית בעלות.",
          stateEffect: { connections: "300/1000", maxConnections: 1000, costPerMonth: 7800, cpuPercent: 78, stability: "healthy" }
        },
        {
          text: "Implement request queuing with SQS to control DB access",
          textHe: "יישם תור בקשות עם SQS לשליטה בגישת DB",
          nextStep: "end_queue_lag",
          impact: { performance: -5, cost: -3, reliability: 8 },
          tag: "Wrong pattern for interactive flows",
          tagHe: "תבנית שגויה לתהליכים אינטראקטיביים",
          explanation: "Problem: SQS adds 50-200ms latency per message, but cart and checkout need sub-100ms responses. What happened: Every 100ms of added latency drops e-commerce conversion by about 1%, costing potentially $200K+ in lost revenue. Why this failed: Queuing works for background tasks like email, not interactive flows where users need instant confirmation of their cart changes.",
          explanationHe: "תורי SQS מוסיפים 50-200ms השהיה לכל הודעה (מרווח polling + זמן עיבוד), מה שמקובל למשימות רקע אבל הרסני לתהליכי e-commerce אינטראקטיביים. פעולות הוספה/הסרה מעגלה צריכות תגובה מתחת ל-100ms. Checkout חייב להיות סינכרוני - משתמשים צריכים אישור מיידי. מחקרים מראים שכל 100ms של השהיה נוספת מפחית המרת e-commerce בכ-1%.",
          stateEffect: { latency: 350, connections: "120/200", errorRate: 0, stability: "degraded" }
        }
      ]
    },
    brute_scale: {
      id: "brute_scale",
      timeDelta: "During load test. System under simulated peak traffic.",
      timeDeltaHe: "במהלך load test. המערכת תחת תעבורת שיא מדומה.",
      newIssues: [
        { text: "Database connection pool exhausted during load test at 180 pods", textHe: "מאגר חיבורי DB נוצל ב-load test ב-180 pods" },
      ],
      context: "You've set HPA max to 200 pods and provisioned 15 EKS nodes. During load testing, the database started refusing connections at ~180 pods - max_connections is 200 and each pod holds a pool of ~3 connections. Pod scheduling is slow: Cluster Autoscaler takes 3-5 minutes to provision new nodes, and the API server is throttling at this pod count.",
      contextHe: "הגדרת HPA max ל-200 pods והקצית 15 EKS nodes. במהלך load test, המסד התחיל לסרב חיבורים בכ-180 pods - max_connections הוא 200 וכל pod מחזיק מאגר של 3 חיבורים בערך. תזמון Pods איטי: Cluster Autoscaler לוקח 3-5 דקות להקצות nodes חדשים, ושרת ה-API עושה throttling במספר pods זה.",
      question: "Load test exposed database connection limits and scheduling delays. How do you address this?",
      questionHe: "ה-load test חשף מגבלות חיבורי DB ועיכובי תזמון. איך תטפל?",
      alerts: [
        { type: "critical", source: "CloudWatch", text: "RDS connection count: 200/200 - refusing new connections", textHe: "ספירת חיבורי RDS: 200/200 - מסרב חיבורים חדשים" },
        { type: "info", source: "kube-proxy", text: "iptables sync completed in 1.2s (normal)", textHe: "iptables sync הושלם ב-1.2 שניות (נורמלי)", noise: true },
        { type: "warning", source: "EKS", text: "API server throttling - pod scheduling delayed", textHe: "שרת API עושה throttling - תזמון pods מעוכב" },
      ],
      logs: [
        { level: "error", timestamp: "09:15:42", text: "FATAL: too many connections for role \"app_user\"" },
        { level: "warn", timestamp: "09:15:38", text: "k8s: pod scheduling backlog: 23 pending, avg wait 180s" },
      ],
      options: [
        {
          text: "Add connection pooling (PgBouncer) and reduce HPA max to something realistic",
          textHe: "הוסף connection pooling (PgBouncer) והפחת HPA max למשהו ריאלי",
          nextStep: "smart_scaling",
          impact: { performance: 8, cost: 8, reliability: 8 },
          tag: "Load-test informed correction",
          tagHe: "תיקון מבוסס load test",
          explanation: "Problem: 200 pods was an arbitrary number that exhausted DB connections and triggered API server throttling. What happened: The load test caught this before production traffic did. Why this worked: Adding PgBouncer and reducing HPA max to 30-40 pods gives 6-8x headroom, and with CDN absorbing 70% of requests you need far fewer backend pods than the raw 20x multiplier suggests.",
          explanationHe: "Load testing לפני האירוע הוא בדיוק הפרקטיקה הנכונה - הוא חשף את צוואר הבקבוק של חיבורים לפני שתעבורת ייצור עשתה זאת. PgBouncer פותר את בעיית multiplexing החיבורים, והפחתת HPA max למספר ריאלי (30-40 pods סה\"כ, לא 200) מונעת throttling של שרת API תוך שמירה על מרווח סקיילינג של פי 6-8.",
          stateEffect: { connections: "80/200", cpuPercent: 40, costPerMonth: 4200, errorRate: 0, stability: "healthy" }
        },
        {
          text: "Increase RDS max_connections and add another database",
          textHe: "הגדל RDS max_connections והוסף עוד מסד נתונים",
          nextStep: "end_db_split_rush",
          impact: { performance: 3, cost: -18, reliability: -8 },
          tag: "Emergency database split",
          tagHe: "פיצול מסד חירום",
          explanation: "Problem: Splitting a database 5 days before peak traffic introduces data consistency risks across two databases. What happened: One misrouted cart query to the wrong database causes inventory discrepancies and overselling. Why this failed: PgBouncer solves the same connection limit problem as a deployment-only change with zero data migration risk.",
          explanationHe: "פיצול מסד נתונים 5 ימים לפני שיא תעבורה מכניס את הבעיות הקשות ביותר במערכות מבוזרות: עקביות נתונים בין מסדים, גבולות טרנזקציות, לוגיקת ניתוב חיבורים, וסיכון מיגרציה. שאילתת עגלה אחת שמנותבת למסד הלא נכון = אי-עקביות מלאי ומכירת יתר פוטנציאלית.",
          stateEffect: { connections: "180/400", costPerMonth: 9500, stability: "degraded", errorRate: 5 }
        }
      ]
    },
    rewrite_mistake: {
      id: "rewrite_mistake",
      timeDelta: "1 day later. Rewrite attempt abandoned by team consensus.",
      timeDeltaHe: "יום מאוחר יותר. ניסיון שכתוב ננטש בהסכמת הצוות.",
      context: "The team pushes back hard. Your senior engineer estimates 3 weeks minimum for a safe Go migration with proper testing. Even a partial rewrite of Cart Service alone would take 5+ days with no margin for bugs. Black Friday is in 5 days. You've consumed a full day in planning discussions and prototype attempts.",
      contextHe: "הצוות מתנגד בחוזקה. המהנדס הבכיר מעריך 3 שבועות מינימום למיגרציה בטוחה ל-Go עם בדיקות מתאימות. גם שכתוב חלקי של Cart Service בלבד ייקח 5+ ימים ללא מרווח לבאגים. Black Friday בעוד 5 ימים. צרכת יום שלם בדיוני תכנון וניסיונות prototype.",
      question: "The rewrite isn't viable. What's your recovery plan?",
      questionHe: "השכתוב לא ישים. מה תוכנית ההתאוששות שלך?",
      alerts: [
        { type: "critical", source: "Engineering", text: "Go rewrite estimate: 3 weeks - Black Friday is in 4 days", textHe: "הערכת שכתוב Go: 3 שבועות - Black Friday בעוד 4 ימים" },
        { type: "info", source: "GitHub", text: "Dependabot: 3 security updates available for package.json", textHe: "Dependabot: 3 עדכוני אבטחה זמינים ל-package.json", noise: true },
        { type: "warning", source: "PM", text: "1 day lost on rewrite planning - 4 days remaining", textHe: "יום אחד אבד על תכנון שכתוב - 4 ימים נותרו" },
      ],
      options: [
        {
          text: "Pivot to CDN + smart HPA scaling strategy",
          textHe: "עבור לאסטרטגיית CDN + סקיילינג HPA חכם",
          nextStep: "cdn_first",
          impact: { performance: 0, cost: 0, reliability: 8 },
          tag: "Recovery to proven approach",
          tagHe: "התאוששות לגישה מוכחת",
          explanation: "Problem: One day was lost on a rewrite that was never viable in 5 days. What happened: With 4 days left, CDN, HPA tuning, and load testing can still be completed with a day of buffer. Why this worked: Infrastructure changes like CDN and connection pooling deliver 10-20x scaling with zero code risk, while rewrites belong in calmer periods.",
          explanationHe: "אבד יום אחד, אבל נשארו 4 ימים - מספיק לפריסת CDN (יום), כוונון HPA (יום), load testing (יום), ומרווח (יום). הלקח: תחת לחץ זמן, אופטימז את מה שיש במקום לבנות מחדש. שינויים ברמת תשתית (CDN, HPA, connection pooling) מספקים שיפור סקיילינג של פי 10-20 עם אפס סיכון קוד אפליקציה.",
          stateEffect: { stability: "healthy" }
        },
        {
          text: "Max out all infrastructure and hope for the best",
          textHe: "הגדל את כל התשתית למקסימום ותקווה לטוב",
          nextStep: "end_panic_scale",
          impact: { performance: 3, cost: -22, reliability: -3 },
          tag: "Unplanned capacity dump",
          tagHe: "הזרמת קיבולת לא מתוכננת",
          explanation: "Problem: Maxing out everything without load testing means spending $45K/week blindly with no idea if it will actually hold. What happened: Without CDN, pods serve static images at high cost; without connection pooling, more pods overwhelm the database. Why this failed: A planned CDN plus pooling approach would achieve better results at ~$5K, and you still have no confidence the untested setup works.",
          explanationHe: "סקיילינג של הכל למקסימום ללא load testing או ניתוח תעבורה זו הוצאה ללא נתונים. סביר שתקצה יתר לחלק מהשירותים ותת-הקצה לאחרים. ללא connection pooling, יותר pods יציפו את ה-DB. ללא CDN, אתה משלם על חישוב כדי להגיש תמונות סטטיות. עלות משוערת: $45K לשבוע לעומת כ-$5K עם גישה מתוכננת.",
          stateEffect: { cpuPercent: 25, costPerMonth: 45000, connections: "400/200", errorRate: 20, stability: "critical" }
        }
      ]
    },
    serverless_risk: {
      id: "serverless_risk",
      timeDelta: "2 days later. Lambda POC results available.",
      timeDeltaHe: "יומיים מאוחר יותר. תוצאות POC של Lambda זמינות.",
      newIssues: [
        { text: "Lambda concurrency limit reached during load test at 1,000 executions", textHe: "מגבלת concurrency של Lambda הושגה ב-load test ב-1,000 הרצות" },
        { text: "Payment service DB connections failing through Lambda ephemeral model", textHe: "חיבורי DB של שירות תשלום נכשלים דרך מודל ephemeral של Lambda" },
      ],
      context: "Lambda POC results: cold starts of 2-3s for Java services, 400ms for Node.js. Concurrency limit hit at 1,000 (default account limit - increase request takes 24-48h). Payment service can't maintain persistent DB connections through Lambda's ephemeral execution model. Cart session affinity is lost. Team morale is dropping - 2 days spent on a path that isn't working.",
      contextHe: "תוצאות POC ל-Lambda: cold starts של 2-3 שניות לשירותי Java, 400ms ל-Node.js. מגבלת concurrency הופעלה ב-1,000 (מגבלת חשבון ברירת מחדל - בקשת הגדלה לוקחת 24-48 שעות). שירות התשלום לא יכול לשמור חיבורי DB מתמשכים. session affinity של עגלה אבד. מורל הצוות יורד - 2 ימים הושקעו במסלול שלא עובד.",
      question: "Lambda migration is failing. What's your fallback?",
      questionHe: "מעבר Lambda נכשל. מה הפתרון החלופי?",
      alerts: [
        { type: "critical", source: "Lambda", text: "Cold start latency: 2-3s (Java) - checkout SLA breached", textHe: "השהיית cold start: 2-3 שניות (Java) - SLA של checkout הופר" },
        { type: "info", source: "CloudWatch", text: "API Gateway cache hit ratio 94% (unrelated to Lambda cold starts)", textHe: "יחס פגיעות cache של API Gateway 94% (לא קשור ל-cold starts של Lambda)", noise: true },
        { type: "warning", source: "AWS", text: "Concurrency limit 1,000 reached - increase request pending 24-48h", textHe: "מגבלת concurrency 1,000 הושגה - בקשת הגדלה ממתינה 24-48 שעות" },
        { type: "warning", source: "Team", text: "2 days spent on Lambda POC - 3 days remaining before Black Friday", textHe: "יומיים הושקעו ב-POC של Lambda - 3 ימים נותרו לפני Black Friday" },
      ],
      logs: [
        { level: "error", timestamp: "14:22:11", text: "Lambda PaymentHandler: ETIMEDOUT connecting to RDS after cold start" },
        { level: "warn", timestamp: "14:21:55", text: "CartService: session lookup miss - affinity lost in Lambda execution model" },
      ],
      options: [
        {
          text: "Go back to EKS - implement CDN + smart HPA scaling",
          textHe: "חזור ל-EKS - יישם CDN + סקיילינג HPA חכם",
          nextStep: "cdn_first",
          impact: { performance: 0, cost: 0, reliability: 3 },
          tag: "Recovery - 3 days remaining",
          tagHe: "התאוששות - 3 ימים נותרו",
          explanation: "Problem: Two days were spent on Lambda and it hit cold starts, concurrency caps, and broken DB connections. What happened: With 3 days left, CDN plus HPA tuning can still be completed in time. Why this worked: Proven infrastructure patterns are the right call under time pressure, and the Lambda findings can inform a proper migration after Black Friday.",
          explanationHe: "אבדו יומיים, אבל גישת CDN + HPA עדיין אפשרית ב-3 הימים הנותרים. פריסת CDN היא שינוי תשתית של יום. כוונון HPA עם load testing לוקח 1-2 ימים. הניסוי עם Lambda לא בוזבז לחלוטין - עכשיו אתה מכיר את מגבלות הפלטפורמה ויכול לתכנן מיגרציה ל-serverless לשירותים לא קריטיים אחרי Black Friday.",
          stateEffect: { latency: 120, stability: "healthy", costPerMonth: 3000 }
        },
        {
          text: "Try a hybrid - keep Lambda for some services, EKS for others",
          textHe: "נסה היברידי - שמור Lambda לחלק מהשירותים, EKS לאחרים",
          nextStep: "end_hybrid_mess",
          impact: { performance: 0, cost: -10, reliability: -12 },
          tag: "Doubled operational complexity",
          tagHe: "מורכבות תפעולית כפולה",
          explanation: "Problem: A hybrid Lambda-EKS setup doubles operational complexity with two deployment pipelines, two monitoring systems, and 20-50ms cross-platform latency. What happened: When something fails at 2 AM on Black Friday, the team has to debug across both platforms at once. Why this failed: Simplicity is critical for incident response, and every additional system boundary becomes harder to diagnose under peak load.",
          explanationHe: "ארכיטקטורה היברידית עם 3 ימים עד שיא תעבורה אומרת: שני pipelines פריסה, שתי מערכות ניטור, השהיה חוצת-פלטפורמות (קריאות Lambda-ל-EKS מוסיפות 20-50ms), שתי אסטרטגיות connection pooling, ושני runbooks. אם פונקציית Lambda נכשלת ב-2 בלילה ב-Black Friday, הצוות צריך לדבג על שתי פלטפורמות בו-זמנית.",
          stateEffect: { latency: 450, costPerMonth: 6500, stability: "degraded", errorRate: 3 }
        }
      ]
    },
    over_provision: {
      id: "over_provision",
      timeDelta: "3 days of idle pods running. Black Friday in 2 days.",
      timeDeltaHe: "3 ימים של pods בטלים. Black Friday בעוד יומיים.",
      newIssues: [
        { text: "DB connection limit will be exceeded when pods actually scale under real traffic", textHe: "מגבלת חיבורי DB תיחרג כשה-pods באמת יעשו סקיילינג תחת תעבורה אמיתית" },
      ],
      context: "20 pods per service × 6 services = 120 pods running for 5 days straight. Your AWS compute bill estimate jumped $12K for the week. Most pods are at <5% CPU utilization. CFO flagged the spend. Meanwhile, the database connection problem remains unaddressed - 120 pods × 3 connections each = 360, exceeding max_connections.",
      contextHe: "20 pods לשירות × 6 שירותים = 120 pods רצים 5 ימים ברצף. הערכת חשבון חישוב AWS קפצה ב-$12K לשבוע. רוב ה-pods ב-פחות מ-5% ניצולת CPU. ה-CFO סימן את ההוצאה. בינתיים, בעיית חיבורי ה-DB נשארת - 120 pods × 3 חיבורים = 360, מעבר ל-max_connections.",
      question: "Over-provisioned and expensive, with an unaddressed DB connection bottleneck. How do you adjust?",
      questionHe: "הקצאת יתר ויקר, עם bottleneck בחיבורי DB שלא טופל. איך תתאים?",
      alerts: [
        { type: "warning", source: "CFO", text: "AWS compute bill estimate: $12K/week - 4x over budget", textHe: "הערכת חשבון חישוב AWS: $12K לשבוע - פי 4 מהתקציב" },
        { type: "info", source: "Cost Explorer", text: "Reserved Instance coverage: 45% - savings opportunity available", textHe: "כיסוי Reserved Instance: 45% - יש הזדמנות לחיסכון", noise: true },
        { type: "critical", source: "CloudWatch", text: "DB connections: 360/200 - exceeding max_connections limit", textHe: "חיבורי DB: 360/200 - חורג ממגבלת max_connections" },
        { type: "info", source: "Monitoring", text: "Average pod CPU utilization: <5% - massive over-provisioning", textHe: "ניצולת CPU ממוצעת ל-pod: פחות מ-5% - הקצאת יתר מאסיבית" },
      ],
      options: [
        {
          text: "Reduce minimums now, pre-scale T-1 hour before event with per-service tuning",
          textHe: "הפחת minimums עכשיו, סקיילינג מוקדם שעה לפני עם כוונון לפי שירות",
          nextStep: "smart_scaling",
          impact: { performance: 0, cost: 12, reliability: 5 },
          tag: "Data-driven right-sizing",
          tagHe: "התאמה מבוססת נתונים",
          explanation: "Problem: 120 idle pods are burning $9.6K over 4 days while the real bottleneck, database connections, is still unaddressed. What happened: Scaling back to baseline and pre-scaling 1 hour before the event saves that cost and focuses resources where they matter. Why this worked: Per-service tuning gives Cart Service 15 pods and Product Catalog 5 behind CDN, and adding PgBouncer fixes the actual constraint.",
          explanationHe: "הקטנה לבסיס וסקיילינג מוקדם שעה לפני האירוע חוסכת 4 ימים של עלות חישוב בטל (כ-$9.6K). כוונון לפי שירות אומר ש-Cart Service אולי יעשה סקיילינג מוקדם ל-15 pods בזמן ש-Product Catalog נשאר ב-5 (CDN מטפל ברוב תעבורת הקטלוג). גישה זו דורשת load test לאימות.",
          stateEffect: { cpuPercent: 35, costPerMonth: 3500, connections: "60/200", stability: "healthy" }
        },
        {
          text: "Keep it running - better safe than sorry",
          textHe: "תשאיר רץ - עדיף בטוח מאשר מצטער",
          nextStep: "end_wasteful",
          impact: { performance: 3, cost: -15, reliability: 3 },
          tag: "Cost waste masking real risk",
          tagHe: "בזבוז עלות שמסתיר סיכון אמיתי",
          explanation: "Problem: $2.4K/day on 95% idle compute gives a false sense of readiness while DB connections at 360/200 will still fail. What happened: During Black Friday, pods exceeded max_connections and the database refused connections, causing exactly the outage you were trying to prevent. Why this failed: More compute pods do not fix a database bottleneck, so the real constraint brought down the system anyway.",
          explanationHe: "אתה משלם $2.4K ליום על 95% חישוב בטל - זה לא זהירות, זו הוצאה לא מתוכננת. גרוע יותר, הסיכון האמיתי (מיצוי חיבורי DB) נשאר ללא טיפול. במהלך Black Friday, כשה-pods באמת יעשו סקיילינג, הם יחרגו מ-max_connections וה-DB יסרב חיבורים - ויגרום בדיוק לנפילה שאתה מנסה למנוע.",
          stateEffect: { cpuPercent: 5, costPerMonth: 15200, connections: "360/200", errorRate: 12, stability: "critical" }
        }
      ]
    },
    // ── Terminal steps ──
    end_well_prepared: {
      id: "end_well_prepared",
      context: "Black Friday results: CDN absorbed 72% of traffic (7,200 req/s at edge). PgBouncer kept DB connections at 85/200. HPA scaled Cart Service to 18 pods and Product Catalog to 6 pods based on custom metrics. Peak backend latency: 120ms. Zero 5xx errors. Cost increase: 60% over baseline ($8K for the week vs $5K normal) - well within the approved budget. Post-event: all services scaled back automatically. The team wrote a runbook for future peak events.",
      contextHe: "תוצאות Black Friday: CDN ספג 72% מהתעבורה (7,200 req/s בקצה). PgBouncer שמר חיבורי DB ב-85/200. HPA הגדיל Cart Service ל-18 pods ו-Product Catalog ל-6 pods בהתבסס על metrics מותאמים. השהיה בשיא: 120ms. אפס שגיאות 5xx. עליית עלות: 60% מעל הבסיס ($8K לשבוע לעומת $5K רגיל). אחרי האירוע: כל השירותים הוקטנו אוטומטית.",
      question: null, options: []
    },
    end_expensive_scale: {
      id: "end_expensive_scale",
      context: "Black Friday survived but with operational debt. RDS 4xlarge handled connections at 78% CPU peak. Total cost: $18K for the week (4x over budget). Two weeks post-event, the 4xlarge instance was still running - nobody remembered to scale down, adding $2,800 to the monthly bill. CFO escalated. The same result could have been achieved at 1/4 the cost with PgBouncer and a read replica.",
      contextHe: "Black Friday שרד אבל עם חוב תפעולי. RDS 4xlarge טיפל בחיבורים ב-78% CPU בשיא. עלות כוללת: $18K לשבוע (פי 4 מהתקציב). שבועיים אחרי האירוע, מופע ה-4xlarge עדיין רץ - אף אחד לא זכר להקטין, מה שהוסיף $2,800 לחשבון החודשי.",
      question: null, options: []
    },
    end_queue_lag: {
      id: "end_queue_lag",
      context: "SQS queuing caused 3-5 second delays for cart add/remove operations. Users saw spinner animations instead of instant UI updates. Checkout conversion dropped 35% compared to last year - users abandoned carts believing the site was broken. System was technically stable (zero errors) but commercially devastating. Revenue impact estimated at $200K. Post-mortem conclusion: the system was optimized for throughput stability when it should have been optimized for user-perceived latency.",
      contextHe: "תורי SQS גרמו לעיכובים של 3-5 שניות לפעולות הוספה/הסרה מעגלה. משתמשים ראו אנימציות spinner במקום עדכוני UI מיידיים. המרת checkout ירדה ב-35% בהשוואה לשנה שעברה - משתמשים נטשו עגלות בחשיבה שהאתר תקול. המערכת הייתה יציבה טכנית (אפס שגיאות) אבל הרסנית מסחרית.",
      question: null, options: []
    },
    end_db_split_rush: {
      id: "end_db_split_rush",
      context: "Database split caused a data consistency incident on Black Friday morning. Cart service wrote to the new DB while inventory checks queried the old one. Result: 47 products oversold, some by 10x. Customer service received 200+ complaints. Refund processing took 2 weeks. The database split was rolled back at 11 AM on Black Friday - reverting to the connection-limited single database under peak load, causing a 45-minute degraded performance window.",
      contextHe: "פיצול ה-DB גרם לתקרית עקביות נתונים בבוקר Black Friday. שירות העגלה כתב ל-DB החדש בזמן שבדיקות מלאי שאלו את הישן. תוצאה: 47 מוצרים נמכרו ביתר, חלקם פי 10. שירות לקוחות קיבל 200+ תלונות. עיבוד החזרים לקח שבועיים.",
      question: null, options: []
    },
    end_panic_scale: {
      id: "end_panic_scale",
      context: "Everything maxed out without CDN or connection pooling. AWS bill: $45K for the week (normally $3K). Without CDN, backend pods served static images at 800ms latency. Without connection pooling, DB connections maxed out during the peak hour, causing 5-minute timeout errors during checkout. Revenue was 25% below forecast despite high traffic. Post-mortem identified that $5K of targeted CDN + PgBouncer investment would have outperformed $45K of brute-force scaling.",
      contextHe: "הכל במקסימום ללא CDN או connection pooling. חשבון AWS: $45K לשבוע (רגיל $3K). ללא CDN, pods של backend הגישו תמונות סטטיות ב-800ms. ללא connection pooling, חיבורי DB הגיעו למקסימום בשעת השיא, וגרמו לשגיאות timeout של 5 דקות ב-checkout. הכנסות 25% מתחת לתחזית.",
      question: null, options: []
    },
    end_hybrid_mess: {
      id: "end_hybrid_mess",
      context: "Hybrid architecture caused a cascading failure at 9 AM on Black Friday. A Lambda function handling payment confirmation timed out (15-second Lambda limit) while waiting for an EKS-hosted inventory service that was under load. The timeout triggered a retry, which created a duplicate payment charge for 23 customers. Diagnosing the issue required correlating logs across CloudWatch (Lambda) and EKS pod logs - taking 4 hours to identify and fix. The rollback to pure EKS happened at 1 PM, losing the peak morning traffic window.",
      contextHe: "ארכיטקטורה היברידית גרמה לכשל מדורג ב-9 בבוקר של Black Friday. פונקציית Lambda שמטפלת באישור תשלום עשתה timeout (מגבלת 15 שניות של Lambda) בזמן המתנה לשירות מלאי על EKS תחת עומס. ה-timeout הפעיל retry שיצר חיוב כפול ל-23 לקוחות. אבחון הבעיה דרש מיתאם לוגים על פני CloudWatch (Lambda) ולוגי EKS pods - לקח 4 שעות.",
      question: null, options: []
    },
    end_wasteful: {
      id: "end_wasteful",
      context: "System survived Black Friday but the database was the actual bottleneck. 120 pods were fine - 5% CPU. But DB connections maxed out at 360/200, causing connection refusal errors during the 2-hour peak window. The $12K spent on idle compute pods did nothing to prevent the database failure. A $50/month PgBouncer deployment would have solved the actual constraint. Total cost: $12K for compute + lost revenue from 2 hours of degraded checkout = estimated $80K total impact.",
      contextHe: "המערכת שרדה את Black Friday אבל ה-DB היה צוואר הבקבוק האמיתי. 120 pods היו בסדר - 5% CPU. אבל חיבורי DB הגיעו ל-360/200, וגרמו לשגיאות סירוב חיבור בחלון השיא של שעתיים. $12K שהוצאו על pods חישוב בטלים לא עשו כלום למנוע את כשל ה-DB. פריסת PgBouncer ב-$50 לחודש הייתה פותרת את האילוץ האמיתי.",
      question: null, options: []
    }
  }
};
