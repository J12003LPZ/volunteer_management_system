import { describe, it, expect } from 'vitest';
import { loadEnv } from '../src/env';

describe('loadEnv', () => {
  it('parses sqlite driver config', () => {
    const env = loadEnv({
      DB_DRIVER: 'sqlite',
      SQLITE_PATH: './data/test.db',
      JWT_SECRET: 'a'.repeat(32),
      STORAGE_DRIVER: 'local',
      UPLOAD_DIR: './uploads',
      PORT: '4000',
      CLIENT_URL: 'http://localhost:5173',
    });
    expect(env.DB_DRIVER).toBe('sqlite');
    expect(env.PORT).toBe(4000);
  });

  it('rejects short JWT_SECRET', () => {
    expect(() =>
      loadEnv({
        DB_DRIVER: 'sqlite',
        SQLITE_PATH: './x.db',
        JWT_SECRET: 'short',
        STORAGE_DRIVER: 'local',
        UPLOAD_DIR: './up',
        PORT: '4000',
        CLIENT_URL: 'http://localhost:5173',
      })
    ).toThrow();
  });

  it('rejects sqlite driver with no SQLITE_PATH', () => {
    expect(() =>
      loadEnv({
        DB_DRIVER: 'sqlite',
        JWT_SECRET: 'a'.repeat(32),
        STORAGE_DRIVER: 'local',
        UPLOAD_DIR: './up',
        PORT: '4000',
        CLIENT_URL: 'http://localhost:5173',
      })
    ).toThrow(/SQLITE_PATH required/);
  });

  it('rejects neon driver with no DATABASE_URL', () => {
    expect(() =>
      loadEnv({
        DB_DRIVER: 'neon',
        JWT_SECRET: 'a'.repeat(32),
        STORAGE_DRIVER: 'local',
        UPLOAD_DIR: './up',
        PORT: '4000',
        CLIENT_URL: 'http://localhost:5173',
      })
    ).toThrow(/DATABASE_URL required/);
  });

  it('rejects cloudinary storage with missing keys', () => {
    expect(() =>
      loadEnv({
        DB_DRIVER: 'sqlite',
        SQLITE_PATH: './x.db',
        JWT_SECRET: 'a'.repeat(32),
        STORAGE_DRIVER: 'cloudinary',
        UPLOAD_DIR: './up',
        PORT: '4000',
        CLIENT_URL: 'http://localhost:5173',
      })
    ).toThrow(/CLOUDINARY/);
  });
});
