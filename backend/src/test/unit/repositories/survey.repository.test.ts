// backend/src/test/unit/repositories/survey.repository.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SurveyRepository } from '@/repositories/survey.repository';
import { mockPrismaClient, mockSurveyResponse } from '@/test/mocks/prisma.mock';
import { createMockSurveyInput } from '@/test/utils/test-helpers';

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

describe('SurveyRepository', () => {
  let surveyRepository: SurveyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    surveyRepository = new SurveyRepository(mockPrismaClient as any);
  });

  describe('create', () => {
    it('should create a survey response successfully', async () => {
      // Arrange
      const mockInput = createMockSurveyInput();
      mockPrismaClient.surveyResponse.create.mockResolvedValue(mockSurveyResponse);

      // Act
      const result = await surveyRepository.create(mockInput);

      // Assert
      expect(mockPrismaClient.surveyResponse.create).toHaveBeenCalledWith({
        data: {
          firstName: mockInput.firstName,
          lastName: mockInput.lastName,
          email: mockInput.email,
          contactNumber: mockInput.contactNumber,
          dateOfBirth: new Date(mockInput.dateOfBirth),
          foods: mockInput.foods.join(','),
          ratingMovies: mockInput.ratingMovies,
          ratingRadio: mockInput.ratingRadio,
          ratingEatOut: mockInput.ratingEatOut,
          ratingTV: mockInput.ratingTV,
        },
      });
      expect(result).toEqual(mockSurveyResponse);
    });

    it('should handle date conversion correctly', async () => {
      // Arrange
      const mockInput = createMockSurveyInput({ dateOfBirth: '1995-12-25' });
      mockPrismaClient.surveyResponse.create.mockResolvedValue(mockSurveyResponse);

      // Act
      await surveyRepository.create(mockInput);

      // Assert
      const createCall = mockPrismaClient.surveyResponse.create.mock.calls[0][0];
      expect(createCall.data.dateOfBirth).toEqual(new Date('1995-12-25'));
    });

    it('should handle foods array conversion correctly', async () => {
      // Arrange
      const mockInput = createMockSurveyInput({ foods: ['Pizza', 'Burger', 'Salad'] });
      mockPrismaClient.surveyResponse.create.mockResolvedValue(mockSurveyResponse);

      // Act
      await surveyRepository.create(mockInput);

      // Assert
      const createCall = mockPrismaClient.surveyResponse.create.mock.calls[0][0];
      expect(createCall.data.foods).toBe('Pizza,Burger,Salad');
    });
  });

  describe('findById', () => {
    it('should find survey by id successfully', async () => {
      // Arrange
      mockPrismaClient.surveyResponse.findUnique.mockResolvedValue(mockSurveyResponse);

      // Act
      const result = await surveyRepository.findById(1);

      // Assert
      expect(mockPrismaClient.surveyResponse.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSurveyResponse);
    });

    it('should return null when survey not found', async () => {
      // Arrange
      mockPrismaClient.surveyResponse.findUnique.mockResolvedValue(null);

      // Act
      const result = await surveyRepository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all surveys', async () => {
      // Arrange
      const mockSurveys = [mockSurveyResponse];
      mockPrismaClient.surveyResponse.findMany.mockResolvedValue(mockSurveys);

      // Act
      const result = await surveyRepository.findAll();

      // Assert
      expect(mockPrismaClient.surveyResponse.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockSurveys);
    });
  });

  describe('count', () => {
    it('should return total count of surveys', async () => {
      // Arrange
      mockPrismaClient.surveyResponse.count.mockResolvedValue(5);

      // Act
      const result = await surveyRepository.count();

      // Assert
      expect(mockPrismaClient.surveyResponse.count).toHaveBeenCalledWith();
      expect(result).toBe(5);
    });
  });
});