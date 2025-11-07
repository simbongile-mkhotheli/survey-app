// SQLite test database setup utility
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

/**
 * Creates and initializes a fresh SQLite database for testing
 * Uses raw SQL to create the schema instead of Prisma migrations to avoid complexity
 */
export async function setupTestDatabase(dbPath?: string): Promise<PrismaClient> {
  // Generate unique database path if not provided
  const testDbPath = dbPath || `./test_${Date.now()}_${Math.random().toString(36)}.db`;
  
  // Remove existing database file if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  // Create Prisma client with SQLite database
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: `file:${testDbPath}`
      }
    }
  });
  
  // Connect to database
  await prismaClient.$connect();
  
  // Create the SurveyResponse table directly with raw SQL to match the main schema
  await prismaClient.$executeRaw`
    CREATE TABLE "SurveyResponse" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "contactNumber" TEXT NOT NULL,
      "dateOfBirth" DATETIME NOT NULL,
      "foods" TEXT NOT NULL,
      "ratingMovies" INTEGER NOT NULL,
      "ratingRadio" INTEGER NOT NULL,
      "ratingEatOut" INTEGER NOT NULL,
      "ratingTV" INTEGER NOT NULL,
      "submittedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
    )
  `;
  
  return prismaClient;
}

/**
 * Cleans up test database
 */
export async function cleanupTestDatabase(prismaClient: PrismaClient, dbPath?: string): Promise<void> {
  try {
    // Clear all data first
    await prismaClient.surveyResponse.deleteMany({});
    
    // Disconnect from database
    await prismaClient.$disconnect();
    
    // Small delay to ensure file is released
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Remove the database file if path is provided
    if (dbPath && fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } catch {
    try {
      // Ensure disconnect even if cleanup fails
      await prismaClient.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
    
    // Still try to remove the file
    if (dbPath && fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {
        // Ignore file deletion errors
      }
    }
  }
}