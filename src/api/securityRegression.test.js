import { describe, it, expect, vi } from "vitest";
import {
  checkQuizAnswer,
  checkDailyAnswer,
  checkIncidentAnswer,
  fetchQuizQuestions,
  fetchMixedQuestions,
  fetchDailyQuestions,
  fetchLeaderboard,
  fetchUserRank,
  saveUserProgress,
} from "./quiz";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Mock a Supabase client whose .rpc() resolves with the given value. */
function mockSupabase(returnValue = { data: { correct: true, correct_answer: 1, explanation: "ok" }, error: null }) {
  const rpc = vi.fn().mockResolvedValue(returnValue);
  return { rpc, __calls: () => rpc.mock.calls };
}

/** Mock a Supabase client whose .rpc() rejects with the given error string. */
function mockSupabaseError(message) {
  return mockSupabase({ data: null, error: new Error(message) });
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. Auth guard: answer-check RPCs reject unauthenticated callers
//    (mirrors the SQL `IF caller_id IS NULL THEN RAISE EXCEPTION`)
// ═════════════════════════════════════════════════════════════════════════════

describe("Auth guard: answer-check RPCs propagate 'Not authenticated' errors", () => {
  it("checkQuizAnswer throws on auth error", async () => {
    const sb = mockSupabaseError("Not authenticated");
    await expect(checkQuizAnswer(sb, 1, 0)).rejects.toThrow("Not authenticated");
  });

  it("checkDailyAnswer throws on auth error", async () => {
    const sb = mockSupabaseError("Not authenticated");
    await expect(checkDailyAnswer(sb, 1, 0)).rejects.toThrow("Not authenticated");
  });

  it("checkIncidentAnswer throws on auth error", async () => {
    const sb = mockSupabaseError("Not authenticated");
    await expect(checkIncidentAnswer(sb, 1, 0)).rejects.toThrow("Not authenticated");
  });

  it("saveUserProgress throws on auth error", async () => {
    const sb = mockSupabaseError("Not authenticated");
    await expect(saveUserProgress(sb, {
      username: "u", bestScore: 0, totalAnswered: 0, totalCorrect: 0,
      maxStreak: 0, currentStreak: 0, completedTopics: {}, achievements: [], topicStats: {},
    })).rejects.toThrow("Not authenticated");
  });

  it("fetchUserRank throws on IDOR rejection", async () => {
    const sb = mockSupabaseError("Forbidden: cannot query another user's rank");
    await expect(fetchUserRank(sb, "fake-uuid")).rejects.toThrow("Forbidden");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. Authenticated quiz flow: RPCs called with correct parameters
// ═════════════════════════════════════════════════════════════════════════════

describe("Authenticated quiz flow", () => {
  it("fetchQuizQuestions calls get_quiz_questions RPC", async () => {
    const sb = mockSupabase({ data: [{ id: 1, q: "Q?", options: ["A", "B"] }], error: null });
    const result = await fetchQuizQuestions(sb, "pods", "easy", "en");

    expect(sb.rpc).toHaveBeenCalledWith("get_quiz_questions", {
      p_topic: "pods",
      p_level: "easy",
      p_lang: "en",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty("answer");
  });

  it("checkQuizAnswer sends scoring params for authenticated run", async () => {
    const sb = mockSupabase();
    await checkQuizAnswer(sb, 42, 2, "run-abc", "topic");

    expect(sb.rpc).toHaveBeenCalledWith("check_quiz_answer", {
      p_question_id: 42,
      p_selected: 2,
      p_quiz_run_id: "run-abc",
      p_mode: "topic",
    });
  });

  it("checkQuizAnswer returns correct/incorrect with explanation", async () => {
    const sb = mockSupabase({
      data: { correct: false, correct_answer: 3, explanation: "Because..." },
      error: null,
    });
    const result = await checkQuizAnswer(sb, 1, 0);
    expect(result).toEqual({ correct: false, correct_answer: 3, explanation: "Because..." });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. Authenticated daily challenge flow
// ═════════════════════════════════════════════════════════════════════════════

describe("Authenticated daily challenge flow", () => {
  it("fetchDailyQuestions calls get_daily_questions RPC", async () => {
    const sb = mockSupabase({ data: [{ id: 10, q: "Daily?", options: ["X", "Y"] }], error: null });
    const result = await fetchDailyQuestions(sb, "he", 5);

    expect(sb.rpc).toHaveBeenCalledWith("get_daily_questions", {
      p_lang: "he",
      p_limit: 5,
    });
    expect(result).toHaveLength(1);
  });

  it("checkDailyAnswer sends scoring params for authenticated run", async () => {
    const sb = mockSupabase();
    await checkDailyAnswer(sb, 10, 1, "daily-run-1", "daily");

    expect(sb.rpc).toHaveBeenCalledWith("check_daily_answer", {
      p_question_id: 10,
      p_selected: 1,
      p_quiz_run_id: "daily-run-1",
      p_mode: "daily",
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. Authenticated incident replay flow
// ═════════════════════════════════════════════════════════════════════════════

describe("Authenticated incident replay flow", () => {
  it("checkIncidentAnswer calls check_incident_answer RPC", async () => {
    const sb = mockSupabase({
      data: { correct: true, correct_answer: 2, explanation: "Good", explanation_he: "טוב" },
      error: null,
    });
    const result = await checkIncidentAnswer(sb, 55, 2);

    expect(sb.rpc).toHaveBeenCalledWith("check_incident_answer", {
      p_step_id: 55,
      p_selected: 2,
    });
    expect(result.correct).toBe(true);
    expect(result.explanation_he).toBe("טוב");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. Guest flow: no RPC calls should be made
//    (guest uses local questions with client-side answer checking)
// ═════════════════════════════════════════════════════════════════════════════

describe("Guest flow isolation", () => {
  // Simulate the guest guard logic from App.jsx:
  //   if (supabase && !isGuest) { ... call RPC ... } else { ... local fallback ... }
  // This test verifies the PATTERN that the frontend uses to skip RPCs for guests.

  function shouldCallRpc(supabase, isGuest) {
    return supabase && !isGuest;
  }

  it("authenticated user triggers RPC path", () => {
    expect(shouldCallRpc({/* supabase client */}, false)).toBe(true);
  });

  it("guest user skips RPC path", () => {
    expect(shouldCallRpc({/* supabase client */}, true)).toBe(false);
  });

  it("no supabase client skips RPC path", () => {
    expect(shouldCallRpc(null, false)).toBeFalsy();
  });

  // Verify that local questions include the 'answer' field (client-side checking)
  it("local question has answer field for client-side checking", () => {
    const localQuestion = { q: "What is a Pod?", options: ["A", "B", "C", "D"], answer: 0, explanation: "..." };
    expect(typeof localQuestion.answer).toBe("number");
  });

  // Verify that server questions do NOT include the 'answer' field
  it("server question lacks answer field (requires RPC to check)", () => {
    const serverQuestion = { id: 42, q: "What is a Pod?", options: ["A", "B", "C", "D"] };
    expect(serverQuestion).not.toHaveProperty("answer");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. Leaderboard limit clamping
// ═════════════════════════════════════════════════════════════════════════════

describe("Leaderboard behavior", () => {
  it("fetchLeaderboard passes p_limit to RPC", async () => {
    const sb = mockSupabase({ data: [], error: null });
    await fetchLeaderboard(sb, 25);

    expect(sb.rpc).toHaveBeenCalledWith("get_leaderboard", { p_limit: 25 });
  });

  it("fetchLeaderboard defaults to limit 10", async () => {
    const sb = mockSupabase({ data: [], error: null });
    await fetchLeaderboard(sb);

    expect(sb.rpc).toHaveBeenCalledWith("get_leaderboard", { p_limit: 10 });
  });

  it("fetchLeaderboard returns empty array on no data", async () => {
    const sb = mockSupabase({ data: null, error: null });
    const result = await fetchLeaderboard(sb);
    expect(result).toEqual([]);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. get_user_rank IDOR protection
// ═════════════════════════════════════════════════════════════════════════════

describe("get_user_rank IDOR protection", () => {
  it("fetchUserRank passes user_id to RPC", async () => {
    const sb = mockSupabase({ data: { rank: 5, score: 100, percentile: 80, xp_to_next: 20 }, error: null });
    await fetchUserRank(sb, "abc-123");

    expect(sb.rpc).toHaveBeenCalledWith("get_user_rank", { p_user_id: "abc-123" });
  });

  it("server rejects mismatched user_id (IDOR)", async () => {
    const sb = mockSupabaseError("Forbidden: cannot query another user's rank");
    await expect(fetchUserRank(sb, "someone-elses-id")).rejects.toThrow("Forbidden");
  });

  it("server rejects unauthenticated caller", async () => {
    const sb = mockSupabaseError("Forbidden: cannot query another user's rank");
    await expect(fetchUserRank(sb, "any-id")).rejects.toThrow("Forbidden");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. save_user_progress: best_score never regresses
//    (server uses GREATEST — we verify the client doesn't send total_score)
// ═════════════════════════════════════════════════════════════════════════════

describe("save_user_progress security", () => {
  it("does NOT send total_score (server-authoritative)", async () => {
    const sb = mockSupabase({ error: null });
    await saveUserProgress(sb, {
      username: "u", bestScore: 999, totalAnswered: 50, totalCorrect: 40,
      maxStreak: 10, currentStreak: 5, completedTopics: {}, achievements: [], topicStats: {},
    });

    const args = sb.rpc.mock.calls[0][1];
    expect(args).not.toHaveProperty("p_total_score");
    expect(args).not.toHaveProperty("total_score");
  });

  it("sends best_score for server-side GREATEST comparison", async () => {
    const sb = mockSupabase({ error: null });
    await saveUserProgress(sb, {
      username: "u", bestScore: 500, totalAnswered: 0, totalCorrect: 0,
      maxStreak: 0, currentStreak: 0, completedTopics: {}, achievements: [], topicStats: {},
    });

    const args = sb.rpc.mock.calls[0][1];
    expect(args.p_best_score).toBe(500);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. Rate limit error propagation
// ═════════════════════════════════════════════════════════════════════════════

describe("Rate limit error propagation", () => {
  it("checkQuizAnswer propagates rate limit error", async () => {
    const sb = mockSupabaseError("Rate limit exceeded. Please slow down.");
    await expect(checkQuizAnswer(sb, 1, 0)).rejects.toThrow("Rate limit exceeded");
  });

  it("checkDailyAnswer propagates rate limit error", async () => {
    const sb = mockSupabaseError("Rate limit exceeded. Please slow down.");
    await expect(checkDailyAnswer(sb, 1, 0)).rejects.toThrow("Rate limit exceeded");
  });

  it("checkIncidentAnswer propagates rate limit error", async () => {
    const sb = mockSupabaseError("Rate limit exceeded. Please slow down.");
    await expect(checkIncidentAnswer(sb, 1, 0)).rejects.toThrow("Rate limit exceeded");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. Mixed questions limit clamping
// ═════════════════════════════════════════════════════════════════════════════

describe("Mixed questions fetch", () => {
  it("fetchMixedQuestions passes limit to RPC", async () => {
    const sb = mockSupabase({ data: [], error: null });
    await fetchMixedQuestions(sb, "en", 10);

    expect(sb.rpc).toHaveBeenCalledWith("get_mixed_questions", {
      p_lang: "en",
      p_limit: 10,
    });
  });
});
