import { z } from 'zod';

export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.string().url(),
  })
  .parse(process.env);
