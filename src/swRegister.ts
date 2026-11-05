export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('🌱 Loneitu Offline ServiceWorker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration skipped:', err);
        });
    });
  }
}
