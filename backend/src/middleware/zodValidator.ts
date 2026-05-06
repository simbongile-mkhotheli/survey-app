import { ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

type SchemaLike = {
  parse: (data: unknown) => unknown;
};

function sendValidationError(res: Response, error: ZodError) {
  return res.status(400).json({
    error: {
      message: 'Validation failed',
      type: 'ValidationError',
      details: error.flatten().fieldErrors,
    },
  });
}

function createValidator(
  source: 'body' | 'query' | 'params',
  schema: SchemaLike,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);

      if (source === 'body') {
        req.body = parsed;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendValidationError(res, error);
      }

      return next(error);
    }
  };
}

export const validateBody = (schema: SchemaLike) =>
  createValidator('body', schema);

export const validateQuery = (schema: SchemaLike) =>
  createValidator('query', schema);

export const validateParams = (schema: SchemaLike) =>
  createValidator('params', schema);
