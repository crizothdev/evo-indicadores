import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppointments, createAppointment, deleteAppointment } from '@/services/dataService';
import type { Appointment } from '@/types';

export function useAppointments() {
  return useQuery({ queryKey: ['appointments'], queryFn: fetchAppointments });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Appointment, 'id'>) => createAppointment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
