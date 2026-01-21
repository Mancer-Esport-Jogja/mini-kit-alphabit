"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// CoinGecko API - free, neutral, no rate limits for basic use
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Asset mapping for CoinGecko
const ASSET_IDS = {
    ETH: 'ethereum',
    BTC: 'bitcoin',
} as const;

interface PriceData {
    price: number;
    timestamp: number;
}

export type Asset = 'ETH' | 'BTC';

interface UsePriceOptions {
    asset?: Asset;
    pollingInterval?: number; // in ms
    maxDataPoints?: number;
}

export function usePrice(options: UsePriceOptions = {}) {
    const { asset = 'ETH', pollingInterval = 10000, maxDataPoints = 50 } = options;

    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastFetchRef = useRef<number>(0);

    const fetchPrice = useCallback(async () => {
        // Prevent too frequent fetches
        const now = Date.now();
        if (now - lastFetchRef.current < 5000) {
            return;
        }
        lastFetchRef.current = now;

        try {
            const coinId = ASSET_IDS[asset];

            // CoinGecko simple price endpoint
            const response = await fetch(
                `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const price = data[coinId]?.usd;

            if (typeof price !== 'number') {
                throw new Error('Invalid price data');
            }

            const timestamp = Date.now();

            setCurrentPrice(price);
            setLastUpdate(timestamp);
            setIsConnected(true);
            setError(null);

            // Add to history
            setPriceHistory(prev => {
                const lastPoint = prev[prev.length - 1];

                // Only add if price changed or enough time passed
                if (!lastPoint || Math.abs(lastPoint.price - price) > 0.01 || timestamp > lastPoint.timestamp + 5000) {
                    const newHistory = [...prev, { price, timestamp }];
                    return newHistory.slice(-maxDataPoints);
                }

                return prev;
            });

            if (isLoading) setIsLoading(false);

        } catch (e) {
            console.error('[Price] Error fetching:', e);
            setError('Failed to fetch price');
            setIsConnected(false);
        }
    }, [asset, maxDataPoints, isLoading]);

    // Initial fetch and polling
    useEffect(() => {
        setIsLoading(true);
        setPriceHistory([]);
        lastFetchRef.current = 0;

        // Initial fetch
        fetchPrice();

        // Setup polling
        intervalRef.current = setInterval(fetchPrice, pollingInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [asset, pollingInterval]); // eslint-disable-line react-hooks/exhaustive-deps

    // Calculate price change
    const priceChange = priceHistory.length >= 2
        ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) / priceHistory[0].price) * 100
        : 0;

    return {
        currentPrice,
        priceHistory,
        priceChange,
        isConnected,
        isLoading,
        error,
        lastUpdate,
        asset,
        refetch: fetchPrice,
    };
}

// Keep backward compatible export
export const useChainlinkPrice = usePrice;
