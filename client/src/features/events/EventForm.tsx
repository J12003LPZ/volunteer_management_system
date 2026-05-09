import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EventSchema = z.object({
  name: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  location: z.string().optional(),
  description: z.string().optional(),
  requiredVolunteers: z.coerce.number().int().min(0).default(0),
  status: z.enum(['draft', 'open', 'full', 'completed', 'cancelled']).default('draft'),
  coordinator: z.string().optional(),
  notes: z.string().optional(),
});

export type EventFormValues = z.infer<typeof EventSchema>;

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

export function EventForm({
  defaultValues, submitLabel = 'Save', onSubmit,
}: {
  defaultValues?: Partial<EventFormValues>;
  submitLabel?: string;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
}) {
  const f = useForm<EventFormValues>({
    resolver: zodResolver(EventSchema) as any,
    defaultValues: { status: 'draft', requiredVolunteers: 0, ...defaultValues } as EventFormValues,
  });

  return (
    <form onSubmit={f.handleSubmit(async (v) => { await onSubmit(v); })} className="space-y-stack-md">
      <Field id="name" label="Event name" error={f.formState.errors.name?.message}>
        <Input id="name" {...f.register('name')} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field id="date" label="Date" error={f.formState.errors.date?.message}>
          <Input id="date" type="date" {...f.register('date')} />
        </Field>
        <Field id="startTime" label="Start time" error={f.formState.errors.startTime?.message}>
          <Input id="startTime" type="time" {...f.register('startTime')} />
        </Field>
        <Field id="endTime" label="End time" error={f.formState.errors.endTime?.message}>
          <Input id="endTime" type="time" {...f.register('endTime')} />
        </Field>
      </div>
      <Field id="location" label="Location"><Input id="location" {...f.register('location')} /></Field>
      <Field id="description" label="Description"><Textarea id="description" rows={3} {...f.register('description')} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="requiredVolunteers" label="Required volunteers">
          <Input id="requiredVolunteers" type="number" min="0" {...f.register('requiredVolunteers')} />
        </Field>
        <Field id="status" label="Status">
          <Select defaultValue={f.getValues('status')} onValueChange={(v) => f.setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field id="coordinator" label="Coordinator"><Input id="coordinator" {...f.register('coordinator')} /></Field>
      <Field id="notes" label="Notes"><Textarea id="notes" rows={2} {...f.register('notes')} /></Field>
      <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
        <Button type="submit" disabled={f.formState.isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
