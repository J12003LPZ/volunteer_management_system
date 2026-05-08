# VMS Plan — Tasks 1–9 (Backend Foundation)

Companion to `2026-05-07-volunteer-management-system.md`.

---

### Task 1: Restructure repo to monorepo

**Files:**
- Modify: `package.json` (root → workspaces)
- Create: `client/package.json`, `server/package.json`
- Move: `src/`, `index.html`, `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js`, `public/` into `client/`

- [ ] **Step 1: Create `/client` folder and move existing Vite app into it**

```bash
mkdir client
mv src public index.html vite.config.ts tsconfig.app.json tsconfig.node.json eslint.config.js client/
```

- [ ] **Step 2: Create `client/package.json`**

```json
{
  "name": "@vms/client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 3: Create `server/package.json`**

```json
{
  "name": "@vms/server",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:seed": "tsx src/db/seed.ts",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Replace root `package.json` with workspace config**

```json
{
  "name": "volunteer-management-system",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -k -n server,client -c blue,green \"npm:dev:server\" \"npm:dev:client\"",
    "dev:client": "npm --workspace @vms/client run dev",
    "dev:server": "npm --workspace @vms/server run dev",
    "build": "npm --workspace @vms/client run build && npm --workspace @vms/server run build",
    "db:migrate": "npm --workspace @vms/server run db:migrate",
    "db:seed": "npm --workspace @vms/server run db:seed",
    "test": "npm --workspace @vms/client run test && npm --workspace @vms/server run test"
  },
  "devDependencies": {
    "concurrently": "^9.0.1"
  }
}
```

- [ ] **Step 5: Adjust `client/tsconfig.json` paths**

Open existing `client/tsconfig.json` (was root `tsconfig.json`) and confirm `references` point to `./tsconfig.app.json` and `./tsconfig.node.json`. Move root `tsconfig.json` into `client/`.

- [ ] **Step 6: Install root dev dep + verify install**

```bash
npm install
```

Expected: workspaces install without error; `node_modules/@vms` not present (workspaces are linked by name).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: restructure into npm workspaces (client + server)"
```

---

### Task 2: Root `.env` and `.env.example`

**Files:**
- Create: `.env.example`, `.env`
- Modify: `.gitignore`

- [ ] **Step 1: Create `.env.example`**

```
# DB driver: "sqlite" (local file) or "neon" (cloud Postgres)
DB_DRIVER=sqlite
SQLITE_PATH=./server/data/vms.db
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Auth
JWT_SECRET=replace-me-with-a-long-random-string
JWT_EXPIRES_IN=7d

# Storage driver: "local" or "cloudinary"
STORAGE_DRIVER=local
UPLOAD_DIR=./server/uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Server
PORT=4000
CLIENT_URL=http://localhost:5173
```

- [ ] **Step 2: Copy to `.env`**

```bash
cp .env.example .env
```

Then open `.env` and replace `JWT_SECRET` with a random 64-char string.

- [ ] **Step 3: Update `.gitignore`**

Append:

```
.env
server/data/
server/uploads/
server/dist/
client/dist/
```

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add env config with DB and storage driver toggles"
```

---

### Task 3: Server scaffold + env validation

**Files:**
- Create: `server/tsconfig.json`, `server/src/index.ts`, `server/src/env.ts`
- Test: `server/tests/env.test.ts`

- [ ] **Step 1: Install server deps**

```bash
npm --workspace @vms/server install express cors dotenv zod jsonwebtoken bcrypt multer drizzle-orm better-sqlite3 @neondatabase/serverless
npm --workspace @vms/server install -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcrypt @types/multer @types/better-sqlite3 vitest supertest @types/supertest drizzle-kit
```

- [ ] **Step 2: Create `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 3: Write failing test `server/tests/env.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { loadEnv } from '../src/env';

describe('loadEnv', () => {
  it('parses sqlite driver config', () => {
    const env = loadEnv({
      DB_DRIVER: 'sqlite',
      SQLITE_PATH: './data/test.db',
      JWT_SECRET: 'a'.repeat(32),
      STORAGE_DRIVER: 'local',
      UPLOAD_DIR: './uploads',
      PORT: '4000',
      CLIENT_URL: 'http://localhost:5173',
    });
    expect(env.DB_DRIVER).toBe('sqlite');
    expect(env.PORT).toBe(4000);
  });

  it('rejects short JWT_SECRET', () => {
    expect(() =>
      loadEnv({
        DB_DRIVER: 'sqlite',
        SQLITE_PATH: './x.db',
        JWT_SECRET: 'short',
        STORAGE_DRIVER: 'local',
        UPLOAD_DIR: './up',
        PORT: '4000',
        CLIENT_URL: 'http://localhost:5173',
      })
    ).toThrow();
  });
});
```

- [ ] **Step 4: Run test, expect FAIL**

```bash
npm --workspace @vms/server test
```

Expected: cannot find module `../src/env`.

- [ ] **Step 5: Implement `server/src/env.ts`**

```ts
import { z } from 'zod';
import 'dotenv/config';

const Schema = z.object({
  DB_DRIVER: z.enum(['sqlite', 'neon']),
  SQLITE_PATH: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  STORAGE_DRIVER: z.enum(['local', 'cloudinary']),
  UPLOAD_DIR: z.string().default('./uploads'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof Schema>;

export function loadEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Env {
  const parsed = Schema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid env: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
  }
  const env = parsed.data;
  if (env.DB_DRIVER === 'sqlite' && !env.SQLITE_PATH) {
    throw new Error('SQLITE_PATH required when DB_DRIVER=sqlite');
  }
  if (env.DB_DRIVER === 'neon' && !env.DATABASE_URL) {
    throw new Error('DATABASE_URL required when DB_DRIVER=neon');
  }
  if (env.STORAGE_DRIVER === 'cloudinary' && (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)) {
    throw new Error('CLOUDINARY_* required when STORAGE_DRIVER=cloudinary');
  }
  return env;
}

export const env = loadEnv();
```

- [ ] **Step 6: Run tests, expect PASS**

```bash
npm --workspace @vms/server test
```

- [ ] **Step 7: Create `server/src/index.ts`**

```ts
import express from 'express';
import cors from 'cors';
import { env } from './env';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, driver: env.DB_DRIVER }));
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createApp();
  app.listen(env.PORT, () => console.log(`API on :${env.PORT} (db=${env.DB_DRIVER})`));
}
```

- [ ] **Step 8: Smoke run**

```bash
npm run dev:server
```

In another terminal: `curl http://localhost:4000/api/health` → `{"ok":true,"driver":"sqlite"}`. Stop server with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add server tsconfig*.json package.json package-lock.json
git commit -m "feat(server): scaffold Express app with validated env"
```

---

### Task 4: Drizzle schema (all tables)

**Files:**
- Create: `server/src/db/schema.ts`, `server/drizzle.config.ts`
- Test: `server/tests/schema.test.ts`

- [ ] **Step 1: Failing test `server/tests/schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import * as schema from '../src/db/schema';

describe('schema exports', () => {
  it('exports every table', () => {
    for (const name of [
      'users', 'volunteers', 'events', 'shifts',
      'shiftAssignments', 'attendance', 'messages', 'settings'
    ]) {
      expect((schema as Record<string, unknown>)[name]).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: Run test, expect FAIL** — `npm --workspace @vms/server test`

- [ ] **Step 3: Implement `server/src/db/schema.ts`**

Use SQLite-flavored Drizzle (works with both via the driver factory in Task 5; we mirror types).

```ts
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'volunteer'] }).notNull().default('volunteer'),
  volunteerId: integer('volunteer_id'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const volunteers = sqliteTable('volunteers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  dateOfBirth: text('date_of_birth'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  skills: text('skills'),         // JSON array string
  interests: text('interests'),   // JSON array string
  languages: text('languages'),   // JSON array string
  availability: text('availability'), // JSON object string
  preferredDays: text('preferred_days'),
  preferredTimes: text('preferred_times'),
  previousExperience: text('previous_experience'),
  status: text('status', { enum: ['active', 'pending', 'inactive'] }).notNull().default('pending'),
  totalHours: real('total_hours').notNull().default(0),
  notes: text('notes'),
  avatarUrl: text('avatar_url'),
  documentUrl: text('document_url'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  date: text('date').notNull(),       // YYYY-MM-DD
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  location: text('location'),
  description: text('description'),
  requiredVolunteers: integer('required_volunteers').notNull().default(0),
  status: text('status', { enum: ['draft', 'open', 'full', 'completed', 'cancelled'] }).notNull().default('draft'),
  coordinator: text('coordinator'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shifts = sqliteTable('shifts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  requiredVolunteers: integer('required_volunteers').notNull().default(1),
  status: text('status', { enum: ['open', 'full', 'completed', 'cancelled'] }).notNull().default('open'),
});

export const shiftAssignments = sqliteTable('shift_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  shiftId: integer('shift_id').notNull().references(() => shifts.id, { onDelete: 'cascade' }),
  volunteerId: integer('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  volunteerId: integer('volunteer_id').notNull().references(() => volunteers.id, { onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  shiftId: integer('shift_id').references(() => shifts.id, { onDelete: 'set null' }),
  checkInTime: text('check_in_time'),
  checkOutTime: text('check_out_time'),
  totalHours: real('total_hours').notNull().default(0),
  status: text('status', { enum: ['present', 'absent', 'late', 'excused'] }).notNull().default('absent'),
  notes: text('notes'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  scope: text('scope', { enum: ['individual', 'event', 'all'] }).notNull(),
  recipientVolunteerId: integer('recipient_volunteer_id').references(() => volunteers.id, { onDelete: 'set null' }),
  recipientEventId: integer('recipient_event_id').references(() => events.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  sentAt: text('sent_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationName: text('organization_name').notNull().default('VolunteerHub'),
  logoUrl: text('logo_url'),
  volunteerStatuses: text('volunteer_statuses').notNull().default('["active","pending","inactive"]'),
  eventCategories: text('event_categories').notNull().default('[]'),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
});
```

- [ ] **Step 4: Create `server/drizzle.config.ts`**

```ts
import type { Config } from 'drizzle-kit';
import { env } from './src/env';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: env.DB_DRIVER === 'neon' ? 'postgresql' : 'sqlite',
  dbCredentials: env.DB_DRIVER === 'neon'
    ? { url: env.DATABASE_URL! }
    : { url: env.SQLITE_PATH! },
} satisfies Config;
```

- [ ] **Step 5: Run tests, expect PASS** — `npm --workspace @vms/server test`

- [ ] **Step 6: Commit**

```bash
git add server/src/db/schema.ts server/drizzle.config.ts server/tests/schema.test.ts
git commit -m "feat(server): drizzle schema for all VMS tables"
```

---

### Task 5: DB driver factory (SQLite + Neon)

**Files:**
- Create: `server/src/db/index.ts`
- Test: `server/tests/db-factory.test.ts`

- [ ] **Step 1: Failing test `server/tests/db-factory.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

beforeAll(() => {
  process.env.DB_DRIVER = 'sqlite';
  process.env.SQLITE_PATH = './server/data/test-factory.db';
  process.env.JWT_SECRET = 'a'.repeat(40);
  process.env.STORAGE_DRIVER = 'local';
  process.env.UPLOAD_DIR = './uploads';
  process.env.PORT = '4000';
  process.env.CLIENT_URL = 'http://localhost:5173';
  mkdirSync(dirname(process.env.SQLITE_PATH!), { recursive: true });
});

describe('db factory', () => {
  it('returns a drizzle instance for sqlite', async () => {
    const { getDb } = await import('../src/db/index');
    const db = getDb();
    expect(db).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/db/index.ts`**

```ts
import { env } from '../env';
import * as schema from './schema';

type Db = unknown;
let cached: Db | null = null;

export function getDb() {
  if (cached) return cached;
  if (env.DB_DRIVER === 'sqlite') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');
    const sqlite = new Database(env.SQLITE_PATH!);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    cached = drizzle(sqlite, { schema });
  } else {
    const { neon } = require('@neondatabase/serverless');
    const { drizzle } = require('drizzle-orm/neon-http');
    const sql = neon(env.DATABASE_URL!);
    cached = drizzle(sql, { schema });
  }
  return cached;
}

export { schema };
```

- [ ] **Step 4: Run test, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add server/src/db/index.ts server/tests/db-factory.test.ts
git commit -m "feat(server): db factory switches sqlite/neon via env"
```

---

### Task 6: Migrations runner

**Files:**
- Create: `server/src/db/migrate.ts`

- [ ] **Step 1: Generate initial migration**

```bash
npm --workspace @vms/server run db:generate
```

Expected: `server/drizzle/0000_*.sql` files appear.

- [ ] **Step 2: Implement `server/src/db/migrate.ts`**

```ts
import { env } from '../env';

async function main() {
  if (env.DB_DRIVER === 'sqlite') {
    const Database = (await import('better-sqlite3')).default;
    const { drizzle } = await import('drizzle-orm/better-sqlite3');
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    const { mkdirSync } = await import('node:fs');
    const { dirname } = await import('node:path');
    mkdirSync(dirname(env.SQLITE_PATH!), { recursive: true });
    const sqlite = new Database(env.SQLITE_PATH!);
    sqlite.pragma('foreign_keys = ON');
    const db = drizzle(sqlite);
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('SQLite migrated');
  } else {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    const { migrate } = await import('drizzle-orm/neon-http/migrator');
    const sql = neon(env.DATABASE_URL!);
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Neon migrated');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run migration**

```bash
npm run db:migrate
```

Expected: `SQLite migrated`. File `server/data/vms.db` created.

- [ ] **Step 4: Commit**

```bash
git add server/src/db/migrate.ts server/drizzle
git commit -m "feat(server): db migrations runner for sqlite + neon"
```

---

### Task 7: Seed script with sample data

**Files:**
- Create: `server/src/db/seed.ts`

- [ ] **Step 1: Implement `server/src/db/seed.ts`**

```ts
import { getDb, schema } from './index';
import bcrypt from 'bcrypt';

async function main() {
  const db = getDb() as any;

  await db.delete(schema.attendance);
  await db.delete(schema.shiftAssignments);
  await db.delete(schema.shifts);
  await db.delete(schema.events);
  await db.delete(schema.messages);
  await db.delete(schema.users);
  await db.delete(schema.volunteers);
  await db.delete(schema.settings);

  await db.insert(schema.settings).values({ organizationName: 'VolunteerHub' });

  const adminHash = await bcrypt.hash('admin123', 10);
  await db.insert(schema.users).values({
    email: 'admin@vms.local', passwordHash: adminHash, role: 'admin',
  });

  const volunteerSeed = [
    ['Maria', 'Garcia', 'maria@example.com', 'active'],
    ['James', 'Lee', 'james@example.com', 'active'],
    ['Aisha', 'Khan', 'aisha@example.com', 'pending'],
    ['Carlos', 'Rivera', 'carlos@example.com', 'active'],
    ['Priya', 'Patel', 'priya@example.com', 'inactive'],
    ['Tomas', 'Nguyen', 'tomas@example.com', 'active'],
    ['Hannah', 'Smith', 'hannah@example.com', 'pending'],
    ['Diego', 'Lopez', 'diego@example.com', 'active'],
  ] as const;

  const vols: number[] = [];
  for (const [first, last, email, status] of volunteerSeed) {
    const result = await db.insert(schema.volunteers).values({
      firstName: first, lastName: last, email,
      phone: '555-0100', city: 'Springfield', state: 'IL',
      skills: JSON.stringify(['Event Setup', 'Tutoring']),
      interests: JSON.stringify(['Education', 'Community']),
      languages: JSON.stringify(['English']),
      availability: JSON.stringify({ weekdays: true, weekends: true }),
      status, totalHours: Math.floor(Math.random() * 80),
    }).returning({ id: schema.volunteers.id });
    vols.push((result as any[])[0].id);
  }

  const eventSeed = [
    ['Community Garden Cleanup', '2026-05-15', 'open', 8],
    ['Food Bank Distribution', '2026-05-22', 'open', 12],
    ['Senior Center Visit', '2026-05-29', 'full', 6],
    ['Beach Cleanup', '2026-04-10', 'completed', 20],
    ['Library Book Drive', '2026-06-05', 'draft', 10],
  ] as const;

  const eventIds: number[] = [];
  for (const [name, date, status, req] of eventSeed) {
    const result = await db.insert(schema.events).values({
      name, date, startTime: '09:00', endTime: '13:00',
      location: 'Community Center',
      description: `Help us with ${name.toLowerCase()}.`,
      requiredVolunteers: req, status, coordinator: 'Sarah Johnson',
    }).returning({ id: schema.events.id });
    eventIds.push((result as any[])[0].id);
  }

  for (const eid of eventIds.slice(0, 3)) {
    const shift = await db.insert(schema.shifts).values({
      eventId: eid, name: 'Morning Shift',
      date: '2026-05-15', startTime: '09:00', endTime: '13:00',
      requiredVolunteers: 4, status: 'open',
    }).returning({ id: schema.shifts.id });
    const sid = (shift as any[])[0].id;
    for (const vid of vols.slice(0, 3)) {
      await db.insert(schema.shiftAssignments).values({ shiftId: sid, volunteerId: vid });
    }
  }

  for (const vid of vols.slice(0, 5)) {
    await db.insert(schema.attendance).values({
      volunteerId: vid, eventId: eventIds[3], shiftId: null,
      checkInTime: '2026-04-10T09:00:00Z',
      checkOutTime: '2026-04-10T13:00:00Z',
      totalHours: 4, status: 'present',
    });
  }

  await db.insert(schema.messages).values([
    { scope: 'all', subject: 'Welcome!', body: 'Welcome to VolunteerHub.' },
    { scope: 'event', recipientEventId: eventIds[0], subject: 'Reminder', body: 'See you Saturday!' },
  ]);

  console.log('Seed complete. Admin: admin@vms.local / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `Seed complete. Admin: admin@vms.local / admin123`.

- [ ] **Step 3: Commit**

```bash
git add server/src/db/seed.ts
git commit -m "feat(server): seed script with sample volunteers, events, shifts, attendance"
```

---

### Task 8: Auth lib + middleware

**Files:**
- Create: `server/src/lib/hash.ts`, `server/src/lib/jwt.ts`, `server/src/middleware/auth.ts`, `server/src/middleware/error.ts`, `server/src/middleware/validate.ts`
- Test: `server/tests/auth-lib.test.ts`

- [ ] **Step 1: Failing test `server/tests/auth-lib.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/test.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
});

describe('auth lib', () => {
  it('hashes and verifies passwords', async () => {
    const { hashPassword, verifyPassword } = await import('../src/lib/hash');
    const h = await hashPassword('hunter2');
    expect(await verifyPassword('hunter2', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
  });

  it('signs and verifies JWTs', async () => {
    const { signToken, verifyToken } = await import('../src/lib/jwt');
    const t = signToken({ userId: 1, role: 'admin' });
    const claims = verifyToken(t);
    expect(claims.userId).toBe(1);
    expect(claims.role).toBe('admin');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/lib/hash.ts`**

```ts
import bcrypt from 'bcrypt';
export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);
```

- [ ] **Step 4: Implement `server/src/lib/jwt.ts`**

```ts
import jwt from 'jsonwebtoken';
import { env } from '../env';

export type Claims = { userId: number; role: 'admin' | 'volunteer'; volunteerId?: number };

export function signToken(c: Claims): string {
  return jwt.sign(c, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(t: string): Claims {
  return jwt.verify(t, env.JWT_SECRET) as Claims;
}
```

- [ ] **Step 5: Implement `server/src/middleware/auth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type Claims } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: Claims } }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = verifyToken(h.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

export function requireRole(role: 'admin' | 'volunteer') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}
```

- [ ] **Step 6: Implement `server/src/middleware/error.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'validation', issues: err.flatten().fieldErrors });
  }
  console.error(err);
  res.status(500).json({ error: 'internal' });
}
```

- [ ] **Step 7: Implement `server/src/middleware/validate.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
```

- [ ] **Step 8: Run tests, expect PASS** — `npm --workspace @vms/server test`

- [ ] **Step 9: Commit**

```bash
git add server/src/lib server/src/middleware server/tests/auth-lib.test.ts
git commit -m "feat(server): auth + validation + error middleware"
```

---

### Task 9: Auth routes

**Files:**
- Create: `server/src/routes/auth.ts`
- Modify: `server/src/index.ts`
- Test: `server/tests/auth-routes.test.ts`

- [ ] **Step 1: Failing test `server/tests/auth-routes.test.ts`**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app: any;

beforeAll(async () => {
  process.env.DB_DRIVER ||= 'sqlite';
  process.env.SQLITE_PATH ||= './server/data/vms.db';
  process.env.JWT_SECRET ||= 'x'.repeat(40);
  process.env.STORAGE_DRIVER ||= 'local';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.PORT ||= '4000';
  process.env.CLIENT_URL ||= 'http://localhost:5173';
  const mod = await import('../src/index');
  app = mod.createApp();
});

describe('POST /api/auth/login', () => {
  it('rejects bad credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns a token for the seeded admin', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@vms.local', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

- [ ] **Step 3: Implement `server/src/routes/auth.ts`**

```ts
import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '../db';
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
```

- [ ] **Step 4: Wire into `server/src/index.ts`**

Replace the `createApp` body to mount routes and the error handler:

```ts
import express from 'express';
import cors from 'cors';
import { env } from './env';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/error';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true, driver: env.DB_DRIVER }));
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createApp();
  app.listen(env.PORT, () => console.log(`API on :${env.PORT} (db=${env.DB_DRIVER})`));
}
```

- [ ] **Step 5: Run tests, expect PASS** — `npm --workspace @vms/server test`

- [ ] **Step 6: Commit**

```bash
git add server/src/routes/auth.ts server/src/index.ts server/tests/auth-routes.test.ts
git commit -m "feat(server): auth routes (login, register, me)"
```

---

**End of Tasks 1–9.** Continue with `2026-05-07-volunteer-management-system-tasks-10-17.md` (backend APIs).
