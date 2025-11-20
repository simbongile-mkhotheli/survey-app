import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError, DatabaseError } from '@/errors/AppError';
import { logger } from '@/config/logger';

/**
 * Enhanced centralized error-handling middleware following OCP
 * - Handles custom application errors with specific status codes
 * - Converts Zod validation errors into ValidationError
 * - Maps Prisma errors to DatabaseError
 * - Provides structured error responses
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction, // Prefix with underscore as it's required by Express but not used
) {
  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        type: err.name,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = new ValidationError('Validation failed');
    return res.status(validationError.statusCode).json({
      error: {
        message: validationError.message,
        type: validationError.name,
        details: err.flatten().fieldErrors,
      },
    });
  }

  // Handle Prisma database errors
  if (err && typeof err === 'object' && 'code' in err) {
    const dbError = new DatabaseError('Database operation failed');
    const prismaError = err as { code: string };
    return res.status(dbError.statusCode).json({
      error: {
        message: dbError.message,
        type: dbError.name,
        ...(process.env.NODE_ENV === 'development' && {
          code: prismaError.code,
        }),
      },
    });
  }

  // Handle unexpected errors
  logger.error('Unexpected error occurred', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      type: 'UnknownError',
      ...(process.env.NODE_ENV === 'development' && {
        details: err instanceof Error ? err.message : 'Unknown error occurred',
      }),
    },
  });
}
