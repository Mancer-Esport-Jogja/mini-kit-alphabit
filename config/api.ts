export const ALPHABIT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Direct Thetanuts V4 API endpoint (no backend proxy needed for public data)
export const THETANUTS_DIRECT_API = 'https://round-snowflake-9c31.devops-118.workers.dev';

export const THETANUTS_API = {
  /**
   * Orders API - Fetch available RFQ orders via Backend Proxy
   */
  ORDERS: `${ALPHABIT_BACKEND_URL}/nuts/orders`,

  /**
   * Indexer API - User positions & history via Backend Proxy
   */
  INDEXER_BASE: `${ALPHABIT_BACKEND_URL}/nuts`,
} as const;

export const INDEXER_ENDPOINTS = {
  /** Trigger indexer sync after trade */
  UPDATE: `${THETANUTS_API.INDEXER_BASE}/update`,

  /** Get user's open positions via backend */
  USER_POSITIONS: (address: string) =>
    `${THETANUTS_API.INDEXER_BASE}/positions`, // Backend handles address in body or we can add it

  /** Get user's settled history via backend */
  USER_HISTORY: (address: string) =>
    `${THETANUTS_API.INDEXER_BASE}/positions`,
} as const;

export const MARKET_API = {
  KLINES: `${ALPHABIT_BACKEND_URL}/api/market/klines`,
} as const;
