import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useVolunteers } from '@/features/volunteers/hooks';
import { useAssignVolunteer, useUnassignVolunteer } from './hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Shift } from '@/types';

export function AssignVolunteersDialog({
  shift, open, onOpenChange,
}: { shift: Shift | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: volunteers = [] } = useVolunteers();
  const assign = useAssignVolunteer();
  const unassign = useUnassignVolunteer();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    setSelected(new Set(shift?.assignedVolunteerIds ?? []));
  }, [shift]);

  if (!shift) return null;

  const initial = new Set(shift.assignedVolunteerIds ?? []);

  const onSave = async () => {
    const toAdd = [...selected].filter((id) => !initial.has(id));
    const toRemove = [...initial].filter((id) => !selected.has(id));
    for (const vid of toAdd) await assign.mutateAsync({ shiftId: shift.id, volunteerId: vid });
    for (const vid of toRemove) await unassign.mutateAsync({ shiftId: shift.id, volunteerId: vid });
    toast({ title: 'Assignments updated' });
    onOpenChange(false);
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign volunteers — {shift.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-on-surface-variant">
          {selected.size} / {shift.requiredVolunteers} selected
        </p>
        <ul className="divide-y divide-outline-variant max-h-96 overflow-y-auto">
          {volunteers.filter((v) => v.status === 'active').map((v) => (
            <li key={v.id} className="py-3 flex items-center gap-3">
              <Checkbox
                id={`v-${v.id}`}
                checked={selected.has(v.id)}
                onCheckedChange={() => toggle(v.id)}
              />
              <label htmlFor={`v-${v.id}`} className="flex-1 text-sm cursor-pointer">
                {v.firstName} {v.lastName}
                <span className="ml-2 text-xs text-on-surface-variant">{v.email}</span>
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
