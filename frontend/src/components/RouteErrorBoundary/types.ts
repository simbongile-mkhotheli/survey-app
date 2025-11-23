/**
 * RouteErrorBoundary Types
 * ========================
 * Type definitions for route-level error boundary with recovery strategies
 */

import type { ReactNode, ErrorInfo } from 'react';
import type { ErrorMetadata } from '@/types/async.types';

/**
 * Props for RouteErrorBoundary component
 */
export interface RouteErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;

  /** Route name for context and logging */
  routeName?: string;

  /** Custom fallback UI */
  fallback?: ReactNode;

  /** Maximum retry attempts before giving up */
  maxRetries?: number;

  /** Delay in ms before first retry (uses exponential backoff) */
  retryDelayMs?: number;

  /** Called when an error is caught */
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    metadata: ErrorMetadata,
  ) => void;

  /** Called when user navigates to safe route */
  onNavigate?: (route: string) => void;

  /** Called when user wants to report error */
  onReportError?: (error: Error, metadata?: ErrorMetadata) => void;
}

/**
 * Internal state for RouteErrorBoundary
 */
export interface RouteErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRecovering: boolean;
  lastRecoveredAt: number | null;
  recoveryAttempts: number;
  errorMetadata?: ErrorMetadata;
}

/**
 * Route recovery result
 */
export interface RecoveryResult {
  success: boolean;
  attemptNumber: number;
  error?: Error;
  recoveryTime: number; // milliseconds
}

/**
 * Route error event for analytics
 */
export interface RouteErrorEvent {
  route: string;
  error: Error;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  recoveryAttempts: number;
  recovered: boolean;
  metadata: ErrorMetadata;
}
