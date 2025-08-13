import prisma from '../utils/prisma';

export const getCachedGeocode = async (
  address: string,
  city: string,
  postalCode: string,
): Promise<[number, number] | null> => {
  const cache = await prisma.geocodeCache.findUnique({
    where: {
      address_city_postalCode: { address, city, postalCode },
    },
  });

  if (!cache) {
    return null;
  }

  return [cache.latitude, cache.longitude];
};

export const saveGeocode = async (
  address: string,
  city: string,
  postalCode: string,
  latitude: number,
  longitude: number,
): Promise<void> => {
  await prisma.geocodeCache.upsert({
    where: {
      address_city_postalCode: { address, city, postalCode },
    },
    update: { latitude, longitude },
    create: { address, city, postalCode, latitude, longitude },
  });
};

export default { getCachedGeocode, saveGeocode };
