/**
 * Modernized Survey Store
 * ======================
 * Enterprise-grade Zustand store with devtools, persistence, and TypeScript best practices
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { devtools, persist } from 'zustand/middleware';
import { fetchResults as fetchResultsAPI } from '../services/api';
import type { AppStore } from '../types/store';

// Settings persistence configuration
const SETTINGS_STORAGE_KEY = 'survey-app-settings';

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Survey Results State
        data: null,
        loading: false,
        error: null,
        hasFetched: false,

        // App Settings State
        darkMode: false,
        language: 'en',

        // Survey Results Actions
        fetchResults: async () => {
          const state = get();
          // Prevent multiple concurrent requests
          if (state.loading) return;

          set({ loading: true, error: null, hasFetched: true });

          try {
            const results = await fetchResultsAPI();
            set({ data: results, loading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch survey results';

            set({ error: errorMessage, loading: false });
          }
        },

        setResults: (data) => set({ data, error: null }),

        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error, loading: false }),

        reset: () =>
          set({ data: null, loading: false, error: null, hasFetched: false }),

        // App Settings Actions
        toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

        setLanguage: (language) => set({ language }),

        resetSettings: () => set({ darkMode: false, language: 'en' }),
      }),
      {
        name: SETTINGS_STORAGE_KEY,
        // Only persist settings, not survey data
        partialize: (state: AppStore) => ({
          darkMode: state.darkMode,
          language: state.language,
        }),
      },
    ),
    {
      name: 'survey-app-store',
    },
  ),
);

// Selectors for better performance
export const useResults = () =>
  useAppStore(
    useShallow((state) => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      hasFetched: state.hasFetched,
      fetchResults: state.fetchResults,
      setResults: state.setResults,
      reset: state.reset,
    })),
  );

export const useSettings = () =>
  useAppStore((state) => ({
    darkMode: state.darkMode,
    language: state.language,
    toggleDarkMode: state.toggleDarkMode,
    setLanguage: state.setLanguage,
    resetSettings: state.resetSettings,
  }));

// Legacy export for backward compatibility
export const useSurveyStore = useAppStore;
