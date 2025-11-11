// backend/src/config/security.ts
import { config } from '@/config/env';

/**
 * Centralized security configuration
 * Provides security settings and validation rules
 */

export const securityConfig = {
  // Request size limits
  maxRequestSize: config.REQUEST_SIZE_LIMIT,
  maxJsonPayload: '1mb',
  maxUrlEncodedPayload: '1mb',

  // Rate limiting configuration
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // CORS configuration
  cors: {
    origins: config.CORS_ORIGINS.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    credentials: true,
    maxAge: 600, // 10 minutes
  },

  // Content Security Policy directives
  csp: {
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
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },

  // HSTS configuration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Input validation rules
  validation: {
    name: {
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
    },
    email: {
      maxLength: 100,
      normalizeOptions: {
        gmail_lowercase: true,
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_lowercase: true,
        yahoo_lowercase: true,
        icloud_lowercase: true,
      },
    },
    phone: {
      // eslint-disable-next-line no-useless-escape
      pattern: /^\+?[\d\s\-\(\)]{10,20}$/,
    },
    dateOfBirth: {
      minAge: 13,
      maxAge: 120,
    },
    ratings: {
      min: 1,
      max: 5,
    },
    foods: {
      allowed: [
        'Pizza',
        'Pasta',
        'Pap and Wors',
        'Chicken stir fry',
        'Beef stir fry',
        'Other',
      ],
      minSelection: 1,
      maxSelection: 10,
    },
  },

  // Security headers configuration
  securityHeaders: {
    // Prevent MIME type sniffing
    nosniff: true,

    // Prevent opening downloads in Internet Explorer
    ieNoOpen: true,

    // Control DNS prefetching
    dnsPrefetchControl: { allow: false },

    // Control permitted cross-domain policies
    permittedCrossDomainPolicies: false,

    // Referrer policy
    referrerPolicy: 'strict-origin-when-cross-origin',

    // Feature policy / Permissions policy
    permissionsPolicy: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'self'"],
      payment: ["'none'"],
      usb: ["'none'"],
    },
  },

  // Environment-specific overrides
  production: {
    httpsRedirect: config.SECURITY_HTTPS_REDIRECT,
    trustProxy: config.SECURITY_TRUST_PROXY,
    secureSessionCookies: true,
    strictTransportSecurity: true,
  },

  development: {
    httpsRedirect: false,
    trustProxy: false,
    secureSessionCookies: false,
    strictTransportSecurity: false,
    // Allow localhost origins
    additionalCorsOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ],
  },

  // Sanitization options
  sanitization: {
    // SQL injection prevention for PostgreSQL
    sqlSanitize: {
      // Dangerous SQL patterns to remove/sanitize
      dangerousPatterns: [
        /['";\\]/g, // Quotes and escapes
        /(-{2}|\/\*|\*\/)/g, // SQL comments
        /\b(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE|EXEC|EXECUTE)\b/gi, // Dangerous keywords
      ],
      // Note: Prisma already provides parameterized queries for primary protection
    },

    // HTTP Parameter Pollution prevention
    hpp: {
      whitelist: [], // Parameters that should allow arrays
    },

    // XSS prevention patterns
    xssPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ],
  },
} as const;

/**
 * Get environment-specific security configuration
 */
export function getSecurityConfig() {
  const baseConfig = { ...securityConfig };

  if (config.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      ...baseConfig.production,
    };
  }

  if (config.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      ...baseConfig.development,
      cors: {
        ...baseConfig.cors,
        origins: [
          ...baseConfig.cors.origins,
          ...baseConfig.development.additionalCorsOrigins,
        ],
      },
    };
  }

  return baseConfig;
}

/**
 * Security utility functions
 */
export const securityUtils = {
  /**
   * Check if a string contains potential XSS patterns
   */
  containsXSS(input: string): boolean {
    return securityConfig.sanitization.xssPatterns.some((pattern) =>
      pattern.test(input),
    );
  },

  /**
   * Validate age from date of birth
   */
  validateAge(dateOfBirth: string): {
    isValid: boolean;
    age?: number;
    error?: string;
  } {
    try {
      const dob = new Date(dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        // Haven't had birthday this year yet
        const adjustedAge = age - 1;

        if (adjustedAge < securityConfig.validation.dateOfBirth.minAge) {
          return {
            isValid: false,
            error: `Minimum age is ${securityConfig.validation.dateOfBirth.minAge}`,
          };
        }

        if (adjustedAge > securityConfig.validation.dateOfBirth.maxAge) {
          return {
            isValid: false,
            error: `Maximum age is ${securityConfig.validation.dateOfBirth.maxAge}`,
          };
        }

        return { isValid: true, age: adjustedAge };
      }

      if (
        age < securityConfig.validation.dateOfBirth.minAge ||
        age > securityConfig.validation.dateOfBirth.maxAge
      ) {
        return {
          isValid: false,
          error: `Age must be between ${securityConfig.validation.dateOfBirth.minAge}-${securityConfig.validation.dateOfBirth.maxAge}`,
        };
      }

      return { isValid: true, age };
    } catch {
      return { isValid: false, error: 'Invalid date format' };
    }
  },

  /**
   * Validate food selections
   */
  validateFoods(foods: string[]): { isValid: boolean; error?: string } {
    const { allowed, minSelection, maxSelection } =
      securityConfig.validation.foods;

    if (!Array.isArray(foods)) {
      return { isValid: false, error: 'Foods must be an array' };
    }

    if (foods.length < minSelection || foods.length > maxSelection) {
      return {
        isValid: false,
        error: `Select ${minSelection}-${maxSelection} food preferences`,
      };
    }

    const invalid = foods.filter(
      (food) => !(allowed as readonly string[]).includes(food),
    );
    if (invalid.length > 0) {
      return {
        isValid: false,
        error: `Invalid food options: ${invalid.join(', ')}`,
      };
    }

    return { isValid: true };
  },

  /**
   * Generate security headers for responses
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Download-Options': 'noopen',
      'X-DNS-Prefetch-Control': 'off',
      'X-Permitted-Cross-Domain-Policies': 'none',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
    };
  },
};
