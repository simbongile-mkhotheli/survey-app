import { NavLink } from 'react-router-dom';
import styles from './Nav.module.css';

export const ROUTES = {
  HOME: '/' as const,
  RESULTS: '/results' as const,
} as const;

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <NavLink
        to={ROUTES.HOME}
        end
        className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }
      >
        Fill Out Survey
      </NavLink>

      <NavLink
        to={ROUTES.RESULTS}
        className={({ isActive }) =>
          isActive ? styles.active : styles.link
        }
      >
        View Survey Results
      </NavLink>
    </nav>
  );
}
