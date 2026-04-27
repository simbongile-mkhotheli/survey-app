import { faker } from '@faker-js/faker';
import type { SurveyFormValues } from '@/validation';

export function createMockSurveyFormData(
  overrides?: Partial<SurveyFormValues>,
): SurveyFormValues {
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
