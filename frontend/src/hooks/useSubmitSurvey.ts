import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { submitSurvey } from '@/services/surveyService';

export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitSurvey,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.results });
    },
  });
}
