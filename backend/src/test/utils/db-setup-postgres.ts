// PostgreSQL test database utilities
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let testPrismaClient: PrismaClient | null = null;

/**
 * Sets up PostgreSQL test database for integration tests
 * - Connects to existing test database
 * - Cleans all data between tests
 * - Reuses connection for performance
 */
export async function setupTestDatabasePostgres(): Promise<PrismaClient> {
  if (!testPrismaClient) {
    // Use the test DATABASE_URL from .env.test
    testPrismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/survey_app_test?schema=public'
        }
      }
    });
    
    await testPrismaClient.$connect();
  }
  
  return testPrismaClient;
}

/**
 * Cleans all data from test database
 * Truncates tables in correct order to respect foreign keys
 */
export async function cleanTestDatabase(prisma: PrismaClient): Promise<void> {
  // Delete all data from tables in correct order
  await prisma.surveyResponse.deleteMany();
}

/**
 * Disconnects from test database
 * Call this in global teardown
 */
export async function teardownTestDatabase(): Promise<void> {
  if (testPrismaClient) {
    await testPrismaClient.$disconnect();
    testPrismaClient = null;
  }
}

/**
 * Resets the test database schema
 * Only use this when schema changes or in CI/CD
 */
export async function resetTestDatabaseSchema(): Promise<void> {
  try {
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Failed to reset test database schema:', error);
    throw error;
  }
}
