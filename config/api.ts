export const THETANUTS_API = {
  /**
   * Orders API - Fetch available RFQ orders
   * Polling interval: 30 seconds
   */
  ORDERS: 'https://round-snowflake-9c31.devops-118.workers.dev/',
  
  /**
   * Indexer API - User positions & history
   */
  INDEXER_BASE: 'https://optionbook-indexer.thetanuts.finance/api/v1',
} as const;

export const INDEXER_ENDPOINTS = {
  /** Trigger indexer sync after trade */
  UPDATE: `${THETANUTS_API.INDEXER_BASE}/update`,
  
  /** Get user's open positions */
  USER_POSITIONS: (address: string) => 
    `${THETANUTS_API.INDEXER_BASE}/user/${address}/positions`,
  
  /** Get user's settled history */
  USER_HISTORY: (address: string) => 
    `${THETANUTS_API.INDEXER_BASE}/user/${address}/history`,
} as const;
