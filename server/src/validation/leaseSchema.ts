import { z } from "zod";

export const leaseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  rent: z.coerce.number(),
  deposit: z.coerce.number(),
  propertyId: z.coerce.number().int(),
  tenantCognitoId: z.string(),
});

export type LeaseInput = z.infer<typeof leaseSchema>;
