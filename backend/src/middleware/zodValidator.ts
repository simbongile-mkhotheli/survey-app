import type { Request, Response, NextFunction } from 'express';

type SchemaLike = {
  parse: (data: unknown) => unknown;
};

function createValidator(
  source: 'body' | 'query' | 'params',
  schema: SchemaLike,
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);

      if (source === 'body') {
        req.body = parsed;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const validateBody = (schema: SchemaLike) =>
  createValidator('body', schema);

export const validateQuery = (schema: SchemaLike) =>
  createValidator('query', schema);

export const validateParams = (schema: SchemaLike) =>
  createValidator('params', schema);
