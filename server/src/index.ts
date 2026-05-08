import express from 'express';
import cors from 'cors';
import { pathToFileURL } from 'node:url';
import { env } from './env';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, driver: env.DB_DRIVER }));
  return app;
}

// Cross-platform entrypoint check (Windows-safe).
const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const app = createApp();
  app.listen(env.PORT, () => console.log(`API on :${env.PORT} (db=${env.DB_DRIVER})`));
}
