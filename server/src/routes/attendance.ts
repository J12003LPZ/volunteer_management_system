import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { calcHours } from '../lib/hours';

const r = Router();
r.use(requireAuth);

r.get('/', async (req, res) => {
  const db = getDb() as any;
  const { eventId, volunteerId } = req.query as Record<string, string | undefined>;
  const conds: any[] = [];
  if (eventId) conds.push(eq(schema.attendance.eventId, Number(eventId)));
  if (volunteerId) conds.push(eq(schema.attendance.volunteerId, Number(volunteerId)));
  const rows = conds.length
    ? await db.select().from(schema.attendance).where(and(...conds))
    : await db.select().from(schema.attendance);
  res.json(rows);
});

const Upsert = z.object({
  volunteerId: z.number().int(),
  eventId: z.number().int(),
  shiftId: z.number().int().nullable().optional(),
  checkInTime: z.string().nullable().optional(),
  checkOutTime: z.string().nullable().optional(),
  status: z.enum(['present', 'absent', 'late', 'excused']).default('present'),
  notes: z.string().optional(),
  totalHours: z.number().optional(),
});

r.post('/', requireRole('admin'), validateBody(Upsert), async (req, res) => {
  const db = getDb() as any;
  const totalHours = req.body.totalHours ?? calcHours(req.body.checkInTime, req.body.checkOutTime);
  const [row] = await db.insert(schema.attendance).values({ ...req.body, totalHours }).returning();
  if (req.body.checkOutTime) {
    const [v] = await db.select().from(schema.volunteers).where(eq(schema.volunteers.id, req.body.volunteerId));
    if (v) {
      await db.update(schema.volunteers)
        .set({ totalHours: v.totalHours + totalHours })
        .where(eq(schema.volunteers.id, v.id));
    }
  }
  res.status(201).json(row);
});

r.put('/:id', requireRole('admin'), validateBody(Upsert.partial()), async (req, res) => {
  const db = getDb() as any;
  const [existing] = await db.select().from(schema.attendance).where(eq(schema.attendance.id, Number(req.params.id)));
  if (!existing) return res.status(404).json({ error: 'not found' });
  const merged = { ...existing, ...req.body };
  const totalHours = req.body.totalHours ?? calcHours(merged.checkInTime, merged.checkOutTime);
  const [row] = await db.update(schema.attendance)
    .set({ ...req.body, totalHours })
    .where(eq(schema.attendance.id, existing.id))
    .returning();
  res.json(row);
});

export default r;
