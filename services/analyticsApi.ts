import { ANALYTICS_API, LEADERBOARD_API, INDEXER_ENDPOINTS } from '@/config/api';
import { Position } from '@/types/positions';

/**
 * Fetch user's historical transactions via Backend Proxy
 */
export async function fetchUserTransactions(address: string, token?: string): Promise<Position[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(INDEXER_ENDPOINTS.USER_HISTORY, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      address,
      type: 'history', // Different type for historical records
      filterByReferrer: true,
    }),
  });

  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);

  const result = await res.json();
  return result.success ? result.data : [];
}

/**
 * Fetch Global Leaderboard via Backend Proxy
 */
export async function fetchLeaderboard(): Promise<any[]> {
  const res = await fetch(LEADERBOARD_API.GLOBAL);
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  const result = await res.json();
  return result.success ? result.data : [];
}

/**
 * Fetch Portfolio Analytics Summary
 */
export async function fetchAnalyticsSummary(token: string): Promise<any> {
  const res = await fetch(ANALYTICS_API.SUMMARY, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch summary: ${res.status}`);
  const result = await res.json();
  return result.success ? result.data : null;
}

/**
 * Fetch PnL History
 */
export async function fetchPnLHistory(token: string): Promise<any[]> {
  const res = await fetch(ANALYTICS_API.PNL_HISTORY, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch PnL history: ${res.status}`);
  const result = await res.json();
  return result.success ? result.data : [];
}

/**
 * Fetch Asset Distribution
 */
export async function fetchDistribution(token: string): Promise<any[]> {
  const res = await fetch(ANALYTICS_API.DISTRIBUTION, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch distribution: ${res.status}`);
  const result = await res.json();
  return result.success ? result.data : [];
}
