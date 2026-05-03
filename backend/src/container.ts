// backend/src/container.ts
import { PrismaClient } from '@prisma/client';
import { SurveyRepository } from '@/repositories/survey.repository';
import { ResultsRepository } from '@/repositories/results.repository';

const prismaClient = new PrismaClient();

export const container = {
  surveyRepository: new SurveyRepository(prismaClient),
  resultsRepository: new ResultsRepository(prismaClient),
  cleanup: () => prismaClient.$disconnect(),
};
