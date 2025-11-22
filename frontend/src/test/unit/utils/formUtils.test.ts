import { describe, it, expect } from 'vitest';
import {
  formDateToISO,
  isoToFormDate,
  trimObjectValues,
  toLowercase,
  sanitizeString,
  sanitizeObject,
  getChangedFields,
  hasValues,
} from '../../../utils/formUtils';

describe('formUtils', () => {
  describe('formDateToISO', () => {
    it('converts form dates to ISO', () => {
      const result = formDateToISO('2025-11-22');
      expect(result).toContain('2025-11-22');
      expect(result).toContain('T');
    });
  });

  describe('isoToFormDate', () => {
    it('converts ISO to form date', () => {
      const result = isoToFormDate('2025-11-22T14:30:00Z');
      expect(result).toBe('2025-11-22');
    });
  });

  describe('trimObjectValues', () => {
    it('trims string values', () => {
      const obj = { name: '  John  ', email: 'test@test.com  ' };
      const result = trimObjectValues(obj);
      expect(result.name).toBe('John');
      expect(result.email).toBe('test@test.com');
    });

    it('preserves non-strings', () => {
      const obj = { name: '  John  ', age: 25 };
      const result = trimObjectValues(obj);
      expect(result.age).toBe(25);
    });
  });

  describe('toLowercase', () => {
    it('lowercases specified fields', () => {
      const obj = { email: 'TEST@TEST.COM', name: 'John' };
      const result = toLowercase(obj, ['email']);
      expect(result.email).toBe('test@test.com');
      expect(result.name).toBe('John');
    });
  });

  describe('sanitizeString', () => {
    it('removes script tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('removes javascript protocol', () => {
      const result = sanitizeString('javascript:alert(1)');
      expect(result).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      const result = sanitizeString('onclick="test"');
      expect(result).not.toContain('onclick');
    });

    it('preserves normal text', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes object values', () => {
      const obj = {
        name: '<script>alert(1)</script>test',
        email: 'test@test.com',
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain('<script>');
      expect(result.email).toBe('test@test.com');
    });

    it('preserves non-string values', () => {
      const obj = { name: '<script>test</script>', age: 25 };
      const result = sanitizeObject(obj);
      expect(result.age).toBe(25);
    });
  });

  describe('getChangedFields', () => {
    it('detects changed fields', () => {
      const orig = { name: 'John', email: 'test@test.com' };
      const updated = { name: 'Jane', email: 'test@test.com' };
      const changed = getChangedFields(orig, updated);
      expect(changed).toEqual({ name: 'Jane' });
    });

    it('returns empty for no changes', () => {
      const orig = { name: 'John', email: 'test@test.com' };
      const changed = getChangedFields(orig, orig);
      expect(changed).toEqual({});
    });
  });

  describe('hasValues', () => {
    it('returns true for non-empty objects', () => {
      expect(hasValues({ name: 'John' })).toBe(true);
      expect(hasValues({ age: 25 })).toBe(true);
    });

    it('returns false for empty objects', () => {
      expect(hasValues({})).toBe(false);
      expect(hasValues({ name: '' })).toBe(false);
    });

    it('treats 0 and false as valid values', () => {
      expect(hasValues({ age: 0 })).toBe(true);
      expect(hasValues({ active: false })).toBe(true);
    });
  });
});
