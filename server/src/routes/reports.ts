import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db/index';
import { requireAuth, requireRole } from '../middleware/auth';

const r = Router();
r.use(requireAuth, requireRole('admin'));

r.get('/dashboard', async (_req, res) => {
  const db = getDb() as any;
  const all = await db.select().from(schema.volunteers);
  const totalVolunteers = all.length;
  const activeVolunteers = all.filter((v: any) => v.status === 'active').length;
  const pending = all.filter((v: any) => v.status === 'pending').length;
  const totalHours = all.reduce((s: number, v: any) => s + (v.totalHours || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const events = await db.select().from(schema.events);
  const upcoming = events.filter((e: any) => e.date >= today && e.status !== 'cancelled');
  const shifts = await db.select().from(schema.shifts);
  const openShifts = shifts.filter((s: any) => s.status === 'open').length;

  const att = await db.select().from(schema.attendance);
  const monthly = new Map<string, number>();
  for (const a of att) {
    if (!a.checkInTime) continue;
    const key = a.checkInTime.slice(0, 7);
    monthly.set(key, (monthly.get(key) || 0) + (a.totalHours || 0));
  }
  const hoursByMonth = [...monthly.entries()].sort().map(([month, hours]) => ({ month, hours }));

  res.json({
    totalVolunteers, activeVolunteers, pendingApplications: pending,
    upcomingEvents: upcoming.length, openShifts, totalHours,
    hoursByMonth,
    recentActivity: att.slice(-5).reverse(),
  });
});

r.get('/hours-by-volunteer', async (_req, res) => {
  const db = getDb() as any;
  const rows = await db.select().from(schema.volunteers);
  res.json(rows.map((v: any) => ({ id: v.id, name: `${v.firstName} ${v.lastName}`, totalHours: v.totalHours })));
});

r.get('/hours-by-event', async (_req, res) => {
  const db = getDb() as any;
  const events = await db.select().from(schema.events);
  const out = [];
  for (const e of events) {
    const att = await db.select().from(schema.attendance).where(eq(schema.attendance.eventId, e.id));
    const hours = att.reduce((s: number, a: any) => s + (a.totalHours || 0), 0);
    out.push({ id: e.id, name: e.name, hours, attendees: att.length });
  }
  res.json(out);
});

r.get('/export.csv', async (_req, res) => {
  const db = getDb() as any;
  const rows = await db.select().from(schema.volunteers);
  const header = 'id,firstName,lastName,email,status,totalHours\n';
  const csv = header + rows.map((v: any) => [v.id, v.firstName, v.lastName, v.email, v.status, v.totalHours].join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="volunteers.csv"');
  res.send(csv);
});

export default r;
