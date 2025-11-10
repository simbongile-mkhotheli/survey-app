/**
 * Error Boundary Component
 * =======================
 * React error boundary with graceful error handling and recovery options
 */

import { Component } from 'react';
import type { ErrorInfo } from 'react';
import type { ErrorBoundaryProps, ErrorState } from './types';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: LoggingService.logError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI based on error level
      const { level = 'component' } = this.props;
      const { error } = this.state;

      return (
        <div className={`${styles.errorBoundary} ${styles[level]}`}>
          <div className={styles.errorContent}>
            {level === 'critical' ? (
              <div className={styles.criticalError}>
                <h1 className={styles.title}>🚨 Application Error</h1>
                <p className={styles.message}>
                  A critical error has occurred. Please refresh the page or
                  contact support.
                </p>
              </div>
            ) : level === 'page' ? (
              <div className={styles.pageError}>
                <h2 className={styles.title}>⚠️ Page Error</h2>
                <p className={styles.message}>
                  Something went wrong loading this page.
                </p>
              </div>
            ) : (
              <div className={styles.componentError}>
                <h3 className={styles.title}>⚠️ Component Error</h3>
                <p className={styles.message}>
                  This component failed to load properly.
                </p>
              </div>
            )}

            {error && (
              <details className={styles.errorDetails}>
                <summary>Error Details</summary>
                <pre className={styles.errorText}>{error.toString()}</pre>
              </details>
            )}

            <div className={styles.actions}>
              <button
                className={`${styles.button} ${styles.retry}`}
                onClick={this.handleRetry}
                type="button"
              >
                Try Again
              </button>
              {level === 'critical' && (
                <button
                  className={`${styles.button} ${styles.reload}`}
                  onClick={this.handleReload}
                  type="button"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
