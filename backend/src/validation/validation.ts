import { z } from 'zod';

export {
  SurveyPayloadSchema as SurveySchema,
  SurveyInput,
} from '../../../shared/validation';

/**
 * Schema for query parameters on GET /results.
 * Currently, there are no query parameters.
 */
export const ResultsQuerySchema = z.object({}).strict();
export type ResultsQuery = z.infer<typeof ResultsQuerySchema>;
