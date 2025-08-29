'use client';

import { useState } from 'react';

const ScanPage = () => {
  const [scans, setScans] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addScan = () => {
    if (!input.trim()) return;
    setScans((prev) => [...prev, input.trim()]);
    setInput('');
  };

  const exportCSV = () => {
    if (scans.length === 0) return;
    const header = 'scan';
    const csv = [header, ...scans].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'scans.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetList = () => setScans([]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scan result"
          className="flex-1 rounded-md border p-2"
        />
        <button onClick={addScan} className="rounded bg-blue-500 px-4 py-2 text-white">
          Add
        </button>
      </div>

      {scans.length > 0 && (
        <div className="space-y-2">
          <ul className="list-disc pl-5">
            {scans.map((scan, idx) => (
              <li key={idx}>{scan}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="rounded bg-green-500 px-4 py-2 text-white">
              Export CSV
            </button>
            <button onClick={resetList} className="rounded bg-red-500 px-4 py-2 text-white">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
