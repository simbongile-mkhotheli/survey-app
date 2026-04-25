/**
 * Modernized Survey Store
 * ======================
 * Minimal Zustand store used for cross-cutting app error state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AppStore } from '@/types/store';

const STORE_NAME = 'survey-app-store';

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: STORE_NAME,
    },
  ),
);
