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
    it('should create survey and return 201 with id', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const mockCreated = createMockSurveyResponse({ id: 123 });
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockResolvedValue(mockCreated);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockSurveyService.createSurvey).toHaveBeenCalledWith(mockInput);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ id: 123 });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const error = new Error('Service error');
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockRejectedValue(error);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should get container instance', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const mockCreated = createMockSurveyResponse();
      mockRequest.body = mockInput;
      mockSurveyService.createSurvey.mockResolvedValue(mockCreated);

      // Act
      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      // Assert
      expect(Container.getInstance).toHaveBeenCalledTimes(1);
    });
  });
});