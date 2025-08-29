'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { galleryData } from '@/lib/gallery-data';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

export default function GalleryPage() {
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('galleryFilters');
    if (saved) {
      const { stacks, year } = JSON.parse(saved);
      setSelectedStacks(stacks || []);
      setSelectedYear(year ?? null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'galleryFilters',
      JSON.stringify({ stacks: selectedStacks, year: selectedYear }),
    );
  }, [selectedStacks, selectedYear]);

  const stacks = useMemo(
    () => Array.from(new Set(galleryData.flatMap((g) => g.stacks))).sort(),
    [],
  );
  const years = useMemo(() => Array.from(new Set(galleryData.map((g) => g.year))).sort(), []);

  const filtered = galleryData.filter(
    (item) =>
      (selectedStacks.length === 0 || selectedStacks.every((s) => item.stacks.includes(s))) &&
      (selectedYear === null || item.year === selectedYear),
  );

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {stacks.map((stack) => (
          <label key={stack} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={selectedStacks.includes(stack)}
              onChange={() => toggleStack(stack)}
            />
            <span className="capitalize">{stack}</span>
          </label>
        ))}
        <select
          className="border p-1 rounded"
          value={selectedYear ?? ''}
          onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-12">
        {filtered.map((item) => (
          <div key={item.id} className="grid md:grid-cols-2 gap-4">
            <Image
              src={item.image}
              alt={item.title}
              width={600}
              height={400}
              className="w-full h-auto border"
            />
            <MonacoEditor
              height="400px"
              defaultLanguage="typescript"
              theme="vs-dark"
              options={{ readOnly: true }}
              value={item.code}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
