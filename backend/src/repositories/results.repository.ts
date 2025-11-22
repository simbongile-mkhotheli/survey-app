// backend/src/repositories/results.repository.ts
import { PrismaClient } from '@prisma/client';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import { cacheManager, CACHE_KEYS } from '@/config/cache';
import { QueryPerformanceTracker } from '@/middleware/performance';
import { foodUtils } from '@/utils/foodUtils';

export class ResultsRepository implements IResultsRepository {
  private queryTracker = QueryPerformanceTracker.getInstance();

  constructor(private prisma: PrismaClient) {}

  async getAverageRatings(requestId?: string): Promise<{
    movies: number;
    radio: number;
    eatOut: number;
    tv: number;
  }> {
    // Check cache first
    const cacheKey = CACHE_KEYS.ratingAverages;
    const cached = await cacheManager.get<{
      movies: number;
      radio: number;
      eatOut: number;
      tv: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Track query performance
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'aggregate_ratings')
      : null;

    const result = await this.prisma.surveyResponse.aggregate({
      _avg: {
        ratingMovies: true,
        ratingRadio: true,
        ratingEatOut: true,
        ratingTV: true,
      },
    });

    queryTracker?.end();

    const averages = {
      movies: result._avg.ratingMovies
        ? parseFloat(result._avg.ratingMovies.toFixed(1))
        : 0,
      radio: result._avg.ratingRadio
        ? parseFloat(result._avg.ratingRadio.toFixed(1))
        : 0,
      eatOut: result._avg.ratingEatOut
        ? parseFloat(result._avg.ratingEatOut.toFixed(1))
        : 0,
      tv: result._avg.ratingTV
        ? parseFloat(result._avg.ratingTV.toFixed(1))
        : 0,
    };

    // Cache the result (5 minutes TTL)
    await cacheManager.set(cacheKey, averages, 300);

    return averages;
  }

  async getFoodDistribution(
    requestId?: string,
  ): Promise<Array<{ food: string; count: number }>> {
    // Check cache first
    const cacheKey = CACHE_KEYS.foodDistribution;
    const cached =
      await cacheManager.get<Array<{ food: string; count: number }>>(cacheKey);

    if (cached) {
      return cached;
    }

    // OPTIMIZED: Use database aggregation instead of fetching all records
    // This query is much more efficient for large datasets
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'food_distribution_optimized')
      : null;

    // Get all responses and process food distribution in application layer
    const responses = await this.prisma.surveyResponse.findMany({
      select: { foods: true },
    });

    // Process food distribution in application layer
    const foodCounts = new Map<string, number>();

    responses.forEach((response: { foods: string }) => {
      const foods = foodUtils.fromCSV(response.foods);
      foods.forEach((food: string) => {
        foodCounts.set(food, (foodCounts.get(food) || 0) + 1);
      });
    });

    // Convert to array and sort by count
    const distribution = Array.from(foodCounts.entries())
      .map(([food, count]) => ({ food, count }))
      .sort((a, b) => b.count - a.count);

    queryTracker?.end();

    // Cache the result (5 minutes TTL)
    await cacheManager.set(cacheKey, distribution, 300);

    return distribution;
  }

  async getTotalResponses(requestId?: string): Promise<number> {
    // Check cache first
    const cacheKey = CACHE_KEYS.totalCount;
    const cached = await cacheManager.get<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // Track query performance
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'count_responses')
      : null;

    const count = await this.prisma.surveyResponse.count();

    queryTracker?.end();

    // Cache the result (2 minutes TTL for frequently changing data)
    await cacheManager.set(cacheKey, count, 120);

    return count;
  }

  /**
   * Get optimized age statistics using database aggregation
   */
  async getAgeStatistics(requestId?: string): Promise<{
    avg: number | null;
    min: number | null;
    max: number | null;
  }> {
    // Check cache first
    const cacheKey = CACHE_KEYS.ageStatistics;
    const cached = await cacheManager.get<{
      avg: number | null;
      min: number | null;
      max: number | null;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Track query performance
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'age_statistics')
      : null;

    // Get all birth dates and calculate ages in application layer
    const responses = await this.prisma.surveyResponse.findMany({
      select: { dateOfBirth: true },
      where: {
        dateOfBirth: {
          not: undefined,
        },
      },
    });

    if (responses.length === 0) {
      const result = { avg: null, min: null, max: null };
      await cacheManager.set(cacheKey, result, 300);
      return result;
    }

    // Calculate ages
    const currentYear = new Date().getFullYear();
    const ages = responses.map(
      (r: { dateOfBirth: Date }) => currentYear - r.dateOfBirth.getFullYear(),
    );

    const avgAge =
      ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length;
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const result = {
      avg: Math.round(avgAge * 10) / 10, // Round to 1 decimal place
      min: minAge,
      max: maxAge,
    };

    queryTracker?.end();

    // Cache the result (5 minutes TTL)
    await cacheManager.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Invalidate all cached results when new data is added
   */
  async invalidateCache(): Promise<void> {
    await cacheManager.invalidateSurveyCache();
  }
}
