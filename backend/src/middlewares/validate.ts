import type { NextFunction, Request, Response } from 'express';
import type { z, ZodType } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
  
      validatedQuery?: unknown;
    }
  }
}

export function validate<T extends ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    }) as z.infer<T>;

    if (result && typeof result === 'object') {
      const parsed = result as { body?: unknown; query?: unknown };
      if ('body' in parsed) req.body = parsed.body ?? req.body;
      if ('query' in parsed) req.validatedQuery = parsed.query;
    }
    next();
  };
}