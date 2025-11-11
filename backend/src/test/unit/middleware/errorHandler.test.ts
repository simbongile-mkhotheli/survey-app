// backend/src/test/unit/middleware/errorHandler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '@/middleware/errorHandler';
import { ValidationError, DatabaseError } from '@/errors/AppError';
import { ZodError } from 'zod';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '@/test/utils/test-helpers';

describe('errorHandler Middleware', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Custom AppError Handling', () => {
    it('should handle ValidationError with 400 status and proper error structure', () => {
      // Arrange
      const validationError = new ValidationError('Invalid email format');

      // Act
      errorHandler(validationError, mockRequest, mockResponse, mockNext);

      // Assert - Verify correct status code for validation errors
      expect(mockResponse.status).toHaveBeenCalledOnce();
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Assert - Verify error response structure
      expect(mockResponse.json).toHaveBeenCalledOnce();
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toHaveProperty(
        'message',
        'Invalid email format',
      );
      expect(responseData.error).toHaveProperty('type', 'ValidationError');

      // Assert - Verify next is NOT called (error is handled)
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle DatabaseError with 500 status', () => {
      // Arrange
      const dbError = new DatabaseError('Connection timeout');

      // Act
      errorHandler(dbError, mockRequest, mockResponse, mockNext);

      // Assert - Verify correct status code for database errors
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      // Assert - Verify error message and type
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.message).toBe('Connection timeout');
      expect(responseData.error.type).toBe('DatabaseError');
    });

    it('should include stack trace in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new ValidationError('Test error');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert - Verify stack trace is included in development
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error).toHaveProperty('stack');
      expect(typeof responseData.error.stack).toBe('string');
    });

    it('should NOT include stack trace in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const error = new ValidationError('Test error');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert - Verify stack trace is excluded in production
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error).not.toHaveProperty('stack');
    });
  });

  describe('Zod Validation Error Handling', () => {
    it('should transform ZodError into ValidationError with field details', () => {
      // Arrange - Create a Zod validation error
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          path: ['firstName'],
          message: 'String must contain at least 1 character(s)',
        },
      ]);

      // Act
      errorHandler(zodError, mockRequest, mockResponse, mockNext);

      // Assert - Verify 400 status for validation errors
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      // Assert - Verify error structure
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.message).toBe('Validation failed');
      expect(responseData.error.type).toBe('ValidationError');

      // Assert - Verify field-specific error details are included
      expect(responseData.error).toHaveProperty('details');
      expect(responseData.error.details).toBeDefined();
    });

    it('should handle ZodError with single field error', () => {
      // Arrange
      const zodError = new ZodError([
        {
          code: 'invalid_string',
          validation: 'email',
          path: ['email'],
          message: 'Invalid email',
        },
      ]);

      // Act
      errorHandler(zodError, mockRequest, mockResponse, mockNext);

      // Assert - Verify proper transformation
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.type).toBe('ValidationError');
    });
  });

  describe('Prisma Database Error Handling', () => {
    it('should handle Prisma error with code property', () => {
      // Arrange - Simulate Prisma error structure
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the fields: (`email`)',
      };

      // Act
      errorHandler(prismaError, mockRequest, mockResponse, mockNext);

      // Assert - Verify 500 status for database errors
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      // Assert - Verify error is transformed to DatabaseError
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.message).toBe('Database operation failed');
      expect(responseData.error.type).toBe('DatabaseError');
    });

    it('should include Prisma error code in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const prismaError = { code: 'P2025', message: 'Record not found' };

      // Act
      errorHandler(prismaError, mockRequest, mockResponse, mockNext);

      // Assert - Verify Prisma code is included for debugging
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error).toHaveProperty('code', 'P2025');
    });

    it('should NOT include Prisma error code in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const prismaError = { code: 'P2025', message: 'Record not found' };

      // Act
      errorHandler(prismaError, mockRequest, mockResponse, mockNext);

      // Assert - Verify code is excluded in production
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error).not.toHaveProperty('code');
    });
  });

  describe('Unknown Error Handling', () => {
    it('should handle generic Error with 500 status', () => {
      // Arrange
      const genericError = new Error('Something went wrong');

      // Act
      errorHandler(genericError, mockRequest, mockResponse, mockNext);

      // Assert - Verify 500 status for unknown errors
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      // Assert - Verify generic error response
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.message).toBe('Internal server error');
      expect(responseData.error.type).toBe('UnknownError');
    });

    it('should handle non-Error objects safely', () => {
      // Arrange - Test with non-standard error objects
      const strangeError = { weird: 'object' };

      // Act
      errorHandler(strangeError, mockRequest, mockResponse, mockNext);

      // Assert - Verify graceful handling
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.type).toBe('UnknownError');
    });

    it('should handle null/undefined errors safely', () => {
      // Arrange
      const nullError = null;

      // Act
      errorHandler(nullError, mockRequest, mockResponse, mockNext);

      // Assert - Verify safe handling of null
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledOnce();
    });

    it('should include error details in development mode for generic errors', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const error = new Error('Detailed error message');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert - Verify details are included for debugging
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error).toHaveProperty('details');
      expect(responseData.error.details).toBe('Detailed error message');
    });
  });

  describe('Error Response Structure', () => {
    it('should always return consistent error structure', () => {
      // Arrange
      const error = new ValidationError('Test');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert - Verify consistent structure
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData).toHaveProperty('error');
      expect(responseData.error).toHaveProperty('message');
      expect(responseData.error).toHaveProperty('type');
      expect(typeof responseData.error.message).toBe('string');
      expect(typeof responseData.error.type).toBe('string');
    });

    it('should not leak sensitive information in production', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const sensitiveError = new Error(
        'Database password incorrect: secret123',
      );

      // Act
      errorHandler(sensitiveError, mockRequest, mockResponse, mockNext);

      // Assert - Verify sensitive details are hidden
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData.error.message).toBe('Internal server error');
      expect(responseData.error).not.toHaveProperty('details');
      expect(responseData.error).not.toHaveProperty('stack');
    });
  });
});
