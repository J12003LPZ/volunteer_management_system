import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/test.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
});

describe('auth lib', () => {
  it('hashes and verifies passwords', async () => {
    const { hashPassword, verifyPassword } = await import('../src/lib/hash');
    const h = await hashPassword('hunter2');
    expect(await verifyPassword('hunter2', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
  });

  it('signs and verifies JWTs', async () => {
    const { signToken, verifyToken } = await import('../src/lib/jwt');
    const t = signToken({ userId: 1, role: 'admin' });
    const claims = verifyToken(t);
    expect(claims.userId).toBe(1);
    expect(claims.role).toBe('admin');
  });
});
