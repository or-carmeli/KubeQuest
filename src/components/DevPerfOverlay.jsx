/**
 * DevPerfOverlay — compact dev-only performance HUD
 *
 * Renders a small fixed panel (bottom-left) showing live web vitals,
 * API latency, JS error count, memory usage, and an overall health score.
 * Collapsed by default to a single summary badge; click to expand.
 *
 * Data comes entirely from realTelemetry.js — no duplicate collection.
 * Gated behind import.meta.env.DEV at the call-site (App.jsx).
 */
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { initRealTelemetry, getRealMetrics } from "../utils/realTelemetry";
import { THRESHOLDS } from "../utils/mockTelemetry";

// ── Thresholds (reuse existing where available) ────────────────────────────────
const T = {
  cls:  { good: THRESHOLDS.cls.warning,  poor: THRESHOLDS.cls.critical },
  lcp:  { good: THRESHOLDS.lcp.warning,  poor: THRESHOLDS.lcp.critical },
  inp:  { good: THRESHOLDS.inp.warning,  poor: THRESHOLDS.inp.critical },
  api:  { good: 300, poor: 800 },
  err:  { good: 0,   poor: 3 },
  mem:  { good: 100, poor: 300 }, // MB
};

const COLORS = {
  good: "#10B981",
  "needs-work": "#F59E0B",
  poor: "#EF4444",
  neutral: "#94A3B8",
};

function rate(value, threshold) {
  if (value == null) return null;
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-work";
  return "poor";
}

function color(rating) {
  return COLORS[rating] || COLORS.neutral;
}

// ── Formatting helpers ─────────────────────────────────────────────────────────
function fmtMs(v) { return v == null ? "--" : v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}ms`; }
function fmtCls(v) { return v == null ? "--" : v.toFixed(3); }
function fmtMem(v) { return v == null ? "--" : `${Math.round(v)}MB`; }

// ── Health score (0-100) ───────────────────────────────────────────────────────
function computeHealth(ratings) {
  const scores = { good: 100, "needs-work": 60, poor: 20 };
  const valid = ratings.filter(r => r != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, r) => sum + (scores[r] ?? 60), 0) / valid.length);
}

function healthLabel(score) {
  if (score == null) return { text: "--", rating: null };
  if (score >= 80) return { text: score, rating: "good" };
  if (score >= 50) return { text: score, rating: "needs-work" };
  return { text: score, rating: "poor" };
}

// ── Memory helper ──────────────────────────────────────────────────────────────
function getMemoryMB() {
  try {
    const mem = performance?.memory;
    if (mem) return +(mem.usedJSHeapSize / 1048576).toFixed(1);
  } catch { /* not available */ }
  return null;
}

// ── Metric row ─────────────────────────────────────────────────────────────────
function Row({ label, value, rating }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
      <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 500 }}>{label}</span>
      <span style={{ color: color(rating), fontSize: 12, fontWeight: 600, fontFamily: '"SF Mono","Fira Code",monospace' }}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function DevPerfOverlay() {
  const [expanded, setExpanded] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const cleanupRef = useRef(null);
  const intervalRef = useRef(null);

  // Init telemetry once (idempotent — realTelemetry guards against double-init)
  useEffect(() => {
    cleanupRef.current = initRealTelemetry();
    return () => { cleanupRef.current?.(); };
  }, []);

  // Poll metrics at a relaxed interval to avoid excessive re-renders
  const poll = useCallback(() => {
    const raw = getRealMetrics();
    const reqs = raw.network.requests;
    const recent = reqs.filter(r => r.ts > Date.now() - 120_000); // last 2 min
    const avgApi = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.duration, 0) / recent.length) : null;
    const mem = getMemoryMB();

    setMetrics({
      cls:    raw.vitals.cls,
      lcp:    raw.vitals.lcp,
      inp:    raw.vitals.inp,
      api:    avgApi,
      errors: raw.errors.log.length,
      mem,
    });
  }, []);

  useEffect(() => {
    // Initial poll after a short delay (let vitals settle)
    const t = setTimeout(poll, 600);
    intervalRef.current = setInterval(poll, expanded ? 2000 : 5000);
    return () => { clearTimeout(t); clearInterval(intervalRef.current); };
  }, [poll, expanded]);

  // Derived ratings
  const ratings = useMemo(() => {
    if (!metrics) return {};
    return {
      cls:  rate(metrics.cls, T.cls),
      lcp:  rate(metrics.lcp, T.lcp),
      inp:  rate(metrics.inp, T.inp),
      api:  rate(metrics.api, T.api),
      err:  rate(metrics.errors, T.err),
      mem:  rate(metrics.mem, T.mem),
    };
  }, [metrics]);

  const health = useMemo(() => {
    if (!metrics) return healthLabel(null);
    return healthLabel(computeHealth([ratings.cls, ratings.lcp, ratings.inp, ratings.api, ratings.err]));
  }, [metrics, ratings]);

  const hasMem = metrics?.mem != null;

  // ── Styles ─────────────────────────────────────────────────────────────────
  const panel = {
    position: "fixed",
    bottom: 12,
    left: 12,
    zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    borderRadius: 10,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    background: "rgba(15, 23, 42, 0.82)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
    cursor: "pointer",
    userSelect: "none",
    transition: "width 0.2s ease, opacity 0.2s ease",
    maxWidth: "calc(100vw - 24px)",
    pointerEvents: "auto",
  };

  const toggle = () => setExpanded(e => !e);

  // ── Collapsed badge ────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <div style={{ ...panel, padding: "6px 12px", display: "flex", alignItems: "center", gap: 8 }} onClick={toggle} title="Dev perf overlay — click to expand">
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color(health.rating), flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#CBD5E1", fontFamily: '"SF Mono","Fira Code",monospace', letterSpacing: "-0.01em" }}>
          {health.text !== "--" ? `${health.text}` : "PERF"}
        </span>
        {metrics && (
          <span style={{ fontSize: 11, color: color(ratings.cls), fontFamily: '"SF Mono","Fira Code",monospace', fontWeight: 500 }}>
            CLS {fmtCls(metrics.cls)}
          </span>
        )}
      </div>
    );
  }

  // ── Expanded panel ─────────────────────────────────────────────────────────
  return (
    <div style={{ ...panel, padding: "10px 14px", minWidth: 170 }} onClick={toggle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Perf</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: color(health.rating) }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: color(health.rating), fontFamily: '"SF Mono","Fira Code",monospace' }}>
            {health.text}
          </span>
        </div>
      </div>
      {/* Metrics */}
      <Row label="CLS" value={fmtCls(metrics?.cls)} rating={ratings.cls} />
      <Row label="LCP" value={fmtMs(metrics?.lcp)} rating={ratings.lcp} />
      <Row label="INP" value={fmtMs(metrics?.inp)} rating={ratings.inp} />
      <Row label="API" value={fmtMs(metrics?.api)} rating={ratings.api} />
      <Row label="ERR" value={metrics ? String(metrics.errors) : "--"} rating={ratings.err} />
      {hasMem && <Row label="MEM" value={fmtMem(metrics.mem)} rating={ratings.mem} />}
    </div>
  );
}

export default memo(DevPerfOverlay);
