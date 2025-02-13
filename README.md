# Learning about service workers

Just one of the things I'm learning. https://github.com/hchiam/learning

My GitHub template repo: https://github.com/hchiam/pwa-template

My favourite notes so far: jump to [PWA service worker with workbox codelab (`npm i` and `import`)
](https://github.com/hchiam/learning-service-workers/tree/main#pwa-service-worker-with-workbox-codelab-npm-i-and-import)

Note: Web Workers can run expensive scripts without freezing the UI, while Service Workers can modify network requests: https://stackoverflow.com/a/38634315

More recent tutorial to follow: https://youtu.be/sOq92prx00w

Or just: `npx workbox-cli wizard` to get started, but personally I find installing a few workbox plugins to be more flexible/easier to apply to varied projects.

## Code examples I know work

[/example-service-worker](https://github.com/hchiam/learning-service-workers/tree/main/example-service-worker) folder = https://example-service-worker.surge.sh

[/example-service-worker-installable](https://github.com/hchiam/learning-service-workers/tree/main/example-service-worker-installable) folder = https://example-service-worker-installable.surge.sh

How to check for installability:

![Chrome > Application > Manifest > Installability](https://github.com/hchiam/learning-service-workers/blob/main/how_to_check_installability.png)

To uninstall a PWA in Chrome, go to chrome://apps and open the PWA, then the 3 vertical dots "...", then "Uninstall (name of PWA)".

To update a PWA in Chrome on Android mobile, deploy an updated version of the service-worker.js, and refresh the site page on the device.

## Quick code to copy-paste (offline but not installable)

index.html:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>example</title>
    <link rel="stylesheet" href="css-boilerplate.css" />
    <script src="other-script.js"></script>
    <script>
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register("service-worker.js");
      }
    </script>
  </head>
  <body>
    <p>other stuff</p>
  </body>
</html>
```

service-worker.js:

```js
var CACHE_NAME = "some_cache_name";

var offlinePage = "/index.html";

var URLS = [
  // yes, the slash "/" matters here in service-worker.js:
  offlinePage,
  "/css-boilerplate.css",
  "/other-script.js",
  "/service-worker.js",
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
```

## Older notes

### Setup

```bash
npm install
npm run start
```

Then open http://localhost:8000 in Chrome and open Chrome DevTools: Application -> Service Workers.

For more info, follow this tutorial: https://web.dev/codelab-service-workers

### Looking at the code in this repo?

(The most important stuff is inside the `public` folder.)

1. [`index.html`](https://github.com/hchiam/learning-service-workers/blob/master/public/index.html) runs the script `register-sw.js`, and in turn
2. [`register-sw.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/register-sw.js) registers the service worker `service-worker.js`, and
3. [`service-worker.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/service-worker.js) is the actual service worker, and listens/reacts to specific events.

### Example template code that actually does something

3-steps: https://github.com/hchiam/learning-service-workers/tree/master/another-example

(Based on what I learned from this template: https://glitch.com/~serviceworker-offline and more.)

### Examples that are actually used

The following service worker script makes 2 kinds of things available offline (an offline page, and various JS/CSS resources needed to make it interactive offline):

https://github.com/hchiam/hchiam.github.io/blob/1c18a08e69a905c0ede2d650e1bea2cdd4a56d8b/service-worker.js

And you can see the latest version of that same service worker file here: (it does more)

https://github.com/hchiam/hchiam.github.io/blob/master/service-worker.js

Another example I've worked with has a list of files that is [partially automatically generated](https://github.com/hchiam/code-inspiration/commit/b0df8d8af208d65b6282ea7362b35fc5205bb907):

https://github.com/hchiam/code-inspiration/commit/8ffb3b0e597adc2fe0b2f4fba9bfdac96b173059

Yet another working example that automatically updates the site's service worker when users simply refresh the page (no need to fully close the tab and re-open):
https://github.com/hchiam/notepad/tree/914dda03ad458151e469773adb59db8a059f067a/site_files

### Unregister service worker with a UI button

Useful if the user can't/doesn't navigate away from the page (to clear cache and unregister service worker), or if they're using a PWA "installed" on their device. You can have a button `update-page-button` to manually update to the latest service worker and new cached files:

```js
function refreshSW() {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

document
  .getElementById("update-page-button")
  .addEventListener("click", function () {
    refreshSW();
    location.href = "/";
  });
```

### Auto-generate a service worker

You can do that using `sw-precache` and some configuration: https://developers.google.com/web/fundamentals/architecture/app-shell

### Background Sync API

```js
// in client:
registerServiceWorker();
requestAOneOffSync();

function registerServiceWorker() {
  navigator.serviceWorker.register("/sw.js");
}

function requestAOneOffSync() {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then(function (swRegistration) {
        return swRegistration.sync.register("myFirstSync");
      })
      .catch(function () {
        // maybe OS-level restriction on registering a sync, so just do it
        postDataFromThePage();
      });
  } else {
    // service worker or sync not supported
    postDataFromThePage();
  }
}

function postDataFromThePage() {}
```

```js
// in service worker sw.js:
listenForBackOnlineSyncEvent();

function listenForBackOnlineSyncEvent() {
  self.addEventListener("sync", function (event) {
    console.log("sync event detected");
    if (event.tag == "myFirstSync") {
      console.log("sync event TAG detected");
      event.waitUntil(doSomeStuff());
    }
  });
}

function doSomeStuff() {
  return new Promise(function (resolve, reject) {
    if (true) {
      resolve("the promise worked");
    } else {
      reject(Error("something broke"));
    }
  });
}
```

### More reading

You can save and delete resources in the same js file as your app, and trigger on click events: https://glitch.com/~learn-pwa-asset-caching

Caching strategies: (["Stale While Revalidate"](https://web.dev/learn/pwa/serving/#stale-while-revalidate) = cache and background fetch network into cache for next time - seem like my favourite, then ["Cache first"](https://web.dev/learn/pwa/serving/#cache-first), then ["Network first"](https://web.dev/learn/pwa/serving/#network-first)) https://web.dev/learn/pwa/serving/#caching-strategies

    ```js
    self.addEventListener("fetch", (event) => {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const networkFetch = fetch(event.request)
            .then((response) => {
              // update the cache with a clone of the network response
              const responseClone = response.clone();
              caches.open(url.searchParams.get("name")).then((cache) => {
                cache.put(event.request, responseClone);
              });
              return response;
            })
            .catch(function (reason) {
              console.error("ServiceWorker fetch failed: ", reason);
            });
          // prioritize cached response over network
          return cachedResponse || networkFetch;
        })
      );
    });
    ```

A basic Workbox Typescript tutorial: https://youtu.be/sOq92prx00w

### [Workbox/PWA training](https://web.dev/new-pwa-training/)

#### Workbox CLI wizard and more

https://web.dev/learn/pwa/workbox

- `npx workbox-cli wizard`
- more info to consider: https://web.dev/learn/pwa/workbox
- codelab (mentions how to use workbox to add offline fallback in 1 LOC): https://developers.google.com/codelabs/pwa-training/pwa03--working-with-workbox#3
- example recipe to manually include: https://developer.chrome.com/docs/workbox/modules/workbox-recipes/#pattern-3

Updating service worker: https://web.dev/learn/pwa/update/#updating-the-service-worker

https://developers.google.com/web/fundamentals/instant-and-offline/offline-ux#network_connection_improves_or_is_restored

https://github.com/GoogleChromeLabs/sw-precache/blob/master/demo/app/js/service-worker-registration.js#L29

#### Basic PWA service worker codelab

https://developers.google.com/codelabs/pwa-training/pwa03--going-offline#0

- with no special library/plugin imports

### Just need an offline fallback?

https://developer.chrome.com/docs/workbox/managing-fallback-responses/#offline-page-only

The following code automatically searches for offline.html at the root folder and caches that:

```js
import { offlineFallback } from "workbox-recipes";
import { setDefaultHandler } from "workbox-routing";
import { NetworkOnly } from "workbox-strategies";

setDefaultHandler(new NetworkOnly());

offlineFallback();
```

#### PWA service worker with workbox codelab (`npm i` and `import`)

https://developers.google.com/codelabs/pwa-training/pwa03--working-with-workbox#0

- I think I personally like this strategy best so far
- more powerful library/plugin imports with less code

1. install a few workbox plugins (`npm install` the 5 below that I find essential): https://github.com/hchiam/pwa-workshop-codelab/blob/pwa03--workbox/package.json#L29C5-L29C5 or:

   ```sh
   npm i -SE workbox-recipes workbox-strategies workbox-routing workbox-cacheable-response workbox-expiration
   ```

   or:

   ```sh
   yarn add -E workbox-recipes workbox-strategies workbox-routing workbox-cacheable-response workbox-expiration
   ```

2. make service worker run with a js script: https://github.com/hchiam/pwa-workshop-codelab/blob/pwa03--workbox/js/main.js#L17-L41
3. **the actual service worker code itself** (cache html, stale while revalidate style/script/worker, and offline fallback offline.html): https://github.com/hchiam/pwa-workshop-codelab/blob/pwa03--workbox/service-worker.js
4. the offline.html file itself, with inline style: https://github.com/hchiam/pwa-workshop-codelab/blob/pwa03--workbox/offline.html
