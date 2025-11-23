/**
 * Advanced TypeScript Patterns
 * =============================
 * Discriminated unions, utility types, and conditional types for type-safe state management
 */

// ============================================================================
// Discriminated Union Types for Async State
// ============================================================================

/**
 * Represents the loading state of an async operation
 * No associated data, just indicates loading is in progress
 */
interface LoadingState {
  status: 'loading';
  data: null;
  error: null;
}

/**
 * Represents successful completion of an async operation
 * Contains the loaded data
 */
interface SuccessState<T> {
  status: 'success';
  data: T;
  error: null;
}

/**
 * Represents failed completion of an async operation
 * Contains error information
 */
interface ErrorState {
  status: 'error';
  data: null;
  error: Error;
}

/**
 * Represents idle state before any operation starts
 * No data or error
 */
interface IdleState {
  status: 'idle';
  data: null;
  error: null;
}

/**
 * Discriminated union type for all async states
 * Type guards ensure exhaustive case handling
 *
 * @example
 * const state: AsyncState<User> = { status: 'success', data: user, error: null };
 * if (state.status === 'success') {
 *   console.log(state.data); // User
 * }
 */
export type AsyncState<T> =
  | IdleState
  | LoadingState
  | SuccessState<T>
  | ErrorState;

/**
 * Type guard to check if state is loading
 */
export function isLoading<T = unknown>(
  state: AsyncState<T>,
): state is LoadingState {
  return state.status === 'loading';
}

/**
 * Type guard to check if state is success
 */
export function isSuccess<T>(state: AsyncState<T>): state is SuccessState<T> {
  return state.status === 'success';
}

/**
 * Type guard to check if state is error
 */
export function isError<T = unknown>(
  state: AsyncState<T>,
): state is ErrorState {
  return state.status === 'error';
}

/**
 * Type guard to check if state is idle
 */
export function isIdle<T = unknown>(state: AsyncState<T>): state is IdleState {
  return state.status === 'idle';
}

// ============================================================================
// Utility Types for Type Safety
// ============================================================================

/**
 * Extract the success data type from an AsyncState
 *
 * @example
 * type UserData = ExtractAsyncData<AsyncState<User>>; // User
 */
export type ExtractAsyncData<S> = S extends SuccessState<infer T> ? T : never;

/**
 * Make all properties of T optional except K
 *
 * @example
 * type UserUpdate = RequireFields<User, 'id'>; // All fields optional except 'id'
 */
export type RequireFields<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties of T readonly
 *
 * @example
 * type ReadonlyUser = DeepReadonly<User>; // All properties readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

/**
 * Extract non-null properties from T
 *
 * @example
 * type NonNullableUser = NonNullableFields<User>; // No null/undefined fields
 */
export type NonNullableFields<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

/**
 * Create a record of keys mapped to a specific type
 *
 * @example
 * type RolePermissions = KeysToRecord<'read' | 'write' | 'delete', boolean>;
 * // { read: boolean; write: boolean; delete: boolean; }
 */
export type KeysToRecord<K extends string | number | symbol, V> = Record<K, V>;

/**
 * Conditional type for API responses
 * Returns success type if T is not null, otherwise returns error
 *
 * @example
 * type Response<T> = ResponseType<T | null>;
 */
export type ResponseType<T> = T extends null | undefined
  ? { status: 'error'; error: string }
  : { status: 'success'; data: T };

/**
 * Extract keys of type K from object T
 *
 * @example
 * type StringKeys = KeysOfType<User, string>; // 'name' | 'email'
 */
export type KeysOfType<T, K> = {
  [P in keyof T]: T[P] extends K ? P : never;
}[keyof T];

/**
 * Flatten an object with nested properties (limited depth for complexity)
 *
 * @example
 * type Flattened = DeepPartial<{ user: { name: string } }>;
 * // { user?: { name?: string } }
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, unknown>
    ? DeepPartial<T[P]>
    : T[P];
};

// ============================================================================
// API Response Types with Conditional Logic
// ============================================================================

/**
 * Generic API response wrapper with conditional typing
 */
export interface ApiResponse<T, IsSuccess extends boolean = true> {
  success: IsSuccess;
  data: IsSuccess extends true ? T : null;
  error: IsSuccess extends true ? null : Error;
  timestamp: Date;
}

/**
 * Success response type
 */
export type SuccessResponse<T> = ApiResponse<T, true>;

/**
 * Error response type
 */
export type ErrorResponse = ApiResponse<never, false>;

/**
 * Union of all possible API responses
 */
export type ApiResponseResult<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Generic State Management Types
// ============================================================================

/**
 * Generic state reducer action type
 */
export interface Action<T extends string = string, P = void> {
  type: T;
  payload?: P;
}

/**
 * State management hook result type with proper typing
 *
 * @example
 * type UseUserState = UseStateResult<User, UseUserActions>;
 */
export interface UseStateResult<
  T,
  A extends Record<string, (...args: unknown[]) => void>,
> {
  state: T;
  actions: {
    [K in keyof A]: A[K];
  };
}

// ============================================================================
// Component Props Type Helpers
// ============================================================================

/**
 * Extract component props from a React component
 *
 * @example
 * type ButtonProps = ComponentProps<typeof Button>;
 */
export type ComponentProps<
  T extends (props: Record<string, unknown>) => unknown,
> = T extends (props: infer P) => unknown ? P : never;

/**
 * Make specific props required in a component props object
 *
 * @example
 * type RequiredButtonProps = RequiredProps<ButtonProps, 'onClick'>;
 */
export type RequiredProps<
  T extends Record<string, unknown>,
  K extends keyof T,
> = T & Required<Pick<T, K>>;

/**
 * Make specific props optional in a component props object
 *
 * @example
 * type PartialButtonProps = OptionalProps<ButtonProps, 'className'>;
 */
export type OptionalProps<
  T extends Record<string, unknown>,
  K extends keyof T,
> = Omit<T, K> & Partial<Pick<T, K>>;
