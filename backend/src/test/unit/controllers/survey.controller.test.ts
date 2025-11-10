// backend/src/test/unit/controllers/survey.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleCreateSurvey } from '@/controllers/surveyController';
import { Container } from '@/container';
import { createMockRequest, createMockResponse, createMockNext, createMockSurveyInput, createMockSurveyResponse } from '@/test/utils/test-helpers';

// Mock the Container
vi.mock('@/container', () => ({
  Container: {
    getInstance: vi.fn(),
  },
}));

describe('SurveyController', () => {
  let mockContainer: any;
  let mockSurveyService: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSurveyService = {
      createSurvey: vi.fn(),
    };

    mockContainer = {
      surveyService: mockSurveyService,
    };

    (Container.getInstance as any).mockReturnValue(mockContainer);
    
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleCreateSurvey', () => {
    it('should create survey successfully and return 201 with generated id', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const mockCreated = createMockSurveyResponse({ id: 123 });
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockResolvedValue(mockCreated);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert - Verify service was called with exact input data
      expect(mockSurveyService.createSurvey).toHaveBeenCalledOnce();
      expect(mockSurveyService.createSurvey).toHaveBeenCalledWith(mockInput);
      
      // Assert - Verify 201 Created status code
      expect(mockResponse.status).toHaveBeenCalledOnce();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      
      // Assert - Verify only id is returned (not full survey data)
      expect(mockResponse.json).toHaveBeenCalledOnce();
      const responseData = mockResponse.json.mock.calls[0][0];
      expect(responseData).toEqual({ id: 123 });
      expect(responseData).toHaveProperty('id');
      expect(typeof responseData.id).toBe('number');
      
      // Assert - Verify error handler was NOT invoked
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delegate error handling to middleware when service fails', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const databaseError = new Error('Unique constraint violation on email');
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockRejectedValue(databaseError);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert - Verify error was passed to error handling middleware
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockNext).toHaveBeenCalledWith(databaseError);
      
      // Assert - Verify response methods were NOT called (error handler takes over)
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should retrieve container instance for dependency injection', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const mockCreated = createMockSurveyResponse();
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockResolvedValue(mockCreated);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert - Verify container singleton pattern is used
      expect(Container.getInstance).toHaveBeenCalledOnce();
    });
  });
});