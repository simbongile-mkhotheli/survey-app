/**
 * Number Formatters Unit Tests
 * ============================
 * Comprehensive test coverage for number formatting utilities
 * Tests all edge cases, boundaries, and error conditions
 */

import { describe, it, expect } from 'vitest';
import {
  formatDecimal,
  formatInteger,
  formatPercentage,
  formatAge,
  formatRating,
} from '@/utils/numberFormatters';

const NA = 'N/A';

describe('numberFormatters', () => {
  describe('formatDecimal', () => {
    describe('basic functionality', () => {
      it('should format decimal to 1 decimal place', () => {
        expect(formatDecimal(28.567)).toBe('28.6');
      });

      it('should round correctly (standard rounding)', () => {
        expect(formatDecimal(2.15)).toBe('2.1'); // Due to floating point precision
        expect(formatDecimal(2.25)).toBe('2.3'); // Standard rounding - actually rounds up
        expect(formatDecimal(2.35)).toBe('2.4'); // Standard rounding
      });

      it('should handle already single decimal', () => {
        expect(formatDecimal(28.5)).toBe('28.5');
      });

      it('should handle zero', () => {
        expect(formatDecimal(0)).toBe('0.0');
      });

      it('should handle negative numbers', () => {
        expect(formatDecimal(-28.567)).toBe('-28.6');
      });
    });

    describe('string inputs', () => {
      it('should parse string numbers', () => {
        expect(formatDecimal('45.123')).toBe('45.1');
      });

      it('should handle string integers', () => {
        expect(formatDecimal('42')).toBe('42.0');
      });

      it('should handle strings with whitespace', () => {
        expect(formatDecimal(' 45.123 ')).toBe('45.1');
      });

      it('should return N/A for non-numeric strings', () => {
        expect(formatDecimal('abc')).toBe(NA);
        expect(formatDecimal('12.34.56')).toBe(NA);
        expect(formatDecimal('$45.67')).toBe(NA);
      });
    });

    describe('null/undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatDecimal(null)).toBe(NA);
      });

      it('should return N/A for undefined', () => {
        expect(formatDecimal(undefined)).toBe(NA);
      });
    });

    describe('edge cases', () => {
      it('should handle NaN', () => {
        expect(formatDecimal(NaN)).toBe(NA);
      });

      it('should handle Infinity', () => {
        expect(formatDecimal(Infinity)).toBe(NA);
      });

      it('should handle -Infinity', () => {
        expect(formatDecimal(-Infinity)).toBe(NA);
      });

      it('should handle very large numbers', () => {
        expect(formatDecimal(999999999.9)).toBe('999999999.9');
        expect(formatDecimal(1e10)).toBe('10000000000.0');
      });

      it('should handle very small numbers', () => {
        expect(formatDecimal(0.00001)).toBe('0.0');
      });

      it('should handle scientific notation', () => {
        expect(formatDecimal(1e5)).toBe('100000.0');
      });
    });
  });

  describe('formatInteger', () => {
    describe('basic functionality', () => {
      it('should round decimal to integer', () => {
        expect(formatInteger(28.7)).toBe('29');
      });

      it('should round down when < .5', () => {
        expect(formatInteger(28.3)).toBe('28');
      });

      it('should handle already integer', () => {
        expect(formatInteger(42)).toBe('42');
      });

      it('should handle zero', () => {
        expect(formatInteger(0)).toBe('0');
      });

      it('should handle negative numbers', () => {
        expect(formatInteger(-28.7)).toBe('-29');
        expect(formatInteger(-28.3)).toBe('-28');
      });
    });

    describe('string inputs', () => {
      it('should parse string numbers', () => {
        expect(formatInteger('45.123')).toBe('45');
      });

      it('should handle string integers', () => {
        expect(formatInteger('42')).toBe('42');
      });

      it('should return N/A for non-numeric strings', () => {
        expect(formatInteger('abc')).toBe(NA);
      });
    });

    describe('null/undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatInteger(null)).toBe(NA);
      });

      it('should return N/A for undefined', () => {
        expect(formatInteger(undefined)).toBe(NA);
      });
    });

    describe('edge cases', () => {
      it('should handle NaN', () => {
        expect(formatInteger(NaN)).toBe(NA);
      });

      it('should handle Infinity', () => {
        expect(formatInteger(Infinity)).toBe(NA);
      });

      it('should handle very large numbers', () => {
        expect(formatInteger(999999999.9)).toBe('1000000000');
      });
    });
  });

  describe('formatPercentage', () => {
    describe('basic functionality', () => {
      it('should format percentage with % suffix', () => {
        expect(formatPercentage(45.567)).toBe('45.6%');
      });

      it('should handle zero', () => {
        expect(formatPercentage(0)).toBe('0.0%');
      });

      it('should handle 100', () => {
        expect(formatPercentage(100)).toBe('100.0%');
      });

      it('should handle percentages over 100', () => {
        expect(formatPercentage(125.5)).toBe('125.5%');
      });

      it('should handle string inputs', () => {
        expect(formatPercentage('45.567')).toBe('45.6%');
      });
    });

    describe('null/undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatPercentage(null)).toBe(NA);
      });

      it('should return N/A for undefined', () => {
        expect(formatPercentage(undefined)).toBe(NA);
      });
    });

    describe('edge cases', () => {
      it('should handle NaN', () => {
        expect(formatPercentage(NaN)).toBe(NA);
      });

      it('should handle Infinity', () => {
        expect(formatPercentage(Infinity)).toBe(NA);
      });
    });
  });

  describe('formatAge', () => {
    describe('basic functionality', () => {
      it('should format age with years suffix', () => {
        expect(formatAge(28)).toBe('28 years');
      });

      it('should handle single digit age', () => {
        expect(formatAge(5)).toBe('5 years');
      });

      it('should handle elderly age', () => {
        expect(formatAge(95)).toBe('95 years');
      });

      it('should handle string inputs', () => {
        expect(formatAge('28')).toBe('28 years');
      });

      it('should round decimal ages', () => {
        expect(formatAge(28.7)).toBe('29 years');
      });
    });

    describe('null/undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatAge(null)).toBe(NA);
      });

      it('should return N/A for undefined', () => {
        expect(formatAge(undefined)).toBe(NA);
      });
    });

    describe('edge cases', () => {
      it('should handle zero age', () => {
        expect(formatAge(0)).toBe('0 years');
      });

      it('should handle NaN', () => {
        expect(formatAge(NaN)).toBe(NA);
      });

      it('should handle negative (invalid age)', () => {
        // Negative ages are technically valid numbers but semantically invalid
        // Current implementation accepts them; may want to validate later
        expect(formatAge(-5)).toBe('-5 years');
      });
    });
  });

  describe('formatRating', () => {
    describe('valid ratings (1-5)', () => {
      it('should format rating 1', () => {
        expect(formatRating(1)).toBe('1.0');
      });

      it('should format rating in middle range', () => {
        expect(formatRating(3.5)).toBe('3.5');
      });

      it('should format rating 5', () => {
        expect(formatRating(5)).toBe('5.0');
      });

      it('should handle string ratings', () => {
        expect(formatRating('4')).toBe('4.0');
        expect(formatRating('3.5')).toBe('3.5');
      });
    });

    describe('invalid ratings (out of range)', () => {
      it('should return N/A for rating 0', () => {
        expect(formatRating(0)).toBe(NA);
      });

      it('should return N/A for rating > 5', () => {
        expect(formatRating(6)).toBe(NA);
        expect(formatRating(10)).toBe(NA);
      });

      it('should return N/A for negative rating', () => {
        expect(formatRating(-1)).toBe(NA);
      });
    });

    describe('null/undefined handling', () => {
      it('should return N/A for null', () => {
        expect(formatRating(null)).toBe(NA);
      });

      it('should return N/A for undefined', () => {
        expect(formatRating(undefined)).toBe(NA);
      });
    });

    describe('edge cases', () => {
      it('should handle NaN', () => {
        expect(formatRating(NaN)).toBe(NA);
      });

      it('should handle Infinity', () => {
        expect(formatRating(Infinity)).toBe(NA);
      });

      it('should handle non-numeric strings', () => {
        expect(formatRating('abc')).toBe(NA);
      });

      it('should handle boundary values exactly', () => {
        expect(formatRating(1.0)).toBe('1.0');
        expect(formatRating(5.0)).toBe('5.0');
      });
    });
  });

  describe('integration - consistent behavior', () => {
    it('all functions should handle null consistently', () => {
      expect(formatDecimal(null)).toBe(NA);
      expect(formatInteger(null)).toBe(NA);
      expect(formatPercentage(null)).toBe(NA);
      expect(formatAge(null)).toBe(NA);
      expect(formatRating(null)).toBe(NA);
    });

    it('all functions should handle undefined consistently', () => {
      expect(formatDecimal(undefined)).toBe(NA);
      expect(formatInteger(undefined)).toBe(NA);
      expect(formatPercentage(undefined)).toBe(NA);
      expect(formatAge(undefined)).toBe(NA);
      expect(formatRating(undefined)).toBe(NA);
    });

    it('all functions should handle NaN consistently', () => {
      expect(formatDecimal(NaN)).toBe(NA);
      expect(formatInteger(NaN)).toBe(NA);
      expect(formatPercentage(NaN)).toBe(NA);
      expect(formatAge(NaN)).toBe(NA);
      expect(formatRating(NaN)).toBe(NA);
    });

    it('all functions should handle Infinity consistently', () => {
      expect(formatDecimal(Infinity)).toBe(NA);
      expect(formatInteger(Infinity)).toBe(NA);
      expect(formatPercentage(Infinity)).toBe(NA);
      expect(formatAge(Infinity)).toBe(NA);
      expect(formatRating(Infinity)).toBe(NA);
    });
  });
});
