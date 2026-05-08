import express from 'express';
import cors from 'cors';
import { pathToFileURL } from 'node:url';
import { getEnv } from './env';
import authRoutes from './routes/auth';
import volunteersRoutes from './routes/volunteers';
import eventsRoutes from './routes/events';
import shiftsRoutes from './routes/shifts';
import attendanceRoutes from './routes/attendance';
import messagesRoutes from './routes/messages';
import reportsRoutes from './routes/reports';
import { errorHandler } from './middleware/error';

export function createApp() {
  const env = getEnv();
  const app = express();
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, driver: env.DB_DRIVER }));
  app.use('/api/auth', authRoutes);
  app.use('/api/volunteers', volunteersRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/shifts', shiftsRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use(errorHandler);
  return app;
}

// Cross-platform entrypoint check (Windows-safe).
const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const env = getEnv();
  const app = createApp();
  app.listen(env.PORT, () => console.log(`API on :${env.PORT} (db=${env.DB_DRIVER})`));
}
