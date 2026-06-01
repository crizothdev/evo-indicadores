import { useQuery } from '@tanstack/react-query';
import { fetchPendingUsers } from '@/services/dataService';

export function usePendingUsers() {
  return useQuery({ queryKey: ['users', 'pending'], queryFn: fetchPendingUsers });
}
