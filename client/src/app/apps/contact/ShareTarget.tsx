"use client";

import { useEffect, useState } from "react";

interface SharedData {
  title?: string;
  text?: string;
  files?: File[];
  url?: string;
}

export default function ShareTarget() {
  const [data, setData] = useState<SharedData>({});

  useEffect(() => {
    if (typeof window === "undefined" || !("launchQueue" in window)) {
      return;
    }

    // Handle share target launches
    (window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams) return;

      const files: File[] = [];
      if (launchParams.files && launchParams.files.length) {
        for (const fileHandle of launchParams.files) {
          const file = await fileHandle.getFile();
          files.push(file);
        }
      }

      setData({
        title: launchParams.title,
        text: launchParams.text,
        url: launchParams.url,
        files,
      });
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Shared Data</h1>
      {data.title && <p data-testid="shared-title">Title: {data.title}</p>}
      {data.text && <p data-testid="shared-text">Text: {data.text}</p>}
      {data.url && <p data-testid="shared-url">URL: {data.url}</p>}
      {data.files && data.files.length > 0 && (
        <ul data-testid="shared-files">
          {data.files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
