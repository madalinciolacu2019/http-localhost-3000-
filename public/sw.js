const CACHE_NAME = 'apex-brews-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/globals.css',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle HTML/navigation requests or static assets
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || new Response(
          '<html><body style="background:#15151E;color:white;font-family:sans-serif;text-align:center;padding:50px;">' +
          '<h1 style="color:#E10600;">APEX COCKPIT OFFLINE</h1>' +
          '<p>Telemetry connection lost. Check your trackside signal and throttle config.</p>' +
          '<button onclick="window.location.reload()" style="background:#E10600;color:white;border:none;padding:10px 20px;cursor:pointer;font-weight:bold;margin-top:20px;">RECONNECT</button>' +
          '</body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Push notification mock
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SIMULATE_ROAST') {
    const title = 'FRESH ROAST READY';
    const options = {
      body: 'Your telemetry-calibrated beans are fresh out of the roaster.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200, 100, 200, 100, 400],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});
