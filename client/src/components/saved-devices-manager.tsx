'use client';

import { useEffect, useState } from 'react';
import { DeviceProfile, listDeviceProfiles, removeDeviceProfile } from '../lib/bluetooth-storage';

export default function SavedDevicesManager() {
  const [devices, setDevices] = useState<DeviceProfile[]>([]);

  const refresh = async () => {
    const list = await listDeviceProfiles();
    setDevices(list);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRemove = async (id: string) => {
    await removeDeviceProfile(id);
    await refresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Saved Devices</h2>
      {devices.length === 0 && <p>No saved devices.</p>}
      <ul className="space-y-2">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center justify-between rounded border p-2">
            <span>{d.name || d.id}</span>
            <button
              onClick={() => handleRemove(d.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
