// backend/src/test/unit/validation/validation.test.ts
import { SurveySchema, ResultsQuerySchema } from '@/validation/validation';

describe('Validation Schemas', () => {
  describe('SurveySchema', () => {
    const validSurveyData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      contactNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      foods: ['Pizza', 'Pasta'],
      ratingMovies: 4,
      ratingRadio: 3,
      ratingEatOut: 5,
      ratingTV: 4,
    };

    describe('Valid Data', () => {
      it('should validate complete valid survey data', () => {
        // Act
        const result = SurveySchema.safeParse(validSurveyData);

        // Assert - Verify validation succeeds
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toMatchObject(validSurveyData);
        }
      });

      it('should trim and sanitize string inputs', () => {
        // Arrange - Data with whitespace
        const dataWithWhitespace = {
          ...validSurveyData,
          firstName: '  John  ',
          lastName: '  Doe  ',
        };

        // Act
        const result = SurveySchema.safeParse(dataWithWhitespace);

        // Assert - Verify sanitization
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).toBe('John');
          expect(result.data.lastName).toBe('Doe');
        }
      });

      it('should normalize email to lowercase', () => {
        // Arrange
        const dataWithUppercaseEmail = {
          ...validSurveyData,
          email: 'John.Doe@EXAMPLE.COM',
        };

        // Act
        const result = SurveySchema.safeParse(dataWithUppercaseEmail);

        // Assert - Verify email normalization
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('john.doe@example.com');
        }
      });

      it('should remove dangerous characters from strings', () => {
        // Arrange - Potential XSS attempt
        const dataWithXSS = {
          ...validSurveyData,
          firstName: 'John<script>alert("xss")</script>',
          lastName: 'Doe<img src=x onerror=alert(1)>',
        };

        // Act
        const result = SurveySchema.safeParse(dataWithXSS);

        // Assert - Verify XSS characters removed
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.firstName).not.toContain('<');
          expect(result.data.firstName).not.toContain('>');
          expect(result.data.lastName).not.toContain('<');
          expect(result.data.lastName).not.toContain('>');
        }
      });
    });

    describe('First Name Validation', () => {
      it('should reject empty first name', () => {
        // Arrange
        const invalidData = { ...validSurveyData, firstName: '' };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify validation fails
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('firstName');
          expect(result.error.issues[0].message).toContain('required');
        }
      });

      it('should reject first name exceeding 100 characters', () => {
        // Arrange - Create 101 character string
        const longName = 'A'.repeat(101);
        const invalidData = { ...validSurveyData, firstName: longName };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify length validation
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('firstName');
          expect(result.error.issues[0].message).toContain('100 characters');
        }
      });
    });

    describe('Email Validation', () => {
      it('should reject invalid email formats', () => {
        // Arrange - Test various invalid email formats
        const invalidEmails = [
          'notanemail',
          '@example.com',
          'user@',
          'user @example.com',
          'user@.com',
        ];

        invalidEmails.forEach((email) => {
          // Act
          const result = SurveySchema.safeParse({ ...validSurveyData, email });

          // Assert - Verify email validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].path).toContain('email');
          }
        });
      });

      it('should accept valid email formats', () => {
        // Arrange
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@test-domain.com',
        ];

        validEmails.forEach((email) => {
          // Act
          const result = SurveySchema.safeParse({ ...validSurveyData, email });

          // Assert - Verify email acceptance
          expect(result.success).toBe(true);
        });
      });

      it('should reject email exceeding 255 characters', () => {
        // Arrange - Create email longer than 255 chars
        const longEmail = 'a'.repeat(250) + '@example.com';
        const invalidData = { ...validSurveyData, email: longEmail };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify length validation
        expect(result.success).toBe(false);
      });
    });

    describe('Contact Number Validation', () => {
      it('should accept valid international phone numbers', () => {
        // Arrange
        const validNumbers = [
          '+1234567890',
          '+441234567890',
          '1234567890',
          '+123456789012345',
        ];

        validNumbers.forEach((contactNumber) => {
          // Act
          const result = SurveySchema.safeParse({
            ...validSurveyData,
            contactNumber,
          });

          // Assert - Verify phone acceptance
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid phone number formats', () => {
        // Arrange
        const invalidNumbers = [
          '123', // Too short
          'abcdefghij', // Contains letters
          '+1-234-567', // Contains dashes
          '(123) 456-7890', // Contains special chars
        ];

        invalidNumbers.forEach((contactNumber) => {
          // Act
          const result = SurveySchema.safeParse({
            ...validSurveyData,
            contactNumber,
          });

          // Assert - Verify phone rejection
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Date of Birth Validation', () => {
      it('should accept valid age range (5-120 years)', () => {
        // Arrange - Create dates for ages 5, 30, 120
        const today = new Date();
        const validAges = [
          new Date(today.getFullYear() - 5, today.getMonth(), today.getDate()),
          new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()),
          new Date(
            today.getFullYear() - 120,
            today.getMonth(),
            today.getDate(),
          ),
        ];

        validAges.forEach((dob) => {
          // Act
          const result = SurveySchema.safeParse({
            ...validSurveyData,
            dateOfBirth: dob.toISOString().split('T')[0],
          });

          // Assert - Verify age acceptance
          expect(result.success).toBe(true);
        });
      });

      it('should reject age below 5 years', () => {
        // Arrange - Date for 4 year old
        const today = new Date();
        const youngDOB = new Date(
          today.getFullYear() - 4,
          today.getMonth(),
          today.getDate(),
        );
        const invalidData = {
          ...validSurveyData,
          dateOfBirth: youngDOB.toISOString().split('T')[0],
        };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify age rejection
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('age');
        }
      });

      it('should reject age above 120 years', () => {
        // Arrange - Date for 121 year old
        const today = new Date();
        const oldDOB = new Date(
          today.getFullYear() - 121,
          today.getMonth(),
          today.getDate(),
        );
        const invalidData = {
          ...validSurveyData,
          dateOfBirth: oldDOB.toISOString().split('T')[0],
        };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify age rejection
        expect(result.success).toBe(false);
      });
    });

    describe('Foods Array Validation', () => {
      it('should accept array with 1-10 food items', () => {
        // Arrange
        const validFoodArrays = [
          ['Pizza'],
          ['Pizza', 'Pasta'],
          [
            'Pizza',
            'Pasta',
            'Burger',
            'Salad',
            'Soup',
            'Steak',
            'Fish',
            'Rice',
            'Bread',
            'Cheese',
          ],
        ];

        validFoodArrays.forEach((foods) => {
          // Act
          const result = SurveySchema.safeParse({ ...validSurveyData, foods });

          // Assert - Verify array acceptance
          expect(result.success).toBe(true);
        });
      });

      it('should reject empty foods array', () => {
        // Arrange
        const invalidData = { ...validSurveyData, foods: [] };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify minimum validation
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least one');
        }
      });

      it('should reject more than 10 food items', () => {
        // Arrange - 11 food items
        const tooManyFoods = Array(11).fill('Pizza');
        const invalidData = { ...validSurveyData, foods: tooManyFoods };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify maximum validation
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Maximum 10');
        }
      });

      it('should sanitize food names', () => {
        // Arrange - Foods with dangerous characters
        const dangerousFoods = ['Pizza<script>', 'Pasta>alert'];
        const data = { ...validSurveyData, foods: dangerousFoods };

        // Act
        const result = SurveySchema.safeParse(data);

        // Assert - Verify sanitization
        expect(result.success).toBe(true);
        if (result.success) {
          result.data.foods.forEach((food) => {
            expect(food).not.toContain('<');
            expect(food).not.toContain('>');
          });
        }
      });
    });

    describe('Rating Validation', () => {
      it('should accept all valid ratings (1-5)', () => {
        // Arrange
        const validRatings = [1, 2, 3, 4, 5];

        validRatings.forEach((rating) => {
          // Act
          const result = SurveySchema.safeParse({
            ...validSurveyData,
            ratingMovies: rating,
            ratingRadio: rating,
            ratingEatOut: rating,
            ratingTV: rating,
          });

          // Assert - Verify rating acceptance
          expect(result.success).toBe(true);
        });
      });

      it('should reject ratings below 1', () => {
        // Arrange
        const invalidData = { ...validSurveyData, ratingMovies: 0 };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify rating rejection
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('1–5');
        }
      });

      it('should reject ratings above 5', () => {
        // Arrange
        const invalidData = { ...validSurveyData, ratingTV: 6 };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify rating rejection
        expect(result.success).toBe(false);
      });

      it('should reject non-integer ratings', () => {
        // Arrange
        const invalidData = { ...validSurveyData, ratingRadio: 3.5 };

        // Act
        const result = SurveySchema.safeParse(invalidData);

        // Assert - Verify integer requirement
        expect(result.success).toBe(false);
      });
    });
  });

  describe('ResultsQuerySchema', () => {
    it('should accept empty query object', () => {
      // Act
      const result = ResultsQuerySchema.safeParse({});

      // Assert - Verify empty object acceptance
      expect(result.success).toBe(true);
    });

    it('should reject query with unknown properties', () => {
      // Arrange
      const invalidQuery = { page: 1, limit: 10 };

      // Act
      const result = ResultsQuerySchema.safeParse(invalidQuery);

      // Assert - Verify strict mode rejects extra properties
      expect(result.success).toBe(false);
    });
  });
});
