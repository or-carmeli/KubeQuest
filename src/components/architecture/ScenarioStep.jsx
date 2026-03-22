import { useState, useRef } from "react";
import { getLocalizedField } from "../../utils/i18n";
import { getSystemSeverity } from "../../utils/architectureLogic";
import { Zap, Wallet, ShieldCheck, Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import DecisionOption from "./DecisionOption";
import SystemDashboard from "./SystemDashboard";

const MONO = "'Fira Code','Courier New',monospace";

export default function ScenarioStep({ step, metrics, systemState, prevSystemState, onDecision, lang, stepNumber, estimatedTotal, interviewMode = false }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const confirmingRef = useRef(false);
  const dir = lang === "he" ? "rtl" : "ltr";
  const en = lang !== "he";

  const context = getLocalizedField(step, "context", lang);
  const question = getLocalizedField(step, "question", lang);
  const timeDelta = getLocalizedField(step, "timeDelta", lang);

  const handleConfirm = () => { if (selected == null || confirmingRef.current) return; confirmingRef.current = true; setRevealed(true); };
  const handleNext = () => { onDecision(step.options[selected]); };

  const selectedOption = selected != null ? step.options[selected] : null;
  const explanation = selectedOption ? getLocalizedField(selectedOption, "explanation", lang) : "";
  const tag = selectedOption ? getLocalizedField(selectedOption, "tag", lang) : "";

  const netImpact = selectedOption
    ? (selectedOption.impact.performance || 0) + (selectedOption.impact.cost || 0) + (selectedOption.impact.reliability || 0) : 0;

  const outcomeLabel = netImpact > 15 ? (en ? "Positive system impact" : "השפעה חיובית על המערכת")
    : netImpact > 0 ? (en ? "Mixed impact" : "השפעה מעורבת")
    : netImpact > -10 ? (en ? "Moderate negative impact" : "השפעה שלילית מתונה")
    : (en ? "Significant negative impact" : "השפעה שלילית משמעותית");

  const outcomeColor = netImpact > 15 ? "#10B981" : netImpact > 0 ? "#D97706" : netImpact > -10 ? "#D97706" : "#EF4444";
  const outcomeBg = netImpact > 15 ? "rgba(16,185,129,0.06)" : netImpact > 0 ? "rgba(217,119,6,0.04)" : netImpact > -10 ? "rgba(217,119,6,0.04)" : "rgba(239,68,68,0.06)";

  const severity = systemState ? getSystemSeverity(systemState) : "healthy";
  const prevSeverity = prevSystemState ? getSystemSeverity(prevSystemState) : "healthy";
  const inCritical = severity === "critical";
  const justWentCritical = inCritical && prevSeverity !== "critical";
  const newIssues = step.newIssues;

  const statusColor = severity === "critical" ? "#EF4444" : severity === "degraded" ? "#D97706" : "#10B981";
  const progressPct = estimatedTotal > 0 ? Math.min((stepNumber / estimatedTotal) * 100, 100) : 0;

  return (
    <div style={{ animation: "fadeIn 0.3s ease", direction: dir }}>

      {/* ═══ INCIDENT HEADER ═══ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        {/* Status */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: statusColor,
          boxShadow: severity !== "healthy" ? `0 0 10px ${statusColor}50` : "none",
          animation: severity === "critical" ? "pulse 1.5s infinite" : "none",
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: statusColor, letterSpacing: 1, textTransform: "uppercase" }}>
          {severity === "critical" ? "INCIDENT" : severity === "degraded" ? "DEGRADING" : "HEALTHY"}
        </span>

        {/* Progress */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ flex: 1, height: 2, borderRadius: 1, background: "var(--glass-6)", overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 1, background: statusColor, transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", fontFamily: MONO, flexShrink: 0 }}>
            {stepNumber}/{estimatedTotal > 0 ? estimatedTotal : "?"}
          </span>
        </div>

        {/* Score pills */}
        {!interviewMode && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <ScorePill icon={<Zap size={10} />} value={metrics.performance} />
            <ScorePill icon={<Wallet size={10} />} value={metrics.cost} />
            <ScorePill icon={<ShieldCheck size={10} />} value={metrics.reliability} />
          </div>
        )}
      </div>

      {/* ═══ KEY SIGNALS + WHAT WE KNOW + LOGS ═══ */}
      <SystemDashboard
        systemState={systemState}
        prevSystemState={prevSystemState}
        alerts={step.alerts}
        logs={step.logs}
        lang={lang}
        interviewMode={interviewMode}
      />

      {/* ═══ TIME PROGRESSION ═══ */}
      {timeDelta && (
        <div style={{ textAlign: "center", padding: "4px 0", marginBottom: 8, fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>
          {timeDelta}
        </div>
      )}

      {/* ═══ NEW ISSUES ═══ */}
      {newIssues?.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {newIssues.map((issue, i) => {
            const text = getLocalizedField(issue, "text", lang) || issue.text || issue;
            return (
              <div key={i} style={{
                fontSize: 11, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8,
                animation: "fadeIn 0.4s ease",
              }}>
                <span style={{
                  fontSize: 8, fontWeight: 800, color: "#EF4444",
                  background: "rgba(239,68,68,0.12)", padding: "2px 6px", borderRadius: 3,
                  animation: "pulse 2s infinite", flexShrink: 0,
                }}>NEW</span>
                <span style={{ lineHeight: 1.5 }}>{text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ CRITICAL STATE ═══ */}
      {inCritical && (
        <div style={{
          marginBottom: 16, fontSize: 11, color: "#F87171",
          display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.6,
          borderInlineStart: "3px solid #EF4444", paddingInlineStart: 12,
        }}>
          <Activity size={12} style={{ flexShrink: 0, marginTop: 2, animation: "pulse 1.5s infinite" }} />
          <div>
            <span style={{ fontWeight: 700 }}>{en ? "System in critical state" : "המערכת במצב קריטי"}</span>
            {" - "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              {justWentCritical
                ? (en ? "Your previous decision escalated the situation." : "ההחלטה הקודמת החמירה את המצב.")
                : (en ? "Focus on stabilization before scaling." : "התמקד בייצוב לפני הרחבה.")}
            </span>
          </div>
        </div>
      )}

      {/* ═══ WHAT HAPPENED (situation context) ═══ */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
          {en ? "Situation" : "סיטואציה"}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.8 }}>
          {context}
        </div>
      </div>

      {/* ═══ YOUR DECISION ═══ */}
      <div>
        <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: "var(--text-bright)", lineHeight: 1.5 }}>
          {question}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {step.options.map((opt, i) => (
            <DecisionOption
              key={i} option={opt} index={i} selected={selected}
              revealed={revealed} lang={lang} onSelect={setSelected}
              interviewMode={interviewMode}
            />
          ))}
        </div>

        {!revealed ? (
          <button
            onClick={handleConfirm}
            disabled={selected == null}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: selected != null ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "var(--glass-6)",
              color: selected != null ? "#fff" : "var(--text-dim)",
              fontSize: 14, fontWeight: 700, cursor: selected != null ? "pointer" : "default",
              transition: "all 0.2s ease",
              boxShadow: selected != null ? "0 4px 20px rgba(124,58,237,0.2)" : "none",
            }}
          >
            {en ? "Confirm Decision" : "אשר החלטה"}
          </button>
        ) : (
          <>
            {interviewMode ? (
              <div style={{
                padding: "16px", marginBottom: 16, textAlign: "center",
                fontSize: 13, color: "var(--text-secondary)", fontWeight: 600,
                background: "var(--glass-3)", borderRadius: 12,
                animation: "fadeIn 0.3s ease",
              }}>
                {en ? "Decision recorded. Continue to the next situation." : "ההחלטה נרשמה. המשך לסיטואציה הבאה."}
              </div>
            ) : (
              <div style={{
                background: outcomeBg, borderRadius: 12,
                padding: "16px", marginBottom: 16,
                animation: "fadeIn 0.3s ease",
                borderInlineStart: `3px solid ${outcomeColor}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {netImpact > 15 ? <CheckCircle size={16} strokeWidth={2} style={{ color: outcomeColor, flexShrink: 0 }} />
                    : netImpact > -10 ? <AlertTriangle size={16} strokeWidth={2} style={{ color: outcomeColor, flexShrink: 0 }} />
                    : <XCircle size={16} strokeWidth={2} style={{ color: outcomeColor, flexShrink: 0 }} />}
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: outcomeColor }}>{outcomeLabel}</span>
                    {tag && <span style={{ fontSize: 11, color: "var(--text-muted)", marginInlineStart: 8 }}>{tag}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.75, marginBottom: 12 }}>
                  {explanation}
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid var(--glass-4)" }}>
                  <ImpactDelta label={<Zap size={11} />} name="Performance" value={selectedOption.impact.performance} />
                  <ImpactDelta label={<Wallet size={11} />} name="Cost" value={selectedOption.impact.cost} />
                  <ImpactDelta label={<ShieldCheck size={11} />} name="Reliability" value={selectedOption.impact.reliability} />
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.2)",
              }}
            >
              {en ? "Continue \u2192" : "המשך \u2190"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ScorePill({ icon, value }) {
  const color = value < 35 ? "#EF4444" : value < 50 ? "#D97706" : "var(--text-muted)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color, fontWeight: 700 }}>
      <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function ImpactDelta({ label, name, value }) {
  if (!value) return null;
  const color = value > 0 ? "#10B981" : "#EF4444";
  return (
    <span style={{ fontSize: 11, color, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
      <span style={{ display: "flex", alignItems: "center" }}>{label}</span>
      <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>{name}</span> {value > 0 ? "+" : ""}{value}
    </span>
  );
}
