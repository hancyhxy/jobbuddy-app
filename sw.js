// Network-first so edits show immediately; cache keeps the demo working offline.
const CACHE = 'jobbuddy-v42';
const SHELL = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'js/app.js', 'js/data.js', 'js/avatar.js', 'js/icons.js', 'js/sprites.js', 'icons/icon.svg', 'tappy/', 'tappy/index.html', 'tappy/tappy.js', 'tappy/tappy.css', 'tappy/manifest.webmanifest', 'icons/tappy.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
