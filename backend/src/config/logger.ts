// backend/src/config/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from './env';

/**
 * Winston Logger Configuration
 * ===========================
 *
 * Comprehensive logging setup with multiple transports:
 * - Console output (development)
 * - Daily rotating files (production)
 * - Separate error logs
 * - JSON structured logging
 * - Performance optimized
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Custom log format for better readability
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, service, requestId, userId, ...meta }) => {
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        service: service || 'survey-backend',
        requestId,
        userId,
        message,
        ...meta,
      };

      // Remove undefined values for cleaner logs
      Object.keys(logEntry).forEach((key) => {
        const typedEntry = logEntry as Record<string, unknown>;
        if (typedEntry[key] === undefined) {
          delete typedEntry[key];
        }
      });

      return JSON.stringify(logEntry);
    },
  ),
);

// Console format for development (more human-readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf(
    ({ timestamp, level, message, requestId, userId, service, ...meta }) => {
      let logLine = `${timestamp} [${level}]`;

      if (service && service !== 'survey-backend') {
        logLine += ` [${service}]`;
      }

      if (requestId && typeof requestId === 'string') {
        logLine += ` [${requestId.slice(-8)}]`; // Show last 8 chars of requestId
      }

      if (userId) {
        logLine += ` [user:${userId}]`;
      }

      logLine += `: ${message}`;

      // Add metadata if present
      const metaKeys = Object.keys(meta);
      if (metaKeys.length > 0) {
        const metaStr = metaKeys
          .map((key) => `${key}=${JSON.stringify(meta[key])}`)
          .join(' ');
        logLine += ` | ${metaStr}`;
      }

      return logLine;
    },
  ),
);

// File transport configuration for general logs
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: logFormat,
  level: 'info',
});

// File transport for error logs only
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs longer
  format: logFormat,
  level: 'error',
});

// File transport for access logs (HTTP requests)
const accessFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'access-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '50m',
  maxFiles: '7d', // Access logs rotate faster
  format: logFormat,
  level: 'info',
});

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
  level: config.NODE_ENV === 'production' ? 'warn' : 'debug',
});

// Create the main application logger
export const logger = winston.createLogger({
  level:
    config.LOG_LEVEL || (config.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'survey-backend',
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  },
  transports: [
    fileTransport,
    errorFileTransport,
    ...(config.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// Create specialized loggers for different purposes
export const accessLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: {
    service: 'survey-backend-access',
    environment: config.NODE_ENV,
  },
  transports: [
    accessFileTransport,
    ...(config.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});

// Performance logger for tracking query times, cache hits, etc.
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: {
    service: 'survey-backend-performance',
    environment: config.NODE_ENV,
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'performance-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '7d',
      format: logFormat,
      level: 'info',
    }),
    ...(config.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});

// Security logger for authentication, authorization, and security events
export const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: {
    service: 'survey-backend-security',
    environment: config.NODE_ENV,
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '90d', // Keep security logs for 3 months
      format: logFormat,
      level: 'info',
    }),
    ...(config.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
});

/**
 * Utility functions for structured logging
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  error?: Record<string, unknown>;
}

export const logWithContext = {
  info: (message: string, context: LogContext = {}) => {
    logger.info(message, context);
  },

  warn: (message: string, context: LogContext = {}) => {
    logger.warn(message, context);
  },

  error: (message: string, error?: Error, context: LogContext = {}) => {
    logger.error(message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
  },

  debug: (message: string, context: LogContext = {}) => {
    logger.debug(message, context);
  },

  performance: (
    message: string,
    context: LogContext & {
      duration: number;
      operation: string;
    },
  ) => {
    performanceLogger.info(message, context);
  },

  access: (
    message: string,
    context: LogContext & {
      method: string;
      path: string;
      statusCode: number;
      userAgent?: string;
      ip?: string;
    },
  ) => {
    accessLogger.info(message, context);
  },

  security: (
    message: string,
    context: LogContext & {
      event: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
      ip?: string;
      userAgent?: string;
    },
  ) => {
    securityLogger.warn(message, {
      severity: 'medium',
      ...context,
    });
  },
};

// Log startup information
logger.info('Logger initialized', {
  logLevel: logger.level,
  environment: config.NODE_ENV,
  transports: logger.transports.length,
  logsDirectory: logsDir,
});

export default logger;
