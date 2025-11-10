/**
 * Error Boundary Types
 * ===================
 * TypeScript definitions for error boundary components
 */

import type { ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorHandlerOptions {
  logToStore?: boolean;
  logToConsole?: boolean;
  showToast?: boolean;
}
