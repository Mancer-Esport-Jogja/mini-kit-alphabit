import { useState, useEffect, useCallback } from 'react';

export type ChartInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '6h' | '12h' | '1d';

interface PricePoint {
    time: number;
    price: number;
}

interface UseOraclePriceOptions {
    symbol: string; // e.g. 'ETHUSDT', 'BTCUSDT'
    interval?: ChartInterval;
    limit?: number;
}

interface UseOraclePriceReturn {
    currentPrice: number | null;
    priceHistory: PricePoint[];
    priceChange: number;
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to fetch real-time price data and history from Oracle
 * Uses REST API for history and WebSocket for real-time updates
 */
export function useOraclePrice({
    symbol,
    interval = '5m',
    limit = 50,
}: UseOraclePriceOptions): UseOraclePriceReturn {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);



    // Fetch historical klines from Binance REST API
    const fetchKlines = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch klines');
            }

            const data = await response.json();

            // Parse klines data
            // [openTime, open, high, low, close, volume, ...]
            const history: PricePoint[] = data.map((kline: unknown[]) => ({
                time: Number(kline[0]),
                price: parseFloat(String(kline[4])), // close price
            }));

            setPriceHistory(history);

            if (history.length > 0) {
                const lastPrice = history[history.length - 1].price;
                const firstPrice = history[0].price;
                setCurrentPrice(lastPrice);
                setPriceChange(((lastPrice - firstPrice) / firstPrice) * 100);
            }

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [symbol, interval, limit]);

    // Fetch current price from Thetanuts API
    const fetchCurrentPrice = useCallback(async () => {
        try {
            // Map symbol to Thetanuts format (e.g., 'ETHUSDT' -> 'ETH')
            const thetanutsSymbol = symbol.replace('USDT', '');

            const response = await fetch('https://round-snowflake-9c31.devops-118.workers.dev/');

            if (!response.ok) {
                throw new Error('Failed to fetch current price');
            }

            const data = await response.json();

            // Check if market_data exists and has our symbol
            if (data?.data?.market_data?.[thetanutsSymbol]) {
                const price = data.data.market_data[thetanutsSymbol];
                setCurrentPrice(price);
                setIsConnected(true);

                // Update price change based on first recorded price in history
                setPriceHistory(prev => {
                    if (prev.length > 0) {
                        const firstPrice = prev[0].price;
                        setPriceChange(((price - firstPrice) / firstPrice) * 100);

                        // Add new price point if significant time has passed
                        const lastTime = prev[prev.length - 1].time;
                        const now = Date.now();
                        if (now - lastTime > 60000) { // Update every minute
                            return [...prev.slice(-limit + 1), { time: now, price }];
                        }
                    }
                    return prev;
                });
            }
        } catch (err) {
            console.error('Error fetching current price:', err);
            // Don't set error state here to avoid breaking the UI for transient failures
            // as long as we have historical data
            setIsConnected(false);
        }
    }, [symbol, limit]);

    // Initial fetch and polling
    useEffect(() => {
        fetchKlines();
        fetchCurrentPrice();

        // Refresh klines periodically
        const klineIntervalId = setInterval(fetchKlines, 60000);

        // Poll for current price every 30 seconds (recommended by Thetanuts)
        const priceIntervalId = setInterval(fetchCurrentPrice, 30000);

        return () => {
            clearInterval(klineIntervalId);
            clearInterval(priceIntervalId);
        };
    }, [fetchKlines, fetchCurrentPrice]);

    return {
        currentPrice,
        priceHistory,
        priceChange,
        isConnected,
        isLoading,
        error,
    };
}
