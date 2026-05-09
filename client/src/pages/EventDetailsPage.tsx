import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvent, useUpdateEvent } from '@/features/events/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EventFormSheet } from '@/features/events/EventFormSheet';
import { useToast } from '@/components/ui/use-toast';

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const eid = Number(id);
  const { data: event, isLoading } = useEvent(eid);
  const update = useUpdateEvent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading || !event) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const shifts: any[] = event.shifts ?? [];
  const attendance: any[] = event.attendance ?? [];

  return (
    <div className="space-y-stack-lg">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span> Back
      </Button>

      <Card className="shadow-card-1 rounded-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-on-surface">{event.name}</h1>
                <StatusBadge status={event.status} />
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                {event.date} · {event.startTime}–{event.endTime}
                {event.location && <> · {event.location}</>}
              </p>
              {event.coordinator && (
                <p className="text-xs text-on-surface-variant mt-1">Coordinator: {event.coordinator}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setEditOpen(true)}>Edit event</Button>
              <Button variant="outline" asChild>
                <Link to="/shifts">Manage shifts</Link>
              </Button>
              <Button
                variant="outline"
                disabled={event.status === 'completed'}
                onClick={async () => {
                  await update.mutateAsync({ id: event.id, status: 'completed' });
                  toast({ title: 'Event marked completed' });
                }}
              >
                Mark completed
              </Button>
            </div>
          </div>
          {event.description && (
            <p className="mt-4 text-sm text-on-surface whitespace-pre-wrap">{event.description}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <Card className="shadow-card-1 rounded-lg">
          <CardHeader><CardTitle>Shifts ({shifts.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {shifts.length === 0 ? (
              <p className="p-6 text-sm text-on-surface-variant">No shifts yet. <Link to="/shifts" className="text-primary hover:underline">Create one</Link>.</p>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {shifts.map((s) => (
                  <li key={s.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-on-surface">{s.name}</p>
                      <p className="text-xs text-on-surface-variant">{s.date} · {s.startTime}–{s.endTime}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card-1 rounded-lg">
          <CardHeader><CardTitle>Attendance ({attendance.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {attendance.length === 0 ? (
              <p className="p-6 text-sm text-on-surface-variant">No check-ins yet.</p>
            ) : (
              <ul className="divide-y divide-outline-variant">
                {attendance.map((a) => (
                  <li key={a.id} className="p-4 flex items-center justify-between text-sm">
                    <span>Volunteer #{a.volunteerId}</span>
                    <div className="flex items-center gap-3">
                      <span>{a.totalHours}h</span>
                      <StatusBadge status={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <EventFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={{
          id: event.id, name: event.name, date: event.date, startTime: event.startTime, endTime: event.endTime,
          location: event.location, description: event.description, requiredVolunteers: event.requiredVolunteers,
          status: event.status, coordinator: event.coordinator, notes: event.notes, createdAt: event.createdAt,
        }}
      />
    </div>
  );
}
