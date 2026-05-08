import jwt from 'jsonwebtoken';
import { getEnv } from '../env';

export type Claims = { userId: number; role: 'admin' | 'volunteer'; volunteerId?: number };

export function signToken(c: Claims): string {
  const env = getEnv();
  return jwt.sign(c, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(t: string): Claims {
  const env = getEnv();
  return jwt.verify(t, env.JWT_SECRET) as Claims;
}
