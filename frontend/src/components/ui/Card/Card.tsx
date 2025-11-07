/**
 * Card Component
 * =============
 * Consistent card layout with optional header and actions
 */

import type { ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Card title */
  title?: string;
  /** Card description */
  description?: string;
  /** Header actions */
  actions?: ReactNode;
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated';
  /** Custom className */
  className?: string;
}

export function Card({
  children,
  title,
  description,
  actions,
  variant = 'default',
  className = '',
}: CardProps) {
  const cardClasses = [
    styles.card,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || description || actions) && (
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

/**
 * Card Section Component
 * =====================
 * For dividing card content into sections
 */
export interface CardSectionProps {
  children: ReactNode;
  className?: string;
}

export function CardSection({ children, className = '' }: CardSectionProps) {
  return (
    <div className={`${styles.section} ${className}`}>
      {children}
    </div>
  );
}