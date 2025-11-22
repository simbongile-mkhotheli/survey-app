/**
 * Response Utilities (Frontend)
 * =============================
 * Handles API response unwrapping and type safety
 * Mirrors backend response.ts for consistency
 */

/**
 * Backend API response wrapper format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Check if response is a success response
 *
 * @param response API response to check
 * @returns True if response indicates success
 *
 * @example
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // Type: T
 * }
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Check if response is an error response
 *
 * @param response API response to check
 * @returns True if response indicates error
 *
 * @example
 * if (isErrorResponse(response)) {
 *   console.error(response.error.message);
 * }
 */
export function isErrorResponse(
  response: ApiResponse,
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Unwrap API response data, throwing error if response failed
 *
 * @param response API response to unwrap
 * @returns Unwrapped data
 * @throws Error if response indicates failure
 *
 * @example
 * const data = unwrapResponse(response);
 * console.log(data); // Type: T
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  throw new Error(response.error.message);
}

/**
 * Safely unwrap response with fallback value
 *
 * @param response API response to unwrap
 * @param fallback Default value if unwrap fails
 * @returns Unwrapped data or fallback
 *
 * @example
 * const data = unwrapResponseOrDefault(response, null);
 * console.log(data); // Type: T | null
 */
export function unwrapResponseOrDefault<T>(
  response: ApiResponse<T>,
  fallback: T,
): T {
  try {
    return unwrapResponse(response);
  } catch {
    return fallback;
  }
}

/**
 * Map API response to another type
 *
 * @param response API response to map
 * @param mapper Function to transform data
 * @returns Mapped response
 *
 * @example
 * const mapped = mapResponse(response, data => ({
 *   ...data,
 *   formatted: data.date.split('T')[0]
 * }));
 */
export function mapResponse<T, U>(
  response: ApiResponse<T>,
  mapper: (data: T) => U,
): ApiResponse<U> {
  if (isSuccessResponse(response)) {
    return {
      success: true,
      data: mapper(response.data),
      timestamp: response.timestamp,
    };
  }
  return response as ApiErrorResponse;
}

/**
 * Response utilities object for convenient access
 * @example
 * responseUtils.isSuccess(response)
 * responseUtils.unwrap(response)
 */
export const responseUtils = {
  isSuccess: isSuccessResponse,
  isError: isErrorResponse,
  unwrap: unwrapResponse,
  unwrapOrDefault: unwrapResponseOrDefault,
  map: mapResponse,
};
