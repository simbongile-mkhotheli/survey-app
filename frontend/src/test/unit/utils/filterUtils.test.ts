/**
 * Filter Utilities Tests
 * ====================
 */

import { describe, it, expect } from 'vitest';
import {
  matchesCondition,
  applyFilters,
  applySorting,
  applyPagination,
  filterSortPaginate,
  getUniqueFieldValues,
  getFieldStats,
} from '@/utils/filterUtils';
import type { FilterCondition, SurveyRecord } from '@/types/filter.types';
import { faker } from '@faker-js/faker';

/**
 * Create a mock survey record for testing
 */
function createMockRecord(overrides?: Partial<SurveyRecord>): SurveyRecord {
  return {
    id: faker.number.int(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    contactNumber: '+1' + faker.string.numeric(10),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65 }).toISOString(),
    foods: [faker.word.noun(), faker.word.noun()],
    ratingMovies: faker.number.int({ min: 1, max: 5 }),
    ratingRadio: faker.number.int({ min: 1, max: 5 }),
    ratingEatOut: faker.number.int({ min: 1, max: 5 }),
    ratingTV: faker.number.int({ min: 1, max: 5 }),
    submittedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
}

describe('Filter Utilities', () => {
  describe('matchesCondition', () => {
    it('should match equals operator for string values', () => {
      const condition: FilterCondition = {
        field: 'firstName',
        operator: 'equals',
        value: 'John',
      };
      expect(matchesCondition('John', condition)).toBe(true);
      expect(matchesCondition('jane', condition)).toBe(false);
    });

    it('should match contains operator with case-insensitive search', () => {
      const condition: FilterCondition = {
        field: 'firstName',
        operator: 'contains',
        value: 'john',
      };
      expect(matchesCondition('Johnny', condition)).toBe(true);
      expect(matchesCondition('JOHN', condition)).toBe(true);
      expect(matchesCondition('jane', condition)).toBe(false);
    });

    it('should match gte operator for numbers', () => {
      const condition: FilterCondition = {
        field: 'ratingMovies',
        operator: 'gte',
        value: 3,
      };
      expect(matchesCondition(5, condition)).toBe(true);
      expect(matchesCondition(3, condition)).toBe(true);
      expect(matchesCondition(2, condition)).toBe(false);
    });

    it('should match lte operator for numbers', () => {
      const condition: FilterCondition = {
        field: 'ratingMovies',
        operator: 'lte',
        value: 3,
      };
      expect(matchesCondition(1, condition)).toBe(true);
      expect(matchesCondition(3, condition)).toBe(true);
      expect(matchesCondition(4, condition)).toBe(false);
    });

    it('should match between operator for numbers', () => {
      const condition: FilterCondition = {
        field: 'ratingMovies',
        operator: 'between',
        value: 2,
        secondValue: 4,
      };
      expect(matchesCondition(3, condition)).toBe(true);
      expect(matchesCondition(2, condition)).toBe(true);
      expect(matchesCondition(4, condition)).toBe(true);
      expect(matchesCondition(1, condition)).toBe(false);
      expect(matchesCondition(5, condition)).toBe(false);
    });

    it('should match in operator for arrays', () => {
      const condition: FilterCondition = {
        field: 'ratingMovies',
        operator: 'in',
        value: [2, 4, 5],
      };
      expect(matchesCondition(2, condition)).toBe(true);
      expect(matchesCondition(4, condition)).toBe(true);
      expect(matchesCondition(5, condition)).toBe(true);
      expect(matchesCondition(1, condition)).toBe(false);
      expect(matchesCondition(3, condition)).toBe(false);
    });
  });

  describe('applyFilters', () => {
    it('should return true when all conditions match (AND logic)', () => {
      const record = createMockRecord({
        firstName: 'John',
        ratingMovies: 4,
      });

      const conditions: FilterCondition[] = [
        { field: 'firstName', operator: 'contains', value: 'john' },
        { field: 'ratingMovies', operator: 'gte', value: 3 },
      ];

      expect(applyFilters(record, conditions)).toBe(true);
    });

    it('should return false when any condition fails (AND logic)', () => {
      const record = createMockRecord({
        firstName: 'Jane',
        ratingMovies: 2,
      });

      const conditions: FilterCondition[] = [
        { field: 'firstName', operator: 'contains', value: 'john' },
        { field: 'ratingMovies', operator: 'gte', value: 3 },
      ];

      expect(applyFilters(record, conditions)).toBe(false);
    });

    it('should return true when no conditions provided', () => {
      const record = createMockRecord();
      expect(applyFilters(record, [])).toBe(true);
    });
  });

  describe('applySorting', () => {
    it('should sort strings in ascending order', () => {
      const records = [
        createMockRecord({ firstName: 'Charlie' }),
        createMockRecord({ firstName: 'Alice' }),
        createMockRecord({ firstName: 'Bob' }),
      ];

      const sorted = applySorting(records, {
        field: 'firstName',
        order: 'asc',
      });

      expect(sorted[0].firstName).toBe('Alice');
      expect(sorted[1].firstName).toBe('Bob');
      expect(sorted[2].firstName).toBe('Charlie');
    });

    it('should sort strings in descending order', () => {
      const records = [
        createMockRecord({ firstName: 'Alice' }),
        createMockRecord({ firstName: 'Charlie' }),
        createMockRecord({ firstName: 'Bob' }),
      ];

      const sorted = applySorting(records, {
        field: 'firstName',
        order: 'desc',
      });

      expect(sorted[0].firstName).toBe('Charlie');
      expect(sorted[1].firstName).toBe('Bob');
      expect(sorted[2].firstName).toBe('Alice');
    });

    it('should sort numbers in ascending order', () => {
      const records = [
        createMockRecord({ ratingMovies: 5 }),
        createMockRecord({ ratingMovies: 1 }),
        createMockRecord({ ratingMovies: 3 }),
      ];

      const sorted = applySorting(records, {
        field: 'ratingMovies',
        order: 'asc',
      });

      expect(sorted[0].ratingMovies).toBe(1);
      expect(sorted[1].ratingMovies).toBe(3);
      expect(sorted[2].ratingMovies).toBe(5);
    });

    it('should return unchanged array when no sort provided', () => {
      const records = [
        createMockRecord({ firstName: 'Charlie' }),
        createMockRecord({ firstName: 'Alice' }),
      ];

      const sorted = applySorting(records, null);
      expect(sorted).toEqual(records);
    });
  });

  describe('applyPagination', () => {
    it('should paginate items correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const { items: paginated, pagination } = applyPagination(items, 2, 10);

      expect(paginated).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
      expect(pagination.pageNumber).toBe(2);
      expect(pagination.pageSize).toBe(10);
      expect(pagination.totalItems).toBe(25);
      expect(pagination.totalPages).toBe(3);
    });

    it('should clamp page number to valid range', () => {
      const items = Array.from({ length: 15 }, (_, i) => i);
      const { pagination } = applyPagination(items, 10, 10); // Page 10 is out of range

      expect(pagination.pageNumber).toBe(2); // Should be clamped to last valid page
    });

    it('should handle empty items array', () => {
      const { items, pagination } = applyPagination([], 1, 10);

      expect(items).toEqual([]);
      expect(pagination.totalItems).toBe(0);
      expect(pagination.totalPages).toBe(0);
    });

    it('should handle single page', () => {
      const items = Array.from({ length: 5 }, (_, i) => i);
      const { items: paginated, pagination } = applyPagination(items, 1, 10);

      expect(paginated).toEqual([0, 1, 2, 3, 4]);
      expect(pagination.totalPages).toBe(1);
    });
  });

  describe('filterSortPaginate', () => {
    it('should apply complete pipeline in correct order', () => {
      const records = [
        createMockRecord({ firstName: 'Charlie', ratingMovies: 5 }),
        createMockRecord({ firstName: 'Alice', ratingMovies: 1 }),
        createMockRecord({ firstName: 'Bob', ratingMovies: 3 }),
        createMockRecord({ firstName: 'David', ratingMovies: 2 }),
      ];

      const result = filterSortPaginate(
        records,
        [{ field: 'ratingMovies', operator: 'gte', value: 2 }],
        { field: 'firstName', order: 'asc' },
        1,
        10,
      );

      // Should filter to ratingMovies >= 2: Charlie, Bob, David
      // Should sort by firstName ascending: Bob, Charlie, David
      expect(result.items.length).toBe(3);
      expect(result.items[0].firstName).toBe('Bob');
      expect(result.items[1].firstName).toBe('Charlie');
      expect(result.items[2].firstName).toBe('David');
      expect(result.pagination.totalItems).toBe(3);
    });

    it('should provide pagination metadata', () => {
      const records = Array.from({ length: 25 }, () =>
        createMockRecord({ ratingMovies: 3 }),
      );

      const result = filterSortPaginate(
        records,
        [{ field: 'ratingMovies', operator: 'gte', value: 2 }],
        null,
        2,
        10,
      );

      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
      expect(result.pagination.pageNumber).toBe(2);
    });
  });

  describe('getUniqueFieldValues', () => {
    it('should return unique values for a field', () => {
      const records = [
        createMockRecord({ ratingMovies: 5 }),
        createMockRecord({ ratingMovies: 3 }),
        createMockRecord({ ratingMovies: 5 }),
        createMockRecord({ ratingMovies: 1 }),
      ];

      const unique = getUniqueFieldValues(records, 'ratingMovies');
      expect(unique).toHaveLength(3);
      expect(unique).toContain(5);
      expect(unique).toContain(3);
      expect(unique).toContain(1);
    });
  });

  describe('getFieldStats', () => {
    it('should calculate statistics for numeric fields', () => {
      const records = [
        createMockRecord({ ratingMovies: 1 }),
        createMockRecord({ ratingMovies: 2 }),
        createMockRecord({ ratingMovies: 3 }),
        createMockRecord({ ratingMovies: 4 }),
        createMockRecord({ ratingMovies: 5 }),
      ];

      const stats = getFieldStats(records, 'ratingMovies');

      expect(stats).not.toBeNull();
      expect(stats!.min).toBe(1);
      expect(stats!.max).toBe(5);
      expect(stats!.avg).toBe(3);
      expect(stats!.median).toBe(3);
      expect(stats!.count).toBe(5);
    });

    it('should return null for empty array', () => {
      const stats = getFieldStats([], 'ratingMovies');
      expect(stats).toBeNull();
    });
  });
});
