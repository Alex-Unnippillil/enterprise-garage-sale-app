import {
  PrismaClient,
  Prisma,
  Amenity,
  PropertyType,
} from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export interface PropertyFilters {
  favoriteIds?: number[];
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  baths?: number;
  propertyType?: PropertyType;
  squareFeetMin?: number;
  squareFeetMax?: number;
  amenities?: Amenity[];
  availableFrom?: Date;
  locationIds?: number[];
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export const parsePropertyQuery = async (
  query: any
): Promise<{ filters: PropertyFilters; pagination: Pagination }> => {
  const filters: PropertyFilters = {};
  const pagination: Pagination = { page: 1, pageSize: 10 };

  if (typeof query.favoriteIds === "string") {
    const ids = query.favoriteIds
      .split(",")
      .map((id: string) => parseInt(id, 10))
      .filter((id: number) => !isNaN(id));
    if (ids.length) filters.favoriteIds = ids;
  }

  const priceMin = parseFloat(query.priceMin);
  if (!isNaN(priceMin)) filters.priceMin = priceMin;

  const priceMax = parseFloat(query.priceMax);
  if (!isNaN(priceMax)) filters.priceMax = priceMax;

  const beds = parseInt(query.beds, 10);
  if (!isNaN(beds)) filters.beds = beds;

  const baths = parseInt(query.baths, 10);
  if (!isNaN(baths)) filters.baths = baths;

  const squareFeetMin = parseInt(query.squareFeetMin, 10);
  if (!isNaN(squareFeetMin)) filters.squareFeetMin = squareFeetMin;

  const squareFeetMax = parseInt(query.squareFeetMax, 10);
  if (!isNaN(squareFeetMax)) filters.squareFeetMax = squareFeetMax;

  if (
    typeof query.propertyType === "string" &&
    Object.values(PropertyType).includes(query.propertyType as PropertyType)
  ) {
    filters.propertyType = query.propertyType as PropertyType;
  }

  if (typeof query.amenities === "string" && query.amenities !== "any") {
    const amenitiesArray = query.amenities.split(",");
    filters.amenities = amenitiesArray.filter((a: string) =>
      Object.values(Amenity).includes(a as Amenity)
    ) as Amenity[];
  }

  if (typeof query.availableFrom === "string" && query.availableFrom !== "any") {
    const date = new Date(query.availableFrom);
    if (!isNaN(date.getTime())) {
      filters.availableFrom = date;
    }
  }

  if (typeof query.latitude === "string" && typeof query.longitude === "string") {
    const lat = parseFloat(query.latitude);
    const lng = parseFloat(query.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const locationIds = await getLocationIdsWithinRadius(lat, lng, 1000);
      if (locationIds.length) {
        filters.locationIds = locationIds;
      }
    }
  }

  const page = parseInt(query.page, 10);
  if (!isNaN(page) && page > 0) pagination.page = page;

  const pageSize = parseInt(query.pageSize, 10);
  if (!isNaN(pageSize) && pageSize > 0 && pageSize <= 100) pagination.pageSize = pageSize;

  return { filters, pagination };
};

export const listProperties = async (
  filters: PropertyFilters,
  pagination: Pagination
) => {
  const where: Prisma.PropertyWhereInput = {};

  if (filters.favoriteIds?.length) {
    where.id = { in: filters.favoriteIds };
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.pricePerMonth = {};
    if (filters.priceMin !== undefined) {
      (where.pricePerMonth as Prisma.IntFilter).gte = filters.priceMin;
    }
    if (filters.priceMax !== undefined) {
      (where.pricePerMonth as Prisma.IntFilter).lte = filters.priceMax;
    }
  }

  if (filters.beds !== undefined) {
    where.beds = { gte: filters.beds };
  }

  if (filters.baths !== undefined) {
    where.baths = { gte: filters.baths };
  }

  if (filters.squareFeetMin !== undefined || filters.squareFeetMax !== undefined) {
    where.squareFeet = {};
    if (filters.squareFeetMin !== undefined) {
      (where.squareFeet as Prisma.IntFilter).gte = filters.squareFeetMin;
    }
    if (filters.squareFeetMax !== undefined) {
      (where.squareFeet as Prisma.IntFilter).lte = filters.squareFeetMax;
    }
  }

  if (filters.propertyType) {
    where.propertyType = filters.propertyType as any;
  }

  if (filters.amenities?.length) {
    where.amenities = { hasEvery: filters.amenities };
  }

  if (filters.availableFrom) {
    where.leases = {
      some: {
        startDate: {
          lte: filters.availableFrom,
        },
      },
    };
  }

  if (filters.locationIds?.length) {
    where.locationId = { in: filters.locationIds };
  }

  return prisma.property.findMany({
    where,
    include: {
      location: true,
    },
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
};

export const getLocationIdsWithinRadius = async (
  lat: number,
  lng: number,
  radiusInKilometers: number
): Promise<number[]> => {
  const degrees = radiusInKilometers / 111;
  const locations = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM "Location"
    WHERE ST_DWithin(
      coordinates::geometry,
      ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
      ${degrees}
    )
  `;
  return locations.map((l) => l.id);
};

export const getPropertyById = async (id: number) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      location: true,
    },
  });

  if (!property) return null;

  const coordinates: { coordinates: string }[] = await prisma.$queryRaw`
    SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}
  `;

  const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
  const longitude = geoJSON.coordinates[0];
  const latitude = geoJSON.coordinates[1];

  return {
    ...property,
    location: {
      ...property.location,
      coordinates: {
        longitude,
        latitude,
      },
    },
  };
};
