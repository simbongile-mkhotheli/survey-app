/**
 * WebSocket Management Utilities
 * =============================
 * Utilities for WebSocket connection, reconnection, and message handling
 */

import type {
  WebSocketConfig,
  WebSocketEvent,
  ConnectionStatus,
  ConnectionMetrics,
} from '@/types/websocket.types';
import { logWithContext } from '@/utils/logger';

/**
 * Default WebSocket configuration
 */
export const DEFAULT_WS_CONFIG: Required<WebSocketConfig> = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:5000/api/realtime',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  messageTimeout: 5000,
};

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Validate WebSocket event structure
 */
export function isValidWebSocketEvent(data: unknown): data is WebSocketEvent {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const event = data as Record<string, unknown>;
  const { type, data: eventData, timestamp } = event;

  if (typeof type !== 'string' || typeof timestamp !== 'number') {
    return false;
  }

  if (!eventData || typeof eventData !== 'object') {
    return false;
  }

  // Validate specific event types
  switch (type) {
    case 'survey:new':
      return (
        'id' in (eventData as Record<string, unknown>) &&
        'firstName' in (eventData as Record<string, unknown>) &&
        'email' in (eventData as Record<string, unknown>)
      );

    case 'results:update':
      return (
        'totalCount' in (eventData as Record<string, unknown>) &&
        'avgAge' in (eventData as Record<string, unknown>)
      );

    case 'connection:ready':
      return 'connected' in (eventData as Record<string, unknown>);

    case 'error':
      return 'message' in (eventData as Record<string, unknown>);

    default:
      return false;
  }
}

/**
 * Initialize connection metrics
 */
export function initializeMetrics(): ConnectionMetrics {
  return {
    connectTime: Date.now(),
    reconnectAttempts: 0,
    totalUptime: 0,
    averageLatency: 0,
    messagesReceived: 0,
    lastMessageAt: Date.now(),
  };
}

/**
 * Update connection metrics
 */
export function updateMetrics(
  metrics: ConnectionMetrics,
  messageLatency: number,
): ConnectionMetrics {
  const totalLatency =
    metrics.averageLatency * metrics.messagesReceived + messageLatency;
  const newCount = metrics.messagesReceived + 1;

  return {
    ...metrics,
    averageLatency: totalLatency / newCount,
    messagesReceived: newCount,
    lastMessageAt: Date.now(),
  };
}

/**
 * Create WebSocket URL from base URL
 */
export function buildWebSocketUrl(baseUrl: string, token?: string): string {
  try {
    // In test environment or when URL is just a path, build from scratch
    let urlStr = baseUrl;

    // If it doesn't have a protocol, try to build a full URL
    if (
      !urlStr.startsWith('http://') &&
      !urlStr.startsWith('https://') &&
      !urlStr.startsWith('ws://') &&
      !urlStr.startsWith('wss://')
    ) {
      // Assume it's a relative path
      if (typeof window !== 'undefined') {
        urlStr = `${window.location.origin}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      } else {
        // In test/SSR environment, just assume https
        urlStr = `https://localhost:5000${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      }
    }

    const url = new URL(urlStr);

    // Add protocol if missing or convert to ws/wss
    if (!url.protocol.startsWith('ws')) {
      url.protocol = url.protocol.startsWith('https') ? 'wss:' : 'ws:';
    }

    // Add token if provided
    if (token) {
      url.searchParams.set('token', token);
    }

    return url.toString();
  } catch {
    // Fallback: prepend ws:// if parsing fails
    return `ws://${baseUrl}${token ? `?token=${token}` : ''}`;
  }
}

/**
 * Parse WebSocket message
 */
export function parseWebSocketMessage(
  messageData: unknown,
): WebSocketEvent | null {
  try {
    if (typeof messageData === 'string') {
      const parsed = JSON.parse(messageData);
      return isValidWebSocketEvent(parsed) ? parsed : null;
    }

    if (isValidWebSocketEvent(messageData)) {
      return messageData;
    }

    return null;
  } catch (error) {
    logWithContext.error(
      'Failed to parse WebSocket message',
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'parse_ws_message' },
    );
    return null;
  }
}

/**
 * Format connection status for display
 */
export function formatConnectionStatus(status: ConnectionStatus): string {
  const statusMap: Record<ConnectionStatus, string> = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error',
    reconnecting: 'Reconnecting...',
  };

  return statusMap[status];
}

/**
 * Get status color for UI
 */
export function getStatusColor(
  status: ConnectionStatus,
): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'connected':
      return 'success';
    case 'connecting':
    case 'reconnecting':
      return 'info';
    case 'disconnected':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'warning';
  }
}

/**
 * Calculate uptime percentage
 */
export function calculateUptimePercentage(metrics: ConnectionMetrics): number {
  const totalElapsed = Date.now() - metrics.connectTime;
  const downtime = metrics.reconnectAttempts * 1000; // Rough estimate

  if (totalElapsed === 0) return 100;
  return Math.max(0, ((totalElapsed - downtime) / totalElapsed) * 100);
}
