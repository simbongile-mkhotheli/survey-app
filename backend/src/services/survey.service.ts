import type {
  ISurveyService,
  SurveyResponse,
} from '@/interfaces/service.interface';
import type {
  ISurveyRepository,
  IResultsRepository,
} from '@/interfaces/repository.interface';
import type { SurveyInput } from '@/validation/validation';
import { businessMetrics } from '@/middleware/metrics';
import { logWithContext } from '@/config/logger';

export class SurveyService implements ISurveyService {
  constructor(
    private surveyRepository: ISurveyRepository,
    private resultsRepository: IResultsRepository,
  ) {}

  /**
   * Insert a new survey response into the database.
   * Delegates to the repository layer following SRP
   * Invalidates cache to ensure fresh results
   */
  async createSurvey(data: SurveyInput): Promise<SurveyResponse> {
    const startTime = Date.now();

    try {
      const result = await this.surveyRepository.create(data);

      // Invalidate cached results since new data has been added
      // Run cache invalidation asynchronously (fire-and-forget) so it
      // doesn't block the HTTP response. This prevents slow cache ops
      // (eg. Redis KEYS/DEL) from causing request timeouts in serverless
      // environments like Vercel.
      this.resultsRepository.invalidateCache().catch((err) => {
        logWithContext.error('Failed to invalidate cache asynchronously', err, {
          operation: 'invalidate_cache',
        });
      });

      const duration = Date.now() - startTime;

      // Record business metrics
      businessMetrics.recordSurveyCreated();

      // Log successful survey creation
      logWithContext.info('Survey response created', {
        operation: 'create_survey',
        duration,
        metadata: {
          surveyId: result.id,
          email: data.email,
          cacheInvalidated: true,
        },
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logWithContext.error('Failed to create survey response', error as Error, {
        operation: 'create_survey',
        duration,
        metadata: {
          email: data.email,
        },
      });

      throw error;
    }
  }
}
