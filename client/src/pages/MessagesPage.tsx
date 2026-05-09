import { PageHeader } from '@/components/common/PageHeader';
import { MessageComposer } from '@/features/messages/MessageComposer';
import { MessageHistory } from '@/features/messages/MessageHistory';

export function MessagesPage() {
  return (
    <div className="space-y-stack-lg">
      <PageHeader title="Messages" subtitle="Send announcements and direct messages" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <MessageComposer />
        <MessageHistory />
      </div>
    </div>
  );
}
