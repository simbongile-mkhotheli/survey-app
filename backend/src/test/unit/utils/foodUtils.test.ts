import { describe, it, expect } from 'vitest';
import {
  toCSV,
  fromCSV,
  isValidFoodArray,
  normalizeFoodName,
  deduplicateFoods,
  foodUtils,
} from '@/utils/foodUtils';

describe('Food Utilities', () => {
  describe('toCSV', () => {
    it('should convert array to CSV string', () => {
      expect(toCSV(['pizza', 'pasta'])).toBe('pizza,pasta');
    });

    it('should handle single item', () => {
      expect(toCSV(['pizza'])).toBe('pizza');
    });

    it('should handle empty array', () => {
      expect(toCSV([])).toBe('');
    });

    it('should preserve spaces in food names', () => {
      expect(toCSV(['pap and wors', 'pizza'])).toBe('pap and wors,pizza');
    });

    it('should handle multiple items', () => {
      expect(toCSV(['pizza', 'pasta', 'pap and wors'])).toBe(
        'pizza,pasta,pap and wors',
      );
    });
  });

  describe('fromCSV', () => {
    it('should parse CSV string to array', () => {
      expect(fromCSV('pizza,pasta')).toEqual(['pizza', 'pasta']);
    });

    it('should trim whitespace', () => {
      expect(fromCSV('pizza, pasta, pap and wors')).toEqual([
        'pizza',
        'pasta',
        'pap and wors',
      ]);
    });

    it('should handle single item', () => {
      expect(fromCSV('pizza')).toEqual(['pizza']);
    });

    it('should handle empty string', () => {
      expect(fromCSV('')).toEqual([]);
    });

    it('should handle whitespace only', () => {
      expect(fromCSV('   ')).toEqual([]);
    });

    it('should filter empty values', () => {
      expect(fromCSV('pizza,,pasta')).toEqual(['pizza', 'pasta']);
    });

    it('should handle leading/trailing commas', () => {
      expect(fromCSV(',pizza,pasta,')).toEqual(['pizza', 'pasta']);
    });
  });

  describe('isValidFoodArray', () => {
    it('should accept valid arrays', () => {
      expect(isValidFoodArray(['pizza'])).toBe(true);
      expect(isValidFoodArray(['pizza', 'pasta'])).toBe(true);
      expect(isValidFoodArray(new Array(10).fill('pizza'))).toBe(true);
    });

    it('should reject empty array', () => {
      expect(isValidFoodArray([])).toBe(false);
    });

    it('should reject array with more than 10 items', () => {
      expect(isValidFoodArray(new Array(11).fill('pizza'))).toBe(false);
    });

    it('should reject non-array inputs', () => {
      expect(isValidFoodArray('pizza' as unknown as unknown[])).toBe(false);
      expect(isValidFoodArray(123 as unknown as unknown[])).toBe(false);
      expect(isValidFoodArray(null as unknown as unknown[])).toBe(false);
      expect(isValidFoodArray(undefined as unknown as unknown[])).toBe(false);
      expect(
        isValidFoodArray({ 0: 'pizza', length: 1 } as unknown as unknown[]),
      ).toBe(false);
    });
  });

  describe('normalizeFoodName', () => {
    it('should convert to lowercase', () => {
      expect(normalizeFoodName('PIZZA')).toBe('pizza');
      expect(normalizeFoodName('Pizza')).toBe('pizza');
    });

    it('should trim whitespace', () => {
      expect(normalizeFoodName('  pizza  ')).toBe('pizza');
      expect(normalizeFoodName('\tpizza\n')).toBe('pizza');
    });

    it('should handle mixed case and whitespace', () => {
      expect(normalizeFoodName('  Pap And Wors  ')).toBe('pap and wors');
    });

    it('should preserve internal spaces', () => {
      expect(normalizeFoodName('pap and wors')).toBe('pap and wors');
    });
  });

  describe('deduplicateFoods', () => {
    it('should remove case-insensitive duplicates', () => {
      expect(deduplicateFoods(['pizza', 'Pizza', 'PIZZA'])).toEqual(['pizza']);
    });

    it('should preserve first occurrence', () => {
      expect(deduplicateFoods(['Pizza', 'pizza', 'PIZZA'])).toEqual(['Pizza']);
    });

    it('should handle mixed duplicates', () => {
      expect(
        deduplicateFoods(['pizza', 'Pizza', 'pasta', 'Pasta', 'pizza']),
      ).toEqual(['pizza', 'pasta']);
    });

    it('should return unique items unchanged', () => {
      expect(deduplicateFoods(['pizza', 'pasta', 'wors'])).toEqual([
        'pizza',
        'pasta',
        'wors',
      ]);
    });

    it('should handle empty array', () => {
      expect(deduplicateFoods([])).toEqual([]);
    });

    it('should handle single item', () => {
      expect(deduplicateFoods(['pizza'])).toEqual(['pizza']);
    });

    it('should not modify original array', () => {
      const original = ['pizza', 'Pizza'];
      const result = deduplicateFoods(original);
      expect(original).toEqual(['pizza', 'Pizza']);
      expect(result).toEqual(['pizza']);
    });
  });

  describe('foodUtils object', () => {
    it('should have toCSV method', () => {
      expect(foodUtils).toHaveProperty('toCSV');
      expect(typeof foodUtils.toCSV).toBe('function');
    });

    it('should have fromCSV method', () => {
      expect(foodUtils).toHaveProperty('fromCSV');
      expect(typeof foodUtils.fromCSV).toBe('function');
    });

    it('should have isValidFoodArray method', () => {
      expect(foodUtils).toHaveProperty('isValidFoodArray');
      expect(typeof foodUtils.isValidFoodArray).toBe('function');
    });

    it('should have normalize method', () => {
      expect(foodUtils).toHaveProperty('normalize');
      expect(typeof foodUtils.normalize).toBe('function');
    });

    it('should have deduplicate method', () => {
      expect(foodUtils).toHaveProperty('deduplicate');
      expect(typeof foodUtils.deduplicate).toBe('function');
    });

    it('should produce same results as individual functions', () => {
      const foods = ['pizza', 'pasta'];
      expect(foodUtils.toCSV(foods)).toBe(toCSV(foods));

      const csv = 'pizza,pasta';
      expect(foodUtils.fromCSV(csv)).toEqual(fromCSV(csv));

      expect(foodUtils.isValidFoodArray(foods)).toBe(isValidFoodArray(foods));

      const name = 'PIZZA';
      expect(foodUtils.normalize(name)).toBe(normalizeFoodName(name));

      expect(foodUtils.deduplicate(foods)).toEqual(deduplicateFoods(foods));
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert array to CSV and back', () => {
      const original = ['pizza', 'pasta', 'pap and wors'];
      const csv = toCSV(original);
      const restored = fromCSV(csv);
      expect(restored).toEqual(original);
    });

    it('should handle whitespace in round-trip', () => {
      const original = ['pizza', 'pasta', 'pap and wors'];
      const csv = toCSV(original);
      const withSpaces = `${csv} `;
      const restored = fromCSV(withSpaces);
      expect(restored).toEqual(original);
    });

    it('should deduplicate then convert', () => {
      const foods = ['pizza', 'Pizza', 'pasta', 'Pasta'];
      const deduped = deduplicateFoods(foods);
      const csv = toCSV(deduped);
      const restored = fromCSV(csv);
      expect(restored).toEqual(['pizza', 'pasta']);
      expect(isValidFoodArray(restored)).toBe(true);
    });
  });
});
