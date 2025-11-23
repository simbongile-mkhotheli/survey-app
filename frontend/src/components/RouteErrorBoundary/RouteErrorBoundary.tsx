/**
 * Route Error Boundary Component
 * ==============================
 * Specialized error boundary for route-level errors with recovery strategies,
 * retry logic, and fallback navigation.
 *
 * Features:
 * - Route isolation: Errors in one route don't crash entire app
 * - Smart retry: Exponential backoff with configurable attempts
 * - Fallback navigation: Redirect to safe routes on critical errors
 * - Error analytics: Track error patterns and severity
 * - Development debugging: Enhanced error details in dev mode
 * - State recovery: Attempt to recover component state
 */

import { Component } from 'react';
import type { ErrorInfo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RouteErrorBoundaryProps, RouteErrorState } from './types';
import type { ErrorMetadata } from '@/types/async.types';
import { logWithContext } from '@/utils/logger';
import styles from './RouteErrorBoundary.module.css';

class RouteErrorBoundaryImpl extends Component<
  RouteErrorBoundaryProps,
  RouteErrorState
> {
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private retryTimeoutId: number | null = null;

  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries ?? 3;
    this.retryDelayMs = props.retryDelayMs ?? 1000;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRecovering: false,
      lastRecoveredAt: null,
      recoveryAttempts: 0,
      errorMetadata: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorState> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const metadata: ErrorMetadata = {
      component: errorInfo.componentStack || undefined,
      timestamp: Date.now(),
      severity: this.determineSeverity(error),
      route: this.props.routeName,
      userAgent: navigator.userAgent,
    };

    this.setState({
      error,
      errorInfo,
      errorMetadata: metadata,
    });

    // Log error with context for analytics
    logWithContext.error('RouteErrorBoundary caught error', error, metadata);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo, metadata);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private determineSeverity = (
    error: Error,
  ): 'low' | 'medium' | 'high' | 'critical' => {
    if (
      error.message.includes('network') ||
      error.message.includes('timeout')
    ) {
      return 'medium';
    }

    if (
      error.message.includes('permission') ||
      error.message.includes('unauthorized')
    ) {
      return 'high';
    }

    if (error.message.includes('fatal') || error.message.includes('crash')) {
      return 'critical';
    }

    return 'low';
  };

  private calculateRetryDelay = (attemptNumber: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    return this.retryDelayMs * Math.pow(2, attemptNumber);
  };

  handleRetry = () => {
    const { error, recoveryAttempts } = this.state;

    if (recoveryAttempts >= this.maxRetries) {
      logWithContext.error('Maximum retry attempts reached', error!, {
        recoveryAttempts,
        maxRetries: this.maxRetries,
      });
      return;
    }

    const nextAttempt = recoveryAttempts + 1;
    const delay = this.calculateRetryDelay(recoveryAttempts);

    this.setState({
      isRecovering: true,
      recoveryAttempts: nextAttempt,
    });

    // Clear previous retry timeout if exists
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
    }

    // Retry with exponential backoff
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
        lastRecoveredAt: Date.now(),
      });
      this.retryTimeoutId = null;
    }, delay);
  };

  handleNavigateToSafe = (route: string) => {
    if (this.props.onNavigate) {
      this.props.onNavigate(route);
    }
  };

  handleReportError = () => {
    const { error, errorMetadata } = this.state;

    if (this.props.onReportError && error) {
      this.props.onReportError(error, errorMetadata);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isRecovering, recoveryAttempts, errorMetadata } =
        this.state;
      const severity = errorMetadata?.severity || 'low';

      return (
        <div className={`${styles.routeErrorBoundary} ${styles[severity]}`}>
          <div className={styles.errorContainer}>
            {severity === 'critical' ? (
              <div className={styles.criticalSection}>
                <div className={styles.icon}>🚨</div>
                <h1 className={styles.title}>Critical Error</h1>
                <p className={styles.description}>
                  A critical error occurred. We're working on recovery.
                </p>
              </div>
            ) : severity === 'high' ? (
              <div className={styles.highSection}>
                <div className={styles.icon}>⚠️</div>
                <h1 className={styles.title}>
                  Error Loading {this.props.routeName || 'Page'}
                </h1>
                <p className={styles.description}>
                  Something went wrong. Please try again or contact support.
                </p>
              </div>
            ) : (
              <div className={styles.lowSection}>
                <div className={styles.icon}>ℹ️</div>
                <h1 className={styles.title}>Temporary Issue</h1>
                <p className={styles.description}>
                  We encountered a temporary issue. Let's try again.
                </p>
              </div>
            )}

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Dev Only)</summary>
                <div className={styles.detailsContent}>
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                  <p>
                    <strong>Stack:</strong>
                  </p>
                  <pre className={styles.stack}>{error.stack}</pre>
                  {errorMetadata?.component && (
                    <>
                      <p>
                        <strong>Component Stack:</strong>
                      </p>
                      <pre className={styles.componentStack}>
                        {errorMetadata.component}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Recovery Status */}
            {isRecovering && (
              <div className={styles.recoveryStatus}>
                <div className={styles.spinner} />
                <p>
                  Recovering... (Attempt {recoveryAttempts}/{this.maxRetries})
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {!isRecovering && (
              <div className={styles.actions}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  onClick={this.handleRetry}
                  disabled={recoveryAttempts >= this.maxRetries}
                  type="button"
                >
                  {recoveryAttempts >= this.maxRetries
                    ? 'Maximum attempts reached'
                    : `Retry (${recoveryAttempts}/${this.maxRetries})`}
                </button>

                {severity !== 'critical' && (
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => this.handleNavigateToSafe('/')}
                    type="button"
                  >
                    Go to Home
                  </button>
                )}

                {severity === 'critical' && (
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => window.location.reload()}
                    type="button"
                  >
                    Reload Page
                  </button>
                )}

                {import.meta.env.DEV && (
                  <button
                    className={`${styles.button} ${styles.tertiary}`}
                    onClick={this.handleReportError}
                    type="button"
                  >
                    Report Error
                  </button>
                )}
              </div>
            )}

            {/* Helper Text */}
            <p className={styles.helperText}>
              {recoveryAttempts >= this.maxRetries
                ? 'Unable to recover. Please refresh the page or contact support.'
                : 'If this persists, please refresh your browser.'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use React Router hooks within RouteErrorBoundary
export function RouteErrorBoundary(
  props: Omit<RouteErrorBoundaryProps, 'onNavigate'>,
) {
  const navigate = useNavigate();

  return (
    <RouteErrorBoundaryImpl
      {...props}
      onNavigate={(route: string) => navigate(route)}
    />
  );
}
