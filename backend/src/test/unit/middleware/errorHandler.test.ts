// backend/src/test/unit/middleware/errorHandler.test.ts
import { describe, it, beforeEach, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '@/middleware/errorHandler';
import { z } from 'zod';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '@/test/utils/test-helpers';

describe('errorHandler Middleware', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('ZodError handling', () => {
    it('should return 400 with validation details for ZodError', () => {
      const schema = z.object({ email: z.string().email() });
      const result = schema.safeParse({ email: 'not-an-email' });
      if (result.success) throw new Error('Expected failure');

      errorHandler(result.error, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const body = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(body.error.message).toBe('Validation failed');
      expect(body.error.details).toBeDefined();
    });
  });

  describe('Generic Error handling', () => {
    it('should return 500 with masked message for generic errors', () => {
      errorHandler(
        new Error('DB password: secret'),
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      const body = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(body.error.message).toBe('Internal server error');
    });

    it('should return 404 when error message contains "not found"', () => {
      errorHandler(
        new Error('Record not found'),
        mockRequest,
        mockResponse,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      const body = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(body.error.message).toBe('Record not found');
    });
  });

  describe('Non-Error handling', () => {
    it('should return 500 for non-Error objects', () => {
      errorHandler({ weird: 'object' }, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      const body = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(body.error.message).toBe('Internal server error');
    });

    it('should return 500 for null errors', () => {
      errorHandler(null, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledOnce();
    });
  });
});
