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

export function isSuccessResponse<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (isSuccessResponse(response)) {
    return response.data;
  }

  throw new Error(response.error.message);
}
