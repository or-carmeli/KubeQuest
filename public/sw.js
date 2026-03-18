// CACHE_VERSION is replaced at build time by the vite swCacheVersion plugin.
// Falls back to a static name if the replacement didn't run (dev mode).
const CACHE_VERSION = "__SW_CACHE_VERSION__";
const CACHE = CACHE_VERSION.startsWith("__") ? "k8s-quest-dev" : CACHE_VERSION;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png"
];

// Purge all caches and notify clients to reload (one-time recovery)
function triggerStaleRecovery() {
  caches.keys().then(keys =>
    Promise.all(keys.map(k => caches.delete(k)))
  );
  self.clients.matchAll({ type: "window" }).then(clients => {
    clients.forEach(client =>
      client.postMessage({ type: "STALE_ASSET_RECOVERY" })
    );
  });
}

// Install - pre-cache shell assets and activate immediately
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate - keep current + previous cache, delete the rest, then claim clients
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => {
        const keep = new Set([CACHE]);
        // Retain the most recent previous app cache as offline fallback
        const prev = keys
          .filter(k => k !== CACHE && k.startsWith("k8s-quest-"))
          .sort()
          .pop();
        if (prev) keep.add(prev);
        return Promise.all(keys.filter(k => !keep.has(k)).map(k => caches.delete(k)));
      })
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
//  - Navigation: network-first with cache:"no-store" (never serve stale HTML)
//  - /assets/*:  cache-first (Vite hashed filenames are immutable)
//  - Everything else: network-first with cache fallback
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") return;

  // ── Navigation - always hit network for fresh HTML ──
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, { cache: "no-store" })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ── Hashed Vite assets (/assets/*) - cache first ──
  // Vite output filenames contain a content hash (e.g. index-abc123.js).
  // These are immutable: if the content changes, the filename changes.
  // Cache-first avoids redundant network requests for unchanged bundles.
  //
  // Stale-hash recovery:
  // After a new Vercel deployment, old tabs may still reference assets with
  // the previous content hash (e.g. /assets/index-OLDHASH.js). Those files
  // no longer exist on the CDN. Vercel rewrites unknown paths to /index.html,
  // so the response comes back as 200 OK with text/html instead of the
  // expected JS/CSS. The browser then rejects the response with a MIME type
  // error and the app gets stuck. We detect this mismatch and trigger a
  // one-time cache purge + client reload to pick up the new index.html with
  // the correct asset hashes.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          // Check for stale-hash mismatch: if the request expects a script
          // or stylesheet but the response is HTML, Vercel has served the
          // index.html fallback instead of the real asset.  Also catch 404s
          // (Vercel will now 404 for missing assets instead of serving HTML,
          // thanks to the rewrite exclusion in vercel.json).
          const isAssetReq =
            e.request.destination === "script" ||
            e.request.destination === "style" ||
            url.pathname.endsWith(".js") ||
            url.pathname.endsWith(".css");

          if (isAssetReq) {
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            const expectsJS = e.request.destination === "script" || url.pathname.endsWith(".js");
            const expectsCSS = e.request.destination === "style" || url.pathname.endsWith(".css");
            const isMismatch =
              !res.ok ||
              ct.includes("text/html") ||
              (expectsJS && !ct.includes("javascript")) ||
              (expectsCSS && !ct.includes("css"));

            if (isMismatch) {
              console.warn(
                `[SW] Stale asset detected: ${url.pathname} status=${res.status} content-type="${ct}". ` +
                "Purging caches and notifying clients to reload."
              );
              triggerStaleRecovery();
              return new Response("/* asset unavailable after deploy - reloading */", {
                status: 503,
                headers: { "Content-Type": expectsJS ? "application/javascript" : "text/css" }
              });
            }
          }

          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => {
          // Network failure for an asset - trigger recovery
          console.warn(`[SW] Network failure for asset: ${url.pathname}`);
          const expectsJS = e.request.destination === "script" || url.pathname.endsWith(".js");
          triggerStaleRecovery();
          return new Response("/* asset unavailable - reloading */", {
            status: 503,
            headers: { "Content-Type": expectsJS ? "application/javascript" : "text/css" }
          });
        });
      })
    );
    return;
  }

  // ── Other sub-resources - network first, cache fallback ──
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
