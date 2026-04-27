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
    mockRequest.headers = { 'x-request-id': 'test-request-id' };
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleGetSurveyResults', () => {
    it('should return results with 200 status when service succeeds', async () => {
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

      vi.mocked(container.resultsService.getResults).mockResolvedValue(
        mockResults,
      );

      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      expect(container.resultsService.getResults).toHaveBeenCalledOnce();
      expect(container.resultsService.getResults).toHaveBeenCalledWith(
        'test-request-id',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delegate error handling to middleware when service throws', async () => {
      const serviceError = new Error('Database connection failed');
      mockRequest.query = {};

      vi.mocked(container.resultsService.getResults).mockRejectedValue(
        serviceError,
      );

      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
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

      vi.mocked(container.resultsService.getResults).mockResolvedValue(
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
