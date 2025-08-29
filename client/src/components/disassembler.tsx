import React, { useCallback, useState } from 'react';
import { disassemble, Arch } from '../lib/disassembler';

export const Disassembler: React.FC = () => {
  const [output, setOutput] = useState<string>('');
  const [duration, setDuration] = useState<number | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    // Assume x86 by default
    const { output: result, duration } = await disassemble(new Uint8Array(buffer), 'x86');
    setOutput(Array.isArray(result) ? result.join('\n') : String(result));
    setDuration(duration);
    if (duration > 100) {
      console.warn(`Disassembly took ${duration}ms`);
    }
  }, []);

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} style={{ border: '1px dashed gray', padding: '1rem' }}>
      <p>Drop binary data here</p>
      {duration !== null && <p>Duration: {duration.toFixed(2)}ms</p>}
      <pre>{output}</pre>
    </div>
  );
};

export default Disassembler;
