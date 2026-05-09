import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Volunteer } from '@/types';

export function VolunteerTable({
  volunteers, onEdit, onDelete,
}: {
  volunteers: Volunteer[];
  onEdit: (v: Volunteer) => void;
  onDelete: (v: Volunteer) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Volunteer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead className="text-right">Hours</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {volunteers.map((v) => (
          <TableRow key={v.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{v.firstName[0]}{v.lastName[0]}</AvatarFallback></Avatar>
                <div>
                  <Link to={`/volunteers/${v.id}`} className="font-medium text-on-surface hover:text-primary">
                    {v.firstName} {v.lastName}
                  </Link>
                  <p className="text-xs text-on-surface-variant">{v.city ?? ''}{v.state ? `, ${v.state}` : ''}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.email}</TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.phone ?? '—'}</TableCell>
            <TableCell><StatusBadge status={v.status} /></TableCell>
            <TableCell className="text-sm text-on-surface-variant">{v.skills.slice(0, 3).join(', ') || '—'}</TableCell>
            <TableCell className="text-right">{v.totalHours}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/volunteers/${v.id}`} aria-label="View">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onEdit(v)} aria-label="Edit">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(v)} aria-label="Delete">
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
