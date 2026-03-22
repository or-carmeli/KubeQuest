/**
 * Backend Metrics — PRODUCTION infrastructure metrics service.
 *
 * All data from production sources:
 *  - infra_metrics table     → DB connections, latency, slow queries, API activity
 *  - system_status_history   → DB query latency over time (health checks)
 *  - system_incidents        → Incident timeline
 *
 * Does NOT use:
 *  - observability_events (DEV-only)
 *  - realTelemetry.js fetch interceptor (DEV browser-only)
 */

import {
  fetchSystemStatus, fetchHealthCheckHistory,
  fetchRollupHourly, fetchRollupDaily, fetchIncidentHistory,
  fetchInfraMetrics, fetchInfraMetricsLatest,
} from "../api/monitoring";

// ─── Time windows ────────────────────────────────────────────────────────────

export const TIME_WINDOWS = [
  { key: "30m",  label: "30m",  source: "raw",    minutes: 30 },
  { key: "1h",   label: "1h",   source: "raw",    minutes: 60 },
  { key: "6h",   label: "6h",   source: "raw",    minutes: 360 },
  { key: "24h",  label: "24h",  source: "raw",    minutes: 1440 },
  { key: "7d",   label: "7d",   source: "hourly", hours: 168 },
  { key: "30d",  label: "30d",  source: "hourly", hours: 720 },
  { key: "3mo",  label: "3mo",  source: "daily",  days: 90 },
  { key: "12mo", label: "12mo", source: "daily",  days: 365 },
  { key: "24mo", label: "24mo", source: "daily",  days: 730 },
];

// ─── Status colors ───────────────────────────────────────────────────────────

export const STATUS_COLORS = {
  healthy: "#34d399", warning: "#fbbf24", critical: "#f87171",
  degraded: "#fbbf24", operational: "#34d399", down: "#f87171",
  maintenance: "#60a5fa", unknown: "#64748b", info: "#60a5fa",
};

// ─── Fetch current service health ────────────────────────────────────────────

export async function fetchServiceHealth(supabase) {
  if (!supabase) return [];
  try {
    const statuses = await fetchSystemStatus(supabase);
    return statuses.map(s => ({
      name: s.service_name, status: s.status,
      latency: s.latency_ms, lastChecked: s.last_checked, details: s.details,
    }));
  } catch { return []; }
}

// ─── Fetch DB latency history (from health checks — production) ──────────────

export async function fetchDbLatencyHistory(supabase, windowKey) {
  if (!supabase) return [];
  const win = TIME_WINDOWS.find(w => w.key === windowKey) || TIME_WINDOWS[1];
  try {
    let rows;
    if (win.source === "hourly") {
      const raw = await fetchRollupHourly(supabase, win.hours);
      rows = raw.filter(r => r.service_name === "Database").map(r => ({ ts: new Date(r.bucket_hour).getTime(), value: r.avg_latency_ms }));
    } else if (win.source === "daily") {
      const raw = await fetchRollupDaily(supabase, win.days);
      rows = raw.filter(r => r.service_name === "Database").map(r => ({ ts: new Date(r.bucket_day).getTime(), value: r.avg_latency_ms }));
    } else {
      const raw = await fetchHealthCheckHistory(supabase, win.minutes);
      rows = raw.filter(r => r.service_name === "Database").map(r => ({ ts: new Date(r.checked_at).getTime(), value: r.latency_ms }));
    }
    return rows;
  } catch { return []; }
}

// ─── Fetch infra metrics snapshots (from collect-metrics — production) ────────

export async function fetchInfraSnapshots(supabase, windowKey) {
  if (!supabase) return { latest: null, series: [] };
  const win = TIME_WINDOWS.find(w => w.key === windowKey) || TIME_WINDOWS[1];
  const minutes = win.minutes || (win.hours || 0) * 60 || (win.days || 0) * 1440;
  try {
    const [latest, series] = await Promise.all([
      fetchInfraMetricsLatest(supabase),
      fetchInfraMetrics(supabase, minutes),
    ]);
    return { latest, series };
  } catch { return { latest: null, series: [] }; }
}

// ─── Extract time-series from infra snapshots (all production data) ──────────

export function extractInfraSeries(snapshots) {
  const connections = [];
  const utilization = [];
  const apiRequests = [];
  const apiErrors = [];

  for (const s of snapshots) {
    const ts = new Date(s.collected_at).getTime();
    if (s.db_connections_active != null)
      connections.push({ ts, value: s.db_connections_active });
    if (s.db_connections_active != null && s.db_max_connections != null && s.db_max_connections > 0)
      utilization.push({ ts, value: +((s.db_connections_active / s.db_max_connections) * 100).toFixed(1) });
    if (s.api_requests_5m != null)
      apiRequests.push({ ts, value: s.api_requests_5m });
    if (s.api_errors_5m != null)
      apiErrors.push({ ts, value: s.api_errors_5m });
  }

  return { connections, utilization, apiRequests, apiErrors };
}

// ─── Fetch incidents (production) ────────────────────────────────────────────

export async function fetchIncidents(supabase) {
  if (!supabase) return [];
  try { return await fetchIncidentHistory(supabase); }
  catch { return []; }
}

// ─── Build event timeline from production sources ────────────────────────────

export function buildEventTimeline(incidents, services, windowKey) {
  const events = [];
  const win = TIME_WINDOWS.find(w => w.key === windowKey) || TIME_WINDOWS[1];
  const cutoffMs = (win.minutes || (win.hours || 0) * 60 || (win.days || 0) * 1440) * 60_000;
  const cutoff = Date.now() - cutoffMs;

  for (const inc of incidents) {
    const ts = new Date(inc.started_at).getTime();
    if (ts < cutoff) continue;
    events.push({ timestamp: ts, type: "incident", title: inc.title, detail: inc.impact || `Severity: ${inc.severity}, Status: ${inc.status}`, severity: inc.severity === "critical" || inc.severity === "high" ? "critical" : inc.severity === "medium" ? "warning" : "info", source: "supabase" });
    if (inc.resolved_at) events.push({ timestamp: new Date(inc.resolved_at).getTime(), type: "resolved", title: `${inc.title} resolved`, detail: inc.resolution || "", severity: "info", source: "supabase" });
  }

  for (const svc of services) {
    if (svc.status === "down") events.push({ timestamp: Date.now(), type: "alert", title: `${svc.name} is down`, detail: svc.details || "", severity: "critical", source: "health-check" });
    else if (svc.status === "degraded") events.push({ timestamp: Date.now(), type: "alert", title: `${svc.name} degraded`, detail: `Latency ${svc.latency != null ? svc.latency + " ms" : "unknown"}`, severity: "warning", source: "health-check" });
  }

  return events.sort((a, b) => b.timestamp - a.timestamp);
}
