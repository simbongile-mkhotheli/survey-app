import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Centralized error-handling middleware.
 * - Converts Zod validation errors into HTTP 400 responses.
 * - Maps generic database errors to HTTP 500.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.flatten().fieldErrors });
  }

  // Handle known Prisma errors (e.g., unique constraint violations)
  if (err && typeof err === 'object' && 'code' in err && typeof (err as any).code === 'string') {
    return res.status(500).json({ error: 'Database error' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
