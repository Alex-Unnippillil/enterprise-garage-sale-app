import prisma from "../utils/prisma";

export const getCachedGeocode = async (
  address: string,
  city: string,
  postalCode: string,
): Promise<[number, number] | null> => {
  const cached = await prisma.geocodeCache.findUnique({
    where: { address_city_postalCode: { address, city, postalCode } },
  });

  if (!cached) {
    return null;
  }

  return [cached.longitude, cached.latitude];
};

export const saveGeocodeToCache = async (
  address: string,
  city: string,
  postalCode: string,
  longitude: number,
  latitude: number,
): Promise<void> => {
  await prisma.geocodeCache.upsert({
    where: { address_city_postalCode: { address, city, postalCode } },
    update: { latitude, longitude },
    create: { address, city, postalCode, latitude, longitude },
  });
};

export default {
  getCachedGeocode,
  saveGeocodeToCache,
};
