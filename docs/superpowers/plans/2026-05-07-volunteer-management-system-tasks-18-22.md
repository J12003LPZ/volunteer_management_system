# VMS Plan — Tasks 18–22 (Client Scaffold, Shell, Login, Dashboard)

Companion to `2026-05-07-volunteer-management-system.md`.

**Convention used by every page task:** Open the matching file in `stitch_volunteer_management_pro_ui_ux/<screen>/code.html`. Copy the markup of the main content (everything inside the layout's main panel, since the sidebar/header come from `AppShell`). Paste into the React page. Replace static `<tr>`/`<div>` rows that render data with `.map()` calls over query results. Replace inline `onclick` handlers with React handlers. Replace `<a href="...">` with `<Link to="...">` from React Router. Material Symbols icons (`<span class="material-symbols-outlined">`) stay as-is — they're served via the Google Fonts link added in Task 18.

---

### Task 18: Client scaffold (Tailwind + tokens + shadcn primitives)

**Files:**
- Create: `client/tailwind.config.js`, `client/postcss.config.js`, `client/src/lib/utils.ts`, `client/src/lib/theme.ts`, `client/src/types/index.ts`, `client/src/components/ui/{button,input,label,card,badge,table,dialog,sheet,select,textarea,checkbox,form,toast,dropdown-menu,avatar,tabs}.tsx`
- Modify: `client/package.json`, `client/src/index.css`, `client/index.html`, `client/vite.config.ts`

- [ ] **Step 1: Install client deps**

```bash
npm --workspace @vms/client install react-router-dom zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers recharts lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-checkbox
npm --workspace @vms/client install -D tailwindcss@3 postcss autoprefixer @types/node vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Create `client/tailwind.config.js`**

Mirror the tokens from `stitch_volunteer_management_pro_ui_ux/unity_growth_design_system/DESIGN.md`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8f9ff',
        surface: '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-container-lowest': '#ffffff',
        'surface-bright': '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-variant': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#434655',
        'on-background': '#0b1c30',
        primary: '#004ac6',
        'on-primary': '#ffffff',
        'primary-container': '#2563eb',
        'on-primary-container': '#eeefff',
        secondary: '#006c49',
        'on-secondary': '#ffffff',
        'secondary-container': '#6cf8bb',
        'on-secondary-container': '#00714d',
        tertiary: '#784b00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#996100',
        'on-tertiary-container': '#ffeedd',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        outline: '#737686',
        'outline-variant': '#c3c6d7',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'sidebar-width': '260px',
        'container-padding': '24px',
        gutter: '16px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        'card-1': '0px 4px 12px rgba(0, 0, 0, 0.05)',
        'card-2': '0px 12px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create `client/postcss.config.js`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 4: Replace `client/src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { height: 100%; }
  body { @apply bg-background text-on-background font-sans antialiased; }
}
```

- [ ] **Step 5: Update `client/index.html` `<title>`** to `VolunteerHub` and ensure `<link rel="icon">` is set (keep existing favicon).

- [ ] **Step 6: Configure Vite proxy and aliases — `client/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
```

Create `client/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Create `client/src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

- [ ] **Step 8: Create `client/src/types/index.ts`** (mirrors server schema)

```ts
export type Role = 'admin' | 'volunteer';

export type User = { id: number; email: string; role: Role; volunteerId?: number | null };

export type VolunteerStatus = 'active' | 'pending' | 'inactive';

export type Volunteer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  dateOfBirth?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  skills: string[];
  interests: string[];
  languages: string[];
  availability: Record<string, unknown>;
  preferredDays?: string | null;
  preferredTimes?: string | null;
  previousExperience?: string | null;
  status: VolunteerStatus;
  totalHours: number;
  notes?: string | null;
  avatarUrl?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

export type EventStatus = 'draft' | 'open' | 'full' | 'completed' | 'cancelled';

export type Event = {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  description?: string | null;
  requiredVolunteers: number;
  status: EventStatus;
  coordinator?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type ShiftStatus = 'open' | 'full' | 'completed' | 'cancelled';

export type Shift = {
  id: number;
  eventId: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredVolunteers: number;
  status: ShiftStatus;
  assignedVolunteerIds?: number[];
  openSpots?: number;
};

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type Attendance = {
  id: number;
  volunteerId: number;
  eventId: number;
  shiftId?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalHours: number;
  status: AttendanceStatus;
  notes?: string | null;
};

export type Message = {
  id: number;
  scope: 'individual' | 'event' | 'all';
  recipientVolunteerId?: number | null;
  recipientEventId?: number | null;
  subject: string;
  body: string;
  sentAt: string;
};

export type Settings = {
  id: number;
  organizationName: string;
  logoUrl?: string | null;
  volunteerStatuses: string[];
  eventCategories: string[];
  notificationsEnabled: boolean;
};

export type DashboardSummary = {
  totalVolunteers: number;
  activeVolunteers: number;
  pendingApplications: number;
  upcomingEvents: number;
  openShifts: number;
  totalHours: number;
  hoursByMonth: { month: string; hours: number }[];
  recentActivity: Attendance[];
};
```

- [ ] **Step 9: Create shadcn-style primitives**

Use shadcn/ui CLI conventions but check files in by hand. Create each file in `client/src/components/ui/`. Use the canonical shadcn implementations — full source is in shadcn docs (https://ui.shadcn.com). For brevity here, the **required components** are: `button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `badge.tsx`, `table.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`, `form.tsx`, `toast.tsx` + `toaster.tsx` + `use-toast.ts`, `dropdown-menu.tsx`, `avatar.tsx`, `tabs.tsx`.

**Implementation rule:** Run `npx shadcn@latest init` inside `client/` if you prefer the CLI; choose Tailwind config you already wrote, base color "slate". Then `npx shadcn@latest add button input label card badge table dialog sheet select textarea checkbox form toast dropdown-menu avatar tabs`. Confirm files land in `client/src/components/ui/`.

If the CLI is unavailable, copy each component verbatim from https://ui.shadcn.com/docs/components/<name>. **Do not write your own variants** — these are shared primitives the page tasks rely on.

- [ ] **Step 10: Smoke compile**

```bash
npm --workspace @vms/client run build
```

Expected: build succeeds (some warnings about unused exports are OK).

- [ ] **Step 11: Commit**

```bash
git add client
git commit -m "feat(client): scaffold Tailwind tokens, types, shadcn primitives"
```

---

### Task 19: Auth store + API client + router + ProtectedRoute

**Files:**
- Create: `client/src/lib/api.ts`, `client/src/lib/auth.ts`, `client/src/lib/queryClient.ts`, `client/src/routes/index.tsx`, `client/src/routes/ProtectedRoute.tsx`
- Modify: `client/src/main.tsx`, `client/src/App.tsx`

- [ ] **Step 1: Implement `client/src/lib/api.ts`**

```ts
import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vms_token');
      localStorage.removeItem('vms_user');
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
```

- [ ] **Step 2: Implement `client/src/lib/auth.ts`**

```ts
import { create } from 'zustand';
import { api } from './api';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrate: () => {
    const token = localStorage.getItem('vms_token');
    const userStr = localStorage.getItem('vms_user');
    if (token && userStr) set({ token, user: JSON.parse(userStr) });
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vms_token', data.token);
    localStorage.setItem('vms_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('vms_token', data.token);
    localStorage.setItem('vms_user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('vms_token');
    localStorage.removeItem('vms_user');
    set({ token: null, user: null });
  },
}));
```

- [ ] **Step 3: Implement `client/src/lib/queryClient.ts`**

```ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});
```

- [ ] **Step 4: Implement `client/src/routes/ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/types';

export function ProtectedRoute({ role }: { role?: Role }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 5: Implement `client/src/routes/index.tsx`** (placeholders for pages built in later tasks)

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { VolunteersListPage } from '@/pages/VolunteersListPage';
import { VolunteerProfilePage } from '@/pages/VolunteerProfilePage';
import { VolunteerRegistrationPage } from '@/pages/VolunteerRegistrationPage';
import { EventsListPage } from '@/pages/EventsListPage';
import { EventDetailsPage } from '@/pages/EventDetailsPage';
import { ShiftsPage } from '@/pages/ShiftsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <VolunteerRegistrationPage /> },
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/volunteers', element: <VolunteersListPage /> },
          { path: '/volunteers/:id', element: <VolunteerProfilePage /> },
          { path: '/events', element: <EventsListPage /> },
          { path: '/events/:id', element: <EventDetailsPage /> },
          { path: '/shifts', element: <ShiftsPage /> },
          { path: '/attendance', element: <AttendancePage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
```

- [ ] **Step 6: Create empty page stubs**

For each of the 12 pages above, create the file under `client/src/pages/` with:

```tsx
export function <PageName>() { return <div className="p-container-padding">TODO: <PageName></div>; }
```

This makes the router compile. Real implementations land in tasks 21–28.

Pages to stub: `LoginPage`, `DashboardPage`, `VolunteersListPage`, `VolunteerProfilePage`, `VolunteerRegistrationPage`, `EventsListPage`, `EventDetailsPage`, `ShiftsPage`, `AttendancePage`, `ReportsPage`, `MessagesPage`, `SettingsPage`.

Also stub `client/src/components/layout/AppShell.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
export function AppShell() { return <div className="min-h-screen"><Outlet /></div>; }
```

- [ ] **Step 7: Update `client/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { useAuth } from './lib/auth';
import { Toaster } from './components/ui/toaster';
import './index.css';

useAuth.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
```

Delete the old `client/src/App.tsx` (or empty it — the router replaces it).

- [ ] **Step 8: Run dev**

```bash
npm run dev
```

Open http://localhost:5173 → redirects to `/login` → renders "TODO: LoginPage". Backend should also be running. Stop with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add client
git commit -m "feat(client): auth store, axios client, router, ProtectedRoute, page stubs"
```

---

### Task 20: AppShell — Sidebar + TopHeader (port from `admin_dashboard/code.html`)

**Files:**
- Modify: `client/src/components/layout/AppShell.tsx`
- Create: `client/src/components/layout/Sidebar.tsx`, `client/src/components/layout/TopHeader.tsx`

- [ ] **Step 1: Open the source HTML**

Open `stitch_volunteer_management_pro_ui_ux/admin_dashboard/code.html`. Locate the sidebar block (the `<aside>` element with `w-sidebar-width`) and the top header block (the row above the dashboard cards containing search + bell + avatar). These two regions are the source for this task.

- [ ] **Step 2: Implement `client/src/components/layout/Sidebar.tsx`**

Port the `<aside>` markup. Replace `<a href="...">` with `<NavLink to="...">`. Use the active-bar styling rule from `DESIGN.md` ("Active Indicator: a vertical bar on the left of the active menu item"). Material Symbols icons (`<span class="material-symbols-outlined">dashboard</span>` etc.) stay verbatim.

```tsx
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/volunteers', icon: 'groups', label: 'Volunteers' },
  { to: '/events', icon: 'event', label: 'Events' },
  { to: '/shifts', icon: 'schedule', label: 'Shifts' },
  { to: '/attendance', icon: 'how_to_reg', label: 'Attendance' },
  { to: '/reports', icon: 'insights', label: 'Reports' },
  { to: '/messages', icon: 'forum', label: 'Messages' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-sidebar-width shrink-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-outline-variant">
        <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
        <span className="font-bold text-lg text-on-surface">VolunteerHub</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium relative transition',
                isActive
                  ? 'bg-surface-container-low text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />}
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Implement `client/src/components/layout/TopHeader.tsx`**

Port the header block. Wire avatar dropdown to logout via the auth store.

```tsx
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TopHeader() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const initials = (user?.email ?? 'A').slice(0, 2).toUpperCase();
  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-container-padding">
      <div className="relative max-w-md w-full">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          type="search"
          placeholder="Search volunteers, events..."
          className="w-full h-10 pl-10 pr-3 rounded-md bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-surface-container-low" aria-label="Notifications">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Implement `client/src/components/layout/AppShell.tsx`**

```tsx
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-container-padding overflow-auto">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Visual smoke**

```bash
npm run dev
```

Log in (we don't yet have the form — temporarily POST manually via DevTools console, or skip until Task 21). Confirm the shell renders with sidebar + header at the right widths. The /login route still shows the stub; that's fine.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/layout
git commit -m "feat(client): app shell with sidebar + top header (ported from Stitch dashboard mockup)"
```

---

### Task 21: LoginPage (port from `login_page/code.html`)

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`
- Test: `client/src/pages/LoginPage.test.tsx`

- [ ] **Step 1: Open `stitch_volunteer_management_pro_ui_ux/login_page/code.html`**

Identify the centered card containing the form (header logo, "Sign in" heading, email/password inputs, sign-in button, register link).

- [ ] **Step 2: Failing test `client/src/pages/LoginPage.test.tsx`**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  useAuth: Object.assign(
    (sel: any) => sel({ login: vi.fn().mockResolvedValue(undefined) }),
    { getState: () => ({ login: vi.fn() }) }
  ),
}));

it('renders the login form', () => {
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: Run test, expect FAIL** — `npm --workspace @vms/client test`

- [ ] **Step 4: Implement `client/src/pages/LoginPage.tsx`**

Port the markup from the mockup; wire up React Hook Form + Zod + auth store.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type Form = z.infer<typeof Schema>;

export function LoginPage() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: Form) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      toast({ title: 'Sign-in failed', description: 'Check your email and password.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-surface px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-card-1 p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
          <span className="font-bold text-xl text-on-surface">VolunteerHub</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-surface">Sign in</h1>
        <p className="text-sm text-on-surface-variant mt-1">Welcome back. Please enter your details.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-on-surface-variant text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Register as volunteer</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests, expect PASS** — `npm --workspace @vms/client test`

- [ ] **Step 6: Manual smoke**

```bash
npm run dev
```

Visit `/login`, sign in with `admin@vms.local` / `admin123`. Should redirect to `/dashboard` (which still shows the stub).

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/LoginPage.tsx client/src/pages/LoginPage.test.tsx
git commit -m "feat(client): login page (ported from Stitch login mockup)"
```

---

### Task 22: DashboardPage (port from `admin_dashboard/code.html`)

**Files:**
- Modify: `client/src/pages/DashboardPage.tsx`
- Create: `client/src/features/reports/api.ts`, `client/src/features/reports/hooks.ts`, `client/src/features/reports/HoursByMonthChart.tsx`

- [ ] **Step 1: Open `stitch_volunteer_management_pro_ui_ux/admin_dashboard/code.html`**

Locate the main panel (everything to the right of the sidebar and below the header). The cards row, the chart, the "Recent activity" / "Pending applications" panels, and the "Quick actions" buttons are all source.

- [ ] **Step 2: Implement `client/src/features/reports/api.ts`**

```ts
import { api } from '@/lib/api';
import type { DashboardSummary } from '@/types';
export const getDashboard = async (): Promise<DashboardSummary> =>
  (await api.get('/reports/dashboard')).data;
```

- [ ] **Step 3: Implement `client/src/features/reports/hooks.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from './api';
export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });
```

- [ ] **Step 4: Implement `client/src/features/reports/HoursByMonthChart.tsx`**

```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function HoursByMonthChart({ data }: { data: { month: string; hours: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#c3c6d7" />
          <XAxis dataKey="month" stroke="#434655" fontSize={12} />
          <YAxis stroke="#434655" fontSize={12} />
          <Tooltip />
          <Bar dataKey="hours" fill="#004ac6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Implement `client/src/pages/DashboardPage.tsx`**

Port the cards markup; replace each card's static number with a value from `useDashboard().data`. Replace the "Quick actions" buttons with `<Link>` components pointing to `/volunteers/new`, `/events`, `/reports`. Replace the chart placeholder with `<HoursByMonthChart>`.

```tsx
import { Link } from 'react-router-dom';
import { useDashboard } from '@/features/reports/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoursByMonthChart } from '@/features/reports/HoursByMonthChart';

const STAT_CARDS = [
  { key: 'totalVolunteers', icon: 'groups', label: 'Total Volunteers' },
  { key: 'activeVolunteers', icon: 'person_check', label: 'Active Volunteers' },
  { key: 'upcomingEvents', icon: 'event', label: 'Upcoming Events' },
  { key: 'openShifts', icon: 'schedule', label: 'Open Shifts' },
  { key: 'totalHours', icon: 'timer', label: 'Total Hours' },
  { key: 'pendingApplications', icon: 'pending_actions', label: 'Pending Applications' },
] as const;

export function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Overview of your volunteer program</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/reports">View Reports</Link></Button>
          <Button asChild><Link to="/events">Create Event</Link></Button>
          <Button asChild><Link to="/volunteers">Add Volunteer</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {STAT_CARDS.map((c) => (
          <Card key={c.key} className="rounded-lg shadow-card-1">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-on-surface">
                  {isLoading ? '…' : (data?.[c.key] ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 grid place-items-center rounded-full bg-surface-container">
                <span className="material-symbols-outlined text-primary">{c.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg shadow-card-1">
        <CardHeader><CardTitle>Volunteer Hours by Month</CardTitle></CardHeader>
        <CardContent>
          {data?.hoursByMonth?.length ? (
            <HoursByMonthChart data={data.hoursByMonth} />
          ) : (
            <p className="text-sm text-on-surface-variant">No hours logged yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card-1">
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {data?.recentActivity?.length ? (
            <ul className="divide-y divide-outline-variant">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="py-3 flex justify-between text-sm">
                  <span>Volunteer #{a.volunteerId} — Event #{a.eventId}</span>
                  <span className="text-on-surface-variant">{a.totalHours}h • {a.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 6: Manual smoke**

```bash
npm run dev
```

Sign in → `/dashboard` shows real numbers from the seeded DB and a chart.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/DashboardPage.tsx client/src/features/reports
git commit -m "feat(client): dashboard page wired to reports API (ported from Stitch mockup)"
```

---

**End of Tasks 18–22.** Continue with `2026-05-07-volunteer-management-system-tasks-23-29.md` (remaining pages + e2e + README).
