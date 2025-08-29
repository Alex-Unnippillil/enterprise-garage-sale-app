'use client';

import { useEffect, useState, useMemo } from 'react';
import { Artifact } from '@/types/artifact';
import { parseArtifacts } from '@/lib/parseArtifacts';

function monthKey(timestamp: string): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ArtifactsPage() {
  const [data, setData] = useState<Artifact[]>([]);
  const [userFilter, setUserFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch('/sample-artifacts.json')
      .then(res => res.json())
      .then(json => setData(parseArtifacts(json)))
      .catch(() => setData([]));
  }, []);

  const users = useMemo(() => Array.from(new Set(data.map(a => a.user))), [data]);
  const months = useMemo(() => Array.from(new Set(data.map(a => monthKey(a.timestamp)))), [data]);

  const filtered = useMemo(
    () =>
      data.filter(
        a =>
          (userFilter === 'All' || a.user === userFilter) &&
          (monthFilter === 'All' || monthKey(a.timestamp) === monthFilter)
      ),
    [data, userFilter, monthFilter]
  );

  const pivot = useMemo(() => {
    return filtered.reduce<Record<string, { count: number; total: number }>>(
      (acc, item) => {
        const key = item.type;
        if (!acc[key]) acc[key] = { count: 0, total: 0 };
        acc[key].count += 1;
        acc[key].total += item.value;
        return acc;
      },
      {}
    );
  }, [filtered]);

  const pivotRows = useMemo(
    () => Object.entries(pivot).map(([type, { count, total }]) => ({ type, count, total })),
    [pivot]
  );

  const details = useMemo(
    () => (selectedType ? filtered.filter(a => a.type === selectedType) : []),
    [filtered, selectedType]
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Artifact Pivot</h1>

      <div className="flex gap-4">
        <label>
          User:
          <select
            className="ml-2 border p-1"
            value={userFilter}
            onChange={e => {
              setUserFilter(e.target.value);
              setSelectedType(null);
            }}
          >
            <option value="All">All</option>
            {users.map(u => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month:
          <select
            className="ml-2 border p-1"
            value={monthFilter}
            onChange={e => {
              setMonthFilter(e.target.value);
              setSelectedType(null);
            }}
          >
            <option value="All">All</option>
            {months.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">Type</th>
            <th className="border px-2 py-1 text-right">Count</th>
            <th className="border px-2 py-1 text-right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {pivotRows.map(row => (
            <tr
              key={row.type}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedType(row.type)}
            >
              <td className="border px-2 py-1">{row.type}</td>
              <td className="border px-2 py-1 text-right">{row.count}</td>
              <td className="border px-2 py-1 text-right">${row.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedType && (
        <div className="mt-4 border p-2">
          <h2 className="text-xl font-semibold mb-2">Details for {selectedType}</h2>
          {details.map(item => (
            <div key={item.id} className="border-b py-2 last:border-0">
              <div>
                <strong>Description:</strong> {item.description}
              </div>
              <div>
                <strong>User:</strong> {item.user}
              </div>
              <div>
                <strong>Time:</strong> {new Date(item.timestamp).toLocaleString()}
              </div>
              <div>
                <strong>Value:</strong> ${item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
