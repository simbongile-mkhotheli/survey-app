// backend/src/middleware/security.ts
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import {
  body,
  validationResult,
  type ValidationChain,
} from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { config } from '@/config/env';
import { ValidationError } from '@/errors/AppError';

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
 * Input validation middleware factory
 * Creates express-validator middleware with custom error formatting
 */
export const validateInput = (validations: ValidationChain[]) => {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationError = new ValidationError('Input validation failed');
        return res.status(validationError.statusCode).json({
          error: {
            message: validationError.message,
            type: validationError.name,
            details: errors.array().reduce(
              (acc, error) => {
                if ('param' in error && typeof error.param === 'string') {
                  acc[error.param] = error.msg;
                }
                return acc;
              },
              {} as Record<string, string>,
            ),
          },
        });
      }
      next();
    },
  ];
};

/**
 * Survey input validation rules
 * Comprehensive validation for survey submission endpoint
 */
export const surveyValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name contains invalid characters'),

  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name contains invalid characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),

  body('contactNumber')
    .trim()
    // eslint-disable-next-line no-useless-escape -- Phone regex requires escaped parens
    .matches(/^\+?[\d\s\-\(\)]{10,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('dateOfBirth')
    .isISO8601({ strict: true })
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13-120 years');
      }
      return true;
    }),

  body('foods')
    .isArray({ min: 1, max: 10 })
    .withMessage('Please select 1-10 food preferences')
    .custom((foods: string[]) => {
      const allowedFoods = [
        'Pizza',
        'Pasta',
        'Pap and Wors',
        'Chicken stir fry',
        'Beef stir fry',
        'Other',
      ];
      const invalid = foods.filter((food) => !allowedFoods.includes(food));
      if (invalid.length > 0) {
        throw new Error(`Invalid food options: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('ratingMovies')
    .isInt({ min: 1, max: 5 })
    .withMessage('Movie rating must be between 1-5'),

  body('ratingRadio')
    .isInt({ min: 1, max: 5 })
    .withMessage('Radio rating must be between 1-5'),

  body('ratingEatOut')
    .isInt({ min: 1, max: 5 })
    .withMessage('Eat out rating must be between 1-5'),

  body('ratingTV')
    .isInt({ min: 1, max: 5 })
    .withMessage('TV rating must be between 1-5'),
];

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
