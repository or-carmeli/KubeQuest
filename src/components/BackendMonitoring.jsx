/**
 * Backend Monitoring — Infrastructure Insights dashboard.
 *
 * Production-grade observability console:
 *  - System health indicator (Healthy / Degraded / Critical)
 *  - 6 metric tiles with sparklines + delta indicators
 *  - API Request Rate (primary chart, full width, with error dot overlay)
 *  - DB Query Latency + DB Active Connections (side by side)
 *  - Connection Utilization (compact, reduced weight)
 *
 * Dev-only, triple-gated. All text English. Layout always LTR.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ArrowLeft, AlertTriangle, RefreshCw, Database, Activity,
  Server, Clock, Zap, HardDrive, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import {
  fetchServiceHealth, fetchDbLatencyHistory,
  fetchInfraSnapshots, extractInfraSeries,
  STATUS_COLORS, TIME_WINDOWS,
} from "../utils/backendMetrics";

// ─── Guard ───────────────────────────────────────────────────────────────────

export default function BackendMonitoring({ onBack, lang = "en", dir = "ltr", supabase = null }) {
  if (!import.meta.env.DEV) return null;
  return <BackendMonitoringInner onBack={onBack} dir={dir} supabase={supabase} />;
}

// ─── Responsive CSS (injected once) ──────────────────────────────────────────

const RESPONSIVE_CSS_ID = "bm-responsive-css";
function injectResponsiveCSS() {
  if (document.getElementById(RESPONSIVE_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = RESPONSIVE_CSS_ID;
  style.textContent = `
    @media (max-width: 700px) {
      .bm-metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
      .bm-charts-pair { grid-template-columns: 1fr !important; }
      .bm-header-title { font-size: 13px !important; }
      .bm-header-extras { display: none !important; }
      .bm-time-range { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .bm-outer { height: auto !important; min-height: 100vh !important; overflow: auto !important; }
    }
    @media (max-width: 480px) {
      .bm-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `;
  document.head.appendChild(style);
}

// ─── Design tokens ───────────────────────────────────────────────────────────

const MONO = "'Fira Code','Courier New',monospace";
const GREEN  = "#34d399";
const BLUE   = "#60a5fa";
const AMBER  = "#fbbf24";
const RED    = "#f87171";
const PURPLE = "#a78bfa";
const CYAN   = "#22d3ee";

// ─── System health derivation ────────────────────────────────────────────────

// Health check latency thresholds are higher than user-facing thresholds
// because Supabase edge function → DB round-trips include cold start overhead.
function deriveHealth(errorRate, dbLatency) {
  if ((errorRate != null && errorRate > 5) || (dbLatency != null && dbLatency > 5000))
    return { label: "Critical", color: RED };
  if ((errorRate != null && errorRate > 2) || (dbLatency != null && dbLatency > 2000))
    return { label: "Degraded", color: AMBER };
  if (errorRate != null || dbLatency != null)
    return { label: "Healthy", color: GREEN };
  return { label: "Unknown", color: "#64748b" };
}

// ─── Delta computation ───────────────────────────────────────────────────────

function computeDelta(sparkValues) {
  if (!sparkValues || sparkValues.length < 2) return null;
  const curr = sparkValues[sparkValues.length - 1];
  const prev = sparkValues[0];
  const diff = curr - prev;
  if (Math.abs(diff) < 0.01) return { dir: "flat", text: "stable" };
  const sign = diff > 0 ? "+" : "";
  return { dir: diff > 0 ? "up" : "down", text: `${sign}${Number.isInteger(diff) ? diff : diff.toFixed(1)}` };
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function EmptyState({ title, message }) {
  return (
    <div style={{ padding: "28px 24px", textAlign: "center", background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>{message}</div>
    </div>
  );
}

// ─── Metric tile with sparkline + delta ──────────────────────────────────────

function MiniSparkline({ values, color, width = 40, height = 14 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 1 - ((v - min) / range) * (height - 2)}`).join(" ");
  return <svg width={width} height={height} style={{ display: "block", flexShrink: 0 }}><polyline points={pts} fill="none" stroke={color || "var(--glass-15)"} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MetricTile({ icon: Icon, label, value, unit, sub, subColor, statusColor, sparkValues, sparkColor }) {
  const delta = useMemo(() => computeDelta(sparkValues), [sparkValues]);
  const DeltaIcon = delta?.dir === "up" ? TrendingUp : delta?.dir === "down" ? TrendingDown : Minus;
  return (
    <div style={{ flex: 1, minWidth: 100, background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
        <Icon size={11} strokeWidth={1.5} style={{ color: "var(--text-dim)", opacity: 0.6, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: MONO, color: statusColor || "var(--text-bright)", lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{unit}</span>}
        </div>
        <MiniSparkline values={sparkValues} color={sparkColor || statusColor || "var(--glass-15)"} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, minHeight: 13 }}>
        {delta && delta.dir !== "flat" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, color: "var(--text-dim)", fontFamily: MONO }}>
            <DeltaIcon size={9} strokeWidth={2} />
            {delta.text}
          </span>
        )}
        {sub && <span style={{ fontSize: 9, color: subColor || "var(--text-dim)" }}>{sub}</span>}
      </div>
    </div>
  );
}

// ─── Primary chart (API Request Rate with error overlay) ─────────────────────

function PrimaryChart({ requestSeries, errorSeries, fill }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !requestSeries || requestSeries.length < 2) return;
    const W = 600, padX = 6;
    const stp = (W - padX * 2) / Math.max(requestSeries.length - 1, 1);
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((x - padX) / stp);
    if (idx >= 0 && idx < requestSeries.length) setHoverIdx(idx);
    else setHoverIdx(null);
  }, [requestSeries]);
  // Must be called before early return (Rules of Hooks)
  const errorByTs = useMemo(() => {
    const map = {};
    if (errorSeries) for (const e of errorSeries) map[e.ts] = e.value;
    return map;
  }, [errorSeries]);

  if (!requestSeries || requestSeries.length < 2) {
    return <div style={{ background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 8, padding: "16px", textAlign: "center", ...(fill ? { flex: 1 } : {}) }}><div style={{ fontSize: 11, color: "var(--text-dim)" }}>No request rate data yet</div></div>;
  }

  const values = requestSeries.map(s => s.value);
  const min = 0;
  const max = Math.max(...values) * 1.15 || 1;
  const range = max - min || 1;
  const W = 600, H = 80, padX = 6, padY = 4;
  const cW = W - padX * 2;

  const points = requestSeries.map((s, i) => ({
    x: padX + (i / (requestSeries.length - 1)) * cW,
    y: H - padY - ((s.value - min) / range) * (H - padY * 2),
    value: s.value, ts: s.ts,
    errorRate: errorByTs[s.ts] ?? null,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = `${pathD} L ${points[points.length - 1].x} ${H} L ${padX} ${H} Z`;

  const isLong = (requestSeries[requestSeries.length - 1].ts - requestSeries[0].ts) > 86400_000;
  const fmt = (ts) => { const d = new Date(ts); return isLong ? d.toLocaleDateString([], { month: "short", day: "numeric" }) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  const firstLabel = fmt(requestSeries[0].ts), lastLabel = fmt(requestSeries[requestSeries.length - 1].ts);
  const midLabel = requestSeries.length > 4 ? fmt(requestSeries[Math.floor(requestSeries.length / 2)].ts) : null;
  const latest = values[values.length - 1], avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const hp = hoverIdx !== null && hoverIdx < points.length ? points[hoverIdx] : null;
  const hasError = hp && hp.errorRate != null && hp.errorRate > 0;
  const TT_W = hasError ? 150 : 120, TT_H = hasError ? 52 : 36;
  const ttX = hp ? Math.max(padX, Math.min(hp.x - TT_W / 2, W - TT_W - 2)) : 0;
  const ttY = hp ? (hp.y > TT_H + 10 ? hp.y - TT_H - 6 : hp.y + 10) : 0;

  // Delta from previous point
  const prevVal = hp && hoverIdx > 0 ? points[hoverIdx - 1].value : null;
  const delta = hp && prevVal != null ? hp.value - prevVal : null;

  // Grid lines
  const gridLines = [0.25, 0.5, 0.75].map(pct => H - padY - pct * (H - padY * 2));

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 8, padding: "10px 12px", ...(fill ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } : {}) }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={fill ? "xMidYMid meet" : "none"} style={{ display: "block", cursor: "crosshair", ...(fill ? { flex: 1, minHeight: 0 } : {}) }} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}>
        <defs><linearGradient id="ig-primary" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={BLUE} stopOpacity="0.18" /><stop offset="100%" stopColor={BLUE} stopOpacity="0.01" /></linearGradient></defs>

        {/* Grid lines */}
        {gridLines.map((y, i) => <line key={i} x1={padX} y1={y} x2={W - padX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />)}

        <path d={fillD} fill="url(#ig-primary)" />
        <path d={pathD} fill="none" stroke={BLUE} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={BLUE} stroke="var(--glass-2)" strokeWidth={1.5} />

        {/* Error dot overlay */}
        {points.map((p, i) => {
          const er = p.errorRate;
          if (er == null || er <= 0) return null;
          return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={RED} opacity={0.8} />;
        })}

        {/* Hover */}
        {hp && <g style={{ pointerEvents: "none" }}>
          <line x1={hp.x} y1={padY} x2={hp.x} y2={H - padY} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <circle cx={hp.x} cy={hp.y} r={4} fill={BLUE} stroke="#fff" strokeWidth={1.5} />
          <rect x={ttX} y={ttY} width={TT_W} height={TT_H} rx={5} fill="#1a1a1a" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <text x={ttX + 10} y={ttY + 13} fill="#a1a1a1" fontSize={9} fontFamily={MONO}>requests</text>
          <text x={ttX + TT_W - 10} y={ttY + 13} textAnchor="end" fill="#ededed" fontSize={10} fontWeight={700} fontFamily={MONO}>{Math.round(hp.value)}</text>
          <text x={ttX + 10} y={ttY + 27} fill="#64748b" fontSize={8} fontFamily={MONO}>{fmt(hp.ts)}{delta != null ? ` (${delta >= 0 ? "+" : ""}${Math.round(delta)})` : ""}</text>
          {hasError && <>
            <text x={ttX + 10} y={ttY + 42} fill={RED} fontSize={9} fontFamily={MONO}>error rate</text>
            <text x={ttX + TT_W - 10} y={ttY + 42} textAnchor="end" fill={RED} fontSize={10} fontWeight={700} fontFamily={MONO}>{hp.errorRate.toFixed(1)}%</text>
          </>}
        </g>}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}><span>{firstLabel}</span>{midLabel && <span>{midLabel}</span>}<span>{lastLabel}</span></div>
      <div style={{ display: "flex", gap: 12, marginTop: 4, paddingTop: 4, borderTop: "1px solid var(--glass-3)", fontSize: 10, flexShrink: 0 }}>
        <span style={{ color: "var(--text-muted)" }}>Latest <span style={{ color: BLUE, fontFamily: MONO, fontWeight: 600 }}>{Math.round(latest)}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{avg}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Points <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{values.length}</span></span>
      </div>
    </div>
  );
}

// ─── Secondary chart (DB latency, connections, utilization) ──────────────────

function InfraLineChart({ series, color, unit, label, thresholds, compact, fill }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current || !series || series.length < 2) return;
    const W = 600, padX = 6;
    const stp = (W - padX * 2) / Math.max(series.length - 1, 1);
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((x - padX) / stp);
    if (idx >= 0 && idx < series.length) setHoverIdx(idx);
    else setHoverIdx(null);
  }, [series]);

  if (!series || series.length < 2) {
    return <div style={{ background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 8, padding: compact ? "12px" : "16px", textAlign: "center", ...(fill ? { flex: 1 } : {}) }}><div style={{ fontSize: 11, color: "var(--text-dim)" }}>No {label || "data"} yet</div></div>;
  }

  const values = series.map(s => s.value);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.15 || 1;
  const range = max - min || 1;
  const W = 600, H = compact ? 55 : 70, padX = 6, padY = 4;
  const cW = W - padX * 2;
  const points = series.map((s, i) => ({ x: padX + (i / (series.length - 1)) * cW, y: H - padY - ((s.value - min) / range) * (H - padY * 2), value: s.value, ts: s.ts }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillD = `${pathD} L ${points[points.length - 1].x} ${H} L ${padX} ${H} Z`;
  const isLong = (series[series.length - 1].ts - series[0].ts) > 86400_000;
  const fmt = (ts) => { const d = new Date(ts); return isLong ? d.toLocaleDateString([], { month: "short", day: "numeric" }) : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  const firstLabel = fmt(series[0].ts), lastLabel = fmt(series[series.length - 1].ts);
  const midLabel = series.length > 4 ? fmt(series[Math.floor(series.length / 2)].ts) : null;
  const latest = values[values.length - 1], avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const hp = hoverIdx !== null && hoverIdx < points.length ? points[hoverIdx] : null;

  // Check if hovered value exceeds threshold
  const hpThresholdWarn = hp && thresholds ? thresholds.find(t => hp.value >= t.value) : null;

  const TT_W = 120, TT_H = hpThresholdWarn ? 48 : 36;
  const ttX = hp ? Math.max(padX, Math.min(hp.x - TT_W / 2, W - TT_W - 2)) : 0;
  const ttY = hp ? (hp.y > TT_H + 10 ? hp.y - TT_H - 6 : hp.y + 10) : 0;

  // Grid lines
  const gridLines = [0.25, 0.5, 0.75].map(pct => H - padY - pct * (H - padY * 2));

  const fillOpacity = compact ? 0.08 : 0.15;

  return (
    <div style={{ background: "var(--glass-2)", borderRadius: 8, padding: compact ? "8px 10px" : "10px 12px", ...(fill ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } : {}) }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={fill ? "xMidYMid meet" : "none"} style={{ display: "block", cursor: "crosshair", ...(fill ? { flex: 1, minHeight: 0 } : {}) }} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}>
        <defs><linearGradient id={`ig-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={fillOpacity} /><stop offset="100%" stopColor={color} stopOpacity="0.01" /></linearGradient></defs>

        {gridLines.map((y, i) => <line key={i} x1={padX} y1={y} x2={W - padX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />)}

        {thresholds?.map((th, i) => { const y = H - padY - ((th.value - min) / range) * (H - padY * 2); if (y < 0 || y > H) return null; return <g key={i}><line x1={padX} y1={y} x2={W - padX} y2={y} stroke={th.color} strokeWidth={1} strokeDasharray="4,4" opacity={0.3} /><text x={W - padX - 4} y={y - 2} textAnchor="end" fontSize={7} fill={th.color} opacity={0.6} fontFamily={MONO}>{th.label}</text></g>; })}
        <path d={fillD} fill={`url(#ig-${color.replace("#", "")})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} stroke="var(--glass-2)" strokeWidth={1.5} />
        {hp && <g style={{ pointerEvents: "none" }}>
          <line x1={hp.x} y1={padY} x2={hp.x} y2={H - padY} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          <circle cx={hp.x} cy={hp.y} r={3.5} fill={hpThresholdWarn ? hpThresholdWarn.color : color} stroke="#fff" strokeWidth={1.5} />
          <rect x={ttX} y={ttY} width={TT_W} height={TT_H} rx={5} fill="#1a1a1a" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <text x={ttX + TT_W / 2} y={ttY + 14} textAnchor="middle" fill="#ededed" fontSize={10} fontWeight={700} fontFamily={MONO}>{typeof hp.value === "number" ? (Number.isInteger(hp.value) ? hp.value : hp.value.toFixed(2)) : hp.value}{unit || ""}</text>
          <text x={ttX + TT_W / 2} y={ttY + 28} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily={MONO}>{fmt(hp.ts)}</text>
          {hpThresholdWarn && <text x={ttX + TT_W / 2} y={ttY + 42} textAnchor="middle" fill={hpThresholdWarn.color} fontSize={8} fontWeight={600} fontFamily={MONO}>{hpThresholdWarn.label}</text>}
        </g>}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}><span>{firstLabel}</span>{midLabel && <span>{midLabel}</span>}<span>{lastLabel}</span></div>
      <div style={{ display: "flex", gap: 12, marginTop: 4, paddingTop: 4, borderTop: "1px solid var(--glass-3)", fontSize: 10, flexShrink: 0 }}>
        <span style={{ color: "var(--text-muted)" }}>Latest <span style={{ color, fontFamily: MONO, fontWeight: 600 }}>{Math.round(latest)}{unit || ""}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Avg <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{avg}{unit || ""}</span></span>
        <span style={{ color: "var(--text-muted)" }}>Points <span style={{ color: "var(--text-primary)", fontFamily: MONO, fontWeight: 600 }}>{values.length}</span></span>
      </div>
    </div>
  );
}

// ─── Chart panel ─────────────────────────────────────────────────────────────

function ChartPanel({ title, children, fill }) {
  return (
    <div style={fill ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } : undefined}>
      <div style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4, flexShrink: 0 }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtBytes(bytes) {
  if (bytes == null) return "--";
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function Skeleton() {
  return (
    <div className="page-pad" style={{ maxWidth: 960, margin: "0 auto", padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><div style={{ width: 36, height: 36, background: "var(--glass-3)", borderRadius: 8 }} /><div style={{ width: 200, height: 22, background: "var(--glass-3)", borderRadius: 6 }} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 10 }}>{[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 56, background: "var(--glass-2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />)}</div>
      <div style={{ height: 100, background: "var(--glass-2)", borderRadius: 8, marginBottom: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: "0.5s" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{[1,2].map(i => <div key={i} style={{ height: 90, background: "var(--glass-2)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1 + 0.6}s` }} />)}</div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

function BackendMonitoringInner({ onBack, dir, supabase }) {
  const [services, setServices] = useState(null);
  const [dbLatency, setDbLatency] = useState([]);
  const [infraSnap, setInfraSnap] = useState({ latest: null, series: [] });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [windowKey, setWindowKey] = useState("1h");

  useEffect(() => { injectResponsiveCSS(); }, []);

  const loadData = useCallback(async () => {
    const [svcs, dbL, infra] = await Promise.all([
      fetchServiceHealth(supabase),
      fetchDbLatencyHistory(supabase, windowKey),
      fetchInfraSnapshots(supabase, windowKey),
    ]);
    setServices(svcs); setDbLatency(dbL); setInfraSnap(infra);
    setLastUpdated(new Date());
  }, [supabase, windowKey]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const id = setInterval(loadData, 30_000); return () => clearInterval(id); }, [loadData]);

  const refresh = useCallback(() => { setServices(null); loadData(); }, [loadData]);
  const agoSec = lastUpdated ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : null;

  const dbService = useMemo(() => (services || []).find(s => s.name === "Database"), [services]);
  const infraSeries = useMemo(() => extractInfraSeries(infraSnap.series), [infraSnap.series]);
  const il = infraSnap.latest;
  const hasData = dbLatency.length > 1 || il != null || (services && services.length > 0);

  // All values from production data
  const connActive = il?.db_connections_active;
  const connMax = il?.db_max_connections;
  const connPct = connActive != null && connMax ? Math.round((connActive / connMax) * 100) : null;
  const dbLat = dbService?.latency;
  const apiReq5m = il?.api_requests_5m;
  const apiErr5m = il?.api_errors_5m;
  const healthOk = il?.health_checks_ok;
  const healthTotal = il?.health_checks_total;
  const errRate = healthTotal > 0 ? +((apiErr5m / healthTotal) * 100).toFixed(1) : null;
  const health = useMemo(() => deriveHealth(errRate, dbLat), [errRate, dbLat]);

  if (services === null) return <Skeleton />;

  return (
    <div className="page-pad bm-outer" style={{ maxWidth: 960, margin: "0 auto", padding: "10px 14px", animation: "fadeIn 0.3s ease", direction: "ltr", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header with health indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexShrink: 0 }}>
        <button className="back-btn" onClick={onBack} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-secondary)", padding: "6px 8px", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", order: dir === "rtl" ? 99 : 0 }}>
          <ArrowLeft size={15} style={dir === "rtl" ? { transform: "scaleX(-1)" } : undefined} />
        </button>
        <Server size={16} strokeWidth={1.5} style={{ color: "#a78bfa", opacity: 0.7 }} />
        <span className="bm-header-title" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-bright)", letterSpacing: -0.2 }}>Infrastructure Insights</span>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", padding: "1px 6px", borderRadius: 4, background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>DEV</span>

        {/* System health badge */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: health.color, marginLeft: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: health.color, boxShadow: `0 0 5px ${health.color}66` }} />
          {health.label}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {agoSec != null && <span className="bm-header-extras" style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 500 }}>updated {agoSec}s ago</span>}
          <button onClick={refresh} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-6)", color: "var(--text-muted)", padding: "4px 7px", borderRadius: 5, cursor: "pointer", display: "flex", alignItems: "center" }} title="Refresh"><RefreshCw size={11} /></button>
        </div>
      </div>

      {/* Time range */}
      <div className="bm-time-range" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 1, background: "var(--glass-2)", border: "1px solid var(--glass-4)", borderRadius: 6, padding: 2 }}>
          {TIME_WINDOWS.map(w => (
            <button key={w.key} onClick={() => setWindowKey(w.key)} style={{ background: w.key === windowKey ? "var(--glass-10)" : "transparent", border: "none", color: w.key === windowKey ? "var(--text-bright)" : "var(--text-muted)", padding: "3px 7px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: w.key === windowKey ? 700 : 400, transition: "all 0.15s ease" }}>{w.label}</button>
          ))}
        </div>
      </div>

      {!supabase ? (
        <EmptyState title="Supabase not configured" message="Backend metrics require a Supabase connection." />
      ) : !hasData ? (
        <EmptyState title="No infrastructure data available" message="Metrics will appear once the collect-metrics edge function runs." />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>

          {/* Row 1: 6 metric tiles */}
          <div className="bm-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, flexShrink: 0 }}>
            <MetricTile icon={Database} label="DB Connections" value={connActive != null ? String(connActive) : "--"} sub={connPct != null ? `${connPct}% of ${connMax}` : null} statusColor={connPct != null ? (connPct > 80 ? RED : connPct > 50 ? AMBER : GREEN) : undefined} sparkValues={infraSeries.connections.slice(-12).map(d => d.value)} sparkColor={PURPLE} />
            <MetricTile icon={Activity} label="API Req / 5m" value={apiReq5m != null ? String(apiReq5m) : "--"} sub={il?.active_sessions_5m != null ? `${il.active_sessions_5m} sessions` : null} sparkValues={infraSeries.apiRequests.slice(-12).map(d => d.value)} sparkColor={BLUE} />
            <MetricTile icon={AlertTriangle} label="Service Errors" value={apiErr5m != null ? String(apiErr5m) : "--"} sub={healthOk != null ? `${healthOk}/${healthTotal} healthy` : null} statusColor={apiErr5m > 0 ? RED : apiErr5m != null ? GREEN : undefined} sparkValues={infraSeries.apiErrors.slice(-12).map(d => d.value)} sparkColor={RED} />
            <MetricTile icon={Clock} label="DB Latency" value={dbLat != null ? String(dbLat) : "--"} unit={dbLat != null ? "ms" : ""} statusColor={dbLat != null ? (dbLat > 5000 ? RED : dbLat > 2000 ? AMBER : GREEN) : undefined} sparkValues={dbLatency.slice(-12).map(d => d.value)} sparkColor={CYAN} />
            <MetricTile icon={Zap} label="Slow Queries" value={il?.slow_query_count != null ? String(il.slow_query_count) : "--"} statusColor={il?.slow_query_count != null ? (il.slow_query_count > 5 ? RED : il.slow_query_count > 0 ? AMBER : GREEN) : undefined} sub={il?.top_slow_query_ms ? `top: ${Math.round(il.top_slow_query_ms)}ms` : null} />
            <MetricTile icon={HardDrive} label="DB Size" value={fmtBytes(il?.db_size_bytes)} />
          </div>

          {/* Row 2: API Request Rate (full width, production data from infra_metrics) */}
          <div style={{ flex: 3, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <ChartPanel title="API Request Rate (Production)" fill>
              <PrimaryChart requestSeries={infraSeries.apiRequests} errorSeries={infraSeries.apiErrors} fill />
            </ChartPanel>
          </div>

          {/* Row 3: DB charts (side by side) */}
          <div className="bm-charts-pair" style={{ flex: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minHeight: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <ChartPanel title="DB Query Latency Trend" fill>
                <InfraLineChart series={dbLatency} color={CYAN} unit="ms" label="DB latency" fill
                  thresholds={[{ value: 500, color: AMBER, label: "Warn" }, { value: 1000, color: RED, label: "Crit" }]} />
              </ChartPanel>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <ChartPanel title="DB Active Connections" fill>
                <InfraLineChart series={infraSeries.connections} color={PURPLE} unit="" label="connections" fill />
              </ChartPanel>
            </div>
          </div>

          {/* Row 4: Connection Utilization (compact, reduced visual weight) */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <ChartPanel title="Connection Utilization" fill>
              <InfraLineChart series={infraSeries.utilization} color={PURPLE} unit="%" label="utilization" compact fill
                thresholds={[{ value: 70, color: AMBER, label: "70%" }, { value: 90, color: RED, label: "90%" }]} />
            </ChartPanel>
          </div>
        </div>
      )}
    </div>
  );
}
