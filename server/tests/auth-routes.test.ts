import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  const mod = await import('../src/index');
  app = mod.createApp();
});

describe('POST /api/auth/login', () => {
  it('rejects bad credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns a token for the seeded admin', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });
});
