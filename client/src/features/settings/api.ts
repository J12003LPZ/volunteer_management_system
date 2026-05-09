import { api } from '@/lib/api';
import type { Settings } from '@/types';

export const getSettings = async () => (await api.get<Settings>('/settings')).data;
export const updateSettings = async (p: Partial<Settings>) => (await api.put<Settings>('/settings', p)).data;
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const fd = new FormData();
  fd.append('file', file);
  return (await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
