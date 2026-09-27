const CACHE_NAME = 'lifehub-shell-v8';
const APP_ROOT = '/lifehub-pwa/';
const INDEX_URL = '/lifehub-pwa/index.html';

const SHELL = [
  '/lifehub-pwa/manifest.webmanifest',
  '/lifehub-pwa/icon-192.png',
  '/lifehub-pwa/icon-512.png',
  '/lifehub-pwa/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => {
          if (url.pathname.endsWith('/threads.html')) {
            return caches.match('/lifehub-pwa/threads.html');
          }
          return caches.match(INDEX_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
