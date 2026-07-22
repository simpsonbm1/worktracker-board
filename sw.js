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

  // Network-first for the shell so a deploy is picked up promptly, falling back
  // to cache when offline.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
