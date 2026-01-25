import { useQuery } from '@tanstack/react-query';
import {
  fetchOrders,
  filterHuntOrders,
  filterOrdersByDuration,
  getBestOrder,
  parseOrder,
  groupOrdersByAsset,
  groupOrdersByExpiry
} from '@/services/thetanutsApi';
import type { SignedOrder, ParsedOrder } from '@/types/orders';

interface UseOrdersOptions {
  target?: 'MOON' | 'DOOM';
  asset?: 'ETH' | 'BTC' | 'SOL' | 'DOGE' | 'XRP' | 'BNB';
  duration?: 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT';

  enabled?: boolean;
  autoRefresh?: boolean;
}

interface OrdersData {
  orders: SignedOrder[];
  parsedOrders: ParsedOrder[];
  bestOrder: SignedOrder | null;
  bestParsedOrder: ParsedOrder | null;
  timestamp: string;
  assetGroups: Map<string, SignedOrder[]>;
  expiryGroups: Map<string, SignedOrder[]>;
  stats: {
    total: number;
    calls: number;
    puts: number;
    spreads: number;
    butterflies: number;
  };
}

/**
 * Hook to fetch available orders from Thetanuts RFQ.
 * Automatically polls every 30 seconds.
 */
export function useThetanutsOrders(options: UseOrdersOptions = {}) {
  const {
    target,
    asset,
    enabled = true,
    autoRefresh = true
  } = options;

  return useQuery<OrdersData>({
    queryKey: ['thetanuts-orders', target, asset, options.duration],
    queryFn: async () => {
      const response = await fetchOrders();

      // Access nested data structure correctly
      let orders = response.data.data.orders;

      // Apply filters if specified
      if (target || asset) {
        orders = filterHuntOrders(orders, target, asset);
      }

      // Filter by duration logic
      if (options.duration) {
        orders = filterOrdersByDuration(orders, options.duration);
      }

      // Parse orders for UI
      const parsedOrders = orders.map(parseOrder);

      // Get best order (lowest premium)
      const bestOrder = getBestOrder(orders);
      const bestParsedOrder = bestOrder ? parseOrder(bestOrder) : null;

      // Group orders
      const assetGroups = groupOrdersByAsset(orders);
      const expiryGroups = groupOrdersByExpiry(orders);

      // Calculate stats
      const stats = {
        total: orders.length,
        calls: orders.filter(o => o.order.isCall).length,
        puts: orders.filter(o => !o.order.isCall).length,
        spreads: orders.filter(o => o.order.strikes.length === 2).length,
        butterflies: orders.filter(o => o.order.strikes.length === 3).length,
      };

      return {
        orders,
        parsedOrders,
        bestOrder,
        bestParsedOrder,
        timestamp: response.data.data.timestamp,
        assetGroups,
        expiryGroups,
        stats,
      };
    },
    refetchInterval: autoRefresh ? 30_000 : false, // Poll every 30s
    enabled,
    staleTime: 25_000,
  });
}

/**
 * Hook to get orders for a specific asset
 */
export function useAssetOrders(asset: 'ETH' | 'BTC' | 'SOL' | 'DOGE' | 'XRP' | 'BNB') {
  return useThetanutsOrders({ asset, enabled: true });
}

/**
 * Hook for HUNT mode - filtered for calls or puts
 */
export function useHuntOrders(
  target: 'MOON' | 'DOOM',
  asset: 'ETH' | 'BTC' = 'ETH'
) {
  return useThetanutsOrders({ target, asset, enabled: true });
}
