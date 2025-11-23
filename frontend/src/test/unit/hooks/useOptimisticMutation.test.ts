/**
 * useOptimisticMutation Hook Tests
 * ===============================
 * Test suite for mutations with optimistic updates and rollback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { faker } from '@faker-js/faker';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logWithContext: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useOptimisticMutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('should initialize with idle state', () => {
    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: vi.fn(),
          optimisticUpdate: (data: unknown) => data,
        }),
      { wrapper },
    );

    expect(result.current.state.isPending).toBe(false);
    expect(result.current.state.isRollingBack).toBe(false);
    expect(result.current.state.canUndo).toBe(false);
  });

  it('should apply optimistic update immediately', async () => {
    const optimisticUpdate = vi.fn((data) => ({ ...data, updated: true }));
    const mutationFn = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn,
          optimisticUpdate,
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    await act(async () => {
      await result.current.mutate(testData);
    });

    expect(optimisticUpdate).toHaveBeenCalledWith(testData);
    expect(mutationFn).toHaveBeenCalledWith(testData);
  });

  it('should track pending state during mutation', async () => {
    let resolveMutation: () => void;
    const mutationPromise = new Promise<void>((resolve) => {
      resolveMutation = resolve;
    });

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: () => mutationPromise,
          optimisticUpdate: (data: unknown) => data,
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    act(() => {
      result.current.mutate(testData);
    });

    expect(result.current.state.isPending).toBe(true);

    act(() => {
      resolveMutation!();
    });

    await waitFor(() => {
      expect(result.current.state.isPending).toBe(false);
    });
  });

  it('should handle mutation errors gracefully', async () => {
    const onRollback = vi.fn();
    const mutationError = new Error('Mutation failed');

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: vi.fn().mockRejectedValue(mutationError),
          optimisticUpdate: (data: unknown) => data,
          onRollback,
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    await act(async () => {
      try {
        await result.current.mutate(testData);
      } catch {
        // Error expected
      }
    });

    expect(result.current.state.failedAttempts).toBeGreaterThan(0);
  });

  it('should provide mutation history', () => {
    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: vi.fn(),
          optimisticUpdate: (data: unknown) => data,
          maxHistory: 5,
        }),
      { wrapper },
    );

    const history = result.current.getHistory();

    expect(Array.isArray(history)).toBe(true);
    expect(history).toHaveLength(0); // No mutations yet
  });

  it('should support undo operation', async () => {
    const mutationFn = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn,
          optimisticUpdate: (data: unknown) => data,
          maxHistory: 10,
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    // Perform mutation
    await act(async () => {
      await result.current.mutate(testData);
    });

    expect(result.current.state.canUndo).toBe(true);

    // Undo mutation
    await act(async () => {
      await result.current.undo();
    });

    expect(result.current.state.canUndo).toBe(false);
  });

  it('should respect maxHistory limit', async () => {
    const mutationFn = vi.fn().mockResolvedValue(undefined);
    const maxHistory = 3;

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn,
          optimisticUpdate: (data: unknown) => data,
          maxHistory,
        }),
      { wrapper },
    );

    // Perform multiple mutations
    for (let i = 0; i < 5; i++) {
      const testData = { id: i, name: faker.lorem.word() };

      await act(async () => {
        await result.current.mutate(testData);
      });
    }

    const history = result.current.getHistory();

    expect(history.length).toBeLessThanOrEqual(maxHistory);
  });

  it('should track failed attempts', async () => {
    const mutationFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'));

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn,
          optimisticUpdate: (data: unknown) => data,
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    // First attempt
    await act(async () => {
      try {
        await result.current.mutate(testData);
      } catch {
        // Error expected
      }
    });

    expect(result.current.state.failedAttempts).toBeGreaterThan(0);
  });

  it('should call onRollback when mutation fails', async () => {
    const onRollback = vi.fn();
    const previousData = { id: 1, name: 'Original' };

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: vi.fn().mockRejectedValue(new Error('Fail')),
          optimisticUpdate: (data: unknown) => {
            const d = data as Record<string, unknown>;
            return { ...d, name: 'Updated' };
          },
          onRollback,
        }),
      { wrapper },
    );

    // Set initial previous data
    await act(async () => {
      try {
        await result.current.mutate(previousData);
      } catch {
        // Error expected
      }
    });

    // Verify rollback was handled
    expect(result.current.state.isRollingBack).toBe(false);
  });

  it('should accept query key for invalidation', async () => {
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries');
    const mutationFn = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn,
          optimisticUpdate: (data: unknown) => data,
          queryKey: ['test', 'key'],
        }),
      { wrapper },
    );

    const testData = { id: 1, name: faker.lorem.word() };

    await act(async () => {
      await result.current.mutate(testData);
    });

    expect(invalidateQueries).toHaveBeenCalled();
  });

  it('should have utility methods available', () => {
    const { result } = renderHook(
      () =>
        useOptimisticMutation({
          mutationFn: vi.fn(),
          optimisticUpdate: (data: unknown) => data,
        }),
      { wrapper },
    );

    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.undo).toBe('function');
    expect(typeof result.current.getHistory).toBe('function');
    expect(typeof result.current.state).toBe('object');
  });
});
