import { api } from '@/lib/api';
import type { Shift } from '@/types';

export const listShifts = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Shift[]>('/shifts', { params })).data;
export const createShift = async (p: Partial<Shift>) => (await api.post<Shift>('/shifts', p)).data;
export const updateShift = async (id: number, p: Partial<Shift>) => (await api.put<Shift>(`/shifts/${id}`, p)).data;
export const deleteShift = async (id: number) => (await api.delete(`/shifts/${id}`)).data;
export const assignVolunteer = async (shiftId: number, volunteerId: number) =>
  (await api.post(`/shifts/${shiftId}/assign`, { volunteerId })).data;
export const unassignVolunteer = async (shiftId: number, volunteerId: number) =>
  (await api.delete(`/shifts/${shiftId}/assign/${volunteerId}`)).data;
