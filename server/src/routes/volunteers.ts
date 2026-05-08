import { Router } from 'express';
import { z } from 'zod';
import { eq, like, and, or } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();

const VolunteerInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availability: z.record(z.string(), z.any()).optional(),
  preferredDays: z.string().optional(),
  preferredTimes: z.string().optional(),
  previousExperience: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).default('pending'),
  notes: z.string().optional(),
  avatarUrl: z.string().optional(),
  documentUrl: z.string().optional(),
});

const serialize = (v: any) => ({
  ...v,
  skills: v.skills ? JSON.parse(v.skills) : [],
  interests: v.interests ? JSON.parse(v.interests) : [],
  languages: v.languages ? JSON.parse(v.languages) : [],
  availability: v.availability ? JSON.parse(v.availability) : {},
});

const toRow = (input: z.infer<typeof VolunteerInput>) => ({
  ...input,
  skills: input.skills ? JSON.stringify(input.skills) : null,
  interests: input.interests ? JSON.stringify(input.interests) : null,
  languages: input.languages ? JSON.stringify(input.languages) : null,
  availability: input.availability ? JSON.stringify(input.availability) : null,
});

// PUBLIC route (must come before requireAuth middleware below)
r.post('/public', validateBody(VolunteerInput), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.volunteers).values(toRow({ ...req.body, status: 'pending' })).returning();
  res.status(201).json(serialize(row));
});

// All routes below require auth
r.use(requireAuth);

r.get('/', async (req, res) => {
  const db = getDb() as any;
  const { search, status, skill } = req.query as Record<string, string | undefined>;
  const conds: any[] = [];
  if (search) conds.push(or(
    like(schema.volunteers.firstName, `%${search}%`),
    like(schema.volunteers.lastName, `%${search}%`),
    like(schema.volunteers.email, `%${search}%`)
  ));
  if (status) conds.push(eq(schema.volunteers.status, status as any));
  if (skill) conds.push(like(schema.volunteers.skills, `%${skill}%`));
  const rows = conds.length
    ? await db.select().from(schema.volunteers).where(and(...conds))
    : await db.select().from(schema.volunteers);
  res.json(rows.map(serialize));
});

r.get('/:id', async (req, res) => {
  const db = getDb() as any;
  const [v] = await db.select().from(schema.volunteers).where(eq(schema.volunteers.id, Number(req.params.id)));
  if (!v) return res.status(404).json({ error: 'not found' });
  res.json(serialize(v));
});

r.post('/', requireRole('admin'), validateBody(VolunteerInput), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.volunteers).values(toRow(req.body)).returning();
  res.status(201).json(serialize(row));
});

r.put('/:id', requireRole('admin'), validateBody(VolunteerInput.partial()), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.update(schema.volunteers).set(toRow(req.body as any)).where(eq(schema.volunteers.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(serialize(row));
});

r.delete('/:id', requireRole('admin'), async (req, res) => {
  const db = getDb() as any;
  await db.delete(schema.volunteers).where(eq(schema.volunteers.id, Number(req.params.id)));
  res.status(204).end();
});

export default r;
