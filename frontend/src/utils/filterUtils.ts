/**
 * Filtering & Pagination Utilities
 * ================================
 * Pure functions for filtering, sorting, and paginating data
 */

import type {
  FilterCondition,
  SortConfig,
  PaginationConfig,
  SurveyRecord,
  PaginatedResults,
} from '@/types/filter.types';

/**
 * Check if a value matches a filter condition
 */
export function matchesCondition(
  value: unknown,
  condition: FilterCondition,
): boolean {
  const { operator, value: condValue, secondValue } = condition;

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return value === condValue;

    case 'contains':
      if (typeof value !== 'string' || typeof condValue !== 'string') {
        return false;
      }
      return value.toLowerCase().includes(condValue.toLowerCase());

    case 'gte':
      if (typeof value !== 'number' || typeof condValue !== 'number') {
        return false;
      }
      return value >= condValue;

    case 'lte':
      if (typeof value !== 'number' || typeof condValue !== 'number') {
        return false;
      }
      return value <= condValue;

    case 'between':
      if (
        typeof value !== 'number' ||
        typeof condValue !== 'number' ||
        typeof secondValue !== 'number'
      ) {
        return false;
      }
      return value >= condValue && value <= secondValue;

    case 'in':
      if (!Array.isArray(condValue)) {
        return false;
      }
      return (condValue as unknown[]).includes(value);

    default:
      return false;
  }
}

/**
 * Apply all filter conditions to a record
 */
export function applyFilters(
  record: SurveyRecord,
  conditions: FilterCondition[],
): boolean {
  // All conditions must be true (AND logic)
  return conditions.every((condition) => {
    const fieldValue = record[condition.field as keyof SurveyRecord];
    return matchesCondition(fieldValue, condition);
  });
}

/**
 * Sort records by sort config
 */
export function applySorting(
  records: SurveyRecord[],
  sort: SortConfig | null,
): SurveyRecord[] {
  if (!sort) {
    return records;
  }

  const { field, order } = sort;
  const sorted = [...records].sort((a, b) => {
    const aVal = a[field as keyof SurveyRecord];
    const bVal = b[field as keyof SurveyRecord];

    // Handle different value types
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Date comparison
    if (aVal instanceof Date && bVal instanceof Date) {
      return order === 'asc'
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }

    return 0;
  });

  return sorted;
}

/**
 * Apply pagination to filtered and sorted records
 */
export function applyPagination<T>(
  items: T[],
  pageNumber: number,
  pageSize: number,
): { items: T[]; pagination: PaginationConfig } {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Clamp page number to valid range
  const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages || 1));

  const startIndex = (validPageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      pageNumber: validPageNumber,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

/**
 * Apply complete filter → sort → paginate pipeline
 */
export function filterSortPaginate(
  records: SurveyRecord[],
  conditions: FilterCondition[],
  sort: SortConfig | null,
  pageNumber: number,
  pageSize: number,
): PaginatedResults<SurveyRecord> {
  // Step 1: Filter
  const filtered = records.filter((record) => applyFilters(record, conditions));

  // Step 2: Sort
  const sorted = applySorting(filtered, sort);

  // Step 3: Paginate
  const { items, pagination } = applyPagination(sorted, pageNumber, pageSize);

  return {
    items,
    pagination,
    hasNextPage: pagination.pageNumber < pagination.totalPages,
    hasPreviousPage: pagination.pageNumber > 1,
  };
}

/**
 * Get unique values for a field (useful for filter dropdowns)
 */
export function getUniqueFieldValues(
  records: SurveyRecord[],
  field: keyof SurveyRecord,
): unknown[] {
  const values = records
    .map((record) => record[field])
    .filter((val, idx, arr) => arr.indexOf(val) === idx);

  return values;
}

/**
 * Calculate field statistics for numeric fields
 */
export function getFieldStats(
  records: SurveyRecord[],
  field: keyof SurveyRecord,
): {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
} | null {
  const numericValues = records
    .map((record) => record[field])
    .filter((val): val is number => typeof val === 'number');

  if (numericValues.length === 0) {
    return null;
  }

  const sorted = [...numericValues].sort((a, b) => a - b);
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    avg: sum / numericValues.length,
    median,
    count: numericValues.length,
  };
}
