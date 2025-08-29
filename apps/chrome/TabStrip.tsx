"use client";

import React, { useState } from "react";

export interface Tab {
  id: string;
  title: string;
  url: string;
  sandbox?: string;
}

interface TabStripProps {
  tabs: Tab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: (tab: Tab) => void;
}

const DEFAULT_SANDBOX = "allow-scripts allow-same-origin";

const TabStrip: React.FC<TabStripProps> = ({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onAdd,
}) => {
  const [url, setUrl] = useState("");
  const [sandbox, setSandbox] = useState(DEFAULT_SANDBOX);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    const newTab: Tab = {
      id: crypto.randomUUID(),
      title: url,
      url,
      sandbox,
    };
    onAdd(newTab);
    setUrl("");
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 bg-gray-200 p-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`px-2 py-1 text-sm rounded-md whitespace-nowrap ${tab.id === activeTabId ? "bg-white" : "bg-gray-300"}`}
          >
            {tab.title}
            <span
              className="ml-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
            >
              ×
            </span>
          </button>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="border px-1 py-0.5 text-sm rounded"
          />
          <input
            type="text"
            value={sandbox}
            onChange={(e) => setSandbox(e.target.value)}
            placeholder="sandbox flags"
            className="border px-1 py-0.5 text-sm rounded"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
          >
            +
          </button>
        </form>
      </div>
      <div className="flex-1 relative">
        {tabs.map((tab) => (
          <iframe
            key={tab.id}
            src={tab.url}
            sandbox={tab.sandbox}
            style={{
              display: tab.id === activeTabId ? "block" : "none",
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TabStrip;
