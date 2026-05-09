import { api } from '@/lib/api';
import type { DashboardSummary } from '@/types';
export const getDashboard = async (): Promise<DashboardSummary> =>
  (await api.get('/reports/dashboard')).data;
