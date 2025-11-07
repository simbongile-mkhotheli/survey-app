// backend/src/test/integration/survey.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/server';
import { createMockSurveyInput } from '@/test/utils/test-helpers';
import { setupTestDatabasePostgres, cleanTestDatabase, teardownTestDatabase } from '@/test/utils/db-setup-postgres';
import { PrismaClient } from '@prisma/client';

describe('Survey API Integration Tests', () => {
  let testDb: PrismaClient;

  beforeAll(async () => {
    // Setup PostgreSQL test database connection
    testDb = await setupTestDatabasePostgres();
  });

  afterAll(async () => {
    // Cleanup test database connections
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clean up data before each test to ensure isolation
    await cleanTestDatabase(testDb);
  });

  describe('POST /api/survey', () => {
    it('should create a survey with valid data', async () => {
      // Arrange
      const surveyData = createMockSurveyInput();

      // Act
      const response = await request(app)
        .post('/api/survey')
        .send(surveyData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('number');
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidData = {
        firstName: '', // Invalid: empty string
        email: 'invalid-email', // Invalid: not a valid email
      };

      // Act
      const response = await request(app)
        .post('/api/survey')
        .send(invalidData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteData = {
        firstName: 'John',
        // Missing other required fields
      };

      // Act
      const response = await request(app)
        .post('/api/survey')
        .send(incompleteData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      // Arrange
      const surveyData = createMockSurveyInput({
        email: 'not-an-email',
      });

      // Act
      const response = await request(app)
        .post('/api/survey')
        .send(surveyData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should validate rating ranges', async () => {
      // Arrange
      const surveyData = createMockSurveyInput({
        ratingMovies: 10, // Invalid: should be 1-5
      });

      // Act
      const response = await request(app)
        .post('/api/survey')
        .send(surveyData)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});