import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMessages } from './hooks';
import { EmptyState } from '@/components/common/EmptyState';

export function MessageHistory() {
  const { data: messages, isLoading } = useMessages();

  return (
    <Card className="shadow-card-1 rounded-lg">
      <CardHeader><CardTitle>Message history</CardTitle></CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-on-surface-variant">Loading…</p>
        ) : !messages?.length ? (
          <EmptyState icon="forum" title="No messages yet" />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {messages.map((m) => (
              <li key={m.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-on-surface">{m.subject}</p>
                  <Badge variant="outline">{m.scope}</Badge>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 whitespace-pre-wrap">{m.body}</p>
                <p className="text-xs text-on-surface-variant mt-2">{m.sentAt}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
