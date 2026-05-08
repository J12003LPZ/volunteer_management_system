import type { Request } from 'express';
import { getEnv } from '../env';
import { localUpload, localPublicUrl } from './local';
import { cloudinaryUpload, cloudinaryPut } from './cloudinary';

const env = getEnv();

export const upload = env.STORAGE_DRIVER === 'local' ? localUpload : cloudinaryUpload;

export async function resolveUploadedUrl(req: Request): Promise<string | null> {
  const f = (req as any).file;
  if (!f) return null;
  if (env.STORAGE_DRIVER === 'local') return localPublicUrl(f.filename);
  return cloudinaryPut(f.buffer, f.originalname);
}
