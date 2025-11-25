/**
 * Navigation Component
 *
 * Main navigation bar for survey application.
 * - Responsive design for mobile, tablet, and desktop
 * - Active route indicator
 * - Accessible NavLinks with proper ARIA labels
 * - Keyboard navigation support via React Router
 */

import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';

export const ROUTES = {
  HOME: '/' as const,
  RESULTS: '/results' as const,
} as const;

export default function Nav() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <NavLink
        to={ROUTES.HOME}
        end
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
        aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
      >
        <span className={styles.navIcon}>📋</span>
        <span className={styles.navLabel}>Survey</span>
      </NavLink>

      <NavLink
        to={ROUTES.RESULTS}
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
        aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
      >
        <span className={styles.navIcon}>📊</span>
        <span className={styles.navLabel}>Results</span>
      </NavLink>
    </nav>
  );
}
