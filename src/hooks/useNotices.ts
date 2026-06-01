import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '@/services/dataService';
import type { Notice } from '@/types';

export function useNotices() {
  return useQuery({ queryKey: ['notices'], queryFn: fetchNotices });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Notice, 'id' | 'createdAt'>) => createNotice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useUpdateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Notice> }) => updateNotice(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices'] }),
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notices'] }),
  });
}
