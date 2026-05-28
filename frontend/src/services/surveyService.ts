import { formToPayload, type SurveyFormValues } from '@/validation';
import { unwrapResponse } from '@/utils/response';
import type { ApiResponse } from '@/utils/response';
import { apiClient } from './apiClient';

export async function submitSurvey(
  data: SurveyFormValues,
): Promise<{ id: number }> {
  const payload = formToPayload(data);

  const response = await apiClient.post<ApiResponse<{ id: number }>>(
    '/api/survey',
    payload,
  );
  return unwrapResponse(response.data);
}
