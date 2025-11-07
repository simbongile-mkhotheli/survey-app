// backend/src/test/unit/repositories/results.repository.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ResultsRepository } from '@/repositories/results.repository';
import { setupTestDatabase, cleanupTestDatabase } from '@/test/utils/db-setup';
import { cacheManager } from '@/config/cache';

describe('ResultsRepository - SQLite Integration Tests', () => {
  let prismaClient: PrismaClient;
  let resultsRepository: ResultsRepository;
  let testDbPath: string;

  beforeEach(async () => {
    // Clear all caches to ensure test isolation
    await cacheManager.invalidateSurveyCache();
    
    // Also clear the specific count cache key that might persist
    await cacheManager.del('survey:total-count:v1');
    
    // Create a unique database for each test with more uniqueness
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const testId = Math.random().toString(36).substring(2, 8);
    testDbPath = `./test_${timestamp}_${randomId}_${testId}.db`;
    
    // Setup fresh database with proper schema
    prismaClient = await setupTestDatabase(testDbPath);
    
    // Verify database is truly empty
    const count = await prismaClient.surveyResponse.count();
    expect(count).toBe(0);
    
    // Create repository instance
    resultsRepository = new ResultsRepository(prismaClient);
  });

  afterEach(async () => {
    // Clean up database and disconnect
    if (prismaClient) {
      await cleanupTestDatabase(prismaClient, testDbPath);
    }
  });

  describe('getAverageRatings', () => {
    it('should return average ratings successfully', async () => {
      // Arrange - create test data
      await prismaClient.surveyResponse.createMany({
        data: [
          {
            firstName: 'John',
            lastName: 'Doe', 
            email: 'john1@test.com',
            contactNumber: '1234567890',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza',
            ratingMovies: 4,
            ratingRadio: 4,
            ratingEatOut: 5,
            ratingTV: 4
          },
          {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane1@test.com', 
            contactNumber: '1234567891',
            dateOfBirth: new Date('1985-05-15'),
            foods: 'Pasta',
            ratingMovies: 5,
            ratingRadio: 3,
            ratingEatOut: 4,
            ratingTV: 4
          }
        ]
      });

      // Act
      const result = await resultsRepository.getAverageRatings();

      // Assert
      expect(result.movies).toBe(4.5);
      expect(result.radio).toBe(3.5);
      expect(result.eatOut).toBe(4.5);
      expect(result.tv).toBe(4.0);
    });

    it('should handle empty database gracefully', async () => {
      // Act
      const result = await resultsRepository.getAverageRatings();

      // Assert  
      expect(result).toEqual({
        movies: 0,
        radio: 0,
        eatOut: 0,
        tv: 0,
      });
    });

    it('should round averages to one decimal place', async () => {
      // Arrange - create test data with specific values to test rounding
      await prismaClient.surveyResponse.createMany({
        data: [
          {
            firstName: 'Test',
            lastName: 'User1',
            email: 'test1@test.com',
            contactNumber: '1111111111',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza',
            ratingMovies: 4, // Will create 4.33... average
            ratingRadio: 4,
            ratingEatOut: 5,
            ratingTV: 4
          },
          {
            firstName: 'Test',
            lastName: 'User2', 
            email: 'test2@test.com',
            contactNumber: '2222222222',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza',
            ratingMovies: 5,
            ratingRadio: 3,
            ratingEatOut: 4,
            ratingTV: 3
          },
          {
            firstName: 'Test',
            lastName: 'User3',
            email: 'test3@test.com',
            contactNumber: '3333333333', 
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza',
            ratingMovies: 4,
            ratingRadio: 4,
            ratingEatOut: 5,
            ratingTV: 4
          }
        ]
      });

      // Act
      const result = await resultsRepository.getAverageRatings();

      // Assert - Check that values are properly rounded to 1 decimal place
      expect(Number.isInteger(result.movies * 10)).toBe(true); // Should be rounded to 1 decimal
      expect(Number.isInteger(result.radio * 10)).toBe(true);
      expect(Number.isInteger(result.eatOut * 10)).toBe(true); 
      expect(Number.isInteger(result.tv * 10)).toBe(true);
    });
  });

  describe('getFoodDistribution', () => {
    it('should return food distribution sorted by count', async () => {
      // Arrange - create test data
      await prismaClient.surveyResponse.createMany({
        data: [
          {
            firstName: 'User1',
            lastName: 'Test',
            email: 'user1@test.com',
            contactNumber: '1111111111',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza,Pasta',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          },
          {
            firstName: 'User2', 
            lastName: 'Test',
            email: 'user2@test.com',
            contactNumber: '2222222222',
            dateOfBirth: new Date('1990-01-01'), 
            foods: 'Pizza,Burger',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          },
          {
            firstName: 'User3',
            lastName: 'Test',
            email: 'user3@test.com', 
            contactNumber: '3333333333',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pasta,Salad',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          },
          {
            firstName: 'User4',
            lastName: 'Test',
            email: 'user4@test.com',
            contactNumber: '4444444444',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          }
        ]
      });

      // Act
      const result = await resultsRepository.getFoodDistribution();

      // Assert
      expect(result).toEqual([
        { food: 'Pizza', count: 3 },
        { food: 'Pasta', count: 2 },
        { food: 'Burger', count: 1 },
        { food: 'Salad', count: 1 },
      ]);
    });

    it('should handle empty database gracefully', async () => {
      // Act 
      const result = await resultsRepository.getFoodDistribution();

      // Assert
      expect(result).toEqual([]);
    });

    it('should trim whitespace from food names', async () => {
      // Arrange - create test data with whitespace
      await prismaClient.surveyResponse.createMany({
        data: [
          {
            firstName: 'User1',
            lastName: 'Test',
            email: 'user1@test.com',
            contactNumber: '1111111111', 
            dateOfBirth: new Date('1990-01-01'),
            foods: ' Pizza , Pasta ',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          },
          {
            firstName: 'User2',
            lastName: 'Test', 
            email: 'user2@test.com',
            contactNumber: '2222222222',
            dateOfBirth: new Date('1990-01-01'),
            foods: 'Pizza,  Burger  ',
            ratingMovies: 4, ratingRadio: 4, ratingEatOut: 4, ratingTV: 4
          }
        ]
      });

      // Act
      const result = await resultsRepository.getFoodDistribution();

      // Assert
      expect(result).toEqual([
        { food: 'Pizza', count: 2 },
        { food: 'Pasta', count: 1 },
        { food: 'Burger', count: 1 },
      ]);
    });
  });

  describe('getTotalResponses', () => {
    it('should return total count of responses', async () => {
      // Arrange - create test data
      await prismaClient.surveyResponse.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          firstName: `User${i}`,
          lastName: 'Test',
          email: `user${i}@test.com`,
          contactNumber: `111111111${i}`,
          dateOfBirth: new Date('1990-01-01'),
          foods: 'Pizza',
          ratingMovies: 4, 
          ratingRadio: 4,
          ratingEatOut: 4, 
          ratingTV: 4
        }))
      });

      // Act
      const result = await resultsRepository.getTotalResponses();

      // Assert
      expect(result).toBe(5);
    });

    it('should return 0 when no responses exist', async () => {
      // Act
      const result = await resultsRepository.getTotalResponses();

      // Assert
      expect(result).toBe(0);
    });
  });
});