import { ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: { parse: (data: unknown) => unknown }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            type: 'ValidationError',
            details: error.flatten().fieldErrors,
          },
        });
      }
      next(error);
    }
  };
};

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
