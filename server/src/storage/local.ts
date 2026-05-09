import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEnv } from '../env';

// Resolve UPLOAD_DIR relative to repo root, similar to SQLITE_PATH handling.
function resolveUploadDir(): string {
  const env = getEnv();
  if (!env.UPLOAD_DIR) return resolve(process.cwd(), 'uploads');
  if (env.UPLOAD_DIR.startsWith('.')) {
    try {
      const here = fileURLToPath(import.meta.url);
      const repoRoot = resolve(here, '..', '..', '..', '..');
      return resolve(repoRoot, env.UPLOAD_DIR);
    } catch {
      return resolve(process.cwd(), env.UPLOAD_DIR);
    }
  }
  return env.UPLOAD_DIR;
}

export const localUploadDir = resolveUploadDir();
try { mkdirSync(localUploadDir, { recursive: true }); } catch { /* read-only fs on Vercel */ }

const storage = multer.diskStorage({
  destination: localUploadDir,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

export const localUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
export const localPublicUrl = (filename: string) => `/uploads/${filename}`;
