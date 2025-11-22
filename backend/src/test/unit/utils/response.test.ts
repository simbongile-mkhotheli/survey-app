import { describe, it, expect } from 'vitest';
import {
  formatSuccess,
  formatError,
  responseFormatter,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from '@/utils/response';

describe('Response Formatting Utilities', () => {
  describe('formatSuccess', () => {
    it('should format success response with data and timestamp', () => {
      const data = { id: 123, name: 'test' };
      const result = formatSuccess(data);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data', data);
      expect(result).toHaveProperty('timestamp');
      expect((result as ApiSuccessResponse).timestamp).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });

    it('should work with generic data types', () => {
      const numberData = 42;
      const result1 = formatSuccess(numberData);
      expect(result1.data).toBe(42);

      const arrayData = [1, 2, 3];
      const result2 = formatSuccess(arrayData);
      expect(result2.data).toEqual([1, 2, 3]);

      const stringData = 'success';
      const result3 = formatSuccess(stringData);
      expect(result3.data).toBe('success');
    });

    it('should have success flag set to true', () => {
      const result = formatSuccess({ foo: 'bar' });
      expect(result.success).toBe(true);
    });
  });

  describe('formatError', () => {
    it('should format error response with message and code', () => {
      const result = formatError('Something went wrong', 'INTERNAL_ERROR');

      expect(result).toHaveProperty('success', false);
      expect(result.error).toHaveProperty('message', 'Something went wrong');
      expect(result.error).toHaveProperty('code', 'INTERNAL_ERROR');
      expect(result).toHaveProperty('timestamp');
    });

    it('should include details when provided', () => {
      const details = { field: 'email', value: 'invalid' };
      const result = formatError(
        'Validation failed',
        'VALIDATION_ERROR',
        details,
      );

      expect(result.error).toHaveProperty('details', details);
    });

    it('should exclude details when not provided', () => {
      const result = formatError('Error', 'ERROR');

      expect(result.error).not.toHaveProperty('details');
    });

    it('should have success flag set to false', () => {
      const result = formatError('Error', 'ERROR');
      expect(result.success).toBe(false);
    });

    it('should have valid ISO timestamp', () => {
      const result = formatError('Error', 'ERROR');
      expect((result as ApiErrorResponse).timestamp).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });
  });

  describe('responseFormatter object', () => {
    it('should have success method', () => {
      expect(responseFormatter).toHaveProperty('success');
      expect(typeof responseFormatter.success).toBe('function');
    });

    it('should have error method', () => {
      expect(responseFormatter).toHaveProperty('error');
      expect(typeof responseFormatter.error).toBe('function');
    });

    it('should produce same results as individual functions', () => {
      const data = { test: 'value' };
      const success1 = formatSuccess(data);
      const success2 = responseFormatter.success(data);

      expect(success1.success).toBe(success2.success);
      expect(success1.data).toEqual(success2.data);

      const error1 = formatError('Msg', 'CODE');
      const error2 = responseFormatter.error('Msg', 'CODE');

      expect(error1.success).toBe(error2.success);
      expect(error1.error.message).toBe(error2.error.message);
      expect(error1.error.code).toBe(error2.error.code);
    });
  });
});
