import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { hashPassword, verifyPassword } from '../lib/hash';
import { signToken } from '../lib/jwt';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const r = Router();

r.post('/login', validateBody(z.object({ email: z.string().email(), password: z.string().min(1) })), async (req, res) => {
  const db = getDb() as any;
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, req.body.email));
  if (!user || !(await verifyPassword(req.body.password, user.passwordHash))) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = signToken({ userId: user.id, role: user.role, volunteerId: user.volunteerId ?? undefined });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, volunteerId: user.volunteerId } });
});

r.post('/register', validateBody(z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})), async (req, res) => {
  const db = getDb() as any;
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, req.body.email));
  if (existing) return res.status(409).json({ error: 'email taken' });
  const [vol] = await db.insert(schema.volunteers).values({
    firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, status: 'pending',
  }).returning({ id: schema.volunteers.id });
  const passwordHash = await hashPassword(req.body.password);
  const [user] = await db.insert(schema.users).values({
    email: req.body.email, passwordHash, role: 'volunteer', volunteerId: vol.id,
  }).returning({ id: schema.users.id, email: schema.users.email, role: schema.users.role, volunteerId: schema.users.volunteerId });
  const token = signToken({ userId: user.id, role: user.role, volunteerId: user.volunteerId ?? undefined });
  res.status(201).json({ token, user });
});

r.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

export default r;
