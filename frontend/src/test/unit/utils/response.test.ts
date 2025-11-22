import { describe, it, expect } from 'vitest';
import {
  isSuccessResponse,
  isErrorResponse,
  unwrapResponse,
  unwrapResponseOrDefault,
  mapResponse,
  responseUtils,
} from '@/utils/response';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from '@/utils/response';

describe('response utilities', () => {
  // ==================== Type Guards ====================

  describe('isSuccessResponse', () => {
    it('should return true for success responses', () => {
      const response: ApiSuccessResponse<{ id: number }> = {
        success: true,
        data: { id: 1 },
        timestamp: new Date().toISOString(),
      };
      expect(isSuccessResponse(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Not found',
          code: 'NOT_FOUND',
        },
      };
      expect(isSuccessResponse(response)).toBe(false);
    });

    it('should be a type guard that narrows type correctly', () => {
      const response: ApiResponse<string> = {
        success: true,
        data: 'test',
        timestamp: new Date().toISOString(),
      };

      if (isSuccessResponse(response)) {
        expect(response.data).toBe('test');
      }
    });
  });

  describe('isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      };
      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return false for success responses', () => {
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: 42,
        timestamp: new Date().toISOString(),
      };
      expect(isErrorResponse(response)).toBe(false);
    });

    it('should be a type guard that narrows type correctly', () => {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: 'Server error',
          code: 'INTERNAL_SERVER_ERROR',
          details: { reason: 'Database timeout' },
        },
      };

      if (isErrorResponse(response)) {
        expect(response.error.message).toBe('Server error');
      }
    });
  });

  // ==================== Unwrapping ====================

  describe('unwrapResponse', () => {
    it('should return data for success responses', () => {
      const response: ApiSuccessResponse<{ id: number }> = {
        success: true,
        data: { id: 123 },
        timestamp: new Date().toISOString(),
      };
      expect(unwrapResponse(response)).toEqual({ id: 123 });
    });

    it('should throw error for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'User not found',
          code: 'NOT_FOUND',
        },
      };
      expect(() => unwrapResponse(response)).toThrow('User not found');
    });

    it('should throw error with details if available', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: {
            email: 'Invalid email format',
            phone: 'Phone must be 10+ digits',
          },
        },
      };
      expect(() => unwrapResponse(response)).toThrow('Validation failed');
    });

    it('should work with various data types', () => {
      const stringResponse: ApiSuccessResponse<string> = {
        success: true,
        data: 'success',
        timestamp: new Date().toISOString(),
      };
      expect(unwrapResponse(stringResponse)).toBe('success');

      const arrayResponse: ApiSuccessResponse<number[]> = {
        success: true,
        data: [1, 2, 3],
        timestamp: new Date().toISOString(),
      };
      expect(unwrapResponse(arrayResponse)).toEqual([1, 2, 3]);

      const nullResponse: ApiSuccessResponse<null> = {
        success: true,
        data: null,
        timestamp: new Date().toISOString(),
      };
      expect(unwrapResponse(nullResponse)).toBeNull();
    });
  });

  describe('unwrapResponseOrDefault', () => {
    it('should return data for success responses', () => {
      const response: ApiSuccessResponse<{ count: number }> = {
        success: true,
        data: { count: 42 },
        timestamp: new Date().toISOString(),
      };
      const defaultValue = { count: 0 };
      expect(unwrapResponseOrDefault(response, defaultValue)).toEqual({
        count: 42,
      });
    });

    it('should return default value for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Failed to fetch',
          code: 'FETCH_ERROR',
        },
      };
      const defaultValue = { count: 0 };
      expect(unwrapResponseOrDefault(response, defaultValue)).toEqual(
        defaultValue,
      );
    });

    it('should not throw error for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      };
      const defaultValue = 'fallback';
      expect(() =>
        unwrapResponseOrDefault(response, defaultValue),
      ).not.toThrow();
      expect(unwrapResponseOrDefault(response, defaultValue)).toBe('fallback');
    });

    it('should work with null/undefined defaults', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Not found',
          code: 'NOT_FOUND',
        },
      };
      expect(unwrapResponseOrDefault(response, null)).toBeNull();
      expect(unwrapResponseOrDefault(response, undefined)).toBeUndefined();
    });
  });

  // ==================== Mapping ====================

  describe('mapResponse', () => {
    it('should transform data for success responses', () => {
      const response: ApiSuccessResponse<{ id: number; name: string }> = {
        success: true,
        data: { id: 1, name: 'Test' },
        timestamp: new Date().toISOString(),
      };

      const mapped = mapResponse(response, (data) => ({
        userId: data.id,
        userName: data.name.toUpperCase(),
      }));

      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toEqual({
          userId: 1,
          userName: 'TEST',
        });
      }
    });

    it('should preserve success response structure', () => {
      const timestamp = new Date().toISOString();
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: 42,
        timestamp,
      };

      const mapped = mapResponse(response, (n) => n * 2);

      expect(mapped.success).toBe(true);
      expect(mapped.timestamp).toBe(timestamp);
      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toBe(84);
      }
    });

    it('should return error response unchanged', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Error occurred',
          code: 'ERROR',
        },
      };

      const mapped = mapResponse(response, () => {
        throw new Error('Should not be called');
      });

      expect(isErrorResponse(mapped)).toBe(true);
      expect(mapped).toEqual(response);
    });

    it('should handle transformations with different return types', () => {
      const response: ApiSuccessResponse<string> = {
        success: true,
        data: '123',
        timestamp: new Date().toISOString(),
      };

      const mapped = mapResponse(response, (str) => parseInt(str, 10));

      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toBe(123);
        expect(typeof mapped.data).toBe('number');
      }
    });
  });

  // ==================== responseUtils Object ====================

  describe('responseUtils object', () => {
    it('should expose all functions with correct names', () => {
      expect(typeof responseUtils.isSuccess).toBe('function');
      expect(typeof responseUtils.isError).toBe('function');
      expect(typeof responseUtils.unwrap).toBe('function');
      expect(typeof responseUtils.unwrapOrDefault).toBe('function');
      expect(typeof responseUtils.map).toBe('function');
    });

    it('should work correctly through the object accessor', () => {
      const response: ApiSuccessResponse<{ value: string }> = {
        success: true,
        data: { value: 'test' },
        timestamp: new Date().toISOString(),
      };

      expect(responseUtils.isSuccess(response)).toBe(true);
      expect(responseUtils.unwrap(response)).toEqual({ value: 'test' });
    });
  });

  // ==================== Edge Cases ====================

  describe('edge cases', () => {
    it('should handle responses with complex nested data', () => {
      const response: ApiSuccessResponse<{
        users: Array<{ id: number; settings: { theme: string } }>;
      }> = {
        success: true,
        data: {
          users: [
            { id: 1, settings: { theme: 'dark' } },
            { id: 2, settings: { theme: 'light' } },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      const unwrapped = unwrapResponse(response);
      expect(unwrapped.users).toHaveLength(2);
      expect(unwrapped.users[0].settings.theme).toBe('dark');
    });

    it('should handle responses with empty objects', () => {
      const response: ApiSuccessResponse<Record<string, never>> = {
        success: true,
        data: {},
        timestamp: new Date().toISOString(),
      };

      expect(unwrapResponse(response)).toEqual({});
    });

    it('should handle error responses with no details', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'Unknown error',
          code: 'UNKNOWN',
        },
      };

      expect(() => unwrapResponse(response)).toThrow('Unknown error');
    });

    it('should handle mapResponse with identity function', () => {
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: 42,
        timestamp: new Date().toISOString(),
      };

      const mapped = mapResponse(response, (x) => x);
      expect(isSuccessResponse(mapped) && mapped.data).toBe(42);
    });
  });
});
