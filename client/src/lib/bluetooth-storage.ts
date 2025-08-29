export interface DeviceProfile {
  id: string;
  name?: string;
  services: { uuid: string; characteristics: string[] }[];
}

const ROOT_DIR = 'bluetooth-profiles';

async function getRootDir() {
  const storage: any = navigator.storage;
  if (!storage?.getDirectory) {
    throw new Error('OPFS is not supported in this browser');
  }
  return storage.getDirectory();
}

export async function saveDeviceProfile(profile: DeviceProfile) {
  const root = await getRootDir();
  const dir = await root.getDirectoryHandle(ROOT_DIR, { create: true });
  const file = await dir.getFileHandle(`${profile.id}.json`, { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify(profile));
  await writable.close();
}

export async function loadDeviceProfile(id: string): Promise<DeviceProfile | null> {
  try {
    const root = await getRootDir();
    const dir = await root.getDirectoryHandle(ROOT_DIR);
    const file = await dir.getFileHandle(`${id}.json`);
    const blob = await file.getFile();
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function removeDeviceProfile(id: string) {
  try {
    const root = await getRootDir();
    const dir = await root.getDirectoryHandle(ROOT_DIR);
    await dir.removeEntry(`${id}.json`);
  } catch {
    // ignore
  }
}

export async function listDeviceProfiles(): Promise<DeviceProfile[]> {
  const profiles: DeviceProfile[] = [];
  try {
    const root = await getRootDir();
    const dir = await root.getDirectoryHandle(ROOT_DIR);
    for await (const [name, handle] of (dir as any).entries()) {
      if (handle.kind === 'file' && name.endsWith('.json')) {
        const file = await handle.getFile();
        const text = await file.text();
        profiles.push(JSON.parse(text));
      }
    }
  } catch {
    // ignore
  }
  return profiles;
}
