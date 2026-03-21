import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeGetJSON } from "./storage";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

const SCORED_KEY = "scoredFreeKeys_v1";

function makeMixedQuestion(id, text, level = "easy") {
  return { id, q: text, options: ["A", "B", "C", "D"], level };
}

/**
 * Simulates the pre-RPC duplicate check added in the fix.
 * This mirrors the logic at handleSubmit before the server call:
 * if the question text (first 100 chars) is already in scoredFreeKeys_v1,
 * skipServerScore = true and scoreRunId is set to null.
 */
function shouldSkipServerScore(question, isRetry = false, isMixedOrDaily = true) {
  if (!isMixedOrDaily || isRetry) return false;
  try {
    const freeKey = question.q.slice(0, 100);
    const scored = new Set(safeGetJSON(SCORED_KEY, []));
    return scored.has(freeKey);
  } catch {
    return false;
  }
}

/**
 * Simulates the post-RPC client-side scoring logic:
 * returns { alreadyScored, earnPoints } and persists new keys.
 */
function clientScoringGuard(question, correct, isRetry = false, isMixedOrDaily = true) {
  let alreadyScored = false;
  if (isMixedOrDaily && correct && !isRetry) {
    try {
      const freeKey = question.q.slice(0, 100);
      const scored = new Set(safeGetJSON(SCORED_KEY, []));
      alreadyScored = scored.has(freeKey);
      if (!alreadyScored) {
        scored.add(freeKey);
        localStorage.setItem(SCORED_KEY, JSON.stringify([...scored]));
      }
    } catch {}
  }
  const earnPoints = isMixedOrDaily ? !alreadyScored : true;
  return { alreadyScored, earnPoints };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Mixed mode duplicate scoring prevention", () => {

  it("grants points for a question answered correctly the first time", () => {
    const q = makeMixedQuestion(1, "What is a Pod in Kubernetes?");
    // Pre-RPC check: not yet scored
    expect(shouldSkipServerScore(q)).toBe(false);
    // Client-side guard: grants points and records
    const { alreadyScored, earnPoints } = clientScoringGuard(q, true);
    expect(alreadyScored).toBe(false);
    expect(earnPoints).toBe(true);
  });

  it("blocks points when the same question appears again in a new mixed run", () => {
    const q = makeMixedQuestion(1, "What is a Pod in Kubernetes?");
    // First time: score it
    clientScoringGuard(q, true);
    // Second time (new mixed quiz, same question):
    // Pre-RPC check should block server scoring
    expect(shouldSkipServerScore(q)).toBe(true);
    // Client-side guard should also block
    const { alreadyScored, earnPoints } = clientScoringGuard(q, true);
    expect(alreadyScored).toBe(true);
    expect(earnPoints).toBe(false);
  });

  it("does not inflate score when the same question appears multiple times", () => {
    const q = makeMixedQuestion(1, "What is a Pod in Kubernetes?");
    let totalServerCalls = 0;
    // Simulate 5 appearances of the same question across different runs
    for (let run = 0; run < 5; run++) {
      const skipServer = shouldSkipServerScore(q);
      if (!skipServer) totalServerCalls++;
      clientScoringGuard(q, true);
    }
    // Server should only be called once (the first time)
    expect(totalServerCalls).toBe(1);
  });

  it("still grants points for legitimate new questions", () => {
    const q1 = makeMixedQuestion(1, "What is a Pod?");
    const q2 = makeMixedQuestion(2, "What is a Service?");
    const q3 = makeMixedQuestion(3, "What is a Deployment?");
    // Answer q1 first
    clientScoringGuard(q1, true);
    // q2 and q3 are new questions
    expect(shouldSkipServerScore(q2)).toBe(false);
    expect(shouldSkipServerScore(q3)).toBe(false);
    const r2 = clientScoringGuard(q2, true);
    const r3 = clientScoringGuard(q3, true);
    expect(r2.earnPoints).toBe(true);
    expect(r3.earnPoints).toBe(true);
  });

  it("does not block scoring for incorrect answers (no points anyway)", () => {
    const q = makeMixedQuestion(1, "What is a Pod?");
    // Incorrect answer: no entry in scoredFreeKeys
    const { alreadyScored, earnPoints } = clientScoringGuard(q, false);
    expect(alreadyScored).toBe(false);
    // earnPoints is true but points=0 because correct=false
    expect(earnPoints).toBe(true);
  });

  it("does not block scoring in retry mode", () => {
    const q = makeMixedQuestion(1, "What is a Pod?");
    // First time: score it
    clientScoringGuard(q, true);
    // Retry mode: both checks should be skipped
    expect(shouldSkipServerScore(q, /* isRetry */ true)).toBe(false);
    const { alreadyScored } = clientScoringGuard(q, true, /* isRetry */ true);
    expect(alreadyScored).toBe(false);
  });

  it("does not block scoring in non-mixed/daily modes (topic mode)", () => {
    const q = makeMixedQuestion(1, "What is a Pod?");
    // First time in topic mode
    expect(shouldSkipServerScore(q, false, /* isMixedOrDaily */ false)).toBe(false);
    // Even after it's been scored in mixed mode:
    clientScoringGuard(q, true, false, true); // score in mixed mode
    // Topic mode should still not be blocked by the pre-RPC check
    expect(shouldSkipServerScore(q, false, /* isMixedOrDaily */ false)).toBe(false);
  });

  it("persists scored keys across localStorage reads", () => {
    const q = makeMixedQuestion(1, "What is a Pod in Kubernetes?");
    clientScoringGuard(q, true);
    // Verify the key is stored
    const stored = JSON.parse(localStorage.getItem(SCORED_KEY));
    expect(stored).toContain("What is a Pod in Kubernetes?");
    // Re-read from localStorage (simulating a new quiz session)
    expect(shouldSkipServerScore(q)).toBe(true);
  });

  it("handles localStorage being empty gracefully", () => {
    const q = makeMixedQuestion(1, "What is a Pod?");
    localStorage.removeItem(SCORED_KEY);
    expect(shouldSkipServerScore(q)).toBe(false);
    const { earnPoints } = clientScoringGuard(q, true);
    expect(earnPoints).toBe(true);
  });

  it("handles corrupted JSON in scoredFreeKeys_v1 gracefully", () => {
    const q = makeMixedQuestion(1, "What is a Pod?");
    // Store corrupt JSON
    localStorage.setItem(SCORED_KEY, "not-valid-json{{{");
    // safeGetJSON removes corrupt key and returns fallback []
    // so skipServerScore should be false (safe fallback: allow scoring)
    expect(shouldSkipServerScore(q)).toBe(false);
    // Client guard should also work and allow scoring
    const { earnPoints } = clientScoringGuard(q, true);
    expect(earnPoints).toBe(true);
    // After scoring, the key should now contain valid JSON
    const stored = JSON.parse(localStorage.getItem(SCORED_KEY));
    expect(stored).toContain("What is a Pod?");
  });
});
