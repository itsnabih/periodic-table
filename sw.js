const CACHE_NAME = 'periodic-workbench-v3.2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/favicon.svg',
  './assets/saweria-qr.svg',
  './styles/tokens.css',
  './styles/layout.css',
  './styles/components.css',
  './src/main.js',
  './src/state/store.js',
  './src/data/elements.js',
  './src/data/spectra.js',
  './src/data/compounds.js',
  './src/modules/periodic-grid.js',
  './src/modules/thermodynamics.js',
  './src/modules/synthesis-lab.js',
  './src/modules/comparator.js',
  './src/modules/quantum-canvas.js',
  './src/modules/molecular-canvas.js',
  './src/utils/dom.js',
  './src/utils/url-state.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
