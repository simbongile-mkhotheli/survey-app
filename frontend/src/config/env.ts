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
  VITE_APP_NAME: z.string().min(1, 'App name is required'),
  VITE_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_PORT: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV || import.meta.env.MODE,
      VITE_PORT: import.meta.env.VITE_PORT,
    });
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    throw new Error('Invalid environment configuration. Check your .env file.');
  }
};

// Export validated environment configuration
export const env = parseEnv();

// Derived configuration based on environment
export const config = {
  // API configuration
  apiUrl: env.VITE_API_URL,
  apiTimeout: 10000, // 10 seconds
  
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

// Utility to log environment info (development only)
if (config.isDevelopment) {
  console.log('🌐 Environment Configuration:', {
    nodeEnv: env.VITE_NODE_ENV,
    apiUrl: config.apiUrl,
    appName: config.appName,
    features: config.features,
  });
}