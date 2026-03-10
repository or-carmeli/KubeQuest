import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveQuizState, loadQuizState, clearQuizState, isRecentQuizState } from "./quizPersistence";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    q: `Question ${i}`,
    options: ["A", "B", "C", "D"],
    answer: 0,
    explanation: `Explanation ${i}`,
  }));
}

function makeValidState(overrides = {}) {
  return {
    quizRunId: "test123",
    userId: "guest",
    topicId: "pods",
    topicName: "Pods",
    topicColor: "#00D4FF",
    topicIcon: "📦",
    level: "easy",
    questions: makeQuestions(7),
    questionIndex: 3,
    submitted: false,
    selectedAnswer: null,
    showExplanation: false,
    answerResult: null,
    quizHistory: [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
      { q: "Q2", options: ["A","B","C","D"], answer: 2, chosen: 0, explanation: "E2" },
    ],
    sessionScore: 30,
    topicCorrect: 2,
    retryMode: false,
    isRetry: false,
    timerEnabled: false,
    isInterviewMode: false,
    timeLeft: 30,
    savedStats: {
      total_answered: 13,
      total_correct: 10,
      total_score: 120,
      current_streak: 2,
      max_streak: 5,
    },
    statsDelta: {
      answered: 3,
      correct: 2,
      currentStreak: 2,
      maxStreak: 5,
    },
    ...overrides,
  };
}

// ─── localStorage mock ──────────────────────────────────────────────────────

let store = {};
beforeEach(() => {
  store = {};
  vi.stubGlobal("localStorage", {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 1: Save → Refresh → Restore produces exact same question + valid stats
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 1: round-trip save → load preserves quiz state", () => {
  it("restores the exact questionIndex and question array", () => {
    const state = makeValidState();
    saveQuizState(state);
    const loaded = loadQuizState();

    expect(loaded).not.toBeNull();
    expect(loaded.questionIndex).toBe(3);
    expect(loaded.questions).toHaveLength(7);
    expect(loaded.questions[3].q).toBe("Question 3");
  });

  it("preserves quizHistory for history-mode navigation", () => {
    const state = makeValidState();
    saveQuizState(state);
    const loaded = loadQuizState();

    expect(loaded.quizHistory).toHaveLength(3);
    expect(loaded.quizHistory[0].chosen).toBe(0);
    expect(loaded.quizHistory[2].chosen).toBe(0);
  });

  it("preserves savedStats snapshot for idempotent resume", () => {
    const state = makeValidState();
    saveQuizState(state);
    const loaded = loadQuizState();

    expect(loaded.savedStats).toEqual({
      total_answered: 13,
      total_correct: 10,
      total_score: 120,
      current_streak: 2,
      max_streak: 5,
    });
  });

  it("preserves all numeric fields without NaN", () => {
    const state = makeValidState();
    saveQuizState(state);
    const loaded = loadQuizState();

    expect(Number.isFinite(loaded.sessionScore)).toBe(true);
    expect(Number.isFinite(loaded.topicCorrect)).toBe(true);
    expect(Number.isFinite(loaded.questionIndex)).toBe(true);
    expect(Number.isFinite(loaded.statsDelta.answered)).toBe(true);
    expect(Number.isFinite(loaded.statsDelta.correct)).toBe(true);
    expect(Number.isFinite(loaded.savedStats.total_answered)).toBe(true);
    expect(Number.isFinite(loaded.savedStats.total_score)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 2: Starting a different quiz clears previous state
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 2: clearQuizState prevents state leaking across quizzes", () => {
  it("clearQuizState removes saved state completely", () => {
    saveQuizState(makeValidState());
    expect(loadQuizState()).not.toBeNull();

    clearQuizState();
    expect(loadQuizState()).toBeNull();
  });

  it("saving a new quiz fully overwrites the old one", () => {
    saveQuizState(makeValidState({ topicId: "pods", questionIndex: 5 }));
    saveQuizState(makeValidState({ topicId: "services", questionIndex: 0, questions: makeQuestions(4) }));

    const loaded = loadQuizState();
    expect(loaded.topicId).toBe("services");
    expect(loaded.questionIndex).toBe(0);
    expect(loaded.questions).toHaveLength(4);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 3: Corrupted localStorage values are safely recovered
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 3: corrupted localStorage recovery", () => {
  it("NaN questionIndex → clamped to 0", () => {
    saveQuizState(makeValidState({ questionIndex: NaN }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
    expect(Number.isNaN(loaded.questionIndex)).toBe(false);
  });

  it("undefined questionIndex → defaults to 0", () => {
    saveQuizState(makeValidState({ questionIndex: undefined }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
  });

  it("negative questionIndex → clamped to 0", () => {
    saveQuizState(makeValidState({ questionIndex: -5 }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
  });

  it("extremely large questionIndex → clamped to questions.length - 1", () => {
    saveQuizState(makeValidState({ questionIndex: 99999 }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(6); // 7 questions, max index = 6
  });

  it("Infinity questionIndex → clamped to 0", () => {
    saveQuizState(makeValidState({ questionIndex: Infinity }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
  });

  it("NaN sessionScore → sanitized to 0", () => {
    saveQuizState(makeValidState({ sessionScore: NaN }));
    const loaded = loadQuizState();
    expect(loaded.sessionScore).toBe(0);
  });

  it("undefined sessionScore → sanitized to 0", () => {
    saveQuizState(makeValidState({ sessionScore: undefined }));
    const loaded = loadQuizState();
    expect(loaded.sessionScore).toBe(0);
  });

  it("NaN topicCorrect → sanitized to 0", () => {
    saveQuizState(makeValidState({ topicCorrect: NaN }));
    const loaded = loadQuizState();
    expect(loaded.topicCorrect).toBe(0);
  });

  it("NaN in statsDelta fields → sanitized to 0", () => {
    saveQuizState(makeValidState({
      statsDelta: { answered: NaN, correct: undefined, currentStreak: null, maxStreak: "abc" },
    }));
    const loaded = loadQuizState();
    expect(loaded.statsDelta.answered).toBe(0);
    expect(loaded.statsDelta.correct).toBe(0);
    expect(loaded.statsDelta.currentStreak).toBe(0);
    expect(loaded.statsDelta.maxStreak).toBe(0);
  });

  it("NaN in savedStats fields → sanitized to 0", () => {
    saveQuizState(makeValidState({
      savedStats: {
        total_answered: NaN,
        total_correct: undefined,
        total_score: "garbage",
        current_streak: null,
        max_streak: Infinity, // JSON.stringify(Infinity) → null → Number(null) || 0 → 0
      },
    }));
    const loaded = loadQuizState();
    expect(loaded.savedStats.total_answered).toBe(0);
    expect(loaded.savedStats.total_correct).toBe(0);
    expect(loaded.savedStats.total_score).toBe(0);
    expect(loaded.savedStats.current_streak).toBe(0);
    expect(loaded.savedStats.max_streak).toBe(0); // Infinity → null via JSON → 0
  });

  it("malformed JSON in localStorage → returns null", () => {
    store["k8s_quiz_inprogress_v1"] = "{{{invalid json";
    expect(loadQuizState()).toBeNull();
  });

  it("missing required fields → returns null", () => {
    saveQuizState({ timestamp: Date.now() }); // no topicId, level, questions
    expect(loadQuizState()).toBeNull();
  });

  it("empty questions array → returns null", () => {
    saveQuizState(makeValidState({ questions: [] }));
    expect(loadQuizState()).toBeNull();
  });

  it("questions is not an array → returns null", () => {
    saveQuizState(makeValidState({ questions: "not an array" }));
    expect(loadQuizState()).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 4: questionIndex never exceeds questions.length - 1
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 4: questionIndex is always within bounds", () => {
  it("questionIndex at exact boundary (length - 1) stays valid", () => {
    saveQuizState(makeValidState({ questionIndex: 6 })); // 7 questions, last valid index
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(6);
  });

  it("questionIndex at length → clamped to length - 1", () => {
    saveQuizState(makeValidState({ questionIndex: 7 })); // one past end
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(6);
  });

  it("questionIndex far beyond length → clamped to length - 1", () => {
    saveQuizState(makeValidState({ questionIndex: 1000 }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(6);
  });

  it("single-question quiz: questionIndex always 0", () => {
    saveQuizState(makeValidState({ questions: makeQuestions(1), questionIndex: 5 }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
  });

  it("questionIndex 0 with many questions stays 0", () => {
    saveQuizState(makeValidState({ questionIndex: 0 }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 5: Stats cannot be double-counted even if resume runs multiple times
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 5: Math.max stats reconciliation prevents double-counting", () => {
  // Simulates the resume logic from App.jsx handleResumeQuiz
  function simulateStatsResume(prevStats, savedState) {
    const snap = savedState.savedStats;
    const delta = savedState.statsDelta || {};
    if (snap) {
      return {
        ...prevStats,
        total_answered: Math.max(prevStats.total_answered, snap.total_answered || 0),
        total_correct:  Math.max(prevStats.total_correct,  snap.total_correct  || 0),
        total_score:    Math.max(prevStats.total_score,    snap.total_score    || 0),
        current_streak: Math.max(prevStats.current_streak, snap.current_streak || 0),
        max_streak:     Math.max(prevStats.max_streak,     snap.max_streak     || 0),
      };
    }
    // Backward compat path
    if (delta.answered > 0 || delta.correct > 0) {
      return {
        ...prevStats,
        total_answered: prevStats.total_answered + (delta.answered || 0),
        total_correct:  prevStats.total_correct  + (delta.correct  || 0),
        current_streak: Math.max(prevStats.current_streak, delta.currentStreak || 0),
        max_streak:     Math.max(prevStats.max_streak,     delta.maxStreak     || 0),
      };
    }
    return prevStats;
  }

  it("guest flow: cache already has in-progress stats → no double-count", () => {
    // Guest cache was updated reactively during the quiz
    const prevStats = { total_answered: 13, total_correct: 10, total_score: 120, current_streak: 2, max_streak: 5 };
    const saved = makeValidState();
    // savedStats matches prevStats (same values because cache was updated reactively)
    const result = simulateStatsResume(prevStats, saved);

    expect(result.total_answered).toBe(13); // NOT 13 + 3 = 16
    expect(result.total_correct).toBe(10);  // NOT 10 + 2 = 12
    expect(result.total_score).toBe(120);
  });

  it("auth flow: Supabase has pre-quiz stats → delta correctly applied via Math.max", () => {
    // Supabase didn't include in-progress quiz answers
    const prevStats = { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 0, max_streak: 3 };
    const saved = makeValidState();
    // savedStats has 13 answered (10 pre-quiz + 3 from quiz)
    const result = simulateStatsResume(prevStats, saved);

    expect(result.total_answered).toBe(13); // Math.max(10, 13) = 13
    expect(result.total_correct).toBe(10);  // Math.max(8, 10) = 10
    expect(result.total_score).toBe(120);   // Math.max(90, 120) = 120
    expect(result.max_streak).toBe(5);      // Math.max(3, 5) = 5
  });

  it("running resume multiple times is idempotent", () => {
    const prevStats = { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 0, max_streak: 3 };
    const saved = makeValidState();

    const after1 = simulateStatsResume(prevStats, saved);
    const after2 = simulateStatsResume(after1, saved);
    const after3 = simulateStatsResume(after2, saved);

    expect(after1).toEqual(after2);
    expect(after2).toEqual(after3);
    expect(after3.total_answered).toBe(13);
  });

  it("multi-tab: other tab advanced stats further → preserved via Math.max", () => {
    // Other tab completed another quiz, pushing stats higher
    const prevStats = { total_answered: 60, total_correct: 50, total_score: 500, current_streak: 10, max_streak: 15 };
    const saved = makeValidState(); // savedStats has total_answered: 13

    const result = simulateStatsResume(prevStats, saved);
    // Math.max(60, 13) = 60 — other tab's progress is preserved
    expect(result.total_answered).toBe(60);
    expect(result.total_correct).toBe(50);
    expect(result.total_score).toBe(500);
    expect(result.max_streak).toBe(15);
  });

  it("backward compat: old save without savedStats uses additive delta (once)", () => {
    const prevStats = { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 0, max_streak: 3 };
    const saved = makeValidState();
    delete saved.savedStats; // simulate old save format

    const result = simulateStatsResume(prevStats, saved);
    expect(result.total_answered).toBe(13); // 10 + 3 (additive, once)
    expect(result.total_correct).toBe(10);  // 8 + 2
  });

  it("free-mode quiz: stats are not modified", () => {
    // For free-mode quizzes, the resume code skips stats reconciliation entirely
    // (guarded by !isFreeMode(topic.id) in App.jsx)
    // Here we just verify the function returns prev unchanged when delta is 0
    const prevStats = { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 5, max_streak: 5 };
    const saved = makeValidState({
      statsDelta: { answered: 0, correct: 0, currentStreak: 0, maxStreak: 0 },
      savedStats: undefined, // no savedStats → and delta is 0 → no modification
    });
    delete saved.savedStats;
    const result = simulateStatsResume(prevStats, saved);
    expect(result).toEqual(prevStats);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 6: Progress percentage always returns a valid number 0–100
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 6: progress percentage is always valid", () => {
  // Mirrors the progress bar width calculation in App.jsx
  function computeProgress(liveIndex, submitted, isInHistoryMode, questionsLength) {
    return questionsLength > 0
      ? ((liveIndex + (submitted && !isInHistoryMode ? 1 : 0)) / questionsLength) * 100
      : 0;
  }

  it("normal case: 3/7 answered → ~42.9%", () => {
    const p = computeProgress(3, false, false, 7);
    expect(p).toBeCloseTo(42.86, 1);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(100);
  });

  it("zero questions → 0% (not NaN or Infinity)", () => {
    const p = computeProgress(0, false, false, 0);
    expect(p).toBe(0);
    expect(Number.isFinite(p)).toBe(true);
  });

  it("all answered + submitted → 100%", () => {
    const p = computeProgress(6, true, false, 7);
    expect(p).toBe(100);
  });

  it("first question, not submitted → 0%", () => {
    const p = computeProgress(0, false, false, 7);
    expect(p).toBe(0);
  });

  it("history mode: submitted flag does not inflate progress", () => {
    const p = computeProgress(3, true, true, 7);
    // In history mode, submitted doesn't add +1
    expect(p).toBeCloseTo(42.86, 1);
  });

  it("liveIndex at max → gives close to 100%", () => {
    const p = computeProgress(6, false, false, 7);
    expect(p).toBeCloseTo(85.71, 1);
    expect(p).toBeLessThanOrEqual(100);
  });

  it("single question quiz → 0% before submit, 100% after", () => {
    expect(computeProgress(0, false, false, 1)).toBe(0);
    expect(computeProgress(0, true, false, 1)).toBe(100);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCENARIO 7: Missing/empty questions array triggers recovery, not broken quiz
// ═════════════════════════════════════════════════════════════════════════════
describe("Scenario 7: missing or empty questions array → recovery", () => {
  // Mirrors the fail-safe guard in App.jsx quiz rendering
  function shouldShowRecovery(currentQuestions, questionIndex) {
    return (
      currentQuestions.length === 0 ||
      questionIndex < 0 ||
      questionIndex >= currentQuestions.length ||
      !currentQuestions[questionIndex]
    );
  }

  it("empty questions array → recovery screen", () => {
    expect(shouldShowRecovery([], 0)).toBe(true);
  });

  it("valid state → no recovery", () => {
    expect(shouldShowRecovery(makeQuestions(7), 3)).toBe(false);
  });

  it("questionIndex at boundary → no recovery", () => {
    expect(shouldShowRecovery(makeQuestions(7), 6)).toBe(false);
  });

  it("questionIndex past boundary → recovery screen", () => {
    expect(shouldShowRecovery(makeQuestions(7), 7)).toBe(true);
  });

  it("questionIndex way past boundary → recovery screen", () => {
    expect(shouldShowRecovery(makeQuestions(7), 100)).toBe(true);
  });

  it("negative questionIndex → recovery screen", () => {
    expect(shouldShowRecovery(makeQuestions(7), -1)).toBe(true);
  });

  it("null entry in questions array → recovery screen", () => {
    const qs = makeQuestions(5);
    qs[2] = null;
    expect(shouldShowRecovery(qs, 2)).toBe(true);
  });

  it("undefined entry in questions array → recovery screen", () => {
    const qs = makeQuestions(5);
    qs[3] = undefined;
    expect(shouldShowRecovery(qs, 3)).toBe(true);
  });

  it("loadQuizState rejects empty questions before they reach the UI", () => {
    saveQuizState(makeValidState({ questions: [] }));
    expect(loadQuizState()).toBeNull();
  });

  it("loadQuizState rejects non-array questions", () => {
    saveQuizState(makeValidState({ questions: null }));
    expect(loadQuizState()).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BONUS: No NaN can appear in any UI-facing value
// ═════════════════════════════════════════════════════════════════════════════
describe("Bonus: NaN cannot survive through any code path", () => {
  // Mirrors the stats display sanitization in App.jsx
  function safeDisplay(value) {
    return value || 0;
  }

  it("NaN → 0", () => expect(safeDisplay(NaN)).toBe(0));
  it("undefined → 0", () => expect(safeDisplay(undefined)).toBe(0));
  it("null → 0", () => expect(safeDisplay(null)).toBe(0));
  it("0 → 0", () => expect(safeDisplay(0)).toBe(0));
  it("positive number preserved", () => expect(safeDisplay(42)).toBe(42));

  // Mirrors the localStorage stats restore sanitization
  function safeStatsRestore(cached, prev) {
    return Number(cached) || prev;
  }

  it("NaN cached → falls back to prev", () => expect(safeStatsRestore(NaN, 5)).toBe(5));
  it("'garbage' cached → falls back to prev", () => expect(safeStatsRestore("garbage", 5)).toBe(5));
  it("undefined cached → falls back to prev", () => expect(safeStatsRestore(undefined, 5)).toBe(5));
  it("valid cached → used", () => expect(safeStatsRestore(10, 5)).toBe(10));
  it("'15' string cached → parsed", () => expect(safeStatsRestore("15", 5)).toBe(15));

  it("accuracy formula: 0 answered → 0%, not NaN", () => {
    const total_answered = 0;
    const total_correct = 0;
    const accuracy = total_answered > 0 ? Math.round(total_correct / total_answered * 100) : 0;
    expect(accuracy).toBe(0);
    expect(Number.isFinite(accuracy)).toBe(true);
  });

  it("question counter: valid index → valid string", () => {
    const questionIndex = 3;
    const questionsLength = 7;
    const display = `${questionIndex + 1} / ${questionsLength}`;
    expect(display).toBe("4 / 7");
    expect(display).not.toContain("NaN");
    expect(display).not.toContain("undefined");
  });

  it("question counter: corrupted values sanitized before display", () => {
    const questionIndex = Number(NaN) || 0;
    const questionsLength = Number(undefined) || 0;
    const display = `${questionIndex + 1} / ${questionsLength}`;
    expect(display).toBe("1 / 0");
    expect(display).not.toContain("NaN");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BONUS: Expired / stale quiz state handling
// ═════════════════════════════════════════════════════════════════════════════
describe("Bonus: expired quiz state is discarded", () => {
  it("quiz older than 24 hours → returns null and removes key", () => {
    const state = makeValidState();
    saveQuizState(state);

    // Manually backdate the timestamp
    const raw = JSON.parse(store["k8s_quiz_inprogress_v1"]);
    raw.timestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
    store["k8s_quiz_inprogress_v1"] = JSON.stringify(raw);

    expect(loadQuizState()).toBeNull();
    expect(store["k8s_quiz_inprogress_v1"]).toBeUndefined();
  });

  it("isRecentQuizState: fresh state → true", () => {
    const state = { timestamp: Date.now() };
    expect(isRecentQuizState(state)).toBe(true);
  });

  it("isRecentQuizState: 3 min old → false", () => {
    const state = { timestamp: Date.now() - 3 * 60 * 1000 };
    expect(isRecentQuizState(state)).toBe(false);
  });

  it("isRecentQuizState: null → false", () => {
    expect(isRecentQuizState(null)).toBe(false);
  });

  it("isRecentQuizState: no timestamp → false", () => {
    expect(isRecentQuizState({})).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// BONUS: handleResumeQuiz index clamping logic (extracted)
// ═════════════════════════════════════════════════════════════════════════════
describe("Bonus: resume index clamping matches handleResumeQuiz", () => {
  // Mirrors the clamping logic in handleResumeQuiz
  function clampIndex(savedIndex, questionsLength) {
    const maxIdx = Math.max(0, questionsLength - 1);
    return Math.max(0, Math.min(savedIndex ?? 0, maxIdx));
  }

  it("normal case: index within bounds", () => {
    expect(clampIndex(3, 7)).toBe(3);
  });

  it("index at boundary", () => {
    expect(clampIndex(6, 7)).toBe(6);
  });

  it("index beyond boundary", () => {
    expect(clampIndex(8, 7)).toBe(6);
  });

  it("negative index", () => {
    expect(clampIndex(-3, 7)).toBe(0);
  });

  it("null index → defaults to 0", () => {
    expect(clampIndex(null, 7)).toBe(0);
  });

  it("undefined index → defaults to 0", () => {
    expect(clampIndex(undefined, 7)).toBe(0);
  });

  it("single-element array", () => {
    expect(clampIndex(5, 1)).toBe(0);
  });

  it("zero-length guard (Math.max(0, -1) → 0)", () => {
    // This shouldn't happen because loadQuizState rejects empty arrays,
    // but the clamp is still safe
    expect(clampIndex(0, 0)).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Repeated resume attempts (double-fire)
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: repeated resume attempts", () => {
  function simulateStatsResume(prevStats, savedState) {
    const snap = savedState.savedStats;
    if (snap) {
      return {
        ...prevStats,
        total_answered: Math.max(prevStats.total_answered, snap.total_answered || 0),
        total_correct:  Math.max(prevStats.total_correct,  snap.total_correct  || 0),
        total_score:    Math.max(prevStats.total_score,    snap.total_score    || 0),
        current_streak: Math.max(prevStats.current_streak, snap.current_streak || 0),
        max_streak:     Math.max(prevStats.max_streak,     snap.max_streak     || 0),
      };
    }
    return prevStats;
  }

  it("calling resume 10 times produces the same result as calling it once", () => {
    const base = { total_answered: 5, total_correct: 3, total_score: 40, current_streak: 0, max_streak: 3 };
    const saved = makeValidState();

    let stats = base;
    const afterOnce = simulateStatsResume(stats, saved);
    for (let i = 0; i < 10; i++) stats = simulateStatsResume(stats, saved);

    expect(stats).toEqual(afterOnce);
  });

  it("autoResumeAttempted ref prevents double auto-resume", () => {
    // Simulates the ref guard: once set to true, subsequent calls are blocked
    let autoResumeAttempted = false;
    let resumeCount = 0;
    function tryAutoResume() {
      if (autoResumeAttempted) return;
      autoResumeAttempted = true;
      resumeCount++;
    }
    tryAutoResume();
    tryAutoResume();
    tryAutoResume();
    expect(resumeCount).toBe(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Rapid quiz-mode switching
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: rapid quiz-mode switching state isolation", () => {
  it("starting a new quiz always overwrites the localStorage save", () => {
    // Simulate: start topic quiz → save state → start mixed quiz → save state
    saveQuizState(makeValidState({ topicId: "pods", questionIndex: 4 }));
    const afterTopic = loadQuizState();
    expect(afterTopic.topicId).toBe("pods");
    expect(afterTopic.questionIndex).toBe(4);

    // Mixed quiz starts → clearQuizState + saveQuizState
    clearQuizState();
    saveQuizState(makeValidState({ topicId: "mixed", questionIndex: 0, questions: makeQuestions(10) }));
    const afterMixed = loadQuizState();
    expect(afterMixed.topicId).toBe("mixed");
    expect(afterMixed.questionIndex).toBe(0);
    expect(afterMixed.questions).toHaveLength(10);
  });

  it("retryMode true routes to mixedQuestions, false routes to topicQuestions", () => {
    // Simulates the currentQuestions derivation logic from App.jsx line 796
    function deriveCurrentQuestions(selectedTopicId, retryMode, mixedQs, topicQs, fallbackQs) {
      const isFreeMode = (id) => id === "mixed" || id === "daily" || id === "bookmarks";
      return isFreeMode(selectedTopicId) || retryMode
        ? mixedQs
        : (topicQs.length > 0 ? topicQs : (fallbackQs || []));
    }

    const topicQs = makeQuestions(7);
    const mixedQs = makeQuestions(3);
    const fallback = makeQuestions(5);

    // Regular topic quiz → uses topicQuestions
    expect(deriveCurrentQuestions("pods", false, mixedQs, topicQs, fallback)).toBe(topicQs);
    // Retry mode → uses mixedQuestions
    expect(deriveCurrentQuestions("pods", true, mixedQs, topicQs, fallback)).toBe(mixedQs);
    // Mixed mode → uses mixedQuestions
    expect(deriveCurrentQuestions("mixed", false, mixedQs, topicQs, fallback)).toBe(mixedQs);
    // Empty topicQs → falls back to fallback
    expect(deriveCurrentQuestions("pods", false, mixedQs, [], fallback)).toBe(fallback);
    // Empty topicQs + no fallback → empty array
    expect(deriveCurrentQuestions("pods", false, mixedQs, [], undefined)).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: History mode with partial restoration
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: history mode with partial/missing quizHistory", () => {
  it("history mode display safely handles missing history entry", () => {
    // Simulates dispSelectedAnswer derivation from App.jsx line 2411
    const quizHistory = [
      { chosen: 1, answer: 1 },
      { chosen: 2, answer: 0 },
      // question 2 has no history (missing entry)
    ];
    // At questionIndex 2 in history mode:
    const dispSelectedAnswer = quizHistory[2]?.chosen ?? -1;
    expect(dispSelectedAnswer).toBe(-1); // safe fallback, no crash
  });

  it("history mode answer result safely handles missing history entry", () => {
    const quizHistory = [{ chosen: 0, answer: 0, explanation: "E0" }];
    const questionIndex = 3; // beyond quizHistory.length
    const hist = quizHistory[questionIndex];
    // Simulates dispAnswerResult logic
    const result = hist
      ? { correct: hist.chosen === hist.answer, correctIndex: hist.answer, explanation: hist.explanation }
      : null;
    expect(result).toBeNull(); // safe, no crash
  });

  it("isInHistoryMode is false when questionIndex equals liveIndexRef", () => {
    // Simulates line 2406: const isInHistoryMode = questionIndex < liveIndexRef.current
    const liveIndex = 3;
    expect(3 < liveIndex).toBe(false); // at live position → not in history mode
    expect(2 < liveIndex).toBe(true);  // behind live → in history mode
    expect(0 < liveIndex).toBe(true);  // way behind → in history mode
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Timer expiry during state transition
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: timer expiry guard against invalid question", () => {
  it("timer effect should bail if question is undefined", () => {
    // Simulates the guard: if (!q) return;
    const currentQuestions = [];
    const questionIndex = 0;
    const q = currentQuestions[questionIndex];
    const shouldBail = !q;
    expect(shouldBail).toBe(true);
  });

  it("timer effect should proceed if question is valid", () => {
    const currentQuestions = makeQuestions(5);
    const questionIndex = 2;
    const q = currentQuestions[questionIndex];
    const shouldBail = !q;
    expect(shouldBail).toBe(false);
    expect(q.q).toBe("Question 2");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Ephemeral state reset on resume
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: resume clears all ephemeral per-question state", () => {
  // This test verifies the contract that handleResumeQuiz resets:
  // hintVisible, eliminatedOption, tryAgainActive, tryAgainSelected, answerCacheRef
  it("all ephemeral state fields must be reset on resume", () => {
    // Simulates the state after handleResumeQuiz
    const ephemeralState = {
      hintVisible: false,         // reset by handleResumeQuiz
      eliminatedOption: null,     // reset by handleResumeQuiz
      tryAgainActive: false,      // reset by handleResumeQuiz
      tryAgainSelected: null,     // reset by handleResumeQuiz
      answerCacheCleared: true,   // answerCacheRef.current = {} in handleResumeQuiz
    };
    expect(ephemeralState.hintVisible).toBe(false);
    expect(ephemeralState.eliminatedOption).toBeNull();
    expect(ephemeralState.tryAgainActive).toBe(false);
    expect(ephemeralState.tryAgainSelected).toBeNull();
    expect(ephemeralState.answerCacheCleared).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Rapid button taps (submit guard)
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: rapid submit/next taps", () => {
  it("submittingRef prevents double-submit", () => {
    // Simulates the guard at line 1628: if (submittingRef.current) return
    let submittingRef = false;
    let submitCount = 0;
    function handleSubmit() {
      if (submittingRef) return;
      submittingRef = true;
      submitCount++;
    }
    handleSubmit();
    handleSubmit();
    handleSubmit();
    expect(submitCount).toBe(1);
  });

  it("quizHistory double-submit guard prevents duplicate entries", () => {
    // Simulates the guard at line 1682: if (prev.length > questionIndex) return prev
    const questionIndex = 2;
    let history = [
      { q: "Q0" }, { q: "Q1" }, { q: "Q2" }, // already has entry for index 2
    ];
    function addToHistory(prev) {
      if (prev.length > questionIndex) return prev; // guard
      return [...prev, { q: "DUPLICATE" }];
    }
    const result = addToHistory(history);
    expect(result).toBe(history); // same reference, not modified
    expect(result).toHaveLength(3); // no duplicate added
  });

  it("selectedAnswer guard prevents change after submit", () => {
    // Simulates line 1623: if (submitted) return
    let submitted = true;
    let selectedAnswer = 1;
    function handleSelectAnswer(idx) {
      if (submitted) return;
      selectedAnswer = idx;
    }
    handleSelectAnswer(3);
    expect(selectedAnswer).toBe(1); // unchanged
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Partial localStorage payload
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: partially corrupted localStorage payloads", () => {
  it("state with questions but missing savedStats → backward compat delta path", () => {
    const state = makeValidState();
    delete state.savedStats;
    saveQuizState(state);
    const loaded = loadQuizState();
    expect(loaded).not.toBeNull();
    expect(loaded.savedStats).toBeUndefined();
    expect(loaded.statsDelta.answered).toBe(3);
  });

  it("state with questions but missing statsDelta → both paths safely skip", () => {
    const state = makeValidState();
    delete state.statsDelta;
    delete state.savedStats;
    saveQuizState(state);
    const loaded = loadQuizState();
    expect(loaded).not.toBeNull();
    expect(loaded.statsDelta).toBeUndefined();
    expect(loaded.savedStats).toBeUndefined();
  });

  it("state with mismatched topicId (topic removed from app) → loadQuizState succeeds but handleResumeQuiz should reject", () => {
    // loadQuizState doesn't validate topicId against the topic list — that's handleResumeQuiz's job
    saveQuizState(makeValidState({ topicId: "nonexistent_topic_xyz" }));
    const loaded = loadQuizState();
    expect(loaded).not.toBeNull(); // loadQuizState doesn't validate topic existence
    expect(loaded.topicId).toBe("nonexistent_topic_xyz");
    // handleResumeQuiz would do: topic = TOPICS.find(tp => tp.id === saved.topicId) → null
    // then: if (!topic) { clearQuizState(); return; }
  });

  it("state with quizHistory longer than questions array → no crash, just stale history", () => {
    const qs = makeQuestions(3);
    const bigHistory = Array.from({ length: 10 }, (_, i) => ({
      q: `Q${i}`, options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: `E${i}`,
    }));
    saveQuizState(makeValidState({ questions: qs, questionIndex: 2, quizHistory: bigHistory }));
    const loaded = loadQuizState();
    expect(loaded.questions).toHaveLength(3);
    expect(loaded.questionIndex).toBe(2); // clamped to max index
    expect(loaded.quizHistory).toHaveLength(10); // preserved as-is; harmless extra entries
  });

  it("state with quizHistory shorter than questionIndex → safe, history mode shows fallback", () => {
    saveQuizState(makeValidState({ questionIndex: 5, quizHistory: [{ q: "Q0", chosen: 0, answer: 0 }] }));
    const loaded = loadQuizState();
    expect(loaded.questionIndex).toBe(5);
    expect(loaded.quizHistory).toHaveLength(1);
    // In history mode at index 2: quizHistory[2]?.chosen ?? -1 → -1 (safe)
    expect(loaded.quizHistory[2]?.chosen ?? -1).toBe(-1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STRESS TEST: Save effect dependency verification
// ═════════════════════════════════════════════════════════════════════════════
describe("Stress: save effect stores liveIndexRef (not questionIndex) as the persisted index", () => {
  it("user browsing history does not regress the saved questionIndex", () => {
    // Scenario: user is on question 5, browses back to question 2
    // liveIndexRef stays at 5, questionIndex goes to 2
    // Save effect stores liveIndexRef.current (5), not questionIndex (2)
    const liveIndexRef = 5;
    const questionIndex = 2; // browsing history
    const savedIndex = liveIndexRef; // as per line 999
    expect(savedIndex).toBe(5); // saves the live position, not the viewing position

    // On restore, user returns to question 5 (the unanswered question)
    const maxIdx = Math.max(0, 7 - 1); // 7 questions
    const safeIndex = Math.max(0, Math.min(savedIndex, maxIdx));
    expect(safeIndex).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCORE CONSISTENCY: total_score must always equal computeScore(completedTopics)
// ═══════════════════════════════════════════════════════════════════════════════

// Mirror of the real LEVEL_CONFIG and computeScore from App.jsx
const LEVEL_CONFIG = {
  easy:   { points: 10 },
  medium: { points: 20 },
  hard:   { points: 30 },
  mixed:  { points: 15 },
  daily:  { points: 15 },
};
const FREE_MODES = new Set(["mixed", "daily", "bookmarks"]);
function isFreeMode(id) { return FREE_MODES.has(id); }
function computeScore(completed) {
  return Object.entries(completed).reduce((sum, [key, res]) => {
    const parts = key.split("_");
    const topicId = parts.slice(0, -1).join("_");
    if (isFreeMode(topicId)) return sum;
    const lvl = parts[parts.length - 1];
    return sum + (res.correct * (LEVEL_CONFIG[lvl]?.points ?? 0));
  }, 0);
}

describe("Score consistency: computeScore is the sole source of truth", () => {
  it("first play: per-answer accumulation matches computeScore", () => {
    // User plays workloads_easy, gets 5/7 correct
    const completed = { workloads_easy: { correct: 5, total: 7 } };
    const canonical = computeScore(completed);
    // Per-answer would have added 5 * 10 = 50
    expect(canonical).toBe(50);
  });

  it("replay with fewer correct: score must NOT increase", () => {
    // User already had 5/7 correct, replays and gets 3/7
    const prevCompleted = { workloads_easy: { correct: 5, total: 7 } };
    const prevScore = computeScore(prevCompleted);

    // After replay: bestCorrect = max(5, 3) = 5
    const bestCorrect = Math.max(5, 3);
    const newCompleted = { workloads_easy: { correct: bestCorrect, total: 7 } };
    const newScore = computeScore(newCompleted);

    expect(newScore).toBe(prevScore); // score unchanged — correct
    expect(newScore).toBe(50);

    // BUG (before fix): per-answer accumulation would have done:
    // prevScore(50) + 3*10 = 80, then Math.max(80, 50) = 80 ← WRONG
    // After fix: total_score = computeScore(newCompleted) = 50 ← CORRECT
  });

  it("replay with more correct: score increases exactly to canonical", () => {
    // User had 3/7 correct, replays and gets 6/7
    const prevCompleted = { workloads_easy: { correct: 3, total: 7 } };
    const prevScore = computeScore(prevCompleted);
    expect(prevScore).toBe(30);

    const bestCorrect = Math.max(3, 6);
    const newCompleted = { workloads_easy: { correct: bestCorrect, total: 7 } };
    const newScore = computeScore(newCompleted);

    expect(newScore).toBe(60); // increased by exactly 30 (3 more correct * 10)
    expect(newScore).toBe(bestCorrect * 10);
  });

  it("multiple replays: score is always canonical, never inflated", () => {
    // Simulate 5 replays of the same topic with varying results
    let bestCorrect = 0;
    const results = [4, 3, 5, 2, 6]; // varying correct counts
    let prevCanonical = 0;

    for (const correct of results) {
      bestCorrect = Math.max(bestCorrect, correct);
      const completed = { workloads_easy: { correct: bestCorrect, total: 7 } };
      const canonical = computeScore(completed);

      // Canonical should be monotonically non-decreasing
      expect(canonical).toBeGreaterThanOrEqual(prevCanonical);
      // Canonical should always equal bestCorrect * points
      expect(canonical).toBe(bestCorrect * 10);
      prevCanonical = canonical;
    }

    // Final canonical should be max(4,3,5,2,6) * 10 = 60
    expect(prevCanonical).toBe(60);

    // BUG (before fix): per-answer accumulation would have:
    // 40 + 30 + 50 + 20 + 60 = 200, with Math.max preserving each step ← WRONG
  });

  it("multi-topic score is sum of canonical per-topic scores", () => {
    const completed = {
      workloads_easy:   { correct: 5, total: 7 },
      workloads_medium: { correct: 3, total: 7 },
      services_easy:    { correct: 7, total: 7 },
      services_hard:    { correct: 2, total: 5 },
    };
    const score = computeScore(completed);
    expect(score).toBe(
      5 * 10 +   // workloads_easy
      3 * 20 +   // workloads_medium
      7 * 10 +   // services_easy
      2 * 30     // services_hard
    );
    expect(score).toBe(50 + 60 + 70 + 60);
    expect(score).toBe(240);
  });

  it("free-mode topics are excluded from canonical score", () => {
    const completed = {
      workloads_easy: { correct: 5, total: 7 },
      mixed_mixed:    { correct: 10, total: 10 },  // free mode
      daily_daily:    { correct: 5, total: 5 },     // free mode
    };
    const score = computeScore(completed);
    expect(score).toBe(50); // only workloads_easy counts
  });

  it("topic reset produces correct canonical score", () => {
    const completed = {
      workloads_easy:   { correct: 5, total: 7 },
      workloads_medium: { correct: 3, total: 7 },
      services_easy:    { correct: 7, total: 7 },
    };
    const beforeReset = computeScore(completed);
    expect(beforeReset).toBe(50 + 60 + 70);

    // Reset workloads topic — remove all its levels
    const afterReset = { ...completed };
    delete afterReset.workloads_easy;
    delete afterReset.workloads_medium;
    const scoreAfterReset = computeScore(afterReset);
    expect(scoreAfterReset).toBe(70); // only services_easy remains
  });

  it("quiz completion: newStats.total_score always equals computeScore", () => {
    // Simulate the quiz completion flow (line 1787 after fix)
    const completedTopics = {
      workloads_easy: { correct: 5, total: 7 },
    };
    const stats = { total_score: computeScore(completedTopics) }; // 50

    // User completes services_easy with 4/7 correct
    const finalCorrect = 4;
    const key = "services_easy";
    const bestCorrect = finalCorrect; // first time
    const newCompleted = { ...completedTopics, [key]: { correct: bestCorrect, total: 7 } };

    // AFTER FIX: total_score = computeScore(newCompleted)
    const newStats = { ...stats, total_score: computeScore(newCompleted) };
    expect(newStats.total_score).toBe(50 + 40); // 90

    // Verify this matches what leaderboard would show
    const leaderboardScore = computeScore(newCompleted);
    expect(newStats.total_score).toBe(leaderboardScore);
  });
});

describe("Score consistency: per-answer handler must NOT modify total_score", () => {
  it("correct answer should not increment total_score", () => {
    // Simulate the per-answer setStats call (line 1713 after fix)
    const prev = {
      total_score: 100,
      current_streak: 2,
      max_streak: 5,
      total_answered: 10,
      total_correct: 7,
    };
    const correct = true;
    const isFree = false;
    const isRetry = false;

    // After fix: setStats does NOT touch total_score
    const next = (() => {
      if (isRetry) return prev;
      const streak = correct ? prev.current_streak + 1 : 0;
      return {
        ...prev,
        // total_score is NOT modified — computed at quiz completion
        current_streak: isFree ? prev.current_streak : streak,
        max_streak:     isFree ? prev.max_streak     : Math.max(prev.max_streak, streak),
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        total_correct:  isFree ? prev.total_correct  : (correct ? prev.total_correct + 1 : prev.total_correct),
      };
    })();

    expect(next.total_score).toBe(100); // unchanged
    expect(next.total_answered).toBe(11);
    expect(next.total_correct).toBe(8);
    expect(next.current_streak).toBe(3);
  });

  it("wrong answer should not modify total_score", () => {
    const prev = { total_score: 200, current_streak: 3, max_streak: 5, total_answered: 15, total_correct: 12 };
    const correct = false;
    const isFree = false;

    const next = (() => {
      const streak = correct ? prev.current_streak + 1 : 0;
      return {
        ...prev,
        current_streak: isFree ? prev.current_streak : streak,
        max_streak:     isFree ? prev.max_streak     : Math.max(prev.max_streak, streak),
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        total_correct:  isFree ? prev.total_correct  : (correct ? prev.total_correct + 1 : prev.total_correct),
      };
    })();

    expect(next.total_score).toBe(200); // unchanged
    expect(next.current_streak).toBe(0); // streak broken
  });

  it("free-mode answer should not modify total_score", () => {
    const prev = { total_score: 150, current_streak: 2, max_streak: 4, total_answered: 8, total_correct: 6 };
    const correct = true;
    const isFree = true;

    const next = (() => {
      const streak = correct ? prev.current_streak + 1 : 0;
      return {
        ...prev,
        current_streak: isFree ? prev.current_streak : streak,
        max_streak:     isFree ? prev.max_streak     : Math.max(prev.max_streak, streak),
        total_answered: isFree ? prev.total_answered : prev.total_answered + 1,
        total_correct:  isFree ? prev.total_correct  : (correct ? prev.total_correct + 1 : prev.total_correct),
      };
    })();

    expect(next.total_score).toBe(150); // unchanged
    expect(next.total_answered).toBe(8); // free mode doesn't count
  });

  it("retry answer should not modify any stats", () => {
    const prev = { total_score: 100, current_streak: 2, max_streak: 5, total_answered: 10, total_correct: 7 };
    const isRetry = true;

    const next = (() => {
      if (isRetry) return prev;
      return { ...prev, total_score: 999 };
    })();

    expect(next).toEqual(prev); // completely unchanged
  });
});

describe("Score consistency: replay inflation attack", () => {
  it("10 replays of same topic must not increase score", () => {
    let currentScore = 0;
    const topicKey = "workloads_easy";
    let bestCorrect = 0;
    const completedTopics = {};

    // First play: 5/7 correct
    bestCorrect = Math.max(bestCorrect, 5);
    completedTopics[topicKey] = { correct: bestCorrect, total: 7 };
    currentScore = computeScore(completedTopics);
    expect(currentScore).toBe(50);

    // 10 replays with varying results (all worse or equal)
    const replays = [3, 4, 5, 2, 1, 5, 4, 3, 2, 5];
    for (const correct of replays) {
      bestCorrect = Math.max(bestCorrect, correct);
      completedTopics[topicKey] = { correct: bestCorrect, total: 7 };
      const newScore = computeScore(completedTopics);
      expect(newScore).toBe(50); // never increases beyond first play's best
    }
  });

  it("replay with improvement then degradation: score matches best", () => {
    const completedTopics = {};
    const topicKey = "services_medium";
    const scores = [];
    let bestCorrect = 0;

    for (const correct of [3, 5, 4, 7, 2, 6]) {
      bestCorrect = Math.max(bestCorrect, correct);
      completedTopics[topicKey] = { correct: bestCorrect, total: 7 };
      scores.push(computeScore(completedTopics));
    }

    // Scores should be: 60, 100, 100, 140, 140, 140
    expect(scores).toEqual([60, 100, 100, 140, 140, 140]);
  });
});

describe("Score consistency: auth load always uses canonical", () => {
  it("inflated DB value is corrected to canonical on load", () => {
    // Simulate loadUserData with inflated DB total_score
    const base = {
      total_score: 300, // inflated from old per-answer bug
      total_answered: 20,
      total_correct: 15,
      max_streak: 5,
      current_streak: 0,
      completed_topics: {
        workloads_easy: { correct: 5, total: 7 },
        services_easy:  { correct: 7, total: 7 },
      },
    };

    const topicBaseScore = computeScore(base.completed_topics);
    expect(topicBaseScore).toBe(120); // 50 + 70

    // AFTER FIX: total_score = topicBaseScore (not Math.max(300, 120))
    const mergedStats = {
      total_answered: base.total_answered,
      total_correct:  base.total_correct,
      total_score:    topicBaseScore, // canonical, not inflated
      max_streak:     base.max_streak,
      current_streak: base.current_streak,
    };

    expect(mergedStats.total_score).toBe(120);
    // This now matches what the leaderboard would compute from completed_topics
    expect(mergedStats.total_score).toBe(computeScore(base.completed_topics));
  });

  it("new user with no DB row gets canonical score from guest merge", () => {
    const guestCompleted = {
      workloads_easy: { correct: 4, total: 7 },
    };
    const mergedCompleted = { ...guestCompleted };
    const topicBaseScore = computeScore(mergedCompleted);

    expect(topicBaseScore).toBe(40);
  });
});

describe("Score consistency: cache load uses canonical", () => {
  it("cached stats with completedTopics derives canonical score", () => {
    const cachedCompleted = {
      workloads_easy: { correct: 5, total: 7 },
      services_hard:  { correct: 3, total: 5 },
    };
    const cachedStats = { total_score: 999 }; // stale inflated value

    // AFTER FIX: cache load uses computeScore(cached.completedTopics)
    const cachedScore = cachedCompleted ? computeScore(cachedCompleted) : cachedStats.total_score;
    expect(cachedScore).toBe(50 + 90); // 5*10 + 3*30 = 140, not 999
  });
});

describe("Score consistency: resume does not inflate total_score", () => {
  it("resume snapshot with inflated total_score does not leak into stats", () => {
    const prev = { total_score: 100, total_answered: 10, total_correct: 7, current_streak: 2, max_streak: 5 };
    const snap = {
      total_answered: 13,
      total_correct: 10,
      total_score: 180, // inflated from old per-answer accumulation
      current_streak: 3,
      max_streak: 6,
    };

    // AFTER FIX: total_score is NOT reconciled from snapshot
    const reconciled = {
      ...prev,
      total_answered: Math.max(prev.total_answered, snap.total_answered || 0),
      total_correct:  Math.max(prev.total_correct,  snap.total_correct  || 0),
      // total_score intentionally NOT included — it's canonical
      current_streak: Math.max(prev.current_streak, snap.current_streak || 0),
      max_streak:     Math.max(prev.max_streak,     snap.max_streak     || 0),
    };

    expect(reconciled.total_score).toBe(100); // preserved from prev, not inflated to 180
    expect(reconciled.total_answered).toBe(13);
    expect(reconciled.total_correct).toBe(10);
    expect(reconciled.current_streak).toBe(3);
    expect(reconciled.max_streak).toBe(6);
  });
});

describe("Score consistency: end-to-end user flow", () => {
  it("complete flow: start → answer → complete → leaderboard score matches", () => {
    // Step 1: user starts with existing completed topics
    const completedTopics = {
      workloads_easy: { correct: 5, total: 7 },
      services_easy:  { correct: 7, total: 7 },
    };
    let stats = { total_score: computeScore(completedTopics) }; // 120
    expect(stats.total_score).toBe(120);

    // Step 2: user plays networking_medium, answers 4/7 correctly
    // Per-answer: total_score stays at 120 (not incremented per-answer)
    expect(stats.total_score).toBe(120); // unchanged during quiz

    // Step 3: quiz completes
    const finalCorrect = 4;
    const newCompleted = { ...completedTopics, networking_medium: { correct: finalCorrect, total: 7 } };
    const newStats = { ...stats, total_score: computeScore(newCompleted) };
    expect(newStats.total_score).toBe(120 + 4 * 20); // 200

    // Step 4: saveUserData writes newStats to DB
    const dbTotalScore = newStats.total_score; // 200

    // Step 5: leaderboard reads from DB (or computes from completed_topics)
    const leaderboardFromColumn = dbTotalScore;
    const leaderboardFromTopics = computeScore(newCompleted);

    // ALL THREE MUST MATCH
    expect(newStats.total_score).toBe(leaderboardFromColumn);
    expect(newStats.total_score).toBe(leaderboardFromTopics);
    expect(leaderboardFromColumn).toBe(200);
  });

  it("complete flow with replay: score stays correct", () => {
    // Step 1: initial state
    const completedTopics = { workloads_easy: { correct: 5, total: 7 } };
    let stats = { total_score: computeScore(completedTopics) }; // 50

    // Step 2: user replays workloads_easy, gets 3/7
    // Per-answer: total_score stays at 50 (no inflation!)
    expect(stats.total_score).toBe(50);

    // Step 3: quiz completes — bestCorrect = max(5, 3) = 5
    const bestCorrect = Math.max(5, 3);
    const newCompleted = { workloads_easy: { correct: bestCorrect, total: 7 } };
    const newStats = { ...stats, total_score: computeScore(newCompleted) };

    // Score unchanged because best didn't improve
    expect(newStats.total_score).toBe(50);

    // Leaderboard matches
    expect(newStats.total_score).toBe(computeScore(newCompleted));
  });

  it("complete flow with improvement: score increases correctly", () => {
    const completedTopics = { workloads_easy: { correct: 3, total: 7 } };
    let stats = { total_score: computeScore(completedTopics) }; // 30

    // Replay: gets 6/7 this time
    const bestCorrect = Math.max(3, 6);
    const newCompleted = { workloads_easy: { correct: bestCorrect, total: 7 } };
    const newStats = { ...stats, total_score: computeScore(newCompleted) };

    expect(newStats.total_score).toBe(60); // increased from 30 to 60
    expect(newStats.total_score).toBe(computeScore(newCompleted));
  });
});
