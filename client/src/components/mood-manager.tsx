"use client";

import { useEffect, useState } from "react";
import { loadMoods, saveMoods, reorder } from "@/lib/moods";

const MoodManager = () => {
  const [moods, setMoods] = useState<string[]>([]);
  const [newMood, setNewMood] = useState("");

  useEffect(() => {
    loadMoods().then(setMoods);
  }, []);

  const addMood = async () => {
    const trimmed = newMood.trim();
    if (!trimmed) return;
    const updated = [...moods, trimmed];
    setMoods(updated);
    setNewMood("");
    await saveMoods(updated);
  };

  const moveMood = async (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= moods.length) return;
    const updated = reorder(moods, index, target);
    setMoods(updated);
    await saveMoods(updated);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {moods.map((mood, idx) => (
          <li key={mood} className="flex items-center space-x-2">
            <span className="flex-1">{mood}</span>
            <button
              type="button"
              aria-label="move up"
              onClick={() => moveMood(idx, -1)}
              className="px-2 border rounded"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="move down"
              onClick={() => moveMood(idx, 1)}
              className="px-2 border rounded"
            >
              ↓
            </button>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          value={newMood}
          onChange={(e) => setNewMood(e.target.value)}
          placeholder="Add mood"
          className="flex-1 border p-2 rounded"
        />
        <button type="button" onClick={addMood} className="px-4 py-2 border rounded">
          Add
        </button>
      </div>
    </div>
  );
};

export default MoodManager;
