import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().url(),
    GEOCODE_USER_AGENT: z.string().min(1),
    COGNITO_JWT_PUBLIC_KEY: z.string().min(1).optional(),
    JWT_SECRET: z.string().min(1).optional(),
    COGNITO_AUDIENCE: z.string().min(1),
    COGNITO_ISSUER: z.string().min(1),
    AWS_REGION: z.string().min(1),
    S3_BUCKET_NAME: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    CLIENT_ORIGIN: z.string().url(),
    STRIPE_SECRET_KEY: z.string().min(1).default('sk_test_placeholder'),
  })
  .refine(
    (env) => env.COGNITO_JWT_PUBLIC_KEY || env.JWT_SECRET,
    'Either COGNITO_JWT_PUBLIC_KEY or JWT_SECRET must be provided',
  );

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

export const {
  PORT,
  DATABASE_URL,
  GEOCODE_USER_AGENT,
  COGNITO_JWT_PUBLIC_KEY,
  JWT_SECRET,
  COGNITO_AUDIENCE,
  COGNITO_ISSUER,
  AWS_REGION,
  S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  CLIENT_ORIGIN,
  STRIPE_SECRET_KEY,
} = env;

export default env;
