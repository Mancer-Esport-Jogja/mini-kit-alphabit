import { THETANUTS_API, INDEXER_ENDPOINTS } from '@/config/api';
import { OrdersApiResponse, SignedOrder } from '@/types/orders';
import { Position } from '@/types/positions';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';

interface BackendResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch all available orders from Thetanuts RFQ via Backend Proxy
 */
export async function fetchOrders(): Promise<OrdersApiResponse> {
  const res = await fetch(THETANUTS_API.ORDERS, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  const result: BackendResponse<OrdersApiResponse> = await res.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch orders');
  }
  
  return result.data;
}

/**
 * Filter orders for ALPHABIT HUNT mode
 * @param target 'MOON' for calls, 'DOOM' for puts
 */
export function filterHuntOrders(
  orders: SignedOrder[],
  target: 'MOON' | 'DOOM',
  asset: 'ETH' | 'BTC' = 'ETH'
): SignedOrder[] {
  const isCall = target === 'MOON';
  const priceFeed = asset === 'ETH' 
    ? THETANUTS_CONTRACTS.PRICE_FEEDS.ETH 
    : THETANUTS_CONTRACTS.PRICE_FEEDS.BTC;
  
  return orders.filter(o => 
    // Only spreads (2 strikes)
    o.order.strikes.length === 2 &&
    // Match call/put direction
    o.order.isCall === isCall &&
    // Long positions only (taker side)
    o.order.isLong === true &&
    // Match asset price feed
    o.order.priceFeed.toLowerCase() === priceFeed.toLowerCase() &&
    // USDC collateral only
    o.order.collateral.toLowerCase() === THETANUTS_CONTRACTS.TOKENS.USDC.toLowerCase() &&
    // Not expired
    o.order.orderExpiryTimestamp > Date.now() / 1000
  );
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
    const result: BackendResponse<any> = await res.json();
    return result.success ? result.data : { status: "error" };
  } catch (e) {
    console.error("Failed to trigger sync", e);
    return { status: "error" };
  }
}
