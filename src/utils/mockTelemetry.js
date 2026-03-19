/**
 * Telemetry Analysis — Performance Insights
 *
 * Thresholds, severity classification, confidence scoring, health assessment,
 * and insights engine. Pure analysis functions operating on real data.
 * No data generation.
 */

// ─── Thresholds ────────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  p95Latency:     { warning: 800, critical: 1500 },
  errorRatePct:   { warning: 2,   critical: 5 },
  crashCount:     { warning: 5,   critical: 15 },
  failedRequests: { warning: 10,  critical: 30 },
  completionRate: { warning: 60,  critical: 40 },
  lcp:            { warning: 2500, critical: 4000 },
  inp:            { warning: 200,  critical: 500 },
  cls:            { warning: 0.1,  critical: 0.25 },
};

// ─── CrUX global benchmarks (Google Chrome UX Report p75 thresholds) ──────────
// These are the published "good" thresholds used by Lighthouse, PageSpeed Insights,
// and all major APM tools for Web Vitals comparison.
export const CRUX_BENCHMARKS = {
  lcp: { good: 2500, poor: 4000, unit: "ms", label: "LCP" },
  inp: { good: 200,  poor: 500,  unit: "ms", label: "INP" },
  cls: { good: 0.1,  poor: 0.25, unit: "",   label: "CLS" },
};

/** Compare a session value against the CrUX benchmark.
 *  Returns { verdict, label } where verdict is "faster"|"within"|"slower". */
export function compareToGlobal(metric, value) {
  if (value == null) return null;
  const bench = CRUX_BENCHMARKS[metric];
  if (!bench) return null;
  if (value <= bench.good * 0.75) return { verdict: "faster", label: "Faster than global p75" };
  if (value <= bench.good)        return { verdict: "within", label: "Within normal range" };
  if (value <= bench.poor)        return { verdict: "slower", label: "Slower than global p75" };
  return { verdict: "slower", label: "Significantly above global p75" };
}

// ─── Severity helpers ──────────────────────────────────────────────────────────
export function severity(value, threshold, lowerIsBad = false) {
  if (value == null) return "info";
  if (lowerIsBad) {
    if (value <= threshold.critical) return "critical";
    if (value <= threshold.warning) return "warning";
    return "info";
  }
  if (value >= threshold.critical) return "critical";
  if (value >= threshold.warning) return "warning";
  return "info";
}

export const SEVERITY_COLORS = {
  info:     { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  warning:  { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  critical: { bg: "rgba(239,68,68,0.12)",  text: "#f87171", border: "rgba(239,68,68,0.25)" },
};

// ─── Baseline comparison ───────────────────────────────────────────────────────
export function computeBaseline(pts, recentCount = 5) {
  if (!pts || pts.length < recentCount * 2) return null;
  const baseline = pts.slice(0, pts.length - recentCount);
  const recent   = pts.slice(-recentCount);
  const avgBase  = baseline.reduce((s, p) => s + p.value, 0) / baseline.length;
  const avgRecent = recent.reduce((s, p) => s + p.value, 0) / recent.length;
  const changePct = avgBase > 0 ? ((avgRecent - avgBase) / avgBase) * 100 : 0;
  const direction = changePct > 15 ? "increasing" : changePct < -15 ? "decreasing" : "stable";
  return { baseline: Math.round(avgBase), current: Math.round(avgRecent), changePct: Math.round(changePct), direction };
}

// ─── Data confidence ───────────────────────────────────────────────────────────
// Heuristic based on request sample size.
export function getConfidence(totalRequests) {
  if (totalRequests >= 20) return { level: "high",   label: "High confidence" };
  if (totalRequests >= 5)  return { level: "medium", label: "Medium confidence" };
  if (totalRequests > 0)   return { level: "low",    label: "Low confidence" };
  return { level: "none", label: "No data" };
}

// ─── Error rate ────────────────────────────────────────────────────────────────
export function computeErrorRate(failedRequests, totalRequests) {
  if (totalRequests === 0) return null;
  return +((failedRequests / totalRequests) * 100).toFixed(2);
}

// ─── Traffic context ───────────────────────────────────────────────────────────
export function computeTraffic(totalRequests, sessionDurationSec) {
  if (sessionDurationSec <= 0 || totalRequests === 0) return { rps: null, label: "No traffic" };
  const rps = +(totalRequests / sessionDurationSec).toFixed(1);
  return { rps, label: `${rps} req/s` };
}

// ─── Health assessment ─────────────────────────────────────────────────────────
export function assessHealth({ p95, errorCount, errorRate, vitals, failedRequests, latencyTimeline, confidence }) {
  let score = 0;
  const reasons = [];

  // P95 latency
  if (p95 != null) {
    const s = severity(p95, THRESHOLDS.p95Latency);
    if (s === "critical")     { score += 3; reasons.push("high latency"); }
    else if (s === "warning") { score += 1; }
  }

  // Error rate (prefer rate over raw count when we have traffic)
  if (errorRate != null) {
    const s = severity(errorRate, THRESHOLDS.errorRatePct);
    if (s === "critical")     { score += 3; reasons.push("high error rate"); }
    else if (s === "warning") { score += 1; }
  } else if (errorCount >= 10) {
    score += 3; reasons.push("high error count");
  } else if (errorCount >= 3) {
    score += 1;
  }

  // Correlation: latency AND errors both elevated
  if (p95 != null && severity(p95, THRESHOLDS.p95Latency) !== "info" && (errorRate != null ? errorRate >= THRESHOLDS.errorRatePct.warning : errorCount >= 3)) {
    score += 2;
    reasons.push("latency-error correlation");
  }

  // Web Vitals
  if (vitals?.lcp != null) {
    if (vitals.lcp >= THRESHOLDS.lcp.critical)       { score += 2; reasons.push("poor LCP"); }
    else if (vitals.lcp >= THRESHOLDS.lcp.warning)    { score += 1; }
  }

  // Network failures
  if (failedRequests >= THRESHOLDS.failedRequests.critical) { score += 2; reasons.push("network instability"); }
  else if (failedRequests >= THRESHOLDS.failedRequests.warning) { score += 1; }

  // Latency trend
  const trend = computeBaseline(latencyTimeline);
  if (trend && trend.direction === "increasing" && trend.changePct > 30) {
    score += 1; reasons.push("worsening trend");
  }

  // Determine status with confidence awareness
  const conf = confidence || { level: "none" };
  let status, reason;

  if (score >= 5) {
    status = "unhealthy";
    reason = reasons.slice(0, 2).map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(" and ");
  } else if (score >= 2) {
    status = "degraded";
    reason = reasons[0] ? reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1) + " detected" : "Elevated signals detected";
  } else if (conf.level === "none") {
    status = "unknown";
    reason = "No traffic observed yet";
  } else if (conf.level === "low") {
    status = "healthy";
    reason = p95 != null
      ? `Latency at ${p95}ms, within thresholds (low confidence)`
      : "No issues observed (low confidence)";
  } else {
    status = "healthy";
    if (trend && trend.direction === "stable" && p95 != null) {
      reason = `Latency stable at ~${trend.current}ms, no issues detected`;
    } else if (trend && trend.direction === "decreasing") {
      reason = `Latency improving (${trend.changePct}%), all signals nominal`;
    } else if (p95 != null) {
      reason = p95 < 400 ? "All signals nominal" : `Latency at ${p95}ms, within thresholds`;
    } else {
      reason = errorCount === 0 ? "No issues detected" : "Monitoring";
    }
  }

  return { status, reason, score };
}

// ─── Insights engine ───────────────────────────────────────────────────────────
// Analytical, not descriptive. Interprets signals, doesn't repeat them.
// Max 4 insights, sorted by importance.
export function deriveInsights({ p95, errorCount, errorRate, vitals, failedRequests, latencyTimeline, userFlow, confidence, totalRequests }) {
  const insights = [];
  const add = (sev, msg) => insights.push({ severity: sev, message: msg });
  const trend = computeBaseline(latencyTimeline);
  const conf = confidence || { level: "none" };

  // ── No-data / low-data scenarios (prioritized first) ──
  if (conf.level === "none") {
    add("info", "No traffic detected in the selected time window. Latency, error rate, and throughput metrics are currently unavailable.");
    return insights;
  }

  if (conf.level === "low") {
    add("info", "Traffic volume is low (fewer than 5 requests). Latency and error metrics may not be statistically representative.");
  }

  // ── Correlation: latency + errors ──
  const p95High = p95 != null && p95 >= THRESHOLDS.p95Latency.warning;
  const errHigh = errorRate != null ? errorRate >= THRESHOLDS.errorRatePct.warning : errorCount >= 3;

  if (p95High && errHigh) {
    add("critical", "Latency and error rate are both elevated, suggesting upstream degradation or resource contention");
  } else if (p95High) {
    add("warning", p95 >= THRESHOLDS.p95Latency.critical
      ? "Request latency has crossed the critical threshold. Users are likely experiencing noticeable delays."
      : "Request latency is elevated above the warning threshold, which may slow page transitions.");
  } else if (errHigh) {
    const rateStr = errorRate != null ? `${errorRate}%` : `${errorCount} errors`;
    add("warning", `Error rate at ${rateStr}. Some user interactions may be failing silently.`);
  }

  // ── Latency trend ──
  if (trend && trend.direction === "increasing" && trend.changePct > 20) {
    add("warning", `Latency trending upward (+${trend.changePct}%) from ${trend.baseline}ms baseline to ${trend.current}ms. Monitor for continued degradation.`);
  } else if (trend && trend.direction === "decreasing" && trend.changePct < -20) {
    add("info", `Latency recovering (${trend.changePct}%) from ${trend.baseline}ms to ${trend.current}ms.`);
  }

  // ── Web Vitals interpretation ──
  if (vitals?.lcp != null) {
    if (vitals.lcp >= THRESHOLDS.lcp.critical) {
      add("critical", `LCP at ${vitals.lcp}ms indicates the page takes over ${(vitals.lcp / 1000).toFixed(1)}s to render meaningful content.`);
    } else if (vitals.lcp >= THRESHOLDS.lcp.warning) {
      add("warning", `LCP at ${vitals.lcp}ms. Page render may feel slow to users (target: under ${THRESHOLDS.lcp.warning}ms).`);
    }
  }

  if (vitals?.inp != null && vitals.inp >= THRESHOLDS.inp.warning) {
    add("warning", `INP at ${vitals.inp}ms. Interactions may feel unresponsive (target: under ${THRESHOLDS.inp.warning}ms).`);
  }

  // ── All clear ──
  if (insights.length === 0 || insights.every(i => i.severity === "info")) {
    if (conf.level !== "low") {
      add("info", "All observed signals are within normal thresholds.");
    }
  }

  const order = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 4);
}

// ─── Alerts (raw threshold signals) ────────────────────────────────────────────
export function evaluateAlerts({ p95, errorRate, errorCount, vitals, failedRequests }) {
  const alerts = [];
  const add = (msg, sev) => alerts.push({ message: msg, severity: sev });

  if (p95 != null) {
    const s = severity(p95, THRESHOLDS.p95Latency);
    if (s !== "info") add(`P95 latency: ${p95}ms`, s);
  }

  if (errorRate != null) {
    const s = severity(errorRate, THRESHOLDS.errorRatePct);
    if (s !== "info") add(`Error rate: ${errorRate}%`, s);
  } else if (errorCount >= 5) {
    add(`${errorCount} client errors`, errorCount >= 10 ? "critical" : "warning");
  }

  if (failedRequests > 0) {
    const s = severity(failedRequests, THRESHOLDS.failedRequests);
    if (s !== "info") add(`${failedRequests} failed requests`, s);
  }

  if (vitals?.lcp != null) {
    const s = severity(vitals.lcp, THRESHOLDS.lcp);
    if (s !== "info") add(`LCP: ${vitals.lcp}ms`, s);
  }

  if (vitals?.inp != null) {
    const s = severity(vitals.inp, THRESHOLDS.inp);
    if (s !== "info") add(`INP: ${vitals.inp}ms`, s);
  }

  return alerts;
}
