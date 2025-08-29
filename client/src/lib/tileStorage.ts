import { AppTile, DEFAULT_TILES } from '@/apps.config';

const FILE_NAME = 'tiles.json';

async function getFileHandle() {
  const root = await navigator.storage.getDirectory();
  return root.getFileHandle(FILE_NAME, { create: true });
}

export async function loadTiles(): Promise<AppTile[]> {
  try {
    const handle = await getFileHandle();
    const file = await handle.getFile();
    if (file.size === 0) {
      return DEFAULT_TILES;
    }
    const text = await file.text();
    return JSON.parse(text) as AppTile[];
  } catch {
    return DEFAULT_TILES;
  }
}

export async function saveTiles(tiles: AppTile[]): Promise<void> {
  const handle = await getFileHandle();
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(tiles));
  await writable.close();
}
