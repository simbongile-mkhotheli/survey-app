/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/services': resolve(__dirname, './src/services'),
      '@/store': resolve(__dirname, './src/store'),
      '@/types': resolve(__dirname, './src/types'),
      '@/validation': resolve(__dirname, './src/validation'),
      '@/shared': resolve(__dirname, './src/shared'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/config': resolve(__dirname, './src/config'),
      'zod/v4/core': resolve(__dirname, '../node_modules/zod/v4/core/index.js'),
    },
  },
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
    proxy: {
      // Proxy /api/* requests to backend (reads from environment)
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
