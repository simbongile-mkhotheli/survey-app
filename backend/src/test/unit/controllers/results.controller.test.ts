// backend/src/test/unit/controllers/results.controller.test.ts

import type { Request, Response, NextFunction } from 'express';
import { handleGetSurveyResults } from '@/controllers/resultsController';
import { Container } from '@/container';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '@/test/utils/test-helpers';

// Mock the Container
vi.mock('@/container', () => ({
  Container: {
    getInstance: vi.fn(),
  },
}));

interface MockContainer {
  resultsService: {
    getResults: ReturnType<typeof vi.fn>;
  };
}

describe('ResultsController', () => {
  let mockContainer: MockContainer;
  let mockResultsService: MockContainer['resultsService'];
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockResultsService = {
      getResults: vi.fn(),
    };

    mockContainer = {
      resultsService: mockResultsService,
    };

    vi.mocked(Container.getInstance).mockReturnValue(mockContainer as never);

    mockRequest = createMockRequest();
    mockRequest.headers = { 'x-request-id': 'test-request-id' }; // Add required header
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleGetSurveyResults', () => {
    it('should return results with 200 status when service succeeds', async () => {
      // Arrange
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
      mockResultsService.getResults.mockResolvedValue(mockResults);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert - Verify service was called with correct parameters
      expect(mockResultsService.getResults).toHaveBeenCalledOnce();
      expect(mockResultsService.getResults).toHaveBeenCalledWith(
        'test-request-id',
      );

      // Assert - Verify response structure and status
      expect(mockResponse.status).toHaveBeenCalledOnce();
      expect(mockResponse.status).toHaveBeenCalledWith(200);

      // Assert - Verify response data matches exactly what service returned
      expect(mockResponse.json).toHaveBeenCalledOnce();
      expect(mockResponse.json).toHaveBeenCalledWith(mockResults);

      // Assert - Verify error handler was NOT invoked
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delegate error handling to middleware when service throws', async () => {
      // Arrange
      const serviceError = new Error('Database connection failed');
      mockRequest.query = {};
      mockResultsService.getResults.mockRejectedValue(serviceError);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert - Verify error was passed to error handling middleware
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockNext).toHaveBeenCalledWith(serviceError);

      // Assert - Verify response methods were NOT called (error handler takes over)
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle empty results with null values correctly', async () => {
      // Arrange - Simulate empty database state
      mockRequest.query = {};
      const emptyResults = {
        totalCount: 0,
        age: { avg: null, min: null, max: null },
        foodPercentages: { pizza: null, pasta: null, papAndWors: null },
        avgRatings: { movies: null, radio: null, eatOut: null, tv: null },
      };
      mockResultsService.getResults.mockResolvedValue(emptyResults);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert - Verify 200 status even with empty data
      expect(mockResponse.status).toHaveBeenCalledWith(200);

      // Assert - Verify structure of empty results is preserved
      const responseData = vi.mocked(mockResponse.json).mock.calls[0][0];
      expect(responseData).toEqual(emptyResults);
      expect(responseData.totalCount).toBe(0);
      expect(responseData.age.avg).toBeNull();
      expect(responseData.foodPercentages.pizza).toBeNull();
    });

    it('should retrieve container instance for dependency injection', async () => {
      // Arrange
      mockRequest.query = {};
      const mockResults = {
        totalCount: 0,
        age: {},
        foodPercentages: {},
        avgRatings: {},
      };
      mockResultsService.getResults.mockResolvedValue(mockResults);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert - Verify container singleton pattern is used
      expect(Container.getInstance).toHaveBeenCalledOnce();
    });
  });
});
