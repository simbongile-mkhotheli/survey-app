/**
 * useErrorRecovery Hook
 * =====================
 * Advanced error recovery strategies with retry logic, exponential backoff,
 * circuit breaker pattern, and fallback mechanisms.
 *
 * Features:
 * - Exponential backoff retry strategy
 * - Circuit breaker pattern to prevent cascading failures
 * - Fallback mechanisms with priority
 * - Error deduplication (prevent handling same error twice)
 * - Recovery metrics and analytics
 * - Configurable retry limits and delays
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ErrorMetadata } from '@/types/async.types';
import { logWithContext } from '@/utils/logger';

/**
 * Recovery strategy configuration
 */
export interface RecoveryStrategy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  circuitBreakerThreshold: number;
}

/**
 * Error recovery state
 */
export interface RecoveryState {
  isRecovering: boolean;
  attemptCount: number;
  lastError: Error | null;
  lastRecoveredAt: number | null;
  circuitBreakerOpen: boolean;
  recoveryHistory: Array<{
    error: Error;
    timestamp: number;
    recovered: boolean;
  }>;
}

/**
 * Default recovery strategy
 */
const DEFAULT_RECOVERY_STRATEGY: RecoveryStrategy = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  circuitBreakerThreshold: 5,
};

/**
 * Hook for advanced error recovery with retry strategies
 *
 * @param strategyOverrides - Override default recovery strategy
 * @returns Recovery utilities and state
 */
export function useErrorRecovery(
  strategyOverrides?: Partial<RecoveryStrategy>,
) {
  const strategy = useMemo(
    () => ({
      ...DEFAULT_RECOVERY_STRATEGY,
      ...strategyOverrides,
    }),
    [strategyOverrides],
  );

  const [state, setState] = useState<RecoveryState>({
    isRecovering: false,
    attemptCount: 0,
    lastError: null,
    lastRecoveredAt: null,
    circuitBreakerOpen: false,
    recoveryHistory: [],
  });

  const timeoutRef = useRef<number | null>(null);
  const recoveryMapRef = useRef<Map<string, number>>(new Map());

  /**
   * Generate error fingerprint for deduplication
   */
  const getErrorFingerprint = useCallback((error: Error): string => {
    return `${error.message}:${error.stack?.split('\n')[1] || ''}`;
  }, []);

  /**
   * Calculate retry delay with exponential backoff
   */
  const calculateDelay = useCallback(
    (attemptNumber: number): number => {
      const exponentialDelay =
        strategy.initialDelayMs *
        Math.pow(strategy.backoffMultiplier, attemptNumber);
      return Math.min(exponentialDelay, strategy.maxDelayMs);
    },
    [strategy],
  );

  /**
   * Check if circuit breaker should be open
   */
  const isCircuitBreakerOpen = useCallback(() => {
    const recentFailures = state.recoveryHistory.filter(
      (entry) => Date.now() - entry.timestamp < 60000 && !entry.recovered, // Last 60 seconds
    ).length;

    return recentFailures >= strategy.circuitBreakerThreshold;
  }, [state.recoveryHistory, strategy.circuitBreakerThreshold]);

  /**
   * Attempt recovery with retry logic and fallbacks
   */
  const attemptRecovery = useCallback(
    async (
      error: Error,
      metadata?: ErrorMetadata,
      fallbackFn?: () => Promise<void>,
    ): Promise<boolean> => {
      // Check for duplicate error handling
      const fingerprint = getErrorFingerprint(error);
      const lastHandledTime = recoveryMapRef.current.get(fingerprint);

      if (lastHandledTime && Date.now() - lastHandledTime < 5000) {
        // Skip duplicate error handling within 5 seconds
        return false;
      }

      recoveryMapRef.current.set(fingerprint, Date.now());

      // Check circuit breaker
      if (isCircuitBreakerOpen()) {
        setState((prevState) => ({
          ...prevState,
          circuitBreakerOpen: true,
          lastError: error,
        }));

        logWithContext.error(
          'Circuit breaker open - too many recent failures',
          error,
          metadata,
        );

        return false;
      }

      setState((prevState) => ({
        ...prevState,
        isRecovering: true,
        lastError: error,
      }));

      try {
        // Try recovery with retries
        for (let attempt = 0; attempt < strategy.maxAttempts; attempt++) {
          setState((prevState) => ({
            ...prevState,
            attemptCount: attempt + 1,
          }));

          try {
            // Execute recovery function if provided
            if (fallbackFn) {
              await fallbackFn();
            }

            // Mark recovery successful
            setState((prevState) => ({
              ...prevState,
              isRecovering: false,
              lastRecoveredAt: Date.now(),
              recoveryHistory: [
                ...prevState.recoveryHistory,
                {
                  error,
                  timestamp: Date.now(),
                  recovered: true,
                },
              ].slice(-50), // Keep last 50 entries
            }));

            logWithContext.error('Error recovery successful', error, {
              ...metadata,
              attempt: attempt + 1,
            });

            return true;
          } catch {
            // Ignore retry errors, will retry on next attempt or circuit break
            const delay = calculateDelay(attempt);

            // Wait before next attempt
            await new Promise((resolve) => {
              timeoutRef.current = window.setTimeout(resolve, delay);
            });
          }
        }

        // All attempts failed
        setState((prevState) => ({
          ...prevState,
          isRecovering: false,
          recoveryHistory: [
            ...prevState.recoveryHistory,
            {
              error,
              timestamp: Date.now(),
              recovered: false,
            },
          ].slice(-50),
        }));

        logWithContext.error(
          'Error recovery failed after all attempts',
          error,
          { ...metadata, attempts: strategy.maxAttempts },
        );

        return false;
      } catch (fatalError) {
        setState((prevState) => ({
          ...prevState,
          isRecovering: false,
        }));

        logWithContext.error(
          'Fatal error during recovery',
          fatalError instanceof Error
            ? fatalError
            : new Error(String(fatalError)),
          metadata,
        );

        return false;
      }
    },
    [
      getErrorFingerprint,
      calculateDelay,
      isCircuitBreakerOpen,
      strategy.maxAttempts,
    ],
  );

  /**
   * Reset recovery state
   */
  const reset = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isRecovering: false,
      attemptCount: 0,
      lastError: null,
      lastRecoveredAt: null,
      circuitBreakerOpen: false,
      recoveryHistory: [],
    });

    recoveryMapRef.current.clear();
  }, []);

  /**
   * Get recovery metrics
   */
  const getMetrics = useCallback(() => {
    const total = state.recoveryHistory.length;
    const successful = state.recoveryHistory.filter((r) => r.recovered).length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      totalRecoveries: total,
      successfulRecoveries: successful,
      successRate,
      circuitBreakerOpen: state.circuitBreakerOpen,
      lastRecoveredAt: state.lastRecoveredAt,
    };
  }, [state.recoveryHistory, state.circuitBreakerOpen, state.lastRecoveredAt]);

  // Cleanup on unmount
  const _cleanup = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Register cleanup on unmount
  React.useEffect(() => {
    return _cleanup;
  }, []);

  return {
    state,
    attemptRecovery,
    reset,
    getMetrics,
    calculateDelay,
    isCircuitBreakerOpen,
  };
}
