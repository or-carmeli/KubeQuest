#!/usr/bin/env node
// ── Seed analytics_events from Vercel snapshot (full 12-month history) ──────
// Usage:  node scripts/seedAnalytics.mjs
//
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
// Deletes existing vercel_seed data before inserting.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ── Load .env manually (no dotenv dependency) ──────────────────────────────
function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf-8");
    const vars = {};
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
      if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return vars;
  } catch { return {}; }
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) { console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"); process.exit(1); }

const supabase = createClient(url, key);
const TABLE = "analytics_events";

// ── Weighted random ────────────────────────────────────────────────────────
function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item.value; }
  return items[items.length - 1].value;
}

// ── Vercel snapshot data (Last 12 Months / all-time) ───────────────────────
// Source: Vercel Analytics screenshots, kubequest.online
// Total: 331 visitors, 1,940 page views, 51% bounce rate

const data = {
  pvsPerVisitor: 5.86,  // 1940 / 331

  // Daily distribution matching the 12-month chart shape
  // Near-zero from launch until Feb 2026, then ramp in Mar 2026
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

  // Pages — exact from Vercel (visitors column)
  pages: [
    { path: "/",              weight: 331 },
    { path: "/.env",          weight: 1 },
    { path: "/admin",         weight: 1 },
    { path: "/auth",          weight: 1 },
    { path: "/dev",           weight: 1 },
    { path: "/incidentList",  weight: 1 },
    { path: "/robots.txt",    weight: 1 },
    { path: "/route",         weight: 1 },
    { path: "/topic",         weight: 1 },
    { path: "/wp-login.php",  weight: 1 },
  ],

  // Referrers — exact visitor counts from Vercel
  referrers: [
    { value: "linkedin.com",          weight: 68 },
    { value: "com.linkedin.android",  weight: 47 },
    { value: "com.google.android.gm", weight: 6 },
    { value: "vercel.com",            weight: 5 },
    { value: "lnkd.in",              weight: 3 },
    { value: "github.com",           weight: 2 },
    { value: "google.com",           weight: 2 },
    { value: "l.instagram.com",      weight: 2 },
    { value: "temp-mail.org",        weight: 2 },
    { value: "mail.google.com",      weight: 1 },
    { value: null,                    weight: 193 },  // direct / no referrer
  ],

  // Countries — exact visitor counts from Vercel
  countries: [
    { value: "Israel",              weight: 317 },
    { value: "France",              weight: 5 },
    { value: "India",               weight: 2 },
    { value: "Morocco",             weight: 2 },
    { value: "United States",       weight: 2 },
    { value: "Canada",              weight: 1 },
    { value: "Thailand",            weight: 1 },
    { value: "Turkiye",             weight: 1 },
  ],

  // Devices — exact from Vercel
  devices: [
    { value: "mobile",  weight: 73 },
    { value: "desktop", weight: 27 },
  ],

  // Operating Systems — exact visitor counts from Vercel
  os: [
    { value: "iOS",       weight: 164 },
    { value: "Android",   weight: 79 },
    { value: "Windows",   weight: 46 },
    { value: "Mac",       weight: 40 },
    { value: "GNU/Linux", weight: 2 },
  ],

  // Browsers — exact visitor counts from Vercel
  browsers: [
    { value: "Mobile Safari",     weight: 128 },
    { value: "Chrome",            weight: 86 },
    { value: "Chrome Mobile",     weight: 62 },
    { value: "Chrome Mobile iOS", weight: 31 },
    { value: "Samsung Browser",   weight: 11 },
    { value: "Instagram App",     weight: 5 },
    { value: "MIUI Browser",      weight: 2 },
    { value: "Microsoft Edge",    weight: 2 },
    { value: "Chrome Webview",    weight: 1 },
    { value: "Firefox",           weight: 1 },
    { value: "Firefox Mobile",    weight: 1 },
    { value: "Google Search App", weight: 1 },
  ],
};

// ── Generate rows ──────────────────────────────────────────────────────────
const rows = [];

for (const day of data.dailyVisitors) {
  if (day.visitors === 0) continue;
  const dayBase = new Date(day.date + "T00:00:00Z");
  const gap = Math.floor(86400 / day.visitors);

  for (let v = 0; v < day.visitors; v++) {
    const sessionId = `vercel_seed_${day.date}_v${v}`;
    const ts = new Date(dayBase.getTime() + v * gap * 1000);
    const device = pickWeighted(data.devices);
    const browser = pickWeighted(data.browsers);
    const osVal = pickWeighted(data.os);
    const country = pickWeighted(data.countries);
    const referrer = pickWeighted(data.referrers);

    rows.push({
      session_id: sessionId, event_type: "session_start", path: "/",
      referrer, device_type: device, browser, os: osVal, country,
      source: "vercel_seed", created_at: ts.toISOString(),
    });

    const pvCount = Math.max(1, Math.round(data.pvsPerVisitor + (Math.random() - 0.5) * 3));
    for (let p = 0; p < pvCount; p++) {
      rows.push({
        session_id: sessionId, event_type: "page_view",
        path: pickWeighted(data.pages),
        device_type: device, browser, os: osVal, country,
        source: "vercel_seed",
        created_at: new Date(ts.getTime() + (p + 1) * 15_000).toISOString(),
      });
    }
  }
}

console.log(`Generated ${rows.length} events. Cleaning old seed data...`);

// ── Delete old vercel_seed rows ────────────────────────────────────────────
// Supabase delete requires a filter; paginate to delete all
let deleted = 0;
while (true) {
  const { data: old, error: selErr } = await supabase
    .from(TABLE).select("id").eq("source", "vercel_seed").limit(1000);
  if (selErr) { console.error("Select failed:", selErr.message); break; }
  if (!old || old.length === 0) break;
  const ids = old.map(r => r.id);
  const { error: delErr } = await supabase.from(TABLE).delete().in("id", ids);
  if (delErr) { console.error("Delete failed:", delErr.message); break; }
  deleted += ids.length;
  process.stdout.write(`\r  deleted ${deleted} old rows`);
}
if (deleted > 0) console.log();

// ── Insert new rows in batches ─────────────────────────────────────────────
console.log(`Inserting ${rows.length} events...`);
let inserted = 0;
for (let i = 0; i < rows.length; i += 500) {
  const batch = rows.slice(i, i + 500);
  const { error } = await supabase.from(TABLE).insert(batch);
  if (error) { console.error(`Batch ${i}-${i + batch.length} failed:`, error.message); }
  else { inserted += batch.length; process.stdout.write(`\r  inserted ${inserted}/${rows.length}`); }
}

console.log(`\nDone! Deleted ${deleted} old rows, inserted ${inserted} new events.`);
