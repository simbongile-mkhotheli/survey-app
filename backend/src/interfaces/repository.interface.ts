// backend/src/interfaces/repository.interface.ts
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from './service.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';

export interface ISurveyRepository {
  create(data: SurveyInput): Promise<SurveyResponse>;
  findById(id: number): Promise<SurveyResponse | null>;
  findAll(): Promise<SurveyResponse[]>;
  count(): Promise<number>;
}

export interface IResultsRepository {
  getResults(requestId?: string): Promise<SurveyResultsDTO>;
}
