/**
 * Error Message Component
 * ======================
 * Consistent error display with retry functionality
 */

import type { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Error title */
  title?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry button text */
  retryText?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Error severity */
  severity?: 'error' | 'warning' | 'info';
  /** Custom className */
  className?: string;
  /** Children to render below error message */
  children?: ReactNode;
}

export function ErrorMessage({
  message,
  title = 'Error',
  showRetry = false,
  retryText = 'Try Again',
  onRetry,
  severity = 'error',
  className = '',
  children,
}: ErrorMessageProps) {
  const containerClasses = [
    styles.container,
    styles[severity],
    className,
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (severity) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.icon}>{getIcon()}</span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <p className={styles.message}>{message}</p>
        
        {children}
        
        {showRetry && onRetry && (
          <button 
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Error Component
 * =====================
 * For form field errors and smaller inline messages
 */
export interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  if (!message) return null;
  
  return (
    <div className={`${styles.inlineError} ${className}`}>
      <span className={styles.inlineIcon}>⚠️</span>
      <span className={styles.inlineMessage}>{message}</span>
    </div>
  );
}