// ── Monitoring API ──────────────────────────────────────────────────────────
// Fetches real-time system status, uptime history, and incidents from Supabase.

/**
 * Fetch current status of all services.
 * Returns: [{ service_name, status, latency_ms, last_checked, details }]
 */
export async function fetchSystemStatus(supabase) {
  const { data, error } = await supabase.rpc("get_system_status");
  if (error) throw error;
  return data || [];
}

/**
 * Fetch uptime history aggregated by day.
 * Returns: [{ service_name, day, total_checks, ok_checks, uptime_pct }]
 */
export async function fetchUptimeHistory(supabase, days = 30) {
  const { data, error } = await supabase.rpc("get_uptime_history", { p_days: days });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch incidents (active first, then recent resolved).
 * Returns: [{ id, title, severity, status, started_at, resolved_at,
 *             affected_services, impact, root_cause, resolution, prevention }]
 */
export async function fetchIncidentHistory(supabase) {
  const { data, error } = await supabase.rpc("get_all_incidents");
  if (error) throw error;
  return data || [];
}

/**
 * Fetch raw health check history (time-series data for charts).
 * Returns: [{ service_name, status, latency_ms, checked_at }]
 * Ordered by checked_at ascending.
 */
export async function fetchHealthCheckHistory(supabase, minutes = 60) {
  const cutoff = new Date(Date.now() - minutes * 60_000).toISOString();
  const { data, error } = await supabase
    .from("system_status_history")
    .select("service_name, status, latency_ms, checked_at")
    .gte("checked_at", cutoff)
    .order("checked_at", { ascending: true })
    .limit(2000);
  if (error) throw error;
  return data || [];
}

/**
 * Fetch hourly rollups for 7d-30d views.
 * Returns: [{ service_name, bucket_hour, total_checks, ok_checks, down_checks,
 *             degraded_checks, avg_latency_ms, p95_latency_ms }]
 */
export async function fetchRollupHourly(supabase, hours = 168) {
  const { data, error } = await supabase.rpc("get_status_rollup_hourly", { p_hours: hours });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch daily rollups for 3mo-24mo views.
 * Returns: [{ service_name, bucket_day, total_checks, ok_checks, down_checks,
 *             degraded_checks, avg_latency_ms, p95_latency_ms }]
 */
export async function fetchRollupDaily(supabase, days = 90) {
  const { data, error } = await supabase.rpc("get_status_rollup_daily", { p_days: days });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch active and upcoming maintenance windows.
 * Returns: [{ id, title, title_he, description, description_he,
 *             starts_at, ends_at, affected_services, created_at }]
 */
export async function fetchMaintenanceWindows(supabase) {
  const { data, error } = await supabase.rpc("get_active_maintenance");
  if (error) throw error;
  return data || [];
}
