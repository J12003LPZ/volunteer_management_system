# Volunteer Management System

A full-stack volunteer management web app. React + TypeScript + Tailwind on the client, Express + Drizzle ORM on the server. The database driver and storage driver are switched via `.env` — run locally on SQLite or in the cloud on Neon Postgres without code changes.

## Quick start

```bash
git clone <repo>
cd volunteer_management_system
cp .env.example .env
# Open .env and set JWT_SECRET to a random 64-char string
# (e.g. node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:5173. Log in with `admin@vms.local` / `admin123`.

## Switching to Neon Postgres

In `.env`:

```
DB_DRIVER=neon
DATABASE_URL=postgres://user:pass@host/db?sslmode=require
```

Then `npm run db:migrate && npm run db:seed`.

## Switching to Cloudinary uploads

```
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The local-disk driver writes to `server/uploads/` (gitignored).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts API on :4000 and client on :5173 concurrently |
| `npm run dev:server` | API only |
| `npm run dev:client` | Client only |
| `npm run build` | Production build of both packages |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:seed` | Wipe and reseed sample data |
| `npm run test` | Unit + integration tests (server vitest + client vitest) |
| `npm run e2e` | Playwright smoke test |

## Architecture

- `client/` — Vite + React + TS + Tailwind + shadcn/ui + Recharts + React Router + Zustand + TanStack Query + RHF + Zod
- `server/` — Express + Drizzle ORM + JWT + bcrypt + multer
  - DB driver factory at `server/src/db/index.ts` chooses better-sqlite3 or @neondatabase/serverless from `DB_DRIVER`
  - Storage driver factory at `server/src/storage/index.ts` chooses local Multer disk storage or Cloudinary unsigned upload from `STORAGE_DRIVER`
- `stitch_volunteer_management_pro_ui_ux/` — original HTML mockups used as the visual source of truth for all React pages
- `docs/superpowers/plans/` — the implementation plan that built this app

## Auth

JWT in `Authorization: Bearer …` header, stored in `localStorage`. Two roles: `admin`, `volunteer`. Admin routes are guarded by `requireRole('admin')` server-side and `<ProtectedRoute role="admin">` client-side.

Public endpoints (no auth required):
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/volunteers/public` (the volunteer registration form)

## Sample data

The seed script populates: 1 admin user, 8 volunteers, 5 events, 3 shifts with assignments, 5 attendance records, 2 messages, and the default settings row. Re-run `npm run db:seed` any time to reset.

## Pages

- **Login** — `/login`
- **Public registration** — `/register`
- **Dashboard** — `/dashboard` (stats + hours-by-month chart + recent activity)
- **Volunteers** — `/volunteers` (table + filters + add/edit sheet + delete confirm)
- **Volunteer profile** — `/volunteers/:id` (overview / attendance / notes tabs)
- **Events** — `/events` (cards or table view + status filter + create sheet)
- **Event details** — `/events/:id` (shifts + attendance + edit + mark completed)
- **Shifts** — `/shifts` (CRUD + assign volunteers dialog)
- **Attendance** — `/attendance` (event picker + check-in/out per volunteer)
- **Reports** — `/reports` (charts + hours-by-volunteer table + CSV export)
- **Messages** — `/messages` (composer + history, scopes: all / event / individual)
- **Settings** — `/settings` (org name + logo upload + statuses + categories + notifications)
