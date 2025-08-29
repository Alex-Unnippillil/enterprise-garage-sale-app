/// <reference lib="webworker" />

const SPEED_TEST_URL = 'https://speed.cloudflare.com/__down?bytes=1000000'; // 1MB

async function measureOnce() {
  const start = performance.now();
  try {
    const response = await fetch(SPEED_TEST_URL, { cache: 'no-store' });
    const blob = await response.blob();
    const duration = performance.now() - start; // ms
    const bits = blob.size * 8;
    const mbps = bits / duration / 1000; // Mbps
    (self as DedicatedWorkerGlobalScope).postMessage(mbps);
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage(0);
  }
}

// Start periodic tests when worker is instantiated
setInterval(() => {
  measureOnce();
}, 1000);

export default null as any;
