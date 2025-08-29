import { readOPFSFile, writeOPFSFile } from "./opfs";

export type Mood = string;

const MOODS_FILE = "moods.json";
export const DEFAULT_MOODS: Mood[] = ["Happy", "Relaxed", "Focused"];

export async function loadMoods(): Promise<Mood[]> {
  const text = await readOPFSFile(MOODS_FILE);
  if (text) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed as Mood[];
      }
    } catch {
      // ignore parse errors
    }
  }
  return DEFAULT_MOODS;
}

export async function saveMoods(moods: Mood[]): Promise<void> {
  await writeOPFSFile(MOODS_FILE, JSON.stringify(moods));
}

export function reorder<T>(items: T[], from: number, to: number): T[] {
  const arr = [...items];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}
