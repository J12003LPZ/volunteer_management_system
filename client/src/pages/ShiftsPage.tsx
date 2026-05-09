import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingTable } from '@/components/common/LoadingTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ShiftFormSheet } from '@/features/shifts/ShiftFormSheet';
import { AssignVolunteersDialog } from '@/features/shifts/AssignVolunteersDialog';
import { useShifts, useDeleteShift } from '@/features/shifts/hooks';
import { useEvents } from '@/features/events/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Shift } from '@/types';

export function ShiftsPage() {
  const { data: shifts, isLoading } = useShifts();
  const { data: events = [] } = useEvents();
  const del = useDeleteShift();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Shift | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [assigning, setAssigning] = useState<Shift | null>(null);
  const [confirming, setConfirming] = useState<Shift | null>(null);

  const eventName = (eid: number) => events.find((e) => e.id === eid)?.name ?? `Event #${eid}`;

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Shifts"
        subtitle="Schedule and assign volunteers to event shifts"
        actions={
          <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Create shift
          </Button>
        }
      />
      <Card className="shadow-card-1 rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingTable />
        ) : !shifts?.length ? (
          <EmptyState icon="schedule" title="No shifts yet" hint="Create a shift and assign volunteers." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Open spots</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{eventName(s.eventId)}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{s.date}</TableCell>
                  <TableCell className="text-sm text-on-surface-variant">{s.startTime}–{s.endTime}</TableCell>
                  <TableCell className="text-right">{s.assignedVolunteerIds?.length ?? 0} / {s.requiredVolunteers}</TableCell>
                  <TableCell className="text-right">{s.openSpots ?? 0}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setAssigning(s)}>Assign</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setSheetOpen(true); }} aria-label="Edit">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirming(s)} aria-label="Delete">
                        <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ShiftFormSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
      <AssignVolunteersDialog shift={assigning} open={!!assigning} onOpenChange={(v) => !v && setAssigning(null)} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Delete shift?"
        description={`This will permanently remove "${confirming?.name ?? ''}" and its assignments.`}
        onConfirm={async () => {
          if (!confirming) return;
          await del.mutateAsync(confirming.id);
          toast({ title: 'Shift deleted' });
        }}
      />
    </div>
  );
}
