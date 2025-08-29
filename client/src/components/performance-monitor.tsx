'use client';

import { useEffect, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

function pushData(setter: React.Dispatch<React.SetStateAction<number[]>>, value: number) {
  requestAnimationFrame(() => {
    setter((prev) => {
      const next = [...prev, value];
      if (next.length > 60) next.shift();
      return next;
    });
  });
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((value, index) => ({ index, value }))}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Metric({
  label,
  data,
  color,
  suffix,
}: {
  label: string;
  data: number[];
  color: string;
  suffix: string;
}) {
  const latest = data[data.length - 1] ?? 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span>
          {latest.toFixed(1)}
          {suffix}
        </span>
      </div>
      <Sparkline data={data} color={color} />
    </div>
  );
}

export default function PerformanceMonitor() {
  const [cpu, setCpu] = useState<number[]>([]);
  const [memory, setMemory] = useState<number[]>([]);
  const [network, setNetwork] = useState<number[]>([]);
  const longTaskDuration = useRef(0);

  useEffect(() => {
    // CPU via Long Task API
    const cpuObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longTaskDuration.current += entry.duration;
      }
    });
    try {
      cpuObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // ignore
    }

    const cpuInterval = setInterval(() => {
      const usage = Math.min(100, (longTaskDuration.current / 1000) * 100);
      longTaskDuration.current = 0;
      pushData(setCpu, usage);
    }, 1000);

    const memoryInterval = setInterval(() => {
      const perfMem = (performance as any).memory;
      if (perfMem) {
        const used = perfMem.usedJSHeapSize / 1048576;
        pushData(setMemory, used);
      }
    }, 1000);

    const worker = new Worker(new URL('../workers/network-speed.worker.ts', import.meta.url));
    worker.onmessage = (e: MessageEvent<number>) => {
      pushData(setNetwork, e.data);
    };

    return () => {
      cpuObserver.disconnect();
      clearInterval(cpuInterval);
      clearInterval(memoryInterval);
      worker.terminate();
    };
  }, []);

  return (
    <div className="space-y-4">
      <Metric label="CPU" data={cpu} color="#8884d8" suffix="%" />
      <Metric label="Memory" data={memory} color="#82ca9d" suffix=" MB" />
      <Metric label="Network" data={network} color="#ffc658" suffix=" Mbps" />
    </div>
  );
}
