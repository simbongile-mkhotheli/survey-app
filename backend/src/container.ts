// backend/src/container.ts
import { PrismaClient } from '@prisma/client';
import { SurveyRepository } from '@/repositories/survey.repository';
import { ResultsRepository } from '@/repositories/results.repository';
import { SurveyService } from '@/services/surveyService';
import { ResultsService } from '@/services/resultsService';
import type {
  ISurveyRepository,
  IResultsRepository,
} from '@/interfaces/repository.interface';
import type {
  ISurveyService,
  IResultsService,
} from '@/interfaces/service.interface';

/**
 * Dependency Injection Container
 * Implements the Dependency Inversion Principle (DIP) from SOLID
 */
export class Container {
  private static instance: Container;
  private prismaClient: PrismaClient;
  private _surveyRepository?: ISurveyRepository;
  private _resultsRepository?: IResultsRepository;
  private _surveyService?: ISurveyService;
  private _resultsService?: IResultsService;

  private constructor() {
    this.prismaClient = new PrismaClient();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public get surveyRepository(): ISurveyRepository {
    if (!this._surveyRepository) {
      this._surveyRepository = new SurveyRepository(this.prismaClient);
    }
    return this._surveyRepository;
  }

  public get resultsRepository(): IResultsRepository {
    if (!this._resultsRepository) {
      this._resultsRepository = new ResultsRepository(this.prismaClient);
    }
    return this._resultsRepository;
  }

  public get surveyService(): ISurveyService {
    if (!this._surveyService) {
      this._surveyService = new SurveyService(
        this.surveyRepository,
        this.resultsRepository,
      );
    }
    return this._surveyService;
  }

  public get resultsService(): IResultsService {
    if (!this._resultsService) {
      this._resultsService = new ResultsService(this.resultsRepository);
    }
    return this._resultsService;
  }

  public async cleanup(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}
