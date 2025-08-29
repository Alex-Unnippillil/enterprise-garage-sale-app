import { createSHA256, createBLAKE3, createCRC32 } from 'hash-wasm';

export interface HashResults {
  sha256: { hex: string; base64: string };
  blake3: { hex: string; base64: string };
  crc32: { hex: string; base64: string };
}

function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

self.onmessage = async (e: MessageEvent<{ file: File }>) => {
  const { file } = e.data;
  const total = file.size;

  const sha256 = await createSHA256();
  const blake3 = await createBLAKE3();
  const crc32 = await createCRC32();
  sha256.init();
  blake3.init();
  crc32.init();

  const reader = file.stream().getReader();
  let processed = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    sha256.update(value);
    blake3.update(value);
    crc32.update(value);
    processed += value.length;
    self.postMessage({ type: 'progress', progress: processed / total });
  }

  const sha256Hex = sha256.digest('hex');
  const blake3Hex = blake3.digest('hex');
  const crc32Hex = crc32.digest('hex');

  const results: HashResults = {
    sha256: { hex: sha256Hex, base64: hexToBase64(sha256Hex) },
    blake3: { hex: blake3Hex, base64: hexToBase64(blake3Hex) },
    crc32: { hex: crc32Hex, base64: hexToBase64(crc32Hex) },
  };

  self.postMessage({ type: 'result', results });
};

export {};
