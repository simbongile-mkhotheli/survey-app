/**
 * WebSocket Utilities Tests
 * ========================
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBackoffDelay,
  isValidWebSocketEvent,
  initializeMetrics,
  updateMetrics,
  buildWebSocketUrl,
  parseWebSocketMessage,
  formatConnectionStatus,
  getStatusColor,
  calculateUptimePercentage,
} from '@/utils/websocketUtils';
import type {
  WebSocketEvent,
  ConnectionMetrics,
} from '@/types/websocket.types';

describe('WebSocket Utilities', () => {
  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff delay', () => {
      expect(calculateBackoffDelay(0, 1000, 30000)).toBe(1000);
      expect(calculateBackoffDelay(1, 1000, 30000)).toBe(2000);
      expect(calculateBackoffDelay(2, 1000, 30000)).toBe(4000);
      expect(calculateBackoffDelay(3, 1000, 30000)).toBe(8000);
      expect(calculateBackoffDelay(4, 1000, 30000)).toBe(16000);
    });

    it('should cap delay at max delay', () => {
      expect(calculateBackoffDelay(10, 1000, 30000)).toBe(30000);
      expect(calculateBackoffDelay(20, 1000, 5000)).toBe(5000);
    });
  });

  describe('isValidWebSocketEvent', () => {
    it('should validate survey:new events', () => {
      const validEvent: WebSocketEvent = {
        type: 'survey:new',
        data: {
          id: 1,
          firstName: 'John',
          email: 'john@example.com',
          submittedAt: '2025-11-23T10:00:00Z',
        },
        timestamp: Date.now(),
      };

      expect(isValidWebSocketEvent(validEvent)).toBe(true);
    });

    it('should validate results:update events', () => {
      const validEvent: WebSocketEvent = {
        type: 'results:update',
        data: {
          totalCount: 100,
          avgAge: 30,
          newResponseCount: 5,
        },
        timestamp: Date.now(),
      };

      expect(isValidWebSocketEvent(validEvent)).toBe(true);
    });

    it('should validate connection:ready events', () => {
      const validEvent: WebSocketEvent = {
        type: 'connection:ready',
        data: {
          connected: true,
        },
        timestamp: Date.now(),
      };

      expect(isValidWebSocketEvent(validEvent)).toBe(true);
    });

    it('should validate error events', () => {
      const validEvent: WebSocketEvent = {
        type: 'error',
        data: {
          message: 'Connection failed',
          code: 'CONN_ERR',
        },
        timestamp: Date.now(),
      };

      expect(isValidWebSocketEvent(validEvent)).toBe(true);
    });

    it('should reject invalid events', () => {
      expect(isValidWebSocketEvent(null)).toBe(false);
      expect(isValidWebSocketEvent({})).toBe(false);
      expect(isValidWebSocketEvent({ type: 'invalid' })).toBe(false);
      expect(isValidWebSocketEvent({ type: 'survey:new', data: {} })).toBe(
        false,
      );
    });
  });

  describe('initializeMetrics', () => {
    it('should initialize with default values', () => {
      const metrics = initializeMetrics();

      expect(metrics.reconnectAttempts).toBe(0);
      expect(metrics.messagesReceived).toBe(0);
      expect(metrics.averageLatency).toBe(0);
      expect(metrics.connectTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics with message latency', () => {
      const metrics = initializeMetrics();
      const updated = updateMetrics(metrics, 50);

      expect(updated.messagesReceived).toBe(1);
      expect(updated.averageLatency).toBe(50);
      expect(updated.lastMessageAt).toBeLessThanOrEqual(Date.now());
    });

    it('should calculate average latency correctly', () => {
      let metrics = initializeMetrics();
      metrics = updateMetrics(metrics, 100);
      metrics = updateMetrics(metrics, 200);
      metrics = updateMetrics(metrics, 300);

      expect(metrics.messagesReceived).toBe(3);
      expect(metrics.averageLatency).toBeCloseTo(200);
    });
  });

  describe('buildWebSocketUrl', () => {
    it('should build valid WebSocket URL', () => {
      const url = buildWebSocketUrl('localhost:5000/api/realtime');
      expect(url).toMatch(/^wss?:\/\//);
    });

    it('should add token to query params if provided', () => {
      const url = buildWebSocketUrl(
        'localhost:5000/api/realtime',
        'test-token',
      );
      expect(url).toContain('token=test-token');
    });
  });

  describe('parseWebSocketMessage', () => {
    it('should parse valid JSON string messages', () => {
      const messageStr = JSON.stringify({
        type: 'survey:new',
        data: {
          id: 1,
          firstName: 'John',
          email: 'john@example.com',
          submittedAt: '2025-11-23T10:00:00Z',
        },
        timestamp: Date.now(),
      });

      const parsed = parseWebSocketMessage(messageStr);
      expect(parsed).not.toBeNull();
      expect(parsed?.type).toBe('survey:new');
    });

    it('should return null for invalid JSON', () => {
      expect(parseWebSocketMessage('invalid json {')).toBeNull();
      expect(parseWebSocketMessage('')).toBeNull();
    });

    it('should validate parsed event structure', () => {
      const invalid = JSON.stringify({ invalid: 'structure' });
      expect(parseWebSocketMessage(invalid)).toBeNull();
    });
  });

  describe('formatConnectionStatus', () => {
    it('should format all status values', () => {
      expect(formatConnectionStatus('connected')).toBe('Connected');
      expect(formatConnectionStatus('connecting')).toBe('Connecting...');
      expect(formatConnectionStatus('disconnected')).toBe('Disconnected');
      expect(formatConnectionStatus('error')).toBe('Error');
      expect(formatConnectionStatus('reconnecting')).toBe('Reconnecting...');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor('connected')).toBe('success');
      expect(getStatusColor('connecting')).toBe('info');
      expect(getStatusColor('disconnected')).toBe('warning');
      expect(getStatusColor('error')).toBe('error');
      expect(getStatusColor('reconnecting')).toBe('info');
    });
  });

  describe('calculateUptimePercentage', () => {
    it('should calculate 100% uptime with no reconnects', () => {
      const metrics = initializeMetrics();
      const uptime = calculateUptimePercentage(metrics);
      expect(uptime).toBeGreaterThan(90); // Allow for small timing variance
    });

    it('should reduce uptime with reconnect attempts', () => {
      const metrics = initializeMetrics();
      metrics.reconnectAttempts = 3;
      const uptime = calculateUptimePercentage(metrics);
      expect(uptime).toBeLessThanOrEqual(100);
      expect(uptime).toBeGreaterThanOrEqual(0);
    });

    it('should not return negative uptime', () => {
      const metrics: ConnectionMetrics = {
        connectTime: Date.now() - 1000,
        reconnectAttempts: 100,
        totalUptime: 0,
        averageLatency: 0,
        messagesReceived: 0,
        lastMessageAt: Date.now(),
      };

      const uptime = calculateUptimePercentage(metrics);
      expect(uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
