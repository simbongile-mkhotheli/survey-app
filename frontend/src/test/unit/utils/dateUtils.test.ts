import { describe, it, expect } from 'vitest';
import {
  formatDate,
  parseDate,
  formatDatetime,
  calculateAge,
  formatRelativeTime,
  dateUtils,
} from '../../../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats dates to YYYY-MM-DD', () => {
      expect(formatDate('2025-11-22T00:00:00Z')).toBe('2025-11-22');
    });

    it('handles Date objects', () => {
      const date = new Date('2025-11-22T00:00:00Z');
      expect(formatDate(date)).toBe('2025-11-22');
    });
  });

  describe('parseDate', () => {
    it('parses date strings', () => {
      const parsed = parseDate('2025-11-22');
      expect(parsed).toBeInstanceOf(Date);
    });
  });

  describe('formatDatetime', () => {
    it('formats to ISO 8601', () => {
      const formatted = formatDatetime('2025-11-22T10:30:00Z');
      expect(formatted).toContain('2025-11-22');
      expect(formatted).toContain('T');
    });
  });

  describe('calculateAge', () => {
    it('calculates age', () => {
      expect(calculateAge('2000-11-22')).toBe(25);
      expect(calculateAge(new Date('2000-11-22'))).toBe(25);
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative times', () => {
      const result = formatRelativeTime(new Date(Date.now() - 60000));
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('dateUtils object', () => {
    it('exposes functions', () => {
      expect(typeof dateUtils.format).toBe('function');
      expect(typeof dateUtils.parse).toBe('function');
      expect(typeof dateUtils.calculateAge).toBe('function');
    });
  });
});
