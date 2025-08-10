import { z } from "zod";

export const listingSchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.number(),
});

