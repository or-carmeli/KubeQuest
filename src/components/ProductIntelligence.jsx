// ── Product Intelligence ─────────────────────────────────────────────────────
// DEV-only product analytics dashboard. Reads real data from analytics_events.
// Derives product metrics from page_view paths and session_start events.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Lightbulb, BarChart3, Users, Filter, Clock, Activity,
  TrendingUp, TrendingDown, RefreshCw, ArrowRight, Zap, Star, LogOut,
} from "lucide-react";
import { getRangeHours, formatAxisTick, formatTooltipDate } from "../utils/timeRange";
import { useTimeRange } from "../hooks/useTimeRange";
import TimeRangeSelector from "./shared/TimeRangeSelector";
import DashboardHeader from "./shared/DashboardHeader";
import InfoTip from "./shared/InfoTip";

const MONO = "'Fira Code','Courier New',monospace";
// Simplified 4-color palette
const BLUE   = "#60a5fa";  // primary
const GREEN  = "#34d399";  // success
const AMBER  = "#fbbf24";  // warning
const RED    = "#f87171";  // error

// Map page_view paths to product features
const PATH_TO_FEATURE = {
  "/quiz": "Start Quiz",
  "/results": "Finish Quiz",
  "/leaderboard": "Leaderboard Visit",
  "/topic": "Topic Page View",
};
const FEATURE_NAMES = ["Start Quiz", "Finish Quiz", "Leaderboard Visit", "Topic Page View"];
const FEATURE_COLORS = {
  "Start Quiz": BLUE,
  "Finish Quiz": GREEN,
  "Leaderboard Visit": AMBER,
  "Topic Page View": "#94a3b8",  // slate for neutral
};

// Funnel step definitions — ordered by expected user flow
const FUNNEL_STEPS = [
  { step: "Landing Page", paths: ["/home", "/"] },
  { step: "Sign Up",      paths: ["/home"] }, // session_start is the proxy
  { step: "Start Quiz",   paths: ["/quiz"] },
  { step: "Finish Quiz",  paths: ["/results"] },
  { step: "Leaderboard",  paths: ["/leaderboard"] },
];

// ── Hover CSS (injected once) ────────────────────────────────────────────────

const HOVER_CSS_ID = "pi-hover-css";
function injectHoverCSS() {
  if (document.getElementById(HOVER_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = HOVER_CSS_ID;
  style.textContent = `
    .pi-card { transition: border-color .2s, box-shadow .2s, transform .15s ease; }
    .pi-card:hover { border-color: rgba(255,255,255,0.18) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important; transform: translateY(-1px); }
    .pi-row { transition: background .15s ease-out; }
    .pi-row:hover { background: rgba(255,255,255,0.06) !important; }
    .pi-toggle { transition: background .12s, color .12s; cursor: pointer; }
    .pi-toggle:hover { background: rgba(255,255,255,0.08) !important; color: var(--text-primary) !important; }
    .pi-seg-btn { transition: background .15s, border-color .15s, color .15s; cursor: pointer; }
    .pi-seg-btn:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.06) !important; }
    .pi-funnel-bar { animation: pi-bar-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
    @keyframes pi-bar-grow { from { width: 0%; opacity: 0.3; } to { opacity: 1; } }
    .pi-chart-line { stroke-dasharray: 2000; stroke-dashoffset: 2000; animation: pi-draw 1s ease-out forwards; }
    @keyframes pi-draw { to { stroke-dashoffset: 0; } }
    .pi-chart-area { animation: pi-fade-in 0.8s ease-out both; }
    @keyframes pi-fade-in { from { opacity: 0; } }
    .pi-live-dot { animation: pi-pulse 2s ease-in-out infinite; }
    @keyframes pi-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    @media (max-width: 700px) {
      .pi-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .pi-two-col { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}

// ── Guard ────────────────────────────────────────────────────────────────────

export default function ProductIntelligence({ onBack, lang = "en", dir = "ltr", supabase = null }) {
  if (!import.meta.env.DEV) return null;
  return <ProductIntelligenceInner onBack={onBack} dir={dir} supabase={supabase} />;
}

// ── Real data fetcher ────────────────────────────────────────────────────────

const TABLE = "analytics_events";

async function fetchAllEvents(supabase, hours) {
  const since = new Date(Date.now() - hours * 3600_000).toISOString();
  const allRows = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("session_id, event_type, path, device_type, browser, country, referrer, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) { console.warn("[ProductIntelligence]", error.message); break; }
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return allRows;
}

function deriveProductData(events, hours) {
  if (!events || events.length === 0) return null;

  const sessions = events.filter(e => e.event_type === "session_start");
  const pageViews = events.filter(e => e.event_type === "page_view");

  const totalSessions = new Set(sessions.map(e => e.session_id)).size;
  if (totalSessions === 0) return null;

  // ── Group page views by session ──
  const pvBySession = {};
  for (const e of pageViews) {
    if (!pvBySession[e.session_id]) pvBySession[e.session_id] = [];
    pvBySession[e.session_id].push(e);
  }

  // ── Primary metrics ──

  // Conversion rate: sessions that reached /quiz out of all sessions
  const sessionsWithQuiz = new Set(pageViews.filter(e => e.path === "/quiz").map(e => e.session_id)).size;
  const conversionRate = totalSessions > 0 ? Math.round((sessionsWithQuiz / totalSessions) * 100) : 0;

  // Quiz completion rate: sessions with /results out of sessions with /quiz
  const sessionsWithResults = new Set(pageViews.filter(e => e.path === "/results").map(e => e.session_id)).size;
  const completionRate = sessionsWithQuiz > 0 ? Math.round((sessionsWithResults / sessionsWithQuiz) * 100) : 0;

  // Day-7 retention: sessions that returned 7+ days after first seen
  const firstSeen = {};
  const lastSeen = {};
  for (const e of events) {
    const ts = new Date(e.created_at).getTime();
    if (!firstSeen[e.session_id] || ts < firstSeen[e.session_id]) firstSeen[e.session_id] = ts;
    if (!lastSeen[e.session_id] || ts > lastSeen[e.session_id]) lastSeen[e.session_id] = ts;
  }
  // For retention, we approximate using session spans (limited since sessions reset on browser close)
  // We count sessions that had events spanning > 7 days or appeared in distinct day buckets
  const dayMs = 86400_000;
  const sessionDays = {};
  for (const e of events) {
    const day = Math.floor(new Date(e.created_at).getTime() / dayMs);
    if (!sessionDays[e.session_id]) sessionDays[e.session_id] = new Set();
    sessionDays[e.session_id].add(day);
  }
  // Count unique days across ALL sessions to see if we even have 7 days of data
  const allDays = new Set();
  for (const days of Object.values(sessionDays)) for (const d of days) allDays.add(d);
  const dataSpanDays = allDays.size;
  // Retention: % of sessions seen on more than 1 distinct day (proxy for return rate)
  const returningSessions = Object.values(sessionDays).filter(days => days.size > 1).length;
  const retentionRate = totalSessions > 0 ? Math.round((returningSessions / totalSessions) * 100) : null;

  // Time to first value: median time from session_start to first /results view
  const sessionStartTimes = {};
  for (const e of sessions) {
    const ts = new Date(e.created_at).getTime();
    if (!sessionStartTimes[e.session_id] || ts < sessionStartTimes[e.session_id]) sessionStartTimes[e.session_id] = ts;
  }
  const ttfvValues = [];
  for (const e of pageViews) {
    if (e.path !== "/results") continue;
    const start = sessionStartTimes[e.session_id];
    if (start) {
      const delta = new Date(e.created_at).getTime() - start;
      if (delta > 0) ttfvValues.push(delta);
    }
  }
  ttfvValues.sort((a, b) => a - b);
  const ttfvMinutes = ttfvValues.length > 0 ? Math.round(ttfvValues[Math.floor(ttfvValues.length / 2)] / 60_000) : null;

  // ── Sparklines for primary metrics (bucket over time) ──
  const bucketMs = hours <= 24 ? 3600_000 : hours <= 720 ? 86400_000 : 7 * 86400_000;
  function buildSparkline(filterFn, denominatorFn) {
    const buckets = {};
    const denBuckets = {};
    for (const e of events) {
      const b = Math.floor(new Date(e.created_at).getTime() / bucketMs) * bucketMs;
      if (filterFn(e)) buckets[b] = (buckets[b] || 0) + 1;
      if (denominatorFn && denominatorFn(e)) denBuckets[b] = (denBuckets[b] || 0) + 1;
    }
    const now = Date.now();
    const start = now - hours * 3600_000;
    const out = [];
    for (let t = Math.floor(start / bucketMs) * bucketMs; t <= now; t += bucketMs) {
      if (denominatorFn) {
        const num = buckets[t] || 0;
        const den = denBuckets[t] || 0;
        out.push(den > 0 ? Math.round((num / den) * 100) : 0);
      } else {
        out.push(buckets[t] || 0);
      }
    }
    return out.length > 1 ? out : null;
  }

  const conversionSpark = buildSparkline(
    e => e.event_type === "page_view" && e.path === "/quiz",
    e => e.event_type === "session_start",
  );
  const completionSpark = buildSparkline(
    e => e.event_type === "page_view" && e.path === "/results",
    e => e.event_type === "page_view" && e.path === "/quiz",
  );
  const sessionsSpark = buildSparkline(e => e.event_type === "session_start", null);
  const ttfvSpark = null; // Cannot meaningfully sparkline median TTFV

  // ── Feature adoption table ──
  const features = FEATURE_NAMES.map(name => {
    const paths = Object.entries(PATH_TO_FEATURE).filter(([, v]) => v === name).map(([k]) => k);
    const matchingPVs = pageViews.filter(e => paths.includes(e.path));
    const uniqueUsers = new Set(matchingPVs.map(e => e.session_id)).size;
    const sessionCount = matchingPVs.length;
    // Completion: for Start Quiz, what % also reached Finish Quiz
    let completion = null;
    if (name === "Start Quiz") {
      completion = uniqueUsers > 0 ? Math.round((sessionsWithResults / uniqueUsers) * 100) : 0;
    }
    return { feature: name, users: uniqueUsers, sessions: sessionCount, completion };
  }).sort((a, b) => b.users - a.users);

  // ── Feature adoption trends (time series per feature) ──
  const featureTrends = {};
  for (const name of FEATURE_NAMES) {
    const paths = Object.entries(PATH_TO_FEATURE).filter(([, v]) => v === name).map(([k]) => k);
    const eventBuckets = {};
    const userBuckets = {};
    for (const e of pageViews) {
      if (!paths.includes(e.path)) continue;
      const b = Math.floor(new Date(e.created_at).getTime() / bucketMs) * bucketMs;
      eventBuckets[b] = (eventBuckets[b] || 0) + 1;
      if (!userBuckets[b]) userBuckets[b] = new Set();
      userBuckets[b].add(e.session_id);
    }
    const now = Date.now();
    const start = now - hours * 3600_000;
    const evArr = [], usArr = [];
    for (let t = Math.floor(start / bucketMs) * bucketMs; t <= now; t += bucketMs) {
      evArr.push(eventBuckets[t] || 0);
      usArr.push(userBuckets[t] ? userBuckets[t].size : 0);
    }
    featureTrends[name] = { events: evArr, users: usArr };
  }

  // ── User funnel ──
  const funnelSteps = FUNNEL_STEPS.map((def, i) => {
    let count;
    if (i === 0) {
      // Landing page = all sessions
      count = totalSessions;
    } else if (i === 1) {
      // Sign up proxy = sessions with >1 page view (engaged beyond landing)
      count = Object.values(pvBySession).filter(arr => arr.length > 1).length;
    } else {
      count = new Set(pageViews.filter(e => def.paths.includes(e.path)).map(e => e.session_id)).size;
    }
    return { step: def.step, users: count };
  });

  // ── User journey paths ──
  const journeyMap = {};
  for (const [sid, pvs] of Object.entries(pvBySession)) {
    const pathSeq = pvs.map(e => {
      const label = e.path?.replace("/", "") || "home";
      return label.charAt(0).toUpperCase() + label.slice(1);
    });
    // Deduplicate consecutive
    const deduped = [pathSeq[0]];
    for (let i = 1; i < pathSeq.length; i++) {
      if (pathSeq[i] !== pathSeq[i - 1]) deduped.push(pathSeq[i]);
    }
    const key = deduped.slice(0, 5).join(" \u2192 ");
    journeyMap[key] = (journeyMap[key] || 0) + 1;
  }
  const totalJourneys = Object.values(journeyMap).reduce((a, b) => a + b, 0) || 1;
  const paths = Object.entries(journeyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pathStr, count]) => {
      const nodes = pathStr.split(" \u2192 ");
      const isExit = nodes.length <= 2;
      return { path: nodes, pct: Math.round((count / totalJourneys) * 100), exitAt: isExit ? nodes[nodes.length - 1] : null };
    });

  // ── Cohort retention ──
  // Group sessions by the day they first appeared, track which subsequent days they were active
  const cohortMap = {}; // dayBucket -> Set<session_id>
  for (const e of sessions) {
    const day = Math.floor(new Date(e.created_at).getTime() / dayMs);
    if (!cohortMap[day]) cohortMap[day] = new Set();
    cohortMap[day].add(e.session_id);
  }
  // Build weekly cohorts
  const weekMs = 7 * dayMs;
  const weekCohortMap = {};
  for (const e of sessions) {
    const week = Math.floor(new Date(e.created_at).getTime() / weekMs);
    if (!weekCohortMap[week]) weekCohortMap[week] = new Set();
    weekCohortMap[week].add(e.session_id);
  }
  // Activity by session per day
  const sessionActiveDays = {};
  for (const e of events) {
    const day = Math.floor(new Date(e.created_at).getTime() / dayMs);
    if (!sessionActiveDays[e.session_id]) sessionActiveDays[e.session_id] = new Set();
    sessionActiveDays[e.session_id].add(day);
  }

  const weekKeys = Object.keys(weekCohortMap).map(Number).sort((a, b) => b - a).slice(0, 4);
  const cohorts = weekKeys.map((weekNum, idx) => {
    const sids = weekCohortMap[weekNum];
    const size = sids.size;
    const cohortStartDay = weekNum * 7;

    function retentionAt(dayOffset) {
      const targetDay = cohortStartDay + dayOffset;
      const now = Math.floor(Date.now() / dayMs);
      if (targetDay > now) return null; // haven't reached this day yet
      let returned = 0;
      for (const sid of sids) {
        if (sessionActiveDays[sid]?.has(targetDay)) returned++;
      }
      return size > 0 ? Math.round((returned / size) * 100) : 0;
    }

    const labels = ["This week", "1w ago", "2w ago", "3w ago"];
    return { label: labels[idx] || `${idx}w ago`, size, day1: retentionAt(1), day3: retentionAt(3), day7: retentionAt(7), day14: retentionAt(14) };
  });

  // ── Feature impact analysis ──
  // Compare sessions that visited a feature path vs those that didn't
  const featureImpact = {};
  for (const name of FEATURE_NAMES) {
    const featurePaths = Object.entries(PATH_TO_FEATURE).filter(([, v]) => v === name).map(([k]) => k);
    const usedSids = new Set(pageViews.filter(e => featurePaths.includes(e.path)).map(e => e.session_id));
    const notUsedSids = new Set([...new Set(sessions.map(e => e.session_id))].filter(s => !usedSids.has(s)));

    function metricsFor(sidSet) {
      if (sidSet.size === 0) return { completionRate: 0, quizzesPerSession: 0, returnRate: 0 };
      const withResults = [...sidSet].filter(s => pvBySession[s]?.some(e => e.path === "/results")).length;
      const quizViews = [...sidSet].reduce((sum, s) => sum + (pvBySession[s]?.filter(e => e.path === "/quiz").length || 0), 0);
      const returning = [...sidSet].filter(s => sessionDays[s]?.size > 1).length;
      return {
        completionRate: Math.round((withResults / sidSet.size) * 100),
        quizzesPerSession: +(quizViews / sidSet.size).toFixed(1),
        returnRate: Math.round((returning / sidSet.size) * 100),
      };
    }

    featureImpact[name] = { used: metricsFor(usedSids), notUsed: metricsFor(notUsedSids) };
  }

  // ── Recent events (last 5 minutes for live feed) ──
  const fiveMinAgo = Date.now() - 5 * 60_000;
  const recentEvents = events
    .filter(e => new Date(e.created_at).getTime() > fiveMinAgo && e.event_type === "page_view")
    .slice(-8)
    .reverse()
    .map(e => {
      const label = e.path?.replace("/", "") || "home";
      const name = label.charAt(0).toUpperCase() + label.slice(1);
      const ago = Math.round((Date.now() - new Date(e.created_at).getTime()) / 1000);
      return { name, path: e.path, ago };
    });

  // ── Auto-generated insights ──
  const insights = [];
  // Conversion drop check
  if (conversionRate < 30) insights.push({ color: RED, icon: "drop", text: `Conversion rate is ${conversionRate}% \u2014 below typical benchmarks.` });
  // Completion check
  if (completionRate < 50 && sessionsWithQuiz > 5) insights.push({ color: AMBER, icon: "warn", text: `Only ${completionRate}% of users who start a quiz finish it.` });
  else if (completionRate >= 80) insights.push({ color: GREEN, icon: "up", text: `Quiz completion rate is strong at ${completionRate}%.` });
  // Most common exit page
  if (paths.length > 0) {
    const exitPath = paths.find(p => p.exitAt);
    if (exitPath) insights.push({ color: RED, icon: "exit", text: `Most common exit point: ${exitPath.exitAt} (${exitPath.pct}% of journeys).` });
  }
  // Retention insight
  if (retentionRate != null && retentionRate < 10) insights.push({ color: AMBER, icon: "warn", text: `Return rate is only ${retentionRate}% \u2014 users are not coming back.` });
  // Feature spike: find feature with highest event count
  if (features.length > 0 && features[0].sessions > 0) {
    insights.push({ color: BLUE, icon: "up", text: `${features[0].feature} is the most active feature with ${features[0].sessions} events.` });
  }

  return {
    totalSessions,
    conversionRate, conversionSpark,
    completionRate, completionSpark,
    retentionRate, dataSpanDays,
    ttfvMinutes, ttfvSpark,
    sessionsSpark,
    features, featureTrends,
    funnelSteps, paths, cohorts,
    featureImpact,
    recentEvents,
    insights: insights.slice(0, 3),
  };
}

// ── Time range label helper ──────────────────────────────────────────────────
const RANGE_LABELS = { "1h": "last hour", "6h": "last 6h", "24h": "last 24h", "7d": "last 7 days", "30d": "last 30 days" };

// ── Page type icons for journeys ─────────────────────────────────────────────
const PAGE_ICONS = {
  Home: { icon: Activity, color: BLUE },
  Quiz: { icon: Zap, color: BLUE },
  Results: { icon: BarChart3, color: GREEN },
  Topic: { icon: Star, color: AMBER },
  Leaderboard: { icon: Users, color: AMBER },
  Stats: { icon: TrendingUp, color: GREEN },
};

// ── Inner ────────────────────────────────────────────────────────────────────

function ProductIntelligenceInner({ onBack, dir, supabase }) {
  const { rangeKey, isLive } = useTimeRange();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tab, setTab] = useState("overview"); // "overview" | "deep"

  const effectiveRangeKey = isLive ? "24h" : rangeKey;

  useEffect(() => { injectHoverCSS(); }, []);

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const hours = getRangeHours(effectiveRangeKey);
    const events = await fetchAllEvents(supabase, hours);
    const derived = deriveProductData(events, hours);
    setData(derived);
    setLastUpdated(new Date());
    setLoading(false);
  }, [supabase, effectiveRangeKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const iv = setInterval(load, 30_000); return () => clearInterval(iv); }, [load]);

  return (
    <div className="page-pad" style={{
      maxWidth: 960, margin: "0 auto", padding: "10px 14px",
      animation: "fadeIn 0.3s ease", direction: "ltr",
      height: "calc(100vh - 40px)", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <DashboardHeader
        title="Product Intelligence"
        icon={Lightbulb}
        onBack={onBack}
        dir={dir}
        lastUpdated={lastUpdated}
        onRefresh={load}
      >
        <TimeRangeSelector exclude={["live", "30m"]} size="compact" />
      </DashboardHeader>
      {/* Subtitle */}
      <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: -6, marginBottom: 4 }}>
        Product usage intelligence across user journeys and feature adoption
      </div>

      {/* Tab bar */}
      {!loading && data && (
        <div style={{ display: "flex", gap: 2, marginBottom: 6, background: "var(--glass-2)", borderRadius: 6, padding: 2, alignSelf: "flex-start" }}>
          {[{ key: "overview", label: "Overview" }, { key: "deep", label: "Deep Analytics" }].map(t => (
            <button key={t.key} className="pi-toggle" onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? "var(--glass-8)" : "transparent",
              border: "none", color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)",
              padding: "4px 12px", borderRadius: 5, fontSize: 11, fontWeight: tab === t.key ? 600 : 400,
            }}>{t.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)", fontSize: 13, flex: 1 }}>Loading product analytics...</div>
      ) : !data ? (
        <NoDataState />
      ) : tab === "overview" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minHeight: 0 }}>
          {/* ── Row 1: KPI cards ────────────────────────────── */}
          <div className="pi-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
            <PrimaryMetric label="Conversion" value={`${data.conversionRate}%`} color={BLUE} icon={TrendingUp} spark={data.conversionSpark} sub={RANGE_LABELS[effectiveRangeKey]} benchmark="2-5%" info="Percentage of visitors who started a quiz after landing on the site" />
            <PrimaryMetric label="Completion" value={`${data.completionRate}%`} color={GREEN} icon={BarChart3} spark={data.completionSpark} sub={RANGE_LABELS[effectiveRangeKey]} benchmark="60-80%" info="Percentage of users who finished a quiz after starting one" />
            <PrimaryMetric label={data.dataSpanDays >= 7 ? "Retention" : "Return Rate"} value={data.retentionRate != null ? `${data.retentionRate}%` : "\u2014"} color={AMBER} icon={RefreshCw} spark={null} sub={data.retentionRate == null ? "insufficient data" : RANGE_LABELS[effectiveRangeKey]} benchmark="15-30%" info="Percentage of users who returned on a different day" />
            <PrimaryMetric label="Time to Value" value={data.ttfvMinutes != null ? `${data.ttfvMinutes}m` : "\u2014"} color={BLUE} icon={Clock} spark={null} sub={data.ttfvMinutes == null ? "no completions" : "signup to quiz"} benchmark="< 5m" info="Median time from first visit to completing a quiz" />
          </div>

          {/* ── Row 2: Feature chart (adaptive — compact when sparse) ── */}
          <FeatureTrendsCard trends={data.featureTrends} rangeKey={effectiveRangeKey} />

          {/* ── Row 3: Main focus — Funnel + Journeys ─────── */}
          <div className="pi-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, flex: "1 1 0", minHeight: 0 }}>
            <FunnelCard steps={data.funnelSteps} />
            <JourneyPathsCard paths={data.paths} />
          </div>

          {/* ── Row 4: Compact supporting strip ──────────── */}
          <div className="pi-two-col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 5 }}>
            <InsightsPanel insights={data.insights} />
            <LiveActivityFeed events={data.recentEvents} />
          </div>
        </div>
      ) : (
        /* ── Deep Analytics tab ───────────────────────────── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5, minHeight: 0, overflow: "auto" }}>
          <div className="pi-two-col" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 5 }}>
            <CohortRetentionCard cohorts={data.cohorts} />
            <FeatureAdoptionCard features={data.features} />
          </div>
          <FeatureImpactCard impactData={data.featureImpact} />
          <UpcomingModules />
        </div>
      )}
    </div>
  );
}

// ── No Data State ────────────────────────────────────────────────────────────

function NoDataState() {
  return (
    <div style={{
      padding: "48px 24px", textAlign: "center",
      background: "var(--glass-2)", border: "1px dashed var(--glass-6)", borderRadius: 10,
    }}>
      <Lightbulb size={32} strokeWidth={1} style={{ color: "var(--text-dim)", marginBottom: 12 }} />
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
        No data collected yet for this metric.
      </div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", maxWidth: 360, margin: "0 auto" }}>
        Product analytics require real user sessions. Events are collected automatically when users interact with the application in production.
      </div>
    </div>
  );
}

// ── Primary Metric Card ──────────────────────────────────────────────────────

function MiniSparkline({ values, color, width = 56, height = 22 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - 1 - ((v - min) / range) * (height - 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = line + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block", flexShrink: 0 }}>
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
    </svg>
  );
}

function PrimaryMetric({ label, value, color, icon: Icon, spark, sub, benchmark, info }) {
  const delta = useMemo(() => {
    if (!spark || spark.length < 4) return null;
    const mid = Math.floor(spark.length / 2);
    const firstHalf = spark.slice(0, mid);
    const secondHalf = spark.slice(mid);
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avgFirst === 0) return null;
    return Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
  }, [spark]);

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={11} strokeWidth={2} style={{ color }} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {label}
          </span>
          {info && <InfoTip text={info} />}
        </div>
        {delta != null && (
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: MONO,
            color: delta > 0 ? GREEN : delta < 0 ? RED : "var(--text-dim)",
            display: "flex", alignItems: "center", gap: 2,
            background: delta > 0 ? `${GREEN}12` : delta < 0 ? `${RED}12` : "transparent",
            padding: "1px 4px", borderRadius: 3,
          }}>
            {delta > 0 ? <TrendingUp size={9} strokeWidth={2.5} /> : delta < 0 ? <TrendingDown size={9} strokeWidth={2.5} /> : null}
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
        <div>
          <span style={{ fontSize: 30, fontWeight: 700, fontFamily: MONO, color: value === "\u2014" ? "var(--text-dim)" : "var(--text-bright)", lineHeight: 1, letterSpacing: -1 }}>
            {value}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            {sub && <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{sub}</span>}
            {benchmark && <span style={{ fontSize: 8, color: "var(--text-dim)", fontFamily: MONO, background: "var(--glass-3)", padding: "1px 4px", borderRadius: 3 }}>bench: {benchmark}</span>}
          </div>
        </div>
        <MiniSparkline values={spark} color={color} />
      </div>
    </div>
  );
}

// ── Feature Adoption Trends (multi-line chart) ──────────────────────────────

function FeatureTrendsCard({ trends, rangeKey }) {
  const [mode, setMode] = useState("events");
  const [hoverIdx, setHoverIdx] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const svgRef = useRef(null);

  const allFeatureNames = Object.keys(trends);
  const bucketCount = trends[allFeatureNames[0]]?.[mode]?.length || 0;
  const hasData = allFeatureNames.some(n => trends[n][mode].some(v => v > 0));

  // Sort features by total events and show top 3 by default
  const sortedNames = [...allFeatureNames].sort((a, b) => {
    const sumA = trends[a][mode].reduce((s, v) => s + v, 0);
    const sumB = trends[b][mode].reduce((s, v) => s + v, 0);
    return sumB - sumA;
  });
  const featureNames = showAll ? sortedNames : sortedNames.slice(0, 3);

  // Compute total events per feature for the summary strip
  const featureTotals = sortedNames.map(name => ({
    name, total: trends[name][mode].reduce((s, v) => s + v, 0), color: FEATURE_COLORS[name] || "var(--text-muted)",
  }));
  const grandTotal = featureTotals.reduce((s, f) => s + f.total, 0);

  // If no data or very sparse, show a compact summary strip instead of empty chart
  if (bucketCount < 2 || !hasData || grandTotal === 0) {
    return (
      <div className="pi-card" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <SectionTitle icon={TrendingUp} label="Feature Adoption" info="Shows how often product features are used over time based on page view events" />
            <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 1 }}>Feature usage will appear as users interact with the product</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {featureTotals.slice(0, 4).map(f => (
              <div key={f.name} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: f.total > 0 ? f.color : "var(--text-dim)" }}>{f.total}</div>
                <div style={{ fontSize: 8, color: "var(--text-dim)" }}>{f.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const W = 880, H = 150, padL = 50, padR = 14, padT = 16, padB = 28;
  const cW = W - padL - padR, cH = H - padT - padB;

  let globalMax = 0;
  for (const name of featureNames) {
    for (const v of trends[name][mode]) if (v > globalMax) globalMax = v;
  }
  if (globalMax === 0) globalMax = 1; // avoid division by zero
  else globalMax = Math.ceil(globalMax * 1.1);

  const step = cW / Math.max(bucketCount - 1, 1);

  // Build smooth monotone cubic paths
  const series = featureNames.map(name => {
    const vals = trends[name][mode];
    const color = FEATURE_COLORS[name] || "var(--text-muted)";
    const points = vals.map((v, i) => ({
      x: padL + i * step, y: padT + cH - (v / globalMax) * cH, value: v,
    }));
    let pathD = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];
      const t = 0.25;
      pathD += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
    }
    return { name, color, points, pathD };
  });

  const yTicks = 3;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((globalMax / yTicks) * (yTicks - i)));

  // Continuous hover: snap to nearest X-axis bucket based on mouse position
  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    // Clamp to chart area, then snap to nearest bucket
    const clampedX = Math.max(padL, Math.min(mouseX, padL + cW));
    const idx = Math.round((clampedX - padL) / step);
    if (idx >= 0 && idx < bucketCount) setHoverIdx(idx);
  }, [W, padL, cW, step, bucketCount]);

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "10px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div>
            <SectionTitle icon={TrendingUp} label="Feature Adoption" info="Shows how often product features are used over time based on page view events" />
            <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 1 }}>Feature usage events over time</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: 4 }}>
            {series.map(s => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.name}</span>
              </div>
            ))}
            {!showAll && sortedNames.length > 3 && (
              <button className="pi-toggle" onClick={() => setShowAll(true)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 9, padding: 0, cursor: "pointer" }}>+{sortedNames.length - 3} more</button>
            )}
            {showAll && sortedNames.length > 3 && (
              <button className="pi-toggle" onClick={() => setShowAll(false)} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 9, padding: 0, cursor: "pointer" }}>show less</button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 1, background: "var(--glass-3)", borderRadius: 6, padding: 2 }}>
          {[{ key: "events", label: "Events" }, { key: "users", label: "Users" }].map(t => (
            <button key={t.key} className="pi-toggle" onClick={() => setMode(t.key)} style={{
              background: mode === t.key ? "var(--glass-8)" : "transparent",
              border: "none", color: mode === t.key ? "var(--text-primary)" : "var(--text-muted)",
              padding: "3px 10px", borderRadius: 5, fontSize: 11, fontWeight: mode === t.key ? 600 : 400,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", cursor: "crosshair" }}
        onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.name + "-grad"} id={`pi-grad-${s.name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Invisible full-area hover rect to capture mouse events everywhere */}
        <rect x={padL} y={padT} width={cW} height={cH} fill="transparent" />

        {/* Horizontal grid */}
        {yLabels.map((v, i) => {
          const y = padT + (i / yTicks) * cH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize={13} fontFamily={MONO}>{v}</text>
            </g>
          );
        })}
        {/* Bottom axis line */}
        <line x1={padL} y1={padT + cH} x2={W - padR} y2={padT + cH} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

        {/* Area fills */}
        {series.map(s => {
          const last = s.points[s.points.length - 1];
          const areaD = s.pathD + ` L${last.x},${padT + cH} L${padL},${padT + cH} Z`;
          return <path key={s.name + "-area"} className="pi-chart-area" d={areaD} fill={`url(#pi-grad-${s.name.replace(/\s/g, "")})`} />;
        })}

        {/* Smooth lines */}
        {series.map(s => (
          <path key={s.name} className="pi-chart-line" d={s.pathD} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Data point markers — only when NOT hovering (hover replaces them) */}
        {hoverIdx === null && series.map(s => s.points.map((p, pi) => (
          p.value > 0 ? <circle key={s.name + pi} cx={p.x} cy={p.y} r={3} fill="var(--glass-2)" stroke={s.color} strokeWidth={2} /> : null
        )))}

        {/* Pulsing dot on last point */}
        {hoverIdx === null && series.map(s => {
          const last = s.points[s.points.length - 1];
          return last.value > 0 ? <circle key={s.name + "-live"} className="pi-live-dot" cx={last.x} cy={last.y} r={3} fill={s.color} stroke="var(--glass-2)" strokeWidth={2} /> : null;
        })}

        {/* ── Hover overlay: vertical guide + dots on ALL series + tooltip ── */}
        {hoverIdx !== null && hoverIdx < bucketCount && (
          <g style={{ pointerEvents: "none" }}>
            {/* Vertical guide line — solid, visible */}
            <line x1={padL + hoverIdx * step} y1={padT} x2={padL + hoverIdx * step} y2={padT + cH}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1} />

            {/* Highlighted dots on ALL series at this index (even zero) */}
            {series.map(s => {
              const p = s.points[hoverIdx];
              return (
                <circle key={s.name + "-hover"} cx={p.x} cy={p.y} r={4}
                  fill={p.value > 0 ? s.color : "var(--glass-5)"} stroke="#fff" strokeWidth={2} />
              );
            })}

            {/* Tooltip showing all series values */}
            {(() => {
              const ttW = 170, lineH = 17;
              const ttH = 10 + series.length * lineH + 4;
              const rawX = padL + hoverIdx * step;
              // Position tooltip — prefer right side, flip to left near edge
              const preferRight = rawX < W / 2;
              const ttX = preferRight
                ? Math.min(rawX + 12, W - padR - ttW)
                : Math.max(padL, rawX - ttW - 12);
              const ttY = padT + 4;
              return (
                <g>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={6}
                    fill="#0f172a" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                  {series.map((s, si) => {
                    const val = s.points[hoverIdx].value;
                    return (
                      <g key={s.name}>
                        <rect x={ttX + 8} y={ttY + 7 + si * lineH} width={6} height={6} rx={1.5} fill={s.color} />
                        <text x={ttX + 20} y={ttY + 13 + si * lineH} fill="var(--text-secondary)" fontSize={10}>
                          {s.name}
                        </text>
                        <text x={ttX + ttW - 10} y={ttY + 13 + si * lineH} textAnchor="end"
                          fill={val > 0 ? "var(--text-bright)" : "var(--text-dim)"} fontSize={11} fontWeight={700} fontFamily={MONO}>
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Feature Adoption Card ────────────────────────────────────────────────────

function FeatureAdoptionCard({ features }) {
  const maxUsers = Math.max(...features.map(f => f.users), 1);
  const hasData = features.some(f => f.users > 0);

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "12px 14px", minWidth: 0,
    }}>
      <SectionTitle icon={BarChart3} label="Feature Adoption" info="Ranks product features by unique users and session count" />
      <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2, marginBottom: 2 }}>How frequently product features are used</div>
      {!hasData ? (
        <EmptyMetric />
      ) : (<>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 54px 54px 60px", gap: 4, padding: "0 8px 5px", marginTop: 8, borderBottom: "1px solid var(--glass-4)" }}>
          {["Feature", "Users", "Sess.", "Compl."].map(h => (
            <span key={h} style={{ fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.4, textAlign: h === "Feature" ? "left" : "right" }}>{h}</span>
          ))}
        </div>
        {features.map((f, i) => {
          const barPct = Math.max((f.users / maxUsers) * 100, 3);
          return (
            <div key={i} className="pi-row" style={{ position: "relative", borderRadius: 4, borderBottom: i < features.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
              <div className="pi-funnel-bar" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barPct}%`, background: "var(--glass-4)", borderRadius: 3 }} />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 54px 54px 60px", gap: 4, padding: "6px 8px", zIndex: 1 }}>
                <span style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: FEATURE_COLORS[f.feature] || "var(--text-dim)", flexShrink: 0 }} />
                  {f.feature}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-primary)", fontFamily: MONO, fontWeight: 700, textAlign: "right" }}>{fmt(f.users)}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, textAlign: "right" }}>{fmt(f.sessions)}</span>
                <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 600, textAlign: "right", color: f.completion == null ? "var(--text-dim)" : f.completion >= 75 ? GREEN : f.completion >= 60 ? AMBER : RED }}>
                  {f.completion != null ? `${f.completion}%` : "\u2014"}
                </span>
              </div>
            </div>
          );
        })}
      </>)}
    </div>
  );
}

// ── User Funnel Card ─────────────────────────────────────────────────────────

function FunnelCard({ steps }) {
  const maxUsers = steps[0]?.users || 1;
  const hasData = steps.some(s => s.users > 0);

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "10px 12px", minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <SectionTitle icon={Filter} label="User Funnel" info="Displays how users progress from landing page through quiz completion to leaderboard" />
      <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2, marginBottom: 2 }}>How users progress through the main product flow</div>
      {!hasData ? (
        <EmptyMetric />
      ) : (
        <div style={{ marginTop: 4 }}>
          {steps.map((s, i) => {
            const barPct = Math.max((s.users / maxUsers) * 100, 8);
            const convRate = i > 0 ? Math.round((s.users / Math.max(steps[i - 1].users, 1)) * 100) : 100;
            const dropOff = i > 0 ? Math.round(((steps[i - 1].users - s.users) / Math.max(steps[i - 1].users, 1)) * 100) : 0;
            const overallPct = Math.round((s.users / maxUsers) * 100);
            const barHeight = i === 0 ? 28 : 24;
            const blueOpacity = (0.3 - i * 0.05).toFixed(2);
            return (
              <div key={i}>
                {/* Drop-off connector */}
                {i > 0 && (
                  <div style={{ display: "flex", alignItems: "center", padding: "1px 0 1px 12px", gap: 6 }}>
                    <div style={{ width: 1, height: 8, background: `${BLUE}30`, flexShrink: 0 }} />
                    <span style={{
                      fontSize: 14, fontWeight: 700, fontFamily: MONO,
                      color: convRate >= 60 ? GREEN : convRate >= 40 ? AMBER : RED,
                    }}>{convRate}%</span>
                    <span style={{ fontSize: 9, color: "var(--text-dim)" }}>conv</span>
                    <span style={{ fontSize: 9, color: RED, fontFamily: MONO, fontWeight: 600, marginLeft: "auto", marginRight: 8 }}>-{dropOff}%</span>
                  </div>
                )}
                {/* Bar */}
                <div style={{ position: "relative", height: barHeight, borderRadius: 7, background: "var(--glass-3)", overflow: "hidden" }}>
                  <div className="pi-funnel-bar" style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: `${barPct}%`,
                    background: `linear-gradient(90deg, ${BLUE}${Math.round(parseFloat(blueOpacity) * 255).toString(16).padStart(2, "0")}, ${BLUE}10)`,
                    borderRadius: 7,
                    animationDelay: `${i * 0.1}s`,
                  }} />
                  <div className="pi-funnel-bar" style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                    background: BLUE, opacity: 1 - i * 0.18, borderRadius: "7px 0 0 7px",
                    animationDelay: `${i * 0.1}s`,
                  }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", height: "100%", zIndex: 1 }}>
                    <span style={{ fontSize: i === 0 ? 13 : 12, color: "var(--text-primary)", fontWeight: i === 0 ? 700 : 500 }}>{s.step}</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      {i > 0 && <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: MONO }}>{overallPct}%</span>}
                      <span style={{ fontSize: 15, color: "var(--text-bright)", fontFamily: MONO, fontWeight: 700 }}>{fmt(s.users)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Cohort Retention Card ────────────────────────────────────────────────────

function CohortRetentionCard({ cohorts }) {
  const periods = ["Day 1", "Day 3", "Day 7", "Day 14"];
  const keys = ["day1", "day3", "day7", "day14"];
  const hasCohorts = cohorts && cohorts.length > 0 && cohorts.some(c => c.size > 0);

  // Continuous green heatmap: higher retention = more saturated
  function cellBg(val) {
    if (val == null) return "var(--glass-3)";
    const intensity = Math.min(val / 100, 1);
    return `rgba(52, 211, 153, ${(intensity * 0.35).toFixed(2)})`;
  }
  function cellText(val) {
    if (val == null) return "var(--text-dim)";
    if (val >= 50) return "#fff";
    if (val >= 20) return "var(--text-primary)";
    return "var(--text-secondary)";
  }

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "14px 16px", minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <SectionTitle icon={Users} label="Cohort Retention" info="Groups users by signup week and tracks what percentage return on subsequent days" />
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 1 }}>Whether users return after their first session</div>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, color: "var(--text-dim)" }}>0%</span>
          <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden" }}>
            {[0.04, 0.08, 0.14, 0.22, 0.35].map((op, i) => (
              <div key={i} style={{ width: 12, height: 6, background: `rgba(52,211,153,${op})` }} />
            ))}
          </div>
          <span style={{ fontSize: 8, color: "var(--text-dim)" }}>100%</span>
        </div>
      </div>
      {!hasCohorts ? (
        <EmptyMetric />
      ) : (<>
        <div style={{ display: "grid", gridTemplateColumns: "76px 40px repeat(4, 1fr)", gap: 3, marginBottom: 4 }}>
          <span style={colHeaderStyle}>Cohort</span>
          <span style={{ ...colHeaderStyle, textAlign: "center" }}>Size</span>
          {periods.map(p => <span key={p} style={{ ...colHeaderStyle, textAlign: "center" }}>{p}</span>)}
        </div>
        {cohorts.map((c, ci) => (
          <div key={ci} style={{ display: "grid", gridTemplateColumns: "76px 40px repeat(4, 1fr)", gap: 3, marginBottom: 3 }}>
            <span style={{ fontSize: 11, color: "var(--text-primary)", fontWeight: 500, padding: "6px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: MONO, textAlign: "center", padding: "6px 0" }}>{c.size}</span>
            {keys.map((k, ki) => {
              const val = c[k];
              return (
                <div key={ki} style={{
                  background: cellBg(val), borderRadius: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "6px 0", minHeight: 28,
                  border: val != null ? `1px solid rgba(52,211,153,${Math.min(val / 100 * 0.2, 0.15).toFixed(2)})` : "1px solid var(--glass-4)",
                }}>
                  <span style={{ fontSize: 12, fontFamily: MONO, fontWeight: 700, color: cellText(val) }}>
                    {val != null ? `${val}%` : "\u2014"}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </>)}
    </div>
  );
}

// ── User Journey Paths Card ──────────────────────────────────────────────────

function JourneyPathsCard({ paths }) {
  const maxPct = Math.max(...paths.map(p => p.pct), 1);
  const hasData = paths.length > 0;

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "10px 12px", minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <SectionTitle icon={Activity} label="Top User Journeys" info="Shows the most common navigation paths users take through the product" />
      <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 2, marginBottom: 2 }}>Most common navigation paths users take</div>
      {!hasData ? (
        <EmptyMetric />
      ) : (
        <div style={{ marginTop: 4 }}>
          {paths.map((p, i) => {
            return (
              <div key={i} className="pi-row" style={{ borderRadius: 6, padding: "8px 8px", marginBottom: i < paths.length - 1 ? 2 : 0, borderBottom: i < paths.length - 1 ? "1px solid var(--glass-3)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 5, overflow: "hidden" }}>
                  {p.path.map((node, j) => {
                    const isExit = p.exitAt === node && j === p.path.length - 1;
                    const pageInfo = PAGE_ICONS[node] || { icon: Activity, color: BLUE };
                    const NodeIcon = pageInfo.icon;
                    return (
                      <span key={j} style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 11, fontWeight: isExit ? 700 : 500,
                          color: isExit ? RED : "var(--text-primary)",
                          padding: "3px 6px", borderRadius: 5,
                          background: isExit ? `${RED}15` : `${pageInfo.color}08`,
                          border: isExit ? `1px solid ${RED}35` : `1px solid ${pageInfo.color}15`,
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <NodeIcon size={10} strokeWidth={2} style={{ color: isExit ? RED : pageInfo.color, opacity: 0.8 }} />
                          {node}
                          {isExit && <LogOut size={9} strokeWidth={2} style={{ color: RED }} />}
                        </span>
                        {j < p.path.length - 1 && <ArrowRight size={10} strokeWidth={2} style={{ color: "var(--text-dim)", margin: "0 3px", flexShrink: 0 }} />}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--glass-5)", overflow: "hidden" }}>
                    <div className="pi-funnel-bar" style={{ width: `${Math.max((p.pct / maxPct) * 100, 4)}%`, height: "100%", background: p.exitAt ? RED : BLUE, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-bright)", fontFamily: MONO, fontWeight: 700, minWidth: 36, textAlign: "right" }}>{p.pct}%</span>
                  {p.exitAt && (
                    <span style={{ fontSize: 9, color: RED, fontWeight: 700, background: `${RED}15`, padding: "1px 5px", borderRadius: 3 }}>EXIT</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Feature Impact Analysis ──────────────────────────────────────────────────

const IMPACT_FEATURES = FEATURE_NAMES;
const IMPACT_METRICS = [
  { key: "completionRate", label: "Completion Rate", unit: "%", icon: TrendingUp, color: GREEN },
  { key: "quizzesPerSession", label: "Quizzes / Session", unit: "", icon: BarChart3, color: BLUE },
  { key: "returnRate", label: "Return Rate", unit: "%", icon: RefreshCw, color: AMBER },
];

function FeatureImpactCard({ impactData }) {
  const [selected, setSelected] = useState(IMPACT_FEATURES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pair = impactData[selected];
  if (!pair) return null;
  const hasData = pair.used.completionRate > 0 || pair.notUsed.completionRate > 0;

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "12px 14px", marginBottom: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <SectionTitle icon={Zap} label="Feature Impact Analysis" info="Compares metrics between users who used a feature and those who did not" />
        <div style={{ position: "relative" }}>
          <button className="pi-seg-btn" onClick={() => setDropdownOpen(o => !o)} style={{
            background: "var(--glass-3)", border: "1px solid var(--glass-6)",
            color: "var(--text-primary)", fontSize: 11, fontWeight: 500,
            padding: "4px 12px", borderRadius: 6, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: FEATURE_COLORS[selected] || BLUE, flexShrink: 0 }} />
            {selected}
            <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 2 }}>{dropdownOpen ? "\u25B2" : "\u25BC"}</span>
          </button>
          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, marginTop: 3, zIndex: 50,
              background: "#1a1a2e", border: "1px solid var(--glass-8)",
              borderRadius: 8, padding: 5, minWidth: 170, boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}>
              {IMPACT_FEATURES.map(f => (
                <button key={f} className="pi-toggle" onClick={() => { setSelected(f); setDropdownOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: 7, width: "100%", textAlign: "left",
                  background: selected === f ? "var(--glass-8)" : "none",
                  border: "none", color: selected === f ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: 12, padding: "5px 10px", borderRadius: 5,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: FEATURE_COLORS[f] || BLUE, flexShrink: 0 }} />{f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <EmptyMetric />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {IMPACT_METRICS.map(m => {
            const Icon = m.icon;
            const usedVal = pair.used[m.key];
            const notVal = pair.notUsed[m.key];
            const maxVal = Math.max(usedVal, notVal, 1);
            const lift = notVal > 0 ? Math.round(((usedVal - notVal) / notVal) * 100) : 0;
            const liftColor = lift > 0 ? GREEN : lift < 0 ? RED : "var(--text-muted)";

            return (
              <div key={m.key} style={{ background: "var(--glass-3)", border: "1px solid var(--glass-5)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Icon size={11} strokeWidth={1.5} style={{ color: m.color, opacity: 0.7 }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.4 }}>{m.label}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: m.color, width: 32, flexShrink: 0, textAlign: "right", fontWeight: 600 }}>Used</span>
                    <div style={{ flex: 1, height: 10, borderRadius: 4, background: "var(--glass-5)", overflow: "hidden" }}>
                      <div className="pi-funnel-bar" style={{ width: `${Math.max((usedVal / maxVal) * 100, 2)}%`, height: "100%", background: m.color, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: m.color, minWidth: 32, textAlign: "right" }}>{usedVal}{m.unit}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 9, color: "var(--text-dim)", width: 32, flexShrink: 0, textAlign: "right", fontWeight: 600 }}>No</span>
                    <div style={{ flex: 1, height: 10, borderRadius: 4, background: "var(--glass-5)", overflow: "hidden" }}>
                      <div className="pi-funnel-bar" style={{ width: `${Math.max((notVal / maxVal) * 100, 2)}%`, height: "100%", background: "var(--glass-10)", borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: "var(--text-muted)", minWidth: 32, textAlign: "right" }}>{notVal}{m.unit}</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: liftColor, background: `${liftColor}15`, padding: "2px 7px", borderRadius: 4 }}>
                  {lift > 0 ? "+" : ""}{lift}% lift
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Insights Panel ───────────────────────────────────────────────────────────

const INSIGHT_ICONS = {
  drop: TrendingDown,
  warn: Zap,
  up: TrendingUp,
  exit: LogOut,
};

function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="pi-card" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "8px 10px" }}>
        <SectionTitle icon={Lightbulb} label="Key Insights" info="Automatically detected patterns based on current product usage data" />
        <div style={{ fontSize: 10, color: "var(--text-dim)", padding: "8px 0" }}>No patterns detected yet.</div>
      </div>
    );
  }

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "8px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionTitle icon={Lightbulb} label="Key Insights" info="Automatically detected patterns based on current product usage data" />
        <span style={{ fontSize: 7, color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, background: "var(--glass-3)", padding: "1px 5px", borderRadius: 3 }}>Auto</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {insights.map((ins, i) => {
          const Icon = INSIGHT_ICONS[ins.icon] || Zap;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 6,
              padding: "4px 6px", borderRadius: 4,
              background: `${ins.color}06`,
              borderLeft: `2px solid ${ins.color}`,
            }}>
              <Icon size={10} strokeWidth={2} style={{ color: ins.color, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11, color: "var(--text-primary)", lineHeight: 1.35 }}>{ins.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Live Activity Feed ───────────────────────────────────────────────────────

const EVENT_LABELS = {
  "/quiz": "Started a quiz",
  "/results": "Completed a quiz",
  "/leaderboard": "Viewed leaderboard",
  "/topic": "Browsed topics",
  "/home": "Visited home",
  "/stats": "Checked stats",
};

function LiveActivityFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="pi-card" style={{ background: "var(--glass-2)", border: "1px solid var(--glass-5)", borderRadius: 10, padding: "8px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SectionTitle icon={Activity} label="Live Activity" info="Recent user interactions from the last 5 minutes" />
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--text-dim)", opacity: 0.3, flexShrink: 0 }} />
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", padding: "8px 0" }}>Waiting for user activity...</div>
      </div>
    );
  }

  return (
    <div className="pi-card" style={{
      background: "var(--glass-2)", border: "1px solid var(--glass-5)",
      borderRadius: 10, padding: "8px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <SectionTitle icon={Activity} label="Live Activity" info="Recent user interactions from the last 5 minutes" />
        <span className="pi-live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, marginLeft: 2 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {events.slice(0, 5).map((ev, i) => {
          const pageInfo = PAGE_ICONS[ev.name] || { icon: Activity, color: BLUE };
          const EvIcon = pageInfo.icon;
          const label = EVENT_LABELS[ev.path] || `Viewed ${ev.name}`;
          const agoText = ev.ago < 60 ? `${ev.ago}s` : `${Math.round(ev.ago / 60)}m`;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 3px",
              borderBottom: i < Math.min(events.length, 5) - 1 ? "1px solid var(--glass-3)" : "none",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4,
                background: `${pageInfo.color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <EvIcon size={10} strokeWidth={2} style={{ color: pageInfo.color }} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-primary)", flex: 1 }}>{label}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: MONO, flexShrink: 0 }}>{agoText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Upcoming Intelligence Modules ─────────────────────────────────────────────

function UpcomingModules() {
  const modules = [
    { title: "Incident Mode", sub: "Investigate abnormal behavior, user-impact spikes, and failure patterns during live incidents.", icon: Zap },
    { title: "Architecture Scenarios", sub: "Explore system behavior across flows, dependencies, and product events under different scenarios.", icon: Activity },
  ];

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--glass-4)" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
        Future capabilities under development
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {modules.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} style={{
              background: "var(--glass-2)", border: "1px solid var(--glass-4)",
              borderRadius: 10, padding: "14px 16px",
              opacity: 0.55, cursor: "default",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: "var(--glass-5)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={13} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>{m.title}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                  padding: "2px 6px", borderRadius: 4,
                  background: "var(--glass-5)", color: "var(--text-dim)",
                  border: "1px solid var(--glass-6)", marginLeft: "auto",
                }}>Coming Soon</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{m.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared UI primitives ─────────────────────────────────────────────────────

const colHeaderStyle = { fontSize: 9, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.4 };

function SectionTitle({ icon: Icon, label, info }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Icon size={12} strokeWidth={1.5} style={{ color: "var(--text-muted)", opacity: 0.7 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</span>
      {info && <InfoTip text={info} />}
    </div>
  );
}

function EmptyMetric() {
  return <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-dim)", fontSize: 12 }}>No data collected yet for this metric.</div>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}
