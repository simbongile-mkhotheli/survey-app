// frontend/src/services/api.ts

import axios from 'axios';
import type { SurveyFormValues } from '../validation';

/**
 * submitSurvey
 * ----------------
 * Sends a POST to /api/survey with all fields from SurveyFormValues.
 * Converts rating fields from string to number.
 *
 * Returns the Axios response containing the new record’s ID.
 */
export async function submitSurvey(
  data: SurveyFormValues,
): Promise<{ id: number }> {
  // Build payload exactly as the backend expects
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    contactNumber: data.contactNumber,
    dateOfBirth: data.dateOfBirth,
    foods: data.foods, // string[]
    ratingMovies: Number(data.ratingMovies),
    ratingRadio: Number(data.ratingRadio),
    ratingEatOut: Number(data.ratingEatOut),
    ratingTV: Number(data.ratingTV),
  };

  const response = await axios.post<{ id: number }>('/api/survey', payload);
  return response.data;
}

/**
 * fetchResults
 * ----------------
 * Sends a GET to /api/results and returns the parsed JSON payload.
 *
 * The returned type matches ResultsData used in Results.tsx.
 */
export type ResultsData = {
  totalCount: number;
  age: {
    avg: number | string | null;
    min: number | string | null;
    max: number | string | null;
  };
  foodPercentages: {
    pizza: number | string | null;
    pasta: number | string | null;
    papAndWors: number | string | null;
  };
  avgRatings: {
    movies: number | string | null;
    radio: number | string | null;
    eatOut: number | string | null;
    tv: number | string | null;
  };
};

export async function fetchResults(): Promise<ResultsData> {
  const response = await axios.get<ResultsData>('/api/results');
  return response.data;
}
