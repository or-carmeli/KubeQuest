/**
 * Real Telemetry Snapshot Builder — Performance Insights
 *
 * Filters raw timestamped data to a time window, computes derived metrics,
 * then feeds the analysis engine. No mock data.
 */

import { assessHealth, deriveInsights, evaluateAlerts, computeBaseline, getConfidence, computeErrorRate, computeTraffic } from "./mockTelemetry";

/** Compute P75, P90, P95, P99 from a sorted array of numbers. */
export function computePercentiles(sorted) {
  if (!sorted || sorted.length === 0) return { p75: null, p90: null, p95: null, p99: null };
  const p = (pct) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];
  return { p75: p(0.75), p90: p(0.90), p95: p(0.95), p99: p(0.99) };
}

/** Time range options in seconds. null = full session. */
export const TIME_RANGES = [
  { key: "30s",      sec: 30,    label: "30s" },
  { key: "1m",       sec: 60,    label: "1 min" },
  { key: "5m",       sec: 300,   label: "5 min" },
  { key: "15m",      sec: 900,   label: "15 min" },
  { key: "30m",      sec: 1800,  label: "30 min" },
  { key: "session",  sec: null,  label: "Session" },
];

/**
 * Build a dashboard snapshot from real telemetry, filtered to a time window.
 * @param {object} real - result of getRealMetrics()
 * @param {number|null} windowSec - seconds to look back, or null for full session
 */
export function buildSnapshot(real, windowSec = null) {
  if (!real) return null;

  const now = Date.now();
  const cutoff = windowSec != null ? now - windowSec * 1000 : 0;

  // ── Filter timestamped data to window ──
  const requests    = (real.network?.requests || []).filter(r => r.ts >= cutoff);
  const networkLog  = (real.network?.log || []).filter(r => r.ts >= cutoff);
  const errorLog    = (real.errors?.log || []).filter(e => e.ts >= cutoff);

  // ── Windowed aggregates ──
  const totalRequests  = requests.length;
  const failedRequests = requests.filter(r => !r.ok).length;
  const slowRequests   = requests.filter(r => r.duration > 1500).length;
  const errorCount     = errorLog.length;
  const sessionDuration = real.userFlow?.sessionDuration || 0;
  const windowDuration  = windowSec != null ? Math.min(windowSec, sessionDuration) : sessionDuration;

  // Percentiles from windowed latencies
  const latencies = requests.map(r => r.duration).sort((a, b) => a - b);
  const pctl = computePercentiles(latencies);
  const p95 = pctl.p95;

  // Latency timeline for chart (formatted for display)
  const latencyTimeline = requests.map(r => ({
    time: new Date(r.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    value: r.duration,
    ts: r.ts,
  }));

  // Derived metrics
  const confidence = getConfidence(totalRequests);
  const errorRate  = computeErrorRate(failedRequests, totalRequests);
  const traffic    = computeTraffic(totalRequests, windowDuration > 0 ? windowDuration : 1);

  const analysisInput = {
    p95,
    errorCount,
    errorRate,
    vitals:          real.vitals,
    failedRequests,
    latencyTimeline,
    userFlow:        real.userFlow,
    confidence,
    totalRequests,
  };

  const health   = assessHealth(analysisInput);
  const insights = deriveInsights(analysisInput);
  const alerts   = evaluateAlerts(analysisInput);
  const baseline = computeBaseline(latencyTimeline);

  return {
    health,
    insights,
    alerts,
    confidence,
    traffic,

    p95,
    percentiles: pctl,
    totalRequests,
    failedRequests,
    errorCount,
    errorRate,

    vitals: real.vitals || { lcp: null, inp: null, cls: null },
    navTiming: real.navTiming || null,

    client: {
      unhandledErrors:   errorLog.filter(e => e.type === "error").length,
      promiseRejections: errorLog.filter(e => e.type === "unhandledrejection").length,
      failedRequests,
      slowRequests,
      recentErrors:      errorLog.slice(-20).map(e => ({ ...e, timestamp: new Date(e.ts).toISOString() })),
      recentNetworkLog:  networkLog.slice(-20).map(e => ({ ...e, timestamp: new Date(e.ts).toISOString() })),
    },

    userFlow: {
      quizStarted:     real.userFlow?.quizStarted || 0,
      quizCompleted:   real.userFlow?.quizCompleted || 0,
      retries:         real.userFlow?.retries || 0,
      routeChanges:    real.userFlow?.routeChanges || 0,
      routeVisits:     real.userFlow?.routeVisits || [],
      sessionDuration,
    },

    latencyTimeline,
    latencyBaseline: baseline,

    // Raw request data for status-code-level charts (Network Health)
    _rawRequests: requests,
  };
}
