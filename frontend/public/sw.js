/**
 * Muraho Rwanda — Service Worker
 * ===============================
 * Caching strategy:
 *   - App shell (HTML, CSS, JS): Cache-first
 *   - API data: Network-first with cache fallback
 *   - Media (images, audio): Cache-first with network fallback
 *   - Museum content: Explicit cache on user download
 *
 * Registered by: frontend/src/lib/sw-register.ts
 */

const CACHE_VERSION = "muraho-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const MEDIA_CACHE = `${CACHE_VERSION}-media`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

// App shell files to precache
const SHELL_FILES = [
  "/",
  "/index.html",
  "/offline.html",
];

// ── Install: precache app shell ──────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// ── Activate: cleanup old caches ─────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("muraho-") && key !== SHELL_CACHE && key !== DATA_CACHE && key !== MEDIA_CACHE && key !== OFFLINE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: route-based caching strategies ────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip browser extension requests
  if (!url.protocol.startsWith("http")) return;

  // API requests: network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, DATA_CACHE));
    return;
  }

  // Media assets: cache-first
  if (isMediaRequest(url)) {
    event.respondWith(cacheFirstWithNetwork(request, MEDIA_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts): cache-first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstWithNetwork(request, SHELL_CACHE));
    return;
  }

  // HTML navigation: network-first (SPA routing)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
});

// ── Message handler: explicit content caching ────────────

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "CACHE_CONTENT") {
    // Cache specific URLs for offline access (museum content, routes, etc.)
    event.waitUntil(cacheOfflineContent(payload.urls, payload.id));
  }

  if (type === "CLEAR_CACHE") {
    event.waitUntil(
      payload?.id
        ? clearContentCache(payload.id)
        : caches.delete(OFFLINE_CACHE)
    );
  }

  if (type === "GET_CACHE_SIZE") {
    getCacheSize().then((size) => {
      event.source?.postMessage({ type: "CACHE_SIZE", payload: { size } });
    });
  }
});

// ── Caching strategies ───────────────────────────────────

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "Offline", cached: false }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // SPA: serve index.html for navigation requests
    const index = await caches.match("/index.html");
    if (index) return index;

    return caches.match("/offline.html") || new Response("Offline", { status: 503 });
  }
}

// ── Explicit content download for offline ────────────────

async function cacheOfflineContent(urls, contentId) {
  const cache = await caches.open(OFFLINE_CACHE);
  const results = { cached: 0, failed: 0, errors: [] };

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        results.cached++;
      } else {
        results.failed++;
        results.errors.push(`${url}: ${response.status}`);
      }
    } catch (err) {
      results.failed++;
      results.errors.push(`${url}: ${err.message}`);
    }
  }

  // Store manifest of cached content
  const manifest = await getOfflineManifest();
  manifest[contentId] = { urls, cachedAt: Date.now(), count: results.cached };
  await cache.put(
    new Request("/_offline-manifest.json"),
    new Response(JSON.stringify(manifest))
  );

  // Notify clients
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: "CACHE_COMPLETE", payload: { contentId, ...results } });
  }
}

async function clearContentCache(contentId) {
  const cache = await caches.open(OFFLINE_CACHE);
  const manifest = await getOfflineManifest();
  const entry = manifest[contentId];

  if (entry) {
    for (const url of entry.urls) {
      await cache.delete(url);
    }
    delete manifest[contentId];
    await cache.put(
      new Request("/_offline-manifest.json"),
      new Response(JSON.stringify(manifest))
    );
  }
}

async function getOfflineManifest() {
  const cache = await caches.open(OFFLINE_CACHE);
  const resp = await cache.match("/_offline-manifest.json");
  return resp ? resp.json() : {};
}

async function getCacheSize() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return { used: estimate.usage || 0, quota: estimate.quota || 0 };
  }
  return { used: 0, quota: 0 };
}

// ── Helpers ──────────────────────────────────────────────

function isMediaRequest(url) {
  const ext = url.pathname.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "avif", "gif", "svg", "mp3", "mp4", "wav", "ogg"].includes(ext || "");
}

function isStaticAsset(url) {
  const ext = url.pathname.split(".").pop()?.toLowerCase();
  return ["js", "css", "woff", "woff2", "ttf", "eot"].includes(ext || "");
}
