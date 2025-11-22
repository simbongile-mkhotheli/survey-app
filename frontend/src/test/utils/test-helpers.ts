/**
 * Frontend Test Helpers
 * ====================
 * Utilities for generating dynamic test data using Faker.js
 * Ensures tests are not hardcoded and remain maintainable
 */
import { faker } from '@faker-js/faker';
import type { SurveyFormValues } from '@/validation';

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

// ==================== UTILITY TEST DATA GENERATORS ====================

/**
 * Generate random success response data for API testing
 */
export function createRandomSuccessData(): Record<string, unknown> {
  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    name: faker.person.firstName(),
    email: faker.internet.email(),
    createdAt: faker.date.past().toISOString(),
  };
}

/**
 * Generate random error message
 */
export function createRandomErrorMessage(): string {
  return faker.lorem.sentence();
}

/**
 * Generate random error code
 */
export function createRandomErrorCode(): string {
  return faker.string.alpha({ length: 10 }).toUpperCase();
}

/**
 * Generate random text string for sanitization testing
 */
export function createRandomSafeString(): string {
  return faker.lorem.words({ count: faker.number.int({ min: 1, max: 5 }) });
}

/**
 * Generate XSS attack vector for sanitization testing
 */
export function createRandomXSSAttempt(): string {
  const vectors = [
    `<script>${faker.lorem.word()}</script>`,
    `<img onerror="alert('${faker.lorem.word()}')">`,
    `javascript:${faker.lorem.word()}()`,
    `<div onclick="${faker.lorem.word()}"></div>`,
  ];
  return faker.helpers.arrayElement(vectors);
}

/**
 * Generate date string in YYYY-MM-DD format
 */
export function createRandomDateString(): string {
  const date = faker.date.past({ years: 10 });
  return date.toISOString().split('T')[0];
}

/**
 * Generate ISO datetime string
 */
export function createRandomISODateString(): string {
  return faker.date.past({ years: 10 }).toISOString();
}

/**
 * Generate relative time test data (dates for relative time formatting)
 */
export function createRandomRecentDate(): Date {
  // Generate a date within the last day for relative time testing
  return faker.date.recent({ days: 1 });
}

/**
 * Generate form object with string values
 */
export function createRandomFormObject(): Record<string, string> {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+1##########'),
  };
}

/**
 * Generate object with values that have extra whitespace
 */
export function createRandomObjectWithWhitespace(): Record<string, string> {
  return {
    name: `  ${faker.person.firstName()}  `,
    email: `${faker.internet.email()}  `,
    text: `  ${faker.lorem.word()}  `,
  };
}

/**
 * Generate object with mixed case values
 */
export function createRandomObjectWithMixedCase(): Record<string, string> {
  return {
    email: faker.internet.email().toUpperCase(),
    name: faker.person.firstName().toUpperCase(),
    text: faker.lorem.word().toLowerCase(),
  };
}

/**
 * Generate before/after objects for field change detection
 */
export function createRandomFieldChanges(): {
  original: Record<string, unknown>;
  updated: Record<string, unknown>;
} {
  const firstName = faker.person.firstName();
  const email = faker.internet.email();
  const newEmail = faker.internet.email();

  return {
    original: {
      firstName,
      email,
      age: faker.number.int({ min: 18, max: 70 }),
    },
    updated: {
      firstName,
      email: newEmail, // Changed
      age: faker.number.int({ min: 18, max: 70 }),
    },
  };
}

/**
 * Generate object with empty/null/undefined values
 */
export function createRandomEmptyObject(): Record<string, unknown> {
  return {
    name: '',
    email: '',
    phone: null,
    age: undefined,
  };
}

// ==================== VALIDATION TEST DATA GENERATORS ====================

/**
 * Generate valid email addresses for validation testing
 */
export function createValidEmails(): string[] {
  return [
    faker.internet.email(),
    faker.internet.email().replace('@', '.') + '@example.com',
    faker.internet.email().replace(/(.+)@/, '$1+tag@'),
  ];
}

/**
 * Generate invalid email addresses for validation testing
 */
export function createInvalidEmails(): string[] {
  return ['invalid', 'user@', '@example.com', 'user name@example.com'];
}

/**
 * Generate valid phone numbers for validation testing
 */
export function createValidPhoneNumbers(): string[] {
  return [
    `+${faker.string.numeric({ length: 11 })}`,
    `+${faker.string.numeric({ length: 12 })}`,
    faker.string.numeric({ length: 10 }),
  ];
}

/**
 * Generate invalid phone numbers for validation testing
 */
export function createInvalidPhoneNumbers(): string[] {
  return ['123', '12345', 'abc12345', ''];
}
