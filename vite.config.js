import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

// Bump this number ONLY when localStorage schema changes in a backward-incompatible way.
// Incrementing this will clear transient keys on first load after deploy.
const APP_DATA_VERSION = 1;

// Build hash: prefer env vars (CI/Vercel), fall back to git short hash
let buildHash = process.env.VITE_BUILD_HASH || '';
if (!buildHash) {
  const envSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VITE_GIT_COMMIT_SHA || '';
  if (envSha) buildHash = envSha.slice(0, 7);
}
if (!buildHash) {
  try { buildHash = execSync('git rev-parse --short HEAD').toString().trim(); } catch { buildHash = ''; }
}

function swCacheVersionPlugin() {
  return {
    name: 'sw-cache-version',
    closeBundle() {
      const swPath = resolve(__dirname, 'dist/sw.js');
      try {
        let content = readFileSync(swPath, 'utf-8');
        const cacheId = `k8s-quest-${Date.now()}`;
        content = content.replace('__SW_CACHE_VERSION__', cacheId);
        writeFileSync(swPath, content, 'utf-8');
        console.log(`[sw-cache-version] Stamped SW cache: ${cacheId}`);
      } catch (e) {
        console.warn('[sw-cache-version] Could not stamp sw.js:', e.message);
      }
    }
  };
}

const release = `kubequest@${buildHash || 'unknown'}`;

export default defineConfig({
  build: {
    sourcemap: true, // required for Sentry stack traces
  },
  plugins: [
    react(),
    swCacheVersionPlugin(),
    // Upload source maps to Sentry during production builds.
    // Requires SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT env vars.
    // Skips silently when credentials are missing (local dev, CI without secrets).
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: release },
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
      telemetry: false,
      disable: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_HASH__: JSON.stringify(buildHash),
    __APP_DATA_VERSION__: APP_DATA_VERSION,
  },
})
