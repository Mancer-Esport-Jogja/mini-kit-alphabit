"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronLeft, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import sdk from "@farcaster/miniapp-sdk";

import { useThetanutsOrders } from '@/hooks/useThetanutsOrders';
import { useUserPositions } from '@/hooks/useUserPositions';
import { useFillOrder, calculateMaxSpend } from '@/hooks/useFillOrder';
import { useAccount } from 'wagmi';
import { filterOrdersByDuration, filterHuntOrders, parseOrder } from '@/services/thetanutsApi';
import { useAuth } from '@/context/AuthContext';
import { useGamification } from '@/context/GamificationContext';
import type { ParsedOrder } from '@/types/orders';
import { useOraclePrice } from '@/hooks/useOraclePrice';

import { ArcadeButton } from './arcade/ArcadeButton';
import { StoryScroll } from './arcade/StoryScroll';
import { PlanetCard } from './arcade/PlanetCard';
import { ArcadeBattleArena } from './arcade/ArcadeBattleArena';
import { TacticalDroid } from './TacticalDroid';
import { useDroid } from '@/context/DroidContext';
import { TargetingSystem } from './arcade/TargetingSystem';
import { TacticalHUD } from './arcade/TacticalHUD';
import { PREDICTION_API } from '@/config/api';

// --- GLOBAL PREDICTION TYPES ---
interface GlobalPrediction {
    id: string;
    asset: 'ETH' | 'BTC';
    direction: 'MOON' | 'DOOM';
    duration: string;
    confidence: number;
    reasoning: string;
    expiryTime: string;
    recommendedStrike: number;
    startPrice: number;
}

interface PredictionStats {
    syncCount: number;
    overrideCount: number;
    totalVotes: number;
    consensus: number;
}

// --- GAME TYPES ---
type GameState = 'INTRO' | 'STORY' | 'MODE_SELECT' | 'PREDICT_MODE' | 'SELECT_SHIP' | 'SELECT_PLANET' | 'SELECT_WEAPON' | 'ARM_WEAPON' | 'LAUNCH' | 'RESULT';
type ShipType = 'FIGHTER' | 'BOMBER'; // ETH vs BTC
type WeaponType = 'LASER' | 'MISSILE'; // Call vs Put

const PLANETS = [
    { type: 'MAGMA', name: 'BLITZ', timeframe: '2H-9H', minHours: 2, maxHours: 9 },
    { type: 'GAS', name: 'RUSH', timeframe: '9H-18H', minHours: 9, maxHours: 18 },
    { type: 'ICE', name: 'CORE', timeframe: '18H-36H', minHours: 18, maxHours: 36 },
    { type: 'TERRA', name: 'ORBIT', timeframe: '>36H', minHours: 36, maxHours: 9999 },
] as const;

type AvailablePlanet = (typeof PLANETS)[number] & {
    index: number;
    count: number;
    isAvailable: boolean;
};

// Simple Toast Component for Arcade
const SystemMessage = ({ message, onClear }: { message: string, onClear: () => void }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={onClear}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg font-pixel text-xs shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center gap-3 backdrop-blur-md cursor-pointer hover:bg-black/80 transition-colors"
    >
        <AlertTriangle size={14} className="animate-pulse" />
        {message}
    </motion.div>
);

interface ArcadeModeProps {
    onViewAnalytics?: () => void;
}

export function ArcadeMode({ onViewAnalytics }: ArcadeModeProps) {
    const { address } = useAccount();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const { completeMission, addXp } = useGamification();
    useDroid(); // Connect to Droid context for TacticalDroid component

    const [gameState, setGameState] = useState<GameState>('INTRO');
    const [systemMessage, setSystemMessage] = useState<string | null>(null);
    
    // Selection State
    const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
    const [selectedPlanetIndex, setSelectedPlanetIndex] = useState<number | null>(null); 
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponType | null>(null);

    const [inputAmount, setInputAmount] = useState<string>('50');

    // Prediction Mode State
    const [predictionAsset, setPredictionAsset] = useState<'ETH' | 'BTC' | null>(null);
    const [activePrediction, setActivePrediction] = useState<GlobalPrediction | null>(null);
    const [predictionStats, setPredictionStats] = useState<PredictionStats | null>(null);
    const [userVote, setUserVote] = useState<'SYNC' | 'OVERRIDE' | null>(null);
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
    
    // Entry Mode Tracking (for dynamic back navigation)
    const [entryMode, setEntryMode] = useState<'PREDICT' | 'MISSION' | null>(null);
    
    // Data Hooks
    const { data: orderData, refetch: refetchOrders } = useThetanutsOrders();
    // const { data: history } = useUserTransactions(); // Deprecated for active check
    const { data: activePositions, refetch: refetchPositions } = useUserPositions(); 

    // Effect: Refetch on mount (Tab Click)
    useEffect(() => {
        refetchOrders();
        refetchPositions();
    }, [refetchOrders, refetchPositions]);

    // Effect: If active positions found, ensure we show the battle (INTRO state)
    useEffect(() => {
        if (activePositions && activePositions.length > 0) {
            setGameState('INTRO');
        }
    }, [activePositions]); 
    const { currentPrice: ethSpot } = useOraclePrice({ symbol: 'ETHUSDT', interval: '1m', limit: 20 });
    const { currentPrice: btcSpot } = useOraclePrice({ symbol: 'BTCUSDT', interval: '1m', limit: 20 });
    
    // Check for active battles (including Mocks for dev if env set)
    const hasActiveBattles = React.useMemo(() => {
        const IS_DEV_MODE = process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true';
        
        // If we have real active positions, show them
        if (activePositions && activePositions.length > 0) return true;

        // If in DEV MODE, we might show mocks (delegated to ArcadeBattleArena to decide, but we need to mount it)
        // ArcadeBattleArena logic: if IS_DEV_MODE, it returns mocks.
        // So if IS_DEV_MODE is true, we should return true here to allow it to mount.
        if (IS_DEV_MODE) return true;

        return false;
    }, [activePositions]);
    
    // Strict Safety Filter: Ensure we only show orders where User can BUY (isLong: false)
    // This mirrors the logic in HuntTerminal
    const orders = React.useMemo(() => {
        if (!orderData?.orders) return [];
        const safeRawOrders = filterHuntOrders(orderData.orders);
        return safeRawOrders.map(parseOrder);
    }, [orderData?.orders]);
    const { executeFillOrder, isPending, isConfirming, isSuccess, error: txError, hash, reset: resetTx, usdcBalance } = useFillOrder();
    
    // Format USDC balance for display (6 decimals)
    const formattedCredits = usdcBalance 
        ? (Number(usdcBalance) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : '...';
    
    // Result State
    const [lastSuccessOrder, setLastSuccessOrder] = useState<ParsedOrder | null>(null);

    // Reset selections whenever player returns to ship selection
    useEffect(() => {
        if (gameState === 'SELECT_SHIP') {
            setSelectedShip(null);
            setSelectedPlanetIndex(null);
            setSelectedWeapon(null);
        }
        if (gameState === 'MODE_SELECT') {
             // Reset prediction state if going back to mode select
             setPredictionAsset(null);
             setActivePrediction(null);
             setPredictionStats(null);
        }
    }, [gameState]);

    // --- DROID STATS FOR ARCADE MODE ---
    const droidStats = React.useMemo(() => {
        const callOrders = orders.filter(o => o.direction === 'CALL');
        const putOrders = orders.filter(o => o.direction === 'PUT');
        return {
            callVolume: callOrders.length,
            putVolume: putOrders.length,
            spreadSize: Math.abs(callOrders.length - putOrders.length),
        };
    }, [orders]);

    // --- HELPER LOGIC ---
    
    // Filter planets (expiries) available for selected ship
    const getAvailablePlanets = (): AvailablePlanet[] => {
        if (!selectedShip) return [];
        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const shipOrders = orders.filter(o => o.asset === asset);
        
        return PLANETS.map((p, idx): AvailablePlanet => {
            // Use real duration filtering logic
            const matchingOrders = filterOrdersByDuration(
                shipOrders.map(o => o.rawOrder), 
                p.name as 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
            );
            return { 
                ...p, 
                index: idx, 
                count: matchingOrders.length,
                isAvailable: matchingOrders.length > 0 
            };
        }); 
    };

    // Filter orders for the selected configuration
    // Simplified: pick the closest OTM strike to spot price
    const getTargetOrder = (): ParsedOrder | null => {
        if (!selectedShip || selectedPlanetIndex === null || !selectedWeapon) return null;

        const asset = selectedShip === 'FIGHTER' ? 'ETH' : 'BTC';
        const isCall = selectedWeapon === 'LASER';
        const planet = PLANETS[selectedPlanetIndex];

        const shipOrders = orders.filter(o => o.asset === asset && (o.direction === 'CALL') === isCall);

        // Filter by duration bucket (raw orders)
        const durationOrders = filterOrdersByDuration(
            shipOrders.map(o => o.rawOrder),
            planet.name as 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
        );
        if (durationOrders.length === 0) return null;

        // Map back to parsed orders
        const durationParsed = shipOrders.filter(o =>
            durationOrders.some(d => d.order.ticker === o.rawOrder.order.ticker)
        );
        if (durationParsed.length === 0) return null;

        const spot = asset === 'ETH' ? ethSpot : asset === 'BTC' ? btcSpot : null;
        // If spot is unavailable, fall back to first available order
        if (!spot) {
            return durationParsed[0];
        }

        // Filter OTM/ATM (calls: strike >= spot, puts: strike <= spot)
        const otmOnly = durationParsed.filter(o => {
            const strike = o.strikes[0];
            return isCall ? strike >= spot : strike <= spot;
        });

        // If no OTM available, fall back to all duration orders
        const candidateSet = otmOnly.length > 0 ? otmOnly : durationParsed;

        // Find the closest strike to spot price
        const best = candidateSet.reduce((closest, curr) => {
            const closestDist = Math.abs(closest.strikes[0] - spot);
            const currDist = Math.abs(curr.strikes[0] - spot);
            return currDist < closestDist ? curr : closest;
        });

        return best;
    };

    const handleLaunch = async () => {
        const order = getTargetOrder();
        if (!order) return;
        
        try {
            await executeFillOrder(order.rawOrder, inputAmount);
            
            // Success! 
            setLastSuccessOrder(order);
            setGameState('RESULT');

            // Gamification: Reward the pilot
            completeMission('first_strike');
            addXp(100); // Bonus for arcade mission
        } catch (e) {
            console.error(e);
        }
    };

    const resetGame = () => {
        setGameState('INTRO');
        setSelectedShip(null);
        setSelectedPlanetIndex(null);
        setSelectedWeapon(null);
        setPredictionAsset(null);
        setActivePrediction(null);
        setPredictionStats(null);
        setEntryMode(null);
        resetTx();
    };

    // --- PREDICTION LOGIC ---

    // --- GLOBAL AI LOGIC ---

    const checkActivePrediction = async (asset: 'ETH' | 'BTC') => {
        setIsLoadingPrediction(true);
        setUserVote(null); // Reset on new check
        try {
            // 1. Check Backend for Global Signal (filtered by asset, with userId for vote check)
            const userIdParam = user?.id ? `&userId=${user.id}` : '';
            const res = await fetch(`${PREDICTION_API.ACTIVE}?asset=${asset}${userIdParam}`);
            const data = await res.json();

            // If active prediction exists for this asset
            if (data.prediction && new Date(data.prediction.expiryTime) > new Date()) {
                setActivePrediction(data.prediction);
                setPredictionStats(data.stats);
                setUserVote(data.userVote || null);
                setIsLoadingPrediction(false);
                return;
            }

            // 2. If no active prediction (or expired), TRIGGER NEW GENERATION (Lazy Load)
            await generateGlobalPrediction(asset);

        } catch (error) {
            console.error("Link Failure:", error);
            setIsLoadingPrediction(false);
        }
    };

    const generateGlobalPrediction = async (asset: 'ETH' | 'BTC') => {
        // Trigger AI Agent (Client Side)
        try {
            const marketData = {
                spotPrice: asset === 'ETH' ? ethSpot : btcSpot,
                // Add more context if available
            };

            const aiRes = await fetch('/api/ai/predict', {
                method: 'POST',
                body: JSON.stringify({ asset, marketData })
            });
            const { prediction } = await aiRes.json();

            if (!prediction) throw new Error("AI Signal Lost");

            // --- PRE-PROCESS & VALIDATE STRIKE ---
            // 1. Map Prediction to Orders
            // Note: prediction.duration is likely mapped to a PLANET (e.g. 'BLITZ')
            // but for safety we can rely on order filtering logic.
            // Let's first map Duration -> Planet to get time bounds? 
            // Better: Just filter all orders for this Asset + Direction
            const isCall = prediction.direction === 'MOON';
            const assetOrders = orders.filter(o => o.asset === asset && (o.direction === 'CALL') === isCall);

            // Filter for the right duration bucket if possible, otherwise just closest overall for now?
            // Let's assume prediction.duration is 'BLITZ' etc.
            const validOrders = filterOrdersByDuration(
                assetOrders.map(o => o.rawOrder),
                prediction.duration as 'BLITZ' | 'RUSH' | 'CORE' | 'ORBIT'
            );

            // Map back to parsed
            const candidateOrders = assetOrders.filter(o => 
                validOrders.some(v => v.order.ticker === o.rawOrder.order.ticker)
            );

            // 2. Find closest strike to AI's rough idea (or Spot if AI just says direction)
            // If AI provides a specific number in 'recommendedStrike', use that. 
            // If it's 0 or missing, use OTM logic based on Spot.
            const targetStrike = prediction.recommendedStrike || marketData.spotPrice;
            
            // Fallback: If no orders found for that duration, try ALL durations? No, stick to duration.
            if (candidateOrders.length === 0) {
                 throw new Error("No orders available for predicted strategy");
            }

            // Find closest available strike in the candidate set
            const bestOrder = candidateOrders.reduce((prev, curr) => {
                const prevDist = Math.abs(prev.strikes[0] - targetStrike);
                const currDist = Math.abs(curr.strikes[0] - targetStrike);
                return currDist < prevDist ? curr : prev;
            });

            // THIS is the real executable strike we want everyone to use
            const realExecutionStrike = bestOrder.strikes[0];

            // Save to Global Backend
            const saveRes = await fetch(PREDICTION_API.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset,
                    direction: prediction.direction,
                    duration: prediction.duration,
                    recommendedStrike: realExecutionStrike, // MUST BE REAL
                    confidence: prediction.confidence,
                    reasoning: prediction.reasoning,
                    expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // Default 2h Blitz
                    startPrice: marketData.spotPrice
                })
            });
            
            const responseData = await saveRes.json();
            // Handle both new prediction and existing prediction response
            const predictionToUse = responseData.prediction || responseData;
            setActivePrediction(predictionToUse);
            setPredictionStats({ syncCount: 0, overrideCount: 0, totalVotes: 0, consensus: 0 });

        } catch (error) {
            console.error("Generation Failed:", error);
        } finally {
            setIsLoadingPrediction(false);
        }
    };

    const enterWarZone = (asset: 'ETH' | 'BTC') => {
        setPredictionAsset(asset);
        checkActivePrediction(asset);
    };

    const handlePredictionSelect = async (choice: 'YES' | 'NO') => {
        if (!activePrediction || !predictionAsset) return;

        // Record Vote in Backend
        try {
            // Use authenticated user's ID from backend
            if (!user?.id) {
                console.warn("User not authenticated, skipping vote");
            } else {
                await fetch(PREDICTION_API.VOTE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        predictionId: activePrediction.id,
                        vote: choice === 'YES' ? 'SYNC' : 'OVERRIDE',
                        userId: user.id
                    })
                });
            }
        } catch (e) {
            console.warn("Vote link unstable", e);
        }

        // 1. Map Asset -> Ship
        const ship: ShipType = predictionAsset === 'ETH' ? 'FIGHTER' : 'BOMBER';
        setSelectedShip(ship);

        // 2. Map Duration -> Planet
        // Find matching planet index
        const planetIdx = PLANETS.findIndex(p => p.name === activePrediction.duration);
        if (planetIdx !== -1) {
            setSelectedPlanetIndex(planetIdx);
        } else {
            // Fallback if AI hallucinates a duration
            setSelectedPlanetIndex(2); // Core
        }

        // 3. Map YES/NO + Prediction -> Weapon (Call/Put)
        const isMoon = activePrediction.direction === 'MOON';
        const isYes = choice === 'YES';
        
        let weapon: WeaponType;
        if (isYes) {
            weapon = isMoon ? 'LASER' : 'MISSILE';
        } else {
            // LOGIC: DISAGREE (Smart Opposite)
            // If AI says MOON (Call), we want DOOM (Put).
            // But we need to find the correct Planet/Duration and Strike that matches the "inverse" logic.
            weapon = isMoon ? 'MISSILE' : 'LASER';
        }
        setSelectedWeapon(weapon);

        // For "DISAGREE", we rely on the normal "getTargetOrder" logic (closest OTM).
        // Since we switched the Weapon (Call<>Put), the getTargetOrder loop will now look for 
        // the closest OTM Put (if AI was Call) or Call (if AI was Put).
        // This effectively implements the "closest equivalent opposite bet".

        setEntryMode('PREDICT');
        setEntryMode('PREDICT');
        setGameState('ARM_WEAPON');
    };

    // --- RENDER CONTENT ---
    
    // INTRO SCREEN
    const renderIntro = () => (
        <div className="min-h-[600px] md:h-full flex flex-col items-center justify-center space-y-8 p-8 pt-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-20 animate-[pulse_4s_infinite]"></div>
            
            {/* Decorative HUD Lines */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            <div className="text-center space-y-2 z-10">
                <motion.h1 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black font-pixel text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-orange-600 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                    ALPHA WAR
                </motion.h1>
                <p className="text-[10px] font-mono text-emerald-400 tracking-[0.3em] animate-pulse">
                    ACCESS TERMINAL :: INSERT COIN
                </p>
            </div>

            {/* Fleet Preview Area OR Active Battle Arena */}
            <div className="relative w-full flex items-center justify-center z-10 min-h-[12rem]">
                {hasActiveBattles ? (
                    <div className="w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                        <ArcadeBattleArena />
                    </div>
                ) : (
                    /* Static Ships Formation */
                    <div className="flex items-center gap-8">
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative w-24 h-24 animate-bounce"
                        >
                            <Image src="/assets/fighter-moon.svg" alt="Fighter" fill className="object-contain drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-pixel text-emerald-400 opacity-60">FIGHTER</div>
                        </motion.div>

                        <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="relative w-24 h-24 animate-bounce [animation-delay:0.5s]"
                        >
                            <Image src="/assets/bomber-doom.svg" alt="Bomber" fill className="object-contain drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-pixel text-orange-400 opacity-60">BOMBER</div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Button Container - Hides if there are active battles, can restore via reset or just show anyway */}
            <div className="space-y-4 w-full max-w-xs z-10">
                <ArcadeButton size="lg" onClick={() => setGameState('MODE_SELECT')} className="animate-pulse">
                    START MISSION
                </ArcadeButton>
                
                {/* Always show analytics */}
                <div className="flex justify-center">
                    <ArcadeButton
                        size="sm"
                        variant="outline"
                        onClick={onViewAnalytics}
                        disabled={!onViewAnalytics}
                        className={!onViewAnalytics ? "opacity-60 grayscale cursor-not-allowed" : ""}
                    >
                        VIEW ANALYTICS & HISTORY
                    </ArcadeButton>
                </div>
                
                <div className="flex justify-between px-2">
                    <span className="text-[8px] font-pixel text-slate-500">v2.3.0-PREDICT</span>
                    <span className="text-[8px] font-pixel text-slate-500">BETA_PILOT_ACCESS</span>
                </div>
            </div>
        </div>
    );

    // MODE SELECTION SCREEN
    const renderModeSelect = () => (
        <div className="min-h-[600px] md:h-full flex flex-col items-center justify-center space-y-12 p-8 relative overflow-hidden">
            <div className="text-center space-y-2 z-10">
                <h2 className="text-2xl font-pixel text-white">SELECT PROTOCOL</h2>
                <p className="text-[10px] font-mono text-slate-400">Choose your engagement strategy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10">
                {/* PREDICT MODE CARD */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setGameState('PREDICT_MODE')}
                    className="group relative bg-slate-900/60 border border-purple-500/30 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center gap-6 transition-all"
                >
                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors rounded-2xl" />
                    <div className="p-4 bg-purple-900/20 rounded-full border border-purple-500/30 group-hover:scale-110 transition-transform">
                        <BrainCircuit size={48} className="text-purple-400" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold font-pixel text-purple-400">PREDICT MODE</h3>
                        <p className="text-xs font-mono text-slate-400 max-w-[200px]">
                            Leverage AI analysis to predict market moves. Simple Yes/No decisions.
                        </p>
                    </div>
                </motion.button>

                {/* MISSION MODE CARD */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setEntryMode('MISSION'); setGameState('STORY'); }}
                    className="group relative bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center gap-6 transition-all"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors rounded-2xl" />
                    <div className="p-4 bg-emerald-900/20 rounded-full border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <div className="relative w-12 h-12">
                             <Image src="/assets/fighter-moon.svg" alt="Classic" fill className="object-contain" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold font-pixel text-emerald-400">MISSION MODE</h3>
                        <p className="text-xs font-mono text-slate-400 max-w-[200px]">
                            Manual control. Choose your ship, target sector, and weapon systems.
                        </p>
                    </div>
                </motion.button>
            </div>
            
            <button 
                onClick={() => setGameState('INTRO')}
                className="text-[10px] font-pixel text-slate-500 hover:text-white transition-colors z-10"
            >
                &lt; ABORT SEQUENCE
            </button>
        </div>
    );

    // PREDICT MODE SCREEN
    const renderPredictMode = () => (
        <div className="min-h-[600px] md:h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-black/40 border-b border-white/10 z-20">
                <button 
                    onClick={() => setGameState('MODE_SELECT')}
                    className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} />
                    <span className="text-[10px] font-pixel">ABORT</span>
                </button>
                <div className="flex items-center gap-2">
                    <div className="text-[10px] font-pixel text-emerald-400">CONSENSUS</div>
                    <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600 flex">
                        <motion.div 
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${predictionStats?.consensus ?? 50}%` }}
                        />
                        <motion.div 
                            className="h-full bg-rose-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - (predictionStats?.consensus ?? 50)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                        {predictionStats?.totalVotes ? `${predictionStats.consensus.toFixed(0)}%` : '--'}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                
                {/* 1. Asset Selection (Only if not selected yet) */}
                {!predictionAsset && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg space-y-8"
                    >
                         <div className="text-center space-y-2">
                            <h2 className="text-xl font-pixel text-white">SELECT WAR ZONE</h2>
                            <p className="text-[10px] font-mono text-slate-400">Establish neural link with sector surveillance</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <button
                                onClick={() => enterWarZone('ETH')}
                                className="group relative bg-slate-900/60 border border-slate-700/50 hover:border-emerald-500 hover:bg-slate-900/80 p-8 rounded-xl flex flex-col items-center gap-6 transition-all overflow-hidden"
                             >
                                <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-10" />
                                <div className="relative z-10 p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                                    <Image src="/assets/fighter-moon.svg" width={64} height={64} alt="ETH" className="drop-shadow-lg" />
                                </div>
                                <div className="relative z-10 text-center">
                                    <span className="font-pixel text-2xl text-emerald-400 tracking-widest block">ETH</span>
                                    <span className="text-[8px] font-mono text-emerald-600/80 uppercase tracking-widest">Sector Alpha</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>

                             <button
                                onClick={() => enterWarZone('BTC')}
                                className="group relative bg-slate-900/60 border border-slate-700/50 hover:border-orange-500 hover:bg-slate-900/80 p-8 rounded-xl flex flex-col items-center gap-6 transition-all overflow-hidden"
                             >
                                <div className="absolute inset-0 bg-[url('/assets/grid-bg.png')] opacity-10" />
                                <div className="relative z-10 p-4 bg-orange-500/10 rounded-full border border-orange-500/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300">
                                    <Image src="/assets/bomber-doom.svg" width={64} height={64} alt="BTC" className="drop-shadow-lg" />
                                </div>
                                <div className="relative z-10 text-center">
                                    <span className="font-pixel text-2xl text-orange-400 tracking-widest block">BTC</span>
                                    <span className="text-[8px] font-mono text-orange-600/80 uppercase tracking-widest">Sector Omega</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             </button>
                        </div>
                    </motion.div>
                )}

                {/* 2. Loading State (Targeting Computer) */}
                {isLoadingPrediction && (
                    <div className="w-full flex flex-col items-center">
                        <TargetingSystem />
                        <div className="mt-8 text-center space-y-2">
                            <div className="text-xl font-pixel text-white animate-pulse">CALCULATING ORBIT</div>
                            <div className="text-[10px] font-mono text-emerald-500/60 uppercase">
                                Intercepting market signals...
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Result HUD */}
                {!isLoadingPrediction && activePrediction && predictionAsset && (
                    <TacticalHUD 
                        asset={predictionAsset}
                        direction={activePrediction.direction}
                        confidence={activePrediction.confidence}
                        reasoning={activePrediction.reasoning}
                        stats={predictionStats}
                        recommendedStrike={activePrediction.recommendedStrike}
                        userVote={userVote}
                        expiryTime={activePrediction.expiryTime}
                        onSync={() => handlePredictionSelect('YES')}
                        onOverride={() => handlePredictionSelect('NO')}
                    />
                )}

                {/* System Messages */}
                <AnimatePresence>
                    {systemMessage && <SystemMessage message={systemMessage} onClear={() => setSystemMessage(null)} />}
                </AnimatePresence>

            </div>
            
            {/* AI TACTICAL DROID - Arcade Mode Intro Only */}
            <TacticalDroid marketStats={droidStats} />
        </div>
    );

    // MAIN GAME SCREEN (SELECTIONS -> RESULT)
    const renderGame = () => (
        <div className="min-h-[600px] md:h-full flex flex-col relative overflow-hidden">
            {/* Header / HUD */}
            <div className="flex justify-between items-center p-4 bg-black/40 border-b border-white/10 z-20">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${address ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[10px] font-pixel text-slate-400">
                        {address ? `PILOT: ${address.slice(0, 4)}...${address.slice(-4)}` : 'OFFLINE'}
                    </span>
                </div>
                <div className="text-[10px] font-pixel text-yellow-400">{`CREDITS: $${formattedCredits}`}</div>
            </div>

            <AnimatePresence mode="wait">
                
                {/* 1. SELECT SHIP */}
                {gameState === 'SELECT_SHIP' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="flex-1 p-6 flex flex-col items-center justify-center space-y-8"
                        key="ship"
                    >
                        <h2 className="text-xl font-pixel text-white text-center">CHOOSE YOUR SHIP</h2>
                        
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => { setSelectedShip('FIGHTER'); setGameState('SELECT_PLANET'); }}
                                className="group relative bg-slate-800/50 border-2 border-slate-700 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300"
                            >
                                <div className="w-20 h-20 relative">
                                    <Image src="/assets/fighter-moon.svg" alt="Fighter" fill className="object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-xl font-black font-pixel bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        FIGHTER
                                    </div>
                                    <div className="text-[10px] font-pixel text-emerald-400/80">Asset: ETH</div>
                                    <div className="text-[8px] font-mono text-slate-500 uppercase">Speed • Agile</div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => { setSelectedShip('BOMBER'); setGameState('SELECT_PLANET'); }}
                                className="group relative bg-slate-800/50 border-2 border-slate-700 hover:border-orange-500 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300"
                            >
                                <div className="w-20 h-20 relative">
                                    <Image src="/assets/bomber-doom.svg" alt="Bomber" fill className="object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="text-xl font-black font-pixel bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
                                        BOMBER
                                    </div>
                                    <div className="text-[10px] font-pixel text-orange-400/80">Asset: BTC</div>
                                    <div className="text-[8px] font-mono text-slate-500 uppercase">Heavy • Armor</div>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* 2. SELECT PLANET (EXPIRY) */}
                {gameState === 'SELECT_PLANET' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="relative flex-1 p-6 flex flex-col space-y-6"
                        key="planet"
                    >
                        <div className="absolute top-0 left-0 p-4 z-50">
                            <button 
                                onClick={() => setGameState('SELECT_SHIP')}
                                className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} />
                                <span className="text-[10px] font-pixel">ABORT</span>
                            </button>
                        </div>

                        <div className="text-center mt-8">
                            <h2 className="text-lg font-pixel text-white mb-1">TARGET SECTOR</h2>
                            <p className="text-[10px] font-mono text-slate-400">Where are the monsters hiding?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-2 overflow-visible">
                            {getAvailablePlanets().map((planet) => (
                                <PlanetCard 
                                    key={planet.name}
                                    name={planet.name}
                                    type={planet.type}
                                    timeframe={planet.timeframe}
                                    isSelected={selectedPlanetIndex === planet.index}
                                    onClick={() => {
                                        if (planet.isAvailable) {
                                            setSelectedPlanetIndex(planet.index);
                                            setSystemMessage(null);
                                        } else {
                                            setSystemMessage(`SECTOR ${planet.name} VOID: 0 TARGETS DETECTED`);
                                            setTimeout(() => setSystemMessage(null), 3000);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        
                        <AnimatePresence>
                            {systemMessage && <SystemMessage message={systemMessage} onClear={() => setSystemMessage(null)} />}
                        </AnimatePresence>

                        <div className="mt-auto">
                            <ArcadeButton 
                                size="lg" 
                                disabled={selectedPlanetIndex === null}
                                onClick={() => setGameState('SELECT_WEAPON')}
                                className={selectedPlanetIndex === null ? 'opacity-50 grayscale' : ''}
                            >
                                LOCK COORDINATES
                            </ArcadeButton>
                        </div>
                    </motion.div>
                )}

                {/* 3. SELECT WEAPON (STRATEGY) */}
                {gameState === 'SELECT_WEAPON' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="relative flex-1 p-6 flex flex-col space-y-8"
                        key="weapon"
                    >
                        <div className="absolute top-0 left-0 p-4 z-50">
                            <button 
                                onClick={() => setGameState('SELECT_PLANET')}
                                className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} />
                                <span className="text-[10px] font-pixel">ABORT</span>
                            </button>
                        </div>

                        <div className="text-center mt-8">
                            <h2 className="text-lg font-pixel text-white">SELECT WEAPON</h2>
                            <p className="text-[10px] font-mono text-slate-400">Predict the market trajectory</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => { setSelectedWeapon('LASER'); setGameState('ARM_WEAPON'); }}
                                className="w-full bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border-2 border-emerald-500/50 p-6 rounded-xl flex flex-col items-center gap-3 hover:from-emerald-900/60 hover:to-emerald-800/60 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="p-2 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-xl text-black shadow-lg relative w-16 h-16">
                                        <Image src="/assets/missile-moon.svg" alt="Moon Laser" fill className="object-contain p-1" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-2xl font-black font-pixel bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                            MOON LASER
                                        </div>
                                        <div className="text-sm font-pixel text-emerald-400/80">Strategy: CALL</div>
                                        <div className="text-[10px] font-mono text-slate-400">Long • Bullish</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => { setSelectedWeapon('MISSILE'); setGameState('ARM_WEAPON'); }}
                                className="w-full bg-gradient-to-r from-rose-900/40 to-rose-800/40 border-2 border-rose-500/50 p-6 rounded-xl flex flex-col items-center gap-3 hover:from-rose-900/60 hover:to-rose-800/60 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
                                <div className="relative z-10 flex flex-col items-center gap-2">
                                    <div className="p-2 bg-rose-500/20 border-2 border-rose-500/30 rounded-xl text-black shadow-lg relative w-16 h-16">
                                        <Image src="/assets/missile-doom.svg" alt="Doom Missile" fill className="object-contain p-1" />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-2xl font-black font-pixel bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                                            DOOM MISSILE
                                        </div>
                                        <div className="text-sm font-pixel text-rose-400/80">Strategy: PUT</div>
                                        <div className="text-[10px] font-mono text-slate-400">Long • Bearish</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 4. ARM WEAPON (AMOUNT) + LAUNCH */}
                {gameState === 'ARM_WEAPON' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="relative flex-1 p-6 flex flex-col justify-center space-y-8 text-center"
                        key="arm"
                    >
                        <div className="absolute top-0 left-0 p-4 z-50">
                            <button 
                                onClick={() => {
                                    if (entryMode === 'PREDICT') {
                                        // Reset selections and go back to Predict Mode
                                        setSelectedShip(null);
                                        setSelectedPlanetIndex(null);
                                        setSelectedWeapon(null);
                                        setActivePrediction(null);
                                        setGameState('PREDICT_MODE');
                                    } else {
                                        // Normal arcade flow - go back to weapon selection
                                        setGameState('SELECT_WEAPON');
                                    }
                                }}
                                className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={16} />
                                <span className="text-[10px] font-pixel">ABORT</span>
                            </button>
                        </div>

                        <div className="space-y-2 mt-8">
                            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
                            <h2 className="text-xl font-pixel text-white">ARMING SEQUENCE</h2>
                        </div>

                        <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded-2xl">
                            <label className="text-[10px] font-mono text-slate-400 mb-2 block uppercase">Payload Size (USDC)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    step="0.01"
                                    inputMode="decimal"
                                    value={inputAmount}
                                    onChange={(e) => setInputAmount(e.target.value)}
                                    className={`w-full bg-black border-2 border-slate-700 rounded-lg text-center text-2xl font-pixel py-4 pr-32 pl-12 focus:ring-1 focus:ring-emerald-500 transition-all no-spinner ${
                                        (() => {
                                            const order = getTargetOrder();
                                            const max = order ? calculateMaxSpend(order.rawOrder.order) : 0;
                                            return Number(inputAmount) > max ? "text-red-500 border-red-500" : "text-white";
                                        })()
                                    }`}
                                />
                                {(() => {
                                    const order = getTargetOrder();
                                    const max = order ? calculateMaxSpend(order.rawOrder.order) : 0;
                                    return (
                                        <button 
                                            onClick={() => setInputAmount(max.toFixed(2))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white px-3 py-2 rounded border border-slate-600 transition-colors z-10 backdrop-blur-sm"
                                        >
                                            MAX: ${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                        {(() => {
                            const order = getTargetOrder();
                            const max = order ? calculateMaxSpend(order.rawOrder.order) : 0;
                            return Number(inputAmount) > max && (
                                <div className="text-[10px] font-pixel text-red-500 animate-pulse">
                                    ! EXCEEDS MAX PAYLOAD CAPACITY !
                                </div>
                            );
                        })()}

                        {!isAuthenticated ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-red-900/20 border border-red-500/50 text-[10px] font-pixel text-red-400 uppercase">
                                    {isAuthLoading ? "Synchronizing Comms..." : "Pilot Auth Required"}
                                </div>
                                <p className="text-[10px] font-mono text-slate-500">Log in via Header to initiate launch sequence.</p>
                            </div>
                        ) : (() => {
                                const order = getTargetOrder();
                                const max = order ? calculateMaxSpend(order.rawOrder.order) : 0;
                                return (
                                    <ArcadeButton 
                                        size="lg" 
                                        variant="danger" 
                                        onClick={handleLaunch}
                                        disabled={Number(inputAmount) > max || Number(inputAmount) <= 0}
                                        className={`text-lg animate-pulse ${
                                            (Number(inputAmount) > max || Number(inputAmount) <= 0)
                                                ? "opacity-50 grayscale cursor-not-allowed" 
                                                : ""
                                        }`}
                                    >
                                        LAUNCH MISSION
                                    </ArcadeButton>
                                );
                        })()}
                    </motion.div>
                )}

                {/* 5. RESULT */}
                {gameState === 'RESULT' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6"
                        key="result"
                    >
                        {isPending || isConfirming ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                <div className="font-pixel text-yellow-400">
                                    {isPending ? 'TRANSMITTING...' : 'CONFIRMING ON BASE...'}
                                </div>
                                <div className="text-[10px] font-mono text-slate-500 animate-pulse uppercase">
                                    Awaiting stellar synchronization
                                </div>
                            </div>
                         ) : isSuccess ? (
                             <>
                                 <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
                                 <h2 className="text-2xl font-pixel text-white uppercase">Mission Confirmed</h2>
                                 
                                {(() => {
                                    if (!lastSuccessOrder) return null;

                                    const strikes = lastSuccessOrder.strikes;
                                    const premium = lastSuccessOrder.premium;
                                    const isSpread = lastSuccessOrder.isSpread;
                                    const isCall = lastSuccessOrder.direction === 'CALL';
                                    const strikeWidth = isSpread ? Math.abs(strikes[1] - strikes[0]) : 0;
                                    
                                    let roi = 0;
                                    if (isSpread) {
                                        const maxPayout = strikeWidth - premium;
                                        roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
                                    } else {
                                        if (!isCall) {
                                            const maxPayout = strikes[0] - premium;
                                            roi = premium > 0 ? Math.round((maxPayout / premium) * 100) : 0;
                                        }
                                    }

                                    return (
                                        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl space-y-2 w-full max-w-xs mx-auto animate-in fade-in zoom-in duration-500">
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">TARGET:</span>
                                                <span className="text-emerald-400 font-bold">${lastSuccessOrder.strikeFormatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">EXPIRY:</span>
                                                <span className="text-white">{lastSuccessOrder.expiryFormatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-mono">
                                                <span className="text-slate-400">MISSION TYPE:</span>
                                                <span className="text-emerald-400">{lastSuccessOrder.direction}</span>
                                            </div>
                                            {(roi > 0 || !isCall) && (
                                                <div className="flex justify-between items-center text-[10px] font-mono border-t border-emerald-500/20 pt-2">
                                                    <span className="text-slate-400">EST. PROFIT POTENTIAL:</span>
                                                    <span className="text-emerald-400 font-bold">
                                                        {roi === 0 && isCall ? 'UNLIMITED' : `+${roi}%`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                <p className="text-[10px] font-mono text-slate-400">Orbits synchronized. Position secured.</p>
                                
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    {hash && (
                                        <a 
                                            href={`https://basescan.org/tx/${hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30"
                                        >
                                            VIEW TRANSMISSION LOGS
                                        </a>
                                    )}

                                    {lastSuccessOrder && (
                                        <ArcadeButton 
                                            onClick={() => {
                                                const order = lastSuccessOrder;
                                                const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'https://mini-kit-alphabit.vercel.app';
                                                
                                                const shareUrl = `${ROOT_URL}/share/arcade?asset=${order.asset}&direction=${order.direction}&strike=${order.strikeFormatted}&username=${encodeURIComponent(user?.username || 'Trader')}`;
                                                const text = `Just secured a ${order.direction} mission on ${order.asset} via @alphabit! 🚀\n\nTarget: $${order.strikeFormatted}\nMode: Arcade 🕹️`;
                                                
                                                // Native Farcaster Share
                                                try {
                                                    sdk.actions.composeCast({
                                                        text: text,
                                                        embeds: [shareUrl],
                                                    });
                                                } catch {
                                                    // Fallback to Warpcast URL
                                                    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
                                                }
                                            }}
                                            variant="outline"
                                            className="text-[10px]"
                                        >
                                            SHARE MISSION
                                        </ArcadeButton>
                                    )}

                                    <ArcadeButton onClick={resetGame}>RETURN TO BASE</ArcadeButton>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto" />
                                <h2 className="text-xl font-pixel text-white">LAUNCH FAILURE</h2>
                                <p className="text-xs font-mono text-slate-400">{txError?.message || "Signal lost."}</p>
                                <ArcadeButton variant="warning" onClick={() => setGameState('ARM_WEAPON')}>RETRY</ArcadeButton>
                            </>
                        )}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
    
    // FINAL COMPOSITION WITH BATTLE ARENA
    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth">
            {/* 1. Main Game Flow */}
            <div className="flex-grow min-h-0">
                {gameState === 'INTRO' && renderIntro()}
                {gameState === 'STORY' && <StoryScroll onComplete={() => setGameState('SELECT_SHIP')} />}
                {gameState === 'MODE_SELECT' && renderModeSelect()}
                {gameState === 'PREDICT_MODE' && renderPredictMode()}
                {!['INTRO', 'STORY', 'MODE_SELECT', 'PREDICT_MODE'].includes(gameState) && renderGame()}
            </div>
        </div>
    );
}
