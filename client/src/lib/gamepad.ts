export interface GamepadProfile {
  buttons: Record<number, string>;
  axes: Record<number, string>;
}

const DIR_NAME = "gamepad-profiles";

export async function saveGamepadProfile(gameId: string, profile: GamepadProfile) {
  if (typeof navigator === "undefined" || !navigator.storage?.getDirectory) return;
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle(DIR_NAME, { create: true });
  const file = await dir.getFileHandle(`${gameId}.json`, { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify(profile));
  await writable.close();
}

export async function loadGamepadProfile(gameId: string): Promise<GamepadProfile | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.getDirectory) return null;
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle(DIR_NAME, { create: true });
    const file = await dir.getFileHandle(`${gameId}.json`);
    const data = await (await file.getFile()).text();
    return JSON.parse(data) as GamepadProfile;
  } catch {
    return null;
  }
}
