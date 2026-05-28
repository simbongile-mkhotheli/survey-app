import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url('Invalid API URL'),
});

const parseEnv = () => {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
    });
  } catch {
    throw new Error('Invalid environment configuration. Check your .env file.');
  }
};

export const env = parseEnv();

export const config = {
  apiUrl: env.VITE_API_URL,
  apiTimeout: 20000,
} as const;
