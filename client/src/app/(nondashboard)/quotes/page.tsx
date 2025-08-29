"use client";

import { useEffect, useState } from "react";
import infosec from "@/data/packs/infosec.json";
import creativity from "@/data/packs/creativity.json";
import stoicism from "@/data/packs/stoicism.json";

const PACKS = {
  infosec,
  creativity,
  stoicism,
};

export type PackName = keyof typeof PACKS;

async function saveProgress(pack: PackName, remaining: number[]) {
  try {
    localStorage.setItem("quotePack", pack);
    localStorage.setItem("quoteRemaining", JSON.stringify(remaining));
    const root: any = await (navigator.storage && navigator.storage.getDirectory
      ? navigator.storage.getDirectory()
      : null);
    if (root) {
      const fileHandle = await root.getFileHandle("quote-progress.json", {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify({ pack, remaining }));
      await writable.close();
    }
  } catch (err) {
    // ignore
  }
}

async function loadProgress(): Promise<{
  pack?: PackName;
  remaining?: number[];
}> {
  let pack = (typeof localStorage !== "undefined"
    ? (localStorage.getItem("quotePack") as PackName | null)
    : null);
  let remainingStr =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("quoteRemaining")
      : null;
  let remaining = remainingStr ? (JSON.parse(remainingStr) as number[]) : undefined;
  if (!pack || !remaining) {
    try {
      const root: any = await (navigator.storage && navigator.storage.getDirectory
        ? navigator.storage.getDirectory()
        : null);
      if (root) {
        const fileHandle = await root.getFileHandle("quote-progress.json");
        const file = await fileHandle.getFile();
        const text = await file.text();
        const data = JSON.parse(text);
        pack = pack || data.pack;
        remaining = remaining || data.remaining;
      }
    } catch (err) {
      // ignore
    }
  }
  return { pack: pack ?? undefined, remaining };
}

function shuffleIndices(length: number) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuotesPage() {
  const [packName, setPackName] = useState<PackName>("infosec");
  const [remaining, setRemaining] = useState<number[]>([]);
  const [quote, setQuote] = useState<string>("");

  useEffect(() => {
    (async () => {
      const stored = await loadProgress();
      const initialPack: PackName = stored.pack && PACKS[stored.pack]
        ? stored.pack
        : "infosec";
      setPackName(initialPack);
      const quotes = PACKS[initialPack];
      let order = stored.remaining && stored.remaining.length
        ? stored.remaining
        : shuffleIndices(quotes.length);
      const [idx, ...rest] = order;
      setQuote(quotes[idx]);
      setRemaining(rest);
      void saveProgress(initialPack, rest);
    })();
  }, []);

  const nextQuote = (p: PackName = packName) => {
    const quotes = PACKS[p];
    let order = remaining;
    if (order.length === 0) {
      order = shuffleIndices(quotes.length);
    }
    const [idx, ...rest] = order;
    setQuote(quotes[idx]);
    setRemaining(rest);
    void saveProgress(p, rest);
  };

  const handlePackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPack = e.target.value as PackName;
    setPackName(newPack);
    const quotes = PACKS[newPack];
    const order = shuffleIndices(quotes.length);
    const [idx, ...rest] = order;
    setQuote(quotes[idx]);
    setRemaining(rest);
    void saveProgress(newPack, rest);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <select
        value={packName}
        onChange={handlePackChange}
        className="rounded border p-2"
      >
        {Object.keys(PACKS).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <div className="min-h-[4rem] text-center">{quote}</div>
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => nextQuote()}
      >
        Next Quote
      </button>
    </div>
  );
}
