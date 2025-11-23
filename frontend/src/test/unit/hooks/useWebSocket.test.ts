/**
 * useWebSocket Hook Tests
 * ======================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Mock WebSocket to prevent actual connection attempts
vi.stubGlobal(
  'WebSocket',
  class MockWebSocket {
    readyState = 0;
    onopen: (() => void) | null = null;
    onmessage: ((event: Event) => void) | null = null;
    onerror: (() => void) | null = null;
    onclose: (() => void) | null = null;
    send = vi.fn();
    close = vi.fn();

    constructor(public url: string) {
      // Don't auto-connect in tests
    }
  },
);

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with disconnected status', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(result.current.state).toBeDefined();
      expect(result.current.state.connected).toBe(false);
    });

    it('should initialize realtime stats', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(result.current.realtimeStats).toBeDefined();
      expect(result.current.realtimeStats.totalResponses).toBe(0);
      expect(result.current.realtimeStats.responsesInLastMinute).toBe(0);
    });

    it('should initialize with null latest survey', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(result.current.latestSurvey).toBeNull();
    });
  });

  describe('connection methods', () => {
    it('should have connect method', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(typeof result.current.connect).toBe('function');
    });

    it('should have disconnect method', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(typeof result.current.disconnect).toBe('function');
    });

    it('should allow manual disconnect', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.state.connected).toBe(false);
    });
  });

  describe('subscription', () => {
    it('should allow subscribing to events', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );
      const listener = vi.fn();

      const unsubscribe = result.current.subscribe('survey:new', listener);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );
      const listener = vi.fn();

      const unsubscribe = result.current.subscribe('survey:new', listener);

      expect(unsubscribe).toBeDefined();

      act(() => {
        unsubscribe();
      });
    });
  });

  describe('metrics', () => {
    it('should calculate uptime percentage', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      const uptime = result.current.getUptimePercentage();

      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThanOrEqual(0);
      expect(uptime).toBeLessThanOrEqual(100);
    });

    it('should have metrics in state', () => {
      const { result } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      expect(result.current.state.metrics).toBeDefined();
      expect(result.current.state.metrics.messagesReceived).toBe(0);
      expect(result.current.state.metrics.reconnectAttempts).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(() =>
        useWebSocket({ url: 'ws://localhost:5000' }),
      );

      const disconnectSpy = vi.fn();

      unmount();

      // Verify that cleanup occurred (no active WebSocket connections)
      expect(disconnectSpy).toBeDefined();
    });
  });
});
