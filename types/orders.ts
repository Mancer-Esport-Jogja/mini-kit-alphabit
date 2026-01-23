/**
 * Thetanuts V4 API Response Types
 * Based on live API: https://round-snowflake-9c31.devops-118.workers.dev/
 */

export interface OrdersApiResponse {
  data: {
    timestamp: string;
    orders: SignedOrder[];
  };
}

export interface SignedOrder {
  order: Order;
  signature: string;
  chainId: number;
  optionBookAddress: `0x${string}`;
  nonce: string;
  greeks?: Greeks;
}

export interface Order {
  ticker?: string; // e.g. "ETH-23JAN26-2950-P"
  maker: `0x${string}`;
  orderExpiryTimestamp: number;
  collateral: `0x${string}`;
  isCall: boolean;
  priceFeed: `0x${string}`;
  implementation: `0x${string}`;
  isLong: boolean;
  maxCollateralUsable: string;
  strikes: (string | number)[]; // Can be bigint strings like "295000000000"
  expiry: number;
  price: string;
  numContracts?: string; // Optional - present in some orders
  extraOptionData: `0x${string}`;
  type?: string; // e.g. "binaries"
  name?: string; // e.g. "Monthly 100k Up"
}

export interface Greeks {
  delta: number;
  iv: number;       // Implied Volatility
  gamma: number;
  theta: number;
  vega: number;
}

export interface MarketData {
  BTC: number;
  ETH: number;
}

/**
 * Parsed order for UI display
 */
export interface ParsedOrder {
  id: string;
  ticker: string;
  asset: 'ETH' | 'BTC' | 'SOL' | 'DOGE' | 'XRP' | 'BNB' | string;
  direction: 'CALL' | 'PUT';
  strikes: number[];
  strikeFormatted: string;
  expiry: Date;
  expiryFormatted: string;
  premium: number; // in USDC (6 decimals normalized)
  premiumFormatted: string;
  maxCollateral: number;
  greeks?: Greeks;
  isSpread: boolean;
  isButterfly: boolean;
  rawOrder: SignedOrder;
}
