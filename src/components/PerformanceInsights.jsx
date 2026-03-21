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
import { buildSnapshot, TIME_RANGES, computePercentiles } from "../utils/hybridTelemetry";
import { initRealTelemetry, getRealMetrics, recordRouteChange } from "../utils/realTelemetry";
import { HISTORICAL_RANGES, startHistoryRecorder, getHistory, mergeSnapshots, aggregateHistory, computeRES, scoreLabel, computeVitalDistribution } from "../utils/telemetryHistory";
import { startTelemetrySync, loadHistoryFromSupabase } from "../api/telemetrySync";


// ─── Component-level guard ─────────────────────────────────────────────────────
export default function PerformanceInsights({ onBack, lang = "en", dir = "ltr", supabase = null }) {
  if (!import.meta.env.DEV) return null;
  return <PerformanceInsightsInner onBack={onBack} lang={lang} dir={dir} supabase={supabase} />;
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

// ─── Metric metadata ────────────────────────────────────────────────────────────
const METRIC_INFO = {
  lcp:  { acronym: "LCP",  fullName: "Largest Contentful Paint",  desc: "Main content load time" },
  inp:  { acronym: "INP",  fullName: "Interaction to Next Paint", desc: "Input responsiveness" },
  cls:  { acronym: "CLS",  fullName: "Cumulative Layout Shift",   desc: "Visual stability" },
  fcp:  { acronym: "FCP",  fullName: "First Contentful Paint",    desc: "First visible content" },
  ttfb: { acronym: "TTFB", fullName: "Time to First Byte",       desc: "Server response time" },
};

const PERCENTILE_OPTIONS = [
  { key: "p75", label: "P75" },
  { key: "p90", label: "P90" },
  { key: "p95", label: "P95" },
  { key: "p99", label: "P99" },
];

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
function MetricCard({ label, tooltip, value, unit, status, statusColor, trend, sparkValues, sparkColor, metricKey, samples, compact }) {
  const TrendIcon = trend === "improving" ? TrendingDown : trend === "degrading" ? TrendingUp : Minus;
  const trendColor = trend === "improving" ? GREEN : trend === "degrading" ? RED : "var(--text-dim)";
  const info = metricKey ? METRIC_INFO[metricKey] : null;

  if (compact) {
    return (
      <div style={{ flex: 1, minWidth: 100, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 8, padding: "8px 10px" }}>
        <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: statusColor || "var(--text-bright)", fontFamily: MONO, lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{unit}</span>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 140, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6, transition: "border-color 0.3s, box-shadow 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {tooltip ? (
            <Tooltip text={tooltip}>
              <span style={{ cursor: "help", borderBottom: "1px dotted var(--glass-8)" }}>{label}</span>
            </Tooltip>
          ) : label}
        </div>
        {status && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, textTransform: "uppercase", letterSpacing: 0.3 }}>
            {status}
          </span>
        )}
      </div>
      {info && (
        <div style={{ marginTop: -3 }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 400, lineHeight: 1.2 }}>{info.fullName}</div>
          <div style={{ fontSize: 10, color: "var(--text-disabled)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.2 }}>{info.desc}</div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: statusColor || "var(--text-bright)", fontFamily: MONO, lineHeight: 1, transition: "color 0.3s" }}>{value}</span>
          {unit && <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>}
        </div>
        <Sparkline values={sparkValues} color={sparkColor || statusColor || "var(--glass-15)"} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {trend && (
          <div style={{ fontSize: 11, color: trendColor, fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
            <TrendIcon size={11} />
            {trend}
          </div>
        )}
        {samples != null && (
          <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 400 }}>{samples} sample{samples !== 1 ? "s" : ""}</span>
        )}
      </div>
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

function PerformanceInsightsInner({ onBack, lang = "en", dir = "ltr", supabase = null }) {
  const t = (key) => (T[lang] || T.en)[key] || T.en[key] || key;
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [histRangeKey, setHistRangeKey] = useState("24h");
  const [aggWindowKey, setAggWindowKey] = useState("session");
  const [percentileKey, setPercentileKey] = useState("p95");

  const activeHistRange = HISTORICAL_RANGES.find(r => r.key === histRangeKey) || HISTORICAL_RANGES[0];
  const isHistorical = histRangeKey !== "live";
  const activeRange = TIME_RANGES.find(r => r.key === aggWindowKey) || TIME_RANGES[TIME_RANGES.length - 1];

  useEffect(() => {
    const cleanupTelemetry = initRealTelemetry();
    recordRouteChange("performanceInsights");
    const cleanupSync = startTelemetrySync(supabase, getRealMetrics);
    return () => { cleanupTelemetry(); cleanupSync(); };
  }, [supabase]);

  const loadSnapshot = useCallback(() => {
    const real = getRealMetrics();
    setData(buildSnapshot(real, activeRange.sec));
    setLastUpdated(new Date());
  }, [activeRange.sec]);

  useEffect(() => { if (!isHistorical) { const t = setTimeout(loadSnapshot, 350); return () => clearTimeout(t); } }, [loadSnapshot, isHistorical]);
  const refresh = useCallback(() => { if (!isHistorical) { setData(null); setTimeout(loadSnapshot, 250); } }, [loadSnapshot, isHistorical]);
  useEffect(() => { if (!isHistorical) { const id = setInterval(loadSnapshot, 30_000); return () => clearInterval(id); } }, [loadSnapshot, isHistorical]);

  // Historical data (localStorage instant + Supabase async merge)
  const [histSnapshots, setHistSnapshots] = useState([]);
  useEffect(() => {
    if (!isHistorical) { setHistSnapshots([]); return; }
    // Instant: load from localStorage
    const local = getHistory(activeHistRange.ms);
    setHistSnapshots(local);
    // Async: merge with Supabase data
    if (supabase) {
      loadHistoryFromSupabase(supabase, activeHistRange.ms).then(remote => {
        if (remote.length > 0) {
          setHistSnapshots(prev => mergeSnapshots(prev, remote));
        }
      });
    }
  }, [isHistorical, activeHistRange, supabase]);

  const histData = useMemo(() => {
    if (!isHistorical || histSnapshots.length === 0) return null;
    return aggregateHistory(histSnapshots);
  }, [isHistorical, histSnapshots]);

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
    : activeRange.sec != null ? `Last ${activeRange.label}` : "Full Session";

  // Session duration for disabling aggregation windows that exceed it
  const sessionDurationSec = data?.userFlow?.sessionDuration || 0;

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
    <div className="page-pad" style={{ maxWidth: 960, margin: "0 auto", padding: "12px 14px", animation: "fadeIn 0.3s ease", direction: "ltr", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <button className="back-btn" onClick={onBack} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", order: dir === "rtl" ? 99 : 0 }}>
          <ArrowLeft size={16} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.2 }}>{t("title")}</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>{t("devOnly")}</span>
        <TelemetryIndicator hasData={hasAnyData} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {!isHistorical && agoSec != null && (
            <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500 }}>updated {agoSec}s ago</span>
          )}
          {!isHistorical && (
            <button onClick={refresh} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-muted)", padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center" }} title="Refresh">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Time controls ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {/* Primary: Time Range */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", letterSpacing: 0.5, textTransform: "uppercase", width: 72, flexShrink: 0 }}>Time Range</span>
          <div style={{ display: "flex", gap: 2, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 3 }}>
            <button onClick={() => setHistRangeKey("live")} style={{
              background: !isHistorical ? "var(--glass-10)" : "transparent",
              border: "none",
              color: !isHistorical ? "var(--text-bright)" : "var(--text-muted)",
              padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12,
              fontWeight: !isHistorical ? 700 : 400, transition: "all 0.15s ease",
            }}>
              Live Session
            </button>
            {HISTORICAL_RANGES.map(r => {
              const active = isHistorical && r.key === histRangeKey;
              return (
                <button key={r.key} onClick={() => setHistRangeKey(r.key)} style={{
                  background: active ? "rgba(139,92,246,0.20)" : "transparent",
                  border: "none",
                  color: active ? "#a78bfa" : "var(--text-muted)",
                  padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                  fontWeight: active ? 700 : 400, transition: "all 0.15s ease",
                }}>
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary: Aggregation Window (only in live mode) */}
        {!isHistorical && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", letterSpacing: 0.5, textTransform: "uppercase", width: 72, flexShrink: 0 }}>Window</span>
            <div style={{ display: "flex", gap: 2, background: "var(--glass-1)", border: "1px solid var(--glass-3)", borderRadius: 7, padding: 2 }}>
              {TIME_RANGES.map(r => {
                const active = r.key === aggWindowKey;
                const disabled = r.sec != null && r.sec > sessionDurationSec && sessionDurationSec > 0;
                const label = r.key === "session" ? "Full Session" : r.label;
                return (
                  <button key={r.key} onClick={() => !disabled && setAggWindowKey(r.key)} style={{
                    background: active ? "var(--glass-8)" : "transparent",
                    border: "none",
                    color: disabled ? "var(--text-disabled)" : active ? "var(--text-bright)" : "var(--text-muted)",
                    padding: "4px 10px", borderRadius: 5, fontSize: 11,
                    fontWeight: active ? 600 : 400, transition: "all 0.15s ease",
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.4 : 1,
                  }} title={disabled ? `Session is only ${sessionDurationSec}s long` : undefined}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Historical view ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {isHistorical ? (
        <HistoricalView data={histData} range={activeHistRange} t={t} liveScore={liveScore} snapshots={histSnapshots} />
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
          {activeTab === "overview" && <OverviewTab data={data} t={t} rangeLabel={rangeLabel} activeRange={activeRange} trendDir={trendDir} latencyBaseline={latencyBaseline} confidence={confidence} health={health} alerts={alerts} alertsOpen={alertsOpen} setAlertsOpen={setAlertsOpen} insights={insights} latencySparkValues={latencySparkValues} liveScore={liveScore} percentileKey={percentileKey} setPercentileKey={setPercentileKey} />}
          {activeTab === "vitals"  && <VitalsTab vitals={data.vitals} navTiming={data.navTiming} t={t} />}
          {activeTab === "network" && <NetworkTab data={data} t={t} rangeLabel={rangeLabel} activeRange={activeRange} trendDir={trendDir} latencyBaseline={latencyBaseline} confidence={confidence} />}
          {activeTab === "errors"  && <ErrorsTab client={data.client} t={t} totalRequests={data.totalRequests} errorRate={data.errorRate} latencyTimeline={data.latencyTimeline} />}
          {activeTab === "userflow" && <UserFlowTab userFlow={data.userFlow} t={t} />}
        </>
      )}

      </div>
      <div style={{ textAlign: "center", padding: "8px 0 4px", fontSize: 10, color: "var(--text-dim)", marginTop: "auto" }}>
        {t("allData")}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORICAL VIEW (Vercel-style)
// ═══════════════════════════════════════════════════════════════════════════════
function HistoricalView({ data, range, t, liveScore, snapshots }) {
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

  // Compute distributions from raw snapshots
  const lcpDist = snapshots?.length > 0 ? computeVitalDistribution(snapshots, "lcp", CRUX_BENCHMARKS.lcp.good, CRUX_BENCHMARKS.lcp.poor) : null;
  const inpDist = snapshots?.length > 0 ? computeVitalDistribution(snapshots, "inp", CRUX_BENCHMARKS.inp.good, CRUX_BENCHMARKS.inp.poor) : null;
  const clsDist = snapshots?.length > 0 ? computeVitalDistribution(snapshots, "cls", CRUX_BENCHMARKS.cls.good, CRUX_BENCHMARKS.cls.poor) : null;

  return (
    <div style={{ display: "flex", gap: 12, flex: 1 }}>
      {/* ── Left column: Web Vitals vertical rail (full height) ── */}
      <div style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 4, background: "var(--glass-1)", border: "1px solid var(--glass-3)", borderRadius: 10, padding: "6px 6px" }}>
        <VitalCard label="LCP" metricKey="lcp" value={data.vitals.lcp} unit="ms" threshold={THRESHOLDS.lcp} snapshots={snapshots} vitalKey="lcp" compact />
        <VitalCard label="INP" metricKey="inp" value={data.vitals.inp} unit="ms" threshold={THRESHOLDS.inp} snapshots={snapshots} vitalKey="inp" compact />
        <VitalCard label="CLS" metricKey="cls" value={data.vitals.cls} unit="" threshold={THRESHOLDS.cls} snapshots={snapshots} vitalKey="cls" compact />
        <VitalCard label="FCP" metricKey="fcp" value={data.nav?.fcp} unit="ms" threshold={{ warning: 1800, critical: 3000 }} compact />
        <VitalCard label="TTFB" metricKey="ttfb" value={data.nav?.ttfb} unit="ms" threshold={{ warning: 800, critical: 1800 }} compact />
      </div>

      {/* ── Right column: CSS Grid dashboard ── */}
      <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateRows: "1fr auto 1fr", gap: 8 }}>
        {/* Row 1: Score column + Score Over Time chart */}
        <div style={{ display: "flex", gap: 8, alignItems: "stretch", minHeight: 0 }}>
          <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, width: 100, flexShrink: 0 }}>
            <ScoreDonut score={data.score} color={sc.color} size={52} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: sc.color, lineHeight: 1 }}>{sc.text}</div>
              <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 3 }}>{data.snapshotCount} snapshots</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {data.scoreSeries.length > 1 ? (
              <HistoricalLineChart series={data.scoreSeries} color={sc.color} formatLabel={formatTimeLabel} yMin={0} yMax={100}
                thresholds={[{ value: 90, color: GREEN, label: "Great" }, { value: 50, color: AMBER, label: "Needs work" }]} fill />
            ) : (
              <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "10px 14px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 11 }}>
                {t("realExperienceScore")}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Summary stat cards (compact, auto height) */}
        <div style={{ display: "flex", gap: 8 }}>
          <MetricCard label={t("totalReqs")} value={String(data.totalRequests)} statusColor="var(--text-bright)" samples={data.snapshotCount} compact />
          <MetricCard label={t("errorRate")} tooltip={t("errorRateTooltip")} value={data.errorRate != null ? data.errorRate + "%" : "\u2014"} statusColor={data.errorRate != null && data.errorRate >= 5 ? RED : data.errorRate != null && data.errorRate >= 2 ? AMBER : GREEN} compact />
          <MetricCard label={t("p95Latency")} value={data.avgP95 != null ? String(data.avgP95) : "\u2014"} unit={data.avgP95 != null ? "ms" : ""} statusColor={data.avgP95 != null ? sevColor(data.avgP95, THRESHOLDS.p95Latency, "var(--text-bright)") : "var(--text-dim)"} compact />
        </div>

        {/* Row 3: Distribution + P95 Latency (fills remaining space) */}
        <div style={{ display: "flex", gap: 8, minHeight: 0 }}>
          {(lcpDist || inpDist || clsDist) && (
            <div style={{ flex: 1, minWidth: 0, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 8 }}>{t("distribution")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flex: 1 }}>
                {lcpDist && <DistributionBar distribution={lcpDist} label="LCP" compact />}
                {inpDist && <DistributionBar distribution={inpDist} label="INP" compact />}
                {clsDist && <DistributionBar distribution={clsDist} label="CLS" compact />}
              </div>
            </div>
          )}
          {data.p95Series.length > 1 ? (
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 4 }}>{t("p95OverTime")}</div>
              <HistoricalLineChart series={data.p95Series} color={BLUE} formatLabel={formatTimeLabel} unit="ms"
                thresholds={[{ value: THRESHOLDS.p95Latency.warning, color: AMBER, label: "Warning" }, { value: THRESHOLDS.p95Latency.critical, color: RED, label: "Critical" }]} fill />
            </div>
          ) : <div style={{ flex: 1 }} />}
        </div>
      </div>
    </div>
  );
}

// ─── Vitals Sidebar Card ─────────────────────────────────────────────────────
function VitalCard({ label, metricKey, value, unit, threshold, snapshots, vitalKey, compact }) {
  const sev = threshold && value != null ? severity(value, threshold) : "info";
  const col = value == null ? "var(--text-dim)" : sev === "info" ? GREEN : SEVERITY_COLORS[sev].text;
  const displayVal = value != null ? (unit === "ms" && value >= 1000 ? (value / 1000).toFixed(2) + "s" : value + (unit || "")) : "\u2014";
  const info = metricKey ? METRIC_INFO[metricKey] : null;
  const statusLabel = value == null ? null : sev === "info" ? "Good" : sev === "warning" ? "Needs work" : "Poor";
  const pct = threshold && value != null ? Math.min((value / (threshold.critical * 1.2)) * 100, 100) : 0;

  // Sparkline from historical snapshots
  const sparkData = snapshots && vitalKey ? snapshots.map(s => s.vitals?.[vitalKey]).filter(v => v != null) : [];

  // Split numeric value and unit for display (e.g. "232" + "ms", "0.097" + "")
  const splitDisplay = (() => {
    if (value == null) return { num: "\u2014", unitStr: "" };
    if (unit === "ms" && value >= 1000) return { num: (value / 1000).toFixed(2), unitStr: "s" };
    if (unit === "ms") return { num: String(value), unitStr: "ms" };
    return { num: String(value), unitStr: unit || "" };
  })();

  if (compact) {
    return (
      <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: "10px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 0.3 }}>{label}</span>
          {statusLabel && (
            <span style={{ fontSize: 8, fontWeight: 600, padding: "1px 4px", borderRadius: 3, background: `${col}15`, color: col, border: `1px solid ${col}30` }}>{statusLabel}</span>
          )}
        </div>
        {info && <div style={{ fontSize: 9, color: "var(--text-dim)", lineHeight: 1.1, marginBottom: 4 }}>{info.fullName}</div>}
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: MONO, color: col, lineHeight: 1, transition: "color 0.3s" }}>{splitDisplay.num}</span>
          {splitDisplay.unitStr && <span style={{ fontSize: 11, fontWeight: 500, color: col, opacity: 0.6 }}>{splitDisplay.unitStr}</span>}
          <div style={{ marginLeft: "auto" }}>
            {sparkData.length >= 3 && <VitalSparkline data={sparkData} color={col} />}
          </div>
        </div>
        {threshold && (
          <div style={{ height: 2, borderRadius: 1, background: "var(--glass-3)", overflow: "hidden", marginTop: 5 }}>
            <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: col, borderRadius: 1, transition: "width 0.4s ease" }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
        {statusLabel && (
          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: `${col}15`, color: col, border: `1px solid ${col}30` }}>{statusLabel}</span>
        )}
      </div>
      {info && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.2 }}>{info.fullName}</div>
          <div style={{ fontSize: 9, color: "var(--text-disabled)", fontStyle: "italic", lineHeight: 1.2 }}>{info.desc}</div>
        </div>
      )}
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color: col, lineHeight: 1, marginBottom: 6, transition: "color 0.3s" }}>{displayVal}</div>
      {threshold && (
        <div style={{ height: 3, borderRadius: 2, background: "var(--glass-3)", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: col, borderRadius: 2, transition: "width 0.4s ease" }} />
        </div>
      )}
    </div>
  );
}

function VitalSparkline({ data, color }) {
  const w = 50, h = 14;
  const max = Math.max(...data, 0.01);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.slice(-12).map((v, i, arr) => {
    const x = (i / (arr.length - 1)) * w;
    const y = h - 1 - ((v - min) / range) * (h - 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} style={{ flexShrink: 0, opacity: 0.7 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Vitals Sidebar ─────────────────────────────────────────────────────────────
function VitalsSidebar({ vitals, navTiming }) {
  const lcpVal = vitals?.lcp ?? null;
  const inpVal = vitals?.inp ?? null;
  const clsVal = vitals?.cls ?? null;
  const fcpVal = navTiming?.domContentLoaded ?? navTiming?.fcp ?? null;
  const ttfbVal = navTiming?.ttfb ?? null;

  return (
    <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <VitalCard label="LCP" metricKey="lcp" value={lcpVal} unit="ms" threshold={THRESHOLDS.lcp} />
      <VitalCard label="INP" metricKey="inp" value={inpVal} unit="ms" threshold={THRESHOLDS.inp} />
      <VitalCard label="CLS" metricKey="cls" value={clsVal} unit="" threshold={THRESHOLDS.cls} />
      <VitalCard label="FCP" metricKey="fcp" value={fcpVal} unit="ms" threshold={{ warning: 1800, critical: 3000 }} />
      <VitalCard label="TTFB" metricKey="ttfb" value={ttfbVal} unit="ms" threshold={{ warning: 800, critical: 1800 }} />
    </div>
  );
}

// ─── Score donut ──────────────────────────────────────────────────────────────
function ScoreDonut({ score, color, size = 80 }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score != null ? score / 100 : 0;
  const dashOffset = circumference * (1 - pct);
  const fontSize = Math.round(size * 0.38);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize, fontWeight: 800, fontFamily: MONO, color: "var(--text-bright)" }}>{score ?? "\u2014"}</span>
      </div>
    </div>
  );
}

// ─── Historical line chart ───────────────────────────────────────────────────
function HistoricalLineChart({ series, color, formatLabel, unit, yMin, yMax, thresholds, compact, fill }) {
  if (!series || series.length < 2) return null;

  const values = series.map(s => s.value);
  const min = yMin ?? Math.min(...values) * 0.9;
  const max = yMax ?? Math.max(...values) * 1.1;
  const range = max - min || 1;

  const W = 600;
  const H = compact ? 80 : 100;
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

  const pad = compact || fill ? "8px 10px" : "12px 14px";

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: pad, ...(fill ? { flex: 1, display: "flex", flexDirection: "column" } : {}) }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={fill ? "xMidYMid meet" : "none"} style={{ display: "block", ...(fill ? { flex: 1, minHeight: 0 } : {}) }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {thresholds?.map((th, i) => {
          const y = H - padY - ((th.value - min) / range) * (H - padY * 2);
          return (
            <g key={i}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke={th.color} strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
              {!compact && <text x={W - padX - 2} y={y - 3} textAnchor="end" fontSize={8} fill={th.color} opacity={0.6}>{th.label}</text>}
            </g>
          );
        })}
        <path d={fillD} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={compact ? 1.5 : 2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={compact ? 2.5 : 3.5} fill={color} stroke="var(--glass-2)" strokeWidth={2} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: compact ? 9 : 10, color: "var(--text-muted)" }}>
        <span>{firstLabel}</span>
        {!compact && midLabel && <span>{midLabel}</span>}
        <span>{lastLabel}</span>
      </div>
      {!compact && (
        <div style={{ display: "flex", gap: 16, marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--glass-3)", fontSize: 11 }}>
          <span style={{ color: "var(--text-muted)" }}>Latest <span style={{ color, fontFamily: MONO, fontWeight: 600 }}>{values[values.length - 1]}{unit || ""}</span></span>
          <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}{unit || ""}</span></span>
          <span style={{ color: "var(--text-muted)" }}>Points <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{values.length}</span></span>
        </div>
      )}
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

// ─── Distribution Bar ────────────────────────────────────────────────────────────
function DistributionBar({ distribution, label, compact }) {
  if (!distribution) return null;
  const { good, needsWork, poor, total } = distribution;
  const barH = compact ? 6 : 8;
  return (
    <div style={{ marginBottom: compact ? 0 : 10 }}>
      {label && <div style={{ fontSize: compact ? 10 : 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: compact ? 2 : 4 }}>{label} {!compact && <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>{total} sample{total !== 1 ? "s" : ""}</span>}</div>}
      <div style={{ display: "flex", height: barH, borderRadius: barH / 2, overflow: "hidden", gap: 1 }}>
        {good > 0 && <div style={{ width: `${good}%`, background: GREEN, transition: "width 0.4s ease" }} title={`Good: ${good}%`} />}
        {needsWork > 0 && <div style={{ width: `${needsWork}%`, background: AMBER, transition: "width 0.4s ease" }} title={`Needs improvement: ${needsWork}%`} />}
        {poor > 0 && <div style={{ width: `${poor}%`, background: RED, transition: "width 0.4s ease" }} title={`Poor: ${poor}%`} />}
      </div>
      {!compact && (
        <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10 }}>
          <span style={{ color: GREEN, fontWeight: 500 }}>Good {good}%</span>
          <span style={{ color: AMBER, fontWeight: 500 }}>Needs improvement {needsWork}%</span>
          <span style={{ color: RED, fontWeight: 500 }}>Poor {poor}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Percentile Selector ─────────────────────────────────────────────────────────
function PercentileSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 6, padding: 2 }}>
      {PERCENTILE_OPTIONS.map(opt => {
        const active = opt.key === value;
        return (
          <button key={opt.key} onClick={() => onChange(opt.key)} style={{
            background: active ? "var(--glass-8)" : "transparent",
            border: "none",
            color: active ? "var(--text-bright)" : "var(--text-muted)",
            padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontSize: 10,
            fontWeight: active ? 700 : 400, fontFamily: MONO,
            transition: "all 0.15s ease",
          }}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Route Breakdown ─────────────────────────────────────────────────────────────
function RouteBreakdown({ userFlow, data }) {
  const routes = userFlow?.routeVisits || [];
  if (routes.length === 0) return null;

  return (
    <ChartSection title="Route Performance" subtitle={`${routes.length} route${routes.length !== 1 ? "s" : ""} visited`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {routes.map((r, i) => {
          const routeName = "/" + r.route;
          return (
            <div key={r.route} style={{ background: "var(--glass-2)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--glass-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: MONO }}>{routeName}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{r.visits} visit{r.visits !== 1 ? "s" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartSection>
  );
}

// ─── Network Health Section ──────────────────────────────────────────────────
function NetworkHealthSection({ data }) {
  const timeline = data?.latencyTimeline || [];
  const client = data?.client || {};
  if (timeline.length === 0 && client.unhandledErrors === 0 && client.promiseRejections === 0) return null;

  // Bucket requests into time windows for charts
  const buckets = useMemo(() => {
    if (timeline.length < 2) return [];
    const BUCKET_COUNT = Math.min(20, timeline.length);
    const minTs = timeline[0].ts;
    const maxTs = timeline[timeline.length - 1].ts;
    const range = maxTs - minTs || 1;
    const bucketSize = range / BUCKET_COUNT;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      ts: minTs + i * bucketSize,
      time: new Date(minTs + i * bucketSize).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ok: 0, clientErr: 0, serverErr: 0, total: 0,
      latencies: [],
    }));

    for (const req of timeline) {
      const idx = Math.min(Math.floor(((req.ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      result[idx].total++;
      result[idx].latencies.push(req.value);
      // Infer status category from value context
      // We don't have status codes in latencyTimeline, use ok indicator from raw data
    }
    return result;
  }, [timeline]);

  // Use raw request data for status breakdown if available
  const statusBuckets = useMemo(() => {
    const reqs = data?._rawRequests || [];
    if (reqs.length < 2) return [];
    const BUCKET_COUNT = Math.min(20, reqs.length);
    const minTs = reqs[0].ts;
    const maxTs = reqs[reqs.length - 1].ts;
    const range = maxTs - minTs || 1;
    const bucketSize = range / BUCKET_COUNT;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      time: new Date(minTs + i * bucketSize).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      s2xx: 0, s4xx: 0, s5xx: 0, sOther: 0,
      latencies: [],
    }));

    for (const req of reqs) {
      const idx = Math.min(Math.floor(((req.ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      result[idx].latencies.push(req.duration);
      const s = req.status;
      if (s >= 200 && s < 300) result[idx].s2xx++;
      else if (s >= 400 && s < 500) result[idx].s4xx++;
      else if (s >= 500) result[idx].s5xx++;
      else result[idx].sOther++;
    }
    return result;
  }, [data?._rawRequests]);

  // Error timeline from client error log
  const errorBuckets = useMemo(() => {
    const errors = data?.client?.recentErrors || [];
    if (errors.length === 0) return [];
    const BUCKET_COUNT = Math.min(12, Math.max(4, errors.length));
    const timestamps = errors.map(e => new Date(e.timestamp).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const range = maxTs - minTs || 60_000;
    const bucketSize = range / BUCKET_COUNT;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      time: new Date(minTs + i * bucketSize).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      jsErrors: 0, rejections: 0, networkFails: 0,
    }));

    for (const err of errors) {
      const ts = new Date(err.timestamp).getTime();
      const idx = Math.min(Math.floor(((ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      if (err.type === "unhandledrejection") result[idx].rejections++;
      else result[idx].jsErrors++;
    }
    // Network failures from client data
    const netLog = data?.client?.recentNetworkLog || [];
    for (const entry of netLog) {
      const ts = new Date(entry.timestamp).getTime();
      const idx = Math.min(Math.floor(((ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      if (idx >= 0 && idx < BUCKET_COUNT) result[idx].networkFails++;
    }
    return result;
  }, [data?.client?.recentErrors, data?.client?.recentNetworkLog]);

  const hasStatusData = statusBuckets.length > 0;
  const hasErrors = errorBuckets.length > 0 && errorBuckets.some(b => b.jsErrors + b.rejections + b.networkFails > 0);

  return (
    <ChartSection title="Network Health" subtitle="Network health metrics from real browser sessions">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Requests Over Time */}
        {hasStatusData && (
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Requests Over Time
              <span style={{ fontWeight: 400, fontSize: 10, color: "var(--text-dim)" }}>{data?._rawRequests?.length || 0} total</span>
            </div>
            <StackedBarChart buckets={statusBuckets} keys={["s2xx", "s4xx", "s5xx"]} colors={[GREEN, AMBER, RED]} labels={["2xx", "4xx", "5xx"]} height={48} />
          </div>
        )}

        {/* API Latency Over Time (P50 / P95) */}
        {hasStatusData && statusBuckets.some(b => b.latencies.length > 0) && (
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>API Latency Over Time</div>
            <LatencyPercentilesChart buckets={statusBuckets} height={48} />
          </div>
        )}

        {/* Error Rate Over Time */}
        {hasErrors && (
          <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>Error Rate</div>
            <StackedBarChart buckets={errorBuckets} keys={["jsErrors", "rejections", "networkFails"]} colors={[RED, AMBER, "#f472b6"]} labels={["JS Errors", "Rejections", "Network"]} height={40} />
          </div>
        )}
      </div>
    </ChartSection>
  );
}

// ─── Stacked Bar Chart ──────────────────────────────────────────────────────────
function StackedBarChart({ buckets, keys, colors, labels, height = 48 }) {
  const maxTotal = Math.max(...buckets.map(b => keys.reduce((s, k) => s + (b[k] || 0), 0)), 1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
        {buckets.map((b, i) => {
          const total = keys.reduce((s, k) => s + (b[k] || 0), 0);
          const h = Math.max((total / maxTotal) * 100, 2);
          return (
            <div key={i} style={{ flex: 1, height: `${h}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 3 }} title={keys.map((k, j) => `${labels[j]}: ${b[k] || 0}`).join(", ")}>
              {keys.map((k, j) => {
                const val = b[k] || 0;
                if (val === 0) return null;
                const segH = (val / total) * 100;
                return <div key={k} style={{ height: `${segH}%`, background: colors[j], minHeight: val > 0 ? 2 : 0, borderRadius: j === 0 ? "2px 2px 0 0" : j === keys.length - 1 ? "0 0 0 0" : 0 }} />;
              })}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "var(--text-dim)" }}>
        <span>{buckets[0]?.time}</span>
        <span>{buckets[buckets.length - 1]?.time}</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10 }}>
        {labels.map((l, i) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: colors[i] }} />
            <span style={{ color: "var(--text-muted)" }}>{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Latency Percentiles Chart ──────────────────────────────────────────────────
function LatencyPercentilesChart({ buckets, height = 48 }) {
  // Compute P50 and P95 per bucket
  const points = useMemo(() => {
    return buckets.map(b => {
      const sorted = [...b.latencies].sort((a, c) => a - c);
      if (sorted.length === 0) return { p50: null, p95: null };
      return {
        p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
        p95: sorted[Math.min(Math.floor(sorted.length * 0.95), sorted.length - 1)] || 0,
      };
    });
  }, [buckets]);

  const validPoints = points.filter(p => p.p95 != null);
  if (validPoints.length < 2) return null;

  const maxVal = Math.max(...validPoints.map(p => p.p95), 1);
  const W = 400;
  const H = height;
  const pad = 2;

  const toPath = (key) => {
    const pts = points.map((p, i) => {
      if (p[key] == null) return null;
      const x = pad + (i / (points.length - 1)) * (W - pad * 2);
      const y = H - pad - ((p[key]) / maxVal) * (H - pad * 2);
      return { x, y };
    }).filter(Boolean);
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <path d={toPath("p95")} fill="none" stroke={RED} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        <path d={toPath("p50")} fill="none" stroke={BLUE} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "var(--text-dim)" }}>
        <span>{buckets[0]?.time}</span>
        <span>{buckets[buckets.length - 1]?.time}</span>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 12, height: 2, background: BLUE, borderRadius: 1 }} />
          <span style={{ color: "var(--text-muted)" }}>P50</span>
          {validPoints.length > 0 && <span style={{ color: BLUE, fontFamily: MONO, fontWeight: 600, fontSize: 10 }}>{validPoints[validPoints.length - 1].p50}ms</span>}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 12, height: 2, background: RED, borderRadius: 1, opacity: 0.7 }} />
          <span style={{ color: "var(--text-muted)" }}>P95</span>
          {validPoints.length > 0 && <span style={{ color: RED, fontFamily: MONO, fontWeight: 600, fontSize: 10, opacity: 0.7 }}>{validPoints[validPoints.length - 1].p95}ms</span>}
        </span>
      </div>
    </div>
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
function OverviewTab({ data, t, rangeLabel, activeRange, trendDir, latencyBaseline, confidence, health, alerts, alertsOpen, setAlertsOpen, insights, latencySparkValues, liveScore, percentileKey, setPercentileKey }) {
  const hasLatencyData = data.latencyTimeline.length > 0;
  const hasAnyData = data.totalRequests > 0 || data.vitals?.lcp != null || data.vitals?.inp != null || data.vitals?.cls != null;

  // Metric card values
  const lcpVal = data.vitals?.lcp;
  const inpVal = data.vitals?.inp;
  const clsVal = data.vitals?.cls;
  const errRate = data.errorRate;
  const navTiming = data.navTiming;

  const statusFor = (val, th) => val != null ? (severity(val, th) === "info" ? t("good") : severity(val, th) === "warning" ? t("needsWork") : t("poor")) : null;
  const lcpStatus = statusFor(lcpVal, THRESHOLDS.lcp);
  const inpStatus = statusFor(inpVal, THRESHOLDS.inp);
  const clsStatus = statusFor(clsVal, THRESHOLDS.cls);

  const lcpColor = sevColor(lcpVal, THRESHOLDS.lcp);
  const inpColor = sevColor(inpVal, THRESHOLDS.inp);
  const clsColor = sevColor(clsVal, THRESHOLDS.cls);
  const errColor = errRate != null && errRate >= 5 ? RED : errRate != null && errRate >= 2 ? AMBER : GREEN;

  // Health color
  const healthColor = health.status === "unhealthy" ? RED : health.status === "degraded" ? AMBER : health.status === "unknown" ? "#64748b" : GREEN;

  // RES score
  const sc = liveScore != null ? scoreLabel(liveScore) : { text: "No data", color: "#64748b" };

  // Selected percentile value
  const pctlVal = data.percentiles?.[percentileKey] ?? null;

  // FCP and TTFB from nav timing
  const fcpVal = navTiming?.domContentLoaded ?? null;
  const ttfbVal = navTiming?.ttfb ?? null;

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
    <div style={{ display: "flex", gap: 16 }}>
      {/* ── Left column: Web Vitals vertical panel ── */}
      <VitalsSidebar vitals={data.vitals} navTiming={data.navTiming} />

      {/* ── Right column: Analytics content ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* RES Score */}
        <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 20 }}>
          <ScoreDonut score={liveScore} color={sc.color} size={68} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 3 }}>{t("realExperienceScore")}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: sc.color, marginBottom: 2 }}>{sc.text}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t("resDesc")}</div>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
            {data.totalRequests > 0 && (
              <div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 1 }}>Requests</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: MONO, color: "var(--text-secondary)" }}>{data.totalRequests}</div>
              </div>
            )}
          </div>
        </div>

        {/* Health status strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: `${healthColor}0A`, border: `1px solid ${healthColor}20`, borderRadius: 8, transition: "background 0.3s, border-color 0.3s" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor, boxShadow: health.status === "unknown" ? "none" : `0 0 6px ${healthColor}AA`, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-bright)" }}>
            {health.status === "unknown" ? t("statusIdle")(rangeLabel) : health.status === "healthy" && confidence.level === "low" ? t("statusHealthyLow") : { healthy: t("statusHealthy"), degraded: t("statusDegraded"), unhealthy: t("statusUnhealthy") }[health.status]}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1 }}>{health.reason}</span>
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
          <div style={{ padding: "4px 12px 4px 24px", display: "flex", flexDirection: "column", gap: 3 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ fontSize: 11, color: SEVERITY_COLORS[a.severity].text, display: "flex", alignItems: "center", gap: 5 }}>
                <SeverityDot sev={a.severity} size={5} />
                {a.message}
              </div>
            ))}
          </div>
        )}

        {/* Latency trend chart with percentile selector */}
        <ChartSection
          title={<span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {t("requestLatency")}
            {trendDir && <span style={{ fontSize: 10, fontWeight: 400, color: trendDir === "increasing" ? AMBER : trendDir === "decreasing" ? GREEN : "var(--text-dim)", textTransform: "none", letterSpacing: 0 }}>
              {trendDir === "increasing" ? t("trendUp") : trendDir === "decreasing" ? t("trendDown") : t("trendStable")}
            </span>}
            <span style={{ marginLeft: "auto" }}><PercentileSelector value={percentileKey} onChange={setPercentileKey} /></span>
          </span>}
          subtitle={hasLatencyData ? `${t("basedOn")(data.latencyTimeline.length, rangeLabel)}${confidence.level === "low" ? ` \u00b7 ${t("lowSample")}` : ""}` : null}
        >
          {hasLatencyData
            ? <LatencyChart data={data.latencyTimeline} baseline={latencyBaseline} p95={data.p95} percentiles={data.percentiles} selectedPercentile={percentileKey} compact />
            : <EmptyChartState title={t("noRequestsTitle")(rangeLabel)} message={activeRange.sec != null ? t("noRequestsMsgTimed")(activeRange.label) : t("noRequestsMsgSession")} hint={activeRange.sec != null && activeRange.sec <= 60 ? t("noRequestsHintShort") : t("noRequestsHintNav")} />
          }
        </ChartSection>

        {/* Network Health */}
        <NetworkHealthSection data={data} />

        {/* Route breakdown */}
        <RouteBreakdown userFlow={data.userFlow} data={data} />

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
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LATENCY CHART
// ═══════════════════════════════════════════════════════════════════════════════
const LatencyChart = memo(function LatencyChart({ data, baseline, p95, percentiles, selectedPercentile, compact }) {
  const max = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const avg = useMemo(() => Math.round(data.reduce((s, d) => s + d.value, 0) / data.length), [data]);
  const spikeThreshold = baseline ? baseline.baseline * 2 : THRESHOLDS.p95Latency.warning;
  const baselinePct = baseline ? Math.min((baseline.baseline / max) * 100, 92) : null;
  const chartHeight = compact ? 56 : 72;

  // Threshold lines for latency
  const goodLine = THRESHOLDS.p95Latency.warning;
  const poorLine = THRESHOLDS.p95Latency.critical;
  const goodPct = Math.min((goodLine / max) * 100, 95);
  const poorPct = Math.min((poorLine / max) * 100, 95);

  // Selected percentile value
  const pctlVal = percentiles?.[selectedPercentile] ?? p95;
  const pctlLabel = selectedPercentile ? selectedPercentile.toUpperCase() : "P95";

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 10, padding: compact ? "12px 14px" : "14px 16px" }}>
      <div style={{ position: "relative" }}>
        {/* Threshold lines */}
        {max > goodLine && (
          <div style={{ position: "absolute", bottom: `${goodPct}%`, left: 0, right: 0, borderBottom: `1px dashed ${GREEN}40`, zIndex: 1, pointerEvents: "none" }}>
            <span style={{ position: "absolute", left: 0, top: -12, fontSize: 9, color: `${GREEN}80`, background: "var(--glass-2)", padding: "0 4px", borderRadius: 3 }}>Good {goodLine}ms</span>
          </div>
        )}
        {max > poorLine && (
          <div style={{ position: "absolute", bottom: `${poorPct}%`, left: 0, right: 0, borderBottom: `1px dashed ${RED}40`, zIndex: 1, pointerEvents: "none" }}>
            <span style={{ position: "absolute", left: 0, top: -12, fontSize: 9, color: `${RED}80`, background: "var(--glass-2)", padding: "0 4px", borderRadius: 3 }}>Poor {poorLine}ms</span>
          </div>
        )}
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
        {pctlVal != null && <span style={{ color: "var(--text-muted)" }}>{pctlLabel} <span style={{ color: sevColor(pctlVal, THRESHOLDS.p95Latency, "var(--text-primary)"), fontFamily: MONO, fontWeight: 600 }}>{pctlVal}ms</span></span>}
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

              const info = METRIC_INFO[v.metric];
              return (
                <div key={v.key} style={{ background: "var(--glass-2)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{v.key}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{v.desc}</span>
                      {info && <span style={{ fontSize: 10, color: "var(--text-disabled)", marginLeft: 6, fontStyle: "italic" }}>{info.desc}</span>}
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
