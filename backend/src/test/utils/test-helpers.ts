// backend/src/test/utils/test-helpers.ts
import { vi } from 'vitest';
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from '@/interfaces/service.interface';

export function createMockSurveyInput(overrides: Partial<SurveyInput> = {}): SurveyInput {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    foods: ['Pizza', 'Pasta'],
    ratingMovies: 4,
    ratingRadio: 3,
    ratingEatOut: 5,
    ratingTV: 4,
    ...overrides,
  };
}

export function createMockSurveyResponse(overrides: Partial<SurveyResponse> = {}): SurveyResponse {
  return {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+1234567890',
    dateOfBirth: new Date('1990-01-01'),
    foods: 'Pizza,Pasta',
    ratingMovies: 4,
    ratingRadio: 3,
    ratingEatOut: 5,
    ratingTV: 4,
    submittedAt: new Date(),
    ...overrides,
  };
}

export function createMockRequest(body: any = {}, params: any = {}, query: any = {}) {
  return {
    body,
    params,
    query,
  };
}

export function createMockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

export const createMockNext = () => vi.fn();