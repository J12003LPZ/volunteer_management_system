import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboard, useHoursByVolunteer, useHoursByEvent } from '@/features/reports/hooks';
import { downloadCsv } from '@/features/reports/api';
import { HoursByMonthChart } from '@/features/reports/HoursByMonthChart';
import { ParticipationChart } from '@/features/reports/ParticipationChart';
import { useToast } from '@/components/ui/use-toast';

export function ReportsPage() {
  const { data: dash } = useDashboard();
  const { data: byVolunteer = [] } = useHoursByVolunteer();
  const { data: byEvent = [] } = useHoursByEvent();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const onExport = async () => {
    try {
      setDownloading(true);
      await downloadCsv();
      toast({ title: 'CSV downloaded' });
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Reports"
        subtitle="Volunteer hours and event participation"
        actions={
          <Button onClick={onExport} disabled={downloading}>
            <span className="material-symbols-outlined text-[18px] mr-1">download</span>
            {downloading ? 'Exporting…' : 'Export CSV'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
        <Card className="shadow-card-1 rounded-lg">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-semibold text-on-surface-variant">Total hours</p>
            <p className="mt-2 text-3xl font-bold text-on-surface">{dash?.totalHours ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-1 rounded-lg">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-semibold text-on-surface-variant">Active volunteers</p>
            <p className="mt-2 text-3xl font-bold text-on-surface">{dash?.activeVolunteers ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card-1 rounded-lg">
          <CardContent className="p-6">
            <p className="text-xs uppercase font-semibold text-on-surface-variant">Upcoming events</p>
            <p className="mt-2 text-3xl font-bold text-on-surface">{dash?.upcomingEvents ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <Card className="shadow-card-1 rounded-lg">
          <CardHeader><CardTitle>Hours by month</CardTitle></CardHeader>
          <CardContent>
            {dash?.hoursByMonth?.length
              ? <HoursByMonthChart data={dash.hoursByMonth} />
              : <p className="text-sm text-on-surface-variant">No data yet.</p>}
          </CardContent>
        </Card>
        <Card className="shadow-card-1 rounded-lg">
          <CardHeader><CardTitle>Participation by event</CardTitle></CardHeader>
          <CardContent>
            {byEvent.length
              ? <ParticipationChart data={byEvent.map((e) => ({ name: e.name, attendees: e.attendees }))} />
              : <p className="text-sm text-on-surface-variant">No data yet.</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card-1 rounded-lg overflow-hidden">
        <CardHeader><CardTitle>Hours by volunteer</CardTitle></CardHeader>
        <CardContent className="p-0">
          {byVolunteer.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant">No data yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...byVolunteer].sort((a, b) => b.totalHours - a.totalHours).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell className="text-right">{v.totalHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
