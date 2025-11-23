/**
 * React Query Configuration
 * =========================
 * Centralized QueryClient setup with sensible defaults
 * and custom error handling for enterprise applications
 */

import { QueryClient } from '@tanstack/react-query';
import { logWithContext } from '@/utils/logger';

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
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
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

/**
 * Global error handler for all React Query operations
 * Called whenever a query or mutation fails
 */
queryClient.getQueryCache().subscribe((event) => {
  // Handle query state updates that include errors
  if (event.type === 'updated' && event.action.type === 'error') {
    const error = event.query.state.error;

    logWithContext.error('React Query error', error as Error, {
      operation: 'react_query_error',
      queryKey: event.query.queryKey,
    });
  }
});

/**
 * Global error handler for mutations
 */
queryClient.getMutationCache().subscribe((event) => {
  // Handle mutation state updates that include errors
  if (event.type === 'updated' && event.action.type === 'error') {
    const error = event.mutation.state.error;

    logWithContext.error('React Query mutation error', error as Error, {
      operation: 'react_query_mutation_error',
    });
  }
});

export default queryClient;
