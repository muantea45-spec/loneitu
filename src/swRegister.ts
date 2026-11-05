export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('🌱 Loneitu ServiceWorker registered:', reg.scope);

          // Actively check for worker updates on page load
          reg.update().catch(() => {});

          // Re-check for new deployments whenever user returns to tab
          const checkUpdate = () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          };
          window.addEventListener('visibilitychange', checkUpdate);
          window.addEventListener('focus', checkUpdate);

          // Check periodically every 60 seconds
          setInterval(() => {
            reg.update().catch(() => {});
          }, 60000);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration skipped:', err);
        });

      // Reload smoothly when a new service worker version takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

