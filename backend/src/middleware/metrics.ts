// backend/src/middleware/metrics.ts
import type { Request, Response, NextFunction } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { logWithContext } from '@/config/logger';
import { config } from '@/config/env';

/**
 * Application Metrics System
 * =========================
 * 
 * Prometheus-compatible metrics collection for:
 * - HTTP request/response metrics
 * - Database query performance
 * - Cache hit/miss ratios
 * - Business logic metrics
 * - System resource usage
 * - Error rates and types
 */

// Enable default system metrics collection
collectDefaultMetrics({ register });

// HTTP Request Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'status_class']
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
});

export const httpRequestsInProgress = new Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method', 'route']
});

// Database Metrics
export const databaseQueriesTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

export const databaseConnectionsActive = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

// Cache Metrics
export const cacheOperationsTotal = new Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result', 'cache_type']
});

export const cacheHitRatio = new Gauge({
  name: 'cache_hit_ratio',
  help: 'Cache hit ratio (0-1)',
  labelNames: ['cache_type']
});

export const cacheSizeBytes = new Gauge({
  name: 'cache_size_bytes',
  help: 'Cache size in bytes',
  labelNames: ['cache_type']
});

// Business Logic Metrics
export const surveysCreatedTotal = new Counter({
  name: 'surveys_created_total',
  help: 'Total number of surveys created'
});

export const surveyResultsQueriedTotal = new Counter({
  name: 'survey_results_queried_total',
  help: 'Total number of times survey results were queried',
  labelNames: ['cached']
});

export const activeUsersGauge = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['time_window']
});

// Error Metrics
export const errorsByType = new Counter({
  name: 'errors_total',
  help: 'Total number of errors by type',
  labelNames: ['error_type', 'component', 'severity']
});

export const errorRate = new Gauge({
  name: 'error_rate',
  help: 'Error rate (errors per minute)',
  labelNames: ['component']
});

// Performance Metrics
export const slowQueriesTotal = new Counter({
  name: 'slow_queries_total',
  help: 'Total number of slow database queries',
  labelNames: ['operation', 'table']
});

export const memoryUsageBytes = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

/**
 * Request metrics collection middleware
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const route = req.route?.path || req.path || 'unknown';
  const method = req.method;

  // Track request in progress
  httpRequestsInProgress.labels(method, route).inc();

  // Override res.end to capture metrics when response completes
  const originalEnd = res.end;
  res.end = function(chunk?: any) {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const statusCode = res.statusCode;
    const statusClass = `${Math.floor(statusCode / 100)}xx`;

    // Record metrics
    httpRequestsTotal.labels(method, route, statusCode.toString(), statusClass).inc();
    httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
    httpRequestsInProgress.labels(method, route).dec();

    // Track errors
    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
      errorsByType.labels(errorType, 'http', statusCode >= 500 ? 'high' : 'medium').inc();
    }

    return originalEnd.apply(this, arguments as any);
  };

  next();
}

/**
 * Database metrics tracking helpers
 */
export const databaseMetrics = {
  recordQuery: (operation: string, table: string, duration: number, success: boolean) => {
    const durationSeconds = duration / 1000;
    const status = success ? 'success' : 'error';

    databaseQueriesTotal.labels(operation, table, status).inc();
    databaseQueryDuration.labels(operation, table).observe(durationSeconds);

    // Track slow queries (>1 second)
    if (durationSeconds > 1) {
      slowQueriesTotal.labels(operation, table).inc();
      
      logWithContext.performance('Slow database query detected', {
        operation: `${operation}_${table}`,
        duration,
        metadata: { operation, table, durationSeconds }
      });
    }
  },

  updateConnectionCount: (count: number) => {
    databaseConnectionsActive.set(count);
  }
};

/**
 * Cache metrics tracking helpers
 */
export const cacheMetrics = {
  recordOperation: (operation: 'get' | 'set' | 'del', result: 'hit' | 'miss' | 'success' | 'error', cacheType: 'redis' | 'memory') => {
    cacheOperationsTotal.labels(operation, result, cacheType).inc();
  },

  updateHitRatio: (ratio: number, cacheType: 'redis' | 'memory') => {
    cacheHitRatio.labels(cacheType).set(ratio);
  },

  updateCacheSize: (sizeBytes: number, cacheType: 'redis' | 'memory') => {
    cacheSizeBytes.labels(cacheType).set(sizeBytes);
  }
};

/**
 * Business logic metrics helpers
 */
export const businessMetrics = {
  recordSurveyCreated: () => {
    surveysCreatedTotal.inc();
  },

  recordResultsQuery: (cached: boolean) => {
    surveyResultsQueriedTotal.labels(cached ? 'true' : 'false').inc();
  },

  updateActiveUsers: (count: number, timeWindow: string) => {
    activeUsersGauge.labels(timeWindow).set(count);
  }
};

/**
 * Error tracking helpers
 */
export const errorMetrics = {
  recordError: (errorType: string, component: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    errorsByType.labels(errorType, component, severity).inc();
  },

  updateErrorRate: (rate: number, component: string) => {
    errorRate.labels(component).set(rate);
  }
};

/**
 * System metrics update function (called periodically)
 */
export function updateSystemMetrics(): void {
  const memUsage = process.memoryUsage();
  
  memoryUsageBytes.labels('rss').set(memUsage.rss);
  memoryUsageBytes.labels('heap_used').set(memUsage.heapUsed);
  memoryUsageBytes.labels('heap_total').set(memUsage.heapTotal);
  memoryUsageBytes.labels('external').set(memUsage.external);
}

/**
 * Metrics endpoint handler
 */
export async function metricsEndpoint(req: Request, res: Response): Promise<void> {
  try {
    // Update system metrics before serving
    updateSystemMetrics();
    
    // Serve Prometheus metrics
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
    
    logWithContext.debug('Metrics served', {
      requestId: req.requestId,
      operation: 'metrics_export'
    });
    
  } catch (error) {
    logWithContext.error('Failed to serve metrics', error as Error, {
      requestId: req.requestId,
      operation: 'metrics_export'
    });
    
    res.status(500).json({ 
      error: 'Failed to generate metrics',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Custom metrics dashboard data
 */
export async function metricsDashboard(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await register.getMetricsAsJSON();
    
    // Create simplified dashboard data
    const dashboard = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: getMetricValue(metrics, 'http_requests_total'),
        averageResponseTime: getMetricValue(metrics, 'http_request_duration_seconds', 'avg'),
        errorRate: getMetricValue(metrics, 'errors_total'),
        cacheHitRatio: getMetricValue(metrics, 'cache_hit_ratio'),
        activeDatabaseConnections: getMetricValue(metrics, 'database_connections_active'),
        memoryUsageMB: Math.round(getMetricValue(metrics, 'memory_usage_bytes', 'heap_used') / 1024 / 1024)
      },
      details: {
        httpMetrics: metrics.filter(m => m.name.startsWith('http_')),
        databaseMetrics: metrics.filter(m => m.name.startsWith('database_')),
        cacheMetrics: metrics.filter(m => m.name.startsWith('cache_')),
        businessMetrics: metrics.filter(m => m.name.startsWith('surveys_') || m.name.startsWith('survey_'))
      }
    };
    
    res.json(dashboard);
    
  } catch (error) {
    logWithContext.error('Failed to generate metrics dashboard', error as Error, {
      requestId: req.requestId,
      operation: 'metrics_dashboard'
    });
    
    res.status(500).json({ 
      error: 'Failed to generate dashboard',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Helper function to extract metric values
 */
function getMetricValue(metrics: any[], metricName: string, labelName?: string): number {
  const metric = metrics.find(m => m.name === metricName);
  if (!metric) return 0;
  
  if (metric.type === 'counter' || metric.type === 'gauge') {
    if (labelName && metric.values) {
      const value = metric.values.find((v: any) => v.labels && v.labels.type === labelName);
      return value ? value.value : 0;
    }
    return metric.values && metric.values[0] ? metric.values[0].value : 0;
  }
  
  if (metric.type === 'histogram' && metric.values) {
    // For histograms, return the average if requested
    if (labelName === 'avg') {
      const sum = metric.values.find((v: any) => v.labels && v.labels.le === '+Inf');
      const count = metric.values.find((v: any) => v.metricName?.includes('_count'));
      if (sum && count && count.value > 0) {
        return sum.value / count.value;
      }
    }
    return metric.values[0] ? metric.values[0].value : 0;
  }
  
  return 0;
}

// Start periodic system metrics updates
setInterval(updateSystemMetrics, 30000); // Update every 30 seconds

export default {
  metricsMiddleware,
  metricsEndpoint,
  metricsdashboard: metricsDashboard,
  databaseMetrics,
  cacheMetrics,
  businessMetrics,
  errorMetrics,
  register
};