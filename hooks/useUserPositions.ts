import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchUserPositions } from '@/services/thetanutsApi';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to fetch current user's positions from Thetanuts Indexer.
 * Filtered by ALPHABIT referrer.
 */
export function useUserPositions() {
  const { address } = useAccount();
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['user-positions', address, token],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      return fetchUserPositions(address, token || undefined);
    },
    enabled: !!address,
    refetchInterval: 60_000, // Refresh every minute
  });
}
