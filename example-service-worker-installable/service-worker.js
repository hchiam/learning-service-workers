var CACHE_NAME = "some_cache_name"; // edit this file to trigger PWA update when the site is refreshed in Chrome

var offlinePage = "/index.html";

var URLS = [
  // yes, the slash "/" matters here in service-worker.js:
  offlinePage,
  "/css-boilerplate.css",
  "/other-script.js",
  "/service-worker.js",

  // this and icon.png and manifest.webmanifest in index.html are the main differences with the other example:
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
  var url = new URL(event.request.url);
  if (URLS.indexOf(url.pathname) !== -1) {
    event.respondWith(
      caches
        .match(event.request)
        .then(function (response) {
          if (!response) {
            throw new Error(event.request + " not found in cache");
          }
          console.log("Service worker working even though you are offline.");
          return response;
        })
        .catch(function (error) {
          fetch(event.request);
        })
    );
  } else if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(function (error) {
        return caches.open(CACHE_NAME).then(function (cache) {
          console.log("Service worker working even though you are offline.");
          // return cache.matchAll(URLS);
          return cache.match("index.html"); // or offline.html
        });
      })
    );
  }
}
