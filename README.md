# Learning about service workers

Just one of the things I'm learning. <https://github.com/hchiam/learning>

Note: Web Workers can run expensive scripts without freezing the UI, while Service Workers can modify network requests: <https://stackoverflow.com/a/38634315>

More recent tutorial to follow: <https://youtu.be/sOq92prx00w>

Or just: `npx workbox-cli wizard` to get started.

## Setup

```bash
npm install
npm run start
```

Then open <http://localhost:8000> in Chrome and open Chrome DevTools: Application -> Service Workers.

For more info, follow this tutorial: <https://web.dev/codelab-service-workers>

## Looking at the code in this repo?

(The most important stuff is inside the `public` folder.)

1. [`index.html`](https://github.com/hchiam/learning-service-workers/blob/master/public/index.html) runs the script `register-sw.js`, and in turn
2. [`register-sw.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/register-sw.js) registers the service worker `service-worker.js`, and
3. [`service-worker.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/service-worker.js) is the actual service worker, and listens/reacts to specific events.

## Example template code that actually does something

3-steps: <https://github.com/hchiam/learning-service-workers/tree/master/another-example>

(Based on what I learned from this template: <https://glitch.com/~serviceworker-offline> and more.)

## Examples that are actually used

The following service worker script makes 2 kinds of things available offline (an offline page, and various JS/CSS resources needed to make it interactive offline):

<https://github.com/hchiam/hchiam.github.io/blob/1c18a08e69a905c0ede2d650e1bea2cdd4a56d8b/service-worker.js>

And you can see the latest version of that same service worker file here: (it does more)

<https://github.com/hchiam/hchiam.github.io/blob/master/service-worker.js>

Another example I've worked with has a list of files that is [partially automatically generated](https://github.com/hchiam/code-inspiration/commit/b0df8d8af208d65b6282ea7362b35fc5205bb907):

<https://github.com/hchiam/code-inspiration/commit/8ffb3b0e597adc2fe0b2f4fba9bfdac96b173059>

Yet another working example that automatically updates the site's service worker when users simply refresh the page (no need to fully close the tab and re-open): 
<https://github.com/hchiam/notepad/tree/914dda03ad458151e469773adb59db8a059f067a/site_files>

## Unregister service worker with a UI button

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

## Auto-generate a service worker

You can do that using `sw-precache` and some configuration: <https://developers.google.com/web/fundamentals/architecture/app-shell>

## Background Sync API

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

## More reading

You can save and delete resources in the same js file as your app, and trigger on click events: https://glitch.com/~learn-pwa-asset-caching

Caching strategies: (["Stale While Revalidate"](https://web.dev/learn/pwa/serving/#stale-while-revalidate) = cache and background fetch network into cache for next time - seem like my favourite, then ["Cache first"](https://web.dev/learn/pwa/serving/#cache-first), then ["Network first"](https://web.dev/learn/pwa/serving/#network-first)) https://web.dev/learn/pwa/serving/#caching-strategies
  
  ```js
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const networkFetch = fetch(event.request).then(response => {
          // update the cache with a clone of the network response
          const responseClone = response.clone();
          caches.open(url.searchParams.get('name')).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(function (reason) {
          console.error('ServiceWorker fetch failed: ', reason);
        });
        // prioritize cached response over network
        return cachedResponse || networkFetch;
      });
    );
  });
  ```

Workbox CLI wizard and more: https://web.dev/learn/pwa/workbox

- `npx workbox-cli wizard`
- more info to consider: https://web.dev/learn/pwa/workbox
- codelab (mentions how to use workbox to add offline fallback in 1 LOC): https://developers.google.com/codelabs/pwa-training/pwa03--working-with-workbox#3
- example recipe to manually include: https://developer.chrome.com/docs/workbox/modules/workbox-recipes/#pattern-3

Updating service worker: https://web.dev/learn/pwa/update/#updating-the-service-worker

<https://developers.google.com/web/fundamentals/instant-and-offline/offline-ux#network_connection_improves_or_is_restored>

<https://github.com/GoogleChromeLabs/sw-precache/blob/master/demo/app/js/service-worker-registration.js#L29>

## Workbox Typescript Tutorial

<https://youtu.be/sOq92prx00w>
