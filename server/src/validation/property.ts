import { z } from "zod";

export const propertySchema = z.object({
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  managerCognitoId: z.string(),
  propertyType: z.string(),
  pricePerMonth: z.coerce.number(),
  securityDeposit: z.coerce.number(),
  applicationFee: z.coerce.number(),
  beds: z.coerce.number(),
  baths: z.coerce.number(),
  squareFeet: z.coerce.number(),
  amenities: z.string().optional(),
  highlights: z.string().optional(),
  isPetsAllowed: z.coerce.boolean(),
  isParkingIncluded: z.coerce.boolean(),
});

