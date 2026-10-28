/* Service worker — lets the builder open offline after the first visit.
   Code (html/css/js): network first, so you always get the newest version when online; cache is the offline fallback.
   Art images (/images/...): cache first. Their address already carries ?v=ASSET_VERSION, so a new version = a new
   address = downloaded again. A big image is downloaded once instead of on every visit.
   Images larger than MAX_CACHED_IMAGE are shown but NOT stored (keeps the cache small).
   Only same-origin GET requests are handled: Google Apps Script, Cloudflare Worker, fonts and CDN are never touched.
   To force everyone to drop old caches, change CACHE_VERSION. */
const CACHE_VERSION = "wib-v6";
const MAX_CACHED_IMAGE = 1.5 * 1024 * 1024;   // bytes
const CORE = ["./", "index.html", "style.css", "wib-data.js", "layouts/l1/wib-layout-l1.js", "layouts/l2/wib-layout-l2.js", "layouts/l3/wib-layout-l3.js", "layouts/l4/wib-layout-l4.js", "layouts/l5/wib-layout-l5.js", "wib-layouts.js", "wib-render.js", "wib-pickers.js", "wib-ui.js", "logo.png", "manifest.json"];

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

function isArtImage(url){ return /\/images\//.test(url.pathname); }

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;

  // Art images: cache first (exact address, so ?v= changes are respected)
  if(isArtImage(url)){
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const size = Number(res.headers.get("content-length") || 0);
        if(res && res.ok && res.status === 200 && size > 0 && size <= MAX_CACHED_IMAGE){
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => Response.error()))
    );
    return;
  }

  // Everything else (code): network first, cache as offline fallback
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