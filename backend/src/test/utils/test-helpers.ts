// backend/src/test/utils/test-helpers.ts
import { vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
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

export function createMockRequest(body: Record<string, unknown> = {}, params: Record<string, unknown> = {}, query: Record<string, unknown> = {}) {
  return {
    body,
    params,
    query,
    headers: {} as Record<string, string>,
    get: vi.fn(),
    method: 'GET',
    path: '/',
    connection: {} as { remoteAddress?: string },
    socket: {} as { remoteAddress?: string },
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