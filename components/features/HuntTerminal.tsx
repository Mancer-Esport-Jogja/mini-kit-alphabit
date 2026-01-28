"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info, AlertTriangle, Clock, Flame } from "lucide-react";
// import { TutorialOverlay } from "@/components/ui/TutorialOverlay"; // REMOVED: Replaced by Droid Tour
import { useThetanutsOrders } from "@/hooks/useThetanutsOrders";
import { useAuth } from "@/context/AuthContext";
import { useOraclePrice, type ChartInterval } from "@/hooks/useOraclePrice";
import { TacticalDroid } from "./TacticalDroid";
import { MissionControl } from "@/components/gamification/MissionControl";
import { useGamification } from "@/context/GamificationContext";
import { LevelBadge } from "@/components/gamification/LevelBadge"; // Import Badge
import { BuyModal } from "./BuyModal";
import { OrderMatrix } from "./OrderMatrix";
import { filterOrdersByDuration, getBestOrder, parseOrder } from "@/services/thetanutsApi";
import { ParsedOrder } from "@/types/orders";
// import { useTenderlyMint } from "@/hooks/useTenderlyMint";

export const HuntTerminal = () => {
    // Auth State
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { completeMission, addXp, level, streak, rankTitle, checkStreak } = useGamification(); // Gamification Hook

    // Mission State
    const [collateral, setCollateral] = useState(50);
    const [collateralSlider, setCollateralSlider] = useState(50);
    const [isEditingCollateral, setIsEditingCollateral] = useState(false);
    const [collateralText, setCollateralText] = useState(() => String(50));
    const [selectedTarget, setSelectedTarget] = useState<"MOON" | "DOOM" | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'>('BLITZ');
    const [selectedAsset, setSelectedAsset] = useState<'ETH' | 'BTC'>('ETH');
    const [chartInterval, setChartInterval] = useState<ChartInterval>('5m');

    // Tutorial State (AI Guided)
    const [tutorialStep, setTutorialStep] = useState(0); // 0 = Off

    // UI State
    const [showMissions, setShowMissions] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showOrderMatrix, setShowOrderMatrix] = useState(false);
    const [manualOrder, setManualOrder] = useState<ParsedOrder | null>(null);

    // Tenderly Testing (Dev Mode Only
    // const { mintUSDC, isTestnet } = useTenderlyMint();
    // const [isMinting, setIsMinting] = useState(false);

    // --- Gamification Logic ---
    // 1. Complete "Daily Login" on mount & check streak
    useEffect(() => {
        checkStreak();
    }, [checkStreak]);

    // 2. Unlock "Bootcamp" when tutorial finishes
    useEffect(() => {
        if (tutorialStep === 4) {
            const timer = setTimeout(() => {
                addXp(200);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [tutorialStep, addXp]);

    // 3. Complete "First Strike" when target selected
    useEffect(() => {
        if (selectedTarget) {
            completeMission('first_strike');
        }
    }, [selectedTarget, completeMission]);

    useEffect(() => {
        if (!isEditingCollateral) {
            setCollateralText(String(collateral));
        }
    }, [collateral, isEditingCollateral]);

    const parseCollateralInput = (text: string): number | null => {
        // Accept: "1000", "1,000", "1.000", "50,5", "50.5", "1.000,5", "1,000.5"
        const raw = text.trim().replace(/\s+/g, '');
        const cleaned = raw.replace(/[^0-9.,]/g, '');
        if (!cleaned) return null;

        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');

        let normalized = cleaned;
        if (hasComma && hasDot) {
            // Use the last separator as the decimal separator, treat the other as thousands separators.
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            const decimalSep = lastComma > lastDot ? ',' : '.';
            const thousandsSep = decimalSep === ',' ? '.' : ',';
            normalized = cleaned.split(thousandsSep).join('');
            if (decimalSep === ',') normalized = normalized.replace(',', '.');
        } else if (hasComma && !hasDot) {
            // Treat comma as decimal separator (common in id-ID).
            normalized = cleaned.replace(',', '.');
        } else {
            // Dot as decimal separator; nothing to do.
            normalized = cleaned;
        }

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const commitCollateral = () => {
        const parsed = parseCollateralInput(collateralText);
        if (parsed === null) {
            setCollateralText(String(collateral));
            setIsEditingCollateral(false);
            return;
        }

        const clamped = Math.min(500, Math.max(0, parsed));
        const rounded = Math.round(clamped * 100) / 100; // allow decimals (e.g. 0.5), keep sane precision

        // Slider stays minimum 1 even if free text is < 1.
        const sliderValue = Math.min(500, Math.max(1, Math.round(rounded)));

        setCollateral(rounded);
        setCollateralSlider(sliderValue);
        setCollateralText(String(rounded));
        setIsEditingCollateral(false);
    };

    const cancelCollateralEdit = () => {
        setCollateralText(String(collateral));
        setIsEditingCollateral(false);
    };


    // Fetch live orders via Backend Proxy (Filtered for Trading)
    const {
        data: orderData,
        isLoading: isOrdersLoading,
        isError,
    } = useThetanutsOrders({
        target: selectedTarget || undefined,
        asset: selectedAsset,
        // duration: selectedDuration, // We fetch ALL orders now and filter locally to support Matrix
    });

    // Fetch Sentinel Data for AI (Unfiltered by target to see full picture)
    const { data: sentimentData } = useThetanutsOrders({
        asset: selectedAsset,
        autoRefresh: false // Don't double poll too aggressively
    });

    // Calculate Market Stats for AI
    const droidStats = useMemo(() => {
        if (!sentimentData?.stats) return { callVolume: 0, putVolume: 0, spreadSize: 0 };

        // Calculate max spread to detect volatility
        let maxSpread = 0;
        if (sentimentData.parsedOrders?.length > 0) {
            const spreads = sentimentData.parsedOrders
                .filter(o => o.strikes.length >= 2)
                .map(o => Math.abs(o.strikes[1] - o.strikes[0]));
            if (spreads.length > 0) maxSpread = Math.max(...spreads);
        }

        // Gamification: "Market Recon" mission - if viewing charts/data
        if (sentimentData.stats.total > 0) {
            // completeMission('market_watch'); // This would trigger too often. Real app needs a timer.
        }

        return {
            callVolume: sentimentData.stats.calls,
            putVolume: sentimentData.stats.puts,
            spreadSize: maxSpread
        };
    }, [sentimentData]); // removed completeMission from deps to avoid loops

    // Calculate Best Order (Priority: Manual > Duration Filtered)
    const bestOrder = useMemo(() => {
        if (manualOrder) return manualOrder;
        if (!orderData?.orders) return null;

        // Filter valid orders first (expiry check is already done in API service but good to be safe)
        // Then filter by duration
        const durationOrders = filterOrdersByDuration(orderData.orders, selectedDuration);
        
        // Find best price
        const best = getBestOrder(durationOrders);
        return best ? parseOrder(best) : null;
    }, [orderData, selectedDuration, manualOrder]);



    // Chart timeframe options
    const timeframes = [
        { id: '5m' as ChartInterval, label: '5M' },
        { id: '15m' as ChartInterval, label: '15M' },
        { id: '1h' as ChartInterval, label: '1H' },
        { id: '6h' as ChartInterval, label: '6H' },
        { id: '12h' as ChartInterval, label: '12H' },
        { id: '1d' as ChartInterval, label: '1D' },
    ];

    // Oracle Realtime Price for Chart
    const { currentPrice, priceHistory, priceChange, isConnected, isLoading: isChartLoading } = useOraclePrice({
        symbol: `${selectedAsset}USDT`,
        interval: chartInterval,
        limit: 50
    });

    // Generate SVG path from price history
    const { chartPath, priceIndicators } = useMemo(() => {
        if (priceHistory.length < 2) return { chartPath: '', priceIndicators: [] };

        const prices = priceHistory.map((p: { price: number }) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice || 1;

        const chartHeight = 192; // h-48 = 192px
        const chartWidth = 380;
        const padding = 10;

        const points = priceHistory.map((point: { price: number }, index: number) => {
            const x = padding + (index / (priceHistory.length - 1)) * (chartWidth - 2 * padding);
            const y = padding + ((maxPrice - point.price) / range) * (chartHeight - 2 * padding);
            return `${x},${y}`;
        });

        // Calculate Price Steps (Indicators)
        const indicators = [];
        // Dynamic step based on asset and range
        const btcStep = range > 5000 ? 2000 : 500;
        const ethStep = range > 200 ? 50 : 10;
        const step = selectedAsset === 'BTC' ? btcStep : ethStep;

        const startPrice = Math.ceil(minPrice / step) * step;
        for (let p = startPrice; p <= maxPrice; p += step) {
            const y = padding + ((maxPrice - p) / range) * (chartHeight - 2 * padding);
            indicators.push({ label: `$${p.toLocaleString()}`, y });
        }

        return {
            chartPath: `M${points.join(' L')}`,
            priceIndicators: indicators
        };
    }, [priceHistory, selectedAsset]);

    // Area fill path
    const areaPath = useMemo(() => {
        if (!chartPath) return '';
        return `${chartPath} L380,192 L10,192 Z`;
    }, [chartPath]);

    // Calculate Payout ROI Estimate
    const roiEstimate = useMemo(() => {
        if (!bestOrder) return 0;
        
        const strikes = bestOrder.strikes; // ParsedOrder has strikes as number[]
        const premium = bestOrder.premium; // ParsedOrder has premium as number
        if (premium === 0) return 0;

        const isSpread = strikes.length >= 2;
        const isCall = bestOrder.direction === 'CALL'; // bestOrder is now ParsedOrder which has direction string

        if (isSpread) {
            // Spread: ROI = (Width - Premium) / Premium
            const lower = strikes[0];
            const upper = strikes[1];
            const width = Math.abs(upper - lower);
            return Math.round(((width - premium) / premium) * 100);
        } else {
            // Vanilla
            if (isCall) {
                return Infinity; // Unlimited upside
            } else {
                // Put: ROI = (Strike - Premium) / Premium
                // Max profit is Strike - Premium (if price goes to 0)
                return Math.round(((strikes[0] - premium) / premium) * 100);
            }
        }
    }, [bestOrder]);

    const handleTargetSelect = (target: "MOON" | "DOOM") => {
        setSelectedTarget(target);
        setManualOrder(null); // Reset manual on target change
    };

    // Tutorial Handler
    const handleNextTutorial = () => {
        setTutorialStep(prev => prev >= 4 ? 0 : prev + 1);
    };

    const durations = [
        { id: 'BLITZ', label: 'BLITZ', time: '2H-9H', color: 'text-yellow-400', border: 'border-yellow-400', info: 'Optimistic UI. 2h-9h Expiry.' },
        { id: 'RUSH', label: 'RUSH', time: '9H-18H', color: 'text-orange-400', border: 'border-orange-400', info: 'Standard 9h-18h Expiry.' },
        { id: 'CORE', label: 'CORE', time: '18H-36H', color: 'text-blue-400', border: 'border-blue-400', info: 'Daily Options (18h-36h).' },
        { id: 'ORBIT', label: 'ORBIT', time: '>36H', color: 'text-purple-400', border: 'border-purple-400', info: 'Weekly Options (>36h).' },
    ] as const;

    return (
        <div className="w-full max-w-md mx-auto relative bg-slate-900 border-4 border-slate-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* GAMIFICATION OVERLAY (Integrated) */}
            <MissionControl isOpen={showMissions} onClose={() => setShowMissions(false)} />

            {/* AI TACTICAL DROID - Now with Tutorial Props */}
            <TacticalDroid
                marketStats={droidStats}
                tutorialStep={tutorialStep}
                onNext={handleNextTutorial}
            />

            {/* TACTICAL HEADER (Redesigned for Gamification) */}
            <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b-2 border-slate-700">
                {/* Left: App Identity */}
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]"></div>
                    <div>
                        <span className="text-[10px] font-pixel text-slate-400 uppercase leading-none block">PRO TERMINAL</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-mono text-slate-600">v2.1</span>
                        </div>
                    </div>
                </div>

                {/* Asset Selector */}
                <div className="flex bg-slate-900 rounded p-0.5 border border-slate-600 mx-auto">
                    {(['ETH', 'BTC'] as const).map(asset => (
                        <button
                            key={asset}
                            onClick={() => setSelectedAsset(asset)}
                            className={`px-2 py-0.5 text-[9px] font-bold rounded transition-colors ${selectedAsset === asset
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {asset}
                        </button>
                    ))}
                </div>

                {/* Right: Gamification Status Trigger */}
                <div className="flex items-center gap-3">
                    {/* Rank & Streak Button */}
                    <button
                        onClick={() => setShowMissions(true)}
                        className="flex items-center gap-2 bg-slate-900 border border-slate-600 px-2 py-1 rounded hover:bg-slate-800 transition-colors group"
                    >
                        <LevelBadge level={level || 1} size="sm" showLevel={false} />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[9px] font-pixel text-white group-hover:text-yellow-400 transition-colors">{rankTitle || "Pilot"}</span>
                            {/* Streak Flame */}
                            <div className="flex items-center gap-0.5">
                                <Flame size={8} className={streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-600"} />
                                <span className="text-[8px] font-mono text-slate-400">{streak || 0}</span>
                            </div>
                        </div>
                    </button>

                    {/* Help Button */}
                    <button
                        onClick={() => setTutorialStep(1)} // Start Tour
                        className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 transition-colors border border-slate-600"
                        title="Start Tutorial"
                    >
                        <Info size={14} className="text-yellow-500" />
                    </button>
                </div>
            </div>

            {/* Main Display (CRT Effect) */}
            <div className="p-6 relative bg-black/80">
                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-1 animate-scanline opacity-20"></div>

                {/* === TACTICAL RADAR === */}
                <div className="mb-4 relative">
                    {/* Chart Header Bar */}
                    <div className="flex items-center justify-between bg-slate-800/80 px-2 py-1 border-b-2 border-slate-700">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="font-pixel text-[10px] text-slate-300">{selectedAsset}/USD</span>
                            <span className={`font-pixel text-sm ${priceChange < 0 ? 'text-bit-coral' : 'text-bit-green'}`}>
                                ${currentPrice ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                            </span>
                        </div>
                        <div className={`px-2 py-0.5 text-[10px] font-mono ${priceChange < 0 ? 'bg-bit-coral/20 text-bit-coral' : 'bg-bit-green/20 text-bit-green'}`}>
                            {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                        </div>
                    </div>

                    {/* Chart Area - Extra Wide (h-48) */}
                    <div className="relative h-48 bg-black border-x-2 border-slate-700 overflow-hidden">
                        {/* Pixel Grid */}
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'linear-gradient(rgba(74,222,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.3) 1px, transparent 1px)',
                            backgroundSize: '16px 16px'
                        }}></div>

                        {/* Loading State */}
                        {(isChartLoading || isOrdersLoading) && priceHistory.length === 0 && (
                            <div className="absolute inset-0 z-10 bg-black/90 flex items-center justify-center gap-2">
                                <div className="w-3 h-3 bg-bit-green animate-ping"></div>
                                <span className="text-[10px] font-pixel text-bit-green">SCANNING...</span>
                            </div>
                        )}

                        {/* Chart SVG */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 192" preserveAspectRatio="none">
                            {chartPath ? (
                                <>
                                    {/* Grid Lines & Labels */}
                                    {priceIndicators.map((indicator, i) => (
                                        <g key={i}>
                                            <line
                                                x1="10"
                                                y1={indicator.y}
                                                x2="390"
                                                y2={indicator.y}
                                                stroke="rgba(74,222,128,0.1)"
                                                strokeWidth="1"
                                                strokeDasharray="4 4"
                                            />
                                            <text
                                                x="390"
                                                y={indicator.y + 3}
                                                textAnchor="end"
                                                fill="rgba(255,255,255,0.3)"
                                                fontSize="8"
                                                fontFamily="monospace"
                                                className="font-pixel"
                                            >
                                                {indicator.label}
                                            </text>
                                        </g>
                                    ))}

                                    <path d={areaPath} fill={`url(#gradient-${priceChange < 0 ? 'red' : 'green'})`} opacity="0.4" />
                                    <path
                                        d={chartPath}
                                        fill="none"
                                        stroke={priceChange < 0 ? '#ef4444' : '#4ade80'}
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                        style={{ filter: `drop-shadow(0 0 6px ${priceChange < 0 ? '#ef4444' : '#4ade80'})` }}
                                    />
                                    {/* End Point Indicator */}
                                    <circle
                                        cx="380"
                                        cy={chartPath ? chartPath.split(' ').pop()?.split(',')[1] : 96}
                                        r="4"
                                        fill={priceChange < 0 ? '#ef4444' : '#4ade80'}
                                        className="animate-pulse"
                                    />
                                </>
                            ) : (
                                <text x="200" y="96" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">
                                    AWAITING SIGNAL...
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

                        {/* Scan Line Effect */}
                        <div className="absolute inset-y-0 w-0.5 bg-white/30 animate-[scan_3s_linear_infinite]"
                            style={{ boxShadow: '0 0 8px rgba(255,255,255,0.6)' }}></div>
                    </div>

                    {/* Timeframe Selector - Compact Pills */}
                    <div className="flex bg-slate-900 border-2 border-t-0 border-slate-700">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.id}
                                onClick={() => setChartInterval(tf.id)}
                                className={`flex-1 py-1 text-[9px] font-pixel uppercase transition-all border-r border-slate-700 last:border-r-0
                                    ${chartInterval === tf.id
                                        ? 'bg-bit-green/20 text-bit-green border-b-2 border-b-bit-green'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Selector (Step 1) */}
                <div className="mb-6">
                    <label className="block text-[10px] font-pixel text-slate-400 mb-2">1. SELECT DURATION</label>
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
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
                </div>



                {/* Target Selection Grid (Step 2) */}
                <div className="mb-8">
                    <label className="block text-[10px] font-pixel text-slate-400 mb-2">2. SELECT TARGET</label>
                    <div className="grid grid-cols-2 gap-4">
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
                            <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                                {isOrdersLoading && selectedTarget === "MOON" ? "SCANNING..." : "LONG DEPLOYMENT"}
                            </div>
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
                            <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                                {isOrdersLoading && selectedTarget === "DOOM" ? "SCANNING..." : "SHORT DEPLOYMENT"}
                            </div>
                        </motion.button>
                    </div>
                </div>



                {/* Collateral Throttle (Step 3) */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-pixel text-slate-400">3. COMMIT COLLATERAL</label>
                        {isEditingCollateral ? (
                            <div className="flex items-end gap-2">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={collateralText}
                                    onChange={(e) => setCollateralText(e.target.value)}
                                    onBlur={commitCollateral}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') commitCollateral();
                                        if (e.key === 'Escape') cancelCollateralEdit();
                                    }}
                                    autoFocus
                                    aria-label="Collateral amount in USDC"
                                    className="w-28 font-mono tabular-nums text-xl text-white tracking-normal text-right bg-black border border-slate-700 px-2 py-1 focus:outline-none focus:border-bit-green"
                                />
                                <span className="text-xs text-slate-500 font-mono">USDC</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setCollateralText(String(collateral));
                                    setIsEditingCollateral(true);
                                }}
                                className="font-mono text-xl text-white tracking-widest hover:text-bit-green transition-colors"
                                aria-label="Edit collateral amount"
                            >
                                {collateral} <span className="text-xs text-slate-500">USDC</span>
                            </button>
                        )}
                    </div>

                    <div className="relative h-12 bg-slate-900 border-2 border-slate-700 flex items-center px-4">
                        {/* Custom Slider Track */}
                        <input
                            type="range"
                            min="1"
                            max="500"
                            step="1"
                            value={collateralSlider}
                            onChange={(e) => {
                                const next = Number(e.target.value);
                                setCollateralSlider(next);
                                setCollateral(next);
                                if (!isEditingCollateral) setCollateralText(String(next));
                            }}
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

                {/* Payload Config (Step 4 - Was Mission Stats + Manual Override) */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-pixel text-slate-400">4. PAYLOAD CONFIG</label>
                        {manualOrder && (
                            <button 
                                onClick={() => setManualOrder(null)}
                                className="px-2 py-0.5 bg-red-900/50 border border-red-500 text-[9px] font-pixel text-red-400 hover:bg-red-900"
                            >
                                RESET TO AUTO
                            </button>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setShowOrderMatrix(true)}
                        className={`w-full group relative bg-slate-900/80 border-2 p-3 pr-24 text-left transition-all
                            ${manualOrder 
                                ? 'border-yellow-500/50 hover:border-yellow-400' 
                                : 'border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        <div className="absolute top-2 right-2 max-w-[55%]">
                            <span className="block text-[9px] font-pixel bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors truncate text-right">
                                {manualOrder ? "MANUAL_LOCK" : "AUTO_BEST"} :: CHANGE &gt;
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4">
                            <div className="min-w-0 pr-3 sm:pr-4">
                                <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">MAX ROI</div>
                                <div
                                    className={`font-pixel transition-colors whitespace-normal sm:whitespace-nowrap text-2xl sm:text-[26px] md:text-[28px] leading-tight ${roiEstimate > 0 ? "text-bit-green" : "text-slate-500"}`}
                                >
                                    {isOrdersLoading ? "..." : (roiEstimate === Infinity ? "UNLIMITED" : (roiEstimate > 0 ? `+${roiEstimate}%` : "N/A"))}
                                </div>
                            </div>
                            <div className="min-w-0 sm:text-right">
                                <div className="text-[9px] text-slate-500 font-mono mb-1 uppercase">TARGET STRIKE</div>
                                <div className="font-pixel text-yellow-500 text-xl sm:text-[22px] md:text-[24px] leading-tight">
                                    {isOrdersLoading ? "..." : (bestOrder ? `$${bestOrder.strikes[0].toLocaleString()}` : "---")}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Risk Warning Banner */}
                <div className="bg-bit-coral/10 border-2 border-bit-coral/50 p-3 mb-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-bit-coral flex-shrink-0" />
                    <div>
                        <div className="text-[9px] text-bit-coral font-mono mb-0.5 uppercase">⚠ Max Risk</div>
                        <div className="text-sm font-pixel text-bit-coral">-100% Premium</div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-[9px] text-slate-500 font-mono mb-0.5 uppercase">If Wrong</div>
                        <div className="text-sm font-mono text-slate-400">Lose collateral</div>
                    </div>
                </div>

                {/* Expiry Info */}
                <div className="flex items-center justify-center gap-2 mb-4 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-mono">
                        {durations.find(d => d.id === selectedDuration)?.time}-HOUR ON-CHAIN EXPIRY
                    </span>
                </div>

                {/* Launch Button with Authentication Logic */}
                {!isAuthenticated ? (
                    <button
                        type="button"
                        disabled={true}
                        className="w-full py-4 bg-slate-800 text-slate-500 font-pixel text-sm uppercase tracking-widest border-b-4 border-slate-900 cursor-not-allowed"
                    >
                        {isAuthLoading ? "SYNCHRONIZING..." : "ACCESS DENIED :: GUEST MODE"}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowBuyModal(true)}
                        disabled={!selectedTarget || !bestOrder || isOrdersLoading}
                        className={`w-full py-4 font-pixel text-sm uppercase tracking-widest transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                            ${!selectedTarget || !bestOrder || isOrdersLoading
                                ? 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'
                                : selectedTarget === 'MOON'
                                    ? 'bg-bit-green text-black border-green-800 hover:bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]'
                                    : 'bg-bit-coral text-white border-red-900 hover:bg-red-400 shadow-[0_0_15px_rgba(232,90,90,0.4)]'
                            }`}
                    >
                        {isOrdersLoading
                            ? 'SYNCHRONIZING...'
                            : !selectedTarget
                                ? 'SELECT TARGET'
                                : !bestOrder
                                    ? 'NO MISSION AVAILABLE'
                                    : 'INITIATE SEQUENCE'}
                    </button>
                )}

            {/* Buy Modal */}
            <BuyModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                order={bestOrder}
                target={selectedTarget}
                initialCollateral={collateral}
            />
            
            {/* Order Matrix Modal */}
            <OrderMatrix
                isOpen={showOrderMatrix}
                onClose={() => setShowOrderMatrix(false)}
                orders={orderData?.parsedOrders || []}
                currentAsset={selectedAsset}
                currentTarget={selectedTarget}
                onSelect={(order) => {
                    setManualOrder(order);
                    setShowOrderMatrix(false);
                }}
            />
            </div>

            {/* Error Message */}
            {isError && (
                <div className="px-6 pb-4">
                    <div className="p-2 bg-red-900/30 border border-red-500 text-[10px] font-mono text-red-400 text-center animate-pulse uppercase">
                        Communication Error: Failed to fetch tactical data
                    </div>
                </div>
            )}

            {/* Decorative Footer */}
            <div className="bg-slate-800 p-2 flex justify-between border-t-4 border-slate-700">
                <div className="flex gap-1">
                    <div className="w-16 h-2 bg-slate-700 animate-pulse"></div>
                    <div className="w-8 h-2 bg-slate-600"></div>
                </div>
                <div className="text-[8px] font-mono text-slate-500 uppercase">
                    {isConnected ? 'BASE_MAINNET::CONNECTED' : 'SEARCHING_NETWORK...'}
                </div>
            </div>
        </div>
    );
};
