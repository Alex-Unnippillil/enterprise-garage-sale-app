import { runPipeline } from './process.ts';
import * as fs from 'fs';
import assert from 'assert';

async function testPipeline() {
  const file = 'sample.txt';
  const lines = Array.from({ length: 10000 }, (_, i) => `line ${i}`).join('\n');
  fs.writeFileSync(file, lines);
  const pattern = '999';
  const expected = lines.split('\n').filter(l => l.includes(pattern)).length;
  const output = await runPipeline(`cat ${file} | grep ${pattern} | wc`);
  assert.strictEqual(output.trim(), expected.toString());
  fs.unlinkSync(file);
}

async function testLargeFileResponsive() {
  const file = 'large.txt';
  const lines = Array.from({ length: 50000 }, (_, i) => `data ${i}`).join('\n');
  fs.writeFileSync(file, lines);
  let responsive = false;
  const pipeline = runPipeline(`cat ${file} | grep data | wc`);
  setTimeout(() => { responsive = true; }, 0);
  const output = await pipeline;
  assert(responsive, 'Main thread was blocked');
  assert.strictEqual(output.trim(), '50000');
  fs.unlinkSync(file);
}

(async () => {
  await testPipeline();
  await testLargeFileResponsive();
  console.log('All tests passed');
})();
