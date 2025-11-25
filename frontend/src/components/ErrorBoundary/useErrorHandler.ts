/**
 * Error Handler Hook
 * ==================
 * Custom hook for handling errors in functional components
 */

import { useCallback } from 'react';
import { useAppStore } from '@/store/useSurveyStore';
import { logWithContext } from '@/utils/logger';

// Utility to safely check environment (compatible with all environments)
const isDevelopment = () => {
  // In browser with Vite, check for development indicators
  return (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port !== '')
  );
};

const isProduction = () => {
  return !isDevelopment();
};

export interface ErrorHandlerOptions {
  logToStore?: boolean;
  logToConsole?: boolean;
  showToast?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  // Select only the setter to avoid re-renders on unrelated store state changes
  const setError = useAppStore((s) => s.setError);
  const { logToStore = true, logToConsole = true, showToast = false } = options;

  const handleError = useCallback(
    (error: Error | string, context?: string) => {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const fullMessage = context
        ? `${context}: ${errorMessage}`
        : errorMessage;

      // Log error using structured logger
      logWithContext.error(fullMessage, {
        error: errorMessage,
        context,
        isDevelopment: isDevelopment(),
      });

      // Store error in global state
      if (logToStore) {
        setError(fullMessage);
      }

      // Show toast notification (implement based on your toast system)
      if (showToast) {
        // Example: toast.error(fullMessage);
        // NOTE: Toast notification system integration pending
        // Issue: https://github.com/your-org/repo/issues/123
        // To implement: Install toast library (react-toastify recommended)
        // and wire up toast notifications here
      }

      // In production, send to error reporting service
      if (isProduction()) {
        // Example: ErrorReportingService.report(error, context);
      }
    },
    [setError, logToStore, logToConsole, showToast],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    handleError,
    clearError,
  };
}
