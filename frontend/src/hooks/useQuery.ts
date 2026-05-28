import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

import { fetchResults } from '@/services/api';
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
