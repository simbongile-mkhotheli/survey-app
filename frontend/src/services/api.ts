import axios from 'axios';
import type { SurveyFormValues } from '@/validation';
import { formToPayload } from '@shared-root/validation';
import { config } from '@/config/env';
import { unwrapResponse } from '@/utils/response';
import type { ApiResponse } from '@/utils/response';

// Configure axios instance with environment-based settings
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors configured but logging removed from production
// Errors are handled by error boundaries and logged to server via API responses

/*
 * submitSurvey
 * ----------------
 * Sends a POST to ${API_URL}/api/survey with all fields from SurveyFormValues.
 * Converts rating fields from string to number.
 * Unwraps backend's ApiSuccessResponse wrapper to return just the ID.
 *
 * Returns the new record's ID.
 */
export async function submitSurvey(
  data: SurveyFormValues,
): Promise<{ id: number }> {
  const payload = formToPayload(data);

  const response = await apiClient.post<ApiResponse<{ id: number }>>(
    '/api/survey',
    payload,
  );
  return unwrapResponse(response.data);
}

/**
 * ResultsData
 * ----------------
 * Matches the shape returned from GET /api/results.
 * Updated to match backend SurveyResultsDTO exactly
 */
export type ResultsData = {
  totalCount: number;
  age: {
    avg: number | null;
    min: number | null;
    max: number | null;
  };
  foodPercentages: {
    pizza: number | null;
    pasta: number | null;
    papAndWors: number | null;
  };
  avgRatings: {
    movies: number | null;
    radio: number | null;
    eatOut: number | null;
    tv: number | null;
  };
};

/**
 * fetchResults
 * ----------------
 * Sends a GET to ${API_URL}/api/results.
 * Unwraps backend's ApiSuccessResponse wrapper to return just the results data.
 */
export async function fetchResults(): Promise<ResultsData> {
  const response =
    await apiClient.get<ApiResponse<ResultsData>>('/api/results');
  return unwrapResponse(response.data);
}
