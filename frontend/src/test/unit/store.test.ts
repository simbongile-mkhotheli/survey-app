/**
 * Survey Store Tests
 * ==================
 * Tests for Zustand store state management
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useSurveyStore';

// Mock the API module
vi.mock('@/services/api', () => ({
  fetchResults: vi.fn(),
}));

describe('Survey Store (useAppStore)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      data: null,
      loading: false,
      error: null,
      hasFetched: false,
      darkMode: false,
      language: 'en',
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = useAppStore.getState();

      expect(state.data).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.hasFetched).toBe(false);
      expect(state.darkMode).toBe(false);
      expect(state.language).toBe('en');
    });
  });

  describe('Settings Actions', () => {
    it('should toggle dark mode', () => {
      useAppStore.setState({ darkMode: false });
      expect(useAppStore.getState().darkMode).toBe(false);

      useAppStore.getState().toggleDarkMode();
      expect(useAppStore.getState().darkMode).toBe(true);

      useAppStore.getState().toggleDarkMode();
      expect(useAppStore.getState().darkMode).toBe(false);
    });

    it('should set language', () => {
      useAppStore.setState({ language: 'en' });
      expect(useAppStore.getState().language).toBe('en');

      useAppStore.getState().setLanguage('af');
      expect(useAppStore.getState().language).toBe('af');

      useAppStore.getState().setLanguage('en');
      expect(useAppStore.getState().language).toBe('en');
    });

    it('should reset settings to defaults', () => {
      // Change settings
      useAppStore.setState({ darkMode: true, language: 'af' });

      expect(useAppStore.getState().darkMode).toBe(true);
      expect(useAppStore.getState().language).toBe('af');

      // Reset
      useAppStore.getState().resetSettings();
      const state = useAppStore.getState();

      expect(state.darkMode).toBe(false);
      expect(state.language).toBe('en');
    });
  });

  describe('Store Methods Exist', () => {
    it('should have all required methods', () => {
      const state = useAppStore.getState();

      expect(typeof state.fetchResults).toBe('function');
      expect(typeof state.setResults).toBe('function');
      expect(typeof state.setLoading).toBe('function');
      expect(typeof state.setError).toBe('function');
      expect(typeof state.reset).toBe('function');
      expect(typeof state.toggleDarkMode).toBe('function');
      expect(typeof state.setLanguage).toBe('function');
      expect(typeof state.resetSettings).toBe('function');
    });
  });

  describe('Store Properties Exist', () => {
    it('should have all required state properties', () => {
      const state = useAppStore.getState();

      expect(state).toHaveProperty('data');
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('hasFetched');
      expect(state).toHaveProperty('darkMode');
      expect(state).toHaveProperty('language');
    });

    it('should handle error state management', () => {
      useAppStore.getState().setError('Test error');
      expect(useAppStore.getState().error).toBe('Test error');

      useAppStore.getState().setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });

    it('should handle loading state management', () => {
      useAppStore.getState().setLoading(true);
      expect(useAppStore.getState().loading).toBe(true);

      useAppStore.getState().setLoading(false);
      expect(useAppStore.getState().loading).toBe(false);
    });

    it('should reset all state to defaults', () => {
      useAppStore.setState({
        error: 'Some error',
        loading: true,
        hasFetched: true,
      });

      useAppStore.getState().reset();
      const state = useAppStore.getState();

      expect(state.data).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.hasFetched).toBe(false);
    });
  });
});
