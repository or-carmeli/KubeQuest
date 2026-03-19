# Observability Guide

This document covers the full observability stack for KubeQuest.

## Overview

| Layer | Tool | What it does |
|-------|------|-------------|
| Error tracking | Sentry | Captures runtime errors, React crashes, API failures |
| Health checks | Supabase Edge Functions | Monitors 5 backend services every 60s |
| Uptime | GitHub Actions | External pings every 30 min |
| Synthetic tests | GitHub Actions | Smoke tests every 6 hours |
| Analytics | Vercel Analytics | Page views, traffic |
| Performance | Vercel Speed Insights + Web Vitals → Sentry | Core Web Vitals (LCP, CLS, INP) |
| Dev observability | Performance Insights (dev-only) | Real-time latency, errors, vitals, traffic, user flow |

## Sentry Setup

### 1. Create a Sentry project

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project: **platform = React**
3. Copy the DSN from **Project Settings → Client Keys (DSN)**

### 2. Environment variables

**Vercel (runtime — required):**

| Variable | Description |
|----------|-------------|
| `VITE_SENTRY_DSN` | Sentry project DSN |
| `VITE_SENTRY_ENVIRONMENT` | Optional — defaults to `"production"` |

**GitHub Actions (source maps — recommended):**

| Secret | Description |
|--------|-------------|
| `SENTRY_AUTH_TOKEN` | Org auth token (Project: Admin, Release: Admin, Org: Read) |
| `SENTRY_ORG` | Organization slug (from your Sentry URL) |
| `SENTRY_PROJECT` | Project slug |

### 3. Source maps

Source maps are uploaded automatically during CI builds when `SENTRY_AUTH_TOKEN` is set. They are deleted from the deploy artifact after upload — never served publicly.

For Vercel deployments, also add `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` as Vercel environment variables to enable source map uploads during Vercel builds.

### 4. Alerts (recommended)

Set up alerts in Sentry so you don't have to check the dashboard:

1. Go to **Alerts → Create Alert**
2. **When:** A new issue is created
3. **Then:** Send notification (email, Slack, etc.)
4. Recommended: also create an alert for **high error volume** (e.g., >10 events in 1 hour)

### 5. Suspect Commits

Connect your GitHub repo to Sentry for automatic suspect commit detection:

1. Go to **Settings → Integrations → GitHub**
2. Install the Sentry GitHub app
3. Link your repository

Sentry will then show which commit likely introduced each error.

### 6. Release tracking

Releases are automatically created with each deploy using the git commit hash (`kubequest@<hash>`). This enables:

- Release health tracking
- Regression detection
- Commit-level error attribution

## Web Vitals

Core Web Vitals (LCP, CLS, INP) are reported to Sentry as breadcrumbs and tags on error events. This lets you correlate performance with errors — e.g., "errors spike when LCP > 4s".

Vitals are also independently tracked by Vercel Speed Insights.

## Performance Insights (Dev-only)

A real-time observability dashboard available exclusively in development mode (`npm run dev`). Built on 100% real client-side telemetry — no mock or simulated data.

**Data sources:**

| Signal | Collection method |
|--------|------------------|
| Web Vitals (LCP, INP, CLS) | `web-vitals` library with CrUX p75 benchmark comparison |
| Request latency (P95) | Transparent `fetch` instrumentation |
| Error rate | Failed requests / total requests |
| Traffic (RPS) | Requests per second from fetch wrapper |
| Navigation timing | `performance.getEntriesByType("navigation")` |
| Client errors | `window.onerror` + `unhandledrejection` listeners |
| User flow | Route visits, quiz completion, session duration |

**Architecture:**

```mermaid
flowchart LR
    BROWSER["Browser Runtime<br/>web-vitals · fetch · errors"] --> COLLECT["Telemetry<br/>Collector"]
    COLLECT --> SNAPSHOT["Snapshot Builder<br/>Time-range Filter"]
    SNAPSHOT --> ANALYSIS["Analysis Engine<br/>Health · Insights"]
    ANALYSIS --> UI["Dashboard<br/>UI"]

    style BROWSER fill:#1a1a2e,stroke:#00D4FF,stroke-width:2px,color:#fff
    style COLLECT fill:#1a1a2e,stroke:#A855F7,stroke-width:2px,color:#fff
    style SNAPSHOT fill:#1a1a2e,stroke:#F59E0B,stroke-width:2px,color:#fff
    style ANALYSIS fill:#1a1a2e,stroke:#10B981,stroke-width:2px,color:#fff
    style UI fill:#1a1a2e,stroke:#00D4FF,stroke-width:2px,color:#fff
```

**Key capabilities:**

- **Data confidence scoring** — distinguishes meaningful signals from insufficient samples (low / medium / high)
- **Weighted health assessment** — combines latency, errors, vitals, and network failures into Healthy / Degraded / Unhealthy / Idle
- **Insights engine** — derives analytical conclusions from metric correlations, not just threshold breaches
- **Time-range filtering** — 30s, 1m, 5m, 15m, 30m, or full session
- **CrUX benchmark comparison** — session Web Vitals compared against Google's global p75 thresholds

**Dev-only gating:** Triple-gated (menu visibility, route registration, component guard) on `import.meta.env.DEV`. Fully tree-shaken from production builds.

**Files:**

| File | Role |
|------|------|
| `src/utils/realTelemetry.js` | Collects real browser signals |
| `src/utils/hybridTelemetry.js` | Filters by time range, builds snapshot |
| `src/utils/mockTelemetry.js` | Analysis engine (health, insights, confidence, thresholds) |
| `src/components/PerformanceInsights.jsx` | Dashboard UI |

## Synthetic Monitoring

The `synthetic-monitor.yml` workflow runs every 6 hours and checks:

- Homepage returns 200
- Critical assets (React root, JS bundle) are present
- Supabase auth endpoint is reachable
- Response time is under 3 seconds
- Security headers (HSTS, CSP, X-Content-Type-Options) are present

Failures appear as failed GitHub Actions runs. Set up GitHub notifications to be alerted.

## Uptime Monitoring

The `uptime.yml` workflow pings the homepage and Supabase auth every 30 minutes. Failed runs indicate downtime.

For more reliable external monitoring, consider adding a free service like [Betteruptime](https://betteruptime.com) or [UptimeRobot](https://uptimerobot.com).

## Error Budget / SLO Tracking

Use Sentry's error rate data to define and track reliability targets:

**Suggested SLOs:**
- **Quiz completion rate:** 99.5% of quiz sessions complete without a `handleSubmit` or `nextQuestion` error
- **Data save success:** 99% of `saveUserData` calls succeed
- **Page load:** 99.9% of page loads complete without a bootstrap error

**How to track:**
1. In Sentry → **Discover**, create a saved query filtering by `flow` tag
2. Compare error count against total sessions (from Vercel Analytics)
3. Review weekly — if error budget is consumed, prioritize fixes over features

## Data Safety

All error events are scrubbed before leaving the browser:

- JWT tokens, auth headers, and Supabase keys are redacted
- Email addresses are stripped
- SQL-like messages are replaced with generic text
- Only safe context is sent: screen name, guest flag, topic ID, question index
- No PII is ever transmitted
