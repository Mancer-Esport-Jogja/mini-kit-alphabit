// Mirrors backend `/user/analytics/summary` response
export interface AnalyticsSummary {
  netPnL: string;              // USDC, string for precision
  totalVolume: string;         // USDC, string for precision
  winRate: number;             // percentage 0-100
  totalTrades: number;
  currentWinStreak?: number;
  bestWinStreak?: number;
  rank?: number;
  topPercentile?: number;
}

// Backend `/user/analytics/pnl-history` returns date + cumulativePnl
// FE chart expects `cumulativePnL` (capital N); we map in service layer.
export interface PnLPoint {
  date: string;          // e.g. "2023-10-25" or "2023-10-25 14:00"
  pnl: number;
  cumulativePnL: number;
}

// Backend `/user/analytics/distribution`
export interface AssetBucket {
  label: string;   // asset symbol
  count: number;
  volume: string;  // USDC string
}

export interface ResultBucket {
  label: string;   // Win/Loss/Expired
  count: number;
}

export interface StrategyBucket {
  label: string;   // e.g. CALL_SPREAD
  count: number;
}

export interface PortfolioDistribution {
  assets: AssetBucket[];
  results: ResultBucket[];
  strategies: StrategyBucket[];
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
