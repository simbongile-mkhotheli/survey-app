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
}
