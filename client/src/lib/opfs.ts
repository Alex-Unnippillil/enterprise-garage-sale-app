const TRASH_DIR = "trash";
const METADATA_FILE = "index.json";
export const DEFAULT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface TrashEntry {
  path: string;
  deletedAt: number;
}

function hasOPFS(): boolean {
  return typeof navigator !== "undefined" && !!(navigator as any).storage?.getDirectory;
}

async function getTrashDir(create = true): Promise<FileSystemDirectoryHandle | undefined> {
  if (!hasOPFS()) return undefined;
  const root = await (navigator as any).storage.getDirectory();
  try {
    return await root.getDirectoryHandle(TRASH_DIR, { create });
  } catch {
    return undefined;
  }
}

async function readMetadata(dir: FileSystemDirectoryHandle): Promise<TrashEntry[]> {
  try {
    const fileHandle = await dir.getFileHandle(METADATA_FILE, { create: true });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return text ? (JSON.parse(text) as TrashEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeMetadata(dir: FileSystemDirectoryHandle, entries: TrashEntry[]): Promise<void> {
  const fileHandle = await dir.getFileHandle(METADATA_FILE, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(entries));
  await writable.close();
}

export function isExpired(entry: TrashEntry, now: number = Date.now(), maxAgeMs: number = DEFAULT_MAX_AGE_MS): boolean {
  return now - entry.deletedAt > maxAgeMs;
}

export async function moveToTrash(path: string): Promise<void> {
  const dir = await getTrashDir(true);
  if (!dir || !hasOPFS()) return;
  const root = await (navigator as any).storage.getDirectory();
  const fileName = path.split("/").pop() as string;
  const source = await root.getFileHandle(path);
  const dest = await dir.getFileHandle(fileName, { create: true });
  const file = await source.getFile();
  const writable = await dest.createWritable();
  await writable.write(file);
  await writable.close();
  await root.removeEntry(path);
  const entries = await readMetadata(dir);
  entries.push({ path, deletedAt: Date.now() });
  await writeMetadata(dir, entries);
}

export async function listTrash(): Promise<TrashEntry[]> {
  const dir = await getTrashDir(false);
  if (!dir) return [];
  await purgeOldTrash();
  return readMetadata(dir);
}

export async function restoreFromTrash(path: string): Promise<void> {
  const dir = await getTrashDir(false);
  if (!dir || !hasOPFS()) return;
  const root = await (navigator as any).storage.getDirectory();
  const fileName = path.split("/").pop() as string;
  const source = await dir.getFileHandle(fileName);
  const dest = await root.getFileHandle(path, { create: true });
  const file = await source.getFile();
  const writable = await dest.createWritable();
  await writable.write(file);
  await writable.close();
  await dir.removeEntry(fileName);
  const entries = (await readMetadata(dir)).filter((e) => e.path !== path);
  await writeMetadata(dir, entries);
}

export async function purgeOldTrash(maxAgeMs: number = DEFAULT_MAX_AGE_MS): Promise<void> {
  const dir = await getTrashDir(false);
  if (!dir) return;
  const now = Date.now();
  const entries = await readMetadata(dir);
  const remaining: TrashEntry[] = [];
  for (const entry of entries) {
    if (isExpired(entry, now, maxAgeMs)) {
      try {
        const fileName = entry.path.split("/").pop() as string;
        await dir.removeEntry(fileName);
      } catch {
        // ignore missing files
      }
    } else {
      remaining.push(entry);
    }
  }
  await writeMetadata(dir, remaining);
}

