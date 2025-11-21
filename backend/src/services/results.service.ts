import type { IResultsService } from '@/interfaces/service.interface';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { businessMetrics } from '@/middleware/metrics';
import { logWithContext } from '@/config/logger';
import { findFoodCount } from '@/utils/foodDistribution';

export class ResultsService implements IResultsService {
  constructor(private resultsRepository: IResultsRepository) {}

  /**
   * Retrieve and aggregate survey results from the database.
   * Delegates to repository layer following SRP
   * Now includes performance tracking and caching
   */
  async getResults(requestId?: string): Promise<SurveyResultsDTO> {
    const startTime = Date.now();

    try {
      // Execute queries in parallel for better performance
      const [totalCount, avgRatings, foodDistribution, ageStats] =
        await Promise.all([
          this.resultsRepository.getTotalResponses(requestId),
          this.resultsRepository.getAverageRatings(requestId),
          this.resultsRepository.getFoodDistribution(requestId),
          this.resultsRepository.getAgeStatistics(requestId),
        ]);

      // Record business metrics
      businessMetrics.recordResultsQuery(false); // Assuming no cache info here

      const duration = Date.now() - startTime;

      // Log successful results query
      logWithContext.info('Survey results retrieved', {
        requestId,
        operation: 'get_results',
        duration,
        metadata: {
          totalCount,
          queriesExecuted: 4,
          parallelExecution: true,
        },
      });

      // Calculate food percentages
      const toPercentage = (count: number) =>
        totalCount > 0
          ? parseFloat(((count / totalCount) * 100).toFixed(1))
          : null;

      // Find specific food counts using helper function
      const pizzaCount = findFoodCount(foodDistribution, ['pizza']);
      const pastaCount = findFoodCount(foodDistribution, ['pasta']);
      const papAndWorsCount = findFoodCount(foodDistribution, [
        'pap and wors',
        'papandwors',
      ]);

      return {
        totalCount,
        age: ageStats, // Now using actual database-computed age statistics
        foodPercentages: {
          pizza: toPercentage(pizzaCount),
          pasta: toPercentage(pastaCount),
          papAndWors: toPercentage(papAndWorsCount),
        },
        avgRatings: {
          movies: avgRatings.movies,
          radio: avgRatings.radio,
          eatOut: avgRatings.eatOut,
          tv: avgRatings.tv,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logWithContext.error(
        'Failed to retrieve survey results',
        error as Error,
        {
          requestId,
          operation: 'get_results',
          duration,
        },
      );

      throw error;
    }
  }
}
