import { useState, useRef } from "react";
import { getLocalizedField } from "../../utils/i18n";
import { getSystemSeverity } from "../../utils/architectureLogic";
import DecisionOption from "./DecisionOption";
import SystemDashboard from "./SystemDashboard";

export default function ScenarioStep({ step, metrics, systemState, prevSystemState, onDecision, lang, stepNumber, estimatedTotal }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const confirmingRef = useRef(false);
  const dir = lang === "he" ? "rtl" : "ltr";
  const en = lang !== "he";

  const context = getLocalizedField(step, "context", lang);
  const question = getLocalizedField(step, "question", lang);
  const timeDelta = getLocalizedField(step, "timeDelta", lang);

  const handleConfirm = () => {
    if (selected == null || confirmingRef.current) return;
    confirmingRef.current = true;
    setRevealed(true);
  };

  const handleNext = () => {
    onDecision(step.options[selected]);
  };

  const selectedOption = selected != null ? step.options[selected] : null;
  const explanation = selectedOption ? getLocalizedField(selectedOption, "explanation", lang) : "";
  const tag = selectedOption ? getLocalizedField(selectedOption, "tag", lang) : "";

  const netImpact = selectedOption
    ? (selectedOption.impact.performance || 0) + (selectedOption.impact.cost || 0) + (selectedOption.impact.reliability || 0)
    : 0;

  const outcomeLabel = netImpact > 15
    ? (en ? "Positive system impact" : "השפעה חיובית על המערכת")
    : netImpact > 0
    ? (en ? "Mixed impact" : "השפעה מעורבת")
    : netImpact > -10
    ? (en ? "Moderate negative impact" : "השפעה שלילית מתונה")
    : (en ? "Significant negative impact" : "השפעה שלילית משמעותית");

  const outcomeColor = netImpact > 15 ? "#15803D" : netImpact > 0 ? "#92400E" : netImpact > -10 ? "#92400E" : "#B91C1C";
  const outcomeBg = netImpact > 15 ? "rgba(21,128,61,0.06)" : netImpact > 0 ? "rgba(146,64,14,0.04)" : netImpact > -10 ? "rgba(146,64,14,0.04)" : "rgba(185,28,28,0.06)";
  const outcomeBorder = netImpact > 15 ? "rgba(21,128,61,0.15)" : netImpact > 0 ? "rgba(146,64,14,0.12)" : netImpact > -10 ? "rgba(146,64,14,0.12)" : "rgba(185,28,28,0.15)";

  // Critical state detection for recovery banner
  const severity = systemState ? getSystemSeverity(systemState) : "healthy";
  const prevSeverity = prevSystemState ? getSystemSeverity(prevSystemState) : "healthy";
  const inCritical = severity === "critical";
  const justWentCritical = inCritical && prevSeverity !== "critical";

  // Consequence detection: new issues surfaced by delayed effects
  const newIssues = step.newIssues;

  return (
    <div style={{ animation: "fadeIn 0.3s ease", direction: dir }}>

      {/* ── Score bar + step counter ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.5,
          background: "var(--glass-3)", padding: "3px 9px", borderRadius: 6,
        }}>
          {en ? `Decision ${stepNumber}` : `החלטה ${stepNumber}`}
          {estimatedTotal > 0 && <span style={{ opacity: 0.5 }}> / ~{estimatedTotal}</span>}
        </span>
        <div style={{ display: "flex", gap: 6, marginInlineStart: "auto" }}>
          <ScorePill icon="⚡" value={metrics.performance} />
          <ScorePill icon="💰" value={metrics.cost} />
          <ScorePill icon="🛡️" value={metrics.reliability} />
        </div>
      </div>

      {/* ── System Dashboard (telemetry + alerts + logs) ── */}
      <SystemDashboard
        systemState={systemState}
        prevSystemState={prevSystemState}
        alerts={step.alerts}
        logs={step.logs}
        lang={lang}
      />

      {/* ── Time progression line ── */}
      {timeDelta && (
        <div style={{
          textAlign: "center", padding: "6px 0", marginBottom: 4,
          fontSize: 11, color: "var(--text-dim)", fontStyle: "italic", letterSpacing: 0.3,
        }}>
          {timeDelta}
        </div>
      )}

      {/* ── New issue surfaced (consequence escalation) ── */}
      {newIssues?.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 5 }}>
          {newIssues.map((issue, i) => {
            const text = getLocalizedField(issue, "text", lang) || issue.text || issue;
            return (
              <div key={i} style={{
                background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.10)",
                borderRadius: 8, padding: "8px 12px", direction: dir,
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{
                  flexShrink: 0, fontSize: 9, fontWeight: 800, color: "#DC2626",
                  background: "rgba(220,38,38,0.1)", padding: "2px 6px", borderRadius: 4,
                  letterSpacing: 0.5, lineHeight: 1.4,
                }}>
                  {en ? "NEW" : "חדש"}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Critical state recovery banner ── */}
      {inCritical && (
        <div style={{
          background: "rgba(185,28,28,0.05)", border: "1px solid rgba(185,28,28,0.12)",
          borderRadius: 8, padding: "10px 14px", marginBottom: 12,
          fontSize: 12, color: "#991B1B", lineHeight: 1.6, direction: dir,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>
            {en ? "System in critical state" : "המערכת במצב קריטי"}
          </div>
          <div style={{ fontSize: 11, color: "#7F1D1D", opacity: 0.8 }}>
            {justWentCritical
              ? (en
                ? "Your previous decision escalated the situation. Recovery options may be limited."
                : "ההחלטה הקודמת החמירה את המצב. אפשרויות ההתאוששות עשויות להיות מוגבלות.")
              : (en
                ? "The system remains degraded. Focus on stabilization before scaling."
                : "המערכת נשארת מופחתת. התמקד בייצוב לפני הרחבה.")}
          </div>
        </div>
      )}

      {/* ── Situation context ── */}
      <div style={{
        background: "var(--glass-2)", border: "1px solid var(--glass-6)", borderRadius: 12,
        padding: "16px 18px", marginBottom: 24, lineHeight: 1.75,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase" }}>
          {en ? "Situation" : "סיטואציה"}
        </div>
        <div style={{ fontSize: 13.5, color: "var(--text-primary)" }}>
          {context}
        </div>
      </div>

      {/* ── Decision area ── */}
      <div style={{
        background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 14,
        padding: "20px", marginBottom: 0,
      }}>
        <h3 style={{
          margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: "var(--text-bright)", lineHeight: 1.5,
        }}>
          {question}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {step.options.map((opt, i) => (
            <DecisionOption
              key={i}
              option={opt}
              index={i}
              selected={selected}
              revealed={revealed}
              lang={lang}
              onSelect={setSelected}
            />
          ))}
        </div>

        {!revealed ? (
          <button
            onClick={handleConfirm}
            disabled={selected == null}
            style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: selected != null ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "var(--glass-6)",
              color: selected != null ? "#fff" : "var(--text-dim)",
              fontSize: 14, fontWeight: 700, cursor: selected != null ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
          >
            {en ? "Confirm Decision" : "אשר החלטה"}
          </button>
        ) : (
          <>
            <div style={{
              background: outcomeBg, border: `1px solid ${outcomeBorder}`,
              borderRadius: 10, padding: "14px 16px", marginBottom: 14,
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: outcomeColor }}>
                  {outcomeLabel}
                </span>
                {tag && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: outcomeColor, letterSpacing: 0.3, opacity: 0.8 }}>
                    -- {tag}
                  </span>
                )}
              </div>

              <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.75 }}>
                {explanation}
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap", paddingTop: 10, borderTop: `1px solid ${outcomeBorder}` }}>
                <ImpactDelta label="⚡" name={en ? "Perf" : "ביצועים"} value={selectedOption.impact.performance} />
                <ImpactDelta label="💰" name={en ? "Cost" : "עלות"} value={selectedOption.impact.cost} />
                <ImpactDelta label="🛡️" name={en ? "Rel" : "אמינות"} value={selectedOption.impact.reliability} />
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {en ? "Continue \u2192" : "\u2192 המשך"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScorePill({ icon, value }) {
  const color = value < 35 ? "#B91C1C" : value < 50 ? "#92400E" : "var(--text-muted)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color, fontWeight: 700 }}>
      <span style={{ fontSize: 9 }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function ImpactDelta({ label, name, value }) {
  if (!value) return null;
  const color = value > 0 ? "#15803D" : "#B91C1C";
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
      {label} <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>{name}</span> {value > 0 ? "+" : ""}{value}
    </span>
  );
}
