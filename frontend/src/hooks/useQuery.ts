import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

import { fetchResults, submitSurvey } from '@/services/api';
import { useAppStore } from '@/store/useSurveyStore';
import type { SurveyFormValues } from '@/validation';
import type { ResultsData } from '@/services/api';

const resultsQueryKey = ['results'] as const;

export function useResults(
  options?: Omit<
    UseQueryOptions<ResultsData, Error, ResultsData>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ResultsData>({
    queryKey: resultsQueryKey,
    queryFn: fetchResults,
    ...options,
  });
}

export function useSubmitSurvey(
  options?: {
    onSuccess?: (response: { id: number }) => void;
    onError?: (error: Error) => void;
  } & Omit<
    UseMutationOptions<{ id: number }, Error, SurveyFormValues>,
    'mutationFn' | 'onSuccess' | 'onError'
  >,
) {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation({
    mutationFn: (payload: SurveyFormValues) => submitSurvey(payload),
    onSuccess: (response) => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: resultsQueryKey });
      userOnSuccess?.(response);
    },
    onError: (error) => {
      console.error('Failed to submit survey:', error);
      setError('Failed to submit survey. Please try again.');
      userOnError?.(error);
    },
    ...restOptions,
  });
}
