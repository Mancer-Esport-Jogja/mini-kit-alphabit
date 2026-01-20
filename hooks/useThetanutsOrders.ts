import { useQuery } from '@tanstack/react-query';
import { fetchOrders, filterHuntOrders, getBestOrder } from '@/services/thetanutsApi';
import type { SignedOrder } from '@/types/orders';

interface UseOrdersOptions {
  target?: 'MOON' | 'DOOM';
  asset?: 'ETH' | 'BTC';
  enabled?: boolean;
}

/**
 * Hook to fetch available orders from Thetanuts RFQ.
 * Automatically polls every 30 seconds.
 */
export function useThetanutsOrders(options: UseOrdersOptions = {}) {
  const { target, asset = 'ETH', enabled = true } = options;
  
  return useQuery({
    queryKey: ['thetanuts-orders', target, asset],
    queryFn: async () => {
      const response = await fetchOrders();
      
      if (!target) {
        return {
          orders: response.data.orders,
          marketData: response.data.market_data,
          bestOrder: null,
        };
      }
      
      const filtered = filterHuntOrders(response.data.orders, target, asset);
      const bestOrder = getBestOrder(filtered);
      
      return {
        orders: filtered,
        marketData: response.data.market_data,
        bestOrder,
      };
    },
    refetchInterval: 30_000, // Poll every 30s
    enabled,
    staleTime: 25_000,
  });
}
