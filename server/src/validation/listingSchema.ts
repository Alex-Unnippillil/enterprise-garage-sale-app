import { z } from "zod";

export const listingSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.coerce.number().positive(),
});

export type ListingInput = z.infer<typeof listingSchema>;
