import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EventForm, type EventFormValues } from './EventForm';
import { useCreateEvent, useUpdateEvent } from './hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Event as EventT } from '@/types';

export function EventFormSheet({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing?: EventT | null }) {
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const { toast } = useToast();

  const onSubmit = async (values: EventFormValues) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values });
      toast({ title: 'Event updated' });
    } else {
      await create.mutateAsync(values);
      toast({ title: 'Event created' });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit event' : 'Create event'}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <EventForm
            defaultValues={editing ? {
              name: editing.name,
              date: editing.date,
              startTime: editing.startTime,
              endTime: editing.endTime,
              location: editing.location ?? undefined,
              description: editing.description ?? undefined,
              requiredVolunteers: editing.requiredVolunteers,
              status: editing.status,
              coordinator: editing.coordinator ?? undefined,
              notes: editing.notes ?? undefined,
            } : undefined}
            submitLabel={editing ? 'Save changes' : 'Create event'}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
