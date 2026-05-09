import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Filters = { search: string; status: string; skill: string };

export function VolunteerFilters({ value, onChange }: { value: Filters; onChange: (v: Filters) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[240px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <Input
          placeholder="Search by name or email"
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className="pl-10"
        />
      </div>
      <Select value={value.status || 'all'} onValueChange={(v) => onChange({ ...value, status: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Filter by skill"
        value={value.skill}
        onChange={(e) => onChange({ ...value, skill: e.target.value })}
        className="w-48"
      />
    </div>
  );
}
