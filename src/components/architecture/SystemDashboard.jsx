import { getSystemSeverity } from "../../utils/architectureLogic";
import { getLocalizedField } from "../../utils/i18n";

/**
 * Live system dashboard — visual hierarchy:
 *   1. Status dot + severity (single indicator, no duplication)
 *   2. Gauges (neutral by default, color only when warning/critical)
 *   3. Escalation/cost banners (rare, high-signal)
 *   4. Alerts (primary focus — strongest visual weight)
 *   5. Logs (secondary — quiet, technical, background texture)
 */
export default function SystemDashboard({ systemState, prevSystemState, alerts, logs, lang }) {
  if (!systemState) return null;
  const dir = lang === "he" ? "rtl" : "ltr";
  const severity = getSystemSeverity(systemState);
  const severityColor = severity === "critical" ? "#EF4444" : severity === "degraded" ? "#D97706" : "#6B7280";

  // ── Escalation / cost spike detection ──
  const escalation = detectEscalation(systemState, prevSystemState);
  const costSpike = detectCostSpike(systemState, prevSystemState);

  return (
    <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>

      {/* ── Telemetry strip: status + gauges + cost ── */}
      <div style={{
        background: "var(--glass-2)",
        border: `1px solid ${severity === "critical" ? "rgba(239,68,68,0.12)" : "var(--glass-6)"}`,
        borderRadius: 10, padding: "10px 14px",
      }}>
        {/* Status line */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: severityColor,
            boxShadow: severity === "critical" ? `0 0 6px ${severityColor}50` : "none",
            animation: severity === "critical" ? "pulse 2s infinite" : "none",
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: severityColor, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {severity === "critical"
              ? (lang === "he" ? "קריטי" : "CRITICAL")
              : severity === "degraded"
              ? (lang === "he" ? "מופחת" : "DEGRADED")
              : (lang === "he" ? "תקין" : "HEALTHY")}
          </span>
          {systemState.timeRemaining && (
            <span style={{ fontSize: 9, color: "var(--text-dim)", marginInlineStart: 2 }}>
              {systemState.timeRemaining}
            </span>
          )}
          {systemState.costPerMonth != null && (
            <CostDisplay cost={systemState.costPerMonth} prevCost={prevSystemState?.costPerMonth} />
          )}
        </div>

        {/* Gauge row — calm by default, color only escalates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          <Gauge
            label={lang === "he" ? "השהיה" : "Latency"}
            value={formatLatency(systemState.latency)}
            severity={latencySeverity(systemState.latency)}
            trend={trendArrow(systemState.latency, prevSystemState?.latency)}
          />
          <Gauge
            label={lang === "he" ? "שגיאות" : "Errors"}
            value={`${systemState.errorRate ?? 0}%`}
            severity={errorSeverity(systemState.errorRate)}
            trend={trendArrow(systemState.errorRate, prevSystemState?.errorRate)}
          />
          <Gauge
            label="CPU"
            value={`${systemState.cpuPercent ?? 0}%`}
            severity={cpuSeverity(systemState.cpuPercent)}
            trend={trendArrow(systemState.cpuPercent, prevSystemState?.cpuPercent)}
          />
          <Gauge
            label={lang === "he" ? "חיבורים" : "Conns"}
            value={systemState.connections ?? "\u2014"}
            severity={connSeverity(systemState.connections, systemState.maxConnections)}
          />
        </div>
      </div>

      {/* ── Escalation / cost banners (rare, high-signal) ── */}
      {(escalation || costSpike) && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {escalation && (
            <div style={{
              background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
              borderRadius: 8, padding: "7px 12px",
              fontSize: 11, fontWeight: 600, color: "#DC2626",
              display: "flex", alignItems: "center", gap: 8, direction: dir,
            }}>
              <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>📈</span>
              <span>{getEscalationText(escalation, lang)}</span>
            </div>
          )}
          {costSpike && (
            <div style={{
              background: "rgba(217,119,6,0.04)", border: "1px solid rgba(217,119,6,0.12)",
              borderRadius: 8, padding: "7px 12px",
              fontSize: 11, fontWeight: 600, color: "#B45309",
              display: "flex", alignItems: "center", gap: 8, direction: dir,
            }}>
              <span style={{ fontSize: 12, lineHeight: 1, flexShrink: 0 }}>💸</span>
              <span>{getCostSpikeText(costSpike, lang)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Alerts — primary visual focus ── */}
      {alerts?.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {alerts.map((alert, i) => {
            const text = getLocalizedField(alert, "text", lang) || alert.text || alert;
            const type = alert.type || "warning";
            const noise = alert.noise;
            // Muted color palette — strong enough to read, not neon
            const color = type === "critical" ? "#DC2626"
              : type === "warning" ? "#B45309"
              : type === "resolved" ? "#15803D"
              : "#6B7280";
            const bg = type === "critical" ? "rgba(220,38,38,0.06)"
              : type === "warning" ? "rgba(180,83,9,0.04)"
              : type === "resolved" ? "rgba(21,128,61,0.04)"
              : "rgba(107,114,128,0.04)";
            const icon = type === "critical" ? "!!" : type === "warning" ? "!" : type === "resolved" ? "\u2713" : "\u2022";
            const prefix = alert.source || "Alert";
            return (
              <div key={i} style={{
                background: bg, border: `1px solid ${type === "critical" ? "rgba(220,38,38,0.12)" : "var(--glass-6)"}`,
                borderRadius: 8, padding: "7px 12px", fontSize: 12, direction: dir,
                display: "flex", alignItems: "flex-start", gap: 8,
                opacity: noise ? 0.5 : 1,
              }}>
                <span style={{
                  flexShrink: 0, width: 16, height: 16, borderRadius: 4,
                  background: type === "critical" ? "rgba(220,38,38,0.15)" : type === "warning" ? "rgba(180,83,9,0.1)" : "var(--glass-4)",
                  color, fontSize: 9, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}>
                  {icon}
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.3 }}>{prefix} </span>
                  <span style={{ fontWeight: 500, color: type === "critical" ? "#DC2626" : "var(--text-secondary)" }}>{text}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Logs — quiet, secondary, technical texture ── */}
      {logs?.length > 0 && (
        <div style={{
          marginTop: 8,
          background: "rgba(13,17,23,0.6)", border: "1px solid var(--glass-4)", borderRadius: 8,
          padding: "8px 12px", fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
          fontSize: 10, lineHeight: 1.7, overflowX: "auto", direction: "ltr",
        }}>
          {logs.map((log, i) => {
            const text = getLocalizedField(log, "text", lang) || log.text || log;
            const ts = log.timestamp || "";
            const noise = log.noise;
            // Subdued palette: errors are warm-muted, not bright red
            const color = log.level === "error" ? "#B47070" : log.level === "warn" ? "#A08050" : "#5C6370";
            return (
              <div key={i} style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-word", opacity: noise ? 0.4 : 0.8 }}>
                {ts && <span style={{ color: "#3B4048" }}>{ts} </span>}
                {text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Gauge — neutral by default, color only when degraded/critical ─────────

function Gauge({ label, value, severity, trend }) {
  // Neutral for "ok", restrained color only for warning/critical
  const color = severity === "critical" ? "#DC2626"
    : severity === "warning" ? "#B45309"
    : "var(--text-secondary)";
  const weight = severity === "ok" ? 700 : 800;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: weight, color, lineHeight: 1.3 }}>
        {value}
        {trend && <span style={{ fontSize: 9, opacity: 0.6, marginInlineStart: 1 }}>{trend}</span>}
      </div>
      <div style={{ fontSize: 8, color: "var(--text-dim)", fontWeight: 600, marginTop: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

// ── Cost display ──────────────────────────────────────────────────────────

function CostDisplay({ cost, prevCost }) {
  const spiked = prevCost != null && cost > prevCost * 1.5;
  return (
    <span style={{
      fontSize: 9, marginInlineStart: "auto",
      color: spiked ? "#DC2626" : "var(--text-dim)",
      fontWeight: spiked ? 700 : 400,
    }}>
      ${cost.toLocaleString()}/mo
      {spiked && <span style={{ marginInlineStart: 3 }}>({Math.round((cost / prevCost - 1) * 100)}%+)</span>}
    </span>
  );
}

// ── Detection helpers (unchanged logic) ───────────────────────────────────

function detectEscalation(state, prev) {
  if (!prev) return null;
  // Error rate spiking
  if (state.errorRate > (prev.errorRate || 0) + 8) return "error_spike";
  // Latency nearly doubling
  if (state.latency > 0 && prev.latency > 0 && state.latency >= prev.latency * 1.8) return "latency_surge";
  // Severity escalated to critical
  const prevSev = getSystemSeverity(prev);
  const curSev = getSystemSeverity(state);
  if (curSev === "critical" && prevSev !== "critical") return "critical_escalation";
  // Connection saturation (string format "180/200" or numeric)
  if (typeof state.connections === "string" && state.connections.includes("/")) {
    const [cur, max] = state.connections.split("/").map(Number);
    if (max > 0 && cur >= max) return "conn_exhausted";
  }
  // Stability went from healthy to degraded
  if (state.stability === "degraded" && prev.stability === "healthy") return "stability_degraded";
  return null;
}

function getEscalationText(type, lang) {
  const en = lang !== "he";
  switch (type) {
    case "error_spike": return en ? "Error rate increasing rapidly -- SLA at risk" : "שיעור שגיאות עולה במהירות -- SLA בסיכון";
    case "latency_surge": return en ? "Latency escalating -- user experience degrading" : "השהיה מחמירה -- חוויית משתמש מתדרדרת";
    case "critical_escalation": return en ? "System escalated to CRITICAL -- immediate action required" : "המערכת הסלימה לקריטי -- נדרשת פעולה מיידית";
    case "conn_exhausted": return en ? "Connection pool exhausted -- new requests being refused" : "מאגר חיבורים נוצל -- בקשות חדשות נדחות";
    case "stability_degraded": return en ? "System stability degraded -- monitoring closely" : "יציבות המערכת ירדה -- מנטרים מקרוב";
    default: return "";
  }
}

function detectCostSpike(state, prev) {
  if (!prev || state.costPerMonth == null || prev.costPerMonth == null) return null;
  const increase = state.costPerMonth - prev.costPerMonth;
  const pct = prev.costPerMonth > 0 ? (increase / prev.costPerMonth) * 100 : 0;
  if (pct >= 100) return { increase, pct: Math.round(pct), level: "extreme" };
  if (pct >= 50) return { increase, pct: Math.round(pct), level: "high" };
  return null;
}

function getCostSpikeText(spike, lang) {
  const en = lang !== "he";
  if (spike.level === "extreme") {
    return en
      ? `Cost spike: +$${spike.increase.toLocaleString()}/mo (${spike.pct}% increase) -- budget review needed`
      : `קפיצת עלות: +$${spike.increase.toLocaleString()}/חודש (${spike.pct}% עלייה) -- נדרשת בדיקת תקציב`;
  }
  return en
    ? `Cost increased by $${spike.increase.toLocaleString()}/mo (${spike.pct}% increase)`
    : `עלות עלתה ב-$${spike.increase.toLocaleString()}/חודש (${spike.pct}% עלייה)`;
}

// ── Trend + severity helpers ──────────────────────────────────────────────

function trendArrow(current, previous) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 1) return null;
  return diff > 0 ? "\u2191" : "\u2193";
}

function formatLatency(ms) {
  if (ms == null) return "\u2014";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function latencySeverity(ms) {
  if (ms == null) return "ok";
  if (ms >= 3000) return "critical";
  if (ms >= 1000) return "warning";
  return "ok";
}

function errorSeverity(rate) {
  if (rate == null) return "ok";
  if (rate >= 15) return "critical";
  if (rate >= 3) return "warning";
  return "ok";
}

function cpuSeverity(pct) {
  if (pct == null) return "ok";
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warning";
  return "ok";
}

function connSeverity(current, max) {
  if (current == null || max == null) return "ok";
  const ratio = typeof current === "string" ? 0 : current / max;
  if (ratio >= 0.95) return "critical";
  if (ratio >= 0.8) return "warning";
  return "ok";
}
