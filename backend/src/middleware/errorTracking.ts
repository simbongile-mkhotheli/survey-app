// backend/src/middleware/errorTracking.ts
import type { Request, Response, NextFunction } from 'express';
import { logWithContext } from '@/config/logger';
import { errorMetrics } from './metrics';
import { config } from '@/config/env';

/**
 * Error Tracking & Monitoring System
 * =================================
 * 
 * Comprehensive error handling with:
 * - Structured error logging
 * - Error classification and severity
 * - Security incident detection
 * - Error rate monitoring
 * - Alert triggering for critical errors
 * - Error aggregation and analysis
 */

export interface ErrorContext {
  requestId?: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  path?: string;
  timestamp: string;
  environment: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  fingerprint?: string;
}

export interface ErrorReport {
  id: string;
  message: string;
  type: string;
  stack?: string;
  context: ErrorContext;
  metadata?: Record<string, any>;
}

// Error storage for analysis (in-memory for now, could be moved to database)
class ErrorStore {
  private errors: ErrorReport[] = [];
  private readonly maxErrors = 1000;
  private errorCounts = new Map<string, number>();
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();

  addError(error: ErrorReport): void {
    this.errors.push(error);
    
    // Maintain circular buffer
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
    
    // Update error counts for pattern detection
    const key = `${error.type}:${error.context.category}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }

  getRecentErrors(limit = 50, severity?: string): ErrorReport[] {
    let filtered = this.errors;
    
    if (severity) {
      filtered = filtered.filter(e => e.context.severity === severity);
    }
    
    return filtered.slice(-limit).reverse(); // Most recent first
  }

  getErrorStats(): {
    totalErrors: number;
    recentErrors: number;
    dailyErrors: number;
    errorRatePerHour: number;
    severityBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    topErrors: Array<{ pattern: string; count: number }>;
    timestamp: string;
  } {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => 
      new Date(e.context.timestamp).getTime() > hourAgo
    );
    
    const dailyErrors = this.errors.filter(e => 
      new Date(e.context.timestamp).getTime() > dayAgo
    );

    const severityBreakdown = {
      critical: recentErrors.filter(e => e.context.severity === 'critical').length,
      high: recentErrors.filter(e => e.context.severity === 'high').length,
      medium: recentErrors.filter(e => e.context.severity === 'medium').length,
      low: recentErrors.filter(e => e.context.severity === 'low').length
    };

    const categoryBreakdown: Record<string, number> = {};
    recentErrors.forEach(e => {
      categoryBreakdown[e.context.category] = (categoryBreakdown[e.context.category] || 0) + 1;
    });

    return {
      totalErrors: this.errors.length,
      recentErrors: recentErrors.length,
      dailyErrors: dailyErrors.length,
      errorRatePerHour: recentErrors.length,
      severityBreakdown,
      categoryBreakdown,
      topErrors: this.getTopErrors(),
      timestamp: new Date().toISOString()
    };
  }

  private getTopErrors(limit = 10): Array<{ pattern: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  checkErrorRate(fingerprint: string, maxRate = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(fingerprint);
    
    if (!entry || (now - entry.lastReset) > windowMs) {
      this.rateLimitMap.set(fingerprint, { count: 1, lastReset: now });
      return false;
    }
    
    entry.count++;
    return entry.count > maxRate;
  }
}

const errorStore = new ErrorStore();

/**
 * Generate error fingerprint for deduplication
 */
function generateErrorFingerprint(error: Error, context: Partial<ErrorContext>): string {
  const message = error.message.replace(/\d+/g, 'N'); // Replace numbers
  const path = context.path?.replace(/\/\d+/g, '/:id'); // Normalize IDs in paths
  
  return `${error.name}:${message}:${path}`;
}

/**
 * Determine error severity based on error type and context
 */
function determineErrorSeverity(error: Error, context: Partial<ErrorContext>): 'low' | 'medium' | 'high' | 'critical' {
  // Critical errors that affect system availability
  if (error.message.includes('ECONNREFUSED') || 
      error.message.includes('Database') ||
      error.message.includes('Redis') ||
      error.name === 'SystemError') {
    return 'critical';
  }
  
  // High severity errors that affect functionality
  if (error.name === 'ValidationError' ||
      error.name === 'AuthenticationError' ||
      error.name === 'AuthorizationError' ||
      context.path?.includes('/api/')) {
    return 'high';
  }
  
  // Medium severity for business logic errors
  if (error.name === 'BusinessLogicError' ||
      error.message.includes('not found') ||
      error.message.includes('invalid')) {
    return 'medium';
  }
  
  // Default to low severity
  return 'low';
}

/**
 * Categorize error for better organization
 */
function categorizeError(error: Error, context: Partial<ErrorContext>): string {
  if (error.message.includes('Database') || error.message.includes('ECONNREFUSED')) {
    return 'database';
  }
  
  if (error.message.includes('Redis') || error.message.includes('cache')) {
    return 'cache';
  }
  
  if (error.name === 'ValidationError' || error.message.includes('validation')) {
    return 'validation';
  }
  
  if (error.name === 'AuthenticationError' || error.name === 'AuthorizationError') {
    return 'security';
  }
  
  if (context.path?.includes('/api/')) {
    return 'api';
  }
  
  return 'application';
}

/**
 * Check if error indicates a security incident
 */
function isSecurityIncident(error: Error, _context: Partial<ErrorContext>): boolean {
  const securityIndicators = [
    'authentication',
    'authorization',
    'injection',
    'xss',
    'csrf',
    'invalid token',
    'access denied',
    'forbidden'
  ];
  
  const errorText = `${error.name} ${error.message}`.toLowerCase();
  return securityIndicators.some(indicator => errorText.includes(indicator));
}

/**
 * Main error tracking middleware
 */
export function errorTrackingMiddleware(error: Error, req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  
  const context: ErrorContext = {
    requestId: req.requestId,
    userId: req.userId,
    userAgent: req.get('User-Agent'),
    ip: req.clientIp || req.ip,
    method: req.method,
    path: req.path,
    timestamp,
    environment: config.NODE_ENV,
    severity: determineErrorSeverity(error, { path: req.path }),
    category: categorizeError(error, { path: req.path })
  };

  const fingerprint = generateErrorFingerprint(error, context);
  context.fingerprint = fingerprint;

  // Create error report
  const errorReport: ErrorReport = {
    id: `${timestamp}-${fingerprint.slice(0, 8)}`,
    message: error.message,
    type: error.name,
    stack: error.stack,
    context,
    metadata: {
      query: req.query,
      params: req.params,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'content-type': req.get('Content-Type'),
        'referer': req.get('Referer'),
        'user-agent': req.get('User-Agent')
      }
    }
  };

  // Store error for analysis
  errorStore.addError(errorReport);

  // Update metrics
  errorMetrics.recordError(error.name, context.category, context.severity);

  // Check for error rate limit (prevents spam)
  const isHighFrequency = errorStore.checkErrorRate(fingerprint);

  if (!isHighFrequency) {
    // Log error with structured logging
    logWithContext.error('Application error tracked', error, {
      requestId: context.requestId,
      userId: context.userId,
      operation: `${context.method} ${context.path}`,
      metadata: {
        severity: context.severity,
        category: context.category,
        fingerprint,
        errorId: errorReport.id
      }
    });

    // Security incident logging
    if (isSecurityIncident(error, context)) {
      logWithContext.security('Security incident detected', {
        event: 'security_error',
        severity: 'high',
        requestId: context.requestId,
        ip: context.ip,
        userAgent: context.userAgent,
        metadata: {
          errorType: error.name,
          errorMessage: error.message,
          path: context.path,
          method: context.method,
          fingerprint
        }
      });
    }
  }

  // Alert for critical errors (in production, this could integrate with PagerDuty, Slack, etc.)
  if (context.severity === 'critical' && !isHighFrequency) {
    alertCriticalError(errorReport);
  }

  // Continue to next error handler
  next(error);
}

/**
 * Alert for critical errors
 */
function alertCriticalError(errorReport: ErrorReport): void {
  // In production, integrate with alerting services
  logWithContext.error('CRITICAL ERROR ALERT', new Error(errorReport.message), {
    requestId: errorReport.context.requestId,
    operation: 'critical_error_alert',
    metadata: {
      errorId: errorReport.id,
      severity: errorReport.context.severity,
      category: errorReport.context.category,
      environment: errorReport.context.environment,
      alertLevel: 'CRITICAL'
    }
  });

  // TODO: Integrate with external alerting services
  // - PagerDuty
  // - Slack notifications
  // - Email alerts
  // - SMS alerts for critical errors
}

/**
 * Error analytics endpoint
 */
export async function errorAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { severity, limit = 50 } = req.query;
    
    const stats = errorStore.getErrorStats();
    const recentErrors = errorStore.getRecentErrors(
      parseInt(limit as string), 
      severity as string
    );

    res.json({
      statistics: stats,
      recentErrors: recentErrors.map(error => ({
        ...error,
        stack: undefined, // Don't expose stack traces in API
        metadata: {
          ...error.metadata,
          body: undefined // Don't expose request bodies in API
        }
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logWithContext.error('Failed to generate error analytics', error as Error, {
      requestId: req.requestId,
      operation: 'error_analytics'
    });

    res.status(500).json({
      error: 'Failed to generate error analytics',
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Error summary for monitoring dashboards
 */
export async function errorSummary(req: Request, res: Response): Promise<void> {
  try {
    const stats = errorStore.getErrorStats();
    
    res.json({
      summary: {
        totalErrors: stats.totalErrors,
        recentErrors: stats.recentErrors,
        errorRatePerHour: stats.errorRatePerHour,
        criticalErrors: stats.severityBreakdown.critical,
        highSeverityErrors: stats.severityBreakdown.high
      },
      trends: {
        dailyTotal: stats.dailyErrors,
        hourlyRate: stats.errorRatePerHour,
        topCategories: Object.entries(stats.categoryBreakdown)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logWithContext.error('Failed to generate error summary', error as Error, {
      requestId: req.requestId,
      operation: 'error_summary'
    });

    res.status(500).json({
      error: 'Failed to generate error summary',
      timestamp: new Date().toISOString()
    });
  }
}

export default {
  errorTrackingMiddleware,
  errorAnalytics,
  errorSummary,
  errorStore
};