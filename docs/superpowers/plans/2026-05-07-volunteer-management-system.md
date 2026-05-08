# Volunteer Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Volunteer Management System with admin + volunteer roles, porting the existing Stitch HTML skeletons in `stitch_volunteer_management_pro_ui_ux/` into a working React + TypeScript SPA backed by an Express API and a swappable SQLite/Neon Postgres database.

**Architecture:** npm-workspaces monorepo (`/client` Vite+React, `/server` Express+Drizzle). DB driver and storage driver are switched via `.env` (`DB_DRIVER=sqlite|neon`, `STORAGE_DRIVER=local|cloudinary`). JWT auth with two roles (admin, volunteer). Client uses React Router v6, Zustand for client state, TanStack Query for server state, React Hook Form + Zod for forms, shadcn/ui + Recharts + lucide-react for UI. The 13 Stitch HTML mockups in `stitch_volunteer_management_pro_ui_ux/<screen>/code.html` are the visual source of truth — every page task ports the markup into a React component, preserves Tailwind classes/Material Symbols icons, and replaces hardcoded data with props/queries.

**Tech Stack:**
- Client: React 19, TypeScript 6, Vite 8, Tailwind 3, shadcn/ui, Recharts, lucide-react, React Router v6, Zustand, TanStack Query, React Hook Form, Zod, axios
- Server: Node 20+, Express 4, TypeScript, Drizzle ORM, better-sqlite3, @neondatabase/serverless, bcrypt, jsonwebtoken, multer, zod, cors, dotenv
- Tooling: npm workspaces, tsx (server dev), concurrently, vitest (unit), supertest (API), Playwright (e2e smoke)

**Source-of-truth mockups:** `stitch_volunteer_management_pro_ui_ux/{login_page,admin_dashboard,volunteer_list,volunteer_profile,volunteer_registration_form,events_list,event_details,shift_management,attendance_tracking,reports_analytics,messages,settings}/code.html` and `unity_growth_design_system/DESIGN.md`.

---

## File Structure

**Repo root**
- `package.json` — workspaces, root scripts (`dev`, `build`, `seed`)
- `.env` / `.env.example` — `DB_DRIVER`, `DATABASE_URL`, `SQLITE_PATH`, `JWT_SECRET`, `STORAGE_DRIVER`, `UPLOAD_DIR`, `CLOUDINARY_*`, `PORT`, `CLIENT_URL`
- `README.md` — setup instructions
- `.gitignore`

**`/server`**
- `package.json`, `tsconfig.json`
- `src/index.ts` — Express bootstrap
- `src/env.ts` — Zod-validated env loader
- `src/db/index.ts` — DB driver factory (sqlite vs neon)
- `src/db/schema.ts` — Drizzle schema (users, volunteers, events, shifts, assignments, attendance, messages, settings)
- `src/db/migrate.ts` — runs migrations on boot
- `src/db/seed.ts` — sample data seeder
- `src/middleware/auth.ts` — JWT verify, role guard
- `src/middleware/error.ts` — error handler
- `src/middleware/validate.ts` — Zod request validator
- `src/storage/index.ts` — storage driver factory
- `src/storage/local.ts`, `src/storage/cloudinary.ts`
- `src/routes/auth.ts` — `/api/auth/login`, `/register`, `/me`
- `src/routes/volunteers.ts` — CRUD
- `src/routes/events.ts` — CRUD
- `src/routes/shifts.ts` — CRUD + assign
- `src/routes/attendance.ts` — check-in/out, list
- `src/routes/messages.ts` — send, list
- `src/routes/reports.ts` — aggregations
- `src/routes/settings.ts` — get/update org settings
- `src/routes/uploads.ts` — POST file
- `src/lib/hash.ts`, `src/lib/jwt.ts`, `src/lib/hours.ts`
- `drizzle.config.ts`, `drizzle/` (generated migrations)
- `tests/` (vitest + supertest)

**`/client`**
- `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/lib/api.ts` — axios instance with auth interceptor
- `src/lib/queryClient.ts` — TanStack Query config
- `src/lib/auth.ts` — Zustand auth store
- `src/lib/theme.ts` — design tokens re-exported (matches `DESIGN.md`)
- `src/lib/utils.ts` — `cn()` helper
- `src/types/index.ts` — shared types (Volunteer, Event, Shift, Attendance, Message, User)
- `src/components/ui/*` — shadcn primitives (button, input, card, dialog, sheet, badge, table, select, textarea, toast, dropdown-menu, avatar, tabs, checkbox, label, form)
- `src/components/layout/AppShell.tsx` — sidebar + header layout (admin)
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopHeader.tsx`
- `src/components/common/StatusBadge.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/LoadingTable.tsx`
- `src/components/common/ConfirmDialog.tsx`
- `src/components/common/PageHeader.tsx`
- `src/routes/index.tsx` — router config
- `src/routes/ProtectedRoute.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/VolunteersListPage.tsx`
- `src/pages/VolunteerProfilePage.tsx`
- `src/pages/VolunteerRegistrationPage.tsx` (public)
- `src/pages/EventsListPage.tsx`
- `src/pages/EventDetailsPage.tsx`
- `src/pages/ShiftsPage.tsx`
- `src/pages/AttendancePage.tsx`
- `src/pages/ReportsPage.tsx`
- `src/pages/MessagesPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/features/volunteers/{api.ts,hooks.ts,VolunteerForm.tsx,VolunteerTable.tsx,VolunteerFilters.tsx}`
- `src/features/events/{api.ts,hooks.ts,EventForm.tsx,EventTable.tsx,EventCard.tsx}`
- `src/features/shifts/{api.ts,hooks.ts,ShiftForm.tsx,AssignVolunteersDialog.tsx}`
- `src/features/attendance/{api.ts,hooks.ts,CheckInRow.tsx}`
- `src/features/reports/{api.ts,hooks.ts,HoursByMonthChart.tsx,ParticipationChart.tsx}`
- `src/features/messages/{api.ts,hooks.ts,MessageComposer.tsx,MessageHistory.tsx}`
- `src/features/settings/{api.ts,hooks.ts,SettingsForm.tsx}`
- `tests/` (vitest + RTL)
- `e2e/` (Playwright smoke)

**Mapping mockup → component (locked):**
| Stitch folder | React component |
|---|---|
| `login_page/code.html` | `pages/LoginPage.tsx` |
| `admin_dashboard/code.html` | `pages/DashboardPage.tsx` + `layout/{Sidebar,TopHeader,AppShell}` |
| `volunteer_list/code.html` | `pages/VolunteersListPage.tsx` + `features/volunteers/*` |
| `volunteer_profile/code.html` | `pages/VolunteerProfilePage.tsx` |
| `volunteer_registration_form/code.html` | `pages/VolunteerRegistrationPage.tsx` |
| `events_list/code.html` | `pages/EventsListPage.tsx` |
| `event_details/code.html` | `pages/EventDetailsPage.tsx` |
| `shift_management/code.html` | `pages/ShiftsPage.tsx` |
| `attendance_tracking/code.html` | `pages/AttendancePage.tsx` |
| `reports_analytics/code.html` | `pages/ReportsPage.tsx` |
| `messages/code.html` | `pages/MessagesPage.tsx` |
| `settings/code.html` | `pages/SettingsPage.tsx` |

---

## Phase Overview (29 Tasks)

1. Repo restructure to monorepo
2. Root env config
3. Server scaffold + env validation
4. Drizzle schema (all tables)
5. DB driver factory (SQLite + Neon)
6. Migrations runner
7. Seed script with sample data
8. Auth lib (hash + jwt) + middleware
9. Auth routes
10. Volunteers CRUD API
11. Events CRUD API
12. Shifts API + assignment
13. Attendance API + hours calc
14. Messages API
15. Reports aggregation API
16. Settings API
17. Uploads + storage driver factory
18. Client scaffold (Tailwind + shadcn + tokens from DESIGN.md)
19. Auth store, API client, router, ProtectedRoute
20. AppShell + Sidebar + TopHeader (port from `admin_dashboard`)
21. LoginPage (port `login_page`)
22. DashboardPage (port `admin_dashboard`)
23. VolunteersListPage (port `volunteer_list`)
24. VolunteerProfilePage (port `volunteer_profile`)
25. VolunteerRegistrationPage (port `volunteer_registration_form`, public)
26. EventsListPage + EventDetailsPage (port `events_list`, `event_details`)
27. ShiftsPage + AttendancePage (port `shift_management`, `attendance_tracking`)
28. ReportsPage + MessagesPage + SettingsPage (port `reports_analytics`, `messages`, `settings`)
29. E2E smoke + README

---

The plan continues in companion files in the same folder due to length:
- `2026-05-07-volunteer-management-system-tasks-01-09.md` (Tasks 1–9: backend foundation)
- `2026-05-07-volunteer-management-system-tasks-10-17.md` (Tasks 10–17: backend APIs)
- `2026-05-07-volunteer-management-system-tasks-18-22.md` (Tasks 18–22: client scaffold + shell + login + dashboard)
- `2026-05-07-volunteer-management-system-tasks-23-29.md` (Tasks 23–29: remaining pages + e2e + README)

Each task in those files follows the bite-sized step format: Files → Failing test → Run → Implement → Verify → Commit.

---

## Self-Review Checklist (run before executing)

1. **Spec coverage** — Login, Dashboard, Volunteers list, Volunteer profile, Registration form, Events list, Event details, Shifts, Attendance, Reports, Messages, Settings → all mapped to tasks 21–28. Two roles (admin/volunteer) → tasks 8, 9, 19. Sample data populated → task 7. CSV export → task 28 (Reports).
2. **Placeholder scan** — every task in the companion files contains exact code, exact file paths, exact commands. No "TBD" / "etc."
3. **Type consistency** — `Volunteer`, `Event`, `Shift`, `Attendance`, `Message`, `User`, `Settings` types defined in task 4 (server schema) are mirrored in `client/src/types/index.ts` in task 18 with identical field names.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-07-volunteer-management-system.md` plus 4 companion task files in the same folder.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task (coder → code_reviewer → tester loop from CLAUDE.md). Best for a 29-task plan; each task gets a clean 200k context window.

2. **Inline Execution** — Execute tasks in this session sequentially with checkpoints every ~5 tasks.

**Which approach?**
