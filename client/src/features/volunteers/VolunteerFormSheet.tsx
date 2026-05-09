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
              phone: editing.phone ?? undefined,
              address: editing.address ?? undefined,
              city: editing.city ?? undefined,
              state: editing.state ?? undefined,
              dateOfBirth: editing.dateOfBirth ?? undefined,
              emergencyContactName: editing.emergencyContactName ?? undefined,
              emergencyContactPhone: editing.emergencyContactPhone ?? undefined,
              preferredDays: editing.preferredDays ?? undefined,
              preferredTimes: editing.preferredTimes ?? undefined,
              previousExperience: editing.previousExperience ?? undefined,
              notes: editing.notes ?? undefined,
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
