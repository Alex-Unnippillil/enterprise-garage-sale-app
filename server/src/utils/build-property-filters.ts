import { Prisma } from "@prisma/client";
import type { PropertyFilterParams } from "../../../shared/types/listing";

export const buildPropertyFilters = (
  params: PropertyFilterParams
): Prisma.PropertyWhereInput => {
  const {
    favoriteIds,
    priceMin,
    priceMax,
    beds,
    baths,
    propertyType,
    squareFeetMin,
    squareFeetMax,
    amenities,
    availableFrom,
    locationIds,
    q,
  } = params;

  const filters: Prisma.PropertyWhereInput = {};

  if (favoriteIds) {
    const ids = favoriteIds.split(",").map(Number);
    filters.id = { in: ids };
  }

  if (priceMin) {
    filters.pricePerMonth = {
      ...(filters.pricePerMonth as Prisma.FloatFilter | undefined),
      gte: Number(priceMin),
    };
  }

  if (priceMax) {
    filters.pricePerMonth = {
      ...(filters.pricePerMonth as Prisma.FloatFilter | undefined),
      lte: Number(priceMax),
    };
  }

  if (beds && beds !== "any") {
    filters.beds = { gte: Number(beds) };
  }

  if (baths && baths !== "any") {
    filters.baths = { gte: Number(baths) };
  }

  if (squareFeetMin) {
    filters.squareFeet = {
      ...(filters.squareFeet as Prisma.IntFilter | undefined),
      gte: Number(squareFeetMin),
    };
  }

  if (squareFeetMax) {
    filters.squareFeet = {
      ...(filters.squareFeet as Prisma.IntFilter | undefined),
      lte: Number(squareFeetMax),
    };
  }

  if (propertyType && propertyType !== "any") {
    const types = propertyType.split(",");
    filters.propertyType =
      types.length > 1 ? ({ in: types } as any) : (types[0] as any);
  }

  if (amenities && amenities !== "any") {
    filters.amenities = {
      hasEvery: amenities.split(",") as any,
    };
  }

  if (availableFrom && availableFrom !== "any") {
    const date = new Date(availableFrom);
    if (!isNaN(date.getTime())) {
      filters.leases = { some: { startDate: { lte: date } } };
    }
  }

  if (locationIds && locationIds.length > 0) {
    filters.locationId = { in: locationIds };
  }

  if (q && q.trim() !== "") {
    filters.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  return filters;
};

export type { PropertyFilterParams };
