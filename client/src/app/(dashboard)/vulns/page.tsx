'use client';

import React, { useRef, useState } from 'react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { FixedSizeList as List } from 'react-window';

interface VulnRecord {
  host: string;
  vuln: string;
  cvss: number;
}

const VulnsPage = () => {
  const [rows, setRows] = useState<VulnRecord[]>([]);
  const workerRef = useRef<Worker>();

  const handleFile = async (file: File) => {
    const text = await file.text();
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../../../workers/vulnParser.ts', import.meta.url));
      workerRef.current.onmessage = (e: MessageEvent<VulnRecord[]>) => {
        setRows(e.data);
      };
    }
    workerRef.current.postMessage(text);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const exportCsv = () => {
    const header = 'Host,Vulnerability,CVSS\n';
    const csvRows = rows.map((r) => `${r.host},"${r.vuln.replace(/"/g, '""')}",${r.cvss}`);
    const blob = new Blob([header + csvRows.join('\n')], {
      type: 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vulnerabilities.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = rows[index];
    return (
      <div style={style} className="flex border-b">
        <div className="w-1/3 p-2 truncate">{item.host}</div>
        <div className="w-1/2 p-2 truncate">{item.vuln}</div>
        <div className="w-1/6 p-2">{item.cvss}</div>
      </div>
    );
  };

  return (
    <div className="dashboard-container space-y-4">
      <Header title="Vulnerability Report" subtitle="Upload a Nessus XML file" />
      <input type="file" accept=".xml" onChange={onFileChange} />
      {rows.length > 0 && (
        <>
          <Button onClick={exportCsv} className="mt-2">
            Export CSV
          </Button>
          <div className="border rounded mt-4">
            <div className="flex font-semibold border-b">
              <div className="w-1/3 p-2">Host</div>
              <div className="w-1/2 p-2">Vulnerability</div>
              <div className="w-1/6 p-2">CVSS</div>
            </div>
            <List height={500} itemCount={rows.length} itemSize={35} width={'100%'}>
              {Row}
            </List>
          </div>
        </>
      )}
    </div>
  );
};

export default VulnsPage;
