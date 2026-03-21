/**
 * System Observability — Dev-only backend operational dashboard.
 *
 * Compact Datadog-style view of backend behavior and health:
 *  - System Load (stacked area: requests per service)
 *  - API Reliability (line: error/success rate trends)
 *  - Latency Trends (multi-line: P50/P95 per service)
 *  - Health Check Timeline (heatmap: pass/fail over time)
 *
 * Data: 100% from Supabase monitoring tables. No browser telemetry.
 *
 * Triple-gated (DEV only).
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { fetchSystemStatus, fetchHealthCheckHistory, fetchRollupHourly, fetchRollupDaily } from "../api/monitoring";

// ─── Guard ──────────────────────────────────────────────────────────────────────
export default function SystemObservability({ onBack, lang = "en", dir = "ltr", supabase = null }) {
  if (!import.meta.env.DEV) return null;
  return <SystemObservabilityInner onBack={onBack} lang={lang} dir={dir} supabase={supabase} />;
}

// ─── Design tokens ──────────────────────────────────────────────────────────────
const MONO = "'Fira Code','Courier New',monospace";
const GREEN  = "#34d399";
const BLUE   = "#60a5fa";
const AMBER  = "#fbbf24";
const RED    = "#f87171";
const PURPLE = "#a78bfa";
const CYAN   = "#22d3ee";
const DIM    = "#64748b";

const SERVICE_COLORS = {
  "Database":       GREEN,
  "Content API":    BLUE,
  "Quiz Engine":    AMBER,
  "Leaderboard":    PURPLE,
  "Authentication": CYAN,
};

// source: "raw" = system_status_history, "hourly" = rollup_hourly, "daily" = rollup_daily
const TIME_WINDOWS = [
  { key: "30m",  label: "30m",  minutes: 30,      source: "raw" },
  { key: "1h",   label: "1h",   minutes: 60,      source: "raw" },
  { key: "6h",   label: "6h",   minutes: 360,     source: "raw" },
  { key: "24h",  label: "24h",  minutes: 1440,    source: "raw" },
  { key: "7d",   label: "7d",   hours: 168,       source: "hourly" },
  { key: "30d",  label: "30d",  hours: 720,       source: "hourly" },
  { key: "3mo",  label: "3mo",  days: 90,         source: "daily" },
  { key: "12mo", label: "12mo", days: 365,        source: "daily" },
  { key: "24mo", label: "24mo", days: 730,        source: "daily" },
];

// ─── Main component ─────────────────────────────────────────────────────────────
function SystemObservabilityInner({ onBack, supabase }) {
  const [services, setServices] = useState(null);
  const [history, setHistory] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [windowKey, setWindowKey] = useState("1h");

  const activeWindow = TIME_WINDOWS.find(w => w.key === windowKey) || TIME_WINDOWS[1];

  const loadData = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured"); return; }
    try {
      const svcPromise = fetchSystemStatus(supabase);
      let histPromise;
      if (activeWindow.source === "hourly") {
        histPromise = fetchRollupHourly(supabase, activeWindow.hours).then(rows =>
          rows.map(r => ({ service_name: r.service_name, status: r.down_checks > 0 ? "down" : r.degraded_checks > 0 ? "degraded" : "operational", latency_ms: r.avg_latency_ms, checked_at: r.bucket_hour, _rollup: r }))
        );
      } else if (activeWindow.source === "daily") {
        histPromise = fetchRollupDaily(supabase, activeWindow.days).then(rows =>
          rows.map(r => ({ service_name: r.service_name, status: r.down_checks > 0 ? "down" : r.degraded_checks > 0 ? "degraded" : "operational", latency_ms: r.avg_latency_ms, checked_at: r.bucket_day, _rollup: r }))
        );
      } else {
        histPromise = fetchHealthCheckHistory(supabase, activeWindow.minutes);
      }
      const [svc, hist] = await Promise.all([svcPromise, histPromise]);
      setServices(svc);
      setHistory(hist);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [supabase, activeWindow]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const id = setInterval(loadData, 30_000); return () => clearInterval(id); }, [loadData]);

  const refresh = useCallback(() => { setServices(null); setHistory(null); loadData(); }, [loadData]);
  const agoSec = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : null;

  // ── Derived data ──────────────────────────────────────────────────────────
  const { buckets, serviceNames } = useMemo(() => {
    if (!history || history.length === 0) return { buckets: [], serviceNames: [] };
    const names = [...new Set(history.map(h => h.service_name))];
    const BUCKET_COUNT = Math.min(24, Math.max(6, Math.floor(history.length / names.length)));
    const timestamps = history.map(h => new Date(h.checked_at).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const range = maxTs - minTs || 1;

    const result = Array.from({ length: BUCKET_COUNT }, (_, i) => {
      const bucketStart = minTs + (i / BUCKET_COUNT) * range;
      const bucketEnd = minTs + ((i + 1) / BUCKET_COUNT) * range;
      const time = new Date(bucketStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const inBucket = history.filter(h => {
        const t = new Date(h.checked_at).getTime();
        return t >= bucketStart && t < bucketEnd;
      });

      const perService = {};
      for (const name of names) {
        const svcChecks = inBucket.filter(h => h.service_name === name);
        const latencies = svcChecks.map(h => h.latency_ms).filter(l => l != null);
        const sorted = [...latencies].sort((a, b) => a - b);
        const okCount = svcChecks.filter(h => h.status === "operational").length;
        const failCount = svcChecks.filter(h => h.status === "down").length;
        perService[name] = {
          count: svcChecks.length,
          ok: okCount,
          fail: failCount,
          degraded: svcChecks.filter(h => h.status === "degraded").length,
          p50: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.5)] : null,
          p95: sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : null,
          avgLatency: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null,
          statuses: svcChecks.map(h => h.status),
        };
      }

      const totalChecks = inBucket.length;
      const totalOk = inBucket.filter(h => h.status === "operational").length;
      const totalFail = inBucket.filter(h => h.status === "down").length;

      return { time, perService, totalChecks, totalOk, totalFail, ts: bucketStart };
    });

    return { buckets: result, serviceNames: names };
  }, [history]);

  // ── Summary metrics ───────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!history || history.length === 0) return null;
    const totalChecks = history.length;
    const okChecks = history.filter(h => h.status === "operational").length;
    const failChecks = history.filter(h => h.status === "down").length;
    const latencies = history.map(h => h.latency_ms).filter(l => l != null).sort((a, b) => a - b);
    const p50 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : null;
    const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : null;
    const errorRate = totalChecks > 0 ? +((failChecks / totalChecks) * 100).toFixed(1) : 0;
    const successRate = totalChecks > 0 ? +(((okChecks) / totalChecks) * 100).toFixed(1) : 100;
    const lastCheck = services?.[0]?.last_checked ? new Date(services[0].last_checked) : null;
    const lastCheckAgo = lastCheck ? Math.round((Date.now() - lastCheck.getTime()) / 1000) : null;

    // Sparkline data (error rate per bucket)
    const errSparkline = buckets.map(b => b.totalChecks > 0 ? (b.totalFail / b.totalChecks) * 100 : 0);
    const latSparkline = buckets.map(b => {
      const lats = Object.values(b.perService).map(s => s.p95).filter(l => l != null);
      return lats.length > 0 ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : null;
    });

    return { totalChecks, okChecks, failChecks, p50, p95, errorRate, successRate, lastCheckAgo, errSparkline, latSparkline };
  }, [history, services, buckets]);

  if (!services && !error) return <Skeleton />;

  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto", padding: "12px 14px", animation: "fadeIn 0.3s ease", direction: "ltr" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
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

      {/* Time window + summary cards */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 1, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 8, padding: 2 }}>
          {TIME_WINDOWS.map(w => (
            <button key={w.key} onClick={() => setWindowKey(w.key)} style={{
              background: w.key === windowKey ? "var(--glass-10)" : "transparent",
              border: "none", color: w.key === windowKey ? "var(--text-bright)" : "var(--text-muted)",
              padding: "5px 8px", borderRadius: 5, cursor: "pointer", fontSize: 11,
              fontWeight: w.key === windowKey ? 700 : 400, transition: "all 0.15s ease",
            }}>{w.label}</button>
          ))}
        </div>
      </div>

      {error && !services ? (
        <div style={{ padding: "40px 24px", textAlign: "center", background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Could not load system data</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{error}</div>
        </div>
      ) : (
        <>
          {/* Summary metric cards with sparklines */}
          {summary && <SummaryCards summary={summary} />}

          {/* 3x2 chart grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <SystemLoadChart buckets={buckets} serviceNames={serviceNames} />
            <ApiReliabilityChart buckets={buckets} />
            <LatencyTrendsChart buckets={buckets} serviceNames={serviceNames} history={history} />
            <HealthCheckTimeline buckets={buckets} serviceNames={serviceNames} />
            <ServiceLatencyBars services={services} />
            <CheckFrequencyChart buckets={buckets} />
          </div>
        </>
      )}

      <div style={{ textAlign: "center", padding: "6px 0 2px", fontSize: 10, color: "var(--text-dim)" }}>
        Data from Supabase health checks (every 60s)
      </div>
    </div>
  );
}

// ─── Summary Cards ──────────────────────────────────────────────────────────────
function SummaryCards({ summary }) {
  const s = summary;
  const cards = [
    { label: "P95 Latency", value: s.p95 != null ? `${s.p95}ms` : "--", color: s.p95 > 5000 ? RED : s.p95 > 2000 ? AMBER : GREEN, sparkline: s.latSparkline, sparkColor: BLUE },
    { label: "Error Rate", value: `${s.errorRate}%`, color: s.errorRate > 5 ? RED : s.errorRate > 1 ? AMBER : GREEN, sparkline: s.errSparkline, sparkColor: RED },
    { label: "Total Checks", value: String(s.totalChecks), color: "var(--text-bright)" },
    { label: "Last Check", value: s.lastCheckAgo != null ? (s.lastCheckAgo < 60 ? `${s.lastCheckAgo}s ago` : `${Math.floor(s.lastCheckAgo / 60)}m ago`) : "--", color: s.lastCheckAgo != null && s.lastCheckAgo > 600 ? RED : GREEN },
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {cards.map(c => (
        <div key={c.label} style={{ flex: 1, minWidth: 100, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "8px 10px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: c.color, fontFamily: MONO, lineHeight: 1 }}>{c.value}</span>
            {c.sparkline && <Sparkline data={c.sparkline} color={c.sparkColor} width={60} height={18} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data, color, width = 60, height = 18 }) {
  const filtered = data.filter(v => v != null);
  if (filtered.length < 2) return null;
  const max = Math.max(...filtered, 0.01);
  const pts = filtered.map((v, i) => {
    const x = (i / (filtered.length - 1)) * width;
    const y = height - (v / max) * (height - 2);
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </svg>
  );
}

// ─── Section 1: System Load (stacked area) ──────────────────────────────────────
function SystemLoadChart({ buckets, serviceNames }) {
  if (buckets.length < 2) return <EmptyPanel title="System Load" />;

  const W = 300, H = 80, pad = 2;
  const maxTotal = Math.max(...buckets.map(b => b.totalChecks), 1);

  // Build stacked paths per service
  const stacks = useMemo(() => {
    const result = [];
    const cumulative = buckets.map(() => 0);
    for (const name of serviceNames) {
      const color = SERVICE_COLORS[name] || DIM;
      const topPts = buckets.map((b, i) => {
        const val = b.perService[name]?.count || 0;
        cumulative[i] += val;
        const x = pad + (i / (buckets.length - 1)) * (W - pad * 2);
        const y = H - pad - (cumulative[i] / maxTotal) * (H - pad * 2);
        return { x, y };
      });
      const bottomPts = buckets.map((b, i) => {
        const val = b.perService[name]?.count || 0;
        const x = pad + (i / (buckets.length - 1)) * (W - pad * 2);
        const y = H - pad - ((cumulative[i] - val) / maxTotal) * (H - pad * 2);
        return { x, y };
      });
      const top = topPts.map(p => `${p.x},${p.y}`).join(" L ");
      const bot = [...bottomPts].reverse().map(p => `${p.x},${p.y}`).join(" L ");
      result.push({ name, color, path: `M ${top} L ${bot} Z` });
    }
    return result;
  }, [buckets, serviceNames]);

  return (
    <Panel title="System Load" subtitle="Checks per service">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        {stacks.map(s => (
          <path key={s.name} d={s.path} fill={s.color} opacity={0.35} />
        ))}
      </svg>
      <TimeAxis first={buckets[0]?.time} last={buckets[buckets.length - 1]?.time} />
      <ServiceLegend names={serviceNames} />
    </Panel>
  );
}

// ─── Section 2: API Reliability (line chart) ────────────────────────────────────
function ApiReliabilityChart({ buckets }) {
  if (buckets.length < 2) return <EmptyPanel title="API Reliability" />;

  const W = 300, H = 80, pad = 2;
  const points = buckets.map(b => {
    const total = b.totalChecks || 1;
    return {
      success: (b.totalOk / total) * 100,
      error: (b.totalFail / total) * 100,
    };
  });

  const toPath = (key, max = 100) => {
    const pts = points.map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (W - pad * 2);
      const y = H - pad - (p[key] / max) * (H - pad * 2);
      return `${x},${y}`;
    });
    return "M " + pts.join(" L ");
  };

  const latestSuccess = points[points.length - 1]?.success?.toFixed(1);
  const latestError = points[points.length - 1]?.error?.toFixed(1);

  return (
    <Panel title="API Reliability" subtitle="Success vs error rate">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        {/* 100% baseline */}
        <line x1={pad} x2={W - pad} y1={pad} y2={pad} stroke={GREEN} strokeWidth={0.3} strokeDasharray="2,2" opacity={0.3} />
        <path d={toPath("success")} fill="none" stroke={GREEN} strokeWidth={1.5} strokeLinecap="round" />
        <path d={toPath("error")} fill="none" stroke={RED} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
      <TimeAxis first={buckets[0]?.time} last={buckets[buckets.length - 1]?.time} />
      <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10 }}>
        <LegendDot color={GREEN} label="Success" value={`${latestSuccess}%`} />
        <LegendDot color={RED} label="Error" value={`${latestError}%`} />
      </div>
    </Panel>
  );
}

// ─── Section 3: Latency Trends (multi-line, raw data points) ─────────────────────
function LatencyTrendsChart({ buckets, serviceNames, history }) {
  // Use raw history points instead of bucketed P95 (history is sparse - 1 point per 30min per service)
  const paths = useMemo(() => {
    if (!history || history.length === 0) return [];
    const withLatency = history.filter(h => h.latency_ms != null);
    if (withLatency.length < 2) return [];

    const timestamps = withLatency.map(h => new Date(h.checked_at).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    const range = maxTs - minTs || 1;
    const maxLat = Math.max(...withLatency.map(h => h.latency_ms), 100);

    const W = 300, H = 80, pad = 2;
    const names = [...new Set(withLatency.map(h => h.service_name))];

    return { lines: names.map(name => {
      const color = SERVICE_COLORS[name] || DIM;
      const pts = withLatency
        .filter(h => h.service_name === name)
        .map(h => {
          const t = new Date(h.checked_at).getTime();
          const x = pad + ((t - minTs) / range) * (W - pad * 2);
          const y = H - pad - (h.latency_ms / maxLat) * (H - pad * 2);
          return `${x},${y}`;
        });
      return { name, color, d: pts.length >= 2 ? "M " + pts.join(" L ") : null };
    }).filter(p => p.d), maxLat, names };
  }, [history]);

  if (!paths.lines || paths.lines.length === 0) return <EmptyPanel title="Latency Trends" />;

  const W = 300, H = 80, pad = 2;
  const thresholdY = H - pad - (2000 / paths.maxLat) * (H - pad * 2);

  return (
    <Panel title="Latency Trends" subtitle="Response time per service">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        {paths.maxLat > 2000 && <line x1={pad} x2={W - pad} y1={thresholdY} y2={thresholdY} stroke={AMBER} strokeWidth={0.3} strokeDasharray="2,2" opacity={0.4} />}
        {paths.lines.map(p => (
          <path key={p.name} d={p.d} fill="none" stroke={p.color} strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
        ))}
      </svg>
      <TimeAxis first={buckets[0]?.time} last={buckets[buckets.length - 1]?.time} />
      <ServiceLegend names={paths.names} />
    </Panel>
  );
}

// ─── Section 5: Service Latency Bars (current snapshot) ──────────────────────────
function ServiceLatencyBars({ services }) {
  const svcWithLatency = (services || []).filter(s => s.latency_ms != null);
  if (svcWithLatency.length === 0) return <EmptyPanel title="Current Latency" />;

  const maxLat = Math.max(...svcWithLatency.map(s => s.latency_ms), 1);
  const sorted = [...svcWithLatency].sort((a, b) => b.latency_ms - a.latency_ms);

  return (
    <Panel title="Current Latency" subtitle="Latest health check response time">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map(svc => {
          const pct = (svc.latency_ms / maxLat) * 100;
          const color = SERVICE_COLORS[svc.service_name] || DIM;
          const barBg = svc.latency_ms > 5000 ? RED : svc.latency_ms > 2000 ? AMBER : color;
          return (
            <div key={svc.service_name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 65, fontSize: 10, fontFamily: MONO, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
                {svc.service_name.replace("Authentication", "Auth").replace("Content API", "API")}
              </span>
              <div style={{ flex: 1, height: 14, background: "var(--glass-3)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.max(pct, 4)}%`, height: "100%", background: barBg, borderRadius: 3, opacity: 0.7, transition: "width 0.4s ease" }} />
              </div>
              <span style={{ width: 55, fontSize: 11, fontFamily: MONO, color: barBg, textAlign: "right", flexShrink: 0, fontWeight: 600 }}>
                {svc.latency_ms >= 1000 ? `${(svc.latency_ms / 1000).toFixed(1)}s` : `${svc.latency_ms}ms`}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── Section 6: Check Frequency (area chart) ────────────────────────────────────
function CheckFrequencyChart({ buckets }) {
  if (buckets.length < 2) return <EmptyPanel title="Check Frequency" />;

  const W = 300, H = 80, pad = 2;
  const maxChecks = Math.max(...buckets.map(b => b.totalChecks), 1);

  const pts = buckets.map((b, i) => {
    const x = pad + (i / (buckets.length - 1)) * (W - pad * 2);
    const y = H - pad - (b.totalChecks / maxChecks) * (H - pad * 2);
    return { x, y, checks: b.totalChecks };
  });
  const linePath = "M " + pts.map(p => `${p.x},${p.y}`).join(" L ");
  const fillPath = `${linePath} L ${pts[pts.length - 1].x},${H - pad} L ${pts[0].x},${H - pad} Z`;

  const totalChecks = buckets.reduce((s, b) => s + b.totalChecks, 0);
  const avg = (totalChecks / buckets.length).toFixed(1);

  return (
    <Panel title="Check Frequency" subtitle={`${totalChecks} total checks, avg ${avg}/window`}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="freqGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={PURPLE} stopOpacity="0.2" />
            <stop offset="100%" stopColor={PURPLE} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#freqGrad)" />
        <path d={linePath} fill="none" stroke={PURPLE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <TimeAxis first={buckets[0]?.time} last={buckets[buckets.length - 1]?.time} />
    </Panel>
  );
}

// ─── Section 4: Health Check Timeline (heatmap) ─────────────────────────────────
function HealthCheckTimeline({ buckets, serviceNames }) {
  if (buckets.length < 2 || serviceNames.length === 0) return <EmptyPanel title="Health Check Timeline" />;

  const cellW = Math.max(8, Math.floor(240 / buckets.length));

  return (
    <Panel title="Health Check Timeline" subtitle="Status per check window">
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {serviceNames.map(name => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 60, fontSize: 9, color: "var(--text-muted)", fontFamily: MONO, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
              {name.replace("Authentication", "Auth").replace("Content API", "API")}
            </span>
            <div style={{ display: "flex", gap: 1, flex: 1 }}>
              {buckets.map((b, i) => {
                const svc = b.perService[name];
                if (!svc || svc.count === 0) return <div key={i} style={{ width: cellW, height: 16, background: "var(--glass-3)", borderRadius: 2 }} />;
                const allOk = svc.fail === 0 && svc.degraded === 0;
                const hasFail = svc.fail > 0;
                const color = hasFail ? RED : allOk ? GREEN : AMBER;
                return (
                  <div key={i} style={{ width: cellW, height: 16, background: color, borderRadius: 2, opacity: 0.75 }}
                    title={`${name} @ ${b.time}: ${svc.ok} ok, ${svc.fail} fail, ${svc.degraded} degraded`} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <TimeAxis first={buckets[0]?.time} last={buckets[buckets.length - 1]?.time} />
      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 9 }}>
        <LegendDot color={GREEN} label="OK" />
        <LegendDot color={AMBER} label="Degraded" />
        <LegendDot color={RED} label="Down" />
      </div>
    </Panel>
  );
}

// ─── Shared primitives ──────────────────────────────────────────────────────────
function Panel({ title, subtitle, children }) {
  return (
    <div style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: 0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 1 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function EmptyPanel({ title }) {
  return (
    <Panel title={title} subtitle="No data in this window">
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 11 }}>
        Waiting for health check data...
      </div>
    </Panel>
  );
}

function TimeAxis({ first, last }) {
  if (!first || !last) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 8, color: "var(--text-dim)" }}>
      <span>{first}</span>
      <span>{last}</span>
    </div>
  );
}

function ServiceLegend({ names }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 9, flexWrap: "wrap" }}>
      {names.map(name => (
        <LegendDot key={name} color={SERVICE_COLORS[name] || DIM} label={name.replace("Authentication", "Auth").replace("Content API", "API")} />
      ))}
    </div>
  );
}

function LegendDot({ color, label, value }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: color, opacity: 0.8, flexShrink: 0 }} />
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      {value && <span style={{ color, fontFamily: MONO, fontWeight: 600 }}>{value}</span>}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 900, margin: "0 auto", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, background: "var(--glass-3)", borderRadius: 8 }} />
        <div style={{ width: 200, height: 22, background: "var(--glass-3)", borderRadius: 6 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 56, background: "var(--glass-2)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 180, background: "var(--glass-2)", borderRadius: 10, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.12}s` }} />)}
      </div>
    </div>
  );
}
