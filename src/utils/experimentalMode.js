/**
 * Centralized feature flag for experimental/advanced features.
 *
 * In non-production environments, all experimental features are enabled.
 * In production, they are enabled only when the `?arch` URL param is present.
 *
 * Unlocks: Architecture Scenarios, Performance Insights, War Room, Argo.
 */
export const EXPERIMENTAL_ENABLED = false; // TEMP: preview prod mode locally
// export const EXPERIMENTAL_ENABLED = !import.meta.env.PROD
//   || new URLSearchParams(window.location.search).has("arch");
