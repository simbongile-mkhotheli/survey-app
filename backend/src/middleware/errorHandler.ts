import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  const statusCode = message.toLowerCase().includes('not found') ? 404 : 500;

  return res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? 'Internal server error' : message,
    },
  });
}
