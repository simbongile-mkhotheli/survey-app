/**
 * Validation Schema Tests
 * =======================
 * Tests for Zod validation schemas used throughout the application
 */
import { describe, it, expect } from 'vitest';
import { SurveySchema } from '../../validation';
import type { SurveyFormValues } from '../../validation';

describe('Validation Schemas', () => {
  describe('SurveyFormSchema', () => {
    const validFormData: SurveyFormValues = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      contactNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      foods: ['Pizza', 'Pasta'],
      ratingMovies: '4',
      ratingRadio: '3',
      ratingEatOut: '5',
      ratingTV: '2',
    };

    describe('Complete Form Validation', () => {
      it('should accept valid complete form', () => {
        const result = SurveySchema.safeParse(validFormData);
        expect(result.success).toBe(true);
      });

      it('should reject form with missing required fields', () => {
        const { firstName: _firstName, ...incompleteData } = validFormData;
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
        const testEmails = [
          'user@example.com',
          'test.user@example.co.uk',
          'user+tag@example.com',
        ];

        testEmails.forEach((email) => {
          const result = SurveySchema.safeParse({ ...validFormData, email });
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid email addresses', () => {
        const invalidEmails = [
          'invalid',
          'user@',
          '@example.com',
          'user name@example.com',
        ];

        invalidEmails.forEach((email) => {
          const result = SurveySchema.safeParse({ ...validFormData, email });
          expect(result.success).toBe(false);
        });
      });

      it('should accept valid phone numbers', () => {
        const validPhones = ['+1234567890', '+27101234567', '0101234567'];

        validPhones.forEach((phone) => {
          const result = SurveySchema.safeParse({
            ...validFormData,
            contactNumber: phone,
          });
          expect(result.success).toBe(true);
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
