# VMS Plan — Tasks 23–29 (Remaining Pages + E2E + README)

Companion to `2026-05-07-volunteer-management-system.md`. Each page task: open the matching `stitch_volunteer_management_pro_ui_ux/<screen>/code.html`, port the main panel markup into the React page, replace static rows with `.map()` over query data, replace `<a>` with `<Link>`, replace inline handlers with React handlers. Material Symbols icons stay verbatim.

---

### Task 23: VolunteersListPage (port from `volunteer_list/code.html`)

**Files:**
- Modify: `client/src/pages/VolunteersListPage.tsx`
- Create: `client/src/features/volunteers/{api.ts,hooks.ts,VolunteerTable.tsx,VolunteerFilters.tsx,VolunteerForm.tsx,VolunteerFormSheet.tsx}`
- Create: `client/src/components/common/{StatusBadge.tsx,EmptyState.tsx,LoadingTable.tsx,ConfirmDialog.tsx,PageHeader.tsx}`

- [ ] **Step 1: Implement common components**

`client/src/components/common/StatusBadge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  active: 'bg-secondary-container text-on-secondary-container',
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  inactive: 'bg-surface-container-high text-on-surface-variant',
  open: 'bg-primary-fixed text-on-primary-fixed-variant',
  full: 'bg-secondary-container text-on-secondary-container',
  draft: 'bg-surface-container-high text-on-surface-variant',
  completed: 'bg-surface-container-high text-on-surface-variant',
  cancelled: 'bg-error-container text-on-error-container',
  present: 'bg-secondary-container text-on-secondary-container',
  absent: 'bg-error-container text-on-error-container',
  late: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  excused: 'bg-surface-container-high text-on-surface-variant',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn('rounded-full font-medium border-0', STYLES[status] ?? 'bg-surface-container')}>
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  );
}
```

`client/src/components/common/EmptyState.tsx`:

```tsx
export function EmptyState({ icon = 'inbox', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="text-center py-12">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant">{icon}</span>
      <p className="mt-3 text-on-surface font-medium">{title}</p>
      {hint && <p className="text-sm text-on-surface-variant mt-1">{hint}</p>}
    </div>
  );
}
```

`client/src/components/common/LoadingTable.tsx`:

```tsx
export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-md bg-surface-container animate-pulse" />
      ))}
    </div>
  );
}
```

`client/src/components/common/ConfirmDialog.tsx`:

```tsx
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = 'Delete', onConfirm, variant = 'destructive',
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  title: string; description?: string; confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'destructive' | 'default';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={variant} onClick={async () => { await onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

`client/src/components/common/PageHeader.tsx`:

```tsx
import { ReactNode } from 'react';
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">{title}</h1>
        {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Implement `client/src/features/volunteers/api.ts`**

```ts
import { api } from '@/lib/api';
import type { Volunteer } from '@/types';

export const listVolunteers = async (params: Record<string, string | undefined>) =>
  (await api.get<Volunteer[]>('/volunteers', { params })).data;

export const getVolunteer = async (id: number) =>
  (await api.get<Volunteer>(`/volunteers/${id}`)).data;

export const createVolunteer = async (payload: Partial<Volunteer>) =>
  (await api.post<Volunteer>('/volunteers', payload)).data;

export const updateVolunteer = async (id: number, payload: Partial<Volunteer>) =>
  (await api.put<Volunteer>(`/volunteers/${id}`, payload)).data;

export const deleteVolunteer = async (id: number) =>
  (await api.delete(`/volunteers/${id}`)).data;
```

- [ ] **Step 3: Implement `client/src/features/volunteers/hooks.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVolunteer, deleteVolunteer, getVolunteer, listVolunteers, updateVolunteer } from './api';

export const useVolunteers = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['volunteers', params], queryFn: () => listVolunteers(params) });

export const useVolunteer = (id: number | undefined) =>
  useQuery({ queryKey: ['volunteer', id], queryFn: () => getVolunteer(id!), enabled: id != null });

export const useCreateVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVolunteer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  });
};

export const useUpdateVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<import('@/types').Volunteer>) => updateVolunteer(id, patch),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['volunteers'] });
      qc.invalidateQueries({ queryKey: ['volunteer', v.id] });
    },
  });
};

export const useDeleteVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVolunteer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  });
};
```

- [ ] **Step 4: Implement `client/src/features/volunteers/VolunteerFilters.tsx`**

```tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Filters = { search: string; status: string; skill: string };

export function VolunteerFilters({ value, onChange }: { value: Filters; onChange: (v: Filters) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <Input
          placeholder="Search by name or email"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-10"
        />
      </div>
      <Select value={value.status || 'all'} onValueChange={(v) => onChange({ ...value, status: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Filter by skill"
        value={value.skill}
        onChange={(e) => onChange({ ...value, skill: e.target.value })}
        className="w-48"
      />
    </div>
  );
}
```

- [ ] **Step 5: Implement `client/src/features/volunteers/VolunteerTable.tsx`**

Port the table markup from `volunteer_list/code.html`. Replace each static `<tr>` with a `.map()` over `volunteers`.

```tsx
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Volunteer } from '@/types';

export function VolunteerTable({
  volunteers, onEdit, onDelete,
}: {
  volunteers: Volunteer[];
  onEdit: (v: Volunteer) => void;
  onDelete: (v: Volunteer) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Volunteer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead className="text-right">Hours</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {volunteers.map((v) => (
          <TableRow key={v.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{v.firstName[0]}{v.lastName[0]}</AvatarFallback></Avatar>
                <div>
                  <Link to={`/volunteers/${v.id}`} className="font-medium text-on-surface hover:text-primary">
                    {v.firstName} {v.lastName}
                  </Link>
                  <p className="text-xs text-on-surface-variant">{v.city ?? ''}{v.state ? `, ${v.state}` : ''}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.email}</TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.phone ?? '—'}</TableCell>
            <TableCell><StatusBadge status={v.status} /></TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.skills.slice(0, 3).join(', ') || '—'}</TableCell>
            <TableCell className="text-right">{v.totalHours}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/volunteers/${v.id}`} aria-label="View">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(v)} aria-label="Edit">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(v)} aria-label="Delete">
                  <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 6: Implement `client/src/features/volunteers/VolunteerForm.tsx` and `VolunteerFormSheet.tsx`**

`VolunteerForm.tsx` — a re-usable RHF form with sections matching the Stitch registration form (Personal Info, Contact, Skills, Availability, Emergency, Consent). Export `VolunteerFormValues` type and a `<VolunteerForm>` component that takes `defaultValues`, `submitLabel`, `onSubmit`, `mode: 'admin' | 'public'` (public mode hides the status select and shows a consent checkbox).

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const VolunteerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  dateOfBirth: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  skills: z.string().optional(),    // comma-separated
  interests: z.string().optional(),
  languages: z.string().optional(),
  preferredDays: z.string().optional(),
  preferredTimes: z.string().optional(),
  previousExperience: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']).default('pending'),
  consent: z.boolean().optional(),
  notes: z.string().optional(),
});

export type VolunteerFormValues = z.infer<typeof VolunteerSchema>;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

export function VolunteerForm({
  defaultValues, mode = 'admin', submitLabel = 'Save', onSubmit,
}: {
  defaultValues?: Partial<VolunteerFormValues>;
  mode?: 'admin' | 'public';
  submitLabel?: string;
  onSubmit: (values: VolunteerFormValues) => Promise<void> | void;
}) {
  const f = useForm<VolunteerFormValues>({ resolver: zodResolver(VolunteerSchema), defaultValues: { status: 'pending', ...defaultValues } });
  const handle = f.handleSubmit(async (v) => {
    if (mode === 'public' && !v.consent) {
      f.setError('consent', { message: 'You must agree to continue' });
      return;
    }
    await onSubmit(v);
  });

  return (
    <form onSubmit={handle} className="space-y-stack-lg">
      <Section title="Personal Information">
        <Field id="firstName" label="First name" error={f.formState.errors.firstName?.message}>
          <Input id="firstName" {...f.register('firstName')} />
        </Field>
        <Field id="lastName" label="Last name" error={f.formState.errors.lastName?.message}>
          <Input id="lastName" {...f.register('lastName')} />
        </Field>
        <Field id="dateOfBirth" label="Date of birth">
          <Input id="dateOfBirth" type="date" {...f.register('dateOfBirth')} />
        </Field>
        {mode === 'admin' && (
          <Field id="status" label="Status">
            <Select defaultValue={f.getValues('status')} onValueChange={(v) => f.setValue('status', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      </Section>

      <Section title="Contact Information">
        <Field id="email" label="Email" error={f.formState.errors.email?.message}>
          <Input id="email" type="email" {...f.register('email')} />
        </Field>
        <Field id="phone" label="Phone"><Input id="phone" {...f.register('phone')} /></Field>
        <Field id="address" label="Address"><Input id="address" {...f.register('address')} /></Field>
        <Field id="city" label="City"><Input id="city" {...f.register('city')} /></Field>
        <Field id="state" label="State"><Input id="state" {...f.register('state')} /></Field>
      </Section>

      <Section title="Skills & Interests">
        <Field id="skills" label="Skills (comma-separated)"><Input id="skills" {...f.register('skills')} placeholder="Tutoring, Event Setup" /></Field>
        <Field id="interests" label="Interests (comma-separated)"><Input id="interests" {...f.register('interests')} /></Field>
        <Field id="languages" label="Languages"><Input id="languages" {...f.register('languages')} /></Field>
        <Field id="previousExperience" label="Previous experience">
          <Textarea id="previousExperience" rows={3} {...f.register('previousExperience')} />
        </Field>
      </Section>

      <Section title="Availability">
        <Field id="preferredDays" label="Preferred days"><Input id="preferredDays" {...f.register('preferredDays')} placeholder="Weekends" /></Field>
        <Field id="preferredTimes" label="Preferred times"><Input id="preferredTimes" {...f.register('preferredTimes')} placeholder="9am-1pm" /></Field>
      </Section>

      <Section title="Emergency Contact">
        <Field id="emergencyContactName" label="Contact name"><Input id="emergencyContactName" {...f.register('emergencyContactName')} /></Field>
        <Field id="emergencyContactPhone" label="Contact phone"><Input id="emergencyContactPhone" {...f.register('emergencyContactPhone')} /></Field>
      </Section>

      {mode === 'admin' && (
        <Section title="Notes">
          <div className="sm:col-span-2">
            <Field id="notes" label="Admin notes"><Textarea id="notes" rows={3} {...f.register('notes')} /></Field>
          </div>
        </Section>
      )}

      {mode === 'public' && (
        <div className="flex items-start gap-3">
          <Checkbox id="consent" onCheckedChange={(v) => f.setValue('consent', !!v)} />
          <Label htmlFor="consent" className="text-sm text-on-surface-variant">
            I agree to the volunteer program terms and consent to being contacted.
          </Label>
        </div>
      )}
      {f.formState.errors.consent && <p className="text-xs text-error">{f.formState.errors.consent.message}</p>}

      <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={f.formState.isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

export const valuesToPayload = (v: VolunteerFormValues) => ({
  ...v,
  skills: v.skills?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
  interests: v.interests?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
  languages: v.languages?.split(',').map((s) => s.trim()).filter(Boolean) ?? [],
});
```

`client/src/features/volunteers/VolunteerFormSheet.tsx`:

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { VolunteerForm, valuesToPayload, type VolunteerFormValues } from './VolunteerForm';
import { useCreateVolunteer, useUpdateVolunteer } from './hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Volunteer } from '@/types';

export function VolunteerFormSheet({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing?: Volunteer | null }) {
  const create = useCreateVolunteer();
  const update = useUpdateVolunteer();
  const { toast } = useToast();

  const onSubmit = async (values: VolunteerFormValues) => {
    const payload = valuesToPayload(values);
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload });
      toast({ title: 'Volunteer updated' });
    } else {
      await create.mutateAsync(payload);
      toast({ title: 'Volunteer added' });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit volunteer' : 'Add volunteer'}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <VolunteerForm
            defaultValues={editing ? {
              ...editing,
              skills: editing.skills.join(', '),
              interests: editing.interests.join(', '),
              languages: editing.languages.join(', '),
            } : undefined}
            submitLabel={editing ? 'Save changes' : 'Add volunteer'}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 7: Implement `client/src/pages/VolunteersListPage.tsx`**

```tsx
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingTable } from '@/components/common/LoadingTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { VolunteerFilters, type Filters } from '@/features/volunteers/VolunteerFilters';
import { VolunteerTable } from '@/features/volunteers/VolunteerTable';
import { VolunteerFormSheet } from '@/features/volunteers/VolunteerFormSheet';
import { useDeleteVolunteer, useVolunteers } from '@/features/volunteers/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Volunteer } from '@/types';

export function VolunteersListPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', skill: '' });
  const { data, isLoading } = useVolunteers({
    search: filters.search || undefined,
    status: filters.status || undefined,
    skill: filters.skill || undefined,
  });
  const del = useDeleteVolunteer();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState<Volunteer | null>(null);

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Volunteers"
        subtitle="Manage your volunteers and applicants"
        actions={
          <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Add Volunteer
          </Button>
        }
      />
      <Card className="p-4 shadow-card-1 rounded-lg">
        <VolunteerFilters value={filters} onChange={setFilters} />
      </Card>
      <Card className="shadow-card-1 rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingTable />
        ) : !data?.length ? (
          <EmptyState icon="groups" title="No volunteers yet" hint="Add your first volunteer to get started." />
        ) : (
          <VolunteerTable
            volunteers={data}
            onEdit={(v) => { setEditing(v); setSheetOpen(true); }}
            onDelete={(v) => setConfirming(v)}
          />
        )}
      </Card>
      <VolunteerFormSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Delete volunteer?"
        description={`This will permanently remove ${confirming?.firstName ?? ''} ${confirming?.lastName ?? ''}.`}
        onConfirm={async () => {
          if (!confirming) return;
          await del.mutateAsync(confirming.id);
          toast({ title: 'Volunteer deleted' });
        }}
      />
    </div>
  );
}
```

- [ ] **Step 8: Manual smoke**

```bash
npm run dev
```

`/volunteers` lists 8 seeded volunteers. Add → fills sheet → row appears. Edit → updates. Delete → confirmation → row gone. Filter by status `active` → only active rows.

- [ ] **Step 9: Commit**

```bash
git add client/src/components/common client/src/features/volunteers client/src/pages/VolunteersListPage.tsx
git commit -m "feat(client): volunteers list with filters, add/edit sheet, delete confirm"
```

---

### Task 24: VolunteerProfilePage (port from `volunteer_profile/code.html`)

**Files:**
- Modify: `client/src/pages/VolunteerProfilePage.tsx`

- [ ] **Step 1: Open `stitch_volunteer_management_pro_ui_ux/volunteer_profile/code.html`**

Identify regions: avatar header, contact info card, skills/interests, assigned events list, attendance history, notes, action buttons row.

- [ ] **Step 2: Implement `client/src/pages/VolunteerProfilePage.tsx`**

```tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useVolunteer, useUpdateVolunteer } from '@/features/volunteers/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { VolunteerFormSheet } from '@/features/volunteers/VolunteerFormSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import type { Attendance, Event } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function VolunteerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const vid = Number(id);
  const { data: v, isLoading } = useVolunteer(vid);
  const update = useUpdateVolunteer();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', { volunteerId: vid }],
    queryFn: async () => (await api.get<Attendance[]>('/attendance', { params: { volunteerId: vid } })).data,
    enabled: !!vid,
  });
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get<Event[]>('/events')).data,
  });

  if (isLoading || !v) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const eventById = new Map(events.map((e) => [e.id, e]));

  return (
    <div className="space-y-stack-lg">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span> Back
      </Button>
      <Card className="shadow-card-1 rounded-lg">
        <CardContent className="p-6 flex flex-wrap items-center gap-6">
          <Avatar className="h-20 w-20 text-xl">
            <AvatarFallback>{v.firstName[0]}{v.lastName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-on-surface">{v.firstName} {v.lastName}</h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="text-sm text-on-surface-variant">{v.email} • {v.phone ?? '—'}</p>
            <p className="text-sm text-on-surface-variant">{v.city ?? ''}{v.state ? `, ${v.state}` : ''}</p>
            <p className="mt-2 text-sm">Total hours: <span className="font-semibold">{v.totalHours}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEditOpen(true)}>Edit profile</Button>
            <Button variant="outline" asChild><Link to="/messages">Send message</Link></Button>
            <Button
              variant="outline"
              onClick={async () => {
                await update.mutateAsync({ id: v.id, status: v.status === 'inactive' ? 'active' : 'inactive' });
                toast({ title: v.status === 'inactive' ? 'Marked active' : 'Marked inactive' });
              }}
            >
              {v.status === 'inactive' ? 'Mark active' : 'Mark inactive'}
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/reports/export.csv`} download>Download record</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance ({attendance.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-gutter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <Card className="shadow-card-1 rounded-lg">
              <CardHeader><CardTitle>Skills & Interests</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs uppercase font-semibold text-on-surface-variant">Skills</p>
                <p className="mt-1 text-sm">{v.skills.join(', ') || '—'}</p>
                <p className="mt-3 text-xs uppercase font-semibold text-on-surface-variant">Interests</p>
                <p className="mt-1 text-sm">{v.interests.join(', ') || '—'}</p>
                <p className="mt-3 text-xs uppercase font-semibold text-on-surface-variant">Languages</p>
                <p className="mt-1 text-sm">{v.languages.join(', ') || '—'}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card-1 rounded-lg">
              <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{v.emergencyContactName ?? '—'}</p>
                <p className="text-sm text-on-surface-variant">{v.emergencyContactPhone ?? '—'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="shadow-card-1 rounded-lg">
            <CardContent className="p-0">
              {attendance.length === 0 ? (
                <p className="p-6 text-sm text-on-surface-variant">No attendance recorded yet.</p>
              ) : (
                <ul className="divide-y divide-outline-variant">
                  {attendance.map((a) => (
                    <li key={a.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{eventById.get(a.eventId)?.name ?? `Event #${a.eventId}`}</p>
                        <p className="text-xs text-on-surface-variant">{a.checkInTime ?? '—'} → {a.checkOutTime ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{a.totalHours}h</span>
                        <StatusBadge status={a.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="shadow-card-1 rounded-lg">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm whitespace-pre-wrap">{v.notes ?? 'No admin notes yet.'}</p>
              {v.documentUrl && (
                <a href={v.documentUrl} className="text-primary text-sm hover:underline" target="_blank" rel="noreferrer">
                  View attached document
                </a>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VolunteerFormSheet open={editOpen} onOpenChange={setEditOpen} editing={v} />
    </div>
  );
}
```

- [ ] **Step 3: Manual smoke** — click a row in `/volunteers`, see profile, edit, mark inactive.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/VolunteerProfilePage.tsx
git commit -m "feat(client): volunteer profile page (ported from Stitch profile mockup)"
```

---

### Task 25: VolunteerRegistrationPage (port from `volunteer_registration_form/code.html`, public)

**Files:**
- Modify: `client/src/pages/VolunteerRegistrationPage.tsx`

- [ ] **Step 1: Implement** — public-mode wrapper around `<VolunteerForm mode="public">`

```tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '@/lib/api';
import { VolunteerForm, valuesToPayload, type VolunteerFormValues } from '@/features/volunteers/VolunteerForm';
import { Card, CardContent } from '@/components/ui/card';

export function VolunteerRegistrationPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const onSubmit = async (values: VolunteerFormValues) => {
    await api.post('/volunteers/public', valuesToPayload(values));
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
          <span className="font-bold text-xl text-on-surface">VolunteerHub</span>
        </header>
        <Card className="shadow-card-1 rounded-lg">
          <CardContent className="p-6">
            {done ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-secondary">check_circle</span>
                <h2 className="mt-3 text-2xl font-semibold text-on-surface">Application submitted</h2>
                <p className="mt-2 text-on-surface-variant">We'll review and reach out via email.</p>
                <button className="mt-4 text-primary font-medium hover:underline" onClick={() => navigate('/login')}>
                  Back to sign-in
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-on-surface">Become a volunteer</h1>
                <p className="text-sm text-on-surface-variant mt-1 mb-6">Tell us about yourself.</p>
                <VolunteerForm mode="public" submitLabel="Submit application" onSubmit={onSubmit} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manual smoke** — `/register` (no auth) submits and shows the success screen; new pending volunteer appears in admin list.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/VolunteerRegistrationPage.tsx
git commit -m "feat(client): public volunteer registration page (ported from Stitch form mockup)"
```

---

### Task 26: EventsListPage + EventDetailsPage (port from `events_list/code.html`, `event_details/code.html`)

**Files:**
- Modify: `client/src/pages/EventsListPage.tsx`, `client/src/pages/EventDetailsPage.tsx`
- Create: `client/src/features/events/{api.ts,hooks.ts,EventForm.tsx,EventCard.tsx,EventTable.tsx}`

- [ ] **Step 1: Implement events feature module**

`api.ts`:

```ts
import { api } from '@/lib/api';
import type { Event } from '@/types';

export const listEvents = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Event[]>('/events', { params })).data;
export const getEvent = async (id: number) => (await api.get(`/events/${id}`)).data;
export const createEvent = async (p: Partial<Event>) => (await api.post<Event>('/events', p)).data;
export const updateEvent = async (id: number, p: Partial<Event>) => (await api.put<Event>(`/events/${id}`, p)).data;
export const deleteEvent = async (id: number) => (await api.delete(`/events/${id}`)).data;
```

`hooks.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from './api';
export const useEvents = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['events', params], queryFn: () => listEvents(params) });
export const useEvent = (id?: number) =>
  useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id!), enabled: id != null });
export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};
export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Partial<import('@/types').Event>) => updateEvent(id, p),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['events'] }); qc.invalidateQueries({ queryKey: ['event', v.id] }); },
  });
};
export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteEvent, onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }) });
};
```

`EventForm.tsx` — RHF form with: name, date, startTime, endTime, location, description, requiredVolunteers, status, coordinator, notes. Render in a `<Sheet>` like `VolunteerFormSheet`. (Pattern is identical; copy and adapt fields.)

`EventCard.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Event } from '@/types';

export function EventCard({ event }: { event: Event }) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="shadow-card-1 rounded-lg hover:shadow-card-2 transition">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-on-surface">{event.name}</h3>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">event</span>
            {event.date} · {event.startTime}–{event.endTime}
          </p>
          {event.location && (
            <p className="mt-1 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">location_on</span>{event.location}
            </p>
          )}
          <p className="mt-2 text-xs text-on-surface-variant">Needs {event.requiredVolunteers} volunteers</p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

`EventTable.tsx` — port the table region from `events_list/code.html`; pattern matches `VolunteerTable`.

- [ ] **Step 2: Implement `client/src/pages/EventsListPage.tsx`**

Port markup. Top toolbar with search + status filter + view toggle (table/cards) + "Create Event" button. Rendering switches between `<EventTable>` and a grid of `<EventCard>`s.

- [ ] **Step 3: Implement `client/src/pages/EventDetailsPage.tsx`**

Port markup from `event_details/code.html`. Use `useEvent(id)` (returns event + shifts + attendance). Render the event header, the shifts list, the assigned volunteers list (cross-reference assignments), buttons for "Assign volunteers", "Edit event", "Mark completed".

- [ ] **Step 4: Manual smoke** — `/events` shows seeded events as cards; click → details; create event → appears.

- [ ] **Step 5: Commit**

```bash
git add client/src/features/events client/src/pages/EventsListPage.tsx client/src/pages/EventDetailsPage.tsx
git commit -m "feat(client): events list + details (ported from Stitch mockups)"
```

---

### Task 27: ShiftsPage + AttendancePage (port from `shift_management/code.html`, `attendance_tracking/code.html`)

**Files:**
- Modify: `client/src/pages/ShiftsPage.tsx`, `client/src/pages/AttendancePage.tsx`
- Create: `client/src/features/shifts/{api.ts,hooks.ts,ShiftForm.tsx,AssignVolunteersDialog.tsx}`
- Create: `client/src/features/attendance/{api.ts,hooks.ts,CheckInRow.tsx}`

- [ ] **Step 1: shifts feature**

`api.ts`:

```ts
import { api } from '@/lib/api';
import type { Shift } from '@/types';
export const listShifts = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Shift[]>('/shifts', { params })).data;
export const createShift = async (p: Partial<Shift>) => (await api.post<Shift>('/shifts', p)).data;
export const updateShift = async (id: number, p: Partial<Shift>) => (await api.put<Shift>(`/shifts/${id}`, p)).data;
export const deleteShift = async (id: number) => (await api.delete(`/shifts/${id}`)).data;
export const assignVolunteer = async (shiftId: number, volunteerId: number) =>
  (await api.post(`/shifts/${shiftId}/assign`, { volunteerId })).data;
export const unassignVolunteer = async (shiftId: number, volunteerId: number) =>
  (await api.delete(`/shifts/${shiftId}/assign/${volunteerId}`)).data;
```

`hooks.ts` — analogous to `volunteers/hooks.ts`.

`ShiftForm.tsx` — RHF form (eventId select, name, date, startTime, endTime, requiredVolunteers, status). Use `useEvents()` to populate the event select.

`AssignVolunteersDialog.tsx` — modal listing all volunteers with checkbox; on save, calls `assignVolunteer` for each newly checked one (and `unassignVolunteer` for unchecked).

- [ ] **Step 2: Implement `client/src/pages/ShiftsPage.tsx`**

Port `shift_management/code.html` main panel. Table of shifts with assigned volunteers count + open spots + status. Buttons: "Create shift" (opens form sheet), "Assign volunteers" per row.

- [ ] **Step 3: attendance feature**

`api.ts`:

```ts
import { api } from '@/lib/api';
import type { Attendance } from '@/types';
export const listAttendance = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Attendance[]>('/attendance', { params })).data;
export const upsertAttendance = async (p: Partial<Attendance>) => (await api.post<Attendance>('/attendance', p)).data;
export const updateAttendance = async (id: number, p: Partial<Attendance>) =>
  (await api.put<Attendance>(`/attendance/${id}`, p)).data;
```

`hooks.ts` — `useAttendance(params)`, `useUpsertAttendance()`, `useUpdateAttendance()`.

`CheckInRow.tsx` — one row per assigned volunteer with check-in / check-out buttons that call `upsertAttendance({ volunteerId, eventId, checkInTime: now })` / `updateAttendance(id, { checkOutTime: now })`. Status select. Hours field (read-only, derived; admin can also override via manual hours input that calls `updateAttendance` with `totalHours`).

- [ ] **Step 4: Implement `client/src/pages/AttendancePage.tsx`**

Port `attendance_tracking/code.html`. Top: event selector (uses `useEvents()`). Body: `<CheckInRow>` per assigned volunteer for the chosen event. Use `listAttendance({ eventId })` to find existing rows; for assigned-but-not-yet-checked-in volunteers create rows on demand.

- [ ] **Step 5: Manual smoke** — create a shift, assign volunteers, check them in/out, see hours appear.

- [ ] **Step 6: Commit**

```bash
git add client/src/features/shifts client/src/features/attendance client/src/pages/ShiftsPage.tsx client/src/pages/AttendancePage.tsx
git commit -m "feat(client): shifts management + attendance check-in/out (ported from Stitch mockups)"
```

---

### Task 28: ReportsPage + MessagesPage + SettingsPage

**Files:**
- Modify: `client/src/pages/ReportsPage.tsx`, `client/src/pages/MessagesPage.tsx`, `client/src/pages/SettingsPage.tsx`
- Create: `client/src/features/reports/ParticipationChart.tsx`, `client/src/features/messages/{api.ts,hooks.ts,MessageComposer.tsx,MessageHistory.tsx}`, `client/src/features/settings/{api.ts,hooks.ts,SettingsForm.tsx}`

- [ ] **Step 1: ReportsPage** — port `reports_analytics/code.html`. Cards row mirroring dashboard stats. Two charts: hours by month (`HoursByMonthChart`) and participation (`ParticipationChart` using `getHoursByEvent`). Table of "Hours by volunteer". "Export CSV" button → `<a href="/api/reports/export.csv" download>` (the auth interceptor doesn't apply to anchor tags; for the auth case we navigate via fetch + blob download — see snippet).

```tsx
async function downloadCsv() {
  const res = await api.get('/reports/export.csv', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = 'volunteers.csv'; a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: MessagesPage** — port `messages/code.html`. Composer on the left (subject, body, scope select: "All volunteers" / "Event" / "Individual" with dependent recipient picker). History on the right via `useMessages()` (`GET /api/messages`).

`features/messages/api.ts`:

```ts
import { api } from '@/lib/api';
import type { Message } from '@/types';
export const listMessages = async () => (await api.get<Message[]>('/messages')).data;
export const sendMessage = async (p: Partial<Message>) => (await api.post<Message>('/messages', p)).data;
```

`features/messages/hooks.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listMessages, sendMessage } from './api';
export const useMessages = () => useQuery({ queryKey: ['messages'], queryFn: listMessages });
export const useSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: sendMessage, onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }) });
};
```

`MessageComposer.tsx`, `MessageHistory.tsx` — straightforward components matching the Stitch markup.

- [ ] **Step 3: SettingsPage** — port `settings/code.html`. Tabs/sections: Organization (name + logo upload via `/api/uploads`), Volunteer status options (comma-separated list), Event categories, Notification settings. Save button calls `useUpdateSettings()`.

`features/settings/api.ts`:

```ts
import { api } from '@/lib/api';
import type { Settings } from '@/types';
export const getSettings = async () => (await api.get<Settings>('/settings')).data;
export const updateSettings = async (p: Partial<Settings>) => (await api.put<Settings>('/settings', p)).data;
```

`features/settings/hooks.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from './api';
export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: getSettings });
export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateSettings, onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }) });
};
```

For logo upload: a hidden `<input type="file">`, on change `POST /api/uploads` (FormData with `file`), put the returned `url` into `logoUrl`, then save.

- [ ] **Step 4: Manual smoke** — Reports renders charts + table + CSV download works. Messages send + history. Settings save persists across reload.

- [ ] **Step 5: Commit**

```bash
git add client/src/features/messages client/src/features/settings client/src/features/reports/ParticipationChart.tsx client/src/pages/ReportsPage.tsx client/src/pages/MessagesPage.tsx client/src/pages/SettingsPage.tsx
git commit -m "feat(client): reports + messages + settings pages (ported from Stitch mockups)"
```

---

### Task 29: E2E smoke test + README + final QA

**Files:**
- Create: `e2e/smoke.spec.ts`, `playwright.config.ts`
- Modify: `package.json`, `README.md`

- [ ] **Step 1: Install Playwright (root)**

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'npm run dev:server', port: 4000, reuseExistingServer: true },
    { command: 'npm run dev:client', port: 5173, reuseExistingServer: true },
  ],
});
```

- [ ] **Step 3: Create `e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('admin can log in and navigate every primary page without 404', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('admin@vms.local');
  await page.getByLabel(/password/i).fill('admin123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  for (const link of ['Volunteers', 'Events', 'Shifts', 'Attendance', 'Reports', 'Messages', 'Settings']) {
    await page.getByRole('link', { name: link }).click();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText(/404|not found/i)).toHaveCount(0);
  }
});

test('public registration page submits', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel(/first name/i).fill('Smoke');
  await page.getByLabel(/last name/i).fill('Test');
  await page.getByLabel(/email/i).fill(`smoke${Date.now()}@example.com`);
  await page.getByLabel(/I agree/i).check();
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByText(/Application submitted/i)).toBeVisible();
});
```

- [ ] **Step 4: Add E2E script to root `package.json` `scripts`**

```json
"e2e": "playwright test"
```

- [ ] **Step 5: Run E2E**

```bash
npm run db:migrate && npm run db:seed
npm run e2e
```

Expected: 2 passed.

- [ ] **Step 6: Write `README.md`**

```markdown
# Volunteer Management System

A full-stack volunteer management web app. React + TypeScript + Tailwind on the client, Express + Drizzle ORM on the server. Database driver and storage driver are switched via `.env` — run locally on SQLite or in the cloud on Neon Postgres without code changes.

## Quick start

```bash
git clone <repo>
cd volunteer_management_system
cp .env.example .env
# (open .env, set JWT_SECRET to a random 64-char string)
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
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Scripts

- `npm run dev` — starts API (4000) and client (5173) concurrently
- `npm run db:migrate` — apply migrations
- `npm run db:seed` — wipe and reseed sample data
- `npm test` — run unit tests (client + server)
- `npm run e2e` — Playwright smoke test
- `npm run build` — production build of both packages

## Architecture

- `client/` — Vite + React + TS + Tailwind + shadcn/ui + Recharts + React Router + Zustand + TanStack Query
- `server/` — Express + Drizzle ORM. DB driver factory at `server/src/db/index.ts` chooses better-sqlite3 or @neondatabase/serverless from `DB_DRIVER`. Storage driver factory at `server/src/storage/index.ts` chooses local Multer disk storage or Cloudinary unsigned upload from `STORAGE_DRIVER`.
- `stitch_volunteer_management_pro_ui_ux/` — original HTML mockups used as the visual source of truth for all React pages.

## Auth

JWT in `Authorization: Bearer …` header, stored in `localStorage`. Two roles: `admin`, `volunteer`. Admin routes are guarded by `requireRole('admin')` server-side and `<ProtectedRoute role="admin">` client-side. Public endpoints: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/volunteers/public`.
```

- [ ] **Step 7: Final QA pass**

Manually walk all 12 pages while signed in. Verify there are no console errors, no `404`s in the network tab, and every sidebar link lands on the correct page (CLAUDE.md requirement #6: zero 404s).

- [ ] **Step 8: Commit**

```bash
git add e2e playwright.config.ts package.json package-lock.json README.md
git commit -m "test: e2e smoke + README"
```

---

**End of plan.**

Total: 29 tasks across 4 companion files. Sample data is seeded in Task 7 so every page has populated content from the moment it's wired up. Every page task references its source mockup in `stitch_volunteer_management_pro_ui_ux/<screen>/code.html`. Both the DB driver (sqlite/neon) and the storage driver (local/cloudinary) are runtime-switchable via `.env` per the user's requirements.
