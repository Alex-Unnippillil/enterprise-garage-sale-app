import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  GEOCODE_USER_AGENT: z
    .string()
    .min(1, "GEOCODE_USER_AGENT is required"),
});

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

export const GEOCODE_USER_AGENT = env.GEOCODE_USER_AGENT;
export default env;
