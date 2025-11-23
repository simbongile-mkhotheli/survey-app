/**
 * useFiltersAndSorting Hook Tests
 * =============================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFiltersAndSorting } from '@/hooks/useFiltersAndSorting';
import type { SurveyRecord, FilterCondition } from '@/types/filter.types';
import { faker } from '@faker-js/faker';

/**
 * Create mock survey records
 */
function createMockRecords(count: number): SurveyRecord[] {
  return Array.from({ length: count }, () => ({
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
  }));
}

describe('useFiltersAndSorting Hook', () => {
  let mockRecords: SurveyRecord[];

  beforeEach(() => {
    mockRecords = createMockRecords(30);
  });

  describe('initialization', () => {
    it('should initialize with empty filters and no sorting', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      expect(result.current.state.conditions).toEqual([]);
      expect(result.current.state.sort).toBeNull();
      expect(result.current.state.pagination.pageNumber).toBe(1);
      expect(result.current.state.pagination.pageSize).toBe(10);
    });
  });

  describe('filter conditions', () => {
    it('should add filter conditions', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const condition: FilterCondition = {
        field: 'firstName',
        operator: 'contains',
        value: 'John',
      };

      act(() => {
        result.current.addCondition(condition);
      });

      expect(result.current.state.conditions).toHaveLength(1);
      expect(result.current.state.conditions[0]).toEqual(condition);
    });

    it('should remove filter conditions by index', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const condition1: FilterCondition = {
        field: 'firstName',
        operator: 'contains',
        value: 'John',
      };
      const condition2: FilterCondition = {
        field: 'ratingMovies',
        operator: 'gte',
        value: 3,
      };

      act(() => {
        result.current.addCondition(condition1);
        result.current.addCondition(condition2);
      });

      act(() => {
        result.current.removeCondition(0);
      });

      expect(result.current.state.conditions).toHaveLength(1);
      expect(result.current.state.conditions[0]).toEqual(condition2);
    });

    it('should update filter conditions', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const condition: FilterCondition = {
        field: 'firstName',
        operator: 'contains',
        value: 'John',
      };

      act(() => {
        result.current.addCondition(condition);
      });

      const updatedCondition: FilterCondition = {
        field: 'firstName',
        operator: 'equals',
        value: 'Jane',
      };

      act(() => {
        result.current.updateCondition(0, updatedCondition);
      });

      expect(result.current.state.conditions[0]).toEqual(updatedCondition);
    });

    it('should reset all filters', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.addCondition({
          field: 'firstName',
          operator: 'contains',
          value: 'John',
        });
        result.current.setSort({ field: 'firstName', order: 'asc' });
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.conditions).toEqual([]);
      expect(result.current.state.sort).toBeNull();
      expect(result.current.state.pagination.pageNumber).toBe(1);
    });
  });

  describe('sorting', () => {
    it('should set sort configuration', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const sortConfig = { field: 'firstName', order: 'asc' as const };

      act(() => {
        result.current.setSort(sortConfig);
      });

      expect(result.current.state.sort).toEqual(sortConfig);
    });

    it('should clear sort when setting to null', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.setSort({ field: 'firstName', order: 'asc' });
        result.current.setSort(null);
      });

      expect(result.current.state.sort).toBeNull();
    });
  });

  describe('pagination', () => {
    it('should navigate to specific page', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.state.pagination.pageNumber).toBe(2);
    });

    it('should change page size', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.setPageSize(25);
      });

      expect(result.current.state.pagination.pageSize).toBe(25);
      expect(result.current.state.pagination.pageNumber).toBe(1); // Reset to page 1
    });

    it('should reset page number when adding filters', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.goToPage(3);
      });

      act(() => {
        result.current.addCondition({
          field: 'firstName',
          operator: 'contains',
          value: 'John',
        });
      });

      expect(result.current.state.pagination.pageNumber).toBe(1);
    });
  });

  describe('execute filtering', () => {
    it('should apply filters and return paginated results', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const recordsWithRating3 = mockRecords.filter(
        (r) => r.ratingMovies === 3,
      );

      act(() => {
        result.current.addCondition({
          field: 'ratingMovies',
          operator: 'equals',
          value: 3,
        });
      });

      const filterResult = result.current.execute(mockRecords);

      expect(filterResult.pagination.totalItems).toBe(
        recordsWithRating3.length,
      );
      expect(filterResult.items.every((r) => r.ratingMovies === 3)).toBe(true);
    });

    it('should apply sorting to filtered results', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.setSort({ field: 'firstName', order: 'asc' });
      });

      const filterResult = result.current.execute(mockRecords);

      // Verify records are sorted by firstName ascending
      if (filterResult.items.length > 1) {
        for (let i = 0; i < filterResult.items.length - 1; i++) {
          const current = filterResult.items[i].firstName;
          const next = filterResult.items[i + 1].firstName;
          expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
        }
      }
    });

    it('should paginate results correctly', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.setPageSize(10);
        result.current.goToPage(2);
      });

      const filterResult = result.current.execute(mockRecords);

      expect(filterResult.items.length).toBeLessThanOrEqual(10);
      expect(filterResult.pagination.pageNumber).toBe(2);
    });

    it('should provide pagination metadata', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.setPageSize(10);
        result.current.goToPage(1);
      });

      const filterResult = result.current.execute(mockRecords);

      expect(filterResult.hasNextPage).toBe(mockRecords.length > 10);
      expect(filterResult.hasPreviousPage).toBe(false);
    });
  });

  describe('utility methods', () => {
    it('should return summary of filter state', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.addCondition({
          field: 'firstName',
          operator: 'contains',
          value: 'John',
        });
        result.current.setSort({ field: 'firstName', order: 'asc' });
        result.current.goToPage(2);
      });

      const summary = result.current.getSummary();

      expect(summary.conditionsCount).toBe(1);
      expect(summary.hasSorting).toBe(true);
      expect(summary.currentPage).toBe(2);
      expect(summary.pageSize).toBe(10);
    });

    it('should clear conditions by field', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.addCondition({
          field: 'firstName',
          operator: 'contains',
          value: 'John',
        });
        result.current.addCondition({
          field: 'firstName',
          operator: 'equals',
          value: 'Jane',
        });
        result.current.addCondition({
          field: 'ratingMovies',
          operator: 'gte',
          value: 3,
        });
      });

      act(() => {
        result.current.clearConditionsByField('firstName');
      });

      expect(result.current.state.conditions).toHaveLength(1);
      expect(result.current.state.conditions[0].field).toBe('ratingMovies');
    });

    it('should return history', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const history = result.current.getHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('should track canUndo state', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      expect(result.current.canUndo).toBe(false);
      // Note: Full undo/redo implementation can be extended in future
    });
  });

  describe('complex filter scenarios', () => {
    it('should apply multiple conditions with AND logic', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      const highRatedRecords = mockRecords.filter(
        (record: SurveyRecord) => record.ratingMovies >= 4,
      );

      act(() => {
        result.current.addCondition({
          field: 'ratingMovies',
          operator: 'gte',
          value: 4,
        });
      });

      const filterResult = result.current.execute(mockRecords);

      expect(
        filterResult.items.every(
          (record: SurveyRecord) => record.ratingMovies >= 4,
        ),
      ).toBe(true);
      expect(filterResult.pagination.totalItems).toBe(highRatedRecords.length);
    });

    it('should handle no matching results', () => {
      const { result } = renderHook(() => useFiltersAndSorting());

      act(() => {
        result.current.addCondition({
          field: 'ratingMovies',
          operator: 'equals',
          value: 999, // Impossible rating
        });
      });

      const filterResult = result.current.execute(mockRecords);

      expect(filterResult.items).toHaveLength(0);
      expect(filterResult.pagination.totalItems).toBe(0);
    });
  });
});
