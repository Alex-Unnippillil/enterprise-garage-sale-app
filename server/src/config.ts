import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  AWS_REGION: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
});

const env = envSchema.parse(process.env);

export default env;
