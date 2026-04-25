/**
 * App Store Tests
 * ===============
 * Tests for the minimal Zustand store used for shared error state.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/store/useSurveyStore';

describe('App Store (useAppStore)', () => {
  beforeEach(() => {
    useAppStore.setState({
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = useAppStore.getState();

      expect(state.error).toBeNull();
      expect(typeof state.setError).toBe('function');
    });
  });

  describe('Error State Management', () => {
    it('should set and clear error messages', () => {
      useAppStore.getState().setError('Test error');
      expect(useAppStore.getState().error).toBe('Test error');

      useAppStore.getState().setError(null);
      expect(useAppStore.getState().error).toBeNull();
    });
  });

  describe('Store Properties Exist', () => {
    it('should only expose the expected state properties', () => {
      const state = useAppStore.getState();

      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('setError');
      expect(Object.keys(state).sort()).toEqual(['error', 'setError']);
    });
  });
});
