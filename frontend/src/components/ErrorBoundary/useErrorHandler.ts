/**
 * Error Handler Hook
 * ==================
 * Handles error logging and state management for functional components
 */

import { useCallback } from 'react';
import { useAppStore } from '@/store/useSurveyStore';
import { logWithContext } from '@/utils/logger';

export interface ErrorHandlerOptions {
  logToStore?: boolean;
}

export function useErrorHandler({ logToStore = true }: ErrorHandlerOptions = {}) {
  const setError = useAppStore((s) => s.setError);

  const handleError = useCallback(
    (error: Error | string, context?: string) => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

      logWithContext.error(fullMessage, { error: errorMessage, context });

      if (logToStore) {
        setError(fullMessage);
      }
    },
    [setError, logToStore],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return { handleError, clearError };
}
