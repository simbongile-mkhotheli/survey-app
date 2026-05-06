import { PrismaClient } from '@prisma/client';

export type SurveyResultsDTO = {
  totalCount: number;
  age: {
    avg: number | null;
    min: number | null;
    max: number | null;
  };
  foodPercentages: {
    pizza: number | null;
    pasta: number | null;
    papAndWors: number | null;
  };
  avgRatings: {
    movies: number | null;
    radio: number | null;
    eatOut: number | null;
    tv: number | null;
  };
};

type ResultsRow = {
  totalCount: bigint | number | string;
  avgAge: number | string | null;
  minAge: bigint | number | string | null;
  maxAge: bigint | number | string | null;
  avgMovies: number | string | null;
  avgRadio: number | string | null;
  avgEatOut: number | string | null;
  avgTv: number | string | null;
  pizzaCount: bigint | number | string | null;
  pastaCount: bigint | number | string | null;
  papAndWorsCount: bigint | number | string | null;
};

export class ResultsRepository {
  constructor(private prisma: PrismaClient) {}

  async getResults(): Promise<SurveyResultsDTO> {
    const [row] = await this.prisma.$queryRaw<ResultsRow[]>`
      WITH food_tokens AS (
        SELECT LOWER(TRIM(food_item)) AS food
        FROM "SurveyResponse"
        CROSS JOIN LATERAL unnest(string_to_array("foods", ',')) AS food_item
      )
      SELECT
        COUNT(*)::bigint AS "totalCount",
        ROUND(AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth")))::numeric, 1) AS "avgAge",
        MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth"))::int) AS "minAge",
        MAX(EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth"))::int) AS "maxAge",
        ROUND(AVG("ratingMovies")::numeric, 1) AS "avgMovies",
        ROUND(AVG("ratingRadio")::numeric, 1) AS "avgRadio",
        ROUND(AVG("ratingEatOut")::numeric, 1) AS "avgEatOut",
        ROUND(AVG("ratingTV")::numeric, 1) AS "avgTv",
        (SELECT COUNT(*) FROM food_tokens WHERE food = 'pizza')::bigint AS "pizzaCount",
        (SELECT COUNT(*) FROM food_tokens WHERE food = 'pasta')::bigint AS "pastaCount",
        (SELECT COUNT(*) FROM food_tokens WHERE food IN ('pap and wors', 'papandwors'))::bigint AS "papAndWorsCount"
      FROM "SurveyResponse";
    `;

    const totalCount = Number(row?.totalCount ?? 0);

    if (!row || totalCount === 0) {
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

    const toNumber = (value: bigint | number | string | null): number =>
      Number(value ?? 0);

    const toPercentage = (count: bigint | number | string | null) =>
      parseFloat(((toNumber(count) / totalCount) * 100).toFixed(1));

    return {
      totalCount,
      age: {
        avg: Number(Number(row.avgAge ?? 0).toFixed(1)),
        min: toNumber(row.minAge),
        max: toNumber(row.maxAge),
      },
      foodPercentages: {
        pizza: toPercentage(row.pizzaCount),
        pasta: toPercentage(row.pastaCount),
        papAndWors: toPercentage(row.papAndWorsCount),
      },
      avgRatings: {
        movies: Number(Number(row.avgMovies ?? 0).toFixed(1)),
        radio: Number(Number(row.avgRadio ?? 0).toFixed(1)),
        eatOut: Number(Number(row.avgEatOut ?? 0).toFixed(1)),
        tv: Number(Number(row.avgTv ?? 0).toFixed(1)),
      },
    };
  }
}
