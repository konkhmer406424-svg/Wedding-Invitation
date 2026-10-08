/* Service worker — lets the builder open offline after the first visit.
   Strategy: network first (so you always get the newest code/images when online), cache as fallback.
   Only same-origin GET requests are handled: Google Apps Script, Cloudflare Worker, fonts and CDN are never touched.
   To force everyone to drop old caches, change CACHE_VERSION. */
const CACHE_VERSION = "wib-v1";
const CORE = ["./", "index.html", "style.css", "wib-data.js", "wib-render.js", "wib-pickers.js", "wib-ui.js", "logo.png", "manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if(res && res.ok && res.status === 200){
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req, { ignoreSearch: true }).then(hit =>
        hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error())
      )
    )
  );
});
