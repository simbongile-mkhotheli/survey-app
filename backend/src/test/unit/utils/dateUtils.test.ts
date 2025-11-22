import { describe, it, expect } from 'vitest';
import {
  formatDate,
  parseDate,
  formatDatetime,
  calculateAge,
  getElapsedTime,
  dateUtils,
} from '@/utils/dateUtils';

describe('Date Formatting Utilities', () => {
  describe('formatDate', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2025-11-22T10:30:00Z');
      expect(formatDate(date)).toBe('2025-11-22');
    });

    it('should format ISO string to YYYY-MM-DD', () => {
      expect(formatDate('2025-11-22T10:30:00Z')).toBe('2025-11-22');
    });

    it('should handle date-only strings', () => {
      expect(formatDate('2025-11-22')).toBe('2025-11-22');
    });

    it('should remove time component', () => {
      const result = formatDate(new Date('2025-01-15T23:59:59Z'));
      expect(result).not.toContain('T');
      expect(result).not.toContain(':');
      expect(result).toBe('2025-01-15');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO string to Date object', () => {
      const result = parseDate('2025-11-22T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2025);
      expect(result.getUTCMonth()).toBe(10); // November (0-indexed)
      expect(result.getUTCDate()).toBe(22);
    });

    it('should parse date-only strings', () => {
      const result = parseDate('2025-11-22');
      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCDate()).toBe(22);
    });
  });

  describe('formatDatetime', () => {
    it('should format to ISO 8601 datetime', () => {
      const date = new Date('2025-11-22T10:30:00.123Z');
      const result = formatDatetime(date);

      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result).toContain('Z');
    });

    it('should include milliseconds', () => {
      const date = new Date('2025-11-22T10:30:00.123Z');
      const result = formatDatetime(date);
      expect(result).toMatch(/\.\d{3}Z/);
    });

    it('should parse string and return ISO format', () => {
      const result = formatDatetime('2025-11-22T10:30:00Z');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age from birthdate', () => {
      const birthYear = new Date().getFullYear() - 25;
      const birthDate = `${birthYear}-01-15`;
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThanOrEqual(24);
      expect(age).toBeLessThanOrEqual(25);
    });

    it('should handle birthday that has passed this year', () => {
      const birthYear = new Date().getFullYear() - 30;
      const today = new Date();
      const birthDate = new Date(
        birthYear,
        today.getMonth() - 1, // Month before now
        today.getDate(),
      );
      const age = calculateAge(birthDate);
      expect(age).toBe(30);
    });

    it('should handle birthday that has not passed this year', () => {
      const birthYear = new Date().getFullYear() - 30;
      const today = new Date();
      const birthDate = new Date(
        birthYear,
        today.getMonth() + 1, // Month after now
        today.getDate(),
      );
      const age = calculateAge(birthDate);
      expect(age).toBe(29);
    });

    it('should work with Date objects', () => {
      const birthYear = new Date().getFullYear() - 25;
      const birthDate = new Date(birthYear, 0, 15);
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThanOrEqual(24);
      expect(age).toBeLessThanOrEqual(25);
    });

    it('should work with ISO string', () => {
      const birthYear = new Date().getFullYear() - 25;
      const birthDate = `${birthYear}-01-15T00:00:00Z`;
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThanOrEqual(24);
      expect(age).toBeLessThanOrEqual(25);
    });
  });

  describe('getElapsedTime', () => {
    it('should calculate elapsed milliseconds', () => {
      const start = new Date('2025-11-22T10:00:00Z');
      const end = new Date('2025-11-22T10:00:01Z');
      const elapsed = getElapsedTime(start, end);
      expect(elapsed).toBe(1000);
    });

    it('should use current time when endDate not provided', () => {
      const start = new Date(Date.now() - 5000); // 5 seconds ago
      const elapsed = getElapsedTime(start);
      expect(elapsed).toBeGreaterThanOrEqual(4900);
      expect(elapsed).toBeLessThanOrEqual(5100);
    });

    it('should work with ISO strings', () => {
      const elapsed = getElapsedTime(
        '2025-11-22T10:00:00Z',
        '2025-11-22T10:01:00Z',
      );
      expect(elapsed).toBe(60000); // 1 minute in ms
    });

    it('should handle negative elapsed time (end before start)', () => {
      const start = new Date('2025-11-22T10:01:00Z');
      const end = new Date('2025-11-22T10:00:00Z');
      const elapsed = getElapsedTime(start, end);
      expect(elapsed).toBe(-60000);
    });
  });

  describe('dateUtils object', () => {
    it('should have format method', () => {
      expect(dateUtils).toHaveProperty('format');
      expect(typeof dateUtils.format).toBe('function');
    });

    it('should have formatDatetime method', () => {
      expect(dateUtils).toHaveProperty('formatDatetime');
      expect(typeof dateUtils.formatDatetime).toBe('function');
    });

    it('should have parse method', () => {
      expect(dateUtils).toHaveProperty('parse');
      expect(typeof dateUtils.parse).toBe('function');
    });

    it('should have calculateAge method', () => {
      expect(dateUtils).toHaveProperty('calculateAge');
      expect(typeof dateUtils.calculateAge).toBe('function');
    });

    it('should have getElapsedTime method', () => {
      expect(dateUtils).toHaveProperty('getElapsedTime');
      expect(typeof dateUtils.getElapsedTime).toBe('function');
    });

    it('should produce same results as individual functions', () => {
      const testDate = new Date('2025-11-22T10:30:00Z');
      expect(dateUtils.format(testDate)).toBe(formatDate(testDate));
      expect(dateUtils.formatDatetime(testDate)).toBe(formatDatetime(testDate));
    });
  });
});
