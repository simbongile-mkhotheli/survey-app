import { PrismaClient } from '@prisma/client';
import { ResultsRepository } from '@/repositories/results.repository';
import { SurveyRepository } from '@/repositories/survey.repository';

const prisma = new PrismaClient();

export const container = {
  prisma,
  surveyRepository: new SurveyRepository(prisma),
  resultsRepository: new ResultsRepository(prisma),
  async cleanup() {
    await prisma.$disconnect();
  },
};
