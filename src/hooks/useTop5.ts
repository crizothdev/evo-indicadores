import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTop5, updateTop5Entry, deleteTop5Entry } from '@/services/dataService';
import type { Top5Entry } from '@/types';

export function useTop5() {
  return useQuery({ queryKey: ['top5'], queryFn: fetchTop5 });
}

export function useUpdateTop5() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Top5Entry> }) => updateTop5Entry(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['top5'] }),
  });
}

export function useDeleteTop5() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTop5Entry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['top5'] }),
  });
}
