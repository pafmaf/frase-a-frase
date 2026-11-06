// Frase a Frase service worker: offline app shell + cache-as-you-go audio.
// Bump VERSION when you replace existing audio clips with new recordings.
const VERSION = 'v1';
const SHELL = `shell-${VERSION}`, AUDIO = `audio-${VERSION}`, FONTS = `fonts-${VERSION}`;
const SHELL_FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  const keep = [SHELL, AUDIO, FONTS];
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Safari plays media with Range requests and needs a 206 answer, also from cache.
async function rangeFrom(response, rangeHeader) {
  const buf = await response.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || '');
  if (!m) return new Response(buf, { status: 200, headers: response.headers });
  const size = buf.byteLength;
  let start = m[1] === '' ? size - Number(m[2]) : Number(m[1]);
  let end = m[1] !== '' && m[2] !== '' ? Number(m[2]) : size - 1;
  start = Math.max(0, start); end = Math.min(size - 1, end);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'audio/mp4',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  // The clip list changes when you add recordings: always ask the network first.
  if (url.pathname.endsWith('/audio/manifest.json')) { e.respondWith(networkFirst(req, AUDIO)); return; }

  // Audio clips: cache-first (full file cached once), answer Range requests from the cached copy.
  if (url.pathname.includes('/audio/')) {
    e.respondWith((async () => {
      const cache = await caches.open(AUDIO);
      const key = url.origin + url.pathname;
      let hit = await cache.match(key);
      if (!hit) {
        const res = await fetch(key);           // full file, no Range header
        if (!res.ok) return res;
        await cache.put(key, res.clone());
        hit = res;
      }
      return rangeFrom(hit.clone(), req.headers.get('range'));
    })());
    return;
  }

  // App shell: network-first so new versions arrive, cache when offline.
  if (req.mode === 'navigate' || SHELL_FILES.some(f => url.pathname.endsWith(f.replace('./', '/')))) {
    e.respondWith(networkFirst(req, SHELL).catch(() => caches.match('index.html')));
  }
});
