import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchUserPositions } from '@/services/thetanutsApi';

/**
 * Hook to fetch current user's positions from Thetanuts Indexer.
 * Filtered by ALPHABIT referrer.
 */
export function useUserPositions() {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: ['user-positions', address],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      return fetchUserPositions(address);
    },
    enabled: !!address,
    refetchInterval: 60_000, // Refresh every minute
  });
}
