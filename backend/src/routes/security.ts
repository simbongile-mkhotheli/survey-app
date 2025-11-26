// backend/src/routes/security.ts
// Security-related routes for CSP reporting and security monitoring

import { Router, Request, Response } from 'express';
import { logger } from '@/config/logger';

const router = Router();

/**
 * CSP Violation Reporting Endpoint
 * Collects Content Security Policy violation reports
 * Helps identify XSS attacks and misconfigurations
 *
 * @route POST /api/csp-report
 * @security This is typically called by browser automatically on CSP violations
 */
router.post('/csp-report', (req: Request, res: Response) => {
  const violation = req.body;

  if (violation) {
    logger.warn('CSP Violation Reported', {
      'violated-directive': violation['violated-directive'],
      'blocked-uri': violation['blocked-uri'],
      'source-file': violation['source-file'],
      'line-number': violation['line-number'],
      'column-number': violation['column-number'],
      disposition: violation.disposition,
    });
  }

  res.status(204).send();
});

/**
 * Security Headers Info Endpoint
 * Returns information about security headers configured
 * Useful for security audits and testing
 *
 * @route GET /api/security/headers
 */
router.get('/headers', (req: Request, res: Response) => {
  // This would typically show headers applied by middleware
  res.json({
    securityHeaders: {
      'Content-Security-Policy':
        'Implemented via Helmet - restricts script/style/frame sources',
      'Strict-Transport-Security':
        'HSTS enabled - 1 year max-age, includeSubDomains, preload',
      'X-Content-Type-Options': 'nosniff - prevents MIME sniffing',
      'X-Frame-Options': 'DENY - prevents clickjacking',
      'X-XSS-Protection': 'Enabled for legacy browsers',
      'Permissions-Policy':
        'Disables powerful browser features (camera, microphone, etc.)',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
    recommendations: [
      'Always use HTTPS in production',
      'Keep dependencies updated',
      'Regularly audit security headers',
      'Monitor CSP violations',
      'Use security scanning tools',
    ],
  });
});

/**
 * Nonce Generation for CSP
 * Generates cryptographically secure nonces for inline scripts/styles
 * These nonces bypass CSP restrictions for trusted code
 *
 * @route GET /api/security/nonce
 */
router.get('/nonce', (req: Request, res: Response) => {
  // Generate a secure random nonce
  const nonce = Buffer.from(Math.random().toString()).toString('base64');

  res.json({
    nonce,
    expiresIn: 300, // 5 minutes
    usage: 'Include nonce="VALUE" in <script> or <style> tags',
  });
});

export default router;
