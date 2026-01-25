export interface AnalyticsSummary {
  totalPnL: number;
  totalVolume: number;
  winRate: number;
  totalTrades: number;
  openPositions: number;
}

export interface PnLPoint {
  timestamp: number;
  pnl: number;
  cumulativePnL: number;
}

export interface AssetDistribution {
  asset: string;
  value: number;
  percentage: number;
  allocation: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  stats: {
    totalPnl: number;
    winRate: number;
    totalVolume: number;
    totalTrades: number;
    roi: number;
  };
  streak?: number;
}
