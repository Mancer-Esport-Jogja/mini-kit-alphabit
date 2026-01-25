// Backend URL from env (already includes /api prefix)
export const ALPHABIT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-alphabit.onrender.com/api';

/**
 * Auth API endpoint
 */
export const AUTH_API = {
  /** Authenticate user - POST with Bearer token */
  AUTH: `${ALPHABIT_BACKEND_URL}/auth`,
} as const;

/**
 * Thetanuts V4 API Endpoints (proxied through backend)
 * All endpoints use ALPHABIT_BACKEND_URL for authentication and rate limiting
 */
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
  USER_POSITIONS: `${THETANUTS_API.INDEXER_BASE}/positions`,

  /** Get user's historical transactions via backend */
  USER_HISTORY: `${THETANUTS_API.INDEXER_BASE}/positions`, // Same endpoint, dynamic type in request body
} as const;

export const MARKET_API = {
  /** Market klines data */
  KLINES: `${ALPHABIT_BACKEND_URL}/market/klines`,
} as const;

export const ANALYTICS_API = {
  SUMMARY: `${ALPHABIT_BACKEND_URL}/user/analytics/summary`,
  PNL_HISTORY: `${ALPHABIT_BACKEND_URL}/user/analytics/pnl-history`,
  DISTRIBUTION: `${ALPHABIT_BACKEND_URL}/user/analytics/distribution`,
} as const;

export const LEADERBOARD_API = {
  GLOBAL: `${ALPHABIT_BACKEND_URL}/leaderboard`,
} as const;
