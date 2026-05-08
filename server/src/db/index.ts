import { createRequire } from 'node:module';
import { getEnv } from '../env';
import * as schema from './schema';

const nodeRequire = createRequire(import.meta.url);

type Db = unknown;
let cached: Db | null = null;

export function getDb() {
  if (cached) return cached;
  const env = getEnv();
  if (env.DB_DRIVER === 'sqlite') {
    const Database = nodeRequire('better-sqlite3');
    const { drizzle } = nodeRequire('drizzle-orm/better-sqlite3');
    const sqlite = new Database(env.SQLITE_PATH!);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    cached = drizzle(sqlite, { schema });
  } else {
    const { neon } = nodeRequire('@neondatabase/serverless');
    const { drizzle } = nodeRequire('drizzle-orm/neon-http');
    const sql = neon(env.DATABASE_URL!);
    cached = drizzle(sql, { schema });
  }
  return cached;
}

export { schema };
