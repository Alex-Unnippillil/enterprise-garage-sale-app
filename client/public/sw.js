self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const text = formData.get('text') || formData.get('title');
      const files = formData.getAll('files');
      let fileData;
      let fileName;
      if (files.length && files[0] instanceof File) {
        const file = files[0];
        fileName = file.name;
        fileData = await file.arrayBuffer();
      }
      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({ action: 'share', text, fileData, fileName });
      }
      return Response.redirect('/tasks', 303);
    })());
  }
});
