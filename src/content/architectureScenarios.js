// ── Architecture Scenarios ─────────────────────────────────────────────────
// Re-exports all scenarios from individual files for cleaner maintenance.

import rdsLatency from "./scenarios/rdsLatency";
import trafficSpike from "./scenarios/trafficSpike";
import lbMisconfigured from "./scenarios/lbMisconfigured";

export const ARCHITECTURE_SCENARIOS = [rdsLatency, trafficSpike, lbMisconfigured];
