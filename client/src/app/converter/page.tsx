'use client';

import { useState } from 'react';
import { humanizeBytes, humanizeDuration } from '@/apps/converter/units';

export default function ConverterPage() {
  const [bytes, setBytes] = useState('');
  const [ms, setMs] = useState('');

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Unit Converter</h1>

      <div>
        <label className="block mb-2">Bytes</label>
        <input
          className="w-full rounded border p-2"
          value={bytes}
          onChange={(e) => setBytes(e.target.value)}
          type="number"
        />
        <p className="mt-2 text-sm text-gray-600">
          {bytes && humanizeBytes(Number(bytes))}
        </p>
      </div>

      <div>
        <label className="block mb-2">Milliseconds</label>
        <input
          className="w-full rounded border p-2"
          value={ms}
          onChange={(e) => setMs(e.target.value)}
          type="number"
        />
        <p className="mt-2 text-sm text-gray-600">
          {ms && humanizeDuration(Number(ms))}
        </p>
      </div>
    </div>
  );
}
