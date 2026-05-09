import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ShiftForm, type ShiftFormValues } from './ShiftForm';
import { useCreateShift, useUpdateShift } from './hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Shift } from '@/types';

export function ShiftFormSheet({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing?: Shift | null }) {
  const create = useCreateShift();
  const update = useUpdateShift();
  const { toast } = useToast();

  const onSubmit = async (values: ShiftFormValues) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values });
      toast({ title: 'Shift updated' });
    } else {
      await create.mutateAsync(values);
      toast({ title: 'Shift created' });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit shift' : 'Create shift'}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ShiftForm
            defaultValues={editing ? {
              eventId: editing.eventId,
              name: editing.name, date: editing.date,
              startTime: editing.startTime, endTime: editing.endTime,
              requiredVolunteers: editing.requiredVolunteers, status: editing.status,
            } : undefined}
            submitLabel={editing ? 'Save changes' : 'Create shift'}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
