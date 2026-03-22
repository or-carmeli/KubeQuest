import { getSystemSeverity } from "../../utils/architectureLogic";
import { AlertTriangle } from "lucide-react";

const MONO = "'Fira Code','Courier New',monospace";

/**
 * SystemDashboard - renders three distinct sections:
 *   1. Key Signals (compact metric row)
 *   2. What We Know (alerts as investigation clues)
 *   3. Logs (terminal evidence)
 *
 * Each section is a separate div so ScenarioStep can place them
 * in the investigation flow layout.
 */
export default function SystemDashboard({ systemState, prevSystemState, alerts, logs, lang, interviewMode = false }) {
  if (!systemState) return null;
  const severity = getSystemSeverity(systemState);

  const escalation = detectEscalation(systemState, prevSystemState);
  const costSpike = detectCostSpike(systemState, prevSystemState);

  // Key metrics - only show non-null values
  const signals = [];
  if (systemState.latency != null) signals.push({ label: "Latency", value: formatLatency(systemState.latency), severity: latencySeverity(systemState.latency) });
  if (systemState.errorRate != null) signals.push({ label: "Errors", value: `${systemState.errorRate}%`, severity: errorSeverity(systemState.errorRate) });
  if (systemState.cpuPercent != null) signals.push({ label: "CPU", value: `${systemState.cpuPercent}%`, severity: cpuSeverity(systemState.cpuPercent) });
  if (systemState.connections != null) signals.push({ label: "Conns", value: systemState.connections, severity: connSeverity(systemState.connections, systemState.maxConnections) });
  if (systemState.throughput != null) signals.push({ label: "RPS", value: systemState.throughput, severity: rpsSeverity(systemState.throughput) });
  if (systemState.dbLoad != null) signals.push({ label: "DB Load", value: `${systemState.dbLoad}%`, severity: cpuSeverity(systemState.dbLoad) });
  if (systemState.queueDepth != null) signals.push({ label: "Queue", value: systemState.queueDepth, severity: queueSeverity(systemState.queueDepth) });

  // Clues from alerts
  const clues = [];
  if (alerts?.length) {
    for (const alert of alerts) {
      const text = alert.text || alert;
      const type = alert.type || "warning";
      clues.push({ text, type, source: alert.source, noise: alert.noise });
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>

      {/* ── KEY SIGNALS ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
          Key Signals
        </div>
        <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
          {signals.map((s, i) => {
            const color = interviewMode ? "var(--text-primary)"
              : s.severity === "critical" ? "#EF4444"
              : s.severity === "warning" ? "#D97706"
              : "var(--text-primary)";
            return (
              <div key={i} style={{
                flex: "1 1 0", minWidth: 64, padding: "8px 0",
                borderInlineEnd: i < signals.length - 1 ? "1px solid var(--glass-4)" : "none",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: 17, fontWeight: 800, color, fontFamily: MONO, lineHeight: 1,
                  textShadow: s.severity === "critical" && !interviewMode ? `0 0 12px ${color}25` : "none",
                  transition: "color 0.3s",
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Escalation warnings ── */}
      {!interviewMode && (escalation || costSpike) && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {escalation && (
            <div style={{ padding: "0 2px", fontSize: 11, fontWeight: 600, color: "#F87171", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={11} style={{ flexShrink: 0 }} />
              {getEscalationText(escalation)}
            </div>
          )}
          {costSpike && (
            <div style={{ padding: "0 2px", fontSize: 11, fontWeight: 600, color: "#FBBF24", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={11} style={{ flexShrink: 0 }} />
              {getCostSpikeText(costSpike)}
            </div>
          )}
        </div>
      )}

      {/* ── WHAT WE KNOW (alerts as investigation clues) ── */}
      {clues.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            What We Know
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {clues.map((clue, i) => {
              const color = clue.type === "critical" ? "#F87171"
                : clue.type === "resolved" ? "#10B981"
                : "var(--text-primary)";
              const dotColor = clue.type === "critical" ? "#EF4444"
                : clue.type === "warning" ? "#D97706"
                : clue.type === "resolved" ? "#10B981"
                : "#6B7280";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "4px 0", opacity: clue.noise ? 0.4 : 1,
                  direction: "ltr", textAlign: "left",
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%", background: dotColor,
                    flexShrink: 0, marginTop: 6,
                    boxShadow: clue.type === "critical" ? `0 0 6px ${dotColor}50` : "none",
                  }} />
                  <div style={{ fontSize: 12, lineHeight: 1.6, color }}>
                    {clue.source && <span style={{ fontWeight: 700, color: "var(--text-muted)", fontSize: 10, marginInlineEnd: 4 }}>{clue.source}</span>}
                    {clue.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LOGS (terminal evidence) ── */}
      {logs?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Recent Logs
          </div>
          <div style={{
            background: "var(--code-bg)", borderRadius: 8,
            padding: "10px 14px", fontFamily: MONO,
            fontSize: 11, lineHeight: 1.8, direction: "ltr", textAlign: "left",
          }}>
            {logs.map((log, i) => {
              const text = log.text || log;
              const ts = log.timestamp || "";
              const color = log.level === "error" ? "#F87171" : log.level === "warn" ? "#FBBF24" : "#9CA3AF";
              return (
                <div key={i} style={{ color, whiteSpace: "pre-wrap", wordBreak: "break-word", opacity: log.noise ? 0.4 : 1 }}>
                  {ts && <span style={{ color: "#4B5563" }}>{ts} </span>}
                  {text}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function detectEscalation(state, prev) {
  if (!prev) return null;
  if (state.errorRate > (prev.errorRate || 0) + 8) return "error_spike";
  if (state.latency > 0 && prev.latency > 0 && state.latency >= prev.latency * 1.8) return "latency_surge";
  if (getSystemSeverity(state) === "critical" && getSystemSeverity(prev) !== "critical") return "critical_escalation";
  if (typeof state.connections === "string" && state.connections.includes("/")) {
    const [cur, max] = state.connections.split("/").map(Number);
    if (max > 0 && cur >= max) return "conn_exhausted";
  }
  if (state.stability === "degraded" && prev.stability === "healthy") return "stability_degraded";
  return null;
}

function getEscalationText(type) {
  switch (type) {
    case "error_spike": return "Error rate increasing rapidly - SLA at risk";
    case "latency_surge": return "Latency escalating - user experience degrading";
    case "critical_escalation": return "System escalated to CRITICAL - immediate action required";
    case "conn_exhausted": return "Connection pool exhausted - new requests being refused";
    case "stability_degraded": return "System stability degraded - monitoring closely";
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

function getCostSpikeText(spike) {
  if (spike.level === "extreme") return `Cost spike: +$${spike.increase.toLocaleString()}/mo (${spike.pct}% increase) - budget review needed`;
  return `Cost increased by $${spike.increase.toLocaleString()}/mo (${spike.pct}% increase)`;
}

function trendArrow(cur, prev) { if (cur == null || prev == null) return null; const d = cur - prev; return Math.abs(d) < 1 ? null : d > 0 ? "\u2191" : "\u2193"; }
function formatLatency(ms) { if (ms == null) return "\u2014"; return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`; }
function latencySeverity(ms) { if (ms == null) return "ok"; return ms >= 3000 ? "critical" : ms >= 1000 ? "warning" : "ok"; }
function errorSeverity(r) { if (r == null) return "ok"; return r >= 15 ? "critical" : r >= 3 ? "warning" : "ok"; }
function cpuSeverity(p) { if (p == null) return "ok"; return p >= 90 ? "critical" : p >= 70 ? "warning" : "ok"; }
function connSeverity(c, m) { if (c == null || m == null) return "ok"; const r = typeof c === "string" ? 0 : c / m; return r >= 0.95 ? "critical" : r >= 0.8 ? "warning" : "ok"; }
function rpsSeverity(r) { if (r == null) return "ok"; return r <= 10 ? "critical" : r <= 50 ? "warning" : "ok"; }
function queueSeverity(d) { if (d == null) return "ok"; return d >= 1000 ? "critical" : d >= 100 ? "warning" : "ok"; }
