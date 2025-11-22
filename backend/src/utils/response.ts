/**
 * Response Formatting Utilities
 * =============================
 * Provides consistent API response structures and formatting helpers
 * Centralizes response logic to maintain DRY principle
 */

/**
 * Generic API response structure for successful responses
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

/**
 * Generic API response structure for error responses
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Centralized response formatter for successful operations
 *
 * @param data The payload to return
 * @returns Formatted success response with metadata
 *
 * @example
 * res.status(201).json(responseFormatter.success({ id: 123 }));
 */
export function formatSuccess<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Centralized response formatter for error operations
 *
 * @param message User-friendly error message
 * @param code Machine-readable error code
 * @param details Optional additional error context
 * @returns Formatted error response with metadata
 *
 * @example
 * res.status(400).json(responseFormatter.error(
 *   'Invalid email format',
 *   'VALIDATION_ERROR',
 *   { field: 'email', value: 'invalid' }
 * ));
 */
export function formatError(
  message: string,
  code: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Response formatter object for convenient access
 * @example
 * responseFormatter.success(data)
 * responseFormatter.error(message, code)
 */
export const responseFormatter = {
  success: formatSuccess,
  error: formatError,
};
