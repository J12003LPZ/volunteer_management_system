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
  skills: z.string().optional(),
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
  const f = useForm<VolunteerFormValues>({
    resolver: zodResolver(VolunteerSchema) as any,
    defaultValues: { status: 'pending', ...defaultValues } as VolunteerFormValues,
  });
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
