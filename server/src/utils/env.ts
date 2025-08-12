import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive(),
  GEOCODE_USER_AGENT: z.string().min(1),
  COGNITO_JWT_PUBLIC_KEY: z.string().min(1),
  COGNITO_AUDIENCE: z.string().min(1),
  COGNITO_ISSUER: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  S3_REGION: z.string().min(1),
});

const env = envSchema.parse(process.env);

export default env;
