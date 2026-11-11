/* Service worker: guarda os arquivos do jogo para funcionar sem internet. */
const CACHE = 'eu-no-jogo-v11';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/util.js', './js/sound.js', './js/avatar.js', './js/storage.js', './js/characters.js', './js/hobbies.js',
  './js/scenes.js', './js/home.js', './js/game.js', './js/friends.js', './js/room-editor.js', './js/world.js',
  './js/drawpad.js', './js/quiz.js', './js/pets.js', './js/outfit.js', './js/app.js', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      if (res.ok || res.type === 'opaque') caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
