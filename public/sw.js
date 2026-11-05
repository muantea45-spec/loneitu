/**
 * Loneitu (MIZORAM TAN) — Offline Field Access Service Worker
 * Ensures agronomists and farmers can read articles, guides, and registry records without internet.
 */

const CACHE_NAME = 'loneitu-offline-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
];

// 1. Install event: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: Clear legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: Stale-while-revalidate / Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests or browser extensions
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle API Database: Network first, fall back to cached response
  if (url.pathname.includes('/api/db')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req);
        })
    );
    return;
  }

  // Handle Static Assets & Pages: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // If offline and request is HTML navigation, serve cached root
          if (req.mode === 'navigate') {
            return caches.match('/') || caches.match('/index.html');
          }
          return cached;
        });

      return cached || fetchPromise;
    })
  );
});
