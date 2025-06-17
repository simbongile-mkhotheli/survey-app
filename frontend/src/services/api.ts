import axios from 'axios';
import type { SurveyFormValues } from '../validation';

const API_URL = import.meta.env.VITE_API_URL as string;
console.log('>>> API_URL is', API_URL);


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
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    contactNumber: data.contactNumber,
    dateOfBirth: data.dateOfBirth,
    foods: data.foods,
    ratingMovies: Number(data.ratingMovies),
    ratingRadio: Number(data.ratingRadio),
    ratingEatOut: Number(data.ratingEatOut),
    ratingTV: Number(data.ratingTV),
  };

  const response = await axios.post<{ id: number }>(
    `${API_URL}/api/survey`,
    payload,
  );
  return response.data;
}

/**
 * ResultsData
 * ----------------
 * Matches the shape returned from GET /api/results.
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

/**
 * fetchResults
 * ----------------
 * Sends a GET to ${API_URL}/api/results and returns the parsed JSON.
 */
export async function fetchResults(): Promise<ResultsData> {
  const response = await axios.get<ResultsData>(`${API_URL}/api/results`);
  return response.data;
}
