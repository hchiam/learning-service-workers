# Learning about service workers

Just one of the things I'm learning. <https://github.com/hchiam/learning>

Tutorial to follow: <https://web.dev/codelab-service-workers>

```bash
npm install
npm run start
```

Then open <http://localhost:8000> in Chrome and open Chrome DevTools.

Application -> Service Workers

## Looking at the code?

(The most important stuff is inside the `public` folder.)

1. [`index.html`](https://github.com/hchiam/learning-service-workers/blob/master/public/index.html) runs the script `register-sw.js`, and in turn
2. [`register-sw.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/register-sw.js) registers the service worker `service-worker.js`, and
3. [`service-worker.js`](https://github.com/hchiam/learning-service-workers/blob/master/public/service-worker.js) is the actual service worker, and listens/reacts to specific events.
