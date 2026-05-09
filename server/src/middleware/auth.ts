import type { Request, Response, NextFunction } from 'express';
import type { Claims } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Claims;
    }
  }
}

// Auth disabled: every request is treated as an authenticated admin.
const FAKE_ADMIN: Claims = { userId: 1, role: 'admin' };

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = FAKE_ADMIN;
  next();
}

export function requireRole(_role: 'admin' | 'volunteer') {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.user = FAKE_ADMIN;
    next();
  };
}
