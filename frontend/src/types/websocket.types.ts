/**
 * WebSocket Real-Time Types
 * =========================
 * Type definitions for WebSocket connection management and real-time updates
 */

/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | 'survey:new'
  | 'results:update'
  | 'connection:ready'
  | 'error';

/**
 * WebSocket connection status
 */
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'reconnecting';

/**
 * Real-time survey response event
 */
export interface SurveyNewEvent {
  type: 'survey:new';
  data: {
    id: number;
    firstName: string;
    email: string;
    submittedAt: string;
  };
  timestamp: number;
}

/**
 * Real-time results update event
 */
export interface ResultsUpdateEvent {
  type: 'results:update';
  data: {
    totalCount: number;
    avgAge: number;
    newResponseCount: number;
  };
  timestamp: number;
}

/**
 * Connection ready event
 */
export interface ConnectionReadyEvent {
  type: 'connection:ready';
  data: {
    connected: boolean;
  };
  timestamp: number;
}

/**
 * Error event
 */
export interface ErrorEvent {
  type: 'error';
  data: {
    message: string;
    code?: string;
  };
  timestamp: number;
}

/**
 * Union of all WebSocket events
 */
export type WebSocketEvent =
  | SurveyNewEvent
  | ResultsUpdateEvent
  | ConnectionReadyEvent
  | ErrorEvent;

/**
 * WebSocket connection configuration
 */
export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

/**
 * Real-time statistics snapshot
 */
export interface RealtimeStats {
  totalResponses: number;
  responsesInLastMinute: number;
  responsesInLastHour: number;
  avgResponseTime: number;
  lastUpdateAt: number;
}

/**
 * Connection metrics
 */
export interface ConnectionMetrics {
  connectTime: number;
  reconnectAttempts: number;
  totalUptime: number;
  averageLatency: number;
  messagesReceived: number;
  lastMessageAt: number;
}

/**
 * Listener function for WebSocket events
 */
export type WebSocketListener = (event: WebSocketEvent) => void;

/**
 * Connection state
 */
export interface ConnectionState {
  status: ConnectionStatus;
  connected: boolean;
  lastConnectAttempt?: number;
  reconnectAttempts: number;
  metrics: ConnectionMetrics;
}
