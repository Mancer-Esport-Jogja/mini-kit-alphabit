import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useAuth } from '@/context/AuthContext';
import { fetchUserTransactions } from '@/services/analyticsApi';
import type { Position } from '@/types/positions';

export function useUserTransactions() {
  const { address } = useAccount();
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user-transactions', address, token],
    queryFn: () => {
      if (!address) throw new Error('Address required');
      return fetchUserTransactions(address, token || undefined);
    },
    enabled: !!address && isAuthenticated,
    staleTime: 60_000,
  });
}
