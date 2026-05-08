import { describe, it, expect, beforeAll } from 'vitest';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

beforeAll(() => {
  process.env.DB_DRIVER = 'sqlite';
  process.env.SQLITE_PATH = './server/data/test-factory.db';
  process.env.JWT_SECRET = 'a'.repeat(40);
  process.env.STORAGE_DRIVER = 'local';
  process.env.UPLOAD_DIR = './uploads';
  process.env.PORT = '4000';
  process.env.CLIENT_URL = 'http://localhost:5173';
  mkdirSync(dirname(process.env.SQLITE_PATH!), { recursive: true });
});

describe('db factory', () => {
  it('returns a drizzle instance for sqlite', async () => {
    const { getDb } = await import('../src/db/index');
    const db = getDb();
    expect(db).toBeDefined();
  });
});
