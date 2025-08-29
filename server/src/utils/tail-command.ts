import { spawn } from 'child_process';

interface TailOptions {
  file: string;
  pip: boolean;
}

function parseArgs(): TailOptions {
  const args = process.argv.slice(2);
  const pip = args.includes('--pip');
  const file = args.find((arg) => !arg.startsWith('-'));
  if (!file) {
    console.error('Usage: tail <file> [--pip]');
    process.exit(1);
  }
  return { file, pip };
}

async function runTail({ file, pip }: TailOptions) {
  const tail = spawn('tail', ['-f', file]);

  const cleanup = () => {
    tail.kill();
  };

  process.on('SIGINT', () => {
    cleanup();
    process.exit();
  });

  if (pip && typeof (globalThis as any).document !== 'undefined' &&
      (globalThis as any).documentPictureInPicture) {
    try {
      const pipWindow = await (globalThis as any).documentPictureInPicture.requestWindow({
        width: 400,
        height: 300,
      });
      const pre = pipWindow.document.createElement('pre');
      pre.style.margin = '0';
      pre.style.whiteSpace = 'pre-wrap';
      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.appendChild(pre);

      tail.stdout.on('data', (data) => {
        pre.textContent += data.toString();
        pre.scrollTop = pre.scrollHeight;
      });

      tail.stderr.on('data', (data) => {
        pre.textContent += data.toString();
        pre.scrollTop = pre.scrollHeight;
      });

      pipWindow.addEventListener('pagehide', () => {
        cleanup();
        process.exit();
      });
      return;
    } catch (err) {
      // Fallback to stdout if PiP fails
    }
  }

  tail.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  tail.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  tail.on('close', () => {
    process.exit();
  });
}

runTail(parseArgs());

