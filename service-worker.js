const CACHE_NAME = 'shopledger-v1';
const urlsToCache = [
  './',
  './landing.html',
  './admin.html',
  './cashier.html',
  './common.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        // If offline and the file is not cached, show a simple offline message
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:2rem;background:#fdf8f4;color:#1e293b;}</style></head><body><h1>📴 You are offline</h1><p>ShopLedger works offline once installed. Please check your internet connection.</p><p>© 2026 TeaJay Konsult Ltd.</p></body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html' } }
        );
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});