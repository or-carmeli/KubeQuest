// ── Scenario: CDN Misconfiguration ──────────────────────────────────────────

const ROOT_CAUSE = "CloudFront cache behavior misconfiguration during API versioning update. The new /api/v2/* path pattern matched the static asset cache behavior (which caches aggressively) instead of the API behavior (which should pass-through with Vary headers). Simultaneously, static assets were matched by a new catch-all rule with cache-control: no-store.";
const ROOT_CAUSE_HE = "תצורת cache behavior שגויה ב-CloudFront במהלך עדכון versioning של API. תבנית הנתיב /api/v2/* החדשה התאימה ל-cache behavior של static assets (שעושה caching אגרסיבי) במקום ל-behavior של ה-API (שאמור לעשות pass-through עם Vary headers). במקביל, static assets התאימו לכלל catch-all חדש עם cache-control: no-store.";
const PROD_SOLUTION = "Establish ordered CloudFront cache behaviors: 1) /static/* and /assets/* with 30-day cache, immutable, 2) /api/* with no-cache, Vary: Cookie,Authorization headers, 3) Default behavior with short TTL. Use Origin Access Control for S3 static assets. Add CloudFront cache hit ratio monitoring with alerts at <50%. Always test CDN changes with curl -I before and after deployment. Implement CDN canary deployments.";
const PROD_SOLUTION_HE = "הגדר סדר cache behaviors ב-CloudFront: 1) /static/* ו-/assets/* עם cache ל-30 יום, immutable, 2) /api/* עם no-cache, כותרות Vary: Cookie,Authorization, 3) behavior ברירת מחדל עם TTL קצר. השתמש ב-Origin Access Control עבור S3 static assets. הוסף ניטור cache hit ratio של CloudFront עם התראות מתחת ל-50%. תמיד בדוק שינויי CDN עם curl -I לפני ואחרי פריסה. יישם CDN canary deployments.";

export default {
  id: "cdn-misconfigured",
  title: "CDN Gone Wrong",
  titleHe: "CDN שהשתבש",
  description: "After a CloudFront update, static assets are fetched from origin on every load and API responses with user data are being cached and served to wrong users. A privacy incident is unfolding.",
  descriptionHe: "אחרי עדכון CloudFront, קבצים סטטיים נמשכים מהמקור בכל טעינה ותגובות API עם נתוני משתמשים נשמרות ב-cache ומוגשות למשתמשים לא נכונים. אירוע פרטיות מתפתח.",
  difficulty: "medium",
  order: 3,
  estimatedTime: "5-7 min",
  tags: ["CDN", "CloudFront", "Caching", "Performance"],
  icon: "\u{1F310}",
  initialMetrics: { performance: 50, cost: 50, reliability: 50 },
  initialSystemState: {
    latency: 2500,
    errorRate: 8,
    cpuPercent: 85,
    connections: "150/200",
    maxConnections: 200,
    costPerMonth: 4500,
    stability: "degraded",
    throughput: 2000,
    dbLoad: 70,
    queueDepth: 200
  },
  steps: {
    start: {
      id: "start",
      context: "After a CloudFront distribution update to support /api/v2/* versioning, things went sideways. PageSpeed score dropped from 95 to 35. Support tickets are flooding in: users report seeing other people's account data. Origin traffic spiked to 10x normal. Cache hit ratio collapsed from 85% to 5%.",
      contextHe: "אחרי עדכון CloudFront distribution לתמיכה ב-/api/v2/* versioning, דברים השתבשו. ציון PageSpeed ירד מ-95 ל-35. קריאות תמיכה מציפות: משתמשים מדווחים שהם רואים נתונים של משתמשים אחרים. תעבורת Origin זינקה פי 10. יחס cache hit קרס מ-85% ל-5%.",
      question: "How do you respond to this combined performance and security incident?",
      questionHe: "איך מגיבים לאירוע המשולב של ביצועים ואבטחה?",
      alerts: [
        { type: "critical", source: "Security", text: "User data cross-contamination detected in 12 reports", textHe: "זוהה זיהום-צולב של נתוני משתמשים ב-12 דיווחים" },
        { type: "warning", source: "CloudFront", text: "Cache hit ratio dropped to 5% (was 85%)", textHe: "יחס cache hit ירד ל-5% (היה 85%)" },
        { type: "warning", source: "ALB", text: "Origin p99 latency: 2500ms (was 200ms)", textHe: "השהיית Origin p99: 2500ms (היה 200ms)" }
      ],
      logs: [
        { level: "warn", timestamp: "10:00:01", text: "cloudfront: MISS /static/app.js (cache-control: no-store)" },
        { level: "error", timestamp: "10:00:02", text: "cloudfront: HIT /api/v2/user/profile (SHOULD NOT CACHE)" },
        { level: "error", timestamp: "10:00:03", text: "user-123 received profile data for user-456" }
      ],
      options: [
        {
          text: "Immediately invalidate all CloudFront caches and review cache behaviors",
          textHe: "בצע invalidation מיידי לכל ה-cache של CloudFront ובדוק את ה-cache behaviors",
          nextStep: "invalidated_cache",
          impact: { performance: 5, cost: -5, reliability: 15 },
          operationalComplexity: 12,
          tag: "Security-first response",
          tagHe: "תגובה שמתעדפת אבטחה",
          explanation: "Problem: Cached API responses are serving other users' personal data. What happened: The new cache behavior matched API paths to the static asset rule, so responses got cached without per-user separation. Why this works: Invalidating the cache immediately removes all contaminated entries and stops the data leak.",
          explanationHe: "תגובה ראשונה נכונה. העדיפות המיידית היא לעצור זיהום-צולב של נתוני משתמשים. ביטול ה-cache מסיר את כל תגובות ה-API ששמורות עם נתונים של משתמשים אחרים. זה עוצר את הפרצה מיד, גם אם קבצים סטטיים ימשיכו לפגוע ב-origin עד שה-cache behaviors יתוקנו. אירועי אבטחה תמיד קודמים לביצועים.",
          stateEffect: { errorRate: 3, stability: "degraded", throughput: 1800, dbLoad: 75, queueDepth: 250 }
        },
        {
          text: "Rollback the CloudFront distribution to previous version",
          textHe: "בצע rollback ל-CloudFront distribution לגרסה הקודמת",
          nextStep: "rolled_back_cdn",
          impact: { performance: 10, cost: 0, reliability: 10 },
          operationalComplexity: 18,
          tag: "CDN rollback",
          tagHe: "Rollback ל-CDN",
          explanation: "Problem: CloudFront distribution rollbacks take 15-20 minutes to propagate globally. What happened: Edge locations that haven't received the rollback keep serving cached user data to wrong users. Why this failed: A cache invalidation would have stopped the leak in minutes instead of waiting for full propagation.",
          explanationHe: "בטוח אבל איטי. עדכוני CloudFront distribution לוקחים 15-20 דקות להתפשט גלובלית. במהלך החלון הזה, חלק מנקודות הקצה ממשיכות להגיש נתוני משתמשים שמורים למשתמשים לא נכונים. הפרצה ממשיכה לכל תקופת ההתפשטות. ה-rollback בסוף יתקן את שתי הבעיות אבל העיכוב יקר באירוע פרטיות.",
          stateEffect: { latency: 2200, stability: "degraded", throughput: 1900, dbLoad: 72, queueDepth: 220 }
        },
        {
          text: "Add Vary: Cookie header to API responses to prevent user data caching",
          textHe: "הוסף כותרת Vary: Cookie לתגובות API כדי למנוע caching של נתוני משתמשים",
          nextStep: "added_vary",
          impact: { performance: 5, cost: 0, reliability: 5 },
          operationalComplexity: 12,
          tag: "Vary header fix",
          tagHe: "תיקון Vary header",
          explanation: "Problem: Vary headers only affect future cache decisions, not entries already stored at edge locations. What happened: Contaminated cache entries keep serving other users' data until their TTL expires. Why this failed: You need a cache invalidation to clear what is already cached, since Vary headers cannot remove existing entries.",
          explanationHe: "תיקון חלקי. הוספת Vary: Cookie לתגובות API מונעת מבקשות חדשות להישמר בצורה שגויה. אבל תגובות שכבר שמורות נשארות בנקודות הקצה של CloudFront וממשיכות להיות מוגשות למשתמשים לא נכונים. עצרת את הדימום לבקשות חדשות אבל רשומות cache מזוהמות ימשיכו לפעול עד שה-TTL שלהן יפוג.",
          stateEffect: { errorRate: 5, stability: "degraded", throughput: 1900, dbLoad: 72, queueDepth: 210 }
        },
        {
          text: "Scale up origin pods to handle the increased traffic",
          textHe: "הגדל את מספר ה-pods במקור כדי לטפל בעלייה בתעבורה",
          nextStep: "scaled_origin",
          impact: { performance: 5, cost: -15, reliability: -10 },
          operationalComplexity: 35,
          tag: "Origin scaling",
          tagHe: "הגדלת Origin",
          explanation: "Problem: Scaling pods handles extra traffic but does nothing about the API caching bug. What happened: Users keep seeing other users' private data while you spend 4x on infrastructure. Why this failed: You prioritized performance over an active privacy breach, which is the wrong call during a security incident.",
          explanationHe: "מתעלם לחלוטין מבעיית האבטחה. הגדלה מ-5 ל-20 pods מטפלת בתעבורה העודפת מ-static assets לא שמורים, אבל משתמשים עדיין רואים נתונים של משתמשים אחרים כי בעיית ה-API caching לא טופלה. שיפרת ביצועים בעלות פי 4 בזמן שפרצת פרטיות ממשיכה. זו כשל תעדוף קריטי.",
          stateEffect: { cpuPercent: 40, costPerMonth: 12000, stability: "degraded", throughput: 4000, dbLoad: 80, queueDepth: 150 }
        }
      ]
    },
    invalidated_cache: {
      id: "invalidated_cache",
      timeDelta: "5 minutes after invalidation completed.",
      timeDeltaHe: "5 דקות אחרי שה-invalidation הושלם.",
      context: "Cache invalidated successfully. User data cross-contamination has stopped - no new reports since the invalidation. But static assets still have cache-control: no-store from the misconfigured catch-all rule. Every page load fetches JS/CSS/images directly from origin. ALB is handling 10x normal traffic for static assets. Origin pods at 85% CPU.",
      contextHe: "ה-cache בוטל בהצלחה. זיהום-צולב של נתוני משתמשים נעצר - אין דיווחים חדשים מאז הביטול. אבל לקבצים סטטיים עדיין יש cache-control: no-store מכלל ה-catch-all השגוי. כל טעינת עמוד מושכת JS/CSS/images ישירות מה-origin. ה-ALB מטפל בפי 10 תעבורה רגילה לקבצים סטטיים. Pods ב-85% CPU.",
      question: "Security is contained. How do you fix the static asset caching to restore performance?",
      questionHe: "האבטחה טופלה. איך מתקנים את caching הקבצים הסטטיים כדי לשחזר ביצועים?",
      alerts: [
        { type: "info", source: "Security", text: "No new cross-contamination reports since invalidation", textHe: "אין דיווחי זיהום-צולב חדשים מאז הביטול" },
        { type: "warning", source: "CloudFront", text: "Cache hit ratio: 0% - all requests going to origin", textHe: "יחס cache hit: 0% - כל הבקשות הולכות ל-origin" }
      ],
      logs: [
        { level: "warn", timestamp: "10:05:01", text: "cloudfront: MISS /static/app.js (cache-control: no-store)" },
        { level: "warn", timestamp: "10:05:02", text: "cloudfront: MISS /static/vendor.js (cache-control: no-store)" },
        { level: "info", timestamp: "10:05:03", text: "ALB: origin requests at 10x baseline" }
      ],
      options: [
        {
          text: "Fix cache behavior rules: static/* -> cache 30 days, api/* -> no-cache with proper Vary headers",
          textHe: "תקן כללי cache behavior: static/* -> cache ל-30 יום, api/* -> no-cache עם Vary headers מתאימים",
          nextStep: "end_optimal",
          impact: { performance: 20, cost: 5, reliability: 20 },
          operationalComplexity: 22,
          tag: "Proper cache rules",
          tagHe: "כללי cache מתאימים",
          explanation: "Problem: Cache behavior rules were in the wrong order, so static assets skipped caching and API responses got cached. What happened: Origin traffic spiked 10x and page performance collapsed. Why this works: Properly ordered rules give specific path patterns priority over the catch-all, restoring static caching and API pass-through.",
          explanationHe: "התיקון המלא. סדר cache behaviors מבטיח שקבצים סטטיים מקבלים caching אגרסיבי (TTL של 30 יום, immutable) בזמן שנתיבי API עוברים explicitly עם Vary: Cookie,Authorization. ה-catch-all כבר לא מפריע כי תבניות נתיב ספציפיות קודמות. יחס cache hit ישתקם ל-85%+ תוך דקות.",
          stateEffect: { latency: 120, errorRate: 0.5, cpuPercent: 25, costPerMonth: 3200, stability: "healthy", throughput: 8000, dbLoad: 30, queueDepth: 20 }
        },
        {
          text: "Set all cache behaviors to forward all headers (effectively disabling caching)",
          textHe: "הגדר את כל ה-cache behaviors להעביר את כל הכותרות (למעשה מבטל caching)",
          nextStep: "end_no_caching",
          impact: { performance: -5, cost: -10, reliability: 5 },
          operationalComplexity: 35,
          tag: "Disable all caching",
          tagHe: "ביטול כל ה-caching",
          explanation: "Problem: Forwarding all headers prevents CloudFront from caching anything. What happened: Every request hits origin, so you are paying for a CDN that acts as a passthrough proxy. Why this failed: Static assets should be served from nearby edge locations, but this config forces them to travel from origin every time.",
          explanationHe: "העברת כל הכותרות אומרת ש-CloudFront לא יכול לשמור שום דבר ב-cache. זה בטוח מבחינת אבטחה אבל מבטל את הטעם של CDN. כל בקשה פוגעת ב-origin. אתה משלם על CloudFront בלי לקבל תועלת caching. עלויות origin נשארות גבוהות. זמני טעינה נשארים איטיים.",
          stateEffect: { latency: 2200, errorRate: 2, cpuPercent: 80, costPerMonth: 5000, stability: "degraded", throughput: 2500, dbLoad: 65, queueDepth: 180 }
        },
        {
          text: "Only fix static asset caching, deal with API behavior later",
          textHe: "תקן רק caching של קבצים סטטיים, טפל ב-API אחר כך",
          nextStep: "end_partial_fix",
          impact: { performance: 10, cost: 0, reliability: 5 },
          operationalComplexity: 15,
          tag: "Partial fix",
          tagHe: "תיקון חלקי",
          explanation: "Problem: The API cache behavior still lacks proper Vary headers after this fix. What happened: Performance is restored, but the security vulnerability remains dormant. Why this failed: A future deployment could re-enable API caching and cause another data exposure incident.",
          explanationHe: "תיקון caching סטטי משחזר PageSpeed ומפחית תעבורת origin. אבל ה-cache behavior של ה-API עדיין חסר Vary headers מתאימים. למרות שה-invalidation ניקה רשומות מזוהמות, תגובות API עתידיות עלולות להישמר שוב ב-cache. תיקנת את בעיית הביצועים אבל השארת את פגיעות האבטחה לפעם הבאה.",
          stateEffect: { latency: 180, errorRate: 1, cpuPercent: 30, costPerMonth: 3500, stability: "at-risk", throughput: 7000, dbLoad: 35, queueDepth: 30 }
        }
      ]
    },
    rolled_back_cdn: {
      id: "rolled_back_cdn",
      timeDelta: "2 minutes after rollback initiated. Propagation in progress.",
      timeDeltaHe: "2 דקות אחרי שהופעל ה-rollback. התפשטות בתהליך.",
      context: "Rollback initiated. CloudFront shows status 'InProgress' - global propagation takes 15-20 minutes. Meanwhile, some edge locations still serve the old misconfigured behaviors. Security team is requesting an incident timeline. Users in regions where propagation hasn't reached are still seeing cached data from other users.",
      contextHe: "ה-rollback הופעל. CloudFront מראה סטטוס 'InProgress' - התפשטות גלובלית לוקחת 15-20 דקות. בינתיים, חלק מנקודות הקצה עדיין מגישות את ה-behaviors השגויים. צוות האבטחה מבקש ציר זמן של אירוע. משתמשים באזורים שההתפשטות לא הגיעה אליהם עדיין רואים נתונים של משתמשים אחרים.",
      question: "Rollback is propagating but will take 15-20 minutes. What do you do in the meantime?",
      questionHe: "ה-rollback מתפשט אבל ייקח 15-20 דקות. מה עושים בינתיים?",
      alerts: [
        { type: "info", source: "CloudFront", text: "Distribution update: InProgress (est. 15-20 min)", textHe: "עדכון Distribution: בתהליך (15-20 דקות משוער)" },
        { type: "warning", source: "Security", text: "Cross-contamination still active in unpropagated regions", textHe: "זיהום-צולב עדיין פעיל באזורים שלא התפשטו" }
      ],
      logs: [
        { level: "info", timestamp: "10:02:15", text: "cloudfront: distribution E1A2B3C4 update InProgress" },
        { level: "error", timestamp: "10:02:18", text: "us-east-1: still serving cached /api/v2/user/profile (stale)" }
      ],
      options: [
        {
          text: "Create invalidation for /api/* paths to speed up clearing cached user data",
          textHe: "צור invalidation לנתיבי /api/* כדי לזרז את ניקוי נתוני משתמשים שמורים",
          nextStep: "end_rollback_plus_invalidation",
          impact: { performance: 15, cost: -5, reliability: 15 },
          operationalComplexity: 15,
          tag: "Rollback + invalidation",
          tagHe: "Rollback + invalidation",
          explanation: "Problem: Rollback propagation takes 15-20 minutes, and contaminated cache entries stay active during that window. What happened: Users keep getting exposed to other users' data while you wait. Why this works: The invalidation clears cached API responses in 1-2 minutes, and the rollback restores correct behaviors once propagation finishes.",
          explanationHe: "תגובה מרובת-שלבים טובה. ה-invalidation נכנס לתוקף תוך 1-2 דקות, מנקה תגובות API שמורות הרבה יותר מהר מאשר להמתין להתפשטות מלאה. זה ממזער את חלון החשיפה של נתוני משתמשים. בשילוב עם ה-rollback שמשחזר cache behaviors נכונים, זה מטפל גם בבעיית האבטחה המיידית וגם בתצורה השגויה.",
          stateEffect: { latency: 200, errorRate: 1, cpuPercent: 30, costPerMonth: 3800, stability: "healthy", throughput: 7500, dbLoad: 35, queueDepth: 30 }
        },
        {
          text: "Wait for full propagation and monitor cache hit ratio recovery",
          textHe: "המתן להתפשטות מלאה ונטר את שחזור יחס cache hit",
          nextStep: "end_slow_recovery",
          impact: { performance: 5, cost: 0, reliability: 5 },
          operationalComplexity: 30,
          tag: "Passive recovery",
          tagHe: "שחזור פסיבי",
          explanation: "Problem: Waiting passively means contaminated cache entries keep serving user data for 15-20 minutes. What happened: More users get exposed to other users' private data during a window you could have cut to 1-2 minutes. Why this failed: An invalidation was available and compliance will flag the unnecessary delay.",
          explanationHe: "גישה פסיבית. ה-rollback בסוף יתקן הכל, אבל אתה מאפשר לפרצת האבטחה להמשיך 15-20 דקות ללא צורך. invalidation יכול היה לנקות נתוני משתמשים שמורים תוך 1-2 דקות. במהלך חלון ההמתנה, משתמשים נוספים עלולים להיחשף לנתונים של אחרים.",
          stateEffect: { latency: 250, errorRate: 2, cpuPercent: 35, costPerMonth: 3500, stability: "at-risk", throughput: 7000, dbLoad: 38, queueDepth: 40 }
        },
        {
          text: "Notify affected users of potential data exposure while rollback propagates",
          textHe: "הודע למשתמשים מושפעים על חשיפת נתונים אפשרית בזמן שה-rollback מתפשט",
          nextStep: "end_transparent_rollback",
          impact: { performance: 5, cost: 0, reliability: 10 },
          operationalComplexity: 12,
          tag: "Transparent response",
          tagHe: "תגובה שקופה",
          explanation: "Problem: You notified users but did not accelerate the technical fix. What happened: The breach continues for the full 15-20 minute rollback window while users watch. Why this failed: Notification should complement a cache invalidation, not replace it. The exposure window stays unnecessarily long.",
          explanationHe: "שקיפות חשובה לאמון, אבל הודעה בלי מיטיגציה טכנית מהירה יותר אומרת שאתה מודיע למשתמשים על בעיה מתמשכת שיכולת לקצר. invalidation לוקח 1-2 דקות והיה מקטין את חלון החשיפה. הודעה למשתמשים היא הצעד הנכון, אבל היא צריכה להשלים מיטיגציה טכנית, לא להחליף אותה.",
          stateEffect: { latency: 250, errorRate: 2, cpuPercent: 35, costPerMonth: 3500, stability: "at-risk", throughput: 6800, dbLoad: 40, queueDepth: 45 }
        }
      ]
    },
    added_vary: {
      id: "added_vary",
      timeDelta: "3 minutes after deploying Vary header change.",
      timeDeltaHe: "3 דקות אחרי פריסת שינוי ה-Vary header.",
      context: "Vary: Cookie header deployed to API responses. New API requests are no longer cached incorrectly. But the existing contaminated cache entries are still being served - a user just reported seeing another user's order history. The Vary header only affects future cache decisions, not existing entries. Static assets remain uncached with no-store.",
      contextHe: "כותרת Vary: Cookie נפרסה לתגובות API. בקשות API חדשות כבר לא נשמרות ב-cache בצורה שגויה. אבל רשומות cache מזוהמות קיימות עדיין מוגשות - משתמש זה עתה דיווח שהוא רואה היסטוריית הזמנות של משתמש אחר. ה-Vary header משפיע רק על החלטות cache עתידיות, לא על רשומות קיימות. קבצים סטטיים נשארים ללא cache עם no-store.",
      question: "Vary header stops new contamination but existing cached data is still being served. What's next?",
      questionHe: "ה-Vary header עוצר זיהום חדש אבל נתונים שמורים קיימים עדיין מוגשים. מה הלאה?",
      alerts: [
        { type: "warning", source: "Security", text: "Stale cached user data still being served from edge locations", textHe: "נתוני משתמשים ישנים עדיין מוגשים מנקודות קצה" },
        { type: "info", source: "CloudFront", text: "New API responses now include Vary: Cookie", textHe: "תגובות API חדשות כוללות עכשיו Vary: Cookie" }
      ],
      logs: [
        { level: "error", timestamp: "10:03:45", text: "user-789 reported seeing order history of user-321" },
        { level: "info", timestamp: "10:03:50", text: "New /api/v2/user/profile requests: Vary: Cookie present, cache MISS" }
      ],
      options: [
        {
          text: "Invalidate /api/* and fix static asset cache rules simultaneously",
          textHe: "בצע invalidation ל-/api/* ותקן כללי cache של קבצים סטטיים במקביל",
          nextStep: "end_vary_plus_fix",
          impact: { performance: 15, cost: -5, reliability: 15 },
          operationalComplexity: 22,
          tag: "Full recovery",
          tagHe: "שחזור מלא",
          explanation: "Problem: Contaminated cache entries are still being served and static assets remain uncached. What happened: The initial Vary-only fix let the data exposure continue for extra minutes. Why this works: Invalidation clears contaminated entries, static cache rules restore performance, and the deployed Vary headers prevent future miscaching.",
          explanationHe: "שחזור טוב מהצעד הראשון החלקי. ה-invalidation מנקה רשומות cache מזוהמות מיד ועוצר את חשיפת הנתונים. תיקון כללי cache סטטי משחזר ביצועים. בשילוב עם ה-Vary headers שכבר נפרסו, תצורת ה-CDN המלאה עכשיו נכונה. לקח יותר זמן מהנתיב האופטימלי אבל הגיע לאותה תוצאה.",
          stateEffect: { latency: 150, errorRate: 0.5, cpuPercent: 28, costPerMonth: 3400, stability: "healthy", throughput: 7800, dbLoad: 32, queueDepth: 25 }
        },
        {
          text: "Just invalidate /api/* paths, don't touch static cache rules yet",
          textHe: "בצע invalidation רק לנתיבי /api/*, אל תיגע בכללי cache סטטי בינתיים",
          nextStep: "end_vary_partial",
          impact: { performance: 5, cost: 0, reliability: 5 },
          operationalComplexity: 12,
          tag: "Partial recovery",
          tagHe: "שחזור חלקי",
          explanation: "Problem: Static assets remain uncached, keeping origin at 10x normal traffic. What happened: Page load times stay slow and infrastructure costs stay elevated. Why this works partially: The security breach is stopped, but the performance problem is left for a follow-up fix.",
          explanationHe: "עוצר את הפרצה אבל משאיר קבצים סטטיים ללא cache. ה-origin ממשיך לטפל בפי 10 תעבורה. זמני טעינה נשארים איטיים. תיקנת את הבעיה הקריטית אבל ביצועים ימשיכו להידרדר עד שמישהו יטפל בכללי cache של קבצים סטטיים.",
          stateEffect: { latency: 2000, errorRate: 1, cpuPercent: 78, costPerMonth: 4200, stability: "at-risk", throughput: 2500, dbLoad: 60, queueDepth: 160 }
        }
      ]
    },
    scaled_origin: {
      id: "scaled_origin",
      timeDelta: "8 minutes after scaling. Pods running: 20 (was 5).",
      timeDeltaHe: "8 דקות אחרי הגדלה. Pods פעילים: 20 (היו 5).",
      context: "Origin scaled from 5 to 20 pods. CPU dropped to 40%, latency improved. But users are STILL seeing other users' data - the API caching issue was never addressed. A user just posted a screenshot on Twitter showing someone else's account details on your platform. The tweet is gaining traction. Security and PR teams are now involved.",
      contextHe: "Origin הוגדל מ-5 ל-20 pods. CPU ירד ל-40%, השהיה השתפרה. אבל משתמשים עדיין רואים נתונים של משתמשים אחרים - בעיית ה-API caching לא טופלה. משתמש זה עתה פרסם צילום מסך בטוויטר שמראה פרטי חשבון של מישהו אחר בפלטפורמה שלך. הציוץ צובר תאוצה. צוותי אבטחה ויחסי ציבור מעורבים עכשיו.",
      question: "The security breach is now public on social media. What's your emergency response?",
      questionHe: "הפרצה עכשיו פומבית ברשתות חברתיות. מה תגובת החירום שלך?",
      alerts: [
        { type: "critical", source: "PR", text: "User posted data breach screenshot on Twitter - going viral", textHe: "משתמש פרסם צילום מסך של פרצת נתונים בטוויטר - הופך ויראלי" },
        { type: "critical", source: "Security", text: "Data cross-contamination ongoing - 47 reports and counting", textHe: "זיהום-צולב נתונים נמשך - 47 דיווחים ועולה" }
      ],
      logs: [
        { level: "error", timestamp: "10:08:22", text: "cloudfront: HIT /api/v2/user/profile - serving user-567 data to user-890" },
        { level: "info", timestamp: "10:08:25", text: "Origin: CPU 40%, 20 pods healthy, handling 10x traffic" }
      ],
      options: [
        {
          text: "Emergency: invalidate all caches and fix cache behavior rules immediately",
          textHe: "חירום: בטל את כל ה-caches ותקן את כללי cache behavior מיד",
          nextStep: "end_late_security_fix",
          impact: { performance: 10, cost: -5, reliability: 5 },
          operationalComplexity: 15,
          tag: "Late security fix",
          tagHe: "תיקון אבטחה מאוחר",
          explanation: "Problem: The security fix was delayed 8 minutes while you scaled pods instead. What happened: 47+ users were affected and the breach went public on social media. Why this works technically: The invalidation and cache fix are correct, but the delayed prioritization caused avoidable damage.",
          explanationHe: "התיקון הטכני הנכון, אבל הנזק נגרם. עיכוב של 8 דקות בטיפול בבעיית האבטחה בזמן הגדלת pods איפשר ל-47+ משתמשים להיות מושפעים ולאירוע להפוך פומבי. ה-invalidation והתיקון יעצרו את הדימום, אבל ציר הזמן של תגובת האירוע יראה שהגדלה קיבלה עדיפות על פני פרצת פרטיות.",
          stateEffect: { latency: 150, errorRate: 0.5, cpuPercent: 25, costPerMonth: 8000, stability: "at-risk", throughput: 7500, dbLoad: 32, queueDepth: 25 }
        },
        {
          text: "Take the site offline until the caching issue is fully resolved",
          textHe: "הורד את האתר עד שבעיית ה-caching תיפתר לחלוטין",
          nextStep: "end_site_down",
          impact: { performance: -20, cost: 0, reliability: 10 },
          operationalComplexity: 40,
          tag: "Emergency shutdown",
          tagHe: "כיבוי חירום",
          explanation: "Problem: Taking the entire site offline stops all revenue, not just the data leak. What happened: 35 minutes of full downtime and an estimated $12,000 in lost revenue. Why this failed: A targeted cache invalidation would have stopped the leak in 2 minutes without any downtime.",
          explanationHe: "צעד קיצוני שעוצר את דליפת הנתונים מיד אבל מפיל את כל השירות. עבור פרצת פרטיות בסדר גודל כזה (פומבי ברשתות חברתיות, 47+ משתמשים מושפעים), כיבוי עשוי להיות מוצדק תחת דרישות GDPR/רגולציה. עם זאת, invalidation ממוקד משיג את אותה תוצאת אבטחה בלי downtime מלא. זו תגובת פאניקה כשתיקון כירורגי קיים.",
          stateEffect: { latency: 0, errorRate: 100, cpuPercent: 5, costPerMonth: 12000, stability: "critical", throughput: 0, dbLoad: 5, queueDepth: 0 }
        }
      ]
    },
    // ── Terminal steps ──
    end_optimal: {
      id: "end_optimal",
      context: "Textbook incident response. Security breach stopped within 5 minutes via cache invalidation. Cache behaviors properly configured with ordered rules: static assets cached aggressively, API responses pass-through with correct Vary headers. Cache hit ratio recovered to 87% within 15 minutes. Origin traffic back to baseline. PageSpeed score: 96. No further data exposure reports. Incident documented with clear timeline showing security-first prioritization.",
      contextHe: "תגובת אירוע מהספר. פרצת אבטחה נעצרה תוך 5 דקות באמצעות cache invalidation. Cache behaviors הוגדרו נכון עם כללים מסודרים: קבצים סטטיים נשמרים ב-cache בצורה אגרסיבית, תגובות API עוברות pass-through עם Vary headers נכונים. יחס cache hit שוחזר ל-87% תוך 15 דקות. תעבורת origin חזרה לבסיס. ציון PageSpeed: 96. אין דיווחי חשיפת נתונים נוספים.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_no_caching: {
      id: "end_no_caching",
      context: "Security breach resolved but CloudFront is effectively disabled - forwarding all headers means 0% cache hit ratio. You're paying $1,500/month for a CDN that serves as a passthrough proxy. PageSpeed score: 42. Users experience slow page loads because every static asset travels from origin through CloudFront without edge caching. Data transfer costs increasing. The team will need to revisit cache behaviors eventually, doing the work that should have been done now.",
      contextHe: "פרצת אבטחה נפתרה אבל CloudFront למעשה מבוטל - העברת כל הכותרות אומרת 0% יחס cache hit. אתה משלם $1,500 לחודש על CDN שמשמש כ-proxy passthrough. ציון PageSpeed: 42. משתמשים חווים טעינה איטית כי כל קובץ סטטי נוסע מה-origin דרך CloudFront בלי edge caching. עלויות העברת נתונים עולות.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_partial_fix: {
      id: "end_partial_fix",
      context: "Static assets caching restored - PageSpeed back to 90, origin traffic normalized. But the API cache behavior was left without proper Vary headers. Two weeks later, a similar deployment accidentally re-enabled API caching, causing another data exposure incident. The incomplete fix created a recurring vulnerability. The second incident triggered a mandatory security review that found the missing Vary headers - the fix that should have been applied the first time.",
      contextHe: "Caching של קבצים סטטיים שוחזר - PageSpeed חזר ל-90, תעבורת origin חזרה לנורמלי. אבל ה-cache behavior של ה-API נשאר בלי Vary headers מתאימים. שבועיים אחר כך, פריסה דומה בטעות הפעילה מחדש API caching, וגרמה לאירוע חשיפת נתונים נוסף. התיקון החלקי יצר פגיעות חוזרת. האירוע השני הפעיל סקירת אבטחה חובה שמצאה את ה-Vary headers החסרים.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_rollback_plus_invalidation: {
      id: "end_rollback_plus_invalidation",
      context: "Strong response combining rollback with targeted invalidation. API cache cleared within 2 minutes, stopping data exposure well before the 15-minute propagation window. Rollback restored correct cache behaviors globally within 18 minutes. Total exposure window: ~7 minutes (initial detection + invalidation). Cache hit ratio recovered to 83% as rollback completed. Incident report shows thoughtful multi-step mitigation. Team recommended adding invalidation to the CDN rollback runbook.",
      contextHe: "תגובה חזקה שמשלבת rollback עם invalidation ממוקד. Cache של API נוקה תוך 2 דקות, עצר חשיפת נתונים הרבה לפני חלון ההתפשטות של 15 דקות. ה-rollback שיחזר cache behaviors נכונים גלובלית תוך 18 דקות. חלון חשיפה כולל: כ-7 דקות. יחס cache hit שוחזר ל-83% עם השלמת ה-rollback. הצוות המליץ להוסיף invalidation ל-runbook של rollback ל-CDN.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_slow_recovery: {
      id: "end_slow_recovery",
      context: "Rollback completed after 18 minutes. Cache behaviors restored to pre-update state. But during the 18-minute window, 23 additional users experienced data cross-contamination. Compliance team flagged the unnecessary delay - an invalidation could have reduced the exposure window to 2 minutes. Incident post-mortem highlighted the gap between 'correct eventual outcome' and 'optimal incident response'. The team added CDN invalidation as step 1 in the security incident playbook.",
      contextHe: "ה-rollback הושלם אחרי 18 דקות. Cache behaviors שוחזרו למצב לפני העדכון. אבל במהלך חלון 18 הדקות, 23 משתמשים נוספים חוו זיהום-צולב נתונים. צוות compliance סימן את העיכוב המיותר - invalidation יכול היה לצמצם את חלון החשיפה ל-2 דקות. Post-mortem של האירוע הדגיש את הפער בין 'תוצאה סופית נכונה' ל'תגובת אירוע אופטימלית'.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_transparent_rollback: {
      id: "end_transparent_rollback",
      context: "Users notified about potential data exposure. The transparency was well-received, but 15 minutes of continued exposure during rollback propagation resulted in 19 additional affected users. Regulatory review noted that technical mitigation (invalidation) was available but not used. The notification was the right complement to a fix, but without the fix being accelerated, it became an admission of a slow response. Trust impact: mixed - users appreciated honesty but questioned why it took so long to stop.",
      contextHe: "משתמשים הודעו על חשיפת נתונים אפשרית. השקיפות התקבלה בצורה חיובית, אבל 15 דקות של חשיפה נמשכת במהלך התפשטות ה-rollback הביאו ל-19 משתמשים מושפעים נוספים. סקירה רגולטורית ציינה שמיטיגציה טכנית (invalidation) הייתה זמינה אבל לא נוצלה. ההודעה הייתה ההשלמה הנכונה לתיקון, אבל בלי שהתיקון הואץ, היא הפכה להודאה בתגובה איטית.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_vary_plus_fix: {
      id: "end_vary_plus_fix",
      context: "Good recovery from the initial partial step. Invalidation cleared contaminated entries, Vary headers prevent future miscaching, and static rules restored performance. Total exposure window: ~8 minutes (longer than the optimal path due to the initial Vary-only step). Cache hit ratio: 84%. PageSpeed: 93. The extra step added 3 minutes of exposure compared to immediate invalidation, but the final configuration is solid. Post-mortem noted: always invalidate first when cached data contains user information.",
      contextHe: "שחזור טוב מהצעד הראשוני החלקי. Invalidation ניקה רשומות מזוהמות, Vary headers מונעים caching שגוי בעתיד, וכללי static שחזרו ביצועים. חלון חשיפה כולל: כ-8 דקות (יותר מהנתיב האופטימלי בגלל הצעד הראשוני של Vary בלבד). יחס cache hit: 84%. PageSpeed: 93. הצעד הנוסף הוסיף 3 דקות חשיפה לעומת invalidation מיידי, אבל התצורה הסופית יציבה.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_vary_partial: {
      id: "end_vary_partial",
      context: "Security breach stopped after invalidation cleared contaminated entries. Vary headers prevent future API caching issues. But static assets remain uncached - origin handling 10x traffic at elevated cost. PageSpeed: 38. Users experience 2-3 second page loads. The team filed a follow-up ticket to fix static cache rules but it sat in the backlog for a week. During that week: $800 in excess origin costs, degraded user experience, and two on-call escalations from CPU alerts.",
      contextHe: "פרצת האבטחה נעצרה אחרי ש-invalidation ניקה רשומות מזוהמות. Vary headers מונעים בעיות API caching בעתיד. אבל קבצים סטטיים נשארים ללא cache - origin מטפל בפי 10 תעבורה בעלות מוגברת. PageSpeed: 38. משתמשים חווים זמני טעינה של 2-3 שניות. הצוות פתח טיקט המשך לתיקון כללי cache סטטי אבל הוא ישב ב-backlog שבוע. במהלך השבוע: $800 בעלויות origin עודפות ושתי אסקלציות תורנות.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_late_security_fix: {
      id: "end_late_security_fix",
      context: "Cache invalidated and behaviors fixed. Technically correct end state: cache hit ratio 85%, PageSpeed 94, origin traffic normal. But the 8-minute delay while scaling pods (ignoring the security issue) resulted in 47 affected users and a public Twitter incident. PR team managing fallout. Legal reviewing GDPR notification requirements for the 47 affected users. The 20 scaled pods are still running at $12K/month - someone needs to scale back down. Incident review rated the response as 'delayed prioritization of security over performance'.",
      contextHe: "Cache בוטל ו-behaviors תוקנו. מצב סופי נכון טכנית: יחס cache hit 85%, PageSpeed 94, תעבורת origin רגילה. אבל עיכוב של 8 דקות בזמן הגדלת pods (תוך התעלמות מבעיית האבטחה) הביא ל-47 משתמשים מושפעים ולאירוע פומבי בטוויטר. צוות יח\"צ מנהל את הנזק. משפטי בודק דרישות הודעת GDPR עבור 47 המשתמשים המושפעים. 20 ה-pods שהוגדלו עדיין רצים ב-$12K לחודש.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    },
    end_site_down: {
      id: "end_site_down",
      context: "Site taken offline. Data leak stopped immediately but so did all revenue. 35 minutes of full downtime while the team fixed cache behaviors under pressure. Estimated revenue loss: $12,000. Customer trust severely impacted - users saw a maintenance page after a Twitter post about data exposure. A targeted cache invalidation would have stopped the leak in 2 minutes without any downtime. Post-mortem conclusion: the shutdown was a panic response. The team lacked a CDN incident runbook, leading to an extreme measure when a precise fix was available.",
      contextHe: "האתר הורד. דליפת הנתונים נעצרה מיד אבל גם כל ההכנסות. 35 דקות של downtime מלא בזמן שהצוות תיקן cache behaviors תחת לחץ. הפסד הכנסות משוער: $12,000. אמון לקוחות נפגע קשה - משתמשים ראו דף תחזוקה אחרי פוסט בטוויטר על חשיפת נתונים. Invalidation ממוקד היה עוצר את הדליפה ב-2 דקות בלי downtime כלל. מסקנת post-mortem: הכיבוי היה תגובת פאניקה.",
      question: null, options: [],
      rootCause: ROOT_CAUSE,
      rootCauseHe: ROOT_CAUSE_HE,
      productionSolution: PROD_SOLUTION,
      productionSolutionHe: PROD_SOLUTION_HE
    }
  }
};
