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
    // Avoid expensive aggregation queries by serving frequently accessed statistics from cache
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

    // Monitor slow queries to identify performance bottlenecks in production
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

    // Cache aggregated results for 5 minutes to reduce database load from repeated queries
    await cacheManager.set(cacheKey, averages, 300);

    return averages;
  }

  async getFoodDistribution(
    requestId?: string,
  ): Promise<Array<{ food: string; count: number }>> {
    // Avoid recalculating food preference distributions on every request
    const cacheKey = CACHE_KEYS.foodDistribution;
    const cached =
      await cacheManager.get<Array<{ food: string; count: number }>>(cacheKey);

    if (cached) {
      return cached;
    }

    // Track performance to identify when this becomes a bottleneck as data grows
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'food_distribution_optimized')
      : null;

    // Process in application layer to handle CSV parsing consistently across all records
    const responses = await this.prisma.surveyResponse.findMany({
      select: { foods: true },
    });

    // Map reduces memory consumption by accumulating counts as we iterate
    const foodCounts = new Map<string, number>();

    responses.forEach((response: { foods: string }) => {
      const foods = foodUtils.fromCSV(response.foods);
      foods.forEach((food: string) => {
        foodCounts.set(food, (foodCounts.get(food) || 0) + 1);
      });
    });

    // Sort by frequency to highlight most popular foods in analytics dashboard
    const distribution = Array.from(foodCounts.entries())
      .map(([food, count]) => ({ food, count }))
      .sort((a, b) => b.count - a.count);

    queryTracker?.end();

    // Cache for 5 minutes since food preferences change slowly over time
    await cacheManager.set(cacheKey, distribution, 300);

    return distribution;
  }

  async getTotalResponses(requestId?: string): Promise<number> {
    // Serve count from cache to prevent COUNT(*) queries on every /results request
    const cacheKey = CACHE_KEYS.totalCount;
    const cached = await cacheManager.get<number>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // Monitor latency of count operations which can be slow on large tables
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'count_responses')
      : null;

    const count = await this.prisma.surveyResponse.count();

    queryTracker?.end();

    // Shorter TTL (2 min) because response count changes frequently as users submit surveys
    await cacheManager.set(cacheKey, count, 120);

    return count;
  }

  /**
   * Retrieve min/max/average age from survey responses
   * Caches to avoid recalculating on every dashboard view
   */
  async getAgeStatistics(requestId?: string): Promise<{
    avg: number | null;
    min: number | null;
    max: number | null;
  }> {
    // Avoid recalculating age statistics for every dashboard request
    const cacheKey = CACHE_KEYS.ageStatistics;
    const cached = await cacheManager.get<{
      avg: number | null;
      min: number | null;
      max: number | null;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // Monitor performance since we're scanning and processing potentially large result sets
    const queryTracker = requestId
      ? this.queryTracker.trackQuery(requestId, 'age_statistics')
      : null;

    // Fetch birth dates to calculate current age on demand (avoids storing computed age)
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

    // Handle both Date objects and string formats for database flexibility
    const currentYear = new Date().getFullYear();
    const ages = responses.map((r: { dateOfBirth: Date | string }) => {
      const birthDate =
        typeof r.dateOfBirth === 'string'
          ? new Date(r.dateOfBirth)
          : r.dateOfBirth;
      return currentYear - birthDate.getFullYear();
    });

    const avgAge =
      ages.reduce((sum: number, age: number) => sum + age, 0) / ages.length;
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const result = {
      avg: Math.round(avgAge * 10) / 10,
      min: minAge,
      max: maxAge,
    };

    queryTracker?.end();

    // Cache for 5 minutes since demographic trends stabilize over short periods
    await cacheManager.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Invalidate all cached results when new survey data is submitted
   * Ensures analytics dashboard shows fresh statistics within TTL window
   */
  async invalidateCache(): Promise<void> {
    await cacheManager.invalidateSurveyCache();
  }
}
