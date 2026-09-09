// DOCTRACK Service Worker — Web Share Target handler
// When a user shares a file from WhatsApp/Telegram/Email to DOCTRACK,
// this intercepts the POST, caches the file, then redirects the app to handle it.

const SHARE_CACHE = 'doctrack-share-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Intercept the Web Share Target POST request
  if (event.request.method === 'POST' && url.search.includes('share-target')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        // Try common field names used by different share sources
        const file = formData.get('docfile') || formData.get('file') ||
                     formData.get('files') || formData.get('media');

        if (file && file instanceof File) {
          const cache = await caches.open(SHARE_CACHE);
          // Store file as a response in the cache
          await cache.put('/incoming-share', new Response(file, {
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'X-File-Name': encodeURIComponent(file.name || 'shared-document'),
              'X-File-Size': String(file.size)
            }
          }));
        }
      } catch (err) {
        console.error('Share Target error:', err);
      }
      // Redirect back to the app — the app will read from cache
      return Response.redirect('./?incoming=1', 303);
    })());
    return;
  }
});
