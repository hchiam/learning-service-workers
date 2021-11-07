var CACHE_NAME = "version_01";

var URLS = [
  "/index.html",
  "/offline-page.html",
  "/script.js",
  "/style.css",
  "/manifest.webmanifest",
];

self.addEventListener("install", installServiceWorker);
self.addEventListener("activate", activateServiceWorker);
self.addEventListener("fetch", interceptResourceFetchWithServiceWorker);

function installServiceWorker(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service worker installing.");
      return cache.addAll(URLS);
    })
  );
}

function activateServiceWorker(event) {
  event.waitUntil(
    caches
      .keys() // cache names (caches)
      .then((cacheKeys) => {
        // cache entries (keys/entries in a single cache)
        const oldKeys = cacheKeys.filter(
          (key) => key.indexOf(CACHE_NAME) !== 0
        );
        // promise to delete all old keys in this cache:
        const promisesToDeleteOldKeys = oldKeys.map((oldKey) =>
          caches.delete(oldKey)
        );
        // don't continue until ALL old keys are deleted:
        return Promise.all(promisesToDeleteOldKeys);
      })
  );
}

function interceptResourceFetchWithServiceWorker(event) {
  const url = new URL(event.request.url);
  const wantAppShellResource = URLS.indexOf(url.pathname) !== -1;
  const navigatingToPage = event.request.mode === "navigate";
  if (wantAppShellResource) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (!response) {
            throw new Error(event.request + " not found in cache");
          }
          console.log(
            `Service worker fetching resource even though you're offline: ${url}`
          );
          // get resource from cache:
          return response;
        })
        .catch((error) => {
          // fetch resource from network if not in cache:
          fetch(event.request);
        })
    );
  } else if (navigatingToPage) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        return caches.open(CACHE_NAME).then((cache) => {
          console.log(
            `Service worker fetching page even though you're offline: ${url}`
          );
          return cache.match("offline-page.html");
        });
      })
    );
  }
}
