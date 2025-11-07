// backend/src/test/unit/services/results.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResultsService } from '@/services/resultsService';
import type { IResultsRepository } from '@/interfaces/repository.interface';

describe('ResultsService', () => {
  let resultsService: ResultsService;
  let mockResultsRepository: IResultsRepository;

  beforeEach(() => {
    mockResultsRepository = {
      getAverageRatings: vi.fn(),
      getFoodDistribution: vi.fn(),
      getTotalResponses: vi.fn(),
      getAgeStatistics: vi.fn(),
      invalidateCache: vi.fn(),
    };
    
    resultsService = new ResultsService(mockResultsRepository);
  });

  describe('getResults', () => {
    it('should aggregate results from repository successfully', async () => {
      // Arrange
      const mockTotalCount = 100;
      const mockAvgRatings = {
        movies: 4.2,
        radio: 3.8,
        eatOut: 4.5,
        tv: 3.9,
      };
      const mockFoodDistribution = [
        { food: 'Pizza', count: 60 },
        { food: 'Pasta', count: 40 },
        { food: 'Pap and Wors', count: 30 },
        { food: 'Burger', count: 20 },
      ];
      const mockAgeStats = { avg: null, min: null, max: null };

      (mockResultsRepository.getTotalResponses as any).mockResolvedValue(mockTotalCount);
      (mockResultsRepository.getAverageRatings as any).mockResolvedValue(mockAvgRatings);
      (mockResultsRepository.getFoodDistribution as any).mockResolvedValue(mockFoodDistribution);
      (mockResultsRepository.getAgeStatistics as any).mockResolvedValue(mockAgeStats);

      // Act
      const result = await resultsService.getResults();

      // Assert
      expect(mockResultsRepository.getTotalResponses).toHaveBeenCalledTimes(1);
      expect(mockResultsRepository.getAverageRatings).toHaveBeenCalledTimes(1);
      expect(mockResultsRepository.getFoodDistribution).toHaveBeenCalledTimes(1);
      expect(mockResultsRepository.getAgeStatistics).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        totalCount: 100,
        age: { avg: null, min: null, max: null },
        foodPercentages: {
          pizza: 60.0,
          pasta: 40.0,
          papAndWors: 30.0, // "Pap and Wors" found in test data with count 30
        },
        avgRatings: {
          movies: 4.2,
          radio: 3.8,
          eatOut: 4.5,
          tv: 3.9,
        },
      });
    });

    it('should handle missing food items gracefully', async () => {
      // Arrange
      const mockTotalCount = 50;
      const mockAvgRatings = {
        movies: 4.0,
        radio: 3.5,
        eatOut: 4.0,
        tv: 3.5,
      };
      const mockFoodDistribution = [
        { food: 'Pizza', count: 30 },
        { food: 'Burger', count: 20 },
        // Missing Pasta and Pap and Wors
      ];
      const mockAgeStats = { avg: null, min: null, max: null };

      (mockResultsRepository.getTotalResponses as any).mockResolvedValue(mockTotalCount);
      (mockResultsRepository.getAverageRatings as any).mockResolvedValue(mockAvgRatings);
      (mockResultsRepository.getFoodDistribution as any).mockResolvedValue(mockFoodDistribution);
      (mockResultsRepository.getAgeStatistics as any).mockResolvedValue(mockAgeStats);

      // Act
      const result = await resultsService.getResults();

      // Assert
      expect(result.foodPercentages).toEqual({
        pizza: 60.0,
        pasta: 0,
        papAndWors: 0,
      });
    });

    it('should handle zero total count', async () => {
      // Arrange
      const mockTotalCount = 0;
      const mockAvgRatings = {
        movies: 0,
        radio: 0,
        eatOut: 0,
        tv: 0,
      };
      const mockFoodDistribution: Array<{ food: string; count: number }> = [];
      const mockAgeStats = { avg: null, min: null, max: null };

      (mockResultsRepository.getTotalResponses as any).mockResolvedValue(mockTotalCount);
      (mockResultsRepository.getAverageRatings as any).mockResolvedValue(mockAvgRatings);
      (mockResultsRepository.getFoodDistribution as any).mockResolvedValue(mockFoodDistribution);
      (mockResultsRepository.getAgeStatistics as any).mockResolvedValue(mockAgeStats);

      // Act
      const result = await resultsService.getResults();

      // Assert
      expect(result).toEqual({
        totalCount: 0,
        age: { avg: null, min: null, max: null },
        foodPercentages: {
          pizza: null,
          pasta: null,
          papAndWors: null,
        },
        avgRatings: {
          movies: 0,
          radio: 0,
          eatOut: 0,
          tv: 0,
        },
      });
    });

    it('should calculate percentages correctly', async () => {
      // Arrange
      const mockTotalCount = 200;
      const mockAvgRatings = {
        movies: 4.0,
        radio: 3.0,
        eatOut: 4.0,
        tv: 3.0,
      };
      const mockFoodDistribution = [
        { food: 'Pizza', count: 150 }, // 75%
        { food: 'Pasta', count: 100 }, // 50%
        { food: 'Pap and Wors', count: 50 }, // 25%
      ];
      const mockAgeStats = { avg: 25.5, min: 18, max: 65 };

      (mockResultsRepository.getTotalResponses as any).mockResolvedValue(mockTotalCount);
      (mockResultsRepository.getAverageRatings as any).mockResolvedValue(mockAvgRatings);
      (mockResultsRepository.getFoodDistribution as any).mockResolvedValue(mockFoodDistribution);
      (mockResultsRepository.getAgeStatistics as any).mockResolvedValue(mockAgeStats);

      // Act
      const result = await resultsService.getResults();

      // Assert
      expect(result.foodPercentages).toEqual({
        pizza: 75.0,
        pasta: 50.0,
        papAndWors: 25.0,
      });
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      (mockResultsRepository.getTotalResponses as any).mockRejectedValue(new Error(errorMessage));
      (mockResultsRepository.getAverageRatings as any).mockResolvedValue({});
      (mockResultsRepository.getFoodDistribution as any).mockResolvedValue([]);
      (mockResultsRepository.getAgeStatistics as any).mockResolvedValue({});

      // Act & Assert
      await expect(resultsService.getResults()).rejects.toThrow(errorMessage);
    });
  });
});