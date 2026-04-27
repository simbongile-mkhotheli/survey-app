// backend/src/container.ts
import { PrismaClient } from '@prisma/client';
import { SurveyRepository } from '@/repositories/survey.repository';
import { ResultsRepository } from '@/repositories/results.repository';
import { SurveyService } from '@/services/survey.service';
import { ResultsService } from '@/services/results.service';

const prismaClient = new PrismaClient();

export const container = {
  surveyRepository: new SurveyRepository(prismaClient),
  resultsRepository: new ResultsRepository(prismaClient),
  surveyService: new SurveyService(new SurveyRepository(prismaClient)),
  resultsService: new ResultsService(new ResultsRepository(prismaClient)),
  cleanup: () => prismaClient.$disconnect(),
};
