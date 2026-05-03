// backend/src/interfaces/repository.interface.ts
import type { SurveyInput } from '@/validation/validation';
import type { SurveyResultsDTO } from '@/types/resultsDTO';

export interface SurveyResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  dateOfBirth: Date;
  foods: string;
  ratingMovies: number;
  ratingRadio: number;
  ratingEatOut: number;
  ratingTV: number;
  submittedAt: Date;
}

export interface ISurveyRepository {
  create(data: SurveyInput): Promise<SurveyResponse>;
}

export interface IResultsRepository {
  getResults(): Promise<SurveyResultsDTO>;
}
