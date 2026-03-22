// ── Telemetry utility ────────────────────────────────────────────────────────
// Thin wrapper around Sentry for centralized, safe error reporting.
// All Sentry imports are lazy so the app works identically when Sentry
// is unavailable (dev, ad-blockers, init failure).

import * as Sentry from "@sentry/react";

// ── Sensitive-data scrubbing ────────────────────────────────────────────────

const SENSITIVE_KEYS = /token|key|secret|password|authorization|cookie|session|jwt|email|supabase/i;
const SENSITIVE_VALUES = /eyJ[A-Za-z0-9_-]{10,}|Bearer\s+\S+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Strip sensitive fields from a plain object (shallow). */
function scrubObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.test(k)) {
      clean[k] = "[REDACTED]";
    } else if (typeof v === "string") {
      clean[k] = v.replace(SENSITIVE_VALUES, "[REDACTED]");
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

/** Build a safe, short message from an error — never expose raw backend text. */
function safeMessage(err) {
  if (!err) return "Unknown error";
  const msg = err.message || String(err);
  // Strip anything that looks like SQL, table names, or Postgres internals
  if (/select |insert |update |delete |pg_|from\s+\w+/i.test(msg)) {
    return "Database operation failed";
  }
  // Cap length to avoid sending huge payloads
  return msg.slice(0, 256);
}

// ── Error classification ────────────────────────────────────────────────────

/** Classify an error into a safe category tag for Sentry grouping. */
function classifyError(err) {
  const msg = (err?.message || "").toLowerCase();
  const code = err?.code || "";
  const status = err?.status || err?.statusCode || 0;

  if (err instanceof TypeError || msg.includes("fetch") || msg.includes("networkerror") || msg.includes("failed to fetch") || msg.includes("load failed")) {
    return "network";
  }
  if (msg.includes("timeout") || msg.includes("aborted")) {
    return "timeout";
  }
  if (status === 401 || status === 403 || msg.includes("jwt") || msg.includes("not authenticated") || msg.includes("refresh_token") || code === "PGRST301") {
    return "auth";
  }
  if (status >= 500 || code.startsWith("PGRST") || code.startsWith("42") || code.startsWith("23")) {
    return "server";
  }
  return "unknown";
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Whether Sentry is currently active (initialized in production). */
export function isActive() {
  try {
    return !!Sentry.getClient();
  } catch {
    return false;
  }
}

/**
 * Initialize Sentry. Call once from the app entry point.
 * No-ops silently if DSN is missing or environment is not production.
 */
export function init({ dsn, environment, release }) {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: environment || "production",
    release: release || undefined,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    maxBreadcrumbs: 30,
    ignoreErrors: [
      "ResizeObserver loop",
      "Non-Error promise rejection",
      "Loading chunk",
      "Importing a module script failed",
      "Load failed",
    ],
    beforeSend(event) {
      try {
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            event.request.headers = scrubObject(event.request.headers);
          }
        }
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((b) => ({
            ...b,
            data: b.data ? scrubObject(b.data) : b.data,
          }));
        }
      } catch {
        // Scrubbing failed — send unscrubbed rather than drop
      }
      return event;
    },
  });

  const client = Sentry.getClient();
  if (client) {
    console.info("[KubeQuest:telemetry] Sentry initialized");
  } else {
    console.error("[KubeQuest:telemetry] Sentry.init() ran but NO CLIENT created");
  }
}

/**
 * Capture an error with safe metadata.
 * @param {Error|string} err   - The error to report
 * @param {object}       ctx   - Extra context (flow, screen, etc.)
 */
export function captureError(err, ctx = {}) {
  if (!isActive()) return;
  try {
    const category = classifyError(err);
    const { screen, flow, isGuest, extra } = ctx;

    Sentry.withScope((scope) => {
      scope.setTag("error.category", category);
      if (flow) scope.setTag("flow", flow);
      if (screen) scope.setTag("screen", screen);
      if (typeof isGuest === "boolean") scope.setTag("user.guest", String(isGuest));

      if (extra) scope.setContext("details", scrubObject(extra));

      if (typeof err === "string") {
        Sentry.captureMessage(err, "error");
      } else {
        // Override the message to the safe version so raw backend text never ships
        const safeErr = new Error(safeMessage(err));
        safeErr.name = err?.name || "Error";
        // Preserve original stack for source-map resolution
        if (err?.stack) safeErr.stack = err.stack;
        Sentry.captureException(safeErr);
      }
    });
  } catch {
    // Telemetry must never break the app
  }
}

/**
 * Set persistent user-level context (called on auth change).
 * Only stores guest/authenticated flag — never PII.
 */
export function setUserContext({ isGuest }) {
  if (!isActive()) return;
  try {
    Sentry.setUser(isGuest ? { id: "guest" } : null);
    Sentry.setTag("user.guest", String(!!isGuest));
  } catch {
    // no-op
  }
}

/**
 * Update the current screen tag for breadcrumb context.
 */
export function setScreen(screen) {
  if (!isActive()) return;
  try {
    Sentry.setTag("screen", screen);
  } catch {
    // no-op
  }
}

/**
 * Report a Core Web Vital metric as a Sentry measurement.
 * Called from the web-vitals callback — no PII, just metric name + value.
 */
export function reportWebVital({ name, value, rating }) {
  if (!isActive()) return;
  try {
    Sentry.setTag(`webvital.${name}`, rating || "unknown");
    Sentry.addBreadcrumb({
      category: "web-vital",
      message: `${name}: ${Math.round(value)}ms (${rating})`,
      level: "info",
    });
  } catch {
    // no-op
  }
}

/** Re-export Sentry's ErrorBoundary for use in main.jsx. */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
