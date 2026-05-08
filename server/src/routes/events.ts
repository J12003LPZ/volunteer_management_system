import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

const EventInput = z.object({
  name: z.string().min(1),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  requiredVolunteers: z.number().int().min(0).default(0),
  status: z.enum(['draft', 'open', 'full', 'completed', 'cancelled']).default('draft'),
  coordinator: z.string().optional(),
  notes: z.string().optional(),
});

r.get('/', async (req, res) => {
  const db = getDb() as any;
  const { status } = req.query as Record<string, string | undefined>;
  const rows = status
    ? await db.select().from(schema.events).where(eq(schema.events.status, status as any))
    : await db.select().from(schema.events);
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.select().from(schema.events).where(eq(schema.events.id, Number(req.params.id)));
  if (!row) return res.status(404).json({ error: 'not found' });
  const sh = await db.select().from(schema.shifts).where(eq(schema.shifts.eventId, row.id));
  const att = await db.select().from(schema.attendance).where(eq(schema.attendance.eventId, row.id));
  res.json({ ...row, shifts: sh, attendance: att });
});

r.post('/', requireRole('admin'), validateBody(EventInput), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.events).values(req.body).returning();
  res.status(201).json(row);
});

r.put('/:id', requireRole('admin'), validateBody(EventInput.partial()), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.update(schema.events).set(req.body).where(eq(schema.events.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

r.delete('/:id', requireRole('admin'), async (req, res) => {
  const db = getDb() as any;
  await db.delete(schema.events).where(eq(schema.events.id, Number(req.params.id)));
  res.status(204).end();
});

export default r;
