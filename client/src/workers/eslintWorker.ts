export {};
/// <reference lib="webworker" />

declare const eslint: any;

importScripts('https://unpkg.com/eslint4b@7.32.0/dist/eslint4b.js');

const linter = new eslint.Linter();

self.onmessage = (event: MessageEvent<{ code: string }>) => {
  try {
    const messages = linter.verify(event.data.code, { rules: { semi: 2 } });
    (self as DedicatedWorkerGlobalScope).postMessage({ messages });
  } catch (error: any) {
    (self as DedicatedWorkerGlobalScope).postMessage({ error: (error as Error).message });
  }
};
