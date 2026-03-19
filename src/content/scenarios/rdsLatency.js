// ── Scenario 1: RDS Bottleneck Under Load ──────────────────────────────────
// Each option has a `tag` (en/he) for the outcome label shown in the UI,
// replacing generic "good/bad" with engineering-specific impact language.

export default {
  id: "rds-latency",
  title: "RDS Latency Under Load",
  titleHe: "Bottleneck ב-RDS תחת עומס",
  description: "Your PostgreSQL RDS instance is choking under a 5x traffic spike. Diagnose and resolve the bottleneck before users start churning.",
  descriptionHe: "מופע ה-PostgreSQL RDS שלך נחנק תחת עלייה של פי 5 בתעבורה. אבחן ופתור את ה-bottleneck לפני שמשתמשים מתחילים לנטוש.",
  difficulty: "medium",
  estimatedTime: "5-7 min",
  tags: ["AWS", "RDS", "PostgreSQL", "Scaling"],
  icon: "🗄️",
  initialMetrics: { performance: 50, cost: 50, reliability: 50 },
  initialSystemState: {
    latency: 2400,        // ms - API latency
    errorRate: 2,         // % of requests failing
    cpuPercent: 94,       // RDS CPU
    connections: "180/200", // connection count string
    maxConnections: 200,
    costPerMonth: 400,    // $ baseline RDS cost
    stability: "degraded" // "healthy" | "degraded" | "critical"
  },
  steps: {
    start: {
      id: "start",
      context: "Your production system runs on EKS with a PostgreSQL RDS (db.r5.large, single-AZ). Traffic has increased 5x over the past hour. API latency jumped from 80ms to 2.4s. CloudWatch shows RDS CPU at 94% and read IOPS maxed out. Connection count is at 180/200 limit.",
      contextHe: "המערכת שלך רצה על EKS עם PostgreSQL RDS (db.r5.large, AZ בודד). התעבורה עלתה פי 5 בשעה האחרונה. זמן התגובה קפץ מ-80ms ל-2.4 שניות. CloudWatch מראה CPU של RDS ב-94% ו-Read IOPS במקסימום. מספר החיבורים 180 מתוך 200.",
      question: "What should you investigate first?",
      questionHe: "מה כדאי לבדוק קודם?",
      alerts: [
        { type: "critical", source: "CloudWatch", text: "RDS CPU utilization at 94% - threshold 80%", textHe: "ניצולת CPU של RDS ב-94% - סף 80%" },
        { type: "info", source: "CloudTrail", text: "IAM role arn:aws:iam::123/eks-node rotated successfully", textHe: "תפקיד IAM arn:aws:iam::123/eks-node רוטט בהצלחה", noise: true },
        { type: "warning", source: "PagerDuty", text: "API p99 latency exceeded 2s SLA", textHe: "השהיית p99 של API חרגה מ-SLA של 2 שניות" },
        { type: "warning", source: "CloudWatch", text: "RDS Read IOPS at provisioned limit (3,000)", textHe: "Read IOPS של RDS בגבול המוקצה (3,000)" },
      ],
      logs: [
        { level: "error", timestamp: "14:23:05", text: "FATAL: remaining connection slots are reserved for superuser" },
        { level: "info", timestamp: "14:22:58", text: "cron: daily vacuum analyze on pg_catalog completed (12s)", noise: true },
        { level: "warn", timestamp: "14:23:01", text: "LOG: duration: 8234.192 ms  statement: SELECT * FROM orders WHERE customer_id = 4821" },
        { level: "warn", timestamp: "14:22:58", text: "LOG: duration: 5121.33 ms  statement: SELECT o.*, oi.* FROM orders o JOIN order_items oi..." },
      ],
      options: [
        {
          text: "Scale up the RDS instance to a larger class",
          textHe: "שדרג את מופע ה-RDS לגודל גדול יותר",
          nextStep: "scaled_rds",
          impact: { performance: 10, cost: -15, reliability: 5 },
          tag: "Symptom treatment",
          tagHe: "טיפול בסימפטום",
          explanation: "Vertical scaling buys temporary headroom but doesn't address root cause. The db.r5.large to r5.2xlarge upgrade requires a reboot (downtime in single-AZ), costs 2x more per hour, and the CPU/IOPS saturation pattern suggests inefficient queries — not insufficient hardware. You're spending money to run the same bad queries on a bigger machine.",
          explanationHe: "שדרוג אנכי קונה מרווח זמני אבל לא מטפל בשורש הבעיה. השדרוג מ-db.r5.large ל-r5.2xlarge דורש reboot (downtime ב-AZ בודד), עולה פי 2 לשעה, ודפוס רוויית CPU/IOPS מרמז על שאילתות לא יעילות - לא חומרה לא מספקת. אתה משלם כדי להריץ את אותן שאילתות גרועות על מכונה גדולה יותר.",
          stateEffect: {
            latency: 1200,
            cpuPercent: 60,
            costPerMonth: 800,
            stability: "degraded",
          }
        },
        {
          text: "Check slow query logs and identify top queries",
          textHe: "בדוק את לוג השאילתות האיטיות וזהה את השאילתות המובילות",
          nextStep: "found_queries",
          impact: { performance: 5, cost: 0, reliability: 5 },
          tag: "Root cause analysis",
          tagHe: "ניתוח שורש הבעיה",
          explanation: "Before committing resources, you identify what's actually consuming them. The slow query log reveals 3 unindexed queries responsible for 70% of CPU load: a full table scan on the 50M-row orders table, a 4-table JOIN without covering indexes, and an N+1 pattern from the API layer generating ~150 queries per request. This data-driven approach prevents wasted spend and targets the actual bottleneck.",
          explanationHe: "לפני שמקצים משאבים, אתה מזהה מה בעצם צורך אותם. לוג השאילתות חושף 3 שאילתות ללא אינדקס שאחראיות ל-70% מעומס ה-CPU: סריקה מלאה על טבלת orders עם 50M שורות, JOIN על 4 טבלאות ללא אינדקסים מכסים, ותבנית N+1 מהשכבת API שמייצרת כ-150 שאילתות לכל בקשה. גישה מונעת-נתונים זו מונעת הוצאה מיותרת ומכוונת לצוואר הבקבוק האמיתי.",
          stateEffect: {
            // diagnostic action - no immediate state change
          }
        },
        {
          text: "Add more EKS pods to distribute the load",
          textHe: "הוסף עוד Pods ב-EKS כדי לפזר את העומס",
          nextStep: "more_pods",
          impact: { performance: -5, cost: -8, reliability: -10 },
          tag: "Amplifies bottleneck",
          tagHe: "מגביר את צוואר הבקבוק",
          explanation: "The bottleneck is the database, not compute capacity. Each new pod opens its own connection pool to RDS. With connections at 180/200, adding pods will push past max_connections within minutes, causing connection refusal errors across all services — not just slower responses, but hard failures. This converts a latency problem into an availability incident.",
          explanationHe: "צוואר הבקבוק הוא מסד הנתונים, לא כוח חישוב. כל pod חדש פותח מאגר חיבורים משלו ל-RDS. עם חיבורים ב-180/200, הוספת pods תדחוף מעבר ל-max_connections תוך דקות, ויגרום לשגיאות סירוב חיבור בכל השירותים — לא רק תגובות איטיות, אלא כשלים קשיחים. זה ממיר בעיית השהיה לתקרית זמינות.",
          stateEffect: {
            connections: "210/200",
            errorRate: 15,
            stability: "critical",
            pendingConsequences: [{ triggerAt: "*", effect: { errorRate: 25 } }],
          }
        },
        {
          text: "Enable RDS Multi-AZ for better availability",
          textHe: "הפעל Multi-AZ ב-RDS לזמינות גבוהה יותר",
          nextStep: "multi_az_first",
          impact: { performance: 0, cost: -12, reliability: 8 },
          tag: "Misidentified priority",
          tagHe: "סדר עדיפויות שגוי",
          explanation: "Multi-AZ provides automatic failover to a standby replica in another availability zone, improving disaster recovery. However, the standby is not accessible for read queries — it sits idle until a failover event. This doubles your RDS cost without reducing the CPU/IOPS saturation causing the latency. It solves a problem you don't currently have (single-AZ failure) while ignoring the one you do (query performance).",
          explanationHe: "Multi-AZ מספק failover אוטומטי לרפליקה ב-AZ אחר, משפר התאוששות מאסון. אבל ה-standby לא נגיש לשאילתות קריאה — הוא יושב בטל עד אירוע failover. זה מכפיל את עלות ה-RDS בלי להפחית את רוויית ה-CPU/IOPS שגורמת להשהיה. זה פותר בעיה שלא קיימת כרגע (כשל AZ בודד) תוך התעלמות מזו שכן (ביצועי שאילתות).",
          stateEffect: {
            costPerMonth: 800,
            latency: 2400,
            cpuPercent: 94,
            stability: "degraded",
          }
        }
      ]
    },
    found_queries: {
      id: "found_queries",
      timeDelta: "15 minutes into investigation...",
      timeDeltaHe: "15 דקות לתוך החקירה...",
      context: "You found 3 problematic queries: (1) A full table scan on a 50M row `orders` table — no index on the `customer_id` filter column, (2) A JOIN across 4 tables using nested loop joins instead of hash joins due to missing composite indexes, (3) An N+1 query pattern from the API layer — fetching order items one-by-one instead of batch loading. Together they account for 70% of DB CPU.",
      contextHe: "מצאת 3 שאילתות בעייתיות: (1) סריקה מלאה על טבלת orders עם 50M שורות — אין אינדקס על עמודת הסינון customer_id, (2) JOIN על 4 טבלאות שמשתמש ב-nested loop joins במקום hash joins בגלל אינדקסים מורכבים חסרים, (3) תבנית N+1 מהשכבת API — שליפת פריטי הזמנה אחד-אחד במקום טעינה מרוכזת. ביחד הן אחראיות ל-70% מצריכת CPU של ה-DB.",
      question: "How do you address these query issues?",
      questionHe: "איך תטפל בבעיות השאילתות?",
      alerts: [
        { type: "info", source: "pg_stat", text: "Top 3 queries by total_exec_time identified - 70% of CPU load", textHe: "3 השאילתות המובילות לפי total_exec_time זוהו - 70% מעומס CPU" },
        { type: "info", source: "Datadog", text: "EKS node i-0a3f memory at 67% - within normal range", textHe: "node של EKS i-0a3f זיכרון ב-67% - בטווח נורמלי", noise: true },
        { type: "warning", source: "CloudWatch", text: "RDS CPU still elevated - 90%+ sustained for 45 minutes", textHe: "CPU של RDS עדיין גבוה - 90%+ מתמשך כבר 45 דקות" },
      ],
      logs: [
        { level: "warn", timestamp: "14:35:12", text: "LOG: duration: 8234.192 ms  statement: SELECT * FROM orders WHERE customer_id = 4821" },
        { level: "warn", timestamp: "14:35:10", text: "LOG: duration: 6102.45 ms  statement: SELECT o.id, c.name, p.title, oi.qty FROM orders o JOIN customers c ON... JOIN order_items oi ON... JOIN products p ON..." },
        { level: "info", timestamp: "14:35:08", text: "EXPLAIN ANALYZE: Seq Scan on orders  (cost=0.00..1250412.00 rows=49823 width=218) actual time=2.1..8201.3 rows=12 loops=1" },
      ],
      options: [
        {
          text: "Add indexes and deploy a hotfix for the N+1 pattern",
          textHe: "הוסף אינדקסים ופרוס hotfix לתבנית ה-N+1",
          nextStep: "optimized_queries",
          impact: { performance: 25, cost: 5, reliability: 10 },
          tag: "Targets root cause",
          tagHe: "מטפל בשורש הבעיה",
          explanation: "Adding a B-tree index on orders(customer_id) eliminates the full table scan — query time drops from ~8s to ~15ms. Composite indexes on the JOIN tables switch the planner from nested loops to hash joins. Fixing the N+1 at the app layer (batch SELECT with IN clause) reduces per-request query count from ~150 to 2, immediately freeing ~60% of connection pool. Combined effect: CPU drops from 94% to ~45%, latency returns to ~200ms. This is the highest-leverage fix because it reduces load without adding infrastructure cost.",
          explanationHe: "הוספת אינדקס B-tree על orders(customer_id) מבטלת את הסריקה המלאה — זמן שאילתה יורד מ-8 שניות ל-15ms בערך. אינדקסים מורכבים על טבלאות ה-JOIN מעבירים את ה-planner מ-nested loops ל-hash joins. תיקון ה-N+1 בשכבת האפליקציה (SELECT מרוכז עם IN clause) מפחית מספר שאילתות לבקשה מ-150 ל-2, ומשחרר מיידית 60% ממאגר החיבורים. תוצאה משולבת: CPU יורד מ-94% ל-45% בערך, השהיה חוזרת ל-200ms. זה התיקון עם המינוף הגבוה ביותר כי הוא מפחית עומס ללא עלות תשתית נוספת.",
          stateEffect: {
            latency: 200,
            cpuPercent: 45,
            connections: "60/200",
            errorRate: 0,
            stability: "healthy",
          }
        },
        {
          text: "Add a Redis cache layer in front of the database",
          textHe: "הוסף שכבת Redis cache מול המסד",
          nextStep: "cache_without_fix",
          impact: { performance: 10, cost: -8, reliability: -3 },
          tag: "Premature optimization",
          tagHe: "אופטימיזציה מוקדמת",
          explanation: "Caching can reduce DB load for repeated identical queries, but the problematic queries here are user-specific (customer_id filters) and time-varying (recent orders). Expected cache hit rate: ~30%. The 70% cache misses still execute the same unindexed full table scans, so the DB remains saturated during peak traffic. Meanwhile, you've added a new infrastructure dependency (ElastiCache), cache invalidation complexity, and ~$150/month cost — all to mask an indexing problem that costs $0 to fix.",
          explanationHe: "Caching יכול להפחית עומס DB לשאילתות חוזרות זהות, אבל השאילתות הבעייתיות כאן ספציפיות למשתמש (פילטרי customer_id) ומשתנות בזמן (הזמנות אחרונות). שיעור פגיעות cache צפוי: 30% בערך. 70% ה-cache misses עדיין מריצים את אותן סריקות מלאות ללא אינדקס, כך שה-DB נשאר רווי בשעת שיא. בינתיים, הוספת תלות תשתית חדשה (ElastiCache), מורכבות cache invalidation, ועלות של 150$ לחודש בערך — הכל כדי להסתיר בעיית אינדקס שעולה $0 לתקן.",
          stateEffect: {
            latency: 1800,
            cpuPercent: 80,
            costPerMonth: 550,
            errorRate: 2,
            stability: "degraded",
          }
        },
        {
          text: "Create read replicas to offload read traffic",
          textHe: "צור Read Replicas כדי לפזר תעבורת קריאה",
          nextStep: "replicas_without_fix",
          impact: { performance: 8, cost: -12, reliability: 3 },
          tag: "Horizontal cost without root fix",
          tagHe: "עלות אופקית ללא תיקון שורשי",
          explanation: "Read replicas distribute query load across multiple instances, which helps — but the same unoptimized queries run on every replica. A full table scan on 50M rows takes the same CPU whether it runs on the primary or a replica. You're paying for 2x the hardware to run queries that could be 500x faster with proper indexes. The replica does provide read scaling headroom for the future, but right now it's treating the symptom (too much load on one instance) rather than the disease (queries doing 500x more I/O than necessary).",
          explanationHe: "Read replicas מפזרים עומס שאילתות על מספר מופעים, מה שעוזר — אבל אותן שאילתות לא מותאמות רצות על כל replica. סריקה מלאה על 50M שורות לוקחת אותו CPU בין אם היא רצה על ה-primary או על replica. אתה משלם פי 2 על חומרה להרצת שאילתות שיכולות להיות מהירות פי 500 עם אינדקסים מתאימים. ה-replica כן מספק מרווח סקיילינג קריאה לעתיד, אבל כרגע הוא מטפל בסימפטום (יותר מדי עומס על מופע אחד) ולא במחלה (שאילתות שעושות פי 500 I/O מהנדרש).",
          stateEffect: {
            latency: 1500,
            cpuPercent: 85,
            costPerMonth: 800,
            stability: "degraded",
          }
        }
      ]
    },
    optimized_queries: {
      id: "optimized_queries",
      timeDelta: "45 minutes later. Indexes deployed, N+1 hotfix live.",
      timeDeltaHe: "45 דקות מאוחר יותר. אינדקסים נפרסו, hotfix ל-N+1 חי.",
      context: "After deploying index fixes and the N+1 hotfix, RDS CPU dropped to 45% and latency is back to 200ms. Connection usage is down to 60/200. But traffic is still growing — your PM says a marketing campaign launches next week expecting another 3x spike on top of current levels.",
      contextHe: "אחרי פריסת תיקוני האינדקסים וה-hotfix ל-N+1, ה-CPU של RDS ירד ל-45% וההשהיה חזרה ל-200ms. שימוש בחיבורים ירד ל-60/200. אבל התעבורה ממשיכה לגדול — מנהל המוצר אומר שקמפיין שיווקי בשבוע הבא צפוי לעלייה נוספת של פי 3 מעל הרמות הנוכחיות.",
      question: "How do you prepare for the upcoming traffic surge?",
      questionHe: "איך תתכונן לגל התעבורה הקרוב?",
      alerts: [
        { type: "resolved", source: "CloudWatch", text: "RDS CPU dropped to 45% - returning to normal", textHe: "CPU של RDS ירד ל-45% - חוזר לנורמלי" },
        { type: "resolved", source: "PagerDuty", text: "API p99 latency back within 2s SLA (200ms)", textHe: "השהיית p99 של API חזרה לתוך SLA של 2 שניות (200ms)" },
        { type: "info", source: "Terraform", text: "Drift detected: security group sg-0f2a has 1 unmanaged rule", textHe: "סטייה זוהתה: security group sg-0f2a עם כלל אחד לא מנוהל", noise: true },
        { type: "warning", source: "PM", text: "Marketing campaign launches next week - expecting 3x traffic", textHe: "קמפיין שיווקי מושק בשבוע הבא - צפוי פי 3 תעבורה" },
      ],
      logs: [
        { level: "info", timestamp: "15:10:22", text: "CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders(customer_id) -- completed in 42s" },
        { level: "info", timestamp: "15:10:30", text: "LOG: duration: 14.7 ms  statement: SELECT * FROM orders WHERE customer_id = 4821" },
      ],
      options: [
        {
          text: "Add a read replica + connection pooling (PgBouncer)",
          textHe: "הוסף Read Replica + Connection Pooling (PgBouncer)",
          nextStep: "end_optimal",
          impact: { performance: 18, cost: -8, reliability: 15 },
          tag: "Production-grade scaling",
          tagHe: "סקיילינג ברמת ייצור",
          explanation: "With queries now optimized, a read replica actually delivers value — offloading analytics and catalog reads from the primary, reserving write capacity for transactions. PgBouncer in transaction pooling mode multiplexes connections so 60+ pods can share a pool of 50 DB connections, preventing connection exhaustion at 3x scale. Combined cost increase is ~40% (one replica + small PgBouncer pod) while handling 3x traffic — a strong cost/performance ratio. This is the standard production pattern for PostgreSQL horizontal scaling.",
          explanationHe: "עם שאילתות מותאמות עכשיו, read replica באמת מספק ערך — מפנה שאילתות אנליטיקה וקטלוג מה-primary, שומר קיבולת כתיבה לטרנזקציות. PgBouncer במצב transaction pooling מנהל חיבורים כך ש-60+ pods יכולים לשתף מאגר של 50 חיבורי DB, ומונע מיצוי חיבורים בסקייל פי 3. עליית עלות משולבת היא 40% בערך (replica אחד + pod קטן של PgBouncer) תוך טיפול בפי 3 תעבורה — יחס עלות/ביצועים חזק.",
          stateEffect: {
            latency: 60,
            cpuPercent: 45,
            connections: "45/200",
            costPerMonth: 560,
            errorRate: 0,
            stability: "healthy",
          }
        },
        {
          text: "Migrate to Aurora Serverless for auto-scaling",
          textHe: "מגר ל-Aurora Serverless לסקיילינג אוטומטי",
          nextStep: "end_aurora",
          impact: { performance: 10, cost: -15, reliability: 5 },
          tag: "High-risk migration under pressure",
          tagHe: "מיגרציה בסיכון גבוה תחת לחץ",
          explanation: "Aurora Serverless v2 provides automatic read/write scaling and eliminates connection management overhead. However, migrating a production PostgreSQL instance to Aurora requires: (1) schema compatibility validation, (2) pg_dump/restore or DMS migration with downtime or replication lag, (3) testing for Aurora-specific behavioral differences (e.g., storage I/O model, failover behavior). Doing this in one week while a campaign launches introduces significant risk of production disruption. Aurora is a strong long-term choice, but the timing creates unnecessary operational risk.",
          explanationHe: "Aurora Serverless v2 מספק סקיילינג אוטומטי ומבטל תקורת ניהול חיבורים. אבל, מיגרציה של מופע PostgreSQL בייצור ל-Aurora דורשת: (1) אימות תאימות סכמה, (2) מיגרציה עם pg_dump/restore או DMS עם downtime או replication lag, (3) בדיקות להבדלי התנהגות ספציפיים ל-Aurora. לעשות את זה בשבוע אחד כשקמפיין מושק מכניס סיכון משמעותי של שיבוש ייצור. Aurora היא בחירה חזקה לטווח ארוך, אבל התזמון יוצר סיכון תפעולי מיותר.",
          stateEffect: {
            latency: 200,
            cpuPercent: 45,
            costPerMonth: 600,
            stability: "degraded",
            pendingConsequences: [{ triggerAt: "*", effect: { stability: "critical", errorRate: 5 } }],
          }
        },
        {
          text: "Scale up to db.r5.4xlarge and hope it holds",
          textHe: "שדרג ל-db.r5.4xlarge ותקווה לטוב",
          nextStep: "end_vertical",
          impact: { performance: 8, cost: -20, reliability: 0 },
          tag: "Vertical scaling ceiling",
          tagHe: "תקרת שדרוג אנכי",
          explanation: "Vertical scaling has a hard ceiling (db.r5.24xlarge is the max) and costs grow faster than linearly — 4xlarge is 4x the cost but gives only ~3x the capacity due to memory bus contention and PostgreSQL's single-writer architecture. At 3x the upcoming traffic spike, you'll consume ~135% of the 4xlarge capacity, hitting the same wall again with fewer options and a much larger bill. Without horizontal scaling (replicas, connection pooling), you're locked into an increasingly expensive single point of failure.",
          explanationHe: "לשדרוג אנכי יש תקרה קשיחה (db.r5.24xlarge הוא המקסימום) והעלויות גדלות מהר יותר מלינארית — 4xlarge עולה פי 4 אבל נותן רק פי 3 בערך קיבולת בגלל memory bus contention וארכיטקטורת single-writer של PostgreSQL. בפי 3 תעבורה הצפויה, תצרוך כ-135% מקיבולת ה-4xlarge, ותפגע באותו קיר שוב עם פחות אפשרויות וחשבון גדול בהרבה.",
          stateEffect: {
            latency: 150,
            cpuPercent: 45,
            costPerMonth: 1600,
            stability: "degraded",
          }
        }
      ]
    },
    scaled_rds: {
      id: "scaled_rds",
      timeDelta: "20 minutes later. Instance upgrade completed after reboot.",
      timeDeltaHe: "20 דקות מאוחר יותר. שדרוג מופע הושלם אחרי reboot.",
      context: "You scaled to db.r5.2xlarge. CPU dropped to 60% but latency is still at 1.2s — the unindexed queries are faster with more CPU but still fundamentally inefficient. The bill jumped from $400/month to $800/month. Your CTO is asking why costs spiked without proportional performance improvement.",
      contextHe: "שדרגת ל-db.r5.2xlarge. ה-CPU ירד ל-60% אבל ההשהיה עדיין 1.2 שניות — השאילתות ללא אינדקס מהירות יותר עם יותר CPU אבל עדיין לא יעילות ביסודן. החשבון קפץ מ-$400 ל-$800 לחודש. ה-CTO שואל למה העלויות זינקו ללא שיפור ביצועים פרופורציונלי.",
      question: "Latency is still high despite the upgrade. What now?",
      questionHe: "ההשהיה עדיין גבוהה למרות השדרוג. מה עכשיו?",
      alerts: [
        { type: "info", source: "CloudWatch", text: "RDS CPU at 60% after instance upgrade to r5.2xlarge", textHe: "CPU של RDS ב-60% אחרי שדרוג מופע ל-r5.2xlarge" },
        { type: "info", source: "AWS Health", text: "Scheduled maintenance for us-east-1c on 2024-03-15 (not your AZ)", textHe: "תחזוקה מתוכננת ל-us-east-1c ב-2024-03-15 (לא ה-AZ שלך)", noise: true },
        { type: "warning", source: "Slack", text: "CTO: Why did AWS costs double overnight? Need justification ASAP", textHe: "CTO: למה עלויות AWS הוכפלו בין לילה? צריך הצדקה בהקדם" },
        { type: "warning", source: "Datadog", text: "API p99 latency still at 1.2s - user complaints continuing", textHe: "השהיית p99 של API עדיין 1.2 שניות - תלונות משתמשים נמשכות" },
      ],
      logs: [
        { level: "warn", timestamp: "14:45:22", text: "LOG: duration: 4102.88 ms  statement: SELECT * FROM orders WHERE customer_id = 9012" },
        { level: "info", timestamp: "14:45:18", text: "LOG: checkpoint complete: wrote 8234 buffers (50.2%); 0 WAL file(s) added" },
      ],
      options: [
        {
          text: "Now check the slow query logs",
          textHe: "עכשיו בדוק את לוג השאילתות האיטיות",
          nextStep: "found_queries",
          impact: { performance: 0, cost: 0, reliability: 0 },
          tag: "Course correction",
          tagHe: "תיקון מסלול",
          explanation: "The right diagnostic step — should have been first. The 2xlarge upgrade bought headroom (CPU 60% vs 94%) but the persistent high latency proves the problem isn't hardware capacity. Slow query analysis will reveal the real bottleneck. The $400/month extra spend wasn't wasted entirely — it stabilized the system — but it would have been unnecessary had you started here.",
          explanationHe: "צעד האבחון הנכון — היה צריך להיות ראשון. השדרוג ל-2xlarge קנה מרווח (CPU 60% לעומת 94%) אבל ההשהיה הגבוהה המתמשכת מוכיחה שהבעיה היא לא קיבולת חומרה. ניתוח שאילתות איטיות יחשוף את צוואר הבקבוק האמיתי. ההוצאה הנוספת של $400 לחודש לא בוזבזה לחלוטין — היא ייצבה את המערכת — אבל הייתה מיותרת אם היית מתחיל כאן.",
          stateEffect: {
            // diagnostic action - no immediate state change
          }
        },
        {
          text: "Scale up again to db.r5.4xlarge",
          textHe: "שדרג שוב ל-db.r5.4xlarge",
          nextStep: "end_money_pit",
          impact: { performance: 5, cost: -22, reliability: 0 },
          tag: "Diminishing returns",
          tagHe: "תשואה פוחתת",
          explanation: "Doubling hardware again without understanding why latency persists is an escalating cost spiral. The 2xlarge dropped CPU by 34% but latency only improved by 50% — this sublinear relationship means the 4xlarge will drop latency to maybe 800ms at 4x the original cost. You're treating a software problem (missing indexes, N+1 patterns) with hardware, paying exponentially more for each marginal improvement. Your AWS bill is now $1,600/month for what a $0 index fix could solve.",
          explanationHe: "הכפלת חומרה שוב בלי להבין למה ההשהיה נמשכת היא ספירלת עלויות מתגברת. ה-2xlarge הוריד CPU ב-34% אבל השהיה השתפרה רק ב-50% — יחס תת-לינארי זה אומר שה-4xlarge יוריד השהיה אולי ל-800ms בעלות פי 4 מהמקור. אתה מטפל בבעיית תוכנה (אינדקסים חסרים, תבניות N+1) עם חומרה, ומשלם אקספוננציאלית יותר על כל שיפור שולי.",
          stateEffect: {
            latency: 800,
            cpuPercent: 40,
            costPerMonth: 1600,
            stability: "degraded",
          }
        }
      ]
    },
    more_pods: {
      id: "more_pods",
      timeDelta: "3 minutes later. Pods scaling up...",
      timeDeltaHe: "3 דקות מאוחר יותר. Pods עולים...",
      newIssues: [
        { text: "Connection pool exhausted: new pods exceeded RDS max_connections limit", textHe: "מאגר חיבורים נוצל: pods חדשים חרגו ממגבלת max_connections של RDS" },
      ],
      context: "You scaled pods from 8 to 20. RDS connection count hit 200/200 and the database started refusing new connections. API pods are crash-looping with 'FATAL: too many connections' errors. Existing requests are timing out as the connection pool is fully contended. PagerDuty is firing SEV-1.",
      contextHe: "הגדלת Pods מ-8 ל-20. מספר החיבורים ל-RDS הגיע ל-200/200 והמסד מסרב חיבורים חדשים. API Pods נופלים עם שגיאות 'FATAL: too many connections'. בקשות קיימות עושות timeout כי מאגר החיבורים לחלוטין תפוס. PagerDuty מתריע SEV-1.",
      question: "Connections are maxed out and services are failing. How do you recover?",
      questionHe: "החיבורים במקסימום ושירותים נכשלים. איך תשתקם?",
      alerts: [
        { type: "critical", source: "PagerDuty", text: "SEV-1: API error rate at 25% - multiple pods in CrashLoopBackOff", textHe: "SEV-1: שיעור שגיאות API ב-25% - מספר pods ב-CrashLoopBackOff" },
        { type: "warning", source: "Kubernetes", text: "Pod anti-affinity rule triggered - scheduling constraint warning", textHe: "כלל anti-affinity של pod הופעל - אזהרת אילוץ תזמון", noise: true },
        { type: "critical", source: "CloudWatch", text: "RDS connections at 200/200 - new connections refused", textHe: "חיבורי RDS ב-200/200 - חיבורים חדשים נדחים" },
        { type: "warning", source: "Slack", text: "#incidents: Users reporting 502 errors across all endpoints", textHe: "#incidents: משתמשים מדווחים על שגיאות 502 בכל הנקודות" },
      ],
      logs: [
        { level: "error", timestamp: "14:30:15", text: "FATAL: too many connections for role \"app_user\"" },
        { level: "error", timestamp: "14:30:14", text: "FATAL: remaining connection slots are reserved for non-replication superuser connections" },
        { level: "error", timestamp: "14:30:12", text: "pod/api-server-7f8d4-xk2p9 CrashLoopBackOff: connection pool exhausted on startup" },
      ],
      options: [
        {
          text: "Scale pods back down and add PgBouncer for connection pooling",
          textHe: "הקטן את מספר ה-Pods והוסף PgBouncer לניהול חיבורים",
          nextStep: "found_queries",
          impact: { performance: 8, cost: 3, reliability: 8 },
          tag: "Stabilization + investigation",
          tagHe: "ייצוב + חקירה",
          explanation: "Scaling back to 8 pods immediately stops the connection hemorrhage. PgBouncer in transaction pooling mode allows even 20 pods to share a pool of ~50 actual DB connections, since most connections are idle between queries. This stabilizes the system and restores availability. Now you can safely investigate the actual database bottleneck without the pressure of a SEV-1 outage. The connection pooler also becomes permanent infrastructure — it's valuable regardless of what the root cause turns out to be.",
          explanationHe: "הקטנה חזרה ל-8 pods עוצרת מיידית את דימום החיבורים. PgBouncer במצב transaction pooling מאפשר אפילו ל-20 pods לשתף מאגר של 50 חיבורי DB בפועל בערך, כי רוב החיבורים בטלים בין שאילתות. זה מייצב את המערכת ומשקם זמינות. עכשיו אפשר לחקור בבטחה את צוואר הבקבוק של ה-DB ללא לחץ של תקרית SEV-1.",
          stateEffect: {
            connections: "80/200",
            errorRate: 2,
            cpuPercent: 90,
            latency: 2200,
            stability: "degraded",
          }
        },
        {
          text: "Increase max_connections on RDS to 500",
          textHe: "הגדל את max_connections ב-RDS ל-500",
          nextStep: "end_oom",
          impact: { performance: -8, cost: 0, reliability: -15 },
          tag: "Memory exhaustion risk",
          tagHe: "סיכון מיצוי זיכרון",
          explanation: "Each PostgreSQL backend process consumes 5-10MB of RAM for work_mem, temp_buffers, and connection overhead. On an r5.large (16GB RAM), 500 connections would consume 2.5-5GB just for connection overhead, leaving significantly less memory for shared_buffers (query cache) and OS page cache. PostgreSQL performance degrades sharply when shared_buffers can't hold the working set — queries that were hitting cache start doing disk I/O. At high connection counts, you'll also see lock contention on ProcArrayLock and WAL insertion locks. The likely outcome: OOM killer terminates backends, or the instance starts swapping and latency jumps to 10s+.",
          explanationHe: "כל תהליך backend של PostgreSQL צורך 5-10MB RAM ל-work_mem, temp_buffers, ותקורת חיבור. על r5.large (16GB RAM), 500 חיבורים יצרכו 2.5-5GB רק לתקורת חיבורים, ישאירו פחות זיכרון משמעותית ל-shared_buffers (query cache) ו-OS page cache. ביצועי PostgreSQL מתדרדרים בחדות כש-shared_buffers לא יכולים להכיל את ה-working set. התוצאה הסבירה: OOM killer יהרוג תהליכי backend, או שהמופע יתחיל swapping והשהיה תקפוץ ל-10 שניות+.",
          stateEffect: {
            maxConnections: 500,
            connections: "210/500",
            cpuPercent: 98,
            latency: 10000,
            errorRate: 30,
            stability: "critical",
          }
        }
      ]
    },
    multi_az_first: {
      id: "multi_az_first",
      timeDelta: "30 minutes later. Multi-AZ standby provisioning complete.",
      timeDeltaHe: "30 דקות מאוחר יותר. הקצאת standby של Multi-AZ הושלמה.",
      context: "Multi-AZ is now enabled. Your monthly RDS bill increased by ~$400 (standby instance). The standby is running but not serving traffic — Multi-AZ standbys are not accessible for read queries. Latency remains at 2.4s. Users are still complaining.",
      contextHe: "Multi-AZ מופעל. חשבון ה-RDS החודשי עלה ב-$400 בערך (מופע standby). ה-standby רץ אבל לא משרת תעבורה — standby של Multi-AZ לא נגיש לשאילתות קריאה. ההשהיה נשארת 2.4 שניות. משתמשים עדיין מתלוננים.",
      question: "Multi-AZ didn't help with performance. What's your next move?",
      questionHe: "Multi-AZ לא עזר לביצועים. מה הצעד הבא שלך?",
      alerts: [
        { type: "info", source: "AWS", text: "Multi-AZ failover standby provisioned in us-east-1b", textHe: "standby של Multi-AZ הופעל ב-us-east-1b" },
        { type: "info", source: "Route53", text: "Health check for api.example.com passing (TCP/443)", textHe: "בדיקת תקינות ל-api.example.com עוברת (TCP/443)", noise: true },
        { type: "warning", source: "CloudWatch", text: "RDS CPU still at 94% - Multi-AZ standby is idle", textHe: "CPU של RDS עדיין ב-94% - standby של Multi-AZ בטל" },
        { type: "warning", source: "Billing", text: "RDS monthly projected cost increased to $800 (+100%)", textHe: "עלות RDS חודשית צפויה עלתה ל-$800 (+100%)" },
      ],
      logs: [
        { level: "info", timestamp: "14:40:05", text: "Multi-AZ: standby instance synchronized, replication lag: 0ms" },
        { level: "warn", timestamp: "14:40:12", text: "LOG: duration: 8102.33 ms  statement: SELECT * FROM orders WHERE customer_id = 1532" },
      ],
      options: [
        {
          text: "Check slow query logs to find the actual bottleneck",
          textHe: "בדוק את לוג השאילתות כדי למצוא את צוואר הבקבוק האמיתי",
          nextStep: "found_queries",
          impact: { performance: 0, cost: 0, reliability: 0 },
          tag: "Course correction",
          tagHe: "תיקון מסלול",
          explanation: "The Multi-AZ detour cost time and money but the system is still functional. Slow query analysis is the correct next step — it will reveal the actual bottleneck (unindexed queries) that Multi-AZ was never designed to address. The $400/month Multi-AZ spend isn't entirely wasted — you'll want it eventually for HA — but it was the wrong priority for an active latency incident.",
          explanationHe: "העיקוף של Multi-AZ עלה זמן וכסף אבל המערכת עדיין פונקציונלית. ניתוח שאילתות איטיות הוא הצעד הנכון הבא — הוא יחשוף את צוואר הבקבוק האמיתי (שאילתות ללא אינדקס) ש-Multi-AZ מעולם לא תוכנן לטפל בו. ההוצאה של $400 לחודש על Multi-AZ לא בוזבזה לחלוטין — תרצה את זה בסופו של דבר ל-HA — אבל זה היה סדר עדיפויות שגוי לתקרית השהיה פעילה.",
          stateEffect: {
            // diagnostic action - no immediate state change
          }
        },
        {
          text: "Scale the RDS instance to handle the load",
          textHe: "שדרג את מופע ה-RDS כדי לטפל בעומס",
          nextStep: "scaled_rds",
          impact: { performance: 10, cost: -15, reliability: 5 },
          tag: "Compounding cost without diagnosis",
          tagHe: "עלות מצטברת ללא אבחון",
          explanation: "You've already added $400/month for Multi-AZ. Now adding another instance size upgrade compounds the cost without diagnosing why latency persists. Each remediation attempt without root cause analysis is a bet that hardware is the problem — but the 94% CPU with maxed IOPS pattern is characteristic of full table scans, not capacity limitations. The more infrastructure you add before diagnosing, the harder it becomes to justify the spend when the real fix turns out to be a 3-line index migration.",
          explanationHe: "כבר הוספת $400 לחודש על Multi-AZ. עכשיו הוספת שדרוג מופע נוסף מגדילה את העלות ללא אבחון למה ההשהיה נמשכת. כל ניסיון תיקון ללא ניתוח שורש הבעיה הוא הימור שחומרה היא הבעיה — אבל דפוס ה-94% CPU עם IOPS מקסימלי אופייני לסריקות טבלה מלאות, לא מגבלות קיבולת.",
          stateEffect: {
            latency: 1200,
            cpuPercent: 60,
            costPerMonth: 1200,
            stability: "degraded",
          }
        }
      ]
    },
    cache_without_fix: {
      id: "cache_without_fix",
      timeDelta: "25 minutes later. Redis cluster provisioned and online.",
      timeDeltaHe: "25 דקות מאוחר יותר. Redis cluster הופעל.",
      context: "Redis cache is running (ElastiCache r6g.large, ~$150/month). Hit rate is only 30% because the query patterns are user-specific (customer_id filters) and time-varying (recent orders, last-30-days aggregations). The 70% cache misses still execute the same unindexed full table scans. You now have two systems to monitor and a new failure mode (cache stampede on cold start).",
      contextHe: "Redis cache רץ (ElastiCache r6g.large, כ-$150 לחודש). שיעור הפגיעות רק 30% כי תבניות השאילתות ספציפיות למשתמש (פילטרי customer_id) ומשתנות בזמן (הזמנות אחרונות, אגרגציות 30 יום אחרונים). 70% ה-cache misses עדיין מריצים את אותן סריקות מלאות ללא אינדקס. עכשיו יש לך שתי מערכות לנטר ומצב כשל חדש (cache stampede בהפעלה קרה).",
      question: "Cache hit rate is too low. What should you do?",
      questionHe: "שיעור הפגיעות ב-cache נמוך מדי. מה עליך לעשות?",
      alerts: [
        { type: "info", source: "ElastiCache", text: "Redis cluster online - cache hit rate: 30%", textHe: "Redis cluster פעיל - שיעור פגיעות cache: 30%" },
        { type: "info", source: "Redis", text: "Eviction policy: allkeys-lru - 0 evictions in last hour", textHe: "מדיניות eviction: allkeys-lru - 0 evictions בשעה האחרונה", noise: true },
        { type: "warning", source: "CloudWatch", text: "RDS CPU still at 80% despite caching layer", textHe: "CPU של RDS עדיין ב-80% למרות שכבת cache" },
        { type: "info", source: "Billing", text: "ElastiCache r6g.large added $150/month to infrastructure costs", textHe: "ElastiCache r6g.large הוסיף $150 לחודש לעלויות תשתית" },
      ],
      logs: [
        { level: "info", timestamp: "14:50:33", text: "Redis: GET orders:customer:4821 -> MISS (key not found)" },
        { level: "warn", timestamp: "14:50:34", text: "LOG: duration: 8102.44 ms  statement: SELECT * FROM orders WHERE customer_id = 4821 -- cache miss fallback" },
        { level: "info", timestamp: "14:50:35", text: "Redis: SET orders:customer:4821 TTL=300 -> OK (12.4KB)" },
      ],
      options: [
        {
          text: "Go back to basics — check and fix the slow queries",
          textHe: "חזור ליסודות — בדוק ותקן את השאילתות האיטיות",
          nextStep: "found_queries",
          impact: { performance: 0, cost: 0, reliability: 0 },
          tag: "Course correction",
          tagHe: "תיקון מסלול",
          explanation: "The cache was premature optimization — it added complexity before the underlying performance issue was understood. With a 30% hit rate, the cache is absorbing only a fraction of the load while adding operational overhead (monitoring, invalidation logic, failure handling). Fix the queries first, then re-evaluate: with indexed queries running in 15ms, you may not need a cache at all, or you may want one for a different reason (reducing total DB connections, not query speed).",
          explanationHe: "ה-cache היה אופטימיזציה מוקדמת — הוסיף מורכבות לפני שבעיית הביצועים הבסיסית הובנה. עם שיעור פגיעות של 30%, ה-cache סופג רק חלק קטן מהעומס תוך הוספת תקורה תפעולית. תקן את השאילתות קודם, ואז הערך מחדש: עם שאילתות מאונדקסות שרצות ב-15ms, ייתכן שלא תצטרך cache בכלל.",
          stateEffect: {
            // diagnostic action - no immediate state change
          }
        },
        {
          text: "Increase Redis cluster size for better throughput",
          textHe: "הגדל את Redis cluster לתפוקה טובה יותר",
          nextStep: "end_over_engineered",
          impact: { performance: 3, cost: -15, reliability: -3 },
          tag: "Wrong layer to optimize",
          tagHe: "שכבה שגויה לאופטימיזציה",
          explanation: "Redis throughput isn't the constraint — a single ElastiCache node handles 100K+ ops/sec, far more than your query volume. The problem is that the data you're trying to cache isn't cacheable — it's user-specific, time-varying, and has too many unique key combinations for reasonable hit rates. A bigger cache just has more empty slots. You're now running an expensive RDS + expensive Redis cluster, each underutilized for different reasons, while the actual bottleneck (unindexed queries) remains untouched.",
          explanationHe: "תפוקת Redis אינה האילוץ — node בודד של ElastiCache מטפל ב-100K+ ops/sec, הרבה יותר מנפח השאילתות שלך. הבעיה היא שהנתונים שאתה מנסה לאחסן אינם ניתנים לאחסון — הם ספציפיים למשתמש, משתנים בזמן, ויש להם יותר מדי שילובי מפתחות ייחודיים. cache גדול יותר פשוט יש לו יותר slots ריקים.",
          stateEffect: {
            latency: 1800,
            cpuPercent: 78,
            costPerMonth: 700,
            errorRate: 2,
            stability: "degraded",
          }
        }
      ]
    },
    replicas_without_fix: {
      id: "replicas_without_fix",
      timeDelta: "35 minutes later. Read replica synchronized and accepting traffic.",
      timeDeltaHe: "35 דקות מאוחר יותר. Read replica מסונכרן ומקבל תעבורה.",
      context: "Read replica is up and routing read queries. Latency improved to 1.5s (from 2.4s) because load is split across two instances. But the replica is also at 85% CPU — it's running the same unoptimized queries. Monthly cost doubled. You now need to manage replication lag monitoring.",
      contextHe: "Read replica עובד ומנתב שאילתות קריאה. ההשהיה ירדה ל-1.5 שניות (מ-2.4) כי העומס מפוצל על שני מופעים. אבל גם ה-replica ב-85% CPU — הוא מריץ את אותן שאילתות לא מותאמות. עלות חודשית הוכפלה. עכשיו צריך לנהל ניטור replication lag.",
      question: "The replica is also struggling under the same query patterns. What now?",
      questionHe: "גם ה-replica מתקשה תחת אותן תבניות שאילתות. מה עכשיו?",
      alerts: [
        { type: "warning", source: "CloudWatch", text: "Read replica CPU at 85% - running same unoptimized queries", textHe: "CPU של read replica ב-85% - מריץ אותן שאילתות לא מותאמות" },
        { type: "info", source: "RDS", text: "Replication lag: 50ms - within acceptable threshold", textHe: "replication lag: 50ms - בתוך סף מקובל", noise: true },
        { type: "info", source: "CloudWatch", text: "Primary RDS CPU reduced to 70% after read offload", textHe: "CPU של RDS הראשי ירד ל-70% אחרי העברת קריאות" },
        { type: "warning", source: "Billing", text: "RDS monthly cost doubled to $800 (primary + replica)", textHe: "עלות RDS חודשית הוכפלה ל-$800 (primary + replica)" },
      ],
      logs: [
        { level: "warn", timestamp: "14:55:10", text: "replica: LOG: duration: 7901.22 ms  statement: SELECT * FROM orders WHERE customer_id = 3201" },
        { level: "info", timestamp: "14:55:08", text: "replica: replication lag: 120ms (within acceptable range)" },
      ],
      options: [
        {
          text: "Fix the underlying queries — the replicas are just running bad SQL",
          textHe: "תקן את השאילתות — ה-replicas פשוט מריצים SQL גרוע",
          nextStep: "found_queries",
          impact: { performance: 0, cost: 0, reliability: 0 },
          tag: "Root cause identified",
          tagHe: "שורש הבעיה זוהה",
          explanation: "The replica reaching 85% CPU proves the issue is query efficiency, not hardware capacity. If the queries were well-indexed, a single r5.large could handle this traffic — the replica would be a luxury, not a necessity. Fix the queries first; the replica then becomes a genuine scaling lever for future growth rather than an expensive band-aid. Both primary and replica benefit from the same index additions simultaneously (indexes replicate automatically).",
          explanationHe: "ה-replica שמגיע ל-85% CPU מוכיח שהבעיה היא יעילות שאילתות, לא קיבולת חומרה. אם השאילתות היו מאונדקסות היטב, r5.large בודד יכול היה לטפל בתעבורה — ה-replica היה מותרות, לא הכרח. תקן את השאילתות קודם; ה-replica אז הופך למנוף סקיילינג אמיתי לצמיחה עתידית ולא לפלסטר יקר.",
          stateEffect: {
            // diagnostic action - no immediate state change
          }
        },
        {
          text: "Add a second read replica",
          textHe: "הוסף read replica שני",
          nextStep: "end_replica_farm",
          impact: { performance: 3, cost: -18, reliability: -2 },
          tag: "Linear cost scaling for sublinear gains",
          tagHe: "סקיילינג עלות לינארי לרווחים תת-לינאריים",
          explanation: "Three database instances all running the same unoptimized queries. Monthly bill tripled (~$1,200/month for RDS alone). Latency might improve to ~1.2s — a marginal gain for 3x cost. Each additional replica also increases replication lag risk during write-heavy periods, adds monitoring overhead, and makes connection routing more complex. You're scaling cost linearly while the performance improvement diminishes with each replica — classic diminishing returns without addressing the root cause.",
          explanationHe: "שלושה מופעי מסד נתונים שכולם מריצים את אותן שאילתות לא מותאמות. חשבון חודשי שולש (כ-$1,200 לחודש ל-RDS בלבד). ההשהיה אולי תשתפר ל-1.2 שניות בערך — רווח שולי עבור עלות פי 3. כל replica נוסף גם מגדיל סיכון replication lag, מוסיף תקורת ניטור, ומסבך ניתוב חיבורים.",
          stateEffect: {
            latency: 1200,
            cpuPercent: 75,
            costPerMonth: 1200,
            connections: "180/200",
            stability: "degraded",
          }
        }
      ]
    },
    // ── Terminal steps ──
    end_optimal: {
      id: "end_optimal",
      context: "System is running with optimized queries, a read replica for analytics, and PgBouncer for connection management. Latency: 60ms (better than pre-spike baseline). Cost increase: ~40% while handling 5x traffic. Connection pool utilization: 45%. CPU headroom: 55% on primary, 40% on replica. CTO approved the architecture. Team documented the query optimization playbook for future incidents.",
      contextHe: "המערכת רצה עם שאילתות מותאמות, read replica לאנליטיקה, ו-PgBouncer לניהול חיבורים. השהיה: 60ms (יותר טוב מלפני העלייה). עליית עלות: 40% בערך תוך טיפול בפי 5 תעבורה. ניצול מאגר חיבורים: 45%. מרווח CPU: 55% על primary, 40% על replica. ה-CTO אישר את הארכיטקטורה.",
      question: null, options: []
    },
    end_aurora: {
      id: "end_aurora",
      context: "Aurora migration started. The cutover window is tight and the campaign launches in 5 days. DMS replication is showing 2-3 second lag on the orders table. Testing revealed 2 Aurora-specific query plan differences that need code changes. Engineering team is stressed and working overtime. Risk of production outage during migration is non-trivial.",
      contextHe: "מיגרציה ל-Aurora התחילה. חלון המעבר צפוף והקמפיין מושק בעוד 5 ימים. DMS replication מראה 2-3 שניות lag על טבלת orders. בדיקות חשפו 2 הבדלי query plan ספציפיים ל-Aurora שדורשים שינויי קוד. צוות ההנדסה לחוץ ועובד שעות נוספות.",
      question: null, options: []
    },
    end_vertical: {
      id: "end_vertical",
      context: "Running on db.r5.4xlarge at 4x the original cost ($1,600/month). Handles current traffic at 45% CPU. But at 3x the campaign spike, projected CPU usage: ~135%. No horizontal scaling strategy in place. When the campaign traffic hits, you'll need to scale up again — and you're running out of cost-effective instance sizes. The CTO is questioning the scaling strategy.",
      contextHe: "רץ על db.r5.4xlarge בעלות פי 4 מהמקור ($1,600 לחודש). מטפל בתעבורה נוכחית ב-45% CPU. אבל בפי 3 של גל הקמפיין, שימוש CPU צפוי: 135% בערך. אין אסטרטגיית סקיילינג אופקי. כשתעבורת הקמפיין תגיע, תצטרך לשדרג שוב — ונגמרים הגדלים החסכוניים.",
      question: null, options: []
    },
    end_money_pit: {
      id: "end_money_pit",
      context: "Scaled up twice without root cause analysis. AWS bill: $1,600/month (was $400). The 4xlarge handles current load at 40% CPU, but the marketing campaign's 3x spike will push it past capacity again. When you finally check the slow query logs, you find that 3 missing indexes and an N+1 fix would have solved the problem at $0 infrastructure cost. The optimization work still needs to be done — now with a $1,200/month excess bill running in the background.",
      contextHe: "שדרגת פעמיים בלי ניתוח שורש הבעיה. חשבון AWS: $1,600 לחודש (היה $400). ה-4xlarge מטפל בעומס נוכחי ב-40% CPU, אבל גל פי 3 של הקמפיין ידחוף שוב מעבר לקיבולת. כשסוף סוף בודקים את לוג השאילתות, מגלים ש-3 אינדקסים חסרים ותיקון N+1 היו פותרים את הבעיה ב-$0 עלות תשתית.",
      question: null, options: []
    },
    end_oom: {
      id: "end_oom",
      context: "RDS with 500 max_connections: shared_buffers reduced to fit memory budget, causing cache hit ratio to drop from 99% to 72%. Queries that were hitting buffer cache now do physical disk reads. PostgreSQL OOM killer terminated 12 backend processes during a traffic spike, causing a 12-minute full outage. Post-mortem required. The root cause was never the connection limit — it was the queries consuming too many connections per request (N+1 pattern).",
      contextHe: "RDS עם 500 max_connections: shared_buffers הוקטן כדי להתאים לתקציב הזיכרון, וגרם ליחס cache hit לרדת מ-99% ל-72%. שאילתות שפגעו ב-buffer cache עכשיו עושות קריאות דיסק פיזיות. OOM killer של PostgreSQL הרג 12 תהליכי backend בזמן גל תעבורה, וגרם לנפילה מלאה של 12 דקות. שורש הבעיה מעולם לא היה מגבלת חיבורים — היו השאילתות שצרכו יותר מדי חיבורים לכל בקשה (תבנית N+1).",
      question: null, options: []
    },
    end_over_engineered: {
      id: "end_over_engineered",
      context: "Running ElastiCache cluster ($300/month) + original undersized RDS ($400/month). Total infrastructure: $700/month (was $400). Cache hit rate: still 30%. Latency: 1.8s (marginal improvement). The team now debugs two systems instead of one. A new developer accidentally deployed a change that bypassed the cache layer, causing a brief latency spike — revealing how fragile the architecture has become. The underlying query problem remains unsolved.",
      contextHe: "מפעיל ElastiCache cluster ($300 לחודש) + RDS מקורי ($400 לחודש). תשתית כוללת: $700 לחודש (היה $400). שיעור פגיעת cache: עדיין 30%. השהיה: 1.8 שניות (שיפור שולי). הצוות מדבג שתי מערכות במקום אחת. מפתח חדש בטעות פרס שינוי שעקף את שכבת ה-cache, וגרם לקפיצת השהיה — חושף כמה שברירית הארכיטקטורה הפכה.",
      question: null, options: []
    },
    end_replica_farm: {
      id: "end_replica_farm",
      context: "Three database instances running unoptimized queries. Monthly RDS cost: ~$1,200 (3x original). Each replica at 75% CPU. Latency: 1.2s — a 50% improvement for 200% more cost. Replication lag during write spikes: 500ms-2s, causing stale read issues for users. Connection routing added application complexity. When you finally index the queries, all three instances drop to 15% CPU — revealing that two of the three replicas were unnecessary all along.",
      contextHe: "שלושה מופעי מסד נתונים מריצים שאילתות לא מותאמות. עלות RDS חודשית: כ-$1,200 (פי 3 מהמקור). כל replica ב-75% CPU. השהיה: 1.2 שניות — שיפור של 50% עבור 200% יותר עלות. replication lag בזמן גלי כתיבה: 500ms-2s, גורם לבעיות קריאה ישנה. כשסוף סוף מאנדקסים את השאילתות, כל שלושת המופעים יורדים ל-15% CPU — חושף ששניים מהשלושה היו מיותרים מההתחלה.",
      question: null, options: []
    }
  }
};
