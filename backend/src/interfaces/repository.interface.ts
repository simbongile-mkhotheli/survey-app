// backend/src/interfaces/repository.interface.ts
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResponse } from './service.interface';

export interface ISurveyRepository {
  create(data: SurveyInput): Promise<SurveyResponse>;
  findById(id: number): Promise<SurveyResponse | null>;
  findAll(): Promise<SurveyResponse[]>;
  count(): Promise<number>;
}

export interface IResultsRepository {
  getAverageRatings(requestId?: string): Promise<{
    movies: number;
    radio: number;
    eatOut: number;
    tv: number;
  }>;
  getFoodDistribution(requestId?: string): Promise<Array<{ food: string; count: number }>>;
  getTotalResponses(requestId?: string): Promise<number>;
  getAgeStatistics(requestId?: string): Promise<{
    avg: number | null;
    min: number | null;
    max: number | null;
  }>;
  invalidateCache(): Promise<void>;
}