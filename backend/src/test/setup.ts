// backend/src/test/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { Container } from '@/container';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let container: Container;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize container for testing
  container = Container.getInstance();
});

afterEach(async () => {
  // Clean up after each test
  // Add any cleanup logic here
});

afterAll(async () => {
  // Cleanup container and close connections
  if (container) {
    await container.cleanup();
  }
});