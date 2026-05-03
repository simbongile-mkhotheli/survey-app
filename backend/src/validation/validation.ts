import { z } from 'zod';

export {
  SurveyPayloadSchema as SurveySchema,
  SurveyInput,
} from '@shared/validation';

export const ResultsQuerySchema = z.object({}).strict();
export type ResultsQuery = z.infer<typeof ResultsQuerySchema>;
