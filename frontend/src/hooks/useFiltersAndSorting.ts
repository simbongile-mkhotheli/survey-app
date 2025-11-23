/**
 * useFiltersAndSorting Hook
 * =========================
 * Advanced filtering, sorting, and pagination state management with history support
 */

import { useCallback, useReducer, useRef, useMemo } from 'react';
import { logWithContext } from '@/utils/logger';
import type {
  FilterCondition,
  SortConfig,
  FilterState,
  FilterHistory,
  SurveyRecord,
  PaginationConfig,
  PaginatedResults,
} from '@/types/filter.types';
import { filterSortPaginate } from '@/utils/filterUtils';

/**
 * Filter state actions
 */
type FilterAction =
  | { type: 'ADD_CONDITION'; payload: FilterCondition }
  | { type: 'REMOVE_CONDITION'; payload: number }
  | {
      type: 'UPDATE_CONDITION';
      payload: { index: number; condition: FilterCondition };
    }
  | { type: 'SET_SORT'; payload: SortConfig | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PAGINATION'; payload: PaginationConfig };

/**
 * Reducer for filter state
 */
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'ADD_CONDITION': {
      const newConditions = [...state.conditions, action.payload];
      logWithContext.debug('Filter condition added', {
        operation: 'add_condition',
        field: action.payload.field,
        operator: action.payload.operator,
        totalConditions: newConditions.length,
      });
      return {
        ...state,
        conditions: newConditions,
        pagination: { ...state.pagination, pageNumber: 1 }, // Reset to page 1
      };
    }

    case 'REMOVE_CONDITION': {
      const newConditions = state.conditions.filter(
        (_, idx) => idx !== action.payload,
      );
      logWithContext.debug('Filter condition removed', {
        operation: 'remove_condition',
        totalConditions: newConditions.length,
      });
      return {
        ...state,
        conditions: newConditions,
        pagination: { ...state.pagination, pageNumber: 1 },
      };
    }

    case 'UPDATE_CONDITION': {
      const newConditions = [...state.conditions];
      newConditions[action.payload.index] = action.payload.condition;
      logWithContext.debug('Filter condition updated', {
        operation: 'update_condition',
        field: action.payload.condition.field,
        operator: action.payload.condition.operator,
      });
      return {
        ...state,
        conditions: newConditions,
        pagination: { ...state.pagination, pageNumber: 1 },
      };
    }

    case 'SET_SORT': {
      logWithContext.debug('Sort applied', {
        operation: 'set_sort',
        field: action.payload?.field || 'none',
        order: action.payload?.order || 'asc',
      });
      return {
        ...state,
        sort: action.payload,
        pagination: { ...state.pagination, pageNumber: 1 },
      };
    }

    case 'SET_PAGE': {
      return {
        ...state,
        pagination: { ...state.pagination, pageNumber: action.payload },
      };
    }

    case 'SET_PAGE_SIZE': {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload,
          pageNumber: 1,
        },
      };
    }

    case 'RESET_FILTERS': {
      logWithContext.info('Filters reset', { operation: 'reset_filters' });
      return {
        conditions: [],
        sort: null,
        pagination: {
          pageNumber: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    case 'SET_PAGINATION': {
      return {
        ...state,
        pagination: action.payload,
      };
    }

    default:
      return state;
  }
}

/**
 * Hook for filter, sort, and pagination management
 */
export function useFiltersAndSorting() {
  const [state, dispatch] = useReducer(filterReducer, {
    conditions: [],
    sort: null,
    pagination: { pageNumber: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  });

  const historyRef = useRef<FilterHistory[]>([]);

  /**
   * Execute filtering, sorting, and pagination on records
   */
  const execute = useCallback(
    (records: SurveyRecord[]): PaginatedResults<SurveyRecord> => {
      const startTime = performance.now();

      const result = filterSortPaginate(
        records,
        state.conditions,
        state.sort,
        state.pagination.pageNumber,
        state.pagination.pageSize,
      );

      // Update pagination state if total items changed
      if (result.pagination.totalItems !== state.pagination.totalItems) {
        dispatch({
          type: 'SET_PAGINATION',
          payload: result.pagination,
        });
      }

      const duration = performance.now() - startTime;
      logWithContext.debug('Filter/sort/paginate executed', {
        operation: 'execute_filters',
        duration: `${duration.toFixed(2)}ms`,
        itemsFound: result.pagination.totalItems,
        itemsDisplayed: result.items.length,
        conditionsCount: state.conditions.length,
      });

      return result;
    },
    [state.conditions, state.sort, state.pagination],
  );

  /**
   * Add filter condition
   */
  const addCondition = useCallback((condition: FilterCondition) => {
    dispatch({ type: 'ADD_CONDITION', payload: condition });
  }, []);

  /**
   * Remove filter condition by index
   */
  const removeCondition = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_CONDITION', payload: index });
  }, []);

  /**
   * Update filter condition at index
   */
  const updateCondition = useCallback(
    (index: number, condition: FilterCondition) => {
      dispatch({ type: 'UPDATE_CONDITION', payload: { index, condition } });
    },
    [],
  );

  /**
   * Set sort configuration
   */
  const setSort = useCallback((sort: SortConfig | null) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  }, []);

  /**
   * Navigate to page
   */
  const goToPage = useCallback((pageNumber: number) => {
    dispatch({ type: 'SET_PAGE', payload: pageNumber });
  }, []);

  /**
   * Change page size
   */
  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);

  /**
   * Reset all filters and sorting
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  /**
   * Get history of filter states
   */
  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  /**
   * Get undo/redo availability
   */
  const canUndo = useMemo(() => historyRef.current.length > 0, []);

  /**
   * Get current filter state summary
   */
  const getSummary = useCallback(() => {
    return {
      conditionsCount: state.conditions.length,
      hasSorting: state.sort !== null,
      currentPage: state.pagination.pageNumber,
      pageSize: state.pagination.pageSize,
      totalItems: state.pagination.totalItems,
      totalPages: state.pagination.totalPages,
    };
  }, [state]);

  /**
   * Clear specific filter condition type
   */
  const clearConditionsByField = useCallback(
    (field: string) => {
      const indices = state.conditions
        .map((cond, idx) => (cond.field === field ? idx : -1))
        .filter((idx) => idx !== -1)
        .reverse(); // Reverse to maintain correct indices when removing

      indices.forEach((idx) => {
        dispatch({ type: 'REMOVE_CONDITION', payload: idx });
      });

      logWithContext.info('Filter conditions cleared by field', {
        operation: 'clear_by_field',
        field,
        count: indices.length,
      });
    },
    [state.conditions],
  );

  return {
    state,
    execute,
    addCondition,
    removeCondition,
    updateCondition,
    setSort,
    goToPage,
    setPageSize,
    reset,
    getHistory,
    canUndo,
    getSummary,
    clearConditionsByField,
  };
}

export type UseFiltersAndSorting = ReturnType<typeof useFiltersAndSorting>;
