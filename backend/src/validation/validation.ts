import { z } from 'zod';

// Helper for rating fields: integer between 1 and 5
const isRating = (val: number) => Number.isInteger(val) && val >= 1 && val <= 5;
const ratingError = { message: 'Please select a rating from 1–5' };

/**
 * Schema for survey submission payload.
 * Validates personal details, selections, and ratings.
 */
export const SurveySchema = z.object({
  firstName:     z.string().min(1, 'First name is required'),
  lastName:      z.string().min(1, 'Last name is required'),
  email:         z.string().email('Invalid email address'),
  contactNumber: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid contact number'),
  dateOfBirth:   z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date' }),
  foods:         z.array(z.string()).min(1, 'Select at least one food'),

  // Ratings must be numbers 1–5
  ratingMovies:  z.number().int().refine(isRating, ratingError),
  ratingRadio:   z.number().int().refine(isRating, ratingError),
  ratingEatOut:  z.number().int().refine(isRating, ratingError),
  ratingTV:      z.number().int().refine(isRating, ratingError),
});

export type SurveyInput = z.infer<typeof SurveySchema>;

/**
 * Schema for query parameters on GET /results.
 * Currently, there are no query parameters.
 */
export const ResultsQuerySchema = z.object({}).strict();
export type ResultsQuery = z.infer<typeof ResultsQuerySchema>;
