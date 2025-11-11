// backend/src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '@/config/env';
import { logger } from '@/config/logger';

/**
 * Redis-based rate limiter for production
 * Falls back to in-memory if Redis is unavailable
 */

let redisClient: Redis | null = null;
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

// Initialize Redis client if enabled
async function initializeRedis() {
  if (!config.REDIS_ENABLED) {
    logger.info('Redis disabled, using in-memory rate limiting');
    return;
  }

  try {
    redisClient = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error(
            'Redis connection failed after 3 retries, using in-memory fallback',
          );
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
      redisClient = null; // Fallback to in-memory
    });

    await redisClient.connect();
    logger.info('✅ Redis connected for rate limiting');
  } catch (error) {
    logger.error(
      'Failed to connect to Redis, using in-memory fallback:',
      error,
    );
    redisClient = null;
  }
}

// Initialize on module load
initializeRedis();

/**
 * Redis-based rate limiting
 */
async function rateLimitWithRedis(
  ip: string,
  windowMs: number,
  maxRequests: number,
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  const key = `ratelimit:${ip}`;
  const now = Date.now();

  try {
    // Get current count
    const count = await redisClient!.get(key);
    const currentCount = count ? parseInt(count, 10) : 0;

    if (currentCount >= maxRequests) {
      const ttl = await redisClient!.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + ttl * 1000,
      };
    }

    // Increment and set expiry
    const newCount = currentCount + 1;
    if (currentCount === 0) {
      await redisClient!.setex(
        key,
        Math.ceil(windowMs / 1000),
        newCount.toString(),
      );
    } else {
      await redisClient!.set(key, newCount.toString(), 'KEEPTTL');
    }

    const ttl = await redisClient!.ttl(key);
    return {
      allowed: true,
      remaining: maxRequests - newCount,
      resetTime: now + ttl * 1000,
    };
  } catch (error) {
    logger.error('Redis rate limit error:', error);
    // Fallback to in-memory
    return rateLimitInMemory(ip, windowMs, maxRequests);
  }
}

/**
 * In-memory rate limiting (fallback)
 */
function rateLimitInMemory(
  ip: string,
  windowMs: number,
  maxRequests: number,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = inMemoryStore.get(ip);

  if (!record || now > record.resetTime) {
    inMemoryStore.set(ip, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limiting middleware
 */
export async function rateLimitByIP(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const windowMs = config.RATE_LIMIT_WINDOW_MS;
  const maxRequests = config.RATE_LIMIT_MAX_REQUESTS;

  // Use Redis if available, otherwise in-memory
  const result = redisClient
    ? await rateLimitWithRedis(ip, windowMs, maxRequests)
    : rateLimitInMemory(ip, windowMs, maxRequests);

  // Set rate limit headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  });

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.set('Retry-After', retryAfter.toString());

    res.status(429).json({
      error: {
        message: 'Too many requests from this IP',
        type: 'RateLimitError',
        retryAfter: `${retryAfter} seconds`,
      },
    });
    return;
  }

  next();
}

// Cleanup on shutdown
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}
