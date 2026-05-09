import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from './api';
import type { Event as EventT } from '@/types';

export const useEvents = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['events', params], queryFn: () => listEvents(params) });

export const useEvent = (id?: number) =>
  useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id!), enabled: id != null });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Partial<EventT>) => updateEvent(id, p),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['events'] });
      qc.invalidateQueries({ queryKey: ['event', v.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
};
