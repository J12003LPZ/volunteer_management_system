import { Link } from 'react-router-dom';
import { useDashboard } from '@/features/reports/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoursByMonthChart } from '@/features/reports/HoursByMonthChart';

const STAT_CARDS = [
  { key: 'totalVolunteers', icon: 'groups', label: 'Total Volunteers' },
  { key: 'activeVolunteers', icon: 'person_check', label: 'Active Volunteers' },
  { key: 'upcomingEvents', icon: 'event', label: 'Upcoming Events' },
  { key: 'openShifts', icon: 'schedule', label: 'Open Shifts' },
  { key: 'totalHours', icon: 'timer', label: 'Total Hours' },
  { key: 'pendingApplications', icon: 'pending_actions', label: 'Pending Applications' },
] as const;

export function DashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="space-y-stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Overview of your volunteer program</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/reports">View Reports</Link></Button>
          <Button asChild><Link to="/events">Create Event</Link></Button>
          <Button asChild><Link to="/volunteers">Add Volunteer</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {STAT_CARDS.map((c) => (
          <Card key={c.key} className="rounded-lg shadow-card-1">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-on-surface">
                  {isLoading ? '…' : (data?.[c.key] ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 grid place-items-center rounded-full bg-surface-container">
                <span className="material-symbols-outlined text-primary">{c.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-lg shadow-card-1">
        <CardHeader><CardTitle>Volunteer Hours by Month</CardTitle></CardHeader>
        <CardContent>
          {data?.hoursByMonth?.length ? (
            <HoursByMonthChart data={data.hoursByMonth} />
          ) : (
            <p className="text-sm text-on-surface-variant">No hours logged yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-card-1">
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {data?.recentActivity?.length ? (
            <ul className="divide-y divide-outline-variant">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="py-3 flex justify-between text-sm">
                  <span>Volunteer #{a.volunteerId} — Event #{a.eventId}</span>
                  <span className="text-on-surface-variant">{a.totalHours}h • {a.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">No recent activity.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
