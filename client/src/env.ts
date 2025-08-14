import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: z.string().min(1),
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID,
});

export type Env = z.infer<typeof envSchema>;
