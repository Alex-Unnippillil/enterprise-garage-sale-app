export type Arch = 'x86' | 'arm';

function hasGhidra(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).Ghidra);
}

async function loadCapstone(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).capstone) return (window as any).capstone;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/capstone-wasm@latest/dist/capstone.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Capstone.js'));
    document.head.appendChild(script);
  });
  return (window as any).capstone;
}

export async function disassemble(bytes: Uint8Array, arch: Arch) {
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    if (hasGhidra()) {
      const ghidra = (window as any).Ghidra;
      const result = ghidra.disassemble(bytes, arch);
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return { output: result, duration: end - start };
    }
  } catch (err) {
    console.warn('GHIDRA disassembly failed, falling back to Capstone.js', err);
  }

  const capstone = await loadCapstone();
  const result = capstone ? capstone.disasm(bytes, 0, arch) : [];
  const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return { output: result, duration: end - start };
}
