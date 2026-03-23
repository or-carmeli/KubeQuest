/**
 * Unified Time Range Framework
 *
 * Single source of truth for time range definitions, bucket strategies,
 * axis formatting, and freshness state across all dashboards.
 */

// ─── Range definitions ──────────────────────────────────────────────────────

export const TIME_RANGES = [
  { key: "live", label: "Live",  minutes: null, bucketSec: null,  source: "live"   },
  { key: "30m",  label: "30m",   minutes: 30,   bucketSec: 30,    source: "raw"    },
  { key: "1h",   label: "1h",    minutes: 60,   bucketSec: 60,    source: "raw"    },
  { key: "6h",   label: "6h",    minutes: 360,  bucketSec: 300,   source: "raw"    },
  { key: "24h",  label: "24h",   minutes: 1440, bucketSec: 900,   source: "raw"    },
  { key: "7d",   label: "7d",    minutes: 10080, bucketSec: 3600,  source: "hourly" },
  { key: "30d",  label: "30d",   minutes: 43200, bucketSec: 21600, source: "hourly" },
];

export const DEFAULT_RANGE = "1h";

// ─── Range lookup ───────────────────────────────────────────────────────────

export function getRangeConfig(key) {
  return TIME_RANGES.find(r => r.key === key) || TIME_RANGES.find(r => r.key === DEFAULT_RANGE);
}

export function getBucketMs(key) {
  const r = getRangeConfig(key);
  return r.bucketSec != null ? r.bucketSec * 1000 : null;
}

export function getRangeMs(key) {
  const r = getRangeConfig(key);
  return r.minutes != null ? r.minutes * 60_000 : null;
}

/** Minutes value for APIs that accept minutes. */
export function getRangeMinutes(key) {
  return getRangeConfig(key).minutes;
}

/** Hours value for APIs that accept hours (e.g. analyticsQueries). */
export function getRangeHours(key) {
  const m = getRangeConfig(key).minutes;
  return m != null ? m / 60 : null;
}

/** Source for monitoring APIs: "live", "raw", "hourly". */
export function getRangeSource(key) {
  return getRangeConfig(key).source;
}

/** For rollup-based APIs that need hours for hourly source. */
export function getRangeRollupHours(key) {
  const r = getRangeConfig(key);
  if (r.source === "hourly") return r.minutes / 60;
  return null;
}

// ─── Time boundaries ────────────────────────────────────────────────────────

export function getRangeStart(key) {
  const ms = getRangeMs(key);
  if (ms == null) return null;
  return new Date(Date.now() - ms);
}

export function getRangeEnd() {
  return new Date();
}

/**
 * Build aligned bucket boundaries for a given range.
 * Returns array of { start, end, mid } timestamps.
 */
export function buildAlignedBuckets(rangeKey) {
  const bucketMs = getBucketMs(rangeKey);
  const rangeMs = getRangeMs(rangeKey);
  if (bucketMs == null || rangeMs == null) return [];

  const now = Date.now();
  const end = Math.ceil(now / bucketMs) * bucketMs;
  const start = end - rangeMs;

  const buckets = [];
  for (let t = start; t < end; t += bucketMs) {
    buckets.push({
      start: t,
      end: t + bucketMs,
      mid: t + bucketMs / 2,
    });
  }
  return buckets;
}

// ─── Series normalization ───────────────────────────────────────────────────

/**
 * Normalize a time series into aligned buckets.
 * @param {Array} series - Array of objects with a timestamp field
 * @param {string} rangeKey - Time range key
 * @param {string} tsField - Name of the timestamp field (default: "ts")
 * @param {string} valueField - Name of the value field (default: "value")
 * @returns {Array} One entry per bucket: { ts (mid), start, end, values: [...], avg, sum, count, min, max }
 */
export function normalizeSeriesToBuckets(series, rangeKey, tsField = "ts", valueField = "value") {
  const buckets = buildAlignedBuckets(rangeKey);
  if (buckets.length === 0 || !series || series.length === 0) return [];

  const result = buckets.map(b => ({
    ts: b.mid,
    start: b.start,
    end: b.end,
    values: [],
    avg: null,
    sum: 0,
    count: 0,
    min: null,
    max: null,
  }));

  for (const item of series) {
    const t = typeof item[tsField] === "number" ? item[tsField] : new Date(item[tsField]).getTime();
    // Binary search would be faster but bucket count is small (max ~720)
    const idx = result.findIndex(b => t >= b.start && t < b.end);
    if (idx >= 0) {
      const v = item[valueField];
      if (v != null) {
        result[idx].values.push(v);
        result[idx].sum += v;
        result[idx].count++;
      }
    }
  }

  for (const b of result) {
    if (b.count > 0) {
      b.avg = b.sum / b.count;
      b.min = Math.min(...b.values);
      b.max = Math.max(...b.values);
    }
  }

  return result;
}

// ─── Axis formatting ────────────────────────────────────────────────────────

const pad2 = (n) => String(n).padStart(2, "0");
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtHHmm(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function fmtMMMd(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}
function fmtMMMdHHmm(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Format a timestamp for the x-axis based on the selected range.
 * Policy: live/30m/1h/6h/24h => HH:mm, 7d => "MMM d" or "MMM d, HH:mm", 30d => "MMM d"
 */
export function formatAxisTick(rangeKey, ts) {
  const d = new Date(ts);
  switch (rangeKey) {
    case "live":
    case "30m":
    case "1h":
    case "6h":
    case "24h":
      return fmtHHmm(d);
    case "7d":
      return fmtMMMd(d);
    case "30d":
      return fmtMMMd(d);
    default:
      return fmtHHmm(d);
  }
}

/**
 * Format a timestamp for tooltips (more detail than axis ticks).
 */
export function formatTooltipDate(rangeKey, ts) {
  const d = new Date(ts);
  switch (rangeKey) {
    case "live":
    case "30m":
    case "1h":
      return fmtHHmm(d);
    case "6h":
    case "24h":
      return fmtHHmm(d);
    case "7d":
      return fmtMMMdHHmm(d);
    case "30d":
      return fmtMMMd(d);
    default:
      return fmtHHmm(d);
  }
}

/**
 * Compute how many x-axis labels to show to avoid overcrowding.
 * Returns the interval (show every Nth label).
 */
export function getAxisLabelInterval(rangeKey, dataLength) {
  if (dataLength <= 8) return 1;
  // Target 5-8 labels
  return Math.max(1, Math.floor(dataLength / 6));
}

// ─── Freshness state ────────────────────────────────────────────────────────

/**
 * Returns a freshness descriptor based on how recently data was updated.
 * @param {Date|number|null} lastUpdatedAt
 * @returns {{ state: string, label: string, color: string }}
 *   state: "live" | "recent" | "stale" | "waiting"
 */
export function getFreshnessState(lastUpdatedAt) {
  if (lastUpdatedAt == null) {
    return { state: "waiting", label: "waiting", color: "#64748b" };
  }
  const agoMs = Date.now() - (lastUpdatedAt instanceof Date ? lastUpdatedAt.getTime() : lastUpdatedAt);
  const agoSec = Math.max(0, Math.round(agoMs / 1000));

  if (agoSec < 10) {
    return { state: "live", label: `${agoSec}s ago`, color: "#34d399" };
  }
  if (agoSec < 300) { // < 5 min
    return { state: "recent", label: `${agoSec < 60 ? `${agoSec}s` : `${Math.floor(agoSec / 60)}m`} ago`, color: "#a1a1aa" };
  }
  if (agoSec < 900) { // < 15 min
    return { state: "stale", label: `${Math.floor(agoSec / 60)}m ago`, color: "#fbbf24" };
  }
  return { state: "stale", label: `${Math.floor(agoSec / 60)}m ago`, color: "#f87171" };
}

// ─── Empty state classification ─────────────────────────────────────────────

/**
 * Classify the data state for empty/low-data messaging.
 * @param {{ hasData: boolean, lastUpdated: Date|null, dataPoints: number }} opts
 * @returns {{ type: string, title: string, message: string }}
 *   type: "no-data" | "delayed" | "partial" | "ok"
 */
export function classifyDataState({ hasData = false, lastUpdated = null, dataPoints = 0 }) {
  if (!hasData && lastUpdated == null) {
    return { type: "no-data", title: "No data collected", message: "No data available in this time range. Data will appear once collection begins." };
  }
  if (!hasData && lastUpdated != null) {
    const agoMs = Date.now() - (lastUpdated instanceof Date ? lastUpdated.getTime() : lastUpdated);
    if (agoMs > 300_000) {
      return { type: "delayed", title: "Data delayed", message: "Last update was more than 5 minutes ago. New data may be delayed." };
    }
    return { type: "no-data", title: "No data in this window", message: "No data points found in the selected time range." };
  }
  if (dataPoints > 0 && dataPoints < 3) {
    return { type: "partial", title: "Limited data", message: "Only a few data points available. Charts may not be representative." };
  }
  return { type: "ok", title: "", message: "" };
}
