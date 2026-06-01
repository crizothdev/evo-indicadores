import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUnits, fetchUnit, updateUnit } from '@/services/dataService';
import type { Unit } from '@/types';

export function useUnits() {
  return useQuery({ queryKey: ['units'], queryFn: fetchUnits });
}

export function useUnit(id: string) {
  return useQuery({ queryKey: ['units', id], queryFn: () => fetchUnit(id), enabled: !!id });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Unit> }) => updateUnit(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  });
}
