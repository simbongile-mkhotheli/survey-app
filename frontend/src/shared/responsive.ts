/**
 * Responsive Design Tokens
 * Define breakpoints, spacing scales, and CSS custom properties for consistent responsive design.
 * Follow mobile-first approach: base styles for mobile, then breakpoints up.
 */

import { useEffect, useState } from 'react';

export const BREAKPOINTS = {
  xs: 320, // Extra small (phones)
  sm: 480, // Small (phones landscape)
  md: 768, // Medium (tablets)
  lg: 1024, // Large (tablets landscape / small laptops)
  xl: 1440, // Extra large (desktops)
  xxl: 1920, // Ultra-wide (4K monitors)
} as const;

export const MEDIA_QUERIES = {
  xs: `@media (min-width: ${BREAKPOINTS.xs}px)`,
  sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
  xxl: `@media (min-width: ${BREAKPOINTS.xxl}px)`,

  // Mobile-first: hide/show at breakpoints
  smDown: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
  mdDown: `@media (max-width: ${BREAKPOINTS.md - 1}px)`,
  lgDown: `@media (max-width: ${BREAKPOINTS.lg - 1}px)`,
  xlDown: `@media (max-width: ${BREAKPOINTS.xl - 1}px)`,
} as const;

/**
 * CSS Custom Properties for responsive design
 * Add to root in global CSS or apply via layout wrapper
 */
export function getResponsiveCSSVars(): string {
  return `
  :root {
    /* Breakpoints (px) */
    --breakpoint-xs: ${BREAKPOINTS.xs}px;
    --breakpoint-sm: ${BREAKPOINTS.sm}px;
    --breakpoint-md: ${BREAKPOINTS.md}px;
    --breakpoint-lg: ${BREAKPOINTS.lg}px;
    --breakpoint-xl: ${BREAKPOINTS.xl}px;
    --breakpoint-xxl: ${BREAKPOINTS.xxl}px;

    /* Spacing Scale (rem, 16px base) */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;

    /* Font Sizes (fluid typography) */
    --font-xs: clamp(0.75rem, 1vw, 0.875rem);
    --font-sm: clamp(0.875rem, 1.2vw, 1rem);
    --font-base: clamp(1rem, 1.5vw, 1.125rem);
    --font-lg: clamp(1.125rem, 2vw, 1.5rem);
    --font-xl: clamp(1.5rem, 2.5vw, 2rem);
    --font-2xl: clamp(1.875rem, 3vw, 2.5rem);

    /* Container Query */
    --container-max-width: 1200px;
    --container-padding: var(--spacing-md);

    /* Z-index stack */
    --z-negative: -1;
    --z-base: 0;
    --z-dropdown: 100;
    --z-modal: 1000;
    --z-toast: 2000;
    --z-tooltip: 3000;
  }

  @media (min-width: ${BREAKPOINTS.md}px) {
    :root {
      --container-padding: var(--spacing-lg);
    }
  }

  @media (min-width: ${BREAKPOINTS.lg}px) {
    :root {
      --container-padding: var(--spacing-xl);
    }
  }
  `;
}

/**
 * Hook to check if viewport matches a breakpoint (client-side only)
 * Usage: const isMobile = useMediaQuery(BREAKPOINTS.md);
 * Avoid excessive re-renders: memoize or use outside animations
 */
export function useMediaQuery(minWidth: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      return;
    }

    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);

    // Set initial value
    setMatches(mq.matches);

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [minWidth]);

  return matches;
}

export type Breakpoint = keyof typeof BREAKPOINTS;

export const GRID_COLUMNS = {
  mobile: 1, // 1 column on mobile
  tablet: 2, // 2 columns on tablet
  desktop: 3, // 3+ columns on desktop
} as const;

export const CONTAINER_SIZES = {
  sm: '32rem', // 512px
  md: '48rem', // 768px
  lg: '64rem', // 1024px
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
} as const;
