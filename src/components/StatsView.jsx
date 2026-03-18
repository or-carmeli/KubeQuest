import { getLocalizedField } from "../utils/i18n";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LVL_ORDER = ["easy", "medium", "hard"];

function topicProgress(topicId, completedTopics) {
  let score = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (!r || !r.total) return;
    score += r.retryComplete ? 1 : Math.min(r.correct ?? 0, r.total) / r.total;
  });
  const pct = LVL_ORDER.length > 0 ? Math.min(100, Math.round((score / LVL_ORDER.length) * 100)) : 0;
  return Number.isFinite(pct) ? pct : 0;
}

function isTopicCompleted(topicId, completedTopics) {
  return LVL_ORDER.every(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    return r && r.total && (r.correct === r.total || r.retryComplete);
  });
}

function getTopicStatus(topicId, completedTopics) {
  const hasAny = LVL_ORDER.some(lvl => completedTopics[`${topicId}_${lvl}`]);
  if (!hasAny) return "not_started";
  if (isTopicCompleted(topicId, completedTopics)) return "completed";
  return "in_progress";
}

function getTopicAccuracy(topicId, topicStats, completedTopics) {
  let answered = 0, correct = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (r) { answered += (r.total || 0); correct += (r.correct || 0); }
  });
  if (answered > 0) return Math.round(correct / answered * 100);
  if (topicStats[topicId] && topicStats[topicId].answered > 0) {
    return Math.round(topicStats[topicId].correct / topicStats[topicId].answered * 100);
  }
  return 0;
}

function getTopicAnswered(topicId, topicStats, completedTopics) {
  let answered = 0;
  LVL_ORDER.forEach(lvl => {
    const r = completedTopics[`${topicId}_${lvl}`];
    if (r) answered += (r.total || 0);
  });
  if (answered > 0) return answered;
  if (topicStats[topicId] && topicStats[topicId].answered > 0) {
    return topicStats[topicId].answered;
  }
  return 0;
}

function accuracyColor(pct) {
  if (pct < 50) return "#EF4444";
  if (pct < 75) return "#F59E0B";
  return "#10B981";
}

const FREE_MODES = new Set(["mixed", "daily", "bookmarks"]);

function isFreeMode(topicId) {
  return FREE_MODES.has(topicId);
}

const INCIDENT_DIFFICULTY = {
  easy:   { label: "Easy",   labelHe: "קל",     color: "#10B981" },
  medium: { label: "Medium", labelHe: "בינוני", color: "#F59E0B" },
  hard:   { label: "Hard",   labelHe: "קשה",    color: "#EF4444" },
};

// Next XP milestone
function nextMilestone(score) {
  const milestones = [100, 250, 500, 1000, 2000, 5000];
  for (const m of milestones) if (score < m) return m;
  return Math.ceil(score / 1000) * 1000 + 1000;
}

// Find the weakest topic the user has started
function findNextGoal(topics, topicStats, completedTopics, t) {
  let weakest = null;
  let weakestAcc = 101;
  for (const topic of topics) {
    const status = getTopicStatus(topic.id, completedTopics);
    if (status === "not_started") continue;
    const acc = getTopicAccuracy(topic.id, topicStats, completedTopics);
    if (acc < 100 && acc < weakestAcc) {
      weakest = topic;
      weakestAcc = acc;
    }
  }
  if (!weakest) return null;
  const targetAcc = weakestAcc < 50 ? 70 : weakestAcc < 75 ? 85 : 100;
  return { topic: weakest, currentAcc: weakestAcc, targetAcc };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function StatsView({
  stats, completedTopics, topicStats, topics, achievements,
  unlockedAchievements, completedIncidentIds, incidents,
  dailyStreak, levelOrder, levelConfig,
  userRank, isGuest, getRankTier,
  lang, dir, t, onBack,
}) {
  const accuracy = stats.total_answered > 0
    ? Math.round(stats.total_correct / stats.total_answered * 100) : 0;
  const wrongCount = stats.total_answered - stats.total_correct;
  const availableIds = new Set(topics.map(t => t.id));
  const completedLevelCount = Object.keys(completedTopics)
    .filter(k => {
      const parts = k.split("_");
      const topicId = parts.slice(0, -1).join("_");
      return !isFreeMode(topicId) && availableIds.has(topicId);
    }).length;
  const totalLevels = topics.length * levelOrder.length;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (stats.total_answered === 0) {
    return (
      <div className="page-pad" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.3s ease", direction: dir }}>
        <button onClick={onBack} style={backBtnStyle}>
          {dir === "rtl" ? "→" : "←"} {dir === "rtl" ? "חזרה" : "Back"}
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--text-primary)", marginBottom: 8 }}>
          {t("statsTitle")}
        </h2>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {t("statsEmptyTitle")}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {t("statsEmptyBody")}
          </div>
        </div>
      </div>
    );
  }

  // ── Rank tier ────────────────────────────────────────────────────────────
  const rankPercentile = userRank ? (userRank.percentile || 0) : 0;
  const rankTopPct = Math.max(1, Math.round(100 - rankPercentile));
  const rankTier = userRank && getRankTier ? getRankTier(rankPercentile) : null;

  // ── Incident progress ─────────────────────────────────────────────────────
  const incidentsByDiff = { easy: 0, medium: 0, hard: 0 };
  const incidentsDoneByDiff = { easy: 0, medium: 0, hard: 0 };
  (incidents || []).forEach(inc => {
    if (incidentsByDiff[inc.difficulty] !== undefined) incidentsByDiff[inc.difficulty]++;
    if (completedIncidentIds.includes(inc.id) && incidentsDoneByDiff[inc.difficulty] !== undefined)
      incidentsDoneByDiff[inc.difficulty]++;
  });
  const totalIncidents = (incidents || []).length;
  const doneIncidents = completedIncidentIds.length;
  const incidentPct = totalIncidents > 0 ? Math.round(doneIncidents / totalIncidents * 100) : 0;

  const unlockedCount = achievements.filter(a => unlockedAchievements.includes(a.id)).length;
  const accColor = accuracyColor(accuracy);
  const goal = findNextGoal(topics, topicStats, completedTopics, t);
  const xpNext = nextMilestone(stats.total_score);
  const xpProgress = Math.round((stats.total_score / xpNext) * 100);

  return (
    <div className="page-pad" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px", animation: "fadeIn 0.3s ease", direction: dir }}>
      {/* ── Back button ─ */}
      <button onClick={onBack} style={backBtnStyle}>
        {dir === "rtl" ? "→" : "←"} {dir === "rtl" ? "חזרה" : "Back"}
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800, textAlign: "center", color: "var(--text-primary)", marginBottom: 24, marginTop: 0 }}>
        {t("statsTitle")}
      </h2>

      {/* ══════════════════════════════════════════════════════════════════════════
          1. HERO - Accuracy dominant, XP + Combo secondary
      ══════════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {/* Accuracy - big */}
        <div style={{
          flex: 1.3,
          background: `linear-gradient(135deg, ${accColor}14, ${accColor}06)`,
          border: `1px solid ${accColor}30`,
          borderRadius: 16,
          padding: "22px 14px 18px",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: `${accColor}08`, filter: "blur(25px)", pointerEvents: "none" }} />
          <div style={{ fontSize: 42, fontWeight: 900, color: accColor, lineHeight: 1, position: "relative", textShadow: `0 0 20px ${accColor}30` }}>{accuracy}%</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("statsAccuracy")}</div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{stats.total_correct}/{stats.total_answered}</div>
        </div>

        {/* XP + Combo stacked */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* XP with milestone progress */}
          <div style={{
            flex: 1,
            background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.03))",
            border: "1px solid rgba(245,158,11,0.22)",
            borderRadius: 14, padding: "12px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B", lineHeight: 1 }}>{stats.total_score}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{t("score")}</div>
            {/* XP milestone bar */}
            <div style={{ width: "85%", marginTop: 6 }}>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, width: `${xpProgress}%`, background: "linear-gradient(90deg, #F59E0B88, #F59E0B)", transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 8, color: "var(--text-dim)", textAlign: "center", marginTop: 2 }}>{xpNext - stats.total_score} XP {t("statsXpMilestone")}</div>
            </div>
          </div>
          {/* Combo */}
          <div style={{
            flex: 1,
            background: stats.current_streak >= 3
              ? "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))"
              : "linear-gradient(135deg, rgba(255,107,53,0.07), rgba(255,107,53,0.02))",
            border: `1px solid rgba(255,107,53,${stats.current_streak >= 3 ? "0.3" : "0.18"})`,
            borderRadius: 14, padding: "12px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: stats.current_streak >= 5 ? "0 0 12px rgba(255,107,53,0.15)" : "none",
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#FF6B35", lineHeight: 1 }}>x{stats.current_streak}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{t("streak")}</div>
            {stats.max_streak > 0 && <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{t("statsBestStreak")}: {stats.max_streak}</div>}
          </div>
        </div>
      </div>

      {/* ── Badges row ─ */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        <Badge text={`${completedLevelCount}/${totalLevels} ${t("statsCompletedLevels")}`} />
        {dailyStreak && dailyStreak.streak > 0 && (
          <Badge text={`🔥 ${dailyStreak.streak} ${t("dailyStreak")}`} accent />
        )}
        {!isGuest && userRank && (
          <Badge text={`${rankTier ? rankTier.icon : "🏆"} #${userRank.rank} - Top ${rankTopPct}%`} />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. NEXT GOAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {goal && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(168,85,247,0.05))",
          border: "1px solid rgba(0,212,255,0.18)",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>🎯</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{t("statsNextGoal")}</div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
              {t("statsImprove")} {goal.topic.name} {t("statsTo")}{goal.targetAcc}%
            </div>
            {/* Mini progress toward goal */}
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${Math.round((goal.currentAcc / goal.targetAcc) * 100)}%`,
                background: "linear-gradient(90deg, #00D4FF, #A855F7)",
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 3 }}>{goal.currentAcc}% → {goal.targetAcc}%</div>
          </div>
        </div>
      )}
      {!goal && stats.total_answered > 0 && topics.every(tp => isTopicCompleted(tp.id, completedTopics)) && (
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 14, padding: "14px 16px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ fontSize: 22 }}>🎉</div>
          <div style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>{t("statsAllPerfect")}</div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          3. TOPIC BREAKDOWN - cards with depth
      ══════════════════════════════════════════════════════════════════════════ */}
      <SectionLabel text={t("statsTopicBreakdown")} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {topics.map(topic => {
          const progress = topicProgress(topic.id, completedTopics);
          const status = getTopicStatus(topic.id, completedTopics);
          const acc = getTopicAccuracy(topic.id, topicStats, completedTopics);
          const answered = getTopicAnswered(topic.id, topicStats, completedTopics);
          const totalQ = LVL_ORDER.reduce((sum, lvl) => {
            const r = completedTopics[`${topic.id}_${lvl}`];
            return sum + (r ? (r.total || 0) : 0);
          }, 0);
          const correctQ = LVL_ORDER.reduce((sum, lvl) => {
            const r = completedTopics[`${topic.id}_${lvl}`];
            return sum + (r ? (r.correct || 0) : 0);
          }, 0);

          const statusColor = status === "completed" ? "#10B981"
            : status === "in_progress" ? "#F59E0B"
            : "var(--text-dim)";
          const isActive = status !== "not_started";

          return (
            <div key={topic.id} style={{
              background: isActive
                ? `linear-gradient(135deg, ${topic.color}08, transparent)`
                : "var(--glass-2)",
              border: `1px solid ${isActive ? `${topic.color}20` : "var(--glass-6)"}`,
              borderRadius: 14,
              padding: "16px 16px 14px",
            }}>
              {/* Header: icon + name + accuracy */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  fontSize: 20, width: 38, height: 38, borderRadius: 10,
                  background: `${topic.color}14`,
                  border: `1px solid ${topic.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{topic.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{topic.name}</div>
                  {isActive && (
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 1 }}>
                      {correctQ}/{totalQ} {t("statsCorrectAnswers")}
                    </div>
                  )}
                </div>
                {isActive ? (
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: accuracyColor(acc) }}>{acc}%</div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)" }}>{t("statsAccuracy")}</div>
                  </div>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 600, color: statusColor, background: `${statusColor}12`, padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>
                    {lang === "he" ? "לא התחיל" : "Not Started"}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: "var(--glass-5)", borderRadius: 3, marginBottom: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${topic.color}, ${topic.color}aa)`,
                  boxShadow: progress > 0 ? `0 0 8px ${topic.color}25` : "none",
                  transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: isActive ? topic.color : "var(--text-dim)", fontWeight: 600 }}>
                  {progress}%
                </span>
                <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                  {completedLevelCount > 0 && `${LVL_ORDER.filter(lvl => { const r = completedTopics[`${topic.id}_${lvl}`]; return r && r.total && (r.correct === r.total || r.retryComplete); }).length}/3 ${t("statsCompletedLevels")}`}
                </span>
              </div>

              {/* Level pills */}
              <div style={{ display: "flex", gap: 6 }}>
                {levelOrder.map(lvl => {
                  const r = completedTopics[`${topic.id}_${lvl}`];
                  const cfg = levelConfig[lvl];
                  const done = r && r.total && (r.correct === r.total || r.retryComplete);
                  const attempted = !!r;
                  return (
                    <div key={lvl} style={{
                      flex: 1, textAlign: "center",
                      fontSize: 10, padding: "5px 4px", borderRadius: 8,
                      background: done ? `${cfg.color}12` : "var(--glass-3)",
                      border: `1px solid ${done ? `${cfg.color}35` : "var(--glass-5)"}`,
                      color: done ? cfg.color : attempted ? "var(--text-secondary)" : "var(--text-dim)",
                      fontWeight: done ? 700 : 400,
                    }}>
                      <div style={{ fontSize: 13, marginBottom: 1 }}>{done ? "✓" : cfg.icon}</div>
                      {getLocalizedField(cfg, "label", lang)}
                      {attempted && r.total > 0 && (
                        <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{r.correct}/{r.total}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. ACHIEVEMENTS
      ══════════════════════════════════════════════════════════════════════════ */}
      <SectionLabel text={`${t("statsAchievements")} (${unlockedCount}/${achievements.length})`} />
      <div style={{
        background: "var(--glass-2)",
        border: "1px solid var(--glass-6)",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 28,
      }}>
        {/* Achievement progress bar */}
        <div style={{ height: 5, background: "var(--glass-5)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            width: `${Math.round(unlockedCount / achievements.length * 100)}%`,
            background: "linear-gradient(90deg, #00D4FF, #A855F7)",
            boxShadow: "0 0 8px rgba(0,212,255,0.25)",
            transition: "width 0.5s ease",
          }} />
        </div>
        {achievements.map(ach => {
          const unlocked = unlockedAchievements.includes(ach.id);
          return (
            <div key={ach.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 10px",
              background: unlocked ? "rgba(0,212,255,0.04)" : "transparent",
              border: unlocked ? "1px solid rgba(0,212,255,0.08)" : "1px solid transparent",
              borderRadius: 10, marginBottom: 3,
              opacity: unlocked ? 1 : 0.35,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, filter: unlocked ? "none" : "grayscale(1)" }}>{ach.icon}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: unlocked ? 600 : 400, color: unlocked ? "var(--text-primary)" : "var(--text-dim)" }}>
                {getLocalizedField(ach, "name", lang)}
              </span>
              {unlocked
                ? <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓</span>
                : <span style={{ fontSize: 10, color: "var(--text-disabled)" }}>🔒</span>
              }
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          5. INCIDENTS
      ══════════════════════════════════════════════════════════════════════════ */}
      {totalIncidents > 0 && (
        <>
          <SectionLabel text={t("statsIncidents")} />
          <div style={{
            background: "var(--glass-2)",
            border: "1px solid var(--glass-6)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 28,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                🚨 {t("statsIncidents")}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {doneIncidents}/{totalIncidents}
              </span>
            </div>
            <div style={{ height: 5, background: "var(--glass-5)", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${incidentPct}%`,
                background: "linear-gradient(90deg, #EF4444aa, #EF4444)",
                boxShadow: incidentPct > 0 ? "0 0 6px rgba(239,68,68,0.25)" : "none",
                transition: "width 0.5s ease",
              }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["easy", "medium", "hard"].map(diff => (
                <div key={diff} style={{
                  flex: 1, textAlign: "center",
                  padding: "6px 4px",
                  background: "var(--glass-3)",
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    {incidentsDoneByDiff[diff]}/{incidentsByDiff[diff]}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 1 }}>
                    {getLocalizedField(INCIDENT_DIFFICULTY[diff], "label", lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ text }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
      marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      {text}
    </div>
  );
}

function Badge({ text, accent }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: accent ? 700 : 500,
      color: accent ? "#F59E0B" : "var(--text-muted)",
      background: accent ? "rgba(245,158,11,0.12)" : "var(--glass-3)",
      border: `1px solid ${accent ? "rgba(245,158,11,0.25)" : "var(--glass-6)"}`,
      padding: "3px 10px",
      borderRadius: 20,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
    }}>
      {text}
    </span>
  );
}

const backBtnStyle = {
  background: "var(--glass-4)",
  border: "1px solid var(--glass-9)",
  color: "var(--text-secondary)",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 13,
  marginBottom: 20,
  display: "flex",
  alignItems: "center",
  gap: 6,
};
