/**
 * Validation Schema Tests
 * =======================
 * Tests for Zod validation schemas used throughout the application
 * Uses Faker.js for dynamic test data - no hardcoded values
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SurveySchema } from '@/validation';
import type { SurveyFormValues } from '@/validation';
import {
  createMockSurveyFormData,
  createValidEmails,
  createInvalidEmails,
  createValidPhoneNumbers,
  createInvalidPhoneNumbers,
} from '@/test/utils/test-helpers';

describe('Validation Schemas', () => {
  describe('SurveyFormSchema', () => {
    let validFormData: SurveyFormValues;

    beforeEach(() => {
      // Generate fresh random data for each test
      validFormData = createMockSurveyFormData();
    });

    describe('Complete Form Validation', () => {
      it('should accept valid complete form', () => {
        const result = SurveySchema.safeParse(validFormData);
        expect(result.success).toBe(true);
      });

      it('should reject form with missing required fields', () => {
        const { firstName, ...incompleteData } = validFormData;
        void firstName; // unused but extracted for clarity
        const result = SurveySchema.safeParse(incompleteData);
        expect(result.success).toBe(false);
      });

      it('should validate all required fields', () => {
        const requiredFields = [
          'firstName',
          'lastName',
          'email',
          'contactNumber',
          'dateOfBirth',
        ];

        requiredFields.forEach((field) => {
          const invalidData = { ...validFormData, [field]: '' };
          const result = SurveySchema.safeParse(invalidData);
          expect(result.success).toBe(false);
        });
      });
    });

    describe('Field Specific Validation', () => {
      it('should accept valid email addresses', () => {
        const testEmails = createValidEmails();

        testEmails.forEach((email: string) => {
          const result = SurveySchema.safeParse({ ...validFormData, email });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = createInvalidEmails();

        invalidEmails.forEach((email: string) => {
          const result = SurveySchema.safeParse({ ...validFormData, email });
          expect(result.success).toBe(false);
        });
      });

      it('should accept valid phone numbers', () => {
        const validPhones = createValidPhoneNumbers();

        validPhones.forEach((phone: string) => {
          const result = SurveySchema.safeParse({
            ...validFormData,
            contactNumber: phone,
          });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = createInvalidPhoneNumbers();

        invalidPhones.forEach((phone: string) => {
          const result = SurveySchema.safeParse({
            ...validFormData,
            contactNumber: phone,
          });
          expect(result.success).toBe(false);
        });
      });

      it('should accept at least one food selection', () => {
        const result = SurveySchema.safeParse({
          ...validFormData,
          foods: ['Pizza'],
        });
        expect(result.success).toBe(true);
      });

      it('should reject empty food selection', () => {
        const result = SurveySchema.safeParse({
          ...validFormData,
          foods: [],
        });
        expect(result.success).toBe(false);
      });

      it('should accept valid ratings 1-5', () => {
        for (let i = 1; i <= 5; i++) {
          const result = SurveySchema.safeParse({
            ...validFormData,
            ratingMovies: String(i),
            ratingRadio: String(i),
            ratingEatOut: String(i),
            ratingTV: String(i),
          });
          expect(result.success).toBe(true);
        }
      });

      it('should reject ratings outside 1-5 range', () => {
        const result = SurveySchema.safeParse({
          ...validFormData,
          ratingMovies: '6',
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
