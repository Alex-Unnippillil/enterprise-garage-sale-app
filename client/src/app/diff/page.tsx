'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';

const DiffEditor = dynamic(() => import('@monaco-editor/react').then((mod) => mod.DiffEditor), {
  ssr: false,
});

interface StoredDiff {
  original: string;
  modified: string;
  originalName: string;
  modifiedName: string;
  sideBySide: boolean;
}

export default function DiffPage() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [modifiedName, setModifiedName] = useState('');
  const [sideBySide, setSideBySide] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lastDiff');
    if (saved) {
      try {
        const data: StoredDiff = JSON.parse(saved);
        setOriginal(data.original);
        setModified(data.modified);
        setOriginalName(data.originalName);
        setModifiedName(data.modifiedName);
        setSideBySide(data.sideBySide);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const data: StoredDiff = {
      original,
      modified,
      originalName,
      modifiedName,
      sideBySide,
    };
    localStorage.setItem('lastDiff', JSON.stringify(data));
  }, [original, modified, originalName, modifiedName, sideBySide]);

  const handleFile =
    (setter: (v: string) => void, nameSetter: (v: string) => void) =>
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      setter(text);
      nameSetter(file.name);
    };

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <input type="file" onChange={handleFile(setOriginal, setOriginalName)} />
        <input type="file" onChange={handleFile(setModified, setModifiedName)} />
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={() => setSideBySide((s) => !s)}
        >
          {sideBySide ? 'Inline View' : 'Side by Side'}
        </button>
      </div>
      <div className="flex-1 border">
        <DiffEditor
          height="100%"
          original={original}
          modified={modified}
          language="plaintext"
          options={{ renderSideBySide: sideBySide }}
        />
      </div>
    </div>
  );
}
