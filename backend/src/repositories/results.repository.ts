import { PrismaClient } from '@prisma/client';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { foodUtils } from '@/utils/foodUtils';

export class ResultsRepository implements IResultsRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all results in a single optimized query
   * Fetches only what's needed: ratings, foods, and dateOfBirth
   */
  async getResults(): Promise<SurveyResultsDTO> {
    const responses = await this.prisma.surveyResponse.findMany({
      select: {
        ratingMovies: true,
        ratingRadio: true,
        ratingEatOut: true,
        ratingTV: true,
        foods: true,
        dateOfBirth: true,
      },
    });

    const totalCount = responses.length;

    if (totalCount === 0) {
      return {
        totalCount: 0,
        age: { avg: null, min: null, max: null },
        foodPercentages: {
          pizza: null,
          pasta: null,
          papAndWors: null,
        },
        avgRatings: {
          movies: null,
          radio: null,
          eatOut: null,
          tv: null,
        },
      };
    }

    // Calculate ratings
    const avgRatings = {
      movies: parseFloat(
        (
          responses.reduce((sum, r) => sum + r.ratingMovies, 0) / totalCount
        ).toFixed(1),
      ),
      radio: parseFloat(
        (
          responses.reduce((sum, r) => sum + r.ratingRadio, 0) / totalCount
        ).toFixed(1),
      ),
      eatOut: parseFloat(
        (
          responses.reduce((sum, r) => sum + r.ratingEatOut, 0) / totalCount
        ).toFixed(1),
      ),
      tv: parseFloat(
        (
          responses.reduce((sum, r) => sum + r.ratingTV, 0) / totalCount
        ).toFixed(1),
      ),
    };

    // Calculate food percentages
    const foodCounts = new Map<string, number>();
    responses.forEach((response) => {
      const foods = foodUtils.fromCSV(response.foods);
      foods.forEach((food) => {
        foodCounts.set(food, (foodCounts.get(food) || 0) + 1);
      });
    });

    const toPercentage = (count: number) =>
      parseFloat(((count / totalCount) * 100).toFixed(1));

    const foodPercentages = {
      pizza: toPercentage(foodCounts.get('pizza') || 0),
      pasta: toPercentage(foodCounts.get('pasta') || 0),
      papAndWors: toPercentage(
        (foodCounts.get('pap and wors') || 0) +
          (foodCounts.get('papandwors') || 0),
      ),
    };

    // Calculate age statistics
    const currentYear = new Date().getFullYear();
    const ages = responses.map((r) => {
      const birthDate =
        typeof r.dateOfBirth === 'string'
          ? new Date(r.dateOfBirth)
          : r.dateOfBirth;
      return currentYear - birthDate.getFullYear();
    });

    const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;

    return {
      totalCount,
      age: {
        avg: Math.round(avgAge * 10) / 10,
        min: Math.min(...ages),
        max: Math.max(...ages),
      },
      foodPercentages,
      avgRatings,
    };
  }

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
