// ── Analytics Collector ──────────────────────────────────────────────────────
// Lightweight, isolated web analytics pipeline.
// Writes to `analytics_events` table only.
// Does NOT touch realTelemetry, telemetrySync, or observability_events.
//
// Runs in PRODUCTION builds only (import.meta.env.PROD).
// Failures are silently swallowed to avoid breaking the app.

const TABLE = "analytics_events";
const SESSION_KEY = "kq_analytics_session";

function secureRandomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

// Persist session_id in sessionStorage so it survives page refreshes
// but resets when the tab/browser is closed (new visit = new session).
function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = secureRandomId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return secureRandomId();
  }
}

const SESSION_ID = getSessionId();

let _supabase = null;
let _initialized = false;
let _lastPath = null;

// ── UA Parsing (lightweight, no dependencies) ───────────────────────────────

function parseUserAgent() {
  const ua = navigator.userAgent || "";

  // Device type
  let device_type = "desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "tablet";

  // Browser
  let browser = "unknown";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  // OS
  let os = "unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua) && !/Android/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/CrOS/i.test(ua)) os = "ChromeOS";

  return { device_type, browser, os };
}

function parseUTM() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}

function getReferrer() {
  try {
    const ref = document.referrer;
    if (!ref) return null;
    // Exclude self-referrals
    const refHost = new URL(ref).hostname;
    if (refHost === window.location.hostname) return null;
    return ref;
  } catch {
    return null;
  }
}

// ── Write helpers ───────────────────────────────────────────────────────────

async function insertEvent(event) {
  if (!_supabase) return;
  try {
    await _supabase.from(TABLE).insert(event);
  } catch {
    // Silently ignore — analytics must never break the app
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Initialise the analytics collector.
 * Safe to call multiple times — only the first call takes effect.
 * No-ops in DEV mode so analytics_events stays clean for real traffic.
 */
export function initAnalytics(supabase) {
  if (_initialized || !supabase) return;
  if (!import.meta.env.PROD) return;          // production only
  _supabase = supabase;
  _initialized = true;

  const { device_type, browser, os } = parseUserAgent();
  const { utm_source, utm_medium, utm_campaign } = parseUTM();
  const referrer = getReferrer();
  const path = window.location.pathname + window.location.hash;

  _lastPath = path;

  // session_start event
  insertEvent({
    session_id: SESSION_ID,
    event_type: "session_start",
    path,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    device_type,
    browser,
    os,
    country: null, // populated server-side if edge function is added later
    hostname: window.location.hostname,
  });
}

/**
 * Record a page/route view. Call this whenever the screen changes.
 * Deduplicates consecutive identical paths.
 */
export function trackPageView(screenName) {
  if (!_initialized) return;
  const path = "/" + (screenName || "home");
  if (path === _lastPath) return;             // deduplicate
  _lastPath = path;

  const { device_type, browser, os } = parseUserAgent();

  insertEvent({
    session_id: SESSION_ID,
    event_type: "page_view",
    path,
    referrer: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    device_type,
    browser,
    os,
    country: null,
    hostname: window.location.hostname,
  });
}

/**
 * Record a custom event (e.g. quiz_started, feature_used).
 */
export function trackCustomEvent(eventName, path) {
  if (!_initialized) return;

  insertEvent({
    session_id: SESSION_ID,
    event_type: "custom_event",
    path: eventName || path || null,
    referrer: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    device_type: null,
    browser: null,
    os: null,
    country: null,
  });
}

// ── Seed helper (DEV only) ──────────────────────────────────────────────────

function pickWeighted(items) {
  // items: [{ value, weight }]  — weights are relative (e.g. percentages)
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

/**
 * Seed analytics_events from a Vercel Analytics snapshot.
 * All rows are marked with source = "vercel_seed".
 *
 * @param {object} supabase - Supabase client
 * @param {object} data - Structured snapshot (see seedVercelData below)
 */
export async function seedAnalyticsFromSnapshot(supabase, data) {
  if (!supabase) { console.warn("[analytics] no supabase client"); return; }

  const {
    dailyVisitors, pages, referrers, countries, devices, os, browsers,
    hostnames = [{ value: "kubequest.online", weight: 1 }],
    bounceRate = 0.51,
  } = data;

  const rows = [];

  for (const day of dailyVisitors) {
    const dayBase = new Date(day.date + "T00:00:00Z");
    const count = day.visitors;
    if (count === 0) continue;

    const gap = Math.floor(86400 / count);

    for (let v = 0; v < count; v++) {
      const sessionId = `vercel_seed_${day.date}_v${v}`;
      const ts = new Date(dayBase.getTime() + v * gap * 1000);
      const device = pickWeighted(devices);
      const browser = pickWeighted(browsers);
      const osVal = pickWeighted(os);
      const country = pickWeighted(countries);
      const referrer = pickWeighted(referrers);
      const hostname = pickWeighted(hostnames);

      rows.push({
        session_id: sessionId, event_type: "session_start", path: "/",
        referrer, device_type: device, browser, os: osVal, country, hostname,
        source: "vercel_seed", created_at: ts.toISOString(),
      });

      const bounced = Math.random() < bounceRate;
      const pvCount = bounced
        ? (Math.random() < 0.5 ? 0 : 1)
        : Math.max(2, Math.round(10 + (Math.random() - 0.5) * 6));

      for (let p = 0; p < pvCount; p++) {
        const pvTs = new Date(ts.getTime() + (p + 1) * 15_000);
        rows.push({
          session_id: sessionId, event_type: "page_view",
          path: pickWeighted(pages), device_type: device, browser, os: osVal,
          country, hostname, source: "vercel_seed", created_at: pvTs.toISOString(),
        });
      }
    }
  }

  // Insert in batches of 500
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from(TABLE).insert(batch);
    if (error) console.warn("[analytics] seed batch failed:", error.message);
    else inserted += batch.length;
  }

  console.log(`[analytics] seeded ${inserted} events (${rows.length} total) across ${dailyVisitors.length} days`);
}

/**
 * Pre-built Vercel snapshot from 2026-02-20 to 2026-03-21 (last 30 days).
 * Run in browser console:
 *   import { seedVercelData, seedAnalyticsFromSnapshot } from "./api/analyticsCollector";
 *   await seedAnalyticsFromSnapshot(supabase, seedVercelData);
 */
export const seedVercelData = {
  pvsPerVisitor: 5.86,  // 1940 / 331

  dailyVisitors: [
    { date: "2026-02-20", visitors: 0 },
    { date: "2026-02-21", visitors: 0 },
    { date: "2026-02-22", visitors: 1 },
    { date: "2026-02-23", visitors: 0 },
    { date: "2026-02-24", visitors: 1 },
    { date: "2026-02-25", visitors: 0 },
    { date: "2026-02-26", visitors: 0 },
    { date: "2026-02-27", visitors: 0 },
    { date: "2026-02-28", visitors: 0 },
    { date: "2026-03-01", visitors: 1 },
    { date: "2026-03-02", visitors: 0 },
    { date: "2026-03-03", visitors: 0 },
    { date: "2026-03-04", visitors: 0 },
    { date: "2026-03-05", visitors: 1 },
    { date: "2026-03-06", visitors: 3 },
    { date: "2026-03-07", visitors: 5 },
    { date: "2026-03-08", visitors: 2 },
    { date: "2026-03-09", visitors: 18 },
    { date: "2026-03-10", visitors: 18 },
    { date: "2026-03-11", visitors: 20 },
    { date: "2026-03-12", visitors: 45 },
    { date: "2026-03-13", visitors: 55 },
    { date: "2026-03-14", visitors: 65 },
    { date: "2026-03-15", visitors: 25 },
    { date: "2026-03-16", visitors: 15 },
    { date: "2026-03-17", visitors: 12 },
    { date: "2026-03-18", visitors: 15 },
    { date: "2026-03-19", visitors: 10 },
    { date: "2026-03-20", visitors: 8 },
    { date: "2026-03-21", visitors: 11 },
  ],

  pages: [
    { path: "/", weight: 331 }, { path: "/.env", weight: 1 }, { path: "/admin", weight: 1 },
    { path: "/auth", weight: 1 }, { path: "/dev", weight: 1 }, { path: "/incidentList", weight: 1 },
    { path: "/robots.txt", weight: 1 }, { path: "/route", weight: 1 },
    { path: "/topic", weight: 1 }, { path: "/wp-login.php", weight: 1 },
  ],

  referrers: [
    { value: "linkedin.com", weight: 68 }, { value: "com.linkedin.android", weight: 47 },
    { value: "com.google.android.gm", weight: 6 }, { value: "vercel.com", weight: 5 },
    { value: "lnkd.in", weight: 3 }, { value: "github.com", weight: 2 },
    { value: "google.com", weight: 2 }, { value: "l.instagram.com", weight: 2 },
    { value: "temp-mail.org", weight: 2 }, { value: "mail.google.com", weight: 1 },
    { value: null, weight: 193 },
  ],

  countries: [
    { value: "Israel", weight: 317 }, { value: "France", weight: 5 },
    { value: "India", weight: 2 }, { value: "Morocco", weight: 2 },
    { value: "United States", weight: 2 }, { value: "Canada", weight: 1 },
    { value: "Thailand", weight: 1 }, { value: "Turkiye", weight: 1 },
  ],

  devices: [
    { value: "mobile", weight: 73 }, { value: "desktop", weight: 27 },
  ],

  os: [
    { value: "iOS", weight: 164 }, { value: "Android", weight: 79 },
    { value: "Windows", weight: 46 }, { value: "Mac", weight: 40 },
    { value: "GNU/Linux", weight: 2 },
  ],

  browsers: [
    { value: "Mobile Safari", weight: 128 }, { value: "Chrome", weight: 86 },
    { value: "Chrome Mobile", weight: 62 }, { value: "Chrome Mobile iOS", weight: 31 },
    { value: "Samsung Browser", weight: 11 }, { value: "Instagram App", weight: 5 },
    { value: "MIUI Browser", weight: 2 }, { value: "Microsoft Edge", weight: 2 },
    { value: "Chrome Webview", weight: 1 }, { value: "Firefox", weight: 1 },
    { value: "Firefox Mobile", weight: 1 }, { value: "Google Search App", weight: 1 },
  ],

  hostnames: [
    { value: "kubequest.online", weight: 330 },
    { value: "status.kubequest.online", weight: 19 },
    { value: "kube-quest-lwrinl8vx-or-carmelis-projects.vercel.app", weight: 1 },
    { value: "kube-quest-mlo5l6llh-or-carmelis-projects.vercel.app", weight: 1 },
    { value: "kube-quest-r46s2918n-or-carmelis-projects.vercel.app", weight: 1 },
  ],

  bounceRate: 0.51,
};
