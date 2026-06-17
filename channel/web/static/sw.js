// OnyxAgent Service Worker - PWA Support
const CACHE_NAME = 'onyxagent-v2.1.1';
const STATIC_ASSETS = [
  '/chat',
  '/assets/css/console.css',
  '/assets/vendor/tailwind/tailwind.min.js',
  '/assets/vendor/markdown-it/markdown-it.min.js',
  '/assets/vendor/highlightjs/highlight.min.js',
  '/assets/vendor/highlightjs/styles/github.min.css',
  '/assets/vendor/highlightjs/styles/github-dark.min.css',
  '/assets/vendor/fontawesome/css/all.min.css',
  '/assets/vendor/fonts/inter/inter.css',
  '/assets/js/console.js',
  '/assets/manifest.json',
  '/assets/favicon.svg',
  '/assets/favicon.ico',
  '/assets/logo.svg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API/streaming requests - always go to network
  if (url.pathname.startsWith('/message') || 
      url.pathname.startsWith('/stream') || 
      url.pathname.startsWith('/poll') ||
      url.pathname.startsWith('/cancel') ||
      url.pathname.startsWith('/upload') ||
      url.pathname.startsWith('/auth') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/config')) {
    return;
  }

  // For static assets: cache-first strategy
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Return offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/chat');
          }
        });
      })
    );
    return;
  }

  // For navigation: network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/chat');
      })
    );
    return;
  }

  // For everything else: network-first
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
