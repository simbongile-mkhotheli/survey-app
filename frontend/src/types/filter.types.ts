/**
 * Filter & Pagination Types
 * ========================
 * Type definitions for advanced filtering, sorting, and pagination functionality
 */

/**
 * Supported filter operators for different field types
 */
export type FilterOperator =
  | 'equals'
  | 'contains'
  | 'gte'
  | 'lte'
  | 'between'
  | 'in';

/**
 * Filter condition for a single field
 */
export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
  secondValue?: T; // For 'between' operator
}

/**
 * Sort configuration
 */
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  pageNumber: number; // 1-based
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Filter state management
 */
export interface FilterState {
  conditions: FilterCondition[];
  sort: SortConfig | null;
  pagination: PaginationConfig;
}

/**
 * Results with pagination metadata
 */
export interface PaginatedResults<T> {
  items: T[];
  pagination: PaginationConfig;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Survey response record for filtering
 */
export interface SurveyRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: string;
  foods: string[];
  ratingMovies: number;
  ratingRadio: number;
  ratingEatOut: number;
  ratingTV: number;
  submittedAt: string;
}

/**
 * Filterable field metadata
 */
export interface FilterableField {
  name: keyof SurveyRecord;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  operators: FilterOperator[];
  options?: Array<{ label: string; value: unknown }>;
}

/**
 * Filter state history for undo/redo
 */
export interface FilterHistory {
  state: FilterState;
  timestamp: number;
}

/**
 * Filter preset for quick filtering
 */
export interface FilterPreset {
  name: string;
  description?: string;
  conditions: FilterCondition[];
  sort?: SortConfig;
}
