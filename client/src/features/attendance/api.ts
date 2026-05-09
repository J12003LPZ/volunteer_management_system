import { api } from '@/lib/api';
import type { Attendance } from '@/types';

export const listAttendance = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Attendance[]>('/attendance', { params })).data;
export const upsertAttendance = async (p: Partial<Attendance>) =>
  (await api.post<Attendance>('/attendance', p)).data;
export const updateAttendance = async (id: number, p: Partial<Attendance>) =>
  (await api.put<Attendance>(`/attendance/${id}`, p)).data;
