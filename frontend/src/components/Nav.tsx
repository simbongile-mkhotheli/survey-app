import { NavLink } from 'react-router-dom';
import { ChartIcon, ClipboardIcon } from '@/components/icons';
import styles from './Nav.module.css';

export const ROUTES = {
  HOME: '/' as const,
  RESULTS: '/results' as const,
} as const;

function FeedbackIllustration() {
  return (
    <div className={styles.footerIllustration} aria-hidden="true">
      <div className={styles.footerIllustrationCard}>
        <ClipboardIcon className={styles.footerIllustrationIcon} />
      </div>
      <div className={styles.footerIllustrationBadge}>
        <span className={styles.footerIllustrationCheck}>✓</span>
      </div>
    </div>
  );
}

export default function Nav() {
  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brandRow}>
        <div className={styles.brandIcon} aria-hidden="true">
          <ClipboardIcon className={styles.brandSvg} />
        </div>
        <span className={styles.brandText}>PulseCheck</span>
      </div>

      <div className={styles.menu}>
        <NavLink
          to={ROUTES.HOME}
          end
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.itemIcon}>
            <ClipboardIcon className={styles.iconSvg} />
          </span>
          <span className={styles.itemCopy}>
            <span className={styles.itemTitle}>Survey</span>
            <span className={styles.itemSubtitle}>Share your voice</span>
          </span>
        </NavLink>

        <NavLink
          to={ROUTES.RESULTS}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.itemIcon}>
            <ChartIcon className={styles.iconSvg} />
          </span>
          <span className={styles.itemCopy}>
            <span className={styles.itemTitle}>Results</span>
            <span className={styles.itemSubtitle}>Real-time insights</span>
          </span>
        </NavLink>
      </div>

      <div className={styles.footerCard}>
        <FeedbackIllustration />
        <div className={styles.footerTextBlock}>
          <h2 className={styles.footerTitle}>You're making an impact</h2>
          <p className={styles.footerText}>Every response shapes the future.</p>
        </div>
      </div>
    </nav>
  );
}
