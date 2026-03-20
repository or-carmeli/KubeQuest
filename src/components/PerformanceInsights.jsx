/**
 * Performance Insights — Dev-only internal observability dashboard.
 *
 * Triple-gated:
 *  1. Menu item only rendered when import.meta.env.DEV
 *  2. Route only registered when import.meta.env.DEV
 *  3. Component guard below returns null in production
 *
 * 100% real data. No simulated metrics.
 */
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  ArrowLeft, Activity, AlertTriangle, Clock, Gauge, Users,
  Eye, ChevronDown, ChevronUp, RefreshCw, Globe,
} from "lucide-react";
import { THRESHOLDS, SEVERITY_COLORS, severity, computeBaseline, CRUX_BENCHMARKS, compareToGlobal } from "../utils/mockTelemetry";
import { buildSnapshot, TIME_RANGES } from "../utils/hybridTelemetry";
import { initRealTelemetry, getRealMetrics, recordRouteChange } from "../utils/realTelemetry";


// ─── Component-level guard ─────────────────────────────────────────────────────
export default function PerformanceInsights({ onBack, lang = "en", dir = "ltr" }) {
  if (!import.meta.env.DEV) return null;
  return <PerformanceInsightsInner onBack={onBack} lang={lang} dir={dir} />;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const MONO = "'Fira Code','Courier New',monospace";
const COLLECTING = "Collecting\u2026";

// Shared spacing constants
const CHART_ROW_H    = 28;   // row height for horizontal bar charts
const CHART_LABEL_W  = 100;  // fixed label column width
const CHART_VALUE_W  = 56;   // fixed value column width
const CHART_BAR_H    = 6;    // bar thickness
const CHART_BAR_R    = 3;    // bar border-radius
const CHART_GAP      = 0;    // gap between rows (controlled via padding)
const SECTION_GAP    = 16;   // gap between sections within a tab
const COL_GAP        = 10;   // gap between columns in a row

// ─── Shared chart primitives ───────────────────────────────────────────────────

/** Section header used above every chart / data block. */
function ChartSection({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: SECTION_GAP }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

/** Structured empty state for any chart area. */
function EmptyChartState({ title, message, hint }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 10 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{title || "No data yet"}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>{message}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>{hint}</div>}
    </div>
  );
}

/**
 * Horizontal bar chart with strict 3-column layout:
 *   [label (fixed)] [bar (flex)] [value (fixed)]
 * All rows align to the same grid.
 */
function HorizontalBarChart({ items, labelWidth = CHART_LABEL_W, valueWidth = CHART_VALUE_W }) {
  const maxVal = useMemo(() => Math.max(...items.map(r => r.value), 1), [items]);
  const total = useMemo(() => items.reduce((s, r) => s + r.value, 0), [items]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => {
        const pct = (item.value / maxVal) * 100;
        const sharePct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.label} style={{ display: "flex", alignItems: "center", height: CHART_ROW_H, gap: COL_GAP, borderBottom: i < items.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
            {/* Label column — fixed width, truncated */}
            <span style={{ width: labelWidth, flexShrink: 0, fontSize: 11, color: "var(--text-secondary)", fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
            {/* Bar column — flexible */}
            <div style={{ flex: 1, background: "var(--glass-3)", borderRadius: CHART_BAR_R, height: CHART_BAR_H, overflow: "hidden" }}>
              <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: item.color || "var(--glass-15)", borderRadius: CHART_BAR_R, transition: "width 0.3s ease" }} />
            </div>
            {/* Value column — fixed width, right-aligned */}
            <span style={{ width: valueWidth, flexShrink: 0, textAlign: "right", fontSize: 11, fontFamily: MONO, color: "var(--text-secondary)" }}>
              {item.value}{item.showPct !== false && total > 1 ? <span style={{ color: "var(--text-disabled)", marginLeft: 3, fontSize: 9 }}>{sharePct}%</span> : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Summary stat row: label on left, value on right. Use inside a container. */
function StatRow({ label, desc, value, unit, warn, warnColor, last, zeroLabel }) {
  const isZero = value === 0 && zeroLabel;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: CHART_ROW_H, borderBottom: last ? "none" : "1px solid var(--glass-3)", padding: "6px 0" }}>
      <div>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        {desc && <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.3 }}>{desc}</div>}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: MONO, color: warn ? (warnColor || "#fbbf24") : isZero ? "var(--text-muted)" : "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
        {value}{unit || ""}
        {isZero && <span style={{ fontSize: 9, fontWeight: 500, color: "var(--text-dim)", background: "var(--glass-3)", padding: "1px 5px", borderRadius: 4, fontFamily: "inherit" }}>{zeroLabel}</span>}
      </span>
    </div>
  );
}

/** Large metric for the top banner — optimized for screen-share readability. */
function BannerMetric({ label, desc, value, color, last }) {
  return (
    <div style={{ flex: 1, minWidth: 100, padding: "0 16px", borderRight: last ? "none" : "1px solid var(--glass-3)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: MONO, lineHeight: 1 }}>{value}</div>
      {desc && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.3 }}>{desc}</div>}
    </div>
  );
}

/** Inline metric for secondary areas (flow stats, etc). */
function InlineMetric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.4, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: MONO, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function ConfidenceBadge({ level, t }) {
  if (level === "none") return null;
  const cfg = {
    low:    { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)", icon: "\u25CB" },
    medium: { bg: "rgba(96,165,250,0.10)", color: "#60a5fa", border: "rgba(96,165,250,0.20)", icon: "\u25D1" },
    high:   { bg: "rgba(52,211,153,0.10)", color: "#34d399", border: "rgba(52,211,153,0.20)", icon: "\u25CF" },
  };
  const c = cfg[level] || cfg.low;
  const label = t ? (level === "low" ? t("confidenceLow") : level === "medium" ? t("confidenceMed") : t("confidenceHigh")) : (level === "low" ? "Low confidence" : level === "medium" ? "Medium" : "High");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ fontSize: 9 }}>{c.icon}</span>
      {label}
    </span>
  );
}

function SeverityDot({ sev, size = 6 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: SEVERITY_COLORS[sev]?.text || "#60a5fa", flexShrink: 0, marginTop: 1 }} />;
}

function sevColor(value, threshold, goodColor = "#34d399") {
  if (value == null) return "var(--text-dim)";
  const s = severity(value, threshold);
  return s === "info" ? goodColor : SEVERITY_COLORS[s].text;
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 780, margin: "0 auto", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, background: "var(--glass-3)", borderRadius: 8 }} />
        <div style={{ width: 180, height: 22, background: "var(--glass-3)", borderRadius: 6 }} />
      </div>
      <div style={{ height: 80, background: "var(--glass-2)", borderRadius: 12, marginBottom: 32, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 60, background: "var(--glass-2)", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.2s" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// ─── i18n labels ────────────────────────────────────────────────────────────
const T = {
  en: {
    title: "Performance Insights",
    devOnly: "Dev Only",
    p95Latency: "P95 LATENCY", p95Desc: "95th percentile - response time of 95% of requests",
    errorRate: "ERROR RATE", errorRateDesc: "Percentage of failed requests",
    traffic: "TRAFFIC", trafficDesc: "Requests per second (RPS)",
    errors: "ERRORS", errorsDesc: "Total errors in selected time window",
    requestLatency: "Request Latency",
    trendUp: "Trending up", trendDown: "Trending down", trendStable: "Stable",
    basedOn: (n, range) => `Based on ${n} request${n !== 1 ? "s" : ""} in ${range}`,
    lowSample: "Low sample size",
    noRequestsTitle: (range) => `No requests in ${range}`,
    noRequestsMsgTimed: (label) => `No network requests recorded in the last ${label}. Try a wider time range or interact with the app.`,
    noRequestsMsgSession: "No traffic has been observed in this session.",
    noRequestsHintShort: "Short windows may be empty during idle periods.",
    noRequestsHintNav: "Navigate to a quiz or topic to generate requests.",
    insights: "Insights",
    diagnostics: "Diagnostics",
    alertCount: (n) => `${n} alert${n !== 1 ? "s" : ""}`,
    tabVitals: "Vitals", tabClient: "Client", tabUserFlow: "User Flow",
    coreVitals: "Core Web Vitals",
    vitalsSubtitle: "Session measurements vs. global benchmarks (CrUX p75)",
    vitalsEmpty: "Web Vitals not yet measured",
    vitalsEmptyMsg: "LCP is captured on first meaningful paint. INP and CLS require user interaction.",
    vitalsEmptyHint: "Click buttons, scroll, or navigate to trigger collection.",
    sessionLabel: "SESSION", globalLabel: "GLOBAL (P75)",
    good: "Good", needsWork: "Needs work", poor: "Poor",
    navTiming: "Navigation Timing",
    errorCounters: "Error Counters",
    recentErrors: "Recent Errors", recentNetwork: "Recent Network Issues",
    sessionActivity: "Session Activity",
    routeVisits: "Route Visits",
    noActivity: "No user activity recorded",
    noActivityMsg: "Route visits, quiz metrics, and session data will appear as you use the app.",
    noActivityHint: "Navigate between screens or start a quiz to generate flow data.",
    allData: "All data collected from real browser signals",
    ttfb: "TTFB", ttfbDesc: "Time To First Byte - time to first byte from server",
    domLoaded: "DOM Content Loaded", domLoadedDesc: "Time until DOM is fully parsed and ready",
    pageLoad: "Full Page Load", pageLoadDesc: "Total time from navigation start to page ready",
    dns: "DNS Lookup", dnsDesc: "Domain Name System - domain to IP resolution time",
    tcp: "TCP Connect", tcpDesc: "Transmission Control Protocol - connection to server",
    unhandled: "Unhandled errors", promiseRej: "Promise rejections",
    failedReq: "Failed requests", slowReq: "Slow requests",
    session: "SESSION", routesVisited: "ROUTES VISITED",
    quizzesStarted: "QUIZZES STARTED", completed: "COMPLETED",
    completionRate: "COMPLETION RATE", retries: "RETRIES",
    statusIdle: (range) => `System idle \u00b7 No traffic in ${range}`,
    statusHealthy: "Healthy", statusDegraded: "Degraded", statusUnhealthy: "Unhealthy",
    statusHealthyLow: "Healthy (low confidence)",
    confidenceLow: "Low confidence", confidenceMed: "Medium", confidenceHigh: "High",
    noTrafficYet: "No traffic observed yet",
    avg: "Avg", p95: "P95", samples: "Samples",
    last: "Last",
    // Section headers
    trafficObservability: "Traffic Observability",
    trafficObservabilityDesc: "API request metrics for the selected time window",
    browserPerformance: "Browser Performance",
    browserPerformanceDesc: "Page load and rendering metrics from the browser. Available even without API traffic.",
    pageLoadDiagnostics: "Page Load Diagnostics",
    pageLoadDiagnosticsDesc: "Navigation Timing API measurements from initial page load",
    zeroMsCached: "cached",
    zeroMsReused: "reused",
    zeroMsNote: "0ms values indicate DNS caching or connection reuse by the browser.",
  },
  he: {
    title: "תובנות ביצועים",
    devOnly: "Dev Only",
    p95Latency: "P95 LATENCY", p95Desc: "95th Percentile - זמן תגובה של 95% מהבקשות",
    errorRate: "ERROR RATE", errorRateDesc: "אחוז הבקשות שנכשלו",
    traffic: "TRAFFIC", trafficDesc: "Requests Per Second - בקשות לשנייה",
    errors: "ERRORS", errorsDesc: "סך שגיאות בחלון הזמן הנבחר",
    requestLatency: "Request Latency - זמן תגובה",
    trendUp: "במגמת עלייה", trendDown: "במגמת ירידה", trendStable: "יציב",
    basedOn: (n, range) => `מבוסס על ${n} בקשות ב-${range}`,
    lowSample: "מדגם קטן",
    noRequestsTitle: (range) => `אין בקשות ב-${range}`,
    noRequestsMsgTimed: (label) => `לא נרשמו בקשות ב-${label} האחרונות. נסו טווח זמן רחב יותר או השתמשו באפליקציה.`,
    noRequestsMsgSession: "לא נצפתה תעבורה ב-Session הנוכחי.",
    noRequestsHintShort: "חלונות זמן קצרים עלולים להיות ריקים בזמן חוסר פעילות.",
    noRequestsHintNav: "נווטו לחידון או נושא כדי ליצור בקשות.",
    insights: "תובנות",
    diagnostics: "אבחון",
    alertCount: (n) => `${n} התראות`,
    tabVitals: "Vitals", tabClient: "Client", tabUserFlow: "User Flow",
    coreVitals: "Core Web Vitals - מדדי ביצועים",
    vitalsSubtitle: "מדידות Session מול benchmarks גלובליים (CrUX p75)",
    vitalsEmpty: "Web Vitals עדיין לא נמדדו",
    vitalsEmptyMsg: "LCP נמדד בטעינה ראשונה. INP ו-CLS דורשים אינטראקציה.",
    vitalsEmptyHint: "לחצו על כפתורים, גללו, או נווטו כדי להפעיל מדידה.",
    sessionLabel: "SESSION", globalLabel: "GLOBAL (P75)",
    good: "תקין", needsWork: "דורש שיפור", poor: "בעייתי",
    navTiming: "Navigation Timing - זמני ניווט",
    errorCounters: "מונה שגיאות",
    recentErrors: "שגיאות אחרונות", recentNetwork: "בעיות רשת אחרונות",
    sessionActivity: "פעילות ב-Session",
    routeVisits: "ביקורים לפי מסך",
    noActivity: "לא נרשמה פעילות משתמש",
    noActivityMsg: "ביקורים במסכים, מדדי חידון ונתוני Session יופיעו בזמן השימוש באפליקציה.",
    noActivityHint: "נווטו בין מסכים או התחילו חידון כדי ליצור נתוני זרימה.",
    allData: "כל הנתונים נאספים מאותות דפדפן אמיתיים",
    ttfb: "TTFB", ttfbDesc: "Time To First Byte - זמן עד ה-byte הראשון מהשרת",
    domLoaded: "DOM Content Loaded", domLoadedDesc: "זמן עד שה-DOM מוכן ומעובד",
    pageLoad: "Full Page Load", pageLoadDesc: "זמן כולל מתחילת הניווט עד שהדף מוכן",
    dns: "DNS Lookup", dnsDesc: "Domain Name System - תרגום שם דומיין לכתובת IP",
    tcp: "TCP Connect", tcpDesc: "Transmission Control Protocol - חיבור לשרת",
    unhandled: "שגיאות לא מטופלות", promiseRej: "Promise rejections",
    failedReq: "בקשות שנכשלו", slowReq: "בקשות איטיות",
    session: "SESSION", routesVisited: "מסכים שנצפו",
    quizzesStarted: "חידונים שהתחילו", completed: "הושלמו",
    completionRate: "אחוז השלמה", retries: "ניסיונות חוזרים",
    statusIdle: (range) => `המערכת פעילה - אין תעבורה ב-${range}`,
    statusHealthy: "תקין", statusDegraded: "מופחת", statusUnhealthy: "לא תקין",
    statusHealthyLow: "תקין (מהימנות נמוכה)",
    confidenceLow: "מהימנות נמוכה", confidenceMed: "בינוני", confidenceHigh: "גבוה",
    noTrafficYet: "לא נצפתה תעבורה עדיין",
    avg: "ממוצע", p95: "P95", samples: "דגימות",
    last: "אחרון",
    // Section headers
    trafficObservability: "Traffic Observability - מדדי תעבורה",
    trafficObservabilityDesc: "מדדי בקשות API בחלון הזמן הנבחר",
    browserPerformance: "Browser Performance - ביצועי דפדפן",
    browserPerformanceDesc: "מדדי טעינה ורינדור מהדפדפן. זמינים גם ללא תעבורת API.",
    pageLoadDiagnostics: "Page Load Diagnostics - אבחון טעינה",
    pageLoadDiagnosticsDesc: "מדידות Navigation Timing API מטעינת הדף הראשונית",
    zeroMsCached: "cached",
    zeroMsReused: "reused",
    zeroMsNote: "ערכי 0ms מעידים על DNS cache או שימוש חוזר בחיבור קיים.",
  },
};

function PerformanceInsightsInner({ onBack, lang = "en", dir = "ltr" }) {
  const t = (key) => (T[lang] || T.en)[key] || T.en[key] || key;
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("vitals");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRangeKey, setTimeRangeKey] = useState("session");

  const activeRange = TIME_RANGES.find(r => r.key === timeRangeKey) || TIME_RANGES[TIME_RANGES.length - 1];

  useEffect(() => {
    const cleanup = initRealTelemetry();
    recordRouteChange("performanceInsights");
    return cleanup;
  }, []);

  const loadSnapshot = useCallback(() => {
    const real = getRealMetrics();
    setData(buildSnapshot(real, activeRange.sec));
    setLastUpdated(new Date());
  }, [activeRange.sec]);

  useEffect(() => { const t = setTimeout(loadSnapshot, 350); return () => clearTimeout(t); }, [loadSnapshot]);
  const refresh = useCallback(() => { setData(null); setTimeout(loadSnapshot, 250); }, [loadSnapshot]);
  useEffect(() => { const id = setInterval(loadSnapshot, 30_000); return () => clearInterval(id); }, [loadSnapshot]);

  // Hooks before early return
  const health = data?.health || { status: "unknown", reason: "Initializing telemetry collectors\u2026", score: 0 };
  const alerts = data?.alerts || [];
  const insights = data?.insights || [];
  const latencyBaseline = data?.latencyBaseline || null;
  const confidence = data?.confidence || { level: "none", label: "No data" };
  const healthColor = health.status === "unhealthy" ? "#f87171" : health.status === "degraded" ? "#fbbf24" : health.status === "unknown" ? "#64748b" : "#34d399";
  const trendDir = latencyBaseline?.direction || null;

  // Time context
  const agoSec = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : null;
  const rangeLabel = activeRange.sec != null ? (lang === "he" ? `${t("last")} ${activeRange.label}` : `Last ${activeRange.label}`) : "Session";
  const timeContextText = agoSec != null ? `${rangeLabel} \u00b7 ${agoSec}s` : rangeLabel;

  if (!data) return <Skeleton />;

  const hasLatencyData = data.latencyTimeline.length > 0;
  const TABS = [
    { id: "vitals",   label: t("tabVitals"),   icon: Eye },
    { id: "client",   label: t("tabClient"),   icon: Globe },
    { id: "userflow", label: t("tabUserFlow"), icon: Users },
  ];

  return (
    <div className="page-pad" style={{ maxWidth: 780, margin: "0 auto", padding: "12px 14px", animation: "fadeIn 0.3s ease", direction: dir }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <button className="back-btn" onClick={onBack} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={16} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.2 }}>{t("title")}</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>{t("devOnly")}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{timeContextText}</span>
          <button onClick={refresh} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-muted)", padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center" }} title="Refresh">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Time range selector */}
      <div style={{ display: "flex", gap: 2, marginBottom: 18, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 3, width: "fit-content" }}>
        {TIME_RANGES.map(r => {
          const active = r.key === timeRangeKey;
          return (
            <button key={r.key} onClick={() => setTimeRangeKey(r.key)} style={{
              background: active ? "var(--glass-10)" : "transparent",
              border: "none",
              color: active ? "var(--text-bright)" : "var(--text-muted)",
              padding: "5px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: active ? 700 : 400,
              transition: "all 0.15s ease",
            }}>
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 1 — Traffic Observability (API request metrics)
         ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 28 }}>
        <ChartSection title={t("trafficObservability")} subtitle={t("trafficObservabilityDesc")}>
          {/* Status banner */}
          <div style={{ background: `rgba(${health.status === "unhealthy" ? "239,68,68" : health.status === "degraded" ? "245,158,11" : health.status === "unknown" ? "148,163,184" : "52,211,153"},0.03)`, border: `1px solid ${healthColor}18`, borderRadius: 12, padding: "18px 20px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: healthColor, boxShadow: health.status === "unknown" ? "none" : `0 0 6px ${healthColor}CC, 0 0 12px ${healthColor}66` }} />
              <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.3 }}>
                {health.status === "unknown" ? t("statusIdle")(rangeLabel) : health.status === "healthy" && confidence.level === "low" ? t("statusHealthyLow") : { healthy: t("statusHealthy"), degraded: t("statusDegraded"), unhealthy: t("statusUnhealthy") }[health.status]}
              </span>
              <ConfidenceBadge level={confidence.level} t={t} />
            </div>
            <div style={{ fontSize: 14, color: health.status === "unknown" ? "var(--text-muted)" : "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>{health.reason}</div>
            <div style={{ display: "flex", gap: 0, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid var(--glass-3)" }}>
              <BannerMetric label={t("p95Latency")} desc={t("p95Desc")} value={data.p95 != null ? data.p95 + "ms" : (data.totalRequests > 0 ? "Sampling\u2026" : "\u2014")} color={data.p95 != null ? sevColor(data.p95, THRESHOLDS.p95Latency, "var(--text-bright)") : "var(--text-dim)"} />
              <BannerMetric label={t("errorRate")} desc={t("errorRateDesc")} value={data.errorRate != null ? data.errorRate + "%" : (data.totalRequests > 0 ? "0%" : "N/A")} color={data.errorRate != null && data.errorRate >= 2 ? "#f87171" : "var(--text-bright)"} />
              <BannerMetric label={t("traffic")} desc={t("trafficDesc")} value={data.traffic?.rps != null ? data.traffic.label : (data.totalRequests > 0 ? data.totalRequests + " req" : "\u2014")} color={data.totalRequests > 0 ? "var(--text-bright)" : "var(--text-dim)"} />
              <BannerMetric label={t("errors")} desc={t("errorsDesc")} value={String(data.errorCount)} color={data.errorCount > 0 ? "#f87171" : "var(--text-bright)"} last />
            </div>
          </div>
        </ChartSection>

        {/* Collapsible alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <button onClick={() => setAlertsOpen(!alertsOpen)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}>
              {alertsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <AlertTriangle size={12} color={health.status === "unhealthy" ? "#f87171" : "#fbbf24"} />
              <span>{t("alertCount")(alerts.length)}</span>
            </button>
            {alertsOpen && (
              <div style={{ padding: "4px 12px 8px 30px", display: "flex", flexDirection: "column", gap: 4 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, color: SEVERITY_COLORS[a.severity].text, display: "flex", alignItems: "center", gap: 6 }}>
                    <SeverityDot sev={a.severity} />
                    {a.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Request latency chart */}
        <div style={{ marginTop: 16 }}>
          <ChartSection
            title={<span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {t("requestLatency")}
              {trendDir && <span style={{ fontSize: 10, fontWeight: 400, color: trendDir === "increasing" ? "#fbbf24" : trendDir === "decreasing" ? "#34d399" : "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>
                {trendDir === "increasing" ? t("trendUp") : trendDir === "decreasing" ? t("trendDown") : t("trendStable")}
              </span>}
            </span>}
            subtitle={hasLatencyData ? `${t("basedOn")(data.latencyTimeline.length, rangeLabel)}${confidence.level === "low" ? ` \u00b7 ${t("lowSample")}` : ""}` : null}
          >
            {hasLatencyData
              ? <LatencyChart data={data.latencyTimeline} baseline={latencyBaseline} p95={data.p95} />
              : <EmptyChartState title={t("noRequestsTitle")(rangeLabel)} message={activeRange.sec != null ? t("noRequestsMsgTimed")(activeRange.label) : t("noRequestsMsgSession")} hint={activeRange.sec != null && activeRange.sec <= 60 ? t("noRequestsHintShort") : t("noRequestsHintNav")} />
            }
          </ChartSection>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <ChartSection title={t("insights")}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < insights.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
                    <SeverityDot sev={ins.severity} size={7} />
                    <span style={{ fontSize: 14, color: ins.severity === "info" ? "var(--text-secondary)" : SEVERITY_COLORS[ins.severity].text, lineHeight: 1.5 }}>
                      {ins.message}
                    </span>
                  </div>
                ))}
              </div>
            </ChartSection>
          </div>
        )}
      </div>

      {/* Divider between sections */}
      <div style={{ borderTop: "1px solid var(--glass-4)", marginBottom: 28 }} />

      {/* ════════════════════════════════════════════════════════════════════════
         SECTION 2 — Browser Performance (page load + rendering metrics)
         ════════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 20 }}>
        <ChartSection title={t("browserPerformance")} subtitle={t("browserPerformanceDesc")}>
          <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: active ? "var(--glass-6)" : "none",
                  border: active ? "1px solid var(--glass-10)" : "1px solid transparent",
                  color: active ? "var(--text-bright)" : "var(--text-muted)",
                  padding: "6px 11px", borderRadius: 7, cursor: "pointer", fontSize: 12,
                  fontWeight: active ? 600 : 400, display: "flex", alignItems: "center",
                  gap: 5, whiteSpace: "nowrap", transition: "all 0.15s ease",
                }}>
                  <Icon size={12} />{tab.label}
                </button>
              );
            })}
          </div>
        </ChartSection>

        {activeTab === "vitals"   && <VitalsTab vitals={data.vitals} navTiming={data.navTiming} t={t} />}
        {activeTab === "client"   && <ClientTab client={data.client} t={t} />}
        {activeTab === "userflow" && <UserFlowTab userFlow={data.userFlow} t={t} />}
      </div>

      <div style={{ textAlign: "center", padding: "28px 0 12px", fontSize: 10, color: "var(--text-dim)" }}>
        {t("allData")}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LATENCY CHART (vertical bar chart with baseline + summary strip)
// ═══════════════════════════════════════════════════════════════════════════════
const LatencyChart = memo(function LatencyChart({ data, baseline, p95 }) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const avg = useMemo(() => Math.round(data.reduce((s, d) => s + d.value, 0) / data.length), [data]);
  const spikeThreshold = baseline ? baseline.baseline * 2 : THRESHOLDS.p95Latency.warning;
  const baselinePct = baseline ? Math.min((baseline.baseline / max) * 100, 92) : null;

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "14px 16px" }}>
      {/* Bar area */}
      <div style={{ position: "relative" }}>
        {baselinePct !== null && (
          <div style={{ position: "absolute", bottom: `${baselinePct}%`, left: 0, right: 0, borderBottom: "1px dashed var(--glass-8)", zIndex: 1, pointerEvents: "none" }}>
            <span style={{ position: "absolute", right: 0, top: -11, fontSize: 9, color: "var(--text-dim)", background: "var(--glass-2)", padding: "0 4px", borderRadius: 2 }}>avg {baseline.baseline}ms</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 64 }}>
          {data.map((d, i) => {
            const h = Math.max((d.value / max) * 100, 4);
            const s = severity(d.value, THRESHOLDS.p95Latency);
            const isSpike = d.value > spikeThreshold;
            const color = s !== "info" ? SEVERITY_COLORS[s].text : isSpike ? "rgba(251,191,36,0.5)" : "var(--glass-12)";
            return <div key={i} title={`${d.time}: ${d.value}ms`} style={{ flex: 1, height: `${h}%`, background: color, borderRadius: "2px 2px 0 0", minWidth: 2, transition: "height 0.3s ease" }} />;
          })}
        </div>
      </div>
      {/* Time axis */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--text-dim)" }}>
        <span>{data[0]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
      {/* Summary strip */}
      <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--glass-3)", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{avg}ms</span></span>
        {p95 != null && <span style={{ color: "var(--text-muted)" }}>P95 <span style={{ color: sevColor(p95, THRESHOLDS.p95Latency, "var(--text-primary)"), fontFamily: MONO, fontWeight: 600 }}>{p95}ms</span></span>}
        <span style={{ color: "var(--text-muted)" }}>Samples <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{data.length}</span></span>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// VITALS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function VitalsTab({ vitals, navTiming, t }) {
  const hasVitals = vitals.lcp != null || vitals.inp != null || vitals.cls != null;
  const vitalsList = [
    vitals.lcp != null && { metric: "lcp", key: "LCP", desc: "Largest Contentful Paint", value: vitals.lcp, unit: "ms", threshold: THRESHOLDS.lcp },
    vitals.inp != null && { metric: "inp", key: "INP", desc: "Interaction to Next Paint", value: vitals.inp, unit: "ms", threshold: THRESHOLDS.inp },
    vitals.cls != null && { metric: "cls", key: "CLS", desc: "Cumulative Layout Shift", value: vitals.cls, unit: "",   threshold: THRESHOLDS.cls },
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <ChartSection title={t("coreVitals")} subtitle={t("vitalsSubtitle")}>
        {hasVitals ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {vitalsList.map(v => {
              const sev = severity(v.value, v.threshold);
              const col = sev === "info" ? "#34d399" : SEVERITY_COLORS[sev].text;
              const pct = Math.min((v.value / v.threshold.critical) * 100, 100);
              const statusLabel = sev === "info" ? t("good") : sev === "warning" ? t("needsWork") : t("poor");
              const bench = CRUX_BENCHMARKS[v.metric];
              const comparison = compareToGlobal(v.metric, v.value);
              const compColor = comparison?.verdict === "faster" ? "#34d399" : comparison?.verdict === "within" ? "var(--text-muted)" : "#fbbf24";
              return (
                <div key={v.key} style={{ background: "var(--glass-2)", borderRadius: 10, padding: "14px 16px" }}>
                  {/* Header: name + description */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{v.key}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 6 }}>{v.desc}</span>
                    </div>
                    <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>{statusLabel}</span>
                  </div>
                  {/* Values: session vs global */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500, marginBottom: 2 }}>{t("sessionLabel")}</div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: col, fontFamily: MONO }}>{v.value}{v.unit}</span>
                    </div>
                    {bench && (
                      <div style={{ borderLeft: "1px solid var(--glass-4)", paddingLeft: 16 }}>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500, marginBottom: 2 }}>{t("globalLabel")}</div>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)", fontFamily: MONO }}>{bench.good}{bench.unit}</span>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, background: "var(--glass-3)", borderRadius: CHART_BAR_R, height: CHART_BAR_H, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: col, borderRadius: CHART_BAR_R, transition: "width 0.3s ease" }} />
                    </div>
                  </div>
                  {/* Comparison insight */}
                  {comparison && (
                    <div style={{ fontSize: 11, color: compColor, marginTop: 6, fontWeight: 500 }}>
                      {comparison.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChartState title={t("vitalsEmpty")} message={t("vitalsEmptyMsg")} hint={t("vitalsEmptyHint")} />
        )}
      </ChartSection>

      {navTiming && (
        <ChartSection title={t("pageLoadDiagnostics")} subtitle={t("pageLoadDiagnosticsDesc")}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 14px" }}>
            <StatRow label={t("ttfb")} desc={t("ttfbDesc")} value={navTiming.ttfb} unit="ms" />
            <StatRow label={t("domLoaded")} desc={t("domLoadedDesc")} value={navTiming.domContentLoaded} unit="ms" />
            <StatRow label={t("pageLoad")} desc={t("pageLoadDesc")} value={navTiming.pageLoad} unit="ms" warn={navTiming.pageLoad > 3000} />
            <StatRow label={t("dns")} desc={t("dnsDesc")} value={navTiming.dnsLookup} unit="ms" zeroLabel={t("zeroMsCached")} />
            <StatRow label={t("tcp")} desc={t("tcpDesc")} value={navTiming.tcpConnect} unit="ms" zeroLabel={t("zeroMsReused")} last />
          </div>
          {(navTiming.dnsLookup === 0 || navTiming.tcpConnect === 0) && (
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6, fontStyle: "italic" }}>{t("zeroMsNote")}</div>
          )}
        </ChartSection>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ClientTab({ client, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <ChartSection title={t("errorCounters")}>
        <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 14px" }}>
          <StatRow label={t("unhandled")}  value={client.unhandledErrors}   warn={client.unhandledErrors > 0}   warnColor="#f87171" />
          <StatRow label={t("promiseRej")} value={client.promiseRejections} warn={client.promiseRejections > 0} warnColor="#f87171" />
          <StatRow label={t("failedReq")}  value={client.failedRequests}    warn={client.failedRequests > 0}    warnColor="#f87171" />
          <StatRow label={t("slowReq")}    value={client.slowRequests}      warn={client.slowRequests > 0}      warnColor="#fbbf24" last />
        </div>
      </ChartSection>

      {client.recentErrors.length > 0 && (
        <ChartSection title={t("recentErrors")} subtitle={`${t("last")} ${Math.min(client.recentErrors.length, 10)}`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 14px" }}>
            {client.recentErrors.slice(-10).reverse().map((err, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, height: CHART_ROW_H, borderBottom: i < arr.length - 1 ? "1px solid var(--glass-3)" : "none", overflow: "hidden" }}>
                <SeverityDot sev="warning" size={5} />
                <span style={{ color: "var(--text-dim)", flexShrink: 0, fontFamily: MONO, fontSize: 10, width: 64 }}>{new Date(err.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{err.message}</span>
              </div>
            ))}
          </div>
        </ChartSection>
      )}

      {client.recentNetworkLog.length > 0 && (
        <ChartSection title={t("recentNetwork")} subtitle={`${t("last")} ${Math.min(client.recentNetworkLog.length, 10)}`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 14px" }}>
            {client.recentNetworkLog.slice(-10).reverse().map((entry, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, height: CHART_ROW_H, borderBottom: i < arr.length - 1 ? "1px solid var(--glass-3)" : "none", overflow: "hidden" }}>
                <SeverityDot sev={entry.type === "error" ? "critical" : "warning"} size={5} />
                <span style={{ color: "var(--text-dim)", flexShrink: 0, fontFamily: MONO, fontSize: 10, width: 64 }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: "var(--text-secondary)", fontFamily: MONO, fontSize: 10, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.url}</span>
                {entry.status && <span style={{ color: "#f87171", fontFamily: MONO, fontSize: 10, flexShrink: 0 }}>{entry.status}</span>}
                {entry.duration != null && <span style={{ color: "var(--text-dim)", fontFamily: MONO, fontSize: 10, flexShrink: 0 }}>{entry.duration}ms</span>}
              </div>
            ))}
          </div>
        </ChartSection>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER FLOW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UserFlowTab({ userFlow, t }) {
  const hasActivity = userFlow.routeChanges > 0 || userFlow.quizStarted > 0;
  const completionRate = userFlow.quizStarted > 0 ? Math.round((userFlow.quizCompleted / userFlow.quizStarted) * 100) : null;
  const sessionMin = Math.floor(userFlow.sessionDuration / 60);
  const sessionSec = userFlow.sessionDuration % 60;

  if (!hasActivity) {
    return <EmptyChartState title={t("noActivity")} message={t("noActivityMsg")} hint={t("noActivityHint")} />;
  }

  const routeItems = userFlow.routeVisits.map(r => ({ label: "/" + r.route, value: r.visits }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* Session stats */}
      <ChartSection title={t("sessionActivity")}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <InlineMetric label={t("session")} value={`${sessionMin}m ${sessionSec}s`} color="var(--text-secondary)" />
          <InlineMetric label={t("routesVisited")} value={String(userFlow.routeChanges)} color="var(--text-secondary)" />
          {userFlow.quizStarted > 0 && <InlineMetric label={t("quizzesStarted")} value={String(userFlow.quizStarted)} color="#60a5fa" />}
          {userFlow.quizCompleted > 0 && <InlineMetric label={t("completed")} value={String(userFlow.quizCompleted)} color="#34d399" />}
          {completionRate != null && <InlineMetric label={t("completionRate")} value={completionRate + "%"} color={sevColor(completionRate, THRESHOLDS.completionRate)} />}
          {userFlow.retries > 0 && <InlineMetric label={t("retries")} value={String(userFlow.retries)} color="var(--text-secondary)" />}
        </div>
      </ChartSection>

      {/* Route visits bar chart */}
      {routeItems.length > 0 && (
        <ChartSection title={t("routeVisits")} subtitle={`${routeItems.length} route${routeItems.length !== 1 ? "s" : ""} visited`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 14px" }}>
            <HorizontalBarChart items={routeItems} />
          </div>
        </ChartSection>
      )}
    </div>
  );
}
