# VMS Plan — Tasks 10–17 (Backend APIs)

Companion to `2026-05-07-volunteer-management-system.md`. Each route module follows the same shape: Zod-validated body → Drizzle query → JSON response. Lists use `?search=&status=&skill=&availability=&eventId=` query params.

---

### Task 10: Volunteers CRUD API

**Files:**
- Create: `server/src/routes/volunteers.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/volunteers-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/volunteers-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  const login = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' });
  token = login.body.token;
});

describe('volunteers routes', () => {
  it('lists volunteers (admin)', async () => {
    const res = await request(app).get('/api/volunteers').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('rejects unauthenticated', async () => {
    const res = await request(app).get('/api/volunteers');
    expect(res.status).toBe(401);
  });

  it('creates and fetches a volunteer', async () => {
    const create = await request(app).post('/api/volunteers').set('Authorization', `Bearer ${token}`).send({
      firstName: 'Test', lastName: 'User', email: `t${Date.now()}@x.com`, status: 'pending',
    });
    expect(create.status).toBe(201);
    const id = create.body.id;
    const get = await request(app).get(`/api/volunteers/${id}`).set('Authorization', `Bearer ${token}`);
    expect(get.body.firstName).toBe('Test');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/routes/volunteers.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq, like, and, or, sql as dsql } from 'drizzle-orm';
import { getDb, schema } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const r = Router();
r.use(requireAuth);

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
  availability: z.record(z.any()).optional(),
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

r.get('/', async (req, res) => {
  const db = getDb() as any;
  const { search, status, skill } = req.query as Record<string, string | undefined>;
  const conds: any[] = [];
  if (search) conds.push(or(like(schema.volunteers.firstName, `%${search}%`), like(schema.volunteers.lastName, `%${search}%`), like(schema.volunteers.email, `%${search}%`)));
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

r.post('/public', validateBody(VolunteerInput), async (req, res) => {
  const db = getDb() as any;
  const [row] = await db.insert(schema.volunteers).values(toRow({ ...req.body, status: 'pending' })).returning();
  res.status(201).json(serialize(row));
});

export default r;
```

- [ ] **Step 4: Mount in `server/src/index.ts`**

Add after `authRoutes` import:

```ts
import volunteersRoutes from './routes/volunteers';
```

And inside `createApp()` after `app.use('/api/auth', authRoutes);`:

```ts
app.use('/api/volunteers', volunteersRoutes);
```

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/volunteers.ts server/src/index.ts server/tests/volunteers-routes.test.ts
git commit -m "feat(server): volunteers CRUD with filters + public registration endpoint"
```

---

### Task 11: Events CRUD API

**Files:**
- Create: `server/src/routes/events.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/events-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/events-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  token = (await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' })).body.token;
});

describe('events routes', () => {
  it('lists events', async () => {
    const res = await request(app).get('/api/events').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('creates an event', async () => {
    const res = await request(app).post('/api/events').set('Authorization', `Bearer ${token}`).send({
      name: 'New Event', date: '2026-07-01', startTime: '10:00', endTime: '14:00',
      location: 'Park', requiredVolunteers: 5, status: 'open',
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/routes/events.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
```

- [ ] **Step 4: Mount route**

In `server/src/index.ts` add `import eventsRoutes from './routes/events';` and `app.use('/api/events', eventsRoutes);`.

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/events.ts server/src/index.ts server/tests/events-routes.test.ts
git commit -m "feat(server): events CRUD"
```

---

### Task 12: Shifts API + assignments

**Files:**
- Create: `server/src/routes/shifts.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/shifts-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/shifts-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  token = (await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' })).body.token;
});

describe('shifts routes', () => {
  it('lists shifts', async () => {
    const res = await request(app).get('/api/shifts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/routes/shifts.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
    out.push({ ...s, assignedVolunteerIds: assigns.map((a: any) => a.volunteerId), openSpots: s.requiredVolunteers - assigns.length });
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
  const [row] = await db.insert(schema.shiftAssignments).values({ shiftId: Number(req.params.id), volunteerId: req.body.volunteerId }).returning();
  res.status(201).json(row);
});

r.delete('/:id/assign/:volunteerId', requireRole('admin'), async (req, res) => {
  const db = getDb() as any;
  await db.delete(schema.shiftAssignments).where(eq(schema.shiftAssignments.shiftId, Number(req.params.id)));
  res.status(204).end();
});

export default r;
```

- [ ] **Step 4: Mount route** — add `import shiftsRoutes from './routes/shifts';` and `app.use('/api/shifts', shiftsRoutes);` in `server/src/index.ts`.

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/shifts.ts server/src/index.ts server/tests/shifts-routes.test.ts
git commit -m "feat(server): shifts CRUD + assign/unassign"
```

---

### Task 13: Attendance API + hours calc

**Files:**
- Create: `server/src/lib/hours.ts`, `server/src/routes/attendance.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/hours.test.ts`, `server/tests/attendance-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/hours.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { calcHours } from '../src/lib/hours';

describe('calcHours', () => {
  it('returns 0 if either time missing', () => {
    expect(calcHours(null, '2026-01-01T10:00:00Z')).toBe(0);
    expect(calcHours('2026-01-01T09:00:00Z', null)).toBe(0);
  });
  it('computes diff in hours rounded to 2 decimals', () => {
    expect(calcHours('2026-01-01T09:00:00Z', '2026-01-01T13:30:00Z')).toBe(4.5);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/lib/hours.ts`**

```ts
export function calcHours(checkIn: string | null | undefined, checkOut: string | null | undefined): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.round((ms / 3_600_000) * 100) / 100;
}
```

- [ ] **Step 4: Run test, expect PASS**

- [ ] **Step 5: Implement `server/src/routes/attendance.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
    if (v) await db.update(schema.volunteers).set({ totalHours: v.totalHours + totalHours }).where(eq(schema.volunteers.id, v.id));
  }
  res.status(201).json(row);
});

r.put('/:id', requireRole('admin'), validateBody(Upsert.partial()), async (req, res) => {
  const db = getDb() as any;
  const [existing] = await db.select().from(schema.attendance).where(eq(schema.attendance.id, Number(req.params.id)));
  if (!existing) return res.status(404).json({ error: 'not found' });
  const merged = { ...existing, ...req.body };
  const totalHours = req.body.totalHours ?? calcHours(merged.checkInTime, merged.checkOutTime);
  const [row] = await db.update(schema.attendance).set({ ...req.body, totalHours }).where(eq(schema.attendance.id, existing.id)).returning();
  res.json(row);
});

export default r;
```

- [ ] **Step 6: Mount route** — `import attendanceRoutes from './routes/attendance';` and `app.use('/api/attendance', attendanceRoutes);` in `server/src/index.ts`.

- [ ] **Step 7: Failing test `server/tests/attendance-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  token = (await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' })).body.token;
});

describe('attendance routes', () => {
  it('lists attendance', async () => {
    const res = await request(app).get('/api/attendance').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 8: Run tests, expect PASS**

- [ ] **Step 9: Commit**

```bash
git add server/src/lib/hours.ts server/src/routes/attendance.ts server/src/index.ts server/tests
git commit -m "feat(server): attendance with auto hour calculation"
```

---

### Task 14: Messages API

**Files:**
- Create: `server/src/routes/messages.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Implement `server/src/routes/messages.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
```

- [ ] **Step 2: Mount route** — add to `server/src/index.ts`.

- [ ] **Step 3: Smoke test manually**

```bash
npm run dev:server
# in another shell:
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/messages | head
```

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/messages.ts server/src/index.ts
git commit -m "feat(server): messages list + send"
```

---

### Task 15: Reports aggregation API

**Files:**
- Create: `server/src/routes/reports.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/reports-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/reports-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any; let token: string;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  app = (await import('../src/index')).createApp();
  token = (await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' })).body.token;
});

describe('reports', () => {
  it('returns dashboard summary', async () => {
    const res = await request(app).get('/api/reports/dashboard').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalVolunteers).toBeGreaterThanOrEqual(0);
    expect(res.body.activeVolunteers).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.hoursByMonth)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/routes/reports.ts`**

```ts
import { Router } from 'express';
import { eq, sql, gte } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
```

- [ ] **Step 4: Mount route** in `server/src/index.ts`.

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/reports.ts server/src/index.ts server/tests/reports-routes.test.ts
git commit -m "feat(server): reports endpoints + CSV export"
```

---

### Task 16: Settings API

**Files:**
- Create: `server/src/routes/settings.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Implement `server/src/routes/settings.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
```

- [ ] **Step 2: Mount route** in `server/src/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/settings.ts server/src/index.ts
git commit -m "feat(server): settings get/update"
```

---

### Task 17: Uploads + storage driver factory

**Files:**
- Create: `server/src/storage/index.ts`, `server/src/storage/local.ts`, `server/src/storage/cloudinary.ts`, `server/src/routes/uploads.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: Implement `server/src/storage/local.ts`**

```ts
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../env';

mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

export const localUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
export const localPublicUrl = (filename: string) => `/uploads/${filename}`;
export const localUploadDir = env.UPLOAD_DIR;
export { join as joinPath };
```

- [ ] **Step 2: Implement `server/src/storage/cloudinary.ts`**

```ts
import multer from 'multer';
import { env } from '../env';

export const cloudinaryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function cloudinaryPut(buffer: Buffer, filename: string): Promise<string> {
  if (!env.CLOUDINARY_CLOUD_NAME) throw new Error('Cloudinary not configured');
  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('upload_preset', 'unsigned');
  const r = await fetch(url, { method: 'POST', body: form as any });
  if (!r.ok) throw new Error(`Cloudinary upload failed: ${r.status}`);
  const json = await r.json() as { secure_url: string };
  return json.secure_url;
}
```

- [ ] **Step 3: Implement `server/src/storage/index.ts`**

```ts
import { env } from '../env';
import { localUpload, localPublicUrl } from './local';
import { cloudinaryUpload, cloudinaryPut } from './cloudinary';
import type { Request } from 'express';

export const upload = env.STORAGE_DRIVER === 'local' ? localUpload : cloudinaryUpload;

export async function resolveUploadedUrl(req: Request): Promise<string | null> {
  const f = (req as any).file;
  if (!f) return null;
  if (env.STORAGE_DRIVER === 'local') return localPublicUrl(f.filename);
  return cloudinaryPut(f.buffer, f.originalname);
}
```

- [ ] **Step 4: Implement `server/src/routes/uploads.ts`**

```ts
import { Router } from 'express';
import { upload, resolveUploadedUrl } from '../storage';
import { requireAuth } from '../middleware/auth';

const r = Router();

r.post('/', requireAuth, upload.single('file'), async (req, res) => {
  const url = await resolveUploadedUrl(req);
  if (!url) return res.status(400).json({ error: 'no file' });
  res.status(201).json({ url });
});

export default r;
```

- [ ] **Step 5: Wire into `server/src/index.ts`**

```ts
import express from 'express';
import path from 'node:path';
import uploadsRoutes from './routes/uploads';
import settingsRoutes from './routes/settings';
import messagesRoutes from './routes/messages';
import reportsRoutes from './routes/reports';
import attendanceRoutes from './routes/attendance';
import shiftsRoutes from './routes/shifts';
import eventsRoutes from './routes/events';
import volunteersRoutes from './routes/volunteers';
// (existing imports remain)
```

Inside `createApp()` after json middleware, add:

```ts
if (env.STORAGE_DRIVER === 'local') app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));
```

Mount the remaining routes:

```ts
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadsRoutes);
```

- [ ] **Step 6: Smoke test**

```bash
npm run dev:server
curl -s http://localhost:4000/api/health
```

- [ ] **Step 7: Commit**

```bash
git add server/src
git commit -m "feat(server): file uploads with local/cloudinary driver factory"
```

---

**End of Tasks 10–17.** Continue with `2026-05-07-volunteer-management-system-tasks-18-22.md` (client scaffold + shell + login + dashboard).
