import { THETANUTS_API, INDEXER_ENDPOINTS } from '@/config/api';
import { OrdersApiResponse, SignedOrder, ParsedOrder } from '@/types/orders';
import { Position } from '@/types/positions';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';

/**
 * Fetch all available orders from backend proxy
 * Backend handles authentication and rate limiting for Thetanuts V4 API
 */
export async function fetchOrders(): Promise<OrdersApiResponse> {
  const res = await fetch(THETANUTS_API.ORDERS, {
    cache: 'no-store',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }

  return res.json();
}

/**
 * Parse ticker string to extract asset and details
 * Examples: "ETH-23JAN26-2950-P", "BTC-24JAN26-89000-C"
 */
function parseTicker(ticker: string | undefined): {
  asset: string;
  dateStr: string;
  strike: string;
  type: 'C' | 'P' | 'CSPREAD' | 'PSPREAD' | 'CFLY' | 'PFLY' | string
} {
  if (!ticker) {
    return { asset: 'UNKNOWN', dateStr: '', strike: '', type: '' };
  }

  const parts = ticker.split('-');
  if (parts.length >= 4) {
    return {
      asset: parts[0],
      dateStr: parts[1],
      strike: parts[2],
      type: parts.slice(3).join('-'),
    };
  }
  return { asset: parts[0] || 'UNKNOWN', dateStr: '', strike: '', type: '' };
}

/**
 * Format expiry timestamp to readable date
 */
function formatExpiry(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Convert strike from raw value (scaled by 1e8 for prices) to human readable
 */
function formatStrike(rawStrike: string | number): number {
  const value = typeof rawStrike === 'string' ? BigInt(rawStrike) : BigInt(rawStrike);
  // Strikes are scaled by 1e8
  return Number(value) / 1e8;
}

/**
 * Format strikes array to readable string
 */
function formatStrikes(strikes: (string | number)[]): string {
  const formatted = strikes.map(formatStrike);
  if (formatted.length === 1) {
    return `$${formatted[0].toLocaleString()}`;
  } else if (formatted.length === 2) {
    return `$${formatted[0].toLocaleString()} / $${formatted[1].toLocaleString()}`;
  } else if (formatted.length === 3) {
    return `$${formatted[0].toLocaleString()} / $${formatted[1].toLocaleString()} / $${formatted[2].toLocaleString()}`;
  }
  return formatted.map(s => `$${s.toLocaleString()}`).join(' / ');
}

/**
 * Convert price from raw value (scaled by 1e8) to USDC amount
 */
function formatPremium(rawPrice: string): { value: number; formatted: string } {
  const value = Number(rawPrice) / 1e8;
  return {
    value,
    formatted: value < 1 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`,
  };
}

/**
 * Parse raw SignedOrder to UI-friendly ParsedOrder
 */
export function parseOrder(signedOrder: SignedOrder): ParsedOrder {
  const { order, nonce } = signedOrder;
  const ticker = order.ticker || generateTicker(order);
  const { asset } = parseTicker(ticker);
  const strikes = order.strikes.map(formatStrike);
  const premium = formatPremium(order.price);
  const expiry = new Date(order.expiry * 1000);

  return {
    id: nonce,
    ticker,
    asset: asset as ParsedOrder['asset'],
    direction: order.isCall ? 'CALL' : 'PUT',
    strikes,
    strikeFormatted: formatStrikes(order.strikes),
    expiry,
    expiryFormatted: formatExpiry(order.expiry),
    premium: premium.value,
    premiumFormatted: premium.formatted,
    maxCollateral: Number(order.maxCollateralUsable) / 1e6, // USDC has 6 decimals
    greeks: signedOrder.greeks,
    isSpread: order.strikes.length === 2,
    isButterfly: order.strikes.length === 3,
    rawOrder: signedOrder,
  };
}

/**
 * Generate ticker from order if not provided
 */
function generateTicker(order: SignedOrder['order']): string {
  // Determine asset from price feed
  let asset = 'UNKNOWN';
  if (order.priceFeed.toLowerCase().includes('eth') ||
    order.priceFeed.toLowerCase() === THETANUTS_CONTRACTS?.PRICE_FEEDS?.ETH?.toLowerCase()) {
    asset = 'ETH';
  } else if (order.priceFeed.toLowerCase().includes('btc') ||
    order.priceFeed.toLowerCase() === THETANUTS_CONTRACTS?.PRICE_FEEDS?.BTC?.toLowerCase()) {
    asset = 'BTC';
  }

  const date = new Date(order.expiry * 1000);
  const dateStr = date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  }).replace(/, /g, '').replace(' ', '').toUpperCase();

  const strikeStr = order.strikes.map(s => formatStrike(s).toString()).join('/');
  const typeStr = order.isCall ? 'C' : 'P';

  return `${asset}-${dateStr}-${strikeStr}-${typeStr}`;
}

/**
 * Filter orders for ALPHABIT HUNT mode
 * @param orders Raw orders from API
 * @param target 'MOON' for calls, 'DOOM' for puts
 * @param asset Filter by asset
 */
export function filterHuntOrders(
  orders: SignedOrder[],
  target?: 'MOON' | 'DOOM',
  asset?: 'ETH' | 'BTC' | 'SOL' | 'DOGE' | 'XRP' | 'BNB'
): SignedOrder[] {
  return orders.filter(o => {
    // Filter by direction if specified
    if (target === 'MOON' && !o.order.isCall) return false;
    if (target === 'DOOM' && o.order.isCall) return false;

    // Filter by asset if specified
    if (asset) {
      const ticker = o.order.ticker || '';
      if (!ticker.startsWith(asset)) return false;
    }

    // Only include orders that are not expired
    if (o.order.orderExpiryTimestamp <= Date.now() / 1000) return false;

    // Only vanilla options and spreads (1-2 strikes)
    if (o.order.strikes.length > 3) return false;

    return true;
  });
}

/**
 * Get best order (lowest premium price) for a target
 */
export function getBestOrder(orders: SignedOrder[]): SignedOrder | null {
  if (orders.length === 0) return null;

  return orders.reduce((best, current) => {
    const bestPrice = Number(best.order.price);
    const currentPrice = Number(current.order.price);
    return currentPrice < bestPrice ? current : best;
  });
}

/**
 * Group orders by expiry date
 */
export function groupOrdersByExpiry(orders: SignedOrder[]): Map<string, SignedOrder[]> {
  const grouped = new Map<string, SignedOrder[]>();

  orders.forEach(order => {
    const expiryDate = new Date(order.order.expiry * 1000).toDateString();
    const existing = grouped.get(expiryDate) || [];
    existing.push(order);
    grouped.set(expiryDate, existing);
  });

  return grouped;
}

/**
 * Group orders by asset
 */
export function groupOrdersByAsset(orders: SignedOrder[]): Map<string, SignedOrder[]> {
  const grouped = new Map<string, SignedOrder[]>();

  orders.forEach(order => {
    const { asset } = parseTicker(order.order.ticker);
    const existing = grouped.get(asset) || [];
    existing.push(order);
    grouped.set(asset, existing);
  });

  return grouped;
}

/**
 * Fetch user positions via Backend Proxy
 * @param address User wallet address
 * @param token Optional auth token
 */
export async function fetchUserPositions(address: string, token?: string): Promise<Position[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(INDEXER_ENDPOINTS.USER_POSITIONS(address), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      address,
      type: 'open',
      filterByReferrer: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch positions: ${res.status}`);
  }

  interface BackendResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string };
  }

  const result: BackendResponse<Position[]> = await res.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch positions');
  }

  return result.data;
}

/**
 * Trigger indexer sync after trade via Backend Proxy
 * @param token Optional auth token
 */
export async function triggerSync(token?: string): Promise<{ status: string }> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(INDEXER_ENDPOINTS.UPDATE, {
      method: 'POST',
      headers
    });

    interface BackendResponse<T> {
      success: boolean;
      data: T;
    }

    const result: BackendResponse<{ status: string }> = await res.json();
    return result.success ? result.data : { status: "error" };
  } catch (e) {
    console.error("Failed to trigger sync", e);
    return { status: "error" };
  }
}

/**
 * Filter orders by duration (BLITZ, RUSH, CORE, ORBIT)
 */
export function filterOrdersByDuration(
  orders: SignedOrder[],
  duration: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
): SignedOrder[] {
  const now = Date.now() / 1000;

  return orders.filter(o => {
    const timeToExpiry = o.order.expiry - now;
    const hours = timeToExpiry / 3600;

    switch (duration) {
      case 'BLITZ': // Target 6H (2h - 9h range)
        return hours >= 2 && hours <= 9;
      case 'RUSH': // Target 12H (9h - 18h range)
        return hours > 9 && hours <= 18;
      case 'CORE': // Target 24H (18h - 36h range)
        return hours > 18 && hours <= 36;
      case 'ORBIT': // Target 7D (> 36h)
        return hours > 36;
      default:
        return true;
    }
  });
}
