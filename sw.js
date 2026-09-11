const SHARE_CACHE = 'tokei-share-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.search.includes('share-target')) {
    event.respondWith((async () => {
      try {
        const fd = await event.request.formData();
        const file = fd.get('docfile') || fd.get('file');
        if (file instanceof File) {
          const cache = await caches.open(SHARE_CACHE);
          await cache.put('/incoming-share', new Response(file, {
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'X-File-Name': encodeURIComponent(file.name || 'shared-document')
            }
          }));
        }
      } catch(e) { console.error('Share:', e); }
      return Response.redirect('./?incoming=1', 303);
    })());
  }
});
