"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';
import { TutorialOverlay } from '@/components/ui/TutorialOverlay';
import { useBinancePrice, ChartInterval } from '@/hooks/useBinancePrice';

export const HuntTerminal = () => {
    const [collateral, setCollateral] = useState(50);
    const [selectedTarget, setSelectedTarget] = useState<'MOON' | 'DOOM' | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'>('BLITZ');
    const [chartInterval, setChartInterval] = useState<ChartInterval>('5m');
    const [showTutorial, setShowTutorial] = useState(false);

    const handleTargetSelect = (target: 'MOON' | 'DOOM') => {
        setSelectedTarget(target);
    };

    // Chart timeframe options
    const timeframes = [
        { id: '5m' as ChartInterval, label: '5M' },
        { id: '15m' as ChartInterval, label: '15M' },
        { id: '1h' as ChartInterval, label: '1H' },
        { id: '6h' as ChartInterval, label: '6H' },
        { id: '12h' as ChartInterval, label: '12H' },
        { id: '1d' as ChartInterval, label: '1D' },
    ];

    // Binance Realtime Price
    const { currentPrice, priceHistory, priceChange, isConnected, isLoading } = useBinancePrice({
        symbol: 'ETHUSDT',
        interval: chartInterval,
        limit: 50
    });

    // Generate SVG path from price history
    const chartPath = useMemo(() => {
        if (priceHistory.length < 2) return '';

        const prices = priceHistory.map(p => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice || 1;

        const chartHeight = 140;
        const chartWidth = 380;
        const padding = 10;

        const points = priceHistory.map((point, index) => {
            const x = padding + (index / (priceHistory.length - 1)) * (chartWidth - 2 * padding);
            const y = padding + ((maxPrice - point.price) / range) * (chartHeight - 2 * padding);
            return `${x},${y}`;
        });

        return `M${points.join(' L')}`;
    }, [priceHistory]);

    // Area fill path
    const areaPath = useMemo(() => {
        if (!chartPath) return '';
        return `${chartPath} L380,140 L10,140 Z`;
    }, [chartPath]);

    const durations = [
        { id: 'BLITZ', label: 'BLITZ', time: '6H', color: 'text-yellow-400', border: 'border-yellow-400' },
        { id: 'RUSH', label: 'RUSH', time: '12H', color: 'text-orange-400', border: 'border-orange-400' },
        { id: 'CORE', label: 'CORE', time: '24H', color: 'text-blue-400', border: 'border-blue-400' },
        { id: 'ORBIT', label: 'ORBIT', time: '7D', color: 'text-purple-400', border: 'border-purple-400' },
    ] as const;

    const tutorialSteps = [
        {
            title: "ANALYZE",
            description: "Observe the Tactical Chart and market data. Identify potential price movements."
        },
        {
            title: "SELECT TARGET",
            description: "Choose 'MOON' if you predict the price will rise. Choose 'DOOM' if you predict a fall."
        },
        {
            title: "COMMIT & LAUNCH",
            description: "Set your collateral amount using the slider, then hit 'INITIATE SEQUENCE' to lock in your trade."
        }
    ];

    return (
        <div className="w-full max-w-md mx-auto relative bg-slate-900 border-4 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
            <TutorialOverlay
                isOpen={showTutorial}
                onClose={() => setShowTutorial(false)}
                title="HUNT TERMINAL MANUAL"
                steps={tutorialSteps}
            />

            {/* Tactical Header */}
            <div className="bg-slate-800 p-3 flex items-center justify-between border-b-4 border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    <span className="text-xs font-pixel text-slate-300 tracking-wider">TACTICAL COMMAND</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors border border-slate-600"
                    >
                        <Info size={12} className="text-yellow-500" />
                        <span className="text-[9px] font-mono text-yellow-500">DECODED TRANSMISSION</span>
                    </button>
                    <div className="text-[10px] font-mono text-slate-500">SYS.VER.2.0</div>
                </div>
            </div>

            {/* Main Display (CRT Effect) */}
            <div className="p-6 relative bg-black/80">
                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scanline opacity-20"></div>

                {/* Tactical Chart Visualization */}
                <div className="mb-6 relative h-40 bg-slate-900 border-2 border-slate-700 overflow-hidden">
                    {/* Timeframe Selector */}
                    <div className="absolute top-2 right-2 z-20 flex gap-1">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.id}
                                onClick={() => setChartInterval(tf.id)}
                                className={`px-1.5 py-0.5 text-[8px] font-mono transition-all
                                    ${chartInterval === tf.id
                                        ? 'bg-bit-green text-black'
                                        : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>

                    {/* Grid Background */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-slate-900/80 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-slate-400 animate-pulse">LOADING {chartInterval.toUpperCase()}...</span>
                        </div>
                    )}

                    {/* Realtime Chart Line (SVG) */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                        {chartPath ? (
                            <>
                                {/* Area fill under the line */}
                                <path
                                    d={areaPath}
                                    fill={`url(#gradient-${priceChange < 0 ? 'red' : 'green'})`}
                                    opacity="0.3"
                                />
                                {/* Main line */}
                                <path
                                    d={chartPath}
                                    fill="none"
                                    stroke={priceChange < 0 ? '#ef4444' : '#4ade80'}
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]"
                                />
                            </>
                        ) : (
                            <text x="200" y="80" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">
                                CONNECTING...
                            </text>
                        )}

                        <defs>
                            <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4ade80" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                            <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Live Price Indicator */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-2 py-1 border border-slate-700 rounded">
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <Wifi size={10} className="text-green-500" />
                            ) : (
                                <WifiOff size={10} className="text-red-500" />
                            )}
                            <span className="font-mono text-[10px] text-slate-300">ETH/USD</span>
                            <span className={`font-pixel text-xs ${priceChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                ${currentPrice ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                            </span>
                        </div>
                    </div>

                    {/* Price Change Badge */}
                    {priceHistory.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 border border-slate-700 rounded">
                            <span className={`font-mono text-[10px] ${priceChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(3)}%
                            </span>
                        </div>
                    )}

                    {/* Scanning Bar Animation */}
                    <div className="absolute inset-y-0 w-px bg-white/20 animate-[scan_4s_linear_infinite]" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}></div>
                </div>

                {/* Duration Selector */}
                <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                    {durations.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setSelectedDuration(mode.id)}
                            className={`flex-1 py-2 relative overflow-hidden transition-all duration-200 group
                                ${selectedDuration === mode.id
                                    ? `bg-slate-800 ${mode.border} border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]`
                                    : 'hover:bg-slate-800/50 border-2 border-transparent'
                                }`}
                        >
                            <div className="relative z-10 flex flex-col items-center">
                                <span className={`font-pixel text-[10px] sm:text-xs mb-1 ${selectedDuration === mode.id ? mode.color : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {mode.label}
                                </span>
                                <span className="font-mono text-[9px] text-slate-500">{mode.time}</span>
                            </div>
                            {selectedDuration === mode.id && (
                                <div className={`absolute inset-0 opacity-10 ${mode.color.replace('text', 'bg')}`}></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Target Selection Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* LONG / MOON Target */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTargetSelect('MOON')}
                        className={`group relative h-40 border-4 transition-all duration-300 flex flex-col items-center justify-center gap-2
                            ${selectedTarget === 'MOON'
                                ? 'bg-bit-green/10 border-bit-green shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                                : 'bg-slate-800/50 border-slate-600 hover:border-bit-green/50'
                            }`}
                    >
                        {selectedTarget === 'MOON' && (
                            <div className="absolute inset-0 border-2 border-bit-green pointer-events-none animate-pulse"></div>
                        )}
                        <TrendingUp className={`w-8 h-8 ${selectedTarget === 'MOON' ? 'text-bit-green' : 'text-slate-500 group-hover:text-bit-green'}`} />
                        <span className={`font-pixel text-sm mt-2 ${selectedTarget === 'MOON' ? 'text-bit-green' : 'text-slate-400 group-hover:text-bit-green'}`}>
                            TARGET: MOON
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">LONG DEPLOYMENT</div>
                    </motion.button>

                    {/* SHORT / DOOM Target */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTargetSelect('DOOM')}
                        className={`group relative h-40 border-4 transition-all duration-300 flex flex-col items-center justify-center gap-2
                            ${selectedTarget === 'DOOM'
                                ? 'bg-bit-coral/10 border-bit-coral shadow-[0_0_20px_rgba(232,90,90,0.2)]'
                                : 'bg-slate-800/50 border-slate-600 hover:border-bit-coral/50'
                            }`}
                    >
                        {selectedTarget === 'DOOM' && (
                            <div className="absolute inset-0 border-2 border-bit-coral pointer-events-none animate-pulse"></div>
                        )}
                        <TrendingDown className={`w-8 h-8 ${selectedTarget === 'DOOM' ? 'text-bit-coral' : 'text-slate-500 group-hover:text-bit-coral'}`} />
                        <span className={`font-pixel text-sm mt-2 ${selectedTarget === 'DOOM' ? 'text-bit-coral' : 'text-slate-400 group-hover:text-bit-coral'}`}>
                            TARGET: DOOM
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">SHORT DEPLOYMENT</div>
                    </motion.button>
                </div>

                {/* Collateral Throttle */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-pixel text-slate-400">COMMIT COLLATERAL</label>
                        <span className="font-mono text-xl text-white tracking-widest">
                            {collateral} <span className="text-xs text-slate-500">USDC</span>
                        </span>
                    </div>

                    <div className="relative h-12 bg-slate-900 border-2 border-slate-700 flex items-center px-4">
                        {/* Custom Slider Track */}
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={collateral}
                            onChange={(e) => setCollateral(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400"
                        />
                        {/* Background ticks */}
                        <div className="absolute inset-0 pointer-events-none flex justify-between px-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="h-full w-px bg-slate-800"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mission Stats */}
                <div className="bg-slate-900/80 border border-slate-700 p-3 mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-[9px] text-slate-500 font-mono mb-1">ROI ESTIMATE</div>
                        <div className="text-lg font-pixel text-bit-green">+180%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] text-slate-500 font-mono mb-1">YIELD MULTIPLIER</div>
                        <div className="text-lg font-pixel text-yellow-500">1.8x</div>
                    </div>
                </div>

                {/* Risk Warning Banner */}
                <div className="bg-bit-coral/10 border-2 border-bit-coral/50 p-3 mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-bit-coral flex-shrink-0" />
                    <div>
                        <div className="text-[9px] text-bit-coral font-mono mb-0.5">⚠ MAX RISK</div>
                        <div className="text-sm font-pixel text-bit-coral">-100% PREMIUM</div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-[9px] text-slate-500 font-mono mb-0.5">IF WRONG</div>
                        <div className="text-sm font-mono text-slate-400">You lose collateral</div>
                    </div>
                </div>

                {/* Expiry Info */}
                <div className="flex items-center justify-center gap-2 mb-4 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-mono">
                        {durations.find(d => d.id === selectedDuration)?.time}-HOUR ON-CHAIN EXPIRY
                    </span>
                </div>

                {/* Launch Button */}
                <button
                    disabled={!selectedTarget}
                    className={`w-full py-4 font-pixel text-sm uppercase tracking-widest transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                        ${!selectedTarget
                            ? 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'
                            : selectedTarget === 'MOON'
                                ? 'bg-bit-green text-black border-green-800 hover:bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                                : 'bg-bit-coral text-white border-red-900 hover:bg-red-400 shadow-[0_0_15px_rgba(232,90,90,0.4)]'
                        }`}
                >
                    {selectedTarget ? 'INITIATE SEQUENCE' : 'SELECT TARGET'}
                </button>
            </div>

            {/* Decorative Footer */}
            <div className="bg-slate-800 p-2 flex justify-between border-t-4 border-slate-700">
                <div className="flex gap-1">
                    <div className="w-16 h-2 bg-slate-700 animate-pulse"></div>
                    <div className="w-8 h-2 bg-slate-600"></div>
                </div>
                <div className="text-[8px] font-mono text-slate-500">SECURE CONNECTION</div>
            </div>
        </div>
    );
};
