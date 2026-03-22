// ── Architecture Scenarios ─────────────────────────────────────────────────
// Re-exports all scenarios from individual files for cleaner maintenance.

import rdsLatency from "./scenarios/rdsLatency";
import trafficSpike from "./scenarios/trafficSpike";
import lbMisconfigured from "./scenarios/lbMisconfigured";
import podCrashLoop from "./scenarios/podCrashLoop";
import cacheStampede from "./scenarios/cacheStampede";
import cdnMisconfigured from "./scenarios/cdnMisconfigured";

// Sorted by order field: easy -> medium -> hard
export const ARCHITECTURE_SCENARIOS = [
  lbMisconfigured, rdsLatency, cdnMisconfigured,
  podCrashLoop, cacheStampede, trafficSpike,
].sort((a, b) => (a.order || 0) - (b.order || 0));
