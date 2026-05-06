export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  apiTimeout: 20000,
  appName: import.meta.env.VITE_APP_NAME || 'Survey Application',
} as const;
