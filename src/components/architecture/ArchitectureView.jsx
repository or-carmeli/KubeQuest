import { useState, useCallback, useEffect } from "react";
import { getLocalizedField } from "../../utils/i18n";
import { ARCHITECTURE_SCENARIOS } from "../../content/architectureScenarios";
import {
  calculateMetrics,
  calculateScore,
  getRank,
  loadArchitectureProgress,
  saveArchitectureResult,
  getArchitectureStats,
  analyzeDecisions,
  estimateStepCount,
  evolveSystemState,
  getSystemSeverity,
  saveSession,
  loadSession,
  clearSession,
  checkPerfectRun,
  countOutcomes,
  getDailyScenarioIndex,
  isDailyCompleted,
  markDailyCompleted,
  getArchitectureLevel,
  getDecisionInsights,
  getNearMiss,
  getNextAction,
  getQualityTier,
  generateInterviewFeedback,
  buildSystemTimeline,
  buildOptimalTimeline,
} from "../../utils/architectureLogic";
import { Eye, EyeOff, Network, Database, TrendingUp, Search, RefreshCw, Zap, Globe, CalendarDays, CheckCircle } from "lucide-react";

const SCENARIO_ICONS = {
  "rds-latency":      <Database size={18} strokeWidth={1.5} />,
  "traffic-spike":    <TrendingUp size={18} strokeWidth={1.5} />,
  "lb-misconfigured": <Search size={18} strokeWidth={1.5} />,
  "pod-crash-loop":   <RefreshCw size={18} strokeWidth={1.5} />,
  "cache-stampede":   <Zap size={18} strokeWidth={1.5} />,
  "cdn-misconfigured": <Globe size={18} strokeWidth={1.5} />,
};
import ScenarioCard from "./ScenarioCard";
import ScenarioStep from "./ScenarioStep";
import ScoreSummary from "./ScoreSummary";

export default function ArchitectureView({ lang, onBack }) {
  const dir = lang === "he" ? "rtl" : "ltr";
  const en = lang !== "he";

  const [view, setView] = useState("list");
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStepId, setCurrentStepId] = useState(null);
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [systemState, setSystemState] = useState(null);
  const [prevSystemState, setPrevSystemState] = useState(null);
  const [progress, setProgress] = useState(loadArchitectureProgress);
  const [interviewMode, setInterviewMode] = useState(false);
  const [systemStateHistory, setSystemStateHistory] = useState([]);

  // ── Session restore ──
  useEffect(() => {
    const session = loadSession();
    if (!session) return;
    const scenario = ARCHITECTURE_SCENARIOS.find(s => s.id === session.scenarioId);
    if (!scenario || !scenario.steps[session.currentStepId]) return;
    const step = scenario.steps[session.currentStepId];
    if (!step.question || !step.options?.length) return;
    setActiveScenario(scenario);
    setCurrentStepId(session.currentStepId);
    setDecisionHistory(session.decisionHistory || []);
    setSystemState(session.systemState || scenario.initialSystemState || null);
    setView("playing");
  }, []);

  useEffect(() => {
    if (view === "playing" && activeScenario && currentStepId) {
      saveSession({ scenarioId: activeScenario.id, currentStepId, decisionHistory, systemState });
    } else {
      clearSession();
    }
  }, [view, activeScenario, currentStepId, decisionHistory, systemState]);

  // ── Derived ──
  const currentStep = activeScenario ? activeScenario.steps[currentStepId] : null;
  const metrics = activeScenario
    ? calculateMetrics(activeScenario.initialMetrics, decisionHistory)
    : { performance: 50, cost: 50, reliability: 50 };
  const score = calculateScore(metrics);
  const stats = getArchitectureStats(progress);
  const archLevel = getArchitectureLevel(progress);
  const dailyIndex = getDailyScenarioIndex(ARCHITECTURE_SCENARIOS.length);
  const dailyDone = isDailyCompleted();
  const insights = getDecisionInsights(progress, lang);

  // ── Handlers ──
  const startScenario = useCallback((scenario) => {
    setActiveScenario(scenario);
    setCurrentStepId("start");
    setDecisionHistory([]);
    setSystemState(scenario.initialSystemState || null);
    setPrevSystemState(null);
    setSystemStateHistory([]);
    setView("playing");
  }, []);

  const handleDecision = useCallback((option) => {
    const tag = getLocalizedField(option, "tag", lang) || "";
    const nextStepId = option.nextStep;
    setPrevSystemState(systemState);
    const newSystemState = systemState ? evolveSystemState(systemState, option, nextStepId) : null;
    setSystemState(newSystemState);
    if (newSystemState) setSystemStateHistory(prev => [...prev, newSystemState]);

    const severity = newSystemState ? getSystemSeverity(newSystemState) : "healthy";
    const newHistory = [...decisionHistory, { impact: option.impact, nextStep: nextStepId, tag, systemSeverity: severity, operationalComplexity: option.operationalComplexity || 0 }];
    setDecisionHistory(newHistory);

    const nextStep = activeScenario.steps[nextStepId];
    if (!nextStep || !nextStep.question || nextStep.options.length === 0) {
      const finalMetrics = calculateMetrics(activeScenario.initialMetrics, newHistory);
      const finalScore = calculateScore(finalMetrics);
      const rank = getRank(finalScore);
      const updated = saveArchitectureResult(activeScenario.id, {
        score: finalScore, metrics: finalMetrics, rank, decisionCount: newHistory.length,
      });
      setProgress(updated);
      setCurrentStepId(nextStepId);
      setView("summary");
      clearSession();
      // Mark daily completion if this was the daily scenario
      if (activeScenario.id === ARCHITECTURE_SCENARIOS[dailyIndex]?.id) {
        markDailyCompleted(activeScenario.id);
      }
    } else {
      setCurrentStepId(nextStepId);
    }
  }, [decisionHistory, activeScenario, lang, systemState, dailyIndex]);

  const handleRetry = useCallback(() => {
    if (activeScenario) startScenario(activeScenario);
  }, [activeScenario, startScenario]);

  const handleBackToList = useCallback(() => {
    setView("list");
    setActiveScenario(null);
    setCurrentStepId(null);
    setDecisionHistory([]);
    setSystemState(null);
    setProgress(loadArchitectureProgress());
    clearSession();
  }, []);

  const handleStartById = useCallback((scenarioId) => {
    const s = ARCHITECTURE_SCENARIOS.find(x => x.id === scenarioId);
    if (s) startScenario(s);
  }, [startScenario]);

  // ── Summary engagement data ──
  const analysis = view === "summary" ? analyzeDecisions(decisionHistory, lang) : null;
  const perfectRun = view === "summary" && activeScenario
    ? checkPerfectRun(activeScenario.id, currentStepId, decisionHistory) : null;
  const outcomeCount = view === "summary" && activeScenario ? countOutcomes(activeScenario) : 0;
  const nearMiss = view === "summary" ? getNearMiss(score) : null;
  const nextAction = view === "summary" && activeScenario
    ? getNextAction(activeScenario.id, progress, ARCHITECTURE_SCENARIOS, lang) : null;
  const qualityTier = view === "summary" ? getQualityTier(score) : null;
  const interviewFeedback = view === "summary" && activeScenario
    ? generateInterviewFeedback(decisionHistory, metrics, currentStep, lang) : null;
  const sysTimeline = view === "summary" && activeScenario
    ? buildSystemTimeline(activeScenario.initialSystemState, decisionHistory, systemStateHistory) : null;
  const optimalData = view === "summary" && activeScenario
    ? buildOptimalTimeline(activeScenario) : null;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "24px 20px", animation: "fadeIn 0.3s ease", direction: dir }}>

      <button
        onClick={view === "list" ? onBack : handleBackToList}
        style={{
          background: "var(--glass-4)", border: "1px solid var(--glass-9)", color: "var(--text-secondary)",
          width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}
      >
        <span aria-hidden="true">{dir === "rtl" ? "→" : "←"}</span>
      </button>

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <Network size={22} strokeWidth={1.5} style={{ color: "#A855F7", opacity: 0.7, flexShrink: 0 }} />
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "var(--text-bright)" }}>
                {en ? "Architecture Scenarios" : "תרחישי ארכיטקטורה"}
              </h2>
              {/* Architecture Level badge */}
              {archLevel.xp > 0 && (
                <span style={{
                  background: "rgba(168,85,247,0.12)", color: "#C084FC", fontSize: 10,
                  fontWeight: 800, padding: "3px 10px", borderRadius: 8, letterSpacing: 0.5,
                  border: "1px solid rgba(168,85,247,0.2)",
                }}>
                  {archLevel.level.label} {en ? archLevel.level.labelFull : archLevel.level.labelFullHe}
                  {archLevel.nextLevel && (
                    <span style={{ color: "var(--text-dim)", fontWeight: 600, marginInlineStart: 6 }}>
                      {archLevel.xpToNext} XP {en ? "to" : "ל-"}{archLevel.nextLevel.label}
                    </span>
                  )}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {en
                ? "Real-world infrastructure decision simulations. Every choice affects performance, cost, and reliability."
                : "סימולציות של קבלת החלטות ארכיטקטוניות מהעולם האמיתי. כל החלטה משפיעה על ביצועים, עלות ואמינות."}
            </p>
          </div>

          {/* Interview Mode Toggle */}
          <button
            onClick={() => setInterviewMode(m => !m)}
            style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              background: interviewMode ? "rgba(168,85,247,0.08)" : "var(--glass-3)",
              border: `1px solid ${interviewMode ? "rgba(168,85,247,0.25)" : "var(--glass-8)"}`,
              color: interviewMode ? "#C084FC" : "var(--text-secondary)",
              fontSize: 12, fontWeight: 600, transition: "all 0.2s ease",
              direction: en ? "ltr" : "rtl",
            }}
          >
            {interviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{en ? "Interview Mode" : "מצב ראיון"}</span>
            <span style={{
              padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700,
              background: interviewMode ? "rgba(168,85,247,0.15)" : "var(--glass-6)",
              color: interviewMode ? "#C084FC" : "var(--text-dim)",
            }}>
              {interviewMode ? "ON" : "OFF"}
            </span>
          </button>
          {interviewMode && (
            <div style={{
              fontSize: 11, color: "var(--text-dim)", marginBottom: 14, marginTop: -10,
              paddingInlineStart: 14,
            }}>
              {en
                ? "Scores and feedback hidden during gameplay. Full analysis revealed in summary."
                : "ציונים ומשוב מוסתרים במהלך המשחק. ניתוח מלא נחשף בסיכום."}
            </div>
          )}

          {/* Stats row */}
          {stats.completed > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <MiniStat label={en ? "Completed" : "הושלמו"} value={stats.completed} />
              <MiniStat label={en ? "Avg Score" : "ממוצע"} value={stats.avgScore} />
              <MiniStat label={en ? "Best" : "שיא"} value={stats.bestScore} />
              <MiniStat label={en ? "Attempts" : "ניסיונות"} value={stats.totalAttempts} />
            </div>
          )}

          {/* Decision insights */}
          {insights && insights.length > 0 && (
            <div style={{
              background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                {en ? "Your Decision Profile" : "פרופיל ההחלטות שלך"}
              </div>
              {insights.map((insight, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: i < insights.length - 1 ? 4 : 0 }}>
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Daily scenario highlight */}
          {ARCHITECTURE_SCENARIOS[dailyIndex] && (
            <div style={{
              background: dailyDone ? "rgba(16,185,129,0.04)" : "rgba(245,158,11,0.04)",
              border: `1px solid ${dailyDone ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
              borderRadius: 12, padding: "10px 14px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10, cursor: dailyDone ? "default" : "pointer",
              direction: en ? "ltr" : "rtl",
            }}
              onClick={dailyDone ? undefined : () => startScenario(ARCHITECTURE_SCENARIOS[dailyIndex])}
            >
              <span style={{ display: "flex", alignItems: "center", color: dailyDone ? "#10B981" : "#F59E0B" }}>{dailyDone ? <CheckCircle size={18} strokeWidth={2} /> : <CalendarDays size={18} strokeWidth={1.5} />}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: dailyDone ? "#10B981" : "#F59E0B" }}>
                  {en ? "Daily Scenario" : "תרחיש יומי"}
                  {dailyDone && <span style={{ fontWeight: 500, marginInlineStart: 6 }}>{en ? "Completed" : "הושלם"}</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {getLocalizedField(ARCHITECTURE_SCENARIOS[dailyIndex], "title", lang)}
                </div>
              </div>
              {!dailyDone && (
                <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>{en ? "Start →" : "התחל ←"}</span>
              )}
            </div>
          )}

          {/* Progress indicator */}
          {(() => {
            const completed = ARCHITECTURE_SCENARIOS.filter(s => progress[s.id]).length;
            const total = ARCHITECTURE_SCENARIOS.length;
            return completed > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                    {en ? "Progress" : "התקדמות"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Fira Code',monospace" }}>
                    {completed} / {total}
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--glass-6)", overflow: "hidden" }}>
                  <div style={{
                    width: `${(completed / total) * 100}%`, height: "100%", borderRadius: 3,
                    background: completed === total ? "#10B981" : "#A855F7",
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })()}

          {/* Scenario cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ARCHITECTURE_SCENARIOS.map((scenario, i) => {
              // Unlock: first scenario always unlocked, others require previous completed
              const isUnlocked = i === 0 || !!progress[ARCHITECTURE_SCENARIOS[i - 1]?.id];
              return (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  lang={lang}
                  onStart={() => startScenario(scenario)}
                  bestScore={progress[scenario.id]?.score}
                  attempts={progress[scenario.id]?.attempts}
                  isDaily={i === dailyIndex}
                  locked={!isUnlocked}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ── PLAYING VIEW ── */}
      {view === "playing" && currentStep && (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
            padding: "10px 16px", background: "var(--glass-3)", borderRadius: 12,
            border: "1px solid var(--glass-6)",
          }}>
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>{SCENARIO_ICONS[activeScenario.id] || <Database size={18} strokeWidth={1.5} />}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-bright)" }}>
                {getLocalizedField(activeScenario, "title", lang)}
              </div>
            </div>
          </div>

          <ScenarioStep
            key={currentStepId}
            step={currentStep}
            metrics={metrics}
            systemState={systemState}
            prevSystemState={prevSystemState}
            onDecision={handleDecision}
            lang={lang}
            stepNumber={decisionHistory.length + 1}
            estimatedTotal={estimateStepCount(activeScenario)}
            interviewMode={interviewMode}
          />
        </>
      )}

      {/* ── SUMMARY VIEW ── */}
      {view === "summary" && (
        <>
          {currentStep && (
            <div style={{
              background: "var(--glass-3)", border: "1px solid var(--glass-8)", borderRadius: 14,
              padding: "18px 20px", marginBottom: 24, lineHeight: 1.7,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase" }}>
                {en ? "Final Outcome" : "תוצאה סופית"}
              </div>
              <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
                {getLocalizedField(currentStep, "context", lang)}
              </div>
            </div>
          )}

          <ScoreSummary
            score={score}
            metrics={metrics}
            decisionCount={decisionHistory.length}
            lang={lang}
            onBack={handleBackToList}
            onRetry={handleRetry}
            analysis={analysis}
            perfectRun={perfectRun}
            outcomeCount={outcomeCount}
            nearMiss={nearMiss}
            nextAction={nextAction}
            onNextAction={handleStartById}
            qualityTier={qualityTier}
            interviewFeedback={interviewFeedback}
            systemTimeline={sysTimeline}
            terminalStep={currentStep}
            decisionHistory={decisionHistory}
            optimalData={optimalData}
          />
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{
      background: "var(--glass-3)", border: "1px solid var(--glass-8)",
      borderRadius: 10, padding: "8px 16px", textAlign: "center", flex: "1 1 0",
      minWidth: 72,
    }}>
      <div style={{ fontSize: 17, fontWeight: 900, color: "var(--text-bright)" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
