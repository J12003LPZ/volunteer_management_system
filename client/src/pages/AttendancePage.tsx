import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckInRow } from '@/features/attendance/CheckInRow';
import { useEvents } from '@/features/events/hooks';
import { useShifts } from '@/features/shifts/hooks';
import { useAttendance } from '@/features/attendance/hooks';
import { useVolunteers } from '@/features/volunteers/hooks';

export function AttendancePage() {
  const { data: events = [] } = useEvents();
  const [eventId, setEventId] = useState<number | null>(null);
  const { data: shifts = [] } = useShifts({ eventId: eventId ? String(eventId) : undefined });
  const { data: attendance = [] } = useAttendance({ eventId: eventId ? String(eventId) : undefined });
  const { data: allVolunteers = [] } = useVolunteers();

  const assignedVolunteerIds = useMemo(() => {
    const ids = new Set<number>();
    for (const s of shifts) for (const vid of (s.assignedVolunteerIds ?? [])) ids.add(vid);
    return ids;
  }, [shifts]);

  const assignedVolunteers = allVolunteers.filter((v) => assignedVolunteerIds.has(v.id));
  const attByVolunteer = new Map(attendance.map((a) => [a.volunteerId, a]));

  return (
    <div className="space-y-stack-lg">
      <PageHeader title="Attendance" subtitle="Check volunteers in and out of events" />
      <Card className="p-4 shadow-card-1 rounded-lg">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-on-surface">Event:</span>
          <Select value={eventId ? String(eventId) : ''} onValueChange={(v) => setEventId(Number(v))}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Select an event" /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.date})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-card-1 rounded-lg">
        {!eventId ? (
          <EmptyState icon="how_to_reg" title="Pick an event" hint="Choose an event above to see assigned volunteers." />
        ) : assignedVolunteers.length === 0 ? (
          <EmptyState icon="person_off" title="No volunteers assigned" hint="Assign volunteers via the Shifts page first." />
        ) : (
          <ul className="divide-y divide-outline-variant px-6">
            {assignedVolunteers.map((v) => (
              <CheckInRow
                key={v.id}
                volunteer={v}
                eventId={eventId}
                attendance={attByVolunteer.get(v.id) ?? null}
              />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
