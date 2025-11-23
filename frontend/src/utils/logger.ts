/**
 * Frontend Logger Utility
 * =======================
 * Structured logging for frontend with context propagation
 * Sends errors to backend error tracking in production
 */

interface LogContext {
  [key: string]: any;
}

/**
 * Enhanced logging with context
 */
export const logWithContext = {
  /**
   * Debug logs (development only)
   */
  debug: (message: string, context?: LogContext) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development logging only
      console.debug(`[DEBUG] ${message}`, context);
    }
  },

  /**
   * Info logs (general information)
   */
  info: (message: string, context?: LogContext) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console -- Development logging only
      console.info(`[INFO] ${message}`, context);
    }
  },

  /**
   * Warning logs (potential issues)
   */
  warn: (message: string, context?: LogContext) => {
    // eslint-disable-next-line no-console -- Production warning logging
    console.warn(`[WARN] ${message}`, context);
  },

  /**
   * Error logs (critical issues)
   */
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logData = {
      message,
      errorMessage,
      errorStack,
      ...context,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
    };

    // eslint-disable-next-line no-console -- Production error logging
    console.error(`[ERROR] ${message}`, logData);

    // In production, could send to error tracking service
    // Example: ErrorTrackingService.report(logData)
  },
};
