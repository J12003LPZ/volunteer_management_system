import { api } from '@/lib/api';
import type { Volunteer } from '@/types';

export const listVolunteers = async (params: Record<string, string | undefined>) =>
  (await api.get<Volunteer[]>('/volunteers', { params })).data;

export const getVolunteer = async (id: number) =>
  (await api.get<Volunteer>(`/volunteers/${id}`)).data;

export const createVolunteer = async (payload: Partial<Volunteer>) =>
  (await api.post<Volunteer>('/volunteers', payload)).data;

export const updateVolunteer = async (id: number, payload: Partial<Volunteer>) =>
  (await api.put<Volunteer>(`/volunteers/${id}`, payload)).data;

export const deleteVolunteer = async (id: number) =>
  (await api.delete(`/volunteers/${id}`)).data;
