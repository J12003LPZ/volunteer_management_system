import { api } from '@/lib/api';
import type { Event } from '@/types';

export const listEvents = async (params: Record<string, string | undefined> = {}) =>
  (await api.get<Event[]>('/events', { params })).data;
export const getEvent = async (id: number) => (await api.get(`/events/${id}`)).data;
export const createEvent = async (p: Partial<Event>) => (await api.post<Event>('/events', p)).data;
export const updateEvent = async (id: number, p: Partial<Event>) => (await api.put<Event>(`/events/${id}`, p)).data;
export const deleteEvent = async (id: number) => (await api.delete(`/events/${id}`)).data;
