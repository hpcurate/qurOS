/* qurOS — the offline shell. Cache-first for the app's own files, so it opens
   with no signal (speech-to-text itself may still need one). VERSION must
   match Q.VERSION in js/app.js — the test suite checks — and bumping it is
   what ships an update. The page tells a waiting worker to take over. */
const VERSION = '2.0.0';
const CACHE = 'qurOS-' + VERSION;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/app.css',
  'js/util.js', 'js/db.js', 'js/speech.js', 'js/ui.js', 'js/model.js', 'js/rec.js', 'js/dump.js',
  'js/day.js', 'js/gym.js', 'js/map.js', 'js/send.js', 'js/settings.js', 'js/app.js',
  'fonts/jetbrains-mono-latin.woff2', 'fonts/jetbrains-mono-latin-ext.woff2', 'fonts/syne-latin.woff2', 'fonts/syne-latin-ext.woff2',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('qurOS-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  /* a navigation (any ?go= shortcut) gets the cached page */
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
