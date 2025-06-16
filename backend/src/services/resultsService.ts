import { PrismaClient } from '@prisma/client';
import type { SurveyResultsDTO } from '../types/resultsDTO';

const prisma = new PrismaClient();

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

/**
 * Retrieve and aggregate survey results from the database.
 */
export async function getSurveyResults(): Promise<SurveyResultsDTO> {
  // 1) Fetch all survey responses
  const responses = await prisma.surveyResponse.findMany({
    select: {
      dateOfBirth: true,
      foods: true,
      ratingMovies: true,
      ratingRadio: true,
      ratingEatOut: true,
      ratingTV: true,
    },
  });

  const totalCount = responses.length;

  // 2) Compute ages and filter out invalid (<5 years)
  const ages = responses
    .map((r) => computeAge(r.dateOfBirth))
    .filter((age) => age >= 5);

  // 3) Calculate average, min, and max ages
  const avgAge =
    ages.length > 0
      ? parseFloat((ages.reduce((sum, a) => sum + a, 0) / ages.length).toFixed(1))
      : null;
  const minAge = ages.length ? Math.min(...ages) : null;
  const maxAge = ages.length ? Math.max(...ages) : null;

  // 4) Count favorite foods
  const foodCounts = { pizza: 0, pasta: 0, papAndWors: 0 };
  for (const { foods } of responses) {
    const list = foods.split(',');
    if (list.includes('Pizza')) foodCounts.pizza++;
    if (list.includes('Pasta')) foodCounts.pasta++;
    if (list.includes('Pap and Wors')) foodCounts.papAndWors++;
  }
  const toPercentage = (count: number) =>
    totalCount > 0
      ? parseFloat(((count / totalCount) * 100).toFixed(1))
      : null;

  // 5) Compute average ratings
  const sums = responses.reduce(
    (acc, r) => {
      acc.movies += r.ratingMovies;
      acc.radio += r.ratingRadio;
      acc.eatOut += r.ratingEatOut;
      acc.tv += r.ratingTV;
      return acc;
    },
    { movies: 0, radio: 0, eatOut: 0, tv: 0 }
  );
  const toAvg = (value: number) =>
    totalCount > 0 ? parseFloat((value / totalCount).toFixed(1)) : null;

  return {
    totalCount,
    age: { avg: avgAge, min: minAge, max: maxAge },
    foodPercentages: {
      pizza: toPercentage(foodCounts.pizza),
      pasta: toPercentage(foodCounts.pasta),
      papAndWors: toPercentage(foodCounts.papAndWors),
    },
    avgRatings: {
      movies: toAvg(sums.movies),
      radio: toAvg(sums.radio),
      eatOut: toAvg(sums.eatOut),
      tv: toAvg(sums.tv),
    },
  };
}
