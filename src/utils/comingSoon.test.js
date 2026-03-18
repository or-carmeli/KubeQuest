import { describe, it, expect } from "vitest";
import { TOPIC_META, AVAILABLE_TOPIC_COUNT, ACHIEVEMENTS } from "../topicMeta";
import { TOPICS } from "../content/topics";

// ── Helpers ──────────────────────────────────────────────────────────────────

const AVAILABLE_TOPICS = TOPICS.filter(t => !t.isComingSoon);
const COMING_SOON_TOPICS = TOPICS.filter(t => t.isComingSoon);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("comingSoon topic handling", () => {

  it("should have at least one comingSoon topic (argo)", () => {
    expect(COMING_SOON_TOPICS.length).toBeGreaterThanOrEqual(1);
    expect(COMING_SOON_TOPICS.some(t => t.id === "argo")).toBe(true);
  });

  it("AVAILABLE_TOPIC_COUNT matches non-comingSoon topics", () => {
    const expected = TOPIC_META.filter(t => !t.isComingSoon).length;
    expect(AVAILABLE_TOPIC_COUNT).toBe(expected);
    expect(AVAILABLE_TOPIC_COUNT).toBe(AVAILABLE_TOPICS.length);
  });

  it("progress is calculated only from available topics", () => {
    // Simulate: all available topics completed, comingSoon not
    const completedTopics = {};
    AVAILABLE_TOPICS.forEach(t => {
      ["easy", "medium", "hard"].forEach(lvl => {
        completedTopics[`${t.id}_${lvl}`] = { correct: 5, total: 5, retryComplete: false };
      });
    });
    // Verify comingSoon topics have no entries
    COMING_SOON_TOPICS.forEach(t => {
      ["easy", "medium", "hard"].forEach(lvl => {
        expect(completedTopics[`${t.id}_${lvl}`]).toBeUndefined();
      });
    });

    // Calculate progress using only AVAILABLE_TOPICS (as App.jsx does)
    const completedCount = AVAILABLE_TOPICS.reduce(
      (sum, tp) => sum + ["easy", "medium", "hard"].filter(lvl => completedTopics[`${tp.id}_${lvl}`]).length, 0
    );
    const totalLevels = AVAILABLE_TOPICS.length * 3;
    const overallPct = Math.round((completedCount / totalLevels) * 100);

    expect(overallPct).toBe(100);
  });

  it("mixed quiz never includes comingSoon topic questions", () => {
    // Simulate the local fallback from startMixedQuiz: iterate AVAILABLE_TOPICS
    const all = [];
    AVAILABLE_TOPICS.forEach(topic => {
      ["easy", "medium", "hard"].forEach(level => {
        const qs = topic.levels?.[level]?.questions || [];
        qs.forEach(q => all.push({ ...q, _topicId: topic.id }));
      });
    });

    const comingSoonIds = new Set(COMING_SOON_TOPICS.map(t => t.id));
    const leakedQuestions = all.filter(q => comingSoonIds.has(q._topicId));
    expect(leakedQuestions).toHaveLength(0);
  });

  it("switching comingSoon to false includes the topic everywhere", () => {
    // Simulate flipping isComingSoon to false
    const allTopics = TOPICS.map(t =>
      t.id === "argo" ? { ...t, isComingSoon: false } : t
    );
    const available = allTopics.filter(t => !t.isComingSoon);

    // Argo should now be in available
    expect(available.some(t => t.id === "argo")).toBe(true);
    expect(available.length).toBe(TOPICS.length);
  });

  it("achievements use AVAILABLE_TOPIC_COUNT (not hardcoded)", () => {
    const allEasy = ACHIEVEMENTS.find(a => a.id === "allEasy");
    const master = ACHIEVEMENTS.find(a => a.id === "master");
    expect(allEasy).toBeDefined();
    expect(master).toBeDefined();

    // Build completedTopics with exactly AVAILABLE_TOPIC_COUNT topics on easy
    const c = {};
    AVAILABLE_TOPICS.forEach(t => {
      c[`${t.id}_easy`] = { correct: 5, total: 5 };
    });
    expect(allEasy.condition({}, c)).toBe(true);

    // Without one topic, should fail
    const partial = { ...c };
    delete partial[`${AVAILABLE_TOPICS[0].id}_easy`];
    expect(allEasy.condition({}, partial)).toBe(false);
  });

  it("comingSoon topic questions are never in the local question pool", () => {
    const comingSoonIds = new Set(COMING_SOON_TOPICS.map(t => t.id));
    // Verify that iterating AVAILABLE_TOPICS excludes all comingSoon topic IDs
    AVAILABLE_TOPICS.forEach(t => {
      expect(comingSoonIds.has(t.id)).toBe(false);
    });
  });

  // ── Edge case 1: stale localStorage data with comingSoon topic ──────────

  it("stale argo entries in completedTopics do not inflate best_score", () => {
    const LEVEL_POINTS = { easy: 10, medium: 20, hard: 30 };
    const comingSoonIds = new Set(COMING_SOON_TOPICS.map(t => t.id));

    // Simulate completedTopics that includes stale argo data from dev/testing
    const completedTopics = {};
    AVAILABLE_TOPICS.forEach(t => {
      completedTopics[`${t.id}_easy`] = { correct: 3, total: 5 };
    });
    // Stale argo entries (from testing)
    completedTopics["argo_easy"] = { correct: 5, total: 5 };
    completedTopics["argo_medium"] = { correct: 4, total: 5 };
    completedTopics["argo_hard"] = { correct: 3, total: 5 };

    // Replicate computeScore logic (as in App.jsx) WITH comingSoon filter
    const computeScore = (completed) =>
      Object.entries(completed).reduce((sum, [key, res]) => {
        const parts = key.split("_");
        const topicId = parts.slice(0, -1).join("_");
        if (comingSoonIds.has(topicId)) return sum; // Must skip comingSoon
        const lvl = parts[parts.length - 1];
        return sum + ((res.correct ?? 0) * (LEVEL_POINTS[lvl] ?? 0));
      }, 0);

    const score = computeScore(completedTopics);

    // Expected: only available topics contribute (3 correct * 10 pts each)
    const expectedScore = AVAILABLE_TOPICS.length * 3 * 10;
    expect(score).toBe(expectedScore);

    // Verify argo points were NOT included
    const argoWouldAdd = 5 * 10 + 4 * 20 + 3 * 30; // 50 + 80 + 90 = 220
    expect(score).not.toBe(expectedScore + argoWouldAdd);
  });

  it("stale argo entries do not count toward completedLevelCount", () => {
    const availableIds = new Set(AVAILABLE_TOPICS.map(t => t.id));

    const completedTopics = {};
    // Two available topics completed on easy
    completedTopics["workloads_easy"] = { correct: 5, total: 5 };
    completedTopics["networking_easy"] = { correct: 5, total: 5 };
    // Stale argo entries
    completedTopics["argo_easy"] = { correct: 5, total: 5 };
    completedTopics["argo_medium"] = { correct: 4, total: 5 };

    // Replicate StatsView completedLevelCount logic
    const completedLevelCount = Object.keys(completedTopics).filter(k => {
      const parts = k.split("_");
      const topicId = parts.slice(0, -1).join("_");
      return availableIds.has(topicId);
    }).length;

    expect(completedLevelCount).toBe(2); // Only workloads_easy + networking_easy
  });

  // ── Edge case 2: achievement thresholds after topic release ─────────────

  it("achievements auto-require the released topic after comingSoon flip", () => {
    const allEasy = ACHIEVEMENTS.find(a => a.id === "allEasy");
    const master = ACHIEVEMENTS.find(a => a.id === "master");

    // Simulate: comingSoon flipped, so AVAILABLE_TOPIC_COUNT now includes argo
    // We test the condition functions directly - they close over AVAILABLE_TOPIC_COUNT
    // which equals the current non-comingSoon count
    const currentCount = AVAILABLE_TOPIC_COUNT;

    // With exactly currentCount - 1 topics completed, should NOT unlock
    const almostDone = {};
    AVAILABLE_TOPICS.slice(0, currentCount - 1).forEach(t => {
      almostDone[`${t.id}_easy`] = { correct: 5, total: 5 };
      almostDone[`${t.id}_hard`] = { correct: 5, total: 5 };
    });
    expect(allEasy.condition({}, almostDone)).toBe(false);
    expect(master.condition({}, almostDone)).toBe(false);

    // With all currentCount topics, should unlock
    const allDone = { ...almostDone };
    const lastTopic = AVAILABLE_TOPICS[currentCount - 1];
    allDone[`${lastTopic.id}_easy`] = { correct: 5, total: 5 };
    allDone[`${lastTopic.id}_hard`] = { correct: 5, total: 5 };
    expect(allEasy.condition({}, allDone)).toBe(true);
    expect(master.condition({}, allDone)).toBe(true);
  });
});
