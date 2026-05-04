import { describe, expect, it } from 'vitest';
import { ResultsQuerySchema, SurveySchema } from '@/validation/validation';

describe('validation schemas', () => {
  it('accepts an empty results query', () => {
    expect(() => ResultsQuerySchema.parse({})).not.toThrow();
  });

  it('accepts a valid survey payload', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      contactNumber: '+27123456789',
      dateOfBirth: '2000-01-01',
      foods: ['pizza', 'pasta'],
      ratingMovies: 5,
      ratingRadio: 4,
      ratingEatOut: 3,
      ratingTV: 2,
    };

    const parsed = SurveySchema.parse(payload);

    expect(parsed.firstName).toBe('John');
    expect(parsed.email).toBe('john@example.com');
    expect(parsed.foods).toEqual(['pizza', 'pasta']);
  });

  it('rejects invalid ratings', () => {
    const payload = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      contactNumber: '+27123456789',
      dateOfBirth: '2000-01-01',
      foods: ['pizza'],
      ratingMovies: 9,
      ratingRadio: 4,
      ratingEatOut: 3,
      ratingTV: 2,
    };

    expect(() => SurveySchema.parse(payload)).toThrow();
  });
});
