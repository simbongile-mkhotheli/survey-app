/**
 * React Query Configuration
 * =========================
 * Centralized QueryClient setup with sensible defaults
 * and custom error handling for enterprise applications
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure QueryClient with custom defaults
 * Handles caching, retries, and error handling
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Cache time: 5 minutes (same as backend cache TTL)
       * Data is considered fresh for this duration
       */
      gcTime: 5 * 60 * 1000,

      /**
       * Stale time: 30 seconds
       * Data is immediately considered stale after this duration
       * Triggers background refetch if cache is accessed
       */
      staleTime: 30 * 1000,

      /**
       * Retry strategy: 2 retries for failed requests
       * - First retry after 1s
       * - Second retry after 2s
       * Doesn't retry on 4xx errors (client errors)
       */
      retry: (failureCount, error: unknown) => {
        // Type guard for error object with response property
        if (error instanceof Error && 'response' in error) {
          const response = (error as Record<string, unknown>).response as
            | Record<string, unknown>
            | undefined;
          const status = response?.status as number | undefined;
          // Don't retry on client errors (4xx)
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 2 times on server errors (5xx) and network errors
        return failureCount < 2;
      },

      /**
       * Retry delay: exponential backoff
       * 1st retry: 1000ms
       * 2nd retry: 2000ms
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      /**
       * Refetch behavior
       */
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      /**
       * Abort stale requests when new request is made
       */
      networkMode: 'always',
    },

    mutations: {
      /**
       * Retry strategy for mutations
       * More conservative than queries - don't retry by default
       * (User should control retry for mutations)
       */
      retry: 0,

      /**
       * Cache time for mutation results
       * Shorter than queries (1 minute)
       */
      gcTime: 1 * 60 * 1000,
    },
  },
});

/**
 * Set up global error handling for all queries
 * This integrates with the error middleware
 */
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    throwOnError: true,
  },
});

export default queryClient;
