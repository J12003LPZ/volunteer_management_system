import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingTable } from '@/components/common/LoadingTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EventTable } from '@/features/events/EventTable';
import { EventCard } from '@/features/events/EventCard';
import { EventFormSheet } from '@/features/events/EventFormSheet';
import { useEvents, useDeleteEvent } from '@/features/events/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Event as EventT } from '@/types';

export function EventsListPage() {
  const [status, setStatus] = useState<string>('');
  const [view, setView] = useState<'table' | 'cards'>('cards');
  const { data, isLoading } = useEvents({ status: status || undefined });
  const del = useDeleteEvent();
  const { toast } = useToast();
  const [editing, setEditing] = useState<EventT | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState<EventT | null>(null);

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Events"
        subtitle="Plan and manage volunteer events"
        actions={
          <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Create event
          </Button>
        }
      />
      <Card className="p-4 shadow-card-1 rounded-lg flex flex-wrap items-center gap-3">
        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex rounded-md border border-outline-variant overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm ${view === 'cards' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            onClick={() => setView('cards')}
          >
            <span className="material-symbols-outlined text-[18px] align-middle">grid_view</span>
          </button>
          <button
            className={`px-3 py-1.5 text-sm border-l border-outline-variant ${view === 'table' ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            onClick={() => setView('table')}
          >
            <span className="material-symbols-outlined text-[18px] align-middle">view_list</span>
          </button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="shadow-card-1 rounded-lg overflow-hidden"><LoadingTable /></Card>
      ) : !data?.length ? (
        <Card className="shadow-card-1 rounded-lg"><EmptyState icon="event" title="No events yet" hint="Create your first event to get started." /></Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {data.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      ) : (
        <Card className="shadow-card-1 rounded-lg overflow-hidden">
          <EventTable
            events={data}
            onEdit={(e) => { setEditing(e); setSheetOpen(true); }}
            onDelete={(e) => setConfirming(e)}
          />
        </Card>
      )}

      <EventFormSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Delete event?"
        description={`This will permanently remove "${confirming?.name ?? ''}" and its shifts.`}
        onConfirm={async () => {
          if (!confirming) return;
          await del.mutateAsync(confirming.id);
          toast({ title: 'Event deleted' });
        }}
      />
    </div>
  );
}
