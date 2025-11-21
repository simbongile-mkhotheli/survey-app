// backend/src/test/utils/test-helpers.ts
import { vi } from 'vitest';
import { faker } from '@faker-js/faker';
import type { Request, Response, NextFunction } from 'express';
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from '@/interfaces/service.interface';

/**
 * Generates a random survey input with realistic fake data.
 * Use overrides to customize specific fields for test scenarios.
 */
export function createMockSurveyInput(
  overrides: Partial<SurveyInput> = {},
): SurveyInput {
  // Generate a random birth date for someone aged 5-120 years
  const birthDate = faker.date.past({ years: 50 });

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    contactNumber: faker.phone.number('+1##########'),
    dateOfBirth: birthDate.toISOString().split('T')[0],
    foods: [faker.food.adjective(), faker.food.dish()].map((f) =>
      f.substring(0, 50),
    ),
    ratingMovies: faker.number.int({ min: 1, max: 5 }),
    ratingRadio: faker.number.int({ min: 1, max: 5 }),
    ratingEatOut: faker.number.int({ min: 1, max: 5 }),
    ratingTV: faker.number.int({ min: 1, max: 5 }),
    ...overrides,
  };
}

/**
 * Generates a random survey response with realistic fake data from database.
 * Use overrides to customize specific fields for test scenarios.
 */
export function createMockSurveyResponse(
  overrides: Partial<SurveyResponse> = {},
): SurveyResponse {
  // Generate a random birth date for someone aged 5-120 years
  const birthDate = faker.date.past({ years: 50 });

  return {
    id: faker.number.int({ min: 1, max: 1000000 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    contactNumber: faker.phone.number('+1##########'),
    dateOfBirth: birthDate,
    foods: [faker.food.adjective(), faker.food.dish()]
      .map((f) => f.substring(0, 50))
      .join(','),
    ratingMovies: faker.number.int({ min: 1, max: 5 }),
    ratingRadio: faker.number.int({ min: 1, max: 5 }),
    ratingEatOut: faker.number.int({ min: 1, max: 5 }),
    ratingTV: faker.number.int({ min: 1, max: 5 }),
    submittedAt: faker.date.past(),
    ...overrides,
  };
}

export function createMockRequest(
  body: Record<string, unknown> = {},
  params: Record<string, unknown> = {},
  query: Record<string, unknown> = {},
) {
  return {
    body,
    params,
    query,
    headers: {
      'user-agent': faker.internet.userAgent(),
      'x-forwarded-for': faker.internet.ipv4(),
    } as Record<string, string>,
    get: vi.fn((key: string) => {
      const headers: Record<string, string> = {
        'user-agent': faker.internet.userAgent(),
        'x-forwarded-for': faker.internet.ipv4(),
      };
      return headers[key.toLowerCase()];
    }),
    method: 'GET',
    path: '/',
    connection: { remoteAddress: faker.internet.ipv4() } as {
      remoteAddress?: string;
    },
    socket: { remoteAddress: faker.internet.ipv4() } as {
      remoteAddress?: string;
    },
  } as unknown as Request;
}

export function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
    write: vi.fn().mockReturnValue(true),
  };
  return res as unknown as Response;
}

export const createMockNext = () => vi.fn() as unknown as NextFunction;
