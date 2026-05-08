import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' });
  token = login.body.token;
});

describe('volunteers routes', () => {
  it('lists volunteers (admin)', async () => {
    const res = await request(app).get('/api/volunteers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app).get('/api/volunteers');
    expect(res.status).toBe(401);
  });

  it('creates and fetches a volunteer', async () => {
    const create = await request(app).post('/api/volunteers').set('Authorization', `Bearer ${token}`).send({
      firstName: 'Test', lastName: 'User', email: `t${Date.now()}@x.com`, status: 'pending',
    });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/volunteers/${id}`).set('Authorization', `Bearer ${token}`);
    expect(get.body.firstName).toBe('Test');
  });
});
