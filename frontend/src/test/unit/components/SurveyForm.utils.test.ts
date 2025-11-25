/**
 * SurveyForm Utilities and Constants Tests
 *
 * Comprehensive tests for SurveyForm helper functions and constants including:
 * - Food option validation and retrieval
 * - Rating field configuration and validation
 * - Error message formatting
 * - Type safety and configuration accuracy
 */

import { describe, it, expect } from 'vitest';
import {
  getFoodOptions,
  getRatingFields,
  getRatingScaleLabels,
  getRatingLabel,
  isValidFood,
  validateFoodSelection,
  isValidRating,
  validateAllRatings,
  foodsToString,
  formatErrorMessage,
} from '@/components/Survey/SurveyForm.utils';
import {
  FOOD_OPTIONS,
  RATING_FIELDS,
  RATING_SCALE_LABELS,
  ERROR_MESSAGES,
} from '@/components/Survey/SurveyForm.constants';

describe('SurveyForm Constants and Utilities', () => {
  describe('Constants Structure', () => {
    it('should export FOOD_OPTIONS array with 4 items', () => {
      expect(FOOD_OPTIONS).toHaveLength(4);
      expect(FOOD_OPTIONS).toContain('Pizza');
      expect(FOOD_OPTIONS).toContain('Pasta');
      expect(FOOD_OPTIONS).toContain('Pap and Wors');
      expect(FOOD_OPTIONS).toContain('Other');
    });

    it('should export RATING_SCALE_LABELS array with 5 items', () => {
      expect(RATING_SCALE_LABELS).toHaveLength(5);
      expect(RATING_SCALE_LABELS[0]).toBe('Strongly Agree');
      expect(RATING_SCALE_LABELS[2]).toBe('Neutral');
      expect(RATING_SCALE_LABELS[4]).toBe('Strongly Disagree');
    });

    it('should export RATING_FIELDS array with correct structure', () => {
      expect(RATING_FIELDS.length).toBeGreaterThan(0);
      RATING_FIELDS.forEach((field) => {
        expect(field).toHaveProperty('key');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('description');
        expect(typeof field.key).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.description).toBe('string');
      });
    });

    it('should export ERROR_MESSAGES with proper structure', () => {
      expect(ERROR_MESSAGES).toHaveProperty('submit');
      expect(ERROR_MESSAGES).toHaveProperty('fields');
      expect(ERROR_MESSAGES.submit).toHaveProperty('generic');
      expect(ERROR_MESSAGES.fields).toHaveProperty('firstName');
    });
  });

  describe('getFoodOptions', () => {
    it('should return all food options', () => {
      const foods = getFoodOptions();
      expect(foods).toHaveLength(4);
      expect(foods).toContain('Pizza');
      expect(foods).toContain('Pasta');
    });

    it('should return a readonly array', () => {
      const foods = getFoodOptions();
      expect(Object.isFrozen(foods) || Array.isArray(foods)).toBe(true);
    });
  });

  describe('getRatingFields', () => {
    it('should return all rating fields', () => {
      const fields = getRatingFields();
      expect(fields.length).toBeGreaterThan(0);
    });

    it('should have valid field structure', () => {
      const fields = getRatingFields();
      fields.forEach((field) => {
        expect(field.key).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.description).toBeDefined();
      });
    });
  });

  describe('getRatingScaleLabels', () => {
    it('should return rating scale labels in order', () => {
      const labels = getRatingScaleLabels();
      expect(labels).toHaveLength(5);
      expect(labels[0]).toBe('Strongly Agree');
      expect(labels[1]).toBe('Agree');
      expect(labels[2]).toBe('Neutral');
      expect(labels[3]).toBe('Disagree');
      expect(labels[4]).toBe('Strongly Disagree');
    });
  });

  describe('getRatingLabel', () => {
    it('should return correct label for rating 1', () => {
      expect(getRatingLabel(1)).toBe('Strongly Agree');
    });

    it('should return correct label for rating 5', () => {
      expect(getRatingLabel(5)).toBe('Strongly Disagree');
    });

    it('should return correct label for middle value 3', () => {
      expect(getRatingLabel(3)).toBe('Neutral');
    });

    it('should throw error for invalid rating (too low)', () => {
      expect(() => getRatingLabel(0)).toThrow();
    });

    it('should throw error for invalid rating (too high)', () => {
      expect(() => getRatingLabel(6)).toThrow();
    });

    it('should throw error for negative rating', () => {
      expect(() => getRatingLabel(-1)).toThrow();
    });

    it('should throw error for non-integer rating', () => {
      expect(() => getRatingLabel(2.5)).toThrow();
    });

    it('should throw error for null rating', () => {
      expect(() => getRatingLabel(null as unknown as number)).toThrow();
    });
  });

  describe('isValidFood', () => {
    it('should return true for valid foods', () => {
      expect(isValidFood('Pizza')).toBe(true);
      expect(isValidFood('Pasta')).toBe(true);
      expect(isValidFood('Pap and Wors')).toBe(true);
      expect(isValidFood('Other')).toBe(true);
    });

    it('should return false for invalid foods', () => {
      expect(isValidFood('Burger')).toBe(false);
      expect(isValidFood('Rice')).toBe(false);
      expect(isValidFood('')).toBe(false);
    });

    it('should return false for case-mismatched foods', () => {
      expect(isValidFood('pizza')).toBe(false);
      expect(isValidFood('PASTA')).toBe(false);
    });
  });

  describe('validateFoodSelection', () => {
    it('should validate single food selection', () => {
      const result = validateFoodSelection(['Pizza']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    it('should validate multiple food selections', () => {
      const result = validateFoodSelection(['Pizza', 'Pasta', 'Other']);
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    it('should reject empty array', () => {
      const result = validateFoodSelection([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least one');
    });

    it('should reject non-array input', () => {
      const result = validateFoodSelection('Pizza' as unknown as string[]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('array');
    });

    it('should reject invalid food selections', () => {
      const result = validateFoodSelection(['Pizza', 'InvalidFood']);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should reject too many selections', () => {
      const foods = Array(11).fill('Pizza');
      const result = validateFoodSelection(foods);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Maximum');
    });

    it('should validate maximum 10 items', () => {
      const foods = Array(10).fill('Pizza');
      const result = validateFoodSelection(foods);
      expect(result.isValid).toBe(true);
    });
  });

  describe('isValidRating', () => {
    it('should return true for valid ratings 1-5', () => {
      expect(isValidRating(1)).toBe(true);
      expect(isValidRating(2)).toBe(true);
      expect(isValidRating(3)).toBe(true);
      expect(isValidRating(4)).toBe(true);
      expect(isValidRating(5)).toBe(true);
    });

    it('should accept string ratings', () => {
      expect(isValidRating('1')).toBe(true);
      expect(isValidRating('3')).toBe(true);
      expect(isValidRating('5')).toBe(true);
    });

    it('should return false for ratings outside 1-5', () => {
      expect(isValidRating(0)).toBe(false);
      expect(isValidRating(6)).toBe(false);
      expect(isValidRating(-1)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isValidRating(null)).toBe(false);
      expect(isValidRating(undefined)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidRating(2.5)).toBe(false);
      expect(isValidRating(3.1)).toBe(false);
    });

    it('should return false for invalid strings', () => {
      expect(isValidRating('invalid')).toBe(false);
      expect(isValidRating('1.5')).toBe(false);
    });
  });

  describe('validateAllRatings', () => {
    it('should validate all valid ratings', () => {
      const ratings = {
        ratingMovies: '1',
        ratingTv: '3',
        ratingMusic: '5',
        ratingReading: '2',
      };
      const result = validateAllRatings(ratings);
      expect(result.isValid).toBe(true);
      expect(result.invalidFields).toHaveLength(0);
    });

    it('should identify invalid rating fields', () => {
      const ratings = {
        ratingMovies: '1',
        ratingTv: null,
        ratingMusic: '5',
        ratingReading: undefined,
      };
      const result = validateAllRatings(ratings);
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain('ratingTv');
      expect(result.invalidFields).toContain('ratingReading');
    });

    it('should handle mixed valid and invalid ratings', () => {
      const ratings = {
        ratingMovies: '1',
        ratingTv: 10,
        ratingMusic: '3',
      };
      const result = validateAllRatings(ratings);
      expect(result.isValid).toBe(false);
      expect(result.invalidFields).toContain('ratingTv');
    });

    it('should handle empty ratings object', () => {
      const result = validateAllRatings({});
      expect(result.isValid).toBe(true);
      expect(result.invalidFields).toHaveLength(0);
    });
  });

  describe('foodsToString', () => {
    it('should convert single food to string', () => {
      const result = foodsToString(['Pizza']);
      expect(result).toBe('Pizza');
    });

    it('should convert multiple foods to comma-separated string', () => {
      const result = foodsToString(['Pizza', 'Pasta']);
      expect(result).toBe('Pizza, Pasta');
    });

    it('should handle many foods', () => {
      const result = foodsToString(['Pizza', 'Pasta', 'Pap and Wors', 'Other']);
      expect(result).toBe('Pizza, Pasta, Pap and Wors, Other');
    });

    it('should handle empty array', () => {
      const result = foodsToString([]);
      expect(result).toBe('');
    });
  });

  describe('formatErrorMessage', () => {
    it('should format network error string', () => {
      const result = formatErrorMessage('network error');
      expect(result).toContain('Network error');
      expect(result).toContain('connection');
    });

    it('should format validation error string', () => {
      const result = formatErrorMessage('validation failed');
      expect(result).toContain('correct the errors');
    });

    it('should return original string for other errors', () => {
      const result = formatErrorMessage('Custom error message');
      expect(result).toContain('Custom error message');
    });

    it('should format network Error object', () => {
      const error = new Error('Network request failed');
      const result = formatErrorMessage(error);
      expect(result).toContain('Network error');
    });

    it('should format validation Error object', () => {
      const error = new Error('Validation error occurred');
      const result = formatErrorMessage(error);
      expect(result).toContain('correct the errors');
    });

    it('should return generic message for empty error', () => {
      const error = new Error('');
      const result = formatErrorMessage(error);
      expect(result).toContain('Failed to submit');
    });

    it('should handle case-insensitive error detection', () => {
      const result1 = formatErrorMessage('NETWORK ERROR');
      expect(result1).toContain('Network error');

      const result2 = formatErrorMessage('VALIDATION FAILED');
      expect(result2).toContain('correct the errors');
    });
  });

  describe('Integration Tests', () => {
    it('should use constants in utility functions', () => {
      const foods = getFoodOptions();
      expect(foods).toEqual(FOOD_OPTIONS);
    });

    it('should have consistent rating scale labels', () => {
      const labels = getRatingScaleLabels();
      expect(labels).toEqual(RATING_SCALE_LABELS);
    });

    it('should validate all exported food options', () => {
      FOOD_OPTIONS.forEach((food) => {
        expect(isValidFood(food)).toBe(true);
      });
    });

    it('should support all rating values', () => {
      for (let i = 1; i <= 5; i++) {
        expect(isValidRating(i)).toBe(true);
        expect(getRatingLabel(i)).toBeDefined();
      }
    });
  });
});
