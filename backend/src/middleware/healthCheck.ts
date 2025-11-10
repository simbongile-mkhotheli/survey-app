// backend/src/middleware/healthCheck.ts
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { cacheManager } from '@/config/cache';
import { logWithContext } from '@/config/logger';
import { config } from '@/config/env';

/**
 * Health Check System
 * ==================
 * 
 * Comprehensive health monitoring for all application components:
 * - Database connectivity and performance
 * - Cache system health (Redis + Memory)
 * - Application metrics and status
 * - Dependency health checks
 * - Performance benchmarks
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: ComponentHealth;
    cache: ComponentHealth;
    memory: ComponentHealth;
    disk?: ComponentHealth;
  };
  performance: {
    responseTime: number;
    averageResponseTime?: number;
    requestCount?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  details?: Record<string, unknown>;
  lastCheck: string;
}

// Health check metrics storage
const healthMetrics = {
  totalChecks: 0,
  lastCheck: new Date(),
  responseTimes: [] as number[],
  errors: [] as { timestamp: Date; component: string; error: string }[]
};

/**
 * Database health check with connection and query performance test
 */
async function checkDatabaseHealth(prisma: PrismaClient): Promise<ComponentHealth> {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity with a simple query
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    // Test write capability (if needed)
    const testQuery = prisma.surveyResponse.findFirst({
      select: { id: true },
      take: 1
    });
    
    await testQuery;
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
      responseTime,
      message: `Database responding in ${responseTime}ms`,
      details: {
        connectionState: 'connected',
        queryPerformance: responseTime < 100 ? 'excellent' : responseTime < 500 ? 'good' : 'poor'
      },
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    // Log database health check failure
    logWithContext.error('Database health check failed', error as Error, {
      operation: 'health_check_database',
      duration: responseTime
    });
    
    return {
      status: 'unhealthy',
      responseTime,
      message: `Database error: ${errorMessage}`,
      details: {
        connectionState: 'failed',
        error: errorMessage
      },
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Cache system health check (Redis + Memory fallback)
 */
async function checkCacheHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();
  
  try {
    const testKey = 'health-check-test';
    const testValue = { timestamp: Date.now(), test: true };
    
    // Test cache write and read
    await cacheManager.set(testKey, testValue, 60); // 1 minute TTL
    const retrieved = await cacheManager.get(testKey);
    
    // Clean up test data
    await cacheManager.del(testKey);
    
    const responseTime = Date.now() - startTime;
    const cacheStats = cacheManager.getCacheStats();
    
    return {
      status: responseTime < 50 ? 'healthy' : responseTime < 200 ? 'degraded' : 'unhealthy',
      responseTime,
      message: `Cache responding in ${responseTime}ms`,
      details: {
        redisConnected: cacheStats.redis?.connected || false,
        memoryCache: cacheStats.memory ? 'available' : 'unavailable',
        testResult: retrieved ? 'passed' : 'failed'
      },
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown cache error';
    
    logWithContext.error('Cache health check failed', error as Error, {
      operation: 'health_check_cache',
      duration: responseTime
    });
    
    return {
      status: 'unhealthy',
      responseTime,
      message: `Cache error: ${errorMessage}`,
      details: {
        error: errorMessage
      },
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Memory usage health check
 */
function checkMemoryHealth(): ComponentHealth {
  const memUsage = process.memoryUsage();
  const totalMemMB = Math.round(memUsage.rss / 1024 / 1024);
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  
  // Determine health based on heap usage
  const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (heapUsagePercent > 90) {
    status = 'unhealthy';
  } else if (heapUsagePercent > 75) {
    status = 'degraded';
  }
  
  return {
    status,
    message: `Memory usage: ${totalMemMB}MB total, ${heapUsedMB}MB heap used (${heapUsagePercent.toFixed(1)}%)`,
    details: {
      rss: `${totalMemMB}MB`,
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      heapUsagePercent: `${heapUsagePercent.toFixed(1)}%`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    },
    lastCheck: new Date().toISOString()
  };
}

/**
 * Calculate average response time from recent checks
 */
function calculateAverageResponseTime(): number | undefined {
  if (healthMetrics.responseTimes.length === 0) return undefined;
  
  const sum = healthMetrics.responseTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / healthMetrics.responseTimes.length);
}

/**
 * Main health check endpoint
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const requestId = req.requestId || 'health-check';
  
  try {
    // Initialize Prisma client for health check
    const prisma = new PrismaClient();
    
    // Perform all health checks in parallel
    const [databaseHealth, cacheHealth, memoryHealth] = await Promise.all([
      checkDatabaseHealth(prisma),
      checkCacheHealth(),
      Promise.resolve(checkMemoryHealth())
    ]);
    
    // Clean up Prisma client
    await prisma.$disconnect();
    
    const responseTime = Date.now() - startTime;
    
    // Update metrics
    healthMetrics.totalChecks++;
    healthMetrics.lastCheck = new Date();
    healthMetrics.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (healthMetrics.responseTimes.length > 100) {
      healthMetrics.responseTimes = healthMetrics.responseTimes.slice(-100);
    }
    
    // Determine overall health status
    const allStatuses = [databaseHealth.status, cacheHealth.status, memoryHealth.status];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (allStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (allStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: databaseHealth,
        cache: cacheHealth,
        memory: memoryHealth
      },
      performance: {
        responseTime,
        averageResponseTime: calculateAverageResponseTime(),
        requestCount: healthMetrics.totalChecks
      },
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    };
    
    // Log health check
    logWithContext.info('Health check completed', {
      requestId,
      operation: 'health_check',
      duration: responseTime,
      metadata: {
        overallStatus,
        componentStatuses: allStatuses
      }
    });
    
    // Set appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    res.status(httpStatus).json(healthStatus);
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    
    // Record error
    healthMetrics.errors.push({
      timestamp: new Date(),
      component: 'health_check',
      error: errorMessage
    });
    
    // Keep only last 50 errors
    if (healthMetrics.errors.length > 50) {
      healthMetrics.errors = healthMetrics.errors.slice(-50);
    }
    
    logWithContext.error('Health check system failure', error as Error, {
      requestId,
      operation: 'health_check',
      duration: responseTime
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: config.NODE_ENV,
      error: errorMessage,
      performance: {
        responseTime
      }
    });
  }
}

/**
 * Simple liveness probe (minimal overhead)
 */
export function livenessProbe(req: Request, res: Response): void {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
}

/**
 * Readiness probe (checks if app is ready to serve traffic)
 */
export async function readinessProbe(req: Request, res: Response): Promise<void> {
  try {
    const prisma = new PrismaClient();
    
    // Quick database connectivity check
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected'
      }
    });
    
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Readiness check failed'
    });
  }
}

export default {
  healthCheck,
  livenessProbe,
  readinessProbe
};