import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

const serialize = (row: any) => ({
  ...row,
  volunteerStatuses: row.volunteerStatuses ? JSON.parse(row.volunteerStatuses) : [],
  eventCategories: row.eventCategories ? JSON.parse(row.eventCategories) : [],
});

r.get('/', async (_req, res) => {
  const db = getDb() as any;
  const [row] = await db.select().from(schema.settings).limit(1);
  if (!row) {
    const [created] = await db.insert(schema.settings).values({}).returning();
    return res.json(serialize(created));
  }
  res.json(serialize(row));
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
    return res.json(serialize(created));
  }
  const [row] = await db.update(schema.settings).set(patch).where(eq(schema.settings.id, existing.id)).returning();
  res.json(serialize(row));
});

export default r;
