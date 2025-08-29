'use client';

import { useRef, useState, useEffect } from 'react';

const CHARSETS: Record<string, string> = {
  Standard: ' .:-=+*#%@',
  Inverted: '@%#*+=-:. ',
  Blocks: ' ░▒▓█',
};

export default function AsciiArtPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ascii, setAscii] = useState('');
  const [charsetKey, setCharsetKey] = useState<keyof typeof CHARSETS>('Standard');
  const [sourceData, setSourceData] = useState<ImageData | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const maxWidth = 200;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setSourceData(data);
    };
    img.src = URL.createObjectURL(file);
  };

  const processFrame = (baseData?: ImageData) => {
    const src = baseData ?? sourceData;
    const canvas = canvasRef.current;
    if (!src || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
    const { width, height } = data;
    // convert to grayscale
    for (let i = 0; i < data.data.length; i += 4) {
      const gray = 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
      data.data[i] = data.data[i + 1] = data.data[i + 2] = gray;
    }
    // Floyd-Steinberg dithering
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const oldPixel = data.data[idx];
        const newPixel = oldPixel < 128 ? 0 : 255;
        const error = oldPixel - newPixel;
        data.data[idx] = data.data[idx + 1] = data.data[idx + 2] = newPixel;
        const distribute = (dx: number, dy: number, factor: number) => {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) return;
          const ni = (ny * width + nx) * 4;
          data.data[ni] += error * factor;
          data.data[ni + 1] += error * factor;
          data.data[ni + 2] += error * factor;
        };
        distribute(1, 0, 7 / 16);
        distribute(-1, 1, 3 / 16);
        distribute(0, 1, 5 / 16);
        distribute(1, 1, 1 / 16);
      }
    }
    ctx.putImageData(data, 0, 0);

    const chars = CHARSETS[charsetKey];
    const lines: string[] = [];
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const val = data.data[idx];
        const ci = Math.floor((val / 255) * (chars.length - 1));
        line += chars[ci];
      }
      lines.push(line);
    }
    setAscii(lines.join('\n'));
  };

  useEffect(() => {
    if (!sourceData) return;
    const id = requestAnimationFrame(() => {
      const start = performance.now();
      processFrame();
      const duration = performance.now() - start;
      if (duration > 16) {
        console.warn(`Frame took ${duration.toFixed(2)}ms`);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [sourceData, charsetKey]);

  const downloadText = () => {
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.png';
    a.click();
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="image/*" onChange={handleFile} />
      <select
        value={charsetKey}
        onChange={(e) => setCharsetKey(e.target.value as keyof typeof CHARSETS)}
        className="border p-1"
      >
        {Object.keys(CHARSETS).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <canvas ref={canvasRef} className="border" />
      <pre className="bg-black text-white overflow-auto text-xs p-2 max-h-64">{ascii}</pre>
      <div className="flex space-x-2">
        <button onClick={downloadText} className="border px-2 py-1">
          Export Text
        </button>
        <button onClick={downloadPng} className="border px-2 py-1">
          Export PNG
        </button>
      </div>
    </div>
  );
}
