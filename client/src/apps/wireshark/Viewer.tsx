import React, { useCallback, useState } from 'react';

interface Packet {
  number: number;
  tsSec?: number;
  tsUsec?: number;
  len: number;
  data: Uint8Array;
}

const Viewer: React.FC = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selected, setSelected] = useState<Packet | null>(null);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    let parsed: Packet[] = [];
    try {
      parsed = await Promise.race([
        parseWithWiregasm(buffer),
        new Promise<Packet[]>((_, reject) => setTimeout(() => reject(new Error('wg timeout')), 1000)),
      ]);
    } catch {
      parsed = parsePcap(buffer);
    }
    setPackets(parsed);
    setSelected(parsed[0] ?? null);
  }, []);

  return (
    <div className="w-full h-full">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed p-4 text-center"
      >
        Drop a pcap file here
      </div>
      {packets.length > 0 && (
        <div className="flex mt-4">
          <ul className="w-1/3 max-h-96 overflow-y-auto border">
            {packets.map((p) => (
              <li
                key={p.number}
                className={`p-1 cursor-pointer ${selected?.number === p.number ? 'bg-blue-200' : ''}`}
                onClick={() => setSelected(p)}
              >
                #{p.number} - {p.len} bytes
              </li>
            ))}
          </ul>
          <pre className="w-2/3 max-h-96 overflow-y-auto border-l p-2 text-xs">
            {selected ? formatHex(selected.data) : 'Select a packet'}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Viewer;

function formatHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    if (i % 16 === 0) out += (i === 0 ? '' : '\n') + i.toString(16).padStart(6, '0') + '  ';
    out += bytes[i].toString(16).padStart(2, '0') + ' ';
  }
  return out;
}

function parsePcap(buffer: ArrayBuffer): Packet[] {
  const view = new DataView(buffer);
  if (view.byteLength < 24) return [];
  let offset = 24;
  const packets: Packet[] = [];
  let number = 1;
  while (offset + 16 <= view.byteLength) {
    const tsSec = view.getUint32(offset, true);
    const tsUsec = view.getUint32(offset + 4, true);
    const inclLen = view.getUint32(offset + 8, true);
    const origLen = view.getUint32(offset + 12, true);
    const data = new Uint8Array(buffer.slice(offset + 16, offset + 16 + inclLen));
    packets.push({ number, tsSec, tsUsec, len: origLen, data });
    number++;
    offset += 16 + inclLen;
  }
  return packets;
}

async function parseWithWiregasm(buffer: ArrayBuffer): Promise<Packet[]> {
  const [{ Wiregasm, vectorToArray }, load] = await Promise.all([
    import('@goodtools/wiregasm/dist/module.js'),
    import('@goodtools/wiregasm/dist/wiregasm.js').then((m) => m.default),
  ]);
  const wg = new Wiregasm();
  await wg.init(load, {
    locateFile: (path: string) => `https://unpkg.com/@goodtools/wiregasm@1.8.2/dist/${path}`,
  });
  wg.load('file.pcap', new Uint8Array(buffer));
  const framesRes = wg.frames('', 0, 0);
  const metas = vectorToArray(framesRes.frames);
  const packets: Packet[] = metas.map((meta: any) => {
    const frame = wg.frame(meta.number);
    const ds = vectorToArray(frame.data_sources)[0];
    const bytes = Uint8Array.from(atob(ds.data), (c) => c.charCodeAt(0));
    return { number: meta.number, len: bytes.length, data: bytes };
  });
  wg.destroy();
  return packets;
}

export type { Packet };
