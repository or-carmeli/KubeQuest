// ── Telemetry Sync ──────────────────────────────────────────────────────────
// Batches telemetry snapshots to Supabase for cross-session persistence.
// DEV-only — all public functions no-op in production.

import { recordSnapshot } from "../utils/telemetryHistory";

const TABLE = "observability_events";
const FLUSH_INTERVAL_MS = 60_000;
const SESSION_ID = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");

let _queue = [];
let _flushTimer = null;

// ── Queue & Flush ───────────────────────────────────────────────────────────

function enqueue(snapshot) {
  _queue.push({
    session_id: SESSION_ID,
    ts: new Date(snapshot.ts).toISOString(),
    payload: snapshot,
  });
}

async function flush(supabase) {
  if (_queue.length === 0 || !supabase) return;
  const batch = _queue.splice(0);
  try {
    const { error } = await supabase.from(TABLE).insert(batch);
    if (error) {
      console.warn("[telemetrySync] flush failed:", error.message);
      _queue.unshift(...batch); // re-queue on failure
    }
  } catch (err) {
    console.warn("[telemetrySync] flush error:", err.message);
    _queue.unshift(...batch);
  }
}

// ── Start / Stop ────────────────────────────────────────────────────────────

/**
 * Start syncing telemetry snapshots to Supabase.
 * Records a snapshot from getMetrics(), queues it, and flushes periodically.
 * @returns cleanup function
 */
export function startTelemetrySync(supabase, getMetrics) {
  if (!import.meta.env.DEV || !supabase) return () => {};

  const tick = () => {
    const real = getMetrics();
    if (!real) return;
    // Record to localStorage (existing behavior)
    recordSnapshot(real);
    // Build the same snapshot shape for Supabase
    const snap = buildSyncSnapshot(real);
    if (snap) enqueue(snap);
  };

  // First tick immediately
  tick();
  // Then every interval: snapshot + flush
  _flushTimer = setInterval(() => {
    tick();
    flush(supabase);
  }, FLUSH_INTERVAL_MS);

  // Flush on page hide (tab close / navigate away)
  const onVisChange = () => {
    if (document.visibilityState === "hidden") flush(supabase);
  };
  document.addEventListener("visibilitychange", onVisChange);

  return () => {
    if (_flushTimer) { clearInterval(_flushTimer); _flushTimer = null; }
    document.removeEventListener("visibilitychange", onVisChange);
    flush(supabase); // final flush
  };
}

function buildSyncSnapshot(real) {
  const requests = real.network?.requests || [];
  if (requests.length === 0 && !real.vitals?.lcp && (real.errors?.log || []).length === 0) {
    return null; // nothing to record
  }
  const failed = requests.filter(r => !r.ok).length;
  const sorted = requests.map(r => r.duration).sort((a, b) => a - b);
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : null;

  return {
    ts: Date.now(),
    vitals: {
      lcp: real.vitals?.lcp ?? null,
      inp: real.vitals?.inp ?? null,
      cls: real.vitals?.cls ?? null,
    },
    nav: real.navTiming ? {
      ttfb: real.navTiming.ttfb,
      fcp: real.navTiming.domContentLoaded,
      pageLoad: real.navTiming.pageLoad,
    } : null,
    net: {
      total: requests.length,
      failed,
      p95,
    },
    errors: (real.errors?.log || []).length,
    score: null, // computed by aggregateHistory from vitals
  };
}

// ── Load Historical ─────────────────────────────────────────────────────────

/**
 * Load historical snapshots from Supabase within a time window.
 * @param {object} supabase - Supabase client
 * @param {number} windowMs - milliseconds to look back
 * @returns {Array} snapshots in telemetryHistory format
 */
export async function loadHistoryFromSupabase(supabase, windowMs) {
  if (!supabase) return [];
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("ts, payload")
      .gte("ts", cutoff)
      .order("ts", { ascending: true })
      .limit(2000);
    if (error) {
      console.warn("[telemetrySync] load failed:", error.message);
      return [];
    }
    return (data || []).map(row => ({
      ...row.payload,
      ts: new Date(row.ts).getTime(),
    }));
  } catch (err) {
    console.warn("[telemetrySync] load error:", err.message);
    return [];
  }
}
