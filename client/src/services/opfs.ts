/*
 * Basic file operations using the Origin Private File System (OPFS).
 */

// getDirectory is not yet in TypeScript lib definitions
// so we cast to any to access it at runtime.
export async function getRoot(): Promise<FileSystemDirectoryHandle> {
  return await (navigator.storage as any).getDirectory();
}

async function getFileHandle(
  root: FileSystemDirectoryHandle,
  path: string,
  create = false
): Promise<FileSystemFileHandle> {
  const parts = path.split("/").filter(Boolean);
  let dir = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i], { create });
  }
  const fileName = parts[parts.length - 1];
  return await dir.getFileHandle(fileName, { create });
}

export async function readFile(
  root: FileSystemDirectoryHandle,
  path: string
): Promise<string> {
  const handle = await getFileHandle(root, path);
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFile(
  root: FileSystemDirectoryHandle,
  path: string,
  data: Blob | string
): Promise<void> {
  const handle = await getFileHandle(root, path, true);
  const writable = await handle.createWritable();
  await writable.write(data);
  await writable.close();
}

export async function deleteFile(
  root: FileSystemDirectoryHandle,
  path: string
): Promise<void> {
  const parts = path.split("/").filter(Boolean);
  let dir = root;
  for (let i = 0; i < parts.length - 1; i++) {
    dir = await dir.getDirectoryHandle(parts[i]);
  }
  await dir.removeEntry(parts[parts.length - 1]);
}
