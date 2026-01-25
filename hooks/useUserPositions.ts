import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { fetchUserPositions } from '@/services/thetanutsApi';
import { useAuth } from '@/context/AuthContext';
import type { Position } from '@/types/positions';

// Mock mode flag - set to true when backend is not running
const MOCK_MODE = false;

// Mock empty positions for development
const MOCK_POSITIONS: Position[] = [];

/**
 * Hook to fetch current user's positions from Thetanuts Indexer.
 * Filtered by ALPHABIT referrer.
 * 
 * In MOCK_MODE, returns empty array to avoid backend 404 errors.
 */
export function useUserPositions() {
  const { address } = useAccount();
  const { token } = useAuth();

  return useQuery({
    queryKey: ['user-positions', address, token],
    queryFn: async () => {
      // Return mock data when backend is not available
      if (MOCK_MODE) {
        return MOCK_POSITIONS;
      }

      if (!address) throw new Error('Wallet not connected');
      return fetchUserPositions(address, token || undefined);
    },
    enabled: !!address,
    refetchInterval: MOCK_MODE ? false : 60_000, // Disable refetch in mock mode
    retry: MOCK_MODE ? false : 3, // Disable retry in mock mode
  });
}
