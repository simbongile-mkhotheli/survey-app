import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchResults, submitSurvey } from '@/services/api';
import { useAppStore } from '@/store/useSurveyStore';
const resultsQueryKey = ['results'] as const;

export function useResults() {
  return useQuery({
    queryKey: resultsQueryKey,
    queryFn: fetchResults,
  });
}

export function useSubmitSurvey(options?: {
  onSuccess?: (response: { id: number }) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();

  return useMutation({
    mutationFn: submitSurvey,
    onSuccess: (response) => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: resultsQueryKey });
      options?.onSuccess?.(response);
    },
    onError: (error) => {
      setError('Failed to submit survey. Please try again.');
      options?.onError?.(error);
    },
  });
}
