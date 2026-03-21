/**
 * System Observability — Dev-only browser runtime observability dashboard.
 *
 * Lightweight Datadog-style view of request status, API latency percentiles,
 * runtime errors, throughput, and session activity.
 *
 * Triple-gated:
 *  1. Menu item only rendered when import.meta.env.DEV
 *  2. Route only registered when import.meta.env.DEV
 *  3. Component guard below returns null in production
 *
 * Data: 100% from realTelemetry.js — no duplicate collection.
 */
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { initRealTelemetry, getRealMetrics, recordRouteChange } from "../utils/realTelemetry";
import { buildSnapshot, TIME_RANGES, computePercentiles } from "../utils/hybridTelemetry";

// ─── Guard ──────────────────────────────────────────────────────────────────────
export default function SystemObservability({ onBack, lang = "en", dir = "ltr" }) {
  if (!import.meta.env.DEV) return null;
  return <SystemObservabilityInner onBack={onBack} lang={lang} dir={dir} />;
}

// ─── Design tokens ──────────────────────────────────────────────────────────────
const MONO = "'Fira Code','Courier New',monospace";
const GREEN  = "#34d399";
const BLUE   = "#60a5fa";
const AMBER  = "#fbbf24";
const RED    = "#f87171";
const PINK   = "#f472b6";
const PURPLE = "#a78bfa";

// ─── Main component ─────────────────────────────────────────────────────────────
function SystemObservabilityInner({ onBack, lang, dir }) {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [aggWindowKey, setAggWindowKey] = useState("session");

  const activeRange = TIME_RANGES.find(r => r.key === aggWindowKey) || TIME_RANGES[TIME_RANGES.length - 1];

  useEffect(() => {
    const cleanup = initRealTelemetry();
    recordRouteChange("systemObservability");
    return cleanup;
  }, []);

  const loadSnapshot = useCallback(() => {
    const real = getRealMetrics();
    setData(buildSnapshot(real, activeRange.sec));
    setLastUpdated(new Date());
  }, [activeRange.sec]);

  useEffect(() => { const t = setTimeout(loadSnapshot, 300); return () => clearTimeout(t); }, [loadSnapshot]);
  useEffect(() => { const id = setInterval(loadSnapshot, 15_000); return () => clearInterval(id); }, [loadSnapshot]);

  const refresh = useCallback(() => { setData(null); setTimeout(loadSnapshot, 200); }, [loadSnapshot]);

  const agoSec = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : null;

  if (!data) return <Skeleton />;

  const requests = data._rawRequests || [];
  const sessionDuration = data.userFlow?.sessionDuration || 0;

  return (
    <div className="page-pad" style={{ maxWidth: 820, margin: "0 auto", padding: "12px 14px", animation: "fadeIn 0.3s ease", direction: "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button className="back-btn" onClick={onBack} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-secondary)", padding: "7px 10px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.2 }}>System Observability</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>DEV</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {agoSec != null && <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500 }}>updated {agoSec}s ago</span>}
          <button onClick={refresh} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-muted)", padding: "5px 8px", borderRadius: 6, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center" }} title="Refresh">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* Time window selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", letterSpacing: 0.5, textTransform: "uppercase", width: 60, flexShrink: 0 }}>Window</span>
        <div style={{ display: "flex", gap: 2, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 3 }}>
          {TIME_RANGES.map(r => {
            const active = r.key === aggWindowKey;
            const label = r.key === "session" ? "Full Session" : r.label;
            return (
              <button key={r.key} onClick={() => setAggWindowKey(r.key)} style={{
                background: active ? "var(--glass-10)" : "transparent",
                border: "none",
                color: active ? "var(--text-bright)" : "var(--text-muted)",
                padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12,
                fontWeight: active ? 700 : 400, transition: "all 0.15s ease",
              }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* No data state */}
      {requests.length === 0 && data.client?.unhandledErrors === 0 && data.client?.promiseRejections === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center", background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>No observability data yet</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>Interact with the app to generate network requests and runtime events.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Row 1: Summary cards */}
          <SummaryCards data={data} requests={requests} sessionDuration={sessionDuration} />

          {/* Row 2: Request Status */}
          {requests.length > 0 && <RequestStatusChart requests={requests} />}

          {/* Row 3: API Latency Percentiles */}
          {requests.length > 0 && <ApiLatencyChart requests={requests} />}

          {/* Row 4: Runtime Errors */}
          <RuntimeErrorsChart data={data} />

          {/* Row 5: Activity Chart */}
          {requests.length > 4 && <ActivityChart requests={requests} data={data} />}

          {/* Row 6: Session Activity */}
          <SessionActivitySection data={data} />

          {/* Row 7: Event Feed */}
          <EventFeed data={data} requests={requests} />
        </div>
      )}

      <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 10, color: "var(--text-dim)" }}>
        All data collected from real browser signals
      </div>
    </div>
  );
}

// ─── Summary Cards ──────────────────────────────────────────────────────────────
function SummaryCards({ data, requests, sessionDuration }) {
  const totalReqs = requests.length;
  const failedReqs = requests.filter(r => !r.ok).length;
  const errorRate = totalReqs > 0 ? +((failedReqs / totalReqs) * 100).toFixed(1) : 0;
  const rpm = sessionDuration > 0 ? +((totalReqs / sessionDuration) * 60).toFixed(1) : 0;
  const jsErrors = (data.client?.unhandledErrors || 0) + (data.client?.promiseRejections || 0);

  const latencies = requests.map(r => r.duration).sort((a, b) => a - b);
  const pctl = computePercentiles(latencies);

  const sessionMin = Math.floor(sessionDuration / 60);

  const cards = [
    { label: "Total Requests", value: String(totalReqs), color: "var(--text-bright)" },
    { label: "Error Count", value: String(failedReqs + jsErrors), color: (failedReqs + jsErrors) > 0 ? RED : GREEN },
    { label: "Error Rate", value: `${errorRate}%`, color: errorRate >= 5 ? RED : errorRate >= 2 ? AMBER : GREEN },
    { label: "P95 Latency", value: pctl.p95 != null ? `${pctl.p95}ms` : "--", color: pctl.p95 != null && pctl.p95 > 1500 ? RED : pctl.p95 != null && pctl.p95 > 800 ? AMBER : GREEN },
    { label: "Requests/min", value: String(rpm), color: BLUE },
    { label: "Session", value: sessionMin > 0 ? `${sessionMin}m` : `${sessionDuration}s`, color: PURPLE },
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {cards.map(c => (
        <div key={c.label} style={{ flex: 1, minWidth: 120, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.color, fontFamily: MONO, lineHeight: 1 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Request Status Chart ───────────────────────────────────────────────────────
function RequestStatusChart({ requests }) {
  const buckets = useMemo(() => {
    if (requests.length < 2) return [];
    const BUCKET_COUNT = Math.min(24, requests.length);
    const minTs = requests[0].ts;
    const maxTs = requests[requests.length - 1].ts;
    const range = maxTs - minTs || 1;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      time: new Date(minTs + (i / BUCKET_COUNT) * range).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      s2xx: 0, s3xx: 0, s4xx: 0, s5xx: 0,
    }));

    for (const req of requests) {
      const idx = Math.min(Math.floor(((req.ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      const s = req.status;
      if (s >= 200 && s < 300) result[idx].s2xx++;
      else if (s >= 300 && s < 400) result[idx].s3xx++;
      else if (s >= 400 && s < 500) result[idx].s4xx++;
      else if (s >= 500) result[idx].s5xx++;
      else result[idx].s2xx++; // treat missing status as success
    }
    return result;
  }, [requests]);

  if (buckets.length < 2) return null;

  const keys = ["s2xx", "s3xx", "s4xx", "s5xx"];
  const colors = [GREEN, BLUE, AMBER, RED];
  const labels = ["2xx", "3xx", "4xx", "5xx"];
  const maxTotal = Math.max(...buckets.map(b => keys.reduce((s, k) => s + b[k], 0)), 1);

  // Count totals for legend
  const totals = keys.map(k => buckets.reduce((s, b) => s + b[k], 0));

  return (
    <Section title="Request Status" subtitle={`${requests.length} requests`}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
        {buckets.map((b, i) => {
          const total = keys.reduce((s, k) => s + b[k], 0);
          const h = Math.max((total / maxTotal) * 100, 2);
          return (
            <div key={i} style={{ flex: 1, height: `${h}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 3 }} title={keys.map((k, j) => `${labels[j]}: ${b[k]}`).join(", ")}>
              {keys.map((k, j) => {
                const val = b[k];
                if (val === 0) return null;
                const segH = (val / total) * 100;
                return <div key={k} style={{ height: `${segH}%`, background: colors[j], minHeight: 2 }} />;
              })}
            </div>
          );
        })}
      </div>
      <TimeAxis buckets={buckets} />
      <Legend labels={labels} colors={colors} values={totals} />
    </Section>
  );
}

// ─── API Latency Chart ──────────────────────────────────────────────────────────
function ApiLatencyChart({ requests }) {
  const points = useMemo(() => {
    if (requests.length < 4) return [];
    const BUCKET_COUNT = Math.min(20, Math.floor(requests.length / 2));
    const minTs = requests[0].ts;
    const maxTs = requests[requests.length - 1].ts;
    const range = maxTs - minTs || 1;

    const buckets = Array.from({ length: BUCKET_COUNT }, () => []);
    for (const req of requests) {
      const idx = Math.min(Math.floor(((req.ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      buckets[idx].push(req.duration);
    }

    return buckets.map((latencies, i) => {
      const sorted = latencies.sort((a, b) => a - b);
      const time = new Date(minTs + (i / BUCKET_COUNT) * range).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (sorted.length === 0) return { time, p50: null, p95: null, p99: null };
      const p = (pct) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];
      return { time, p50: p(0.5), p95: p(0.95), p99: p(0.99) };
    });
  }, [requests]);

  if (points.length < 2) return null;

  const validPoints = points.filter(p => p.p95 != null);
  if (validPoints.length < 2) return null;

  const maxVal = Math.max(...validPoints.map(p => p.p99 ?? p.p95), 1);
  const W = 500, H = 56, pad = 2;

  const toPath = (key) => {
    const pts = points.map((p, i) => {
      if (p[key] == null) return null;
      const x = pad + (i / (points.length - 1)) * (W - pad * 2);
      const y = H - pad - (p[key] / maxVal) * (H - pad * 2);
      return `${x},${y}`;
    }).filter(Boolean);
    return "M " + pts.join(" L ");
  };

  const latest = validPoints[validPoints.length - 1];

  return (
    <Section title="API Latency Percentiles" subtitle="Browser-measured fetch/XHR timing">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <path d={toPath("p99")} fill="none" stroke={RED} strokeWidth={1} strokeLinecap="round" opacity={0.4} strokeDasharray="3,3" />
        <path d={toPath("p95")} fill="none" stroke={AMBER} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        <path d={toPath("p50")} fill="none" stroke={GREEN} strokeWidth={2} strokeLinecap="round" />
      </svg>
      <TimeAxis buckets={points} />
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 10 }}>
        <PctlLabel color={GREEN} label="P50" value={latest?.p50} />
        <PctlLabel color={AMBER} label="P95" value={latest?.p95} opacity={0.7} />
        <PctlLabel color={RED} label="P99" value={latest?.p99} opacity={0.4} dashed />
      </div>
    </Section>
  );
}

function PctlLabel({ color, label, value, opacity = 1, dashed }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ width: 12, height: 2, background: color, borderRadius: 1, opacity, ...(dashed ? { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 3px, transparent 3px, transparent 6px)`, background: "none" } : {}) }} />
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <span style={{ color, fontFamily: MONO, fontWeight: 600, opacity }}>{value != null ? `${value}ms` : "--"}</span>
    </span>
  );
}

// ─── Runtime Errors Chart ───────────────────────────────────────────────────────
function RuntimeErrorsChart({ data }) {
  const client = data?.client || {};
  const jsErrors = client.unhandledErrors || 0;
  const rejections = client.promiseRejections || 0;
  const netFails = client.failedRequests || 0;
  const total = jsErrors + rejections + netFails;

  if (total === 0) return null;

  const errorLog = client.recentErrors || [];
  const netLog = client.recentNetworkLog || [];

  // Bucket errors into time windows
  const buckets = useMemo(() => {
    const allEvents = [
      ...errorLog.map(e => ({ ts: new Date(e.timestamp).getTime(), type: e.type === "unhandledrejection" ? "rejection" : "jsError" })),
      ...netLog.filter(e => e.type === "error" || e.type === "failed").map(e => ({ ts: new Date(e.timestamp).getTime(), type: "network" })),
    ].sort((a, b) => a.ts - b.ts);

    if (allEvents.length < 2) return [];

    const BUCKET_COUNT = Math.min(16, allEvents.length);
    const minTs = allEvents[0].ts;
    const maxTs = allEvents[allEvents.length - 1].ts;
    const range = maxTs - minTs || 60_000;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
      time: new Date(minTs + (i / BUCKET_COUNT) * range).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      jsError: 0, rejection: 0, network: 0,
    }));

    for (const ev of allEvents) {
      const idx = Math.min(Math.floor(((ev.ts - minTs) / range) * BUCKET_COUNT), BUCKET_COUNT - 1);
      result[idx][ev.type]++;
    }
    return result;
  }, [errorLog, netLog]);

  const keys = ["jsError", "rejection", "network"];
  const colors = [RED, AMBER, PINK];
  const labels = ["JS Errors", "Rejections", "Network"];
  const totals = [jsErrors, rejections, netFails];

  return (
    <Section title="Runtime Errors" subtitle={`${total} total`}>
      {buckets.length >= 2 ? (
        <>
          {(() => {
            const maxTotal = Math.max(...buckets.map(b => keys.reduce((s, k) => s + b[k], 0)), 1);
            return (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 40 }}>
                {buckets.map((b, i) => {
                  const t = keys.reduce((s, k) => s + b[k], 0);
                  const h = Math.max((t / maxTotal) * 100, 2);
                  return (
                    <div key={i} style={{ flex: 1, height: `${h}%`, display: "flex", flexDirection: "column", justifyContent: "flex-end", minWidth: 3 }}>
                      {keys.map((k, j) => {
                        if (b[k] === 0) return null;
                        return <div key={k} style={{ height: `${(b[k] / t) * 100}%`, background: colors[j], minHeight: 2 }} />;
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <TimeAxis buckets={buckets} />
        </>
      ) : (
        <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
          {labels.map((l, i) => (
            <div key={l} style={{ flex: 1, background: "var(--glass-3)", borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: totals[i] > 0 ? colors[i] : "var(--text-dim)", fontFamily: MONO }}>{totals[i]}</div>
            </div>
          ))}
        </div>
      )}
      <Legend labels={labels} colors={colors} values={totals} />
    </Section>
  );
}

// ─── Session Activity ───────────────────────────────────────────────────────────
function SessionActivitySection({ data }) {
  const uf = data?.userFlow;
  if (!uf) return null;

  const sessionMin = Math.floor(uf.sessionDuration / 60);
  const sessionSec = uf.sessionDuration % 60;
  const routes = uf.routeVisits || [];

  return (
    <Section title="Session Activity" subtitle={`${sessionMin}m ${sessionSec}s`}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: routes.length > 0 ? 10 : 0 }}>
        <MiniStat label="Route Changes" value={uf.routeChanges} />
        {uf.quizStarted > 0 && <MiniStat label="Quizzes Started" value={uf.quizStarted} color={BLUE} />}
        {uf.quizCompleted > 0 && <MiniStat label="Completed" value={uf.quizCompleted} color={GREEN} />}
        {uf.retries > 0 && <MiniStat label="Retries" value={uf.retries} color={AMBER} />}
      </div>
      {routes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {routes.slice(0, 8).map(r => {
            const maxVisits = Math.max(...routes.map(x => x.visits), 1);
            const pct = (r.visits / maxVisits) * 100;
            return (
              <div key={r.route} style={{ display: "flex", alignItems: "center", gap: 8, height: 24 }}>
                <span style={{ width: 100, fontSize: 11, fontFamily: MONO, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>/{r.route}</span>
                <div style={{ flex: 1, height: 5, background: "var(--glass-3)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: PURPLE, borderRadius: 3, transition: "width 0.4s ease" }} />
                </div>
                <span style={{ width: 30, fontSize: 10, fontFamily: MONO, color: "var(--text-muted)", textAlign: "right", flexShrink: 0 }}>{r.visits}</span>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ─── Activity Chart ─────────────────────────────────────────────────────────────
function ActivityChart({ requests, data }) {
  const buckets = useMemo(() => {
    if (requests.length < 4) return [];
    const BUCKET_COUNT = Math.min(20, Math.floor(requests.length / 2));
    const minTs = requests[0].ts;
    const maxTs = requests[requests.length - 1].ts;
    const range = maxTs - minTs || 1;
    const bucketDurationSec = (range / BUCKET_COUNT) / 1000;

    return Array.from({ length: BUCKET_COUNT }, (_, i) => {
      const bucketStart = minTs + (i / BUCKET_COUNT) * range;
      const bucketEnd = minTs + ((i + 1) / BUCKET_COUNT) * range;
      const inBucket = requests.filter(r => r.ts >= bucketStart && r.ts < bucketEnd);
      return {
        time: new Date(bucketStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rpm: bucketDurationSec > 0 ? +((inBucket.length / bucketDurationSec) * 60).toFixed(1) : 0,
        count: inBucket.length,
      };
    });
  }, [requests]);

  if (buckets.length < 3) return null;

  const maxRpm = Math.max(...buckets.map(b => b.rpm), 1);
  const W = 500, H = 48, pad = 2;

  const pts = buckets.map((b, i) => {
    const x = pad + (i / (buckets.length - 1)) * (W - pad * 2);
    const y = H - pad - (b.rpm / maxRpm) * (H - pad * 2);
    return `${x},${y}`;
  });
  const pathD = "M " + pts.join(" L ");
  const fillD = `${pathD} L ${pts[pts.length - 1].split(",")[0]},${H} L ${pts[0].split(",")[0]},${H} Z`;

  const latestRpm = buckets[buckets.length - 1]?.rpm ?? 0;
  const avgRpm = +(buckets.reduce((s, b) => s + b.rpm, 0) / buckets.length).toFixed(1);

  return (
    <Section title="Activity" subtitle="Requests per minute over time">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="actGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.15" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#actGrad)" />
        <path d={pathD} fill="none" stroke={PURPLE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <TimeAxis buckets={buckets} />
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 10 }}>
        <span style={{ color: "var(--text-muted)" }}>Current <span style={{ color: PURPLE, fontFamily: MONO, fontWeight: 600 }}>{latestRpm} rpm</span></span>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-secondary)", fontFamily: MONO, fontWeight: 600 }}>{avgRpm} rpm</span></span>
        <span style={{ color: "var(--text-muted)" }}>Total <span style={{ color: "var(--text-secondary)", fontFamily: MONO, fontWeight: 600 }}>{requests.length}</span></span>
      </div>
    </Section>
  );
}

// ─── Event Feed ─────────────────────────────────────────────────────────────────
function EventFeed({ data, requests }) {
  const events = useMemo(() => {
    const ev = [];
    const now = Date.now();

    // Latency spikes (> 2x average)
    if (requests.length > 3) {
      const avg = requests.reduce((s, r) => s + r.duration, 0) / requests.length;
      const spikeThreshold = Math.max(avg * 2, 500);
      const spikes = requests.filter(r => r.duration > spikeThreshold).slice(-3);
      for (const s of spikes) {
        ev.push({ ts: s.ts, type: "spike", color: AMBER, label: `Latency spike: ${s.duration}ms`, detail: `${Math.round(s.duration / avg)}x average` });
      }
    }

    // 5xx bursts
    const s5xx = requests.filter(r => r.status >= 500);
    if (s5xx.length >= 2) {
      ev.push({ ts: s5xx[s5xx.length - 1].ts, type: "5xx", color: RED, label: `${s5xx.length} server errors (5xx)`, detail: "Request failure cluster" });
    } else if (s5xx.length === 1) {
      ev.push({ ts: s5xx[0].ts, type: "5xx", color: RED, label: "Server error (5xx)", detail: `Status ${s5xx[0].status}` });
    }

    // 4xx clusters
    const s4xx = requests.filter(r => r.status >= 400 && r.status < 500);
    if (s4xx.length >= 3) {
      ev.push({ ts: s4xx[s4xx.length - 1].ts, type: "4xx", color: AMBER, label: `${s4xx.length} client errors (4xx)`, detail: "Repeated client errors" });
    }

    // JS errors
    const jsErrors = (data?.client?.unhandledErrors || 0) + (data?.client?.promiseRejections || 0);
    if (jsErrors > 0) {
      const recentErr = data?.client?.recentErrors?.[data.client.recentErrors.length - 1];
      ev.push({ ts: recentErr ? new Date(recentErr.timestamp).getTime() : now, type: "error", color: RED, label: `${jsErrors} runtime error${jsErrors > 1 ? "s" : ""}`, detail: recentErr?.message?.slice(0, 60) || "JavaScript exception" });
    }

    // Network failures
    const netFails = data?.client?.failedRequests || 0;
    if (netFails >= 3) {
      ev.push({ ts: now - 5000, type: "netfail", color: PINK, label: `${netFails} failed requests`, detail: "Network connectivity issues" });
    }

    return ev.sort((a, b) => b.ts - a.ts).slice(0, 8);
  }, [data, requests]);

  if (events.length === 0) return null;

  return (
    <Section title="Event Feed" subtitle="Notable runtime events">
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < events.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: ev.color, flexShrink: 0, boxShadow: `0 0 4px ${ev.color}66` }} />
            <span style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: MONO, width: 50, flexShrink: 0 }}>
              {new Date(ev.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: ev.color, fontWeight: 600 }}>{ev.label}</div>
              {ev.detail && <div style={{ fontSize: 10, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Shared primitives ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: 0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function TimeAxis({ buckets }) {
  if (!buckets || buckets.length < 2) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: "var(--text-dim)" }}>
      <span>{buckets[0]?.time}</span>
      <span>{buckets[buckets.length - 1]?.time}</span>
    </div>
  );
}

function Legend({ labels, colors, values }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10 }}>
      {labels.map((l, i) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: 2, background: colors[i] }} />
          <span style={{ color: "var(--text-muted)" }}>{l}</span>
          {values && <span style={{ color: colors[i], fontFamily: MONO, fontWeight: 600 }}>{values[i]}</span>}
        </span>
      ))}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: "var(--glass-3)", borderRadius: 6, padding: "6px 10px", textAlign: "center", minWidth: 80 }}>
      <div style={{ fontSize: 9, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || "var(--text-secondary)", fontFamily: MONO, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 820, margin: "0 auto", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, background: "var(--glass-3)", borderRadius: 8 }} />
        <div style={{ width: 200, height: 22, background: "var(--glass-3)", borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 64, background: "var(--glass-2)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)}
      </div>
      {[1, 2, 3].map(i => <div key={i} style={{ height: 80, background: "var(--glass-2)", borderRadius: 10, marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />)}
    </div>
  );
}
