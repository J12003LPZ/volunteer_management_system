import { z } from 'zod';
import { config } from 'dotenv';
import path from 'node:path';

// Load the repo-root .env (server cwd is the workspace, so .env lives one level up).
config({ path: path.resolve(import.meta.dirname, '..', '..', '.env') });

const Schema = z.object({
  DB_DRIVER: z.enum(['sqlite', 'neon']),
  SQLITE_PATH: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']),
  UPLOAD_DIR: z.string().default('./uploads'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof Schema>;

export function loadEnv(
  source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): Env {
  const parsed = Schema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid env: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }
  const env = parsed.data;
  if (env.DB_DRIVER === 'sqlite' && !env.SQLITE_PATH) {
    throw new Error('SQLITE_PATH required when DB_DRIVER=sqlite');
  }
  if (env.DB_DRIVER === 'neon' && !env.DATABASE_URL) {
    throw new Error('DATABASE_URL required when DB_DRIVER=neon');
  }
  if (
    env.STORAGE_DRIVER === 'cloudinary' &&
    (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
  ) {
    throw new Error('CLOUDINARY_* required when STORAGE_DRIVER=cloudinary');
  }
  return env;
}

let _env: Env | null = null;
export function getEnv(): Env {
  if (!_env) _env = loadEnv();
  return _env;
}

// Backwards-compat: callers that imported `env` as a value still work,
// but the call is deferred via a Proxy that resolves on first property access.
export const env: Env = new Proxy({} as Env, {
  get(_target, prop) { return getEnv()[prop as keyof Env]; },
});
