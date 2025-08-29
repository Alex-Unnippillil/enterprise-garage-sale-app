const CACHE_NAME = 'sync-cache-v1';
const RESOURCE_URLS = {
  weather: '/api/weather',
  feeds: '/api/feeds',
  assets: '/api/assets',
};

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if ('periodicSync' in self.registration) {
        try {
          await Promise.all(
            Object.keys(RESOURCE_URLS).map((tag) =>
              self.registration.periodicSync.register(tag, {
                // request an update roughly once a day
                minInterval: 24 * 60 * 60 * 1000,
              }),
            ),
          );
        } catch (err) {
          // ignore failed registration
        }
      } else {
        // fallback timer when Periodic Sync isn't supported
        setInterval(() => {
          Object.keys(RESOURCE_URLS).forEach((tag) => fetchAndCache(tag));
        }, 60 * 60 * 1000); // update hourly
      }
    })(),
  );
  self.clients.claim();
});

self.addEventListener('periodicsync', (event) => {
  if (RESOURCE_URLS[event.tag]) {
    event.waitUntil(fetchAndCache(event.tag));
  }
});

self.addEventListener('fetch', (event) => {
  if (!('caches' in self)) {
    return;
  }
  const url = new URL(event.request.url);
  if (Object.values(RESOURCE_URLS).includes(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    fetchAndCacheRequest(request, cache);
    return cached;
  }
  const response = await fetchAndCacheRequest(request, cache);
  return response || fetch(request);
}

async function fetchAndCache(tag) {
  const url = RESOURCE_URLS[tag];
  if (!url) return;
  const cache = 'caches' in self ? await caches.open(CACHE_NAME) : null;
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (cache && response && response.ok) {
      await cache.put(url, response.clone());
    }
    return response;
  } catch (err) {
    if (cache) {
      return cache.match(url);
    }
  }
}

async function fetchAndCacheRequest(request, cache) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cache.match(request);
  }
}
