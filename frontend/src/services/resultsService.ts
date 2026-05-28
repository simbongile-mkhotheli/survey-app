import { unwrapResponse } from '@/utils/response';
import type { ApiResponse } from '@/utils/response';
import { apiClient } from './apiClient';

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
