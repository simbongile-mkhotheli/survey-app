// backend/src/test/integration/results.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/server';

describe('Results API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database or mock external dependencies
  });

  afterAll(async () => {
    // Cleanup test database or connections
  });

  beforeEach(async () => {
    // Clean up data before each test
  });

  describe('GET /api/results', () => {
    it('should return results with proper structure', async () => {
      // Act
      const response = await request(app)
        .get('/api/results')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCount');
      expect(response.body).toHaveProperty('age');
      expect(response.body).toHaveProperty('foodPercentages');
      expect(response.body).toHaveProperty('avgRatings');
      
      // Validate structure
      expect(response.body.age).toHaveProperty('avg');
      expect(response.body.age).toHaveProperty('min');
      expect(response.body.age).toHaveProperty('max');
      
      expect(response.body.foodPercentages).toHaveProperty('pizza');
      expect(response.body.foodPercentages).toHaveProperty('pasta');
      expect(response.body.foodPercentages).toHaveProperty('papAndWors');
      
      expect(response.body.avgRatings).toHaveProperty('movies');
      expect(response.body.avgRatings).toHaveProperty('radio');
      expect(response.body.avgRatings).toHaveProperty('eatOut');
      expect(response.body.avgRatings).toHaveProperty('tv');
    });

    it('should handle empty database gracefully', async () => {
      // Act
      const response = await request(app)
        .get('/api/results')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(typeof response.body.totalCount).toBe('number');
      expect(response.body.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should reject invalid query parameters', async () => {
      // Act
      const response = await request(app)
        .get('/api/results?invalidParam=true')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});