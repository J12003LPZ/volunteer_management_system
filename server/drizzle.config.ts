import type { Config } from 'drizzle-kit';
import { getEnv } from './src/env';

const env = getEnv();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: env.DB_DRIVER === 'neon' ? 'postgresql' : 'sqlite',
  dbCredentials: env.DB_DRIVER === 'neon'
    ? { url: env.DATABASE_URL! }
    : { url: env.SQLITE_PATH! },
} satisfies Config;
