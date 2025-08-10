import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  JWT_SECRET: z.string(),
  AWS_REGION: z.string(),
  S3_BUCKET_NAME: z.string(),
});

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

export const PORT = env.PORT;
export const JWT_SECRET = env.JWT_SECRET;
export const AWS_REGION = env.AWS_REGION;
export const S3_BUCKET_NAME = env.S3_BUCKET_NAME;
