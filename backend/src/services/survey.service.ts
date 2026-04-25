import type {
  ISurveyService,
  SurveyResponse,
} from '@/interfaces/service.interface';
import type { ISurveyRepository } from '@/interfaces/repository.interface';
import type { SurveyInput } from '@/validation/validation';

export class SurveyService implements ISurveyService {
  constructor(private surveyRepository: ISurveyRepository) {}

  async createSurvey(data: SurveyInput): Promise<SurveyResponse> {
    return this.surveyRepository.create(data);
  }
}
