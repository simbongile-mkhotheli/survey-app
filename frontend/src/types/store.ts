/**
 * Store Type Definitions
 * ======================
 * Minimal app-wide store contract for shared cross-cutting state.
 */

// Global error state shared across the app shell
export interface AppStore {
  error: string | null;
  setError: (error: string | null) => void;
}
