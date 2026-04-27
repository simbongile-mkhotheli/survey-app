import type { IResultsService } from '@/interfaces/service.interface';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { findFoodCount } from '@/utils/foodDistribution';

export class ResultsService implements IResultsService {
  constructor(private resultsRepository: IResultsRepository) {}

  async getResults(requestId?: string): Promise<SurveyResultsDTO> {
    const [totalCount, avgRatings, foodDistribution, ageStats] =
      await Promise.all([
        this.resultsRepository.getTotalResponses(requestId),
        this.resultsRepository.getAverageRatings(requestId),
        this.resultsRepository.getFoodDistribution(requestId),
        this.resultsRepository.getAgeStatistics(requestId),
      ]);

    const toPercentage = (count: number) =>
      totalCount > 0
        ? parseFloat(((count / totalCount) * 100).toFixed(1))
        : null;

    const pizzaCount = findFoodCount(foodDistribution, ['pizza']);
    const pastaCount = findFoodCount(foodDistribution, ['pasta']);
    const papAndWorsCount = findFoodCount(foodDistribution, [
      'pap and wors',
      'papandwors',
    ]);

    return {
      totalCount,
      age: ageStats,
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
  }
}
