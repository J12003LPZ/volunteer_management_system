import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/features/events/hooks';

export const ShiftSchema = z.object({
  eventId: z.coerce.number().int(),
  name: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  requiredVolunteers: z.coerce.number().int().min(1).default(1),
  status: z.enum(['open', 'full', 'completed', 'cancelled']).default('open'),
});

export type ShiftFormValues = z.infer<typeof ShiftSchema>;

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

export function ShiftForm({
  defaultValues, submitLabel = 'Save', onSubmit,
}: {
  defaultValues?: Partial<ShiftFormValues>;
  submitLabel?: string;
  onSubmit: (values: ShiftFormValues) => Promise<void> | void;
}) {
  const { data: events = [] } = useEvents();
  const f = useForm<ShiftFormValues>({
    resolver: zodResolver(ShiftSchema) as any,
    defaultValues: { status: 'open', requiredVolunteers: 1, ...defaultValues } as ShiftFormValues,
  });

  return (
    <form onSubmit={f.handleSubmit(async (v) => { await onSubmit(v); })} className="space-y-stack-md">
      <Field id="eventId" label="Event">
        <Select
          defaultValue={defaultValues?.eventId ? String(defaultValues.eventId) : undefined}
          onValueChange={(v) => f.setValue('eventId', Number(v))}
        >
          <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
          <SelectContent>
            {events.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.date})</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field id="name" label="Shift name" error={f.formState.errors.name?.message}>
        <Input id="name" {...f.register('name')} placeholder="Morning shift" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field id="date" label="Date" error={f.formState.errors.date?.message}>
          <Input id="date" type="date" {...f.register('date')} />
        </Field>
        <Field id="startTime" label="Start" error={f.formState.errors.startTime?.message}>
          <Input id="startTime" type="time" {...f.register('startTime')} />
        </Field>
        <Field id="endTime" label="End" error={f.formState.errors.endTime?.message}>
          <Input id="endTime" type="time" {...f.register('endTime')} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="requiredVolunteers" label="Required volunteers">
          <Input id="requiredVolunteers" type="number" min="1" {...f.register('requiredVolunteers')} />
        </Field>
        <Field id="status" label="Status">
          <Select defaultValue={f.getValues('status')} onValueChange={(v) => f.setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={f.formState.isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
