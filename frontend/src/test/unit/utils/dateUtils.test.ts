import { describe, it, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import {
  formatDate,
  parseDate,
  formatDatetime,
  calculateAge,
  formatRelativeTime,
  dateUtils,
} from '../../../utils/dateUtils';
import {
  createRandomDateString,
  createRandomISODateString,
  createRandomRecentDate,
} from '../../../test/utils/test-helpers';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats dates to YYYY-MM-DD', () => {
      const dateStr = createRandomDateString();
      expect(formatDate(dateStr)).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('handles Date objects', () => {
      const date = faker.date.past({ years: 5 });
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('parseDate', () => {
    it('parses date strings', () => {
      const dateStr = createRandomDateString();
      const parsed = parseDate(dateStr);
      expect(parsed).toBeInstanceOf(Date);
    });
  });

  describe('formatDatetime', () => {
    it('formats to ISO 8601', () => {
      const formatted = formatDatetime(createRandomISODateString());
      expect(formatted).toContain('T');
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    });
  });

  describe('calculateAge', () => {
    it('calculates age', () => {
      // Create a date from 25 years ago
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);
      const dateString = birthDate.toISOString().split('T')[0];

      const age = calculateAge(dateString);
      expect(age).toBeGreaterThanOrEqual(24);
      expect(age).toBeLessThanOrEqual(26);

      const ageFromDate = calculateAge(birthDate);
      expect(ageFromDate).toBeGreaterThanOrEqual(24);
      expect(ageFromDate).toBeLessThanOrEqual(26);
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative times', () => {
      const recentDate = createRandomRecentDate();
      const result = formatRelativeTime(recentDate);
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
