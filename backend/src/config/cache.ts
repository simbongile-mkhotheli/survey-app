// backend/src/config/cache.ts
import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { config } from '@/config/env';

/**
 * Cache Configuration & Management
 * ===============================
 * Provides multi-layer caching with Redis (distributed) and NodeCache (in-memory)
 * Implements cache-aside pattern with TTL and invalidation strategies
 */

export interface CacheConfig {
  defaultTTL: number;
  maxKeys: number;
  checkPeriod: number;
}

export interface CacheKey {
  results: string;
  survey: (id: number) => string;
  userResults: (userId: string) => string;
  aggregations: string;
  foodDistribution: string;
  ageStatistics: string;
  ratingAverages: string;
}

// Cache configuration
export const CACHE_CONFIG: CacheConfig = {
  defaultTTL: config.CACHE_TTL || 300, // 5 minutes default
  maxKeys: 1000,
  checkPeriod: 600, // Check for expired keys every 10 minutes
};

// Cache keys with versioning for easy invalidation
export const CACHE_KEYS: CacheKey = {
  results: 'survey:results:v1',
  survey: (id: number) => `survey:response:${id}:v1`,
  userResults: (userId: string) => `user:results:${userId}:v1`,
  aggregations: 'survey:aggregations:v1',
  foodDistribution: 'survey:food-dist:v1',
  ageStatistics: 'survey:age-stats:v1',
  ratingAverages: 'survey:rating-avg:v1',
};

/**
 * Redis Client Configuration
 * Implements connection pooling and error handling
 */
class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;
  private isConnected = false;

  private constructor() {
    this.initializeClient();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private initializeClient(): void {
    try {
      // Only initialize Redis in production or when explicitly enabled
      if (config.NODE_ENV === 'production' || config.REDIS_ENABLED) {
        this.client = new Redis({
          host: config.REDIS_HOST || 'localhost',
          port: config.REDIS_PORT || 6379,
          password: config.REDIS_PASSWORD,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 5000,
          family: 4,
        });

        this.client.on('connect', () => {
          this.isConnected = true;
        });

        this.client.on('error', (error) => {
          this.isConnected = false;
        });

        this.client.on('close', () => {
          this.isConnected = false;
        });
      }
    } catch (error) {
      // Redis initialization failed, will fall back to memory cache
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  public async del(key: string | string[]): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      await this.client.del(Array.isArray(key) ? key : [key]);
      return true;
    } catch (error) {
      // Redis DEL error silently handled
      return false;
    }
  }

  public async flushPattern(pattern: string): Promise<boolean> {
    if (!this.client || !this.isConnected) return false;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      // Redis FLUSH PATTERN error silently handled
      return false;
    }
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

/**
 * In-Memory Cache (NodeCache)
 * Fallback cache when Redis is not available
 */
class MemoryCache {
  private static instance: MemoryCache;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_CONFIG.defaultTTL,
      maxKeys: CACHE_CONFIG.maxKeys,
      checkperiod: CACHE_CONFIG.checkPeriod,
      useClones: false, // Better performance, be careful with object mutations
    });

    this.cache.on('expired', (key: string) => {
      // Cache key expired (logged by winston if needed)
    });

    this.cache.on('del', (key: string) => {
      // Cache key deleted (logged by winston if needed)
    });
  }

  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || CACHE_CONFIG.defaultTTL);
  }

  public del(key: string | string[]): number {
    return this.cache.del(key);
  }

  public flushAll(): void {
    this.cache.flushAll();
  }

  public keys(): string[] {
    return this.cache.keys();
  }

  public getStats() {
    return this.cache.getStats();
  }
}

/**
 * Unified Cache Manager
 * Implements cache-aside pattern with Redis + in-memory fallback
 */
export class CacheManager {
  private static instance: CacheManager;
  private redis: RedisClient;
  private memory: MemoryCache;

  private constructor() {
    this.redis = RedisClient.getInstance();
    this.memory = MemoryCache.getInstance();
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache (Redis first, then memory fallback)
   */
  public async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    const redisValue = await this.redis.get<T>(key);
    if (redisValue !== null) {
      // Also cache in memory for faster subsequent access
      this.memory.set(key, redisValue, CACHE_CONFIG.defaultTTL);
      return redisValue;
    }

    // Fallback to memory cache
    const memoryValue = this.memory.get<T>(key);
    return memoryValue || null;
  }

  /**
   * Set value in both Redis and memory cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const effectiveTTL = ttl || CACHE_CONFIG.defaultTTL;

    // Set in both caches
    const redisSet = await this.redis.set(key, value, effectiveTTL);
    const memorySet = this.memory.set(key, value, effectiveTTL);

    return redisSet || memorySet;
  }

  /**
   * Delete from both caches
   */
  public async del(key: string | string[]): Promise<boolean> {
    const redisDelete = await this.redis.del(key);
    const memoryDelete = this.memory.del(key);

    return redisDelete || memoryDelete > 0;
  }

  /**
   * Clear all survey-related cache entries
   */
  public async invalidateSurveyCache(): Promise<void> {
    await Promise.all([
      this.redis.flushPattern('survey:*'),
      this.del([
        CACHE_KEYS.results,
        CACHE_KEYS.aggregations,
        CACHE_KEYS.foodDistribution,
        CACHE_KEYS.ageStatistics,
        CACHE_KEYS.ratingAverages,
      ]),
    ]);
  }

  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats() {
    return {
      memory: this.memory.getStats(),
      redis: {
        connected: this.redis.isHealthy(),
      },
    };
  }

  /**
   * Health check for cache systems
   */
  public async healthCheck(): Promise<{
    redis: boolean;
    memory: boolean;
    overall: boolean;
  }> {
    const redisHealthy = this.redis.isHealthy();
    const memoryHealthy = true; // Memory cache is always available
    
    return {
      redis: redisHealthy,
      memory: memoryHealthy,
      overall: redisHealthy || memoryHealthy,
    };
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    await this.redis.disconnect();
    this.memory.flushAll();
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();