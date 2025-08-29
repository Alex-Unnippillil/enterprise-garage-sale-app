"use client";

import { useEffect, useState } from "react";
import { listTrash, restoreFromTrash, TrashEntry, purgeOldTrash } from "@/lib/opfs";

export default function TrashPage() {
  const [items, setItems] = useState<TrashEntry[]>([]);

  useEffect(() => {
    async function load() {
      await purgeOldTrash();
      const entries = await listTrash();
      setItems(entries);
    }
    load();
  }, []);

  async function handleRestore(path: string) {
    await restoreFromTrash(path);
    setItems(await listTrash());
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Trash</h1>
      {items.length === 0 ? (
        <p>No items in trash.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.path} className="mb-2 flex justify-between">
              <span>{item.path}</span>
              <button
                onClick={() => handleRestore(item.path)}
                className="text-blue-600 underline"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
