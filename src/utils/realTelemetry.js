/**
 * Real Telemetry Collector — Performance Insights
 *
 * Collects genuine client-side signals from the browser runtime.
 * All entries are timestamped for time-range filtering.
 * Lightweight, no external dependencies, safe cleanup on unmount.
 */

// ─── Internal state ────────────────────────────────────────────────────────────
let _initialized = false;
let _cleanups = [];

const _errors = { log: [] };                // each: { ts, type, message }
const _network = { log: [], requests: [] };  // requests: { ts, duration, ok }
const _userFlow = {
  quizStarted: 0,
  quizCompleted: 0,
  routeChanges: 0,
  routes: {},
  retries: 0,
  sessionStart: Date.now(),
};
const _vitals = { lcp: null, inp: null, cls: null, lcpRating: null, inpRating: null, clsRating: null };

const SLOW_REQUEST_MS = 1500;
const MAX_ENTRIES = 500;

// ─── Init / Teardown ───────────────────────────────────────────────────────────
export function initRealTelemetry() {
  if (_initialized) return () => {};
  _initialized = true;
  _userFlow.sessionStart = Date.now();

  collectErrors();
  collectNetworkMetrics();
  collectWebVitals();
  collectUserFlowFromVa();

  return () => {
    _cleanups.forEach(fn => fn());
    _cleanups = [];
    _initialized = false;
  };
}

// ─── Error collection ──────────────────────────────────────────────────────────
function collectErrors() {
  const onError = (event) => {
    _errors.log.push({ ts: Date.now(), type: "error", message: event.message || "Unknown error" });
    if (_errors.log.length > MAX_ENTRIES) _errors.log.shift();
  };
  const onRejection = (event) => {
    _errors.log.push({ ts: Date.now(), type: "unhandledrejection", message: event.reason?.message || String(event.reason || "Unknown rejection") });
    if (_errors.log.length > MAX_ENTRIES) _errors.log.shift();
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  _cleanups.push(() => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  });
}

// ─── Network collection ────────────────────────────────────────────────────────
function collectNetworkMetrics() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const start = performance.now();
    const ts = Date.now();
    try {
      const response = await originalFetch.apply(this, args);
      const duration = Math.round(performance.now() - start);
      const ok = response.ok;
      const status = response.status;
      _network.requests.push({ ts, duration, ok, status });
      if (_network.requests.length > MAX_ENTRIES) _network.requests.shift();

      if (duration > SLOW_REQUEST_MS) {
        _network.log.push({ ts, type: "slow", url: urlLabel(args[0]), duration });
      }
      if (!ok) {
        _network.log.push({ ts, type: "failed", url: urlLabel(args[0]), status: response.status, duration });
      }
      if (_network.log.length > MAX_ENTRIES) _network.log.splice(0, _network.log.length - MAX_ENTRIES);
      return response;
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      _network.requests.push({ ts, duration, ok: false });
      if (_network.requests.length > MAX_ENTRIES) _network.requests.shift();
      _network.log.push({ ts, type: "error", url: urlLabel(args[0]), error: err.message, duration });
      if (_network.log.length > MAX_ENTRIES) _network.log.splice(0, _network.log.length - MAX_ENTRIES);
      throw err;
    }
  };

  _cleanups.push(() => { window.fetch = originalFetch; });
}

function urlLabel(input) {
  try {
    const url = typeof input === "string" ? input : input?.url || String(input);
    return new URL(url, window.location.origin).pathname;
  } catch { return String(input).slice(0, 80); }
}

// ─── Web Vitals ────────────────────────────────────────────────────────────────
// Outlier caps: values beyond these thresholds are measurement artifacts
// (background tabs, long-idle SPAs, delayed reporting) and are discarded.
const VITALS_CAP = { lcp: 60_000, inp: 10_000, cls: 1 };

async function collectWebVitals() {
  try {
    const { onCLS, onINP, onLCP } = await import("web-vitals");
    onLCP(({ value, rating }) => {
      if (value > VITALS_CAP.lcp) return; // e.g. 13,352,048ms — tab left open
      _vitals.lcp = Math.round(value); _vitals.lcpRating = rating;
    });
    onINP(({ value, rating }) => {
      if (value > VITALS_CAP.inp) return;
      _vitals.inp = Math.round(value); _vitals.inpRating = rating;
    });
    onCLS(({ value, rating }) => {
      if (value > VITALS_CAP.cls) return;
      _vitals.cls = +value.toFixed(3); _vitals.clsRating = rating;
    });
  } catch {
    // web-vitals not available — vitals stay null
  }
}

// ─── User flow ─────────────────────────────────────────────────────────────────
function collectUserFlowFromVa() {
  const interceptTrack = (name) => {
    switch (name) {
      case "quiz_started": case "guest_play_started": _userFlow.quizStarted++; break;
      case "quiz_completed": _userFlow.quizCompleted++; break;
      case "retry_quiz": case "restart_full_quiz": _userFlow.retries++; break;
    }
  };

  if (!window.__realTelemetryVaProxy) {
    window.__realTelemetryVaProxy = true;
    const vaHandler = {
      get(target, prop) {
        if (prop === "track") {
          return function (name, data) {
            interceptTrack(name);
            if (typeof target._originalTrack === "function") return target._originalTrack(name, data);
          };
        }
        return target[prop];
      }
    };
    const installProxy = () => {
      if (window.va && !window.va.__proxied) {
        const original = window.va;
        window.va = new Proxy({ ...original, _originalTrack: original.track, __proxied: true }, vaHandler);
      }
    };
    installProxy();
    const intervalId = setInterval(() => { if (window.va && !window.va.__proxied) installProxy(); }, 2000);
    setTimeout(() => clearInterval(intervalId), 30_000);
    _cleanups.push(() => { clearInterval(intervalId); });
  }
}

export function recordRouteChange(routeName) {
  _userFlow.routeChanges++;
  _userFlow.routes[routeName] = (_userFlow.routes[routeName] || 0) + 1;
}

// ─── Navigation timing ────────────────────────────────────────────────────────
function getNavTiming() {
  try {
    const [nav] = performance.getEntriesByType("navigation");
    if (!nav) return null;
    return {
      dnsLookup: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
      tcpConnect: Math.round(nav.connectEnd - nav.connectStart),
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
      pageLoad: Math.round(nav.loadEventEnd - nav.startTime),
      transferSize: nav.transferSize || 0,
    };
  } catch { return null; }
}

// ─── Public snapshot (raw timestamped data) ────────────────────────────────────
export function getRealMetrics() {
  return {
    vitals: { ..._vitals },
    navTiming: getNavTiming(),
    errors: { log: [..._errors.log] },
    network: {
      requests: [..._network.requests],
      log: [..._network.log],
    },
    userFlow: {
      quizStarted: _userFlow.quizStarted,
      quizCompleted: _userFlow.quizCompleted,
      retries: _userFlow.retries,
      routeChanges: _userFlow.routeChanges,
      routeVisits: Object.entries(_userFlow.routes).map(([route, visits]) => ({ route, visits })).sort((a, b) => b.visits - a.visits),
      sessionDuration: Math.round((Date.now() - _userFlow.sessionStart) / 1000),
    },
  };
}
