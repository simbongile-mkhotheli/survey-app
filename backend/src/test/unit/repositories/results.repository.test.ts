import { describe, expect, it, vi } from 'vitest';
import { ResultsRepository } from '@/repositories/results.repository';

const findManyMock = vi.fn();

const prismaMock = {
  surveyResponse: {
    findMany: findManyMock,
  },
} as any;

function makeRepo() {
  return new ResultsRepository(prismaMock);
}

describe('ResultsRepository', () => {
  it('returns empty aggregates when there are no survey responses', async () => {
    findManyMock.mockResolvedValueOnce([]);

    const repo = makeRepo();
    const result = await repo.getResults();

    expect(result).toEqual({
      totalCount: 0,
      age: {
        avg: null,
        min: null,
        max: null,
      },
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
    });
  });

  it('returns correct averages, age stats, and food percentages', async () => {
    findManyMock.mockResolvedValueOnce([
      {
        ratingMovies: 5,
        ratingRadio: 4,
        ratingEatOut: 3,
        ratingTV: 2,
        foods: 'pizza,pasta,pap and wors',
        dateOfBirth: new Date('2000-01-01'),
      },
      {
        ratingMovies: 3,
        ratingRadio: 2,
        ratingEatOut: 4,
        ratingTV: 5,
        foods: 'pizza,papandwors',
        dateOfBirth: new Date('1990-01-01'),
      },
    ]);

    const repo = makeRepo();
    const result = await repo.getResults();

    expect(result.totalCount).toBe(2);

    expect(result.avgRatings).toEqual({
      movies: 4.0,
      radio: 3.0,
      eatOut: 3.5,
      tv: 3.5,
    });

    expect(result.foodPercentages).toEqual({
      pizza: 100.0,
      pasta: 50.0,
      papAndWors: 100.0,
    });

    expect(result.age.min).toBeGreaterThanOrEqual(0);
    expect(result.age.max).toBeGreaterThanOrEqual(result.age.min as number);
    expect(result.age.avg).toBeGreaterThanOrEqual(result.age.min as number);
    expect(result.age.avg).toBeLessThanOrEqual(result.age.max as number);
  });

  it('counts pap and wors variants together', async () => {
    findManyMock.mockResolvedValueOnce([
      {
        ratingMovies: 1,
        ratingRadio: 1,
        ratingEatOut: 1,
        ratingTV: 1,
        foods: 'pap and wors',
        dateOfBirth: new Date('2001-01-01'),
      },
      {
        ratingMovies: 1,
        ratingRadio: 1,
        ratingEatOut: 1,
        ratingTV: 1,
        foods: 'papandwors',
        dateOfBirth: new Date('2001-01-01'),
      },
    ]);

    const repo = makeRepo();
    const result = await repo.getResults();

    expect(result.foodPercentages.papAndWors).toBe(100.0);
  });
});
