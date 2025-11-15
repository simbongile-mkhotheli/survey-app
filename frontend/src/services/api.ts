import axios from 'axios';
import type { SurveyFormValues } from '../validation';
import { formToPayload } from '../shared/validation';
import { config } from '@/config/env';

// Configure axios instance with environment-based settings
const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging in development
if (config.isDevelopment) {
  apiClient.interceptors.request.use(
    (config) => {
      // eslint-disable-next-line no-console
      console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    },
  );

  apiClient.interceptors.response.use(
    (response) => {
      // eslint-disable-next-line no-console
      console.log('✅ API Response:', response.status, response.config.url);
      return response;
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error(
        '❌ API Response Error:',
        error.response?.status,
        error.config?.url,
      );
      return Promise.reject(error);
    },
  );
}

/*
 * submitSurvey
 * ----------------
 * Sends a POST to ${API_URL}/api/survey with all fields from SurveyFormValues.
 * Converts rating fields from string to number.
 *
 * Returns the new record’s ID.
 */
export async function submitSurvey(
  data: SurveyFormValues,
): Promise<{ id: number }> {
  const payload = formToPayload(data);

  const response = await apiClient.post<{ id: number }>('/api/survey', payload);
  return response.data;
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
 * Sends a GET to ${API_URL}/api/results and returns the parsed JSON.
 */
export async function fetchResults(): Promise<ResultsData> {
  const response = await apiClient.get<ResultsData>('/api/results');
  return response.data;
}
