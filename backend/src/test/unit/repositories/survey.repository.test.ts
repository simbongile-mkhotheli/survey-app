/**
 * SurveyRepository Unit Tests
 * ===========================
 * Tests for the survey data access layer
 */
import { SurveyRepository } from '@/repositories/survey.repository';
import type { SurveyInput } from '@/validation/validation';
import type { PrismaClient } from '@prisma/client';

describe('SurveyRepository', () => {
  let repository: SurveyRepository;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrisma: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Prisma client
    mockPrisma = {
      surveyResponse: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    repository = new SurveyRepository(mockPrisma as unknown as PrismaClient);
  });

  describe('create', () => {
    it('should create a survey response successfully', async () => {
      // ARRANGE
      const input: SurveyInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contactNumber: '+27123456789',
        dateOfBirth: '1990-01-15',
        foods: ['pizza', 'pasta'],
        ratingMovies: 4,
        ratingRadio: 3,
        ratingEatOut: 5,
        ratingTV: 4,
      };

      const mockCreatedResponse = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        contactNumber: '+27123456789',
        dateOfBirth: new Date('1990-01-15'),
        foods: 'pizza,pasta',
        ratingMovies: 4,
        ratingRadio: 3,
        ratingEatOut: 5,
        ratingTV: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.surveyResponse.create.mockResolvedValue(mockCreatedResponse);

      // ACT
      const result = await repository.create(input);

      // ASSERT
      expect(mockPrisma.surveyResponse.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.surveyResponse.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          contactNumber: '+27123456789',
          dateOfBirth: new Date('1990-01-15'),
          foods: 'pizza,pasta',
          ratingMovies: 4,
          ratingRadio: 3,
          ratingEatOut: 5,
          ratingTV: 4,
        },
      });
      expect(result).toEqual(mockCreatedResponse);
    });

    it('should convert dateOfBirth string to Date object', async () => {
      // ARRANGE
      const input: SurveyInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        contactNumber: '+27987654321',
        dateOfBirth: '1995-06-20',
        foods: ['pizza'],
        ratingMovies: 5,
        ratingRadio: 4,
        ratingEatOut: 4,
        ratingTV: 3,
      };

      const mockCreatedResponse = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        contactNumber: '+27987654321',
        dateOfBirth: new Date('1995-06-20'),
        foods: 'pizza',
        ratingMovies: 5,
        ratingRadio: 4,
        ratingEatOut: 4,
        ratingTV: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.surveyResponse.create.mockResolvedValue(mockCreatedResponse);

      // ACT
      await repository.create(input);

      // ASSERT
      const callArgs = mockPrisma.surveyResponse.create.mock.calls[0][0];
      expect(callArgs.data.dateOfBirth).toBeInstanceOf(Date);
      expect(callArgs.data.dateOfBirth.toISOString()).toContain('1995-06-20');
    });

    it('should convert foods array to CSV string', async () => {
      // ARRANGE
      const input: SurveyInput = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        contactNumber: '+27111222333',
        dateOfBirth: '2000-03-10',
        foods: ['pizza', 'pasta', 'pap and wors'],
        ratingMovies: 3,
        ratingRadio: 2,
        ratingEatOut: 4,
        ratingTV: 5,
      };

      const mockCreatedResponse = {
        id: 3,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        contactNumber: '+27111222333',
        dateOfBirth: new Date('2000-03-10'),
        foods: 'pizza,pasta,pap and wors',
        ratingMovies: 3,
        ratingRadio: 2,
        ratingEatOut: 4,
        ratingTV: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.surveyResponse.create.mockResolvedValue(mockCreatedResponse);

      // ACT
      await repository.create(input);

      // ASSERT
      const callArgs = mockPrisma.surveyResponse.create.mock.calls[0][0];
      expect(callArgs.data.foods).toBe('pizza,pasta,pap and wors');
    });

    it('should propagate Prisma errors', async () => {
      // ARRANGE
      const input: SurveyInput = {
        firstName: 'Error',
        lastName: 'Test',
        email: 'error@example.com',
        contactNumber: '+27999888777',
        dateOfBirth: '1988-12-25',
        foods: ['pizza'],
        ratingMovies: 3,
        ratingRadio: 3,
        ratingEatOut: 3,
        ratingTV: 3,
      };

      const prismaError = new Error('Database connection failed');
      mockPrisma.surveyResponse.create.mockRejectedValue(prismaError);

      // ACT & ASSERT
      await expect(repository.create(input)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findById', () => {
    it('should find a survey response by id', async () => {
      // ARRANGE
      const mockSurvey = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        contactNumber: '+27123456789',
        dateOfBirth: new Date('1990-01-15'),
        foods: 'pizza,pasta',
        ratingMovies: 4,
        ratingRadio: 3,
        ratingEatOut: 5,
        ratingTV: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.surveyResponse.findUnique.mockResolvedValue(mockSurvey);

      // ACT
      const result = await repository.findById(1);

      // ASSERT
      expect(mockPrisma.surveyResponse.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrisma.surveyResponse.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSurvey);
    });

    it('should return null when survey not found', async () => {
      // ARRANGE
      mockPrisma.surveyResponse.findUnique.mockResolvedValue(null);

      // ACT
      const result = await repository.findById(999);

      // ASSERT
      expect(mockPrisma.surveyResponse.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should propagate Prisma errors', async () => {
      // ARRANGE
      const prismaError = new Error('Database query failed');
      mockPrisma.surveyResponse.findUnique.mockRejectedValue(prismaError);

      // ACT & ASSERT
      await expect(repository.findById(1)).rejects.toThrow(
        'Database query failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all survey responses', async () => {
      // ARRANGE
      const mockSurveys = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          contactNumber: '+27123456789',
          dateOfBirth: new Date('1990-01-15'),
          foods: 'pizza,pasta',
          ratingMovies: 4,
          ratingRadio: 3,
          ratingEatOut: 5,
          ratingTV: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          contactNumber: '+27987654321',
          dateOfBirth: new Date('1995-06-20'),
          foods: 'pizza',
          ratingMovies: 5,
          ratingRadio: 4,
          ratingEatOut: 4,
          ratingTV: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.surveyResponse.findMany.mockResolvedValue(mockSurveys);

      // ACT
      const result = await repository.findAll();

      // ASSERT
      expect(mockPrisma.surveyResponse.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSurveys);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no surveys exist', async () => {
      // ARRANGE
      mockPrisma.surveyResponse.findMany.mockResolvedValue([]);

      // ACT
      const result = await repository.findAll();

      // ASSERT
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should propagate Prisma errors', async () => {
      // ARRANGE
      const prismaError = new Error('Database connection lost');
      mockPrisma.surveyResponse.findMany.mockRejectedValue(prismaError);

      // ACT & ASSERT
      await expect(repository.findAll()).rejects.toThrow(
        'Database connection lost',
      );
    });
  });

  describe('count', () => {
    it('should return total count of survey responses', async () => {
      // ARRANGE
      mockPrisma.surveyResponse.count.mockResolvedValue(42);

      // ACT
      const result = await repository.count();

      // ASSERT
      expect(mockPrisma.surveyResponse.count).toHaveBeenCalledTimes(1);
      expect(result).toBe(42);
    });

    it('should return 0 when no surveys exist', async () => {
      // ARRANGE
      mockPrisma.surveyResponse.count.mockResolvedValue(0);

      // ACT
      const result = await repository.count();

      // ASSERT
      expect(result).toBe(0);
    });

    it('should propagate Prisma errors', async () => {
      // ARRANGE
      const prismaError = new Error('Count query failed');
      mockPrisma.surveyResponse.count.mockRejectedValue(prismaError);

      // ACT & ASSERT
      await expect(repository.count()).rejects.toThrow('Count query failed');
    });
  });
});
