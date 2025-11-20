// backend/src/middleware/security.ts
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import type { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';

/**
 * Security middleware configuration following OWASP guidelines
 * Implements multiple layers of protection against common web vulnerabilities
 */

/**
 * Helmet configuration for security headers
 * Protects against: XSS, Clickjacking, MIME sniffing, etc.
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // For development compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Compression middleware for better performance
 * Reduces response sizes for improved load times
 */
export const compressionConfig = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
});

/**
 * HTTP Parameter Pollution protection
 * Prevents attacks that use duplicate parameters
 */
export const hppConfig = hpp({
  whitelist: [], // Add parameter names that should allow arrays
});

/**
 * Input sanitization for PostgreSQL applications
 * Note: Prisma already provides excellent SQL injection protection via parameterized queries
 * This middleware focuses on general input cleaning and XSS prevention
 */
export const inputSanitizeConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      // Basic input cleaning - focus on XSS and dangerous characters
      return (
        value
          .trim()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
          // eslint-disable-next-line no-control-regex -- XSS prevention: control character detection
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      ); // Remove control characters
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
      }
      const sanitized: Record<string, unknown> = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key]);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body) as typeof req.body;
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query) as typeof req.query;
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params) as typeof req.params;
  }
  next();
};

/**
 * Request size limiting middleware
 * Prevents DoS attacks through large payloads
 */
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const maxSize = 1024 * 1024; // 1MB limit
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: {
        message: 'Request entity too large',
        type: 'PayloadTooLargeError',
        maxSize: '1MB',
      },
    });
  }

  next();
};

/**
 * Security headers middleware
 * Additional custom security headers
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Remove server fingerprinting
  res.removeHeader('X-Powered-By');

  // Additional security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Download-Options': 'noopen',
    'X-DNS-Prefetch-Control': 'off',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Feature-Policy': "camera 'none'; microphone 'none'; geolocation 'self'",
  });

  next();
};

/**
 * HTTPS redirect middleware for production
 * Enforces HTTPS connections in production environment
 */
export const httpsRedirect = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    config.NODE_ENV === 'production' &&
    !req.secure &&
    req.get('X-Forwarded-Proto') !== 'https'
  ) {
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }
  next();
};
