/**
 * Environment Configuration
 * =========================
 * Centralized environment variable management for the frontend
 * Provides type-safe access to environment variables with validation
 */

import { z } from 'zod';

// Environment schema for validation
const envSchema = z.object({
  VITE_API_URL: z.string().url('Invalid API URL'),
  VITE_APP_NAME: z
    .string()
    .min(1, 'App name is required')
    .default('Survey Application'),
  VITE_NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VITE_PORT: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const isTestMode =
      import.meta.env.VITEST || import.meta.env.MODE === 'test';
    const mode = import.meta.env.MODE || 'development';
    // In test mode, allow a safe default API URL so unit tests don't fail on missing env
    const fallbackApiUrl = isTestMode ? 'http://localhost:3000' : undefined;

    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL ?? fallbackApiUrl,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_NODE_ENV: isTestMode
        ? 'test'
        : ((import.meta.env.VITE_NODE_ENV || mode) as
            | 'development'
            | 'production'
            | 'test'),
      VITE_PORT: import.meta.env.VITE_PORT,
    });
  } catch {
    throw new Error('Invalid environment configuration. Check your .env file.');
  }
};

// Export validated environment configuration
export const env = parseEnv();

// Derived configuration based on environment
export const config = {
  // API configuration
  apiUrl: env.VITE_API_URL,
  apiTimeout: 20000, // 20 seconds (temporarily increased for optimization)

  // App configuration
  appName: env.VITE_APP_NAME,
  isDevelopment: env.VITE_NODE_ENV === 'development',
  isProduction: env.VITE_NODE_ENV === 'production',
  isTest: env.VITE_NODE_ENV === 'test',

  // Feature flags based on environment
  features: {
    devTools: env.VITE_NODE_ENV === 'development',
    errorReporting: env.VITE_NODE_ENV === 'production',
    debugging: env.VITE_NODE_ENV !== 'production',
  },

  // Default ports
  defaultPort: env.VITE_PORT ? parseInt(env.VITE_PORT) : 3000,
} as const;

// Environment configuration loaded successfully
// Logging removed from production code
