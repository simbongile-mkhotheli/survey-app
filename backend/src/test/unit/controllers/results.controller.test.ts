// backend/src/test/unit/controllers/results.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleGetSurveyResults } from '@/controllers/resultsController';
import { Container } from '@/container';
import { createMockRequest, createMockResponse, createMockNext } from '@/test/utils/test-helpers';

// Mock the Container
vi.mock('@/container', () => ({
  Container: {
    getInstance: vi.fn(),
  },
}));

describe('ResultsController', () => {
  let mockContainer: any;
  let mockResultsService: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockResultsService = {
      getResults: vi.fn(),
    };

    mockContainer = {
      resultsService: mockResultsService,
    };

    (Container.getInstance as any).mockReturnValue(mockContainer);
    
    mockRequest = createMockRequest();
    mockRequest.headers = { 'x-request-id': 'test-request-id' }; // Add required header
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleGetSurveyResults', () => {
    it('should return results and 200 status', async () => {
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

      // Assert
      expect(mockResultsService.getResults).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Service error');
      mockRequest.query = {};
      mockResultsService.getResults.mockRejectedValue(error);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should validate query parameters', async () => {
      // Arrange
      mockRequest.query = {}; // Empty query should be valid
      const mockResults = {
        totalCount: 0,
        age: { avg: null, min: null, max: null },
        foodPercentages: { pizza: null, pasta: null, papAndWors: null },
        avgRatings: { movies: null, radio: null, eatOut: null, tv: null },
      };
      mockResultsService.getResults.mockResolvedValue(mockResults);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResults);
    });

    it('should get container instance', async () => {
      // Arrange
      mockRequest.query = {};
      const mockResults = { totalCount: 0 };
      mockResultsService.getResults.mockResolvedValue(mockResults);

      // Act
      await handleGetSurveyResults(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Container.getInstance).toHaveBeenCalledTimes(1);
    });
  });
});