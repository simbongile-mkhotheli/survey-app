/// <reference types="vite/client" />

declare module '*.module.css';

// Environment variable types for better TypeScript support
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test';
  readonly VITE_PORT?: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
