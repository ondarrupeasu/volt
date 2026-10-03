/* Volt service worker — network-first + caché para offline.
   Sube CACHE cuando cambien los assets. */
const CACHE = 'volt-v1';
const ASSETS = [
  './', './index.html', './casa-estilo.css?v=1', './styles.css?v=1', './app.js?v=1',
  './levels/n0.js', './levels/n1.js', './ui.js', './manifest.webmanifest', './icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  e.respondWith(
    fetch(request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(request))
  );
});
