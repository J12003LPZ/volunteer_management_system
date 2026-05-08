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
  token = (await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' })).body.token;
});

describe('events routes', () => {
  it('lists events', async () => {
    const res = await request(app).get('/api/events').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('creates an event', async () => {
    const res = await request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send({
      name: 'New Event', date: '2026-07-01', startTime: '10:00', endTime: '14:00',
      location: 'Park', requiredVolunteers: 5, status: 'open',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
  });
});
