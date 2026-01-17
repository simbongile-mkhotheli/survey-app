/**
 * Error Message Component
 * ======================
 * Consistent error display with optional retry functionality
 */

import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Error title */
  title?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
  /** Error severity */
  severity?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({
  message,
  title = 'Error',
  showRetry = false,
  onRetry,
  severity = 'error',
}: ErrorMessageProps) {
  const containerClasses = [styles.container, styles[severity]]
    .filter(Boolean)
    .join(' ');

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

        {showRetry && onRetry && (
          <button
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            Try Again
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
  id?: string;
}

export function InlineError({ message, id }: InlineErrorProps) {
  if (!message) return null;

  return (
    <div className={styles.inlineError} id={id} role="alert" aria-live="polite">
      <span className={styles.inlineIcon} aria-hidden="true">
        ⚠️
      </span>
      <span className={styles.inlineMessage}>{message}</span>
    </div>
  );
}
