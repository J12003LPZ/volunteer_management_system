import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSendMessage } from './hooks';
import { useEvents } from '@/features/events/hooks';
import { useVolunteers } from '@/features/volunteers/hooks';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Schema = z.object({
  scope: z.enum(['individual', 'event', 'all']),
  recipientVolunteerId: z.coerce.number().int().optional(),
  recipientEventId: z.coerce.number().int().optional(),
  subject: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
});
type Form = z.infer<typeof Schema>;

export function MessageComposer() {
  const send = useSendMessage();
  const { data: events = [] } = useEvents();
  const { data: volunteers = [] } = useVolunteers();
  const { toast } = useToast();
  const f = useForm<Form>({
    resolver: zodResolver(Schema) as any,
    defaultValues: { scope: 'all', subject: '', body: '' } as Form,
  });
  const scope = f.watch('scope');

  const onSubmit = f.handleSubmit(async (v) => {
    const payload: any = { scope: v.scope, subject: v.subject, body: v.body };
    if (v.scope === 'individual' && v.recipientVolunteerId) payload.recipientVolunteerId = v.recipientVolunteerId;
    if (v.scope === 'event' && v.recipientEventId) payload.recipientEventId = v.recipientEventId;
    await send.mutateAsync(payload);
    toast({ title: 'Message sent' });
    f.reset({ scope: 'all', subject: '', body: '' });
  });

  return (
    <Card className="shadow-card-1 rounded-lg">
      <CardHeader><CardTitle>Send a message</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="scope">Recipients</Label>
            <Select defaultValue="all" onValueChange={(v) => f.setValue('scope', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All volunteers</SelectItem>
                <SelectItem value="event">An event group</SelectItem>
                <SelectItem value="individual">A single volunteer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {scope === 'individual' && (
            <div className="space-y-1.5">
              <Label htmlFor="recipientVolunteerId">Volunteer</Label>
              <Select onValueChange={(v) => f.setValue('recipientVolunteerId', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choose a volunteer" /></SelectTrigger>
                <SelectContent>
                  {volunteers.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.firstName} {v.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {scope === 'event' && (
            <div className="space-y-1.5">
              <Label htmlFor="recipientEventId">Event</Label>
              <Select onValueChange={(v) => f.setValue('recipientEventId', Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...f.register('subject')} />
            {f.formState.errors.subject && <p className="text-xs text-error">{f.formState.errors.subject.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" rows={6} {...f.register('body')} />
            {f.formState.errors.body && <p className="text-xs text-error">{f.formState.errors.body.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={f.formState.isSubmitting}>
              <span className="material-symbols-outlined text-[18px] mr-1">send</span> Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
