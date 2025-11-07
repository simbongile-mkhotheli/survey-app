// backend/src/routes/survey.ts

import { Router } from 'express';
import { SurveySchema } from '@/validation/validation';
import express from 'express';
import { handleCreateSurvey } from '@/controllers/surveyController';
import { validateInput, surveyValidation } from '@/middleware/security';
import type { Request, Response, NextFunction } from 'express';

/**
 * @swagger
 * /api/survey:
 *   post:
 *     tags:
 *       - Survey
 *     summary: Submit a new survey response
 *     description: |
 *       Submit a new survey response with personal information and ratings.
 *       
 *       ## Validation Rules
 *       - All fields are required
 *       - Email must be valid format
 *       - Contact number must be 10-15 digits with optional country code
 *       - Date of birth must result in age between 5-120 years
 *       - Foods must be selected from available options
 *       - All ratings must be integers from 1-5
 *       
 *       ## Security Features
 *       - Input sanitization to prevent XSS attacks
 *       - Rate limiting to prevent spam
 *       - Request size limiting
 *       - Comprehensive validation with detailed error messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SurveyInput'
 *           examples:
 *             complete_survey:
 *               summary: Complete survey example
 *               description: A complete survey response with all required fields
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john.doe@example.com"
 *                 contactNumber: "+1234567890"
 *                 dateOfBirth: "1990-05-15"
 *                 foods: ["pizza", "pasta"]
 *                 ratingMovies: "4"
 *                 ratingRadio: "3"
 *                 ratingEatOut: "5"
 *                 ratingTV: "2"
 *             minimal_survey:
 *               summary: Minimal valid survey
 *               description: Survey with minimum required data
 *               value:
 *                 firstName: "Jane"
 *                 lastName: "Smith"
 *                 email: "jane@example.com"
 *                 contactNumber: "1234567890"
 *                 dateOfBirth: "1985-12-25"
 *                 foods: ["papAndWors"]
 *                 ratingMovies: "1"
 *                 ratingRadio: "1"
 *                 ratingEatOut: "1"
 *                 ratingTV: "1"
 *     responses:
 *       201:
 *         description: Survey successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyResponse'
 *             example:
 *               id: 123
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

const router = Router();

// Multi-layer validation: express-validator + Zod for comprehensive security
router.post(
  '/',
  validateInput(surveyValidation), // First: sanitize and validate with express-validator
  (req: Request, res: Response, next: NextFunction) => {
    try {
      SurveySchema.parse(req.body); // Second: validate with Zod schema
      next();
    } catch (err) {
      next(err);
    }
  },
  handleCreateSurvey,
);

export default router;
