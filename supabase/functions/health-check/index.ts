// ── Health Check Worker ─────────────────────────────────────────────────────
// Supabase Edge Function that performs real service-specific health checks
// and writes results to system_status_current + system_status_history.
//
// Designed to run on a cron schedule (every 5 minutes).
// Each check validates the actual production path used by the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ALERT_EMAIL = Deno.env.get("ALERT_EMAIL") ?? "contact@kubequest.online";

// Service-key client bypasses RLS - needed for writing to monitoring tables
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

// Anon-key client simulates real user experience for health checks
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
if (!ANON_KEY) throw new Error("SUPABASE_ANON_KEY is required");
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

interface CheckResult {
  service_name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  latency_ms: number;
  details: Record<string, unknown>;
}

async function timedCheck(
  name: string,
  fn: () => Promise<{ ok: boolean; details?: Record<string, unknown> }>,
  degradedThresholdMs = 15000
): Promise<CheckResult> {
  const start = performance.now();
  try {
    const { ok, details } = await fn();
    const latency_ms = Math.round(performance.now() - start);
    return {
      service_name: name,
      status: !ok ? "down" : latency_ms > degradedThresholdMs ? "degraded" : "operational",
      latency_ms,
      details: details ?? {},
    };
  } catch (err) {
    const latency_ms = Math.round(performance.now() - start);
    return {
      service_name: name,
      status: "down",
      latency_ms,
      details: { error: String(err) },
    };
  }
}

// ── Individual Health Checks ────────────────────────────────────────────────

/** Database: real SQL query against user_stats table */
async function checkDatabase(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { count, error } = await adminClient
    .from("user_stats")
    .select("user_id", { count: "exact", head: true });
  return { ok: !error, details: error ? { error: error.message } : { row_count: count } };
}

/** Content API: verify quiz_questions table is queryable via anon client */
async function checkContentAPI(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { data, error } = await anonClient
    .from("quiz_questions")
    .select("id", { count: "exact", head: true })
    .eq("lang", "en");
  return {
    ok: !error,
    details: error ? { error: error.message } : { question_count: data },
  };
}

/** Quiz Engine: verify quiz_questions table is readable (proves PostgREST + DB are up) */
async function checkQuizEngine(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { data, error } = await adminClient
    .from("quiz_questions")
    .select("id")
    .limit(1);
  return {
    ok: !error && Array.isArray(data) && data.length > 0,
    details: error ? { error: error.message } : { reachable: true },
  };
}

/** Leaderboard: verify user_stats table is queryable */
async function checkLeaderboard(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  const { count, error } = await anonClient
    .from("user_stats")
    .select("user_id", { count: "exact", head: true })
    .gt("total_score", 0);
  return {
    ok: !error,
    details: error ? { error: error.message } : { entries: count ?? 0 },
  };
}

/** Authentication: check that Supabase Auth is responding */
async function checkAuthentication(): Promise<{ ok: boolean; details?: Record<string, unknown> }> {
  // Use the GoTrue health endpoint - simplest way to verify auth is up
  const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: ANON_KEY },
  });
  const ok = res.status === 200;
  let details: Record<string, unknown> = { http_status: res.status };
  if (ok) {
    try { details = { ...details, ...(await res.json()) }; } catch { /* ignore */ }
  }
  return { ok, details };
}

// ── Email Alert ─────────────────────────────────────────────────────────────

async function sendIncidentAlert(serviceName: string, impact: string) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "KubeQuest Alerts <alerts@kubequest.online>",
        to: [ALERT_EMAIL],
        subject: `[KubeQuest] ${serviceName} - Service Down`,
        html: `<h2 style="color:#e53e3e">${serviceName} - Service Down</h2>
<p>${impact}</p>
<p>Detected at: ${new Date().toISOString()}</p>
<p><a href="https://status.kubequest.online">View Status Page</a></p>`,
      }),
    });
  } catch (err) {
    console.error("[alert] failed to send email:", err);
  }
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  // Note: auth verification was removed here because Supabase cron invokes
  // Edge Functions with the anon key, not the service role key.
  // Access is already restricted by Supabase's built-in JWT verification
  // (requires a valid anon or service role key in the apikey header).

  // Check if a maintenance window is currently active
  const { data: isMaintenance } = await adminClient.rpc("is_maintenance_active");
  const maintenanceActive = isMaintenance === true;

  // Run all 5 checks in parallel
  const results = await Promise.all([
    timedCheck("Database",       checkDatabase),
    timedCheck("Content API",    checkContentAPI),
    timedCheck("Quiz Engine",    checkQuizEngine),
    timedCheck("Leaderboard",    checkLeaderboard),
    timedCheck("Authentication", checkAuthentication),
  ]);

  // During maintenance, override non-operational statuses to 'maintenance'
  if (maintenanceActive) {
    for (const r of results) {
      if (r.status !== "operational") {
        r.status = "maintenance";
        r.details = { ...r.details, maintenance_override: true };
      }
    }
  }

  // Write each result to the monitoring tables via the upsert RPC
  const writeResults = await Promise.all(
    results.map((r) =>
      adminClient.rpc("upsert_service_status", {
        p_service_name: r.service_name,
        p_status: r.status,
        p_latency_ms: r.latency_ms,
        p_details: r.details,
      })
    )
  );

  const writeErrors = writeResults.filter((r) => r.error);

  // Auto-incident detection: 3+ consecutive "down" checks (skip during maintenance)
  for (const r of results) {
    if (r.status === "down" && !maintenanceActive) {
      // Check if the last 3 history entries for this service are all "down"
      const { data: history } = await adminClient
        .from("system_status_history")
        .select("status")
        .eq("service_name", r.service_name)
        .order("checked_at", { ascending: false })
        .limit(3);

      if (history && history.length >= 3 && history.every((h) => h.status === "down")) {
        // Check if there's already an active incident for this service
        const { data: existing } = await adminClient
          .from("system_incidents")
          .select("id")
          .contains("affected_services", [r.service_name])
          .neq("status", "resolved")
          .limit(1);

        if (!existing || existing.length === 0) {
          const impact = `${r.service_name} has been unreachable for 3+ consecutive health checks.`;
          await adminClient.rpc("manage_incident", {
            p_title: `${r.service_name} - Service Down`,
            p_severity: "high",
            p_status: "investigating",
            p_affected_services: [r.service_name],
            p_impact: impact,
          });
          await sendIncidentAlert(r.service_name, impact);
        }
      }
    }
  }

  // Compute rollups for long-term historical views (hourly + daily aggregation)
  const { error: rollupError } = await adminClient.rpc("compute_status_rollups");
  if (rollupError) console.error("[health-check] rollup error:", rollupError.message);

  return new Response(
    JSON.stringify({
      checked_at: new Date().toISOString(),
      maintenance_active: maintenanceActive,
      results,
      write_errors: writeErrors.length,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
