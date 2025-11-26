// backend/src/test/security-basic.test.ts - Basic security middleware tests
import request from 'supertest';
import express, { Request, Response } from 'express';
import {
  helmetConfig,
  compressionConfig,
  hppConfig,
  inputSanitizeConfig,
  requestSizeLimit,
  securityHeaders,
} from '@/middleware/security';

describe('Basic Security Middleware Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    vi.clearAllMocks();
  });

  describe('Security Headers Middleware', () => {
    it('should set custom security headers', async () => {
      app.use(securityHeaders);
      app.get('/test', (req: Request, res: Response) =>
        res.json({ success: true }),
      );

      const response = await request(app).get('/test').expect(200);

      // Basic security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-download-options']).toBe('noopen');
      expect(response.headers['x-dns-prefetch-control']).toBe('off');
      expect(response.headers['x-permitted-cross-domain-policies']).toBe(
        'none',
      );
      expect(response.headers['referrer-policy']).toBe(
        'strict-origin-when-cross-origin',
      );

      // Advanced security headers
      expect(response.headers['permissions-policy']).toBeDefined();
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['expect-ct']).toBeDefined();
    });

    it('should remove X-Powered-By header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req: Request, res: Response) =>
        res.json({ success: true }),
      );

      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should have comprehensive Permissions-Policy header', async () => {
      app.use(securityHeaders);
      app.get('/test', (req: Request, res: Response) =>
        res.json({ success: true }),
      );

      const response = await request(app).get('/test').expect(200);

      const policy = response.headers['permissions-policy'] as string;
      expect(policy).toContain('accelerometer=()');
      expect(policy).toContain('camera=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('geolocation=()');
      expect(policy).toContain('payment=()');
      expect(policy).toContain('fullscreen=(self)');
    });

    it('should have Expect-CT header for certificate transparency', async () => {
      app.use(securityHeaders);
      app.get('/test', (req: Request, res: Response) =>
        res.json({ success: true }),
      );

      const response = await request(app).get('/test').expect(200);

      const expectCt = response.headers['expect-ct'] as string;
      expect(expectCt).toContain('max-age=86400');
      expect(expectCt).toContain('enforce');
    });
  });

  describe('Helmet Security Headers', () => {
    it('should set helmet security headers', async () => {
      app.use(helmetConfig);
      app.get('/test', (req: Request, res: Response) =>
        res.json({ success: true }),
      );

      const response = await request(app).get('/test').expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });

  describe('Request Size Limit Middleware', () => {
    it('should reject requests exceeding size limit', async () => {
      app.use(requestSizeLimit);
      app.use(express.json());
      app.post('/test', (req: Request, res: Response) =>
        res.json({ received: req.body }),
      );

      const response = await request(app)
        .post('/test')
        .set('Content-Length', (2 * 1024 * 1024).toString()) // 2MB
        .expect(413);

      expect(response.body.error.message).toBe('Request entity too large');
      expect(response.body.error.type).toBe('PayloadTooLargeError');
    });

    it('should allow requests within size limit', async () => {
      app.use(requestSizeLimit);
      app.use(express.json());
      app.post('/test', (req: Request, res: Response) =>
        res.json({ received: req.body }),
      );

      const smallPayload = { data: 'small data' };

      await request(app).post('/test').send(smallPayload).expect(200);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize XSS and dangerous input', async () => {
      app.use(express.json());
      app.use(inputSanitizeConfig);
      app.post('/test', (req: Request, res: Response) => {
        res.json({ received: req.body });
      });

      const maliciousPayload = {
        name: '<script>alert("xss")</script>John',
        message: 'Hello javascript:alert("xss") world',
        onclick: 'onclick=alert("xss")',
        normalField: '  normalValue  ',
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      // Input sanitization should have processed the dangerous fields
      expect(response.body.received.normalField).toBe('normalValue'); // trimmed
      expect(response.body.received.name).not.toContain('<script>');
      expect(response.body.received.message).not.toContain('javascript:');
      expect(response.body.received.onclick).not.toContain('onclick=');
      expect(response.body.received.name).toContain('John'); // keeps safe content
    });
  });

  describe('HTTP Parameter Pollution', () => {
    it('should prevent parameter pollution', async () => {
      app.use(express.urlencoded({ extended: true }));
      app.use(hppConfig);
      app.get('/test', (req: Request, res: Response) => {
        res.json({ query: req.query });
      });

      const response = await request(app)
        .get('/test?param=value1&param=value2')
        .expect(200);

      // HPP should keep only the last value
      expect(response.body.query.param).toBe('value2');
    });
  });

  describe('Compression', () => {
    it('should compress responses', async () => {
      app.use(compressionConfig);
      app.get('/test', (req: Request, res: Response) => {
        const largeResponse = 'x'.repeat(1000);
        res.json({ data: largeResponse });
      });

      const response = await request(app)
        .get('/test')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Should have compression headers when enabled
      expect(response.body.data).toBe('x'.repeat(1000));
    });
  });

  describe('Security Integration', () => {
    it('should apply multiple security layers correctly', async () => {
      // Apply security middleware in correct order
      app.use(securityHeaders);
      app.use(helmetConfig);
      app.use(compressionConfig);
      app.use(requestSizeLimit);
      app.use(hppConfig);
      app.use(inputSanitizeConfig);
      app.use(express.json());

      app.post('/secure-endpoint', (req: Request, res: Response) => {
        res.json({ success: true, secure: true, received: req.body });
      });

      const validPayload = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      };

      const response = await request(app)
        .post('/secure-endpoint')
        .send(validPayload)
        .expect(200);

      // Verify security headers are present
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['content-security-policy']).toBeDefined();

      // Verify successful processing
      expect(response.body.success).toBe(true);
      expect(response.body.secure).toBe(true);
      expect(response.body.received.name).toBe('John Doe');
    });

    it('should reject malicious requests at multiple layers', async () => {
      app.use(securityHeaders);
      app.use(requestSizeLimit);
      app.use(express.json());
      app.use(inputSanitizeConfig);

      app.post('/secure-endpoint', (req: Request, res: Response) => {
        res.json({ received: req.body });
      });

      // Test with large payload (should be rejected by size limit)
      const response = await request(app)
        .post('/secure-endpoint')
        .set('Content-Length', (2 * 1024 * 1024).toString())
        .expect(413);

      expect(response.body.error.type).toBe('PayloadTooLargeError');
    });
  });
});
