import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '@/lib/api';
import { VolunteerForm, valuesToPayload, type VolunteerFormValues } from '@/features/volunteers/VolunteerForm';
import { Card, CardContent } from '@/components/ui/card';

export function VolunteerRegistrationPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const onSubmit = async (values: VolunteerFormValues) => {
    await api.post('/volunteers/public', valuesToPayload(values));
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
          <span className="font-bold text-xl text-on-surface">VolunteerHub</span>
        </header>
        <Card className="shadow-card-1 rounded-lg">
          <CardContent className="p-6">
            {done ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-secondary">check_circle</span>
                <h2 className="mt-3 text-2xl font-semibold text-on-surface">Application submitted</h2>
                <p className="mt-2 text-on-surface-variant">We'll review and reach out via email.</p>
                <button className="mt-4 text-primary font-medium hover:underline" onClick={() => navigate('/dashboard')}>
                  Go to dashboard
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-on-surface">Become a volunteer</h1>
                <p className="text-sm text-on-surface-variant mt-1 mb-6">Tell us about yourself.</p>
                <VolunteerForm mode="public" submitLabel="Submit application" onSubmit={onSubmit} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
