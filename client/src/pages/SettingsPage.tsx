import { useEffect, useState, useRef } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks';
import { uploadFile } from '@/features/settings/api';
import { useToast } from '@/components/ui/use-toast';

export function SettingsPage() {
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [organizationName, setOrganizationName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [statuses, setStatuses] = useState('');
  const [categories, setCategories] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setOrganizationName(settings.organizationName ?? '');
    setLogoUrl(settings.logoUrl ?? null);
    setStatuses((settings.volunteerStatuses ?? []).join(', '));
    setCategories((settings.eventCategories ?? []).join(', '));
    setNotifications(settings.notificationsEnabled ?? true);
  }, [settings]);

  const onSave = async () => {
    await update.mutateAsync({
      organizationName,
      logoUrl,
      volunteerStatuses: statuses.split(',').map((s) => s.trim()).filter(Boolean),
      eventCategories: categories.split(',').map((s) => s.trim()).filter(Boolean),
      notificationsEnabled: notifications,
    });
    toast({ title: 'Settings saved' });
  };

  const onUpload = async (file: File) => {
    try {
      setUploading(true);
      const { url } = await uploadFile(file);
      setLogoUrl(url);
      toast({ title: 'Logo uploaded' });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-stack-lg">
      <PageHeader
        title="Settings"
        subtitle="Configure your organization"
        actions={<Button onClick={onSave}>Save changes</Button>}
      />

      <Card className="shadow-card-1 rounded-lg">
        <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">Organization name</Label>
            <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="h-14 w-14 rounded-md object-cover border border-outline-variant" />
              ) : (
                <div className="h-14 w-14 rounded-md grid place-items-center bg-surface-container text-on-surface-variant">
                  <span className="material-symbols-outlined">image</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void onUpload(f); }}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload logo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card-1 rounded-lg">
        <CardHeader><CardTitle>Volunteer statuses</CardTitle></CardHeader>
        <CardContent>
          <Label htmlFor="statuses">Statuses (comma-separated)</Label>
          <Input id="statuses" value={statuses} onChange={(e) => setStatuses(e.target.value)} className="mt-1.5" />
        </CardContent>
      </Card>

      <Card className="shadow-card-1 rounded-lg">
        <CardHeader><CardTitle>Event categories</CardTitle></CardHeader>
        <CardContent>
          <Label htmlFor="categories">Categories (comma-separated)</Label>
          <Input id="categories" value={categories} onChange={(e) => setCategories(e.target.value)} className="mt-1.5" />
        </CardContent>
      </Card>

      <Card className="shadow-card-1 rounded-lg">
        <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Checkbox
              id="notifications"
              checked={notifications}
              onCheckedChange={(v) => setNotifications(!!v)}
            />
            <Label htmlFor="notifications" className="cursor-pointer">Enable email notifications</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
