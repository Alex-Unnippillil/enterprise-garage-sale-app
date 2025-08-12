import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int(),
  COGNITO_JWT_PUBLIC_KEY: z.string(),
  COGNITO_AUDIENCE: z.string(),
  COGNITO_ISSUER: z.string(),
  AWS_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
