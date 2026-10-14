// Lichtung offline support.
// The app itself and its typefaces are kept on the device so it opens without a connection.
// Requests to GitHub (your pieces) are never cached here: the app keeps those in IndexedDB.
const VERSION = "lichtung-2026-10-14";
const FONTS = "lichtung-fonts";
const SHELL = ["./", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve the cached copy at once and refresh it in the background,
// so a new version arrives on the next launch.
async function staleWhileRevalidate(request, key) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(key || request, { ignoreSearch: true });
  const network = fetch(request)
    .then(res => { if (res && res.ok) cache.put(key || request, res.clone()); return res; })
    .catch(() => null);
  return cached || (await network) || new Response("Lichtung is offline and hasn't been opened here before.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function cacheFirst(request) {
  const cache = await caches.open(FONTS);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
    return res;
  } catch (e) {
    return new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "api.github.com") return;
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(req, new URL("./", self.registration.scope).href));
    return;
  }
  event.respondWith(staleWhileRevalidate(req));
});
