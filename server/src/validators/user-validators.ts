import { z } from "zod";

export const createUserSchema = z.object({
  cognitoId: z.string(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
});

export const updateUserSchema = createUserSchema.partial();

