const CACHE_NAME = "recipe-catalogue-v3";

const STATIC_ASSETS = [
  "/",
  "/css/base.css",
  "/css/layout.css",
  "/css/catalogue.css",
  "/css/recipe.css",
  "/css/print.css",
  "/manifest.webmanifest",
  "/css/view-transitions.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith("recipe-catalogue-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  // Always request current pages. Keep a copy for offline visits.
  if (event.request.mode === "navigate") {
    const response = fetch(event.request).catch(async (error) => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      throw error;
    });
    event.respondWith(response);
    event.waitUntil(response.then(async (result) => {
      if (result.status === 200 && result.type === "basic") {
        const copy = result.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, copy);
      }
    }).catch(() => {}));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
