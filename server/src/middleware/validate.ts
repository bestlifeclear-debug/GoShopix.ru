import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type SchemaMap = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

/** Express 5: query/params are read-only getters — replace via defineProperty. */
function assignReadOnly<T extends object>(req: Request, key: 'query' | 'params', value: T) {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export function validate(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) {
        assignReadOnly(req, 'query', schemas.query.parse(req.query) as typeof req.query);
      }
      if (schemas.params) {
        assignReadOnly(req, 'params', schemas.params.parse(req.params) as typeof req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
