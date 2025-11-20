// backend/src/repositories/survey.repository.ts
import {
  PrismaClient,
  type SurveyResponse as PrismaSurveyResponse,
} from '@prisma/client';
import type { ISurveyRepository } from '@/interfaces/repository.interface';
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from '@/interfaces/service.interface';

export class SurveyRepository implements ISurveyRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Maps Prisma model to domain type
   * Ensures type safety and explicit field mapping
   * Handles any differences between database and domain models
   */
  private mapToDomain(raw: PrismaSurveyResponse): SurveyResponse {
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

    return this.mapToDomain(created);
  }

  async findById(id: number): Promise<SurveyResponse | null> {
    const survey = await this.prisma.surveyResponse.findUnique({
      where: { id },
    });
    return survey ? this.mapToDomain(survey) : null;
  }

  async findAll(): Promise<SurveyResponse[]> {
    const surveys = await this.prisma.surveyResponse.findMany();
    return surveys.map((s) => this.mapToDomain(s));
  }

  async count(): Promise<number> {
    return this.prisma.surveyResponse.count();
  }
}
