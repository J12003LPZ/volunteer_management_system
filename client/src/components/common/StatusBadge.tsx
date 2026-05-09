import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  active: 'bg-secondary-container text-on-secondary-container',
  pending: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  inactive: 'bg-surface-container-high text-on-surface-variant',
  open: 'bg-primary-fixed text-on-primary-fixed-variant',
  full: 'bg-secondary-container text-on-secondary-container',
  draft: 'bg-surface-container-high text-on-surface-variant',
  completed: 'bg-surface-container-high text-on-surface-variant',
  cancelled: 'bg-error-container text-on-error-container',
  present: 'bg-secondary-container text-on-secondary-container',
  absent: 'bg-error-container text-on-error-container',
  late: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  excused: 'bg-surface-container-high text-on-surface-variant',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn('rounded-full font-medium border-0', STYLES[status] ?? 'bg-surface-container')}>
      {status[0].toUpperCase() + status.slice(1)}
    </Badge>
  );
}
