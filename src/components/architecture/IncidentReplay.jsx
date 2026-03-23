import { useState } from "react";
import { getLocalizedField } from "../../utils/i18n";
import { getSystemSeverity, describeDecisionImpact } from "../../utils/architectureLogic";
import { ChevronLeft, ChevronRight, Play, RotateCcw, AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Minus, BookOpen } from "lucide-react";

const MONO = "'Fira Code','Courier New',monospace";

/**
 * Incident Replay - step-by-step reconstruction of the incident.
 */
export default function IncidentReplay({ systemTimeline, decisionHistory, optimalData, lang, turningPointIndex, interviewFeedback }) {
  const [step, setStep] = useState(0);
  const [showOptimal, setShowOptimal] = useState(false);
  const en = lang !== "he";
  const dir = en ? "ltr" : "rtl";

  if (!systemTimeline || systemTimeline.length < 2) return null;

  const maxStep = systemTimeline.length - 1;
  const entry = systemTimeline[step];
  const prevEntry = step > 0 ? systemTimeline[step - 1] : null;
  const isT0 = step === 0;
  const isFinal = step === maxStep;
  const isTurningPoint = !isT0 && (step - 1) === turningPointIndex;
  const decisionIdx = step - 1;
  const decision = decisionIdx >= 0 ? decisionHistory[decisionIdx] : null;

  // Impact explanation
  const impactText = prevEntry
    ? describeDecisionImpact(prevEntry.state, entry.state, lang)
    : null;

  // Severity
  const severityLabel = entry.severity === "critical"
    ? (en ? "Critical" : "קריטי")
    : entry.severity === "degraded"
    ? (en ? "Degraded" : "מופחת")
    : (en ? "Healthy" : "תקין");
  const severityColor = entry.severity === "critical" ? "#EF4444" : entry.severity === "degraded" ? "#F59E0B" : "#10B981";

  // Optimal comparison
  const optEntry = showOptimal && optimalData?.timeline?.[step];

  // Metric trends (computed from full timeline up to current step)
  const trends = computeTrends(systemTimeline, step, en);

  // Turning point styling
  const cardBorder = isTurningPoint ? "1px solid rgba(168,85,247,0.3)" : "1px solid var(--glass-8)";
  const cardBg = isTurningPoint ? "linear-gradient(135deg, var(--glass-3), rgba(168,85,247,0.03))" : "var(--glass-3)";

  return (
    <div style={{
      background: cardBg, border: cardBorder, borderRadius: 12,
      padding: "14px 16px", marginBottom: 12, direction: dir,
      transition: "border-color 0.3s, background 0.3s",
    }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Play size={13} strokeWidth={2} style={{ color: "#A855F7", opacity: 0.7 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase" }}>
          {en ? "Incident Replay" : "שחזור תקרית"}
        </span>
        <div style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: severityColor,
            boxShadow: entry.severity === "critical" ? `0 0 6px ${severityColor}50` : "none",
          }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: severityColor }}>{severityLabel}</span>
        </div>
      </div>

      {/* ── Step content (with fade transition) ── */}
      <div key={step} style={{ animation: "fadeIn 0.25s ease" }}>

        {/* Step header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 800, color: severityColor,
              background: `${severityColor}15`, padding: "3px 10px", borderRadius: 6,
              fontFamily: MONO,
            }}>
              {entry.label}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-bright)" }}>
              {isT0
                ? (en ? "Initial System State" : "מצב מערכת התחלתי")
                : isFinal
                ? (en ? "Final Outcome" : "תוצאה סופית")
                : (en ? `Decision ${step}` : `החלטה ${step}`)}
            </span>
            {isTurningPoint && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: "#A855F7", background: "rgba(168,85,247,0.15)",
                padding: "3px 10px", borderRadius: 6, letterSpacing: 0.3,
                display: "flex", alignItems: "center", gap: 4,
                border: "1px solid rgba(168,85,247,0.25)",
              }}>
                <AlertTriangle size={10} />
                {en ? "Turning Point" : "נקודת מפנה"}
              </span>
            )}
          </div>
          {decision?.tag && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--text-dim)", fontSize: 10 }}>{en ? "Action:" : "פעולה:"}</span>
              {decision.tag}
            </div>
          )}
        </div>

        {/* ── Metrics panel ── */}
        <div style={{
          background: "var(--glass-2)", border: "1px solid var(--glass-5)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 12,
        }}>
          <GaugeRow
            state={entry.state}
            prevState={prevEntry?.state}
            label={showOptimal ? (en ? "Your Architecture" : "הארכיטקטורה שלך") : null}
            en={en}
          />
          {optEntry && (
            <>
              <div style={{ borderTop: "1px dashed var(--glass-8)", margin: "10px 0" }} />
              <GaugeRow
                state={optEntry.state}
                prevState={null}
                label={en ? "Optimal Architecture" : "ארכיטקטורה אופטימלית"}
                isOptimal
                compareWith={entry.state}
                en={en}
              />
            </>
          )}
        </div>

        {/* ── Metric trends (from T0 to current step) ── */}
        {step > 1 && trends.length > 0 && (
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12,
          }}>
            {trends.map((t, i) => (
              <span key={i} style={{
                fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3,
                padding: "2px 8px", borderRadius: 5,
                color: t.color, background: `${t.color}10`,
              }}>
                {t.direction === "improving" ? <TrendingDown size={10} /> : t.direction === "degrading" ? <TrendingUp size={10} /> : <Minus size={10} />}
                {t.label}: {t.text}
              </span>
            ))}
          </div>
        )}

        {/* ── Impact explanation ── */}
        {impactText && (
          <div style={{
            fontSize: 12, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 12,
            padding: "10px 14px", borderRadius: 10,
            background: isTurningPoint ? "rgba(168,85,247,0.06)" : "var(--glass-2)",
            border: `1px solid ${isTurningPoint ? "rgba(168,85,247,0.2)" : "var(--glass-4)"}`,
          }}>
            {isTurningPoint && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A855F7", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <AlertTriangle size={12} />
                {en
                  ? "This decision significantly changed the trajectory of the incident."
                  : "החלטה זו שינתה באופן משמעותי את מהלך התקרית."}
              </div>
            )}
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{impactText}</div>
          </div>
        )}

        {isT0 && (
          <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "6px 14px", marginBottom: 12, fontStyle: "italic" }}>
            {en ? "Baseline metrics before any decisions were made." : "מדדי בסיס לפני שנלקחו החלטות."}
          </div>
        )}

        {/* ── Completion state ── */}
        {isFinal && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 12,
            background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C084FC", marginBottom: 4 }}>
              {en ? "Replay Complete" : "השחזור הושלם"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {en
                ? "Review the optimal architecture below or restart the scenario."
                : "סקור את הארכיטקטורה האופטימלית למטה או הפעל מחדש את התרחיש."}
            </div>
          </div>
        )}

        {/* ── Key Lessons (final step only) ── */}
        {isFinal && interviewFeedback && (
          <div style={{
            padding: "14px 16px", borderRadius: 12, marginBottom: 12,
            background: "var(--glass-2)", border: "1px solid var(--glass-5)",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8,
              textTransform: "uppercase", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <BookOpen size={12} />
              {en ? "Key Lessons" : "לקחים עיקריים"}
            </div>
            {interviewFeedback.rootCause && (
              <LessonItem
                label={en ? "Root Cause" : "שורש הבעיה"}
                text={interviewFeedback.rootCause}
                color="#EF4444"
              />
            )}
            {turningPointIndex >= 0 && decisionHistory[turningPointIndex] && (
              <LessonItem
                label={en ? "Turning Point" : "נקודת מפנה"}
                text={`${en ? "Decision" : "החלטה"} ${turningPointIndex + 1}: ${decisionHistory[turningPointIndex].tag}`}
                color="#A855F7"
              />
            )}
            {interviewFeedback.productionSolution && (
              <LessonItem
                label={en ? "Best Fix" : "תיקון מיטבי"}
                text={interviewFeedback.productionSolution}
                color="#10B981"
              />
            )}
          </div>
        )}

      </div>{/* end fade wrapper */}

      {/* ── Timeline navigation ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 0",
        borderTop: "1px solid var(--glass-4)", marginTop: 4,
      }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          aria-label={en ? "Previous step" : "שלב קודם"}
          style={{
            background: "var(--glass-4)", border: "1px solid var(--glass-8)", borderRadius: 8,
            padding: "7px 10px", cursor: step === 0 ? "default" : "pointer",
            color: step === 0 ? "var(--text-dim)" : "var(--text-primary)",
            display: "flex", alignItems: "center", opacity: step === 0 ? 0.3 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {en ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          {systemTimeline.map((e, i) => {
            const isTp = i > 0 && (i - 1) === turningPointIndex;
            const isActive = i === step;
            const dotSev = e.severity === "critical" ? "#EF4444" : e.severity === "degraded" ? "#F59E0B" : "#10B981";
            const dotColor = isActive ? "#A855F7" : dotSev;
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`${e.label}${isTp ? " (turning point)" : ""}`}
                style={{
                  width: isActive ? 24 : 10, height: 10, borderRadius: 5,
                  background: dotColor, border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.2s ease",
                  boxShadow: isTp ? `0 0 8px rgba(168,85,247,0.6)` : isActive ? `0 0 6px ${dotColor}50` : "none",
                  outline: isTp && !isActive ? "2px solid rgba(168,85,247,0.3)" : "none",
                  outlineOffset: 1,
                }}
              />
            );
          })}
        </div>

        <button
          onClick={() => setStep(s => Math.min(maxStep, s + 1))}
          disabled={step === maxStep}
          aria-label={en ? "Next step" : "שלב הבא"}
          style={{
            background: step === maxStep ? "var(--glass-4)" : "rgba(168,85,247,0.1)",
            border: `1px solid ${step === maxStep ? "var(--glass-8)" : "rgba(168,85,247,0.2)"}`,
            borderRadius: 8,
            padding: "7px 10px", cursor: step === maxStep ? "default" : "pointer",
            color: step === maxStep ? "var(--text-dim)" : "#C084FC",
            display: "flex", alignItems: "center", opacity: step === maxStep ? 0.3 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {en ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: 10, color: "var(--text-dim)", marginTop: 4, fontFamily: MONO }}>
        {step + 1} / {systemTimeline.length}
      </div>

      {/* ── Optimal toggle + reset ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        {optimalData && (
          <button
            onClick={() => setShowOptimal(o => !o)}
            style={{
              flex: 1, padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              background: showOptimal ? "rgba(16,185,129,0.08)" : "var(--glass-4)",
              border: `1px solid ${showOptimal ? "rgba(16,185,129,0.2)" : "var(--glass-8)"}`,
              color: showOptimal ? "#10B981" : "var(--text-muted)",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {showOptimal ? <CheckCircle size={13} /> : <TrendingDown size={13} />}
            {showOptimal
              ? (en ? "Hide Optimal Path" : "הסתר מסלול אופטימלי")
              : (en ? "Compare with Optimal" : "השווה למסלול אופטימלי")}
          </button>
        )}
        <button
          onClick={() => setStep(0)}
          aria-label={en ? "Reset replay" : "אפס שחזור"}
          style={{
            padding: "8px 10px", borderRadius: 10, cursor: "pointer",
            background: "var(--glass-4)", border: "1px solid var(--glass-8)",
            color: "var(--text-muted)", display: "flex", alignItems: "center",
          }}
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* ── Optimal path summary (last step) ── */}
      {showOptimal && isFinal && optimalData?.path && (
        <div style={{
          marginTop: 14, padding: "14px 16px", borderRadius: 12,
          background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#10B981", letterSpacing: 0.8,
            textTransform: "uppercase", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <CheckCircle size={12} />
            {en ? "Optimal Decision Path" : "מסלול החלטות אופטימלי"}
          </div>
          {optimalData.path.map((p, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8,
              padding: "6px 8px", borderRadius: 8, background: "rgba(16,185,129,0.04)",
            }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                background: "rgba(16,185,129,0.15)", color: "#10B981",
                fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i + 1}
              </span>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {getLocalizedField(p.option, "text", lang)}
                </div>
                {p.option.tag && (
                  <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 2 }}>
                    {getLocalizedField(p.option, "tag", lang)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Lesson Item ──────────────────────────────────────────────────────────

function LessonItem({ label, text, color }) {
  return (
    <div style={{ marginBottom: 10, paddingInlineStart: 10, borderInlineStart: `3px solid ${color}30` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
        {text}
      </div>
    </div>
  );
}

// ── Metric Trends ────────────────────────────────────────────────────────

function computeTrends(timeline, currentStep, en) {
  if (currentStep < 2) return [];
  const first = timeline[0].state;
  const current = timeline[currentStep].state;
  const trends = [];

  const check = (key, label, lowerIsBetter) => {
    if (first[key] == null || current[key] == null) return;
    const diff = current[key] - first[key];
    const pct = first[key] !== 0 ? Math.abs(diff / first[key]) : 0;
    if (pct < 0.05) return; // skip insignificant changes
    const improving = lowerIsBetter ? diff < 0 : diff > 0;
    trends.push({
      label,
      direction: improving ? "improving" : "degrading",
      text: improving ? (en ? "improving" : "משתפר") : (en ? "degrading" : "מחמיר"),
      color: improving ? "#10B981" : "#EF4444",
    });
  };

  check("latency", en ? "Latency" : "השהיה", true);
  check("errorRate", en ? "Errors" : "שגיאות", true);
  check("cpuPercent", "CPU", true);
  check("throughput", "RPS", false);
  check("dbLoad", "DB", true);
  check("queueDepth", en ? "Queue" : "תור", true);

  return trends;
}

// ── Gauge Row ────────────────────────────────────────────────────────────

function GaugeRow({ state, prevState, label, isOptimal = false, compareWith = null, en = true }) {
  if (!state) return null;

  return (
    <div>
      {label && (
        <div style={{
          fontSize: 9, fontWeight: 700, color: isOptimal ? "#10B981" : "var(--text-muted)",
          marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8,
        }}>
          {label}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(getGaugeCount(state), 4)}, 1fr)`, gap: 8 }}>
        {state.latency != null && (
          <MiniGauge label={en ? "Latency" : "השהיה"} value={state.latency >= 1000 ? `${(state.latency / 1000).toFixed(1)}s` : `${state.latency}ms`} delta={getDelta(state.latency, prevState?.latency, true, en)} optBetter={compareWith?.latency != null && state.latency < compareWith.latency} isOptimal={isOptimal} />
        )}
        {state.errorRate != null && (
          <MiniGauge label={en ? "Errors" : "שגיאות"} value={`${state.errorRate}%`} delta={getDelta(state.errorRate, prevState?.errorRate, true, en)} optBetter={compareWith?.errorRate != null && state.errorRate < compareWith.errorRate} isOptimal={isOptimal} />
        )}
        {state.cpuPercent != null && (
          <MiniGauge label="CPU" value={`${state.cpuPercent}%`} delta={getDelta(state.cpuPercent, prevState?.cpuPercent, true, en)} optBetter={compareWith?.cpuPercent != null && state.cpuPercent < compareWith.cpuPercent} isOptimal={isOptimal} />
        )}
        {state.throughput != null && (
          <MiniGauge label="RPS" value={state.throughput} delta={getDelta(state.throughput, prevState?.throughput, false, en)} optBetter={compareWith?.throughput != null && state.throughput > compareWith.throughput} isOptimal={isOptimal} />
        )}
        {state.dbLoad != null && (
          <MiniGauge label={en ? "DB Load" : "עומס DB"} value={`${state.dbLoad}%`} delta={getDelta(state.dbLoad, prevState?.dbLoad, true, en)} optBetter={compareWith?.dbLoad != null && state.dbLoad < compareWith.dbLoad} isOptimal={isOptimal} />
        )}
        {state.queueDepth != null && (
          <MiniGauge label={en ? "Queue" : "תור"} value={state.queueDepth} delta={getDelta(state.queueDepth, prevState?.queueDepth, true, en)} optBetter={compareWith?.queueDepth != null && state.queueDepth < compareWith.queueDepth} isOptimal={isOptimal} />
        )}
      </div>
    </div>
  );
}

function getGaugeCount(state) {
  let c = 0;
  if (state.latency != null) c++;
  if (state.errorRate != null) c++;
  if (state.cpuPercent != null) c++;
  if (state.throughput != null) c++;
  if (state.dbLoad != null) c++;
  if (state.queueDepth != null) c++;
  return Math.max(c, 1);
}

function MiniGauge({ label, value, delta, isOptimal = false, optBetter = false }) {
  const valueColor = isOptimal && optBetter ? "#10B981" : "var(--text-primary)";
  return (
    <div style={{
      textAlign: "center", padding: "4px 2px", borderRadius: 6,
      background: optBetter && isOptimal ? "rgba(16,185,129,0.06)" : "transparent",
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: valueColor, lineHeight: 1.3, fontFamily: MONO }}>{value}</div>
      {delta && (
        <div style={{
          fontSize: 9, fontWeight: 700, color: delta.color,
          display: "inline-flex", alignItems: "center", gap: 2,
          padding: "1px 4px", borderRadius: 3, background: `${delta.color}12`, marginTop: 2,
        }}>
          {delta.arrow} {delta.label}
        </div>
      )}
      <div style={{ fontSize: 8, color: "var(--text-dim)", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function getDelta(current, previous, lowerIsBetter, en = true) {
  if (current == null || previous == null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 1) return null;
  const isGood = lowerIsBetter ? diff < 0 : diff > 0;
  return {
    arrow: diff > 0 ? "\u2191" : "\u2193",
    label: isGood ? (en ? "Better" : "שיפור") : (en ? "Worse" : "הרעה"),
    color: isGood ? "#10B981" : "#EF4444",
  };
}
