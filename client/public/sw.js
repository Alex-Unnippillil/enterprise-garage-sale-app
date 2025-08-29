self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'placeholder-sync') {
    event.waitUntil(handleSync());
  }
});

// Placeholder hook for future remote sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'remote-placeholder-sync') {
    event.waitUntil(handleSync());
  }
});

async function handleSync() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await res.json();
    const allClients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of allClients) {
      client.postMessage({ type: 'placeholder-sync', data });
    }
  } catch (err) {
    // Fail silently for now
  }
}
