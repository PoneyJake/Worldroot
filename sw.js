const CACHE = 'worldroot-pwa-v25';

const PRECACHE = [
  '/',
  '/index.html',
  '/game.html',
  '/manifest.webmanifest',
  '/css/site.css',
  '/css/style.css',
  '/assets/worldroot-logo.png',
  '/assets/worldroot-bg.png',
  '/assets/pwa/icon-192.png',
  '/assets/pwa/icon-512.png',
  '/assets/pwa/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

function isSameOrigin(request) {
  try {
    return new URL(request.url).origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isSameOrigin(request)) return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  const preferNetwork = url.pathname.endsWith('.js') || url.pathname.endsWith('.html');

  event.respondWith(
    (preferNetwork
      ? fetch(request).then((response) => {
        if (response.ok) {
          caches.open(CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => caches.match(request))
      : caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => cached);
        return cached || network;
      })),
  );
});
