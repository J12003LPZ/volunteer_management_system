import multer from 'multer';
import { getEnv } from '../env';

export const cloudinaryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function cloudinaryPut(buffer: Buffer, filename: string): Promise<string> {
  const env = getEnv();
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('Cloudinary not configured');
  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(buffer)]), filename);
  form.append('upload_preset', 'unsigned');
  const r = await fetch(url, { method: 'POST', body: form as any });
  if (!r.ok) throw new Error(`Cloudinary upload failed: ${r.status}`);
  const json = await r.json() as { secure_url: string };
  return json.secure_url;
}
