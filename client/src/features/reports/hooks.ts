import { useQuery } from '@tanstack/react-query';
import { getDashboard, getHoursByVolunteer, getHoursByEvent } from './api';

export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

export const useHoursByVolunteer = () =>
  useQuery({ queryKey: ['hours-by-volunteer'], queryFn: getHoursByVolunteer });

export const useHoursByEvent = () =>
  useQuery({ queryKey: ['hours-by-event'], queryFn: getHoursByEvent });
