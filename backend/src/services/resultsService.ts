import type { IResultsService } from '@/interfaces/service.interface';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { businessMetrics } from '@/middleware/metrics';
import { logWithContext } from '@/config/logger';

/**
 * Compute the full years between a date of birth and today.
 */
function computeAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

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
      const [totalCount, avgRatings, foodDistribution, ageStats] = await Promise.all([
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
          parallelExecution: true
        }
      });

    // Calculate food percentages
    const toPercentage = (count: number) =>
      totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(1)) : null;

    // Find specific food percentages from distribution (case-insensitive matching)
    const pizzaCount = foodDistribution.find(f => f.food.toLowerCase() === 'pizza')?.count || 0;
    const pastaCount = foodDistribution.find(f => f.food.toLowerCase() === 'pasta')?.count || 0;
    const papAndWorsCount = foodDistribution.find(f => 
      f.food.toLowerCase().replace(/\s+/g, '') === 'papandwors' || 
      f.food.toLowerCase() === 'pap and wors'
    )?.count || 0;

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
      
      logWithContext.error('Failed to retrieve survey results', error as Error, {
        requestId,
        operation: 'get_results',
        duration
      });
      
      throw error;
    }
  }
}
