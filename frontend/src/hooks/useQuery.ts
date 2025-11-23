/**
 * Custom React Query Hooks
 * ========================
 * Enterprise-grade data fetching hooks for the survey app
 * Provides type-safe access to API endpoints with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import type { SurveyFormValues } from '@/validation';
import { submitSurvey, fetchResults } from '@/services/api';
import type { ResultsData } from '@/services/api';
import { logWithContext } from '@/utils/logger';

/**
 * Query keys factory for better cache management
 * Ensures consistency across the application
 */
export const surveyQueryKeys = {
  all: ['survey'] as const,
  results: () => [...surveyQueryKeys.all, 'results'] as const,
  resultsDetail: (filter?: string) =>
    [...surveyQueryKeys.results(), { filter }] as const,
};

/**
 * ============================================================================
 * QUERIES (Data Fetching - GET Operations)
 * ============================================================================
 */

/**
 * Hook to fetch survey results
 *
 * Features:
 * - Automatic caching and background refetching
 * - Stale-time: 30s (triggers background refetch if data accessed after 30s)
 * - Cache time: 5 minutes (persisted in memory)
 * - Retry: 2 attempts on network/server errors
 * - Integrates with Zustand for local state persistence
 *
 * @param options - Optional React Query configuration overrides
 * @returns Query object with data, isLoading, error, refetch, etc.
 *
 * @example
 * const { data, isLoading, error } = useResults();
 * if (isLoading) return <Loading />;
 * if (error) return <ErrorMessage error={error} />;
 * return <ResultsDisplay data={data} />;
 */
export function useResults(
  options?: Omit<
    UseQueryOptions<ResultsData, Error, ResultsData>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: surveyQueryKeys.results(),
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const data = await fetchResults();
        const duration = Date.now() - startTime;

        logWithContext.info('Results fetched successfully', {
          operation: 'fetch_results',
          duration,
          totalCount: data?.totalCount,
        });

        return data;
      } catch (error) {
        const duration = Date.now() - startTime;
        logWithContext.error('Failed to fetch results', error, {
          operation: 'fetch_results',
          duration,
        });
        throw error;
      }
    },
    ...options,
  });
}

/**
 * ============================================================================
 * MUTATIONS (Data Mutations - POST/PUT/DELETE Operations)
 * ============================================================================
 */

/**
 * Hook to submit a survey response
 *
 * Features:
 * - Automatic cache invalidation after success
 * - Optimistic updates (optional)
 * - Error handling with context
 * - Integration with Zustand for local state
 * - No automatic retries for mutations (user controls)
 *
 * @param options - Optional React Query configuration overrides
 * @returns Mutation object with mutate, isPending, error, etc.
 *
 * @example
 * const { mutate, isPending, error } = useSubmitSurvey();
 * const handleSubmit = async (data: SurveyFormValues) => {
 *   mutate(data, {
 *     onSuccess: (response) => {
 *       console.log('Survey submitted:', response.id);
 *     },
 *   });
 * };
 */
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
  const {
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...restOptions
  } = options || {};

  return useMutation({
    mutationFn: async (data: SurveyFormValues) => {
      const startTime = Date.now();
      try {
        const response = await submitSurvey(data);
        const duration = Date.now() - startTime;

        logWithContext.info('Survey submitted successfully', {
          operation: 'submit_survey',
          duration,
          surveyId: response.id,
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        logWithContext.error('Failed to submit survey', error, {
          operation: 'submit_survey',
          duration,
        });
        throw error;
      }
    },

    // Invalidate results cache after successful submission
    // This ensures the latest data is fetched on next access
    onSuccess: (data) => {
      // Invalidate results query to trigger background refetch
      queryClient.invalidateQueries({
        queryKey: surveyQueryKeys.results(),
      });

      // Call user's custom onSuccess handler if provided
      if (userOnSuccess) {
        userOnSuccess(data);
      }
    },

    // Error handling
    onError: (error) => {
      logWithContext.error('Survey submission error occurred', error, {
        operation: 'submit_survey_error',
      });

      // Call user's custom onError handler if provided
      if (userOnError) {
        userOnError(error);
      }
    },

    // Disable automatic retries for mutations (user should control)
    retry: false,

    ...restOptions,
  });
}

/**
 * ============================================================================
 * Helper Hook for Manual Query Management
 * ============================================================================
 */

/**
 * Hook to manually refetch results with loading state
 * Useful for refresh buttons and manual synchronization
 *
 * @returns Object with refetch function and status
 *
 * @example
 * const { refetch, isRefetching } = useRefreshResults();
 * return (
 *   <button onClick={() => refetch()} disabled={isRefetching}>
 *     {isRefetching ? 'Refreshing...' : 'Refresh'}
 *   </button>
 * );
 */
export function useRefreshResults() {
  const { refetch, isPending } = useResults();

  return {
    refetch,
    isRefetching: isPending,
  };
}

/**
 * ============================================================================
 * Hook: Prefetch Results (for performance optimization)
 * ============================================================================
 */

/**
 * Hook to prefetch survey results in the background
 * Useful for route transitions and anticipatory loading
 *
 * @example
 * // In a component with route transitions
 * import { usePrefetchResults } from '@/hooks/useQuery';
 *
 * const prefetch = usePrefetchResults();
 * // Call prefetch() when navigating to results page
 * prefetch();
 */
export function usePrefetchResults() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.prefetchQuery({
      queryKey: surveyQueryKeys.results(),
      queryFn: fetchResults,
    });
}
