// Service Worker - Code Documentation PWA
// Advanced caching with multiple strategies

const CACHE_VERSION = "v2";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-${CACHE_VERSION}`;
const FONTS_CACHE = `fonts-${CACHE_VERSION}`;

// Assets to precache on install
const PRECACHE_ASSETS = ["/", "/manifest.webmanifest", "/404.html"];

// Cache size limits
const CACHE_LIMITS = {
  pages: 50,
  images: 100,
  dynamic: 100,
};

// Install event - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name.startsWith("static-") ||
                name.startsWith("dynamic-") ||
                name.startsWith("pages-") ||
                name.startsWith("images-") ||
                name.startsWith("fonts-")
              );
            })
            .filter((name) => {
              return !name.includes(CACHE_VERSION);
            })
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCacheSize(cacheName, maxItems);
  }
}

// Helper: Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Helper: Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      limitCacheSize(cacheName, CACHE_LIMITS[cacheName.split("-")[0]] || 50);
    }
    return networkResponse;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Helper: Network-first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      limitCacheSize(cacheName, CACHE_LIMITS[cacheName.split("-")[0]] || 50);
    }
    return networkResponse;
  } catch {
    const cachedResponse = await cache.match(request);
    return cachedResponse || caches.match("/404.html");
  }
}

// Fetch event - route requests to appropriate strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other schemes
  if (!url.protocol.startsWith("http")) return;

  // Route based on request type
  if (url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)) {
    // Fonts - cache first (rarely change)
    event.respondWith(cacheFirst(request, FONTS_CACHE));
  } else if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif|ico)$/)) {
    // Images - cache first
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
  } else if (
    url.pathname.match(/\.(css|js)$/) &&
    url.pathname.includes("_astro")
  ) {
    // Hashed assets - cache first (immutable)
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (url.pathname.endsWith("/") || url.pathname.endsWith(".html")) {
    // Pages - network first with fallback
    event.respondWith(networkFirst(request, PAGES_CACHE));
  } else if (url.origin === location.origin) {
    // Other same-origin requests - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-analytics") {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Placeholder for syncing stored analytics data
  const data = await getStoredAnalytics();
  if (data && data.length > 0) {
    // Send analytics when back online
  }
}

async function getStoredAnalytics() {
  // Would be implemented with IndexedDB
  return [];
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
  if (event.data === "clearCaches") {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      }),
    );
  }
  if (event.data?.type === "PREFETCH") {
    event.waitUntil(prefetchUrls(event.data.urls));
  }
});

// Prefetch URLs for faster navigation
async function prefetchUrls(urls) {
  const cache = await caches.open(PAGES_CACHE);
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: { Purpose: "prefetch" },
      });
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch {
      // Ignore prefetch failures
    }
  }
}
