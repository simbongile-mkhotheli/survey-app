// backend/src/container.ts
import { PrismaClient } from '@prisma/client';
import { SurveyRepository } from '@/repositories/survey.repository';
import { ResultsRepository } from '@/repositories/results.repository';

const prismaClient = new PrismaClient();

// Singleton instances - reused across the app
const surveyRepository = new SurveyRepository(prismaClient);
const resultsRepository = new ResultsRepository(prismaClient);

export const container = {
  surveyRepository,
  resultsRepository,
  cleanup: () => prismaClient.$disconnect(),
};
