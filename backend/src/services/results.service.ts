import type { IResultsService } from '@/interfaces/service.interface';
import type { IResultsRepository } from '@/interfaces/repository.interface';
import type { SurveyResultsDTO } from '@/types/resultsDTO';

export class ResultsService implements IResultsService {
  constructor(private resultsRepository: IResultsRepository) {}

  async getResults(_requestId?: string): Promise<SurveyResultsDTO> {
    // Single source of truth: repository handles all aggregation
    return this.resultsRepository.getResults();
  }
}
