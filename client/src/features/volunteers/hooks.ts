import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVolunteer, deleteVolunteer, getVolunteer, listVolunteers, updateVolunteer } from './api';
import type { Volunteer } from '@/types';

export const useVolunteers = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['volunteers', params], queryFn: () => listVolunteers(params) });

export const useVolunteer = (id: number | undefined) =>
  useQuery({ queryKey: ['volunteer', id], queryFn: () => getVolunteer(id!), enabled: id != null });

export const useCreateVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVolunteer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  });
};

export const useUpdateVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<Volunteer>) => updateVolunteer(id, patch),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['volunteers'] });
      qc.invalidateQueries({ queryKey: ['volunteer', v.id] });
    },
  });
};

export const useDeleteVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVolunteer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  });
};
