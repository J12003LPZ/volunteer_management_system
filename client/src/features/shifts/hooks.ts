import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignVolunteer, createShift, deleteShift, listShifts, unassignVolunteer, updateShift,
} from './api';
import type { Shift } from '@/types';

export const useShifts = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['shifts', params], queryFn: () => listShifts(params) });

export const useCreateShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useUpdateShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Partial<Shift>) => updateShift(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useDeleteShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useAssignVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, volunteerId }: { shiftId: number; volunteerId: number }) => assignVolunteer(shiftId, volunteerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useUnassignVolunteer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shiftId, volunteerId }: { shiftId: number; volunteerId: number }) => unassignVolunteer(shiftId, volunteerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};
