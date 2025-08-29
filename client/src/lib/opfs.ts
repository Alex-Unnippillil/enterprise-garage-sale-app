export async function readOPFSFile(fileName: string): Promise<string | null> {
  if (
    typeof navigator === "undefined" ||
    !("storage" in navigator) ||
    !(navigator as any).storage.getDirectory
  ) {
    return null;
  }

  try {
    const root = await (navigator as any).storage.getDirectory();
    const handle = await root.getFileHandle(fileName);
    const file = await handle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeOPFSFile(fileName: string, contents: string): Promise<void> {
  if (
    typeof navigator === "undefined" ||
    !("storage" in navigator) ||
    !(navigator as any).storage.getDirectory
  ) {
    return;
  }

  const root = await (navigator as any).storage.getDirectory();
  const handle = await root.getFileHandle(fileName, { create: true });
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
}
