// backend/src/repositories/results.repository.ts
import { PrismaClient } from '@prisma/client';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import { foodUtils } from '@/utils/foodUtils';

export class ResultsRepository implements IResultsRepository {
  constructor(private prisma: PrismaClient) {}

  async getAverageRatings(_requestId?: string): Promise<{
    movies: number;
    radio: number;
    eatOut: number;
    tv: number;
  }> {
    const result = await this.prisma.surveyResponse.aggregate({
      _avg: {
        ratingMovies: true,
        ratingRadio: true,
        ratingEatOut: true,
        ratingTV: true,
      },
    });

    return {
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
  }

  async getFoodDistribution(
    _requestId?: string,
  ): Promise<Array<{ food: string; count: number }>> {
    const responses = await this.prisma.surveyResponse.findMany({
      select: { foods: true },
    });

    const foodCounts = new Map<string, number>();

    responses.forEach((response: { foods: string }) => {
      const foods = foodUtils.fromCSV(response.foods);
      foods.forEach((food: string) => {
        foodCounts.set(food, (foodCounts.get(food) || 0) + 1);
      });
    });

    return Array.from(foodCounts.entries())
      .map(([food, count]) => ({ food, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTotalResponses(_requestId?: string): Promise<number> {
    return this.prisma.surveyResponse.count();
  }

  /**
   * Retrieve min/max/average age from survey responses
   */
  async getAgeStatistics(_requestId?: string): Promise<{
    avg: number | null;
    min: number | null;
    max: number | null;
  }> {
    const responses = await this.prisma.surveyResponse.findMany({
      select: { dateOfBirth: true },
      where: {
        dateOfBirth: {
          not: undefined,
        },
      },
    });

    if (responses.length === 0) {
      return { avg: null, min: null, max: null };
    }

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

    return {
      avg: Math.round(avgAge * 10) / 10,
      min: minAge,
      max: maxAge,
    };
  }
}
