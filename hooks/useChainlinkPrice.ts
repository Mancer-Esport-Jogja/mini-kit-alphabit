"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';

// Chainlink Price Feed addresses on Base Mainnet
const CHAINLINK_FEEDS = {
    ETH: '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
    BTC: '0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F',
} as const;

// Chainlink Aggregator V3 ABI (minimal)
const AGGREGATOR_ABI = [
    {
        inputs: [],
        name: 'latestRoundData',
        outputs: [
            { name: 'roundId', type: 'uint80' },
            { name: 'answer', type: 'int256' },
            { name: 'startedAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'answeredInRound', type: 'uint80' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
    },
] as const;

interface PriceData {
    price: number;
    timestamp: number;
}

export type ChartInterval = '5m' | '15m' | '1h' | '6h' | '12h' | '1d';
export type Asset = 'ETH' | 'BTC';

interface UseChainlinkPriceOptions {
    asset?: Asset;
    pollingInterval?: number; // in ms
    maxDataPoints?: number;
}

// Create viem public client for Base
const publicClient = createPublicClient({
    chain: base,
    transport: http(),
});

export function useChainlinkPrice(options: UseChainlinkPriceOptions = {}) {
    const { asset = 'ETH', pollingInterval = 5000, maxDataPoints = 50 } = options;

    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<number>(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchPrice = useCallback(async () => {
        try {
            const feedAddress = CHAINLINK_FEEDS[asset];

            // Get latest round data
            const [, answer, , updatedAt] = await publicClient.readContract({
                address: feedAddress as `0x${string}`,
                abi: AGGREGATOR_ABI,
                functionName: 'latestRoundData',
            }) as [bigint, bigint, bigint, bigint, bigint];

            // Get decimals
            const decimals = await publicClient.readContract({
                address: feedAddress as `0x${string}`,
                abi: AGGREGATOR_ABI,
                functionName: 'decimals',
            }) as number;

            const price = parseFloat(formatUnits(answer, decimals));
            const timestamp = Number(updatedAt) * 1000;

            setCurrentPrice(price);
            setLastUpdate(timestamp);
            setIsConnected(true);
            setError(null);

            // Add to history if it's a new data point
            setPriceHistory(prev => {
                const lastPoint = prev[prev.length - 1];

                // Only add if price or timestamp changed significantly
                if (!lastPoint || Math.abs(lastPoint.price - price) > 0.01 || timestamp > lastPoint.timestamp) {
                    const newHistory = [...prev, { price, timestamp }];
                    return newHistory.slice(-maxDataPoints);
                }

                return prev;
            });

            if (isLoading) setIsLoading(false);

        } catch (e) {
            console.error('[Chainlink] Error fetching price:', e);
            setError('Failed to fetch price from Chainlink');
            setIsConnected(false);
        }
    }, [asset, maxDataPoints, isLoading]);

    // Initial fetch and polling
    useEffect(() => {
        setIsLoading(true);
        setPriceHistory([]);

        // Initial fetch
        fetchPrice();

        // Setup polling
        intervalRef.current = setInterval(fetchPrice, pollingInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetchPrice, pollingInterval]);

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
