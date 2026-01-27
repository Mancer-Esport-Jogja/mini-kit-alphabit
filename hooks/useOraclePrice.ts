import { useState, useEffect, useCallback, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { THETANUTS_CONTRACTS } from '@/config/thetanuts';

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
    oraclePrice: number | null;
    oracleSource: 'chainlink' | 'proxy' | 'binance' | null;
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
    const publicClient = usePublicClient();
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [oraclePrice, setOraclePrice] = useState<number | null>(null);
    const [oracleSource, setOracleSource] = useState<'chainlink' | 'proxy' | 'binance' | null>(null);
    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const [priceChange, setPriceChange] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const hasLoggedFailure = useRef(false);
    const lastHistoryPriceRef = useRef<number | null>(null);
    const proxyUrl = process.env.NEXT_PUBLIC_PRICE_PROXY_URL || 'https://round-snowflake-9c31.devops-118.workers.dev/';
    const aggregatorDecimalsCache = useRef<Record<string, number>>({});

    // Reset one-time failure log when switching assets
    useEffect(() => {
        hasLoggedFailure.current = false;
    }, [symbol]);



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
            lastHistoryPriceRef.current = history.length > 0 ? history[history.length - 1].price : null;

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

    const updatePrice = useCallback((price: number) => {
        setCurrentPrice(price);
        setIsConnected(true);

        setPriceHistory(prev => {
            if (prev.length > 0) {
                const firstPrice = prev[0].price;
                setPriceChange(((price - firstPrice) / firstPrice) * 100);

                const lastTime = prev[prev.length - 1].time;
                const now = Date.now();
                if (now - lastTime > 60000) { // Update every minute
                    const updated = [...prev.slice(-limit + 1), { time: now, price }];
                    lastHistoryPriceRef.current = price;
                    return updated;
                }
            }
            lastHistoryPriceRef.current = price;
            return prev;
        });
    }, [limit]);

    const fetchPriceFromProxy = useCallback(async (): Promise<number | null> => {
        if (!proxyUrl) return null;

        // Map symbol to Thetanuts format (e.g., 'ETHUSDT' -> 'ETH')
        const thetanutsSymbol = symbol.replace('USDT', '');
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`Proxy price failed (${res.status})`);
        }
        const data = await res.json();
        const price = data?.data?.market_data?.[thetanutsSymbol];
        if (Number.isFinite(price)) {
            return Number(price);
        }
        throw new Error('Proxy response missing price');
    }, [proxyUrl, symbol]);

    const fetchPriceFromChainlink = useCallback(async (): Promise<number | null> => {
        if (!publicClient) return null;
        const asset = symbol.replace('USDT', '').toUpperCase() as keyof typeof THETANUTS_CONTRACTS.PRICE_FEEDS;
        const feedAddress = THETANUTS_CONTRACTS.PRICE_FEEDS?.[asset];
        if (!feedAddress) return null;

        const aggregatorAbi = [
            {
                inputs: [],
                name: 'latestRoundData',
                outputs: [
                    { internalType: 'uint80', name: 'roundId', type: 'uint80' },
                    { internalType: 'int256', name: 'answer', type: 'int256' },
                    { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
                    { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
                    { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
                ],
                stateMutability: 'view',
                type: 'function',
            },
            {
                inputs: [],
                name: 'decimals',
                outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
                stateMutability: 'view',
                type: 'function',
            },
        ] as const;

        try {
            let decimals = aggregatorDecimalsCache.current[feedAddress];
            if (decimals === undefined) {
                decimals = await publicClient.readContract({
                    address: feedAddress as `0x${string}`,
                    abi: aggregatorAbi,
                    functionName: 'decimals',
                }) as number;
                aggregatorDecimalsCache.current[feedAddress] = decimals;
            }

            const latest = await publicClient.readContract({
                address: feedAddress as `0x${string}`,
                abi: aggregatorAbi,
                functionName: 'latestRoundData',
            }) as readonly [bigint, bigint, bigint, bigint, bigint];

            const answer = latest[1];

            if (answer <= 0n) return null;
            return Number(answer) / 10 ** decimals;
        } catch (err) {
            return null;
        }
    }, [publicClient, symbol]);

    // Fetch current price (chart: Binance; authoritative: Chainlink→proxy→Binance)
    const fetchCurrentPrice = useCallback(async () => {
        try {
            // First: Chainlink on-chain feed for execution/settlement parity
            const chainlink = await fetchPriceFromChainlink();
            if (chainlink !== null) {
                setOraclePrice(chainlink);
                setOracleSource('chainlink');
            } else {
                // Second: Proxy / Thetanuts bridge
                try {
                    const proxyPrice = await fetchPriceFromProxy();
                    if (proxyPrice !== null) {
                        setOraclePrice(proxyPrice);
                        setOracleSource('proxy');
                    }
                } catch (proxyErr) {
                    if (!hasLoggedFailure.current) {
                        const msg = proxyErr instanceof Error ? proxyErr.message : JSON.stringify(proxyErr ?? {});
                        console.warn('Proxy price fetch failed, will fall back to Binance:', msg);
                    }
                }
            }

            // Chart + final fallback: Binance ticker
            try {
                const binanceTickerUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
                const response = await fetch(binanceTickerUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch current price (${response.status})`);
                }

                const data = await response.json();
                const price = Number(data?.price);
                if (Number.isFinite(price)) {
                    updatePrice(price);
                    if (oraclePrice === null) {
                        setOraclePrice(price);
                        setOracleSource('binance');
                    }
                    return;
                }

                throw new Error('Ticker response missing price');
            } catch (binanceErr) {
                // If both chainlink and proxy failed earlier, mark oracle source null
                if (oraclePrice === null) {
                    setOracleSource(null);
                }
                throw binanceErr;
            }
        } catch (err) {
            // Avoid spamming console with unreadable objects
            if (!hasLoggedFailure.current) {
                const msg = err instanceof Error ? err.message : JSON.stringify(err ?? {});
                console.error('Error fetching current price:', msg);
                hasLoggedFailure.current = true;
            }

            // Fallback: keep connection "offline" but use last known kline price
            setIsConnected(false);
            setCurrentPrice(prev => {
                if (prev !== null) return prev;
                if (lastHistoryPriceRef.current !== null) {
                    return lastHistoryPriceRef.current;
                }
                return null;
            });

            // Don't set error state here to avoid breaking the UI for transient failures
            // as long as we have historical data
        }
    }, [symbol, fetchPriceFromChainlink, fetchPriceFromProxy, updatePrice, oraclePrice]);

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
        oraclePrice,
        oracleSource,
        priceHistory,
        priceChange,
        isConnected,
        isLoading,
        error,
    };
}
