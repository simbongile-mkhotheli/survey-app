// backend/src/test/unit/services/results.service.test.ts
import { ResultsService } from '@/services/results.service';
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
    it('should aggregate and transform results from all repository methods', async () => {
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

      vi.mocked(mockResultsRepository.getTotalResponses).mockResolvedValue(
        mockTotalCount,
      );
      vi.mocked(mockResultsRepository.getAverageRatings).mockResolvedValue(
        mockAvgRatings,
      );
      vi.mocked(mockResultsRepository.getFoodDistribution).mockResolvedValue(
        mockFoodDistribution,
      );
      vi.mocked(mockResultsRepository.getAgeStatistics).mockResolvedValue(
        mockAgeStats,
      );

      // Act
      const result = await resultsService.getResults();

      // Assert - Verify all repository methods were called exactly once
      expect(mockResultsRepository.getTotalResponses).toHaveBeenCalledOnce();
      expect(mockResultsRepository.getAverageRatings).toHaveBeenCalledOnce();
      expect(mockResultsRepository.getFoodDistribution).toHaveBeenCalledOnce();
      expect(mockResultsRepository.getAgeStatistics).toHaveBeenCalledOnce();

      // Assert - Verify result structure matches expected DTO
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('foodPercentages');
      expect(result).toHaveProperty('avgRatings');

      // Assert - Verify totalCount is passed through unchanged
      expect(result.totalCount).toBe(100);

      // Assert - Verify age stats are passed through unchanged
      expect(result.age).toEqual({ avg: null, min: null, max: null });

      // Assert - Verify food distribution is transformed to percentages
      expect(result.foodPercentages).toEqual({
        pizza: 60.0,
        pasta: 40.0,
        papAndWors: 30.0, // Normalized key from "Pap and Wors"
      });

      // Assert - Verify average ratings are passed through unchanged
      expect(result.avgRatings).toEqual({
        movies: 4.2,
        radio: 3.8,
        eatOut: 4.5,
        tv: 3.9,
      });
    });

    it('should return zero percentages for missing food items', async () => {
      // Arrange - Some foods have no responses
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
        // Missing Pasta and Pap and Wors intentionally
      ];
      const mockAgeStats = { avg: null, min: null, max: null };

      vi.mocked(mockResultsRepository.getTotalResponses).mockResolvedValue(
        mockTotalCount,
      );
      vi.mocked(mockResultsRepository.getAverageRatings).mockResolvedValue(
        mockAvgRatings,
      );
      vi.mocked(mockResultsRepository.getFoodDistribution).mockResolvedValue(
        mockFoodDistribution,
      );
      vi.mocked(mockResultsRepository.getAgeStatistics).mockResolvedValue(
        mockAgeStats,
      );

      // Act
      const result = await resultsService.getResults();

      // Assert - Verify missing foods are represented as 0, not undefined or null
      expect(result.foodPercentages).toBeDefined();
      expect(result.foodPercentages.pizza).toBe(60.0);
      expect(result.foodPercentages.pasta).toBe(0);
      expect(result.foodPercentages.papAndWors).toBe(0);

      // Assert - Verify food percentages structure always has all three keys
      expect(Object.keys(result.foodPercentages)).toEqual([
        'pizza',
        'pasta',
        'papAndWors',
      ]);
    });

    it('should return null percentages when totalCount is zero', async () => {
      // Arrange - Simulating empty database (no surveys submitted)
      const mockTotalCount = 0;
      const mockAvgRatings = {
        movies: 0,
        radio: 0,
        eatOut: 0,
        tv: 0,
      };
      const mockFoodDistribution: Array<{ food: string; count: number }> = [];
      const mockAgeStats = { avg: null, min: null, max: null };

      vi.mocked(mockResultsRepository.getTotalResponses).mockResolvedValue(
        mockTotalCount,
      );
      vi.mocked(mockResultsRepository.getAverageRatings).mockResolvedValue(
        mockAvgRatings,
      );
      vi.mocked(mockResultsRepository.getFoodDistribution).mockResolvedValue(
        mockFoodDistribution,
      );
      vi.mocked(mockResultsRepository.getAgeStatistics).mockResolvedValue(
        mockAgeStats,
      );

      // Act
      const result = await resultsService.getResults();

      // Assert - Verify zero total count is handled
      expect(result.totalCount).toBe(0);

      // Assert - Verify food percentages are null (not 0 or undefined) when no data
      expect(result.foodPercentages.pizza).toBeNull();
      expect(result.foodPercentages.pasta).toBeNull();
      expect(result.foodPercentages.papAndWors).toBeNull();

      // Assert - Verify age stats are null
      expect(result.age).toEqual({ avg: null, min: null, max: null });

      // Assert - Verify ratings are 0 (not null) when no data
      expect(result.avgRatings).toEqual({
        movies: 0,
        radio: 0,
        eatOut: 0,
        tv: 0,
      });
    });

    it('should calculate food percentages accurately with decimal precision', async () => {
      // Arrange - Test percentage calculation edge case
      const mockTotalCount = 200;
      const mockAvgRatings = {
        movies: 4.0,
        radio: 3.0,
        eatOut: 4.0,
        tv: 3.0,
      };
      const mockFoodDistribution = [
        { food: 'Pizza', count: 150 }, // Expected: 75%
        { food: 'Pasta', count: 100 }, // Expected: 50%
        { food: 'Pap and Wors', count: 50 }, // Expected: 25%
      ];
      const mockAgeStats = { avg: 25.5, min: 18, max: 65 };

      vi.mocked(mockResultsRepository.getTotalResponses).mockResolvedValue(
        mockTotalCount,
      );
      vi.mocked(mockResultsRepository.getAverageRatings).mockResolvedValue(
        mockAvgRatings,
      );
      vi.mocked(mockResultsRepository.getFoodDistribution).mockResolvedValue(
        mockFoodDistribution,
      );
      vi.mocked(mockResultsRepository.getAgeStatistics).mockResolvedValue(
        mockAgeStats,
      );

      // Act
      const result = await resultsService.getResults();

      // Assert - Verify percentage calculation accuracy
      expect(result.foodPercentages.pizza).toBe(75.0);
      expect(result.foodPercentages.pasta).toBe(50.0);
      expect(result.foodPercentages.papAndWors).toBe(25.0);

      // Assert - Verify percentages are numbers, not strings
      expect(typeof result.foodPercentages.pizza).toBe('number');
    });

    it('should propagate repository errors without catching them', async () => {
      // Arrange - Simulate database failure
      const databaseError = new Error('Database connection failed');
      vi.mocked(mockResultsRepository.getTotalResponses).mockRejectedValue(
        databaseError,
      );
      vi.mocked(mockResultsRepository.getAverageRatings).mockResolvedValue({
        movies: 0,
        radio: 0,
        eatOut: 0,
        tv: 0,
      });
      vi.mocked(mockResultsRepository.getFoodDistribution).mockResolvedValue(
        [],
      );
      vi.mocked(mockResultsRepository.getAgeStatistics).mockResolvedValue({
        avg: null,
        min: null,
        max: null,
      });

      // Act & Assert - Verify error is thrown (not caught)
      await expect(resultsService.getResults()).rejects.toThrow(
        'Database connection failed',
      );
      await expect(resultsService.getResults()).rejects.toThrow(databaseError);
    });
  });
});
