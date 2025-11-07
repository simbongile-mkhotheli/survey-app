/**
 * Store Type Definitions
 * ====================
 * Central type definitions for Zustand stores with enterprise patterns
 */

import type { ResultsData } from '../services/api';

// Base interfaces for consistent async state patterns
export interface BaseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Survey Results Store
export interface SurveyResultsStore extends BaseAsyncState<ResultsData> {
  fetchResults: () => Promise<void>;
  setResults: (data: ResultsData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// App Settings Store
export interface AppSettingsStore {
  darkMode: boolean;
  language: 'en' | 'af';
  toggleDarkMode: () => void;
  setLanguage: (language: 'en' | 'af') => void;
  resetSettings: () => void;
}

// Combined App Store (if we want a single store later)
export interface AppStore extends SurveyResultsStore, AppSettingsStore {}