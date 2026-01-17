/**
 * Loading Component
 * ================
 * Consistent loading spinner with optional overlay and text
 */

import styles from './Loading.module.css';

export interface LoadingProps {
  /** Loading text to display */
  text?: string;
  /** Full screen overlay */
  overlay?: boolean;
}

export function Loading({
  text = 'Loading...',
  overlay = false,
}: LoadingProps) {
  const containerClasses = [styles.container, overlay && styles.overlay]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        <div className={styles.spinner}>
          <div className={styles.spinnerRing}></div>
        </div>
        {text && <p className={styles.text}>{text}</p>}
      </div>
    </div>
  );
}
