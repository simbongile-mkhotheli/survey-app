// backend/src/test/unit/controllers/results.controller.test.ts

import { describe, it, beforeEach, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { handleGetSurveyResults } from '@/controllers/results.controller';
import { container } from '@/container';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '@/test/utils/test-helpers';

vi.mock('@/container');

describe('ResultsController', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleGetSurveyResults', () => {
    it('should return results with 200 status when repository succeeds', async () => {
      const mockResults = {
        totalCount: 100,
        age: { avg: 25.5, min: 18, max: 65 },
        foodPercentages: {
          pizza: 45.0,
          pasta: 30.0,
          papAndWors: 25.0,
        },
        avgRatings: {
          movies: 4.2,
          radio: 3.8,
          eatOut: 4.5,
          tv: 3.9,
        },
      };
      mockRequest.query = {};

      vi.mocked(container.resultsRepository.getResults).mockResolvedValue(
        mockResults,
      );

      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      expect(container.resultsRepository.getResults).toHaveBeenCalledOnce();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delegate error handling to middleware when repository throws', async () => {
      const repositoryError = new Error('Database connection failed');
      mockRequest.query = {};

      vi.mocked(container.resultsRepository.getResults).mockRejectedValue(
        repositoryError,
      );

      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(repositoryError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle empty results with null values correctly', async () => {
      mockRequest.query = {};
      const emptyResults = {
        totalCount: 0,
        age: { avg: null, min: null, max: null },
        foodPercentages: { pizza: null, pasta: null, papAndWors: null },
        avgRatings: { movies: null, radio: null, eatOut: null, tv: null },
      };

      vi.mocked(container.resultsRepository.getResults).mockResolvedValue(
        emptyResults,
      );

      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData).toHaveProperty('data');
      expect(responseData.data.totalCount).toBe(0);
    });
  });
});
