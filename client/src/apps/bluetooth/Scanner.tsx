import { useState } from 'react';

interface CharacteristicInfo {
  uuid: string;
  value?: DataView;
}

interface ServiceInfo {
  uuid: string;
  characteristics: CharacteristicInfo[];
}

const Scanner = () => {
  const [supported] = useState(
    typeof navigator !== 'undefined' && !!navigator.bluetooth
  );
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string>>({});

  const requestDevice = async () => {
    setError(null);
    if (!supported) {
      setError('Web Bluetooth API not supported in this browser.');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'],
      });
      setDevice(device);

      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server.');
      }

      const primaryServices = await server.getPrimaryServices();
      const serviceInfos: ServiceInfo[] = [];

      for (const service of primaryServices) {
        const characteristics = await service.getCharacteristics();
        const charInfos: CharacteristicInfo[] = [];

        for (const characteristic of characteristics) {
          try {
            const value = await characteristic.readValue();
            charInfos.push({ uuid: characteristic.uuid, value });
          } catch {
            charInfos.push({ uuid: characteristic.uuid });
          }
        }

        serviceInfos.push({ uuid: service.uuid, characteristics: charInfos });
      }

      setServices(serviceInfos);

      // Battery information
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const value = await batteryChar.readValue();
        setBatteryLevel(value.getUint8(0));
      } catch (err) {
        console.warn('Battery service not available', err);
      }

      // Device information
      try {
        const infoService = await server.getPrimaryService('device_information');
        const characteristics = await infoService.getCharacteristics();
        const info: Record<string, string> = {};
        const decoder = new TextDecoder('utf-8');
        for (const c of characteristics) {
          try {
            const val = await c.readValue();
            info[c.uuid] = decoder.decode(val);
          } catch {
            // ignore read errors
          }
        }
        setDeviceInfo(info);
      } catch (err) {
        console.warn('Device information service not available', err);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div>
      {!supported && (
        <p>Your browser does not support the Web Bluetooth API.</p>
      )}
      {supported && (
        <button type="button" onClick={requestDevice}>
          Scan for Devices
        </button>
      )}
      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {device && (
        <div>
          <h2>Device: {device.name || device.id}</h2>
          {batteryLevel !== null && <p>Battery Level: {batteryLevel}%</p>}

          {Object.keys(deviceInfo).length > 0 && (
            <div>
              <h3>Device Information</h3>
              <ul>
                {Object.entries(deviceInfo).map(([uuid, value]) => (
                  <li key={uuid}>
                    {uuid}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3>Services</h3>
            <ul>
              {services.map((s) => (
                <li key={s.uuid}>
                  {s.uuid}
                  <ul>
                    {s.characteristics.map((c) => (
                      <li key={c.uuid}>{c.uuid}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;

