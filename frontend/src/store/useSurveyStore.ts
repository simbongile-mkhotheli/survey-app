import { create } from 'zustand';
import type { ResultsData } from '../services/api';

export type SurveyResults = ResultsData;

interface SurveyState {
  results: SurveyResults | null;
  setResults: (r: SurveyResults | null) => void;  // now accepts null
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  // initial state
  results: null,
  darkMode: false,

  // actions
  setResults: (r) => set({ results: r }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
