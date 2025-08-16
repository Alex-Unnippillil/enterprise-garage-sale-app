import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
});

export const env = schema.parse(process.env);
export const API_URL = env.NEXT_PUBLIC_API_URL;
