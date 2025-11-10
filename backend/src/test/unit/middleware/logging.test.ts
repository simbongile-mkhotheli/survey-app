// backend/src/test/unit/middleware/logging.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requestContext, accessLogging } from '@/middleware/logging';
import { createMockRequest, createMockResponse, createMockNext } from '@/test/utils/test-helpers';

// Extend Request type to include custom properties added by middleware
interface RequestWithContext extends Request {
  requestId: string;
  startTime: number;
  clientIp: string;
}

// Mock the logger
vi.mock('@/config/logger', () => ({
  logWithContext: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Logging Middleware', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    
    // Set up default request properties
    (mockRequest as unknown as Record<string, unknown>).headers = {};
    (mockRequest as unknown as Record<string, unknown>).connection = { remoteAddress: '127.0.0.1' };
    (mockRequest as unknown as Record<string, unknown>).socket = { remoteAddress: '127.0.0.1' };
  });

  describe('requestContext', () => {
    it('should generate unique request ID when not provided', () => {
      // Arrange - No x-request-id header

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify request ID was generated
      expect(mockRequest.requestId).toBeDefined();
      expect(typeof mockRequest.requestId).toBe('string');
      expect(mockRequest.requestId.length).toBeGreaterThan(0);

      // Assert - Verify UUID format (basic check)
      expect(mockRequest.requestId).toMatch(/^[a-f0-9-]{36}$/i);
    });

    it('should use provided x-request-id header when available', () => {
      // Arrange
      const customRequestId = 'custom-req-id-12345';
      mockRequest.headers['x-request-id'] = customRequestId;

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify custom request ID is used
      expect(mockRequest.requestId).toBe(customRequestId);
    });

    it('should set start time on request', () => {
      // Arrange
      const beforeTime = Date.now();

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify start time is set and reasonable
      expect(mockRequest.startTime).toBeDefined();
      expect(typeof mockRequest.startTime).toBe('number');
      expect(mockRequest.startTime).toBeGreaterThanOrEqual(beforeTime);
      expect(mockRequest.startTime).toBeLessThanOrEqual(Date.now());
    });

    it('should extract client IP from x-forwarded-for header', () => {
      // Arrange - Simulate proxy forwarding
      mockRequest.headers['x-forwarded-for'] = '203.0.113.1, 198.51.100.1';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify first IP is extracted (client IP)
      expect(mockRequest.clientIp).toBe('203.0.113.1');
    });

    it('should extract client IP from x-real-ip header', () => {
      // Arrange
      mockRequest.headers['x-real-ip'] = '192.168.1.100';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify x-real-ip is used
      expect(mockRequest.clientIp).toBe('192.168.1.100');
    });

    it('should fallback to connection remote address for client IP', () => {
      // Arrange - No proxy headers
      (mockRequest as unknown as Record<string, unknown>).connection = { remoteAddress: '10.0.0.5' };

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify fallback to connection address
      expect((mockRequest as RequestWithContext).clientIp).toBe('10.0.0.5');
    });

    it('should handle missing IP gracefully', () => {
      // Arrange - Remove all IP sources
      const req = mockRequest as unknown as Record<string, Record<string, unknown>>;
      delete req.headers['x-forwarded-for'];
      delete req.headers['x-real-ip'];
      delete req.connection.remoteAddress;
      delete req.socket.remoteAddress;

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify default value
      expect((mockRequest as RequestWithContext).clientIp).toBe('unknown');
    });

    it('should add X-Request-ID to response headers', () => {
      // Arrange
      const customId = 'response-id-test';
      mockRequest.headers['x-request-id'] = customId;

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify response header is set
      expect(mockResponse.setHeader).toHaveBeenCalledOnce();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', customId);
    });

    it('should call next to continue middleware chain', () => {
      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify next is called
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should handle requests with query parameters', () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '10' };
      (mockRequest as unknown as Record<string, unknown>).path = '/api/results';
      (mockRequest as unknown as Record<string, unknown>).method = 'GET';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify middleware completes successfully
      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as RequestWithContext).requestId).toBeDefined();
    });

    it('should extract user agent from headers', () => {
      // Arrange
      mockRequest.headers['user-agent'] = 'Mozilla/5.0 (Test Browser)';
      (mockRequest as unknown as Record<string, unknown>).get = vi.fn((header: string) => {
        if (header === 'User-Agent') return 'Mozilla/5.0 (Test Browser)';
        return undefined;
      });

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify request completes
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('accessLogging', () => {
    it('should call next immediately to not block request', () => {
      // Act
      accessLogging(mockRequest, mockResponse, mockNext);

      // Assert - Verify next is called (non-blocking)
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should not throw errors with minimal request object', () => {
      // Arrange - Minimal request
      const minimalRequest = {
        ...mockRequest,
        method: 'GET',
        path: '/',
      } as unknown as Request;

      // Act & Assert - Should not throw
      expect(() => {
        accessLogging(minimalRequest, mockResponse, mockNext);
      }).not.toThrow();
    });
  });

  describe('Request ID Generation', () => {
    it('should generate unique IDs for different requests', () => {
      // Arrange
      const mockRequest1 = createMockRequest();
      const mockRequest2 = createMockRequest();
      const mockResponse1 = createMockResponse();
      const mockResponse2 = createMockResponse();
      const mockNext1 = createMockNext();
      const mockNext2 = createMockNext();

      mockRequest1.headers = {};
      mockRequest2.headers = {};
      (mockRequest1 as unknown as Record<string, unknown>).connection = { remoteAddress: '127.0.0.1' };
      (mockRequest2 as unknown as Record<string, unknown>).connection = { remoteAddress: '127.0.0.1' };

      // Act
      requestContext(mockRequest1 as unknown as RequestWithContext, mockResponse1, mockNext1);
      requestContext(mockRequest2 as unknown as RequestWithContext, mockResponse2, mockNext2);

      // Assert - Verify IDs are unique
      expect((mockRequest1 as unknown as RequestWithContext).requestId).toBeDefined();
      expect((mockRequest2 as unknown as RequestWithContext).requestId).toBeDefined();
      expect((mockRequest1 as unknown as RequestWithContext).requestId).not.toBe((mockRequest2 as unknown as RequestWithContext).requestId);
    });
  });

  describe('IP Address Priority', () => {
    it('should prioritize x-forwarded-for over x-real-ip', () => {
      // Arrange
      mockRequest.headers['x-forwarded-for'] = '1.2.3.4';
      mockRequest.headers['x-real-ip'] = '5.6.7.8';
      (mockRequest.connection as unknown as Record<string, unknown>).remoteAddress = '9.10.11.12';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify x-forwarded-for takes priority
      expect((mockRequest as RequestWithContext).clientIp).toBe('1.2.3.4');
    });

    it('should prioritize x-real-ip over connection address', () => {
      // Arrange
      mockRequest.headers['x-real-ip'] = '5.6.7.8';
      (mockRequest.connection as unknown as Record<string, unknown>).remoteAddress = '9.10.11.12';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify x-real-ip takes priority
      expect((mockRequest as RequestWithContext).clientIp).toBe('5.6.7.8');
    });

    it('should handle multiple IPs in x-forwarded-for and extract first', () => {
      // Arrange - Simulate chain of proxies
      mockRequest.headers['x-forwarded-for'] = '203.0.113.1, 198.51.100.1, 192.168.1.1';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify original client IP (first in chain)
      expect(mockRequest.clientIp).toBe('203.0.113.1');
    });

    it('should trim whitespace from x-forwarded-for IPs', () => {
      // Arrange - IPs with extra whitespace
      mockRequest.headers['x-forwarded-for'] = '  203.0.113.1  ,  198.51.100.1  ';

      // Act
      requestContext(mockRequest, mockResponse, mockNext);

      // Assert - Verify whitespace is trimmed
      expect(mockRequest.clientIp).toBe('203.0.113.1');
    });
  });
});
