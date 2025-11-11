// backend/src/repositories/survey.repository.ts
import { PrismaClient } from '@prisma/client';
import type { ISurveyRepository } from '@/interfaces/repository.interface';
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from '@/interfaces/service.interface';

export class SurveyRepository implements ISurveyRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: SurveyInput): Promise<SurveyResponse> {
    const dob = new Date(data.dateOfBirth);
    const foodsCsv = data.foods.join(',');

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

    return created as SurveyResponse;
  }

  async findById(id: number): Promise<SurveyResponse | null> {
    const survey = await this.prisma.surveyResponse.findUnique({
      where: { id },
    });
    return survey as SurveyResponse | null;
  }

  async findAll(): Promise<SurveyResponse[]> {
    const surveys = await this.prisma.surveyResponse.findMany();
    return surveys as SurveyResponse[];
  }

  async count(): Promise<number> {
    return this.prisma.surveyResponse.count();
  }
}
