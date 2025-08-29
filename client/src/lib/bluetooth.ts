import { DeviceProfile, loadDeviceProfile, saveDeviceProfile } from './bluetooth-storage';

export interface ConnectedDevice {
  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  profile: DeviceProfile;
}

export async function connectToDevice(): Promise<ConnectedDevice> {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
  });
  const server = await device.gatt!.connect();

  let profile = await loadDeviceProfile(device.id);
  if (!profile) {
    const services = await server.getPrimaryServices();
    const profileServices = [] as DeviceProfile['services'];
    for (const service of services) {
      const chars = await service.getCharacteristics();
      profileServices.push({
        uuid: service.uuid,
        characteristics: chars.map((c) => c.uuid),
      });
    }
    profile = { id: device.id, name: device.name || undefined, services: profileServices };
    await saveDeviceProfile(profile);
  } else {
    // Skip rediscovery by directly accessing known services/characteristics
    for (const svc of profile.services) {
      const service = await server.getPrimaryService(svc.uuid);
      for (const charUUID of svc.characteristics) {
        await service.getCharacteristic(charUUID);
      }
    }
  }

  return { device, server, profile };
}
