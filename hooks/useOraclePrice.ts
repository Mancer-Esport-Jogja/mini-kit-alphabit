import { useState, useEffect, useCallback, useRef } from 'react';

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

    const wsRef = useRef<WebSocket | null>(null);

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

    // Connect to Binance WebSocket for real-time price updates
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.close();
        }

        const wsSymbol = symbol.toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@trade`);

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const price = parseFloat(data.p);

                setCurrentPrice(price);

                // Update price change based on first recorded price
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
            } catch (e) {
                console.error('WebSocket message parse error:', e);
            }
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        ws.onerror = (e) => {
            console.error('WebSocket error:', e);
            setIsConnected(false);
        };

        wsRef.current = ws;
    }, [symbol, limit]);

    // Initial fetch and WebSocket connection
    useEffect(() => {
        fetchKlines();
        connectWebSocket();

        // Refresh klines periodically
        const intervalId = setInterval(fetchKlines, 60000);

        return () => {
            clearInterval(intervalId);
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [fetchKlines, connectWebSocket]);

    return {
        currentPrice,
        priceHistory,
        priceChange,
        isConnected,
        isLoading,
        error,
    };
}
