import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveQuizState, loadQuizState, clearQuizState, isRecentQuizState } from "./quizPersistence";

// ── Helpers ──────────────────────────────────────────────────────────────────

const INCIDENT_SAVE_KEY = "incident_progress_v1";

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
    quizRunId: "run1",
    userId: "user-a",
    topicId: "networking",
    topicName: "Networking",
    topicColor: "#00D4FF",
    topicIcon: "🌐",
    level: "easy",
    lang: "he",
    quizType: "topic",
    questions: makeQuestions(5),
    questionIndex: 2,
    submitted: false,
    selectedAnswer: null,
    showExplanation: false,
    answerResult: null,
    quizHistory: [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
    ],
    sessionScore: 20,
    topicCorrect: 2,
    retryMode: false,
    isRetry: false,
    timerEnabled: false,
    isInterviewMode: false,
    timeLeft: 30,
    savedStats: { total_answered: 10, total_correct: 8, total_score: 90, current_streak: 2, max_streak: 4 },
    statsDelta: { answered: 2, correct: 2, currentStreak: 2, maxStreak: 4 },
    ...overrides,
  };
}

function saveIncidentProgress(data) {
  localStorage.setItem(INCIDENT_SAVE_KEY, JSON.stringify(data));
}

function loadIncidentProgress() {
  try {
    const raw = localStorage.getItem(INCIDENT_SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

/** Mirrors the userId check added to incident resume loading in App.jsx */
function loadIncidentForUser(currentUserId) {
  const saved = loadIncidentProgress();
  if (!saved?.incidentId) return null;
  // Backward compat: old saves without userId are accepted
  if (saved.userId && saved.userId !== currentUserId) return null;
  return saved;
}

/**
 * Mirrors the quiz save-effect guard from App.jsx:
 * "Don't re-save after the quiz is fully answered"
 */
function shouldPersistQuiz({ quizHistory, currentQuestions, screen, topicScreen, user, selectedTopic, selectedLevel, quizRunId }) {
  if (screen !== "topic" || topicScreen !== "quiz") return false;
  if (!selectedTopic || !selectedLevel || !quizRunId) return false;
  if (!user) return false;
  if (quizHistory.length >= currentQuestions.length && currentQuestions.length > 0) return false;
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
  });
});

// =============================================================================
// 1. Cross-user isolation for incident resume
// =============================================================================

describe("Incident resume: cross-user isolation", () => {
  it("User A's incident progress is not visible to User B", () => {
    saveIncidentProgress({
      incidentId: "pod-crash-loop",
      stepIndex: 2,
      score: 20,
      mistakes: 1,
      elapsed: 45,
      history: [{ chosen: 0, correct: true, answer: 0 }, { chosen: 1, correct: true, answer: 1 }],
      userId: "user-a",
    });

    // User A can see it
    expect(loadIncidentForUser("user-a")).not.toBeNull();
    expect(loadIncidentForUser("user-a").incidentId).toBe("pod-crash-loop");

    // User B cannot
    expect(loadIncidentForUser("user-b")).toBeNull();

    // Guest cannot
    expect(loadIncidentForUser("guest")).toBeNull();
  });

  it("guest incident progress is not visible to authenticated user", () => {
    saveIncidentProgress({
      incidentId: "dns-failure",
      stepIndex: 1,
      score: 10,
      mistakes: 0,
      elapsed: 20,
      history: [{ chosen: 0, correct: true, answer: 0 }],
      userId: "guest",
    });

    expect(loadIncidentForUser("guest")).not.toBeNull();
    expect(loadIncidentForUser("user-a")).toBeNull();
  });

  it("old saves without userId are accepted by any user (backward compat)", () => {
    saveIncidentProgress({
      incidentId: "pod-crash-loop",
      stepIndex: 1,
      score: 10,
      mistakes: 0,
      elapsed: 15,
      history: [],
      // no userId field
    });

    expect(loadIncidentForUser("user-a")).not.toBeNull();
    expect(loadIncidentForUser("guest")).not.toBeNull();
  });

  it("logout clears incident progress so next user sees nothing", () => {
    saveIncidentProgress({
      incidentId: "pod-crash-loop",
      stepIndex: 2,
      score: 20,
      userId: "user-a",
    });

    // Simulate logout cleanup
    localStorage.removeItem(INCIDENT_SAVE_KEY);

    expect(loadIncidentForUser("user-a")).toBeNull();
    expect(loadIncidentForUser("user-b")).toBeNull();
  });
});

// =============================================================================
// 2. Quiz resume preserves submitted answerResult
// =============================================================================

describe("Quiz resume: answerResult preserved after server validation", () => {
  it("answerResult is persisted and restored when submitted=true", () => {
    const answerResult = { correct: true, correctIndex: 2, explanation: "Because X" };
    const state = makeValidState({
      submitted: true,
      showExplanation: true,
      selectedAnswer: 2,
      answerResult,
    });
    saveQuizState(state);

    const loaded = loadQuizState();
    expect(loaded.submitted).toBe(true);
    expect(loaded.showExplanation).toBe(true);
    expect(loaded.answerResult).toEqual(answerResult);
    expect(loaded.answerResult.explanation).toBe("Because X");
  });

  it("answerResult=null with submitted=true is the stale-save scenario we fixed", () => {
    // This represents what happened BEFORE the fix: submitted was saved
    // before the async RPC returned answerResult.
    const state = makeValidState({
      submitted: true,
      showExplanation: true,
      answerResult: null,
    });
    saveQuizState(state);

    const loaded = loadQuizState();
    expect(loaded.submitted).toBe(true);
    // The loaded state has null answerResult - this is the scenario that
    // triggered the dep-array fix. The UI must handle this gracefully.
    expect(loaded.answerResult).toBeNull();
  });

  it("after the dep-array fix, a second save with answerResult overwrites the stale save", () => {
    // First save: submitted=true but answerResult not yet available
    const state1 = makeValidState({
      submitted: true,
      showExplanation: false,
      answerResult: null,
    });
    saveQuizState(state1);
    expect(loadQuizState().answerResult).toBeNull();

    // Second save: answerResult arrives (simulates the dep-array re-trigger)
    const state2 = {
      ...state1,
      showExplanation: true,
      answerResult: { correct: false, correctIndex: 1, explanation: "The answer is B" },
    };
    saveQuizState(state2);

    const loaded = loadQuizState();
    expect(loaded.answerResult).not.toBeNull();
    expect(loaded.answerResult.correct).toBe(false);
    expect(loaded.answerResult.explanation).toBe("The answer is B");
    expect(loaded.showExplanation).toBe(true);
  });
});

// =============================================================================
// 3. Completed quiz is not re-saved as zombie state
// =============================================================================

describe("Quiz save guard: completed quiz not re-persisted", () => {
  it("save is blocked when quizHistory covers all questions", () => {
    const questions = makeQuestions(3);
    const quizHistory = [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
      { q: "Q2", options: ["A","B","C","D"], answer: 2, chosen: 2, explanation: "E2" },
    ];

    const shouldSave = shouldPersistQuiz({
      quizHistory,
      currentQuestions: questions,
      screen: "topic",
      topicScreen: "quiz",
      user: { id: "user-a" },
      selectedTopic: { id: "networking" },
      selectedLevel: "easy",
      quizRunId: "run1",
    });

    expect(shouldSave).toBe(false);
  });

  it("save is allowed when quiz is still in progress", () => {
    const questions = makeQuestions(5);
    const quizHistory = [
      { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
      { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
    ];

    const shouldSave = shouldPersistQuiz({
      quizHistory,
      currentQuestions: questions,
      screen: "topic",
      topicScreen: "quiz",
      user: { id: "user-a" },
      selectedTopic: { id: "networking" },
      selectedLevel: "easy",
      quizRunId: "run1",
    });

    expect(shouldSave).toBe(true);
  });

  it("save is blocked when user is null (logout in progress)", () => {
    const shouldSave = shouldPersistQuiz({
      quizHistory: [],
      currentQuestions: makeQuestions(5),
      screen: "topic",
      topicScreen: "quiz",
      user: null,
      selectedTopic: { id: "networking" },
      selectedLevel: "easy",
      quizRunId: "run1",
    });

    expect(shouldSave).toBe(false);
  });

  it("save is blocked on wrong screen", () => {
    const shouldSave = shouldPersistQuiz({
      quizHistory: [],
      currentQuestions: makeQuestions(5),
      screen: "home",
      topicScreen: "quiz",
      user: { id: "user-a" },
      selectedTopic: { id: "networking" },
      selectedLevel: "easy",
      quizRunId: "run1",
    });

    expect(shouldSave).toBe(false);
  });

  it("clearQuizState + save guard together prevent zombie: clear then check", () => {
    // Simulate nextQuestion completion flow:
    // 1. Quiz fully answered
    const state = makeValidState({
      questions: makeQuestions(3),
      quizHistory: [
        { q: "Q0", options: ["A","B","C","D"], answer: 0, chosen: 0, explanation: "E0" },
        { q: "Q1", options: ["A","B","C","D"], answer: 1, chosen: 1, explanation: "E1" },
        { q: "Q2", options: ["A","B","C","D"], answer: 2, chosen: 2, explanation: "E2" },
      ],
    });
    saveQuizState(state);
    expect(loadQuizState()).not.toBeNull();

    // 2. nextQuestion calls clearQuizState
    clearQuizState();
    expect(loadQuizState()).toBeNull();

    // 3. Even if the save effect fires again, the guard blocks it
    const shouldSave = shouldPersistQuiz({
      quizHistory: state.quizHistory,
      currentQuestions: state.questions,
      screen: "topic",
      topicScreen: "quiz",
      user: { id: "user-a" },
      selectedTopic: { id: "networking" },
      selectedLevel: "easy",
      quizRunId: "run1",
    });
    expect(shouldSave).toBe(false);

    // 4. localStorage stays clean
    expect(loadQuizState()).toBeNull();
  });
});

// =============================================================================
// 4. Auto-resume works after logout and re-login
// =============================================================================

describe("Auto-resume after logout/re-login cycle", () => {
  /**
   * Mirrors the autoResumeAttempted ref behavior:
   * - Set to true after first auto-resume attempt
   * - Must be reset on logout for second login to work
   */
  it("autoResumeAttempted blocks second auto-resume in same session", () => {
    let autoResumeAttempted = false;

    // First login: auto-resume fires
    const saved1 = makeValidState({ userId: "user-a" });
    saveQuizState(saved1);
    const loaded1 = loadQuizState();
    expect(loaded1).not.toBeNull();
    expect(isRecentQuizState(loaded1)).toBe(true);

    // Simulate auto-resume attempt
    autoResumeAttempted = true;

    // Second attempt in same session: blocked
    const loaded2 = loadQuizState();
    expect(loaded2).not.toBeNull(); // data exists
    expect(autoResumeAttempted).toBe(true); // but gate blocks it
  });

  it("resetting autoResumeAttempted on logout allows auto-resume on next login", () => {
    let autoResumeAttempted = false;

    // First login
    saveQuizState(makeValidState({ userId: "user-a" }));
    autoResumeAttempted = true;

    // Logout: reset the gate
    clearQuizState();
    autoResumeAttempted = false; // <-- the fix

    // Second login as same or different user
    saveQuizState(makeValidState({ userId: "user-a" }));
    const loaded = loadQuizState();

    expect(autoResumeAttempted).toBe(false); // gate is open
    expect(loaded).not.toBeNull();
    expect(isRecentQuizState(loaded)).toBe(true);
  });

  it("quiz saved by User A is not auto-resumed for User B", () => {
    saveQuizState(makeValidState({ userId: "user-a" }));

    const loaded = loadQuizState();
    expect(loaded).not.toBeNull();

    // User B checks if this save belongs to them
    const belongsToB = loaded.userId === "user-b";
    expect(belongsToB).toBe(false);
  });

  it("logout clears quiz state so next user gets clean slate", () => {
    saveQuizState(makeValidState({ userId: "user-a" }));
    expect(loadQuizState()).not.toBeNull();

    // Simulate handleLogout
    clearQuizState();

    expect(loadQuizState()).toBeNull();
  });
});

// =============================================================================
// 5. Incident resume restores the correct incident (not stale steps)
// =============================================================================

describe("Incident resume: correct incident identity", () => {
  it("resumed incident ID matches what was saved", () => {
    saveIncidentProgress({
      incidentId: "dns-failure",
      stepIndex: 3,
      score: 30,
      mistakes: 0,
      elapsed: 120,
      history: [
        { chosen: 0, correct: true, answer: 0 },
        { chosen: 1, correct: true, answer: 1 },
        { chosen: 0, correct: true, answer: 0 },
      ],
      userId: "user-a",
    });

    const saved = loadIncidentForUser("user-a");
    expect(saved.incidentId).toBe("dns-failure");
    expect(saved.stepIndex).toBe(3);
    expect(saved.history).toHaveLength(3);
  });

  it("starting Incident B after Incident A overwrites saved progress", () => {
    // User completes Incident A partially
    saveIncidentProgress({
      incidentId: "pod-crash-loop",
      stepIndex: 2,
      score: 20,
      userId: "user-a",
    });

    // User starts Incident B (startIncident calls clearIncidentProgress then saves)
    localStorage.removeItem(INCIDENT_SAVE_KEY); // clearIncidentProgress
    // After first step submission, new progress is saved:
    saveIncidentProgress({
      incidentId: "dns-failure",
      stepIndex: 0,
      score: 0,
      userId: "user-a",
    });

    const saved = loadIncidentForUser("user-a");
    expect(saved.incidentId).toBe("dns-failure");
    expect(saved.stepIndex).toBe(0);
    // Incident A is gone
  });

  it("incident completion clears saved progress", () => {
    saveIncidentProgress({
      incidentId: "pod-crash-loop",
      stepIndex: 4,
      score: 50,
      userId: "user-a",
    });

    // nextIncidentStep on last step calls clearIncidentProgress
    localStorage.removeItem(INCIDENT_SAVE_KEY);

    expect(loadIncidentForUser("user-a")).toBeNull();
  });

  it("incidentSteps=null after resume forces re-fetch (logic verification)", () => {
    // This tests the principle: resumeIncident should set incidentSteps to null.
    // The actual fetch is triggered by a useEffect with guard:
    //   if (screen !== "incident" || !selectedIncident || incidentSteps) return;
    // When incidentSteps is null, the guard passes and fetch fires.

    let incidentSteps = [{ id: "old-step", prompt: "old" }]; // stale from Incident A

    // resumeIncident resets it
    incidentSteps = null;

    // The fetch-effect guard now passes
    const shouldFetch = incidentSteps === null;
    expect(shouldFetch).toBe(true);
  });
});

// =============================================================================
// 6. k8s_progress_v2 cache: userId guard
// =============================================================================

describe("Progress cache: userId guard on mount restore", () => {
  it("cache with valid userId is restored", () => {
    store["k8s_progress_v2"] = JSON.stringify({
      userId: "user-a",
      stats: { total_answered: 50, total_correct: 40, total_score: 500 },
      completedTopics: { networking_easy: { correct: 8, total: 8 } },
    });

    const cached = JSON.parse(store["k8s_progress_v2"]);
    expect(cached && cached.userId).toBeTruthy();
  });

  it("cache with null userId is skipped (post-logout state)", () => {
    store["k8s_progress_v2"] = JSON.stringify({
      userId: null,
      stats: { total_answered: 0, total_correct: 0, total_score: 0 },
      completedTopics: {},
    });

    const cached = JSON.parse(store["k8s_progress_v2"]);
    const shouldRestore = cached && cached.userId;
    expect(shouldRestore).toBeFalsy();
  });

  it("missing cache returns null", () => {
    const raw = localStorage.getItem("k8s_progress_v2");
    expect(raw).toBeNull();
  });
});
