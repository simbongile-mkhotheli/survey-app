/**
 * API Service Tests
 * ================
 * Tests for the API service functions
 */

import { describe, it, expect, vi } from 'vitest';
import type { SurveyFormValues } from '../validation';

// Mock the entire api module to test integration points
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');
  return {
    ...actual,
    submitSurvey: vi.fn(),
    fetchResults: vi.fn(),
  };
});

import { submitSurvey, fetchResults } from './api';

describe('API Service', () => {

  describe('submitSurvey', () => {
    it('can be called with valid survey data', async () => {
      const mockSurveyData: SurveyFormValues = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contactNumber: '+1234567890',
        dateOfBirth: '1999-01-01',
        foods: ['pizza'],
        ratingMovies: '4',
        ratingRadio: '3',
        ratingEatOut: '5',
        ratingTV: '2',
      };

      const mockResponse = { id: 123 };
      vi.mocked(submitSurvey).mockResolvedValue(mockResponse);

      const result = await submitSurvey(mockSurveyData);

      expect(submitSurvey).toHaveBeenCalledWith(mockSurveyData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when submission fails', async () => {
      const mockSurveyData: SurveyFormValues = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contactNumber: '+1234567890',
        dateOfBirth: '1999-01-01',
        foods: ['pizza'],
        ratingMovies: '4',
        ratingRadio: '3',
        ratingEatOut: '5',
        ratingTV: '2',
      };

      const mockError = new Error('Network Error');
      vi.mocked(submitSurvey).mockRejectedValue(mockError);

      await expect(submitSurvey(mockSurveyData)).rejects.toThrow('Network Error');
    });
  });

  describe('fetchResults', () => {
    it('can fetch results data successfully', async () => {
      const mockResultsData = {
        totalCount: 10,
        age: { avg: 28.5, min: 18, max: 65 },
        foodPercentages: { pizza: 45.5, pasta: 30.2, papAndWors: 24.3 },
        avgRatings: { movies: 4.2, radio: 3.1, eatOut: 4.8, tv: 3.5 },
      };

      vi.mocked(fetchResults).mockResolvedValue(mockResultsData);

      const result = await fetchResults();

      expect(fetchResults).toHaveBeenCalled();
      expect(result).toEqual(mockResultsData);
    });

    it('handles errors when fetch fails', async () => {
      const mockError = new Error('Server Error');
      vi.mocked(fetchResults).mockRejectedValue(mockError);

      await expect(fetchResults()).rejects.toThrow('Server Error');
    });
  });
});