import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingTable } from '@/components/common/LoadingTable';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { VolunteerFilters, type Filters } from '@/features/volunteers/VolunteerFilters';
import { VolunteerTable } from '@/features/volunteers/VolunteerTable';
import { VolunteerFormSheet } from '@/features/volunteers/VolunteerFormSheet';
import { useDeleteVolunteer, useVolunteers } from '@/features/volunteers/hooks';
import { useToast } from '@/components/ui/use-toast';
import type { Volunteer } from '@/types';

export function VolunteersListPage() {
  const [filters, setFilters] = useState<Filters>({ search: '', status: '', skill: '' });
  const { data, isLoading } = useVolunteers({
    search: filters.search || undefined,
    status: filters.status || undefined,
    skill: filters.skill || undefined,
  });
  const del = useDeleteVolunteer();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirming, setConfirming] = useState<Volunteer | null>(null);

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Volunteers"
        subtitle="Manage your volunteers and applicants"
        actions={
          <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
            <span className="material-symbols-outlined text-[18px] mr-1">add</span>
            Add Volunteer
          </Button>
        }
      />
      <Card className="p-4 shadow-card-1 rounded-lg">
        <VolunteerFilters value={filters} onChange={setFilters} />
      </Card>
      <Card className="shadow-card-1 rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingTable />
        ) : !data?.length ? (
          <EmptyState icon="groups" title="No volunteers yet" hint="Add your first volunteer to get started." />
        ) : (
          <VolunteerTable
            volunteers={data}
            onEdit={(v) => { setEditing(v); setSheetOpen(true); }}
            onDelete={(v) => setConfirming(v)}
          />
        )}
      </Card>
      <VolunteerFormSheet open={sheetOpen} onOpenChange={setSheetOpen} editing={editing} />
      <ConfirmDialog
        open={!!confirming}
        onOpenChange={(v) => !v && setConfirming(null)}
        title="Delete volunteer?"
        description={`This will permanently remove ${confirming?.firstName ?? ''} ${confirming?.lastName ?? ''}.`}
        onConfirm={async () => {
          if (!confirming) return;
          await del.mutateAsync(confirming.id);
          toast({ title: 'Volunteer deleted' });
        }}
      />
    </div>
  );
}
