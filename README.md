# Learning about service workers

Just one of the things I'm learning. <https://github.com/hchiam/learning>

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

## Example that's actually used

The following service worker script makes 2 kinds of things available offline (an offline page, and various JS/CSS resources needed to make it interactive offline):

<https://github.com/hchiam/hchiam.github.io/blob/1c18a08e69a905c0ede2d650e1bea2cdd4a56d8b/service-worker.js>

And you can see the latest version of that same service worker file here: (it does more)

<https://github.com/hchiam/hchiam.github.io/blob/master/service-worker.js>

## Background Sync API

```js
// in client:
registerServiceWorker();
requestAOneOffSync();

function registerServiceWorker() {
  navigator.serviceWorker.register('/sw.js');
}

function requestAOneOffSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(function(swRegistration) {
      return swRegistration.sync.register('myFirstSync');
    }).catch(function() {
      // maybe OS-level restriction on registering a sync, so just do it
      postDataFromThePage();
    });
  } else {
    // service worker or sync not supported
    postDataFromThePage();
  }
}

function postDataFromThePage() {

}
```

```js
// in service worker sw.js:
listenForBackOnlineSyncEvent();

function listenForBackOnlineSyncEvent() {
  self.addEventListener('sync', function(event) {
    console.log('sync event detected');
    if (event.tag == 'myFirstSync') {
      console.log('sync event TAG detected');
      event.waitUntil(doSomeStuff());
    }
  });
}

function doSomeStuff() {
  return new Promise(function(resolve, reject) {
    if (true) {
      resolve('the promise worked');
    } else {
      reject(Error('something broke'));
    }
  });
}
```
