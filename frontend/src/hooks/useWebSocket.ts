/**
 * useWebSocket Hook
 * ================
 * Advanced WebSocket connection management with reconnection, heartbeat, and state tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { logWithContext } from '@/utils/logger';
import type {
  WebSocketConfig,
  WebSocketEvent,
  ConnectionState,
  RealtimeStats,
  SurveyNewEvent,
  ResultsUpdateEvent,
} from '@/types/websocket.types';
import {
  DEFAULT_WS_CONFIG,
  calculateBackoffDelay,
  parseWebSocketMessage,
  buildWebSocketUrl,
  initializeMetrics,
  updateMetrics,
  calculateUptimePercentage,
} from '@/utils/websocketUtils';

/**
 * Hook for managing WebSocket connections with auto-reconnect
 */
export function useWebSocket(config?: Partial<WebSocketConfig>) {
  const finalConfig = { ...DEFAULT_WS_CONFIG, ...config };

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<
    Map<string, Set<(event: WebSocketEvent) => void>>
  >(new Map());
  const messageQueueRef = useRef<WebSocketEvent[]>([]);

  const [state, setState] = useState<ConnectionState>({
    status: 'disconnected',
    connected: false,
    reconnectAttempts: 0,
    metrics: initializeMetrics(),
  });

  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    totalResponses: 0,
    responsesInLastMinute: 0,
    responsesInLastHour: 0,
    avgResponseTime: 0,
    lastUpdateAt: Date.now(),
  });

  const [latestSurvey, setLatestSurvey] = useState<SurveyNewEvent | null>(null);

  /**
   * Notify all listeners of an event
   */
  const notifyListeners = useCallback((event: WebSocketEvent) => {
    const eventListeners = listenersRef.current.get(event.type);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logWithContext.error(
            'Error in WebSocket listener',
            error instanceof Error ? error : new Error(String(error)),
            { operation: 'ws_listener_error', eventType: event.type },
          );
        }
      });
    }

    // Also notify listeners on 'all' type
    const allListeners = listenersRef.current.get('all');
    if (allListeners) {
      allListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          logWithContext.error(
            'Error in WebSocket all-events listener',
            error instanceof Error ? error : new Error(String(error)),
            { operation: 'ws_listener_error_all' },
          );
        }
      });
    }
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback(
    (rawData: unknown) => {
      const startTime = performance.now();
      const event = parseWebSocketMessage(rawData);

      if (!event) {
        logWithContext.warn('Invalid WebSocket message received', {
          operation: 'ws_invalid_message',
        });
        return;
      }

      const latency = performance.now() - startTime;

      // Update metrics
      setState((prev) => ({
        ...prev,
        metrics: updateMetrics(prev.metrics, latency),
      }));

      // Handle different event types
      switch (event.type) {
        case 'survey:new': {
          const surveyEvent = event as SurveyNewEvent;
          setLatestSurvey(surveyEvent);
          setRealtimeStats((prev) => ({
            ...prev,
            totalResponses: prev.totalResponses + 1,
            responsesInLastMinute: prev.responsesInLastMinute + 1,
            lastUpdateAt: Date.now(),
          }));
          break;
        }

        case 'results:update': {
          const resultsEvent = event as ResultsUpdateEvent;
          setRealtimeStats((prev) => ({
            ...prev,
            totalResponses: resultsEvent.data.totalCount,
            lastUpdateAt: Date.now(),
          }));
          break;
        }

        case 'connection:ready': {
          logWithContext.info('WebSocket connection ready', {
            operation: 'ws_ready',
          });
          break;
        }

        case 'error': {
          logWithContext.error(
            'WebSocket error received',
            new Error('WebSocket error'),
            {
              operation: 'ws_error',
            },
          );
          break;
        }
      }

      notifyListeners(event);

      logWithContext.debug('WebSocket message processed', {
        operation: 'ws_message_handled',
        eventType: event.type,
        latency: `${latency.toFixed(2)}ms`,
      });
    },
    [notifyListeners],
  );

  /**
   * Send heartbeat to keep connection alive
   */
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }),
        );
      } catch (error) {
        logWithContext.error(
          'Failed to send heartbeat',
          error instanceof Error ? error : new Error(String(error)),
          { operation: 'ws_heartbeat_error' },
        );
      }
    }

    // Schedule next heartbeat
    heartbeatTimeoutRef.current = setTimeout(() => {
      sendHeartbeat();
    }, finalConfig.heartbeatInterval);
  }, [finalConfig.heartbeatInterval]);

  /**
   * Attempt to reconnect with exponential backoff
   */
  const reconnect = useCallback(() => {
    if (state.reconnectAttempts >= finalConfig.reconnectAttempts) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        connected: false,
      }));

      logWithContext.error(
        'WebSocket max reconnection attempts reached',
        new Error('Max reconnect attempts'),
        { operation: 'ws_max_attempts', attempts: state.reconnectAttempts },
      );
      return;
    }

    const delay = calculateBackoffDelay(
      state.reconnectAttempts,
      finalConfig.reconnectDelay,
      finalConfig.maxReconnectDelay,
    );

    setState((prev) => ({
      ...prev,
      status: 'reconnecting',
      reconnectAttempts: prev.reconnectAttempts + 1,
      lastConnectAttempt: Date.now(),
    }));

    logWithContext.info('WebSocket reconnecting', {
      operation: 'ws_reconnect',
      attempt: state.reconnectAttempts + 1,
      delay: `${delay}ms`,
    });

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [
    state.reconnectAttempts,
    finalConfig.reconnectAttempts,
    finalConfig.reconnectDelay,
    finalConfig.maxReconnectDelay,
  ]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'connecting',
    }));

    try {
      const wsUrl = buildWebSocketUrl(finalConfig.url);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setState((prev) => ({
          ...prev,
          status: 'connected',
          connected: true,
          reconnectAttempts: 0,
        }));

        logWithContext.info('WebSocket connected', {
          operation: 'ws_connected',
          url: finalConfig.url,
        });

        // Start heartbeat
        sendHeartbeat();

        // Flush message queue
        const queue = messageQueueRef.current;
        messageQueueRef.current = [];
        queue.forEach((event) => {
          notifyListeners(event);
        });
      };

      wsRef.current.onmessage = (event) => {
        handleMessage(event.data);
      };

      wsRef.current.onerror = () => {
        setState((prev) => ({
          ...prev,
          status: 'error',
          connected: false,
        }));

        logWithContext.error('WebSocket error', new Error('WebSocket error'), {
          operation: 'ws_error_event',
        });
      };

      wsRef.current.onclose = () => {
        setState((prev) => ({
          ...prev,
          status: 'disconnected',
          connected: false,
        }));

        logWithContext.info('WebSocket disconnected', {
          operation: 'ws_disconnected',
        });

        // Attempt reconnect
        reconnect();
      };
    } catch (error) {
      logWithContext.error(
        'Failed to create WebSocket',
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'ws_creation_error', url: finalConfig.url },
      );

      setState((prev) => ({
        ...prev,
        status: 'error',
        connected: false,
      }));

      reconnect();
    }
  }, [
    finalConfig.url,
    sendHeartbeat,
    handleMessage,
    notifyListeners,
    reconnect,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      status: 'disconnected',
      connected: false,
    }));

    logWithContext.info('WebSocket disconnected', {
      operation: 'ws_manual_disconnect',
    });
  }, []);

  /**
   * Subscribe to events
   */
  const subscribe = useCallback(
    (eventType: string, listener: (event: WebSocketEvent) => void) => {
      if (!listenersRef.current.has(eventType)) {
        listenersRef.current.set(eventType, new Set());
      }

      listenersRef.current.get(eventType)!.add(listener);

      // Return unsubscribe function
      return () => {
        const listeners = listenersRef.current.get(eventType);
        if (listeners) {
          listeners.delete(listener);
        }
      };
    },
    [],
  );

  /**
   * Get current uptime percentage
   */
  const getUptimePercentage = useCallback(() => {
    return calculateUptimePercentage(state.metrics);
  }, [state.metrics]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    state,
    realtimeStats,
    latestSurvey,
    connect,
    disconnect,
    subscribe,
    getUptimePercentage,
  };
}

export type UseWebSocket = ReturnType<typeof useWebSocket>;
