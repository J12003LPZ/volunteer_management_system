import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type Claims } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Claims;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = verifyToken(h.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

export function requireRole(role: 'admin' | 'volunteer') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
