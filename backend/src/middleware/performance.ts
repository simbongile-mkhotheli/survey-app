// backend/src/middleware/performance.ts
import type { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { config } from '@/config/env';

/**
 * Performance Monitoring Middleware
 * ================================
 * Tracks request performance, database query times, and identifies bottlenecks
 */

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  dbQueries?: QueryMetric[];
  cacheHits: number;
  cacheMisses: number;
}

export interface QueryMetric {
  query: string;
  duration: number;
  timestamp: number;
  params?: unknown[];
}

// In-memory storage for metrics (use Redis in production)
const metricsStore = new Map<string, PerformanceMetrics>();
const slowQueries: QueryMetric[] = [];
const MAX_METRICS_HISTORY = 1000;
const MAX_SLOW_QUERIES = 100;

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface RequestWithId extends Request {
  requestId: string;
}

/**
 * Request performance tracking middleware
 */
export function performanceTracker(req: Request, res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  const startTime = performance.now();

  // Attach request ID to request object for correlation
  (req as RequestWithId).requestId = requestId;

  // Initialize performance metrics
  const metrics: PerformanceMetrics = {
    requestId,
    method: req.method,
    path: req.path,
    startTime,
    dbQueries: [],
    cacheHits: 0,
    cacheMisses: 0,
  };

  // Store metrics
  metricsStore.set(requestId, metrics);

  // Clean up old metrics
  if (metricsStore.size > MAX_METRICS_HISTORY) {
    const firstKey = metricsStore.keys().next().value;
    if (firstKey) {
      metricsStore.delete(firstKey);
    }
  }

  // Override response.json to capture response time
  const originalJson = res.json;
  res.json = function (body: unknown) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Update metrics
    metrics.endTime = endTime;
    metrics.duration = duration;
    metrics.statusCode = res.statusCode;

    // Log slow requests
    if (duration > config.SLOW_QUERY_THRESHOLD) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Slow request detected: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }

    // Log performance metrics in development
    if (config.NODE_ENV === 'development' && config.ENABLE_QUERY_LOGGING) {
      // eslint-disable-next-line no-console
      console.log(`📊 ${requestId}: ${req.method} ${req.path} - ${duration.toFixed(2)}ms (${res.statusCode})`);
      if (metrics.dbQueries && metrics.dbQueries.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`   📀 DB Queries: ${metrics.dbQueries.length}, Total: ${metrics.dbQueries.reduce((sum, q) => sum + q.duration, 0).toFixed(2)}ms`);
      }
      // eslint-disable-next-line no-console
      console.log(`   💾 Cache: ${metrics.cacheHits} hits, ${metrics.cacheMisses} misses`);
    }

    return originalJson.call(this, body);
  };

  next();
}

/**
 * Database query performance tracker
 */
export class QueryPerformanceTracker {
  private static instance: QueryPerformanceTracker;

  private constructor() {}

  public static getInstance(): QueryPerformanceTracker {
    if (!QueryPerformanceTracker.instance) {
      QueryPerformanceTracker.instance = new QueryPerformanceTracker();
    }
    return QueryPerformanceTracker.instance;
  }

  /**
   * Track database query execution time
   */
  public trackQuery(requestId: string, query: string, params?: unknown[]): QueryTracker {
    return new QueryTracker(requestId, query, params);
  }

  /**
   * Add query metric to request
   */
  public addQueryMetric(requestId: string, metric: QueryMetric): void {
    const metrics = metricsStore.get(requestId);
    if (metrics && metrics.dbQueries) {
      metrics.dbQueries.push(metric);

      // Track slow queries globally
      if (metric.duration > config.SLOW_QUERY_THRESHOLD) {
        slowQueries.push(metric);
        
        // Keep only recent slow queries
        if (slowQueries.length > MAX_SLOW_QUERIES) {
          slowQueries.shift();
        }

        // eslint-disable-next-line no-console
        console.warn(`🐌 Slow database query: ${metric.duration.toFixed(2)}ms - ${metric.query.substring(0, 100)}...`);
      }
    }
  }

  /**
   * Get performance metrics for a request
   */
  public getRequestMetrics(requestId: string): PerformanceMetrics | undefined {
    return metricsStore.get(requestId);
  }

  /**
   * Get aggregated performance statistics
   */
  public getPerformanceStats(): {
    totalRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    slowQueries: number;
    recentMetrics: PerformanceMetrics[];
  } {
    const metrics = Array.from(metricsStore.values());
    const completedMetrics = metrics.filter(m => m.duration !== undefined);

    const totalRequests = completedMetrics.length;
    const averageResponseTime = totalRequests > 0 
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalRequests 
      : 0;
    
    const slowRequests = completedMetrics.filter(m => (m.duration || 0) > config.SLOW_QUERY_THRESHOLD).length;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      slowRequests,
      slowQueries: slowQueries.length,
      recentMetrics: completedMetrics.slice(-10), // Last 10 requests
    };
  }

  /**
   * Get slow queries for analysis
   */
  public getSlowQueries(): QueryMetric[] {
    return [...slowQueries];
  }

  /**
   * Clear performance data
   */
  public clearMetrics(): void {
    metricsStore.clear();
    slowQueries.length = 0;
  }
}

/**
 * Individual query tracker
 */
export class QueryTracker {
  private startTime: number;
  private requestId: string;
  private query: string;
  private params?: unknown[];

  constructor(requestId: string, query: string, params?: unknown[]) {
    this.requestId = requestId;
    this.query = query;
    this.params = params;
    this.startTime = performance.now();
  }

  /**
   * End query tracking and record metrics
   */
  public end(): void {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metric: QueryMetric = {
      query: this.query,
      duration,
      timestamp: Date.now(),
      params: this.params,
    };

    QueryPerformanceTracker.getInstance().addQueryMetric(this.requestId, metric);
  }
}

/**
 * Cache performance tracking
 */
export class CachePerformanceTracker {
  public static recordCacheHit(requestId: string): void {
    const metrics = metricsStore.get(requestId);
    if (metrics) {
      metrics.cacheHits++;
    }
  }

  public static recordCacheMiss(requestId: string): void {
    const metrics = metricsStore.get(requestId);
    if (metrics) {
      metrics.cacheMisses++;
    }
  }
}

/**
 * Performance monitoring endpoint middleware
 */
export function performanceEndpoint(req: Request, res: Response): void {
  const stats = QueryPerformanceTracker.getInstance().getPerformanceStats();
  const slowQueries = QueryPerformanceTracker.getInstance().getSlowQueries();

  res.json({
    performance: {
      ...stats,
      slowQueries: slowQueries.map(q => ({
        query: q.query.substring(0, 200), // Truncate long queries
        duration: q.duration,
        timestamp: new Date(q.timestamp).toISOString(),
      })),
    },
    timestamp: new Date().toISOString(),
  });
}

// Export singleton instance
export const queryPerformanceTracker = QueryPerformanceTracker.getInstance();