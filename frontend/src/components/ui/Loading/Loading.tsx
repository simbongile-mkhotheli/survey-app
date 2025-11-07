/**
 * Loading Component
 * ================
 * Consistent loading indicators across the application
 */

import type { ReactNode } from 'react';
import styles from './Loading.module.css';

export interface LoadingProps {
  /** Loading text to display */
  text?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Display mode */
  variant?: 'spinner' | 'dots' | 'pulse';
  /** Full screen overlay */
  overlay?: boolean;
  /** Custom className */
  className?: string;
  /** Children to render below loading indicator */
  children?: ReactNode;
}

export function Loading({
  text = 'Loading...',
  size = 'md',
  variant = 'spinner',
  overlay = false,
  className = '',
  children,
}: LoadingProps) {
  const containerClasses = [
    styles.container,
    styles[size],
    overlay && styles.overlay,
    className,
  ].filter(Boolean).join(' ');

  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        );
      case 'pulse':
        return <div className={styles.pulse}></div>;
      default:
        return (
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
          </div>
        );
    }
  };

  return (
    <div className={containerClasses}>
      <div className={styles.content}>
        {renderIndicator()}
        {text && <p className={styles.text}>{text}</p>}
        {children}
      </div>
    </div>
  );
}