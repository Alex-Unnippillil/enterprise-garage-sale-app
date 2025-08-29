import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

interface CommandSpec {
  cmd: string;
  args: string[];
}

// Worker thread implementation
if (!isMainThread) {
  const { cmd, args } = workerData as CommandSpec;
  switch (cmd) {
    case 'cat': {
      const filePath = args[0];
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let leftover = '';
      stream.on('data', chunk => {
        const data = leftover + chunk;
        const lines = data.split(/\n/);
        leftover = lines.pop() || '';
        for (const line of lines) {
          parentPort!.postMessage(line);
        }
      });
      stream.on('end', () => {
        if (leftover) parentPort!.postMessage(leftover);
        parentPort!.postMessage(null);
      });
      break;
    }
    case 'grep': {
      const regex = new RegExp(args[0]);
      parentPort!.on('message', (line: string | null) => {
        if (line === null) {
          parentPort!.postMessage(null);
          process.exit(0);
        } else if (regex.test(line)) {
          parentPort!.postMessage(line);
        }
      });
      break;
    }
    case 'wc': {
      let count = 0;
      parentPort!.on('message', (line: string | null) => {
        if (line === null) {
          parentPort!.postMessage(count.toString());
          process.exit(0);
        } else {
          count++;
        }
      });
      break;
    }
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

export function parsePipeline(input: string): CommandSpec[] {
  return input
    .split('|')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const tokens = part.split(/\s+/);
      return { cmd: tokens[0], args: tokens.slice(1) } as CommandSpec;
    });
}

export function runPipeline(command: string): Promise<string> {
  const specs = parsePipeline(command);
  return new Promise((resolve, reject) => {
    const workers = specs.map(spec =>
      new Worker(__filename, {
        workerData: spec,
        execArgv: ['-r', 'ts-node/register'],
      })
    );

    workers.forEach((worker, idx) => {
      worker.on('error', reject);
      if (idx < workers.length - 1) {
        worker.on('message', msg => {
          workers[idx + 1].postMessage(msg);
        });
      }
    });

    const last = workers[workers.length - 1];
    let output = '';
    last.on('message', msg => {
      if (msg !== null) output = msg;
    });
    last.on('exit', () => resolve(output));
  });
}
