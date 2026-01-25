import { useQuery } from '@tanstack/react-query';
import { fetchLeaderboard } from '@/services/analyticsApi';
import type { LeaderboardEntry } from '@/types/analytics';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => fetchLeaderboard(),
    staleTime: 300_000, // 5 minutes
    refetchInterval: 600_000, // 10 minutes
  });
}
