import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEnv } from '../env';

const nodeRequire = createRequire(import.meta.url);

// Resolve `server/drizzle/` and the SQLite file relative to this file,
// regardless of the cwd that `npm run db:migrate` is invoked from. The repo
// root is two levels up from `server/src/db/`.
const here = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(here, '..', '..', 'drizzle');
const repoRoot = resolve(here, '..', '..', '..');

function resolveSqlitePath(p: string): string {
  return isAbsolute(p) ? p : resolve(repoRoot, p);
}

async function main() {
  const env = getEnv();

  if (env.DB_DRIVER === 'sqlite') {
    const Database = nodeRequire('better-sqlite3');
    const { drizzle } = nodeRequire('drizzle-orm/better-sqlite3');
    const { migrate } = nodeRequire('drizzle-orm/better-sqlite3/migrator');

    const sqlitePath = resolveSqlitePath(env.SQLITE_PATH!);
    mkdirSync(dirname(sqlitePath), { recursive: true });
    const sqlite = new Database(sqlitePath);
    sqlite.pragma('foreign_keys = ON');
    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder });
    sqlite.close();
    console.log(`SQLite migrated at ${env.SQLITE_PATH}`);
  } else {
    const { neon } = nodeRequire('@neondatabase/serverless');
    const { drizzle } = nodeRequire('drizzle-orm/neon-http');
    const { migrate } = nodeRequire('drizzle-orm/neon-http/migrator');

    const sql = neon(env.DATABASE_URL!);
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder });
    console.log('Neon migrated');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
