'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface SampleEvent {
  id: number;
  timestamp: string;
  description: string;
}

const sampleEvents: SampleEvent[] = [
  {
    id: 1,
    timestamp: '2023-06-01T12:00:00Z',
    description: 'Process procdump.exe accessed lsass.exe memory',
  },
  {
    id: 2,
    timestamp: '2023-06-01T12:00:05Z',
    description: 'Dump file written to C:\\temp\\lsass.dmp',
  },
  {
    id: 3,
    timestamp: '2023-06-01T12:00:10Z',
    description: 'Tool mimikatz.exe extracted credentials from dump',
  },
];

export default function CredentialAccessPage() {
  const [logLines, setLogLines] = useState<string[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split(/\r?\n/);
      setLogLines(lines);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Credential Access</h1>
      <Image src="/lsass-diagram.svg" alt="LSASS credential flow" width={300} height={150} />
      <Tabs defaultValue="attacker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attacker">Attacker</TabsTrigger>
          <TabsTrigger value="defender">Defender</TabsTrigger>
        </TabsList>
        <TabsContent value="attacker" className="space-y-2">
          <p>
            Attackers target the LSASS process to dump credentials and move laterally within a
            network.
          </p>
          <ul className="list-disc pl-6">
            {sampleEvents.map((event) => (
              <li key={event.id}>
                <span className="font-mono">[{event.timestamp}]</span> {event.description}
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="defender" className="space-y-2">
          <p>Defenders monitor access to LSASS and alert on suspicious tools or memory dumps.</p>
          <p>Import logs to highlight potential credential access events.</p>
          <input type="file" accept=".log,.txt" onChange={handleFile} />
          {logLines.length > 0 && (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-sm">
              {logLines.map((line, idx) => {
                const highlight = /lsass|credential/i.test(line);
                return (
                  <div key={idx} className={highlight ? 'bg-yellow-200' : undefined}>
                    {line}
                  </div>
                );
              })}
            </pre>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
