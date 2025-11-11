// backend/src/test/unit/services/survey.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SurveyService } from '@/services/surveyService';
import type {
  ISurveyRepository,
  IResultsRepository,
} from '@/interfaces/repository.interface';
import {
  createMockSurveyInput,
  createMockSurveyResponse,
} from '@/test/utils/test-helpers';

describe('SurveyService', () => {
  let surveyService: SurveyService;
  let mockSurveyRepository: ISurveyRepository;
  let mockResultsRepository: IResultsRepository;

  beforeEach(() => {
    mockSurveyRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    };

    mockResultsRepository = {
      getAverageRatings: vi.fn(),
      getFoodDistribution: vi.fn(),
      getTotalResponses: vi.fn(),
      getAgeStatistics: vi.fn(),
      invalidateCache: vi.fn(),
    };

    surveyService = new SurveyService(
      mockSurveyRepository,
      mockResultsRepository,
    );
  });

  describe('createSurvey', () => {
    it('should create a survey successfully', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const mockResponse = createMockSurveyResponse();
      vi.mocked(mockSurveyRepository.create).mockResolvedValue(mockResponse);

      // Act
      const result = await surveyService.createSurvey(mockInput);

      // Assert
      expect(mockSurveyRepository.create).toHaveBeenCalledWith(mockInput);
      expect(result).toEqual(mockResponse);
    });

    it('should delegate to repository layer', async () => {
      // Arrange
      const mockInput = createMockSurveyInput({
        firstName: 'Jane',
        email: 'jane@example.com',
      });
      const mockResponse = createMockSurveyResponse();
      vi.mocked(mockSurveyRepository.create).mockResolvedValue(mockResponse);

      // Act
      await surveyService.createSurvey(mockInput);

      // Assert
      expect(mockSurveyRepository.create).toHaveBeenCalledTimes(1);
      expect(mockSurveyRepository.create).toHaveBeenCalledWith(mockInput);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      const errorMessage = 'Database connection failed';
      vi.mocked(mockSurveyRepository.create).mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(surveyService.createSurvey(mockInput)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
