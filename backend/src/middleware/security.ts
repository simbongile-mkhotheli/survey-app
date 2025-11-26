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
 * OWASP A05:2021 - Broken Access Control & A01:2021 - Injection
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      // Default: restrict to self unless explicitly allowed
      defaultSrc: ["'self'"],
      // Scripts: only from self, no inline (except for critical initializers)
      scriptSrc: ["'self'"],
      // Styles: self + unsafe-inline (React inline styles)
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Images: self, data URIs, and HTTPS sources
      imgSrc: ["'self'", 'data:', 'https:'],
      // Connections: API calls to self only
      connectSrc: ["'self'"],
      // Fonts: self only
      fontSrc: ["'self'"],
      // Objects/plugins: complete prohibition
      objectSrc: ["'none'"],
      // Media: self only
      mediaSrc: ["'self'"],
      // Frames: complete prohibition to prevent clickjacking
      frameSrc: ["'none'"],
      // Forms: self only
      formAction: ["'self'"],
      // Base URI: prevent injection of base tags
      baseUri: ["'self'"],
    },
  },
  // Cross-Origin policies
  crossOriginEmbedderPolicy: false, // For frontend/backend separation compatibility
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  // HSTS: enforce HTTPS for 1 year
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true, // Allow HSTS preload list inclusion
  },
  // X-Frame-Options: prevent clickjacking
  frameguard: { action: 'deny' },
  // X-Content-Type-Options: prevent MIME sniffing
  noSniff: true,
  // XSS Filter (legacy, but still useful for older browsers)
  xssFilter: true,
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
 * Additional custom security headers for advanced protection
 * OWASP A01:2021 - Broken Access Control & A05:2021 - Broken Access Control
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Remove server fingerprinting - don't reveal technology stack
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Comprehensive security headers
  res.set({
    // MIME type security
    'X-Content-Type-Options': 'nosniff',
    'X-Download-Options': 'noopen',
    // DNS security
    'X-DNS-Prefetch-Control': 'off',
    // Cross-domain policy
    'X-Permitted-Cross-Domain-Policies': 'none',
    // Referrer policy: strict-origin-when-cross-origin for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Permissions-Policy: modern replacement for Feature-Policy
    // Disable all powerful browser features for security
    'Permissions-Policy':
      'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), ' +
      'cross-origin-isolated=(), display-capture=(), document-domain=(), ' +
      'encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), ' +
      'fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), ' +
      'microphone=(), midi=(), navigation-override=(), payment=(), ' +
      'picture-in-picture=(), publickey-credentials-get=(), ' +
      'sync-xhr=(), usb=(), xr-spatial-tracking=()',
    // Prevent MIME type sniffing in older browsers
    'X-Frame-Options': 'DENY',
    // Expect-CT: for certificate transparency monitoring
    'Expect-CT': 'max-age=86400, enforce',
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
