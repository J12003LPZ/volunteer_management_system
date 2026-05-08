import { z } from 'zod';
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Resolve this file's directory in a way that survives both ESM (tsx, node) and
// CJS bundling (drizzle-kit transpiles via esbuild → cjs, which makes
// `import.meta.dirname` empty). Fall back to process.cwd() when neither is
// available.
function resolveHere(): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    /* noop */
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cjsDirname = (globalThis as any).__dirname as string | undefined;
  return cjsDirname ?? process.cwd();
}

// The repo-root .env may live at <here>/../../.env (when running from src/) or
// at <cwd>/../.env (when drizzle-kit runs from the server workspace) or at
// <cwd>/.env (when running from repo root). Try each in order.
const here = resolveHere();
const candidates = [
  path.resolve(here, '..', '..', '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const candidate of candidates) {
  if (existsSync(candidate)) {
    config({ path: candidate });
    break;
  }
}

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
