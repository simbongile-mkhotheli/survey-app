// backend/src/test/mocks/prisma.mock.ts
import { vi } from 'vitest';
import type { SurveyResponse } from '@/interfaces/service.interface';

export const mockPrismaClient = {
  surveyResponse: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  $disconnect: vi.fn(),
};

export const mockSurveyResponse: SurveyResponse = {
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
};

export const mockSurveyInput = {
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
};