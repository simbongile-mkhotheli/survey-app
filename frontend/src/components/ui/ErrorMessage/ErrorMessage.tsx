import type { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  message: string;
  title?: string;
  showRetry?: boolean;
  retryText?: string;
  onRetry?: () => void;
  onClose?: () => void;
  severity?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  children?: ReactNode;
}

export function ErrorMessage({
  message,
  title = 'Notice',
  showRetry = false,
  retryText = 'Try Again',
  onRetry,
  onClose,
  severity = 'error',
  className = '',
  children,
}: ErrorMessageProps) {
  const containerClasses = [styles.container, styles[severity], className]
    .filter(Boolean)
    .join(' ');
  const icon =
    severity === 'warning'
      ? '!'
      : severity === 'info'
        ? 'i'
        : severity === 'success'
          ? 'ok'
          : 'x';
  const liveRole =
    severity === 'error' || severity === 'warning' ? 'alert' : 'status';

  return (
    <div className={containerClasses} role={liveRole} aria-live="polite">
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <h3 className={styles.title}>{title}</h3>
        </div>

        <p className={styles.message}>{message}</p>

        {children}

        <div className={styles.actions}>
          {showRetry && onRetry && (
            <button
              className={styles.retryButton}
              onClick={onRetry}
              type="button"
            >
              {retryText}
            </button>
          )}

          {onClose && (
            <button
              className={`${styles.retryButton} ${styles.secondary}`}
              onClick={onClose}
              type="button"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface InlineErrorProps {
  message: string;
  className?: string;
  id?: string;
}

export function InlineError({ message, className = '', id }: InlineErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`${styles.inlineError} ${className}`}
      id={id}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.inlineIcon} aria-hidden="true">
        !
      </span>
      <span className={styles.inlineMessage}>{message}</span>
    </div>
  );
}
