export {};
/// <reference lib="webworker" />

declare const prettier: any;
declare const prettierPlugins: any;

importScripts('https://unpkg.com/prettier@2.8.8/standalone.js');
importScripts('https://unpkg.com/prettier@2.8.8/parser-babel.js');

self.onmessage = (event: MessageEvent<{ code: string }>) => {
  try {
    const formatted = prettier.format(event.data.code, {
      parser: 'babel',
      plugins: [prettierPlugins.babel],
    });
    (self as DedicatedWorkerGlobalScope).postMessage({ formatted });
  } catch (error: any) {
    (self as DedicatedWorkerGlobalScope).postMessage({ error: (error as Error).message });
  }
};
