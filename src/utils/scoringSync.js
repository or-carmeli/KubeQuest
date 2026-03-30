// ── Cross-tab scoring coordination ──────────────────────────────────────────
// Uses BroadcastChannel to notify other tabs when a question has been scored.
// This eliminates the TOCTOU race on scoredFreeKeys_v1 in localStorage:
// instead of each tab independently reading the Set, checking membership,
// and writing back, tabs now learn about scores from other tabs in near
// real-time via the channel.
//
// Gracefully degrades: if BroadcastChannel is not supported (e.g. older
// Safari, SSR), the module is a no-op and the existing localStorage-based
// dedup still works as before.

const CHANNEL_NAME = "kq-scoring-sync";

let channel = null;
let listeners = [];

try {
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const { type, key } = event.data || {};
      if (type === "scored" && key) {
        listeners.forEach((fn) => fn(key));
      }
    };
  }
} catch {
  // BroadcastChannel not available - degrade gracefully
}

/**
 * Notify other tabs that a question was scored.
 * @param {string} key - the scoring key (first 100 chars of question text)
 */
export function broadcastScored(key) {
  try {
    channel?.postMessage({ type: "scored", key });
  } catch {
    // Channel closed or unavailable
  }
}

/**
 * Register a callback for when another tab scores a question.
 * @param {function} fn - called with the scored key string
 * @returns {function} unsubscribe function
 */
export function onScoredFromOtherTab(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Clean up the channel (call on unmount).
 */
export function closeScoringChannel() {
  try {
    channel?.close();
    channel = null;
    listeners = [];
  } catch {
    // Ignore
  }
}
