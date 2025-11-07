// backend/src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import swaggerUi from 'swagger-ui-express';

import surveyRouter from '@/routes/survey';
import resultsRouter from '@/routes/results';
import monitoringRouter from '@/routes/monitoring';
import { errorHandler } from '@/middleware/errorHandler';
import { swaggerSpec } from '@/config/swagger';
import { 
  helmetConfig, 
  compressionConfig, 
  hppConfig, 
  inputSanitizeConfig,
  requestSizeLimit,
  rateLimitByIP,
  securityHeaders,
  httpsRedirect
} from '@/middleware/security';
import { performanceTracker, performanceEndpoint } from '@/middleware/performance';
import { requestContext, accessLogging, errorLogging } from '@/middleware/logging';
import { metricsMiddleware, metricsEndpoint, metricsDashboard } from '@/middleware/metrics';
import { errorTrackingMiddleware, errorAnalytics, errorSummary } from '@/middleware/errorTracking';
import { healthCheck, livenessProbe, readinessProbe } from '@/middleware/healthCheck';
import { cacheManager } from '@/config/cache';
import { logger } from '@/config/logger';
import { config } from '@/config/env';

dotenv.config();

const app = express();

// Security middleware setup - order matters!
// 1. HTTPS redirect (must be first)
app.use(httpsRedirect);

// 2. Trust proxy for secure headers
if (config.SECURITY_TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// 3. Helmet for security headers
app.use(helmetConfig);

// 4. Custom security headers
app.use(securityHeaders);

// 5. Compression for performance
app.use(compressionConfig);

// 6. Request size limiting
app.use(requestSizeLimit);

// 7. Rate limiting by IP
app.use(rateLimitByIP);

// 8. HTTP Parameter Pollution protection
app.use(hppConfig);

// 9. Input sanitization (XSS prevention, Prisma handles SQL injection)
app.use(inputSanitizeConfig);

// 10. CORS configuration
const origins = config.CORS_ORIGINS.split(',').map((s) => s.trim());
app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Allow non-browser tools (Postman, curl)
      if (!incomingOrigin) return callback(null, true);
      if (origins.includes(incomingOrigin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS denied: ${incomingOrigin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    maxAge: 600,
  })
);

// 11. Body parsing with size limits
app.use(express.json({ 
  limit: `${config.REQUEST_SIZE_LIMIT}b`,
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: `${config.REQUEST_SIZE_LIMIT}b` 
}));

// 12. Monitoring and Logging Middleware
app.use(requestContext);        // Request ID and context
app.use(accessLogging);         // HTTP access logging
app.use(metricsMiddleware);     // Prometheus metrics collection
app.use(performanceTracker);    // Performance monitoring

// API Documentation - Swagger UI
if (config.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Survey API Documentation',
    customfavIcon: '/favicon.ico',
  }));
  
  // Serve raw OpenAPI spec for client generation
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// API Routes
app.use('/api/survey', surveyRouter);
app.use('/api/results', resultsRouter);

// Monitoring Routes (centralized)
app.use('/api/monitoring', monitoringRouter);

// Direct health and metrics endpoints (for load balancers/orchestrators)
app.get('/health', healthCheck);
app.get('/health/live', livenessProbe);
app.get('/health/ready', readinessProbe);
app.get('/metrics', metricsEndpoint);

// Development endpoints for detailed monitoring
if (config.NODE_ENV !== 'production') {
  // Performance monitoring endpoint
  app.get('/api/performance', performanceEndpoint);
  
  // Cache health endpoint (detailed)
  app.get('/api/health/cache', async (req, res) => {
    const health = await cacheManager.healthCheck();
    const stats = cacheManager.getCacheStats();
    
    res.json({
      health,
      stats,
      timestamp: new Date().toISOString(),
    });
  });
}

// 404 handler for undefined routes
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handling middleware (order matters!)
app.use(errorLogging);          // Error logging middleware
app.use(errorTrackingMiddleware); // Error tracking and analytics
app.use(errorHandler);          // Global error handler (must be last)

// Export app for testing and only listen when run directly
if (config.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    logger.info('Server started successfully', {
      operation: 'server_startup',
      metadata: {
        port: config.PORT,
        environment: config.NODE_ENV,
        url: `http://localhost:${config.PORT}`,
        endpoints: {
          api: `http://localhost:${config.PORT}/api`,
          health: `http://localhost:${config.PORT}/health`,
          metrics: `http://localhost:${config.PORT}/metrics`,
          docs: config.NODE_ENV !== 'production' ? `http://localhost:${config.PORT}/api-docs` : undefined
        }
      }
    });
  });
}

export default app;
