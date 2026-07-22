/* worktracker board — service worker.
 *
 * Exists only to make the page installable and to survive a cold start offline.
 * It caches the SHELL and nothing else.
 *
 * Hard rule: never touch api.github.com. Those responses carry the contents of
 * the PRIVATE tracker repo, and caching them would write private data to disk
 * outside the page's own control — the exact thing the public-shell/private-data
 * split exists to prevent. Anything that is not a same-origin shell asset goes
 * straight to the network, uncached.
 */
const VERSION = "wt-shell-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Never cache, never intercept: API traffic and anything cross-origin.
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== "GET") return;

  // Network-first for the shell, with `cache: "no-cache"` to force revalidation
  // against the server rather than trusting the browser's copy.
  //
  // GitHub Pages sends `Cache-Control: max-age=600` on the shell, so a plain fetch()
  // is served from the local disk cache for ten minutes after any load - a deploy
  // silently does not arrive, and the page shows no sign of being stale. "no-cache"
  // still uses the ETag, so an unchanged file costs a 304 rather than a re-download.
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
