/**
 * RouteErrorBoundary Tests
 * ========================
 * Test suite for route-level error boundaries with recovery strategies
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import React from 'react';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logWithContext: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Test component that throws error
interface ThrowErrorProps {
  shouldThrow?: boolean;
  message?: string;
}

function ThrowError({
  shouldThrow = true,
  message = 'Test error',
}: ThrowErrorProps) {
  if (shouldThrow) {
    throw new Error(message);
  }

  return <div>Success</div>;
}

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render children when no error occurs', () => {
    render(
      <BrowserRouter>
        <RouteErrorBoundary routeName="TestRoute">
          <div>Test content</div>
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render custom fallback UI when provided', () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <BrowserRouter>
        <RouteErrorBoundary fallback={customFallback}>
          <ThrowError />
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('should call onError callback when error is caught', () => {
    const onError = vi.fn();

    render(
      <BrowserRouter>
        <RouteErrorBoundary onError={onError}>
          <ThrowError message="Test error" />
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(onError).toHaveBeenCalled();
    const [error] = onError.mock.calls[0];
    expect(error.message).toBe('Test error');
  });

  it('should render route error boundary component', () => {
    render(
      <BrowserRouter>
        <RouteErrorBoundary level="high" routeName="Test">
          <div>Content</div>
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle custom fallback', () => {
    render(
      <BrowserRouter>
        <RouteErrorBoundary fallback={<div>Error occurred</div>}>
          <ThrowError />
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('should pass error metadata to callbacks', () => {
    const onError = vi.fn();

    render(
      <BrowserRouter>
        <RouteErrorBoundary onError={onError} routeName="TestRoute">
          <ThrowError message="Test error" />
        </RouteErrorBoundary>
      </BrowserRouter>,
    );

    expect(onError).toHaveBeenCalled();
    const [_error, _errorInfo, metadata] = onError.mock.calls[0];
    expect(metadata.route).toBe('TestRoute');
    expect(metadata.severity).toBeDefined();
  });
});
