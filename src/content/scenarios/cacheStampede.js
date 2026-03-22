// ── Scenario: Cache Stampede ─────────────────────────────────────────────────

const RC = "Cache stampede caused by simultaneous cache miss on hot key 'product:featured'. When the 60-second TTL expired, all 50,000 concurrent requests bypassed the empty cache and hit PostgreSQL directly, exhausting the connection pool (195/200) and causing 8-second query latency.";
const RC_HE = "מפולת cache שנגרמה מ-cache miss בו-זמני על מפתח חם 'product:featured'. כאשר ה-TTL של 60 שניות פג, כל 50,000 הבקשות הבו-זמניות עקפו את ה-cache הריק ופגעו ישירות ב-PostgreSQL, מיצו את מאגר החיבורים (195/200) וגרמו להשהיית שאילתות של 8 שניות.";
const PS = "Implement stale-while-revalidate pattern: serve stale cached data while a single background worker rebuilds the cache. Add mutex/lock so only one request triggers the rebuild. Set reasonable TTLs with jitter to prevent synchronized expiration. Monitor cache hit rates and set alerts on miss rate spikes.";
const PS_HE = "הטמע דפוס stale-while-revalidate: הגש נתוני cache ישנים בזמן ש-worker ברקע יחיד בונה מחדש את ה-cache. הוסף mutex/lock כך שרק בקשה אחת מפעילה את הבנייה מחדש. הגדר TTL סביר עם jitter למניעת תפוגה מסונכרנת. נטר שיעורי פגיעת cache והגדר התראות על קפיצות בשיעור miss.";

export default {
  id: "cache-stampede",
  title: "Cache Stampede",
  titleHe: "Cache Stampede - מפולת גישות ל-cache",
  description: "A hot Redis key expired and 50,000 concurrent requests are hammering your PostgreSQL database. Connection pool is nearly exhausted and the checkout flow is failing.",
  descriptionHe: "מפתח Redis חם פג תוקף ו-50,000 בקשות בו-זמנית מכות את מסד הנתונים PostgreSQL. מאגר החיבורים כמעט מוצה ותהליך התשלום נכשל.",
  difficulty: "hard",
  order: 5,
  estimatedTime: "6-8 min",
  tags: ["Redis", "Caching", "Database", "Performance"],
  icon: "⚡",
  initialMetrics: { performance: 50, cost: 50, reliability: 50 },
  initialSystemState: {
    latency: 8000,
    errorRate: 35,
    cpuPercent: 95,
    connections: "195/200",
    maxConnections: 200,
    costPerMonth: 3500,
    stability: "critical",
    throughput: 50,
    dbLoad: 98,
    queueDepth: 12000
  },
  steps: {
    start: {
      id: "start",
      context: "Your e-commerce platform's product catalog cache just expired. The Redis key 'product:featured' had a 60-second TTL. When it expired, all 50,000 concurrent users hit PostgreSQL simultaneously. The DB connection pool is at 195/200, latency spiked to 8 seconds, and the checkout service is timing out because it shares the same database.",
      contextHe: "cache קטלוג המוצרים של פלטפורמת ה-e-commerce שלך פג תוקף. למפתח Redis 'product:featured' היה TTL של 60 שניות. כשפג תוקפו, 50,000 משתמשים בו-זמנית פנו ל-PostgreSQL בו-זמנית. מאגר החיבורים ב-195/200, ההשהיה זינקה ל-8 שניות, ושירות התשלום נכשל כי הוא משתמש באותו מסד נתונים.",
      question: "The system is melting down. How do you respond?",
      questionHe: "המערכת קורסת. איך אתה מגיב?",
      alerts: [
        { type: "critical", source: "PostgreSQL", text: "Connection pool exhausted: 195/200 connections in use", textHe: "מאגר חיבורים מוצה: 195/200 חיבורים בשימוש" },
        { type: "critical", source: "Redis", text: "MISS rate 100% on key product:featured", textHe: "שיעור MISS של 100% על מפתח product:featured" },
        { type: "warning", source: "checkout-service", text: "35% of checkout requests timing out", textHe: "35% מבקשות התשלום חורגות מזמן המתנה" }
      ],
      logs: [
        { level: "error", timestamp: "10:30:01", text: "redis: DEL product:featured (TTL expired)" },
        { level: "error", timestamp: "10:30:02", text: "pgbouncer: 847 waiting clients in queue" },
        { level: "error", timestamp: "10:30:03", text: "app: timeout waiting for DB connection after 5000ms" }
      ],
      options: [
        {
          text: "Implement a cache lock (mutex) so only one request rebuilds the cache",
          textHe: "הטמע cache lock (mutex) כך שרק בקשה אחת בונה מחדש את ה-cache",
          nextStep: "implemented_lock",
          impact: { performance: 15, cost: 0, reliability: 15 },
          operationalComplexity: 15,
          tag: "Cache stampede protection",
          tagHe: "הגנה מפני מפולת cache",
          explanation: "Problem: The cache expired and all 50,000 requests tried to rebuild it at the same time. What happened: The database connection pool ran out and queries took 8 seconds. Solution: A cache lock ensures only one request rebuilds the cache while the others wait or get slightly old data.",
          explanationHe: "mutex מבוזר (למשל Redis SETNX) מבטיח שרק בקשה אחת מפעילה את השאילתה היקרה לבניית ה-cache מחדש. כל שאר הבקשות ממתינות קצרות או מקבלות נתונים ישנים. זה מטפל ישירות בבעיית ה-thundering herd בשורשה - מונע 50,000 שאילתות זהות בו-זמניות מלהגיע למסד.",
          stateEffect: { latency: 1200, errorRate: 5, cpuPercent: 55, connections: "80/200", stability: "degraded", throughput: 800, dbLoad: 45, queueDepth: 200 }
        },
        {
          text: "Increase DB connection pool to 500",
          textHe: "הגדל את מאגר החיבורים ל-500",
          nextStep: "increased_pool",
          impact: { performance: 5, cost: -10, reliability: -5 },
          operationalComplexity: 25,
          tag: "Connection scaling",
          tagHe: "הרחבת חיבורים",
          explanation: "Problem: The database is already overwhelmed, and more connections just pile on more load. What happened: PostgreSQL CPU hit 100% because each connection uses memory and competes for locks. Why this didn't work: You treated the symptom instead of the cause, which is 50,000 identical queries that should be collapsed into one.",
          explanationHe: "הגדלת מאגר החיבורים מטפלת בסימפטום, לא בסיבה. עם 50,000 בקשות שמריצות את אותה שאילתה כבדה, יותר חיבורים רק אומרים יותר עומס על מסד הנתונים. ביצועי PostgreSQL יורדים ככל שמספר החיבורים עולה בגלל תקורת זיכרון לכל חיבור ותחרות נעילות.",
          stateEffect: { latency: 6000, errorRate: 20, cpuPercent: 100, connections: "450/500", stability: "critical", throughput: 100, dbLoad: 100, queueDepth: 8000 }
        },
        {
          text: "Set Redis TTL to never expire",
          textHe: "הגדר TTL ב-Redis ללא תפוגה",
          nextStep: "no_expiry",
          impact: { performance: 10, cost: 0, reliability: -10 },
          operationalComplexity: 10,
          tag: "Remove expiration",
          tagHe: "הסרת תפוגה",
          explanation: "Problem: Without a TTL the cache never refreshes, so prices and stock levels go stale forever. What happened: Customers see wrong prices and out-of-stock items listed as available. Why this didn't work: You traded a performance problem for a data correctness problem, which is worse for e-commerce.",
          explanationHe: "הסרת ה-TTL עוצרת מפולות לחלוטין, אבל יוצרת בעיית עקביות נתונים. הנתונים ב-cache לעולם לא יתרעננו אלא אם יבוטלו במפורש. עבור קטלוג מוצרים עם מחירים ומלאי, לקוחות עלולים לראות מחירים לא מעודכנים, מוצרים לא זמינים כזמינים, או לפספס מוצרים חדשים.",
          stateEffect: {
            latency: 200,
            errorRate: 0,
            cpuPercent: 25,
            connections: "30/200",
            stability: "healthy",
            throughput: 2000,
            dbLoad: 15,
            queueDepth: 0
          }
        },
        {
          text: "Add a read replica for catalog queries",
          textHe: "הוסף read replica לשאילתות קטלוג",
          nextStep: "added_replica",
          impact: { performance: 10, cost: -15, reliability: 10 },
          operationalComplexity: 30,
          tag: "Read replica",
          tagHe: "Read replica",
          explanation: "Problem: A replica takes 15+ minutes to provision, so the system stays down the entire time. What happened: Even after the replica came online, all 50,000 requests still hit it at once every 60 seconds on cache expiry. Why this didn't work: You moved the stampede to a different server without fixing the root cause.",
          explanationHe: "read replica מוריד שאילתות קטלוג מה-primary, אבל ההקצאה לוקחת 15+ דקות. בזמן הזה, המערכת ממשיכה לקרוס. גם אחרי שהרפליקה מוכנה, דפוס המפולת נמשך - כל 50,000 הבקשות יפגעו ברפליקה בו-זמנית בכל תפוגת cache. העברת את הבעיה לשרת אחר בלי לפתור אותה.",
          stateEffect: { latency: 7500, errorRate: 30, cpuPercent: 92, connections: "190/200", stability: "critical", throughput: 80, dbLoad: 95, queueDepth: 10000 }
        }
      ]
    },

    // ── Lock path (optimal) ──
    implemented_lock: {
      id: "implemented_lock",
      timeDelta: "5 minutes after implementing lock...",
      timeDeltaHe: "5 דקות אחרי הטמעת ה-lock...",
      context: "The mutex lock is working. Only one request rebuilds the cache while others wait up to 200ms or receive stale data. DB load dropped from 98% to 45%. But you notice the cache TTL is still 60 seconds, meaning every minute during peak traffic this lock contention cycle repeats. During the lock window, p99 latency spikes to 1.2 seconds.",
      contextHe: "ה-mutex lock עובד. רק בקשה אחת בונה מחדש את ה-cache בזמן שאחרות ממתינות עד 200ms או מקבלות נתונים ישנים. עומס ה-DB ירד מ-98% ל-45%. אבל שמת לב שה-TTL עדיין 60 שניות, כלומר כל דקה בזמן תעבורת שיא מחזור תחרות ה-lock חוזר. בחלון ה-lock, השהיית p99 עולה ל-1.2 שניות.",
      question: "The lock works but the 60-second TTL means recurring spikes. How do you address this?",
      questionHe: "ה-lock עובד אבל ה-TTL של 60 שניות גורם לקפיצות חוזרות. איך תטפל בזה?",
      alerts: [
        { type: "info", source: "Redis", text: "Cache lock acquired/released 14 times in last 15 minutes", textHe: "Cache lock נרכש/שוחרר 14 פעמים ב-15 דקות האחרונות" },
        { type: "warning", source: "Monitoring", text: "p99 latency spikes to 1.2s every ~60 seconds", textHe: "השהיית p99 עולה ל-1.2 שניות כל 60 שניות בערך" }
      ],
      logs: [
        { level: "info", timestamp: "10:35:12", text: "cache-lock: acquired lock for product:featured (holder: pod-api-7b)" },
        { level: "info", timestamp: "10:35:12", text: "cache-lock: 312 requests waiting for lock release" },
        { level: "info", timestamp: "10:35:13", text: "cache-lock: rebuilt product:featured in 850ms, serving 312 waiters" }
      ],
      options: [
        {
          text: "Implement stale-while-revalidate with background refresh",
          textHe: "הטמע stale-while-revalidate עם רענון ברקע",
          nextStep: "end_optimal",
          impact: { performance: 20, cost: 0, reliability: 20 },
          operationalComplexity: 20,
          tag: "Stale-while-revalidate",
          tagHe: "Stale-while-revalidate",
          explanation: "Problem: The lock works, but requests still block during each 60-second cache rebuild cycle. What happened: Users experience latency spikes every minute while waiting for the lock. Solution: Use two TTLs: a soft one at 60 seconds and a hard one at 5 minutes. After the soft TTL, one request refreshes in the background while everyone else keeps getting cached data instantly.",
          explanationHe: "התקן הזהב למניעת מפולת cache. ה-cache שומר נתונים עם שני TTL: TTL רך (60 שניות) ו-TTL קשיח (5 דקות). אחרי ה-TTL הרך, הבקשה הראשונה מפעילה רענון ברקע בזמן שכל הבקשות ממשיכות לקבל נתונים ישנים (אבל עדיין תקפים). אף בקשה לא נחסמת בהמתנה לבניית cache, והמסד רואה רק שאילתה אחת למחזור רענון.",
          stateEffect: { latency: 85, errorRate: 0, cpuPercent: 20, connections: "25/200", stability: "healthy", throughput: 2500, dbLoad: 10, queueDepth: 0 }
        },
        {
          text: "Increase TTL to 1 hour",
          textHe: "הגדל TTL לשעה",
          nextStep: "end_long_ttl",
          impact: { performance: 10, cost: 0, reliability: 5 },
          operationalComplexity: 10,
          tag: "Extended TTL",
          tagHe: "TTL מוארך",
          explanation: "Problem: With a 1-hour TTL, product data can be stale for up to 60 minutes. What happened: Stampedes happen less often, but each one is worse because more requests build up between cycles. Why this didn't work: Customers risk seeing wrong prices or stock levels for an hour, which is too long for e-commerce.",
          explanationHe: "TTL ארוך יותר מפחית את תדירות המפולות מכל 60 שניות לפעם בשעה, שיפור משמעותי. עם זאת, נתוני המוצרים יכולים להיות מיושנים עד שעה. עבור קטלוג e-commerce עם תמחור דינמי, יש סיכון להציג מחירים או מלאי שגויים. תחרות ה-lock עדיין מתרחשת פעם בשעה, ובאירועי תעבורה גבוהה הקפיצה חמורה יותר כי יותר בקשות מצטברות.",
          stateEffect: { latency: 150, errorRate: 1, cpuPercent: 30, connections: "40/200", stability: "healthy", throughput: 2000, dbLoad: 20, queueDepth: 0 }
        },
        {
          text: "Add a cache warming CronJob every 30 seconds",
          textHe: "הוסף CronJob לחימום cache כל 30 שניות",
          nextStep: "end_cache_warming",
          impact: { performance: 10, cost: -5, reliability: 10 },
          operationalComplexity: 30,
          tag: "Cache pre-warming",
          tagHe: "חימום cache מראש",
          explanation: "Problem: The CronJob that refreshes the cache becomes a critical component you have to keep alive. What happened: If the CronJob pod gets evicted or fails, the stampede returns immediately. Why the system failed: You shifted the risk from the cache layer to the job scheduler, which adds a fragile dependency that needs its own monitoring.",
          explanationHe: "CronJob שמרענן את ה-cache לפני תפוגת TTL מונע מפולות על ידי הבטחה שה-cache תמיד חם. זה עובד אבל מוסיף מורכבות תפעולית: ה-CronJob עצמו הופך לרכיב קריטי. אם ה-CronJob נכשל, המפולת חוזרת. אם שאילתת הרענון איטית, מרווחי ה-CronJob חופפים. צריך גם ניטור והתראות ספציפיים ל-CronJob.",
          stateEffect: { latency: 120, errorRate: 0, cpuPercent: 28, connections: "35/200", stability: "healthy", throughput: 2200, dbLoad: 18, queueDepth: 0 }
        }
      ]
    },

    // ── Pool path (wrong direction) ──
    increased_pool: {
      id: "increased_pool",
      timeDelta: "3 minutes after increasing pool...",
      timeDeltaHe: "3 דקות אחרי הגדלת המאגר...",
      context: "Connection pool increased to 500, but DB CPU is now at 100%. Queries that took 5ms normally now take 3 seconds due to contention. PostgreSQL is thrashing with 450 active connections all executing the same heavy catalog query. Memory pressure is causing the OS to swap, making everything worse.",
      contextHe: "מאגר החיבורים הוגדל ל-500, אבל CPU של ה-DB עכשיו ב-100%. שאילתות שלקחו 5ms בדרך כלל לוקחות עכשיו 3 שניות בגלל תחרות. PostgreSQL מתמוטט עם 450 חיבורים פעילים שכולם מריצים את אותה שאילתת קטלוג כבדה. לחץ זיכרון גורם למערכת ההפעלה לבצע swap, מה שמחמיר הכל.",
      question: "More connections made things worse. The DB is at 100% CPU. What now?",
      questionHe: "יותר חיבורים החמירו את המצב. ה-DB ב-100% CPU. מה עכשיו?",
      alerts: [
        { type: "critical", source: "PostgreSQL", text: "CPU 100% - all queries degraded, avg query time 3.2s", textHe: "CPU 100% - כל השאילתות מושפעות, זמן שאילתה ממוצע 3.2 שניות" },
        { type: "critical", source: "OS", text: "Memory pressure: swap usage 2.1GB, OOM risk", textHe: "לחץ זיכרון: שימוש swap של 2.1GB, סיכון OOM" }
      ],
      logs: [
        { level: "error", timestamp: "10:33:15", text: "pg: 450 active connections, all executing SELECT * FROM products WHERE featured = true" },
        { level: "warn", timestamp: "10:33:18", text: "pgbouncer: server connection saturation, 312 clients queued" }
      ],
      options: [
        {
          text: "Reduce pool back to 200 and implement cache lock instead",
          textHe: "הקטן מאגר בחזרה ל-200 והטמע cache lock במקום",
          nextStep: "end_recovered",
          impact: { performance: 10, cost: 0, reliability: 10 },
          operationalComplexity: 20,
          tag: "Course correction",
          tagHe: "תיקון כיוון",
          explanation: "Problem: The expanded connection pool made things worse by adding memory pressure and contention. What happened: Every minute on the wrong fix extended the outage for users. Solution: Reverting to 200 connections relieved the resource pressure, and adding a cache lock fixed the actual root cause: too many concurrent cache rebuilds.",
          explanationHe: "זיהוי הטעות וחזרה לאחור הוא הצעד הנכון. הקטנת חיבורים בחזרה ל-200 מקלה מיד על לחץ הזיכרון והתחרות. הוספת cache lock פותרת את שורש הבעיה. המערכת מתאוששת תוך דקות. הפסדת זמן אבל למדת שצוואר הבקבוק היה בניית cache מקבילית, לא קיבולת חיבורים.",
          stateEffect: { latency: 300, errorRate: 2, cpuPercent: 40, connections: "70/200", stability: "degraded", throughput: 1500, dbLoad: 35, queueDepth: 100 }
        },
        {
          text: "Scale up RDS to db.r6g.4xlarge",
          textHe: "שדרג RDS ל-db.r6g.4xlarge",
          nextStep: "end_expensive_db",
          impact: { performance: 5, cost: -25, reliability: 5 },
          operationalComplexity: 25,
          tag: "Vertical scaling",
          tagHe: "שדרוג אנכי",
          explanation: "Problem: The stampede pattern still exists. Every 60 seconds all requests bypass the cache and slam the database. What happened: You are paying 4x more ($14,000/month instead of $3,500) to absorb a problem that a simple cache lock solves for free. Why this didn't work: Throwing hardware at it does not fix the root cause, and the next traffic spike will need yet another upgrade.",
          explanationHe: "שדרוג מופע מסד הנתונים נותן יותר CPU וזיכרון לטפל ב-450 חיבורים בו-זמנית. אבל דפוס המפולת נשאר - כל 60 שניות, כל הבקשות עוקפות את ה-cache ופוגעות ב-DB. אתה משלם פי 4 יותר כדי לטפל בבעיה ש-mutex lock פשוט פותר בחינם. שלב צמיחת התעבורה הבא ידרוש שדרוג נוסף.",
          stateEffect: { latency: 800, errorRate: 5, cpuPercent: 55, connections: "450/500", costPerMonth: 14000, stability: "degraded", throughput: 600, dbLoad: 55, queueDepth: 500 }
        },
        {
          text: "Add circuit breaker to catalog queries",
          textHe: "הוסף circuit breaker לשאילתות קטלוג",
          nextStep: "end_circuit_breaker",
          impact: { performance: 5, cost: 0, reliability: 5 },
          operationalComplexity: 15,
          tag: "Circuit breaker",
          tagHe: "Circuit breaker",
          explanation: "Problem: The circuit breaker protects the database by rejecting catalog queries, but 40% of users see errors every 60 seconds. What happened: Checkout recovers, but the storefront flickers as the breaker opens and closes on each cache expiry. Why this didn't work: A circuit breaker is a useful safety net, but the real fix is to stop 50,000 identical queries from hitting the database in the first place.",
          explanationHe: "circuit breaker מונע כשל מדורג על ידי כשל מהיר כשה-DB עמוס. זה מגן על שירות התשלום אבל אומר שקטלוג המוצרים מחזיר שגיאות למשתמשים. ה-circuit breaker נפתח ונסגר במחזור, ויוצר חוויה מהבהבת. זה דפוס עמידות שימושי אבל לא מטפל בשאלה למה 50,000 שאילתות זהות פוגעות במסד.",
          stateEffect: { latency: 500, errorRate: 40, cpuPercent: 70, connections: "200/500", stability: "degraded", throughput: 400, dbLoad: 70, queueDepth: 2000 }
        }
      ]
    },

    // ── No expiry path (risky) ──
    no_expiry: {
      id: "no_expiry",
      timeDelta: "2 hours later...",
      timeDeltaHe: "שעתיים מאוחר יותר...",
      context: "No more stampedes and the system is stable. But the marketing team launched a flash sale 30 minutes ago with 20% discounts. The cached product data still shows the old, higher prices. Customers are placing orders at the pre-sale prices. Finance flagged $12,000 in overcharged transactions. Customer support is overwhelmed with complaints.",
      contextHe: "אין יותר מפולות והמערכת יציבה. אבל צוות השיווק השיק מבצע הבזק לפני 30 דקות עם הנחות של 20%. הנתונים ב-cache עדיין מציגים את המחירים הישנים והגבוהים. לקוחות מבצעים הזמנות במחירים שלפני המבצע. הכספים סימנו $12,000 בעסקאות עם חיוב יתר. שירות הלקוחות מוצף תלונות.",
      question: "Stale prices are causing financial damage. How do you fix the caching strategy?",
      questionHe: "מחירים מיושנים גורמים לנזק כספי. איך תתקן את אסטרטגיית ה-cache?",
      alerts: [
        { type: "critical", source: "Finance", text: "Flash sale prices not reflected - $12,000 in pricing errors", textHe: "מחירי מבצע הבזק לא מוצגים - $12,000 בטעויות תמחור" },
        { type: "warning", source: "Support", text: "47 customer complaints about incorrect pricing in last 30 min", textHe: "47 תלונות לקוחות על תמחור שגוי ב-30 דקות האחרונות" }
      ],
      logs: [
        { level: "warn", timestamp: "12:30:05", text: "catalog-service: serving cached data from 10:30:01 (2 hours stale)" },
        { level: "info", timestamp: "12:00:00", text: "marketing: flash sale activated, 20% discount on featured products" }
      ],
      options: [
        {
          text: "Add event-driven cache invalidation on data changes",
          textHe: "הוסף invalidation מבוסס אירועים בשינויי נתונים",
          nextStep: "end_event_driven",
          impact: { performance: 10, cost: -5, reliability: 15 },
          operationalComplexity: 30,
          tag: "Event-driven invalidation",
          tagHe: "ביטול cache מונע אירועים",
          explanation: "Problem: With no TTL, the cache never updates on its own, so flash sale prices were stale for 2 hours. What happened: $12,000 in pricing errors and overwhelmed customer support. Solution: Event-driven invalidation refreshes the cache within seconds of any data change, and combined with a stampede lock gives you both fresh data and protection from thundering herd.",
          explanationHe: "פרסום אירועי ביטול cache כשנתוני מוצר משתנים (דרך CDC, DB triggers, או אירועים ברמת האפליקציה) מבטיח שה-cache מתרענן תוך שניות מכל עדכון. בשילוב עם stampede lock, זה נותן גם רעננות וגם הגנה. המורכבות הנוספת של event bus (למשל Kafka, SNS) שווה עבור פלטפורמת e-commerce עם תעבורה גבוהה.",
          stateEffect: { latency: 100, errorRate: 0, cpuPercent: 22, connections: "30/200", stability: "healthy", throughput: 2300, dbLoad: 12, queueDepth: 0 }
        },
        {
          text: "Reduce TTL to 5 minutes with a stampede lock",
          textHe: "הקטן TTL ל-5 דקות עם stampede lock",
          nextStep: "end_late_fix",
          impact: { performance: 10, cost: 0, reliability: 10 },
          operationalComplexity: 15,
          tag: "Late correction",
          tagHe: "תיקון מאוחר",
          explanation: "Problem: Removing the TTL entirely caused 2 hours of stale data and $12,000 in pricing errors. What happened: The technical fix is correct, but the financial damage already occurred. Solution: A 5-minute TTL limits staleness to an acceptable window, and a stampede lock prevents all requests from hitting the database at once on each expiry.",
          explanationHe: "הגדרת TTL של 5 דקות עם stampede lock הוא התיקון שהיית צריך ליישם מההתחלה. יישון הנתונים מוגבל ל-5 דקות, מה שמקובל לרוב מקרי הקטלוג, וה-lock מונע thundering herd. עם זאת, טעות התמחור של $12,000 כבר התרחשה, ותצטרך post-mortem להסביר את אירוע הנתונים המיושנים של שעתיים.",
          stateEffect: { latency: 130, errorRate: 0, cpuPercent: 25, connections: "35/200", stability: "healthy", throughput: 2100, dbLoad: 15, queueDepth: 0 }
        },
        {
          text: "Manually flush the cache when data changes",
          textHe: "רוקן ידנית את ה-cache כשנתונים משתנים",
          nextStep: "end_manual_ops",
          impact: { performance: 0, cost: 0, reliability: -5 },
          operationalComplexity: 35,
          tag: "Manual operations",
          tagHe: "תפעול ידני",
          explanation: "Problem: Manual cache flushing relies on humans remembering to do it on every data change. What happened: Someone will forget during the next flash sale or overnight update, and stale data comes back. Why this didn't work: Human-dependent processes always break under real-world conditions, and the operational toil grows with every new data change.",
          explanationHe: "ריקון cache ידני מסתמך על בני אדם שיזכרו לבטל את ה-cache בכל פעם שנתוני מוצר משתנים. זה מועד לשגיאות, לא מתרחב, וייכשל שוב במבצע הבזק הבא, עדכון לילי, או כל שינוי שנעשה על ידי חבר צוות ששוכח את התהליך. עומס תפעולי גדל באופן לינארי עם מספר שינויי הנתונים.",
          stateEffect: { latency: 200, errorRate: 0, cpuPercent: 25, connections: "30/200", stability: "healthy", throughput: 2000, dbLoad: 15, queueDepth: 0 }
        }
      ]
    },

    // ── Replica path (expensive) ──
    added_replica: {
      id: "added_replica",
      timeDelta: "18 minutes later...",
      timeDeltaHe: "18 דקות מאוחר יותר...",
      context: "The read replica is online after a 15-minute provisioning wait. You routed catalog queries to it, which relieved the primary DB. Checkout is working again. But the stampede pattern still exists: every 60 seconds when the cache expires, 50,000 requests hit the replica simultaneously. The replica is handling it for now because it is fresh, but at the next traffic peak it will buckle too.",
      contextHe: "ה-read replica מקוון אחרי 15 דקות המתנה להקצאה. ניתבת שאילתות קטלוג אליו, מה שהקל על ה-DB הראשי. תהליך התשלום עובד שוב. אבל דפוס המפולת עדיין קיים: כל 60 שניות כשה-cache פג, 50,000 בקשות פוגעות ברפליקה בו-זמנית. הרפליקה מתמודדת כרגע כי היא טרייה, אבל בשיא התעבורה הבא היא גם תקרוס.",
      question: "Replica is live but the stampede pattern persists. How do you address it?",
      questionHe: "הרפליקה פעילה אבל דפוס המפולת נמשך. איך תטפל בזה?",
      alerts: [
        { type: "info", source: "RDS", text: "Read replica rds-catalog-replica-1 online, replication lag 12ms", textHe: "Read replica rds-catalog-replica-1 מקוון, השהיית רפליקציה 12ms" },
        { type: "warning", source: "Monitoring", text: "Replica CPU spikes to 88% every 60s (cache expiry cycle)", textHe: "CPU הרפליקה עולה ל-88% כל 60 שניות (מחזור תפוגת cache)" }
      ],
      logs: [
        { level: "info", timestamp: "10:48:30", text: "rds: replica promotion complete, accepting read connections" },
        { level: "warn", timestamp: "10:49:01", text: "replica: 48,000 concurrent SELECT queries on product:featured refresh" }
      ],
      options: [
        {
          text: "Implement stampede lock + stale-while-revalidate on the replica",
          textHe: "הטמע stampede lock + stale-while-revalidate על הרפליקה",
          nextStep: "end_replica_optimized",
          impact: { performance: 15, cost: -10, reliability: 15 },
          operationalComplexity: 20,
          tag: "Optimized replica",
          tagHe: "רפליקה מותאמת",
          explanation: "Problem: The replica alone does not prevent stampedes. All 50,000 requests still hit it at once on each cache expiry. What happened: Adding cache protection fixes the stampede, but you are paying $5,500/month for a replica you did not need. Solution: The architecture works well, but the same lock pattern on the primary would have solved it without the extra cost.",
          explanationHe: "הוספת דפוסי הגנת cache מעל הרפליקה נותנת גם סקיילינג קריאה אופקי וגם מניעת מפולת. הרפליקה מטפלת בקלות בשאילתת בניית cache בודדת מדי פעם. זו ארכיטקטורה טובה אבל יקרה מהנדרש - אותו stampede lock על ה-primary היה פותר את הבעיה ללא עלות הרפליקה.",
          stateEffect: { latency: 95, errorRate: 0, cpuPercent: 18, connections: "25/200", costPerMonth: 5500, stability: "healthy", throughput: 2400, dbLoad: 8, queueDepth: 0 }
        },
        {
          text: "Just point catalog to replica, no cache changes",
          textHe: "פשוט הפנה קטלוג לרפליקה, בלי שינויי cache",
          nextStep: "end_replica_only",
          impact: { performance: 5, cost: -15, reliability: 0 },
          operationalComplexity: 10,
          tag: "Replica without fix",
          tagHe: "רפליקה ללא תיקון",
          explanation: "Problem: The stampede pattern is unchanged. Every 60 seconds the replica absorbs all 50,000 queries at once. What happened: You pay $5,500/month for a replica that only masks the symptom temporarily. Why this didn't work: Moving the stampede to a different server without deduplicating the queries solves nothing.",
          explanationHe: "העברת שאילתות קטלוג לרפליקה בלי לתקן את דפוס המפולת רק מזיזה את הבעיה. הרפליקה סופגת את ה-thundering herd בכל תפוגת cache, ובגל התעבורה הבא היא תקרוס כמו ה-primary. אתה משלם על רפליקה שמסווה את הסימפטום באופן זמני. ה-primary מוגן, אבל חוויית המשתמש בדפי קטלוג נשארת גרועה כל 60 שניות.",
          stateEffect: { latency: 1500, errorRate: 8, cpuPercent: 35, connections: "60/200", costPerMonth: 5500, stability: "degraded", throughput: 800, dbLoad: 75, queueDepth: 3000 }
        }
      ]
    },

    // ── Terminal steps ──
    end_optimal: {
      id: "end_optimal",
      context: "System fully recovered. Stale-while-revalidate ensures zero-latency cache refreshes: users always get cached data while a single background worker rebuilds it. Latency: 85ms. DB load: 10%. No stampede spikes in the last hour. The checkout service is processing orders normally. The team documented the pattern as a standard for all hot-key caches.",
      contextHe: "המערכת התאוששה לחלוטין. Stale-while-revalidate מבטיח רענוני cache ללא השהיה: משתמשים תמיד מקבלים נתונים מ-cache בזמן ש-worker ברקע יחיד בונה מחדש. השהיה: 85ms. עומס DB: 10%. אין קפיצות מפולת בשעה האחרונה. שירות התשלום מעבד הזמנות כרגיל. הצוות תיעד את הדפוס כסטנדרט לכל hot cache keys.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_long_ttl: {
      id: "end_long_ttl",
      context: "System stable with 1-hour TTL and mutex lock. Stampede spikes happen once per hour instead of every minute. Latency averages 150ms with brief spikes during cache rebuild. However, during a price update, customers saw stale prices for up to 58 minutes. The product team is unhappy with the data freshness trade-off and is requesting a better solution.",
      contextHe: "המערכת יציבה עם TTL של שעה ו-mutex lock. קפיצות מפולת קורות פעם בשעה במקום כל דקה. השהיה ממוצעת 150ms עם קפיצות קצרות בזמן בניית cache. עם זאת, בזמן עדכון מחירים, לקוחות ראו מחירים מיושנים עד 58 דקות. צוות המוצר לא מרוצה מפשרת רעננות הנתונים ומבקש פתרון טוב יותר.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_cache_warming: {
      id: "end_cache_warming",
      context: "CronJob refreshes the cache every 30 seconds, preventing stampedes. System runs smoothly at 120ms latency. Two weeks later, the CronJob pod was evicted during a node scale-down and nobody noticed for 4 hours. The stampede returned and caused a 20-minute outage before on-call found the missing CronJob. The team added monitoring for the CronJob but acknowledged the fragility.",
      contextHe: "CronJob מרענן את ה-cache כל 30 שניות, מונע מפולות. המערכת רצה חלק בהשהיה של 120ms. שבועיים מאוחר יותר, pod ה-CronJob סולק בזמן צמצום nodes ואף אחד לא שם לב 4 שעות. המפולת חזרה וגרמה להשבתה של 20 דקות לפני שהתורן מצא את ה-CronJob החסר. הצוות הוסיף ניטור ל-CronJob אבל הכיר בשבריריות.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_recovered: {
      id: "end_recovered",
      context: "After the detour of increasing connections to 500, you reverted to 200 and added a cache lock. System recovered within 3 minutes. Latency at 300ms (still above baseline due to the recovery period). The incident cost 8 extra minutes of degraded service compared to implementing the lock first. Post-mortem noted that adding connections to a connection-saturated DB is counterproductive.",
      contextHe: "אחרי העיקוף של הגדלת חיבורים ל-500, חזרת ל-200 והוספת cache lock. המערכת התאוששה תוך 3 דקות. השהיה ב-300ms (עדיין מעל הבסיס בגלל תקופת ההתאוששות). התקרית עלתה 8 דקות נוספות של שירות מושפע בהשוואה להטמעת lock מלכתחילה. Post-mortem ציין שהוספת חיבורים ל-DB רווי חיבורים היא פעולה שמחמירה את המצב.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_expensive_db: {
      id: "end_expensive_db",
      context: "Running on db.r6g.4xlarge at $14,000/month (was $3,500). The bigger instance handles the 450 concurrent stampede queries without crashing, but CPU still spikes to 55% every 60 seconds. The finance team flagged the 4x cost increase. When asked why a simple cache pattern was not implemented instead, the engineering team had no good answer. The optimization work still needs to be done.",
      contextHe: "רץ על db.r6g.4xlarge ב-$14,000 לחודש (היה $3,500). המופע הגדול יותר מטפל ב-450 שאילתות מפולת בו-זמניות בלי לקרוס, אבל CPU עדיין קופץ ל-55% כל 60 שניות. צוות הכספים סימן את עליית העלות פי 4. כששאלו למה לא הוטמע דפוס cache פשוט במקום, לצוות ההנדסה לא היתה תשובה טובה. עבודת האופטימיזציה עדיין צריכה להיעשות.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_circuit_breaker: {
      id: "end_circuit_breaker",
      context: "Circuit breaker protects the database from total overload by rejecting catalog queries when error rates exceed 50%. The checkout service recovers because it is no longer competing for connections. But the product catalog shows errors to 40% of users every 60 seconds when the cache expires and the circuit opens. Users see a flickering storefront. The underlying stampede problem is not resolved.",
      contextHe: "Circuit breaker מגן על מסד הנתונים מעומס יתר מוחלט על ידי דחיית שאילתות קטלוג כששיעור השגיאות עולה על 50%. שירות התשלום מתאושש כי הוא כבר לא מתחרה על חיבורים. אבל קטלוג המוצרים מציג שגיאות ל-40% מהמשתמשים כל 60 שניות כשה-cache פג והמעגל נפתח. משתמשים רואים חנות מהבהבת. בעיית המפולת הבסיסית לא נפתרה.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_event_driven: {
      id: "end_event_driven",
      context: "Event-driven cache invalidation implemented via PostgreSQL LISTEN/NOTIFY piped to a Redis invalidation worker. When product data changes, the cache is refreshed within 2 seconds. Combined with a stampede lock, the system handles both freshness and thundering herd protection. The flash sale pricing error was resolved with refunds. Architecture review approved the pattern. Cost increased slightly for the event infrastructure but the system is robust.",
      contextHe: "ביטול cache מונע אירועים הוטמע דרך PostgreSQL LISTEN/NOTIFY שמוזרם ל-worker ביטול Redis. כשנתוני מוצר משתנים, ה-cache מתרענן תוך 2 שניות. בשילוב עם stampede lock, המערכת מטפלת גם ברעננות וגם בהגנה מפני thundering herd. טעות תמחור מבצע הבזק נפתרה עם החזרים. סקירת ארכיטקטורה אישרה את הדפוס. העלות עלתה מעט עבור תשתית האירועים אבל המערכת חזקה.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_late_fix: {
      id: "end_late_fix",
      context: "5-minute TTL with stampede lock implemented. The system is stable and data freshness is acceptable. But the 2-hour stale data incident already caused $12,000 in pricing errors that required manual refunds. The post-mortem highlighted that removing TTL entirely without an invalidation strategy was the root cause of the financial impact. The technical fix is sound but the business damage was avoidable.",
      contextHe: "TTL של 5 דקות עם stampede lock הוטמע. המערכת יציבה ורעננות הנתונים מקובלת. אבל אירוע הנתונים המיושנים של שעתיים כבר גרם ל-$12,000 בטעויות תמחור שדרשו החזרים ידניים. ה-post-mortem הדגיש שהסרת TTL לחלוטין ללא אסטרטגיית ביטול היתה שורש הנזק הכספי. התיקון הטכני נכון אבל הנזק העסקי היה נמנע.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_manual_ops: {
      id: "end_manual_ops",
      context: "Manual cache flushing process documented in the team wiki. Works for the first week. Then a junior developer updates product descriptions at 2 AM without flushing the cache. Customers see outdated descriptions for 6 hours. The following week, an automated inventory sync updates stock levels but nobody flushes the cache, showing out-of-stock items as available. The team spends 3 hours per week on cache-related operational tasks.",
      contextHe: "תהליך ריקון cache ידני תועד בוויקי הצוות. עובד בשבוע הראשון. אז מפתח ג'וניור מעדכן תיאורי מוצרים בשעה 2 בלילה בלי לרוקן את ה-cache. לקוחות רואים תיאורים מיושנים 6 שעות. בשבוע שאחריו, סנכרון מלאי אוטומטי מעדכן רמות מלאי אבל אף אחד לא מרוקן את ה-cache, מציג פריטים שאזלו כזמינים. הצוות מבלה 3 שעות בשבוע במשימות תפעוליות הקשורות ל-cache.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_replica_optimized: {
      id: "end_replica_optimized",
      context: "Read replica running with stampede lock and stale-while-revalidate. The architecture is solid: primary handles writes and checkout, replica handles catalog reads with smart caching. Latency: 95ms. Zero stampede events. But the monthly cost is $5,500 (up from $3,500) due to the replica. The CTO noted that the same result could have been achieved with just the cache patterns on the primary, saving the replica cost entirely.",
      contextHe: "Read replica רץ עם stampede lock ו-stale-while-revalidate. הארכיטקטורה מוצקה: primary מטפל בכתיבות ותשלום, replica מטפל בקריאות קטלוג עם cache חכם. השהיה: 95ms. אפס אירועי מפולת. אבל העלות החודשית $5,500 (עלתה מ-$3,500) בגלל הרפליקה. ה-CTO ציין שאותה תוצאה היתה מושגת רק עם דפוסי cache על ה-primary, חוסכת את עלות הרפליקה לחלוטין.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    },
    end_replica_only: {
      id: "end_replica_only",
      context: "Catalog queries moved to the replica but no cache protection added. The replica absorbs the thundering herd every 60 seconds. During a weekend traffic spike, the replica CPU hit 100% and replication lag jumped to 8 seconds, causing stale reads. The primary is protected but the catalog experience is poor. Monthly cost: $5,500 with no resolution to the stampede. The team is back to square one, now with a bigger infrastructure bill.",
      contextHe: "שאילתות קטלוג הועברו לרפליקה אבל לא נוספה הגנת cache. הרפליקה סופגת את ה-thundering herd כל 60 שניות. בזמן גל תעבורה בסוף שבוע, CPU הרפליקה הגיע ל-100% והשהיית הרפליקציה קפצה ל-8 שניות, וגרמה לקריאות מיושנות. ה-primary מוגן אבל חוויית הקטלוג גרועה. עלות חודשית: $5,500 ללא פתרון למפולת. הצוות חזר לנקודת ההתחלה, עכשיו עם חשבון תשתית גדול יותר.",
      question: null, questionHe: null, options: [],
      rootCause: RC, rootCauseHe: RC_HE, productionSolution: PS, productionSolutionHe: PS_HE
    }
  }
};
