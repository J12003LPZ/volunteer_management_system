import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

r.get('/', async (_req, res) => {
  const db = getDb() as any;
  const [row] = await db.select().from(schema.settings).limit(1);
  if (!row) {
    const [created] = await db.insert(schema.settings).values({}).returning();
    return res.json(created);
  }
  res.json(row);
});

const Input = z.object({
  organizationName: z.string().min(1).optional(),
  logoUrl: z.string().nullable().optional(),
  volunteerStatuses: z.array(z.string()).optional(),
  eventCategories: z.array(z.string()).optional(),
  notificationsEnabled: z.boolean().optional(),
});

r.put('/', requireRole('admin'), validateBody(Input), async (req, res) => {
  const db = getDb() as any;
  const patch: any = { ...req.body };
  if (patch.volunteerStatuses) patch.volunteerStatuses = JSON.stringify(patch.volunteerStatuses);
  if (patch.eventCategories) patch.eventCategories = JSON.stringify(patch.eventCategories);
  const [existing] = await db.select().from(schema.settings).limit(1);
  if (!existing) {
    const [created] = await db.insert(schema.settings).values(patch).returning();
    return res.json(created);
  }
  const [row] = await db.update(schema.settings).set(patch).where(eq(schema.settings.id, existing.id)).returning();
  res.json(row);
});

export default r;
