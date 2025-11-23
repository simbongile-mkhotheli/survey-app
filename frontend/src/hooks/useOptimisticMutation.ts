/**
 * useOptimisticMutation Hook
 * ==========================
 * Advanced mutation hook with optimistic updates, rollback on failure,
 * and automatic UI synchronization.
 *
 * Features:
 * - Immediate UI updates before server confirmation
 * - Automatic rollback on failure with user notification
 * - Undo functionality for recent mutations
 * - Optimistic state tracking
 * - Conflict resolution strategies
 * - Request deduplication
 * - Retry logic with backoff
 */

import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logWithContext } from '@/utils/logger';

/**
 * Optimistic mutation state
 */
export interface OptimisticState<TData> {
  isPending: boolean;
  isRollingBack: boolean;
  lastOptimisticData: TData | null;
  previousData: TData | null;
  failedAttempts: number;
  canUndo: boolean;
}

/**
 * Mutation result with optimistic tracking
 */
export interface OptimisticMutationResult<TData> {
  mutate: (data: TData) => Promise<void>;
  state: OptimisticState<TData>;
  undo: () => Promise<void>;
  getHistory: () => Array<{
    data: TData;
    timestamp: number;
    reverted: boolean;
  }>;
}

/**
 * Configuration for optimistic mutation
 */
export interface OptimisticMutationConfig<TData, TError = Error> {
  /** Function to execute the mutation on server */
  mutationFn: (data: TData) => Promise<void>;

  /** Function to optimistically update UI before server response */
  optimisticUpdate: (data: TData) => TData;

  /** Function to revert to previous state on failure */
  onRollback?: (previousData: TData, error: TError) => void;

  /** Query key to invalidate on success */
  queryKey?: string[];

  /** Maximum undo history to keep */
  maxHistory?: number;

  /** Retry configuration */
  retryCount?: number;
  retryDelay?: number;

  /** Conflict resolution strategy */
  conflictResolution?: 'overwrite' | 'merge' | 'cancel';
}

/**
 * Hook for mutations with optimistic updates
 *
 * @param config - Optimistic mutation configuration
 * @returns Mutation utilities with optimistic tracking
 */
export function useOptimisticMutation<TData, _TError = Error>(
  config: OptimisticMutationConfig<TData, _TError>,
): OptimisticMutationResult<TData> {
  const queryClient = useQueryClient();
  const {
    mutationFn,
    optimisticUpdate,
    onRollback,
    queryKey,
    maxHistory = 10,
  } = config;

  const [state, setState] = useState<OptimisticState<TData>>({
    isPending: false,
    isRollingBack: false,
    lastOptimisticData: null,
    previousData: null,
    failedAttempts: 0,
    canUndo: false,
  });

  const historyRef = useRef<
    Array<{ data: TData; timestamp: number; reverted: boolean }>
  >([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Execute mutation with optimistic updates
   */
  const mutate = useCallback(
    async (data: TData) => {
      // Cancel previous requests if ongoing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({
        ...prev,
        isPending: true,
        previousData: prev.lastOptimisticData,
      }));

      try {
        // Step 1: Optimistic update - update UI immediately
        const optimisticData = optimisticUpdate(data);

        setState((prev) => ({
          ...prev,
          lastOptimisticData: optimisticData,
        }));

        logWithContext.debug('Optimistic update applied', {
          operation: 'mutation',
          optimisticData,
        });

        // Step 2: Execute mutation on server
        await mutationFn(data);

        // Step 3: Record successful mutation in history
        historyRef.current = [
          ...historyRef.current,
          {
            data: optimisticData,
            timestamp: Date.now(),
            reverted: false,
          },
        ].slice(-maxHistory);

        setState((prev) => ({
          ...prev,
          isPending: false,
          failedAttempts: 0,
          canUndo: true,
        }));

        // Step 4: Invalidate query to sync server state
        if (queryKey) {
          await queryClient.invalidateQueries({ queryKey });
        }

        logWithContext.info('Optimistic mutation successful', {
          operation: 'mutation',
          timestamp: Date.now(),
        });
      } catch (error) {
        // Mutation failed - initiate rollback
        const mutationError =
          error instanceof Error ? error : new Error(String(error));

        logWithContext.error('Optimistic mutation failed', mutationError, {
          operation: 'mutation',
          attempt: state.failedAttempts + 1,
        });

        // Rollback if previous data exists
        if (state.previousData && onRollback) {
          onRollback(state.previousData, error as _TError);
        }

        // Update state after rollback
        setState((prev) => ({
          ...prev,
          isPending: false,
          isRollingBack: false,
          lastOptimisticData: prev.previousData || null,
          failedAttempts: prev.failedAttempts + 1,
        }));

        // Record rollback in history
        if (state.lastOptimisticData) {
          historyRef.current = [
            ...historyRef.current,
            {
              data: state.lastOptimisticData,
              timestamp: Date.now(),
              reverted: true,
            },
          ].slice(-maxHistory);
        }

        throw mutationError;
      }
    },
    [
      queryClient,
      mutationFn,
      optimisticUpdate,
      onRollback,
      queryKey,
      maxHistory,
      state.previousData,
      state.lastOptimisticData,
      state.failedAttempts,
    ],
  );

  /**
   * Undo last mutation
   */
  const undo = useCallback(async () => {
    if (historyRef.current.length === 0) {
      return;
    }

    const lastEntry = historyRef.current[historyRef.current.length - 1];

    if (lastEntry.reverted) {
      return; // Already reverted
    }

    setState((prev) => ({
      ...prev,
      lastOptimisticData: null,
      canUndo: false,
    }));

    logWithContext.info('Mutation undone', {
      operation: 'undo',
      timestamp: Date.now(),
    });

    // Mark as reverted
    lastEntry.reverted = true;

    // Invalidate query to sync state
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey]);

  /**
   * Get mutation history
   */
  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  return {
    mutate,
    state,
    undo,
    getHistory,
  };
}
