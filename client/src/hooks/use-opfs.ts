import { useCallback, useEffect, useState } from "react";
import { deleteFile, getRoot, readFile, writeFile } from "../services/opfs";

export function useOPFS() {
  const [root, setRoot] = useState<FileSystemDirectoryHandle | null>(null);

  useEffect(() => {
    let mounted = true;
    if (typeof navigator === "undefined" || !navigator.storage) return;
    getRoot()
      .then((dir) => {
        if (mounted) setRoot(dir);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  const read = useCallback(
    (path: string) => {
      if (!root) throw new Error("OPFS not ready");
      return readFile(root, path);
    },
    [root]
  );

  const write = useCallback(
    (path: string, data: Blob | string) => {
      if (!root) throw new Error("OPFS not ready");
      return writeFile(root, path, data);
    },
    [root]
  );

  const remove = useCallback(
    (path: string) => {
      if (!root) throw new Error("OPFS not ready");
      return deleteFile(root, path);
    },
    [root]
  );

  return { root, read, write, remove };
}
