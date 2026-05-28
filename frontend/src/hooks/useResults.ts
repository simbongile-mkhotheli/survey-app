import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { fetchResults } from '@/services/resultsService';
import type { ResultsData } from '@/services/resultsService';

export function useResults(
  options?: Omit<
    UseQueryOptions<ResultsData, Error, ResultsData>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ResultsData>({
    queryKey: queryKeys.results,
    queryFn: fetchResults,
    ...options,
  });
}
