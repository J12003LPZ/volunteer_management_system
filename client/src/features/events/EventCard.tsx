import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Event as EventT } from '@/types';

export function EventCard({ event }: { event: EventT }) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card className="shadow-card-1 rounded-lg hover:shadow-card-2 transition">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-on-surface">{event.name}</h3>
            <StatusBadge status={event.status} />
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">event</span>
            {event.date} · {event.startTime}–{event.endTime}
          </p>
          {event.location && (
            <p className="mt-1 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">location_on</span>{event.location}
            </p>
          )}
          <p className="mt-2 text-xs text-on-surface-variant">Needs {event.requiredVolunteers} volunteers</p>
        </CardContent>
      </Card>
    </Link>
  );
}
