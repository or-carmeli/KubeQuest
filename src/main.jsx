import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { init as initTelemetry, captureError, reportWebVital } from './utils/telemetry.js'
import './theme.css'

// Initialize Sentry as early as possible — production only.
// If DSN is missing or init fails, the app continues normally.
if (import.meta.env.PROD) {
  initTelemetry({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "production",
    release: `kubequest@${typeof __BUILD_HASH__ !== "undefined" ? __BUILD_HASH__ : "unknown"}`,
  });
}

// Report Core Web Vitals to Sentry (production only, lazy-loaded)
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
    onCLS(reportWebVital);
    onINP(reportWebVital);
    onLCP(reportWebVital);
  }).catch(() => {});
}

console.info("[KubeQuest:boot] main.jsx module loaded");

try {
  const container = document.getElementById('root');
  console.info("[KubeQuest:boot] createRoot");
  const root = ReactDOM.createRoot(container);
  console.info("[KubeQuest:boot] render()");
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider><App /></ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.info("[KubeQuest:boot] render() called - React is mounting");
} catch (err) {
  console.error("[KubeQuest:boot] FATAL bootstrap error:", err);
  captureError(err, { flow: "bootstrap" });
  const el = document.getElementById('root');
  if (el) {
    el.innerHTML = `
      <div style="min-height:100vh;background:#020817;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:24px">
        <div style="max-width:420px;text-align:center;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 32px">
          <div style="font-size:48px;margin-bottom:16px">&#9888;&#65039;</div>
          <h1 style="color:#e2e8f0;font-size:20px;font-weight:700;margin:0 0 8px">Failed to start</h1>
          <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;line-height:1.5">
            The application could not initialize.<br/>
            <span id="kq-fatal-msg" style="font-size:12px;color:#64748b"></span>
          </p>
          <button id="kq-fatal-clear" style="padding:10px 22px;background:linear-gradient(135deg,rgba(0,212,255,0.18),rgba(168,85,247,0.18));border:1px solid rgba(0,212,255,0.45);border-radius:10px;color:#00D4FF;font-size:14px;font-weight:700;cursor:pointer">
            Clear Data &amp; Reload
          </button>
        </div>
      </div>`;
    document.getElementById("kq-fatal-msg").textContent = String(err).slice(0, 200);
    document.getElementById("kq-fatal-clear").addEventListener("click", function () {
      localStorage.clear();
      sessionStorage.clear();
      location.reload();
    });
  }
}
