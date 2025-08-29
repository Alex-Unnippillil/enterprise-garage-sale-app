import React, { useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface FileNode {
  name: string;
  handle: FileSystemHandle;
  kind: 'file' | 'directory';
  children?: FileNode[];
}

const VsCodeEditor: React.FC = () => {
  const monaco = useMonaco();
  const [tree, setTree] = useState<FileNode[]>([]);
  const [currentFile, setCurrentFile] = useState<FileNode | null>(null);
  const [content, setContent] = useState('');

  // configure workers for TS/JS
  useEffect(() => {
    if (monaco) {
      (self as any).MonacoEnvironment = {
        getWorker(_: any, label: string) {
          if (label === 'typescript' || label === 'javascript') {
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker?worker', import.meta.url));
          }
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker?worker', import.meta.url));
        },
      };
    }
  }, [monaco]);

  const openFolder = async () => {
    const handle = await (window as any).showDirectoryPicker();
    const nodes = await readDirectory(handle);
    setTree(nodes);
  };

  const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<FileNode[]> => {
    const entries: FileNode[] = [];
    for await (const [name, handle] of (dirHandle as any).entries()) {
      if (handle.kind === 'file') {
        entries.push({ name, handle, kind: 'file' });
      } else {
        entries.push({ name, handle, kind: 'directory', children: await readDirectory(handle) });
      }
    }
    return entries;
  };

  const openFile = async (node: FileNode) => {
    if (node.kind !== 'file') return;
    const file = await (node.handle as FileSystemFileHandle).getFile();
    const text = await file.text();
    setCurrentFile(node);
    setContent(text);
  };

  // autosave
  useEffect(() => {
    if (!currentFile) return;
    const timeout = setTimeout(async () => {
      const writable = await (currentFile.handle as FileSystemFileHandle).createWritable();
      await writable.write(content);
      await writable.close();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content, currentFile]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: 250, overflow: 'auto', borderRight: '1px solid #ddd' }}>
        <button onClick={openFolder}>Open Folder</button>
        <Tree nodes={tree} onSelect={openFile} />
      </div>
      <div style={{ flex: 1 }}>
        <Editor
          value={content}
          onChange={(val) => setContent(val || '')}
          language={currentFile?.name.endsWith('.ts') ? 'typescript' : 'javascript'}
          options={{ automaticLayout: true }}
        />
      </div>
    </div>
  );
};

interface TreeProps {
  nodes: FileNode[];
  onSelect: (node: FileNode) => void;
}

const Tree: React.FC<TreeProps> = ({ nodes, onSelect }) => (
  <ul style={{ listStyle: 'none', paddingLeft: 10 }}>
    {nodes.map((node) => (
      <li key={node.name}>
        <span
          style={{ cursor: node.kind === 'file' ? 'pointer' : 'default' }}
          onClick={() => node.kind === 'file' && onSelect(node)}
        >
          {node.name}
        </span>
        {node.children && <Tree nodes={node.children} onSelect={onSelect} />}
      </li>
    ))}
  </ul>
);

export default VsCodeEditor;
