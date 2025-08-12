import { wktToGeoJSON } from "@terraformer/wkt";
import prisma from "./prisma";

interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

export const formatLocation = async (
  locationId: number
): Promise<{ longitude: number; latitude: number }> => {
  const coordinates: { coordinates: string }[] =
    await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${locationId}`;

  const geoJSON = wktToGeoJSON(
    coordinates[0]?.coordinates || ""
  ) as PointGeometry;
  const [longitude, latitude] = geoJSON.coordinates;

  return { longitude, latitude };
};
