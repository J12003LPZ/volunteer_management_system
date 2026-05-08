import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEnv } from '../env';
import * as schema from './schema';

const nodeRequire = createRequire(import.meta.url);

// Resolve the SQLite file relative to the repo root, regardless of the cwd
// the script is invoked from. The repo root is two levels up from
// `server/src/db/`. This mirrors the resolution used in `migrate.ts` so that
// a relative SQLITE_PATH like `./server/data/vms.db` always points at the same
// file whether the process runs from the repo root or the `server/` workspace.
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

function resolveSqlitePath(p: string): string {
  return isAbsolute(p) ? p : resolve(repoRoot, p);
}

type Db = unknown;
let cached: Db | null = null;

export function getDb() {
  if (cached) return cached;
  const env = getEnv();
  if (env.DB_DRIVER === 'sqlite') {
    const Database = nodeRequire('better-sqlite3');
    const { drizzle } = nodeRequire('drizzle-orm/better-sqlite3');
    const sqlitePath = resolveSqlitePath(env.SQLITE_PATH!);
    mkdirSync(dirname(sqlitePath), { recursive: true });
    const sqlite = new Database(sqlitePath);
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
