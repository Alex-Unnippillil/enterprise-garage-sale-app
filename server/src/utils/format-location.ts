import { wktToGeoJSON } from '@terraformer/wkt';
import type { Point } from 'geojson';
import prisma from './prisma';

export const formatLocation = async (
  locationId: number,
): Promise<{ longitude: number; latitude: number }> => {
  const coordinates: { coordinates: string }[] =
    await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${locationId}`;

  const geoJSON = wktToGeoJSON(coordinates[0]?.coordinates || '') as Point;
  if (!geoJSON.coordinates) throw new Error('Invalid coordinates');
  const longitude = geoJSON.coordinates[0];
  const latitude = geoJSON.coordinates[1];

  return { longitude, latitude };
};
