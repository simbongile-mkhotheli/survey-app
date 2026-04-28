// backend/src/test/unit/controllers/survey.controller.test.ts
import { describe, it, beforeEach, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { handleCreateSurvey } from '@/controllers/survey.controller';
import { container } from '@/container';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockSurveyInput,
  createMockSurveyResponse,
} from '@/test/utils/test-helpers';

vi.mock('@/container');

describe('SurveyController', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  describe('handleCreateSurvey', () => {
    it('should create survey successfully and return 201 with generated id', async () => {
      const mockInput = createMockSurveyInput();
      const mockCreated = createMockSurveyResponse({ id: 123 });
      mockRequest.body = mockInput;

      vi.mocked(container.surveyRepository.create).mockResolvedValue(
        mockCreated,
      );

      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      expect(container.surveyRepository.create).toHaveBeenCalledOnce();
      expect(container.surveyRepository.create).toHaveBeenCalledWith(mockInput);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delegate error handling to middleware when repository fails', async () => {
      const mockInput = createMockSurveyInput();
      const databaseError = new Error('Unique constraint violation on email');
      mockRequest.body = mockInput;

      vi.mocked(container.surveyRepository.create).mockRejectedValue(
        databaseError,
      );

      await handleCreateSurvey(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(databaseError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
