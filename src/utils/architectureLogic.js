// ── Architecture Scenarios: scoring, ranking, persistence, analysis ─────────
import { safeGetItem } from "./storage";

const STORAGE_KEY = "kq_architecture_v1";
const SESSION_KEY = "kq_architecture_session_v1";

// ── System State ───────────────────────────────────────────────────────────

/**
 * Evolve system state after a decision.
 * Applies immediate stateEffect + processes any delayed consequences
 * that were queued by previous decisions.
 */
export function evolveSystemState(prevState, option, stepId) {
  const state = JSON.parse(JSON.stringify(prevState)); // deep clone

  // Apply the option's immediate state effect
  if (option.stateEffect) {
    for (const [key, value] of Object.entries(option.stateEffect)) {
      if (key === "pendingConsequences") {
        // Queue delayed consequences for later steps
        state.pendingConsequences = [...(state.pendingConsequences || []), ...value];
      } else if (typeof value === "number" && typeof state[key] === "number") {
        state[key] = value; // absolute set
      } else if (typeof value === "string" || typeof value === "boolean") {
        state[key] = value;
      }
    }
  }

  // Process pending consequences that trigger at this step
  if (state.pendingConsequences?.length) {
    const remaining = [];
    for (const consequence of state.pendingConsequences) {
      if (consequence.triggerAt === stepId || consequence.triggerAt === "*") {
        // Apply the delayed effect
        for (const [key, value] of Object.entries(consequence.effect)) {
          if (typeof value === "number" && typeof state[key] === "number") {
            state[key] = value;
          } else {
            state[key] = value;
          }
        }
      } else {
        remaining.push(consequence);
      }
    }
    state.pendingConsequences = remaining;
  }

  return state;
}

/**
 * Determine system status severity from state values.
 * Returns: "healthy" | "degraded" | "critical"
 */
export function getSystemSeverity(state) {
  if (!state) return "healthy";
  if (state.errorRate >= 20 || state.latency >= 5000 || state.stability === "down") return "critical";
  if (state.errorRate >= 5 || state.latency >= 2000 || state.stability === "degraded") return "degraded";
  return "healthy";
}

// ── Scoring ────────────────────────────────────────────────────────────────

export function calculateMetrics(initialMetrics, decisionHistory) {
  const metrics = { ...initialMetrics };
  for (const decision of decisionHistory) {
    if (decision.impact) {
      for (const key of ["performance", "cost", "reliability"]) {
        const raw = decision.impact[key] || 0;
        const adjusted = raw < 0 ? raw * 0.8 : raw;
        metrics[key] = clamp(metrics[key] + adjusted, 0, 100);
      }
    }
  }
  metrics.performance = Math.round(metrics.performance);
  metrics.cost = Math.round(metrics.cost);
  metrics.reliability = Math.round(metrics.reliability);
  return metrics;
}

export function calculateScore(metrics) {
  const raw = metrics.performance * 0.35 + metrics.cost * 0.30 + metrics.reliability * 0.35;
  return Math.round(clamp(raw, 0, 100));
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ── Ranking ────────────────────────────────────────────────────────────────

const RANKS = [
  { threshold: 0,  label: "Beginner",  labelHe: "מתחיל",       icon: "beginner" },
  { threshold: 30, label: "Operator",  labelHe: "מפעיל",       icon: "operator" },
  { threshold: 50, label: "Engineer",  labelHe: "מהנדס",       icon: "engineer" },
  { threshold: 70, label: "Architect", labelHe: "ארכיטקט",     icon: "architect" },
  { threshold: 90, label: "Principal", labelHe: "ארכיטקט ראשי", icon: "principal" },
];

export function getRank(score) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (score >= r.threshold) rank = r;
  }
  return rank;
}

export { RANKS };

// ── Decision Analysis (with timeline) ──────────────────────────────────────

export function analyzeDecisions(decisionHistory, lang) {
  if (!decisionHistory.length) return { best: null, worst: null, narrative: "", tip: "", timeline: [], turningPoint: -1 };

  const en = lang !== "he";

  // Build timeline with running score direction
  const timeline = [];
  let runningNet = 0;
  let bestIdx = 0, worstIdx = 0;
  let bestNet = -Infinity, worstNet = Infinity;
  let turningPoint = -1;
  let prevDirection = 0; // +1 improving, -1 degrading

  for (let i = 0; i < decisionHistory.length; i++) {
    const d = decisionHistory[i];
    const net = (d.impact?.performance || 0) + (d.impact?.cost || 0) + (d.impact?.reliability || 0);
    runningNet += net;

    const direction = net > 3 ? 1 : net < -3 ? -1 : 0;
    if (prevDirection !== 0 && direction !== 0 && direction !== prevDirection && turningPoint === -1) {
      turningPoint = i;
    }
    if (direction !== 0) prevDirection = direction;

    timeline.push({
      index: i,
      tag: d.tag || "",
      net,
      runningNet,
      severity: d.systemSeverity || "healthy",
    });

    if (net > bestNet) { bestNet = net; bestIdx = i; }
    if (net < worstNet) { worstNet = net; worstIdx = i; }
  }

  const best = { index: bestIdx, net: bestNet, tag: decisionHistory[bestIdx]?.tag || "" };
  const worst = { index: worstIdx, net: worstNet, tag: decisionHistory[worstIdx]?.tag || "" };

  const totalPerf = decisionHistory.reduce((s, d) => s + (d.impact?.performance || 0), 0);
  const totalCost = decisionHistory.reduce((s, d) => s + (d.impact?.cost || 0), 0);
  const totalRel = decisionHistory.reduce((s, d) => s + (d.impact?.reliability || 0), 0);

  let narrative = "";
  let tip = "";

  const strongest = Math.max(totalPerf, totalCost, totalRel);
  const weakest = Math.min(totalPerf, totalCost, totalRel);

  if (strongest === totalPerf && weakest === totalCost) {
    narrative = en
      ? "You prioritized system performance but at significant cost to budget efficiency. The infrastructure changes improved throughput, but the cost/benefit ratio suggests over-provisioning."
      : "נתת עדיפות לביצועי המערכת אבל במחיר משמעותי ליעילות התקציב. שינויי התשתית שיפרו תפוקה, אבל יחס עלות/תועלת מרמז על הקצאת יתר.";
    tip = en
      ? "Consider cheaper alternatives first (indexing, connection pooling) before scaling infrastructure."
      : "שקול חלופות זולות יותר קודם (אינדוקס, connection pooling) לפני הרחבת תשתית.";
  } else if (strongest === totalRel && weakest === totalCost) {
    narrative = en
      ? "You built a resilient system but over-invested in redundancy. High reliability is valuable, but the cost overhead may not justify the marginal availability improvement."
      : "בנית מערכת עמידה אבל השקעת יתר ברדונדנטיות. אמינות גבוהה חשובה, אבל תקורת העלות לא בהכרח מצדיקה את שיפור הזמינות השולי.";
    tip = en
      ? "Balance reliability investment with cost — not every component needs the same SLA."
      : "אזן השקעה באמינות עם עלות - לא כל רכיב צריך את אותו SLA.";
  } else if (totalCost < -15) {
    narrative = en
      ? "Your decisions significantly increased infrastructure costs. While the system may function, the spend is disproportionate to the problem severity."
      : "ההחלטות שלך הגדילו משמעותית את עלויות התשתית. למרות שהמערכת עשויה לפעול, ההוצאה אינה פרופורציונלית לחומרת הבעיה.";
    tip = en
      ? "Always diagnose before scaling — understand the bottleneck before adding resources."
      : "תמיד אבחן לפני סקיילינג - הבן את צוואר הבקבוק לפני הוספת משאבים.";
  } else if (totalPerf > 20 && totalCost > -5 && totalRel > 10) {
    narrative = en
      ? "Strong engineering decisions. You addressed root causes, balanced trade-offs between performance, cost, and reliability, and chose solutions proportional to the problem."
      : "החלטות הנדסיות חזקות. טיפלת בשורשי הבעיות, איזנת בין ביצועים, עלות ואמינות, ובחרת פתרונות פרופורציונליים לבעיה.";
    tip = en
      ? "Document this approach as a runbook — it reflects solid incident response methodology."
      : "תעד את הגישה הזו כ-runbook - היא משקפת מתודולוגיית תגובה לתקריות מוצקה.";
  } else if (worstNet < -10) {
    narrative = en
      ? "A critical misstep set the system back significantly. In production, early wrong turns compound — each suboptimal fix adds operational debt that constrains future options."
      : "צעד שגוי קריטי הזיק למערכת משמעותית. בייצור, פניות שגויות מוקדמות מצטברות - כל תיקון תת-אופטימלי מוסיף חוב תפעולי שמגביל אפשרויות עתידיות.";
    tip = en
      ? "When an approach isn't working, pivot early. Sunk cost in a bad path is worse than the delay of course-correcting."
      : "כשגישה לא עובדת, שנה כיוון מוקדם. עלות שקועה במסלול גרוע גרועה יותר מהעיכוב של תיקון מסלול.";
  } else {
    narrative = en
      ? "A mixed set of decisions with some effective moves and some missteps. The system outcome reflects both good instincts and areas where deeper root cause analysis would have helped."
      : "מערכת החלטות מעורבת עם כמה צעדים אפקטיביים וכמה שגיאות. תוצאת המערכת משקפת גם אינסטינקטים טובים וגם תחומים שבהם ניתוח שורש בעיה עמוק יותר היה עוזר.";
    tip = en
      ? "Start with observability — metrics, logs, and traces — before making infrastructure changes."
      : "התחל עם observability - metrics, logs, ו-traces - לפני ביצוע שינויי תשתית.";
  }

  return { best, worst, narrative, tip, timeline, turningPoint };
}

export function estimateStepCount(scenario) {
  if (!scenario?.steps) return 3;
  let count = 0;
  for (const step of Object.values(scenario.steps)) {
    if (step.question && step.options?.length > 0) count++;
  }
  return Math.min(count, 4);
}

// ── Persistence ────────────────────────────────────────────────────────────

export function loadArchitectureProgress() {
  try {
    const data = safeGetItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveArchitectureResult(scenarioId, result) {
  const progress = loadArchitectureProgress();
  const existing = progress[scenarioId];
  const attempts = (existing?.attempts || 0) + 1;

  if (!existing || result.score > existing.score) {
    progress[scenarioId] = {
      score: result.score,
      metrics: result.metrics,
      rankLabel: result.rank.label,
      completedAt: new Date().toISOString(),
      decisionCount: result.decisionCount,
      attempts,
    };
  } else {
    progress[scenarioId].lastAttempt = new Date().toISOString();
    progress[scenarioId].attempts = attempts;
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
  return progress;
}

// ── Session persistence ────────────────────────────────────────────────────

export function saveSession(data) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

// ── Engagement: Perfect Run ────────────────────────────────────────────────

const OPTIMAL_ENDINGS = {
  "rds-latency": "end_optimal",
  "traffic-spike": "end_well_prepared",
  "lb-misconfigured": "end_proper_fix",
};

/**
 * Check if the user reached the optimal terminal step.
 * Returns { isPerfect, optimalEndId, actualEndId, stepsFromOptimal }
 */
export function checkPerfectRun(scenarioId, terminalStepId, decisionHistory) {
  const optimalEnd = OPTIMAL_ENDINGS[scenarioId];
  if (!optimalEnd) return { isPerfect: false, stepsFromOptimal: null };
  const isPerfect = terminalStepId === optimalEnd;
  // Approximate distance: count decisions with negative net impact
  const suboptimalCount = decisionHistory.filter(d => {
    const net = (d.impact?.performance || 0) + (d.impact?.cost || 0) + (d.impact?.reliability || 0);
    return net < 0;
  }).length;
  return { isPerfect, optimalEndId: optimalEnd, actualEndId: terminalStepId, stepsFromOptimal: isPerfect ? 0 : Math.max(1, suboptimalCount) };
}

// ── Engagement: Multiple Outcomes ─────────────────────────────────────────

/**
 * Count total terminal (end_*) steps in a scenario.
 */
export function countOutcomes(scenario) {
  if (!scenario?.steps) return 0;
  return Object.keys(scenario.steps).filter(k => k.startsWith("end_")).length;
}

// ── Engagement: Daily Scenario ────────────────────────────────────────────

const DAILY_KEY = "kq_architecture_daily_v1";

/**
 * Get the daily scenario index based on date.
 * Rotates through scenarios deterministically.
 */
export function getDailyScenarioIndex(scenarioCount) {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / 86400000);
  return daysSinceEpoch % scenarioCount;
}

/**
 * Check if the daily scenario has been completed today.
 */
export function isDailyCompleted() {
  try {
    const data = safeGetItem(DAILY_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data);
    const today = new Date().toISOString().slice(0, 10);
    return parsed.date === today;
  } catch { return false; }
}

/**
 * Mark the daily scenario as completed.
 */
export function markDailyCompleted(scenarioId) {
  const today = new Date().toISOString().slice(0, 10);
  try { localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, scenarioId })); } catch {}
}

// ── Engagement: Architecture Level ────────────────────────────────────────

const LEVELS = [
  { threshold: 0,   label: "L1", labelFull: "Junior",    labelFullHe: "ג'וניור" },
  { threshold: 100, label: "L2", labelFull: "Mid-Level", labelFullHe: "בינוני" },
  { threshold: 250, label: "L3", labelFull: "Senior",    labelFullHe: "בכיר" },
  { threshold: 500, label: "L4", labelFull: "Staff",     labelFullHe: "מוביל" },
  { threshold: 800, label: "L5", labelFull: "Principal", labelFullHe: "ראשי" },
];

/**
 * Calculate architecture level from cumulative XP.
 * XP = sum of (score * attempts_weight) across all completed scenarios.
 */
export function getArchitectureLevel(progress) {
  const entries = Object.values(progress || {});
  let xp = 0;
  for (const e of entries) {
    xp += e.score || 0;
    // Bonus XP for replays that improved score
    if (e.attempts > 1) xp += Math.min((e.attempts - 1) * 10, 30);
  }
  let level = LEVELS[0];
  let nextLevel = LEVELS[1] || null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) {
      level = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
    }
  }
  return { level, nextLevel, xp, xpToNext: nextLevel ? nextLevel.threshold - xp : 0 };
}

// ── Engagement: Decision Insights (bias detection) ────────────────────────

/**
 * Detect decision-making patterns across all completed scenarios.
 */
export function getDecisionInsights(progress, lang) {
  const entries = Object.values(progress || {});
  if (entries.length < 2) return null;
  const en = lang !== "he";

  const avgPerf = entries.reduce((s, e) => s + (e.metrics?.performance || 50), 0) / entries.length;
  const avgCost = entries.reduce((s, e) => s + (e.metrics?.cost || 50), 0) / entries.length;
  const avgRel = entries.reduce((s, e) => s + (e.metrics?.reliability || 50), 0) / entries.length;

  const biases = [];

  if (avgPerf > avgCost + 15) {
    biases.push(en
      ? "You tend to prioritize performance over cost efficiency"
      : "אתה נוטה לתעדף ביצועים על פני יעילות עלות");
  }
  if (avgCost > avgPerf + 15) {
    biases.push(en
      ? "You lean toward cost-conscious decisions, sometimes at the expense of performance"
      : "אתה נוטה להחלטות מודעות-עלות, לפעמים על חשבון ביצועים");
  }
  if (avgRel > avgPerf + 10 && avgRel > avgCost + 10) {
    biases.push(en
      ? "Reliability is your strongest instinct -- you build for resilience"
      : "אמינות היא האינסטינקט החזק ביותר שלך -- אתה בונה לעמידות");
  }

  // Reactive vs proactive (based on whether good scores came early or late)
  const earlyScores = entries.filter(e => (e.attempts || 1) <= 1).map(e => e.score);
  const laterScores = entries.filter(e => (e.attempts || 1) > 1).map(e => e.score);
  if (laterScores.length > 0) {
    const earlyAvg = earlyScores.length ? earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length : 0;
    const laterAvg = laterScores.reduce((a, b) => a + b, 0) / laterScores.length;
    if (laterAvg > earlyAvg + 10) {
      biases.push(en
        ? "You improve significantly on replay -- you learn from experience"
        : "אתה משתפר משמעותית בהפעלה חוזרת -- אתה לומד מניסיון");
    }
  }

  return biases.length ? biases : null;
}

// ── Engagement: Near-Miss Feedback ────────────────────────────────────────

/**
 * Check if score is close to the next rank threshold.
 */
export function getNearMiss(score) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score < RANKS[i].threshold && score >= RANKS[i].threshold - 8) {
      return { nextRank: RANKS[i], pointsNeeded: RANKS[i].threshold - score };
    }
  }
  return null;
}

// ── Engagement: Next Action Suggestion ────────────────────────────────────

/**
 * Suggest what the user should do next after completing a scenario.
 */
export function getNextAction(scenarioId, progress, scenarios, lang) {
  const en = lang !== "he";

  // Find scenarios not yet completed
  const incomplete = scenarios.filter(s => !progress[s.id]);
  if (incomplete.length > 0) {
    return {
      type: "next_scenario",
      scenarioId: incomplete[0].id,
      text: en
        ? `Try: ${incomplete[0].title}`
        : `נסה: ${incomplete[0].titleHe}`,
    };
  }

  // All completed — suggest improving lowest score
  let lowestId = null, lowestScore = 101;
  for (const s of scenarios) {
    const p = progress[s.id];
    if (p && p.score < lowestScore) {
      lowestScore = p.score;
      lowestId = s.id;
    }
  }
  if (lowestId && lowestScore < 90) {
    const s = scenarios.find(x => x.id === lowestId);
    return {
      type: "improve",
      scenarioId: lowestId,
      text: en
        ? `Improve: ${s?.title} (score: ${lowestScore})`
        : `שפר: ${s?.titleHe} (ציון: ${lowestScore})`,
    };
  }

  return null;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export function getArchitectureStats(progress) {
  const entries = Object.values(progress || {});
  if (entries.length === 0) {
    return { completed: 0, avgScore: 0, bestScore: 0, successRate: 0, totalAttempts: 0, strongestMetric: null };
  }
  const scores = entries.map(e => e.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const bestScore = Math.max(...scores);
  const successRate = Math.round(entries.filter(e => e.score >= 50).length / entries.length * 100);
  const totalAttempts = entries.reduce((s, e) => s + (e.attempts || 1), 0);

  const avgPerf = Math.round(entries.reduce((s, e) => s + (e.metrics?.performance || 50), 0) / entries.length);
  const avgCost = Math.round(entries.reduce((s, e) => s + (e.metrics?.cost || 50), 0) / entries.length);
  const avgRel = Math.round(entries.reduce((s, e) => s + (e.metrics?.reliability || 50), 0) / entries.length);
  const maxAvg = Math.max(avgPerf, avgCost, avgRel);
  const strongestMetric = maxAvg === avgPerf ? "performance" : maxAvg === avgRel ? "reliability" : "cost";

  return { completed: entries.length, avgScore, bestScore, successRate, totalAttempts, strongestMetric };
}
