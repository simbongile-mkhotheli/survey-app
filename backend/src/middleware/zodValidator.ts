import { ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware factory to validate request body against a Zod schema
 * Provides a single source of truth for validation across the application
 *
 * Features:
 * - Validates request body using Zod schema
 * - Transforms and sanitizes data automatically
 * - Returns consistent error responses
 * - Type-safe with TypeScript inference
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * router.post('/', validateBody(SurveyPayloadSchema), handleCreateSurvey);
 */
export const validateBody = (schema: { parse: (data: unknown) => unknown }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body
      const validated = schema.parse(req.body);

      // Replace body with validated and transformed data
      req.body = validated;

      // Continue to next middleware
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            type: 'ValidationError',
            details: error.flatten().fieldErrors,
          },
        });
      }

      // Pass unexpected errors to error handler
      next(error);
    }
  };
};

/**
 * Alternative: Validate query parameters
 * @param schema - Zod schema for query validation
 * @returns Express middleware function
 */
export const validateQuery = (schema: {
  parse: (data: unknown) => unknown;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            message: 'Query validation failed',
            type: 'ValidationError',
            details: error.flatten().fieldErrors,
          },
        });
      }
      next(error);
    }
  };
};

/**
 * Alternative: Validate URL parameters
 * @param schema - Zod schema for params validation
 * @returns Express middleware function
 */
export const validateParams = (schema: {
  parse: (data: unknown) => unknown;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            message: 'Parameter validation failed',
            type: 'ValidationError',
            details: error.flatten().fieldErrors,
          },
        });
      }
      next(error);
    }
  };
};
