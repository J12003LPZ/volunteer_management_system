import { Router } from 'express';
import { upload, resolveUploadedUrl } from '../storage/index';
import { requireAuth } from '../middleware/auth';

const r = Router();

r.post('/', requireAuth, upload.single('file'), async (req, res) => {
  const url = await resolveUploadedUrl(req);
  if (!url) return res.status(400).json({ error: 'no file' });
  res.status(201).json({ url });
});

export default r;
