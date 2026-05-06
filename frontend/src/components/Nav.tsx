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
      >
        <span className={styles.navIcon}>📋</span>
        <span className={styles.navLabel}>Survey</span>
      </NavLink>

      <NavLink
        to={ROUTES.RESULTS}
        className={({ isActive }) => (isActive ? styles.active : styles.link)}
      >
        <span className={styles.navIcon}>📊</span>
        <span className={styles.navLabel}>Results</span>
      </NavLink>
    </nav>
  );
}
