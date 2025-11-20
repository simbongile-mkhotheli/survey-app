// Re-export all validation schemas from the shared validation module
// This ensures frontend uses the same validation rules as backend
export {
  SurveyFormSchema,
  SurveyPayloadSchema,
  formToPayload,
} from '@shared-root/validation';

export type { SurveyFormValues, SurveyInput } from '@shared-root/validation';
