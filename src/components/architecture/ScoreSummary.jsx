import { useState } from "react";
import { getRank } from "../../utils/architectureLogic";
import { Zap, Wallet, ShieldCheck, TrendingUp, Server, DollarSign, Wrench, User, Settings, Code, Landmark, Crown, ChevronDown, RotateCcw, Share2, Linkedin, MessageCircle, Copy, Check } from "lucide-react";
import { getLocalizedField } from "../../utils/i18n";
import IncidentReplay from "./IncidentReplay";

const MONO = "'Fira Code','Courier New',monospace";

const RANK_ICONS = {
  beginner:  <User size={32} strokeWidth={1.5} />,
  operator:  <Settings size={32} strokeWidth={1.5} />,
  engineer:  <Code size={32} strokeWidth={1.5} />,
  architect: <Landmark size={32} strokeWidth={1.5} />,
  principal: <Crown size={32} strokeWidth={1.5} />,
};

export default function ScoreSummary({
  score, metrics, decisionCount, lang, onBack, onRetry, analysis,
  perfectRun, outcomeCount, nearMiss, nextAction, onNextAction,
  qualityTier, interviewFeedback, systemTimeline, terminalStep,
  decisionHistory, optimalData,
}) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const rank = getRank(score);
  const en = lang !== "he";
  const [showReplay, setShowReplay] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const fillColor = (v) => v >= 65 ? "#10B981" : v >= 40 ? "#F59E0B" : "#EF4444";
  const timeline = analysis?.timeline || [];
  const turningPoint = analysis?.turningPoint ?? -1;

  const tierLabel = qualityTier ? (en ? qualityTier.label : qualityTier.labelHe) : "";
  const shareText = en
    ? `I scored ${score} (${tierLabel}) on a DevOps architecture scenario - KubeQuest`
    : `השגתי ${score} (${tierLabel}) בתרחיש ארכיטקטורה DevOps - KubeQuest`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: "https://kubequest.online" }); } catch {}
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${shareText}\nhttps://kubequest.online`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease", direction: dir, maxWidth: 540, margin: "0 auto" }}>

      {/* ── HERO: Score centered ── */}
      <div style={{
        textAlign: "center", padding: "24px 20px 20px",
        background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 16,
        marginBottom: 10,
      }}>
        {/* Rank icon */}
        <div style={{ color: "#A855F7", display: "flex", justifyContent: "center", marginBottom: 6 }}>
          {RANK_ICONS[rank.icon] || <User size={32} strokeWidth={1.5} />}
        </div>

        {/* Score */}
        <div style={{ fontSize: 48, fontWeight: 900, color: "#A855F7", lineHeight: 1, marginBottom: 4, fontFamily: MONO }}>
          {score}
        </div>

        {/* Rank + tier */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-bright)", marginBottom: 4 }}>
          {en ? rank.label : rank.labelHe}
        </div>
        {qualityTier && (
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: 6,
            background: `${qualityTier.color}12`, border: `1px solid ${qualityTier.color}33`,
            fontSize: 11, fontWeight: 700, color: qualityTier.color,
          }}>
            {en ? qualityTier.label : qualityTier.labelHe}
          </span>
        )}
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
          {en ? `${decisionCount} decisions` : `${decisionCount} החלטות`}
        </div>

        {/* Badges */}
        {(nearMiss || perfectRun?.isPerfect || (perfectRun && !perfectRun.isPerfect && perfectRun.stepsFromOptimal != null)) && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
            {perfectRun?.isPerfect && <Badge color="#10B981">{en ? "Optimal path" : "מסלול אופטימלי"}</Badge>}
            {perfectRun && !perfectRun.isPerfect && perfectRun.stepsFromOptimal != null && (
              <Badge color="#F59E0B">{en ? `${perfectRun.stepsFromOptimal} from optimal` : `${perfectRun.stepsFromOptimal} מהאופטימלי`}</Badge>
            )}
            {nearMiss && (
              <Badge color="#C084FC">{en ? `${nearMiss.pointsNeeded}pt from ${nearMiss.nextRank.label}` : `${nearMiss.pointsNeeded} נק׳ מ${nearMiss.nextRank.labelHe}`}</Badge>
            )}
          </div>
        )}

        {/* Metrics: horizontal 3-column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 14 }}>
          <CompactMetric icon={<Zap size={11} />} label="Performance" value={metrics.performance} fillColor={fillColor} />
          <CompactMetric icon={<Wallet size={11} />} label="Cost" value={metrics.cost} fillColor={fillColor} />
          <CompactMetric icon={<ShieldCheck size={11} />} label="Reliability" value={metrics.reliability} fillColor={fillColor} />
        </div>
      </div>

      {/* ── ROOT CAUSE + FIX ── */}
      {interviewFeedback?.rootCause && (
        <div style={{
          background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 12,
          padding: "14px 16px", marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
            Root Cause
          </div>
          <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: interviewFeedback.productionSolution ? 10 : 0 }}>
            {interviewFeedback.rootCause}
          </div>
          {interviewFeedback.productionSolution && (
            <>
              <div style={{ borderTop: "1px solid var(--glass-6)", marginBottom: 6 }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
                Best Fix
              </div>
              <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.7 }}>
                {interviewFeedback.productionSolution}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ACTIONS ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={onRetry} style={{
          flex: 1, padding: "12px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #7C3AED, #A855F7)",
          color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          {perfectRun?.isPerfect ? (en ? "Try Different Path" : "נסה מסלול אחר") : (en ? "Optimize Run" : "שפר מסלול")}
        </button>
        {systemTimeline?.length > 1 && (
          <button onClick={() => setShowReplay(r => !r)} style={{
            padding: "12px 14px", borderRadius: 10, cursor: "pointer",
            background: showReplay ? "rgba(168,85,247,0.08)" : "var(--glass-4)",
            border: `1px solid ${showReplay ? "rgba(168,85,247,0.2)" : "var(--glass-8)"}`,
            color: showReplay ? "#C084FC" : "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
          }}>
            <RotateCcw size={13} />
            {en ? "Replay" : "שחזור"}
          </button>
        )}
      </div>

      {/* Secondary actions row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {nextAction && onNextAction && (
          <button onClick={() => onNextAction(nextAction.scenarioId)} style={{
            flex: 1, padding: "10px", borderRadius: 10,
            border: "1px solid rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.05)",
            color: "#C084FC", fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>
            {nextAction.text}
          </button>
        )}
        <button onClick={onBack} style={{
          flex: nextAction ? undefined : 1, padding: "10px 14px", borderRadius: 10,
          border: "1px solid var(--glass-10)", background: "var(--glass-3)",
          color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>
          {en ? "Back" : "חזרה"}
        </button>
      </div>

      {/* ── SHARE ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
        padding: "8px 12px", background: "var(--glass-2)", borderRadius: 10,
        border: "1px solid var(--glass-5)",
      }}>
        <Share2 size={12} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: 600, flexShrink: 0 }}>
          {en ? "Share" : "שתף"}
        </span>
        <div style={{ flex: 1 }} />
        {typeof navigator !== "undefined" && navigator.share && (
          <ShareBtn onClick={handleShare} label={en ? "Share" : "שתף"}>
            <Share2 size={12} />
          </ShareBtn>
        )}
        <ShareBtn
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://kubequest.online")}`, "_blank", "width=600,height=400")}
          label="LinkedIn"
        >
          <Linkedin size={12} />
        </ShareBtn>
        <ShareBtn
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\nhttps://kubequest.online")}`, "_blank")}
          label="WhatsApp"
        >
          <MessageCircle size={12} />
        </ShareBtn>
        <ShareBtn onClick={handleCopy} label={copied ? (en ? "Copied" : "הועתק") : (en ? "Copy" : "העתק")}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </ShareBtn>
      </div>

      {/* ── REPLAY (collapsible) ── */}
      {showReplay && (
        <IncidentReplay
          systemTimeline={systemTimeline}
          decisionHistory={decisionHistory}
          optimalData={optimalData}
          lang={lang}
          turningPointIndex={interviewFeedback?.turningPointIndex ?? -1}
          interviewFeedback={interviewFeedback}
        />
      )}

      {/* ── DETAILED ANALYSIS (collapsible) ── */}
      <CollapsibleSection
        title={en ? "Detailed Analysis" : "ניתוח מפורט"}
        open={showDetails}
        onToggle={() => setShowDetails(d => !d)}
      >
        {interviewFeedback?.dimensions && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel>{en ? "Architecture Evaluation" : "Architecture Evaluation"}</SectionLabel>
            <MetricBar label="Scalability" icon={<TrendingUp size={12} />} value={interviewFeedback.dimensions.scalability} fillColor={fillColor} />
            <MetricBar label="Reliability" icon={<Server size={12} />} value={interviewFeedback.dimensions.reliability} fillColor={fillColor} />
            <MetricBar label="Cost Efficiency" icon={<DollarSign size={12} />} value={interviewFeedback.dimensions.costEfficiency} fillColor={fillColor} />
            <MetricBar label="Operational Safety" icon={<Wrench size={12} />} value={interviewFeedback.dimensions.operationalRisk} fillColor={fillColor} />
          </div>
        )}

        {timeline.length > 1 && (
          <div style={{ marginBottom: 14 }}>
            <SectionLabel>{en ? "Decision Timeline" : "ציר זמן החלטות"}</SectionLabel>
            {timeline.map((entry, i) => {
              const isLast = i === timeline.length - 1;
              const isTurning = i === turningPoint;
              const dotColor = entry.severity === "critical" ? "#EF4444"
                : entry.severity === "degraded" ? "#F59E0B"
                : entry.net > 5 ? "#10B981" : entry.net < -5 ? "#EF4444" : "#F59E0B";
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, minHeight: 30 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, boxShadow: isTurning ? `0 0 8px ${dotColor}80` : "none" }} />
                    {!isLast && <div style={{ width: 1.5, flex: 1, minHeight: 12, background: "var(--glass-10)" }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 4, flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>{en ? "D" : "ה"}{entry.index + 1}</span>
                      {entry.net !== 0 && <span style={{ fontSize: 10, fontWeight: 700, color: entry.net > 0 ? "#10B981" : "#EF4444" }}>{entry.net > 0 ? "+" : ""}{entry.net}</span>}
                      {entry.tag && <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{entry.tag}</span>}
                      {isTurning && <span style={{ fontSize: 8, fontWeight: 700, color: "#A855F7", background: "rgba(168,85,247,0.12)", padding: "1px 5px", borderRadius: 3 }}>TP</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {analysis?.narrative && (
          <div>
            <SectionLabel>{en ? "Analysis" : "ניתוח"}</SectionLabel>
            <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.7, marginBottom: 8 }}>{analysis.narrative}</div>
            {analysis.best && analysis.worst && analysis.best.index !== analysis.worst.index && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                {analysis.best.net > 0 && analysis.best.tag && (
                  <div style={{ fontSize: 11, display: "flex", gap: 5 }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>{en ? "Strong:" : "חזקה:"}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{en ? "D" : "ה"}{analysis.best.index + 1} - {analysis.best.tag}</span>
                  </div>
                )}
                {analysis.worst.net < 0 && analysis.worst.tag && (
                  <div style={{ fontSize: 11, display: "flex", gap: 5 }}>
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>{en ? "Improve:" : "שיפור:"}</span>
                    <span style={{ color: "var(--text-secondary)" }}>{en ? "D" : "ה"}{analysis.worst.index + 1} - {analysis.worst.tag}</span>
                  </div>
                )}
              </div>
            )}
            {analysis.tip && (
              <div style={{
                background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)",
                borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6,
              }}>
                <span style={{ fontWeight: 700, color: "#A855F7" }}>{en ? "Tip: " : "טיפ: "}</span>{analysis.tip}
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <div style={{ background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8,
        padding: "11px 16px", background: "none", border: "none",
        cursor: "pointer", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
      }}>
        <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
        {title}
      </button>
      {open && <div style={{ padding: "0 16px 14px", animation: "fadeIn 0.2s ease" }}>{children}</div>}
    </div>
  );
}

function CompactMetric({ icon, label, value, fillColor }) {
  const color = fillColor(value);
  return (
    <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 8, background: `${color}08`, border: `1px solid ${color}20` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 2 }}>
        <span style={{ color, display: "flex" }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: MONO }}>{value}</span>
      </div>
      <div style={{ fontSize: 8, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: `${color}12`, border: `1px solid ${color}25`, color }}>
      {children}
    </span>
  );
}

function ShareBtn({ onClick, label, children }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6,
      background: "var(--glass-4)", border: "1px solid var(--glass-8)",
      color: "var(--text-muted)", cursor: "pointer", fontSize: 10, fontWeight: 600,
      transition: "background 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = "var(--glass-8)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "var(--glass-4)"; }}
    >
      {children}
    </button>
  );
}

function MetricBar({ label, icon, value, fillColor }) {
  return (
    <div style={{ marginBottom: 8, direction: "ltr", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{icon} {label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: fillColor(value) }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--glass-6)", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 2, background: fillColor(value), transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}
