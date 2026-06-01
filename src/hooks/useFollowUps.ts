import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFollowUps, createFollowUp } from '@/services/dataService';
import type { FollowUp } from '@/types';

export function useFollowUps() {
  return useQuery({ queryKey: ['followUps'], queryFn: fetchFollowUps });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<FollowUp, 'id'>) => createFollowUp(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['followUps'] }),
  });
}
