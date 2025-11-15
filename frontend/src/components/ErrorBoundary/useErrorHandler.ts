/**
 * Error Handler Hook
 * ==================
 * Custom hook for handling errors in functional components
 */

import { useCallback } from 'react';
import { useAppStore } from '../../store/useSurveyStore';

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

      // Log to console in development
      if (logToConsole && isDevelopment()) {
        // eslint-disable-next-line no-console
        console.error('Error handled:', { error, context, fullMessage });
      }

      // Store error in global state
      if (logToStore) {
        setError(fullMessage);
      }

      // Show toast notification (implement based on your toast system)
      if (showToast) {
        // Example: toast.error(fullMessage);
        // TODO: Implement toast notification system
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
