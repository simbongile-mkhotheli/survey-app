import { create } from 'zustand';

interface AppState {
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));
