import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Event as EventT } from '@/types';

export function EventTable({
  events, onEdit, onDelete,
}: {
  events: EventT[];
  onEdit: (e: EventT) => void;
  onDelete: (e: EventT) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Required</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => (
          <TableRow key={e.id}>
            <TableCell>
              <Link to={`/events/${e.id}`} className="font-medium text-on-surface hover:text-primary">{e.name}</Link>
              {e.coordinator && <p className="text-xs text-on-surface-variant">Coord: {e.coordinator}</p>}
            </TableCell>
            <TableCell className="text-sm text-on-surface-variant">{e.date} · {e.startTime}</TableCell>
            <TableCell className="text-sm text-on-surface-variant">{e.location ?? '—'}</TableCell>
            <TableCell><StatusBadge status={e.status} /></TableCell>
            <TableCell className="text-right">{e.requiredVolunteers}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/events/${e.id}`} aria-label="View">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(e)} aria-label="Edit">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(e)} aria-label="Delete">
                  <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
