const CACHE_NAME = "quran-player-shell-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Leave Quran API, audio servers, Google Fonts, and all other external
  // requests untouched. The recitation and fresh Quran text still need internet.
  if (url.origin !== self.location.origin || request.method !== "GET") return;

  // App navigation: try the network first, then show the cached app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Local app files: use the cached copy first.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
