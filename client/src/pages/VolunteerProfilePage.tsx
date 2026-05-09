import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useVolunteer, useUpdateVolunteer } from '@/features/volunteers/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { VolunteerFormSheet } from '@/features/volunteers/VolunteerFormSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import type { Attendance, Event } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function VolunteerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const vid = Number(id);
  const { data: v, isLoading } = useVolunteer(vid);
  const update = useUpdateVolunteer();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', { volunteerId: vid }],
    queryFn: async () => (await api.get<Attendance[]>('/attendance', { params: { volunteerId: vid } })).data,
    enabled: !!vid,
  });
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get<Event[]>('/events')).data,
  });

  if (isLoading || !v) return <div className="p-6 text-on-surface-variant">Loading…</div>;

  const eventById = new Map(events.map((e) => [e.id, e]));

  return (
    <div className="space-y-stack-lg">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span> Back
      </Button>
      <Card className="shadow-card-1 rounded-lg">
        <CardContent className="p-6 flex flex-wrap items-center gap-6">
          <Avatar className="h-20 w-20 text-xl">
            <AvatarFallback>{v.firstName[0]}{v.lastName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-on-surface">{v.firstName} {v.lastName}</h1>
              <StatusBadge status={v.status} />
            </div>
            <p className="text-sm text-on-surface-variant">{v.email} • {v.phone ?? '—'}</p>
            <p className="text-sm text-on-surface-variant">{v.city ?? ''}{v.state ? `, ${v.state}` : ''}</p>
            <p className="mt-2 text-sm">Total hours: <span className="font-semibold">{v.totalHours}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setEditOpen(true)}>Edit profile</Button>
            <Button variant="outline" asChild><Link to="/messages">Send message</Link></Button>
            <Button
              variant="outline"
              onClick={async () => {
                await update.mutateAsync({ id: v.id, status: v.status === 'inactive' ? 'active' : 'inactive' });
                toast({ title: v.status === 'inactive' ? 'Marked active' : 'Marked inactive' });
              }}
            >
              {v.status === 'inactive' ? 'Mark active' : 'Mark inactive'}
            </Button>
            <Button variant="outline" asChild>
              <a href={`/api/reports/export.csv`} download>Download record</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance ({attendance.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes & Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-gutter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <Card className="shadow-card-1 rounded-lg">
              <CardHeader><CardTitle>Skills & Interests</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs uppercase font-semibold text-on-surface-variant">Skills</p>
                <p className="mt-1 text-sm">{v.skills.join(', ') || '—'}</p>
                <p className="mt-3 text-xs uppercase font-semibold text-on-surface-variant">Interests</p>
                <p className="mt-1 text-sm">{v.interests.join(', ') || '—'}</p>
                <p className="mt-3 text-xs uppercase font-semibold text-on-surface-variant">Languages</p>
                <p className="mt-1 text-sm">{v.languages.join(', ') || '—'}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card-1 rounded-lg">
              <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm">{v.emergencyContactName ?? '—'}</p>
                <p className="text-sm text-on-surface-variant">{v.emergencyContactPhone ?? '—'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="shadow-card-1 rounded-lg">
            <CardContent className="p-0">
              {attendance.length === 0 ? (
                <p className="p-6 text-sm text-on-surface-variant">No attendance recorded yet.</p>
              ) : (
                <ul className="divide-y divide-outline-variant">
                  {attendance.map((a) => (
                    <li key={a.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{eventById.get(a.eventId)?.name ?? `Event #${a.eventId}`}</p>
                        <p className="text-xs text-on-surface-variant">{a.checkInTime ?? '—'} → {a.checkOutTime ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{a.totalHours}h</span>
                        <StatusBadge status={a.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="shadow-card-1 rounded-lg">
            <CardContent className="p-6 space-y-3">
              <p className="text-sm whitespace-pre-wrap">{v.notes ?? 'No admin notes yet.'}</p>
              {v.documentUrl && (
                <a href={v.documentUrl} className="text-primary text-sm hover:underline" target="_blank" rel="noreferrer">
                  View attached document
                </a>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <VolunteerFormSheet open={editOpen} onOpenChange={setEditOpen} editing={v} />
    </div>
  );
}
