// backend/src/repositories/survey.repository.ts
import { PrismaClient } from '@prisma/client';
import type { ISurveyRepository } from '@/interfaces/repository.interface';
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from '@/interfaces/service.interface';
import { foodUtils } from '@/utils/foodUtils';
import { dateUtils } from '@/utils/dateUtils';

type SurveyRecord = Awaited<
  ReturnType<PrismaClient['surveyResponse']['findUniqueOrThrow']>
>;

export class SurveyRepository implements ISurveyRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToDomain(raw: SurveyRecord): SurveyResponse {
    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      contactNumber: raw.contactNumber,
      dateOfBirth: raw.dateOfBirth,
      foods: raw.foods,
      ratingMovies: raw.ratingMovies,
      ratingRadio: raw.ratingRadio,
      ratingEatOut: raw.ratingEatOut,
      ratingTV: raw.ratingTV,
      submittedAt: raw.submittedAt,
    };
  }

  async create(data: SurveyInput): Promise<SurveyResponse> {
    const dob = dateUtils.parse(data.dateOfBirth);
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

    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<SurveyResponse | null> {
    const survey = await this.prisma.surveyResponse.findUnique({
      where: { id },
    });
    return survey ? this.mapToDomain(survey) : null;
  }

  async findAll(): Promise<SurveyResponse[]> {
    const surveys: SurveyRecord[] = await this.prisma.surveyResponse.findMany();
    return surveys.map((survey) => this.mapToDomain(survey));
  }

  async count(): Promise<number> {
    return this.prisma.surveyResponse.count();
  }
}
