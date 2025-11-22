import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
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
import {
  createRandomErrorMessage,
  createRandomErrorCode,
} from '../../../test/utils/test-helpers';

describe('response utilities', () => {
  // ==================== Type Guards ====================

  describe('isSuccessResponse', () => {
    it('should return true for success responses', () => {
      const response: ApiSuccessResponse<{ id: number }> = {
        success: true,
        data: { id: faker.number.int({ min: 1, max: 1000 }) },
        timestamp: faker.date.past().toISOString(),
      };
      expect(isSuccessResponse(response)).toBe(true);
    });

    it('should return false for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
        },
      };
      expect(isSuccessResponse(response)).toBe(false);
    });

    it('should be a type guard that narrows type correctly', () => {
      const testData = faker.lorem.word();
      const response: ApiResponse<string> = {
        success: true,
        data: testData,
        timestamp: faker.date.past().toISOString(),
      };

      if (isSuccessResponse(response)) {
        expect(response.data).toBe(testData);
      }
    });
  });

  describe('isErrorResponse', () => {
    it('should return true for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
        },
      };
      expect(isErrorResponse(response)).toBe(true);
    });

    it('should return false for success responses', () => {
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: faker.number.int({ min: 1, max: 100 }),
        timestamp: faker.date.past().toISOString(),
      };
      expect(isErrorResponse(response)).toBe(false);
    });

    it('should be a type guard that narrows type correctly', () => {
      const errorMessage = createRandomErrorMessage();
      const response: ApiResponse<never> = {
        success: false,
        error: {
          message: errorMessage,
          code: createRandomErrorCode(),
          details: { reason: faker.lorem.sentence() },
        },
      };

      if (isErrorResponse(response)) {
        expect(response.error.message).toBe(errorMessage);
      }
    });
  });

  // ==================== Unwrapping ====================

  describe('unwrapResponse', () => {
    it('should return data for success responses', () => {
      const id = faker.number.int({ min: 1, max: 9999 });
      const response: ApiSuccessResponse<{ id: number }> = {
        success: true,
        data: { id },
        timestamp: faker.date.past().toISOString(),
      };
      expect(unwrapResponse(response)).toEqual({ id });
    });

    it('should throw error for error responses', () => {
      const errorMessage = createRandomErrorMessage();
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: errorMessage,
          code: createRandomErrorCode(),
        },
      };
      expect(() => unwrapResponse(response)).toThrow(errorMessage);
    });

    it('should throw error with details if available', () => {
      const errorMessage = createRandomErrorMessage();
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: errorMessage,
          code: createRandomErrorCode(),
          details: {
            email: faker.lorem.sentence(),
            phone: faker.lorem.sentence(),
          },
        },
      };
      expect(() => unwrapResponse(response)).toThrow(errorMessage);
    });

    it('should work with various data types', () => {
      const testString = faker.lorem.word();
      const stringResponse: ApiSuccessResponse<string> = {
        success: true,
        data: testString,
        timestamp: faker.date.past().toISOString(),
      };
      expect(unwrapResponse(stringResponse)).toBe(testString);

      const testArray = [
        faker.number.int(),
        faker.number.int(),
        faker.number.int(),
      ];
      const arrayResponse: ApiSuccessResponse<number[]> = {
        success: true,
        data: testArray,
        timestamp: faker.date.past().toISOString(),
      };
      expect(unwrapResponse(arrayResponse)).toEqual(testArray);

      const nullResponse: ApiSuccessResponse<null> = {
        success: true,
        data: null,
        timestamp: faker.date.past().toISOString(),
      };
      expect(unwrapResponse(nullResponse)).toBeNull();
    });
  });

  describe('unwrapResponseOrDefault', () => {
    it('should return data for success responses', () => {
      const count = faker.number.int({ min: 1, max: 100 });
      const response: ApiSuccessResponse<{ count: number }> = {
        success: true,
        data: { count },
        timestamp: faker.date.past().toISOString(),
      };
      const defaultValue = { count: 0 };
      expect(unwrapResponseOrDefault(response, defaultValue)).toEqual({
        count,
      });
    });

    it('should return default value for error responses', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
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
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
        },
      };
      const defaultValue = faker.lorem.word();
      expect(() =>
        unwrapResponseOrDefault(response, defaultValue),
      ).not.toThrow();
      expect(unwrapResponseOrDefault(response, defaultValue)).toBe(
        defaultValue,
      );
    });

    it('should work with null/undefined defaults', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
        },
      };
      expect(unwrapResponseOrDefault(response, null)).toBeNull();
      expect(unwrapResponseOrDefault(response, undefined)).toBeUndefined();
    });
  });

  // ==================== Mapping ====================

  describe('mapResponse', () => {
    it('should transform data for success responses', () => {
      const id = faker.number.int({ min: 1, max: 1000 });
      const name = faker.person.firstName();
      const response: ApiSuccessResponse<{ id: number; name: string }> = {
        success: true,
        data: { id, name },
        timestamp: faker.date.past().toISOString(),
      };

      const mapped = mapResponse(
        response,
        (data: { id: number; name: string }) => ({
          userId: data.id,
          userName: data.name.toUpperCase(),
        }),
      );

      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toEqual({
          userId: id,
          userName: name.toUpperCase(),
        });
      }
    });

    it('should preserve success response structure', () => {
      const originalData = faker.number.int({ min: 1, max: 1000 });
      const timestamp = faker.date.past().toISOString();
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: originalData,
        timestamp,
      };

      const mapped = mapResponse(response, (n: number) => n * 2);

      expect(mapped.success).toBe(true);
      expect(mapped.timestamp).toBe(timestamp);
      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toBe(originalData * 2);
      }
    });

    it('should return error response unchanged', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: createRandomErrorMessage(),
          code: createRandomErrorCode(),
        },
      };

      const mapped = mapResponse(response, () => {
        throw new Error('Should not be called');
      });

      expect(isErrorResponse(mapped)).toBe(true);
      expect(mapped).toEqual(response);
    });

    it('should handle transformations with different return types', () => {
      const testNumber = faker.number.int({ min: 1, max: 999 });
      const response: ApiSuccessResponse<string> = {
        success: true,
        data: testNumber.toString(),
        timestamp: faker.date.past().toISOString(),
      };

      const mapped = mapResponse(response, (str: string) => parseInt(str, 10));

      if (isSuccessResponse(mapped)) {
        expect(mapped.data).toBe(testNumber);
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
      const testValue = faker.lorem.word();
      const response: ApiSuccessResponse<{ value: string }> = {
        success: true,
        data: { value: testValue },
        timestamp: faker.date.past().toISOString(),
      };

      expect(responseUtils.isSuccess(response)).toBe(true);
      expect(responseUtils.unwrap(response)).toEqual({ value: testValue });
    });
  });

  // ==================== Edge Cases ====================

  describe('edge cases', () => {
    it('should handle responses with complex nested data', () => {
      const userId1 = faker.number.int({ min: 1, max: 9999 });
      const userId2 = faker.number.int({ min: 1, max: 9999 });
      const response: ApiSuccessResponse<{
        users: Array<{ id: number; settings: { theme: string } }>;
      }> = {
        success: true,
        data: {
          users: [
            { id: userId1, settings: { theme: 'dark' } },
            { id: userId2, settings: { theme: 'light' } },
          ],
        },
        timestamp: faker.date.past().toISOString(),
      };

      const unwrapped = unwrapResponse(response);
      expect(unwrapped.users).toHaveLength(2);
      expect(unwrapped.users[0].settings.theme).toBe('dark');
    });

    it('should handle responses with empty objects', () => {
      const response: ApiSuccessResponse<Record<string, never>> = {
        success: true,
        data: {},
        timestamp: faker.date.past().toISOString(),
      };

      expect(unwrapResponse(response)).toEqual({});
    });

    it('should handle error responses with no details', () => {
      const errorMessage = createRandomErrorMessage();
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: errorMessage,
          code: createRandomErrorCode(),
        },
      };

      expect(() => unwrapResponse(response)).toThrow(errorMessage);
    });

    it('should handle mapResponse with identity function', () => {
      const testValue = faker.number.int({ min: 1, max: 1000 });
      const response: ApiSuccessResponse<number> = {
        success: true,
        data: testValue,
        timestamp: faker.date.past().toISOString(),
      };

      const mapped = mapResponse(response, (x: number) => x);
      expect(isSuccessResponse(mapped) && mapped.data).toBe(testValue);
    });
  });
});
