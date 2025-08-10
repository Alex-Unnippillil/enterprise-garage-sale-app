import { z } from "zod";

const statusEnum = z.enum(["Pending", "Denied", "Approved"]);

export const applicationSchema = z.object({
  applicationDate: z.string(),
  status: statusEnum,
  propertyId: z.coerce.number().int(),
  tenantCognitoId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  message: z.string().optional(),
});

export const applicationStatusSchema = z.object({
  status: statusEnum,
});

export const applicationListQuerySchema = z.object({
  userId: z.string().optional(),
  userType: z.enum(["tenant", "manager"]).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
