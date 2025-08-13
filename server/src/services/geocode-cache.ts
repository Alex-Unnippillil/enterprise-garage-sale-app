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

  return [cache.longitude, cache.latitude];
};

export const saveGeocode = async (
  address: string,
  city: string,
  postalCode: string,
  longitude: number,
  latitude: number,
): Promise<void> => {
  await prisma.geocodeCache.upsert({
    where: {
      address_city_postalCode: { address, city, postalCode },
    },
    update: { longitude, latitude },
    create: { address, city, postalCode, longitude, latitude },
  });
};

export default { getCachedGeocode, saveGeocode };
