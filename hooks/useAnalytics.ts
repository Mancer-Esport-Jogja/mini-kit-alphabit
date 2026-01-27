import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchAnalyticsSummary, fetchPnLHistory, fetchDistribution } from '@/services/analyticsApi';
import type { AnalyticsSummary, PnLPoint, PortfolioDistribution } from '@/types/analytics';

export function useAnalytics() {
  const { token, isAuthenticated } = useAuth();

  const summary = useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary', token],
    queryFn: () => fetchAnalyticsSummary(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 60_000,
  });

  const pnlHistory = useQuery<PnLPoint[]>({
    queryKey: ['analytics-pnl', token],
    queryFn: () => fetchPnLHistory(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 300_000,
  });

  const distribution = useQuery<PortfolioDistribution>({
    queryKey: ['analytics-distribution', token],
    queryFn: () => fetchDistribution(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 300_000,
  });

  return {
    summary,
    pnlHistory,
    distribution,
    isLoading: summary.isLoading || pnlHistory.isLoading || distribution.isLoading,
    isError: summary.isError || pnlHistory.isError || distribution.isError,
  };
}
