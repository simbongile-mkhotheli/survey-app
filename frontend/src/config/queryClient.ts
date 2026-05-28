import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      staleTime: 30 * 1000,
      retry: (failureCount, error: unknown) => {
        if (error instanceof Error && 'response' in error) {
          const response = (error as Record<string, unknown>).response as
            | Record<string, unknown>
            | undefined;
          const status = response?.status as number | undefined;

          if (status && status >= 400 && status < 500) {
            return false;
          }
        }

        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'always',
    },
    mutations: {
      retry: 0,
      gcTime: 1 * 60 * 1000,
    },
  },
});

export default queryClient;
