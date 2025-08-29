'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { HashResults } from '@/workers/hash-worker';

export default function HashPage() {
  const workerRef = useRef<Worker | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<HashResults | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../workers/hash-worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current.onmessage = (e: MessageEvent) => {
      const data = e.data as any;
      if (data.type === 'progress') {
        setProgress(data.progress);
      } else if (data.type === 'result') {
        setResults(data.results);
        setProgress(1);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && workerRef.current) {
      setProgress(0);
      setResults(null);
      workerRef.current.postMessage({ file });
    }
  };

  const handleDownload = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hashes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">File Hash</h1>
      <input type="file" onChange={handleFile} />
      {progress > 0 && progress < 1 && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {results && (
        <div className="space-y-2">
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
          <Button onClick={handleDownload}>Download Results</Button>
        </div>
      )}
    </div>
  );
}
