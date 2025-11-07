// backend/src/middleware/logging.ts
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logWithContext, accessLogger } from '@/config/logger';

/**
 * Request Logging Middleware
 * =========================
 * 
 * Comprehensive HTTP request/response logging with:
 * - Request correlation IDs
 * - Performance timing
 * - Security event logging
 * - Structured access logs
 * - Error context preservation
 */

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
      userId?: string;
      clientIp: string;
    }
  }
}

/**
 * Request ID and timing middleware
 * Adds unique request ID and tracks timing for each request
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  // Generate unique request ID
  req.requestId = req.headers['x-request-id'] as string || randomUUID();
  req.startTime = Date.now();
  
  // Extract real client IP (handles proxies)
  req.clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                 req.headers['x-real-ip'] as string ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 'unknown';

  // Add request ID to response headers for client correlation
  res.setHeader('X-Request-ID', req.requestId);
  
  // Log request start
  logWithContext.debug('Request started', {
    requestId: req.requestId,
    metadata: {
      method: req.method,
      path: req.path,
      ip: req.clientIp,
      userAgent: req.get('User-Agent'),
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      contentLength: req.get('Content-Length'),
      contentType: req.get('Content-Type')
    }
  });

  next();
}

/**
 * Access logging middleware
 * Logs all HTTP requests with response details
 */
export function accessLogging(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  const originalWrite = res.write;
  
  const responseBody = '';
  let responseSize = 0;

  // Intercept response writes to capture size
  res.write = function(chunk: any) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
    }
    return originalWrite.apply(this, arguments as any);
  };

  // Override end function to log when response completes
  res.end = function(chunk: any, ...args: any[]) {
    if (chunk) {
      responseSize += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
    }

    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path || req.url;
    
    // Determine log level based on status code
    const isError = statusCode >= 400;
    const isSlowRequest = duration > 5000; // 5 seconds
    
    const logData = {
      requestId: req.requestId,
      userId: req.userId,
      method,
      path,
      statusCode,
      duration,
      ip: req.clientIp,
      userAgent: req.get('User-Agent'),
      metadata: {
        responseSize,
        contentType: res.get('Content-Type'),
        cacheControl: res.get('Cache-Control'),
        referer: req.get('Referer'),
        queryParams: Object.keys(req.query).length > 0 ? req.query : undefined
      }
    };

    // Log access with appropriate level
    if (isError) {
      logWithContext.warn(`${method} ${path} - ${statusCode} (${duration}ms)`, logData);
    } else if (isSlowRequest) {
      logWithContext.warn(`Slow request: ${method} ${path} - ${statusCode} (${duration}ms)`, logData);
    } else {
      logWithContext.access(`${method} ${path} - ${statusCode}`, logData);
    }

    // Security logging for suspicious activity
    if (statusCode === 401 || statusCode === 403) {
      logWithContext.security('Authentication/Authorization failure', {
        event: statusCode === 401 ? 'authentication_failure' : 'authorization_failure',
        severity: 'medium',
        requestId: req.requestId,
        ip: req.clientIp,
        userAgent: req.get('User-Agent'),
        metadata: {
          path,
          method
        }
      });
    }

    // Log suspicious patterns
    if (method === 'POST' && statusCode === 400 && path.includes('/api/')) {
      logWithContext.security('Potential malicious request', {
        event: 'suspicious_request',
        severity: 'low',
        requestId: req.requestId,
        ip: req.clientIp,
        userAgent: req.get('User-Agent'),
        metadata: {
          path,
          method,
          statusCode
        }
      });
    }

    return originalEnd.apply(this, arguments as any);
  };

  next();
}

/**
 * Error logging middleware
 * Captures and logs application errors with full context
 */
export function errorLogging(error: Error, req: Request, res: Response, next: NextFunction): void {
  const errorContext = {
    requestId: req.requestId,
    userId: req.userId,
    operation: `${req.method} ${req.path}`,
    metadata: {
      ip: req.clientIp,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? req.body : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      params: Object.keys(req.params).length > 0 ? req.params : undefined
    }
  };

  // Log error with full context
  logWithContext.error('Request processing error', error, errorContext);

  // Security logging for potential attacks
  if (error.message.includes('validation') || error.message.includes('parse')) {
    logWithContext.security('Input validation error', {
      event: 'validation_failure',
      severity: 'low',
      requestId: req.requestId,
      ip: req.clientIp,
      userAgent: req.get('User-Agent'),
      metadata: {
        errorMessage: error.message,
        path: req.path,
        method: req.method
      }
    });
  }

  // Continue to next error handler
  next(error);
}

/**
 * Performance logging for slow operations
 */
export function logSlowOperation(operation: string, duration: number, requestId?: string, metadata?: any): void {
  if (duration > 1000) { // Log operations slower than 1 second
    logWithContext.performance('Slow operation detected', {
      requestId,
      operation,
      duration,
      metadata
    });
  }
}

/**
 * Business logic logging helpers
 */
export const businessLogger = {
  surveyCreated: (requestId: string, surveyId: number, userId?: string) => {
    logWithContext.info('Survey response created', {
      requestId,
      userId,
      operation: 'survey_created',
      metadata: { surveyId }
    });
  },

  resultsAccessed: (requestId: string, userId?: string, cached = false) => {
    logWithContext.info('Survey results accessed', {
      requestId,
      userId,
      operation: 'results_accessed',
      metadata: { cached, source: cached ? 'cache' : 'database' }
    });
  },

  cacheHit: (requestId: string, cacheKey: string) => {
    logWithContext.debug('Cache hit', {
      requestId,
      operation: 'cache_hit',
      metadata: { cacheKey }
    });
  },

  cacheMiss: (requestId: string, cacheKey: string) => {
    logWithContext.debug('Cache miss', {
      requestId,
      operation: 'cache_miss',
      metadata: { cacheKey }
    });
  },

  databaseQuery: (requestId: string, query: string, duration: number) => {
    if (duration > 500) { // Log slow queries
      logWithContext.performance('Database query executed', {
        requestId,
        operation: 'database_query',
        duration,
        metadata: { 
          query: query.length > 200 ? `${query.substring(0, 200)}...` : query 
        }
      });
    }
  }
};

export default {
  requestContext,
  accessLogging,
  errorLogging,
  logSlowOperation,
  businessLogger
};