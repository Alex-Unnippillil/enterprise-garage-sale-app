"use client";
import { useEffect, useState } from "react";
import {
  listTasks,
  addTask,
  updateTask,
  deleteTask,
  Task,
} from "@/lib/opfs-tasks";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    listTasks().then(setTasks);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!text && !file) return;
    const task = await addTask({ text, file });
    setTasks((prev) => [...prev, task]);
    setText("");
    setFile(undefined);
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleUpdate(id: string, newText: string) {
    await updateTask(id, { text: newText });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  }

  return (
    <main className="p-4">
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New task"
          className="border p-1 flex-1"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <button type="submit" className="bg-blue-500 text-white px-2">
          Add
        </button>
      </form>
      <ul>
        {tasks.map((t) => (
          <li key={t.id} className="mb-2">
            <input
              value={t.text}
              onChange={(e) => handleUpdate(t.id, e.target.value)}
              className="border p-1 mr-2"
            />
            <button
              onClick={() => handleDelete(t.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
