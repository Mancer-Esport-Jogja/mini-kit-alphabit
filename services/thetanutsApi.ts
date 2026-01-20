import { THETANUTS_API, INDEXER_ENDPOINTS } from '@/config/api';
import { OrdersApiResponse, SignedOrder } from '@/types/orders';
import { Position } from '@/types/positions';
import { THETANUTS_CONTRACTS, ALPHABIT_REFERRER } from '@/config/thetanuts';

/**
 * Fetch all available orders from Thetanuts RFQ
 */
export async function fetchOrders(): Promise<OrdersApiResponse> {
  const res = await fetch(THETANUTS_API.ORDERS, {
    cache: 'no-store', // Always get fresh orders
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }
  
  return res.json();
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
 * Fetch user positions
 * @param address User wallet address
 */
export async function fetchUserPositions(address: string): Promise<Position[]> {
  const res = await fetch(INDEXER_ENDPOINTS.USER_POSITIONS(address));
  
  if (!res.ok) {
    throw new Error(`Failed to fetch positions: ${res.status}`);
  }
  
  const positions: Position[] = await res.json();
  
  // Filter by ALPHABIT referrer
  return positions.filter(p => 
    p.referrer.toLowerCase() === ALPHABIT_REFERRER.toLowerCase()
  );
}

/**
 * Trigger indexer sync after trade
 */
export async function triggerSync(): Promise<{ status: string }> {
  try {
    const res = await fetch(INDEXER_ENDPOINTS.UPDATE, { method: 'POST' });
    return res.json();
  } catch (e) {
    console.error("Failed to trigger sync", e);
    return { status: "error" };
  }
}
