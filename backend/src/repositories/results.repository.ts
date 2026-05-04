import { PrismaClient } from '@prisma/client';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';
import { foodUtils } from '@/utils/foodUtils';

export class ResultsRepository implements IResultsRepository {
  constructor(private prisma: PrismaClient) {}

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

    const ratingSums = {
      movies: 0,
      radio: 0,
      eatOut: 0,
      tv: 0,
    };

    const foodCounts = new Map<string, number>();
    const ages: number[] = [];
    const currentYear = new Date().getFullYear();

    for (const response of responses) {
      ratingSums.movies += response.ratingMovies;
      ratingSums.radio += response.ratingRadio;
      ratingSums.eatOut += response.ratingEatOut;
      ratingSums.tv += response.ratingTV;

      for (const food of foodUtils.fromCSV(response.foods)) {
        foodCounts.set(food, (foodCounts.get(food) ?? 0) + 1);
      }

      const birthDate =
        typeof response.dateOfBirth === 'string'
          ? new Date(response.dateOfBirth)
          : response.dateOfBirth;

      ages.push(currentYear - birthDate.getFullYear());
    }

    const toPercentage = (count: number) =>
      parseFloat(((count / totalCount) * 100).toFixed(1));

    const avgRatings = {
      movies: parseFloat((ratingSums.movies / totalCount).toFixed(1)),
      radio: parseFloat((ratingSums.radio / totalCount).toFixed(1)),
      eatOut: parseFloat((ratingSums.eatOut / totalCount).toFixed(1)),
      tv: parseFloat((ratingSums.tv / totalCount).toFixed(1)),
    };

    const foodPercentages = {
      pizza: toPercentage(foodCounts.get('pizza') || 0),
      pasta: toPercentage(foodCounts.get('pasta') || 0),
      papAndWors: toPercentage(
        (foodCounts.get('pap and wors') || 0) +
          (foodCounts.get('papandwors') || 0),
      ),
    };

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
