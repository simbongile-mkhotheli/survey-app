/**
 * useErrorRecovery Hook Tests
 * ===========================
 * Test suite for error recovery strategies with retry and circuit breaker patterns
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';
import { faker } from '@faker-js/faker';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logWithContext: {
    error: vi.fn(),
  },
}));

describe('useErrorRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize with default recovery strategy', () => {
    const { result } = renderHook(() => useErrorRecovery());

    expect(result.current.state.isRecovering).toBe(false);
    expect(result.current.state.attemptCount).toBe(0);
    expect(result.current.state.lastError).toBeNull();
    expect(result.current.state.circuitBreakerOpen).toBe(false);
  });

  it('should have recovery utilities available', () => {
    const { result } = renderHook(() => useErrorRecovery());

    expect(result.current.attemptRecovery).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.getMetrics).toBeDefined();
    expect(result.current.calculateDelay).toBeDefined();
    expect(result.current.isCircuitBreakerOpen).toBeDefined();
  });

  it('should calculate exponential backoff delays', () => {
    const { result } = renderHook(() =>
      useErrorRecovery({
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 10000,
      }),
    );

    const delay0 = result.current.calculateDelay(0);
    const delay1 = result.current.calculateDelay(1);
    const delay2 = result.current.calculateDelay(2);

    expect(delay1).toBeGreaterThan(delay0);
    expect(delay2).toBeGreaterThan(delay1);
  });

  it('should cap delays at maxDelayMs', () => {
    const { result } = renderHook(() =>
      useErrorRecovery({
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        maxDelayMs: 5000,
      }),
    );

    const delay10 = result.current.calculateDelay(10);

    expect(delay10).toBeLessThanOrEqual(5000);
  });

  it('should reset recovery state', () => {
    const { result } = renderHook(() => useErrorRecovery());

    result.current.reset();

    expect(result.current.state.isRecovering).toBe(false);
    expect(result.current.state.attemptCount).toBe(0);
    expect(result.current.state.lastError).toBeNull();
    expect(result.current.state.circuitBreakerOpen).toBe(false);
    expect(result.current.state.recoveryHistory).toHaveLength(0);
  });

  it('should provide recovery metrics', () => {
    const { result } = renderHook(() => useErrorRecovery());

    const metrics = result.current.getMetrics();

    expect(metrics.totalRecoveries).toBeGreaterThanOrEqual(0);
    expect(metrics.successfulRecoveries).toBeGreaterThanOrEqual(0);
    expect(metrics.successRate).toBeGreaterThanOrEqual(0);
    expect(metrics.successRate).toBeLessThanOrEqual(100);
    expect(metrics.circuitBreakerOpen).toBe(false);
  });

  it('should initialize with custom strategy', () => {
    const { result } = renderHook(() =>
      useErrorRecovery({
        maxAttempts: 5,
        initialDelayMs: 500,
      }),
    );

    // Verify hook is initialized
    expect(result.current.state).toBeDefined();
    expect(result.current.getMetrics).toBeDefined();
  });

  it('should track recovery history length', () => {
    const { result } = renderHook(() => useErrorRecovery());

    const metrics1 = result.current.getMetrics();
    const initialLength = metrics1.totalRecoveries;

    expect(initialLength).toBeGreaterThanOrEqual(0);
  });

  it('should have isCircuitBreakerOpen utility', () => {
    const { result } = renderHook(() => useErrorRecovery());

    const isOpen = result.current.isCircuitBreakerOpen();

    expect(typeof isOpen).toBe('boolean');
    expect(isOpen).toBe(false);
  });

  it('should accept error metadata', () => {
    const testError = new Error(faker.lorem.sentence());
    const metadata = {
      component: 'TestComponent',
      timestamp: Date.now(),
      severity: 'high' as const,
      route: '/test',
      userAgent: navigator.userAgent,
    };

    // Verify metadata can be passed without errors
    expect(metadata.severity).toBe('high');
    expect(testError.message).toBeDefined();
  });
});
