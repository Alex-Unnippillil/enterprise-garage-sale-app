"use client";

import React, { useEffect, useState } from "react";
import TabStrip, { Tab } from "./TabStrip";
import { profiles } from "../../apps.config";

const SESSION_FILE = "tabs.json";

async function getProfileDirectory(profile: string) {
  const root = await (navigator as any).storage.getDirectory();
  const profilesDir = await root.getDirectoryHandle("profiles", { create: true });
  return profilesDir.getDirectoryHandle(profile, { create: true });
}

async function loadTabs(profile: string): Promise<Tab[]> {
  try {
    const dir = await getProfileDirectory(profile);
    const fileHandle = await dir.getFileHandle(SESSION_FILE);
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function saveTabs(profile: string, tabs: Tab[]): Promise<void> {
  const dir = await getProfileDirectory(profile);
  const handle = await dir.getFileHandle(SESSION_FILE, { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(tabs));
  await writable.close();
}

const ChromeApp: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [profile, setProfile] = useState<string>(profiles[0]?.id ?? "default");

  useEffect(() => {
    loadTabs(profile).then((restored) => {
      setTabs(restored);
      setActiveId(restored[0]?.id ?? null);
    });
  }, [profile]);

  useEffect(() => {
    saveTabs(profile, tabs);
  }, [tabs, profile]);

  const handleAdd = (tab: Tab) => {
    setTabs((prev) => [...prev, tab]);
    setActiveId(tab.id);
  };

  const handleClose = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      const index = tabs.findIndex((t) => t.id === id);
      const next = tabs[index + 1] || tabs[index - 1];
      setActiveId(next ? next.id : null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 bg-gray-100 flex items-center gap-2">
        <label htmlFor="profile">Profile:</label>
        <select
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <TabStrip
        tabs={tabs}
        activeTabId={activeId}
        onSelect={setActiveId}
        onClose={handleClose}
        onAdd={handleAdd}
      />
    </div>
  );
};

export default ChromeApp;
