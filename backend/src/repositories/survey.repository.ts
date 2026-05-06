import { PrismaClient } from '@prisma/client';
import type { SurveyInput } from '@/validation/validation';
import { foodUtils } from '@/utils/foodUtils';
import { parseDate } from '@/utils/dateUtils';

export type SurveyCreated = {
  id: number;
};

export class SurveyRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: SurveyInput): Promise<SurveyCreated> {
    const dob = parseDate(data.dateOfBirth);
    const foodsCsv = foodUtils.toCSV(data.foods);

    const created = await this.prisma.surveyResponse.create({
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

    return { id: created.id };
  }
}
