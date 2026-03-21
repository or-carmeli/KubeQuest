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
  BarChart3, Zap, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { THRESHOLDS, SEVERITY_COLORS, severity, computeBaseline, CRUX_BENCHMARKS, compareToGlobal } from "../utils/mockTelemetry";
import { buildSnapshot, TIME_RANGES } from "../utils/hybridTelemetry";
import { initRealTelemetry, getRealMetrics, recordRouteChange } from "../utils/realTelemetry";
import { HISTORICAL_RANGES, startHistoryRecorder, getHistory, aggregateHistory, computeRES, scoreLabel } from "../utils/telemetryHistory";


// ─── Component-level guard ─────────────────────────────────────────────────────
export default function PerformanceInsights({ onBack, lang = "en", dir = "ltr" }) {
  if (!import.meta.env.DEV) return null;
  return <PerformanceInsightsInner onBack={onBack} lang={lang} dir={dir} />;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const MONO = "'Fira Code','Courier New',monospace";
const COLLECTING = "Collecting\u2026";

const CHART_ROW_H    = 28;
const CHART_LABEL_W  = 100;
const CHART_VALUE_W  = 56;
const CHART_BAR_H    = 6;
const CHART_BAR_R    = 3;
const CHART_GAP      = 0;
const SECTION_GAP    = 14;
const COL_GAP        = 10;

// Colors
const GREEN  = "#34d399";
const BLUE   = "#60a5fa";
const AMBER  = "#fbbf24";
const RED    = "#f87171";

// ─── Shared chart primitives ───────────────────────────────────────────────────

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

function EmptyChartState({ title, message, hint }) {
  return (
    <div style={{ padding: "28px 24px", textAlign: "center", background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{title || "No data yet"}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>{message}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10, fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

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
            <span style={{ width: labelWidth, flexShrink: 0, fontSize: 12, color: "var(--text-secondary)", fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
            <div style={{ flex: 1, background: "var(--glass-3)", borderRadius: CHART_BAR_R, height: CHART_BAR_H, overflow: "hidden" }}>
              <div style={{ width: `${Math.max(pct, 2)}%`, height: "100%", background: item.color || "var(--glass-18)", borderRadius: CHART_BAR_R, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ width: valueWidth, flexShrink: 0, textAlign: "right", fontSize: 12, fontFamily: MONO, color: "var(--text-secondary)" }}>
              {item.value}{item.showPct !== false && total > 1 ? <span style={{ color: "var(--text-disabled)", marginLeft: 3, fontSize: 10 }}>{sharePct}%</span> : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatRow({ label, desc, value, unit, warn, warnColor, last, zeroLabel }) {
  const isZero = value === 0 && zeroLabel;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 32, borderBottom: last ? "none" : "1px solid var(--glass-3)", padding: "6px 0" }}>
      <div>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
        {desc && <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.3 }}>{desc}</div>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: MONO, color: warn ? (warnColor || AMBER) : isZero ? "var(--text-muted)" : "var(--text-primary)", display: "flex", alignItems: "center", gap: 4 }}>
        {value}{unit || ""}
        {isZero && <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-dim)", background: "var(--glass-3)", padding: "1px 5px", borderRadius: 4, fontFamily: "inherit" }}>{zeroLabel}</span>}
      </span>
    </div>
  );
}

function InlineMetric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.4, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: MONO, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function SeverityDot({ sev, size = 6 }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: SEVERITY_COLORS[sev]?.text || BLUE, flexShrink: 0, marginTop: 1 }} />;
}

function sevColor(value, threshold, goodColor = GREEN) {
  if (value == null) return "var(--text-dim)";
  const s = severity(value, threshold);
  return s === "info" ? goodColor : SEVERITY_COLORS[s].text;
}

// ─── SVG Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ values, width = 52, height = 20, color = "var(--glass-15)", strokeWidth = 2 }) {
  if (!values || values.length < 2) {
    // Placeholder sparkline (flat dashed line)
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block", opacity: 0.4 }}>
        <line x1={2} y1={height / 2} x2={width - 2} y2={height / 2} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="3,3" />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 2;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ label, tooltip, value, unit, status, statusColor, trend, sparkValues, sparkColor }) {
  const TrendIcon = trend === "improving" ? TrendingDown : trend === "degrading" ? TrendingUp : Minus;
  const trendColor = trend === "improving" ? GREEN : trend === "degrading" ? RED : "var(--text-dim)";

  return (
    <div style={{ flex: 1, minWidth: 140, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, transition: "border-color 0.3s, box-shadow 0.3s" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
        {tooltip ? (
          <Tooltip text={tooltip}>
            <span style={{ cursor: "help", borderBottom: "1px dotted var(--glass-8)" }}>{label}</span>
          </Tooltip>
        ) : label}
        {status && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, textTransform: "uppercase", letterSpacing: 0.3 }}>
            {status}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: statusColor || "var(--text-bright)", fontFamily: MONO, lineHeight: 1, transition: "color 0.3s" }}>{value}</span>
          {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>}
        </div>
        <Sparkline values={sparkValues} color={sparkColor || statusColor || "var(--glass-15)"} />
      </div>
      {trend && (
        <div style={{ fontSize: 11, color: trendColor, fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
          <TrendIcon size={11} />
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── Telemetry Status Indicator ────────────────────────────────────────────────
function TelemetryIndicator({ hasData }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: hasData ? GREEN : "var(--text-dim)", fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: hasData ? GREEN : "var(--text-dim)", boxShadow: hasData ? `0 0 4px ${GREEN}88` : "none", animation: hasData ? "pulse 2s ease-in-out infinite" : "none" }} />
      {hasData ? "collecting" : "waiting"}
    </span>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 820, margin: "0 auto", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, background: "var(--glass-3)", borderRadius: 8 }} />
        <div style={{ width: 180, height: 22, background: "var(--glass-3)", borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 72, background: "var(--glass-2)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)}
      </div>
      <div style={{ height: 100, background: "var(--glass-2)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.5s" }} />
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

    // Tab labels
    tabOverview: "Overview", tabVitals: "Web Vitals", tabNetwork: "Network",
    tabErrors: "Errors", tabUserFlow: "User Flow",
    tabClient: "Client",

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
    trafficObservability: "Traffic Observability",
    trafficObservabilityDesc: "API request metrics for the selected time window",
    browserPerformance: "Browser Performance",
    browserPerformanceDesc: "Page load and rendering metrics from the browser. Available even without API traffic.",
    pageLoadDiagnostics: "Page Load Diagnostics",
    pageLoadDiagnosticsDesc: "Navigation Timing API measurements from initial page load",
    zeroMsCached: "cached",
    zeroMsReused: "reused",
    zeroMsNote: "0ms values indicate DNS caching or connection reuse by the browser.",
    // New labels
    vitalsTrend: "Vitals & Latency Trend",
    noTelemetryTitle: "No telemetry collected yet",
    noTelemetryMsg: "Interact with the app (click, navigate, start a quiz) to generate performance data.",
    noTelemetryHint: "This dashboard collects real browser telemetry including Web Vitals, network requests, and user flow events.",
    latencyTrend: "Request Latency Trend",
    requestStats: "Request Stats",
    throughput: "Throughput",
    totalReqs: "Total Requests",
    errorRateOverTime: "Error Rate",
    clientErrors: "Client Errors",
    promiseRejections: "Promise Rejections",
    quizEvents: "Quiz Events",
    eventTimeline: "Event Timeline",
    lcpTooltip: "Largest Contentful Paint - time until the main content is visible",
    inpTooltip: "Interaction to Next Paint - responsiveness to user input",
    clsTooltip: "Cumulative Layout Shift - visual stability of the page",
    errorRateTooltip: "Percentage of failed network requests",
    distribution: "Distribution",
    // Historical view
    realExperienceScore: "Real Experience Score",
    resDesc: "Composite score based on Web Vitals and navigation timing",
    scoreOverTime: "Score Over Time",
    p95OverTime: "P95 Latency Over Time",
    historicalSummary: "Historical Summary",
    snapshots: "Snapshots",
    noHistoryTitle: "No historical data yet",
    noHistoryMsg: "Historical data is recorded automatically every 60 seconds. Use the app for a while, then check back.",
    noHistoryHint: "Data persists across page reloads via localStorage.",
    live: "Live",
    historical: "Historical",
    fcp: "FCP",
    fcpDesc: "First Contentful Paint",
  },
  he: {
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
    tabOverview: "Overview", tabVitals: "Web Vitals", tabNetwork: "Network",
    tabErrors: "Errors", tabUserFlow: "User Flow",
    tabClient: "Client",
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
    trafficObservability: "Traffic Observability",
    trafficObservabilityDesc: "API request metrics for the selected time window",
    browserPerformance: "Browser Performance",
    browserPerformanceDesc: "Page load and rendering metrics from the browser. Available even without API traffic.",
    pageLoadDiagnostics: "Page Load Diagnostics",
    pageLoadDiagnosticsDesc: "Navigation Timing API measurements from initial page load",
    zeroMsCached: "cached",
    zeroMsReused: "reused",
    zeroMsNote: "0ms values indicate DNS caching or connection reuse by the browser.",
    vitalsTrend: "Vitals & Latency Trend",
    noTelemetryTitle: "No telemetry collected yet",
    noTelemetryMsg: "Interact with the app (click, navigate, start a quiz) to generate performance data.",
    noTelemetryHint: "This dashboard collects real browser telemetry including Web Vitals, network requests, and user flow events.",
    latencyTrend: "Request Latency Trend",
    requestStats: "Request Stats",
    throughput: "Throughput",
    totalReqs: "Total Requests",
    errorRateOverTime: "Error Rate",
    clientErrors: "Client Errors",
    promiseRejections: "Promise Rejections",
    quizEvents: "Quiz Events",
    eventTimeline: "Event Timeline",
    lcpTooltip: "Largest Contentful Paint - time until the main content is visible",
    inpTooltip: "Interaction to Next Paint - responsiveness to user input",
    clsTooltip: "Cumulative Layout Shift - visual stability of the page",
    errorRateTooltip: "Percentage of failed network requests",
    distribution: "Distribution",
    realExperienceScore: "Real Experience Score",
    resDesc: "Composite score based on Web Vitals and navigation timing",
    scoreOverTime: "Score Over Time",
    p95OverTime: "P95 Latency Over Time",
    historicalSummary: "Historical Summary",
    snapshots: "Snapshots",
    noHistoryTitle: "No historical data yet",
    noHistoryMsg: "Historical data is recorded automatically every 60 seconds. Use the app for a while, then check back.",
    noHistoryHint: "Data persists across page reloads via localStorage.",
    live: "Live",
    historical: "Historical",
    fcp: "FCP",
    fcpDesc: "First Contentful Paint",
  },
};

function PerformanceInsightsInner({ onBack, lang = "en", dir = "ltr" }) {
  const t = (key) => (T[lang] || T.en)[key] || T.en[key] || key;
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRangeKey, setTimeRangeKey] = useState("session");

  const isHistorical = HISTORICAL_RANGES.some(r => r.key === timeRangeKey);
  const activeRange = TIME_RANGES.find(r => r.key === timeRangeKey) || TIME_RANGES[TIME_RANGES.length - 1];
  const activeHistRange = HISTORICAL_RANGES.find(r => r.key === timeRangeKey);

  useEffect(() => {
    const cleanupTelemetry = initRealTelemetry();
    recordRouteChange("performanceInsights");
    const cleanupHistory = startHistoryRecorder(getRealMetrics);
    return () => { cleanupTelemetry(); cleanupHistory(); };
  }, []);

  const loadSnapshot = useCallback(() => {
    const real = getRealMetrics();
    setData(buildSnapshot(real, activeRange.sec));
    setLastUpdated(new Date());
  }, [activeRange.sec]);

  useEffect(() => { if (!isHistorical) { const t = setTimeout(loadSnapshot, 350); return () => clearTimeout(t); } }, [loadSnapshot, isHistorical]);
  const refresh = useCallback(() => { if (!isHistorical) { setData(null); setTimeout(loadSnapshot, 250); } }, [loadSnapshot, isHistorical]);
  useEffect(() => { if (!isHistorical) { const id = setInterval(loadSnapshot, 30_000); return () => clearInterval(id); } }, [loadSnapshot, isHistorical]);

  // Historical data
  const histData = useMemo(() => {
    if (!isHistorical || !activeHistRange) return null;
    const snapshots = getHistory(activeHistRange.ms);
    return aggregateHistory(snapshots);
  }, [isHistorical, activeHistRange, timeRangeKey]);

  // Live mode derived state
  const health = data?.health || { status: "unknown", reason: "Initializing telemetry collectors\u2026", score: 0 };
  const alerts = data?.alerts || [];
  const insights = data?.insights || [];
  const latencyBaseline = data?.latencyBaseline || null;
  const confidence = data?.confidence || { level: "none", label: "No data" };
  const trendDir = latencyBaseline?.direction || null;

  const agoSec = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : null;
  const rangeLabel = isHistorical
    ? activeHistRange?.label || "Historical"
    : activeRange.sec != null ? `Last ${activeRange.label}` : "Session";
  const timeContextText = isHistorical
    ? rangeLabel
    : agoSec != null ? `${rangeLabel} \u00b7 ${agoSec}s` : rangeLabel;

  // Determine if we have any telemetry at all
  const hasAnyData = data && (data.totalRequests > 0 || data.vitals?.lcp != null || data.vitals?.inp != null || data.vitals?.cls != null || data.userFlow?.routeChanges > 0);

  // Live score from current session
  const liveScore = useMemo(() => {
    if (!data) return null;
    const real = getRealMetrics();
    return computeRES(real);
  }, [data]);

  if (!data && !isHistorical) return <Skeleton />;

  const hasLatencyData = data?.latencyTimeline?.length > 0;
  const TABS = [
    { id: "overview",  label: t("tabOverview"),  icon: Activity },
    { id: "vitals",    label: t("tabVitals"),    icon: Eye },
    { id: "network",   label: t("tabNetwork"),   icon: Globe },
    { id: "errors",    label: t("tabErrors"),    icon: AlertTriangle },
    { id: "userflow",  label: t("tabUserFlow"),  icon: Users },
  ];

  // Sparkline data derived from latency timeline
  const latencySparkValues = data?.latencyTimeline?.slice(-20).map(d => d.value) || [];

  return (
    <div className="page-pad" style={{ maxWidth: 820, margin: "0 auto", padding: "12px 14px", animation: "fadeIn 0.3s ease", direction: "ltr" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button className="back-btn" onClick={onBack} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", order: dir === "rtl" ? 99 : 0 }}>
          <ArrowLeft size={16} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.2 }}>{t("title")}</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>{t("devOnly")}</span>
        <TelemetryIndicator hasData={hasAnyData} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{timeContextText}</span>
          {!isHistorical && (
            <button onClick={refresh} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-muted)", padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center" }} title="Refresh">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Time range selector — Live | Historical */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        {/* Live ranges */}
        <div style={{ display: "flex", gap: 2, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 3 }}>
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
        {/* Separator */}
        <div style={{ width: 1, height: 24, background: "var(--glass-6)" }} />
        {/* Historical ranges */}
        <div style={{ display: "flex", gap: 2, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 3 }}>
          {HISTORICAL_RANGES.map(r => {
            const active = r.key === timeRangeKey;
            return (
              <button key={r.key} onClick={() => setTimeRangeKey(r.key)} style={{
                background: active ? "rgba(139,92,246,0.20)" : "transparent",
                border: "none",
                color: active ? "#a78bfa" : "var(--text-muted)",
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
      </div>

      {/* ── Historical view ── */}
      {isHistorical ? (
        <HistoricalView data={histData} range={activeHistRange} t={t} liveScore={liveScore} />
      ) : (
        <>
          {/* ── Sub-tabs (live mode only) ── */}
          <div style={{ display: "flex", gap: 3, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: active ? "var(--glass-6)" : "none",
                  border: active ? "1px solid var(--glass-10)" : "1px solid transparent",
                  color: active ? "var(--text-bright)" : "var(--text-muted)",
                  padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12,
                  fontWeight: active ? 600 : 400, display: "flex", alignItems: "center",
                  gap: 5, whiteSpace: "nowrap", transition: "all 0.2s ease",
                }}>
                  <Icon size={13} />{tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Tab content ── */}
          {activeTab === "overview" && <OverviewTab data={data} t={t} rangeLabel={rangeLabel} activeRange={activeRange} trendDir={trendDir} latencyBaseline={latencyBaseline} confidence={confidence} health={health} alerts={alerts} alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} insights={insights} latencySparkValues={latencySparkValues} />}
          {activeTab === "vitals"  && <VitalsTab vitals={data.vitals} navTiming={data.navTiming} t={t} />}
          {activeTab === "network" && <NetworkTab data={data} t={t} rangeLabel={rangeLabel} activeRange={activeRange} trendDir={trendDir} latencyBaseline={latencyBaseline} confidence={confidence} />}
          {activeTab === "errors"  && <ErrorsTab client={data.client} t={t} totalRequests={data.totalRequests} errorRate={data.errorRate} latencyTimeline={data.latencyTimeline} />}
          {activeTab === "userflow" && <UserFlowTab userFlow={data.userFlow} t={t} />}
        </>
      )}

      <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 10, color: "var(--text-dim)" }}>
        {t("allData")}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORICAL VIEW (Vercel-style)
// ═══════════════════════════════════════════════════════════════════════════════
function HistoricalView({ data, range, t, liveScore }) {
  if (!data || data.snapshotCount === 0) {
    return (
      <EmptyChartState
        title={t("noHistoryTitle")}
        message={t("noHistoryMsg")}
        hint={t("noHistoryHint")}
      />
    );
  }

  const sc = scoreLabel(data.score);

  // Format time axis labels based on range
  const formatTimeLabel = (ts) => {
    const d = new Date(ts);
    if (range.ms <= 24 * 60 * 60_000) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* ── Left sidebar: metrics ── */}
      <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <HistoricalMetricRow label="LCP" desc="Largest Contentful Paint" value={data.vitals.lcp} unit="ms" threshold={THRESHOLDS.lcp} />
        <HistoricalMetricRow label="INP" desc="Interaction to Next Paint" value={data.vitals.inp} unit="ms" threshold={THRESHOLDS.inp} />
        <HistoricalMetricRow label="CLS" desc="Cumulative Layout Shift" value={data.vitals.cls} unit="" threshold={THRESHOLDS.cls} />
        <HistoricalMetricRow label={t("fcp")} desc={t("fcpDesc")} value={data.nav?.fcp} unit="ms" />
        <HistoricalMetricRow label={t("ttfb")} desc={t("ttfbDesc")} value={data.nav?.ttfb} unit="ms" />
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* RES Score card */}
        <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24 }}>
          {/* Donut chart */}
          <ScoreDonut score={data.score} color={sc.color} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{t("realExperienceScore")}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: sc.color, marginBottom: 4 }}>{sc.text}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("resDesc")}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 2 }}>{t("snapshots")}</div>
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: MONO, color: "var(--text-secondary)" }}>{data.snapshotCount}</div>
          </div>
        </div>

        {/* Score over time chart */}
        {data.scoreSeries.length > 1 && (
          <ChartSection title={t("scoreOverTime")} subtitle={range.label}>
            <HistoricalLineChart
              series={data.scoreSeries}
              color={sc.color}
              formatLabel={formatTimeLabel}
              yMin={0}
              yMax={100}
              thresholds={[{ value: 90, color: GREEN, label: "Great" }, { value: 50, color: AMBER, label: "Needs work" }]}
            />
          </ChartSection>
        )}

        {/* P95 latency over time chart */}
        {data.p95Series.length > 1 && (
          <ChartSection title={t("p95OverTime")} subtitle={range.label}>
            <HistoricalLineChart
              series={data.p95Series}
              color={BLUE}
              formatLabel={formatTimeLabel}
              unit="ms"
            />
          </ChartSection>
        )}

        {/* Summary stats */}
        <ChartSection title={t("historicalSummary")}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <MetricCard label={t("totalReqs")} value={String(data.totalRequests)} statusColor="var(--text-bright)" />
            <MetricCard label={t("errorRate")} tooltip={t("errorRateTooltip")} value={data.errorRate != null ? data.errorRate + "%" : "\u2014"} statusColor={data.errorRate != null && data.errorRate >= 5 ? RED : data.errorRate != null && data.errorRate >= 2 ? AMBER : GREEN} />
            <MetricCard label={t("p95Latency")} value={data.avgP95 != null ? String(data.avgP95) : "\u2014"} unit={data.avgP95 != null ? "ms" : ""} statusColor={data.avgP95 != null ? sevColor(data.avgP95, THRESHOLDS.p95Latency, "var(--text-bright)") : "var(--text-dim)"} />
          </div>
        </ChartSection>
      </div>
    </div>
  );
}

// ─── Historical sidebar metric row ────────────────────────────────────────────
function HistoricalMetricRow({ label, desc, value, unit, threshold }) {
  const sev = threshold && value != null ? severity(value, threshold) : "info";
  const col = value == null ? "var(--text-dim)" : sev === "info" ? GREEN : SEVERITY_COLORS[sev].text;
  const displayVal = value != null ? (unit === "ms" && value >= 1000 ? (value / 1000).toFixed(2) + "s" : value + (unit || "")) : "\u2014";

  // Progress bar: 0-100%
  const pct = threshold && value != null ? Math.min((value / (threshold.critical * 1.2)) * 100, 100) : 0;

  return (
    <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO, color: col, lineHeight: 1, marginBottom: 6, transition: "color 0.3s" }}>{displayVal}</div>
      {threshold && (
        <div style={{ height: 4, borderRadius: 2, background: "var(--glass-3)", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: col, borderRadius: 2, transition: "width 0.4s ease" }} />
        </div>
      )}
    </div>
  );
}

// ─── Score donut ──────────────────────────────────────────────────────────────
function ScoreDonut({ score, color, size = 80 }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score != null ? score / 100 : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--glass-4)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: MONO, color }}>{score ?? "\u2014"}</span>
      </div>
    </div>
  );
}

// ─── Historical line chart ───────────────────────────────────────────────────
function HistoricalLineChart({ series, color, formatLabel, unit, yMin, yMax, thresholds }) {
  if (!series || series.length < 2) return null;

  const values = series.map(s => s.value);
  const min = yMin ?? Math.min(...values) * 0.9;
  const max = yMax ?? Math.max(...values) * 1.1;
  const range = max - min || 1;

  const W = 600;
  const H = 100;
  const padX = 2;
  const padY = 4;

  const points = series.map((s, i) => {
    const x = padX + (i / (series.length - 1)) * (W - padX * 2);
    const y = H - padY - ((s.value - min) / range) * (H - padY * 2);
    return { x, y };
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Gradient fill
  const fillD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  // Time labels
  const firstLabel = formatLabel(series[0].ts);
  const lastLabel = formatLabel(series[series.length - 1].ts);
  const midIdx = Math.floor(series.length / 2);
  const midLabel = series.length > 4 ? formatLabel(series[midIdx].ts) : null;

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Threshold lines */}
        {thresholds?.map((th, i) => {
          const y = H - padY - ((th.value - min) / range) * (H - padY * 2);
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke={th.color} strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
              <text x={W - padX - 2} y={y - 3} textAnchor="end" fontSize={8} fill={th.color} opacity={0.6}>{th.label}</text>
            </g>
          );
        })}
        {/* Fill */}
        <path d={fillD} fill={`url(#grad-${color.replace("#", "")})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest value dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3.5} fill={color} stroke="var(--glass-2)" strokeWidth={2} />
      </svg>
      {/* Time axis */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
        <span>{firstLabel}</span>
        {midLabel && <span>{midLabel}</span>}
        <span>{lastLabel}</span>
      </div>
      {/* Latest value */}
      <div style={{ display: "flex", gap: 16, marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--glass-3)", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>Latest <span style={{ color, fontFamily: MONO, fontWeight: 600 }}>{values[values.length - 1]}{unit || ""}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}{unit || ""}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Points <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{values.length}</span></span>
      </div>
    </div>
  );
}

// ─── Tooltip wrapper ────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && text && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: 11, lineHeight: 1.4,
          padding: "6px 10px", borderRadius: 6, border: "1px solid var(--glass-6)",
          whiteSpace: "nowrap", zIndex: 100, pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.15s ease",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Session Timeline ──────────────────────────────────────────────────────────
function SessionTimeline({ data }) {
  // Build a unified timeline of significant events from the session
  const events = useMemo(() => {
    const ev = [];
    const now = Date.now();

    // LCP captured
    if (data.vitals?.lcp != null) {
      ev.push({ ts: now - (data.userFlow?.sessionDuration || 0) * 1000 + 500, type: "lcp", label: `LCP ${data.vitals.lcp}ms`, color: sevColor(data.vitals.lcp, THRESHOLDS.lcp) });
    }
    // INP captured
    if (data.vitals?.inp != null) {
      ev.push({ ts: now - (data.userFlow?.sessionDuration || 0) * 1000 + 2000, type: "inp", label: `INP ${data.vitals.inp}ms`, color: sevColor(data.vitals.inp, THRESHOLDS.inp) });
    }
    // Errors
    if (data.client?.recentErrors?.length > 0) {
      data.client.recentErrors.slice(-5).forEach(err => {
        ev.push({ ts: new Date(err.timestamp).getTime(), type: "error", label: "Error", color: RED });
      });
    }
    // Network spikes (latency > 2x average)
    if (data.latencyTimeline?.length > 2) {
      const avg = data.latencyTimeline.reduce((s, d) => s + d.value, 0) / data.latencyTimeline.length;
      data.latencyTimeline.filter(d => d.value > avg * 2).slice(-3).forEach(d => {
        ev.push({ ts: d.ts, type: "spike", label: `${d.value}ms spike`, color: AMBER });
      });
    }

    return ev.sort((a, b) => a.ts - b.ts);
  }, [data]);

  if (events.length === 0) return null;

  const minTs = events[0].ts;
  const maxTs = events[events.length - 1].ts;
  const range = maxTs - minTs || 1;

  return (
    <ChartSection title="Session Timeline" subtitle={`${events.length} event${events.length !== 1 ? "s" : ""} captured`}>
      <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px" }}>
        {/* Timeline track */}
        <div style={{ position: "relative", height: 32, marginBottom: 4 }}>
          {/* Base line */}
          <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2, background: "var(--glass-6)", borderRadius: 1 }} />
          {/* Event markers */}
          {events.map((ev, i) => {
            const pct = events.length === 1 ? 50 : ((ev.ts - minTs) / range) * 90 + 5;
            return (
              <div key={i} title={ev.label} style={{
                position: "absolute", left: `${pct}%`, top: 8, transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: ev.color,
                  border: "2px solid var(--glass-2)", boxShadow: `0 0 4px ${ev.color}66`,
                  transition: "transform 0.2s",
                }} />
              </div>
            );
          })}
        </div>
        {/* Event labels */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {events.map((ev, i) => (
            <span key={i} style={{ fontSize: 10, color: ev.color, fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: ev.color }} />
              {ev.label}
            </span>
          ))}
        </div>
      </div>
    </ChartSection>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ data, t, rangeLabel, activeRange, trendDir, latencyBaseline, confidence, health, alerts, alertsOpen, setAlertsOpen, insights, latencySparkValues }) {
  const hasLatencyData = data.latencyTimeline.length > 0;
  const hasAnyData = data.totalRequests > 0 || data.vitals?.lcp != null || data.vitals?.inp != null || data.vitals?.cls != null;

  // Metric card values
  const lcpVal = data.vitals?.lcp;
  const inpVal = data.vitals?.inp;
  const clsVal = data.vitals?.cls;
  const errRate = data.errorRate;

  const lcpStatus = lcpVal != null ? (severity(lcpVal, THRESHOLDS.lcp) === "info" ? t("good") : severity(lcpVal, THRESHOLDS.lcp) === "warning" ? t("needsWork") : t("poor")) : null;
  const inpStatus = inpVal != null ? (severity(inpVal, THRESHOLDS.inp) === "info" ? t("good") : severity(inpVal, THRESHOLDS.inp) === "warning" ? t("needsWork") : t("poor")) : null;
  const clsStatus = clsVal != null ? (severity(clsVal, THRESHOLDS.cls) === "info" ? t("good") : severity(clsVal, THRESHOLDS.cls) === "warning" ? t("needsWork") : t("poor")) : null;

  const lcpColor = sevColor(lcpVal, THRESHOLDS.lcp);
  const inpColor = sevColor(inpVal, THRESHOLDS.inp);
  const clsColor = sevColor(clsVal, THRESHOLDS.cls);
  const errColor = errRate != null && errRate >= 5 ? RED : errRate != null && errRate >= 2 ? AMBER : GREEN;

  // Health color
  const healthColor = health.status === "unhealthy" ? RED : health.status === "degraded" ? AMBER : health.status === "unknown" ? "#64748b" : GREEN;

  if (!hasAnyData) {
    return (
      <EmptyChartState
        title={t("noTelemetryTitle")}
        message={t("noTelemetryMsg")}
        hint={t("noTelemetryHint")}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Health status strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${healthColor}0A`, border: `1px solid ${healthColor}20`, borderRadius: 10, transition: "background 0.3s, border-color 0.3s" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: healthColor, boxShadow: health.status === "unknown" ? "none" : `0 0 6px ${healthColor}AA`, transition: "background 0.3s" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-bright)" }}>
          {health.status === "unknown" ? t("statusIdle")(rangeLabel) : health.status === "healthy" && confidence.level === "low" ? t("statusHealthyLow") : { healthy: t("statusHealthy"), degraded: t("statusDegraded"), unhealthy: t("statusUnhealthy") }[health.status]}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>{health.reason}</span>
        {alerts.length > 0 && (
          <button onClick={() => setAlertsOpen(!alertsOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 11, display: "flex", alignItems: "center", gap: 3, padding: "2px 6px" }}>
            <AlertTriangle size={11} color={health.status === "unhealthy" ? RED : AMBER} />
            {alerts.length}
            {alertsOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        )}
      </div>

      {/* Collapsible alerts */}
      {alertsOpen && alerts.length > 0 && (
        <div style={{ padding: "4px 12px 4px 28px", display: "flex", flexDirection: "column", gap: 3 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: SEVERITY_COLORS[a.severity].text, display: "flex", alignItems: "center", gap: 5 }}>
              <SeverityDot sev={a.severity} size={5} />
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Metric cards row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <MetricCard
          label="LCP"
          tooltip={t("lcpTooltip")}
          value={lcpVal != null ? lcpVal >= 1000 ? (lcpVal / 1000).toFixed(1) : String(lcpVal) : "\u2014"}
          unit={lcpVal != null ? (lcpVal >= 1000 ? "s" : "ms") : ""}
          status={lcpStatus}
          statusColor={lcpColor}
          trend={lcpVal != null && lcpVal <= THRESHOLDS.lcp.warning * 0.75 ? "improving" : lcpVal != null && lcpVal >= THRESHOLDS.lcp.critical ? "degrading" : null}
        />
        <MetricCard
          label="INP"
          tooltip={t("inpTooltip")}
          value={inpVal != null ? String(inpVal) : "\u2014"}
          unit={inpVal != null ? "ms" : ""}
          status={inpStatus}
          statusColor={inpColor}
          trend={inpVal != null && inpVal <= THRESHOLDS.inp.warning * 0.5 ? "improving" : inpVal != null && inpVal >= THRESHOLDS.inp.critical ? "degrading" : null}
        />
        <MetricCard
          label="CLS"
          tooltip={t("clsTooltip")}
          value={clsVal != null ? clsVal.toFixed(3) : "\u2014"}
          status={clsStatus}
          statusColor={clsColor}
          trend={clsVal != null && clsVal <= THRESHOLDS.cls.warning * 0.5 ? "improving" : clsVal != null && clsVal >= THRESHOLDS.cls.critical ? "degrading" : null}
        />
        <MetricCard
          label={t("errorRate")}
          tooltip={t("errorRateTooltip")}
          value={errRate != null ? errRate + "%" : (data.totalRequests > 0 ? "0%" : "\u2014")}
          statusColor={errColor}
          sparkValues={latencySparkValues.length > 1 ? latencySparkValues : null}
          sparkColor={BLUE}
        />
      </div>

      {/* Latency trend chart (compact) */}
      <ChartSection
        title={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {t("requestLatency")}
          {trendDir && <span style={{ fontSize: 10, fontWeight: 400, color: trendDir === "increasing" ? AMBER : trendDir === "decreasing" ? GREEN : "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>
            {trendDir === "increasing" ? t("trendUp") : trendDir === "decreasing" ? t("trendDown") : t("trendStable")}
          </span>}
        </span>}
        subtitle={hasLatencyData ? `${t("basedOn")(data.latencyTimeline.length, rangeLabel)}${confidence.level === "low" ? ` \u00b7 ${t("lowSample")}` : ""}` : null}
      >
        {hasLatencyData
          ? <LatencyChart data={data.latencyTimeline} baseline={latencyBaseline} p95={data.p95} compact />
          : <EmptyChartState title={t("noRequestsTitle")(rangeLabel)} message={activeRange.sec != null ? t("noRequestsMsgTimed")(activeRange.label) : t("noRequestsMsgSession")} hint={activeRange.sec != null && activeRange.sec <= 60 ? t("noRequestsHintShort") : t("noRequestsHintNav")} />
        }
      </ChartSection>

      {/* Session timeline */}
      <SessionTimeline data={data} />

      {/* Insights */}
      {insights.length > 0 && (
        <ChartSection title={t("insights")}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 0", borderBottom: i < insights.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
                <SeverityDot sev={ins.severity} size={7} />
                <span style={{ fontSize: 13, color: ins.severity === "info" ? "var(--text-secondary)" : SEVERITY_COLORS[ins.severity].text, lineHeight: 1.4 }}>
                  {ins.message}
                </span>
              </div>
            ))}
          </div>
        </ChartSection>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LATENCY CHART
// ═══════════════════════════════════════════════════════════════════════════════
const LatencyChart = memo(function LatencyChart({ data, baseline, p95, compact }) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const avg = useMemo(() => Math.round(data.reduce((s, d) => s + d.value, 0) / data.length), [data]);
  const spikeThreshold = baseline ? baseline.baseline * 2 : THRESHOLDS.p95Latency.warning;
  const baselinePct = baseline ? Math.min((baseline.baseline / max) * 100, 92) : null;
  const chartHeight = compact ? 56 : 72;

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: compact ? "12px 14px" : "14px 16px" }}>
      <div style={{ position: "relative" }}>
        {baselinePct !== null && (
          <div style={{ position: "absolute", bottom: `${baselinePct}%`, left: 0, right: 0, borderBottom: "1px dashed var(--glass-10)", zIndex: 1, pointerEvents: "none" }}>
            <span style={{ position: "absolute", right: 0, top: -12, fontSize: 10, color: "var(--text-muted)", background: "var(--glass-2)", padding: "0 5px", borderRadius: 3 }}>avg {baseline.baseline}ms</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: chartHeight }}>
          {data.map((d, i) => {
            const h = Math.max((d.value / max) * 100, 4);
            const s = severity(d.value, THRESHOLDS.p95Latency);
            const isSpike = d.value > spikeThreshold;
            const color = s !== "info" ? SEVERITY_COLORS[s].text : isSpike ? "rgba(251,191,36,0.6)" : "var(--glass-15)";
            return <div key={i} title={`${d.time}: ${d.value}ms`} style={{ flex: 1, height: `${h}%`, background: color, borderRadius: "2px 2px 0 0", minWidth: 3, transition: "height 0.4s ease" }} />;
          })}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
        <span>{data[0]?.time}</span>
        <span>{data[data.length - 1]?.time}</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--glass-4)", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{avg}ms</span></span>
        {p95 != null && <span style={{ color: "var(--text-muted)" }}>P95 <span style={{ color: sevColor(p95, THRESHOLDS.p95Latency, "var(--text-primary)"), fontFamily: MONO, fontWeight: 600 }}>{p95}ms</span></span>}
        <span style={{ color: "var(--text-muted)" }}>Samples <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{data.length}</span></span>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEB VITALS TAB
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
              const col = sev === "info" ? GREEN : SEVERITY_COLORS[sev].text;
              const statusLabel = sev === "info" ? t("good") : sev === "warning" ? t("needsWork") : t("poor");
              const bench = CRUX_BENCHMARKS[v.metric];
              const comparison = compareToGlobal(v.metric, v.value);
              const compColor = comparison?.verdict === "faster" ? GREEN : comparison?.verdict === "within" ? "var(--text-muted)" : AMBER;

              // Distribution bar: show where the value falls on good/needs-work/poor scale
              const goodEnd = v.threshold.warning;
              const poorStart = v.threshold.critical;
              const scaleMax = poorStart * 1.5;
              const valuePct = Math.min((v.value / scaleMax) * 100, 100);
              const goodPct = (goodEnd / scaleMax) * 100;
              const warnPct = ((poorStart - goodEnd) / scaleMax) * 100;

              return (
                <div key={v.key} style={{ background: "var(--glass-2)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{v.key}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{v.desc}</span>
                    </div>
                    <span style={{ fontSize: 11, color: col, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${col}12` }}>{statusLabel}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500, marginBottom: 2 }}>{t("sessionLabel")}</div>
                      <span style={{ fontSize: 24, fontWeight: 700, color: col, fontFamily: MONO, transition: "color 0.3s" }}>{v.value}{v.unit}</span>
                    </div>
                    {bench && (
                      <div style={{ borderLeft: "1px solid var(--glass-5)", paddingLeft: 16 }}>
                        <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500, marginBottom: 2 }}>{t("globalLabel")}</div>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text-muted)", fontFamily: MONO }}>{bench.good}{bench.unit}</span>
                      </div>
                    )}
                  </div>
                  {/* Distribution bar */}
                  <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "hidden", background: "var(--glass-3)", marginBottom: 6 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${goodPct}%`, background: `${GREEN}28` }} />
                    <div style={{ position: "absolute", left: `${goodPct}%`, top: 0, bottom: 0, width: `${warnPct}%`, background: `${AMBER}28` }} />
                    <div style={{ position: "absolute", left: `${goodPct + warnPct}%`, top: 0, bottom: 0, right: 0, background: `${RED}28` }} />
                    <div style={{ position: "absolute", left: `${valuePct}%`, top: 0, bottom: 0, width: 4, background: col, borderRadius: 2, transform: "translateX(-50%)", transition: "left 0.4s ease", boxShadow: `0 0 4px ${col}66` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>0</span>
                    <span style={{ color: GREEN }}>{goodEnd}{v.unit}</span>
                    <span style={{ color: RED }}>{poorStart}{v.unit}</span>
                  </div>
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
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
            <StatRow label={t("ttfb")} desc={t("ttfbDesc")} value={navTiming.ttfb} unit="ms" />
            <StatRow label={t("domLoaded")} desc={t("domLoadedDesc")} value={navTiming.domContentLoaded} unit="ms" />
            <StatRow label={t("pageLoad")} desc={t("pageLoadDesc")} value={navTiming.pageLoad} unit="ms" warn={navTiming.pageLoad > 3000} />
            <StatRow label={t("dns")} desc={t("dnsDesc")} value={navTiming.dnsLookup} unit="ms" zeroLabel={t("zeroMsCached")} />
            <StatRow label={t("tcp")} desc={t("tcpDesc")} value={navTiming.tcpConnect} unit="ms" zeroLabel={t("zeroMsReused")} last />
          </div>
          {(navTiming.dnsLookup === 0 || navTiming.tcpConnect === 0) && (
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, fontStyle: "italic" }}>{t("zeroMsNote")}</div>
          )}
        </ChartSection>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK TAB
// ═══════════════════════════════════════════════════════════════════════════════
function NetworkTab({ data, t, rangeLabel, activeRange, trendDir, latencyBaseline, confidence }) {
  const hasLatencyData = data.latencyTimeline.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* Latency trend */}
      <ChartSection
        title={<span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {t("latencyTrend")}
          {trendDir && <span style={{ fontSize: 10, fontWeight: 400, color: trendDir === "increasing" ? AMBER : trendDir === "decreasing" ? GREEN : "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>
            {trendDir === "increasing" ? t("trendUp") : trendDir === "decreasing" ? t("trendDown") : t("trendStable")}
          </span>}
        </span>}
        subtitle={hasLatencyData ? `${t("basedOn")(data.latencyTimeline.length, rangeLabel)}${confidence.level === "low" ? ` \u00b7 ${t("lowSample")}` : ""}` : null}
      >
        {hasLatencyData
          ? <LatencyChart data={data.latencyTimeline} baseline={latencyBaseline} p95={data.p95} />
          : <EmptyChartState title={t("noRequestsTitle")(rangeLabel)} message={activeRange.sec != null ? t("noRequestsMsgTimed")(activeRange.label) : t("noRequestsMsgSession")} hint={t("noRequestsHintNav")} />
        }
      </ChartSection>

      {/* Request stats */}
      <ChartSection title={t("requestStats")}>
        <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
          <StatRow label={t("totalReqs")} value={data.totalRequests} />
          <StatRow label={t("failedReq")} value={data.failedRequests} warn={data.failedRequests > 0} warnColor={RED} />
          <StatRow label={t("slowReq")} value={data.client?.slowRequests || 0} warn={(data.client?.slowRequests || 0) > 0} warnColor={AMBER} />
          <StatRow label={t("throughput")} value={data.traffic?.rps != null ? data.traffic.label : "\u2014"} last />
        </div>
      </ChartSection>

      {/* Recent network issues */}
      {data.client?.recentNetworkLog?.length > 0 && (
        <ChartSection title={t("recentNetwork")} subtitle={`${t("last")} ${Math.min(data.client.recentNetworkLog.length, 10)}`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
            {data.client.recentNetworkLog.slice(-10).reverse().map((entry, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, height: CHART_ROW_H, borderBottom: i < arr.length - 1 ? "1px solid var(--glass-3)" : "none", overflow: "hidden" }}>
                <SeverityDot sev={entry.type === "error" ? "critical" : "warning"} size={5} />
                <span style={{ color: "var(--text-dim)", flexShrink: 0, fontFamily: MONO, fontSize: 10, width: 58 }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                <span style={{ color: "var(--text-secondary)", fontFamily: MONO, fontSize: 10, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.url}</span>
                {entry.status && <span style={{ color: RED, fontFamily: MONO, fontSize: 10, flexShrink: 0 }}>{entry.status}</span>}
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
// ERRORS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ErrorsTab({ client, t, totalRequests, errorRate, latencyTimeline }) {
  const hasErrors = client.unhandledErrors > 0 || client.promiseRejections > 0 || client.failedRequests > 0;

  // Build error rate "sparkline" from latency data - show failed vs ok over time
  const errorSparkValues = useMemo(() => {
    if (!latencyTimeline || latencyTimeline.length < 2) return null;
    // Group into ~10 buckets and compute error-like signal (spike = bad)
    const bucketSize = Math.max(1, Math.floor(latencyTimeline.length / 10));
    const buckets = [];
    for (let i = 0; i < latencyTimeline.length; i += bucketSize) {
      const slice = latencyTimeline.slice(i, i + bucketSize);
      const avgVal = slice.reduce((s, d) => s + d.value, 0) / slice.length;
      buckets.push(avgVal);
    }
    return buckets;
  }, [latencyTimeline]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* Error rate overview */}
      <div style={{ display: "flex", gap: 12 }}>
        <MetricCard
          label={t("errorRate")}
          tooltip={t("errorRateTooltip")}
          value={errorRate != null ? errorRate + "%" : (totalRequests > 0 ? "0%" : "\u2014")}
          statusColor={errorRate != null && errorRate >= 5 ? RED : errorRate != null && errorRate >= 2 ? AMBER : GREEN}
          sparkValues={errorSparkValues}
          sparkColor={RED}
        />
        <MetricCard
          label={t("errors")}
          value={String(client.unhandledErrors + client.promiseRejections)}
          statusColor={client.unhandledErrors + client.promiseRejections > 0 ? RED : GREEN}
        />
      </div>

      {/* Error counters */}
      <ChartSection title={t("errorCounters")}>
        <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
          <StatRow label={t("unhandled")}  value={client.unhandledErrors}   warn={client.unhandledErrors > 0}   warnColor={RED} />
          <StatRow label={t("promiseRej")} value={client.promiseRejections} warn={client.promiseRejections > 0} warnColor={RED} />
          <StatRow label={t("failedReq")}  value={client.failedRequests}    warn={client.failedRequests > 0}    warnColor={RED} />
          <StatRow label={t("slowReq")}    value={client.slowRequests}      warn={client.slowRequests > 0}      warnColor={AMBER} last />
        </div>
      </ChartSection>

      {/* Recent errors table */}
      {client.recentErrors.length > 0 ? (
        <ChartSection title={t("recentErrors")} subtitle={`${t("last")} ${Math.min(client.recentErrors.length, 10)}`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
            {client.recentErrors.slice(-10).reverse().map((err, i, arr) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, height: CHART_ROW_H, borderBottom: i < arr.length - 1 ? "1px solid var(--glass-3)" : "none", overflow: "hidden" }}>
                <SeverityDot sev={err.type === "unhandledrejection" ? "critical" : "warning"} size={5} />
                <span style={{ color: "var(--text-dim)", flexShrink: 0, fontFamily: MONO, fontSize: 10, width: 58 }}>{new Date(err.timestamp).toLocaleTimeString()}</span>
                <span style={{ fontSize: 9, color: err.type === "unhandledrejection" ? RED : AMBER, fontWeight: 600, flexShrink: 0, padding: "1px 4px", borderRadius: 3, background: err.type === "unhandledrejection" ? `${RED}15` : `${AMBER}15` }}>
                  {err.type === "unhandledrejection" ? "PROMISE" : "ERROR"}
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{err.message}</span>
              </div>
            ))}
          </div>
        </ChartSection>
      ) : !hasErrors && (
        <EmptyChartState title="No errors" message="No client errors or unhandled rejections have been captured in this session." hint="Errors will appear here automatically when they occur." />
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
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <InlineMetric label={t("session")} value={`${sessionMin}m ${sessionSec}s`} color="var(--text-secondary)" />
          <InlineMetric label={t("routesVisited")} value={String(userFlow.routeChanges)} color="var(--text-secondary)" />
          {userFlow.quizStarted > 0 && <InlineMetric label={t("quizzesStarted")} value={String(userFlow.quizStarted)} color={BLUE} />}
          {userFlow.quizCompleted > 0 && <InlineMetric label={t("completed")} value={String(userFlow.quizCompleted)} color={GREEN} />}
          {completionRate != null && <InlineMetric label={t("completionRate")} value={completionRate + "%"} color={sevColor(completionRate, THRESHOLDS.completionRate)} />}
          {userFlow.retries > 0 && <InlineMetric label={t("retries")} value={String(userFlow.retries)} color="var(--text-secondary)" />}
        </div>
      </ChartSection>

      {/* Quiz events summary */}
      {userFlow.quizStarted > 0 && (
        <ChartSection title={t("quizEvents")}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 5 }}>{t("quizzesStarted")}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: BLUE, fontFamily: MONO, transition: "color 0.3s" }}>{userFlow.quizStarted}</div>
            </div>
            <div style={{ flex: 1, background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 5 }}>{t("completed")}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: GREEN, fontFamily: MONO, transition: "color 0.3s" }}>{userFlow.quizCompleted}</div>
            </div>
            {userFlow.retries > 0 && (
              <div style={{ flex: 1, background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 5 }}>{t("retries")}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: AMBER, fontFamily: MONO, transition: "color 0.3s" }}>{userFlow.retries}</div>
              </div>
            )}
          </div>
        </ChartSection>
      )}

      {/* Route visits bar chart */}
      {routeItems.length > 0 && (
        <ChartSection title={t("routeVisits")} subtitle={`${routeItems.length} route${routeItems.length !== 1 ? "s" : ""} visited`}>
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "4px 12px" }}>
            <HorizontalBarChart items={routeItems} />
          </div>
        </ChartSection>
      )}
    </div>
  );
}
