'use client';

import { useEffect, useState } from 'react';
import { AppTile, DEFAULT_TILES } from '@/apps.config';
import { loadTiles, saveTiles } from '@/lib/tileStorage';
import { v4 as uuid } from 'uuid';

export default function TilesPage() {
  const [tiles, setTiles] = useState<AppTile[]>(DEFAULT_TILES);
  const [editing, setEditing] = useState<AppTile | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    loadTiles().then(setTiles);
  }, []);

  const startAdd = () => setEditing({ id: '', title: '', url: '', color: 'bg-gray-500' });
  const startEdit = (tile: AppTile) => setEditing(tile);

  const saveTile = async () => {
    if (!editing) return;
    let updated: AppTile[];
    if (editing.id) {
      updated = tiles.map((t) => (t.id === editing.id ? editing : t));
    } else {
      updated = [...tiles, { ...editing, id: uuid() }];
    }
    setTiles(updated);
    await saveTiles(updated);
    setEditing(null);
  };

  const removeTile = async (id: string) => {
    if (!confirm('Remove tile?')) return;
    const updated = tiles.filter((t) => t.id !== id);
    setTiles(updated);
    await saveTiles(updated);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(tiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText) as AppTile[];
      setTiles(parsed);
      saveTiles(parsed);
      setShowImport(false);
      setImportText('');
    } catch {
      alert('Invalid JSON');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button className="px-2 py-1 border rounded" onClick={startAdd}>
          Add Tile
        </button>
        <button className="px-2 py-1 border rounded" onClick={exportJson}>
          Export
        </button>
        <button className="px-2 py-1 border rounded" onClick={() => setShowImport(true)}>
          Import
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <div key={tile.id} className={`p-4 text-white rounded ${tile.color || 'bg-gray-500'}`}>
            <a href={tile.url} className="font-bold block">
              {tile.title}
            </a>
            <div className="mt-2 flex gap-2 text-sm">
              <button className="underline" onClick={() => startEdit(tile)}>
                Edit
              </button>
              <button className="underline" onClick={() => removeTile(tile.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-2 w-72">
            <input
              className="w-full border p-1"
              placeholder="Title"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
            <input
              className="w-full border p-1"
              placeholder="URL"
              value={editing.url}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
            />
            <input
              className="w-full border p-1"
              placeholder="Tailwind color"
              value={editing.color}
              onChange={(e) => setEditing({ ...editing, color: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="px-2 py-1 border rounded" onClick={saveTile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-2 w-80">
            <textarea
              className="w-full h-40 border p-1"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-2 py-1 border rounded" onClick={() => setShowImport(false)}>
                Cancel
              </button>
              <button className="px-2 py-1 border rounded" onClick={importJson}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
