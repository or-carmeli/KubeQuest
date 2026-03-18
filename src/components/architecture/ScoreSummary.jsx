import { getRank, getNearMiss, RANKS } from "../../utils/architectureLogic";

export default function ScoreSummary({
  score, metrics, decisionCount, lang, onBack, onRetry, analysis,
  perfectRun, outcomeCount, nearMiss, nextAction, onNextAction,
}) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const rank = getRank(score);
  const en = lang !== "he";

  const fillColor = (value) =>
    value >= 65 ? "#10B981" : value >= 40 ? "#F59E0B" : "#EF4444";

  const timeline = analysis?.timeline || [];
  const turningPoint = analysis?.turningPoint ?? -1;

  return (
    <div style={{ animation: "fadeIn 0.4s ease", direction: dir, maxWidth: 540, margin: "0 auto" }}>
      {/* Rank + Score */}
      <div style={{
        textAlign: "center", marginBottom: 24, padding: "28px 20px",
        background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 20,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{rank.icon}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          {en ? "Rank" : "דרגה"}
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-bright)", marginBottom: 2 }}>
          {en ? rank.label : rank.labelHe}
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#A855F7", lineHeight: 1.2 }}>
          {score}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {en ? `${decisionCount} decisions` : `${decisionCount} החלטות`}
        </div>

        {/* Near-miss nudge */}
        {nearMiss && (
          <div style={{
            marginTop: 12, padding: "6px 14px", borderRadius: 8,
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)",
            fontSize: 12, color: "#C084FC", fontWeight: 600,
          }}>
            {en
              ? `${nearMiss.pointsNeeded} point${nearMiss.pointsNeeded > 1 ? "s" : ""} from ${nearMiss.nextRank.label}`
              : `${nearMiss.pointsNeeded} ${nearMiss.pointsNeeded > 1 ? "נקודות" : "נקודה"} מ${nearMiss.nextRank.labelHe}`}
          </div>
        )}

        {/* Perfect run indicator */}
        {perfectRun?.isPerfect && (
          <div style={{
            marginTop: 10, padding: "6px 14px", borderRadius: 8,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
            fontSize: 12, color: "#10B981", fontWeight: 700,
          }}>
            {en ? "Optimal path" : "מסלול אופטימלי"}
          </div>
        )}
        {perfectRun && !perfectRun.isPerfect && perfectRun.stepsFromOptimal != null && (
          <div style={{
            marginTop: 10, padding: "6px 14px", borderRadius: 8,
            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
            fontSize: 12, color: "#F59E0B", fontWeight: 600,
          }}>
            {en
              ? `${perfectRun.stepsFromOptimal} decision${perfectRun.stepsFromOptimal > 1 ? "s" : ""} from optimal`
              : `${perfectRun.stepsFromOptimal} ${perfectRun.stepsFromOptimal > 1 ? "החלטות" : "החלטה"} מהאופטימלי`}
          </div>
        )}
      </div>

      {/* Outcome indicator */}
      {outcomeCount > 1 && (
        <div style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 12,
          padding: "12px 16px", marginBottom: 16, textAlign: "center",
          fontSize: 12, color: "var(--text-muted)",
        }}>
          {en
            ? `You reached 1 of ${outcomeCount} possible outcomes`
            : `הגעת ל-1 מתוך ${outcomeCount} תוצאות אפשריות`}
          {!perfectRun?.isPerfect && (
            <span style={{ color: "#A855F7", fontWeight: 600, marginInlineStart: 6 }}>
              {en ? "-- can you find the optimal one?" : "-- תוכל למצוא את האופטימלית?"}
            </span>
          )}
        </div>
      )}

      {/* Metrics */}
      <div style={{
        background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 16,
        padding: "18px 20px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-bright)", marginBottom: 14 }}>
          {en ? "Final System Metrics" : "מדדי מערכת סופיים"}
        </div>
        <MetricBar label={en ? "Performance" : "ביצועים"} icon="⚡" value={metrics.performance} fillColor={fillColor} />
        <MetricBar label={en ? "Cost Efficiency" : "יעילות עלות"} icon="💰" value={metrics.cost} fillColor={fillColor} />
        <MetricBar label={en ? "Reliability" : "אמינות"} icon="🛡️" value={metrics.reliability} fillColor={fillColor} />
      </div>

      {/* Decision Timeline */}
      {timeline.length > 1 && (
        <div style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 16,
          padding: "18px 20px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 14 }}>
            {en ? "Decision Timeline" : "ציר זמן החלטות"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {timeline.map((entry, i) => {
              const isLast = i === timeline.length - 1;
              const isTurning = i === turningPoint;
              const dotColor = entry.severity === "critical" ? "#EF4444"
                : entry.severity === "degraded" ? "#F59E0B"
                : entry.net > 5 ? "#10B981"
                : entry.net < -5 ? "#EF4444"
                : "#F59E0B";
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, minHeight: 36 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 16 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", background: dotColor,
                      boxShadow: isTurning ? `0 0 10px ${dotColor}80` : "none",
                      border: isTurning ? `2px solid ${dotColor}` : "none", flexShrink: 0,
                    }} />
                    {!isLast && <div style={{ width: 2, flex: 1, minHeight: 16, background: "var(--glass-10)" }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 8, flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>
                        {en ? "Decision" : "החלטה"} {entry.index + 1}
                      </span>
                      {entry.net !== 0 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: entry.net > 0 ? "#10B981" : "#EF4444" }}>
                          {entry.net > 0 ? "+" : ""}{entry.net}
                        </span>
                      )}
                      {isTurning && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#A855F7", background: "rgba(168,85,247,0.12)", padding: "1px 6px", borderRadius: 4 }}>
                          {en ? "Turning point" : "נקודת מפנה"}
                        </span>
                      )}
                    </div>
                    {entry.tag && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{entry.tag}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative */}
      {analysis?.narrative && (
        <div style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 16,
          padding: "18px 20px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
            {en ? "Analysis" : "ניתוח"}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 14 }}>
            {analysis.narrative}
          </div>
          {analysis.best && analysis.worst && analysis.best.index !== analysis.worst.index && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {analysis.best.net > 0 && analysis.best.tag && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "#10B981", fontWeight: 700, flexShrink: 0 }}>{en ? "Strong decision:" : "החלטה חזקה:"}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{en ? "Decision" : "החלטה"} {analysis.best.index + 1} -- {analysis.best.tag}</span>
                </div>
              )}
              {analysis.worst.net < 0 && analysis.worst.tag && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                  <span style={{ color: "#EF4444", fontWeight: 700, flexShrink: 0 }}>{en ? "Area to improve:" : "נקודת שיפור:"}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{en ? "Decision" : "החלטה"} {analysis.worst.index + 1} -- {analysis.worst.tag}</span>
                </div>
              )}
            </div>
          )}
          {analysis.tip && (
            <div style={{
              background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)",
              borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
            }}>
              <span style={{ fontWeight: 700, color: "#A855F7" }}>{en ? "Next time: " : "לפעם הבאה: "}</span>
              {analysis.tip}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
        {/* Primary CTA: optimize or try different path */}
        <button
          onClick={onRetry}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          {perfectRun?.isPerfect
            ? (en ? "Try a Different Path" : "נסה מסלול אחר")
            : (en ? "Optimize Your Run" : "שפר את המסלול")}
        </button>

        {/* Next action suggestion */}
        {nextAction && onNextAction && (
          <button
            onClick={() => onNextAction(nextAction.scenarioId)}
            style={{
              width: "100%", padding: "13px", borderRadius: 12,
              border: "1px solid rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.05)",
              color: "#C084FC", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {nextAction.text}
          </button>
        )}

        <button
          onClick={onBack}
          style={{
            width: "100%", padding: "13px", borderRadius: 12,
            border: "1px solid var(--glass-10)", background: "var(--glass-3)",
            color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          {en ? "Back to Scenarios" : "חזרה לתרחישים"}
        </button>
      </div>
    </div>
  );
}

function MetricBar({ label, icon, value, fillColor }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{icon} {label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: fillColor(value) }}>{value}</span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "var(--glass-6)", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 4, background: fillColor(value), transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}
