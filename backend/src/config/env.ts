// backend/src/config/env.ts
import { z } from 'zod';
import { ValidationError } from '@/errors/AppError';

/**
 * Environment configuration schema using Zod for runtime validation
 * Follows the SRP by separating configuration concerns
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('5000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('1000'), // 1000 requests per 15 min (balanced for production)

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().optional(),

  // Security - Required in production, optional in test environment
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  SECURITY_TRUST_PROXY: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  SECURITY_HTTPS_REDIRECT: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  SECURITY_SESSION_SECRET: z
    .string()
    .min(32, 'SECURITY_SESSION_SECRET must be at least 32 characters'),

  // Request Limits
  REQUEST_SIZE_LIMIT: z.string().transform(Number).default('1048576'), // 1MB

  // Caching
  REDIS_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  CACHE_TTL: z.string().transform(Number).default('300'), // 5 minutes

  // Performance Monitoring
  ENABLE_QUERY_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  SLOW_QUERY_THRESHOLD: z.string().transform(Number).default('1000'), // 1 second
});

/**
 * Validates and exports environment configuration
 * Throws ValidationError if environment is invalid
 */
export function getConfig() {
  const isTest = process.env.NODE_ENV === 'test';

  // Provide defaults for test environment only
  const envWithDefaults = isTest
    ? {
        ...process.env,
        JWT_SECRET:
          process.env.JWT_SECRET ||
          'test_jwt_secret_minimum_32_characters_for_testing_only',
        SECURITY_SESSION_SECRET:
          process.env.SECURITY_SESSION_SECRET ||
          'test_session_secret_minimum_32_characters_testing',
      }
    : process.env;

  try {
    const parsed = envSchema.parse(envWithDefaults);

    // Additional validation for production
    if (parsed.NODE_ENV === 'production') {
      if (!process.env.JWT_SECRET) {
        throw new ValidationError(
          'JWT_SECRET must be explicitly set in production',
        );
      }
      if (!process.env.SECURITY_SESSION_SECRET) {
        throw new ValidationError(
          'SECURITY_SESSION_SECRET must be explicitly set in production',
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = `Environment validation failed: ${error.errors
        .map((e) => `${e.path.join('.')} - ${e.message}`)
        .join(', ')}`;
      throw new ValidationError(message);
    }
    throw error;
  }
}

export type Config = ReturnType<typeof getConfig>;

// Export singleton instance
export const config = getConfig();
