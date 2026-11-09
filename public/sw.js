/**
 * Loneitu (MIZORAM TAN) — High-Performance Instant Synchronization Service Worker
 * Ensures 100% fresh content across all platforms while maintaining reliable offline fallback.
 */

const CACHE_NAME = 'loneitu-instant-v28';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about',
  '/archive',
  '/privacy',
  '/terms',
  '/manifest.json',
  '/robots.txt',
  '/favicon.png',
  '/favicon.ico',
  '/logo.png',
  '/logo.jpg',
  '/pwa-512x512.png',
];

// 1. Install event: Immediately take over without waiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Activate event: Clear all legacy caches and claim active clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Clearing outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event: Network-First for HTML & APIs to guarantee instant updates
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests or browser extension protocols
  if (req.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // A. API requests (/api/): STRICT NETWORK-FIRST (bypasses cache when online)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req, { cache: 'no-store' })
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && url.pathname.includes('/api/db')) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // If offline and request is /api/db, provide cached snapshot
          if (url.pathname.includes('/api/db')) {
            return caches.match(req);
          }
          return new Response(JSON.stringify({ error: 'offline', success: false }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // B. HTML Navigations (page visits e.g. /about, /, /article/*):
  // STRICT NETWORK-FIRST so all devices load the freshest app build immediately
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match('/') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // C. Immutable hashed static assets (/assets/): Cache-first with network fallback
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        });
      })
    );
    return;
  }

  // D. General static fallback (Stale-While-Revalidate)
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
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
