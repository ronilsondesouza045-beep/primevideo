const CACHE_NAME = 'streamhub-vip-cache-v4';

const CORE_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  // APIs e metadata Android precisam estar sempre atualizadas.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/android-version.json'
  ) {
    return;
  }

  // Navegacao: tenta internet primeiro.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          return (
            (await caches.match(request)) ||
            (await caches.match('/')) ||
            Response.error()
          );
        }
      })()
    );

    return;
  }

  // Assets: entrega cache rapidamente e atualiza em segundo plano.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) {
        event.waitUntil(
          fetch(request)
            .then(async (response) => {
              if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, response.clone());
              }
            })
            .catch(() => undefined)
        );

        return cached;
      }

      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return Response.error();
      }
    })()
  );
});
