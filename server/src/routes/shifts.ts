import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

const ShiftInput = z.object({
  eventId: z.number().int(),
  name: z.string().min(1),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  requiredVolunteers: z.number().int().min(1).default(1),
  status: z.enum(['open', 'full', 'completed', 'cancelled']).default('open'),
});

r.get('/', async (req, res) => {
  const db = getDb() as any;
  const { eventId } = req.query as Record<string, string | undefined>;
  const rows = eventId
    ? await db.select().from(schema.shifts).where(eq(schema.shifts.eventId, Number(eventId)))
    : await db.select().from(schema.shifts);
  const out = [];
  for (const s of rows) {
    const assigns = await db.select().from(schema.shiftAssignments).where(eq(schema.shiftAssignments.shiftId, s.id));
    out.push({
      ...s,
      assignedVolunteerIds: assigns.map((a: any) => a.volunteerId),
      openSpots: s.requiredVolunteers - assigns.length,
    });
  }
  res.json(out);
});

r.post('/', requireRole('admin'), validateBody(ShiftInput), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.shifts).values(req.body).returning();
  res.status(201).json(row);
});

r.put('/:id', requireRole('admin'), validateBody(ShiftInput.partial()), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.update(schema.shifts).set(req.body).where(eq(schema.shifts.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

r.delete('/:id', requireRole('admin'), async (req, res) => {
  const db = getDb() as any;
  await db.delete(schema.shifts).where(eq(schema.shifts.id, Number(req.params.id)));
  res.status(204).end();
});

r.post('/:id/assign', requireRole('admin'), validateBody(z.object({ volunteerId: z.number().int() })), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.shiftAssignments).values({
    shiftId: Number(req.params.id),
    volunteerId: req.body.volunteerId,
  }).returning();
  res.status(201).json(row);
});

r.delete('/:id/assign/:volunteerId', requireRole('admin'), async (req, res) => {
  const db = getDb() as any;
  await db.delete(schema.shiftAssignments).where(and(
    eq(schema.shiftAssignments.shiftId, Number(req.params.id)),
    eq(schema.shiftAssignments.volunteerId, Number(req.params.volunteerId)),
  ));
  res.status(204).end();
});

export default r;
