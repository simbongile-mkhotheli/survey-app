import axios from 'axios';
import type { SurveyFormValues } from '@/validation';
import { formToPayload } from '@shared-root/validation';
import { config } from '@/config/env';
import { unwrapResponse } from '@/utils/response';
import type { ApiResponse } from '@/utils/response';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export async function fetchResults(): Promise<ResultsData> {
  const response =
    await apiClient.get<ApiResponse<ResultsData>>('/api/results');
  return unwrapResponse(response.data);
}
