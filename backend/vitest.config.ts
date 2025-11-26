// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/controllers': path.resolve(__dirname, './src/controllers'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/repositories': path.resolve(__dirname, './src/repositories'),
      '@/interfaces': path.resolve(__dirname, './src/interfaces'),
      '@/middleware': path.resolve(__dirname, './src/middleware'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/errors': path.resolve(__dirname, './src/errors'),
      '@/validation': path.resolve(__dirname, './src/validation'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
