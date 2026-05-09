import { api } from '@/lib/api';
import type { DashboardSummary } from '@/types';
export const getDashboard = async (): Promise<DashboardSummary> =>
  (await api.get('/reports/dashboard')).data;

export const getHoursByVolunteer = async () =>
  (await api.get<{ id: number; name: string; totalHours: number }[]>('/reports/hours-by-volunteer')).data;

export const getHoursByEvent = async () =>
  (await api.get<{ id: number; name: string; hours: number; attendees: number }[]>('/reports/hours-by-event')).data;

export async function downloadCsv() {
  const res = await api.get('/reports/export.csv', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url; a.download = 'volunteers.csv'; a.click();
  URL.revokeObjectURL(url);
}
