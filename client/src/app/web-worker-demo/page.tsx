'use client';

import { useEffect, useRef, useState } from 'react';

export default function WebWorkerDemo() {
  const [code, setCode] = useState(
    "function hello(name) {\n  console.log('Hello, ' + name);\n}\nhello('sandbox');"
  );
  const [logs, setLogs] = useState<string[]>([]);

  const prettierWorker = useRef<Worker>();
  const eslintWorker = useRef<Worker>();
  const runnerWorker = useRef<Worker>();

  useEffect(() => {
    prettierWorker.current = new Worker(new URL('../../workers/prettierWorker.ts', import.meta.url));
    eslintWorker.current = new Worker(new URL('../../workers/eslintWorker.ts', import.meta.url));
    runnerWorker.current = new Worker(new URL('../../workers/runnerWorker.ts', import.meta.url));

    prettierWorker.current.onmessage = (e) => {
      if (e.data.formatted) setCode(e.data.formatted);
      if (e.data.error) setLogs((l) => [...l, `prettier: ${e.data.error}`]);
    };

    eslintWorker.current.onmessage = (e) => {
      if (e.data.messages) {
        setLogs((l) => [
          ...l,
          ...e.data.messages.map((m: any) => `eslint: ${m.message}`),
        ]);
      }
      if (e.data.error) setLogs((l) => [...l, `eslint: ${e.data.error}`]);
    };

    runnerWorker.current.onmessage = (e) => {
      if (e.data.type === 'log') setLogs((l) => [...l, e.data.message]);
      if (e.data.type === 'error') setLogs((l) => [...l, `error: ${e.data.error}`]);
    };

    return () => {
      prettierWorker.current?.terminate();
      eslintWorker.current?.terminate();
      runnerWorker.current?.terminate();
    };
  }, []);

  const runPrettier = () => prettierWorker.current?.postMessage({ code });
  const runESLint = () => {
    setLogs([]);
    eslintWorker.current?.postMessage({ code });
  };
  const runCode = () => {
    setLogs([]);
    runnerWorker.current?.postMessage({ code });
  };

  return (
    <div className="p-4 space-y-2">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-48 border p-2 font-mono"
      />
      <div className="space-x-2">
        <button className="px-2 py-1 bg-blue-500 text-white" onClick={runPrettier}>
          Prettier
        </button>
        <button className="px-2 py-1 bg-green-600 text-white" onClick={runESLint}>
          ESLint
        </button>
        <button className="px-2 py-1 bg-purple-600 text-white" onClick={runCode}>
          Run
        </button>
      </div>
      <div className="bg-gray-100 h-32 overflow-auto p-2 font-mono">
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
