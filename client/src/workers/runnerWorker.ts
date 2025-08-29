export {};
/// <reference lib="webworker" />

(self as any).console = {
  log: (...args: unknown[]) => {
    (self as DedicatedWorkerGlobalScope).postMessage({ type: 'log', message: args.map(a => String(a)).join(' ') });
  },
};

self.onmessage = (event: MessageEvent<{ code: string }>) => {
  try {
    // eslint-disable-next-line no-eval
    const result = eval(event.data.code);
    if (result !== undefined) {
      (self as DedicatedWorkerGlobalScope).postMessage({ type: 'log', message: String(result) });
    }
  } catch (error: any) {
    (self as DedicatedWorkerGlobalScope).postMessage({ type: 'error', error: (error as Error).message });
  }
};
