/**
 * Test Setup
 * ==========
 * Setup file for testing environment
 */

import '@testing-library/jest-dom';

// Mock environment variables for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    protocol: 'http:',
    port: '3000',
  },
  writable: true,
});

// Mock import.meta.env for Vite
const env = {
  VITE_API_URL: 'http://localhost:5000',
  VITE_APP_NAME: 'Survey App',
  VITE_NODE_ENV: 'test',
  MODE: 'test',
  DEV: false,
  PROD: false,
  SSR: false,
};

Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env,
    },
  },
  writable: true,
});