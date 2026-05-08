import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'validation', issues: err.flatten().fieldErrors });
  }
  console.error(err);
  res.status(500).json({ error: 'internal' });
}
