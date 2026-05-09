import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useUpsertAttendance, useUpdateAttendance } from './hooks';
import type { Attendance, Volunteer } from '@/types';

export function CheckInRow({
  volunteer, eventId, attendance,
}: { volunteer: Volunteer; eventId: number; attendance?: Attendance | null }) {
  const upsert = useUpsertAttendance();
  const update = useUpdateAttendance();
  const [hoursOverride, setHoursOverride] = useState<string>('');

  const onCheckIn = async () => {
    const now = new Date().toISOString();
    if (!attendance) {
      await upsert.mutateAsync({
        volunteerId: volunteer.id, eventId, checkInTime: now, status: 'present',
      });
    } else {
      await update.mutateAsync({ id: attendance.id, checkInTime: now, status: 'present' });
    }
  };

  const onCheckOut = async () => {
    const now = new Date().toISOString();
    if (!attendance) return;
    await update.mutateAsync({ id: attendance.id, checkOutTime: now });
  };

  const onStatusChange = async (status: string) => {
    if (!attendance) {
      await upsert.mutateAsync({ volunteerId: volunteer.id, eventId, status: status as any });
    } else {
      await update.mutateAsync({ id: attendance.id, status: status as any });
    }
  };

  const onHoursOverride = async () => {
    if (!attendance || !hoursOverride) return;
    await update.mutateAsync({ id: attendance.id, totalHours: Number(hoursOverride) });
    setHoursOverride('');
  };

  return (
    <li className="py-3 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <p className="font-medium">{volunteer.firstName} {volunteer.lastName}</p>
        <p className="text-xs text-on-surface-variant">{volunteer.email}</p>
      </div>
      <div className="text-xs text-on-surface-variant w-40">
        {attendance?.checkInTime && <p>In: {new Date(attendance.checkInTime).toLocaleTimeString()}</p>}
        {attendance?.checkOutTime && <p>Out: {new Date(attendance.checkOutTime).toLocaleTimeString()}</p>}
      </div>
      <span className="text-sm w-16 text-right">{attendance?.totalHours ?? 0}h</span>
      {attendance && <StatusBadge status={attendance.status} />}
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={onCheckIn} disabled={!!attendance?.checkInTime && !attendance?.checkOutTime}>
          Check in
        </Button>
        <Button size="sm" variant="outline" onClick={onCheckOut} disabled={!attendance?.checkInTime || !!attendance?.checkOutTime}>
          Check out
        </Button>
      </div>
      <Select value={attendance?.status ?? 'absent'} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="present">Present</SelectItem>
          <SelectItem value="absent">Absent</SelectItem>
          <SelectItem value="late">Late</SelectItem>
          <SelectItem value="excused">Excused</SelectItem>
        </SelectContent>
      </Select>
      {attendance && (
        <div className="flex items-center gap-1">
          <Input
            placeholder="Hrs"
            className="w-16"
            value={hoursOverride}
            onChange={(e) => setHoursOverride(e.target.value)}
            type="number"
            step="0.25"
          />
          <Button size="sm" variant="ghost" onClick={onHoursOverride} disabled={!hoursOverride}>Set</Button>
        </div>
      )}
    </li>
  );
}
