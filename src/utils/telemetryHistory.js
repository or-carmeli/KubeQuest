/**
 * Telemetry History — Persistent cross-session telemetry storage.
 *
 * Periodically snapshots the current session's metrics into localStorage
 * so the Performance Insights dashboard can show historical data across
 * page reloads and sessions (Last 24 Hours / 7 Days / 30 Days).
 *
 * Does NOT modify getRealMetrics() or any telemetry collection logic.
 */

const STORAGE_KEY = "perf_insights_history";
const SNAPSHOT_INTERVAL_MS = 60_000;       // save once per minute
const MAX_AGE_MS = 30 * 24 * 60 * 60_000; // keep 30 days

// ─── Historical time ranges ──────────────────────────────────────────────────
export const HISTORICAL_RANGES = [
  { key: "24h", label: "Last 24 Hours", ms: 24 * 60 * 60_000 },
  { key: "7d",  label: "Last 7 Days",   ms: 7 * 24 * 60 * 60_000 },
  { key: "30d", label: "Last 30 Days",  ms: 30 * 24 * 60 * 60_000 },
];

// ─── Persistence ─────────────────────────────────────────────────────────────
function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRaw(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage quota exceeded — trim oldest half
    try {
      const trimmed = entries.slice(Math.floor(entries.length / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch { /* give up */ }
  }
}

// ─── Snapshot recording ──────────────────────────────────────────────────────
/**
 * Record a point-in-time snapshot from the current session.
 * Called periodically by the dashboard. Deduplicates by interval.
 */
export function recordSnapshot(real) {
  if (!real) return;

  const entries = loadRaw();
  const now = Date.now();

  // Skip if last snapshot is too recent
  if (entries.length > 0 && now - entries[entries.length - 1].ts < SNAPSHOT_INTERVAL_MS) return;

  const snap = {
    ts: now,
    vitals: {
      lcp: real.vitals?.lcp ?? null,
      inp: real.vitals?.inp ?? null,
      cls: real.vitals?.cls ?? null,
    },
    nav: real.navTiming ? {
      ttfb: real.navTiming.ttfb,
      fcp: real.navTiming.domContentLoaded,
      pageLoad: real.navTiming.pageLoad,
    } : null,
    net: {
      total: (real.network?.requests || []).length,
      failed: (real.network?.requests || []).filter(r => !r.ok).length,
      p95: computeP95(real.network?.requests || []),
    },
    errors: (real.errors?.log || []).length,
    score: computeRES(real),
  };

  entries.push(snap);

  // Trim entries older than MAX_AGE
  const cutoff = now - MAX_AGE_MS;
  const trimmed = entries.filter(e => e.ts >= cutoff);

  saveRaw(trimmed);
}

function computeP95(requests) {
  if (requests.length === 0) return null;
  const sorted = requests.map(r => r.duration).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.95)] || null;
}

// ─── Real Experience Score (RES) ─────────────────────────────────────────────
// Composite 0–100 score inspired by Vercel's Real Experience Score.
// Higher is better. Weights based on user-impact research.
const SCORE_CONFIG = [
  { key: "lcp", good: 2500, poor: 4000, weight: 25 },
  { key: "inp", good: 200,  poor: 500,  weight: 30 },
  { key: "cls", good: 0.1,  poor: 0.25, weight: 25 },
];

export function computeRES(real) {
  const vitals = real?.vitals;
  const nav = real?.navTiming;

  const metrics = [];

  for (const cfg of SCORE_CONFIG) {
    const val = vitals?.[cfg.key];
    if (val != null) metrics.push({ ...cfg, value: val });
  }
  // Add TTFB if available
  if (nav?.ttfb != null) {
    metrics.push({ key: "ttfb", good: 800, poor: 1800, weight: 20, value: nav.ttfb });
  }

  if (metrics.length === 0) return null;

  let totalWeight = 0;
  let weightedScore = 0;

  for (const m of metrics) {
    let score;
    if (m.value <= m.good) {
      score = 100;
    } else if (m.value >= m.poor * 2) {
      score = 0;
    } else if (m.value >= m.poor) {
      score = Math.max(0, 50 - ((m.value - m.poor) / m.poor) * 50);
    } else {
      score = 100 - ((m.value - m.good) / (m.poor - m.good)) * 50;
    }
    weightedScore += score * m.weight;
    totalWeight += m.weight;
  }

  return Math.round(weightedScore / totalWeight);
}

export function scoreLabel(score) {
  if (score == null) return { text: "No data", color: "#64748b" };
  if (score >= 90) return { text: "Great", color: "#34d399" };
  if (score >= 50) return { text: "Needs Improvement", color: "#fbbf24" };
  return { text: "Poor", color: "#f87171" };
}

// ─── Historical data queries ─────────────────────────────────────────────────
/**
 * Get all snapshots within a time window.
 * @param {number} windowMs - milliseconds to look back
 * @returns {Array} snapshots sorted by timestamp
 */
export function getHistory(windowMs) {
  const entries = loadRaw();
  const cutoff = Date.now() - windowMs;
  return entries.filter(e => e.ts >= cutoff).sort((a, b) => a.ts - b.ts);
}

/**
 * Aggregate historical snapshots into a summary.
 */
export function aggregateHistory(snapshots) {
  if (snapshots.length === 0) return null;

  // Use the latest non-null value for each vital
  let lcp = null, inp = null, cls = null, ttfb = null, fcp = null, pageLoad = null;
  let totalRequests = 0, totalFailed = 0, totalErrors = 0;
  const scores = [];
  const p95Values = [];

  for (const s of snapshots) {
    if (s.vitals?.lcp != null) lcp = s.vitals.lcp;
    if (s.vitals?.inp != null) inp = s.vitals.inp;
    if (s.vitals?.cls != null) cls = s.vitals.cls;
    if (s.nav?.ttfb != null) ttfb = s.nav.ttfb;
    if (s.nav?.fcp != null) fcp = s.nav.fcp;
    if (s.nav?.pageLoad != null) pageLoad = s.nav.pageLoad;
    totalRequests += s.net?.total || 0;
    totalFailed += s.net?.failed || 0;
    totalErrors += s.errors || 0;
    if (s.score != null) scores.push(s.score);
    if (s.net?.p95 != null) p95Values.push(s.net.p95);
  }

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const avgP95 = p95Values.length > 0
    ? Math.round(p95Values.reduce((a, b) => a + b, 0) / p95Values.length)
    : null;

  const errorRate = totalRequests > 0
    ? +((totalFailed / totalRequests) * 100).toFixed(1)
    : null;

  return {
    score: avgScore,
    vitals: { lcp, inp, cls },
    nav: { ttfb, fcp, pageLoad },
    totalRequests,
    totalFailed,
    totalErrors,
    errorRate,
    avgP95,
    snapshotCount: snapshots.length,
    // Time series for charts
    scoreSeries: snapshots.filter(s => s.score != null).map(s => ({ ts: s.ts, value: s.score })),
    p95Series: snapshots.filter(s => s.net?.p95 != null).map(s => ({ ts: s.ts, value: s.net.p95 })),
  };
}

// ─── Auto-recording timer ────────────────────────────────────────────────────
let _recordInterval = null;

/**
 * Start auto-recording snapshots. Returns a cleanup function.
 * @param {Function} getMetrics - function that returns getRealMetrics()
 */
export function startHistoryRecorder(getMetrics) {
  // Record immediately
  recordSnapshot(getMetrics());
  // Then every interval
  _recordInterval = setInterval(() => recordSnapshot(getMetrics()), SNAPSHOT_INTERVAL_MS);
  return () => {
    if (_recordInterval) { clearInterval(_recordInterval); _recordInterval = null; }
  };
}
