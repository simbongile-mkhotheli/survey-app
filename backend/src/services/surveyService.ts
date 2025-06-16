import { PrismaClient } from '@prisma/client';
import type { SurveyInput } from '../validation/validation';

const prisma = new PrismaClient();

/**
 * Insert a new survey response into the database.
 * - Parses dateOfBirth string into Date
 * - Converts foods array into CSV string
 */
export async function createSurvey(data: SurveyInput) {
  const dob = new Date(data.dateOfBirth);
  const foodsCsv = data.foods.join(',');

  const created = await prisma.surveyResponse.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      contactNumber: data.contactNumber,
      dateOfBirth: dob,
      foods: foodsCsv,
      ratingMovies: data.ratingMovies,
      ratingRadio: data.ratingRadio,
      ratingEatOut: data.ratingEatOut,
      ratingTV: data.ratingTV,
    },
  });

  return created;
}
