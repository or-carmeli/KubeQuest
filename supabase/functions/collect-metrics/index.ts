// ── Infrastructure Metrics Collector ────────────────────────────────────────
// Supabase Edge Function that collects PRODUCTION database and infrastructure
// metrics and stores them as periodic snapshots in the infra_metrics table.
//
// All data comes from production sources:
//   - pg_stat_activity        → DB connections
//   - pg_settings             → max_connections
//   - pg_stat_database        → transaction commits/rollbacks, cache hits, deadlocks
//   - pg_stat_statements      → slow queries (if extension enabled)
//   - system_status_current   → service health check latencies
//   - analytics_events        → production API request rate (page views + events)
//   - system_status_current   → service health summary (ok / degraded / down)
//
// Runs on pg_cron every 5 minutes alongside health-check.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Metric collectors ────────────────────────────────────────────────────────

async function collectConnections() {
  try {
    const { data, error } = await admin.rpc("get_db_connection_stats");
    if (error || !data) return { active: null, idle: null, total: null };
    return { active: data.active ?? null, idle: data.idle ?? null, total: data.total ?? null };
  } catch { return { active: null, idle: null, total: null }; }
}

async function collectMaxConnections() {
  try {
    const { data, error } = await admin.rpc("get_db_max_connections");
    if (error || data == null) return null;
    return Number(data);
  } catch { return null; }
}

async function collectDbStats() {
  try {
    const { data, error } = await admin.rpc("get_db_stats");
    if (error || !data) return { xact_commit: null, xact_rollback: null, blks_hit: null, blks_read: null, deadlocks: null, db_size_bytes: null };
    return {
      xact_commit: data.xact_commit ?? null, xact_rollback: data.xact_rollback ?? null,
      blks_hit: data.blks_hit ?? null, blks_read: data.blks_read ?? null,
      deadlocks: data.deadlocks ?? null, db_size_bytes: data.db_size_bytes ?? null,
    };
  } catch { return { xact_commit: null, xact_rollback: null, blks_hit: null, blks_read: null, deadlocks: null, db_size_bytes: null }; }
}

async function collectSlowQueries() {
  try {
    const { data, error } = await admin.rpc("get_slow_queries");
    if (error || !data) return { count: null, top_query: null, top_query_ms: null };
    return { count: data.slow_count ?? null, top_query: data.top_query ?? null, top_query_ms: data.top_query_ms ?? null };
  } catch { return { count: null, top_query: null, top_query_ms: null }; }
}

async function collectServiceLatencies() {
  try {
    const { data, error } = await admin.from("system_status_current").select("service_name, latency_ms");
    if (error || !data) return { db_latency_ms: null, auth_latency_ms: null, api_latency_ms: null };
    const byName: Record<string, number | null> = {};
    for (const row of data) byName[row.service_name] = row.latency_ms;
    return { db_latency_ms: byName["Database"] ?? null, auth_latency_ms: byName["Authentication"] ?? null, api_latency_ms: byName["Content API"] ?? null };
  } catch { return { db_latency_ms: null, auth_latency_ms: null, api_latency_ms: null }; }
}

/** Production API activity from analytics_events (real user traffic) */
async function collectApiActivity() {
  try {
    const { data, error } = await admin.rpc("get_api_activity_5m");
    if (error || !data) return { requests: null, sessions: null };
    return { requests: data.requests ?? null, sessions: data.sessions ?? null };
  } catch { return { requests: null, sessions: null }; }
}

/** Production health summary from system_status_current */
async function collectHealthSummary() {
  try {
    const { data, error } = await admin.rpc("get_health_summary");
    if (error || !data) return { ok: null, total: null };
    return { ok: data.ok ?? null, total: data.total ?? null, errors: data.errors ?? null };
  } catch { return { ok: null, total: null, errors: null }; }
}

// ── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  // Note: Supabase cron invokes Edge Functions with the anon key, not the
  // service role key, so we cannot gate on Authorization header here.
  // Access is already restricted by Supabase's built-in JWT verification.

  const start = performance.now();

  const [conns, maxConns, dbStats, slowQ, latencies, apiActivity, healthSum] = await Promise.all([
    collectConnections(),
    collectMaxConnections(),
    collectDbStats(),
    collectSlowQueries(),
    collectServiceLatencies(),
    collectApiActivity(),
    collectHealthSummary(),
  ]);

  const { error: insertError } = await admin.from("infra_metrics").insert({
    db_connections_active: conns.active,
    db_connections_idle: conns.idle,
    db_connections_total: conns.total,
    db_max_connections: maxConns,
    db_xact_commit: dbStats.xact_commit,
    db_xact_rollback: dbStats.xact_rollback,
    db_blks_hit: dbStats.blks_hit,
    db_blks_read: dbStats.blks_read,
    db_deadlocks: dbStats.deadlocks,
    db_size_bytes: dbStats.db_size_bytes,
    slow_query_count: slowQ.count,
    top_slow_query: slowQ.top_query,
    top_slow_query_ms: slowQ.top_query_ms,
    db_latency_ms: latencies.db_latency_ms,
    auth_latency_ms: latencies.auth_latency_ms,
    api_latency_ms: latencies.api_latency_ms,
    api_requests_5m: apiActivity.requests,
    api_errors_5m: healthSum.errors,
    active_sessions_5m: apiActivity.sessions,
    health_checks_ok: healthSum.ok,
    health_checks_total: healthSum.total,
  });

  await admin.rpc("purge_old_infra_metrics");

  const elapsed = Math.round(performance.now() - start);

  return new Response(
    JSON.stringify({
      collected_at: new Date().toISOString(),
      elapsed_ms: elapsed,
      insert_ok: !insertError,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
