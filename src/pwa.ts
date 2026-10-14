export function registerServiceWorker() {
  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // No ambiente de desenvolvimento não usamos Service Worker.
  // Isso evita cache antigo, piscadas e reloads durante o HMR.
  if (isLocal) {
    window.addEventListener('load', async () => {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        await Promise.all(
          registrations.map(
            (registration) =>
              registration.unregister(),
          ),
        );

        if ('caches' in window) {
          const cacheNames =
            await caches.keys();

          await Promise.all(
            cacheNames.map(
              (cacheName) =>
                caches.delete(cacheName),
            ),
          );
        }

        console.info(
          '[StreamHub DEV] Service Worker e caches locais removidos.',
        );
      } catch (error) {
        console.warn(
          '[StreamHub DEV] Nao foi possivel limpar o Service Worker:',
          error,
        );
      }
    });

    return;
  }

  // PRODUCAO
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
      })
      .then((registration) => {
        console.info(
          '[StreamHub PWA] Service Worker ativo:',
          registration.scope,
        );

        registration
          .update()
          .catch(() => undefined);

        registration.addEventListener(
          'updatefound',
          () => {
            const worker =
              registration.installing;

            if (!worker) return;

            worker.addEventListener(
              'statechange',
              () => {
                if (
                  worker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  window.dispatchEvent(
                    new CustomEvent(
                      'streamhub:update-available',
                    ),
                  );
                }
              },
            );
          },
        );
      })
      .catch((error) => {
        console.warn(
          '[StreamHub PWA] Service Worker indisponivel:',
          error,
        );
      });
  });
}