import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { getEnv } from '../env';
import * as schema from './schema';

const nodeRequire = createRequire(import.meta.url);

function repoRootForSqlite(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    return resolve(here, '..', '..', '..');
  } catch {
    return process.cwd();
  }
}

function resolveSqlitePath(p: string): string {
  return isAbsolute(p) ? p : resolve(repoRootForSqlite(), p);
}

type Db = unknown;
let cached: Db | null = null;

export function getDb() {
  if (cached) return cached;
  const env = getEnv();
  if (env.DB_DRIVER === 'sqlite') {
    // better-sqlite3 is a native module; load lazily so it's optional on Vercel.
    const Database = nodeRequire('better-sqlite3');
    const { drizzle } = nodeRequire('drizzle-orm/better-sqlite3');
    const sqlitePath = resolveSqlitePath(env.SQLITE_PATH!);
    mkdirSync(dirname(sqlitePath), { recursive: true });
    const sqlite = new Database(sqlitePath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    cached = drizzle(sqlite, { schema });
  } else {
    const sql = neon(env.DATABASE_URL!);
    cached = drizzleNeon(sql, { schema });
  }
  return cached;
}

export { schema };
