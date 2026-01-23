"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MARKET_API } from '@/config/api';

interface PriceData {
    price: number;
    timestamp: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
}

export type ChartInterval = '5m' | '15m' | '1h' | '6h' | '12h' | '1d';

interface UseBinancePriceOptions {
    symbol?: 'ETHUSDT' | 'BTCUSDT';
    interval?: ChartInterval;
    limit?: number;
}

export function useBinancePrice(options: UseBinancePriceOptions = {}) {
    const { symbol = 'ETHUSDT', interval = '5m', limit = 50 } = options;

    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch historical klines
    const fetchKlines = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = `${MARKET_API.KLINES}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Failed to fetch klines via proxy');

            const result = await response.json();
            if (!result.success) throw new Error(result.error?.message || 'Failed to fetch klines');

            const data = result.data;

            // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
            const history: PriceData[] = data.map((kline: (string | number)[]) => ({
                timestamp: kline[0] as number,
                open: parseFloat(kline[1] as string),
                high: parseFloat(kline[2] as string),
                low: parseFloat(kline[3] as string),
                close: parseFloat(kline[4] as string),
                price: parseFloat(kline[4] as string), // Use close as price
            }));

            setPriceHistory(history);

            // Set current price from last candle
            if (history.length > 0) {
                setCurrentPrice(history[history.length - 1].price);
            }

            setError(null);
        } catch (e) {
            setError('Failed to fetch chart data');
            console.error('[Binance API] Error:', e);
        } finally {
            setIsLoading(false);
        }
    }, [symbol, interval, limit]);

    // WebSocket for realtime price updates
    const connectWs = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`;

        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setError(null);
                console.log(`[Binance WS] Connected to ${symbol} ${interval}`);
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const kline = data.k;

                    if (kline) {
                        const price = parseFloat(kline.c); // Close price
                        setCurrentPrice(price);

                        // Update last candle in history
                        setPriceHistory(prev => {
                            if (prev.length === 0) return prev;

                            const newPoint: PriceData = {
                                timestamp: kline.t,
                                open: parseFloat(kline.o),
                                high: parseFloat(kline.h),
                                low: parseFloat(kline.l),
                                close: price,
                                price,
                            };

                            // If same candle, update it; otherwise add new
                            const lastCandle = prev[prev.length - 1];
                            if (lastCandle && lastCandle.timestamp === kline.t) {
                                return [...prev.slice(0, -1), newPoint];
                            } else if (kline.x) {
                                // Candle closed, add new one
                                return [...prev.slice(1), newPoint];
                            }

                            return [...prev.slice(0, -1), newPoint];
                        });
                    }
                } catch (e) {
                    console.error('[Binance WS] Parse error:', e);
                }
            };

            wsRef.current.onerror = () => {
                setError('WebSocket connection error');
                setIsConnected(false);
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                console.log('[Binance WS] Disconnected, reconnecting in 3s...');

                reconnectTimeoutRef.current = setTimeout(() => {
                    connectWs();
                }, 3000);
            };
        } catch (e) {
            setError('Failed to create WebSocket connection');
            console.error('[Binance WS] Connection error:', e);
        }
    }, [symbol, interval]);

    // Fetch klines on interval change
    useEffect(() => {
        fetchKlines();
    }, [fetchKlines]);

    // Connect WebSocket
    useEffect(() => {
        // Close existing connection when interval changes
        if (wsRef.current) {
            wsRef.current.close();
        }

        connectWs();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connectWs]);

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
        refetch: fetchKlines,
    };
}
