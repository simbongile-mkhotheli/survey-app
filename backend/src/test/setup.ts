// backend/src/test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { container } from '@/container';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup connections
  await container.cleanup();
});
