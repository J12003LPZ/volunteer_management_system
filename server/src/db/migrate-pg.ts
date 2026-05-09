import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import { getEnv } from '../env';

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(resolve(here, '..', '..', 'drizzle-pg', '0000_init.sql'), 'utf8');

const env = getEnv();
const db = neon(env.DATABASE_URL!);

const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
for (const stmt of statements) {
  await db.query(stmt);
}
console.log('Neon schema applied');
