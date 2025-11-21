/**
 * Frontend Test Helpers
 * ====================
 * Utilities for generating dynamic test data using Faker.js
 * Ensures tests are not hardcoded and remain maintainable
 */
import { faker } from '@faker-js/faker';
import type { SurveyFormValues } from '../../validation';

/**
 * Generate random valid survey form data
 * Uses Faker.js to create unique, realistic test data
 */
export function createMockSurveyFormData(
  overrides?: Partial<SurveyFormValues>,
): SurveyFormValues {
  // Generate a date of birth between 25-40 years ago (ensures age 25-40)
  // This gives us a safe buffer within the 5-120 year requirement
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 40,
    today.getMonth(),
    today.getDate(),
  );
  const maxDate = new Date(
    today.getFullYear() - 25,
    today.getMonth(),
    today.getDate(),
  );
  const pastDate = faker.date.between({ from: minDate, to: maxDate });
  const dateString = pastDate.toISOString().split('T')[0];

  const foods = ['Pizza', 'Pasta', 'Pap and Wors', 'Other'];
  const selectedFoods = foods.slice(
    0,
    faker.number.int({ min: 1, max: Math.min(3, foods.length) }),
  );

  return {
    firstName: faker.person.firstName().substring(0, 100),
    lastName: faker.person.lastName().substring(0, 100),
    email: faker.internet.email().substring(0, 255),
    contactNumber: `+${faker.string.numeric({ length: 11 })}`,
    dateOfBirth: dateString,
    foods: selectedFoods,
    ratingMovies: String(faker.number.int({ min: 1, max: 5 })),
    ratingRadio: String(faker.number.int({ min: 1, max: 5 })),
    ratingEatOut: String(faker.number.int({ min: 1, max: 5 })),
    ratingTV: String(faker.number.int({ min: 1, max: 5 })),
    ...overrides,
  };
}

/**
 * Generate valid email for testing
 */
export function createMockEmail(): string {
  return faker.internet.email();
}

/**
 * Generate valid phone number for testing
 */
export function createMockPhone(): string {
  return `+${faker.string.numeric({ length: 11 })}`;
}

/**
 * Generate valid date of birth (adult, 18+)
 */
export function createMockDateOfBirth(): string {
  const pastDate = faker.date.past({ years: 50 });
  return pastDate.toISOString().split('T')[0];
}

/**
 * Generate random rating (1-5)
 */
export function createMockRating(): string {
  return String(faker.number.int({ min: 1, max: 5 }));
}

/**
 * Generate random first name
 */
export function createMockFirstName(): string {
  return faker.person.firstName();
}

/**
 * Generate random last name
 */
export function createMockLastName(): string {
  return faker.person.lastName();
}

/**
 * Generate random food selection
 */
export function createMockFoodSelection(): string[] {
  const foods = ['Pizza', 'Pasta', 'Pap and Wors', 'Other'];
  const count = faker.number.int({ min: 1, max: foods.length });
  return faker.helpers.shuffle(foods).slice(0, count);
}
