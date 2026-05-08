import { Router } from 'express';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

const Input = z.object({
  scope: z.enum(['individual', 'event', 'all']),
  recipientVolunteerId: z.number().int().nullable().optional(),
  recipientEventId: z.number().int().nullable().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

r.get('/', async (_req, res) => {
  const db = getDb() as any;
  const rows = await db.select().from(schema.messages).orderBy(desc(schema.messages.sentAt));
  res.json(rows);
});

r.post('/', requireRole('admin'), validateBody(Input), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.messages).values(req.body).returning();
  res.status(201).json(row);
});

export default r;
