/**
 * Shared time range context — provides synchronized time range state
 * across all dashboards. Persists selection to sessionStorage so
 * navigating between dashboards preserves the chosen range.
 */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  TIME_RANGES, DEFAULT_RANGE, getRangeConfig,
  getBucketMs, getRangeMs, getRangeSource,
  formatAxisTick, formatTooltipDate, getFreshnessState,
} from "../utils/timeRange";

const STORAGE_KEY = "obs_time_range";

function readStored() {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v && TIME_RANGES.some(r => r.key === v)) return v;
  } catch { /* noop */ }
  return DEFAULT_RANGE;
}

const TimeRangeContext = createContext(null);

export function TimeRangeProvider({ children }) {
  const [rangeKey, setRangeKeyRaw] = useState(readStored);

  const setRangeKey = useCallback((key) => {
    if (TIME_RANGES.some(r => r.key === key)) {
      setRangeKeyRaw(key);
      try { sessionStorage.setItem(STORAGE_KEY, key); } catch { /* noop */ }
    }
  }, []);

  const value = useMemo(() => ({ rangeKey, setRangeKey }), [rangeKey, setRangeKey]);

  return (
    <TimeRangeContext.Provider value={value}>
      {children}
    </TimeRangeContext.Provider>
  );
}

/**
 * Hook to access the shared time range.
 * Returns: { rangeKey, setRangeKey, range, isLive, bucketMs, source, formatAxis, formatTooltip, freshness }
 */
export function useTimeRange() {
  const ctx = useContext(TimeRangeContext);
  if (!ctx) throw new Error("useTimeRange must be used within a TimeRangeProvider");

  const { rangeKey, setRangeKey } = ctx;
  const range = getRangeConfig(rangeKey);
  const isLive = rangeKey === "live";
  const bucketMs = getBucketMs(rangeKey);
  const source = getRangeSource(rangeKey);
  const rangeMs = getRangeMs(rangeKey);

  const formatAxis = useCallback((ts) => formatAxisTick(rangeKey, ts), [rangeKey]);
  const formatTooltip = useCallback((ts) => formatTooltipDate(rangeKey, ts), [rangeKey]);
  const freshness = useCallback((lastUpdated) => getFreshnessState(lastUpdated), []);

  return {
    rangeKey,
    setRangeKey,
    range,
    isLive,
    bucketMs,
    source,
    rangeMs,
    formatAxis,
    formatTooltip,
    freshness,
    ranges: TIME_RANGES,
  };
}
