// ── Analytics Queries ────────────────────────────────────────────────────────
// Read-only data access for the Analytics dashboard.
// Reads from `analytics_events` table only.
// Completely isolated from telemetry / observability queries.

const TABLE = "analytics_events";

// ── Time range helpers ──────────────────────────────────────────────────────

export const TIME_RANGES = [
  { key: "24h",  label: "Last 24 Hours",  hours: 24 },
  { key: "7d",   label: "Last 7 Days",    hours: 168 },
  { key: "30d",  label: "Last 30 Days",   hours: 720 },
  { key: "3mo",  label: "Last 3 Months",  hours: 2160 },
  { key: "12mo", label: "Last 12 Months", hours: 8760 },
];

function rangeStart(hours) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

// ── Core query ──────────────────────────────────────────────────────────────

async function fetchEvents(supabase, hours, eventType) {
  const since = rangeStart(hours);
  let q = supabase
    .from(TABLE)
    .select("session_id, event_type, path, referrer, device_type, browser, os, country, hostname, source, utm_source, utm_medium, utm_campaign, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (eventType) q = q.eq("event_type", eventType);

  // Paginate to get all rows (Supabase default limit is 1000)
  const allRows = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await q.range(offset, offset + pageSize - 1);
    if (error) { console.warn("[analyticsQueries]", error.message); break; }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return allRows;
}

// ── Aggregation helpers ─────────────────────────────────────────────────────

/**
 * Count unique visitors (distinct session_ids) per field value.
 * This matches Vercel's counting logic — everything is by unique visitor.
 */
const FIELD_FALLBACKS = {
  referrer: "(direct)",
  country: "(unknown)",
  path: "(unknown)",
};

function countUniqueVisitors(rows, field) {
  const map = {};
  for (const r of rows) {
    const val = r[field] || FIELD_FALLBACKS[field] || "(unknown)";
    if (!map[val]) map[val] = new Set();
    map[val].add(r.session_id);
  }
  return Object.entries(map)
    .map(([name, sessions]) => ({ name, count: sessions.size }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Count unique visitors for UTM parameters.
 * Combines utm_source/medium/campaign into a single label.
 * Only includes rows that have at least one UTM param set.
 */
function countUTMParams(rows) {
  const map = {};
  for (const r of rows) {
    const parts = [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean);
    if (parts.length === 0) continue;
    const val = parts.join(" / ");
    if (!map[val]) map[val] = new Set();
    map[val].add(r.session_id);
  }
  return Object.entries(map)
    .map(([name, sessions]) => ({ name, count: sessions.size }))
    .sort((a, b) => b.count - a.count);
}

function bucketByTime(rows, hours) {
  // Choose bucket size based on range
  let bucketMs;
  if (hours <= 24)       bucketMs = 3600_000;         // hourly
  else if (hours <= 720) bucketMs = 86400_000;         // daily
  else                   bucketMs = 7 * 86400_000;     // weekly

  const map = {};
  for (const r of rows) {
    const ts = new Date(r.created_at).getTime();
    const bucket = Math.floor(ts / bucketMs) * bucketMs;
    map[bucket] = (map[bucket] || 0) + 1;
  }

  // Fill gaps
  const now = Date.now();
  const start = now - hours * 3600_000;
  const filled = [];
  for (let t = Math.floor(start / bucketMs) * bucketMs; t <= now; t += bucketMs) {
    filled.push({ ts: t, count: map[t] || 0 });
  }
  return filled;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function fetchAnalytics(supabase, hours) {
  const [sessions, pageViews] = await Promise.all([
    fetchEvents(supabase, hours, "session_start"),
    fetchEvents(supabase, hours, "page_view"),
  ]);

  const totalVisitors = new Set(sessions.map(r => r.session_id)).size;
  const totalPageViews = pageViews.length;

  // Bounce rate: sessions with only 1 page view (the session_start, no further navigation)
  const pvBySession = {};
  for (const r of pageViews) {
    pvBySession[r.session_id] = (pvBySession[r.session_id] || 0) + 1;
  }
  const sessionIds = new Set(sessions.map(r => r.session_id));
  let bouncedCount = 0;
  for (const sid of sessionIds) {
    if (!pvBySession[sid] || pvBySession[sid] <= 1) bouncedCount++;
  }
  const bounceRate = totalVisitors > 0 ? Math.round((bouncedCount / totalVisitors) * 100) : 0;

  // Combine all events for page-level unique visitor counting
  const allEvents = [...sessions, ...pageViews];

  return {
    totalVisitors,
    totalPageViews,
    bounceRate,
    visitorsOverTime: bucketByTime(sessions, hours),
    pageViewsOverTime: bucketByTime(pageViews, hours),
    topPages: countUniqueVisitors(allEvents, "path"),
    routes: countUniqueVisitors(pageViews, "path"),
    referrers: countUniqueVisitors(sessions, "referrer"),
    utmParams: countUTMParams(sessions),
    countries: countUniqueVisitors(sessions, "country"),
    devices: countUniqueVisitors(sessions, "device_type"),
    browsers: countUniqueVisitors(sessions, "browser"),
    operatingSystems: countUniqueVisitors(sessions, "os"),
    hostnames: countUniqueVisitors(allEvents, "hostname"),
    hasSeededData: sessions.some(r => r.source === "vercel_seed"),
    hasLiveData: sessions.some(r => r.source !== "vercel_seed"),
  };
}

/**
 * Count unique sessions active in the last 5 minutes.
 * Lightweight query — only counts distinct session_ids.
 */
export async function fetchOnlineCount(supabase) {
  const since = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select("session_id")
    .gte("created_at", since)
    .neq("source", "vercel_seed");
  if (error || !data) return 0;
  return new Set(data.map(r => r.session_id)).size;
}
