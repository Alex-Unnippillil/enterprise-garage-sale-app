"use client";

import { useMemo, useState } from "react";
import modules from "@/data/metasploit-modules.json";

interface Module {
  id: number;
  name: string;
  tags: string[];
  date: string;
  notes: string;
}

const MetasploitPage = () => {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<Module | null>(null);

  const tags = useMemo(
    () => Array.from(new Set(modules.flatMap((m) => m.tags))),
    []
  );

  const filtered = useMemo(
    () =>
      modules.filter((m) => {
        const matchesSearch = m.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesTag = !tag || m.tags.includes(tag);
        return matchesSearch && matchesTag;
      }),
    [search, tag]
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules..."
          className="flex-1 rounded border p-2"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <ul className="divide-y rounded border">
        {filtered.map((m) => (
          <li
            key={m.id}
            className="cursor-pointer p-2 hover:bg-gray-50"
            onClick={() => setSelected(m)}
          >
            <div className="font-medium">{m.name}</div>
            <div className="text-sm text-gray-500">{m.date}</div>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="rounded border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selected.name}</h2>
              <p className="text-sm text-gray-500">Date: {selected.date}</p>
              <p className="mt-2">
                <strong>Tags:</strong> {selected.tags.join(", ")}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="ml-4 rounded border px-2 py-1"
            >
              Close
            </button>
          </div>
          <p className="mt-4">{selected.notes}</p>
        </div>
      )}
    </div>
  );
};

export default MetasploitPage;
