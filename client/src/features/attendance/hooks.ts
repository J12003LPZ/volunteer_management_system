import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listAttendance, updateAttendance, upsertAttendance } from './api';
import type { Attendance } from '@/types';

export const useAttendance = (params: Record<string, string | undefined> = {}) =>
  useQuery({ queryKey: ['attendance', params], queryFn: () => listAttendance(params) });

export const useUpsertAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
};

export const useUpdateAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...p }: { id: number } & Partial<Attendance>) => updateAttendance(id, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
};
