import { z } from "zod";

const propertyTypeEnum = z.enum([
  "Rooms",
  "Tinyhouse",
  "Apartment",
  "Villa",
  "Townhouse",
  "Cottage",
]);

export const propertyQuerySchema = z.object({
  favoriteIds: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  beds: z.coerce.number().int().optional(),
  baths: z.coerce.number().optional(),
  propertyType: propertyTypeEnum.optional(),
  squareFeetMin: z.coerce.number().int().optional(),
  squareFeetMax: z.coerce.number().int().optional(),
  amenities: z.string().optional(),
  availableFrom: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const propertyCreateSchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  managerCognitoId: z.string(),
  name: z.string(),
  description: z.string(),
  pricePerMonth: z.coerce.number(),
  securityDeposit: z.coerce.number(),
  applicationFee: z.coerce.number(),
  amenities: z.string().optional(),
  highlights: z.string().optional(),
  isPetsAllowed: z.enum(["true", "false"]).optional(),
  isParkingIncluded: z.enum(["true", "false"]).optional(),
  beds: z.coerce.number().int(),
  baths: z.coerce.number(),
  squareFeet: z.coerce.number().int(),
  propertyType: propertyTypeEnum,
});

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
