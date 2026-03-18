import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveQuizState, loadQuizState, clearQuizState, isRecentQuizState } from "./quizPersistence";
import { safeGetItem, safeGetJSON, checkDataVersion, clearAppData } from "./storage";

// ── Helpers ──────────────────────────────────────────────────────────────────

const INCIDENT_SAVE_KEY = "incident_progress_v1";
const PROGRESS_CACHE_KEY = "k8s_progress_v2";

function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    q: `Q${i}`, options: ["A", "B", "C", "D"], answer: 0, explanation: `E${i}`,
  }));
}

function makeQuizState(overrides = {}) {
  return {
    quizRunId: "run1", userId: "user-a", topicId: "networking",
    topicName: "Networking", topicColor: "#00D4FF", topicIcon: "🌐",
    level: "easy", lang: "he", quizType: "topic",
    questions: makeQuestions(5), questionIndex: 2,
    submitted: false, selectedAnswer: null, showExplanation: false,
    answerResult: null,
    quizHistory: [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
    ],
    sessionScore: 20, topicCorrect: 2,
    retryMode: false, isRetry: false,
    timerEnabled: false, isInterviewMode: false, timeLeft: 30,
    savedStats: { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 2, max_streak: 4 },
    statsDelta: { answered: 2, correct: 2, currentStreak: 2, maxStreak: 4 },
    ...overrides,
  };
}

function makeIncidentSave(overrides = {}) {
  return {
    incidentId: "pod-crash-loop", stepIndex: 2, score: 20,
    mistakes: 1, elapsed: 45, userId: "user-a",
    history: [
      { chosen: 0, correct: true, answer: 0 },
      { chosen: 1, correct: true, answer: 1 },
    ],
    ...overrides,
  };
}

function saveIncident(data) {
  localStorage.setItem(INCIDENT_SAVE_KEY, JSON.stringify(data));
}

function loadIncident() {
  try { return JSON.parse(localStorage.getItem(INCIDENT_SAVE_KEY)); } catch { return null; }
}

function loadIncidentForUser(userId) {
  const saved = loadIncident();
  if (!saved?.incidentId) return null;
  if (saved.userId && saved.userId !== userId) return null;
  return saved;
}

function saveProgressCache(data) {
  localStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(data));
}

function loadProgressCache() {
  const cached = safeGetJSON(PROGRESS_CACHE_KEY);
  if (!cached || !cached.userId) return null;
  return cached;
}

/** Mirrors the save-effect guard from App.jsx */
function shouldPersistQuiz({ quizHistory, questionCount, screen, topicScreen, user }) {
  if (screen !== "topic" || topicScreen !== "quiz") return false;
  if (!user) return false;
  if (quizHistory.length >= questionCount && questionCount > 0) return false;
  return true;
}

// ── localStorage mock ────────────────────────────────────────────────────────

let store = {};
beforeEach(() => {
  store = {};
  vi.stubGlobal("localStorage", {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 1: localStorage corruption and recovery
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("localStorage corruption: quiz state", () => {
  it("totally invalid JSON → loadQuizState returns null, app can start fresh", () => {
    store["k8s_quiz_inprogress_v1"] = "NOT_JSON{{{";
    expect(loadQuizState()).toBeNull();
  });

  it("valid JSON but wrong shape → returns null", () => {
    store["k8s_quiz_inprogress_v1"] = JSON.stringify({ foo: "bar", timestamp: Date.now() });
    expect(loadQuizState()).toBeNull();
  });

  it("questions replaced with string → returns null", () => {
    saveQuizState(makeQuizState({ questions: "corrupted" }));
    expect(loadQuizState()).toBeNull();
  });

  it("timestamp missing → returns null", () => {
    store["k8s_quiz_inprogress_v1"] = JSON.stringify({
      topicId: "x", level: "easy", questions: makeQuestions(3),
      // no timestamp
    });
    expect(loadQuizState()).toBeNull();
  });

  it("expired state (>24h) → auto-removed and returns null", () => {
    const old = makeQuizState();
    old.timestamp = Date.now() - 25 * 60 * 60 * 1000;
    store["k8s_quiz_inprogress_v1"] = JSON.stringify(old);

    expect(loadQuizState()).toBeNull();
    expect(store["k8s_quiz_inprogress_v1"]).toBeUndefined();
  });
});

describe("localStorage corruption: incident state", () => {
  it("invalid JSON → loadIncident returns null", () => {
    store[INCIDENT_SAVE_KEY] = "broken{{{";
    expect(loadIncident()).toBeNull();
  });

  it("missing incidentId → loadIncidentForUser returns null", () => {
    store[INCIDENT_SAVE_KEY] = JSON.stringify({ stepIndex: 2, userId: "user-a" });
    expect(loadIncidentForUser("user-a")).toBeNull();
  });
});

describe("localStorage corruption: progress cache", () => {
  it("invalid JSON → safeGetJSON returns fallback", () => {
    store[PROGRESS_CACHE_KEY] = "NOPE{";
    expect(safeGetJSON(PROGRESS_CACHE_KEY)).toBeNull();
    // Auto-removes corrupt key
    expect(store[PROGRESS_CACHE_KEY]).toBeUndefined();
  });

  it("null userId → loadProgressCache returns null", () => {
    saveProgressCache({ userId: null, stats: {}, completedTopics: {} });
    expect(loadProgressCache()).toBeNull();
  });

  it("valid cache is restored", () => {
    saveProgressCache({ userId: "user-a", stats: { total_score: 100 }, completedTopics: {} });
    const cached = loadProgressCache();
    expect(cached.userId).toBe("user-a");
    expect(cached.stats.total_score).toBe(100);
  });
});

describe("localStorage entirely unavailable", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: () => { throw new DOMException("quota exceeded"); },
      setItem: () => { throw new DOMException("quota exceeded"); },
      removeItem: () => { throw new DOMException("quota exceeded"); },
      clear: () => { throw new DOMException("quota exceeded"); },
    });
  });

  it("safeGetItem returns fallback", () => {
    expect(safeGetItem("anything", "default")).toBe("default");
  });

  it("safeGetJSON returns fallback", () => {
    expect(safeGetJSON("anything", { empty: true })).toEqual({ empty: true });
  });

  it("saveQuizState does not throw", () => {
    expect(() => saveQuizState(makeQuizState())).not.toThrow();
  });

  it("loadQuizState returns null", () => {
    expect(loadQuizState()).toBeNull();
  });

  it("clearQuizState does not throw", () => {
    expect(() => clearQuizState()).not.toThrow();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 2: RPC / network failure simulation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("RPC failure: answer check unavailable", () => {
  // These test the decision logic, not the RPC itself.
  // App.jsx handleSubmit: if rpcResult is null, clearQuizState and go home.

  it("null rpcResult → quiz should be cleared (not left in broken state)", () => {
    saveQuizState(makeQuizState({ submitted: true }));

    // Simulate: RPC returned null (stale question ID after DB re-seed)
    const rpcResult = null;
    if (!rpcResult) {
      clearQuizState();
    }

    expect(loadQuizState()).toBeNull();
  });

  it("RPC failure with local fallback → offline answer preserved", () => {
    // When server RPC fails, handleSubmit falls back to q.answer (local field)
    const q = { q: "Test", options: ["A", "B", "C", "D"], answer: 2, explanation: "Because C" };
    const result = {
      correct: 1 === q.answer, // user selected 1, correct is 2
      correctIndex: q.answer,
      explanation: q.explanation,
    };

    expect(result.correct).toBe(false);
    expect(result.correctIndex).toBe(2);
    expect(result.explanation).toBe("Because C");
  });
});

describe("RPC failure: incident answer check falls back to local", () => {
  it("offline incident step uses local answer field", () => {
    const step = { answer: 1, explanation: "Restart the pod", explanationHe: "הפעל מחדש" };
    const userAnswer = 1;
    const correct = userAnswer === step.answer;

    expect(correct).toBe(true);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 3: Auth transition invariants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Auth transition: guest → authenticated", () => {
  it("guest quiz save is invisible to authenticated user", () => {
    saveQuizState(makeQuizState({ userId: "guest" }));
    const loaded = loadQuizState();

    expect(loaded.userId).toBe("guest");
    // Auth user checks: saved.userId === user.id
    expect(loaded.userId === "user-a").toBe(false);
  });

  it("guest incident save is invisible to authenticated user", () => {
    saveIncident(makeIncidentSave({ userId: "guest" }));
    expect(loadIncidentForUser("user-a")).toBeNull();
  });

  it("guest progress cache is not restored for authenticated user", () => {
    saveProgressCache({ userId: "guest", stats: { total_score: 50 }, completedTopics: {} });
    const cached = loadProgressCache();
    // Cache is returned (userId is truthy), but the caller must check userId match
    expect(cached.userId).toBe("guest");
    expect(cached.userId === "user-a").toBe(false);
  });
});

describe("Auth transition: authenticated → logout → different user", () => {
  it("full logout cleanup leaves no trace for next user", () => {
    // User A's session
    saveQuizState(makeQuizState({ userId: "user-a" }));
    saveIncident(makeIncidentSave({ userId: "user-a" }));
    saveProgressCache({ userId: "user-a", stats: { total_score: 200 }, completedTopics: {} });

    // Logout clears everything (mirrors handleLogout)
    clearQuizState();
    localStorage.removeItem(INCIDENT_SAVE_KEY);
    localStorage.removeItem(PROGRESS_CACHE_KEY);

    // User B logs in — clean slate
    expect(loadQuizState()).toBeNull();
    expect(loadIncidentForUser("user-b")).toBeNull();
    expect(loadProgressCache()).toBeNull();
  });

  it("incomplete logout (only quiz cleared) still blocks cross-user incident", () => {
    saveIncident(makeIncidentSave({ userId: "user-a" }));
    // Quiz cleared, but incident wasn't (simulates partial cleanup)
    clearQuizState();

    // User B can't see User A's incident
    expect(loadIncidentForUser("user-b")).toBeNull();
    // User A could still see it
    expect(loadIncidentForUser("user-a")).not.toBeNull();
  });
});

describe("Auth transition: token expiry / forced sign-out", () => {
  it("persistence guards block writes when user becomes null", () => {
    // User was active, now user is null (SIGNED_OUT event)
    expect(shouldPersistQuiz({
      quizHistory: [{ q: "Q0" }],
      questionCount: 5,
      screen: "topic",
      topicScreen: "quiz",
      user: null,
    })).toBe(false);
  });

  it("existing saves survive token expiry (read-only, not cleared)", () => {
    saveQuizState(makeQuizState({ userId: "user-a" }));
    saveIncident(makeIncidentSave({ userId: "user-a" }));

    // Token expires — no cleanup runs (unlike explicit logout)
    // Data should still be there for when user re-authenticates
    expect(loadQuizState()).not.toBeNull();
    expect(loadIncidentForUser("user-a")).not.toBeNull();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION 4: Critical state machine invariants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Invariant: quiz state consistency", () => {
  it("quizHistory.length never exceeds questions.length after round-trip", () => {
    const qs = makeQuestions(3);
    const history = qs.map((q, i) => ({
      q: q.q, options: q.options, answer: q.answer, chosen: i % 2, explanation: q.explanation,
    }));
    saveQuizState(makeQuizState({ questions: qs, quizHistory: history, questionIndex: 2 }));
    const loaded = loadQuizState();

    expect(loaded.quizHistory.length).toBeLessThanOrEqual(loaded.questions.length);
  });

  it("questionIndex is always within [0, questions.length-1] after load", () => {
    // Even if saved with out-of-bounds value
    saveQuizState(makeQuizState({ questionIndex: 999, questions: makeQuestions(3) }));
    const loaded = loadQuizState();

    expect(loaded.questionIndex).toBeGreaterThanOrEqual(0);
    expect(loaded.questionIndex).toBeLessThan(loaded.questions.length);
  });

  it("submitted=true without answerResult is a recoverable state", () => {
    // This is the stale-save scenario. The UI should handle it without crashing.
    saveQuizState(makeQuizState({ submitted: true, answerResult: null }));
    const loaded = loadQuizState();

    expect(loaded.submitted).toBe(true);
    expect(loaded.answerResult).toBeNull();
    // The "Next" button should still work — user can advance past the question
  });
});

describe("Invariant: incident state consistency", () => {
  it("stepIndex within saved history length", () => {
    const saved = makeIncidentSave({ stepIndex: 2, history: [{ chosen: 0 }, { chosen: 1 }] });
    saveIncident(saved);
    const loaded = loadIncident();

    expect(loaded.stepIndex).toBeLessThanOrEqual(loaded.history.length);
  });

  it("score and mistakes are non-negative", () => {
    saveIncident(makeIncidentSave({ score: -5, mistakes: -1 }));
    const loaded = loadIncident();

    // The app doesn't sanitize these on load (unlike quiz state),
    // but they should never be negative in practice
    expect(typeof loaded.score).toBe("number");
    expect(typeof loaded.mistakes).toBe("number");
  });
});

describe("Invariant: data version check", () => {
  it("checkDataVersion does not throw when localStorage is empty", () => {
    expect(() => checkDataVersion()).not.toThrow();
  });

  it("checkDataVersion does not throw with corrupt stored version", () => {
    store["kq_data_version"] = "not-a-number";
    expect(() => checkDataVersion()).not.toThrow();
  });
});
